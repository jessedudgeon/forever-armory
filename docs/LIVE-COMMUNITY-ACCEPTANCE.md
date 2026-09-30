# Live community release acceptance

## Verified September 30, 2026

- PR #7 remains draft/open, unmerged, mergeable; reviewed head `fe1f8478bd1972c5c242d279277ae9b159cf7ab7`, base `8b22cb9f6f93953b8ca78860575ac59cd584c62f`.
- GitHub Actions run 36728366990 completed successfully: dependency install, JavaScript syntax, 105 model tests, security suite, Chromium UI suite, Lua collector round trip and addon packaging.
- The three lookup fields retain automatic indexing: `records.characterId`, `records.kind`, `communityOwners.characterKey`. No changes to rules, data contracts or activation in this release-preparation increment.
- Production rules/indexes and existing Google sign-in/character loading were previously confirmed by the owner. These are not fresh live two-user acceptance results.
- Continuation check September 30: terminal restored; head `da5b2f7` passed GitHub Actions run 36757198949. Browser inventory responded but opening the live site timed out. Firebase CLI reports no authorized accounts and project listing fails authentication. Current deployed asset identity and live acceptance remain unverified.
- No production writes, merge, deployment, or community activation performed.

## Build preparation

PR validation now executes the same `scripts/build-site.py` staging command as Pages, after addon packaging. It uploads the exact `.pages-dist` output as `forever-pages-candidate` for seven days. This is a review artifact, not a hosted preview or deployment. Pages retains its existing main-branch workflow. Build artifacts contain only public site assets and the packaged addon; no private character exports or credentials.

## Required live acceptance environment

Use an authorized staging Firebase project and a staging frontend running this PR's exact revision. Configure its existing Google provider and authorized frontend domain; deploy this revision's rules and indexes there. Do not create a staging project, enable billing or rotate credentials implicitly. Record its project ID, frontend URL, tested commit and index readiness before testing. Keep production `communityConfig/status.enabled` absent or false.

Use two consenting Google test users in separate browser profiles plus a signed-out window. Each creates clearly labeled test characters. User B should have two test characters to verify independent alts. Never copy production character exports into staging. Enable community only in staging for these tests using authorized administrative access.

## Live test record (all pending)

| Check | Expected result |
| --- | --- |
| Google login and reload for A/B | Each sees only their own private accounts, characters and observations after reload. |
| Publish A and B profiles | Explicit preview matches public content; signed-out reader sees only published fields, no Google UID/account/alt grouping/raw inventory. |
| Public/private story separation | Editing public story does not alter private notes; importing a repeated snapshot does not overwrite stories or duplicate characters. |
| Posts | A/B create and edit own IC/OOC/journal posts; reload preserves them. Cross-owner writes fail, not just hidden UI controls. |
| Follow/unfollow | A follows B, reloads, repeats follow, then unfollows. Reciprocal edges and aggregate count remain consistent without duplicate count. |
| Public guild | A creates guild; B receives invitation, declines, receives another, accepts. Roster contains characters with correct ranks. |
| Independent alt | B's second character requires its own invitation and acceptance; leaving on one character does not remove the other. |
| Private guild | Signed-out and uninvited users cannot read it. Invited characters may review it as documented. Declining or leaving revokes access after a server read/reload. |
| Role enforcement | Member cannot edit settings, invite, pin announcements or create events. Promotion to officer enables authorized actions. Demotion removes authority. |
| Leadership | Only master can transfer leadership atomically; master must transfer before leaving. Reload confirms one master and matching membership. |
| Event RSVPs | Going/Maybe/Declined persist per character. Repeating Going does not increment twice. Two users competing for one remaining seat yield one accepted Going. |
| Cancellation and reopening | Cancelled event rejects RSVP changes; reopened event accepts authorized responses. |
| Unpublish | Public projection and associated post reads become unavailable; private Armory remains intact and guild management remains available to the owner. |
| Browser/device | Desktop and mobile layouts, navigation/reload, loading/error recovery and console show no application failures. |
| Staging kill switch | Setting enabled false blocks new shared writes/public reads while private Armory access continues. |

Record pass/fail, time, revision and non-secret evidence for each row. Do not store tokens, user emails or private exports in repository evidence. Emulator results do not substitute for these checks.

## Release and rollback

1. Resolve failures and rerun affected tests; CI must pass on the intended head revision.
2. Review live staging acceptance before merging PR #7. Do not mark blocked rows passed.
3. Merge the reviewed revision using the existing repository workflow. Observe Pages deployment success and verify the served revision with community still disabled.
4. Confirm existing production Google sign-in and private reads/writes. Verify deployed rules/indexes against the repository, preserving lookup indexing.
5. Only after acceptance, enable production community through an authorized Firebase admin. Do not auto-publish any character.
6. If shared behavior fails, set the production gate false, retain data, and investigate. Do not delete community records or revert ownership rules to broad access. Frontend rollback uses the existing Git workflow and a reviewed compatible revision.

Remaining prerequisites: authorized staging Firebase access, a staging frontend, a working interactive browser and two real Google test sessions. No production console changes are required by the build-preparation commit itself.

## Prepare the isolated staging candidate

Use the existing staging project's Firebase **web app config**, saved as JSON outside the repository. Do not provide a service-account key or access token. If there is no staging project yet, agree its creation with the owner first.

```sh
python3 scripts/package.py
python3 scripts/build-staging.py --firebase-config /absolute/path/staging-web-config.json
```

The builder creates `.staging-dist`, leaves production source and `.pages-dist` untouched, rejects the production project/auth domain and unknown configuration fields, removes the production CNAME, and adds a crawler exclusion and a non-secret revision/project/asset manifest. Crawler exclusion is not access control. Review `staging-manifest.json`; `workingTreeModified` must be false for revision-specific acceptance. Build again from the final committed revision before hosting.

Host this directory on the agreed staging origin using the owner's authorized hosting setup; authorize that origin in the staging Google provider configuration. This build command does not create projects, enable billing, deploy hosting/rules/indexes, sign anyone in, or enable community. Deploy the existing rules/indexes explicitly to the staging project and verify readiness before following the test matrix above. Production keeps its existing Pages workflow and closed community gate.
