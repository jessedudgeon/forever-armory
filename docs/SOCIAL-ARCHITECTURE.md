# Character stories — private authoring foundation

The September 29 release adds an **RP & story** Armory tab and **Character stories** navigation. Optional profile sections cover identity, appearance, preferences, biography, common knowledge, rumors and secrets. Entries support IC, OOC, adventure, profession, progression and long-form journal types. Entries can be edited. The combined feed can be filtered by character; the same entries appear with character history without copying data. Main/alt links are private and limited to owned characters. Chains/cycles are rejected.

## Storage and authorization

`state.social` holds `profiles` and `posts`. These are separate from imported observations: an addon import cannot overwrite manually authored stories. `social-model.js` validates identity, bounded text, timestamps, unique IDs and visibility. `social.js` renders escaped plain text and uses the existing validated, revision-checked commit service. Character rename/account corrections rekey profile/post authors and main/alt references. Character removal removes associated records and clears incoming alt links. Old backups initialize empty social collections; restoring preserves current records on ID conflict and adds missing records.

Cloud serialization uses individual owner-private records under `armories/{uid}/records`:

- `rp-{SHA256(characterId)}`: `task` envelope with `@rp-profile` discriminator.
- `post-{UUID}`: `task` envelope with `@character-post` discriminator.

No deployed Firestore rules or authentication settings change. The existing Google-owner-only rule protects every record. Client character IDs are meaningful only inside that owner's Armory; they do **not** confer cross-user authority. Even a malicious `visibility: public` payload remains unreadable to others. Validation rejects unsupported visibility in the application.

Profiles and posts currently support **private only**. The UI states this plainly. Secrets, main/alt links, user IDs, email addresses, game account names, inventories and private notes must never be copied automatically into a future public projection. Refresh existing tabs before writing the new record types; older clients fail closed when reading unfamiliar envelopes.

Limits: one profile per owned character, 2,000 posts per Armory, 6,000 characters per post, individual profile-field bounds; existing 450-record/7 MB atomic write limits still apply to bulk restore. Feed pagination is future work; these collections are an owner authoring workspace, not a global feed store.

## Next shared-community milestone (not enabled)

Before publishing shared profiles, introduce immutable public character IDs with verified owner claims, independent of names/play style. Build an explicit opt-in projection with a narrow field allowlist, separate audience documents, owner-only secret fields and authorization tests for public/authenticated/guild/relationship audiences. Do not broaden the private Armory rules.

Shared posts should be individual documents keyed by stable activity IDs and verified author ownership; source/event IDs should deduplicate future addon-generated events. Shared guild membership and invitations must target character IDs with validated officer authority, recipient acceptance, and atomic membership transitions. An officer string in today's private guild plan is not a role grant. Main/alt relationships remain private unless separately opted in. Event RSVPs likewise require author ownership of the selected character. Public feeds need indexed, bounded queries and moderation before launch.

Not implemented: public profiles, remote character discovery, following, shared posts, invites, shared guild hubs, events/RSVPs, mutual RP relationships, guestbook, reactions, galleries. These require a deployed/tested shared authorization layer, not the pending addon export. Export-specific gaps remain in EXPORT-FOLLOWUP.md.
