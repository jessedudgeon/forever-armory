import {newId} from './identity.js';
import { findInstance } from './pve-data.js';
// Compatibility only: retain private plans made before unverified raids were delisted.
const retiredRaids = new Set(['molten-core','onyxias-lair','blackwing-lair','zulgurub','ruins-of-ahnqiraj','temple-of-ahnqiraj','naxxramas']);
export const EVENT_TYPES = {raid:'Raid', dungeon:'Dungeon', rp:'Roleplay', social:'Social', pvp:'PvP', custom:'Custom'};
export const RSVP_STATES = {going:'Going', maybe:'Maybe', declined:'Cannot attend'};
const bounded = (v,max) => { if(typeof v!=='string'||v.length>max) throw Error(`Text must be no longer than ${max} characters.`);return v.trim(); };
const instant = v => { if(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(v)||!Number.isFinite(Date.parse(v))) throw Error('Choose a valid event date and time.'); return new Date(v).toISOString(); };
export function normalizeEvents(input={},characters=[],guilds=[]) {
  const events=input.events??[],rsvps=input.rsvps??[];
  if(!Array.isArray(events)||events.length>500||!Array.isArray(rsvps)||rsvps.length>5000) throw Error('Too many event records.');
  const owned=id=>characters.some(c=>c.id===id);
  const clean=events.map(e=>{
    if(!/^[a-zA-Z0-9-]{1,80}$/.test(e.id)||!owned(e.hostCharacterId)) throw Error('Choose a host character from your Armory.');
    if(e.visibility!=='private'||!Object.hasOwn(EVENT_TYPES,e.type)||!['scheduled','completed','cancelled'].includes(e.status)) throw Error('Invalid event type, status or audience.');
    const title=bounded(e.title,150);if(!title)throw Error('Give your event a title.');
    if(e.guildId&&!guilds.some(g=>g.id===e.guildId))throw Error('Choose a guild from your collection.');
    if(e.instanceId) { const instance=findInstance(e.instanceId) || (retiredRaids.has(e.instanceId) ? {kind:'raid'} : null); if(!instance||!['dungeon','raid'].includes(e.type)||instance.kind!==e.type) throw Error('Choose a matching dungeon or raid.'); }
    const startsAt=instant(e.startsAt),endsAt=instant(e.endsAt);
    if(Date.parse(endsAt)<=Date.parse(startsAt)) throw Error('The end time must be after the start.');
    if(!Number.isInteger(e.capacity)||e.capacity<0||e.capacity>1000) throw Error('Capacity must be 0 (unlimited) to 1000.');
    return {id:e.id,title,type:e.type,status:e.status,visibility:'private',hostCharacterId:e.hostCharacterId,guildId:e.guildId||'',instanceId:e.instanceId||'',description:bounded(e.description??'',4000),location:bounded(e.location??'',300),startsAt,endsAt,capacity:e.capacity,createdAt:instant(e.createdAt),updatedAt:instant(e.updatedAt)};
  });
  if(new Set(clean.map(e=>e.id)).size!==clean.length)throw Error('Duplicate event ID.');
  const responses=rsvps.map(r=>{
    if(!clean.some(e=>e.id===r.eventId)||!owned(r.characterId)||!Object.hasOwn(RSVP_STATES,r.status))throw Error('Invalid character RSVP.');
    return {eventId:r.eventId,characterId:r.characterId,status:r.status,role:bounded(r.role??'',80),note:bounded(r.note??'',500),updatedAt:instant(r.updatedAt)};
  });
  if(new Set(responses.map(r=>JSON.stringify([r.eventId,r.characterId]))).size!==responses.length)throw Error('Duplicate RSVP for a character.');
  for(const e of clean)if(e.capacity&&responses.filter(r=>r.eventId===e.id&&r.status==='going').length>e.capacity)throw Error('This event is full. Choose Maybe or increase capacity.');
  return {events:clean,rsvps:responses};
}
export function saveEvent(state,fields,id=newId()) {
  const next=structuredClone(state);next.calendar??={events:[],rsvps:[]};
  const old=next.calendar.events.find(e=>e.id===id),now=new Date().toISOString();
  if(old&&old.status!=='scheduled')throw Error('Reopen the event before editing its details.');
  next.calendar.events=next.calendar.events.filter(e=>e.id!==id);
  next.calendar.events.push({...fields,id,status:'scheduled',visibility:'private',createdAt:old?.createdAt||now,updatedAt:now});
  next.calendar=normalizeEvents(next.calendar,next.characters,next.guilds);return next;
}
export function saveRSVP(state,eventId,characterId,status,role='',note='') {
  const next=structuredClone(state),e=next.calendar?.events.find(e=>e.id===eventId);
  if(!e||e.status!=='scheduled')throw Error('RSVPs are closed for this event.');
  next.calendar.rsvps=next.calendar.rsvps.filter(r=>!(r.eventId===eventId&&r.characterId===characterId));
  next.calendar.rsvps.push({eventId,characterId,status,role,note,updatedAt:new Date().toISOString()});
  next.calendar=normalizeEvents(next.calendar,next.characters,next.guilds);return next;
}
export function setEventStatus(state,id,status) {
  if(!['scheduled','completed','cancelled'].includes(status))throw Error('Invalid event status.');
  const next=structuredClone(state),e=next.calendar?.events.find(e=>e.id===id);if(!e)throw Error('Event no longer exists.');
  if(status==='completed'&&Date.parse(e.startsAt)>Date.now())throw Error('An event cannot be completed before it starts.');
  e.status=status;e.updatedAt=new Date().toISOString();return next;
}
export function rekeyEvents(state,oldId,newId) {
  for(const e of state.calendar?.events||[])if(e.hostCharacterId===oldId)e.hostCharacterId=newId;
  for(const r of state.calendar?.rsvps||[])if(r.characterId===oldId)r.characterId=newId;
}
export function removeCharacterEvents(state,id) {
  if(!state.calendar)return;
  state.calendar.events=state.calendar.events.filter(e=>e.hostCharacterId!==id);
  const retained=new Set(state.calendar.events.map(e=>e.id));
  state.calendar.rsvps=state.calendar.rsvps.filter(r=>r.characterId!==id&&retained.has(r.eventId));
}
export function characterEvents(state,id) {
  return (state.calendar?.events||[]).filter(e=>e.hostCharacterId===id||state.calendar.rsvps.some(r=>r.eventId===e.id&&r.characterId===id&&r.status==='going'));
}
export function fromLocalInput(value) {
  if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value))throw Error('Choose a date and time.');
  const d=new Date(value);
  if(!Number.isFinite(d.getTime())||toLocalInput(d.toISOString())!==value)throw Error('That local time does not exist. Choose another time.');
  return d.toISOString();
}
export function toLocalInput(value) {const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
export function calendarFile(event) {
  const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  const date=s=>s.replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  // Fold by UTF-8 byte count, without splitting a Unicode character (RFC 5545).
  const fold=line=>{const out=[];let part='',bytes=0;for(const c of line){const size=new TextEncoder().encode(c).length;if(bytes+size>74){out.push(part);part=' ';bytes=1;}part+=c;bytes+=size;}out.push(part);return out.join('\r\n');};
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Forever Armory//Private Events//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${event.id}@forever.dudgeon.io`,`DTSTAMP:${date(event.updatedAt)}`,`DTSTART:${date(event.startsAt)}`,`DTEND:${date(event.endsAt)}`,`SUMMARY:${escape(event.title)}`,`DESCRIPTION:${escape(event.description)}`,`LOCATION:${escape(event.location)}`,'CLASS:PRIVATE',`STATUS:${event.status==='cancelled'?'CANCELLED':'CONFIRMED'}`,'END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}
