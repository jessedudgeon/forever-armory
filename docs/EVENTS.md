# Private character events

Events & gatherings (`#events`, `#events/{UUID}`) supports raids, dungeons, RP, social, PvP and custom events. Events have a character host, optional guild plan, optional shared PvE Journal instance link, title, description/preparation, location, capacity and start/end times. Forms show the browser's time zone; stored timestamps are UTC. Nonexistent local times (such as a spring DST gap) are rejected. During an autumn repeated hour the browser chooses the first occurrence; an explicit timezone/offset picker remains future work.

RSVPs belong to individual owned characters, with Going / Maybe / Cannot attend, role and note. A host does not automatically reserve capacity. Changing a response updates the same record; Going counts are validated against capacity before saving. Cancelled/completed events close RSVPs and detail editing; reopening retains responses. Completion before the start is rejected. Marking complete is manual history, never inferred boss kills or loot.

Guild pages show associated plans; character history derives completed events hosted by the character or marked Going. The event record is reused instead of copied into posts or snapshot history. `.ics` export is a private calendar file containing event title, description and location; it sends no invitations, contains no Google account/attendee details, escapes text and folds UTF-8 lines. Deleting a character removes its RSVPs and events it hosts (including those events' other responses); the character removal dialog explains this.

## Data and security

`state.calendar = {events: [], rsvps: []}` is independent of addon snapshots. Individual cloud envelopes under `armories/{uid}/records` use:

- `event-{UUID}` / discriminator `@event`.
- `rsvp-{SHA256([eventId,characterId])}` / discriminator `@event-rsvp`.

Existing Google-owner-only Firestore rules are unchanged. Limits are 500 events and 5,000 RSVP records per owner, subject to the existing 450-change/7 MB atomic restore limits. Character rekeys update hosts and responses; old backups default to empty collections. Restore adds missing event/response identities and preserves current versions on conflicts. Imported legacy `guild.events` remains visible as historical activity notes, not silently converted into scheduled events with guessed times/hosts.

This is a **private planning workspace**, not a shared guild calendar. Only characters in the active owner's Armory can RSVP. Private guild association grants no permissions. No emails, invitations, remote RSVP, or public event pages exist yet.

## Shared community dependency

The Firebase CLI reported no authenticated deployment session during this work session. A shared character registry, audience-specific public projections and membership/invitation rules must be implemented and deployed with verified Firebase project access before enabling cross-user features. Do not weaken the private records rules. Reuse event UUIDs, UTC timestamps, character-host and character-RSVP semantics in the shared service; authorize every host/RSVP owner and officer action and transact capacity/membership changes. Shared events need indexes and bounded queries; avoid copying this entire owner workspace into a public document.

No raw addon export is needed for event planning. EXPORT-FOLLOWUP.md remains the separate source for missing game data.
