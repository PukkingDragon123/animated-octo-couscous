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
const V = (day, hr, x, extra, keep) => ({ kind: 'village', day, hr, x, extra: extra || '', keep: keep || null });
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
