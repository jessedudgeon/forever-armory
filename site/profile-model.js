import {bounded, httpsUrl} from './guild-model.js';
export const RELATIONSHIP_TYPES = ['friend','rival','family','mentor','student','guildmate','romantic','enemy','custom'];
export function publicStory(input = {}) {
 return {description:bounded(input.description||'',2000),appearance:bounded(input.appearance||'',2000),
  personality:bounded(input.personality||'',2000),history:bounded(input.history||'',6000),
  portraitUrl:httpsUrl(input.portraitUrl),headerUrl:httpsUrl(input.headerUrl),
  professions:bounded(input.professions||'',300),designation:bounded(input.designation||'',80)};
}
export function relationshipFields(type,note) {
 if(!RELATIONSHIP_TYPES.includes(type)) throw Error('Choose a relationship type.');
 return {type,note:bounded(note||'',500)};
}
