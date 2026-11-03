/* Everything that moves on the page: the daily Peppy, the roster, sessions, the PFP creator and the meme studio. */
(() => {
  const $ = (id) => document.getElementById(id);
  const SITE = 'peppyrh.fun';
  const START = Date.UTC(2026, 10, 1);
  const DAY = 86400000;
  const dayNo = Math.max(1, Math.floor((Date.now() - START) / DAY) + 1);
  const look = (l = {}) => {
    const s = SKINS[l.skin || 'pond'];
    return drawPeppy({ ...s, hair: l.skin === 'lime' ? '#f5a300' : undefined, hairD: l.skin === 'lime' ? '#c97f00' : undefined, top: (GEAR[l.gear] || '') + (NECKS[l.neck] || '') + (HATS[l.hat] || '') + (EYES[l.eyes] || '') + (FACES[l.face] || '') });
  };
  const of = (d) => PEPPYS[(d - 1) % PEPPYS.length];

  let awake = dayNo;
  function wake(d, opened) {
    awake = d;
    const p = of(d);
    $('pen').innerHTML = look(p.look);
    if (opened) {
      const s = $('pen').firstElementChild;
      s.style.animation = 'popin .6s cubic-bezier(.34,1.4,.64,1), sway 5s ease-in-out .6s infinite alternate';
    }
    if (opened) {
      $('todayName').textContent = p.name;
      $('todayLine').textContent = `believes he is ${p.believes}.`;
      document.querySelector('.barn').classList.add('awake');
      neigh();
    }
    $('send').href = `https://x.com/intent/tweet?text=${encodeURIComponent(`day ${d}. today's peppy is ${p.name}. "${p.quote}"\n\n${SITE}`)}`;
    document.querySelectorAll('.agenda button').forEach((b) => b.classList.toggle('now', Number(b.dataset.d) === d));
  }
  const agenda = $('agenda');
  for (let d = dayNo - 1; d <= dayNo + 13; d++) {
    if (d < 1) continue;
    const when = new Date(START + (d - 1) * DAY);
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.d = d;
    b.innerHTML = `${d === dayNo ? 'TODAY' : when.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}<b>${when.getUTCDate()}</b>`;
    if (d > dayNo) b.classList.add('locked');
    b.addEventListener('click', () => {
      if (d > dayNo) {
        $('todayName').textContent = '???';
        $('todayLine').textContent = 'that one is still asleep.';
        return;
      }
      wake(d, true);
    });
    agenda.append(b);
  }
  $('open').addEventListener('click', () => wake(dayNo, true));
  $('yesterday').textContent = dayNo > 1 ? `yesterday was: ${of(dayNo - 1).name.toLowerCase()}` : 'yesterday: nobody got up.';
  $('caseNo').textContent = dayNo;
  const line = `day ${dayNo}. still in last place.`;
  $('dayLine').textContent = line;
  $('endDay').textContent = line;
  wake(dayNo, false);

  const WORDS = [['gm', '#7be0a8'], ['wen', '#f5a300'], ['last call', '#ff5ad0'], ['photo finish', '#f6e36a'], ['chart go up', '#62e09a'], ['chart go down', '#ff6a5a'], ['one more race', '#c79bf0'], ['4:03am', '#7cc4f0'], ['ratio', '#f5a300'], ['group chat (3am)', '#ff5ad0'], ['she didn’t text back', '#c79bf0'], ['few understand', '#62e09a']];
  $('cloud').innerHTML = WORDS.map(([w, c], i) => `<span style="left:${(i * 37) % 80}%;top:${(i * 53) % 86}%;color:${c};animation-delay:${i * 0.3}s">${w}</span>`).join('') + `<div class="mid">${look({ skin: 'pond' })}</div>`;
  $('shedA').innerHTML = look(PEPPYS[0].look);
  $('shedB').innerHTML = look(PEPPYS[1].look);
  /* chapter three: the scroll sheds one Peppy into the next */
  const shed = $('shed');
  const shedTick = () => {
    const r = shed.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (innerHeight * 0.7)));
    shed.style.setProperty('--p', p.toFixed(3));
  };
  addEventListener('scroll', shedTick, { passive: true });
  shedTick();
  $('couchArt').innerHTML = look({ skin: 'grape', hat: 'headband' });
  /* the tapes play while on screen; each has its own sound switch */
  const tapes = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.4 });
  document.querySelectorAll('.tapev video').forEach((v) => tapes.observe(v));
  document.querySelectorAll('.tapev .snd').forEach((b) => b.addEventListener('click', () => {
    const v = b.previousElementSibling;
    v.muted = !v.muted;
    b.textContent = `SOUND: ${v.muted ? 'OFF' : 'ON'}`;
    if (!v.muted) v.play().catch(() => {});
  }));
  /* launch facts from config.js */
  const C = window.PEPPY_CONFIG || {};
  if (C.telegram) { $('tgIco').href = C.telegram; $('tgIco').hidden = false; }
  if (C.ca) {
    $('ca').textContent = C.ca;
    const add = (label, href) => { const a = document.createElement('a'); a.className = 'pill hay'; a.textContent = label; a.href = href; a.target = '_blank'; a.rel = 'noopener'; $('buyRow').append(a); };
    add('Uniswap', `https://app.uniswap.org/swap?outputCurrency=${C.ca}&chain=robinhood`);
    add('Maestro bot', `https://t.me/maestro?start=${C.ca}`);
    add('Sigma bot', `https://t.me/Sigma_buyBot?start=${C.ca}`);
    $('buyNote').textContent = 'Check the contract above before you buy. Anything else is not $PEPPY.';
  }
  $('robinArt').innerHTML = look({ skin: 'lime', hat: 'robin' });
  $('rainbowArt').innerHTML = look({ skin: 'bubblegum', eyes: 'nerd' });

  let session = 0;
  const sessions = PEPPYS;
  function showSession() {
    const p = sessions[session];
    $('note').textContent = `Session ${session + 1}: ${p.note}`;
    $('count').textContent = `session ${session + 1} / ${sessions.length}`;
    $('couchArt').innerHTML = look(p.look);
    const art = $('couchArt').firstElementChild;
    art.style.animation = 'popin .45s ease-out, breath 3.4s ease-in-out .45s infinite';
  }
  $('prev').addEventListener('click', () => {
    session = (session + sessions.length - 1) % sessions.length;
    showSession();
  });
  $('next').addEventListener('click', () => {
    session = (session + 1) % sessions.length;
    showSession();
  });
  showSession();

  $('grid').innerHTML = PEPPYS.slice(0, 10)
    .map((p) => `<article class="file"><small><span>PERSONALITY FILE</span><span>No.${p.n}</span></small><div class="art">${look(p.look)}</div><h3>${p.name}</h3><em>BELIEVES HE IS</em><p>${p.believes}</p><q>"${p.quote}"</q></article>`)
    .join('');

  /* the PFP creator */
  const pick = { skin: 'pond', hat: 'none', eyes: 'none', neck: 'none', back: 'plain', face: 'none', gear: 'none' };
  const GROUPS = [['1 · SKIN', 'skin', SKINS], ['2 · BACKGROUND', 'back', BACKS], ['HAT', 'hat', HATS], ['EYES', 'eyes', EYES], ['FACE', 'face', FACES], ['NECK', 'neck', NECKS], ['BACK', 'gear', GEAR]];
  function chips() {
    $('traits').innerHTML = GROUPS.map(([t, key, set]) => `<div><h4>${t}</h4><div class="chips">${Object.keys(set).map((k) => `<button type="button" data-k="${key}" data-v="${k}" class="${pick[key] === k ? 'on' : ''}">${k}</button>`).join('')}</div></div>`).join('');
  }
  function rarity() {
    const rare = ['gold', 'bubblegum', 'ash', 'coal'].includes(pick.skin) + (pick.gear === 'wings') + ['crown', 'tophat', 'robin'].includes(pick.hat) + (pick.eyes === 'laser') + (pick.back === 'rainbow');
    const tier = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY', 'LEGENDARY'][rare];
    return `${pick.skin} ${pick.hat === 'none' ? 'peppy' : pick.hat} (${tier})`.toUpperCase();
  }
  function renderPfp() {
    const b = BACKS[pick.back].bg;
    $('pfpFrame').style.background = b;
    $('pfpFrame').innerHTML = look(pick);
    $('rarity').textContent = rarity();
    chips();
  }
  $('traits').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    pick[b.dataset.k] = b.dataset.v;
    renderPfp();
  });
  const any = (o) => {
    const k = Object.keys(o);
    return k[Math.floor(Math.random() * k.length)];
  };
  $('wake').addEventListener('click', () => {
    pick.skin = any(SKINS);
    pick.back = any(BACKS);
    pick.hat = any(HATS);
    pick.eyes = any(EYES);
    pick.neck = any(NECKS);
    pick.face = any(FACES);
    pick.gear = any(GEAR);
    renderPfp();
    neigh();
  });
  /** draws the SVG to a canvas so the visitor gets a plain PNG */
  async function toPng(svg, size, paint, after) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    paint(x);
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = new Image();
    await new Promise((ok, no) => {
      img.onload = ok;
      img.onerror = no;
      img.src = url;
    });
    x.drawImage(img, size * 0.04, size * 0.04, size * 0.92, size * 0.92);
    URL.revokeObjectURL(url);
    after(x);
    return c.toDataURL('image/png');
  }
  const save = (href, name) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    a.click();
  };
  const fillBack = (x, size, bg) => {
    if (bg.startsWith('linear')) {
      const g = x.createLinearGradient(0, 0, size, size);
      ['#ff9a56', '#f6e36a', '#7be0a8', '#7cc4f0', '#c79bf0'].forEach((c, i) => g.addColorStop(i / 4, c));
      x.fillStyle = g;
    } else x.fillStyle = bg;
    x.fillRect(0, 0, size, size);
  };
  $('dl').addEventListener('click', async () => {
    const png = await toPng(look(pick), 1000, (x) => fillBack(x, 1000, BACKS[pick.back].bg), (x) => {
      if (!$('mark').checked) return;
      x.font = '28px Nunito, sans-serif';
      x.fillStyle = 'rgba(20,16,9,.7)';
      x.fillText(SITE, 26, 972);
    });
    save(png, 'peppy.png');
  });
  renderPfp();

  /* the meme studio */
  $('mWho').innerHTML = PEPPYS.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
  function renderMeme() {
    const f = $('memeFrame');
    f.innerHTML = look(PEPPYS[$('mWho').value].look);
    const cap = (cls, id) => {
      const d = document.createElement('div');
      d.className = `cap ${cls}`;
      d.textContent = $(id).value;
      f.append(d);
    };
    cap('t', 'mTop');
    cap('b', 'mBot');
  }
  ['mWho', 'mTop', 'mBot'].forEach((i) => $(i).addEventListener('input', renderMeme));
  renderMeme();
  const wrap = (x, text, w) => {
    const out = [];
    let line2 = '';
    for (const word of text.split(/\s+/)) {
      const t = line2 ? `${line2} ${word}` : word;
      if (x.measureText(t).width > w && line2) {
        out.push(line2);
        line2 = word;
      } else line2 = t;
    }
    if (line2) out.push(line2);
    return out;
  };
  $('mDl').addEventListener('click', async () => {
    const png = await toPng(look(PEPPYS[$('mWho').value].look), 1000, (x) => fillBack(x, 1000, '#141a2e'), (x) => {
      x.font = '72px "Titan One", sans-serif';
      x.textAlign = 'center';
      x.lineWidth = 12;
      x.strokeStyle = '#000';
      x.fillStyle = '#fff';
      const put = (t, y, up) => {
        const lines = wrap(x, t.toUpperCase(), 920);
        lines.forEach((l, i) => {
          const yy = up ? y - (lines.length - 1 - i) * 78 : y + i * 78;
          x.strokeText(l, 500, yy);
          x.fillText(l, 500, yy);
        });
      };
      put($('mTop').value, 90, false);
      put($('mBot').value, 960, true);
    });
    save(png, 'peppy-meme.png');
  });
  $('tabPfp').addEventListener('click', () => {
    $('pfp').hidden = false;
    $('meme').hidden = true;
    $('tabPfp').classList.add('on');
    $('tabMeme').classList.remove('on');
  });
  $('tabMeme').addEventListener('click', () => {
    $('pfp').hidden = true;
    $('meme').hidden = false;
    $('tabMeme').classList.add('on');
    $('tabPfp').classList.remove('on');
  });

  /* sound: one small synthesized whinny, off until asked for */
  let sound = false;
  let ctx = null;
  $('sound').addEventListener('click', () => {
    sound = !sound;
    $('sound').textContent = `SOUND: ${sound ? 'ON' : 'OFF'}`;
    if (sound) neigh();
  });
  function neigh() {
    if (!sound) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lfo = ctx.createOscillator();
    const d = ctx.createGain();
    lfo.frequency.value = 24;
    d.gain.value = 70;
    lfo.connect(d).connect(o.frequency);
    o.type = 'sawtooth';
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(900, t);
    o.frequency.exponentialRampToValueAtTime(320, t + 0.7);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.85);
    lfo.stop(t + 0.85);
  }
  $('egg').addEventListener('click', () => {
    $('eggArt').innerHTML = look(PEPPYS[10].look);
    $('eggShare').href = `https://x.com/intent/tweet?text=${encodeURIComponent('i found the egg. #11 was here.\n\npeppyrh.fun')}`;
    $('eggBox').hidden = false;
    neigh();
  });
  $('eggClose').addEventListener('click', () => ($('eggBox').hidden = true));
  $('eggBox').addEventListener('click', (e) => { if (e.target === $('eggBox')) $('eggBox').hidden = true; });
  $('fine').addEventListener('click', () => $('notice').remove());
  /* sections rise in as they scroll into view */
  const seen = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } }), { threshold: 0.15 });
  document.querySelectorAll('.ch>*,.file,.vault,.buy,.clip,.ex,.stamp').forEach((n) => { n.classList.add('rise'); seen.observe(n); });
})();
