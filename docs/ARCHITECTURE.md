> October 2 Journal update: CONTENT-VERIFICATION.md and PVE-CONTENT.md are authoritative for current content policy. A shared evidence projection gates public instances, encounters, quests and loot; raw registry IDs remain available for private compatibility. Older release descriptions below are historical.

> October 1 navigation update: see [NAVIGATION.md](NAVIGATION.md) for current routes, shared shell, dashboard and search providers. Older community-status notes below are historical; the current community implementation and activation are preserved.

# Architecture and migration notes

## Application

Static ES modules, no production build dependency, GitHub Pages hash routing. `app.js` owns routing, active session state, dialogs, and saves. Items no longer own a second competing router. All URLs remain on `index.html#section/...`, including direct item and talent links, so refresh works under Pages and a repository subpath.

- `model.js`: existing snapshot identity, backup validation, character edits, history, account hierarchy.
- `character-data.js`: additive inventory, recipe, guild, statistics, and progress contract plus inventory query functions.
- `cloud.js`: existing Google session authentication, in-memory Firestore cache, revision-checked atomic persistence.
- `cloud-model.js`: cloud serialization and reconstruction; no display concerns.
- `features.js`: Armory sections, private guild views, profession/craftbook views, and available-data search.
- `items.js` / `item-core.js`: shared item lookup, evidence-gated Forever references, modal tooltips and permalinks. Character equipment, inventory, recipe items, dungeon loot, and search use the same detail view.
- `talents.js` / `data/talents`: calculator rules and existing community dataset. Builds save to the Armory rather than encoding new plans as generic goal notes. Older goal-note links still open.
- `data/items.js`: central reference item definitions.
- `data/pve.js`: non-destructive source registry with stable IDs and per-assertion evidence.
- `content-evidence.js`: public evidence/field projection; unknown and inherited-only records stay unpublished.
- `pve-data.js`: shared catalog lookups, item source indexing, search, and non-destructive encounter progress updates.
- `pve.js`: directory, instance and encounter views, private per-character boss tracking. `#pve/{instance}/{encounter}` is canonical; old `#dungeons/...` routes and `dungeons.js` exports remain compatible.
- `ads.js`: disabled placements; no ad network, remote script, or fake advertisements.

## Ownership and hierarchy

| Private path under `armories/{uid}` | Purpose |
| --- | --- |
| Root document | Revision and server timestamp |
| `records/s-{snapshot SHA256}` | Immutable character observation or large-snapshot manifest |
| `records/p-{snapshot SHA256}-{index}` | Private large-snapshot fragments |
| `records/t-{goal ID}` | Character goal |
| `records/a-{game account ID}` | Named game account |
| `records/g-{guild ID}` | Private guild planning record |
| `records/legacy-progress` | Existing Legacy plan |


Logical hierarchy is **website user → game accounts → characters → observations**. Snapshots remain keyed by the existing account/name/play-style identity for compatibility. Name/account corrections rekey all histories and goals together. A future immutable game GUID should be added as an alias/migration, not guessed from a name.

The deployed version-1 rules accept `snapshot` and `task` envelopes with `characterId` and serialized `payload`. Account (`@game-account`), Legacy (`@legacy-progress`), guild (`@guild`), and fragment (`@snapshot-part`) discriminators deliberately keep that protocol compatible. This avoids making a website deployment depend on a live Firestore schema/rules migration. These envelopes are decoded in one service; components do not parse them. Old clients do not understand guild envelopes: refresh old open tabs after upgrading. No automatic destructive database migration is performed.

Rules continue to allow only the matching Google-authenticated owner to read or write records. Users cannot list all armories, access another user's records, or publish arbitrary shared documents. An `officers` list in a private guild record confers **no security authority**. There is no public armory directory or cross-user guild membership yet. Future publishing should use sanitized public projections and server-validated membership, never expose this private record collection.

## Storage/privacy fixes

Previous item enhancement code captured imports before confirmation into global browser caches, outside Firebase session ownership. It is removed. Item discovery and inventory now derive from the active validated state; signed-in saves are memory + private Firestore only. Sign-out clears active state and closes item dialogs. Existing legacy caches are not read or deleted automatically; the original export/backup should be re-imported to bring that data into the new account flow. The optional local roster remains explicitly separate and unchanged by cloud sign-in.

## Provenance and limitations

- Existing Classic loot is a reference, never labeled confirmed Forever loot. Molten Core and Blackwing Lair now have full Classic boss rosters; Onyxia and Nefarian have selected sourced loot. Mechanics, quests, and loot coverage remain incomplete; no drop rates are implied.
- Talent ranks remain the existing video-derived beta dataset, with inferred values clearly labeled. Icons are existing project class/spell illustrations, not verified per-talent icons.
- Racial banners now use original geometric SVG pennants. The unlicensed Pinterest raster was removed.
- Private guild editing includes faction, description, recruitment, officers, ranks, and links to owned characters. Progress/events are typed import/backup hooks. Shared membership, invites, calendars, and public recruitment need a backend publishing design.
- Search covers available in-memory reference data, active characters, guilds, imported professions/recipes, and all nine talent datasets. Full remote Classic catalog search remains on Items. There is no claim of a complete Forever item/recipe database.
- Rich observations are snapshots. See [IMPORT-SCHEMA.md](IMPORT-SCHEMA.md) for size limits and freshness semantics.

## Validation

`npm test` covers models, migration/round trips, inventory filtering, partial captures, all class calculator rules, manual validation, and reference integrity. `npm run test:security` runs against the demo Firestore emulator, never the live project. Browser smoke and emulator sign-in checks are documented in [QA.md](QA.md). Production remains just `site/`; the existing Pages workflow runs tests and packages the addon before uploading it.

## Large snapshot protocol

Snapshots whose encoded envelope exceeds 170 KB are split by Unicode code point into 24,000-character chunks. Version-1 manifests store count, byte length, original snapshot hash ID, and an integrity checksum. Reading rejects missing, duplicate, orphaned, mixed or corrupt parts before accepting any state. The checksum detects accidental corruption; Firestore ownership is the security boundary. Limits remain 3 MB normalized snapshot, 128 parts, 180 KB record, and 450 changed records / 7 MB per atomic transaction. Small records remain compatible.

`cloud.js` diffs against the actual fetched document IDs, not regenerated hashes of normalized old data. Schema normalization therefore cannot leave old observations orphaned on save or deletion. Writes and deletions, including every fragment, share the existing revision transaction. No production rule expansion or data migration is required. Older clients must reload after the new format is written; they fail closed on unknown records.

Journal loot filtering, optional metadata and strategy fields are documented in [PVE-CONTENT.md](PVE-CONTENT.md). `pve-loot.js` enriches rows through the shared item service; item dialogs provide inverse Journal source links.
