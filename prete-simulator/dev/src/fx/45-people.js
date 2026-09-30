/* ============================================================
   AN INK LINE ROUND EVERYBODY

   The prete has had a line round him since the first build, and
   the elephants, the gods and the yaksha all do now. The people of
   the village did not: flat colour straight onto the background,
   so against a busy lane a shirt and a stall awning were the same
   thing. Every person is drawn into a scratch canvas first and
   then stamped into the world with one dark ring round the whole
   silhouette, and a softer one where the near arm crosses the
   body is left to the colours already there.

   The scratch canvas is set up with the same transform the person
   would have been drawn with, shifted, so every pixel lands exactly
   where it would have; the hand positions the callers read back
   (v._hx, v._hy) are in world space and stay right.
   ============================================================ */
const PEOPLE_INK = '#1a1216';
const PPL = { c:null, g:null, t:null, tg:null };
const PPL_W = 72, PPL_H = 88, PPL_OX = 36, PPL_OY = 76;
function drawVillager(g, v, o){
  o = o || {};
  if(!PPL.c){ PPL.c=mkCv(PPL_W,PPL_H); PPL.g=G2(PPL.c); PPL.t=mkCv(PPL_W,PPL_H); PPL.tg=G2(PPL.t); }
  const bx=R(v.x), by=R(v.y);
  const a=PPL.g, t=PPL.tg;
  a.setTransform(1,0,0,1,0,0); a.globalAlpha=1; a.globalCompositeOperation='source-over';
  a.clearRect(0,0,PPL_W,PPL_H);
  a.setTransform(1,0,0,1, PPL_OX-bx, PPL_OY-by);
  a.imageSmoothingEnabled=false;
  drawVillagerRaw(a, v, o);
  a.setTransform(1,0,0,1,0,0);
  t.setTransform(1,0,0,1,0,0); t.globalCompositeOperation='source-over';
  t.clearRect(0,0,PPL_W,PPL_H); t.drawImage(PPL.c,0,0);
  t.globalCompositeOperation='source-in'; t.fillStyle=o.ink||PEOPLE_INK; t.fillRect(0,0,PPL_W,PPL_H);
  t.globalCompositeOperation='source-over';
  const X=bx-PPL_OX, Y=by-PPL_OY;
  g.drawImage(PPL.t, X-1, Y); g.drawImage(PPL.t, X+1, Y);
  g.drawImage(PPL.t, X, Y-1); g.drawImage(PPL.t, X, Y+1);
  g.drawImage(PPL.c, X, Y);
}
