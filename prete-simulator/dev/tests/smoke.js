/* the flows everything else depends on: it boots, the first night goes up
   and comes back, the tools work, the east is there, the map lays out */
const { open } = require('./lib');
(async () => {
  const { chk, get, done } = await open();
  chk('it boots onto the title', await get(() => GS.state === 'title' || GS.state === 'play'));

  /* ---- the first night: under the house, up the ladder, back at dawn ---- */
  chk('crawling under the house sends him up', await get(() => {
    newGame(); chGo('hide'); P.x = HIDE_X; P.y = groundY(P.x); DLG = null; VIG = null; HINT = null;
    startSleep(); return GS.state === 'dream' && DREAM2.first === true; }));
  chk('he walks heaven to the throne and wakes under the same house at dawn', await get(() => {
    let n = 0; const seen = new Set();
    while (GS.state === 'dream' && n < 24000) { seen.add(DREAM2.act);
      PRESS.act = true; PRESS.tap = true; K.right = (DREAM2.act !== 'lie' && DREAM2.act !== 'wait');
      if (DLG) DLG.ch = 9999; update(1 / 60); n++; }
    K.right = false;
    window.__w = [...seen].join(',') + ' ' + GS.state + ' ch=' + STORY[GS.ch].id + ' x=' + Math.round(P.x) + ' tod=' + TOD.v.toFixed(2);
    return GS.state === 'play' && GS.q.blessed && GS.q.nonthok && ['arrive', 'nonthok', 'throne', 'gift'].every(a => seen.has(a))
      && STORY[GS.ch].id === 'field' && Math.abs(P.x - HIDE_X) < 40 && TOD.v > 0.8; }), await get(() => window.__w));
  chk('a second first visit starts clean', await get(() => {
    newGame(); GS.q.nonthok = false; hvEnter(true); HVN.said0 = 1; HVN.fledSaid = 1; hvLeave();
    hvEnter(true); const c = !HVN.said0 && !HVN.fledSaid && !HVN.scared; hvLeave(); return c; }));

  /* ---- the tools ---- */
  const free = () => get(() => { newGame(); chGo('free'); CH.lock = false; GS.state = 'play'; GS.tut = 99;
    DLG = null; VIG = null; BURST = null; HINT = null; GS.q.metPhra = true; GS.q.blessed = true; return true; });
  await free();
  chk('the ring opens on X and picks a tool', await get(() => {
    GS.skills = { net: 1, axe: 1, can: 1 }; GS.q.rod = true; GS.q.shovel = true;
    openRing('net'); const o = !!TOOL.ring && TOOL.ring.own.length === 6;
    TOOL.ring = null; equip('rod'); return o && toolNow() === 'rod'; }));
  chk('a swing of the net catches what is under it, and holds it up', await get(() => {
    equip('net'); BUGS.length = 0; const x = 7400, gy = groundY(x); DIGS.length = 0;
    BUGS.push({ k: 'firefly', x: x + 30, y: gy - 24, t: 0, vx: 0, vy: 0, home: x + 30, gy, hop: 0, rest: 9, flee: 0 });
    P.x = x; P.y = gy; P.face = 1; swingNet(); for (let i = 0; i < 60 && TOOL.swing; i++) stepSwing(1 / 60, 'village');
    const ok = !!TOOL.card && TOOL.card.id === 'firefly'; cardChoose(false); return ok && GS.bag.firefly === 1; }));
  chk('the rod casts, and the spade digs', await get(() => {
    equip('rod'); P.x = EAST.river0 + 300; P.y = groundY(P.x); castLine(WATERS[1]);
    for (let i = 0; i < 40; i++) stepCast(1 / 60); const cast = TOOL.cast && TOOL.cast.st === 'float'; TOOL.cast = null;
    equip('shovel'); DIGS.length = 0; DIGS.push({ x: P.x + 10, zone: 'river', dug: false }); startDig(DIGS[0]);
    for (let i = 0; i < 90 && TOOL.dig; i++) stepDig(1 / 60); const dug = !!TOOL.card; TOOL.card = null;
    return cast && dug; }));
  chk('a new game drops whatever was being held up', await get(() => {
    TOOL.card = { kind: 'bug', id: 'firefly', t: 0 }; newGame(); return !TOOL.card && !toolBusy(); }));

  /* ---- the east ---- */
  await free();
  chk('there is something to do in every stretch of the east', await get(() => {
    GS.q.rod = true; GS.skills = { net: 1 };
    const at = (x, tool) => { DLG = null; VIG = null; P.x = x; P.y = groundY(x); P.vx = 0; P.face = 1;
      GS.q.tool = tool || 'hand'; for (const n of Object.values(EAST_NPC)) n.cool = 0; checkInteract();
      return SPOTS.map(s => s.txt).join('|'); };
    const got = { river: /cast the line/.test(at(EAST.river0 + 300, 'rod')), landing: /Mae Chan/.test(at(EAST.pier)),
      lake: /cast the line/.test(at(EAST.lakeSala + 80, 'rod')), cave: /light incense/.test(at(EAST.cave - 10)),
      head: /pay respects/.test(at(EAST.head - 30)), view: /sit and look/.test(at(EAST.view)) };
    window.__e = JSON.stringify(got); return Object.values(got).every(Boolean); }), await get(() => window.__e));
  chk('and nobody walks off the edge of it', await get(() => {
    P.x = EAST.edge - 40; P.y = groundY(P.x); K.right = true; for (let i = 0; i < 120; i++) update(1 / 60);
    K.right = false; DLG = null; return P.x <= EAST.edge && P.x > EAST.edge - 40; }));
  chk('nothing grows on a bridge, a boardwalk or a lake', await get(() => {
    const bad = x => (x > EAST.river0 && x < EAST.river1) || (x > EAST.lake0 && x < EAST.lake1) || x > EAST.edge;
    return !GRASS.some(t => bad(t.x)) && !FLOWERS.some(t => bad(t.x)); }));

  /* ---- the ledger ---- */
  chk('no two names on the map land on each other', await get(() => {
    GS.seenX = {}; for (let x = 0; x < WORLD_W; x += 90) markSeen(x);
    GS.state = 'tree'; TREE.tab = 3; render();
    for (let i = 0; i < MAP_LABELS.length; i++) for (let j = i + 1; j < MAP_LABELS.length; j++) {
      const a = MAP_LABELS[i], b = MAP_LABELS[j];
      if (a.row !== b.row || a.side !== b.side) continue;
      if (a.a < b.b && b.a < a.b) { window.__c = a.n + ' / ' + b.n; return false; } }
    window.__c = MAP_LABELS.length + ' names'; GS.state = 'play'; return MAP_ROWS === 3 && MAP_LABELS.length >= 20; }),
    await get(() => window.__c));
  chk('the catches page draws a shadow for everything not yet held', await get(() => {
    newGame(); GS.state = 'tree'; TREE.tab = 5; dexAdd('firefly'); let n = 0; const o = window.drawShadow;
    window.drawShadow = function () { n++; return o.apply(this, arguments); }; hitClear(); render(); window.drawShadow = o;
    GS.state = 'play'; return n === DEX_BUGS.length + DEX_FISH.length + DEX_FINDS.length - 1; }));

  /* ---- and it keeps up ---- */
  chk('a frame of the village costs what it did before the effects (software rendering here)', await get(() => {
    newGame(); chGo('free'); CH.lock = false; GS.state = 'play'; GS.tut = 99; DLG = null; VIG = null;
    P.x = 2400; P.y = groundY(P.x); DAY.min = 6.2 * 60; setTOD(todFromClock(DAY.min), true);
    for (let i = 0; i < 20; i++) { update(1 / 60); render(); }
    const t0 = performance.now(); for (let i = 0; i < 60; i++) { update(1 / 60); render(); }
    const ms = (performance.now() - t0) / 60; window.__ms = ms.toFixed(1) + 'ms'; return ms < 45; }), await get(() => window.__ms));
  await done();
})();
