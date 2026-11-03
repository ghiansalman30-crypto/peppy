/* The eleven Peppys and everything a visitor can dress one in. Coordinates match the drawing in peppy.js. */
const O = '#141009';
const P = (d, f, s = 5) => `<path d="${d}" fill="${f}" stroke="${O}" stroke-width="${s}" stroke-linejoin="round" stroke-linecap="round"/>`;

const SKINS = {
  pond: { skin: '#6f9f58', shade: '#4f7d3f' },
  lime: { skin: '#8cf000', shade: '#58b800' },
  sunset: { skin: '#e8833a', shade: '#b85c1c' },
  grape: { skin: '#8a6bd8', shade: '#5f45a8' },
  sky: { skin: '#4fb2e8', shade: '#2b82b8' },
  bubblegum: { skin: '#f08ac0', shade: '#c25a92' },
  coal: { skin: '#3a3f4c', shade: '#23262f' },
  mint: { skin: '#7be0a8', shade: '#44ad77' },
  gold: { skin: '#e9b949', shade: '#b48820' },
  ash: { skin: '#9aa3ad', shade: '#6d7681' },
};
const HATS = {
  none: '',
  cowboy: P('M520 134C600 96 720 84 810 84C900 84 1010 96 1080 134C1104 150 1088 172 1056 168C960 150 880 144 810 144C740 144 640 150 560 170C526 176 498 150 520 134Z', '#8a5a33') + P('M670 100C676 22 730 -28 780 -10C800 -4 820 -4 840 -10C892 -28 944 22 948 100C860 84 760 84 670 100Z', '#a4703f'),
  jockey: P('M640 96C660 16 740 -24 820 -18C900 -12 970 34 980 104C870 76 750 76 640 96Z', '#d6332b') + P('M980 96C1030 96 1074 112 1090 136C1050 138 1000 134 960 122Z', '#a3201b'),
  beanie: P('M640 92C664 6 744 -30 820 -26C900 -22 970 22 984 92Z', '#2b5fae') + P('M628 84C720 62 900 62 996 84L1000 124C900 102 720 102 624 124Z', '#1f4787'),
  tophat: P('M684 86L694 -70C760 -84 870 -84 930 -70L940 86Z', '#1c1c22') + P('M600 92C700 72 920 72 1030 92C1050 108 1030 124 1000 118C880 100 740 100 630 118C600 124 580 108 600 92Z', '#2a2a33') + `<path d="M690 56C770 44 860 44 934 56" stroke="#c9353a" stroke-width="16" fill="none"/>`,
  crown: P('M660 104L640 -10L730 46L810 -40L890 46L980 -10L960 104C860 84 760 84 660 104Z', '#f5c542'),
  headband: P('M618 124C720 86 900 86 1012 118L1008 150C900 118 720 118 620 158Z', '#f4e9d4') + P('M618 130C580 122 548 134 534 166C566 172 596 164 620 152Z', '#f4e9d4'),
  robin: P('M630 118C670 26 760 -20 850 -16C900 -14 950 6 990 34L1036 118C900 84 760 84 630 118Z', '#2f7d32') + P('M880 -14C930 -60 990 -84 1060 -84C1040 -40 990 4 930 20Z', '#c93a2c'),
};
const EYES = {
  none: '',
  shades: P('M690 112C740 100 830 100 866 116C862 160 812 182 760 178C716 174 690 150 690 112Z', '#0f0f13') + P('M880 116C920 100 990 104 1024 122C1016 162 972 178 928 174C896 170 880 148 880 116Z', '#0f0f13') + `<path d="M866 122L880 122" stroke="${O}" stroke-width="10"/><path d="M712 128L760 120" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>`,
  nerd: `<g fill="none" stroke="${O}" stroke-width="11"><circle cx="796" cy="140" r="56"/><circle cx="946" cy="140" r="52"/><path d="M852 134L894 134"/></g>`,
  laser: `<path d="M806 140L1240 60M946 140L1240 96" stroke="#ff3b30" stroke-width="14" stroke-linecap="round"/><path d="M806 140L1240 60M946 140L1240 96" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
};
const NECKS = {
  none: '',
  chain: `<path d="M716 410C770 500 880 500 930 408" fill="none" stroke="#f5c542" stroke-width="16" stroke-dasharray="6 16" stroke-linecap="round"/><path d="M716 410C770 500 880 500 930 408" fill="none" stroke="${O}" stroke-width="3" opacity=".4"/>`,
  tie: P('M800 408L846 408L838 452L866 590L822 640L780 590L808 452Z', '#c93a2c'),
  pearls: `<path d="M716 412C770 486 880 486 930 410" fill="none" stroke="#fbf6e6" stroke-width="20" stroke-dasharray="1 24" stroke-linecap="round"/>`,
  towel: P('M690 400C740 450 760 520 756 640L712 620C716 540 700 470 668 416ZM950 400C900 450 884 520 888 640L932 620C928 540 944 470 976 416Z', '#fbf6e6'),
  apron: P('M742 500C790 510 856 510 904 500L922 720C860 750 790 750 726 720Z', '#d6332b'),
};
const FACES = {
  none: '',
  tongue: P('M866 300C880 340 930 352 950 322C940 306 910 300 886 296Z', '#f08ac0'),
  scar: `<path d="M640 200L700 262M660 200L700 240" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`,
  cigar: P('M930 286L1060 306L1056 326L926 308Z', '#8a5a33') + `<path d="M1062 292C1080 276 1070 256 1090 240" stroke="#c9c9d4" stroke-width="6" fill="none" stroke-linecap="round"/>`,
};
const GEAR = {
  none: '',
  saddle: P('M360 590C420 560 520 556 580 596C570 660 520 700 460 700C400 700 360 650 360 590Z', '#8a3324'),
  quiver: P('M420 470L470 460L510 620L460 640Z', '#8a5a33') + P('M428 468L416 400L438 396L450 462ZM456 462L454 392L478 392L476 458Z', '#f4e9d4'),
  wings: P('M380 560C300 460 340 340 430 320C440 400 480 470 540 540Z', '#fbf6e6'),
};
const BACKS = {
  plain: { bg: '#f4e9d4', name: 'cream' },
  barn: { bg: '#8a3324', name: 'barn' },
  night: { bg: '#141a2e', name: 'night' },
  chart: { bg: '#0f2a1c', name: 'chart-up' },
  hay: { bg: '#f5c542', name: 'hay' },
  bubble: { bg: '#f08ac0', name: 'bubblegum' },
  sky: { bg: '#7cc4f0', name: 'sky' },
  rainbow: { bg: 'linear-gradient(135deg,#ff9a56,#f6e36a,#7be0a8,#7cc4f0,#c79bf0)', name: 'rainbow' },
};

const PEPPYS = [
  { id: 'hopium', n: 1, name: 'HOPIUM', believes: 'a breathwork coach at a silent retreat he cannot leave', quote: 'inhale the dip.', look: { skin: 'sky', hat: 'headband', neck: 'towel' }, note: 'Peppy opened the session by asking the room to hold its bags and breathe. Oxygen tank labeled HOPIUM stayed in the stall.' },
  { id: 'jockey', n: 2, name: 'JOCKEY', believes: 'both the horse and the man riding it', quote: 'hold on. i mean me.', look: { skin: 'sunset', hat: 'jockey' }, note: 'Peppy gave himself a pep talk, then a small slap on the rear. He thanked himself for the win. There was no race.' },
  { id: 'streamer', n: 3, name: 'STREAMER', believes: 'live to eleven thousand viewers. the count says two', quote: 'chat, are we up?', look: { skin: 'grape', hat: 'beanie', eyes: 'shades' }, note: 'Peppy asked whether the session was being recorded and whether it could be clipped. He asked what the Wi-Fi was.' },
  { id: 'holder', n: 4, name: 'BAGHOLDER', believes: 'early. since 2021', quote: 'we are so back.', look: { skin: 'pond', hat: 'cowboy' }, note: 'Peppy produced a saddlebag and would not put it down. When asked what was inside, he said long term conviction.' },
  { id: 'analyst', n: 5, name: 'ANALYST', believes: 'the only one who has read the chart', quote: 'as i said in march.', look: { skin: 'ash', eyes: 'nerd', neck: 'tie' }, note: 'Peppy drew a line through the wall, called it support, and billed the session to a client he could not name.' },
  { id: 'rich', n: 6, name: 'OLD MONEY', believes: 'the stable is his. the stable disagrees', quote: 'we do not gallop.', look: { skin: 'gold', hat: 'tophat', eyes: 'nerd', neck: 'chain' }, note: 'Peppy asked where the rest of the staff had gone. Tipped the therapist in a coin that no longer trades.' },
  { id: 'gym', n: 7, name: 'SWOLE', believes: 'one more set from the Derby', quote: 'hay is protein.', look: { skin: 'lime', neck: 'towel', hat: 'headband' }, note: 'Peppy did leg day. All four. He says the frog half is cardio and asked to be weighed twice.' },
  { id: 'wagie', n: 8, name: 'WAGIE', believes: 'shift lead by spring', quote: 'welcome to hay burger. bags?', look: { skin: 'sunset', neck: 'apron', hat: 'beanie' }, note: 'Peppy arrived in uniform and asked if the session counted as paid time. He has the Sunday shift again.' },
  { id: 'grandma', n: 9, name: 'NANA', believes: 'head of the family and every group chat', quote: 'i saw that.', look: { skin: 'bubblegum', neck: 'pearls', eyes: 'nerd' }, note: 'Peppy did not answer questions. She looked at the therapist for eleven minutes, then asked if he was eating.' },
  { id: 'tilted', n: 10, name: 'TILTED', believes: 'perfectly calm, thank you', quote: 'WHO SOLD.', look: { skin: 'sunset', eyes: 'laser' }, note: 'Peppy kicked the door, the wall and the concept of the wall. Asked afterward, he said nothing happened.' },
  { id: 'robin', n: 11, name: 'ROBIN HOOD', believes: 'nobody is sure. the whales keep waking up lighter', quote: '#11 was here.', look: { skin: 'lime', hat: 'robin' }, note: 'No session on record. The chair was warm and a coin was left under it.' },
];
