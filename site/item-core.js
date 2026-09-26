const MARKER_RE=/^\[\[farmory-item:([^\]]+)\]\]\n?/;

export function normalizeIcon(value){
 if(value==null)return '';
 if(typeof value==='number')return '';
 let text=String(value).trim();
 if(!text)return '';
 text=text.replace(/\\/g,'/').split('/').pop()||text;
 text=text.replace(/\.(blp|tga|png|jpg|jpeg)$/i,'');
 return text.toLowerCase();
}

export function iconUrl(icon,size='large'){
 const slug=normalizeIcon(icon);
 return slug?`https://wow.zamimg.com/images/wow/icons/${size}/${encodeURIComponent(slug)}.jpg`:'';
}

export function parseItemGoalNotes(notes){
 const text=String(notes||'');
 const match=text.match(MARKER_RE);
 if(!match)return {item:null,notes:text};
 try{
  const item=JSON.parse(decodeURIComponent(match[1]));
  if(!item||!Number.isInteger(Number(item.id))||Number(item.id)<1)throw new Error('bad item');
  item.id=Number(item.id);
  item.target=Math.max(1,Math.floor(Number(item.target)||1));
  item.current=Math.max(0,Math.floor(Number(item.current)||0));
  item.icon=normalizeIcon(item.icon);
  return {item,notes:text.slice(match[0].length)};
 }catch{return {item:null,notes:text.replace(MARKER_RE,'')};}
}

export function encodeItemGoalNotes(item,notes=''){
 if(!item||!Number.isInteger(Number(item.id))||Number(item.id)<1)return String(notes||'');
 const clean={
  id:Number(item.id),
  name:String(item.name||`Item ${item.id}`).slice(0,150),
  icon:normalizeIcon(item.icon),
  quality:item.quality==null?'':String(item.quality).slice(0,30),
  target:Math.max(1,Math.floor(Number(item.target)||1)),
  current:Math.max(0,Math.floor(Number(item.current)||0))
 };
 return `[[farmory-item:${encodeURIComponent(JSON.stringify(clean))}]]${notes?'\n'+String(notes):''}`;
}

export function progressPercent(current,target){
 const max=Math.max(1,Number(target)||1),value=Math.max(0,Number(current)||0);
 return Math.max(0,Math.min(100,Math.round(value/max*100)));
}

export function compactItem(raw={}){
 const id=Number(raw.itemId??raw.id);
 if(!Number.isInteger(id)||id<1)return null;
 return {
  id,
  name:String(raw.name||`Item ${id}`),
  icon:normalizeIcon(raw.icon??raw.iconName??raw.texture),
  quality:raw.quality??'',
  class:raw.class??'',
  subclass:raw.subclass??'',
  slot:raw.slot??'',
  itemLevel:raw.itemLevel??null,
  requiredLevel:raw.requiredLevel??null,
  tooltip:Array.isArray(raw.tooltip)?raw.tooltip:[],
  source:raw.source??null,
  link:raw.itemLink??raw.link??''
 };
}
