---
name: fix-issue
description: Analyze a bug reported as a GitHub issue, find the root cause, fix it, and update CHANGELOG. Use when the user says "fix bug", "fix issue #12", "/fix-issue", or reports a bug in chat.
argument-hint: "[#number | all] (empty = open issues labelled bug)"
---

# Fix issue – My Story

Target: $ARGUMENTS

## 1. Get the issue
1. Read `docs/BLUEPRINT.md` (principles + data model).
2. Fetch the issue:
   - If `gh` works (`gh auth status`): `gh issue view <n> --comments` or `gh issue list --label bug --state open`.
   - Otherwise ask the user to paste the issue text. Never ask for tokens.
3. If the user reports a bug in chat with no issue, run `/report-issue` first so it is recorded, then continue.

## 2. Triage
- Severity: data loss / unusable > works but wrong > cosmetic. Fix the worst first.
- Not enough information to find the cause → comment on the issue (or tell the user) with one concrete question, label it `needs-info`, and move on to the next one.
- It is really a feature request → say so and suggest `/add-feature` instead.

## 3. Fix one at a time
1. **Find the real cause.** Read the relevant code and follow the data flow `NotesApp → useNotes → NoteRepository → IndexedDB`. Do not guess.
2. Make the most targeted fix. No refactoring beyond what the fix needs. Never make existing notes disappear.
3. Verify:
   ```bash
   source ~/.nvm/nvm.sh && nvm use
   npm run lint
   NEXT_PUBLIC_BASE_PATH=/my-story npm run build
   ```
   If this fails, the fix is not done.
4. Add a line under `## [Unreleased]` › `### Fixed` in `CHANGELOG.md`: `- <summary> (#<issue>)`.
5. If the bug came from a design flaw (not a typo), add a row to the Decision log in `docs/BLUEPRINT.md`.
6. Commit with `fix: <summary> (#<issue>)` and a `Closes #<issue>` line in the body, on a branch (see "Git workflow" in `CLAUDE.md`). The issue closes when the PR/commit reaches `main`.

## 4. Report to the user
- Table: issue · summary · status (Fixed / Needs info) · files changed
- What the user should try on a real device (e.g. iPhone)
- Suggest `/release patch` once fixes are merged
