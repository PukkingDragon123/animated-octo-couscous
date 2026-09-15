/* ============================================================
   THE TRANSLATION SWEEP

   Every string the game draws goes through L() on its way to the
   screen. So: hook L, walk the game through every screen there is,
   and print whatever came past without a Thai entry.

     node th/sweep.js          (needs playwright-core and a chromium)

   It prints how many distinct strings were drawn and lists the ones
   with no translation. Zero is the number to aim for.
   ============================================================ */
const {chromium}=require('playwright-core');
const path=require('path');
const EXE  = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const PAGE = 'file://'+path.resolve(__dirname,'..','index.html');
(async()=>{
  const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
  const pg=await b.newPage({viewport:{width:960,height:540}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(PAGE);
  await pg.waitForFunction(()=>WORLD_READY,null,{timeout:60000});
  await pg.waitForTimeout(500);
  const ev=(f,a)=>pg.evaluate(f,a);

  await ev(()=>{
    /* two hooks, because they catch different failures. L() catches a string
       that went looking for a translation and did not find one. pTxt() catches
       a string that never went looking at all — a hardcoded PRESS ENTER is
       invisible to the first hook and is the whole problem for the second. */
    window.__seen=new Set(); const oL=L;
    window.L=function(s){ if(typeof s==='string') window.__seen.add(s); return oL(s); };
    window.__drawn=new Set(); const oT=pTxt;
    window.pTxt=function(g,s,...r){
      if(typeof s==='string'||typeof s==='number') window.__drawn.add(String(s));
      return oT(g,s,...r); };
    setLang('th');
  });
  // title
  await ev(()=>{ for(let i=0;i<20;i++){ update(1/60); render(); } });
  // the whole story, beat by beat, drawing each chapter's ui
  await ev(()=>{ newGame();
    for(let c=0;c<STORY.length;c++){ chGo(c);
      for(let i=0;i<40;i++){ update(1/60); render(); }
      DLG=null; VIG=null; P.act=null; GS.state='play';
    }
  });
  // free play, everywhere on the map, at both ends of the clock
  await ev(()=>{ chGo('free'); CH.lock=false; GS.state='play';
    GS.mem={wake:1,take:1,drink:1,scale:1,bowl:1};
    FARM.rented=true; FARM.beds=5; FARM.paddies=2; FARM.trees=3; FARM.pen=1;
    POSOP.met=true; PHRA.shown=true; GS.q.metPhra=true; GS.merit=120; GS.baht=300;
    for(const s of SPIRITS){ s.met=true; s.friend=true; }
    GS.bag={rice:9,papaya:4,chili:3,seed:6,garland:2,somtam:2,bran:4,wood:6,plank:3,bug:2,egg:2,milk:2};
    for(const k in RECIPES) GS.learned[k]=1;
    for(let x=60;x<WORLD_W-60;x+=90){
      P.x=x; P.y=groundY(x); GS.camX=clamp(x-240,0,WORLD_W-480);
      for(const h of [7,13,19,23]){ DAY.min=h*60; setTOD(todFromClock(DAY.min),true);
        update(1/60); render(); checkInteract(); render(); }
    }
  });
  // every panel
  await ev(()=>{
    const draw=n=>{ for(let i=0;i<n;i++){ update(1/60); render(); } };
    /* Every row of every tab, with Inner Eye on: the wish under a villager's
       card only appears with the eye, and it was printing in English for
       weeks because this loop was moving TREE.col, which the ledger stopped
       using when it became four tabs of rows. */
    if(GS.skills) GS.skills.eye=1;
    for(let t=1;t<=4;t++){ GS.state='tree'; TREE.tab=t;
      for(let r=0;r<14;r++){ TREE.row=r; draw(2); }
      TREE.row=0; }
    GS.state='play';
    openStall(); draw(4); GS.state='play'; CNT=null;
    openOrderBoard(); draw(4); GS.state='play'; CNT=null;
    startActivity('cook'); draw(6); GS.state='play'; ACT=null;
    startActivity('craft'); draw(6); GS.state='play'; ACT=null;
    P.x=NPCS[0].x-20; P.y=groundY(P.x); openGive(NPCS[0]); draw(4); GS.state='play'; GIVE=null;
    DAY.card={day:3,shipped:0,coins:0,grew:0,merit:0,t:0.5}; draw(3);
    DAY.card={day:4,shipped:9,coins:70,grew:2,merit:5,t:0.5}; draw(3); DAY.card=null;
    DAY.sleeping=0.5; draw(3); DAY.sleeping=0;
    /* these three want their own state object set up first; draw them only,
       never step them, or they trip over the null they were handed */
    const only=n=>{ for(let i=0;i<n;i++) render(); };
    startCeremony(); draw(60); for(const l of CER_LINES){ DLG={lines:[l],i:0,ch:9999,done:null}; render(); }
    CER=null; DLG=null; GS.state='play';
    GS.state='end'; GS.t2=2; only(3); GS.state='play';
    for(const m of MEMS){ if(typeof startMem==='function'){ startMem(m.id); draw(8); } }
    GS.state='play'; IN=null;
  });
  /* Every conversation in the village, in every state it has.
     This was the hole: the sweep walked the panels and the story beats and
     never once opened a conversation, so the whole of VOICE — the way each
     person talks to a stranger, to somebody who has fed them, and when they
     are asking for something — sat there untranslated in plain sight. */
  await ev(()=>{
    const runAll=fn=>{ DLG=null; try{ fn(); }catch(e){}
      if(DLG){ const ls=DLG.lines.slice();
        for(const l of ls){ DLG={lines:[l],i:0,ch:9999,done:null,lt:0,hold:0,blip:0,said:0};
          try{ render(); }catch(e){} } }
      DLG=null; VIG=null; };
    GS.state='play'; GS.tut=99;
    for(const pass of [0,1,2]){
      for(const v of NPCS){
        GS.friends[v.id] = pass? 1 : 0;
        if(pass===2){ GS.q.req = null; }
        P.x=v.x-20; P.y=groundY(P.x);
        runAll(()=>talkVillager(v));
      }
      for(const id of ['mali','phra','tani','monk','uncle']){
        const f = window['talk'+id[0].toUpperCase()+id.slice(1)];
        if(typeof f==='function') runAll(f);
      }
    }
    for(const sp of SPIRITS){
      sp.met=false; sp.friend=false; runAll(()=>talkSpirit(sp));
      sp.met=true;  sp.friend=false; runAll(()=>talkSpirit(sp));
      sp.friend=true;               runAll(()=>talkSpirit(sp));
      sp.friend=false;
    }
    for(const v of NPCS) GS.friends[v.id]=0;
    /* pick() takes one line out of each list at random, so walking the
       conversations three times proves nothing about the fourth line in an
       array of five. Read the tables themselves as well. */
    const eat=o=>{ if(typeof o==='string'){ L(o); return; }
      if(o && typeof o==='object') for(const k of Object.keys(o)) try{ eat(o[k]); }catch(e){} };
    eat(VOICE);
    for(const sp of SPIRITS) eat([sp.hi, sp.about, sp.wish, sp.thanks, sp.line, sp.name]);
    for(const v of NPCS) eat([v.line, v.name]);
    GS.state='play';
  });
  // every hint the guide can say, and every tutorial step
  await ev(()=>{ for(const s of TUT){ guideSay(s.say,2); render(); } });
  // and the title screen again, this time with a farm behind it
  await ev(()=>{ GS.merit=41; DAY.n=12; GS.q.metPhra=true; saveGame();
    GS.state='title'; for(let i=0;i<6;i++){ update(1/60); render(); }
    GS.q.done=true; saveGame(); for(let i=0;i<6;i++){ update(1/60); render(); }
    GS.q.done=false; GS.state='play'; });
  const out = await ev(()=>{
    const miss=[]; for(const s of window.__seen){
      if(!s || TH[s]!==undefined) continue;
      if(!/[A-Za-z]{2}/.test(s)) continue;               // numbers, ฿, punctuation
      if(/^[a-z][a-zA-Z0-9_]*$/.test(s) && s.length<4) continue;
      miss.push(s);
    }
    /* Anything still in Latin once it has been through the dictionary. Both
       sets: pTxt catches a hardcoded string that never asked for a
       translation, and the lookup set catches everything the chat renderer
       draws through its own typewriter rather than through pTxt. */
    const all=new Set([...window.__drawn, ...window.__seen]);
    const latin=[]; for(const s of all){
      if(!s) continue;
      const t=L(s);
      if(!/[A-Za-z]/.test(t)) continue;
      latin.push(s===t? s : (s+'  ->  '+t));
    }
    return { total: window.__seen.size, painted: all.size,
             miss: miss.sort(), latin: latin.sort() };
  });
  console.log('strings drawn:', out.total, ' untranslated:', out.miss.length);
  for(const s of out.miss) console.log(JSON.stringify(s));
  console.log('strings painted:', out.painted, ' still Latin in Thai:', out.latin.length);
  for(const s of out.latin) console.log('  '+s);
  console.log(errs.length? 'ERRORS '+errs.slice(0,4).join(' | ') : 'no page errors');
  await b.close();
})();
