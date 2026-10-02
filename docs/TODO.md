# Next work — October 2, 2026

## Journal evidence and content

- [ ] Collect reproducible Forever client evidence for the five guide-reported dungeon rosters, all drop associations and encounter ordering.
- [ ] Research bosses/loot for the seven announcement-only dungeons and two raids listed in CONTENT-VERIFICATION.md. Do not fill gaps with Classic, retail, Turtle or Ascension content.
- [ ] Resolve the 16 gated overview-only dungeon listings with direct Forever evidence before publishing them.
- [ ] Complete quest coverage and verify numeric mappings; verify prerequisites, faction variants, keys and attunements. Distinguish a quest prerequisite from an entry requirement.
- [ ] Confirm item quality/icons and restrictions for newly added reward records; expand source-backed trash/chest/reputation rewards.
- [ ] Replace guide-order numbers with documented route/optional-encounter information only where evidence supports it.
- [ ] Verify group sizes, minimum levels, exact entrances and reset/lockout rules separately; announcement evidence cannot fill unspecified fields.

## Next ForeverArmory milestone

- [ ] Validate client encounter/death/loot APIs and stable instance/NPC IDs in an actual Forever session.
- [ ] Add guarded, version-compatible PvE observations and stable event deduplication using the existing optional pveHistory contract.
- [ ] Record character GUID/realm, client build, instance/run identity, timestamps and collection limitations privately.
- [ ] Separate kill observations, explicit clears, received items, active saved instances and historical lockouts. Do not infer kills from item possession or quest completion.
- [ ] Design lockout expiry/difficulty schema after observing actual APIs; it is not currently supported by the importer.
- [ ] Test logout/reload, repeat sessions, wipe/reset, repeated exports, unavailable APIs and manual checklist preservation in the client and importer.

## Existing acceptance backlog

- [ ] Real Google sign-in and consenting two-user production acceptance remain separate from emulator tests; see LIVE-COMMUNITY-ACCEPTANCE.md (historical deployment/gate instructions there do not describe current activation).
- [ ] Verify external item-icon CDN behavior from the user's browser; local smoke saw a few failed external requests while functional flows passed.

Do not change community activation, rules or indexes as part of Journal content work. Preserve all private records and existing working systems.
