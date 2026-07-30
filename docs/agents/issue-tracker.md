# Issue tracker: Hybrid

This repository uses GitHub Issues for wayfinding and triage, and local Markdown for specs and implementation tickets.

## GitHub operations

`wayfinder` and `triage` operate on GitHub Issues in `Wayaans/keiei` using the `gh` CLI.

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --comments`
- List: `gh issue list`
- Comment: `gh issue comment <number> --body "..."`
- Apply or remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`.

### Pull requests as a triage surface

**PRs as a request surface: no.**

### Wayfinding operations

The map is a GitHub issue labelled `wayfinder:map`. Its child tickets are GitHub sub-issues.

- Child labels use `wayfinder:<type>`, where type is `research`, `prototype`, `grilling`, or `task`.
- Use native GitHub issue dependencies for blocking relationships when available.
- Claim a ticket with `gh issue edit <number> --add-assignee @me`.
- Resolve it by posting the answer, closing the issue, and adding its context pointer to the map.

## Local Markdown operations

`to-spec` and `to-tickets` write under `.scratch/`.

- One feature per directory: `.scratch/<feature-slug>/`
- Spec: `.scratch/<feature-slug>/spec.md`
- Implementation tickets: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Number tickets from `01`.
- Store each ticket in a separate file; never create one combined tickets file.

When `to-spec` publishes a spec, write the feature's `spec.md`. When `to-tickets` publishes tickets, write files under the feature's `issues/` directory.
