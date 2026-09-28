# Character import contract

The website accepts JSON through the existing **Import character → Review → Save** flow. It never executes Lua, connects directly to the game, or writes before confirmation. API transport can change later without changing the Armory components: `parseImport()` → `normalize()` → `addSnapshot()` → `commit()`.

## Version 1, additive fields

Old `/farmory`, `/wfb`, and backup exports remain readable. Version 1 now accepts the optional fields below. `mainName` / `secondaryName` are the canonical first and last name fields; `firstName` / `lastName` are accepted aliases. `name` is the full display name for older addons. Use `playStyle`, never introduce a realm selector. Historical `realm` is retained internally only to preserve existing identities.

```json
{
  "format": "forever-armory",
  "version": 1,
  "character": {
    "mainName": "Asha",
    "secondaryName": "Brightvale",
    "playStyle": "Normal",
    "class": "PALADIN",
    "race": "Undead",
    "faction": "Horde",
    "level": 14,
    "observedAt": "2026-09-28T17:00:00Z",
    "gear": [{"id": 6220, "name": "Meteor Shard", "slot": 16, "quality": 3}],
    "inventory": [
      {"id": 2770, "name": "Copper Ore", "quantity": 4, "quality": 1,
       "location": "backpack", "container": "0", "slot": 1},
      {"id": 2770, "name": "Copper Ore", "quantity": 12, "quality": 1,
       "location": "bank", "container": "main", "slot": 3}
    ],
    "storageStatus": {
      "backpack": {"captured": true},
      "bank": {"captured": true}
    },
    "professions": [{"name": "Blacksmithing", "rank": 20, "max": 75}],
    "recipes": [{"id": "example-recipe", "name": "Example craft",
      "profession": "Blacksmithing", "skill": 20, "known": true,
      "craftedItem": 123, "quantity": 1,
      "reagents": [{"id": 2770, "quantity": 2}], "source": "Imported observation"}],
    "progress": [{"id": "example-encounter", "name": "Example encounter",
      "type": "raid", "completed": false, "status": "In progress",
      "bosses": [{"name": "Example boss", "completed": false}]}],
    "statistics": {"Strength": 42},
    "notes": "Optional character notes",
    "warnings": []
  }
}
```

Item names/IDs in this example illustrate the payload; they do not verify a Forever drop or recipe.

## Inventory and freshness

- `location`: `equipment`, `backpack`, `bags`, `bank`, `keyring`, `other`, or `account`. `other` uses `storageLabel` to describe client-specific storage. `account` is reserved; availability is **not** assumed.
- `container` + `slot` identify a stack within one location. Slots are nonnegative integers; duplicate locations/container/slot tuples are rejected. Omit `slot` for old aggregated exports.
- `id` (or `itemId`), positive `quantity` (or `count`), `name`, numeric `quality` (0–8), `binding`, `enchantments` (strings), `gems` (item IDs), `durability: {current,max}`, `link`, and `observedAt` are supported.
- `gear` remains the canonical equipment list (slots 1–19) and wins if the same equipment slot also occurs in `inventory`.
- Every supplied `storageStatus` entry marked captured replaces that entire location for that capture timestamp. An empty `inventory` with `bank: {captured:true}` means the bank was observed empty. Unmentioned locations retain earlier observations and their timestamps.
- If providing an explicit location capture, include **all** observed items in that location, not just changes. Do not send `captured:true` for an unopened bank or unavailable API.
- Without `storageStatus`, an explicitly supplied `inventory` is a complete replacement of the inventory observation. Omitting `inventory` preserves the last available observation.
- Older addon bag exports have no exact slots; the UI labels their unknown coverage. The current bundled addon is still the original beta collector: bank, recipes, and progress collection require further addon work.
- Account storage currently belongs to the selected character's observation. A future shared account-storage service must reconcile freshness across observers rather than sum duplicate observations.

## Other optional fields

- `recipes`: each entry needs a unique profession/ID pair, name, and profession. Explicit `known:false` permits a known/unknown comparison. Missing recipes never imply unknown.
- `progress`: `dungeon`, `raid`, `reputation`, `achievement`, or `other`; status, completion, boss checklist, and notes. No completion is inferred from a roster or loot table.
- `statistics`: up to 80 named finite numeric values. No derived combat values are invented.
- `builds`: up to 40 `{name,code,updatedAt}` plans using the same class/level/rank encoding as the calculator. Manual plans are separate from imported `talents`.
- `guildId` and `guildRank` associate a character with the active user's private guild planner.
- Missing optional rich fields are retained from the latest snapshot at or before the new observation. Historical imports never inherit observations from their future.
- Original equipment/talents/XP/gold behavior is retained: a basic game export does not pretend to refresh unavailable equipment; website-only notes/build edits preserve equipment capture time.

The review screen's selected game account is authoritative. Import payloads cannot choose another website user. Foreign cloud user IDs are never accepted.

## Bounds and atomicity

Exports are limited to 1 MB; inventories to 2,000 observations, recipes to 2,000, and progress to 500 entries. The existing cloud wire protocol additionally limits **each serialized snapshot to 180,000 bytes** and each atomic change to 450 records / 7 MB. A large import may fit the input limit and still exceed cloud capacity; it is rejected before writes, leaving cloud data unchanged. Splitting a large snapshot into chunked storage documents is future work; do not silently truncate or partially save it.

All text is escaped at display boundaries. Arrays, IDs, timestamps, slot uniqueness, numbers, and account relationships are validated before saving. Server rules enforce ownership, not trust in addon claims. These private observations must never be treated as authoritative public rankings or verified logs.
