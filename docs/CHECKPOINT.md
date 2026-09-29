# Latest checkpoint — staged character community, September 29

Continued from `ca2d99f`; existing private events, social authoring and reference/Armory systems preserved.

- Completed: opt-in public profile projection/preview, stable private ownership claims, directory, independent public post creation/editing, following/unfollowing as a character, chronological paginated feeds, appreciation reactions and unpublishing. Website integration is ready for Pages deployment; shared functionality remains disabled in production.
- Fixed: asynchronous feed retries now restore all source cursors after failures, without losing posts; actor switching is disabled during loading/writes; public IDs survive private edits/renames; private character removal requires unpublishing.
- Security: separate narrowly validated shared collections, immutable Google owner claims, no public UID/account/alt/secrets/inventory projection, forged author/reaction/follow rejection, unpublish read denial, admin-only availability switch. Existing private rules unchanged. Rules/indexes committed, **not deployed**: Firebase authentication unavailable.
- Tests: 82 application/model/release tests and 10 Firestore emulator tests passed; actual shared service tested with two users and anonymous readers. Addon packaging, versioned Pages build, syntax and diff checks passed. Enabled community browser flows and production OAuth remain pending activation/staging access.
- Still incomplete: character guild invitations/shared roles, guild feeds/shared scheduling, relationships/guestbook/gallery, moderation/reporting/blocking, complete following-list pagination and shared-data export/erasure. Current feed includes first 20 follows, explicitly labeled.
- Export blocked: inventory/bank/recipes/talent/progress collector verification remains in EXPORT-FOLLOWUP.md; unrelated website work continued.
- Next highest priority: deploy/verify shared rules in staging, complete enabled UI acceptance and launch controls, then character-specific guild invitations with recipient acceptance and authoritative membership.
- Important files: site/community-model.js, community-service.js, community.js; site/app.js, cloud.js, social-model.js, social.js, index.html, expansion.css; firestore.rules/indexes.json; tests/community.test.mjs, tests/security/community.test.mjs; docs/COMMUNITY.md, SOCIAL-ARCHITECTURE.md and this checkpoint.
- Existing untracked site/assets/race-banners.jpg preserved and excluded. No character backup or generated files added.

| Area | Current status |
|---|---|
| Accounts/characters, private persistence, Armory | Working core; production Google acceptance remains |
| Inventory/items/talents/professions/PvE Journal | Working foundations; verified data and collector coverage partial |
| Private RP stories and event planning | Complete core; shared counterparts separate |
| Public profiles/posts/following/reactions | Implemented and emulator-tested; activation and browser acceptance blocked |
| Shared guild membership/feed/events, RP relationships | Not started |
| Raw addon verification | Waiting on raw export |

---

# Latest checkpoint — character event planning, September 29

Continued from live commit `513ad0c`; preserved the private RP/story release and all prior reference/Armory work.

- Completed this continuation: private event creation/editing, raid/dungeon/RP/social/PvP/custom types, character hosts, optional guild plan and shared Journal links, UTC times with local display, character RSVPs with roles/notes, capacity enforcement, cancel/complete/reopen, private calendar export, guild event cards and completed-event character history.
- Data changes: separate event/RSVP cloud records and additive backup collections; rename/delete handling keeps references valid; addon imports cannot overwrite plans.
- Validation: 76 application/model/release tests and 9 Firestore emulator tests pass, including actual event/RSVP save/read and denied cross-owner access. Packaging, syntax and diff checks pass. Pages and validation workflows for release 21a40f7 succeeded. Live event creation was verified; remaining browser checks are limited as described below.
- Blocked by access: Firebase CLI reports no authenticated deployment session. Public profiles, cross-user feeds/following, shared guild invites/memberships and remote RSVPs cannot be enabled safely without the new shared authorization layer and its deployment.
- Blocked by raw export: inventory/bank/recipes/talents/progress collector verification remains listed in EXPORT-FOLLOWUP.md; it did not block event development.
- Incomplete: public social/guild platform, portraits/gallery, relationships/guestbook/reactions, shared scheduling, full verified Forever datasets. Private events are not presented as a shared calendar.
- Known limits: local DST fall-back ambiguity (browser chooses first repeated hour); full owner collections still load together; large restore limits remain. Existing untracked race-banners.jpg is excluded, untouched.
- Next highest priority: obtain authenticated Firebase deployment access, then implement stable public character identities and opt-in audience projections, followed by character-specific guild invitations. See SOCIAL-ARCHITECTURE.md and EVENTS.md.
- Files: site/event-model.js, site/events.js, site/model.js, site/cloud-model.js, site/app.js, site/features.js, site/index.html, site/expansion.css, tests/events.test.mjs, tests/security/firestore.test.mjs, docs/EVENTS.md.

## Event release acceptance and limitations

Release `21a40f7` deployed successfully. The production browser loaded Events & gatherings, opened the form, selected Dungeon → Shadowfang Keep, and created a dated event with capacity, location and preparation notes in the isolated example roster. The resulting event card displayed the correct host, time and attendance count. No private user data was changed.

The browser service then timed out opening the event; documentation and reset calls also timed out. Stop repeating browser recovery attempts. Event detail interaction, live RSVP/capacity/cancel/complete/reopen/calendar-download, new mobile layout and production Google login remain browser-acceptance tasks for the next session. These model operations and real Firestore emulator save/read/isolation passed automated tests (76 application/release + 9 security). The production homepage was also retrieved over HTTP after deployment and checked for versioned assets and event navigation. No application failure was observed before the browser service failure.

## Current requirement status

| Area | Status |
|---|---|
| Google auth, accounts → characters, private persistence | Core complete; production login acceptance still pending |
| Armory, inventory, professions, talent calculator, shared dungeon/raid Journal | Working foundations; game content/collector coverage partial |
| RP profiles, IC/OOC journal, private main/alt links | Private authoring complete; sharing not started |
| Guild roster and event planning, character RSVPs/history | Private foundation complete; shared membership/calendar not started |
| Public character directory, following, invites, social relationships | Not started; requires shared authorization deployment |
| Addon import and complete verified game datasets | Partial; raw export / authoritative game data pending |

---

# Latest checkpoint — character storytelling, September 29

The prior reference/Armory release was merged as `9ba3ca9` (PR #6); Pages deployment succeeded and the production homepage was verified. This continuation adds private character storytelling from the new social-platform brief.

- Completed: optional RP profiles, private IC/OOC and other journal entries with editing, character-filtered owner feed, story display alongside history, private main/alt links, rename/delete migration, additive backup/cloud persistence.
- Security: unchanged owner-only Firestore rules; 8 emulator tests pass, including new profile/post cross-owner denial tests. No public publishing or new database access granted.
- Tests: 68 Node tests pass; addon packaging and syntax/diff checks pass. Cloud browser cannot reach localhost (`ERR_BLOCKED_BY_CLIENT`); live UI verification completed after publishing (details below). Prior responsive smoke is recorded below and must not be confused with new social UI coverage.
- Incomplete: cross-user profiles/posts/following, character guild invitations, shared guild hub, events/RSVPs, mutual relationships, guestbooks/reactions and media. Next highest-value task is stable public character IDs plus opt-in profile projection and tested audience authorization; see SOCIAL-ARCHITECTURE.md.
- Export-blocked tasks: unchanged; see EXPORT-FOLLOWUP.md. Tonight's raw addon export is still needed for inventory/bank/recipe/talent/progress collector verification, not for RP authoring.
- Files: site/social-model.js, site/social.js, site/model.js, site/cloud-model.js, site/app.js, site/index.html, site/expansion.css, tests/social.test.mjs, tests/security/firestore.test.mjs, docs/SOCIAL-ARCHITECTURE.md.
- Production QA also caught encoded route IDs reaching the social writer; binding now uses the resolved character ID.
- Production QA found stale module caching after deploy. Added scripts/build-site.py and a release graph test; Pages now uploads .pages-dist with content-versioned JS/CSS URLs. Sources stay unchanged.
- Existing untracked `site/assets/race-banners.jpg` was not introduced by this change and is excluded from the release.

## Production verification

Release `d4b5814` is deployed; both Pages and validation workflows succeeded. Live example-roster tests passed for RP profile saving, main/alt association, IC and OOC entry creation, entry editing, feed filtering and history reuse. Desktop (1348px) feed has no horizontal overflow or broken images. No application error appeared in the inspected console entries; browser-extension metadata errors are external to the site. Production Google sign-in and new mobile social layout remain unverified; prior emulator/auth and responsive checks are recorded separately. No production user records were written during QA.

## Next task

Build immutable opt-in public character identities and separately authorized profile projections, followed by character-to-character guild invitations. Keep owner records private. The raw addon export is a separate follow-up; no addon update was required for this private storytelling release.

---

# Resume checkpoint — 2026-09-29

Branch: `codex/armory-reference-expansion` · PR: https://github.com/jessedudgeon/forever-armory/pull/6

This work extends the prior Journal/storage commit `5563543`; do not restart the audit. The owner authorized merging and production deployment on September 29; GitHub PR/Actions status is authoritative for release completion. Firebase production rules/configuration were not changed; the rule comment documents the existing private envelope policy.

## Completed this resumed session (continuation from `5563543`)

- Confirmed clean repository and successful CI for the previous commit; retained all prior account/Armory/inventory work.
- Expanded the shared dungeon/raid content contract with access, preparation, group size, lockout, wings, strategy/role notes, quest links, and licensed local artwork hooks. Unknown game facts remain explicitly unknown.
- Moved item definitions into `data/items.js`; added Journal loot filtering through the existing item catalog service, character class selection, and inverse item → boss → instance navigation.
- Added optional imported kill counts/timestamps, quest completion and attunement progress; displayed them on the Armory and preserved them through manual boss edits/cloud round trips.
- Added content-contract documentation and focused filtering/history tests. No Firebase rule or authentication changes.
- Passed 60 Node tests and 25 Chromium browser flows at 390/768/1280/1440, including loot search, inverse source links, and responsive instance/encounter pages. No page errors, failed requests, broken images or overflow in these checks. Packaging and diff checks passed. The previous commit’s GitHub model/security CI was also confirmed successful.

## Master priority status

“Foundation complete” describes implemented infrastructure, not exhaustive verified game content.

| Priority | Status / remaining scope |
| --- | --- |
| Account → character | Foundation complete: multiple accounts, two names, play style, valid manual race/class choices, persistence; immutable addon GUID migration remains future work |
| Armory | Core complete: equipment, inventory, crafts, builds, progress, notes/history; live imported statistics coverage depends on addon |
| Complete inventory | Model/UI/cloud foundation complete; collector coverage and large-history pagination remain |
| Item database/tooltips | Shared foundation complete; verified Forever stats/effects/sources and full catalog remain partial |
| Talents | Functional three-tree calculator/build saving; inferred beta ranks/icons need game verification |
| PvE Journal | Shared architecture, metadata hooks, loot filters and cross-links implemented; verified loot/mechanics/quest content remains partial |
| Professions | Character crafts/reagents and import model complete; complete recipe catalog/unknown comparisons partial |
| Guilds | Private planning and owned-character roster complete; cross-user membership/invites/public recruitment not started |
| Legacy accounts | Multi-account model/status/perk plans complete; future verified perks/status need data |
| Search | Available-data unified search complete; remote/public indices not started |
| Navigation / UX | Connected responsive tools complete; ongoing refinement remains |
| Visuals | Armory/banner/tooltips/talent layout improved; full verified race/talent art remains |
| Firebase/security | Owner isolation and revisions tested; live OAuth and deployed rules still require production acceptance |
| Addon import boundary | Documented, validated shared snapshot interface complete; full in-game collectors outside this website session |
| Ads | Disabled reusable slots complete; provider integration intentionally not started |

## Known limitations and highest-value next work

1. **Next highest priority:** verify the addon contract against real Forever exports and populate authoritative item/talent/encounter data. Preserve provenance; never substitute Classic assumptions for Forever facts.
2. Prepare sanitized public Armory projections and server-validated shared guild roles/invites. Current guild officer fields confer no access rights.
3. Add paginated inventory/history and import preview summaries before supporting much larger histories. Atomic saves deliberately cap at 450 records / 7 MB; snapshots cap at 3 MB, raw imports at 1 MB. Old open tabs must refresh after fragment records are introduced.
4. Validate real Google OAuth on the deployed origin and verify production Firestore rules. Emulators prove application behavior, not live provider configuration. No production database writes were made.
5. No verified full Forever catalog, combat logs, complete recipe database, or automatic bank/recipe/encounter addon collectors yet.

## Relevant changed files this continuation

- `site/data/items.js`, `site/data/pve.js`, `site/pve-data.js`, `site/pve.js`, new `site/pve-loot.js`.
- `site/items.js`, `site/item-core.js`, `site/character-data.js`, `site/features.js`, `site/expansion.css`.
- `tests/pve.test.mjs`, `tests/browser/smoke.cjs`; `docs/PVE-CONTENT.md`, `IMPORT-SCHEMA.md`, `ARCHITECTURE.md`, `QA.md`, this checkpoint.

Class filtering uses explicit restrictions only; unknown restrictions remain visible. It does not infer trained weapon/armor proficiency or calculate upgrades. Metadata hooks are not a populated strategy/quest database. Manual editing of quest/attunement details, tier-set relationships, public/community features, and full addon collectors remain incomplete.

Reproduce with `npm test`, `npm run test:security`, `python3 scripts/package.py`; browser setup is in `QA.md`. The site remains static GitHub Pages with hash routes.

## Production release handoff

Owner requested deploying all implemented changes. See [EXPORT-FOLLOWUP.md](EXPORT-FOLLOWUP.md) for the explicit tasks deferred until the raw addon export arrives tonight, separate from the broader unfinished backlog. The supplied website backup passed compatibility checks without edits or production writes.
