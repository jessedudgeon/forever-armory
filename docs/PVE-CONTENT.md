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
