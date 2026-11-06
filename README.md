# My Story

**English** | [ภาษาไทย](README.th.md)

A personal journal for your stories that works on both desktop and mobile. Your data stays on your own device.

- Write notes with autosave, plus created and last-edited dates
- Search notes and group them by day
- Export to `.md` or `.txt` (one note or all of them)
- Install on your phone (PWA) and use it offline

## Getting started
```bash
nvm use
npm install
npm run dev
```

## Deploy to GitHub Pages
1. Push to GitHub (branch `main`)
2. Go to Settings → Pages → Source: **GitHub Actions**
3. The `.github/workflows/deploy.yml` workflow builds and deploys on every push

## Install on mobile
- **Android (Chrome):** Menu ⋮ → "Install app" / "Add to Home screen"
- **iPhone (Safari):** Share button → "Add to Home Screen"

> Notes are stored in each device's browser. Clearing site data deletes them, so export a backup regularly.

## Versions
See [CHANGELOG.md](CHANGELOG.md) · Design document: [docs/BLUEPRINT.md](docs/BLUEPRINT.md)

## Found a bug?
Add it to [docs/BUGS.md](docs/BUGS.md) under **📥 Inbox**, then run `/fix-bugs` in Claude Code.
