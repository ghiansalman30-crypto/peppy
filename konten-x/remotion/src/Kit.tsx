import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadTitan } from "@remotion/google-fonts/TitanOne";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";

const titan = loadTitan("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const nunito = loadNunito("normal", { weights: ["700", "800"], subsets: ["latin"] }).fontFamily;
const INK = "#141009";
const CREAM = "#f4e9d4";
const HAY = "#f5a300";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const art = (n: string) => staticFile(`art/${n}.svg`);

/** the whole Peppy stands inside the disc, on a soft spotlight */
const Body: React.FC<{ size: number }> = ({ size }) => (
  <>
    <div style={{ position: 'absolute', left: size * 0.16, right: size * 0.16, bottom: size * 0.11, height: size * 0.07, borderRadius: '50%', background: 'rgba(20,16,9,.22)' }} />
    <Img src={art('pond')} style={{ position: 'absolute', width: size * 0.86, height: size * 0.86, left: size * 0.07, top: size * 0.05 }} />
  </>
);
const DISC = "radial-gradient(60% 60% at 50% 42%, #ffd98f, #ffb627 55%, #e08a00)";
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: DISC, overflow: 'hidden' }}>
    <Body size={1000} />
  </AbsoluteFill>
);
export const Coin: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', overflow: 'hidden', background: DISC, boxShadow: `inset 0 0 0 16px ${INK}, inset 0 0 0 30px #ffe2a3` }}>
      <Body size={984} />
    </div>
  </AbsoluteFill>
);

// fixed star positions so every render of the banner is identical
const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => { const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1) * 1500, y: r(2) * 320, s: 1 + r(3) * 2.4, o: 0.35 + r(4) * 0.6 };
});
export const Banner: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#0a1024,#16203c 68%,#4a2e1a 68%,#2a1a0f)", overflow: "hidden" }}>
    {STARS.map((s, i) => (
      <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: "50%", background: "#fff", opacity: s.o }} />
    ))}
    <div style={{ position: "absolute", left: 560, top: 40, width: 900, height: 360, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(245,163,0,.22), rgba(245,163,0,0))" }} />
    {[["hopium", 640], ["jockey", 860], ["rich", 1080], ["robin", 1300]].map(([f, x]) => (
      <Img key={f} src={art(String(f))} style={{ position: "absolute", left: Number(x) - 150, top: 98, width: 300, height: 300 }} />
    ))}
    <div style={{ position: "absolute", left: 66, top: 40, fontFamily: titan, fontSize: 122, color: "#fff" }}>PEPPY</div>
    <div style={{ position: "absolute", left: 70, top: 188, fontFamily: nunito, fontWeight: 800, fontSize: 40, lineHeight: 1.2, color: CREAM }}>
      eleven peppys.
      <br />
      one horse.
      <br />
      zero chill.
    </div>
    <div style={{ position: "absolute", left: 430, top: 408, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ fontFamily: titan, fontSize: 26, color: INK, background: HAY, padding: "8px 18px", borderRadius: 999, border: `3px solid ${INK}` }}>peppyrh.fun</div>
      <div style={{ fontFamily: nunito, fontWeight: 800, fontSize: 22, color: CREAM, padding: "8px 16px", borderRadius: 999, border: "2px solid rgba(244,233,212,.45)" }}>$PEPPY · Robinhood Chain</div>
    </div>
  </AbsoluteFill>
);

export const Og: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#0a1024,#16203c 70%,#4a2e1a 70%)", overflow: "hidden" }}>
    <Img src={art("pond")} style={{ position: "absolute", left: 610, top: 30, width: 590, height: 590 }} />
    <div style={{ position: "absolute", left: 60, top: 120, fontFamily: titan, fontSize: 130, color: "#fff" }}>PEPPY</div>
    <div style={{ position: "absolute", left: 64, top: 280, fontFamily: nunito, fontWeight: 800, fontSize: 44, lineHeight: 1.2, color: CREAM }}>
      eleven peppys.
      <br />
      one horse. zero chill.
    </div>
    <div style={{ position: "absolute", left: 64, top: 470, fontFamily: titan, fontSize: 34, color: HAY }}>$PEPPY · Robinhood Chain</div>
  </AbsoluteFill>
);

const ROSTER = ["hopium", "jockey", "streamer", "holder", "analyst", "rich", "gym", "wagie", "grandma", "tilted", "robin"];
export const LOOP_FRAMES = 88;
/** GIF: a new Peppy wakes every eight frames, and the loop ends where it began */
export const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.floor(f / 8) % ROSTER.length;
  const hop = Math.abs(Math.sin(((f % 8) / 8) * Math.PI)) * 14;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#0a1024,#16203c 74%,#4a2e1a 74%)" }}>
      <Img src={art(ROSTER[i])} style={{ position: "absolute", left: 40, top: 46 - hop, width: 520, height: 520 }} />
      <div style={{ position: "absolute", left: 22, top: 18, fontFamily: titan, fontSize: 40, color: "#fff" }}>today's peppy</div>
      <div style={{ position: "absolute", left: 22, bottom: 20, fontFamily: nunito, fontWeight: 800, fontSize: 24, color: CREAM }}>peppyrh.fun</div>
      <div style={{ position: "absolute", right: 22, bottom: 18, fontFamily: titan, fontSize: 28, color: HAY }}>$PEPPY</div>
    </AbsoluteFill>
  );
};

const Rise: React.FC<{ at: number; size: number; color?: string; font?: string; children: React.ReactNode }> = ({ at, size, color = "#fff", font = titan, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = spring({ frame: f - at, fps, config: { damping: 200 } });
  return <div style={{ opacity: on, transform: `translateY(${(1 - on) * 30}px)`, fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.08, color }}>{children}</div>;
};
const Shot: React.FC<{ file: string; caption: string; frames: number }> = ({ file, caption, frames }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, frames], [1, 1.05], clamp);
  const fade = interpolate(f, [0, 8, frames - 7, frames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: INK, opacity: fade }}>
      <Img src={staticFile(`shots/${file}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})` }} />
      <div style={{ position: "absolute", left: 60, bottom: 50, padding: "14px 28px", background: INK, borderRadius: 16 }}>
        <Rise at={6} size={58}>
          {caption}
        </Rise>
      </div>
    </AbsoluteFill>
  );
};
const Roll: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 170], [1960, -2700], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#0a1024,#16203c 76%,#4a2e1a 76%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 90, top: 60 }}>
        <Rise at={4} size={84}>
          Eleven of him. One body.
        </Rise>
      </div>
      <div style={{ position: "absolute", left: x, top: 240, display: "flex", gap: 10 }}>
        {ROSTER.map((n) => (
          <Img key={n} src={art(n)} style={{ width: 410, height: 410 }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
const Hook: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a1024", justifyContent: "center", paddingLeft: 140, gap: 18 }}>
    <Rise at={8} size={118}>
      There was a frog.
    </Rise>
    <Rise at={50} size={118} color={HAY}>
      Then there was a horse.
    </Rise>
    <Rise at={92} size={70} color={CREAM}>
      Nobody is doing okay.
    </Rise>
  </AbsoluteFill>
);
const End: React.FC = () => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, 22], [60, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#0a1024,#16203c 74%,#4a2e1a 74%)" }}>
      <Img src={art("pond")} style={{ position: "absolute", right: 90, top: 60 + y, width: 880, height: 880 }} />
      <div style={{ position: "absolute", left: 110, top: 260, display: "grid", gap: 18 }}>
        <Rise at={8} size={170}>
          PEPPY
        </Rise>
        <Rise at={20} size={58} color={CREAM} font={nunito}>
          eleven peppys. one horse. zero chill.
        </Rise>
        <Rise at={34} size={56} color={HAY}>
          peppyrh.fun
        </Rise>
        <Rise at={44} size={38} color={CREAM} font={nunito}>
          @peppyrh · $PEPPY on Robinhood Chain
        </Rise>
      </div>
    </AbsoluteFill>
  );
};
const CUT = [150, 170, 110, 110, 110, 110, 110, 110, 150];
export const CUT_SECONDS = CUT.reduce<number[]>((a, d, i) => [...a, a[i] + d / 30], [0]);
export const DEMO_FRAMES = CUT.reduce((a, b) => a + b, 0);
export const Demo: React.FC = () => {
  const at = CUT.map((_, i) => CUT.slice(0, i).reduce((a, b) => a + b, 0));
  const shots: [string, string][] = [
    ["stall", "A new Peppy wakes every day."],
    ["tapes", "The tapes. Nobody admits anything."],
    ["pfp", "Build yours."],
    ["siegemenu", "Twelve Peppys. Six arenas."],
    ["siege", "Play Peppy Siege."],
    ["burn", "Every burn is on chain."],
  ];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Audio src={staticFile("score.wav")} />
      <Sequence durationInFrames={CUT[0]}>
        <Hook />
      </Sequence>
      <Sequence from={at[1]} durationInFrames={CUT[1]}>
        <Roll />
      </Sequence>
      {shots.map(([f, c], i) => (
        <Sequence key={f} from={at[i + 2]} durationInFrames={CUT[i + 2]}>
          <Shot file={f} caption={c} frames={CUT[i + 2]} />
        </Sequence>
      ))}
      <Sequence from={at[8]} durationInFrames={CUT[8]}>
        <End />
      </Sequence>
    </AbsoluteFill>
  );
};
