# AutoBiographer character history

Install AutoBiographer, enable it for the character, play, and log out normally. In Forever, open **Import & backups → Import character**, then choose:

`WTF/Account/<account>/<realm>/<character>/SavedVariables/AutoBiographer.lua`

Choose the existing character and review the new-event count before saving. If needed, first add a character manually or import `/farmory`. The per-character file supplies a GUID but does not reliably supply a full character name/class/realm, so initial matching is explicit. Subsequent imports validate the GUID. The account-wide AutoBiographer file is not a character export.

Open **Activity & history** to search/filter the recorded timeline. Expand milestones for equipment, talent and skill tables, and raw observations including attributes, money, playtime, enchantments, collection times and incomplete flags. Per-level statistics and catalogs are retained privately. Unknown event types remain visible with their raw fields. Repeated identical events retain occurrence counts; repeat imports merge without duplicates. Old imports retain already imported events and completed snapshot sections.

This is a history integration, not a live game-folder watcher. Upload after sessions. Current Armory equipment, inventory, money and other fields retain their original observation date; a historical milestone does not overwrite them. ForeverArmory exports remain supported for those current-state observations, bags, bank and recipes. AutoBiographer records only while enabled, and recorded coverage depends on its settings and version. It cannot reconstruct every change or earlier unrecorded play. Addon notes and todos are not imported as website RP content.

## Implementation and verification

Schema inspected against upstream [AutoBiographer](https://github.com/AaronV-T/AutoBiographer) version 5.0.0, commit `8890054dfa0a48fafaf4746006d86c777ac2de7b` (Interface 16001). References: AutoBiographer.toc, Main.lua initialization, Classes/Event.lua, Classes/GearHistory.lua, SnapshotManager.lua and Enum.lua.

SavedVariables are parsed as literals only, never executed. Executable expressions, unsafe object keys, duplicate assignments, excessive nesting and truncated input fail before saving. Input limit: 20 MB; retained history limit: 2 MB and 50,000 events. Exceeding limits produces an error, never silent truncation. Existing local-storage and cloud limits also apply, with failed persistence reported by the existing commit flow. Keep the original saved file.

The normalized `autobiography` field passes through existing private snapshots and owner-scoped cloud serialization. No new Firestore permissions, public projections, automatic community posts, external upload service, or addon modifications.

Tests use synthetic fixtures matching upstream field names and shapes, including event duplicates, partial milestones, GUID conflicts, non-executing Lua parsing, UTF-8 escapes, backup/cloud round trips and HTML escaping. The implementation has not been exercised with the owner's real file or inside the game. Browser QA was unavailable in this execution environment.
