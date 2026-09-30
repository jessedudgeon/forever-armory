# Character profiles and shared guilds

This increment extends the existing staged community service. It does not replace private Armory snapshots, RP notes, the private guild planner, private calendar, Google authentication, or the import pipeline. Production sharing remains disabled until Firebase deployment and staging acceptance. GitHub Pages deployment alone does not deploy database rules/indexes.

## Ownership and collections

The existing chain remains Google user → private game accounts → private characters. `communityOwners/{publicId}` privately binds a stable public character identity to the Google owner and private character key. Names and addon GUIDs do not confer community ownership. Imports can rename/update private observations without changing the public ID or any guild/social records.

| Path | Contents / audience |
| --- | --- |
| `armories/{uid}/records/*` | Existing owner-only accounts, snapshots, RP, posts, plans; unchanged |
| `communityOwners/{characterId}` | Existing private immutable Google owner claim |
| `communityCharacters/{characterId}` | Opt-in identity projection; optional separately authored `story` |
| `communityCharacters/{characterId}/relationships/{targetId}` | Public directional type/note; no implied mutual consent |
| `communityOwners/{characterId}/following/{targetId}` | Owner's paginated management list |
| `communityCharacters/{targetId}/followers/{characterId}` | Public character-only reciprocal follow edge; aggregate follower count |
| `communityGuilds/{guildId}` | Name/tag/description/rules/recruitment/play style/faction/images/URLs/visibility, master character and timestamps |
| `communityMemberships/{characterId}` | One canonical `guildId`, `role`, `joinedAt` per character; no UID/account/main-alt mapping |
| `communityInvites/{characterId}/guilds/{guildId}` | Recipient-specific invitation; inviter character, guild display name, timestamp |
| `communityGuilds/{guildId}/access/{uid}` | Private, owner-only pointer to one owned member/invited character; not a public user roster |
| `communityGuilds/{guildId}/posts/{postId}` | Character-authored type/body, creation time and pinned flag |
| `communityGuilds/{guildId}/events/{eventId}` | Name, description, type, UTC start, organizer character, capacity, going count, requirements, notes and status |
| `communityGuilds/{guildId}/events/{eventId}/rsvps/{characterId}` | Going/maybe/declined plus update time; exactly one response per character |

A public story contains description, appearance, personality, history, portrait/header HTTPS URLs, deliberately shared professions and optional main/alt designation text. Private profile biography/secrets/account/alt links are never copied into it. Republishing the identity projection preserves the separately authored public story. The initial public profile still exposes the existing compact identity projection, not all private inventory/quest/raw-export data. The full Armory remains owner-private.

Following now makes the follower's **public character ID** visible on the target's follower edge. No Google UID/account relationship is included. Creation/deletion of forward and reverse edges is atomic and security rules require both sides. Repeated follows overwrite the same edge; the aggregate count cannot be incremented by a client. A retained edge from an unpublished follower remains counted; it does not reveal an unpublished name. Pre-activation test datasets from the old forward-only implementation must recreate follows or be explicitly migrated in staging before relying on counts. No automatic production migration is performed.

## Authorization and lifecycle

- Community availability still uses admin-only `communityConfig/status.enabled`. Clients cannot enable it.
- Guild creation atomically creates the guild, founding master membership and private access pointer. A character can belong to only one shared guild; a player's alts are independent.
- Guild Master and Officer may edit settings, invite published characters, make announcements, pin announcements, and schedule/cancel/reopen events. Only the Master changes officer ranks or transfers leadership.
- Accepting an invite atomically consumes it, creates Member membership and establishes the recipient's private access pointer. Decline deletes it without joining. Factions must match unless the guild allows Both. Faction cannot be changed after creation.
- Leadership transfer atomically changes the guild's master ID and both roles; the former Master becomes Officer. A Master cannot leave without transferring first. Guild deletion/disbanding is not yet implemented.
- Public guilds expose their roster/posts/events. Private guilds expose them to members **and invited characters reviewing the guild**; this is stated in the visibility form. An invitation does not grant write privileges. The access pointer is revalidated against current membership/invitation on every read, so leaving/declining revokes access. Multiple alts can reselect their own current membership to restore the pointer.
- Guild access documents and account identities cannot be listed by members. Private planner officer names confer no shared authority.
- Unpublishing a character hides its public profile/posts, while its immutable owner claim and membership remain. Owners can still select unpublished identities for guild management/leave/transfer. Creating new character-authored posts, events or RSVPs requires a published identity. Other roster viewers see an unpublished placeholder.
- Relationships are owner-authored directional statements. Owners can remove them; self-links and missing targets are rejected. Unpublishing hides the profile's relationships.
- Plain text is escaped. User image and external link fields accept HTTPS, are bounded, and include no automatically uploaded private files. Media hosts receive normal image requests; image URLs are explicitly owner-selected.

## Feeds, RSVP consistency and performance

Guild posts are separate from private journals and public character posts. No private post is copied automatically. Announcements are officer-controlled; up to 50 pinned announcements load before the chronological page, with duplicate IDs suppressed. Directory, membership, invite, event, response and guild-post queries page in batches of 50. Roster filters apply to the explicitly counted loaded members; load more to include further members. The private following list pages by 20; the existing mixed following feed still includes only the first 20 follows, labeled in the UI.

Every shared RSVP uses a Firestore transaction. The event's `going` count changes by the difference between the character's old/new status. Rules bind the event update to exactly that response and enforce capacity. Repeated Going does not double count; competing final-seat transactions result in one success. Cancelled events refuse responses. RSVP identity and event IDs leave room for later roles, recurrence, calendar and attendance features without embedding entire rosters in an event.

Former members' previous RSVPs remain historical records and may still reserve a place. Members should decline before leaving; officer response-management/automatic cleanup is remaining work. Calendar time reuses the existing validated local-time adapter and is stored as UTC. Nonexistent spring-forward times are rejected; an explicit choice between repeated fall-back hours remains future work.

No import path writes to the new collections. Exact-import deduplication, stable GUID matching, raw observations, inventory locations and timestamps remain the existing tested implementation. There are no per-item or per-recipe community writes. Automatic shared level/loot/profession activity is deferred; any future producer must use deterministic source-event IDs, explicit audience consent and separately validated provenance. Manual post IDs already support deterministic identity but are not game verification. Discord integration can consume character/guild/event IDs later without exposing owner claims.

## Indexes and deployment

`firestore.indexes.json` adds the collection-scoped `posts` composite index: `pinned ASC`, `createdAt DESC`. Existing body/payload index exemptions remain. Per the owner’s September 30 console setup, `records.characterId`, `records.kind` and `communityOwners.characterKey` deliberately retain automatic indexing. Public `story` maps and guild rules/description are also exempted. Other queries use single-field indexes with document-ID tie breaks. The emulator does not prove production composite-index provisioning; wait for the index to finish building before staging acceptance.

1. `npm ci` (Node 22 recommended); install Java 21 for emulators.
2. `npm test` and `npm run test:security`.
3. `npx playwright install --with-deps chromium`; `npm run test:browser`. Optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` selects an already installed compatible Chromium.
4. `python3 scripts/package.py`; `npm run dev -- --port 4173`. Open localhost:4173. Local UI without a signed-in cloud account still supports the existing example roster.
5. With authorized Firebase access, deploy to the intended staging project first: `npx firebase deploy --only firestore:rules,firestore:indexes --project <staging-project>` and configure staging frontend Firebase settings. Existing production config remains unchanged in this change.
6. Verify staging Google login with two actual users, refresh/reconnect, opt-in publishing, private/public guild access, invitations, leadership transfer, RSVP contention and mobile layout. The browser suite uses an emulator service bridge, not real OAuth or the CDN SDK transport.
7. For production, `npx firebase deploy --only firestore:rules,firestore:indexes --project forever-armory`. Keep `communityConfig/status.enabled` false until acceptance is complete. Merge the reviewed branch to `main` to use the existing Pages workflow. Refresh old tabs after deploying: forward-only follow writes from the prior client are intentionally rejected by the reciprocal-edge rules.
8. Enable community only through the Firebase console/Admin SDK after acceptance. Setting it false closes public reads/new shared writes without affecting private Armory data. No activation is performed by this change.

## Remaining scope

This is a tested foundation, not completion of every requested production capability. Remaining: live Firebase/OAuth deployment acceptance; opt-in full public Armory/progression beyond compact identity; structured screenshot uploads/rendering; automatic shared addon activities; complete follow-feed scaling; custom rank editing; event editing, former-member RSVP cleanup, calendar/attendance/recurrence; shared-data export/erasure and guild disbanding; richer moderation controls. Existing verified-game-data and actual Forever client collector limitations are unchanged. No game content was invented.
