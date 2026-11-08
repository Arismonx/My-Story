---
name: release
description: Cut a new My Story version following Semantic Versioning. Moves CHANGELOG Unreleased under the new version, bumps package.json, creates a git tag. Use when the user says "release", "bump version", "/release".
argument-hint: "[patch|minor|major] (empty = decide from the changelog)"
disable-model-invocation: true
---

# Release – My Story

Requested level: $ARGUMENTS

## 0. Preflight (do not skip; stop and tell the user if anything fails)
```bash
git fetch origin --tags
git branch --show-current                      # must be main
git rev-list --left-right --count main...origin/main   # left = we are ahead, right = remote is ahead
git status --short
```
| Found | Do |
|---|---|
| Not on `main` | **Stop.** Say "you are on branch X, not main" and ask whether to merge into main first. Never tag on another branch |
| `origin/main` has commits we lack (right side > 0) | **Stop.** Say the remote is ahead (a PR may have been merged) and offer `git rebase origin/main`. Tag only after the rebase |
| Uncommitted files | Ask whether to commit them first |
| Tag `vX.Y.Z` already exists (local or remote) | **Stop.** Tell the user. Never delete or overwrite a pushed tag |
| `git push` fails for missing credentials | Tell the user to push themselves with `git push origin main && git push origin vX.Y.Z` |

When stopping, list what the user forgot or what is unusual, clearly, before asking how to proceed.

## 1. Check state
```bash
git status --short          # must be clean, except CHANGELOG/BLUEPRINT edited in this step
git describe --tags --abbrev=0 2>/dev/null   # latest tag
node -p "require('./package.json').version"
```
- Code files uncommitted → ask the user whether to commit them
- `## [Unreleased]` in CHANGELOG is empty → draft entries from `git log <latest tag>..HEAD --oneline` and have the user confirm

## 2. Choose the version number (if the user did not say)
- `### Removed`, or a change that breaks existing data/behavior → **major**
- `### Added` → **minor**
- Only `### Fixed` / small `### Changed` → **patch**
- In 0.x.y a breaking change may bump minor instead of major (tell the user)

Tell the user `old version → new version` with a one-line reason.

## 3. Update docs
1. `CHANGELOG.md`: turn `## [Unreleased]` into `## [X.Y.Z] - YYYY-MM-DD` and add an empty `## [Unreleased]` above it
2. `docs/BLUEPRINT.md`: replace `next` in the feature table with `X.Y.Z`; update the "App version" and "Last updated" lines
3. `git add CHANGELOG.md docs/BLUEPRINT.md && git commit -m "docs: changelog for vX.Y.Z"`

## 4. Bump + tag
```bash
npm run release:<patch|minor|major>
```
This edits `package.json`/`package-lock.json`, commits `chore(release): vX.Y.Z` and creates tag `vX.Y.Z`.

## 5. Push (always ask the user first)
```bash
git push && git push --tags
```
After the push, GitHub Actions deploys automatically and the app shows the new version at the bottom left. Issues referenced with `Closes #n` close when their commits reach `main`; mention the release version in a comment if useful.
