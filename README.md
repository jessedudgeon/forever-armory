# Forever — Armory and reference companion

Static WoW Forever character tracker for **forever.dudgeon.io**, deployed on GitHub Pages.

## Features
- Character roster and detail pages; equipment, talents, professions, XP, gold and location when present in the export.
- Imports the included `/farmory` JSON format and the verified `WFB1` format from WoW Forever Builds `/wfb`.
- Review before import, dated snapshots, level history, gear changes, manual character updates.
- Per-character adventure goals with completion, editing and notes.
- Browser-local storage, downloadable JSON backups and merge-based restore.
- Explicit sample-data mode, isolated from the real roster. No invented live character data.
- Responsive layout, keyboard navigation, native dialogs, escaped user text; no advertising or analytics SDK; Firebase handles Google sign-in.

## WoW game accounts and Legacy
A Google sign-in can contain multiple manually named WoW game accounts. Characters belong to one game account; names can repeat across accounts. These accounts are assumed to be WoW licenses under **one Battle.net account**. Blizzard shares the 65 Legacy Challenges and earned points across that Battle.net account, while each non-Hardcore character chooses its own perks (16 points spendable at launch). Hardcore progress is separate and is not tracked as a live pool yet.

The Legacy page records non-Hardcore challenges, infers class and profession milestones from snapshots, tracks planned perk ranks, and shows cosmetic reward thresholds. It does not connect to Blizzard or enforce unpublished perk rank caps/prerequisites. Old rosters and backups open under WoW 1; cloud records use the existing Firestore rules. Separate Battle.net identities must not be combined in one armory, since that would incorrectly pool their Legacy Points.

## Google accounts and cloud sync

The account-enabled version uses Firebase Authentication for Google sign-in and private Firestore records for each user. Setup and operating instructions: [Google sign-in setup](docs/GOOGLE-SIGNIN-SETUP.md). Accounts remain unavailable until the project configuration and ownership rules are deployed.

Local mode and backups remain supported. Cloud users explicitly choose whether to upload an existing local roster. No local records are uploaded automatically.

## Local mode and character-data limitations
Without signing in, this is a **device-local personal tracker**. GitHub Pages serves the application, while each visitor’s data remains in their browser’s localStorage. Back up regularly, particularly before clearing site data or changing domains. Browser storage does not travel between the GitHub Pages URL and the custom domain.

The application never connects to Blizzard. Signed-in users save their imported character data to their own Firebase account records; local-mode data stays in the browser. Snapshots initially use game account, full name and play style/server. Imported GUIDs anchor future renames to the existing profile URL; see [import identity rules](docs/IMPORT-SCHEMA.md). Legacy realm values remain readable internally for migration; forms use play style and two names. No retroactive history is available. Identical consecutive snapshots are deduplicated. Each import reflects only the fields it contains; a basic WFB import does not pretend to refresh prior equipment. Older gear remains in earlier snapshots but the current gear view shows the latest snapshot only. Manual updates explicitly mark carried-forward equipment/talents/gold.

The companion addon is a **beta implementation, not yet tested inside the actual Forever client**. Interface 16001 targets the current beta; a later game version may need a TOC update. Unsupported APIs produce export warnings where detectable. Item names can appear as item IDs until cached; export again after opening the character sheet. Talent capture supports the modern trait tree with a legacy fallback, but does not recreate the graphical talent tree. Use `/wfb` as a basic-data alternative if the companion fails. MythicSim formats are not supported yet.

See [addon 0.2 commands and acceptance limits](docs/ADDON-0.2.md). The importer preserves raw version-1 observations and supports cross-character item search.

## Run locally
Requires Node 20+ and Python 3 (only for addon packaging); no npm installation is needed.

```sh
python3 scripts/package.py
npm test
npm run dev -- --port 4173
```
Open http://localhost:4173. Production is simply the contents of `site/`.

## GitHub Pages deployment
1. Create a repository named **forever-armory** under **jessedudgeon**. Public is compatible with GitHub Free. No personal character exports need to be committed.
2. Upload this project, including `.github/workflows/pages.yml`, and commit to `main`.
3. Repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Run **Publish armory to GitHub Pages** under Actions if it has not already run after the push. The workflow tests the model, packages the addon, and publishes only `site/`.
5. In **Settings → Pages → Custom domain**, enter `forever.dudgeon.io` and save. With Actions publishing, the repository’s `site/CNAME` documents intent but does not replace this setting.
6. After adding the domain in GitHub, set Cloudflare DNS:

   | Type | Name | Target | Proxy | TTL |
   | --- | --- | --- | --- | --- |
   | CNAME | forever | jessedudgeon.github.io | DNS only (gray cloud) | Auto |

   Edit any existing conflicting `forever` record; do not alter unrelated records. Do not include `https://`, a repository path, or a trailing slash in the target.
7. Wait for GitHub’s DNS check and certificate, then enable **Enforce HTTPS**. DNS and certificate issuance can take up to 24 hours.

GitHub docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

Optional command-line upload after creating the empty repository:
```sh
git init -b main
git add .
git commit -m "Build personal Forever armory"
git remote add origin https://github.com/jessedudgeon/forever-armory.git
git push -u origin main
```

## Addon installation
Download `ForeverArmory.zip` from the site’s Import & backups page. Extract into your actual Forever game client’s `Interface/AddOns` directory, leaving `ForeverArmory/ForeverArmory.toc` directly inside it. Restart or reload the game. Enable the addon in the character-selection AddOns menu; if marked out of date, confirm the client version before enabling.

Addon 0.3.0 automatically saves an export at normal logout, exit or `/reload` and persists quest turn-ins across sessions. Upload the character's `SavedVariables/ForeverArmory.lua` to Import character after logout, or use `/farmory last` at next login. `/farmory` still captures a current snapshot outside combat. Review both names, play style, game account, level, and equipment count before saving. See [session export details](docs/ADDON-0.3.md).

## Export schema
```json
{"format":"forever-armory","version":1,"character":{"mainName":"Example","secondaryName":"Adventurer","playStyle":"Normal","class":"PALADIN","race":"Undead","faction":"Horde","level":13,"xp":1000,"xpMax":10000,"money":12345,"zone":"Tirisfal Glades","professions":[{"name":"Mining","rank":25,"max":75}],"gear":[{"slot":16,"id":123,"name":"Example weapon","quality":2}],"talents":[{"name":"Example talent","rank":2}],"observedAt":"2026-09-25T14:00:00Z","warnings":[]}}
```
Money is copper, inventory slots use WoW slot numbers 1–19. Missing optional fields remain unavailable instead of becoming zero. Item links preserve enchants/suffixes for change detection. Imported strings are rendered as text, never interpreted as markup or executed. No Lua is evaluated by the site.

## Validation
`npm test` covers the WFB and companion formats, invalid inputs, chronological snapshots, duplicate detection, backup merging, and cross-character history validation. Browser checks cover core import and journal flows. Cloud-record tests cover snapshot serialization, incremental writes, deletion boundaries, invalid data and oversized migrations. In-game addon verification is a separate remaining acceptance step.

Optional WebMCP tools list the local roster or stage an import for human review; neither uploads data nor saves without the visible confirmation step.

## Expanded Armory and reference tools
Inventory across captured storage locations, craftbooks, saved builds, statistics, notes, dungeon/raid progress, private guild planning, and unified search share the existing account/snapshot services. Items open in one click across loot, inventory, equipment, and recipes.

- [Architecture and privacy](docs/ARCHITECTURE.md)
- [Additive addon import contract](docs/IMPORT-SCHEMA.md)
- [Validation and remaining acceptance work](docs/QA.md)

Ads remain disabled. Public guild membership and full verified Forever datasets are future work.
