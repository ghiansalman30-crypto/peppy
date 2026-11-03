/** REDVISOR demo score, synthesized (no samples, nothing licensed): writes public/score.wav. Pass the length in seconds and cut times as args. */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LEN = +(process.argv[2] || 44);
const CUTS = (process.argv[3] || "0").split(",").map(Number);
const OUT = process.argv[4] || "score.wav";
const SR = 44100;
const N = Math.floor(SR * LEN);
const L = new Float32Array(N);
const R = new Float32Array(N);
const hz = (n) => 440 * 2 ** ((n - 69) / 12);
let seed = 11 + (Number(/d+/.exec(process.argv[4] || "")?.[0]) || 0) * 97;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (i, l, r = l) => {
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
};
const hit = (at, vel = 1) => {
  for (let j = 0; j < 1.6 * SR; j++) {
    const t = j / SR;
    add(Math.floor(at * SR) + j, Math.sin(2 * Math.PI * (38 + 70 * Math.exp(-t * 16)) * t) * Math.exp(-t * 3) * 0.55 * vel);
  }
};
const ping = (at, f, vel = 1, pan = 0) => {
  for (let j = 0; j < 1.5 * SR; j++) {
    const t = j / SR;
    const s = (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 7)) * Math.exp(-t * 3.4) * Math.min(1, t / 0.002) * 0.09 * vel;
    add(Math.floor(at * SR) + j, s * (1 - pan * 0.5), s * (1 + pan * 0.5));
  }
};
// the dark drone: a detuned low fifth with slow movement
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const env = Math.min(1, t / 1.5) * Math.min(1, (LEN - t) / 2.5);
  const slow = 0.7 + 0.3 * Math.sin(t * 0.7);
  add(i, (Math.sin(2 * Math.PI * 41.2 * t) * 0.16 + Math.sin(2 * Math.PI * 61.9 * t) * 0.07) * env * slow, (Math.sin(2 * Math.PI * 41.45 * t) * 0.16 + Math.sin(2 * Math.PI * 61.7 * t) * 0.07) * env * slow);
}
// a filtered minor pad: Em · C · Am · B
const CHORDS = [
  [52, 59, 64, 67],
  [48, 55, 60, 64],
  [45, 52, 60, 64],
  [47, 54, 59, 63],
];
const lp = [0, 0];
const START = CUTS[1] ?? 4;
for (let i = Math.floor(START * SR); i < N; i++) {
  const t = i / SR;
  const chord = CHORDS[Math.floor((t - START) / 4.8) % 4];
  const env = Math.min(1, (t - START) / 2) * Math.min(1, (LEN - t) / 2.5);
  const s = [0, 0];
  for (const n of chord) [-0.07, 0.07].forEach((d, k) => (s[k] += (((t * hz(n + d)) % 1) * 2 - 1) * 0.04));
  const cut = 0.02 + 0.05 * Math.min(1, (t - START) / 30);
  lp[0] += (s[0] - lp[0]) * cut;
  lp[1] += (s[1] - lp[1]) * cut;
  add(i, lp[0] * env, lp[1] * env);
}
// the pulse under the product, 96 bpm
const beat = 60 / 96;
for (let t0 = START; t0 < LEN - 4; t0 += beat) {
  const vel = 0.4 + 0.6 * Math.min(1, (t0 - START) / 28);
  hit(t0, 0.42 * vel);
  for (let j = 0; j < 0.04 * SR; j++) add(Math.floor((t0 + beat / 2) * SR) + j, rnd() * Math.exp(-(j / SR) * 130) * 0.05 * vel);
}
CUTS.slice(1).forEach((c, i) => {
  hit(c, 0.8);
  ping(c, [330, 247, 294, 220][i % 4], 1.4, i % 2 ? 0.5 : -0.5);
});
// riser, last hit, ring out
const last = CUTS[CUTS.length - 1];
for (let j = 0; j < 2.6 * SR; j++) {
  const t = j / SR;
  const k = t / 2.6;
  add(Math.floor((last - 2.6) * SR) + j, Math.sin(2 * Math.PI * (160 + 1000 * k * k) * t) * 0.05 * k + rnd() * 0.05 * k * k);
}
ping(last, 165, 3);
hit(last, 1.3);
const D = Math.floor(0.3 * SR);
for (let i = D; i < N; i++) {
  L[i] += R[i - D] * 0.26;
  R[i] += L[i - D] * 0.26;
}
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * 32767), 46 + i * 4);
}
writeFileSync(fileURLToPath(new URL(`../public/${OUT}`, import.meta.url)), buf);
console.log("wrote", OUT, (buf.length / 1e6).toFixed(1), "MB");
