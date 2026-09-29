# Changelog

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
