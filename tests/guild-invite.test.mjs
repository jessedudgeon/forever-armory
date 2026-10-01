import test from 'node:test';
import assert from 'node:assert/strict';
import {inviteMatches} from '../site/guild-invite.js';
const rows = [
  {id:'leader',name:'Lasmus Gravemoor',faction:'Horde'},
  {id:'one',name:'Élara Gravemoor',faction:'Horde'},
  {id:'two',name:'Elara Gravemoor',faction:'Horde'},
  {id:'three',name:'Elara Silverleaf',faction:'Alliance'},
];
test('invite search narrows by partial first, last or full name independent of case and accents', () => {
  assert.equal(inviteMatches(rows,'elA','leader','Both').length,3);
  assert.deepEqual(inviteMatches(rows,'  GRAVE ela ','leader','Horde').map(c=>c.id),['one','two']);
  assert.deepEqual(inviteMatches(rows,'silver','leader','Both').map(c=>c.id),['three']);
  assert.equal(inviteMatches(rows,'silver','leader','Horde').length,0);
  assert.equal(inviteMatches(rows,'lasmus','leader','Horde').length,0);
  assert.equal(inviteMatches(rows,'  ','leader','Both').length,0);
  assert.equal(inviteMatches(rows,'missing','leader','Both').length,0);
});
