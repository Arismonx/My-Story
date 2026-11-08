@AGENTS.md

# My Story

A local-first note-taking app (Next.js static export → GitHub Pages, data in IndexedDB, installable PWA for mobile).

**Read [docs/BLUEPRINT.md](docs/BLUEPRINT.md) before designing or changing code.** It holds the principles, data model, structure and roadmap. Contribution rules for humans are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Commands
```bash
nvm use               # Node 22 (.nvmrc)
npm run dev           # dev server http://localhost:3000
npm run lint
npm run build         # static export → out/
npm run preview       # serve out/ locally
NEXT_PUBLIC_BASE_PATH=/my-story npm run build   # simulate the GitHub Pages build
```

## Rules
- Must always stay statically exportable: no Server Actions, cookies, dynamic route handlers, or optimizing `next/image`
- The UI reaches data only through `NoteRepository` (`src/lib/types.ts`). Never call IndexedDB directly from a component
- Schema change → bump `DB_VERSION` in `src/lib/db.ts` + a migration that keeps old notes
- **Language:** UI text is Thai, dates use `src/lib/format.ts`. Everything else (docs, code comments, commit messages, issues, PRs, skills) is English
- Use colors through tokens (`bg`, `surface`, `fg`, `muted`, `line`, `accent`, `danger`). Never hardcode colors
- Test at 360px width whenever you change UI
- **Every user-visible change needs a line in `CHANGELOG.md` under `## [Unreleased]`** (mention the issue number when there is one)
- The version number lives only in `package.json` (the app reads it). Never edit it by hand, use the `/release` skill

## Skills in this project
- `/add-feature <idea or #issue>`: add a feature per the blueprint, update CHANGELOG and BLUEPRINT
- `/fix-issue [#number]`: analyze a GitHub bug issue, fix it, update CHANGELOG
- `/report-issue <what you noticed>`: analyze a problem or idea and open (or draft) a GitHub issue
- `/release`: cut a new version (semver, changelog, git tag)

## Issues (bugs and feature requests)
Bugs and feature requests live in **GitHub Issues** (`docs/BUGS.md` no longer exists). Templates are in `.github/ISSUE_TEMPLATE/`.
- If the user mentions a bug or idea in chat, run `/report-issue` first so it is recorded, then work on it.
- If you notice a bug or problem while doing something else, do **not** silently fix unrelated things: analyze it and open (or draft) an issue with `/report-issue`, then tell the user.
- `gh` may not be installed or authenticated on this machine. Then `/report-issue` prints the issue text and a prefilled `issues/new` link for the user to click. Never ask the user to paste tokens into the chat.

## Git workflow
- Before commit/merge/release run `git fetch origin`, then check the current branch and whether `origin/main` is ahead of us
- **If the user forgot a step, say so plainly before continuing.** For example: wrong branch, not fetched, remote has new commits, uncommitted files, tag not pushed
- Start each new piece of work on a new branch from an up-to-date `main` (do not keep building on an old branch that was already merged)
- Never delete or recreate a tag that was already pushed. An unpushed tag can be fixed
- Pushing over HTTPS does not work from this machine (no credentials). The user pushes. Prepare the commits/tag and give them the push command
- Changes from outside contributors arrive as pull requests; CI (`.github/workflows/ci.yml`) must pass
