# Re-dispatch packets

If the session died mid-mission, any lane whose output file in `research/` is missing or obviously
truncated (no "open questions" / "could not verify" sections at the end) can be re-fired from the
packet here. Dispatch with the Agent tool, `subagent_type: general-purpose`, `model: sonnet`,
run in background. Lanes are independent — re-fire only the ones that are missing.

Every packet must open with these three lines:
  1. Work to `~/.claude/skills/agentic-os-blueprint/reference/reasoning-protocol.md` (read it first).
  2. Read `<PROJ>/00_MISSION_BRIEF.md`.
  3. You own exactly one file: `<PROJ>/research/<LANE>.md`. Touch nothing else. No git. No firecrawl.
And close with: report outcome-first, status DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED.
