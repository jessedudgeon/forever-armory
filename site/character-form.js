import {CLASSES} from './model.js';
import {racesForFaction,classesForSelection} from './character-options.js';

const raceLabel=race=>race==='Undead'?'Undead (Forsaken)':race;
const normalizeRace=race=>({Forsaken:'Undead','High Order Skyborne':'Skyborne','Windshaper Skyborne':'Skyborne'})[race]||race||'';

function setOptions(select,placeholder,options,current,label=value=>value){
 select.innerHTML=`<option value="">${placeholder}</option>`+options.map(value=>`<option value="${value}">${label(value)}</option>`).join('');
 select.value=options.includes(current)?current:'';
}

function enhanceCharacterForm(){
 const form=document.querySelector('#manual-form');
 if(!form||form.dataset.foreverEnhanced==='true')return;
 form.dataset.foreverEnhanced='true';

 const faction=form.elements.faction;
 const oldRace=form.elements.race;
 const characterClass=form.elements.class;
 const level=form.elements.level;
 const playStyle=form.elements.playStyle;
 if(!faction||!oldRace||!characterClass)return;

 const initialRace=normalizeRace(oldRace.value);
 const initialClass=characterClass.value;
 const race=document.createElement('select');
 race.name='race';
 race.required=true;
 race.setAttribute('aria-label','Race');
 oldRace.replaceWith(race);
 characterClass.required=true;

 const labelFor=control=>control.closest('label');
 const playLabel=labelFor(playStyle),factionLabel=labelFor(faction),raceFieldLabel=labelFor(race),classLabel=labelFor(characterClass),levelLabel=labelFor(level);
 if(playLabel&&factionLabel&&raceFieldLabel&&classLabel&&levelLabel){
  playLabel.after(factionLabel);
  factionLabel.after(raceFieldLabel);
  raceFieldLabel.after(classLabel);
  classLabel.after(levelLabel);
 }

 function refreshClasses(preferred=''){
  const options=classesForSelection(faction.value,race.value);
  setOptions(characterClass,race.value?'Choose a class…':'Choose a race first…',options,preferred,key=>CLASSES[key]?.[0]||key);
  characterClass.disabled=!race.value;
 }

 function refreshRaces(preferredRace='',preferredClass=''){
  const options=racesForFaction(faction.value);
  setOptions(race,faction.value?'Choose a race…':'Choose a faction first…',options,normalizeRace(preferredRace),raceLabel);
  race.disabled=!faction.value;
  refreshClasses(preferredClass);
 }

 faction.addEventListener('change',()=>refreshRaces());
 race.addEventListener('change',()=>refreshClasses());
 refreshRaces(initialRace,initialClass);
}

enhanceCharacterForm();
new MutationObserver(enhanceCharacterForm).observe(document.querySelector('#modal-content')||document.body,{childList:true,subtree:true});
