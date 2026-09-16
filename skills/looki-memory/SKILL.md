---
name: looki-memory
description: Browse and search the authenticated user's Looki moments and moment files; use for date-based recaps, past experiences, calendar highlights, moment details, and captured media. Do not use for current realtime context or account-profile questions.
---

# Looki Memories

Use the connected Looki MCP as the source of truth for the user's captured
moments. The available tools are read-only and operate only on the authenticated
user.

## Tool selection

- Use `get_moments_calendar` for an inclusive date range. Pass
  `start_date` and `end_date` as `YYYY-MM-DD`; the start date must not be after
  the end date. Each returned item contains an available date and may contain a
  `highlight_moment`.
- Use `list_moments_on_date` for one exact `on_date`. It returns each
  moment's ID, title, description, date, timezone, time range, media types, and
  optional cover file.
- Use `search_moments` when the user describes an experience but does
  not know its exact date or ID. `query` must be 1-100 characters. Optional
  date bounds are inclusive. `page` starts at 1; `page_size` defaults to 10 and
  must be between 1 and 100. Results are relevance-ranked.
- Use `get_moment_detail` only with a moment UUID returned by Looki or
  explicitly provided by the user.
- Use `get_moment_files` only after identifying a moment UUID. Omit
  `highlight` to return all files, set it to `true` for highlighted files, or
  `false` for non-highlighted files. Omit `cursor_id` on the first request;
  `limit` defaults to 20 and must be between 1 and 100.

Route account name, timezone, gender, or birthday questions to `$looki-profile`.
Route requests about what the device detected recently to `$looki-realtime`.

## Workflow

1. Resolve the narrowest date or search query supported by the request.
2. Retrieve a date list, calendar, or search result before requesting details
   or files.
3. Follow `has_more` only when more results are needed. For file pagination,
   pass the returned `next_cursor_id`; for search pagination, increment `page`.
4. Present times using the returned timezone and preserve the distinction
   between a moment's `date`, `start_time`, and `end_time`.
5. Base summaries only on returned titles, descriptions, times, media types,
   cover files, and file metadata.

## Constraints

- Use Looki MCP tools only. Do not read local credential files, request API
  keys, or call the legacy REST API.
- If Looki tools are unavailable, ask the user to connect the Looki MCP server
  and complete OAuth.
- Retrieve the minimum personal context needed to answer the request.
- Treat media URLs and location data as private. Do not reproduce or download a
  temporary URL unless the user's request requires it.
- An empty result means Looki returned no matching captured data; it does not
  prove that nothing happened.
- The current MCP does not expose journals, generated vlogs, a For You feed, or
  liked creative content. State the limitation instead of inventing a tool.

## Response style

- Lead with the matching moment, recap, media, or absence of a result.
- Organize date-range answers by date and exact-day answers chronologically.
- Separate returned facts from interpretation and make coverage gaps explicit.
