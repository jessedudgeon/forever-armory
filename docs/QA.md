# October 2 — Journal evidence release

127 Node tests and 13 Firestore security scenarios pass. Journal, navigation, 25-flow smoke and emulator-backed community/guild suites pass. Journal coverage includes seven non-boss rewards using existing tooltips, evidence exclusions, ordering, conditional sections, private progress and mobile loot cards. Desktop/mobile screenshots were inspected. Smoke logged three failed external icon CDN requests; application flows completed with no page errors.

The separate Auth + Firestore browser test also passed emulated Google-provider sign-in, account/character creation and reload, 2,000-slot import/reload, guild persistence, sign-out clearing and second-user isolation. Its old `#account-header` status assertion was updated to `#account-status`, matching the existing navigation shell. No authentication implementation was changed. Real Google OAuth and production two-user acceptance are not claimed.

Reproduce the cloud test using the existing SDK-bundle instructions below. Local browser scripts use `PLAYWRIGHT_EXECUTABLE_PATH`; the guild script uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. CI uses its installed Playwright Chromium. Build/package/diff checks pass. See CONTENT-VERIFICATION.md for the separate game-content verification limits.

---

# Private observation / quest journal acceptance — September 30

105 Node tests pass, including 20,000 completed IDs, repeatable quest events, untimed backfill, page clamping/filtering, HTML escaping, zero reputation values and retained lookup indexes. All 12 existing security scenarios pass with unchanged rules. Production packaging and versioned site staging succeed.

The expanded Chromium suite passes 125-ID pagination/search/filter reset, reputation and GUID display, 390px mobile overflow checks, plus existing manual creation/import deduplication/inventory/talents and emulator-backed social/guild/RSVP checks. No application errors observed. Screenshot `/tmp/forever-quest-mobile.png` was visually inspected. No production records were written. Production sign-in/character loading and console configuration are verified by the owner; this run does not authenticate real Google accounts.

---

# Shared guild / social acceptance — September 30

The shared foundation adds 4 pure-model tests (101 total), a multi-user guild lifecycle/rules scenario (12 security scenarios total), and `npm run test:browser`. Security scenarios contain multiple positive and hostile assertions, including an ordinary Member RSVP regression for the Firestore per-write rule-read limit, concurrent last-seat claims, private access revocation and atomic leadership transfer.

The Chromium suite renders the production community modules and sends their operations through the real service to the emulator. It covers guild creation, invitation/acceptance, ordinary-member controls, roster filtering, RSVP capacity, pinned announcements, public story editing, relationships, follow/unfollow/counts, desktop/mobile layout, and application errors. It also opens the actual app in isolated example mode to verify manual character creation, stable explicit import linking, identical re-imports, captured inventory, existing reference/planner routes, and three desktop talent trees. The final run uses the checked-in npm lockfile. CI now runs this suite after installing Chromium.

No production user records or Firebase configuration were changed. Real Google OAuth, deployed rule/index state, enabled production UI, actual Forever client data collection, and full game-content verification remain separate acceptance gates. See [SHARED-GUILDS.md](SHARED-GUILDS.md) for scope, schema and deployment commands.

---

# Validation record — 2026-09-29

## Automated and browser checks

- 58 Node tests: existing imports/backups/accounts/Legacy and nine-class talent rules plus rich-field cloud/backup round trips, slot/count validation, inventory search and duplicates, partial bank capture, historical-import freshness, identity separation, Legacy-save regression, raid filtering, canonical encounter IDs/shared loot references, per-boss progress preservation, 2,000-slot fragment round trips/corruption/deletion, stored-ID migration, and local asset/module references.
- 7 Firestore emulator tests: matching Google owner access, other-user read/list/write/delete denial, signed-out/non-Google denial, forbidden account enumeration/public writes, revision checks and invalid payloads, private guild/account envelopes, large snapshot transaction and fragment isolation.
- Local Chromium UI smoke: home/navigation, account creation/status, faction-filtered character creation/editing, notes, confirmed import, inventory filters and item dialog, professions, manual encounter progress, guild creation/association, talent allocation/tooltips/save, raid filtering, shared dungeon/raid encounter detail routes, persisted boss checklists, raid item dialogs, unknown encounter handling, global character/talent search, item permalinks and refresh.
- Responsive checks at 390, 768, 1280, and 1440 pixels. Three talent trees share one row at desktop width. No page overflow, broken declared images, or JavaScript page errors. Screenshots inspected for talents, Armory, inventory, and mobile.
- Auth + Firestore browser emulators: Google-provider credential sign-in, account and character creation, persistence after reload, 2,000-slot inventory import and cloud reload, guild persistence, sign-out clearing, second-user isolation, and absence of private localStorage copies.
- Addon packaging and Git diff checks. No production build step is required; `site/` is the deployment artifact.

## Reproduce

```sh
npm install
npm test
npm run test:security
python3 scripts/package.py
```

Browser checks are optional development tooling, not a runtime dependency. Install Playwright locally (`npm install --no-save playwright`, then its Chromium browser), or use an environment with Playwright provided. `PLAYWRIGHT_EXECUTABLE_PATH` can point to an installed compatible Chromium binary. Both scripts start and stop their own local web server on port 4173; stop other servers on that port first.

```sh
node tests/browser/smoke.cjs
```

The smoke test intercepts Firebase configuration to exercise the local roster deterministically and supplies a tiny Classic catalog fixture. It does not claim to validate external catalog availability or live Google login.

To run the real Firebase SDK through local browser emulators, create a temporary SDK entry file exporting `firebase/app`, `firebase/auth`, and `firebase/firestore`, and bundle it with esbuild as a browser ES module. Set `FIREBASE_TEST_BUNDLE` to its path (default `/tmp/forever-sdk.js`).

```sh
firebase emulators:exec --project demo-forever-armory --only auth,firestore "node tests/browser/cloud.cjs"
```

The cloud test substitutes only a demo Firebase configuration, locally bundled SDK, and emulator endpoints through Playwright routing. Production files never acquire emulator shortcuts. It uses synthetic `example.test` identities and makes no calls to the live Firebase project. Session persistence remains the production service's real implementation.

## Not verified / next acceptance work

- Real Google OAuth popup and live deployed Firestore rule state require an owner sign-in on the deployed site. Existing configuration and ownership rules were retained; no production Firebase deployment was performed.
- External CDN/catalog outages are handled with local item fallback and cancelable dialogs; the environment's external Firebase CDN requests failed during an initial live-dependency smoke. Emulator tests establish application behavior, not third-party uptime.
- Companion addon execution inside the actual Forever client, bank API availability, per-slot observations, known recipe extraction, and encounter detection remain unverified. This session prepares the website and documents the import contract; it does not implement those addon collectors.
- Raid coverage is an initial, clearly labeled Classic reference directory. Full Classic Molten Core and Blackwing Lair rosters are present; additional instances, loot, quests, and verified Forever mechanics are needed. Existing inferred talent ranks still require client verification.
- Public armories, shared guild invitations/roles/events, combat logs, and a verified full Forever catalog are not implemented.
- Large cloud snapshots now use fragments up to 3 MB. Very large multi-character/history backups can still exceed the atomic 450-record / 7 MB change limit; they are rejected intact. A paginated history/archive strategy is future work.

## Journal continuation — 2026-09-29

- 60 Node tests passed, adding combined loot filters, unknown eligibility behavior, reverse sources, kill-count/timestamp validation, quest/attunement cloud round trips, and preservation through manual boss edits.
- 25 browser flows passed at 390/768/1280/1440, including instance loot search and item-dialog → encounter navigation. Instance loot tables and encounter routes passed responsive checks; no page errors, failed requests, broken images or document overflow.
- Addon packaging, JavaScript syntax and git diff checks passed. No Firebase rules/auth changes in this continuation; the previous commit's GitHub security/model validation succeeded.
- No verified new game facts were invented. Class filters intentionally retain unknown restrictions and do not establish equipment proficiency or upgrade value. Full catalogs, quest editing, tier-set relationships and live OAuth validation remain incomplete.


## October 1 — Journal progression after unified navigation

`npm test` passes 120 tests. `node tests/browser/smoke.cjs` passes 25 existing flows. `node tests/browser/navigation.cjs` passes shell/search acceptance. New `node tests/browser/journal.cjs` passes raid/dungeon/filter routes, quest search and ordered prerequisites, independent boss/clear persistence across reload, directory progress, character isolation, failed-save rollback and 320/390/768/1440px layouts without page errors/overflow. It uses synthetic local characters, never production accounts. Journal and navigation scripts both use port 4175; run them sequentially. Chromium may be supplied by `PLAYWRIGHT_EXECUTABLE_PATH`.

CI now runs the Journal script alongside unchanged community/Armory/security/addon suites. New history model checks include legacy version-1 payloads, overlap deduplication, omitted/empty history preservation, out-of-order conflicts, identity mismatch, timestamp/size constraints, cloud serialization and backup validation. These tests do not prove actual client event collection or live production OAuth.
