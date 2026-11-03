/* The burn record and the owner panel. The wallet signs every burn; the server only checks the finished transaction. */
(() => {
  const $ = (id) => document.getElementById(id);
  const KEY = 'redvisor-session';
  const CHAIN = { chainId: '0x1237', chainName: 'Robinhood Chain', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'], blockExplorerUrls: ['https://robinhoodchain.blockscout.com'] };
  const EXPLORER = 'https://robinhoodchain.blockscout.com';
  let view = null;
  let wallet = '';
  let armed = '';
  let quote = null;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const session = () => {
    try {
      return localStorage.getItem(KEY) || '';
    } catch (e) {
      return '';
    }
  };
  const remember = (v) => {
    try {
      if (v) localStorage.setItem(KEY, v);
      else localStorage.removeItem(KEY);
    } catch (e) {}
  };
  async function call(path, body) {
    const r = await fetch(`/api/${path}`, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', 'x-session': session() }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong.'), { status: r.status });
    return Object.assign(j, { httpStatus: r.status });
  }
  const pretty = (s) => {
    const [a, b = ''] = String(s).split('.');
    const dec = b.replace(/0+$/, '').slice(0, 4);
    return BigInt(a).toLocaleString('en-US') + (dec ? `.${dec}` : '');
  };
  /** a typed amount to base units, without floating point */
  function units(text, decimals) {
    const v = text.trim().replace(/,/g, '');
    if (!/^\d+(\.\d+)?$/.test(v)) throw new Error('Enter an amount.');
    const [a, b = ''] = v.split('.');
    if (b.length > decimals) throw new Error('Too many decimals.');
    const n = BigInt(a + b.padEnd(decimals, '0'));
    if (n <= 0n) throw new Error('Enter an amount.');
    return n;
  }
  const word = (n) => n.toString(16).padStart(64, '0');
  const addr = (a) => a.toLowerCase().replace('0x', '').padStart(64, '0');

  async function load() {
    view = await call('burns');
    $('total').textContent = pretty(view.totalText);
    $('totalLabel').textContent = view.symbol ? `${view.symbol} burned so far` : 'Burned so far';
    $('count').textContent = view.burns.length;
    $('usd').textContent = `$${view.totalUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    $('tokenLine').replaceChildren();
    if (view.token) {
      const a = el('a', '', view.token);
      a.href = `${EXPLORER}/token/${view.token}`;
      a.target = '_blank';
      a.rel = 'noopener';
      $('tokenLine').append('Contract: ', a);
      $('watch').hidden = false;
    } else $('tokenLine').textContent = 'The token is not live yet.';
    $('burns').replaceChildren(
      ...(view.burns.length
        ? view.burns.map((b) => {
            const li = el('li');
            const a = el('a', '', `${b.tx.slice(0, 10)}…${b.tx.slice(-6)}`);
            a.href = `${EXPLORER}/tx/${b.tx}`;
            a.target = '_blank';
            a.rel = 'noopener';
            li.append(el('b', '', `${pretty(b.text)} ${view.symbol}${b.usd ? ` · $${b.usd.toLocaleString('en-US')}` : ''}`), el('span', '', new Date(b.at).toLocaleDateString('en-GB', { dateStyle: 'medium' })), a);
            return li;
          })
        : [el('li', 'none', 'No burns yet.')]),
    );
  }

  async function balance() {
    if (!view.token || !window.ethereum) return;
    const hex = await window.ethereum.request({ method: 'eth_call', params: [{ to: view.token, data: `0x70a08231${addr(wallet)}` }, 'latest'] }).catch(() => null);
    if (!hex || hex === '0x') return;
    const raw = BigInt(hex).toString().padStart(view.decimals + 1, '0');
    $('sBalance').textContent = pretty(`${raw.slice(0, -view.decimals)}.${raw.slice(-view.decimals)}`);
  }
  async function chain() {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN.chainId }] });
    } catch (e) {
      if (e.code !== 4902) throw e;
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [CHAIN] });
    }
  }
  async function openOwner() {
    const s = await call('owner/stats');
    wallet = s.wallet;
    $('tokenBox').hidden = false;
    $('heldBox').hidden = false;
    $('ownerStats').hidden = false;
    $('who').textContent = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
    $('auth').textContent = 'Sign out';
        $('tokenInput').value = view.token;
    $('tokenBox').open = !view.token;
    if (!view.token) $('msg').textContent = 'Paste the token contract above to turn on burns.';
    if (window.ethereum) {
      await chain().catch(() => {});
      await balance();
    }
  }
  async function signIn() {
    const eth = window.ethereum;
    if (!eth) return ($('pageMsg').textContent = 'No wallet found. Open this page in your wallet app, or install MetaMask.');
    try {
      const [account] = await eth.request({ method: 'eth_requestAccounts' });
      const n = await call('nonce');
      const hex = `0x${Array.from(new TextEncoder().encode(n.message), (b) => b.toString(16).padStart(2, '0')).join('')}`;
      const signature = await eth.request({ method: 'personal_sign', params: [hex, account] });
      const r = await call('login', { nonce: n.nonce, signature });
      remember(r.session);
      await openOwner();
      $('pageMsg').textContent = '';
    } catch (e) {
      $('pageMsg').textContent = e.status === 403 ? "This wallet isn't the owner." : e.code === 4001 ? 'Sign-in cancelled in your wallet.' : e.message;
    }
  }
  $('auth').addEventListener('click', () => {
    if (!wallet) return void signIn();
    remember('');
    wallet = '';
    $('tokenBox').hidden = true;
    $('heldBox').hidden = true;
    $('ownerStats').hidden = true;
    $('who').textContent = '';
    $('auth').textContent = 'Owner sign in';
  });
  /* the wallet keeps this logo for the token, so holders see it without any listing */
  $('watch').addEventListener('click', async () => {
    if (!window.ethereum) return ($('pageMsg').textContent = 'No wallet found. Open this page in your wallet app, or install MetaMask.');
    try {
      await chain();
      await window.ethereum.request({ method: 'wallet_watchAsset', params: { type: 'ERC20', options: { address: view.token, symbol: view.symbol.slice(0, 11), decimals: view.decimals, image: `${location.origin}/assets/token.png` } } });
    } catch (e) {
      $('pageMsg').textContent = e.code === 4001 ? 'Cancelled in your wallet.' : e.message;
    }
  });
  $('tokenForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('msg').textContent = '';
    try {
      await call('owner/token', { token: $('tokenInput').value.trim() });
      await load();
      await openOwner();
      $('msg').textContent = `Token saved: ${view.symbol}.`;
    } catch (x) {
      $('msg').textContent = x.message;
    }
  });
  $('usdAmount').addEventListener('input', () => {
    quote = null;
    $('usdBtn').textContent = 'Burn';
    $('msg').textContent = '';
  });
  /* one press: price the dollars, then open the wallet, whose own confirmation is the last step */
  $('usdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = $('usdBtn');
    const dollars = Number($('usdAmount').value.replace(/[$,\s]/g, ''));
    $('msg').textContent = '';
    $('pageMsg').textContent = '';
    b.disabled = true;
    try {
      if (!(dollars >= 1)) throw new Error('Type how many dollars, from $1.');
      // pressing Burn is all it takes: the wallet connects here if it hasn't yet
      if (!wallet) {
        b.textContent = 'Connect wallet…';
        await signIn();
        if (!wallet) throw new Error($('pageMsg').textContent || 'Connect the owner wallet first.');
        $('pageMsg').textContent = '';
      }
      if (!view.token) throw new Error('Paste the token contract above first. It goes live after launch.');
      b.textContent = 'Pricing…';
      const q = await call(`owner/quote?usd=${encodeURIComponent(dollars)}&address=${wallet}`);
      quote = { ...q, dollars };
      $('msg').textContent = `About ${pretty(q.tokens)} ${q.symbol} for $${dollars.toLocaleString('en-US')} (${(Number(q.wei) / 1e18).toFixed(6)} ETH).`;
      b.textContent = 'Confirm in wallet…';
      await chain();
      const tx = await window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: quote.tx.to, data: quote.tx.data, value: quote.tx.value }] });
      const usd = quote.dollars;
      quote = null;
      b.textContent = 'Waiting for the chain…';
      for (let i = 0; i < 40; i++) {
        const r = await call('owner/burn', { tx, usd });
        if (r.status === 'recorded') break;
        if (i === 39) throw new Error(`Still pending. Your tx: ${tx}`);
        await new Promise((ok) => setTimeout(ok, 3000));
      }
      $('usdAmount').value = '';
      await load();
      await balance();
      $('msg').textContent = 'Burn confirmed and recorded.';
    } catch (x) {
      quote = null;
      $('msg').textContent = x.code === 4001 ? 'Cancelled in your wallet.' : x.message;
    }
    b.disabled = false;
    b.textContent = 'Burn';
  });
  $('amount').addEventListener('input', () => {
    armed = '';
    $('burnBtn').textContent = 'Burn';
  });
  $('burnForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = $('burnBtn');
    $('msg').textContent = '';
    try {
      const n = units($('amount').value, view.decimals);
      // a burn can't be undone, so the amount gets a second look before the wallet opens
      if (armed !== n.toString()) {
        armed = n.toString();
        b.textContent = 'Press again to confirm';
        $('msg').textContent = `This sends ${pretty($('amount').value.replace(/,/g, ''))} ${view.symbol} to the dead address, for good.`;
        return;
      }
      armed = '';
      b.disabled = true;
      b.textContent = 'Confirm in wallet…';
      await chain();
      const tx = await window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: view.token, data: `0xa9059cbb${addr(view.dead)}${word(n)}` }] });
      b.textContent = 'Waiting for the chain…';
      for (let i = 0; i < 40; i++) {
        const r = await call('owner/burn', { tx });
        if (r.status === 'recorded') break;
        if (i === 39) throw new Error(`Still pending. Your tx: ${tx}`);
        await new Promise((ok) => setTimeout(ok, 3000));
      }
      $('amount').value = '';
      await load();
      await balance();
      $('msg').textContent = 'Burn confirmed and recorded.';
    } catch (x) {
      $('msg').textContent = x.code === 4001 ? 'Cancelled in your wallet.' : x.message;
    }
    b.disabled = false;
    b.textContent = 'Burn';
  });

  load()
    .then(() => (session() ? openOwner() : null))
    .catch((e) => {
      if (e.status !== 403 && e.status !== 401) $('pageMsg').textContent = 'The burn record is unavailable right now.';
    });
})();
