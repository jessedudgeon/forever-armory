# Resume checkpoint — 2026-09-29

Branch: `codex/armory-reference-expansion` · PR: https://github.com/jessedudgeon/forever-armory/pull/6

This work extends the prior expansion commit `b78a7a1`; do not restart the audit. The PR is not merged or deployed. Firebase production rules/configuration were not changed; the rule comment documents the existing private envelope policy.

## Completed this resumed session

- Recovered and compared the existing branch, PR, previous QA notes, and passing CI checks.
- Removed the 180 KB single-snapshot bottleneck: manifest + Unicode-safe private fragments, 3 MB normalized snapshot cap, atomic revision writes, fail-closed integrity checks, and full fragment cleanup.
- Fixed cloud save/delete diffs to use actual stored document IDs, preventing stale hashes after schema normalization.
- Unified **Dungeon/Raid → Encounter → Loot** in one catalog/service/UI. Added stable encounter permalinks, shared item references, source links, raid rosters, selected sourced raid loot, and private per-character boss checklists.
- Preserved old dungeon URLs, name-only progress, manual instance statuses, existing notes and other milestones. Empty tables explicitly mean missing data, not no loot.
- Connected global boss search directly to encounter pages and Armory milestones to the journal.
- Consolidated duplicate CI workflows; existing validation also checks addon packaging.
- Passed 58 Node tests, 7 Firestore security tests, local browser smoke across 23 flows and four widths, and browser Auth/Firestore tests including 2,000-slot import/reload and cross-user isolation. See `QA.md`.

## Master priority status

“Foundation complete” describes implemented infrastructure, not exhaustive verified game content.

| Priority | Status / remaining scope |
| --- | --- |
| Account → character | Foundation complete: multiple accounts, two names, play style, valid manual race/class choices, persistence; immutable addon GUID migration remains future work |
| Armory | Core complete: equipment, inventory, crafts, builds, progress, notes/history; live imported statistics coverage depends on addon |
| Complete inventory | Model/UI/cloud foundation complete; collector coverage and large-history pagination remain |
| Item database/tooltips | Shared foundation complete; verified Forever stats/effects/sources and full catalog remain partial |
| Talents | Functional three-tree calculator/build saving; inferred beta ranks/icons need game verification |
| PvE Journal | Shared dungeon/raid architecture complete; loot/mechanics/quests and additional encounter coverage partial |
| Professions | Character crafts/reagents and import model complete; complete recipe catalog/unknown comparisons partial |
| Guilds | Private planning and owned-character roster complete; cross-user membership/invites/public recruitment not started |
| Legacy accounts | Multi-account model/status/perk plans complete; future verified perks/status need data |
| Search | Available-data unified search complete; remote/public indices not started |
| Navigation / UX | Connected responsive tools complete; ongoing refinement remains |
| Visuals | Armory/banner/tooltips/talent layout improved; full verified race/talent art remains |
| Firebase/security | Owner isolation and revisions tested; live OAuth and deployed rules still require production acceptance |
| Addon import boundary | Documented, validated shared snapshot interface complete; full in-game collectors outside this website session |
| Ads | Disabled reusable slots complete; provider integration intentionally not started |

## Known limitations and highest-value next work

1. **Next highest priority:** verify the addon contract against real Forever exports and populate authoritative item/talent/encounter data. Preserve provenance; never substitute Classic assumptions for Forever facts.
2. Prepare sanitized public Armory projections and server-validated shared guild roles/invites. Current guild officer fields confer no access rights.
3. Add paginated inventory/history and import preview summaries before supporting much larger histories. Atomic saves deliberately cap at 450 records / 7 MB; snapshots cap at 3 MB, raw imports at 1 MB. Old open tabs must refresh after fragment records are introduced.
4. Validate real Google OAuth on the deployed origin and verify production Firestore rules. Emulators prove application behavior, not live provider configuration. No production database writes were made.
5. No verified full Forever catalog, combat logs, complete recipe database, or automatic bank/recipe/encounter addon collectors yet.

## Relevant changed files

- Storage: `site/cloud-model.js`, `site/cloud.js`, `site/character-data.js`, `firestore.rules` (comment only).
- Journal: `site/data/pve.js`, `site/pve-data.js`, `site/pve.js`, compatibility `site/dungeons.js`.
- Integration: `site/app.js`, `site/features.js`, `site/items.js`, `site/index.html`, `site/expansion.css`.
- Tests: `tests/cloud-model.test.mjs`, `tests/pve.test.mjs`, `tests/security/firestore.test.mjs`, `tests/browser/{smoke,cloud}.cjs`.
- Operations/docs: `.github/workflows/validate.yml`; removed duplicate `checks.yml`; `ARCHITECTURE.md`, `IMPORT-SCHEMA.md`, `QA.md`, this checkpoint.

Reproduce with `npm test`, `npm run test:security`, `python3 scripts/package.py`; browser setup/commands are in `QA.md`. This remains a static GitHub Pages site with hash routes and no required bundler.
