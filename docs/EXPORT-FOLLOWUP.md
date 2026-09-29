# Raw addon export follow-up — September 29, 2026

The website backup supplied by the owner passed the updated backup validator, exact character-history preservation, duplicate-safe restore, and cloud record round trip. Custom Forever equipment IDs survived unchanged. The backup contains two snapshots, equipment, professions, and text talent ranks. The private backup is not committed to this repository.

## Deferred pending tonight's raw `/farmory` export

- Compare the raw addon payload with the website-normalized snapshot to identify fields the older website discarded versus fields the addon never collected.
- Verify bag/backpack container IDs, slots, stack quantities and coverage flags. Determine the changes needed for complete inventory collection.
- Verify bank/additional storage availability and capture behavior. A bank capture will require opening the bank in game; lack of capture must not erase earlier bank contents.
- Verify recipe scanning/output and reagent/crafted-item mappings. The backup reports no scanned recipes; inspect raw output after opening each profession and using the installed addon's recipe scan command, if supported.
- Check actual first/last-name and play-style API output. The backup has a single name and legacy realm text; do not invent a surname or silently remap identity/history.
- Inspect structured talent output and map captured ranks to the calculator only when node identity is reliable.
- Check which reputation, quest, achievement, boss kill and attunement APIs are available. Determine collector changes from actual client behavior; missing data is not zero progress.
- Check item links, enchants, durability and available statistics before promising complete item-instance detail.

## What to provide

Paste or upload the raw addon export directly, before importing it into the website. Keep the existing backup as a recovery copy. If feasible, capture once with ordinary bags, once with the bank open, and after scanning professions. A new export without those extra captures is still useful.

## Not blocked by the export, but still unfinished

Verified full Forever item/talent/encounter/quest datasets; complete equipment eligibility and upgrade scoring; shared guild/public Armory publishing; large-history pagination; tier-set relationships; manual quest/attunement editing; live Google OAuth owner acceptance. These are separate backlog items, not reasons to withhold the implemented website release.

## Release boundaries

This release deploys the tested website changes through GitHub Pages. It does not deploy new Firebase rules, change credentials, replace private data, or claim new addon collectors are complete. Refresh old open website tabs after deployment so they understand the new snapshot fragment format.
