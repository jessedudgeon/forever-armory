import {newId} from './identity.js';
import {publicIdValid} from './community-model.js';
import {guildFields, guildEventFields, bounded, GUILD_POST_TYPES} from './guild-model.js';

export function guildService(F, db, auth) {
  const doc = (...p) => F.doc(db, ...p), col = (...p) => F.collection(db, ...p);
  const id = value => { if (!publicIdValid(value)) throw Error('Invalid character or guild ID.'); return value; };
  const user = () => { if (!auth.currentUser) throw Error('Sign in with Google first.'); return auth.currentUser.uid; };
  const guild = gid => doc('communityGuilds', id(gid));
  const member = actor => doc('communityMemberships', id(actor));
  const invite = (gid, actor) => doc('communityInvites', id(actor), 'guilds', id(gid));
  const access = gid => doc('communityGuilds', id(gid), 'access', user());
  const data = d => d.exists() ? {id: d.id, ...d.data()} : null;
  const read = async ref => data(await F.getDocFromServer(ref));
  const page = async (ref, constraints = [], cursor, direction = 'asc') => {
    const q = [...constraints, F.orderBy(F.documentId(),direction), F.limit(50)];
    if (cursor) q.push(F.startAfter(cursor));
    const result = await F.getDocsFromServer(F.query(ref, ...q));
    return {rows: result.docs.map(data), cursor: result.docs.at(-1), done: result.size < 50};
  };
  return {
    profile: gid => read(guild(gid)),
    membership: actor => read(member(actor)),
    directory: cursor => page(col('communityGuilds'), [F.where('visibility', '==', 'public')], cursor),
    invitations: (actor, cursor) => page(col('communityInvites', id(actor), 'guilds'), [], cursor),
    // Access documents are private capability pointers, not copied account rosters.
    // Rules re-check the pointed character's live membership/invitation on every read.
    async open(gid, actor) { await F.setDoc(access(gid), {characterId: id(actor)}); return read(guild(gid)); },
    async create(actor, input, gid = newId()) {
      user(); id(actor); const fields = guildFields(input);
      await F.runTransaction(db, async tx => {
        const existing = await tx.get(member(actor));
        if (existing.exists()) throw Error('This character already belongs to a guild.');
        tx.set(guild(gid), {...fields, masterId: actor, createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp()});
        tx.set(member(actor), {guildId: gid, role: 'master', joinedAt: F.serverTimestamp()});
        tx.set(access(gid), {characterId: actor});
      });
      return gid;
    },
    async edit(gid, input) { user(); await F.updateDoc(guild(gid), {...guildFields(input), updatedAt: F.serverTimestamp()}); },
    async invite(gid, actor, target) {
      user(); id(actor); id(target);
      const profile = await read(guild(gid));
      await F.setDoc(invite(gid, target), {inviterId: actor, guildName: profile.name, createdAt: F.serverTimestamp()});
    },
    async respond(gid, actor, accept) {
      user();
      if (!accept) return F.deleteDoc(invite(gid, actor));
      await F.runTransaction(db, async tx => {
        const pending = await tx.get(invite(gid, actor)), existing = await tx.get(member(actor));
        if (!pending.exists()) throw Error('This invitation is no longer available.');
        if (existing.exists()) throw Error('Leave this character’s current guild first.');
        tx.set(member(actor), {guildId: gid, role: 'member', joinedAt: F.serverTimestamp()});
        tx.set(access(gid), {characterId: actor});
        tx.delete(invite(gid, actor));
      });
    },
    async transfer(gid, target) {
      user(); id(target);
      await F.runTransaction(db, async tx => {
        const current = await tx.get(guild(gid)), next = await tx.get(member(target));
        if (!current.exists() || !next.exists() || next.data().guildId !== gid) throw Error('Choose an existing guild member.');
        if (current.data().masterId === target) throw Error('This character is already Guild Master.');
        tx.update(guild(gid), {masterId: target, updatedAt: F.serverTimestamp()});
        tx.update(member(current.data().masterId), {role: 'officer'});
        tx.update(member(target), {role: 'master'});
      });
    },
    async leave(actor) { user(); await F.deleteDoc(member(actor)); },
    async rank(actor, role) { user(); if (!['member', 'officer'].includes(role)) throw Error('Choose member or officer.'); await F.updateDoc(member(actor), {role}); },
    roster: (gid, cursor) => page(col('communityMemberships'), [F.where('guildId', '==', id(gid))], cursor),
    async post(gid, actor, type, body, postId = newId()) {
      user(); if (!GUILD_POST_TYPES.includes(type)) throw Error('Choose a post type.');
      await F.setDoc(doc('communityGuilds', id(gid), 'posts', id(postId)), {
        actorId: id(actor), type, body: bounded(body, 6000, true), pinned: false, createdAt: F.serverTimestamp(),
      });
      return postId;
    },
    posts: (gid, cursor) => page(col('communityGuilds', id(gid), 'posts'), [F.orderBy('createdAt', 'desc')], cursor, 'desc'),
    pinned: gid => page(col('communityGuilds', id(gid), 'posts'), [F.where('pinned','==',true),F.orderBy('createdAt','desc')], undefined, 'desc'),
    async pin(gid, postId, on) { user(); await F.updateDoc(doc('communityGuilds', id(gid), 'posts', id(postId)), {pinned: !!on}); },
    async removePost(gid, postId) { user(); await F.deleteDoc(doc('communityGuilds', id(gid), 'posts', id(postId))); },
    async event(gid, actor, input, eventId = newId()) {
      user(); const fields = guildEventFields(input);
      await F.setDoc(doc('communityGuilds', id(gid), 'events', id(eventId)), {
        ...fields, startsAt: F.Timestamp.fromDate(fields.startsAt), organizerId: id(actor),
        going: 0, status: 'scheduled', createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(),
      });
      return eventId;
    },
    events: (gid, cursor) => page(col('communityGuilds', id(gid), 'events'), [F.orderBy('startsAt')], cursor),
    async cancel(gid, eventId, cancelled) { user(); await F.updateDoc(doc('communityGuilds', id(gid), 'events', id(eventId)), {status: cancelled ? 'cancelled' : 'scheduled', updatedAt: F.serverTimestamp()}); },
    responses: (gid, eventId, cursor) => page(col('communityGuilds', id(gid), 'events', id(eventId), 'rsvps'), [], cursor),
    async rsvp(gid, eventId, actor, status) {
      user(); if (!['going', 'maybe', 'declined'].includes(status)) throw Error('Choose a response.');
      const eventRef = doc('communityGuilds', id(gid), 'events', id(eventId));
      const responseRef = doc('communityGuilds', gid, 'events', eventId, 'rsvps', id(actor));
      await F.runTransaction(db, async tx => {
        const event = await tx.get(eventRef), old = await tx.get(responseRef);
        if (!event.exists() || event.data().status !== 'scheduled') throw Error('This event is not accepting responses.');
        const going = event.data().going + Number(status === 'going') - Number(old.data()?.status === 'going');
        if (event.data().capacity && going > event.data().capacity) throw Error('This event is full.');
        tx.set(responseRef, {status, updatedAt: F.serverTimestamp()});
        tx.update(eventRef, {going, lastRsvpActor: actor, updatedAt: F.serverTimestamp()});
      });
    },
  };
}
