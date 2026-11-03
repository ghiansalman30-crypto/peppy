/* Peppy Siege: turn-based artillery with destructible ground, you against a CPU that aims a little worse each miss-free round. */
(() => {
  const $ = (id) => document.getElementById(id);
  const cv = $('c');
  const x = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;
  let G = 0.16;
  /* every weapon: blast radius, damage, uses per match, plus how it flies */
  const WEAPONS = {
    hay: { name: 'hay bale', r: 34, dmg: 26, n: 99, c: '#f5c542' },
    shoe: { name: 'horseshoe', r: 16, dmg: 42, n: 3, c: '#c9c9d4', fast: 1.15 },
    keg: { name: 'feed keg', r: 62, dmg: 32, n: 2, c: '#8a5a33' },
    carrot: { name: 'carrot dart', r: 12, dmg: 30, n: 4, c: '#f08a2c', fast: 1.3, light: 0.6 },
    pumpkin: { name: 'pumpkin', r: 48, dmg: 36, n: 2, c: '#e8833a', heavy: 1.5 },
    seed: { name: 'hayseed burst', r: 22, dmg: 16, n: 2, c: '#e9b949', split: 4 },
    saddle: { name: 'bouncy saddle', r: 30, dmg: 28, n: 2, c: '#8a3324', bounce: 2 },
    digger: { name: 'post digger', r: 70, dmg: 10, n: 2, c: '#9aa3ad' },
    manure: { name: 'mystery pile', r: 90, dmg: 44, n: 1, c: '#5a3a1f' },
    apple: { name: 'golden apple', r: 26, dmg: 50, n: 1, c: '#f5c542', fast: 1.1 },
    anvil: { name: 'anvil', r: 28, dmg: 55, n: 1, c: '#3a3f4c', heavy: 2.2 },
    bell: { name: 'cowbell', r: 40, dmg: 24, n: 3, c: '#c9a06a', bounce: 1 },
  };
  /* six arenas: sky, ground, grass, gravity and the shape of the land */
  const ARENAS = {
    track: { name: 'the track', sky: ['#7cc4f0', '#cfeaf8'], dirt: '#8a5a33', top: '#6f9f58', g: 0.16, shape: (i, a) => 380 + Math.sin(i * 0.008 + a) * 54 + Math.sin(i * 0.021 + a * 2) * 22 },
    barn: { name: 'the barn', sky: ['#3a1a10', '#7a3324'], dirt: '#5a3a1f', top: '#f5c542', g: 0.16, shape: (i, a) => 400 + Math.sin(i * 0.012 + a) * 40 + (Math.abs(i - 480) < 60 ? -90 : 0) },
    desert: { name: 'rodeo desert', sky: ['#ffb36b', '#ffe0a8'], dirt: '#c9894a', top: '#e8b06a', g: 0.16, shape: (i, a) => 360 + Math.sin(i * 0.006 + a) * 80 },
    swamp: { name: 'the old pond', sky: ['#2a3a2a', '#5a7a5a'], dirt: '#3f4f2a', top: '#7be0a8', g: 0.15, shape: (i, a) => 420 + Math.sin(i * 0.03 + a) * 18 + Math.sin(i * 0.009) * 40 },
    snow: { name: 'winter paddock', sky: ['#9fb6d8', '#e6eef8'], dirt: '#c9d6ea', top: '#ffffff', g: 0.16, shape: (i, a) => 370 + Math.sin(i * 0.01 + a) * 60 + Math.sin(i * 0.04) * 8 },
    moon: { name: 'the moon (somehow)', sky: ['#05060c', '#1a1f3a'], dirt: '#6d7681', top: '#c9c9d4', g: 0.07, shape: (i, a) => 390 + Math.sin(i * 0.007 + a) * 50 - (Math.abs(((i + a * 100) % 240) - 120) < 30 ? -20 : 0) },
  };
  const ROSTER = PEPPYS.concat([{ id: 'rainbow', name: 'RAINBOW', look: { skin: 'bubblegum', eyes: 'shades', hat: 'crown' } }]);
  let arena = ARENAS.track, choice = 0, frags = [];
  let ground, you, cpu, turn, wind, shot, booms, over, ammo, weapon, sprites = {};

  const load = (key, l) => {
    const s = SKINS[l.skin];
    const svg = drawPeppy({ ...s, top: (NECKS[l.neck] || '') + (HATS[l.hat] || '') + (EYES[l.eyes] || '') });
    const img = new Image();
    img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    sprites[key] = img;
  };
  function start() {
    $('menu').hidden = true;
    G = arena.g;
    const me = ROSTER[choice];
    let foe = ROSTER[Math.floor(Math.random() * ROSTER.length)];
    if (foe === me) foe = ROSTER[(choice + 4) % ROSTER.length];
    frags = [];
    load('you', me.look);
    load('cpu', foe.look);
    $('youN').textContent = me.name;
    $('cpuN').textContent = foe.name;
    const a = Math.random() * 6.28;
    ground = new Float32Array(W);
    for (let i = 0; i < W; i++) ground[i] = Math.min(H - 40, arena.shape(i, a) + Math.sin(i * 0.05) * 6);
    you = { x: 110, hp: 100 };
    cpu = { x: W - 110, hp: 100 };
    ammo = Object.fromEntries(Object.entries(WEAPONS).map(([k, w]) => [k, w.n]));
    weapon = 'hay';
    over = false;
    booms = [];
    shot = null;
    turn = 'you';
    $('again').hidden = true;
    $('fire').hidden = false;
    newWind();
    weapons();
    hud();
  }
  function newWind() {
    wind = Math.round((Math.random() - 0.5) * 12) / 100;
    $('wind').textContent = `wind ${wind > 0 ? '→' : wind < 0 ? '←' : ''} ${Math.abs(Math.round(wind * 100))}`;
  }
  function weapons() {
    $('weap').replaceChildren(
      ...Object.keys(WEAPONS).map((k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `pill${k === weapon ? ' on' : ''}`;
        b.disabled = ammo[k] < 1;
        b.textContent = k === 'hay' ? WEAPONS[k].name : `${WEAPONS[k].name} ×${ammo[k]}`;
        b.addEventListener('click', () => {
          weapon = k;
          weapons();
        });
        return b;
      }),
    );
  }
  function hud() {
    $('youHp').style.width = `${you.hp}%`;
    $('cpuHp').style.width = `${cpu.hp}%`;
    $('turn').textContent = over ? over : turn === 'you' ? 'your turn' : 'cpu is thinking';
    $('fire').disabled = turn !== 'you' || !!shot || !!over;
  }
  const yAt = (px) => ground[Math.max(0, Math.min(W - 1, Math.round(px)))];
  function fire(who, deg, power, kind) {
    const rad = (deg * Math.PI) / 180;
    const from = who === 'you' ? you : cpu;
    const v = power * 0.135;
    const w = WEAPONS[kind];
    const f = w.fast || 1;
    shot = { x: from.x, y: yAt(from.x) - 70, vx: Math.cos(rad) * v * f, vy: -Math.sin(rad) * v * f, who, kind, bounces: w.bounce || 0, split: w.split || 0 };
    hud();
  }
  function boom(px, py, kind) {
    const w = WEAPONS[kind];
    for (let i = Math.max(0, Math.round(px - w.r)); i < Math.min(W, px + w.r); i++) {
      const d = Math.sqrt(Math.max(0, w.r * w.r - (i - px) ** 2));
      if (ground[i] < py + d) ground[i] = Math.min(H - 8, Math.max(ground[i], py + d));
    }
    for (const t of [you, cpu]) {
      const dist = Math.hypot(t.x - px, yAt(t.x) - 34 - py);
      const reach = w.r + 44;
      if (dist < reach) t.hp = Math.max(0, Math.round(t.hp - w.dmg * (1 - dist / reach) * 1.5));
    }
    booms.push({ x: px, y: py, r: 6, max: w.r * 1.4 });
    if (you.hp <= 0 || cpu.hp <= 0) over = you.hp <= 0 ? 'you got ridden off the track' : 'you win. the whales weep';
  }
  function endTurn() {
    if (over) {
      hud();
      $('fire').hidden = true;
      $('again').hidden = false;
      return;
    }
    turn = turn === 'you' ? 'cpu' : 'you';
    newWind();
    hud();
    if (turn === 'cpu') setTimeout(cpuShot, 900);
  }
  /** the CPU tests shots in its head and adds a human-sized error */
  function cpuShot() {
    let best = { d: 1e9, a: 135, p: 60 };
    for (let a = 100; a <= 170; a += 5) {
      for (let p = 30; p <= 100; p += 5) {
        const land = simulate(cpu.x, yAt(cpu.x) - 70, a, p);
        const d = Math.abs(land - you.x);
        if (d < best.d) best = { d, a, p };
      }
    }
    const kinds = ['hay', 'hay', 'pumpkin', 'bell', 'carrot'];
    const kind = 'hay';
    void kinds;
    fire('cpu', best.a + (Math.random() - 0.5) * 9, best.p + (Math.random() - 0.5) * 7, kind);
  }
  function simulate(px, py, deg, power) {
    const rad = (deg * Math.PI) / 180;
    const v = power * 0.135;
    let vx = Math.cos(rad) * v;
    let vy = -Math.sin(rad) * v;
    for (let i = 0; i < 2000; i++) {
      vx += wind * 0.05;
      vy += G;
      px += vx;
      py += vy;
      if (px < 0 || px >= W) return px;
      if (py >= yAt(px)) return px;
    }
    return px;
  }
  function step() {
    if (shot) {
      for (let i = 0; i < 2 && shot; i++) {
        const w = WEAPONS[shot.kind];
        shot.vx += wind * 0.05 * (w.light ? 1 / w.light : 1);
        shot.vy += G * (w.heavy || 1) * (w.light || 1);
        shot.x += shot.vx;
        shot.y += shot.vy;
        if (shot.split && shot.vy > 0) {
          for (let k = 0; k < shot.split; k++) frags.push({ x: shot.x, y: shot.y, vx: shot.vx + (k - (shot.split - 1) / 2) * 1.4, vy: shot.vy, kind: shot.kind });
          shot.split = 0;
        }
        const hitFoe = [you, cpu].some((t) => t !== (shot.who === 'you' ? you : cpu) && Math.hypot(t.x - shot.x, yAt(t.x) - 34 - shot.y) < 30);
        if (shot.x < -40 || shot.x > W + 40) {
          shot = null;
          endTurn();
        } else if (!hitFoe && shot.y >= yAt(shot.x) && shot.bounces > 0) {
          shot.bounces -= 1;
          shot.y = yAt(shot.x) - 2;
          shot.vy = -Math.abs(shot.vy) * 0.6;
          shot.vx *= 0.8;
        } else if (hitFoe || shot.y >= yAt(shot.x)) {
          boom(shot.x, shot.y, shot.kind);
          shot = null;
          hud();
          setTimeout(endTurn, 600);
        }
      }
    }
    for (const p of frags) {
      p.vx += wind * 0.05;
      p.vy += G;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x >= W || p.y >= yAt(p.x)) { if (p.x >= 0 && p.x < W) boom(p.x, p.y, p.kind); p.dead = true; }
    }
    frags = frags.filter((p) => !p.dead);
    draw();
    requestAnimationFrame(step);
  }
  function draw() {
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, arena.sky[0]);
    g.addColorStop(1, arena.sky[1]);
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    x.fillStyle = arena.dirt;
    x.strokeStyle = '#141009';
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(0, H);
    for (let i = 0; i < W; i += 2) x.lineTo(i, ground[i]);
    x.lineTo(W, H);
    x.closePath();
    x.fill();
    x.strokeStyle = arena.top;
    x.lineWidth = 7;
    x.beginPath();
    for (let i = 0; i < W; i += 2) x.lineTo(i, ground[i]);
    x.stroke();
    const put = (key, t, flip) => {
      const y = yAt(t.x);
      const s = 96;
      x.save();
      x.translate(t.x, y - s + 10);
      if (flip) x.scale(-1, 1);
      if (sprites[key] && sprites[key].complete) x.drawImage(sprites[key], -s / 2, 0, s, s);
      x.restore();
    };
    put('you', you, false);
    put('cpu', cpu, true);
    if (turn === 'you' && !shot && !over) {
      const rad = (Number($('a').value) * Math.PI) / 180;
      const y = yAt(you.x) - 70;
      x.strokeStyle = '#f6e36a';
      x.lineWidth = 4;
      x.setLineDash([8, 8]);
      x.beginPath();
      x.moveTo(you.x, y);
      x.lineTo(you.x + Math.cos(rad) * (40 + Number($('p').value)), y - Math.sin(rad) * (40 + Number($('p').value)));
      x.stroke();
      x.setLineDash([]);
    }
    if (shot) {
      x.fillStyle = WEAPONS[shot.kind].c;
      x.strokeStyle = '#141009';
      x.lineWidth = 3;
      x.beginPath();
      x.arc(shot.x, shot.y, shot.kind === 'keg' ? 11 : 8, 0, 6.3);
      x.fill();
      x.stroke();
    }
    for (const p of frags) {
      x.fillStyle = WEAPONS[p.kind].c;
      x.beginPath();
      x.arc(p.x, p.y, 6, 0, 6.3);
      x.fill();
    }
    booms = booms.filter((b) => b.r < b.max);
    for (const b of booms) {
      b.r += 3;
      x.fillStyle = `rgba(255,${120 + (b.r % 80)},40,${1 - b.r / b.max})`;
      x.beginPath();
      x.arc(b.x, b.y, b.r, 0, 6.3);
      x.fill();
    }
  }
  const sync = () => {
    $('aV').textContent = `${$('a').value}°`;
    $('pV').textContent = $('p').value;
  };
  $('a').addEventListener('input', sync);
  $('p').addEventListener('input', sync);
  const shoot = () => {
    if (turn !== 'you' || shot || over) return;
    if (weapon !== 'hay') ammo[weapon] -= 1;
    fire('you', Number($('a').value), Number($('p').value), weapon);
    if (ammo[weapon] < 1) weapon = 'hay';
    weapons();
  };
  $('fire').addEventListener('click', shoot);
  $('again').addEventListener('click', start);
  addEventListener('keydown', (e) => {
    const a = $('a');
    const p = $('p');
    if (e.key === 'ArrowLeft') a.value = Number(a.value) + 2;
    else if (e.key === 'ArrowRight') a.value = Number(a.value) - 2;
    else if (e.key === 'ArrowUp') p.value = Number(p.value) + 2;
    else if (e.key === 'ArrowDown') p.value = Number(p.value) - 2;
    else if (e.key === ' ') {
      e.preventDefault();
      shoot();
    } else return;
    sync();
  });
  /* the menu: pick a Peppy and an arena, then play */
  $('picks').innerHTML = ROSTER.map((p, i) => { const l = p.look; const s = SKINS[l.skin]; const svg = drawPeppy({ ...s, top: (NECKS[l.neck] || '') + (HATS[l.hat] || '') + (EYES[l.eyes] || '') }); return `<button type="button" class="pick${i === choice ? ' on' : ''}" data-i="${i}">${svg}<span>${p.name}</span></button>`; }).join('');
  $('picks').addEventListener('click', (e) => { const b = e.target.closest('.pick'); if (!b) return; choice = Number(b.dataset.i); document.querySelectorAll('.pick').forEach((n) => n.classList.toggle('on', n === b)); });
  $('arenas').innerHTML = Object.entries(ARENAS).map(([k, a]) => `<button type="button" data-k="${k}" class="${a === arena ? 'on' : ''}">${a.name}</button>`).join('');
  $('arenas').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; arena = ARENAS[b.dataset.k]; document.querySelectorAll('#arenas button').forEach((n) => n.classList.toggle('on', n === b)); });
  $('bots').addEventListener('click', start);
  $('toMenu').addEventListener('click', () => ($('menu').hidden = false));
  ground = new Float32Array(W).fill(400);
  you = { x: 110, hp: 100 };
  cpu = { x: W - 110, hp: 100 };
  turn = 'menu';
  booms = [];
  ammo = {};
  weapon = 'hay';
  step();
  window.__siege = { state: () => ({ you: you.hp, cpu: cpu.hp, turn, over, shot: !!shot }), hit: (n) => { cpu.hp = n; hud(); } };
})();
