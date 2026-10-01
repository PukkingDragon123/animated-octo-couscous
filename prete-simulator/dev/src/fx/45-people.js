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

/* ---------- and the prete ----------
   He has always had his own line; it is black now, like everybody's. On top
   of the flat colour goes a grain — a fixed speckle of light and dark laid
   over his pixels only — and a little shade gathering toward the ground,
   so he reads as something with a surface rather than a cut-out. */
const PRT = { c:null, g:null, grain:null };
const PRT_W = 150, PRT_H = 170, PRT_OX = 75, PRT_OY = 140;
function prtGrain(){
  if(PRT.grain) return PRT.grain;
  const c=mkCv(PRT_W,PRT_H), g=G2(c), r=mulberry(909);
  for(let y=0;y<PRT_H;y++) for(let x=0;x<PRT_W;x++){
    const v=r();
    if(v<0.10){ g.fillStyle='rgba(40,24,30,0.16)'; g.fillRect(x,y,1,1); }
    else if(v<0.16){ g.fillStyle='rgba(255,250,236,0.14)'; g.fillRect(x,y,1,1); }
  }
  /* the shade that gathers low on him */
  const gr=g.createLinearGradient(0,PRT_OY-60,0,PRT_OY);
  gr.addColorStop(0,'rgba(40,24,40,0)'); gr.addColorStop(1,'rgba(40,24,40,0.16)');
  g.fillStyle=gr; g.fillRect(0,PRT_OY-60,PRT_W,60);
  PRT.grain=c; return c;
}
function drawPrete(g, p, o){
  o=o||{};
  if(!PRT.c){ PRT.c=mkCv(PRT_W,PRT_H); PRT.g=G2(PRT.c); }
  const bx=R(p.x), by=R(p.y), a=PRT.g;
  a.setTransform(1,0,0,1,0,0); a.globalAlpha=1; a.globalCompositeOperation='source-over';
  a.clearRect(0,0,PRT_W,PRT_H);
  a.setTransform(1,0,0,1, PRT_OX-bx, PRT_OY-by);
  a.imageSmoothingEnabled=false;
  const res=drawPreteRaw(a, p, o);
  a.setTransform(1,0,0,1,0,0); a.globalAlpha=1;
  a.globalCompositeOperation='source-atop'; a.drawImage(prtGrain(),0,0);
  a.globalCompositeOperation='source-over';
  g.drawImage(PRT.c, bx-PRT_OX, by-PRT_OY);
  return res;
}
