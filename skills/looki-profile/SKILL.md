---
name: looki-profile
description: Retrieve the authenticated user's Looki account ID, name, timezone, gender, or birthday; use for profile questions and for resolving dates in the user's account timezone. Do not use as evidence of recorded activities.
---

# Looki Profile

Call `get_user_profile` for account-level information. It takes no
arguments and returns `user.id`, `first_name`, `last_name`, `tz`, `gender`, and
`birthday` for the authenticated user.

## Workflow

1. Call the tool once and select only the fields needed by the request.
2. Treat nullable fields as unavailable when they are `null`; do not infer them.
3. Use `tz` to resolve relative dates for another Looki workflow when necessary.
4. Keep profile data separate from moments: it does not establish what the user
   did, where they went, or whom they met.

## Guardrails

- Use Looki MCP tools only; OAuth identifies the user automatically.
- If Looki tools are unavailable, ask the user to connect the Looki MCP server
  and complete OAuth.
- Treat name, birthday, gender, and timezone as sensitive personal data.
- Do not expose the full profile when one field is sufficient.
- Do not infer demographics, preferences, relationships, or behavior beyond the
  returned fields.
- Do not request API credentials or read local credential files.

## Response style

- Lead with the requested profile information.
- Avoid repeating identifiers or unrelated private fields.
- Mention use of the account timezone only when it materially affects a date.
