# MARVEL MCU TIMELINE — Ultimate Edition

A high‑fidelity, framework‑free, 3D depth interactive MCU timeline experience with TVA‑style glitch effects,
“Snap / Restore” easter eggs, and a J.A.R.V.I.S. terminal vibe.

## Live

### China (official)

- [wumatv.cn/mcu-app/public/](https://wumatv.cn/mcu-app/public/)

### Global (GitHub Pages + custom domain)

- [mcu.wumatv.net](https://mcu.wumatv.net/) — primary global URL (Cloudflare in front of GitHub Pages)
- [ryanwuma.github.io/mcu/](https://ryanwuma.github.io/mcu/) — same build as the custom domain

### Video CDN (global)

Large trailer files are served from a dedicated origin behind Cloudflare (not from this repo’s `video/` folder in production):

- [mcu-video.wumatv.net](https://mcu-video.wumatv.net/) — static video origin for the global site

## What’s inside

- **App shell**: `index.html` (HTML + CSS + JS in one file; includes a built‑in data fallback if JSON fails to load)
- **Images**: `img/`
- **Data (edit these to update content without touching code)**:
  - `mcuData.json` — timeline cards
  - `localVideoFiles.json` — local trailer filenames for fuzzy matching
  - `heroDictionary.json` — search synonym / hero → keyword expansion
  - `mcuData.en.json` — prebuilt English copy for instant EN mode on the global site
- **Scripts** (optional, for maintainers):
  - `scripts/extract-data-from-index.mjs` — regenerate JSON from embedded fallback (rare)
  - `scripts/build-en-data.mjs` — refresh `mcuData.en.json` after you change Chinese `desc` / `chars` / `impact` in `mcuData.json`

**Maintenance guide (Chinese):** see `开发笔记/MCU_站点维护更新手册_国内&国际.md`.

## Local run

This project is static. You can open `index.html` directly; for fewer browser quirks, serve over HTTP:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Credits

Powered by **Wuma Design**.
