---
name: add-feature
description: Add a new feature to My Story following the blueprint. Use when the user asks to add or change a feature, e.g. "add tags", "add pin", "/add-feature ...", or to pick something from the roadmap or a GitHub issue.
argument-hint: <feature idea, #issue number, or empty to pick from the roadmap>
---

# Add feature – My Story

Feature: $ARGUMENTS

## 1. Understand the context
1. Read all of `docs/BLUEPRINT.md` (principles, data model, structure, roadmap).
2. If the argument is an issue number, read it (`gh issue view <n>` if `gh` works, otherwise ask the user to paste it). If the argument is empty, show the unchecked roadmap items and let the user pick one.
3. If the idea is not recorded as an issue yet, run `/report-issue` to record it first.
4. Check the feature against **design principles (section 3)**. If it conflicts (e.g. needs a server), tell the user with alternatives before writing code.
5. If it touches a Next.js API you do not know, read `node_modules/next/dist/docs/` first.

## 2. Plan briefly (tell the user before coding)
- Files to create/edit
- Does the data model change? If yes: new fields optional or a migration in `onupgradeneeded` + bump `DB_VERSION`
- Change type: feature (minor) / fix (patch) / breaking (major)

## 3. Build
- Start on a new branch from an up-to-date `main`
- Logic goes in `src/lib/` or `src/hooks/`, UI in `src/components/`
- Access data only through `NoteRepository`
- UI text is Thai, colors via tokens, mobile buttons at least 40px tall
- If export is affected (e.g. added tags) → update `src/lib/export.ts` so the new data is exported

## 4. Verify
```bash
source ~/.nvm/nvm.sh && nvm use
npm run lint
NEXT_PUBLIC_BASE_PATH=/my-story npm run build
```
Both must pass. Do not report done otherwise.

## 5. Document (do not skip)
1. `CHANGELOG.md` → add a line under `## [Unreleased]` in `### Added` / `### Changed` / `### Fixed` / `### Removed` (add `(#issue)` when there is one)
2. `docs/BLUEPRINT.md`:
   - Move the item from Roadmap to the "Existing features" table (version `next`)
   - Update Data model / code structure if they changed
   - Important decisions → add a row to the Decision log
3. Summarize for the user: what was done, files changed, and recommend `/release` as patch/minor/major. If the feature came from an issue, put `Closes #<n>` in the commit body.
