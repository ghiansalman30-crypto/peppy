# PEPPY: project notes for Claude

PEPPY ($PEPPY) is a meme coin site on Robinhood Chain. The character is a Pepe-faced centaur, and the site follows the concept and feature set of slippy.club "1:1" with our own character, art and text. The owner talks in casual Indonesian; answer the same way.

## Live

- **Site:** https://peppyrh.fun, on a VPS behind nginx. `site/` is served as static files, and pm2 `peppy-api` runs on :5451 (see `deploy/`).
- **X:** @peppyrh, linked in `site/js/config.js`.
- **Token:** there is no engine, the same as Slippy (a plain ERC-20). There is an optional manual burn panel at `/burn.html` where the owner types a dollar amount and presses Burn. The owner wallet signs in and the server only records verified on-chain burns. No private key ever lives on the server.

## Files

- `site/`: plain HTML/JS/CSS.
  - `js/peppy.js` is the SVG character renderer.
  - `js/data.js` holds the 11 personalities and the traits.
  - `js/app.js` is the main page: daily Peppy, roster, six chapters, tapes, PFP creator, meme studio, token and community.
  - `siege.html` + `js/siege.js` is the Peppy Siege artillery game versus the CPU.
  - `burn.html` + `js/burn.js` is the owner burn panel.
  - `whitelist.html` is a placeholder.
  - `js/config.js` holds the CA, X and Telegram. Paste the CA there to switch on the buy links.
- `server/`: the small API (`api.ts`): burn record, wallet sign-in, and owner tools. Its data lives in `data/` (git-ignored, holds the session key) and secrets go in `.env` (git-ignored).
- `konten-x/`: the X kit (logos, banner, GIF, demo video, `caption.md`). Its Remotion source is in `konten-x/remotion` (`npm install` there, then `npx remotion studio`).
- `art-test/`: character art iterations. `c20` is the approved centaur.

## Rules from the owner

- **Character:** a Pepe-faced centaur with a full body in every logo, matching skin and body color, and a continuous line from the neck into the horse body. The Pepe likeness is intentional, and the copyright risk was already explained to the owner.
- **Domain:** `peppyrh.fun` everywhere, never `peppy.fun`.
- **Palette and fonts:** #141009, #f4e9d4, #f5a300; Titan One, Nunito.

## Not built yet

- Online Siege versus other players
- Leaderboard and X login
- A working NFT whitelist
- The token CA and the Telegram link
- Art from a real artist

## Run locally

Double-click `start.bat`. It runs `npm install` on first run, starts the API on :5451 and opens the site at http://127.0.0.1:5191.
