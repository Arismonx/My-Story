# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

- **MAJOR** (x.0.0) – incompatible changes, e.g. a data structure change that makes old notes unusable
- **MINOR** (0.x.0) – new features
- **PATCH** (0.0.x) – bug fixes and small tweaks

Add every user-visible change under `## [Unreleased]`. Reference the issue when there is one, e.g. `(#12)`.

## [Unreleased]

## [0.4.0] - 2026-11-11

### Added
- Markdown tables: the preview renders `| a | b |` tables with column alignment (`:---`, `:---:`, `---:`), scrolling sideways on narrow screens, and the editor highlights table pipes and the separator row

## [0.3.0] - 2026-11-08

### Added
- The editor highlights Markdown syntax while you type (`##`, `**`, `>`, `-` in the accent color; headings and `**bold**` text shown bold) so you can tell Markdown is active

## [0.2.0] - 2026-11-08

### Added
- Notes support Markdown (headings `#`, **bold**, *italic*, ~~strikethrough~~, `code`, links, lists, checklists, quotes, horizontal rules). Tap "ดูตัวอย่าง" (Preview) in the editor to see the result

## [0.1.0] - 2026-11-05

### Added
- Write notes (title + content) with autosave to IndexedDB on the device
- Each note records "created" and "last edited" dates; the list is grouped by created day
- Search notes by title and content
- Export one note or all notes as `.md` / `.txt`
- Mobile-friendly (responsive) + installable PWA that works offline
- App version shown at the bottom of the app
- Automatic deploy to GitHub Pages via GitHub Actions
