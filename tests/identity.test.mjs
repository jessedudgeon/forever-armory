import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {newId} from '../site/identity.js';
import {guildService} from '../site/guild-service.js';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
test('UUID generation supports native and getRandomValues-only browsers', () => {
  assert.equal(newId({randomUUID: () => 'native-id'}), 'native-id');
  const legacy = {getRandomValues: bytes => webcrypto.getRandomValues(bytes)};
  const ids = Array.from({length: 1000}, () => newId(legacy));
  for (const id of ids) assert.match(id, uuid);
  assert.equal(new Set(ids).size, ids.length);
  assert.throws(() => newId({}), /Secure ID generation is unavailable/);
});

test('guild creation without randomUUID writes the generated ID consistently', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {configurable: true, value: {
    getRandomValues: bytes => webcrypto.getRandomValues(bytes),
  }});
  try {
    const writes = [];
    const F = {
      doc: (_db, ...path) => path.join('/'), serverTimestamp: () => 'timestamp',
      runTransaction: async (_db, fn) => fn({
        get: async () => ({exists: () => false}),
        set: (path, data) => writes.push({path, data}),
      }),
    };
    const api = guildService(F, {}, {currentUser: {uid: 'owner'}});
    const id = await api.create('character', {name: 'Guild', faction: 'Horde', visibility: 'private'});
    assert.match(id, uuid);
    assert.deepEqual(writes.map(w => w.path), [
      `communityGuilds/${id}`, 'communityMemberships/character', `communityGuilds/${id}/access/owner`,
    ]);
    assert.equal(writes[0].data.masterId, 'character');
    assert.equal(writes[1].data.guildId, id);
    assert.equal(writes[1].data.role, 'master');
    assert.equal(writes[2].data.characterId, 'character');
  } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original);
    else delete globalThis.crypto;
  }
});
