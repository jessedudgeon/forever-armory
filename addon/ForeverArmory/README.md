# ForeverArmory 0.2.0

## Install / update

1. Exit WoW Forever. Keep a backup of your working ForeverArmory folder and WTF SavedVariables.
2. Extract this ZIP into the game's `Interface/AddOns` directory. The result must be `Interface/AddOns/ForeverArmory/ForeverArmory.toc`, not `ForeverArmory/ForeverArmory/`.
3. Enable Forever Armory on the character screen. Interface 16001 and AllowLoadGameType camelot are preserved from the existing Forever addon.
4. Log into the character you want to export. No Google credentials belong in the addon.

## Populate the cache

- Open your personal bank outside combat and wait a moment. Bank open/item-change events trigger scans. `/farmory bank` retries while the bank is open. Close it afterward; future exports retain that dated cache. Unsupported bank layouts stay unavailable; this build does not guess modern account/warband/guild-bank indices.
- Open each profession. Readable recipe-list events scan known recipes; `/farmory recipes` explicitly scans the current window. Repeat for Blacksmithing, Cooking, First Aid and other relevant professions. Partial or filtered lists add known recipes without deleting prior ones. Skill values can also be cached from the open modern profession API.
- Optionally use the game's `/played` once; its response is cached. The addon does not repeatedly request played time or generate that chat message itself.
- `/reload` or log out normally to let WoW persist SavedVariables. No special export or network synchronization is required for caching.

## Export

Run `/farmory export` (or `/farmory`). The export window shows version, character, time, bank status and cached recipe count. Copy all selected JSON with Ctrl+C; open forever.dudgeon.io → Import & backups → Import character → paste → Review import. Choose the correct WoW account and save. If linking a legacy manual character for the first time, select that character explicitly in the review rather than creating a duplicate.

`/farmory help` lists commands. A current bank was just scanned while open; cached means older saved data; not-scanned/unavailable is unknown, never empty. Scan times are embedded in the JSON. The website preserves raw fields as well as normalized Armory data.

## Compatibility and limitations

Payload keeps `format: forever-armory`, `version: 1`, and the existing `character` envelope; additive `schemaVersion: 1` and `addonVersion: 0.2.0` identify this build. A stable GUID is exported only if UnitGUID returns a usable value. Surname, creation date, account ownership and play style are not guessed. The website selects the WoW account. Missing item names fall back to item-link text/IDs.

Captured where supported: equipment/links/quality/item level/count/durability/enchant fields and resolvable gem item IDs; individual bag slots and container metadata; dated personal bank cache; purchased talent ranks/IDs/max rank/tree totals; profession skills and cached known recipes; active quests/objectives and optional completed IDs; reputation, legacy skill lines and legacy known spell IDs; sex, bind location, max resource stats and location.

Not promised: bank layouts whose constants/APIs differ, other storage types, surname API, profession specializations, complete modern recipe reagents/yields, modern spellbook enumeration, dungeon/raid boss kills or achievements. Missing APIs are omitted/warned. Raw item-link gem enchant IDs are labeled separately from gem item IDs. Recipe required skill is omitted when the API doesn't supply it.

Caches are keyed by realm + GUID in account-level SavedVariables; name+realm is a fallback when GUID is absent. Only the active character cache is exported. Legacy recipe SavedVariables migrate once per character. Caches are additive; unlearning a profession may require cache reconciliation in a later version. Avoid manually editing or copying caches between accounts.

## Validation

Lua syntax/execution and modern/missing API branches are exercised by mocked Lua tests, including bank current/cached/empty/unavailable states and character isolation. Generated JSON passes the website importer, duplicate check, backup and cloud round trips. This version has not yet been run inside your Forever client; that acceptance test cannot be substituted by mocks. Keep your old addon backup until the first export is confirmed.
