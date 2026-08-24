# Issue tracker: GitHub Issues

Issues and PRDs for this repo live in GitHub Issues on the `pixarusemperor/Static_Image_ads_generator` repository.

## Conventions

- Issues are created and managed via the [`gh`](https://cli.github.com/) CLI
- Use GitHub labels for triage state (see `triage-labels.md` for the mapping)
- Issue titles should be concise and descriptive
- Use GitHub's issue body for full context, acceptance criteria, and implementation notes
- Link issues to PRs via `Fixes #N` or `Closes #N` in commit messages or PR descriptions

## When a skill says "publish to the issue tracker"

Run `gh issue create` with the appropriate title, body, and labels.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number>` or `gh issue list` with appropriate filters. The user will normally pass the issue number directly.

## Label management

Use `gh label list` to check existing labels before creating new ones. If a needed label doesn't exist, create it with `gh label create`.
