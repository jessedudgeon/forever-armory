// Read the single declared SavedVariables string. Never evaluate uploaded Lua.
export function sessionExportText(source) {
  if(typeof source!=='string' || source.length>20e6)throw Error('Choose a SavedVariables file smaller than 20 MB.');
  const matches=[...source.matchAll(/^\s*ForeverArmorySessionExport\s*=\s*/gm)];
  if(matches.length!==1)throw Error('Choose the character SavedVariables/ForeverArmory.lua file with one saved session export. Log out normally with addon 0.3.0 first.');
  let i=matches[0].index+matches[0][0].length;
  const quote=source[i++];
  if(quote!== '"' && quote!=="'")throw Error('No readable saved session export. Log out normally with addon 0.3.0 first.');
  const bytes=[],encoder=new TextEncoder();
  const append=s=>{for(const b of encoder.encode(s))bytes.push(b);};
  const escapes={a:'\x07',b:'\b',f:'\f',n:'\n',r:'\r',t:'\t',v:'\x0b',"\\":"\\",'"':'"',"'":"'"};
  while(i<source.length) {
    const c=source[i++];
    if(c===quote) {
      const text=new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(bytes));
      if(text.length>1e6)throw Error('Use a session export smaller than 1 MB.');
      return text;
    }
    if(c==='\\') {
      const e=source[i++];
      if(/[0-9]/.test(e||'')) {
        let number=e;
        for(let n=0;n<2 && /[0-9]/.test(source[i]||'');n++)number+=source[i++];
        const byte=Number(number);if(byte>255)throw Error('Invalid Lua string escape.');bytes.push(byte);
      } else if(Object.hasOwn(escapes,e))append(escapes[e]);
      else if(e==='\n')append('\n');
      else if(e==='\r') {if(source[i]==='\n')i++;append('\n');}
      else throw Error('Unsupported Lua string escape in session export.');
    } else {
      if(c==='\n'||c==='\r')throw Error('Invalid saved session string.');
      // Encode code points together so supplementary Unicode survives.
      if(c.charCodeAt(0)>=0xd800 && c.charCodeAt(0)<=0xdbff && i<source.length)append(c+source[i++]);
      else append(c);
    }
    if(bytes.length>4e6)throw Error('Saved session export is too large.');
  }
  throw Error('Incomplete saved session export. Wait for WoW to finish logging out before importing.');
}
