import {publicCharacter,publicPost,publicIdValid,mergedFeed} from './community-model.js';
export function communityService(F,db,auth) {
  const doc=(...p)=>F.doc(db,...p),col=(...p)=>F.collection(db,...p);
  const requireUser=()=>{if(!auth.currentUser)throw Error('Sign in with Google to use character social features.');return auth.currentUser.uid;};
  const checkId=id=>{if(!publicIdValid(id))throw Error('Invalid public character ID.');return id;};
  const read=async ref=>{const d=await F.getDocFromServer(ref);return d.exists()?{id:d.id,...d.data()}:null;};
  return {
    async available(){try{return (await read(doc('communityConfig','status')))?.enabled===true;}catch(e){if(e.code==='permission-denied')return false;throw e;}},
    async owned(){const uid=requireUser();return (await F.getDocsFromServer(F.query(col('communityOwners'),F.where('uid','==',uid),F.limit(100)))).docs.map(d=>({id:d.id,...d.data()}));},
    profile:id=>read(doc('communityCharacters',checkId(id))),
    async directory(cursor){const query=[F.orderBy('name'),F.limit(20)];if(cursor)query.push(F.startAfter(cursor));const result=await F.getDocsFromServer(F.query(col('communityCharacters'),...query));return {rows:result.docs.map(d=>({id:d.id,...d.data()})),cursor:result.docs.at(-1),done:result.size<20};},
    async publish(id,character,profile){checkId(id);const uid=requireUser(),projection=publicCharacter(character,profile);await F.runTransaction(db,async tx=>{
      const owner=await tx.get(doc('communityOwners',id)),old=await tx.get(doc('communityCharacters',id));
      if(owner.exists()&&owner.data().uid!==uid)throw Error('This public identity belongs to another player.');
      tx.set(doc('communityOwners',id),{uid,characterKey:character.id,createdAt:owner.data()?.createdAt||F.serverTimestamp()});
      tx.set(doc('communityCharacters',id),{...projection,createdAt:old.data()?.createdAt||F.serverTimestamp(),updatedAt:F.serverTimestamp()});
    });},
    async unpublish(id){requireUser();await F.deleteDoc(doc('communityCharacters',checkId(id)));},
    async post(authorId,type,body,id=crypto.randomUUID()){requireUser();checkId(authorId);checkId(id);const payload=publicPost(type,body);await F.runTransaction(db,async tx=>{const ref=doc('communityCharacters',authorId,'posts',id),old=await tx.get(ref);tx.set(ref,{...payload,createdAt:old.data()?.createdAt||F.serverTimestamp(),updatedAt:F.serverTimestamp()});});return id;},
    async deletePost(authorId,id){requireUser();await F.deleteDoc(doc('communityCharacters',checkId(authorId),'posts',checkId(id)));},
    async following(id){requireUser();return (await F.getDocsFromServer(F.query(col('communityOwners',checkId(id),'following'),F.orderBy(F.documentId()),F.limit(20)))).docs.map(d=>d.id);},
    async isFollowing(from,to){requireUser();return !!await read(doc('communityOwners',checkId(from),'following',checkId(to)));},
    async follow(from,to,on){requireUser();checkId(from);checkId(to);if(from===to)throw Error('A character cannot follow itself.');const ref=doc('communityOwners',from,'following',to);if(on)await F.setDoc(ref,{createdAt:F.serverTimestamp()});else await F.deleteDoc(ref);},
    async react(author,post,actor,on){requireUser();const ref=doc('communityCharacters',checkId(author),'posts',checkId(post),'reactions',checkId(actor));if(on)await F.setDoc(ref,{kind:'appreciate',createdAt:F.serverTimestamp()});else await F.deleteDoc(ref);},
    async reactions(author,post,actor){const value=await read(doc('communityCharacters',checkId(author),'posts',checkId(post),'reactions',checkId(actor)));return !!value;},
    feed(ids){return mergedFeed(ids,async(id,cursor)=>{const profile=await read(doc('communityCharacters',checkId(id)));if(!profile)return {rows:[],done:true,cursor:null};const q=[F.orderBy('createdAt','desc'),F.limit(20)];if(cursor)q.push(F.startAfter(cursor));const result=await F.getDocsFromServer(F.query(col('communityCharacters',id,'posts'),...q));return {rows:result.docs.map(d=>({id:d.id,...d.data(),authorId:id,authorName:profile.name,sortTime:d.data().createdAt.toMillis()})),cursor:result.docs.at(-1),done:result.size<20};});}
  };
}
