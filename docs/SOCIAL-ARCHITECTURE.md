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

## Shared-community continuation (implemented, activation pending)

An independent opt-in shared layer now provides stable public IDs, allowlisted profiles, directory, public posts, following, paginated feeds and reactions. See [COMMUNITY.md](COMMUNITY.md) for the exact schema, privacy contract, tests, activation gates and remaining limits. Private profiles/posts described above remain private; only explicit publication creates a separate public projection.

Shared guild invitations/membership, shared events/RSVPs and directional public RP relationships now have a staged implementation; see SHARED-GUILDS.md. Mutual relationship confirmation, guestbooks and galleries remain unimplemented. Private event planning is complete; see EVENTS.md. These shared features require the new authorization layer to be deployed, not the pending raw addon export.
