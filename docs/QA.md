# Validation record — 2026-09-28

## Automated and browser checks

- 52 Node tests: existing imports/backups/accounts/Legacy and nine-class talent rules plus rich-field cloud/backup round trips, slot/count validation, inventory search and duplicates, partial bank capture, historical-import freshness, identity separation, Legacy-save regression, raid filtering, and local asset/module references.
- 6 Firestore emulator tests: matching Google owner access, other-user read/list/write/delete denial, signed-out/non-Google denial, forbidden account enumeration/public writes, revision checks and invalid payloads, private guild/account envelopes.
- Local Chromium UI smoke: home/navigation, account creation/status, faction-filtered character creation/editing, notes, confirmed import, inventory filters and item dialog, professions, manual encounter progress, guild creation/association, talent allocation/tooltips/save, raid filtering, shared dungeon loot details, global character/talent search, item permalinks and refresh.
- Responsive checks at 390, 768, 1280, and 1440 pixels. Three talent trees share one row at desktop width. No page overflow, broken declared images, or JavaScript page errors. Screenshots inspected for talents, Armory, inventory, and mobile.
- Auth + Firestore browser emulators: Google-provider credential sign-in, account and character creation, persistence after reload, guild persistence, sign-out clearing, second-user isolation, and absence of private localStorage copies.
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
- Raid coverage is an initial, clearly labeled Classic reference directory. More bosses, loot, quests, and verified Forever mechanics are needed. Existing inferred talent ranks still require client verification.
- Public armories, shared guild invitations/roles/events, combat logs, and a verified full Forever catalog are not implemented.
- Cloud snapshot size remains capped at 180 KB under the existing wire protocol; larger inventories need document chunking before raising that limit.
