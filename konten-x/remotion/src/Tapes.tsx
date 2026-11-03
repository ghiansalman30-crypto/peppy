import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadTitan } from "@remotion/google-fonts/TitanOne";

const titan = loadTitan("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const TAPE_FRAMES = 240;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const art = (n: string) => staticFile(`art/${n}.svg`);

/** camcorder dressing: scanlines, a REC dot and a running clock */
const Vhs: React.FC<{ label: string }> = ({ label }) => {
  const f = useCurrentFrame();
  const s = Math.floor(f / 30);
  return (
    <>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 4px)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,.65)" }} />
      <div style={{ position: "absolute", left: 22, top: 18, fontFamily: titan, fontSize: 24, color: "#fff", textShadow: "2px 2px 0 #000" }}>
        <span style={{ color: "#ff3b30", opacity: f % 30 < 18 ? 1 : 0 }}>●</span> REC
      </div>
      <div style={{ position: "absolute", right: 22, top: 18, fontFamily: titan, fontSize: 20, color: "#fff", textShadow: "2px 2px 0 #000" }}>00:00:{String(s).padStart(2, "0")}</div>
      <div style={{ position: "absolute", left: 22, bottom: 16, fontFamily: titan, fontSize: 20, color: "#f6e36a", textShadow: "2px 2px 0 #000" }}>{label}</div>
    </>
  );
};

/** Exhibit A: the rail. Everyone else is already gone. */
export const TapeA: React.FC = () => {
  const f = useCurrentFrame();
  const ground = (f * 9) % 120;
  const peppyX = interpolate(f, [0, 200], [-40, 260], clamp);
  const hop = Math.abs(Math.sin(f / 4)) * 10;
  const stamp = interpolate(f, [196, 206], [2.2, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#7cc4f0,#bfe4f7 55%,#6f9f58 55%,#4f7d3f)", overflow: "hidden" }}>
      <Audio src={staticFile("clip3.wav")} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ position: "absolute", top: 270, left: i * 120 - ground, width: 12, height: 60, background: "#fff", border: "3px solid #141009" }} />
      ))}
      <div style={{ position: "absolute", top: 262, left: 0, right: 0, height: 10, background: "#fff", borderTop: "3px solid #141009", borderBottom: "3px solid #141009" }} />
      <div style={{ position: "absolute", right: 30, top: 120, fontFamily: titan, fontSize: 30, color: "#141009" }}>FINISH →</div>
      <Img src={art("jockey")} style={{ position: "absolute", left: peppyX, top: 170 - hop, width: 230, height: 230 }} />
      <div style={{ position: "absolute", left: 40, top: 60, fontFamily: titan, fontSize: 34, color: "#141009", opacity: interpolate(f, [30, 40], [0, 1], clamp) }}>the others finished at 0:41</div>
      {f > 196 && (
        <div style={{ position: "absolute", left: "50%", top: "46%", transform: `translate(-50%,-50%) rotate(-8deg) scale(${stamp})`, padding: "10px 26px", fontFamily: titan, fontSize: 76, color: "#ff3b30", border: "8px solid #ff3b30", borderRadius: 10, background: "rgba(255,255,255,.7)" }}>LAST</div>
      )}
      <Vhs label='EXHIBIT A · "the rail"' />
    </AbsoluteFill>
  );
};

/** Exhibit B: the yacht. Nobody knows whose day this was. */
export const TapeB: React.FC = () => {
  const f = useCurrentFrame();
  const rock = Math.sin(f / 12) * 4;
  const coins = Array.from({ length: 14 }, (_, i) => ({ x: (i * 53) % 620, y: ((f * (3 + (i % 4))) + i * 40) % 520 - 60 }));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffb36b,#ff7f6b 50%,#2b82b8 50%,#1c5a85)", overflow: "hidden" }}>
      <Audio src={staticFile("clip6.wav")} />
      {coins.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 26, height: 26, borderRadius: "50%", background: "#f5c542", border: "3px solid #141009" }} />
      ))}
      <div style={{ position: "absolute", left: 120, top: 220, transform: `rotate(${rock}deg)`, transformOrigin: "50% 100%" }}>
        <svg width="420" height="150" viewBox="0 0 420 150">
          <path d="M10 60H410L360 140H60Z" fill="#fbf6e6" stroke="#141009" strokeWidth="6" strokeLinejoin="round" />
          <path d="M120 60V20H300L330 60" fill="#c9d6ea" stroke="#141009" strokeWidth="6" strokeLinejoin="round" />
          <path d="M60 100H360" stroke="#2b82b8" strokeWidth="8" />
        </svg>
        <Img src={art("rich")} style={{ position: "absolute", left: 130, top: -170, width: 210, height: 210 }} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: -40 + ((f * 2 + i * 220) % 760), top: 380 + i * 30, width: 120, height: 10, borderRadius: 10, background: "rgba(255,255,255,.55)" }} />
      ))}
      <div style={{ position: "absolute", left: 40, top: 60, fontFamily: titan, fontSize: 30, color: "#141009", opacity: interpolate(f, [30, 40], [0, 1], clamp) }}>who rented this? nobody remembers.</div>
      <Vhs label='EXHIBIT B · "the yacht"' />
    </AbsoluteFill>
  );
};
