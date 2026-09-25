# Google sign-in and private cloud armories

The static site remains on GitHub Pages. Firebase Authentication handles Google OAuth; Firestore stores each account's snapshots and goals. Firebase web configuration is public project identification, not a secret. No OAuth client secret or service-account key belongs in this repository.

## One-time project setup
1. Open https://console.firebase.google.com/ and create or select a project owned by you. Suggested name: Forever Armory. Keep Google Analytics disabled; the app does not use it. A paid plan is not needed to begin within the provider's available no-cost quotas. Do not enable paid services inadvertently.
2. Register a **Web app** under Project settings. Name it `Forever Armory`. Copy its `firebaseConfig` object to `site/firebase-config.js`, replacing `null`. Keep `authDomain` as the Firebase-provided `PROJECT_ID.firebaseapp.com` domain. No Firebase Hosting setup is needed.
3. Under **Authentication → Sign-in method**, enable **Google**, set the public app name to Forever Armory, and select your own support email. Public signup happens automatically on first Google sign-in; the app requests only the standard profile/email identity, never Gmail or Drive access.
4. In Authentication's **Settings → Authorized domains**, add `forever.dudgeon.io`. Add `jessedudgeon.github.io` only if you intentionally want sign-in on the alternate site URL. Keep development domains restricted to ones you use. The site uses the popup flow to avoid cross-site redirect-storage issues on GitHub Pages.
5. Create a **Cloud Firestore Standard edition, Native mode** database. Select an appropriate US location (for example `us-east1`) and **Production mode**. Database location is a lasting choice. Do not use permissive test rules.
6. Publish the exact rules in `firestore.rules`. These restrict every armory to the matching authenticated Google user ID. The rest of the database is denied. Apply `firestore.indexes.json` as well, to keep long snapshot payloads out of indexes.
7. With Firebase CLI, an alternative rules/index deployment is:
   ```sh
   firebase deploy --only firestore:rules,firestore:indexes --project YOUR_ACTUAL_PROJECT_ID
   ```
8. In GitHub Pages settings, confirm the custom domain and **Enforce HTTPS**. Commit the public Firebase configuration only after the rules and Google provider are ready. The existing Pages workflow publishes the site.

## Verify before inviting others
- Sign in using Google on the real HTTPS domain, create a test character, then reload. It should remain.
- Open a second device/browser with the same account. Confirm the roster appears there and edits synchronize.
- Sign out, use a different Google account, and confirm a separate empty roster. Signing out clears the prior cloud roster from the UI.
- Test private ownership rules with the Firestore emulator or Rules Playground: user A can read/write `armories/A` and its records, user B and unauthenticated requests cannot; a non-Google sign-in provider is denied.
- Check that local characters are not automatically uploaded. The account page requires **Review local roster upload → Upload and merge**.
- Test an offline save: it must fail with a clear message rather than claiming to sync. Concurrent edits must raise a revision conflict rather than overwrite another device.

## Storage and privacy
- `armories/{uid}`: schema version, monotonically increasing revision, server update timestamp.
- `armories/{uid}/records/s-{hash}`: one immutable snapshot's JSON payload and character key.
- `armories/{uid}/records/t-{id}`: one editable journal goal's JSON payload and character key.
- Snapshot documents avoid a growing single-document history. Payload fields are deliberately unindexed.
- Saves are atomic transactions. A revision check rejects stale writers. The app reads current state from the server and only sends changed records.
- A single operation is limited to 450 changed records and approximately 7 MB. Large migrations are rejected intact; split them into smaller backups. Normal per-character imports use one snapshot write plus a revision write.
- Auth persistence is session-based. Firestore uses memory-only cache. Cloud character data is not copied into localStorage. A user may intentionally retain a separate local roster.
- The account page explains the data collected, Firebase processing, administrator access, and backup/deletion behavior. Removing a character deletes its snapshots and associated goals. Users can export their data at any time. Full deletion of the Firebase Auth identity is not exposed in this release; the project owner can handle that in Firebase Console.
- No service-account credentials, Google access tokens, or account passwords are stored by application code.

## Tests
`npm test` runs the parsing, history, backup, and cloud-record tests. `tests/firestore.rules.test.mjs` uses Firebase's emulator to exercise ownership enforcement. Follow its documented command in the package scripts when emulator dependencies are installed. A successful local test does not prove the production Firebase project has the correct rules: verify the deployed rules too.

## Operating the service
Monitor Firebase Authentication and Firestore usage in the console. Provider quotas and pricing can change; review them before opening registration broadly or upgrading the project. This release does not include a custom abuse-prevention backend or App Check enforcement. Stay on the intended plan and monitor usage before inviting large groups.

References:
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/auth/web/auth-state-persistence
