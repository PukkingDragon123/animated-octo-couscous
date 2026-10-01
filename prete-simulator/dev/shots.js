/* The README's pictures of this round, out of the running game with the
   light pass on:  node dev/shots.js [name ...]   (all of them if none given)

   Each one is a place and an hour, a few seconds of the world run so the
   smoke is up and the birds are out, and a screenshot at 3x. */
const { chromium } = require('playwright-core');
const path = require('path');
const OUT = path.resolve(__dirname, '..', 'screenshots');
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const SW = ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

/* a village shot: day, hour, where he stands, and anything else to set up */
const V = (day, hr, x, extra, keep, js) => ({ kind: 'village', day, hr, x, extra: extra || '', keep: keep || null, js: js || null });
const SHOTS = {
  'elephant-morning': V(1, 6.85, 2470, 'ELE.x=2600; ELE.lastX=ELE.x; window.elePlan=()=>({x:ELE.x-30,at:"walk"});'),
  'elephant-bath':    V(1, 13.1, 688, 'ELE.x=ELE_BATH; ELE.lastX=ELE.x; ELE.t=5.5;', 'Boonmee'),
  'songkran':         V(12, 13.4, 2770, 'GS.skills.can=true; GS.q.tool="can";', '^splash '),
  'light-night':      V(1, 20.6, 2280, ''),
  'light-dawn':       V(3, 6.55, 2330, 'roundReset(); ROUND.state="walk"; ROUND.lead=2474; for(const gv of ROUND.givers) if(gv.x+16>2474) gv.served=true; ELE.x=2600; ELE.lastX=ELE.x; window.elePlan=()=>({x:ELE.x-30,at:"walk"});'),
  'water-river':      V(1, 6.35, 11000, ''),
  'trees-and-clouds': V(1, 9.2, 2620, ''),
  'heaven-erawan':      { kind: 'heaven', x: 1420 },
  'heaven-erawan-lift': { kind: 'heaven', x: 1450, lift: true },
  'the-controls':     { kind: 'phone', x: 2600, hr: 6.7 },
  'wind-in-the-trees': V(1, 9.2, 2600, '', null, 'for(let i=0;i<70;i++){ GUSTS.length=0; GUSTS.push({x:2600,v:40,w:600,a:1.4,aT:1.4,t:1,life:99}); update(1/60); P.x=2600; GS.camX=2360; } GS.plate=1; render(); GS.plate=0;'),
  'flags-at-the-wat':  V(1, 9.2, 3990, '', null, 'for(let i=0;i<200;i++){ update(1/60); P.x=3990; GS.camX=3770; } GS.plate=1; render(); GS.plate=0;'),
  'washing-line':      V(1, 9.2, 1700, '', null, 'for(let i=0;i<200;i++){ update(1/60); P.x=1700; GS.camX=1440; } GS.plate=1; render(); GS.plate=0;'),
  /* this round's: the ledger as a book, the painted map, the icons, the toolbar */
  'ledger-map':       V(1, 9, 2400, '', null, 'GS.seenX={}; for(let x=0;x<WORLD_W;x+=90) markSeen(x); GS.state="tree"; TREE.tab=3; render();'),
  'ledger-catches':   V(1, 9, 2400, '', null, 'GS.state="tree"; TREE.tab=5; for(const id of [...DEX_BUGS.slice(0,11),...DEX_FISH.slice(0,8),...DEX_FINDS.slice(0,6)]) dexAdd(id); render();'),
  'toolbar-and-people': V(1, 9.4, 2700, '', null, 'for(const k of ["banana","mango","chili","coconut","somtam","basil","egg","wood"]) GS.bag[k]=3; render();'),
  'the-icons':        V(1, 9, 2400, '', null, `render(); const c=document.createElement('canvas'); c.width=360; c.height=202;
    c.style.cssText='position:fixed;left:0;top:0;width:1440px;height:810px;image-rendering:pixelated;z-index:99'; document.body.appendChild(c);
    const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#f6e8d8'; g.fillRect(0,0,360,202);
    Object.keys(ITEMS).forEach((id,i)=>drawIcon(g,id,14+(i%16)*22,14+((i/16)|0)*24,1));
    TOOL_ORDER.forEach((t,i)=>toolIcon(g,t,14+i*22,184,1.2));`),
  /* this round's: the start graded as night, the new map of the road through
     Isan, the cats and dogs, the sugar palms */
  'the-title':        { kind: 'title' },
  'the-first-night':  { kind: 'start' },
  'map-early':        V(1, 9, 2400, '', null, 'GS.seenX={}; for(let x=0;x<3400;x+=90) markSeen(x); P.x=2400; PMAP.key=""; GS.state="tree"; TREE.tab=3; GS.t=3.3; render();'),
  'the-cats-and-dogs': V(1, 9, 2400, '', null, `render(); const c=document.createElement('canvas'); c.width=360; c.height=202;
    c.style.cssText='position:fixed;left:0;top:0;width:1440px;height:808px;image-rendering:pixelated;z-index:99'; document.body.appendChild(c);
    const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#c8bc88'; g.fillRect(0,0,360,202);
    for(let y=0;y<202;y+=2) for(let x=(y%4?1:0);x<360;x+=4) if(((x*7+y*13)%11)<2){ g.fillStyle='#bcb07c'; g.fillRect(x,y,1,1); }
    const row=(y)=>{ g.fillStyle='#a89a64'; g.fillRect(0,y+1,360,1); };
    const cats=[['Meow-Meow','siamese'],['Noodle','korat'],["The Monk's",'manee'],['Two-Socks','tux'],['Shop Cat','calico'],['Fat Somchai','greytab'],['Biscuit','biscuit'],['the cat','ginger']];
    row(52); cats.forEach(([n,k],i)=>{ const x=24+i*44; drawCat(g,{x,y:52,face:i%2?-1:1,anim:1.1+i,state:i===7?'walk':'sit',phase:1,coat:k,collar:i===3}); pTxt(g,n,x,62,'#3a2618',6,'center'); });
    row(108); cats.forEach(([n,k],i)=>{ const x=24+i*44; drawCat(g,{x,y:108,face:1,anim:2+i,state:i%2?'sleep':'walk',phase:i,coat:k}); });
    const dogs=[['Daeng','red'],['Tao','blacktan'],['Moo','patch'],['Lucky','tan'],['Boss','black'],['Crossroad','dusty'],['Nine','brindle']];
    row(160); dogs.forEach(([n,k],i)=>{ const x=26+i*44; drawRoadDog(g,{x,y:160,face:1,st:i===2?'sleep':'up',t:1+i,sp:i===4,bark:i===5?0.12:0,look:k,collar:i===0}); pTxt(g,n,x,172,'#3a2618',6,'center'); });
    drawFluffyDog(g,{x:334,y:160,face:-1,t:1,st:'sit'}); pTxt(g,'Gohan',334,172,'#3a2618',6,'center');
    pTxt(g,'the cats and the dogs',180,196,'#3a2618',7,'center');`),
  'sugar-palms':      V(3, 6.45, 9790, ''),
  'dogs-asleep':      V(1, 13.2, 8190, '', null, 'P.x=8900; for(let i=0;i<900;i++){ DAY.min=13.2*60; update(1/30); P.x=8900; GS.camX=7950; DLG=null; VIG=null; HINT=null; } GS.plate=1; render(); GS.plate=0;'),
  'gohan':            V(1, 9.2, 6230, 'const g=PETS.find(p=>p.coat==="fluffy"); g.x=6180; g.st="sit"; g.face=1;'),
  'the-old-forest':   V(1, 9.4, 5090, ''),
};

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);
  const b = await chromium.launch({ executablePath: EXE, args: SW });
  for (const name of want) {
    const S = SHOTS[name]; if (!S) { console.log('no such shot', name); continue; }
    const phone = S.kind === 'phone';
    const p = await b.newPage(phone ? { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
                                    : { viewport: { width: 1440, height: 810 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
    await p.waitForFunction(() => typeof WORLD_READY !== 'undefined' && WORLD_READY, null, { timeout: 60000 });
    await p.evaluate((S) => {
      /* stop the game's own loop, or it draws over the picture before it is taken */
      window.requestAnimationFrame = () => 0;
      setLang('en');
      const clean = () => { DLG = null; VIG = null; HINT = null; GS.toasts.length = 0;
        for (const n of NPCS) { n.bub = null; } };
      if (S.kind === 'title') { GS.state = 'title'; TT.plate = 0; return; }
      if (S.kind === 'start') { clearSave(); newGame(); for (let i = 0; i < 90; i++) update(1 / 60); clean(); return; }
      if (S.kind === 'heaven') {
        newGame(); GS.mem = { wake: 1, take: 1, drink: 1, scale: 1, bowl: 1 }; GS.q.metPhra = true;
        startDream({ first: true }); dreamGo('arrive'); HVN.said0 = 1; HVN.greeted = true; HVN.nonthokSeen = true;
        P.x = S.x; P.y = heavenGround(S.x);
        for (let i = 0; i < 150; i++) { DLG = null; update(1 / 60); P.x = S.x; P.vx = 0; }
        if (S.lift) { P.x = HV_X.erawan - 70; HVN.lifted = false; erawanScratch(); for (let i = 0; i < 100; i++) { DLG = null; update(1 / 60); } }
        DLG = null; return;
      }
      newGame(); chGo('free'); CH.lock = false; GS.state = 'play'; GS.tut = 99; clean();
      GS.q.metPhra = true; GS.q.blessed = true; PHRA.shown = true; FARM.rented = true;
      GS.mem = { wake: 1, take: 1, drink: 1, scale: 1, bowl: 1 };
      if (S.kind === 'phone') TOUCH.on = true;
      DAY.n = S.day || 1; const MIN = S.hr * 60;
      const hold = () => { DAY.min = MIN; setTOD(todFromClock(MIN), true); P.x = S.x; P.y = groundY(S.x); P.vx = 0;
        GS.camX = clamp(S.x - 240, 0, WORLD_W - 480); clean(); };
      hold();
      for (let i = 0; i < 240; i++) { update(1 / 30); hold(); }
      if (S.extra) (new Function(S.extra))();
      for (let i = 0; i < 40; i++) { update(1 / 30); hold(); }
    }, S);
    /* the frame the game had already asked for runs now, and then nothing does */
    await p.waitForTimeout(150);
    await p.evaluate((S) => {
      if (S.kind === 'heaven') { DLG = null; render(); return; }
      if (S.kind === 'title') { GS.t = 2; drawTitle(); return; }
      if (S.kind === 'start') { HINT = null; render(); return; }
      if (S.js) { (new Function(S.js))(); return; }
      checkInteract();
      /* one prompt where the picture is about one, and none where it is not */
      if (S.keep) { const re = new RegExp(S.keep), k = SPOTS.filter(q => re.test(q.txt));
        SPOTS.length = 0; SPOTS.push(...k); PROMPT = SPOTS[0] || null; render(); }
      else { GS.plate = S.kind === 'phone' ? 0 : 1; render(); GS.plate = 0; }
    }, S);
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    console.log(name + '.png', errs.length ? 'ERR ' + errs[0] : 'ok');
    await p.close();
  }
  await b.close();
})();
