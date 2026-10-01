/* ============================================================
   THE FOURTH NET: read the source, not the run.

   Walking the game finds a line only if the walk triggers it.
   Walking the tables finds a line only if it lives in a table.
   "That's my field. Two seasons, nobody's turned it." lives in a
   function, behind a chapter and a position on the road, and slipped
   both. So: tokenise the whole built script, take every string
   literal in it, keep the ones that read like something a person
   says, and ask the dictionary about each.
   ============================================================ */
const fs=require('fs');
const path=require('path');
const SRC=fs.readFileSync(process.argv[2]||path.resolve(__dirname,'..','index.html'),'utf8');

/* a small tokeniser: enough to know a string from a comment from a regex */
function literals(s){
  const out=[]; let i=0, prev='';
  const sig=c=>!/\s/.test(c);
  while(i<s.length){
    const c=s[i];
    if(c==='/' && s[i+1]==='/'){ while(i<s.length && s[i]!=='\n') i++; continue; }
    if(c==='/' && s[i+1]==='*'){ i+=2; while(i<s.length && !(s[i]==='*'&&s[i+1]==='/')) i++; i+=2; continue; }
    if(c==='/' && /[(,=:[!&|?{};+\-*%<>~^]/.test(prev)){      // a regex, not a divide
      i++; let cls=false;
      while(i<s.length){ const d=s[i];
        if(d==='\\'){ i+=2; continue; }
        if(d==='[') cls=true; else if(d===']') cls=false;
        else if(d==='/' && !cls){ i++; break; }
        else if(d==='\n') break;
        i++; }
      prev='/'; continue;
    }
    if(c==='\''||c==='"'||c==='`'){
      const q=c; let j=i+1, buf='';
      while(j<s.length){ const d=s[j];
        if(d==='\\'){ buf+= (s[j+1]==='n'?'\n': s[j+1]==='t'?'\t': s[j+1]); j+=2; continue; }
        if(d===q) break;
        if(q!=='`' && d==='\n') break;          // unterminated; bail
        buf+=d; j++; }
      out.push({s:buf, at:i});
      i=j+1; prev=q; continue;
    }
    if(sig(c)) prev=c;
    i++;
  }
  return out;
}

/* what counts as something a person reads */
const prose = t =>
  /[A-Za-z]{2}/.test(t) &&
  t.length>6 &&
  /\s/.test(t) &&                                  // at least two words
  !/[{}<>=+\\]|\$\{|\|\|/.test(t) &&               // code, css, selectors, templates
  !/^[#.]/.test(t) &&
  !/^(rgba?|hsla?)\(/.test(t) &&
  !/^[a-z-]+\s*:\s*/.test(t) &&                    // css declarations
  !/^\s|\s$/.test(t) &&
  /[A-Za-z]/.test(t[0]) &&
  !/^(px|em|rem)\b/.test(t);

/* Two strings are deliberately English and always will be. "use strict" is
   not prose at all, and the no-Thai-font notice is the one line that appears
   precisely when the device cannot draw Thai. */
const KEEP_ENGLISH = new Set(['use strict','this device has no Thai font']);
const lines=literals(SRC).map(x=>x.s);
const seen=new Set(), cands=[];
for(const t of lines){ if(!prose(t)||seen.has(t)||KEEP_ENGLISH.has(t)) continue; seen.add(t); cands.push(t); }
module.exports = { literals, prose, candidates: cands, KEEP_ENGLISH };
if(require.main===module){
  fs.writeFileSync('/tmp/cands.json', JSON.stringify(cands));
  console.log(lines.length+' string literals, '+cands.length+' read like prose');
}
