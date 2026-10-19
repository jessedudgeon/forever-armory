// Data-only reader for WoW SavedVariables. No Lua/JS evaluation or function calls.
export function readSavedVariables(source) {
  if (typeof source !== 'string' || source.length > 20e6) throw Error('Choose a SavedVariables file smaller than 20 MB.');
  let i=0, nodes=0;
  const error=()=>{throw Error(`Unsupported or incomplete SavedVariables data near character ${i}. Log out before copying the file.`);};
  const skip=()=>{while(i<source.length){if(/\s/.test(source[i]))i++;else if(source.slice(i,i+2)==='--'){const end=source.indexOf('\n',i);i=end<0?source.length:end+1;}else break;}};
  const take=c=>{skip();if(source[i]!==c)error();i++;};
  const word=()=>{skip();const m=/^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(i));if(!m)error();i+=m[0].length;return m[0];};
  function string(){const quote=source[i++], bytes=[], enc=new TextEncoder();const append=s=>bytes.push(...enc.encode(s));
    while(i<source.length){let c=source[i++];if(c===quote)return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bytes));
      if(c==='\\'){c=source[i++];const escapes={a:'\x07',b:'\b',f:'\f',n:'\n',r:'\r',t:'\t',v:'\x0b','\\':'\\','"':'"',"'":"'"};
        if(/[0-9]/.test(c||'')){let n=c;for(let j=0;j<2&&/[0-9]/.test(source[i]||'');j++)n+=source[i++];if(+n>255)error();bytes.push(+n);}
        else if(Object.hasOwn(escapes,c))append(escapes[c]);else if(c==='\n')append(c);else error();
      }else{if(c==='\n'||c==='\r')error();if(c.charCodeAt(0)>=0xd800&&c.charCodeAt(0)<=0xdbff)c+=source[i++];append(c);}
    }error();
  }
  function value(depth=0){skip();if(++nodes>1000000||depth>40)throw Error('SavedVariables data is too complex.');
    if(source[i]==='"'||source[i]==="'")return string();
    if(source[i]==='{'){i++;const out=Object.create(null);let index=1;skip();while(source[i]!=='}'){
      let key,v;if(source[i]==='['){i++;key=value(depth+1);take(']');take('=');v=value(depth+1);}
      else if(/^[A-Za-z_]\w*\s*=/.test(source.slice(i))){key=word();take('=');v=value(depth+1);}
      else{key=index++;v=value(depth+1);}
      if(!['string','number'].includes(typeof key)||['__proto__','constructor','prototype'].includes(String(key))||Object.hasOwn(out,key))error();out[key]=v;
      skip();if(source[i]===','||source[i]===';'){i++;skip();}else if(source[i]!=='}')error();
    }i++;return out;}
    const number=/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(i));if(number){i+=number[0].length;const n=Number(number[0]);if(!Number.isFinite(n))error();return n;}
    const w=word();if(w==='true')return true;if(w==='false')return false;if(w==='nil')return null;error();
  }
  const out=Object.create(null);skip();while(i<source.length){const name=word();if(Object.hasOwn(out,name))error();take('=');out[name]=value();skip();if(source[i]===';')i++;skip();}return out;
}
