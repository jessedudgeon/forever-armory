import {firebaseConfig} from './firebase-config.js';
import {recordsFor,stateFromRecords,diffRecords} from './cloud-model.js';
import {emptyState} from './model.js';
const SDK='https://www.gstatic.com/firebasejs/12.19.0/';
export const cloudConfigured=!!(firebaseConfig?.apiKey&&firebaseConfig?.projectId&&firebaseConfig?.appId&&firebaseConfig?.authDomain);
export function friendlyError(error){
 const messages={'auth/popup-closed-by-user':'Sign-in was cancelled. You can try again when ready.','auth/popup-blocked':'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.','auth/unauthorized-domain':'Google sign-in is not configured for this website address yet.','auth/operation-not-allowed':'Google sign-in has not been enabled for this site yet.','auth/network-request-failed':'Google could not be reached. Check your connection and try again.','permission-denied':'Your account cannot access this data. Try signing out and back in. If it continues, the site owner needs to check the database rules.','unavailable':'Cloud storage is temporarily unavailable. Your last saved data is unchanged. Try again when you are online.','resource-exhausted':'Cloud storage has reached its current usage limit. Your last saved data is unchanged.','conflict':'Your armory changed in another tab or device. Refresh your account, then retry this change.','session-changed':'Your sign-in session changed. This edit was not saved.','offline':'Connect to the internet before saving to your account.'};
 return messages[error?.code]||error?.message||'Something went wrong. Please try again.';
}
export async function connectCloud(callback){
 if(!cloudConfigured)return null;
 const[appSDK,A,F]=await Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-auth.js'),import(SDK+'firebase-firestore.js')]);
 const app=appSDK.initializeApp(firebaseConfig),auth=A.getAuth(app),db=F.initializeFirestore(app,{localCache:F.memoryLocalCache()});
 // Session-only authentication protects shared machines; cloud character data is never persisted locally.
 await A.setPersistence(auth,A.browserSessionPersistence);
 let user=null,epoch=0,revision=0,loaded=false,saving=false,lastState=emptyState(),unsubscribe=null,loadSerial=0,observedRevision=0;
 const error=code=>Object.assign(new Error(code),{code});
 const root=uid=>F.doc(db,'armories',uid),collection=uid=>F.collection(db,'armories',uid,'records');
 function emit(status,extra={}){callback({status,user:user?{uid:user.uid,name:user.displayName||'Adventurer',email:user.email||''}:null,...extra});}
 async function refresh(){
  const uid=user?.uid,session=epoch,serial=++loadSerial;
  if(!uid)return;
  loaded=false;emit('loading');
  try{
   // Bracket the record read with revision reads so a simultaneous transaction cannot mix versions.
   for(let attempt=0;attempt<3;attempt++){
    const before=await F.getDocFromServer(root(uid));
    const records=await F.getDocsFromServer(collection(uid));
    const after=await F.getDocFromServer(root(uid));
    if(epoch!==session||serial!==loadSerial||user?.uid!==uid)return;
    const rev=before.data()?.revision||0;
    if(rev!==(after.data()?.revision||0))continue;
    const state=stateFromRecords(records.docs.map(d=>d.data()));
    revision=rev;lastState=state;loaded=true;emit('ready',{state});return;
   }
   throw error('conflict');
  }catch(e){if(epoch===session&&serial===loadSerial)emit('error',{error:friendlyError(e)});}
 }
 A.onAuthStateChanged(auth,next=>{
  epoch++;loadSerial++;unsubscribe?.();unsubscribe=null;user=next;loaded=false;revision=0;observedRevision=0;lastState=emptyState();
  if(!next){emit('signed-out');return;}
  emit('loading');
  const uid=next.uid,session=epoch;
  unsubscribe=F.onSnapshot(root(uid),{includeMetadataChanges:true},snapshot=>{
   if(epoch!==session||snapshot.metadata.hasPendingWrites||snapshot.metadata.fromCache)return;observedRevision=snapshot.data()?.revision||0;if(saving)return;
   if(!loaded||(snapshot.data()?.revision||0)!==revision)void refresh();
  },e=>{if(epoch===session){loaded=false;emit('error',{error:friendlyError(e)});}});
 },e=>emit('error',{error:friendlyError(e)}));
 return {
  signIn:()=>{const provider=new A.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return A.signInWithPopup(auth,provider);},
  async signOut(){if(saving)throw new Error('Wait for your current save to finish before signing out.');await A.signOut(auth);},
  refresh,
  async save(next){
   const uid=user?.uid,session=epoch,baseRevision=revision;
   if(!uid||!loaded)throw error('session-changed');
   if(saving)throw new Error('A save is already in progress. Please wait.');
   if(!navigator.onLine)throw error('offline');
   saving=true;emit('saving');
   try{
    const[before,after]=await Promise.all([recordsFor(lastState),recordsFor(next)]);
    const change=diffRecords(before,after);
    if(!change.writes.length&&!change.deletes.length){emit('ready',{state:lastState});return;}
    await F.runTransaction(db,async tx=>{
     if(epoch!==session||auth.currentUser?.uid!==uid)throw error('session-changed');
     const existing=await tx.get(root(uid));
     if((existing.data()?.revision||0)!==baseRevision)throw error('conflict');
     for(const w of change.writes)tx.set(F.doc(collection(uid),w.id),w.data);
     for(const id of change.deletes)tx.delete(F.doc(collection(uid),id));
     tx.set(root(uid),{version:1,revision:baseRevision+1,updatedAt:F.serverTimestamp()});
    });
    if(epoch!==session||auth.currentUser?.uid!==uid)throw error('session-changed');
    revision=baseRevision+1;lastState=structuredClone(next);loaded=true;emit('ready',{state:lastState});
   }catch(e){if(epoch===session)emit('save-error',{error:friendlyError(e)});throw Object.assign(new Error(friendlyError(e)),{code:e.code});}
   finally{saving=false;if(epoch===session&&observedRevision>revision)void refresh();}
  }
 };
}
