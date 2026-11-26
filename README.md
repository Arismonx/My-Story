# My Story

**English** | [ภาษาไทย](README.th.md)

A personal journal for your stories that works on both desktop and mobile. Your data stays on your own device.

- Write notes with autosave, plus created and last-edited dates
- Markdown support with live syntax highlighting and a preview
- Search notes and group them by day
- Export to `.md` or `.txt` (one note or all of them)
- Install on your phone (PWA) and use it offline

> The app's interface is in Thai. Documentation is in English.

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

## Cross-device sync (optional)
Without setup the app is local only. To sync notes between devices with [Supabase](https://supabase.com) (free tier is enough):
1. Create a Supabase project
2. Dashboard → **SQL Editor** → run [`supabase/schema.sql`](supabase/schema.sql) (table + Row Level Security)
3. **Authentication → URL Configuration:** set Site URL to your Pages URL, `https://<user>.github.io/<repo>/` (the path is the repo name, case-sensitive) and add `http://localhost:3000/` to Redirect URLs for local development
4. **Project Settings → API:** copy the Project URL and the `anon` public key
   - Local: put them in `.env.local` (git-ignored):
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
     ```
   - GitHub Pages: repo Settings → Secrets and variables → Actions → **Variables**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, then re-run the deploy

The anon key is meant to be public; RLS makes each user see only their own notes. Sign in from the "ซิงค์ข้ามอุปกรณ์" button at the bottom of the note list (email magic link, no password).

## Install on mobile
- **Android (Chrome):** Menu ⋮ → "Install app" / "Add to Home screen"
- **iPhone (Safari):** Share button → "Add to Home Screen"

> Notes are stored in each device's browser. Clearing site data deletes them unless sync is on, so export a backup regularly.

## Found a bug or have an idea?
Open a [GitHub issue](../../issues/new/choose) and pick the **Bug report** or **Feature request** template.

## Contributing
Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and ground rules, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for how we work together.

## Versions
See [CHANGELOG.md](CHANGELOG.md) · Design document: [docs/BLUEPRINT.md](docs/BLUEPRINT.md)

## License
[MIT](LICENSE). By contributing you agree your contribution is released under the same license.
