# ForeverArmory 0.3.0

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

**Session exports are automatic.** Play normally, then log out or exit normally. `/reload` also saves a session checkpoint. The addon records confirmed `QUEST_TURNED_IN` events throughout play, even if you never open the export window. It saves a JSON snapshot before the client writes SavedVariables. It keeps the latest session export per character; quest events remain cumulative across sessions.

After closing the game, open forever.dudgeon.io → Import & backups → Import character, then choose the character's file:

`WTF/Account/<WoW account>/<server>/<character>/SavedVariables/ForeverArmory.lua`

Choose the **character** SavedVariables file, not the account-level file. Review the character and select its WoW account before saving. The website extracts only `ForeverArmorySessionExport`; it never executes the Lua file or imports other SavedVariables. You can also log in next time and run `/farmory last` to copy the previous session's exact JSON. Importing the same export again does not duplicate its snapshot/events.

This saves data locally; it does not upload automatically. You still choose the file or paste the JSON into the website. A crash, forced termination or disconnect may prevent the game from writing its latest SavedVariables; this is not a continuous disk writer. A failed capture retains the previous valid export and displays an error at next login. Scan bank/professions as below; their caches remain dated rather than being called current at logout.

Run `/farmory export` (or `/farmory`). The export window shows version, character, time, bank status and cached recipe count. Copy all selected JSON with Ctrl+C; open forever.dudgeon.io → Import & backups → Import character → paste → Review import. Choose the correct WoW account and save. If linking a legacy manual character for the first time, select that character explicitly in the review rather than creating a duplicate.

`/farmory help` lists commands. A current bank was just scanned while open; cached means older saved data; not-scanned/unavailable is unknown, never empty. Scan times are embedded in the JSON. The website preserves raw fields as well as normalized Armory data.

## Compatibility and limitations

Payload keeps `format: forever-armory`, `version: 1`, and the existing `character` envelope; additive `schemaVersion: 1` and `addonVersion: 0.3.0` identify this build. A stable GUID is exported only if UnitGUID returns a usable value. Surname, creation date, account ownership and play style are not guessed. The website selects the WoW account. Missing item names fall back to item-link text/IDs.

`character.questHistory` records stable event IDs, quest ID/name where readable, timestamp, character GUID, level, zone, session ID and exposed reward values. Repeatable quest turn-ins are distinct events; repeated delivery in the same client tick is ignored. Abandoning a quest or removing it from the log is never treated as completion. Completed quest ID backfill uses `C_QuestLog.GetAllCompletedQuestIDs` only where it works; no historical dates are guessed. Names may be absent for quests the addon has never observed in the quest log.

The full journal persists in per-character `ForeverArmoryJournal`, keyed by realm + GUID (name fallback). Exports include the latest **2000 turn-in events** and all known completed IDs. Older events remain on disk, and `questHistoryStatus` explicitly reports truncation. The website merges imported event IDs without erasing earlier history. Import at least once per 2000 completions to preserve every completion timestamp on the website. Each session export must fit the existing 1 MB JSON limit; oversized captures retain the previous export and report an error. SavedVariables file uploads allow 20 MB so the persistent journal can be larger than the extracted JSON. Automatic companion synchronization is not included.

Captured where supported: equipment/links/quality/item level/count/durability/enchant fields and resolvable gem item IDs; individual bag slots and container metadata; dated personal bank cache; purchased talent ranks/IDs/max rank/tree totals; profession skills and cached known recipes; active quests/objectives and optional completed IDs; reputation, legacy skill lines and legacy known spell IDs; sex, bind location, max resource stats and location.

Not promised: bank layouts whose constants/APIs differ, other storage types, surname API, profession specializations, complete modern recipe reagents/yields, modern spellbook enumeration, dungeon/raid boss kills or achievements. Missing APIs are omitted/warned. Raw item-link gem enchant IDs are labeled separately from gem item IDs. Recipe required skill is omitted when the API doesn't supply it.

Caches are keyed by realm + GUID in account-level SavedVariables; name+realm is a fallback when GUID is absent. Only the active character cache is exported. Legacy recipe SavedVariables migrate once per character. Caches are additive; unlearning a profession may require cache reconciliation in a later version. Avoid manually editing or copying caches between accounts.

## Validation

Lua syntax/execution and modern/missing API branches are exercised by mocked Lua tests, including bank current/cached/empty/unavailable states and character isolation. Generated JSON passes the website importer, duplicate check, backup and cloud round trips. This version has not yet been run inside your Forever client; that acceptance test cannot be substituted by mocks. Keep your old addon backup until the first export is confirmed.

First in-game check: install 0.3.0, open bank and each profession, complete and turn in a quest, then `/reload`. Run `/farmory last`, or log out and upload the character SavedVariables file. Verify the quest journal and timestamp in the character's Progress page after import. Repeat next session to confirm history grows without duplicates.
