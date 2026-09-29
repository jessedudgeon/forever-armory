import { emptyState, keyOf, normalize, validateBackup } from "./model.js";
const encoder = new TextEncoder();
const CHUNK_SIZE = 24000;
const MAX_SNAPSHOT_BYTES = 3000000;
// Integrity checksum detects damaged/mixed fragments; ownership is enforced by Firestore.
function checksum(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
// Keep small snapshots byte-for-byte compatible. Large observations use the same
// owner-only envelope policy: one manifest plus bounded private task fragments.
export async function recordsFor(state) {
  const records = new Map();
  for (const c of state.characters)
    for (const snapshot of c.snapshots) {
      const payload = JSON.stringify(snapshot);
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(payload),
      );
      const id =
        "s-" +
        Array.from(new Uint8Array(digest), (n) =>
          n.toString(16).padStart(2, "0"),
        ).join("");
      const record = { kind: "snapshot", characterId: c.id, payload };
      if (encoder.encode(JSON.stringify(record)).length <= 170000) {
        records.set(id, record);
        continue;
      }
      if (encoder.encode(payload).length > MAX_SNAPSHOT_BYTES)
        throw Error(
          "This character snapshot exceeds the 3 MB cloud limit. No data was written.",
        );
      const chars = Array.from(payload),
        count = Math.ceil(chars.length / CHUNK_SIZE);
      if (count > 128)
        throw Error("This snapshot needs too many cloud fragments.");
      records.set(id, {
        ...record,
        payload: JSON.stringify({
          format: "forever-snapshot-manifest",
          version: 1,
          snapshotId: id,
          count,
          bytes: encoder.encode(payload).length,
          checksum: checksum(payload),
        }),
      });
      for (let index = 0; index < count; index++)
        records.set(`p-${id.slice(2)}-${index}`, {
          kind: "task",
          characterId: "@snapshot-part",
          payload: JSON.stringify({
            snapshotId: id,
            index,
            count,
            text: chars
              .slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
              .join(""),
          }),
        });
    }
  for (const task of state.tasks)
    records.set("t-" + task.id, {
      kind: "task",
      characterId: task.characterId,
      payload: JSON.stringify(task),
    });
  // Existing Firestore rules accept snapshot/task records. Reserved task identities
  // carry account metadata without changing the deployed security policy.
  for (const account of state.gameAccounts || [])
    if (
      account.id !== "default" ||
      account.name !== "WoW 1" ||
      account.legacyStatus
    )
      records.set("a-" + account.id, {
        kind: "task",
        characterId: "@game-account",
        payload: JSON.stringify(account),
      });
  for (const guild of state.guilds || [])
    records.set("g-" + guild.id, {
      kind: "task",
      characterId: "@guild",
      payload: JSON.stringify(guild),
    });
  if (
    state.legacy &&
    (state.legacy.challenges.length || Object.keys(state.legacy.perks).length)
  )
    records.set("legacy-progress", {
      kind: "task",
      characterId: "@legacy-progress",
      payload: JSON.stringify(state.legacy),
    });
  return records;
}
export function stateFromRecords(records) {
  const out = emptyState(),
    chars = new Map();
  const parsed = Array.from(records, (record) => {
    if (typeof record?.payload !== "string")
      throw Error("Invalid cloud record payload.");
    return { record, payload: JSON.parse(record.payload) };
  });
  const chunks = new Map(),
    usedChunks = new Set();
  for (const { record, payload } of parsed)
    if (record.kind === "task" && record.characterId === "@snapshot-part") {
      if (
        !/^s-[a-f0-9]{64}$/.test(payload.snapshotId) ||
        !Number.isInteger(payload.count) ||
        payload.count < 1 ||
        payload.count > 128 ||
        !Number.isInteger(payload.index) ||
        payload.index < 0 ||
        payload.index >= payload.count ||
        typeof payload.text !== "string" ||
        Array.from(payload.text).length > CHUNK_SIZE
      )
        throw Error("Invalid snapshot fragment.");
      const key = payload.snapshotId + ":" + payload.index;
      if (chunks.has(key)) throw Error("Duplicate snapshot fragment.");
      chunks.set(key, payload);
    }
  for (const { record, payload: parsedPayload } of parsed) {
    if (record.kind === "task" && record.characterId === "@snapshot-part")
      continue;
    if (typeof record?.payload !== "string")
      throw new Error(
        "A cloud record is invalid. Your stored data has not been changed.",
      );
    let payload = parsedPayload;
    if (
      record.kind === "snapshot" &&
      payload.format === "forever-snapshot-manifest"
    ) {
      const manifest = payload;
      if (
        manifest.version !== 1 ||
        !/^s-[a-f0-9]{64}$/.test(manifest.snapshotId) ||
        !Number.isInteger(manifest.count) ||
        manifest.count < 1 ||
        manifest.count > 128 ||
        !Number.isInteger(manifest.bytes) ||
        manifest.bytes < 1 ||
        manifest.bytes > MAX_SNAPSHOT_BYTES
      )
        throw Error("Invalid snapshot manifest.");
      const parts = [];
      for (let index = 0; index < manifest.count; index++) {
        const key = manifest.snapshotId + ":" + index,
          part = chunks.get(key);
        if (!part || part.count !== manifest.count || usedChunks.has(key))
          throw Error(
            "A snapshot fragment is missing or inconsistent. Your cloud data was not changed.",
          );
        parts.push(part.text);
        usedChunks.add(key);
      }
      const text = parts.join("");
      if (
        encoder.encode(text).length !== manifest.bytes ||
        checksum(text) !== manifest.checksum
      )
        throw Error(
          "Snapshot integrity check failed. Your cloud data was not changed.",
        );
      payload = JSON.parse(text);
    }
    if (record.kind === "snapshot") {
      const s = normalize(payload),
        id = keyOf(s);
      if (id !== record.characterId)
        throw new Error("A character record has an inconsistent identity.");
      if (!chars.has(id)) chars.set(id, { id, snapshots: [] });
      chars.get(id).snapshots.push(s);
    } else if (
      record.kind === "task" &&
      record.characterId === "@game-account"
    ) {
      if (!payload.id || !payload.name)
        throw new Error("Invalid game account record.");
      if (record.payload && payload.id === "default")
        out.gameAccounts[0] = payload;
      else out.gameAccounts.push(payload);
    } else if (record.kind === "task" && record.characterId === "@guild") {
      out.guilds.push(payload);
    } else if (
      record.kind === "task" &&
      record.characterId === "@legacy-progress"
    ) {
      out.legacy = payload;
    } else if (record.kind === "task") {
      if (payload.characterId !== record.characterId)
        throw new Error("A goal record has an inconsistent identity.");
      out.tasks.push(payload);
    } else throw new Error("Unknown cloud record format.");
  }
  if (usedChunks.size !== chunks.size)
    throw Error(
      "An orphaned snapshot fragment was found. Your cloud data was not changed.",
    );
  out.characters = [...chars.values()];
  return validateBackup({ format: "forever-armory-backup", ...out });
}
export function diffRecords(before, after) {
  const writes = [],
    deletes = [];
  for (const [id, data] of after)
    if (JSON.stringify(before.get(id)) !== JSON.stringify(data))
      writes.push({ id, data });
  for (const [id] of before) if (!after.has(id)) deletes.push(id);
  // One atomic transaction, including the revision document, avoids partially restored accounts.
  if (writes.length + deletes.length > 450)
    throw new Error(
      "This change affects more than 450 cloud records. Import a smaller backup or remove characters individually. Your cloud data has not changed.",
    );
  let bytes = 0;
  for (const w of writes) {
    const size = new TextEncoder().encode(JSON.stringify(w.data)).length;
    if (size > 180000)
      throw new Error("One cloud record is too large to sync.");
    bytes += size;
  }
  if (bytes > 7000000)
    throw new Error(
      "This upload is too large for one sync. Use a smaller backup.",
    );
  return { writes, deletes };
}
