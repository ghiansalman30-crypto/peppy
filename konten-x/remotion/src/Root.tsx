import { Composition, Still } from "remotion";
import { Avatar, Banner, Coin, DEMO_FRAMES, Demo, LOOP_FRAMES, Loop, Og } from "./Kit";
import { TAPE_FRAMES, TapeA, TapeB } from "./Tapes";

export const RemotionRoot = () => (
  <>
    <Still id="Avatar" component={Avatar} width={1000} height={1000} />
    <Still id="Coin" component={Coin} width={1000} height={1000} />
    <Still id="Banner" component={Banner} width={1500} height={500} />
    <Composition id="TapeA" component={TapeA} width={640} height={480} fps={30} durationInFrames={TAPE_FRAMES} />
    <Composition id="TapeB" component={TapeB} width={640} height={480} fps={30} durationInFrames={TAPE_FRAMES} />
    <Still id="Og" component={Og} width={1200} height={630} />
    <Composition id="Loop" component={Loop} width={600} height={600} fps={20} durationInFrames={LOOP_FRAMES} />
    <Composition id="Demo" component={Demo} width={1920} height={1080} fps={30} durationInFrames={DEMO_FRAMES} />
  </>
);
