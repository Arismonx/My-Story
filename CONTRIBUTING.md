# Contributing to My Story

Thanks for helping! Anyone can report bugs, suggest features, or send code.

## Report a bug or suggest a feature
Open a [GitHub issue](../../issues/new/choose) and pick a template. Search existing issues first to avoid duplicates. One problem or idea per issue.

## Send code
1. Fork the repo and create a branch from an up-to-date `main` (`feat/<topic>` or `fix/<topic>`).
2. Read [docs/BLUEPRINT.md](docs/BLUEPRINT.md): principles, data model and structure.
3. Make the change. For larger features, comment on an issue first so we agree on the approach.
4. Run the checks:
   ```bash
   nvm use                 # Node 22
   npm install
   npm run lint
   NEXT_PUBLIC_BASE_PATH=/my-story npm run build
   ```
5. Open a pull request against `main` and fill in the template. CI must pass.

## Ground rules
- Must stay a static export (no Server Actions, cookies, dynamic route handlers).
- UI reads and writes data only through `NoteRepository`, never IndexedDB directly.
- Changing the schema means bumping `DB_VERSION` and adding a migration that keeps old notes.
- UI text is Thai; docs, comments, commits, issues and PRs are English.
- Use the color tokens (`bg`, `surface`, `fg`, `muted`, `line`, `accent`, `danger`); never hardcode colors.
- Test the UI at 360px width.
- Add a line under `## [Unreleased]` in `CHANGELOG.md` for every user-visible change.
- Do not edit the version in `package.json`; the maintainer does that when releasing.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`).

## Using Claude Code
The repo ships project skills: `/add-feature`, `/fix-issue`, `/report-issue`. They follow the same rules as this file.

## License
By contributing you agree that your work is released under the [MIT License](LICENSE).

## Conduct
Be respectful. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
