# Changelog

## 0.3.0 — 2026-09-29

- Save a JSON session export automatically on normal logout, exit and reload; retain the previous valid export if capture fails.
- Add `/farmory last` to retrieve the exact last saved session without refreshing its timestamp or inventory.
- Persist confirmed quest turn-ins per character, with stable event/session IDs, dates, readable names, level, zone and available rewards. Keep repeatable completions distinct and ignore same-tick duplicate notifications.
- Backfill completed quest IDs where supported without inventing completion dates; never infer a turn-in from a quest disappearing.
- Bound wire history to the latest 2000 events with an explicit truncation status while retaining the full local journal.
- Support safe website import of the character SavedVariables file, cumulative event/ID merging and a completed-quest journal in Progress. Uploaded Lua is never executed.
- Preserve all 0.2.0 collectors, caches and version-1 JSON imports. Add mocked session lifecycle and SavedVariables → website round-trip validation.

## 0.2.0 — 2026-09-29

- Preserve per-slot inventory instead of collapsing duplicate stacks.
- Add guarded GUID, optional state/stats/location and version metadata.
- Add timestamped personal-bank caching and explicit freshness states; never replace a cache after an incomplete scan.
- Add profession recipe/skill caching with quiet event-driven scans and explicit commands.
- Retain modern trait IDs plus legacy talent coordinates, maximum rank and point totals.
- Add optional quest objectives/completed IDs, reputation, skills and known legacy spell IDs.
- Extend equipment metadata and preserve original item links; distinguish link gem enchant IDs from actual gem items.
- Preserve long legacy API return tuples, isolate optional collector failures, skip secret/nonfinite values and avoid combat scans.
- Add install instructions and automated Lua → JSON → website compatibility tests.

## 0.1.0-beta

- Initial character, equipment, aggregated inventory, professions and talent export window.
