---
name: looki-realtime
description: Retrieve the authenticated user's latest Looki realtime event from the past 30 minutes; use when the user asks what their device detected recently. Requires proactive mode and does not provide continuous monitoring.
---

# Looki Realtime

Call `get_latest_realtime_event` only for recent device context. The
tool takes no arguments and returns the latest realtime event from the past 30
minutes when proactive mode is enabled.

## Workflow

1. Call the tool once.
2. If `item` contains an event, use only its `description`, `start_time`,
   `end_time`, `tz`, optional `location`, and optional `latest_file`.
3. If `item` is `null`, state that Looki returned no realtime event from the
   past 30 minutes.
4. If the tool reports that proactive mode is not enabled, tell the user to
   enable proactive mode in the Looki app. Do not describe that error as an
   empty result.
5. Route older or date-based requests to `$looki-memory`.

## Guardrails

- Use Looki MCP tools only; OAuth identifies the user automatically.
- If Looki tools are unavailable, ask the user to connect the Looki MCP server
  and complete OAuth.
- Do not repeatedly poll. This Skill performs a point-in-time lookup, not a
  subscription or monitoring workflow.
- Do not claim that an event is still occurring after its returned end time.
- Treat realtime location and activity as highly sensitive.
- Do not infer safety, health, intent, or identity beyond the returned event
  description.
- Do not request API credentials.

## Response style

- Lead with the latest returned event or the absence of one.
- Include the returned time and location only when relevant.
- Make uncertainty explicit, especially when the event has already ended.
