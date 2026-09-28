# Forever hub release

## Included

- Public searchable catalog built from existing dungeon, talent and race reference data; private imported items, spells and quests are searchable in the owner's session.
- Nine original class starter guides linked to talent planning and character goals.
- Existing dungeon directory and boss loot references, plus one-click dungeon preparation goals.
- Inventory search and totals across characters and game accounts. Location observations persist through cloud sync, backup, restore and manual character edits. Shared storage scopes are deduplicated.
- Google-authenticated contributions with evidence URLs, author attribution, private pending submissions, editorial publish/reject actions and author withdrawal.
- Guild workspaces: public directory, owner-approved join requests, owner/officer/member roles, opt-in roster/profession sharing, events, role RSVPs and officer-shared bank snapshots. Private armories never become guild-readable.

## Required deployment

1. Deploy the checked-in Firestore rules with `npx firebase deploy --only firestore:rules --project forever-armory` using an authorized Firebase administrator. GitHub Pages deployment does **not** deploy Firestore rules. Existing private-armory access remains unchanged.
2. Grant the `editor: true` custom Firebase Auth claim to designated moderators with Firebase Admin SDK in a trusted administrative environment. Never put service-account keys in the website. After a claim change, sign out and in again. Ordinary users cannot self-publish.
3. Run `npm test` and `npm run test:security`. Deploy the site via its existing GitHub Pages workflow.
4. Install the updated addon from Import & backups, then import a new snapshot. Past bag exports discarded by older website versions cannot be recovered unless the original export remains available.

## Inventory capture

The website accepts `inventories` on a version-1 character export. Each location has `location`, `scopeId` (required for shared storage), `observedAt`, `complete`, `source`, and `items` (`id`, `name`, positive integer `count`, optional `bag`, `slot`, `link`). Locations: bags, bank, mail, auction, account-bank, guild-bank. Missing locations mean unknown. A supplied empty `items` list means the observed location was empty. Old observations retain their own timestamps.

The beta addon provides bags and classic-style bank containers; mailbox attachments, owned auctions and the viewed guild-bank tab are supported when the corresponding client API exists. Open that storage and run `/farmory` (or `/fa`) while it is still open. Storage cache uses SavedVariables and retains the original capture date. Mail, auctions and guild tabs are labeled partial. Individual bank tabs need stable distinct scope IDs. Shared account-bank APIs are not implemented; the website can ingest a compatible external snapshot, but the addon cannot promise automatic collection. Transfers between separately captured containers can temporarily inflate counts until all affected containers are refreshed.

Each character must be exported and imported under the correct game account. The addon has no Blizzard account API, continuous connection, or access to offline characters. The site does not collect game passwords.

## Content coverage and limitations

This release implements the publishing and planning framework, **not a complete verified Forever database**. Existing talents are community video-derived beta data from the provenance recorded in `site/data/talents/SOURCE.md`. Existing loot associations are Classic references. The nine class guides are editorial starters, not validated rotations, ranked stat weights, BiS lists, or raid builds. Full dungeon routes, prerequisites, quests and boss tactics still require sourced data. The catalog accepts imported spell/quest observations, but this addon release does not collect a complete spell/quest dataset. No observations are automatically made public or labeled verified.

Community published records remain explicit community content; publishing does not automatically modify the reference catalog. Editors must review and incorporate verified corrections into catalog data through source control.

Directory queries currently display the first 100 guilds/contributions; guild records are limited to 300 per workspace. Pagination, stronger anti-spam controls and larger-guild scale work remain necessary before broad promotion. Guild workspace names are not ownership-verified in-game. Each Google account can join a workspace; the owner approves membership. In-game permissions are unaffected. Removing a member revokes future database access, but cannot retract previously viewed content.

Guild roster sharing copies only name, class, level, professions and observation time. Shared copies do not auto-refresh; re-share after importing. Guild bank sharing is an explicit officer action. Guild bank UI and private inventory select the latest observation per tab/scope, without summing repeated observations.

## Validation

Unit tests cover import retention, cloud/backup round trips, manual-update timestamps, newest-location selection, explicit empty containers, shared-scope deduplication, account filters, provenance and malformed input. Firestore emulator tests cover private-armory isolation, public guild directory, membership access, role escalation denial, removed-member denial, editor-only publication, forged author denial and unsafe evidence rejection. Browser checks should exercise public pages, saved goals, mobile layout, shared roster forms and sign-ups. The addon still needs in-game testing against the current Forever client.
