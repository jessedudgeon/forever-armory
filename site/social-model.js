// Owner-private authoring records. Never publish these records as public profiles.
export const PROFILE_FIELDS = {
  title: ['Title / nickname', 120],
  atAGlance: ['At a glance', 500],
  biography: ['Biography / history', 6000],
  appearance: ['Physical appearance', 2000],
  personality: ['Personality', 2000],
  occupation: ['Occupation', 120],
  birthplace: ['Hometown / birthplace', 160],
  residence: ['Current residence', 160],
  preferences: ['RP preferences', 2000],
  status: ['Current status', 300],
  lookingFor: ['Looking for…', 300],
  commonKnowledge: ['Common knowledge', 2000],
  rumors: ['Rumors', 2000],
  secrets: ['Secrets / private notes', 4000],
};
export const POST_TYPES = {ic:'In character', ooc:'Out of character', adventure:'Adventure', journal:'Journal entry', profession:'Profession update', progression:'Progression'};
const text = (v, max) => {
  if (v == null) return '';
  if (typeof v !== 'string' || v.length > max) throw Error(`Text must be no longer than ${max} characters.`);
  return v.trim();
};
const date = v => {
  if (typeof v !== 'string' || !Number.isFinite(Date.parse(v))) throw Error('Invalid social record date.');
  return new Date(v).toISOString();
};
export function normalizeSocial(input = {}, characters = []) {
  const ids = new Set(characters.map(c=>c.id));
  const profiles = input.profiles ?? [], posts = input.posts ?? [];
  if (!Array.isArray(profiles) || profiles.length > characters.length || !Array.isArray(posts) || posts.length > 2000) throw Error('Invalid social collection or too many entries.');
  const owned = id => { if (!ids.has(id)) throw Error('Social record belongs to an unavailable character.'); return id; };
  const cleanProfiles = profiles.map(p => {
    if (p.visibility !== 'private') throw Error('Only private profiles are supported in this release.');
    const fields = {};
    for (const [key, [,max]] of Object.entries(PROFILE_FIELDS)) fields[key] = text(p.fields?.[key],max);
    const mainCharacterId = p.mainCharacterId ? owned(p.mainCharacterId) : '';
    if (mainCharacterId === p.characterId) throw Error('A character cannot be its own alt.');
    return {characterId:owned(p.characterId), visibility:'private', fields, mainCharacterId, updatedAt:date(p.updatedAt)};
  });
  if (new Set(cleanProfiles.map(p=>p.characterId)).size !== cleanProfiles.length) throw Error('Duplicate RP profile.');
  for (const p of cleanProfiles) {
    if (p.mainCharacterId && cleanProfiles.some(m=>m.characterId===p.mainCharacterId && m.mainCharacterId)) throw Error('Choose a main character, not another alt.');
  }
  const cleanPosts = posts.map(p => {
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(p.id) || !Object.hasOwn(POST_TYPES,p.type) || p.visibility !== 'private') throw Error('Invalid character post.');
    const body = text(p.body,6000);
    if (!body) throw Error('Write something before saving your entry.');
    return {id:p.id,characterId:owned(p.characterId),type:p.type,body,visibility:'private',createdAt:date(p.createdAt),updatedAt:date(p.updatedAt)};
  });
  if (new Set(cleanPosts.map(p=>p.id)).size !== cleanPosts.length) throw Error('Duplicate character post.');
  return {profiles:cleanProfiles, posts:cleanPosts};
}
export function saveProfile(state, characterId, fields, mainCharacterId='') {
  const next=structuredClone(state);
  next.social ??= {profiles:[],posts:[]};
  next.social.profiles=next.social.profiles.filter(p=>p.characterId!==characterId);
  next.social.profiles.push({characterId,fields,mainCharacterId,visibility:'private',updatedAt:new Date().toISOString()});
  next.social=normalizeSocial(next.social,next.characters);
  return next;
}
export function savePost(state, characterId, type, body, id=crypto.randomUUID()) {
  const next=structuredClone(state); next.social ??= {profiles:[],posts:[]};
  const old=next.social.posts.find(p=>p.id===id);
  if (old && old.characterId!==characterId) throw Error('The entry belongs to another character.');
  const now=new Date().toISOString();
  next.social.posts=next.social.posts.filter(p=>p.id!==id);
  next.social.posts.push({id,characterId,type,body,visibility:'private',createdAt:old?.createdAt||now,updatedAt:now});
  next.social=normalizeSocial(next.social,next.characters); return next;
}
export function rekeySocial(state, oldId, newId) {
  if (!state.social) return;
  for (const p of [...state.social.profiles,...state.social.posts]) if(p.characterId===oldId) p.characterId=newId;
  for (const p of state.social.profiles) if(p.mainCharacterId===oldId) p.mainCharacterId=newId;
}
export function removeSocialCharacter(state,id) {
  if (!state.social) return;
  state.social.posts=state.social.posts.filter(p=>p.characterId!==id);
  state.social.profiles=state.social.profiles.filter(p=>p.characterId!==id).map(p=>({...p,mainCharacterId:p.mainCharacterId===id?'':p.mainCharacterId}));
}
