# Dungeon & Raid Journal contract — October 2, 2026

This document supersedes the October 1 assumption that a `/forever/` URL proves a fact is verified. See [CONTENT-VERIFICATION.md](CONTENT-VERIFICATION.md) for the complete catalog audit and research backlog.

## Publication policy

`site/data/pve.js` is the non-destructive source registry. `content-evidence.js` produces the public projection consumed by Journal views, search, item sources and event choices. A record must carry reviewed `evidence`; a source URL alone is insufficient. `confirmed` and `observed` records publish with distinct labels. `likely-inherited`, `unknown` and missing evidence do not publish. An official announcement confirms only its stated claims, not present accessibility.

Evidence shape: `{status, source, sourceType, verifiedAt, notes}`. `source` is a public HTTPS reference; `verifiedAt` is the review date, not an invented observation time. Source types include official-announcement, forever-guide, forever-database, forever-api, addon and user-observation. Never expose a private export, character/account ID or screenshot URL as public provenance. Sanitize and obtain permission before adding user evidence to the public repository.

Review the actual assertion. Database records establish their reported identity/fields only; neither historical comments nor a version-prefixed URL confirms an instance/drop association. Guides are displayed as **Reported for Forever**, not independently client-verified. `fieldEvidence` overrides control individual uncertain fields; an announcement's presence cannot make an unsupported recommended level public. Each encounter, quest, prerequisite and loot association has separate evidence. `orderEvidence` establishes guide ordering, not mandatory kill order. Missing order is unnumbered and follows known orders.

## Instances and encounters

Existing stable IDs and routes are unchanged. Instances retain `kind`, name, recommended `level`, `minimumLevel`, `playerSize`, zone, entrance, description, source, coverage, map, accessRequirements, attunement, preparation, mechanics, lockout, wings, quests, encounters, and additive `loot[]`, `evidence`, `fieldEvidence`.

Encounter fields: id, name, order, orderEvidence, encounterType (boss/rare/group), area, wingId, description, artwork, abilities, mechanics, tankNotes, healerNotes, dpsNotes, strategy, questIds, prerequisites, notes, loot, source, evidence. Arrays are plain escaped text except explicit structured quest steps. Local artwork still requires documented rights; no third-party map was copied.

Public encounters sort by order without mutating source data. Rare encounters and enemy groups retain their old IDs for saved progress. Numbers express guide order only. Empty mechanics, quests, access and loot panels/shortcuts are omitted; one short coverage note discloses gaps. Boss cards precede the loot browser. Mobile loot renders as cards using the existing item buttons.

## Loot and items

`data/items.js` owns item identity/details. Association records use `{itemId, sourceType, sourceName, sourceUrl, questId?, variation?, requirements?, dropRate?, evidence, fieldEvidence?}`. Encounter `loot[]` implies an encounter source; instance `loot[]` supports quest-reward, trash, chest, reputation and instance-reward. Unsupported metadata stays unknown.

`lootRows`, `instanceLoot`, `lootFor`, `itemSources`, `referenceItems` and search all use the public projection. Inverse links without an encounter point to the instance, never `/null` or `/undefined`. Existing tooltips, inventory, item goals and permalinks are reused. Filters include source type, encounter, text/ID, slot/type/quality and explicit class restrictions. This is not an upgrade or proficiency calculator.

A drop percentage requires its own `fieldEvidence.dropRate` and a finite value in 0–100. No production percentages are supplied. Owning an item does not prove where it dropped. An observed item never promotes an unverified drop association. Added reward items deliberately omit quality/icons/requirements that were not established; the shared item dialog handles missing details.

## Quests and character progress

Quests retain stable catalog IDs, names, descriptions, faction, requirements, rewardItemIds and ordered `prerequisites[]`, each with evidence. Verified numeric `gameQuestId` can match imported completedQuestIDs, questHistory or active quest log. A ready-to-turn-in objective is not a completed turn-in. Do not infer numeric mappings from a matching Classic name. Only Old Ironforge Incursion currently has a published top-level numeric mapping; Underground Map's ID is recorded in its prerequisite step (step-level automatic matching is not implemented).

Private boss checks and whole-instance completion remain independent. Existing reported kill counts/dates and quest/attunement records survive edits. Optional pveHistory displays recorded kills, clears and obtained loot without inferring inventory, clear state or lockouts. Addon 0.3.0 does not emit that future PvE event contract. See IMPORT-SCHEMA.md and the next collector milestone in CONTENT-VERIFICATION.md.

Gated instances remain in the source registry. `recordedInstanceKind` is for private event validation only: old events, backup and cloud round trips remain compatible without republishing hidden listings. Private snapshots and unknown history IDs are unchanged. No Firestore/schema/auth/addon changes or production user writes are required.

## Validation

127 Node tests; 13 Firestore security tests; Journal, navigation, 25-flow smoke and emulator-backed guild/community browser suites. The Journal suite covers filters, source and reward links, missing panels, guide order, independent completion, reload, character isolation, failed-save recovery and 320/390/768/1440px layouts. See CHECKPOINT.md for current release state. Real Google OAuth, production cross-user acceptance and real-client addon collection are separate from emulator results.
