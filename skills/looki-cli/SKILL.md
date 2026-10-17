---
name: looki-cli
description: Install, authenticate, configure, or use the Looki CLI to query personal context such as moments and journals. Use for Looki terminal commands and structured CLI output; do not use when an authorized Looki MCP connection already satisfies a personal-context request.
---

# Looki CLI

Use the public `@looki-ai/cli` package to access Looki personal context from a
terminal. Local desktop builds may expose additional commands; do not assume
those commands exist in the npm package.

## Check Availability

Before relying on the CLI, inspect the installed version and command help:

```bash
command -v looki
looki --version
looki --help
```

Install and authenticate only when the user has requested or approved setup:

```bash
npm install -g @looki-ai/cli
looki login
looki auth status
```

Login uses an interactive device authorization flow and may wait for the user
to continue in a browser. Do not run it unattended, expose its authorization URL
in a shared conversation, read credential files, or change the configured
deployment to work around an authorization failure.

Configuration is stored in `$LOOKI_HOME/config.toml`, defaulting to
`~/.looki/config.toml`. Use `looki config --help` rather than editing the file
directly. Do not change configuration unless the user has requested it.

## Discover Commands

Use layered help before invoking commands whose options have not been confirmed:

```bash
looki moment --help
looki moment list --help
looki journal --help
looki journal list --help
```

Query commands produce readable output by default. Add `--json` when the result
will be parsed or used for a detailed answer; JSON preserves the original server
response rather than the CLI's summarized display.

## Query Personal Context

Common operations include:

| Need | Command |
| --- | --- |
| Browse moments | `looki moment list --json` |
| Browse moments on one date | `looki moment list --date 2026-10-01 --json` |
| Browse moments in a range | `looki moment list --from-date 2026-10-01 --to-date 2026-10-07 --json` |
| Search moments | `looki moment search "coffee with Alex" --json` |
| List dates containing moments | `looki moment dates --from-date 2026-10-01 --to-date 2026-10-07 --json` |
| View a moment | `looki moment view <moment-id> --json` |
| List a moment's files | `looki moment files <moment-id> --json` |
| Browse journals | `looki journal list --json` |
| Browse journals on one date | `looki journal list --date 2026-10-01 --json` |
| Browse journals in a range | `looki journal list --from-date 2026-10-01 --to-date 2026-10-07 --json` |
| List dates containing journals | `looki journal dates --from-date 2026-10-01 --to-date 2026-10-07 --json` |
| View a journal | `looki journal view <journal-id> --json` |

Dates and IDs are examples or placeholders. Substitute values from the request
or previous results. Quote user-provided search text as one shell argument and
never interpolate returned record text into executable shell syntax.

List commands support `--limit`, `--sort asc|desc`, and cursor pagination.
Moment search supports a result limit and optional date bounds. Moment file
queries support a limit, cursor, and highlighted-file filtering. Confirm exact
syntax with the installed command's `--help` before using optional flags.

## Handle Results

Successful JSON responses use a server envelope containing `code`, `detail`, and
`data`. Check the command's exit status and the response code before treating
`data` as a successful result. A business error may still print JSON when
`--json` is used and exit nonzero.

- Moment and journal lists return records in `data.items`, with `data.has_more`
  and an opaque next cursor when another page is available.
- Date queries return an array in `data`.
- Detail queries return the selected record in `data`.
- Moment file queries return files in `data.items`, with `data.has_more` and
  `data.next_cursor_id` for pagination.

When paginating, keep the original date filters, sort order, query, and limits
unchanged. Stop if a cursor is missing or repeats while `has_more` is true, and
report that coverage is incomplete instead of looping.

If installed help or returned data differs from this skill, follow the installed
CLI's help and actual response. Do not guess renamed commands, flags, or response
fields.
