/** PEPPY's small API on :5451: the public burn record, wallet sign-in, and the owner's burn tools. No private key lives here. */
import "./pin";
import crypto from "crypto";
import fs from "fs";
import http from "http";
import { ethers } from "ethers";
import { burnQuote, burnsView, isOwner, recordBurn, setToken } from "./burns";
import { dataDir } from "./store";

const PORT = Number(process.env.PORT || 5451);
const SESSION_MS = 24 * 3_600_000;
const nonces = new Map<string, { until: number; site: string }>();
const hits = new Map<string, number[]>();

function secret() {
  const f = `${dataDir}/session.key`;
  try {
    return fs.readFileSync(f, "utf-8");
  } catch {
    const k = crypto.randomBytes(32).toString("hex");
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(f, k, { mode: 0o600 });
    return k;
  }
}
const SECRET = secret();
const mac = (w: string, exp: string) => crypto.createHmac("sha256", SECRET).update(`${w}.${exp}`).digest("hex");
const walletOf = (req: http.IncomingMessage) => {
  const [w, exp, m] = String(req.headers["x-session"] || "").split(".");
  if (!w || !exp || !m || Number(exp) < Date.now()) return null;
  const want = mac(w, exp);
  return m.length === want.length && crypto.timingSafeEqual(Buffer.from(m), Buffer.from(want)) ? w : null;
};
const messageOf = (nonce: string, site: string) => `Sign in to PEPPY at ${site}.\n\nThis is free and sends no transaction.\n\nNonce: ${nonce}`;
const json = (res: http.ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
};
const readBody = (req: http.IncomingMessage) =>
  new Promise<Record<string, unknown>>((resolve) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 4_000) {
        resolve({});
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw) || {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
function allowed(key: string, max: number) {
  const list = (hits.get(key) || []).filter((t) => Date.now() - t < 60_000);
  if (list.length >= max) return false;
  list.push(Date.now());
  hits.set(key, list);
  return true;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://x");
    const p = url.pathname;
    const ip = String(req.headers["x-real-ip"] || req.socket.remoteAddress || "");
    try {
      if (req.method === "GET" && p === "/api/burns") return json(res, 200, burnsView());
      if (req.method === "GET" && p === "/api/nonce") {
        if (!allowed(`n:${ip}`, 20)) return json(res, 429, { error: "Too many tries. Wait a minute." });
        const nonce = crypto.randomBytes(16).toString("hex");
        const site = String(req.headers.host || "peppyrh.fun").slice(0, 100);
        nonces.set(nonce, { until: Date.now() + 300_000, site });
        if (nonces.size > 5_000) nonces.delete(nonces.keys().next().value!);
        return json(res, 200, { nonce, message: messageOf(nonce, site) });
      }
      if (req.method === "POST" && p === "/api/login") {
        const b = await readBody(req);
        const nonce = String(b.nonce || "");
        const issued = nonces.get(nonce);
        nonces.delete(nonce);
        if (!issued || issued.until < Date.now()) return json(res, 400, { error: "That sign-in expired. Try again." });
        let wallet = "";
        try {
          wallet = ethers.verifyMessage(messageOf(nonce, issued.site), String(b.signature || "")).toLowerCase();
        } catch {
          return json(res, 400, { error: "That signature isn't valid." });
        }
        const exp = String(Date.now() + SESSION_MS);
        return json(res, 200, { session: `${wallet}.${exp}.${mac(wallet, exp)}`, wallet });
      }
      if (!p.startsWith("/api/owner/")) return json(res, 404, { error: "Not found." });
      const wallet = walletOf(req);
      if (!wallet) return json(res, 401, { error: "Sign in first." });
      if (!isOwner(wallet)) return json(res, 403, { error: "Owner only." });
      if (req.method === "GET" && p === "/api/owner/stats") return json(res, 200, { wallet });
      if (req.method === "GET" && p === "/api/owner/quote") {
        if (!allowed(`q:${wallet}`, 20)) return json(res, 429, { error: "Too many quotes. Wait a minute." });
        return json(res, 200, await burnQuote(Number(url.searchParams.get("usd")), String(url.searchParams.get("address") || "")));
      }
      if (req.method !== "POST") return json(res, 404, { error: "Not found." });
      const b = await readBody(req);
      if (p === "/api/owner/token") {
        await setToken(String(b.token || ""));
        return json(res, 200, burnsView());
      }
      if (p === "/api/owner/burn") {
        const status = await recordBurn(String(b.tx || ""), wallet, Number(b.usd) || 0);
        return json(res, status === "pending" ? 202 : 200, { status });
      }
      json(res, 404, { error: "Not found." });
    } catch (e) {
      if (!res.headersSent) json(res, 400, { error: (e as Error).message.slice(0, 200) });
    }
  })
  .listen(PORT, "127.0.0.1", () => console.log(`[peppy] api on :${PORT}`));
