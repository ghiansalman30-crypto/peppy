/**
 * PEPPY: the public burn record. The owner sends every burn from their own wallet, so no private key lives here. The
 * server only reads the finished transaction from the chain, and counts what actually reached the dead address.
 */
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { dataDir } from "./store";
import { factory, provider } from "./token";

export const DEAD = "0x000000000000000000000000000000000000dEaD";
const TRANSFER = ethers.id("Transfer(address,address,uint256)");
const file = path.join(dataDir, "burns.json");

interface Burn {
  tx: string;
  amount: string;
  at: number;
  /** what the owner paid for this burn, in dollars; 0 for tokens they already held */
  usd?: number;
}
const state: { token: string; symbol: string; decimals: number; burns: Burn[] } = { token: "", symbol: "", decimals: 18, burns: [] };
try {
  Object.assign(state, JSON.parse(fs.readFileSync(file, "utf-8")));
} catch {}
const save = () => {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file + ".tmp", JSON.stringify(state), { mode: 0o600 });
  fs.renameSync(file + ".tmp", file);
};

export const isOwner = (wallet: string) => !!process.env.OWNER_WALLET && wallet === process.env.OWNER_WALLET.toLowerCase();

export function burnsView() {
  const total = state.burns.reduce((s, b) => s + BigInt(b.amount), 0n);
  return {
    token: state.token,
    symbol: state.symbol,
    decimals: state.decimals,
    dead: DEAD,
    total: total.toString(),
    totalText: ethers.formatUnits(total, state.decimals),
    totalUsd: state.burns.reduce((s, b) => s + (b.usd || 0), 0),
    burns: state.burns.map((b) => ({ ...b, text: ethers.formatUnits(b.amount, state.decimals) })),
  };
}

export async function setToken(address: string) {
  if (!ethers.isAddress(address)) throw new Error("That isn't a contract address.");
  const token = ethers.getAddress(address);
  if (state.burns.length && token !== state.token) throw new Error("Burns are already recorded for the current token.");
  if ((await provider.getCode(token)) === "0x") throw new Error("No contract at that address on Robinhood Chain.");
  const t = new ethers.Contract(token, ["function symbol() view returns (string)", "function decimals() view returns (uint8)"], provider);
  state.token = token;
  state.symbol = await t.symbol();
  state.decimals = Number(await t.decimals());
  save();
}

/** what this receipt moved from the token to the dead address */
export function burnedIn(logs: readonly { address: string; topics: readonly string[]; data: string }[], token: string) {
  let sum = 0n;
  for (const l of logs) {
    if (l.address.toLowerCase() !== token.toLowerCase() || l.topics[0] !== TRANSFER || l.topics.length < 3) continue;
    if (ethers.getAddress(ethers.dataSlice(l.topics[2], 12)) === ethers.getAddress(DEAD)) sum += BigInt(l.data);
  }
  return sum;
}

/** "pending" until the tx is mined; a tx is only recorded after the chain confirms it, and only once */
export async function recordBurn(tx: string, owner: string, usd = 0) {
  if (!state.token) throw new Error("Set the token first.");
  if (!/^0x[0-9a-fA-F]{64}$/.test(tx)) throw new Error("That isn't a transaction hash.");
  if (state.burns.some((b) => b.tx.toLowerCase() === tx.toLowerCase())) throw new Error("That burn is already recorded.");
  const r = await provider.getTransactionReceipt(tx);
  if (!r) return "pending" as const;
  if (r.status !== 1) throw new Error("That transaction failed on chain.");
  if (r.from.toLowerCase() !== owner) throw new Error("That transaction didn't come from the owner wallet.");
  const amount = burnedIn(r.logs, state.token);
  if (amount === 0n) throw new Error(`No ${state.symbol} reached the dead address in that transaction.`);
  const block = await provider.getBlock(r.blockNumber);
  state.burns.unshift({ tx, amount: amount.toString(), at: (block?.timestamp || Math.floor(Date.now() / 1000)) * 1000, usd: Math.min(100_000, Math.max(0, usd)) });
  save();
  return "recorded" as const;
}

const NATIVE = "0x0000000000000000000000000000000000000000";
const CHAIN_ID = 4663;
const CURVE_ABI = ["function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)", "function graduated() view returns (bool)", "function isNativeQuote() view returns (bool)"];
const SLIPPAGE = 95n;

/** before graduation a Pons token only trades on its curve */
async function liveCurve(token: string) {
  const launch = await factory.getLaunchedToken(token).catch(() => null);
  if (!launch?.exists) return null;
  const curve = new ethers.Contract(launch.curve, CURVE_ABI, provider);
  const [done, native] = await Promise.all([curve.graduated().catch(() => true), curve.isNativeQuote().catch(() => false)]);
  return !done && native ? curve : null;
}

/** priced in dollars, paid in ETH, and the tokens are bought straight to the dead address in one transaction */
export async function burnQuote(dollars: number, address: string) {
  if (!state.token) throw new Error("Set the token first.");
  if (!(dollars >= 1 && dollars <= 100_000)) throw new Error("Burn between $1 and $100,000.");
  if (!ethers.isAddress(address)) throw new Error("Connect your wallet first.");
  const priced = (await (await fetch(`https://li.quest/v1/token?${new URLSearchParams({ chain: String(CHAIN_ID), token: NATIVE })}`, { signal: AbortSignal.timeout(15_000) })).json()) as { priceUSD?: string };
  const ethUsd = Number(priced.priceUSD);
  if (!(ethUsd > 0)) throw new Error("Couldn't read the ETH price. Try again.");
  const wei = ethers.parseEther((dollars / ethUsd).toFixed(18));
  const curve = await liveCurve(state.token);
  if (curve) {
    const out: bigint = await curve.getFunction("buy").staticCall(wei, 0n, DEAD, { value: wei, from: address }).catch(() => -1n);
    if (out <= 0n) throw new Error("Couldn't price the curve. Check that the wallet holds enough ETH.");
    const least = (out * SLIPPAGE) / 100n;
    return { ethUsd, wei: wei.toString(), route: "Pons curve", tokens: ethers.formatUnits(out, state.decimals), symbol: state.symbol, tx: { to: await curve.getAddress(), data: curve.interface.encodeFunctionData("buy", [wei, least, DEAD]), value: ethers.toQuantity(wei) } };
  }
  const u = new URLSearchParams({ fromChain: String(CHAIN_ID), toChain: String(CHAIN_ID), fromToken: NATIVE, toToken: state.token, fromAmount: wei.toString(), fromAddress: address, toAddress: DEAD, slippage: "0.05" });
  const r = await fetch(`https://li.quest/v1/quote?${u}`, { signal: AbortSignal.timeout(20_000) });
  const j = (await r.json()) as { message?: string; tool?: string; estimate?: { toAmount?: string }; transactionRequest?: { to: string; data: string; value: string } };
  if (!r.ok || !j.transactionRequest || !j.estimate?.toAmount) throw new Error(String(j.message || "No route for this burn right now.").slice(0, 200));
  return { ethUsd, wei: wei.toString(), route: j.tool || "DEX", tokens: ethers.formatUnits(j.estimate.toAmount, state.decimals), symbol: state.symbol, tx: { to: j.transactionRequest.to, data: j.transactionRequest.data, value: j.transactionRequest.value } };
}
