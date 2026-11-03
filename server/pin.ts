/**
 * Dev only: RPC_PIN_IP=<ip> answers the RPC's hostname with that IP instead of asking the system resolver. Some ISPs
 * rewrite DNS for rpc.mainnet.chain.robinhood.com (a filter page with someone else's certificate); TLS still checks
 * the real certificate, so pinning the real IP is safe. Imported first by agent.ts; does nothing when unset.
 */
import dns from "dns";
import { RPC_URL } from "./chain";

const ip = process.env.RPC_PIN_IP;
if (ip) {
  const host = new URL(RPC_URL).hostname;
  const original = dns.lookup;
  (dns as unknown as { lookup: unknown }).lookup = (hostname: string, options: unknown, callback?: unknown) => {
    const cb = (typeof options === "function" ? options : callback) as (...a: unknown[]) => void;
    const opts = (typeof options === "object" && options) || {};
    if (hostname !== host) return (original as (...a: unknown[]) => void)(hostname, options, callback);
    if ((opts as { all?: boolean }).all) return cb(null, [{ address: ip, family: 4 }]);
    return cb(null, ip, 4);
  };
  console.log(`[pin] ${host} → ${ip}`);
}
