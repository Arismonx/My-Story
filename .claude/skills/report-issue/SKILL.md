---
name: report-issue
description: Analyze a problem or idea (bug, odd behavior, missing feature) and open it as a GitHub issue, or draft it with a prefilled link when gh is unavailable. Use when the user says "open an issue", "report this", "/report-issue", mentions a bug or idea in chat, or when you notice a bug while working on something else.
argument-hint: <what was noticed>
---

# Report issue – My Story

Input: $ARGUMENTS

## 1. Analyze first (do not just paste the user's words)
1. Read `docs/BLUEPRINT.md`, then look at the code involved. Follow the data flow `NotesApp → useNotes → NoteRepository → IndexedDB`.
2. Search for duplicates: `gh issue list --search "<keywords>" --state all` if `gh` works. If a duplicate exists, tell the user and link it instead of opening a new one.
3. Decide the type:
   - **Bug** → template `bug_report.yml`, label `bug`
   - **Feature/idea** → template `feature_request.yml`, label `enhancement`. Check it against the design principles in the blueprint (section 3) and say if it conflicts.
4. For a bug, record what you found: likely cause (file and line), how to reproduce, severity. Mark guesses as guesses.

## 2. Write the issue (English)
Short, concrete title. Body follows the template fields:
- Bug: What happened · Expected · Steps to reproduce · Device/browser · App version (`node -p "require('./package.json').version"`) · Severity · **Analysis** (likely cause, files)
- Feature: Problem · Proposed solution · Alternatives · Principles check

Keep the user's original wording in a quote if it adds information (Thai is fine there). Never include personal data or secrets.

## 3. Open it
1. If `gh auth status` succeeds, ask the user to confirm the text, then:
   `gh issue create --title "<title>" --body-file <file in the scratchpad dir> --label <bug|enhancement>`
2. Otherwise (the usual case on this machine) print the issue text and a prefilled link for the user to click:
   `https://github.com/Arismonx/My-Story/issues/new?template=<bug_report.yml|feature_request.yml>&title=<url-encoded title>&labels=<label>`
   Prefilled field values use the template field ids, e.g. `&what-happened=<url-encoded text>`. Keep the link under about 6000 characters; if the body is longer, print the body and keep only the title in the link.
3. Do not ask for tokens or run `gh auth login` on the user's behalf.

## 4. Tell the user
- Issue link, or the draft + link to click
- One line on the suspected cause and a suggested next step (`/fix-issue #n` or `/add-feature #n`)
