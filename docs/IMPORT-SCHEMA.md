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
- Every supplied `storageStatus` entry marked captured replaces that entire location when its scan time is at least as recent as the previously stored scan. Cached observations retain their own scan time, not the export time. An empty `inventory` with `bank: {captured:true}` means the bank was observed empty. Unmentioned locations retain earlier observations and their timestamps.
- If providing an explicit location capture, include **all** observed items in that location, not just changes. Do not send `captured:true` for an unopened bank or unavailable API.
- Without `storageStatus`, an explicitly supplied `inventory` is a complete replacement of the inventory observation. Omitting `inventory` preserves the last available observation.
- Older addon bag exports have no exact slots; the UI labels their unknown coverage. The 0.2.0 bundled addon preserves slots, supports guarded recipe scanning and caches recognized personal-bank layouts; actual client acceptance and encounter collectors remain pending.
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

Exports are limited to 1 MB; inventories to 2,000 observations, recipes to 2,000, and progress to 500 entries. Normalized snapshots up to **3 MB** can sync: the cloud serializer splits large snapshots into a versioned manifest and bounded fragments under the same private owner path. Each wire record remains below 180,000 bytes. Each atomic change is limited to 450 records / 7 MB; oversize changes fail before writes. No truncation or partial save occurs. Old open clients must refresh before reading the new fragment protocol.

Encounter progress can include a stable `bosses[].id` matching `site/data/pve.js`, for example `progress: [{id: "onyxias-lair", type: "raid", name: "Onyxia’s Lair", bosses: [{id: "onyxia", name: "Onyxia", completed: true}]}]`. Old name-only bosses remain accepted. Both dungeons and raids use this structure. Whole-instance completion is explicit; a partial catalog cannot infer a full clear.

All text is escaped at display boundaries. Arrays, IDs, timestamps, slot uniqueness, numbers, and account relationships are validated before saving. Server rules enforce ownership, not trust in addon claims. These private observations must never be treated as authoritative public rankings or verified logs.

### Encounter history and access progress

Each instance progress record may now include `quests: [{id, name, completed}]` and `attunements: [{id, name, status, completed}]`. Each boss may include `kills` (nonnegative integer) and `lastKilledAt` (parseable timestamp normalized to UTC ISO). Fields are optional for backward compatibility. Manual checklist changes preserve imported kill totals and timestamps; they do not fabricate kill events. The Armory displays these fields from the same normalized snapshots used by imports and cloud storage.

## September 29 pipeline adapter and identity update

`site/import-schema.js` dispatches version 1 before the normal snapshot validator. Unknown versions fail before writes. Every addon observation retains `rawAddon` (the original versioned JSON object) privately, plus `importedAt` distinct from `observedAt`. Backups and cloud fragments retain this data. Raw GUIDs/realm, bag/slot, item links/IDs, quest IDs and structured talent IDs therefore remain recoverable even when presentation support is incomplete. The adapter strips website-only notes/guild/build fields from incoming game updates; social/RP collections remain independent.

- `bags` is an accepted alias for complete backpack/bag stacks when `inventory` is absent. Bag 0 is backpack. Bag/slot/count/link fields become container/slot/quantity/name; raw forms remain in `rawAddon`. Existing `inventory` stays supported. Explicit location coverage merges preserve previous unopened banks.
- `stats` aliases `statistics`. Optional `location` stores zone/subZone/mapID. `reputations` remains optional private data; missing APIs never require a value.
- `talentDetails` retains treeID/nodeID/entryID/spellID/name/rank alongside old text talent summaries. No name-based guesses are used to load calculator nodes. Actual ranks are displayed; calculator mapping remains pending verified Forever IDs.
- `quests` stores numeric id (questID alias), title (name alias), optional level, and boolean completed/isComplete. Completion here means ready to turn in, not historical quest turn-in. Missing quest/dungeon mappings are not invented.
- `recipes` imports merge by profession+ID; an explicitly unscanned empty list does not erase known recipes. A filtered scan cannot prove a recipe was forgotten. Missing crafted quantity is unknown, not an assumed one item. Full recipe removal/unlearning semantics remain future work.
- Only the exact known `Classic Beta PvE` server label maps to Normal (PvE); arbitrary server text stays unknown. `realm` is never removed.

### Stable identity and migration

`gameIdentity: {guid, realm}` comes from the client, never a generated game GUID. A GUID+server match updates the existing character and preserves its route key, RP record and all snapshots. A first import can match a legacy record by exact name/server or unambiguous full name+known play style within the selected WoW account. Users can explicitly link an old manual record when its surname differs. Class/account/GUID conflicts are rejected. With multiple accounts and no unique GUID match, the review requires account selection; it does not assume the first account.

The optional private `recordKey` anchors later snapshots to the existing route. The addon cannot supply this field. Old records need no bulk migration. Manual corrections of GUID-linked characters preserve their route/history. Refresh old tabs before using renamed identities; old clients do not understand `recordKey`. Name-only fallback cannot safely infer renames. Account transfer and changed server/GUID require an explicit future reconciliation workflow; current imports reject cross-account moves rather than silently duplicate/move characters.

### Current state, history, privacy

Latest state is the newest observation, not the last uploaded file. Imports from the past never inherit future data. Identical repeated exports do not add snapshots merely because import time changed. History compares observations for levels, equipped items, talent ranks, profession increases, recipes and quest status; routine XP/money changes do not generate messages. Raw observations remain private owner-only snapshot envelopes under existing Firestore rules. No production rule deployment is required for this pipeline.

`#storage` searches and aggregates current captured item stacks across characters and accounts, retaining per-stack locations and timestamps. It is an in-memory index of the loaded private roster, not a new public inventory collection. Shared account-storage de-duplication and very large roster pagination remain future work.
