# Shared Dungeon & Raid Journal content contract

Both types use `site/data/pve.js`, resolved by `pve-data.js`. Definitions remain static ES modules compatible with GitHub Pages. Replace the service's source later without changing view components.

## Instance

`id`, `kind` (`dungeon` or `raid`), `name`, `level` (recommended display range), `minimumLevel`, `playerSize`, `zone`, `entrance`, `description`, `coverage`, `source`, `map`, `accessRequirements[]`, `attunement[]`, `preparation[]`, `mechanics[]`, `lockout`, `wings[]`, `quests[]`, `encounters[]`.

Unknown values are null/empty. Do not infer Forever levels, lockouts, attunements or party sizes from Classic. Requirements/preparation are short strings. Wings may be strings or `{id,name,description}`. `map` and encounter `artwork` use `{src,alt,credit}`; only project-local `./assets/` artwork renders. Add assets only with documented rights.

Quests accept legacy strings or `{id,name,description,requirements,rewardItemIds[]}`. Rewards use the central item dialog. Quest search results link to their owning instance. No fake quest catalog is supplied.

## Encounter

`id`, `name`, `order`, `wingId`, `description`, `artwork`, `abilities[]`, `mechanics[]`, `tankNotes[]`, `healerNotes[]`, `dpsNotes[]`, `strategy`, `questIds[]`, `prerequisites[]`, `loot[]`.

Stable IDs power routes and imported progress. `order` is reference listing order, not a claim that optional bosses must be killed in that order. Strategy and role notes are plain text, escaped at rendering boundaries. Rich guides, videos, comments, scheduling and composition services can key off the same instance/encounter IDs without changing character identity.

## Loot and central items

`site/data/items.js` owns reference item definitions. Journal loot stores `{itemId,sourceUrl,variation?,dropRate?}` only; it does not maintain copies of item names/stats. Equipment, inventory, recipes, global search and journal loot use `items.js` dialogs/permalinks. `itemSources()` produces inverse item → encounter → instance links, preserving multiple sources.

`referenceItemsById()` enriches Journal rows through the existing optional Classic catalog service; failure preserves local names/IDs and source links. Filters include search, encounter, slot, armor/weapon subtype, quality and explicit `allowedClasses[]`. A character selector applies its class. Unknown restrictions remain visible and explicitly labeled; this is not an equipment proficiency or upgrade scoring engine. Imported character inventory does not become public catalog metadata.

The supplied data still has incomplete mechanics, quests and stats. Populate verified Forever facts with provenance before claiming full content coverage. No rates are inferred, and displayed numeric rates require a source URL. Tier-set relationships, wishlists, videos, scheduling and guild dashboards remain future work.

## September 30 expansion

- `#pve` is the combined Dungeon & Raid Journal; `#pve/dungeons` and `#pve/raids` are bookmarkable overview filters. Existing `#pve/<instance>/<encounter>` and legacy `#dungeons/...` routes and item links still work.
- Seven raid references: Molten Core, Onyxia’s Lair, Blackwing Lair, Zul’Gurub, Ruins of Ahn’Qiraj, Temple of Ahn’Qiraj, Naxxramas. All previous dungeon data remains unchanged.
- Added raid entrances and selected quest/access sequences. `quests[].prerequisites` contains ordered `{id,name,prerequisiteIds[]}` steps; preceding stable IDs express dependencies. These are reference preparation steps, not fabricated quest completions. Source links accompany the quests. Catalog IDs do not claim to be game IDs.
- `quests[].gameQuestId` is an optional **verified Forever** numeric mapping. Without it, matching uses explicit `progress[].quests[].id` only. With it, `completedQuestIDs`/`questHistory` mean turned in; an active `quests[].completed` means ready to turn in. Missing data remains “Not recorded.” No Classic numeric quest IDs have been silently mapped to Forever.
- Selecting a character shows private completion and listed-boss counts on overview cards, imported boss totals/dates on details, related quest status and imported PvE history. Full-instance completion is an independent explicit checkbox, including instances whose encounter list is still empty. Clearing it preserves boss/quest/attunement data and history.
- Snapshot `pveHistory` supports future collectors without changing the public catalog, character identity or private persistence path. See IMPORT-SCHEMA.md for bounds, merge rules and examples.

### Provenance checked for this increment

The content is deliberately labeled Classic reference, not a verified Forever raid roster or release schedule. No combat mechanics, group sizes, reset durations or drop rates were inferred for Forever.

- Blizzard Classic [Zul’Gurub overview](https://news.blizzard.com/en-us/article/23391283/wow-classic-zulgurub-and-more-now-available): location, entrance and named encounter roster; rotating Edge of Madness bosses are not all available in one reset.
- Blizzard Classic [Ahn’Qiraj overview](https://news.blizzard.com/en-us/article/23493335/explore-the-temple-of-ahnqiraj-and-ruins-of-ahnqiraj): entrances, level, names and realm gate prerequisite. Season of Discovery rules were not substituted.
- Blizzard Classic [Naxxramas overview](https://news.blizzard.com/en-us/article/23572632/wow-classic-naxxramas-is-now-live): level, location, encounter roster and attunement sequence.
- Existing Blizzard [Blackwing Lair reference](https://news.blizzard.com/en-us/article/23302788/wow-classic-descend-into-the-depths-of-blackwing-lair): entrance and Blackhand’s Command sequence.
- Blizzard [Molten Core / Onyxia reference](https://news.blizzard.com/en-us/article/24165121/20th-anniversary-realms-molten-core-and-onyxia-s-lair-now-live) and the linked Classic quest reference provide selected access/quest notes.

### Remaining content and collector work

Verify Forever raid availability, game encounter/quest IDs, entrances and level ranges in the actual client. Populate full quest chains, faction branches, mechanics, maps and loot only from verified sources. Implement and real-client-test addon kill/clear/loot collection before advertising automatic tracking. Larger history browsing, reset/lockout views and reconciliation of historical events into newer snapshots remain future work. No community QA task is completed or changed by this increment.


### October 1 production integration

The September draft was integrated after the navigation release (`7bf1eb1`). Shared breadcrumbs, section shortcuts and filtered headings remain. All filter URLs now work, including `#pve/new` and `#pve/classic`. Added isolated browser acceptance without modifying community QA. Character progress stays private and explicit; manual clear state is independent of listed bosses (including rotating or optional encounters). Empty quest/loot sections indicate incomplete coverage rather than absence of content.

The cited Blizzard Classic sources were re-opened during this integration. They establish Classic reference content only. Forever availability, numeric quest/encounter mappings and addon collection remain unverified.
