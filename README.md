# MARVEL MCU TIMELINE — Ultimate Edition

A high‑fidelity, framework‑free, 3D depth interactive MCU timeline experience with TVA‑style glitch effects,
“Snap / Restore” easter eggs, and a J.A.R.V.I.S. terminal vibe.

## Live

### Global (GitHub Pages + custom domain)

- [mcu.wumatv.net](https://mcu.wumatv.net/) — primary global URL (Cloudflare in front of GitHub Pages)
- [ryanwuma.github.io/mcu/](https://ryanwuma.github.io/mcu/) — same build as the custom domain

### Video CDN (global)

Large trailer files are served from a dedicated origin behind Cloudflare (not from this repo’s `video/` folder in production):

- [mcu-video.wumatv.net](https://mcu-video.wumatv.net/) — static video origin for the global site

### China (official)

- [wumatv.cn/mcu-app/public/](https://wumatv.cn/mcu-app/public/)

## What’s inside

- **App shell**: `index.html` (HTML + CSS + JS in one file; includes a built‑in data fallback if JSON fails to load)
- **Images**: `img/`
- **Data**: `mcuData.json`, `localVideoFiles.json`, `heroDictionary.json`, `mcuData.en.json`

## Local run

This project is static. You can open `index.html` directly; for fewer browser quirks, serve over HTTP:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Credits

Powered by **Wuma Design**.
