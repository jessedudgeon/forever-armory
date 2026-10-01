# Navigation and unified experience — October 1, 2026

## Audit and baseline

Started from production `f2e3f1361600fc0334005284f90a896c32608b60`. The remote main matched the local baseline. Validation run 36887450073 and Pages run 36887449921 succeeded. Live HTML served asset token `e0b0ca154485cab7` with a flat sidebar containing 17 destinations. Interactive production browser navigation timed out; HTTP/source audit succeeded.

Reviewed CHECKPOINT, ARMORY-OBSERVATIONS, ARCHITECTURE, LIVE-COMMUNITY-ACCEPTANCE, PVE-CONTENT, QA and recent commits. No TODO file exists. Older documents describe community as unmerged/disabled; those statements are historical, not a reason to turn off the owner's now-active community. This milestone does not change the community gate or claim fresh live two-user acceptance.

Recovered an unfinished local navigation draft on the same production baseline and completed it in a separate checkout. Separate uncommitted Dungeon/Raid Journal expansion work was not mixed into this release. The production combined Journal already supports both kinds, instance/encounter detail, loot and private tracking.

## Feature map and discoverability

| Area | Existing features and destinations | New entry points |
| --- | --- | --- |
| Home | Public references; owner's character collection, observations, calendar | Public start page or personal dashboard; real recent imports, private plans, per-character invitations and guild shortcut; community/feed links |
| Game Guide | `#pve`, `#items`; instance and boss detail | `#game-guide` hub, filtered `#pve/dungeons` and `#pve/raids`, Game Guide breadcrumbs, instance section shortcuts |
| Characters | `#roster`, `#character/{id}`, `#professions`, `#journal`, `#legacy` | Grouped menu, `#roster/history`, URL-backed character tabs, retained empty tabs so functionality remains discoverable |
| Community | `#community`, `/feed`, `/following`, `/publish`, `/guilds`, `/guild-{id}`, `/{publicId}` | `#community-home` hub, separate directory/feed/guild links, guild roster/feed/events section shortcuts |
| Tools | `#talents`, `#storage`, `#guide`, `#events`, `#activity`, `#guilds` | `#tools` hub; private planning tools clearly distinguished from shared community |
| Account | Google session, account settings, WoW accounts, import/export | Separate desktop/mobile account menu with direct WoW account and import/history access, sign-out button |
| Search | Available items, characters, private guild plans, recipes, professions, talents, Journal quests/bosses/instances | Shared search entry, grouped results, reloadable query URL, zone reference links, private quest observations, paginated public character/guild providers |

Equipment, talents, reputation observations, quests, professions, progression and stories remain on existing character pages rather than duplicate pages. Shared posts remain within profile/feed pages; shared events remain in guild pages. Empty classes/races/zones/achievements/spells/mount catalogs are not exposed. Extend the centralized navigation definition and hub content when real content is available.

## Shell and routing

Static ES modules and GitHub Pages hash routing remain. `navigation.js` is the shared navigation definition, renderer, breadcrumbs and section-jump binder; `navigation.css` scopes the replacement header/mobile shell. Native details menus work with keyboards. The mobile dialog traps focus, closes on Escape, restores trigger focus, closes on navigation and switches off at desktop widths. Skip-to-content and active destination/section states are retained. Desktop and mobile use the same definitions. Footer includes reference/community/tools access and the fan-project notice.

Existing deep links remain valid, including `#dungeons/{instance}`. Character tabs use `#character/{encodedId}/{tab}` so browser Back and reload work. Unknown tabs fall back to Overview. Search uses `#search/{encodedQuery}`; pending search timers cannot hijack later navigation. User-provided names and search output are escaped.

## Search boundaries

Search reads active session data and existing static catalogs. Public providers reuse current community services and permissions: 20 profiles and 50 public guilds per page. One initial page may load for a entered query; further pages require the user's button. Partial failures preserve each successful provider's cursor, retain results and allow retry. The UI distinguishes loaded coverage from a complete public-directory scan. Results are capped at 100 with match totals; case/accent-insensitive token matching and duplicate suppression are shared in `search-model.js`.

This is client-side available-data search, not a server-side full-text index. It introduces no new collection, index, rule, public projection or automatic publication. Private account records are never sent as search queries. Public results are limited to existing public directory fields. Full remote Classic item search remains on Items. Zone hits link to existing instance references, not invented zone guides. There is no complete quest/zone/Forever item catalog.

## Verification and release boundary

Local validation: 115 Node tests, existing 25-flow browser smoke, targeted shell/search browser acceptance at 320/390/768/1100/1280/1440 pixels, asset-versioned build and addon packaging. Targeted tests cover hub navigation, mobile dialog/keyboard/focus, search reload/back, stale timers, provider pagination and partial error recovery. Desktop/mobile screenshots were inspected. Local Chromium came from the reputable npm distribution in an isolated temporary prefix after the Playwright download returned a corrupt archive; no project dependency changes.

CI now runs navigation and existing smoke checks alongside the existing emulator-backed community/Armory suite, security suite and Lua collector round trip. These are test-only fixtures, not live production writes. Authentication, cloud/import models, addon sources, Firestore collections/rules/indexes and community activation are unchanged.

Fresh real Google OAuth/two-user production acceptance is not claimed. Release status is recorded separately in CHECKPOINT. Rollback is a frontend commit revert through the existing Pages workflow; no data migration or Firebase console action is required.
