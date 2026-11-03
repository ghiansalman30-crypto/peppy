/** PEPPY's read-only link to Robinhood Chain and the Pons factory. */
import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const FACTORY = "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e";
const rpc = new ethers.FetchRequest(RPC_URL);
rpc.retryFunc = async () => false;
rpc.timeout = 12_000;
export const provider = new ethers.JsonRpcProvider(rpc, 4663, { staticNetwork: true });
export const factory = new ethers.Contract(FACTORY, ["function getLaunchedToken(address token) view returns (tuple(address token, address curve, address deployer, address creatorFeeRecipient, address pairToken, uint256 graduationThreshold, uint256 initialLiquidity, uint24 poolFee, int24 tickSpacing, uint16 creatorTaxBps, bool buybackEnabled, uint8 phase, uint256 sweptQuote, uint256 sweptTokens, bool exists))"], provider);
