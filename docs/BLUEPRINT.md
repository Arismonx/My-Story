# My Story – App Blueprint

> The foundation document for the app. Read it before designing or adding any feature, and update it whenever what it describes changes.
> Last updated: 2026-11-11 · App version: 0.4.0

## 1. What this app is
A personal journal for daily stories that works on desktop and mobile. Data stays on the user's device and can always be exported as a text file.

## 2. Users & problem
- **Primary user:** the owner (single user, no accounts yet). Contributions from others are welcome (see [CONTRIBUTING.md](../CONTRIBUTING.md)).
- **Problem:** write quickly, no login, no fear of losing data (export works), and see when each note was written.

## 3. Design principles (do not break without updating this section)
1. **Local-first:** works immediately, offline, with no backend.
2. **User owns the data:** every note must be exportable as `.md` / `.txt`.
3. **Mobile-first:** every screen must be usable with a thumb at 360px width.
4. **Static hosting:** builds to static files (`output: "export"`) for GitHub Pages. No Server Actions, dynamic Route Handlers, or cookies.
5. **Thai UI:** all user-facing text in the app is Thai; documentation and code comments are English.

## 4. Tech stack
| Part | Used | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, static export) | Read `node_modules/next/dist/docs/` first, the API has changed |
| UI | React 19 + Tailwind CSS v4 | Colors live in CSS variables in `globals.css` |
| Storage | IndexedDB (`src/lib/db.ts`) | Behind the `NoteRepository` interface |
| Mobile | PWA (`manifest.ts` + `public/sw.js`) | |
| Hosting | GitHub Pages via Actions | `NEXT_PUBLIC_BASE_PATH=/<repo>` |
| Runtime | Node 22 (`.nvmrc`) | |

## 5. Data model
```ts
Note {
  id: string        // crypto.randomUUID()
  title: string
  content: string   // Markdown (rendered by the "Preview" button)
  createdAt: string // ISO 8601, when the note was written
  updatedAt: string // ISO 8601, last edit
}
```
IndexedDB: database `my-story` · store `notes` (keyPath `id`, index `updatedAt`) · `DB_VERSION = 1`
Changing the schema → bump `DB_VERSION` and write a migration in `onupgradeneeded`. Never lose existing notes.

## 6. Code structure
```
src/
  app/            layout, page, manifest (server components, static)
  components/     NotesApp (main state), NoteList, NoteEditor, MarkdownTextarea, Markdown, ExportMenu, RegisterSW
  hooks/useNotes  CRUD + state, takes a NoteRepository as a parameter
  lib/            types, db (IndexedDB), export (md/txt), format (Thai dates)
```
Data flow: `NotesApp → useNotes(repo) → NoteRepository → IndexedDB`

## 7. Existing features
| Feature | Version |
|---|---|
| Write/edit/delete notes with autosave | 0.1.0 |
| Created + last-edited dates, grouped by day | 0.1.0 |
| Search | 0.1.0 |
| Export .md / .txt (single + all) | 0.1.0 |
| Offline PWA on mobile | 0.1.0 |
| Markdown preview (Edit/Preview button) | 0.2.0 |
| Markdown syntax highlighting in the editor | 0.3.0 |
| Markdown tables (preview + editor highlighting) | 0.4.0 |

## 8. Roadmap (ideas for next features)
Ideas are also tracked as GitHub issues labelled `enhancement`.
- [ ] Tags / categories + filter by tag
- [ ] Pin notes
- [ ] Import `.md` / `.txt` files back into the app
- [ ] Backup/restore as JSON (protects against clearing the browser)
- [ ] Light/dark theme toggle
- [ ] Calendar view of notes by day
- [ ] Cross-device sync with Postgres (Supabase): `SupabaseRepo implements NoteRepository` + Auth
- [ ] Attach images (stored as Blobs in IndexedDB)

## 9. Decision log
| Date | Decision | Reason |
|---|---|---|
| 2026-11-05 | Use IndexedDB instead of Postgres in the first version | GitHub Pages is static hosting and cannot run a DB/server |
| 2026-11-05 | Separate the `NoteRepository` interface | Allows adding Supabase (Postgres) later without touching the UI |
| 2026-11-05 | Build a PWA instead of a native app | One codebase, installable on mobile immediately |
| 2026-11-08 | Own Markdown renderer in `components/Markdown.tsx` (renders React elements, no innerHTML) | No new dependency, prevents XSS, `content` stays plain Markdown so no migration |
| 2026-11-08 | Editor highlighting via a transparent textarea over an overlay, bold via `.md-bold` (text-stroke) instead of font-weight | Real font-weight changes glyph width and misaligns the caret |
| 2026-11-11 | Tables are parsed in our own `Markdown.tsx` (GFM syntax, wide tables scroll inside their own container) | Keeps the no-dependency renderer; `content` stays plain Markdown so no migration |
| 2026-11-08 | Documentation in English; bugs and feature requests tracked as GitHub issues (replaces `docs/BUGS.md`) | Open the project to outside contributors |
