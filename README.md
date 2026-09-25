# Forever — Dudgeon’s personal armory

Static, dependency-free WoW Forever character tracker for **forever.dudgeon.io**, deployed on GitHub Pages.

## Features
- Character roster and detail pages; equipment, talents, professions, XP, gold and location when present in the export.
- Imports the included `/farmory` JSON format and the verified `WFB1` format from WoW Forever Builds `/wfb`.
- Review before import, dated snapshots, level history, gear changes, manual character updates.
- Per-character adventure goals with completion, editing and notes.
- Browser-local storage, downloadable JSON backups and merge-based restore.
- Explicit sample-data mode, isolated from the real roster. No invented live character data.
- Responsive layout, keyboard navigation, native dialogs, escaped user text; no third-party scripts, tracking or credentials.

## Data model and limitations
This is a **device-local personal tracker**, not a public character database or automatically synced armory. GitHub Pages serves the application, while each visitor’s data remains in their browser’s localStorage. Back up regularly, particularly before clearing site data or changing domains. Browser storage does not travel between the GitHub Pages URL and the custom domain.

The application never connects to Blizzard or uploads character data. Snapshots are keyed by case-insensitive character name plus realm. Use the precise realm name consistently; distinguish beta/live or regions in the realm field if necessary. No retroactive history is available. Identical consecutive snapshots are deduplicated. Each import reflects only the fields it contains; a basic WFB import does not pretend to refresh prior equipment. Older gear remains in earlier snapshots but the current gear view shows the latest snapshot only. Manual updates explicitly mark carried-forward equipment/talents/gold.

The companion addon is a **beta implementation, not yet tested inside the actual Forever client**. Interface 16001 targets the current beta; a later game version may need a TOC update. Unsupported APIs produce export warnings where detectable. Item names can appear as item IDs until cached; export again after opening the character sheet. Talent capture supports the modern trait tree with a legacy fallback, but does not recreate the graphical talent tree. Use `/wfb` as a basic-data alternative if the companion fails. MythicSim formats are not supported yet.

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

Log into each character and run `/farmory` outside combat. Copy the text and paste it into Import character. Review the name, realm, level, and equipment count; save the snapshot.

## Export schema
```json
{"format":"forever-armory","version":1,"character":{"name":"Example","realm":"Example Realm","class":"PALADIN","race":"Undead","faction":"Horde","level":13,"xp":1000,"xpMax":10000,"money":12345,"zone":"Tirisfal Glades","professions":[{"name":"Mining","rank":25,"max":75}],"gear":[{"slot":16,"id":123,"name":"Example weapon","quality":2}],"talents":[{"name":"Example talent","rank":2}],"observedAt":"2026-09-25T14:00:00Z","warnings":[]}}
```
Money is copper, inventory slots use WoW slot numbers 1–19. Missing optional fields remain unavailable instead of becoming zero. Item links preserve enchants/suffixes for change detection. Imported strings are rendered as text, never interpreted as markup or executed. No Lua is evaluated by the site.

## Validation
`npm test` covers the WFB and companion formats, invalid inputs, chronological snapshots, duplicate detection, backup merging, and cross-character history validation. Browser checks cover core import and journal flows. In-game addon verification is a separate remaining acceptance step.

Optional WebMCP tools list the local roster or stage an import for human review; neither uploads data nor saves without the visible confirmation step.
