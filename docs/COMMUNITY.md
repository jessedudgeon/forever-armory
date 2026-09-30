# Opt-in character community — staged beta

The character/guild continuation extends this baseline. **[SHARED-GUILDS.md](SHARED-GUILDS.md) is authoritative for the new story fields, reciprocal public follower edges/counts, following-list pagination, guilds, invitations, ranks, events, security, indexes and remaining deployment steps.** The following baseline describes the original compact projection and earlier release.

The website includes public character profiles, a paginated directory, independent public IC/OOC and journal posts with editing, character following, a chronological following feed, and character-authored appreciation reactions. This layer is implemented and emulator-tested, but **production sharing remains disabled until database activation and enabled-UI acceptance**. Existing private Armory records and authentication are unchanged.

## Storage boundary

- `communityOwners/{publicId}`: private immutable Google UID ownership, private local character key, creation time. IDs survive names/account corrections and cannot transfer to another website user. They establish website author ownership, not proof of an in-game character.
- `communityCharacters/{publicId}`: public allowlist projection only: name, class, race, faction, level, play style, title, at-a-glance bio, status, creation/update times.
- `communityCharacters/{publicId}/posts/{postId}`: separate public text/type and timestamps. Private journals are never copied automatically.
- `communityCharacters/{publicId}/posts/{postId}/reactions/{actorId}`: one appreciation per owning character, validated independently of the post author.
- `communityOwners/{publicId}/following/{targetId}`: private following edges, writable only by that character's owner. Both identities must be published; self-follow is rejected.
- `communityConfig/status`: admin-managed `enabled` boolean. Clients can read this single document but cannot change it. Missing config, old rules, or false means closed.

The private RP record retains `publicId`; backups, profile editing and character renames preserve it. Publishing requires a preview and explicit opt-in. The application saves the private stable ID before publishing; retrying a failed publication reuses it. Google UID/email, game accounts, alts, inventory, secrets and long biography are excluded. Editing private data does not automatically republish it.

Unpublishing deletes only the public projection. Rules then deny reads of its posts/reactions; retained posts become visible if the same character is republished. It is not an erasure mechanism. Private character deletion requires unpublishing first. Public text is escaped plain text.

## Data access and limits

`community-service.js` is the Firestore boundary; `community-model.js` defines projections and chronological pagination; `community.js` provides the UI. Reads use server APIs, not a persistent public cache. Owner claims and projections publish atomically. Post edits preserve creation time. A k-way feed merge tracks independent cursors and rolls back buffered progress after a failed page.

Directory and source-post pages load 20 records. The beta following feed includes the selected character and the first 20 following edges ordered by ID, explicitly labeled in the UI; the mixed feed remains limited; the new following management list is paginated. The actor picker loads up to 100 identities. There is no public user directory or exposed main/alt grouping. Public data is separate from private backup exports. Shared-data export/erasure, moderation/reporting, blocking, query-abuse controls and broader feed scaling are still launch work.

## Safe activation / rollback

1. From an authenticated Firebase CLI session with project access, run `firebase deploy --only firestore:rules,firestore:indexes --project forever-armory`. No deployment credential is available in this Work environment; committed rules are not automatically deployed by Pages.
2. Keep `communityConfig/status.enabled` absent or false. Test the enabled UI against an isolated staging Firebase project first: publish consent, owner/non-owner views, actor selection, post edits, follow/unfollow, reaction toggling, multi-page feeds, network errors, unpublish/republish, keyboard/mobile layout, and Google sign-in.
3. Resolve the launch controls above and verify intended audience before an administrator enables production sharing via the Firebase console/Admin SDK. Do not loosen rules or expose the private `armories` collection.
4. Roll back sharing by setting `enabled:false`. Public reads/new writes stop; private Armory remains available. Existing ownership-based removal rules remain available to authorized owners through the service, though the disabled UI does not expose removal controls.

`npm test` covers projection exclusions, validation, stable IDs and feed ordering/retries. `npm run test:security` uses the actual service against the Firestore emulator with two Google users and an anonymous reader, including forgery/ownership-transfer denial, follows/reactions, unpublish and kill-switch behavior. These checks do not prove production OAuth/configuration or enabled browser UX.

## Original next vertical slice (implemented in this continuation; activation pending)

Character-targeted guild invitations and acceptance, authoritative shared membership/ranks, then shared guild feed/events and character RSVPs. Existing private guild officer fields must never confer shared authority. Mutual RP relationships, guestbooks, galleries and addons producing public activity remain future work. No raw addon export is needed for this community layer; collector gaps remain in EXPORT-FOLLOWUP.md.
