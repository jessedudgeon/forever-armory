# Private Armory observations — September 30, 2026

## Audited deployment and roadmap

The local branch and remote feature branch start at `5a1d95f`; fetched `origin/main` remains `8b22cb9`. Production HTML serves release token `d7c2478f349a0e6b`. Shared guild/profile work is on draft PR #7, not yet merged into the production website. The owner reports successful production Google sign-in/character loading, published updated rules, enabled `posts` composite index, and completed six text-field exemptions. These console facts are owner-verified, not a claim of authenticated administrative access from this workspace.

| Area | Existing state / remaining scope |
| --- | --- |
| Private characters/accounts/imports | Working hierarchy, stable GUID aliases, old format support, history, duplicate-safe imports, raw observations and cloud fragmentation. Preserve contract. |
| Public social profiles | Opt-in compact identity, story/images, posts, reciprocal follows and relationships implemented on feature branch. Public full Armory and media uploads still missing. |
| Shared guilds | Character invitations, roles, transfer, roster, feeds, pinned announcements, events/RSVPs implemented and emulator-tested. Applications, custom roles, event editing/history cleanup remain. |
| Private progression | Quest history already persisted and merged; latest-50-only display improved in this increment. Reputation was retained but not displayed. |
| Journal/items/professions | Reusable references, raids, item dialog/search, inventory storage and recipes already exist. Accurate Forever sources and collector coverage remain partial. |
| Talents | Side-by-side desktop trees, tooltips, dependencies and build URLs already exist/tested. Imported game-ID mapping awaits verified data. |
| Production acceptance | Existing Google/character load confirmed by owner. Enabled shared features and real two-user flows remain unverified. Community gate remains absent/disabled. |

## This increment

`armory-observations.js` only reads the active owner's validated snapshots. It adds an imported-observation panel (GUID, available first/last names, addon/schema versions, capture reason, game sex code, bind location and separate timestamps) and reputation tables. Sex/standing codes are shown as reported rather than guessed labels. Unsupported reputation entries are safely omitted; imported text is escaped. Missing data remains unavailable. Raw payloads, account keys, and other unselected fields are not rendered by this panel.

The Quest journal tab and Progress history show all retained turn-ins and completed IDs through client-side search and 50-row pagination. Search matches name, quest ID and zone; filters distinguish timed turn-ins from IDs without a timed record. Repeatable completions remain separate. Backfilled IDs acquire neither invented names nor dates. Export truncation is disclosed. No per-quest reads/writes, migrations, auto-post generation or new cloud documents are introduced. Old snapshots without these fields still load.

## Firestore configuration

No schema or rule changes. The index file now deliberately leaves `records.characterId`, `records.kind` and `communityOwners.characterKey` automatically indexed, matching the owner's console choices. Six exemptions remain: `records.payload`, `posts.body`, `communityCharacters.bio`, `communityCharacters.story`, `communityGuilds.rules`, `communityGuilds.description`. The `posts` composite remains `pinned ASC, createdAt DESC`, collection scope.

No new Firebase console steps are required for this increment. No user data migration. Keep community disabled until live shared-feature acceptance. Deploy the website through the existing main-branch GitHub Pages workflow when the feature branch is reviewed; packaging and `scripts/build-site.py` stage the production artifact.

## Next milestone

Complete real two-user community acceptance in an authorized staging project, then release/activate shared profiles and guilds. Verify publish/unpublish, posts, reciprocal follows, public/private guild invitations, independent alts, role transfer, and concurrent event RSVPs. Next extend explicitly opted-in public Armory summaries with independently chosen visibility; never expose private snapshots or automatically publish GUID/account relationships.
