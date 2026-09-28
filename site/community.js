// Shared data lives outside private armories and is governed by dedicated Firestore rules.
export function communityClient(F,db,auth){
 const col=(...p)=>F.collection(db,...p),doc=(...p)=>F.doc(db,...p);
 const uid=()=>{if(!auth.currentUser)throw Error('Sign in with Google to use community features.');return auth.currentUser.uid;};
 const rows=async q=>(await F.getDocsFromServer(q)).docs.map(d=>({...d.data(),id:d.id}));
 const bounded=(v,max)=>String(v||'').trim().slice(0,max);
 return {
  async editor(){return !!(await auth.currentUser?.getIdTokenResult())?.claims?.editor;},
  guilds:()=>rows(F.query(col('guilds'),F.limit(100))),
  async guild(id){const s=await F.getDocFromServer(doc('guilds',id));if(!s.exists())throw Error('Guild not found.');return {...s.data(),id:s.id};},
  guildRecords:id=>rows(F.query(col('guilds',id,'records'),F.limit(300))),
  requests:id=>rows(F.query(col('guilds',id,'requests'),F.limit(100))),
  async createGuild(input){const ownerUid=uid();const ref=await F.addDoc(col('guilds'),{name:bounded(input.name,80),description:bounded(input.description,1000),faction:input.faction,playStyle:input.playStyle,ownerUid,memberUids:[ownerUid],officerUids:[],createdAt:F.serverTimestamp()});return ref.id;},
  requestJoin:id=>F.setDoc(doc('guilds',id,'requests',uid()),{uid:uid(),name:bounded(auth.currentUser.displayName||'Adventurer',80),createdAt:F.serverTimestamp()}),
  async membership(id,member,action){const owner=uid();await F.runTransaction(db,async tx=>{const ref=doc('guilds',id),s=await tx.get(ref),g=s.data();if(g.ownerUid!==owner)throw Error('Only the guild owner can manage membership.');if(member===owner)throw Error('The owner cannot remove their own membership.');const members=new Set(g.memberUids),officers=new Set(g.officerUids);if(action==='approve'){const req=await tx.get(doc('guilds',id,'requests',member));if(!req.exists())throw Error('Join request no longer exists.');members.add(member);}if(action==='remove'){members.delete(member);officers.delete(member);}if(action==='officer'){if(!members.has(member))throw Error('Approve membership first.');officers.add(member);}if(action==='member')officers.delete(member);tx.update(ref,{memberUids:[...members],officerUids:[...officers]});if(action==='approve'||action==='reject')tx.delete(doc('guilds',id,'requests',member));});},
  async record(guildId,kind,payload,id){const ownerUid=uid(),ref=id?doc('guilds',guildId,'records',id):F.doc(col('guilds',guildId,'records'));await F.setDoc(ref,{kind,ownerUid,payload:JSON.stringify(payload),updatedAt:F.serverTimestamp()});return ref.id;},
  deleteRecord:(guild,id)=>F.deleteDoc(doc('guilds',guild,'records',id)),
  published:()=>rows(F.query(col('contributions'),F.where('status','==','published'),F.limit(100))),
  myContributions:()=>rows(F.query(col('contributions'),F.where('authorUid','==',uid()),F.limit(100))),
  pending:()=>rows(F.query(col('contributions'),F.where('status','==','pending'),F.limit(100))),
  async contribute(input){return F.addDoc(col('contributions'),{authorUid:uid(),authorName:bounded(auth.currentUser.displayName||'Adventurer',80),type:input.type,title:bounded(input.title,150),body:bounded(input.body,12000),source:bounded(input.source,1000),target:bounded(input.target,250),build:bounded(input.build,100),status:'pending',createdAt:F.serverTimestamp(),updatedAt:F.serverTimestamp()});},
  moderate:(id,status)=>F.updateDoc(doc('contributions',id),{status,updatedAt:F.serverTimestamp()}),
  withdraw:id=>F.deleteDoc(doc('contributions',id))
 };
}
