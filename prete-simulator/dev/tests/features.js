/* the things this round added: an elephant with a day of her own, the water
   days with a can, Erawan with something to stand in his place, the light
   pass and the game without it, clouds, and the buttons on a phone */
const { open } = require('./lib');
const SW = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
(async () => {
  const { chk, get, done, b } = await open({ args: SW });
  const free = () => get(() => { newGame(); chGo('free'); CH.lock = false; GS.state = 'play'; GS.tut = 99;
    DLG = null; VIG = null; BURST = null; HINT = null; GS.q.metPhra = true; GS.q.blessed = true; PHRA.shown = true;
    GS.mem = { wake: 1, take: 1, drink: 1, scale: 1, bowl: 1 }; return true; });
  const at = (day, hr, x, frames) => get(([day, hr, x, frames]) => {
    DAY.n = day; DAY.min = hr * 60; setTOD(todFromClock(DAY.min), true);
    P.x = x; P.y = groundY(x); P.vx = 0; GS.camX = clamp(x - 240, 0, WORLD_W - 480);
    for (let i = 0; i < frames; i++) { update(1 / 60); DLG = null; VIG = null; P.x = x; P.vx = 0; DAY.min = hr * 60; }
    checkInteract(); return SPOTS.map(s => s.txt).join('|'); }, [day, hr, x, frames || 30]);

  /* ---- Boonmee ---- */
  await free();
  chk('she keeps a day: the grove at night, the spirit house at seven, the pond at one', await get(() => {
    DAY.n = 1; const w = m => elePlan(m * 60);
    const r = [w(4).at, R(w(7.6).x), w(13).at, w(22).at].join(',');
    window.__p = r;
    return w(4).at === 'home' && Math.abs(w(7.6).x - ELE_STOP) < 2 && w(13).at === 'bath' && w(22).at === 'home'; }),
    await get(() => window.__p));
  chk('and on the water days she stays by her tub all afternoon', await get(() => {
    DAY.n = 12; const p = elePlan(13 * 60); DAY.n = 1; return p.at === 'song' && Math.abs(p.x - (SONG_X + 118)) < 2; }));
  chk('she is drawn in the village, with Lung Kham on her neck by day and not at night', await get(() => {
    const o = window.eleMahout; let n = 0; window.eleMahout = function () { n++; return o.apply(this, arguments); };
    DAY.n = 1; DAY.min = 13 * 60; setTOD(1, true); ELE.x = ELE_BATH; ELE.lastX = ELE.x;
    P.x = ELE_BATH - 20; P.y = groundY(P.x); GS.camX = clamp(P.x - 240, 0, WORLD_W - 480);
    for (let i = 0; i < 10; i++) update(1 / 60); render(); const day = n;
    n = 0; DAY.min = 22.5 * 60; setTOD(todFromClock(DAY.min), true); ELE.x = ELE_HOME; ELE.lastX = ELE.x;
    P.x = ELE_HOME - 20; P.y = groundY(P.x); GS.camX = clamp(P.x - 240, 0, WORLD_W - 480);
    for (let i = 0; i < 10; i++) update(1 / 60); render(); const night = n;
    window.eleMahout = o; window.__m = day + ' / ' + night; return day > 0 && night === 0; }), await get(() => window.__m));
  await free();
  let spots = await at(1, 13, await get(() => ELE_BATH - 30), 40);
  chk('with nothing in the basket there is nothing to give her', /give Boonmee a banana/.test(spots) === false, spots);
  await get(() => { GS.bag.banana = 2; return 1; });
  spots = await at(1, 13, await get(() => ELE_BATH - 30), 5);
  chk('with a banana, there is', /give Boonmee a banana/.test(spots), spots);
  chk('giving her one takes one banana and pays merit once that day', await get(() => {
    const m0 = GS.merit, f = SPOTS.find(s => s.txt === 'give Boonmee a banana').fn; f(); DLG = null;
    const m1 = GS.merit; ELE.act = null; ELE.hold = 0; checkInteract();
    const g = SPOTS.find(s => s.txt === 'give Boonmee a banana'); if (g) { g.fn(); DLG = null; }
    window.__b = [m0, m1, GS.merit, GS.bag.banana | 0].join(',');
    return (GS.bag.banana | 0) === 0 && m1 > m0 && GS.merit === m1; }), await get(() => window.__b));
  chk('Lung Kham has something to say', /talk to Lung Kham/.test(await at(1, 13, await get(() => ELE_BATH - 30), 5)));

  /* ---- สงกรานต์ ---- */
  await free();
  spots = await at(12, 13, await get(() => SONG_X + 100), 60);
  chk('at Songkran she will give you a shower', /ask Boonmee for a shower/.test(spots), spots);
  chk('and with the can in hand, anybody on the road gets splashed back, for merit once each', await get(() => {
    GS.skills.can = true; GS.q.tool = 'can';
    const n = NPCS.find(v => !v.inside); P.x = n.x - 20; P.y = groundY(P.x); P.face = 1; checkInteract();
    const s = SPOTS.find(q => /^splash /.test(q.txt)); if (!s) { window.__s = SPOTS.map(q => q.txt).join('|'); return false; }
    const m0 = GS.merit; s.fn(); DLG = null; const m1 = GS.merit; checkInteract();
    const s2 = SPOTS.find(q => q.txt === s.txt); if (s2) { s2.fn(); DLG = null; }
    window.__s = s.txt + ' ' + m0 + '>' + m1 + '>' + GS.merit;
    return m1 === m0 + 1 && GS.merit === m1 && SPLASH.length > 0; }), await get(() => window.__s));
  chk('and there are sand chedis at the wat to add to', /add a handful of sand/.test(await at(12, 13, await get(() => SAND_X[1]), 5)));

  /* ---- Erawan ---- */
  chk('Erawan stands on the terrace: heaven draws him', await get(() => {
    newGame(); GS.mem = { wake: 1, take: 1, drink: 1, scale: 1, bowl: 1 }; GS.q.metPhra = true;
    startDream({ first: true }); dreamGo('arrive'); HVN.said0 = 1; HVN.greeted = true; HVN.nonthokSeen = true;
    const o = window.erawanHowdah; let n = 0; window.erawanHowdah = function () { n++; return o.apply(this, arguments); };
    P.x = HV_X.erawan - 70; P.y = heavenGround(P.x);
    for (let i = 0; i < 30; i++) { DLG = null; update(1 / 60); P.x = HV_X.erawan - 70; P.vx = 0; }
    render(); window.erawanHowdah = o; return n > 0; }));
  chk('scratch him and he picks you up, and puts you down again', await get(() => {
    DLG = null; HVN.lifted = false;
    erawanScratch(); let top = 1e9;
    for (let i = 0; i < 300; i++) { DLG = null; update(1 / 60); top = Math.min(top, P.y); }
    const gy = heavenGround(P.x); window.__l = R(gy - top) + 'px up, back on the ground: ' + P.onGround;
    return gy - top > 30 && P.onGround && !ERW.act; }), await get(() => window.__l));

  /* ---- the light pass ---- */
  chk('the light pass is on where there is WebGL', await get(() => FX.on && !!document.getElementById('fx') && !!FX.gl));
  chk('and it draws the world under the interface', await get(() => {
    newGame(); chGo('free'); GS.state = 'play'; GS.tut = 99; DLG = null; VIG = null; HINT = null;
    DAY.min = 20 * 60; setTOD(todFromClock(DAY.min), true); P.x = 2400; P.y = groundY(P.x); GS.camX = 2160;
    for (let i = 0; i < 5; i++) update(1 / 60); render();
    const c = document.createElement('canvas'); c.width = 48; c.height = 27; const g = c.getContext('2d');
    g.drawImage(document.getElementById('fx'), 0, 0, 48, 27);
    const d = g.getImageData(0, 0, 48, 27).data; let lit = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 60) lit++;
    window.__f = lit + ' of ' + (48 * 27) + ' cells lit'; return lit > 200; }), await get(() => window.__f));

  /* ---- clouds ---- */
  chk('the clouds are painted for the hour and painted again when it moves', await get(() => {
    TOD.v = 0.6; drawSky(ctx); const a = SKYC.key, c0 = SKYC.list[5].cv.getContext('2d').getImageData(0, 0, 1, 1);
    TOD.v = 1; drawSky(ctx); const b2 = SKYC.key;
    return a !== b2 && SKYC.list.every(c => c.cv && c.cv.width > 20 && c.mask); }));

  /* ---- a phone ---- */
  chk('on a phone the pads sit inside the screen and clear of each other', await get(() => {
    tLayout(); const P2 = [...TPADS, { id: 'stick', x: STICK.cx, y: STICK.cy, r: STICK.r }];
    for (const p of P2) if (p.x - p.r < 0 || p.x + p.r > W || p.y - p.r < 0 || p.y + p.r > H) { window.__t = p.id + ' off screen'; return false; }
    for (let i = 0; i < P2.length; i++) for (let j = i + 1; j < P2.length; j++) {
      const a = P2[i], q = P2[j]; if (Math.hypot(a.x - q.x, a.y - q.y) < a.r + q.r + 2) { window.__t = a.id + ' on ' + q.id; return false; } }
    window.__t = P2.length + ' pads'; return true; }), await get(() => window.__t));

  /* ---- icons, people, the map ---- */
  chk('every item and every tool has a sixteen-pixel sprite with an outline', await get(() => {
    const miss = Object.keys(ITEMS).filter(id => !icoSprite(id)).concat(TOOL_ORDER.filter(t => !toolSprite(t)));
    const c = icoSprite('mango'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let dark = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] + d[i + 1] + d[i + 2] < 150) dark++;
    window.__i = miss.join(' ') || (dark + ' outline pixels on the mango'); return miss.length === 0 && dark > 20; }), await get(() => window.__i));
  chk('every person is drawn with a dark line round them, and is taller than before', await get(() => {
    const c = mkCv(80, 90), g = c.getContext('2d'); const n = NPCS[0], o = { x: n.x, y: n.y };
    n.x = 40; n.y = 80; drawVillager(g, n, { dt: 1 / 60 }); Object.assign(n, o);
    const d = g.getImageData(0, 0, 80, 90).data; let top = 90, bot = 0, ink = 0;
    for (let y = 0; y < 90; y++) for (let x = 0; x < 80; x++) { const i = (y * 80 + x) * 4; if (d[i + 3] < 200) continue;
      top = Math.min(top, y); bot = Math.max(bot, y); if (d[i] < 40 && d[i + 1] < 30 && d[i + 2] < 40) ink++; }
    window.__v = (bot - top) + 'px tall, ' + ink + ' ink pixels'; return bot - top >= 46 && ink > 60 && VILL_H >= 46; }), await get(() => window.__v));
  chk('the map is one road that turns at the ends, and nothing on it is cut off by the frame', await get(() => {
    GS.seenX = {}; for (let x = 0; x < WORLD_W; x += 90) markSeen(x);
    GS.state = 'tree'; TREE.tab = 3; render(); GS.state = 'play';
    const G = pmGeo(6, 51, W - 12, H - 57), b = G.b, at = (r, u) => b[r] + (b[r + 1] - b[r]) * u;
    const snake = G.X(at(0, 0.1)) < G.X(at(0, 0.9)) && G.X(at(1, 0.1)) > G.X(at(1, 0.9)) && G.X(at(2, 0.1)) < G.X(at(2, 0.9));
    const out = MAP_LABELS.filter(l => l.a < 6 || l.b > W - 6);
    window.__m = MAP_LABELS.length + ' names, ' + out.length + ' off the page' + (snake ? '' : ', not a snake');
    return snake && out.length === 0 && MAP_LABELS.length >= 20; }), await get(() => window.__m));

  /* ---- the world, shaded and alive ---- */
  chk('what is stamped into the world is inked and lit, like the icons', await get(() => {
    const c = artShaded(ART.house[0], 1), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let ink = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 40 && d[i + 1] < 36 && d[i + 2] < 40) ink++;
    window.__s = ink + ' ink pixels round a house'; return ink > 150; }), await get(() => window.__s));
  chk('the trees are alive: a gust bends them over and they come back', await get(() => {
    newGame(); chGo('free'); GS.state = 'play'; GS.tut = 99; DLG = null; VIG = null; P.x = 2600; P.y = groundY(2600); GS.camX = 2360;
    const T = treesInView(0); if (!T.length) { window.__t = 'no trees in view'; return false; }
    for (let i = 0; i < 90; i++) { GUSTS.length = 0; GUSTS.push({ x: 2600, v: 40, w: 600, a: 1.5, aT: 1.5, t: 1, life: 99 }); update(1 / 60); GS.camX = 2360; }
    const bent = Math.max(...T.map(t => Math.abs(t.a)));
    GUSTS.length = 0; for (let i = 0; i < 600; i++) { GS.wind = 0; update(1 / 60); GS.wind = 0; GS.camX = 2360; }
    const back = Math.max(...T.map(t => Math.abs(t.a)));
    window.__t = SHADE.trees.length + ' trees; bent ' + bent.toFixed(1) + 'px, settled to ' + back.toFixed(1);
    return SHADE.trees.length > 50 && bent > 2 && back < bent * 0.6; }), await get(() => window.__t));
  chk('the washing hangs, blows, and swings out of the way of anybody walking through it', await get(() => {
    const L = CLOTH.items.find(i => i.kind === 'line'); if (!L) return false;
    const hg = L.hangs[1].c, low = () => hg.pts[hg.pts.length - 1];
    P.x = L.x + 200; P.y = groundY(P.x); GS.camX = clamp(L.x - 200, 0, WORLD_W - 480); GS.state = 'play';
    for (let i = 0; i < 120; i++) { GS.wind = 0; GUSTS.length = 0; update(1 / 60); }
    /* then a still day, so what moves it next is the walk and not a gust */
    const wa = window.windAt; window.windAt = () => 0;
    for (let i = 0; i < 240; i++) stepClothes(1 / 60);
    const hang = low().y - hg.pts[0].y, x0 = low().x;
    P.x = x0 - 3; P.vx = 30; for (let i = 0; i < 20; i++) { P.x = x0 - 3; P.vx = 30; stepClothes(1 / 60); }
    window.windAt = wa;
    const pushed = Math.abs(low().x - x0);
    window.__c = 'hangs ' + hang.toFixed(0) + 'px, pushed ' + pushed.toFixed(1) + 'px';
    return hang > 10 && pushed > 1.5; }), await get(() => window.__c));
  chk('the prete has a soft dark line round him, not a hard black one', await get(() => {
    const c = mkCv(160, 180), g = c.getContext('2d'); const o = { x: P.x, y: P.y }; P.x = 80; P.y = 150;
    drawPrete(g, P, { dt: 1 / 60 }); Object.assign(P, o);
    const d = g.getImageData(0, 0, 160, 180).data; let ink = 0;
    let black = 0;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue;
      if (d[i] < 45 && d[i + 1] < 35 && d[i + 2] < 40) black++;
      else if (d[i] > 70 && d[i] < 110 && d[i + 1] > 55 && d[i + 1] < 90 && d[i + 2] > 45 && d[i + 2] < 85) ink++; }
    window.__p = ink + ' soft line pixels, ' + black + ' black'; return ink > 120 && black < 60; }), await get(() => window.__p));

  /* ---- the start, the new map, the cats and dogs, Isan ---- */
  chk('a new game opens at night and is graded as night, not as dawn', await get(() => {
    newGame(); const g = fxGrade(), v = TOD.v;
    window.__g = 'TOD ' + v.toFixed(2) + ', sat ' + g.sat.toFixed(2) + ', black ' + g.black.toFixed(3) + ', rays ' + g.rays;
    chGo('free'); GS.state = 'play'; GS.tut = 99; DLG = null; VIG = null;
    return v < 0.1 && g.sat < 1 && g.black < 0.03 && g.rays === 0; }), await get(() => window.__g));
  chk('the old strip map is gone, and the new one is drawn from inked Isan sprites', await get(() => {
    const names = ['palmyra', 'stilt', 'granary', 'sim', 'that', 'buffalo', 'termite', 'prasat', 'morlam', 'mesa'];
    const miss = names.filter(n => !mapArt(n, 0));
    const c = mapArt('stilt', 1), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let ink = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 50 && d[i + 1] < 40 && d[i + 2] < 45) ink++;
    GS.seenX = {}; for (let x = 0; x < WORLD_W; x += 90) markSeen(x); PMAP.key = ''; GS.state = 'tree'; TREE.tab = 3; render(); GS.state = 'play';
    window.__mp = (miss.join(' ') || 'all sprites') + ', ' + ink + ' ink pixels on a house, ' + PMAP.placed + ' things on the map';
    return typeof drawMapStrips === 'undefined' && typeof MAP_TERRAIN === 'undefined' && !miss.length && ink > 30 && PMAP.placed > 150; }),
    await get(() => window.__mp));
  chk('every cat and every dog is somebody: its own coat, and a line round it', await get(() => {
    const shot = (fn) => { const c = mkCv(40, 30), g = c.getContext('2d'); fn(g); return g.getImageData(0, 0, 40, 30).data; };
    const cats = Object.keys(CAT_COATS).map(k => shot(g => drawCat(g, { x: 20, y: 26, face: 1, anim: 0.3, state: 'sit', coat: k })));
    const dogs = Object.keys(DOG_LOOKS).map(k => shot(g => drawRoadDog(g, { x: 20, y: 26, face: 1, st: 'up', t: 0.3, look: k })));
    const sig = d => { let r = 0, g2 = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; g2 += d[i + 1]; b += d[i + 2]; n++; } return [r / n | 0, g2 / n | 0, b / n | 0].join(','); };
    const inked = d => { let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 40 && d[i + 1] < 30 && d[i + 2] < 40) k++; return k; };
    const cs = new Set(cats.map(sig)), ds = new Set(dogs.map(sig)), ink = Math.min(...cats.map(inked), ...dogs.map(inked));
    const named = PETS.filter(p => p.coat !== 'fluffy' && !PET_LOOK[p.name]).map(p => p.name);
    window.__pt = cs.size + ' cat coats, ' + ds.size + ' dog coats, at least ' + ink + ' ink pixels each' + (named.length ? ', no look for ' + named.join(' ') : '');
    return cs.size === cats.length && ds.size === dogs.length && ink > 25 && !named.length; }), await get(() => window.__pt));
  chk('sugar palms stand over the paddies, and the ones by the road move in the wind', await get(() => {
    const live = SHADE.trees.filter(t => ISAN.palms.some(x => Math.abs(t.bx - x) < 2));
    window.__sp = ISAN.palms.length + ' by the road, ' + live.length + ' of them live';
    return ISAN.palms.length >= 3 && live.length === ISAN.palms.length; }), await get(() => window.__sp));

  /* ---- Thai ---- */
  chk('every new line has its Thai', await get(() => {
    const need = ['give Boonmee a banana', "stroke Boonmee's trunk", 'talk to Lung Kham', 'ask Boonmee for a shower',
      'add a handful of sand', 'splash', 'Lung Kham', 'Happy Songkran!', ...KHAM_LINES, 'the water',
      'drawing the map', 'sugar palms on the bunds'];
    const miss = need.filter(s => !TH[s]); window.__th = miss.join(' | '); return miss.length === 0; }), await get(() => window.__th));

  /* ---- and without WebGL at all, the old drawing stands ---- */
  {
    const { chromium } = require('playwright-core'); const path = require('path');
    const b2 = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
      args: ['--no-sandbox', '--disable-webgl', '--disable-3d-apis'] });
    const p2 = await b2.newPage({ viewport: { width: 960, height: 540 } }); const e2 = [];
    p2.on('pageerror', e => e2.push(e.message));
    await p2.goto('file://' + path.resolve(__dirname, '..', '..', 'index.html'));
    await p2.waitForFunction(() => typeof WORLD_READY !== 'undefined' && WORLD_READY, null, { timeout: 60000 });
    const r = await p2.evaluate(() => { setLang('en'); newGame(); chGo('free'); GS.state = 'play'; GS.tut = 99; DLG = null; VIG = null;
      P.x = 2400; P.y = groundY(P.x); for (let i = 0; i < 20; i++) { update(1 / 60); render(); }
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 400) if (d[i] > 250) n++;
      return { on: typeof FX !== 'undefined' && FX.on, opaque: n, total: (d.length / 400) | 0 }; });
    chk('without WebGL the light pass stays off and the canvas still draws every pixel', !r.on && r.opaque > r.total * 0.98 && e2.length === 0,
      JSON.stringify(r) + (e2.length ? ' ' + e2[0] : ''));
    await b2.close();
  }
  await done();
})();
