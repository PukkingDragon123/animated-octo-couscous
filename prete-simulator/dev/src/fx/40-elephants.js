/* ============================================================
   ช้าง — THE ELEPHANTS

   พังบุญมี is fifty-one. She hauled teak out of the hills until
   the logging stopped, then carried tourists, and now she lives at
   the top of the banana grove with Lung Kham, who has looked after
   her for thirty years and talks to her more than to anybody. Every
   day she walks the length of the village to bathe in the pond and
   walks back again, and everybody on the road keeps a banana for
   her.

   And up in heaven, on the terrace between the hall and the chedi,
   stands ช้างเอราวัณ: Indra's elephant, white, three heads, gold to
   the ankles. For a long time he was a prompt with nobody behind it.

   Both are drawn by the same hand: one elephant, built out of a few
   dozen ellipses at whatever size it is asked for, painted facing
   right into a scratch canvas and put into the world with a single
   ring of ink round the outside. One line round the whole silhouette
   reads as a drawing. A line round every part of an elephant reads
   as a sack of potatoes.
   ============================================================ */

var ELE_SKIN = {
  grey:  { h:'#80766f', d:'#665c57', x:'#4f4541', l:'#998e86', hi:'#b3a79d', ink:'#2b2320',
           pk:'#c39a8b', pkL:'#dcb6a5', nail:'#d9cdb9', eye:'#1a1210', mouth:'#8c5c58' },
  white: { h:'#ece4d4', d:'#d2c5af', x:'#b0a08a', l:'#f7f0e2', hi:'#fdf8ee', ink:'#6a4a2c',
           pk:'#f0c8b8', pkL:'#f8dcd0', nail:'#f4e6c4', eye:'#2a1a10', mouth:'#d8908a' },
};
/* the same hide, a step further back in the dark: for the heads behind */
function eleBack(C, a){
  return Object.assign({}, C, { h:mix(C.h,C.d,a), l:mix(C.l,C.h,a), d:mix(C.d,C.x,a) });
}

/* ---------- the scratch canvas, and one ring of ink round the lot ---------- */
const ELE_CV = { a:null, ag:null, b:null, bg:null, w:0, h:0 };
function eleStamp(g, x, y, face, w, h, ox, oy, ink, paint){
  w=Math.ceil(w); h=Math.ceil(h);
  if(!ELE_CV.a || ELE_CV.w<w || ELE_CV.h<h){
    ELE_CV.w=Math.max(ELE_CV.w,w); ELE_CV.h=Math.max(ELE_CV.h,h);
    ELE_CV.a=mkCv(ELE_CV.w,ELE_CV.h); ELE_CV.ag=G2(ELE_CV.a);
    ELE_CV.b=mkCv(ELE_CV.w,ELE_CV.h); ELE_CV.bg=G2(ELE_CV.b);
  }
  const a=ELE_CV.ag, b=ELE_CV.bg;
  a.setTransform(1,0,0,1,0,0); a.globalAlpha=1; a.globalCompositeOperation='source-over';
  a.clearRect(0,0,ELE_CV.w,ELE_CV.h);
  a.save(); a.translate(R(ox), R(oy));
  paint(a, (ink2, fn, cut)=>eleLayer(a, ink2, fn, ox, oy, cut));
  a.restore();
  b.setTransform(1,0,0,1,0,0); b.globalCompositeOperation='source-over';
  b.clearRect(0,0,ELE_CV.w,ELE_CV.h);
  b.drawImage(ELE_CV.a, 0,0);
  b.globalCompositeOperation='source-in'; b.fillStyle=ink; b.fillRect(0,0,w,h);
  b.globalCompositeOperation='source-over';
  g.save(); g.translate(R(x), R(y)); if(face<0) g.scale(-1,1);
  const X=-R(ox), Y=-R(oy);
  g.drawImage(ELE_CV.b, 0,0,w,h, X-1,Y, w,h); g.drawImage(ELE_CV.b, 0,0,w,h, X+1,Y, w,h);
  g.drawImage(ELE_CV.b, 0,0,w,h, X,Y-1, w,h); g.drawImage(ELE_CV.b, 0,0,w,h, X,Y+1, w,h);
  g.drawImage(ELE_CV.a, 0,0,w,h, X,Y, w,h);
  g.restore();
}

/* a part drawn on its own and inked on its own before it goes onto the
   animal: a near leg in front of the belly, or one head of three in front
   of the next. White on white needs a line between, or it is one white. */
const ELE_LY = { a:null, ag:null, b:null, bg:null, w:0, h:0 };
function eleLayer(dst, ink, fn, ox, oy, cut){
  if(!ELE_LY.a || ELE_LY.w<ELE_CV.w || ELE_LY.h<ELE_CV.h){
    ELE_LY.w=ELE_CV.w; ELE_LY.h=ELE_CV.h;
    ELE_LY.a=mkCv(ELE_LY.w,ELE_LY.h); ELE_LY.ag=G2(ELE_LY.a);
    ELE_LY.b=mkCv(ELE_LY.w,ELE_LY.h); ELE_LY.bg=G2(ELE_LY.b);
  }
  const a=ELE_LY.ag, b=ELE_LY.bg, W2=ELE_LY.w, H2=ELE_LY.h;
  a.setTransform(1,0,0,1,0,0); a.clearRect(0,0,W2,H2);
  a.save(); a.translate(R(ox),R(oy)); fn(a); a.restore();
  b.setTransform(1,0,0,1,0,0); b.globalCompositeOperation='source-over'; b.clearRect(0,0,W2,H2);
  b.drawImage(ELE_LY.a,0,0); b.globalCompositeOperation='source-in'; b.fillStyle=ink; b.fillRect(0,0,W2,H2);
  b.globalCompositeOperation='source-over';
  /* a leg grows out of the belly, so it has no line across the top of it */
  if(cut!==undefined) b.clearRect(0,0,W2,R(oy+cut));
  dst.save(); dst.setTransform(1,0,0,1,0,0);
  dst.drawImage(ELE_LY.b,-1,0); dst.drawImage(ELE_LY.b,1,0); dst.drawImage(ELE_LY.b,0,-1); dst.drawImage(ELE_LY.b,0,1);
  dst.drawImage(ELE_LY.a,0,0);
  dst.restore();
}

/* ---------- the trunk ----------
   A quadratic from the base, with the width falling off toward the tip,
   the underside in shadow and the ridges only on the underside. Which side
   is under follows the curve: hanging, it is the side toward the mouth;
   raised, it faces forward. */
const TRUNK = {
  hang:  {cx: 5, cy:14, tx: 3, ty:30, curl: 1},
  sway:  {cx: 6, cy:14, tx: 5, ty:29, curl: 1},
  up:    {cx:14, cy:-6, tx: 7, ty:-26, curl:-1},
  sniff: {cx:12, cy: 8, tx:20, ty: 4, curl: 1},
  reach: {cx:10, cy:14, tx:18, ty:20, curl: 1},
  eat:   {cx: 9, cy:12, tx:-2, ty: 5, curl: 1},
  dip:   {cx: 8, cy:16, tx:12, ty:34, curl: 0},
  back:  {cx: 9, cy:-18, tx:-14, ty:-26, curl: 1},     // over the head, to hose the back
  spray: {cx:14, cy: 2, tx:24, ty:-10, curl:-1},       // forward and up, at somebody
  toss:  {cx: 8, cy:-10, tx:-10, ty:-22, curl: 1},     // dust over the shoulder
};
function trunkTo(cur, name, a){
  const T=TRUNK[name]||TRUNK.hang;
  cur.cx=lerp(cur.cx,T.cx,a); cur.cy=lerp(cur.cy,T.cy,a);
  cur.tx=lerp(cur.tx,T.tx,a); cur.ty=lerp(cur.ty,T.ty,a);
  cur.curl=lerp(cur.curl===undefined?1:cur.curl,T.curl,a);
  return cur;
}
function eleTrunk(g, bx, by, tr, k, C, o, i){
  const Q=v=>v*k, t=o.t||0;
  const sw = (o.still? 0 : Math.sin(t*0.9+i*1.9)*1.4);
  const p1x=bx+Q(tr.cx+sw*0.4), p1y=by+Q(tr.cy), p2x=bx+Q(tr.tx+sw), p2y=by+Q(tr.ty);
  const N=Math.max(12, R(14*k)), P=[];
  for(let n=0;n<=N;n++){ const u=n/N, v=1-u;
    P.push([v*v*bx+2*v*u*p1x+u*u*p2x, v*v*by+2*v*u*p1y+u*u*p2y, u]); }
  const W=u=>Q(lerp(7.6,2.7,Math.pow(u,0.85)));
  for(let n=1;n<=N;n++){ const a=P[n-1], b=P[n]; pTaper(g,a[0],a[1],b[0],b[1],W(a[2]),W(b[2]),C.h); }
  /* shade and ridge */
  for(let n=1;n<=N;n++){
    const a=P[n-1], b=P[n], dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy)||1;
    const nx=-dy/d, ny=dx/d, wa=W(a[2]), wb=W(b[2]);
    pTaper(g, a[0]+nx*wa*0.30, a[1]+ny*wa*0.30, b[0]+nx*wb*0.30, b[1]+ny*wb*0.30, wa*0.36, wb*0.36, C.d);
    if(b[2]<0.8) pTaper(g, a[0]-nx*wa*0.33, a[1]-ny*wa*0.33, b[0]-nx*wb*0.33, b[1]-ny*wb*0.33, 1, 1, C.l);
    if(n%2===0 && n<N-1)
      pTaper(g, b[0], b[1], b[0]+nx*wb*0.48, b[1]+ny*wb*0.48, 1, 1, C.x);
    if(C.pk && b[2]<0.34 && ((n*7)%3===0)) pR(g, b[0]-nx*wb*0.15, b[1]-ny*wb*0.15, 1, 1, n%2? C.pk : C.pkL);
  }
  /* the tip, with the one finger and the nostril, and a curl if it has one */
  const e=P[N], e0=P[N-1], dx=e[0]-e0[0], dy=e[1]-e0[1], d=Math.hypot(dx,dy)||1;
  const nx=-dy/d, ny=dx/d, cu=tr.curl||0;
  if(Math.abs(cu)>0.2){
    const cx2=e[0]+dx/d*Q(1.2)+nx*Q(2)*cu, cy2=e[1]+dy/d*Q(1.2)+ny*Q(2)*cu;
    pTaper(g, e[0],e[1], cx2,cy2, Q(2.7), Q(2.2), C.h);
    pR(g, cx2-0.5, cy2-0.5, 1,1, C.x);
  } else {
    pR(g, e[0]+dx/d*Q(1.4)-0.5, e[1]+dy/d*Q(1.4)-0.5, Q(1.6), Q(1.6), C.h);
    pR(g, e[0]-0.5, e[1]-0.5, 1,1, C.x);
  }
  o._tip = o._tip||[]; o._tip[i] = {x:e[0], y:e[1], dx:dx/d, dy:dy/d};
}

/* ---------- a head: two domes, a small eye, an ear like a map of India ---------- */
function eleHead(g, hx, hy, k, C, o, i, front){
  const Q=v=>v*k, t=o.t||0;
  const ea = (o.ear||0) + Math.sin(t*1.6+i*1.3)*0.7;
  /* the neck, which is what joins it to the shoulder */
  pEll(g, hx-Q(9), hy+Q(3), Q(8.5), Q(10.5), C.h);
  /* skull and forehead, in three coats: the rim of light, the shadow, the hide */
  const HE=[[0,0,10,11],[-3.2,-9.4,5.4,5.3],[3.3,-8.8,5,4.9],[5,1.4,6.6,9.2]];
  for(const e of HE) pEll(g, hx+Q(e[0]), hy+Q(e[1])-1, Q(e[2]), Q(e[3]), C.l);
  for(const e of HE) pEll(g, hx+Q(e[0]), hy+Q(e[1]), Q(e[2]), Q(e[3]), C.d);
  for(const e of HE) pEll(g, hx+Q(e[0])-Q(0.4), hy+Q(e[1])-Q(1.3), Q(e[2])-Q(1.1), Q(e[3])-Q(1.5), C.h);
  pTaper(g, hx+Q(0.3), hy-Q(12.8), hx+Q(1.1), hy-Q(9.4), 1, 1, C.d);          // the groove between the domes
  pEll(g, hx-Q(1.5), hy-Q(11.5), Q(2.6), Q(1.4), C.hi);                       // light on the back dome
  pEll(g, hx-Q(2.5), hy+Q(6.5), Q(6), Q(3.8), C.d);                           // the jaw, in its own shade
  /* the eye: small, low, wet, with more wrinkle round it than eye */
  const ex=hx+Q(4.6), ey=hy-Q(1.2);
  pEll(g, ex, ey+Q(0.3), Q(2.3), Q(1.5), C.d);
  pR(g, ex-Q(2.4), ey-Q(1.8), Q(3.4), 1, C.x);
  pR(g, ex-Q(3.4), ey+Q(1.4), 1, 1, C.x); pR(g, ex-Q(3.2), ey-Q(0.4), 1, 1, C.d);
  if(o.blink) pR(g, ex-Q(1.2), ey, Q(2.4), 1, C.x);
  else {
    pR(g, ex-Q(1), ey-Q(0.4), Math.max(2,Q(2)), Math.max(1,Q(1.4)), C.eye);
    pR(g, ex-Q(0.2), ey-Q(0.4), 1, 1, k>1.3? '#8a6a3a' : '#5a3a22');
    pR(g, ex+Q(1.2), ey-Q(1.2), 1, 1, C.ink);                                   // lashes
  }
  pR(g, hx-Q(0.6), hy+Q(1.4), 1, 1, C.x);                                      // the temple
  /* the mouth, under the root of the trunk */
  const mx=hx+Q(6.2), my=hy+Q(9.6);
  pEll(g, mx, my, Q(2.5), Q(1.3), C.mouth);
  pR(g, mx-Q(2.4), my-Q(1.3), Q(4.2), 1, C.x);
  /* freckles: where an old elephant goes pink */
  if(C.pk && !o.white){
    const F=[[7,2],[8.6,4],[9.2,1.4],[10.4,5],[7.6,6.2],[9.8,7.4],[6.2,4.6],[10.8,3],[8,0],[6.4,7.6]];
    F.forEach((p,n)=>pR(g, hx+Q(p[0]), hy+Q(p[1]), 1, 1, n%3? C.pk : C.pkL));
  }
  /* the ear, laid back against the neck: top edge folded forward, the
     lobe hanging, pink along the edge, the veins showing through */
  const E=[-4,-10, -9,-11.6, -13.4-ea*0.4,-9.2, -15.6-ea,-3, -15.2-ea,4, -12.6-ea*0.7,10.4,
           -9,13.4, -6.6,11, -5.6,4, -4.2,-2];
  const pts=[]; for(let n=0;n<E.length;n+=2) pts.push(hx+Q(E[n]), hy+Q(E[n+1]));
  pPolyO(g, pts, C.h, C.x);
  const inn=[]; for(let n=0;n<E.length;n+=2){ const px=E[n], py=E[n+1];
    inn.push(hx+Q(px*0.72-1.6), hy+Q(py*0.78+0.6)); }
  pPoly(g, inn, C.d);
  pTaper(g, hx+Q(-5), hy-Q(10.4), hx+Q(-12.6-ea*0.4), hy-Q(9.2), Q(1.6), Q(1.2), C.l);
  pTaper(g, hx+Q(-7), hy-Q(5), hx+Q(-12-ea*0.6), hy+Q(3), 1, 1, C.x);
  pTaper(g, hx+Q(-8), hy+Q(1), hx+Q(-11-ea*0.5), hy+Q(8), 1, 1, C.x);
  if(C.pk && !o.white) [[-14.4,1],[-13.2,7],[-10.4,11.6],[-15,-2],[-12,9.4]].forEach((p,n)=>
    pR(g, hx+Q(p[0]-(n<2?ea:ea*0.6)), hy+Q(p[1]), 1, 1, n%2? C.pkL : C.pk));
  if(o.headDress) o.headDress(g, hx, hy, k, i, front);
}
function eleTusk(g, hx, hy, k, gold){
  const Q=v=>v*k;
  const a=[hx+Q(6.6), hy+Q(7.4)], b=[hx+Q(13), hy+Q(12.6)], c=[hx+Q(18.6), hy+Q(10.6)];
  pTaper(g, a[0],a[1], b[0],b[1], Q(3), Q(2.4), '#f6eedb');
  pTaper(g, b[0],b[1], c[0],c[1], Q(2.4), Q(1), '#f6eedb');
  pTaper(g, a[0],a[1]+Q(0.8), b[0],b[1]+Q(0.7), Q(1), Q(0.8), '#d6c9ab');
  if(gold){ pTaper(g, a[0]+Q(1.6),a[1]+Q(1.3), a[0]+Q(2.6),a[1]+Q(2.2), Q(3.4), Q(3.2), HV.gold);
            pR(g, a[0]+Q(1.8), a[1]+Q(1), 1,1, HV.goldL); }
}

/* ---------- the whole animal ----------
   facing right, feet on y=0. o.k is the size; o.heads is one or three. */
const _ELE_TEX = new Map();
function eleTexture(k){
  let T=_ELE_TEX.get(k); if(T) return T;
  T=[];
  const BODY=[[-2,-33,24,14.5],[11,-35,14,15],[-16,-32,13,14.5]];
  const inside=(x,y,sh)=>BODY.some(b=>{ const dx=(x-b[0]*k)/(b[2]*k-sh), dy=(y-b[1]*k)/(b[3]*k-sh); return dx*dx+dy*dy<1; });
  for(let y=R(-50*k); y<R(-18*k); y++) for(let x=R(-30*k); x<R(26*k); x++){
    if(!inside(x,y,2)) continue;
    const h=Math.abs(Math.sin(x*12.9898+y*78.233)*43758.5453)%1;
    const low = y > -30*k;
    if(h < (low? 0.07 : 0.035)) T.push([x,y, low? 1 : 0]);
  }
  _ELE_TEX.set(k,T); return T;
}
function eleFigure(g, o, lay){
  lay = lay || ((ink, fn, cut)=>fn(g));
  const k=o.k||1, C=o.C, t=o.t||0, Q=v=>v*k;
  const mv=o.mv||0, w=o.walk||0;
  const bob = mv*Math.abs(Math.sin(w*TAU))*Q(0.9);
  const br = Math.sin(t*1.2)*0.35;
  const by = -bob + br;
  const heads = o.heads||1;
  const nod = mv*Math.sin(w*TAU*2+0.6)*Q(0.8) + (o.nod||0);
  /* the tail, behind everything */
  { const sw=Math.sin(t*1.9+(o.seed||0))*Q(2.2)+(o.tail||0)*Q(3);
    const x0=Q(-27.5), y0=by+Q(-38);
    pTaper(g, x0, y0, x0-Q(3)+sw*0.4, y0+Q(10), Q(2.4), Q(1.6), C.d);
    pTaper(g, x0-Q(3)+sw*0.4, y0+Q(10), x0-Q(3.4)+sw, y0+Q(18), Q(1.6), Q(1.2), C.d);
    for(let n=-1;n<=1;n++) pTaper(g, x0-Q(3.4)+sw, y0+Q(18), x0-Q(3.4)+sw+n*Q(1.1), y0+Q(22), 1, 1, C.ink);
  }
  /* legs: far pair first, in the shade under the body */
  const LEGS=[ {x:-19,p:0.50,near:0,fore:0}, {x:8,p:0.75,near:0,fore:1},
               {x:-13,p:0.00,near:1,fore:0}, {x:14,p:0.25,near:1,fore:1} ];
  const leg=(g,L)=>{
    const p=(w+L.p)*TAU, sw=Math.sin(p)*mv, lift=Math.max(0,Math.cos(p))*mv;
    const col=L.near? C.h : C.d, dk=L.near? C.d : C.x;
    const tx=Q(L.x), ty=by+Q(-24);
    const fx=Q(L.x)+sw*Q(3.4), fy=-lift*Q(2.4);
    const kx=lerp(tx,fx,0.5)+(L.fore?-1:1)*lift*Q(1.6), ky=Q(-11)-lift*Q(1.4)+by*0.5;
    const w0=Q(L.fore?9.6:10.8)*(L.near?1:0.94), w1=Q(8.2), w2=Q(8.8);
    pTaper(g, tx,ty, kx,ky, w0,w1, col);
    pTaper(g, kx,ky, fx,fy-Q(2.5), w1,w2, col);
    pR(g, fx-w2/2-0.5, fy-Q(3), w2+1, Q(3), col);
    pTaper(g, tx-w0*0.36, ty+Q(4), kx-w1*0.36, ky, Q(1.6), Q(1.4), dk);
    pTaper(g, kx-w1*0.36, ky, fx-w2*0.38, fy-Q(2), Q(1.4), Q(1.4), dk);
    if(L.near){ pTaper(g, tx+w0*0.30, ty+Q(5), kx+w1*0.32, ky, 1, 1, C.l);
                pTaper(g, kx+w1*0.32, ky, fx+w2*0.36, fy-Q(3.4), 1, 1, C.l); }
    const step=Math.max(2,R(Q(2.6)));
    for(let yy=R(ky+2); yy<fy-Q(4); yy+=step){
      const u=(yy-ky)/Math.max(1,fy-ky), cx2=lerp(kx,fx,u);
      pR(g, cx2-w1*0.34, yy, w1*0.5, 1, dk);
      if(L.near) pR(g, cx2+w1*0.05, yy+1, w1*0.22, 1, C.d);
    }
    pR(g, fx-w2/2-0.5, fy-1, w2+1, 1, C.x);
    for(let n=0;n<2;n++) pR(g, fx+w2*0.5-Q(2)-n*Q(3), fy-Q(2.4), Math.max(1,Q(1.6)), Math.max(1,Q(1.2)), L.near? C.nail : C.h);
    if(o.anklet) o.anklet(g, fx, fy, w2, k, L);
  };
  for(const L of LEGS) if(!L.near) leg(g,L);
  /* the body, in four coats so the parts melt into one animal */
  const BODY=[[-2,-33,24,14.5],[11,-35,14,15],[-16,-32,13,14.5]];
  for(const b of BODY) pEll(g, Q(b[0]), by+Q(b[1])-1, Q(b[2]), Q(b[3]), C.l);
  for(const b of BODY) pEll(g, Q(b[0]), by+Q(b[1]), Q(b[2]), Q(b[3]), C.x);
  for(const b of BODY) pEll(g, Q(b[0]), by+Q(b[1])-1.5, Q(b[2])-0.5, Q(b[3])-1, C.d);
  for(const b of BODY) pEll(g, Q(b[0]), by+Q(b[1])-Q(3.4), Q(b[2])-Q(1.4), Q(b[3])-Q(3), C.h);
  pEll(g, Q(-3), by+Q(-45), Q(15), Q(1.8), C.l);
  pEll(g, Q(-6), by+Q(-44.2), Q(7), Q(1), C.hi);
  for(const p of eleTexture(k)) pR(g, p[0], by+p[1], 1, 1, p[2]? C.x : C.d);
  /* folds: behind the shoulder, over the haunch, where the belly meets the leg */
  pTaper(g, Q(4), by+Q(-42), Q(2.6), by+Q(-26), 1, 1, C.d);
  pTaper(g, Q(-26), by+Q(-40), Q(-23.5), by+Q(-24), 1, 1, C.d);
  pTaper(g, Q(-9), by+Q(-22), Q(-3), by+Q(-21.4), 1, 1, C.x);
  pTaper(g, Q(7), by+Q(-22.6), Q(12), by+Q(-22), 1, 1, C.x);
  if(o.bodyDress) o.bodyDress(g, by, k);
  const IN = o.inner || mix(C.ink, C.x, 0.35);
  lay(IN, g2=>{ for(const L of LEGS) if(L.near) leg(g2,L); }, by+Q(-19.5));
  if(o.rider) o.rider(g, Q(15), by+Q(-47));
  /* heads, back to front */
  /* three heads in a row, seen a little from the front: the far two stand
     out past the near one's brow, each with its own crown and trunk */
  const HO = heads===3? [[12,-7,0.88,0.30],[6,-3.5,0.94,0.15],[0,0,1,0]] : [[0,0,1,0]];
  const HK = o.headK||1.1;
  const tr = o.tr || [TRUNK.hang];
  HO.forEach((h,i)=>{
    const kk=k*h[2]*HK, CC = h[3]? eleBack(C,h[3]) : C;
    const hx=Q(28+h[0]), hy=by+Q(-40+h[1])+nod*(i+1)/HO.length;
    const front=i===HO.length-1;
    lay(IN, g=>{
      if(o.tusk) eleTusk(g, hx-Q(1.4), hy-Q(0.6), kk*0.94, o.goldTusk);          // the far tusk, behind
      eleHead(g, hx, hy, kk, CC, o, i, front);
      eleTrunk(g, hx+kk*8, hy+kk*5, tr[i]||tr[0], kk, CC, o, i);
      if(o.tusk) eleTusk(g, hx, hy, kk, o.goldTusk);
    });
    /* the far head is behind whatever rides on the back; the near two in front of it */
    if(i===0 && o.overDress) o.overDress(g, by, k);
  });
}

/* ============================================================
   พังบุญมี and Lung Kham
   ============================================================ */
const ELE_HOME = 3080;                       // the top of the banana grove
const ELE_STOP = SHRINE_X + 20;              // by the spirit house, where the bananas are
const ELE_BATH = POND_X + 84;                // the near bank of the pond
const ELE_SPD  = 22;                         // px a second, which is a slow walk for her
const ELE = { x:ELE_HOME, face:-1, walk:0, mv:0, t:0, blink:0, ear:0, tail:0,
  tr:Object.assign({}, TRUNK.hang), pose:'hang', act:null, actT:0, hold:0, cue:0,
  spray:[], dust:[], rumble:0, noticed:0, sayT:0, bub:null, lastX:null };
const ELE_SPR = [];                          // the water she throws, and the dust

function eleOn(){ return GS.state==='play' && !(typeof storyBusy==='function' && storyBusy()); }
function eleSongkran(){ return typeof festLive==='function' && festLive()==='songkran'; }
/* where she ought to be at this minute of the day, walking at her own
   pace between the stops. The clock is the whole plan: sleep through the
   morning and she is wherever the morning took her. */
const ELE_MPX = ELE_SPD / DAY_RATE;          // pixels a game-minute
function elePlan(min){
  const leave=330, sk=eleSongkran() || (typeof festOn==='function' && festOn(DAY.n)==='songkran');
  const A = sk? SONG_X+118 : ELE_STOP;
  const seg=[]; let tt=leave, x=ELE_HOME;
  const walk=(to)=>{ const d=Math.abs(to-x)/ELE_MPX; seg.push([tt, tt+d, x, to]); tt+=d; x=to; };
  const wait=(until)=>{ if(until>tt){ seg.push([tt, until, x, x]); tt=until; } };
  walk(A);
  if(sk){ wait(17.5*60); walk(ELE_HOME); }
  else { wait(8*60); walk(ELE_BATH); wait(14.5*60); walk(A); wait(tt+25); walk(ELE_HOME); }
  if(min<leave) return {x:ELE_HOME, dir:0, at:'home'};
  for(const s of seg) if(min>=s[0] && min<s[1]){
    const u=(min-s[0])/Math.max(1e-6,s[1]-s[0]);
    return {x:lerp(s[2],s[3],u), dir:Math.sign(s[3]-s[2]),
            at: s[2]===s[3]? (s[2]===ELE_BATH? 'bath' : s[2]===ELE_HOME? 'home' : sk? 'song' : 'stop') : 'walk'};
  }
  return {x:ELE_HOME, dir:0, at:'home'};
}
function eleSpray(x, y, vx, vy, n, spread, kind){
  for(let i=0;i<n;i++) ELE_SPR.push({x:x+rnd(-1,1), y:y+rnd(-1,1),
    vx:vx+rnd(-spread,spread), vy:vy+rnd(-spread,spread), t:0, life:rnd(0.7,1.3), r:rnd(0.8,1.9), k:kind||'w'});
  if(ELE_SPR.length>260) ELE_SPR.splice(0, ELE_SPR.length-260);
}
function eleRumble(){ AU.tone(52,0.9,'sine',0.06,44); AU.tone(78,0.7,'triangle',0.02,60,0.05); }
function eleTrumpet(k){ k=k||1;
  AU.tone(330*k,0.18,'sawtooth',0.035,520*k); AU.tone(520*k,0.55,'sawtooth',0.04,410*k,0.14);
  AU.tone(262*k,0.6,'square',0.012,200*k,0.16); AU.noise(0.5,0.012,600,2600,0.12); }

function stepEle(dt){
  const E=ELE;
  E.t+=dt; E.cue-=dt; E.sayT=Math.max(0,E.sayT-dt);
  if(E.bub){ E.bub.t-=dt; if(E.bub.t<=0) E.bub=null; }
  /* water and dust, whatever she is doing */
  for(let i=ELE_SPR.length-1;i>=0;i--){
    const s=ELE_SPR[i]; s.t+=dt;
    s.vy += (s.k==='d'? 60 : 300)*dt; if(s.k==='d'){ s.vx*=1-dt*1.6; s.vy*=1-dt*1.2; }
    s.x+=s.vx*dt; s.y+=s.vy*dt;
    const gy=groundY(s.x);
    if(s.t>=s.life || (s.k==='w' && s.y>=gy && s.vy>0)){
      if(s.k==='w' && s.y>=gy && Math.random()<0.3 && typeof SONG!=='undefined' && SONG.wet.length<40)
        SONG.wet.push({x:s.x, r:rnd(3,7), t:rnd(2,5)});
      ELE_SPR.splice(i,1);
    }
  }
  if(!eleOn()) return;
  const pl=elePlan(DAY.min);
  /* she follows the plan at her own pace, and stops for anybody with a banana */
  if(E.lastX===null || Math.abs(pl.x-E.x)>420) E.x=pl.x;
  E.hold=Math.max(0,E.hold-dt);
  const d=pl.x-E.x, busy=E.hold>0 || !!E.act;
  let v=0;
  if(!busy && Math.abs(d)>1.5){ v=Math.sign(d)*Math.min(ELE_SPD*(Math.abs(d)>40?1.5:1), Math.abs(d)/dt); E.face=Math.sign(d); }
  E.x+=v*dt; E.lastX=E.x;
  E.mv = lerp(E.mv, v? 1 : 0, dt*4);
  E.walk = (E.walk + Math.abs(v)*dt/46) % 1;
  E.at = v? 'walk' : pl.at;
  if(!v && pl.at==='bath') E.face=-1;
  if(!v && pl.at==='song') E.face=-1;
  /* blink, flap, swish */
  E.blink = ((E.t*0.31)%1) < 0.035;
  const hot = DAY.min>11*60 && DAY.min<16*60;
  E.ear = lerp(E.ear, (hot? 1.2 : 0) + (E.act==='trumpet'? 2.6 : 0) + (E.noticed>0? 1.4 : 0), dt*3);
  E.noticed=Math.max(0,E.noticed-dt);
  /* what the trunk is up to */
  let want = E.mv>0.3? 'sway' : 'hang';
  if(E.act){
    E.actT+=dt;
    const A=E.act, u=E.actT;
    if(A==='take'){ want = u<0.7? 'reach' : u<1.5? 'eat' : 'hang';
      if(u>0.7 && u<1.5 && Math.random()<dt*6) part({k:'sp', x:E.x+30*E.face, y:groundY(E.x)-32, vx:rnd(-6,6), vy:-rnd(4,12), life:0.5, c:'#f2d46a'});
      if(u>2.0) E.act=null; }
    else if(A==='pat'){ want = u<1.4? 'up' : 'hang'; if(u>1.8) E.act=null; }
    else if(A==='trumpet'){ want='up'; if(u>1.3) E.act=null; }
    else if(A==='shower'){ want = u<0.8? 'dip' : u<2.2? 'spray' : 'hang';
      if(u>0.9 && u<2.1){ const tp=eleTip(); if(tp) eleSpray(tp.x, tp.y, E.face*rnd(120,190), -rnd(30,90), 3, 16); }
      if(u>2.5) E.act=null; }
  } else if(E.at==='bath'){
    /* in and out of the pond: a trunkful, then over her back with it */
    const c=(E.t*0.22)%1;
    want = c<0.35? 'dip' : c<0.62? 'back' : c<0.8? 'hang' : 'spray';
    const tp=eleTip();
    if(tp && c>=0.42 && c<0.6) eleSpray(tp.x, tp.y, -E.face*rnd(20,60), -rnd(20,70), 3, 18);
    if(tp && c>=0.86 && c<0.96) eleSpray(tp.x, tp.y, E.face*rnd(60,120), -rnd(10,40), 2, 14);
  } else if(E.at==='song'){
    /* Songkran: the tub, the trunk, and the kids who have been waiting all year for this */
    const c=(E.t*0.28)%1;
    want = c<0.3? 'dip' : c<0.4? 'hang' : c<0.72? 'spray' : 'hang';
    const tp=eleTip();
    if(tp && c>=0.45 && c<0.7){ eleSpray(tp.x, tp.y, E.face*rnd(110,200), -rnd(60,140), 3, 22);
      if(Math.random()<dt*2) AU.noise(0.15,0.02,400,3000); }
    if(c>0.44 && c<0.46 && E.cue<=0){ E.cue=1; if(Math.random()<0.5) eleTrumpet(1.1); }
  } else if(E.at==='home' || E.at==='stop'){
    const c=(E.t*0.09+(E.x%7)*0.1)%1;
    want = c<0.12? 'eat' : c<0.2? 'toss' : c<0.3? 'sniff' : 'hang';
    const tp=eleTip();
    if(tp && c>=0.13 && c<0.19 && Math.random()<0.6) eleSpray(tp.x, tp.y, -E.face*rnd(10,40), -rnd(30,60), 2, 14, 'd');
  }
  /* she knows he is there. Animals do. */
  if(Math.abs(P.x-E.x)<70 && !E.act && E.mv<0.3){
    if(!E.metDay || E.metDay!==DAY.n){ E.metDay=DAY.n; E.noticed=2.4; eleRumble(); }
    if(E.noticed>0) want='sniff';
  }
  E.pose=want;
  trunkTo(E.tr, want, clamp(dt*(want==='spray'||want==='up'? 7 : 3.4),0,1));
}
function eleTip(){ return ELE._tipW||null; }

/* ---------- Lung Kham, on her neck ---------- */
function eleMahout(g, sx, sy){
  const v=drawPerson(g,{ keep:'lungKham', x:sx-1, y:sy+6, face:1, pose:'sit', anim:ELE.t,
    skin:'#b98660', shirt:'#2f3d5e', legs:'#2f3d5e', hair:'crop', hairC:'#9a948c',
    moust:1, mood:1, talk:ELE.bub? 0.6 : 0 });
  /* the ขอ, the hook he never uses, carried because his father carried one */
  const hx=v&&v._hx!==undefined? v._hx : sx+5, hy=v&&v._hy!==undefined? v._hy : sy-9;
  pTaper(g, hx-3, hy+4, hx+5, hy-6, 1.2, 1.2, '#6a4a2c');
  pR(g, hx+5, hy-7, 2, 1, '#9aa0a8'); pR(g, hx+6, hy-8, 1, 2, '#9aa0a8');
}
function eleVillageDress(g, by, k){
  const sk = eleSongkran();
  /* the pad he sits on: a folded ผ้าขาวม้า */
  const px=14, py=by-48;
  pR(g, px-7, py, 14, 4, '#b8423e'); for(let i=0;i<14;i+=3) pR(g, px-7+i, py, 1, 4, '#f0e2d0');
  pR(g, px-7, py+1, 14, 1, '#f0e2d0'); pR(g, px-7, py+3, 14, 1, '#7a2622');
  if(sk){
    /* a flowered cloth over the back, the same print as every shirt in the village today */
    const pts=[-20,by-45, 8,by-46, 10,by-33, 4,by-28, -16,by-28, -22,by-35];
    pPolyO(g, pts, '#2f86cf', '#1b5a94');
    const r=mulberry(77);
    for(let i=0;i<22;i++){ const fx=-19+r()*27, fy=by-44+r()*14;
      const c=pick(['#ff7aa8','#ffd84a','#ffffff','#ff9a3a']);
      pR(g, fx, fy, 2, 2, c); pR(g, fx+0.5, fy+0.5, 1, 1, '#fff6c0'); }
    for(let x=-16;x<5;x+=2) pR(g, x, by-29, 1, 2, x%4? '#ffd84a' : '#ff7aa8');
  }
}
function eleVillageHead(g, hx, hy, k, i, front){
  const sk = eleSongkran();
  /* a rope round the neck, and a brass bell at the throat */
  pTaper(g, hx-8, hy-8, hx-5, hy+11, 1.4, 1.4, '#b89a60');
  pTaper(g, hx-5, hy+11, hx-1, hy+14, 1.4, 1.4, '#b89a60');
  pEll(g, hx-1, hy+16, 1.8, 2.2, '#c8a040'); pR(g, hx-2, hy+17, 3, 1, '#8a6a20'); pR(g, hx-1, hy+18, 1, 1, '#4a3a10');
  if(sk){
    /* the garland: marigold and jasmine, looped round the neck */
    for(let n=0;n<14;n++){ const u=n/13, a=u*Math.PI;
      const gx=hx-9+u*9, gy=hy+2+Math.sin(a)*12;
      pEll(g, gx, gy, 1.5, 1.5, n%3===2? '#f8f4e6' : n%3? '#ff9a1e' : '#ffb830'); }
    pTaper(g, hx-2, hy+13, hx-1, hy+20, 1.6, 1.2, '#ff9a1e'); pR(g, hx-2, hy+20, 3, 2, '#d8303c');
    /* ดินสอพอง: the cool white paste, dabbed on the forehead in fives */
    for(const p of [[4,-7],[6,-5],[3,-4],[6.4,-8.6],[8,-3],[7.4,2],[9,4.6]]) pR(g, hx+p[0], hy+p[1], 1.5, 1.5, '#f8f6ee');
  } else if(festLiveAny()){
    pR(g, hx+3, hy-9, 4, 7, '#b8322a'); pR(g, hx+3, hy-9, 4, 1, '#f2c94c'); pR(g, hx+4, hy-6, 2, 2, '#f2c94c');
  }
}
function festLiveAny(){ return typeof festLive==='function' && !!festLive(); }

/* ---------- where she sleeps: a thatch roof on four poles in the bananas ---------- */
let ELE_SHED=null;
function eleShed(){
  if(ELE_SHED) return ELE_SHED;
  const w=112, h=92, c=mkCv(w,h), g=G2(c), r=mulberry(4242);
  /* the poles, bamboo, with their joints */
  for(const x of [10, 38, 74, 100]){
    pR(g, x, 18, 4, h-18, '#a88a52'); pR(g, x, 18, 1, h-18, '#c8aa6a'); pR(g, x+3, 18, 1, h-18, '#7a6238');
    for(let y=28;y<h;y+=13) pR(g, x, y, 4, 1, '#6a5430');
  }
  /* the roof: หญ้าคา, thatch in rows, sagging a little in the middle */
  for(let row=0; row<6; row++){
    const y=4+row*3.4;
    for(let x=0;x<w;x++){
      const sag=Math.sin(x/w*Math.PI)*2.4, yy=y+sag+(r()<0.2?1:0);
      pR(g, x, yy, 1, 5, row%2? '#b89454' : '#a8844a');
      if(r()<0.25) pR(g, x, yy+4, 1, 1+ (r()*3|0), '#8a6a38');
    }
  }
  pR(g, 0, 3, w, 2, '#c8a864');
  for(let x=0;x<w;x+=2) pR(g, x, 24+Math.sin(x/w*Math.PI)*2.4, 1, 2+(x*7%3), '#8a6a38');
  /* the post she is tied to, which she could pull out of the ground any
     time she liked, and a length of chain lying slack */
  pR(g, 54, 56, 5, h-56, '#6a4a2c'); pR(g, 54, 56, 1, h-56, '#8a6a44');
  for(let i=0;i<9;i++) pEll(g, 60+i*3, h-3-Math.sin(i/8*Math.PI)*2, 1.4, 1, i%2? '#6a6a70' : '#8a8a92');
  /* what she eats: banana stems cut to length, and a bundle of grass */
  for(let i=0;i<5;i++){ const y=h-4-i%2*4-((i/2)|0)*3, x=6+i*6;
    pR(g, x, y-3, 20, 5, '#8aa85a'); pR(g, x, y-3, 20, 1, '#aac87a'); pEll(g, x+20, y-1, 2, 2.4, '#e8e4c8'); }
  for(let i=0;i<24;i++){ const x=84+r()*18; pTaper(g, x, h-2, x+r()*6-3, h-18-r()*6, 1, 1, pick(['#7a9a4a','#9ab85a','#6a8a3a'])); }
  pR(g, 82, h-8, 22, 2, '#a88a52');
  /* a blue tub of water, and her name on a board in Lung Kham's hand */
  pEll(g, 44, h-2, 9, 2, '#1d4f6e'); pR(g, 35, h-10, 18, 8, '#2a6f96'); pR(g, 35, h-10, 18, 1, '#7fd0e8');
  pR(g, 62, 36, 26, 11, '#e8dcc0'); pR(g, 62, 36, 26, 1, '#fff4dc'); pR(g, 62, 46, 26, 1, '#a8987c');
  for(let i=0;i<4;i++) pR(g, 65+i*6, 40, 4, 1, '#4a3a2a');
  for(let i=0;i<3;i++) pR(g, 66+i*6, 43, 3, 1, '#4a3a2a');
  ELE_SHED=c; return c;
}

function drawEle(g){
  if(!eleOn()) return;
  const E=ELE, gy=groundY(E.x);
  if(Math.abs(ELE_HOME-GS.camX-W/2)<W/2+80) g.drawImage(eleShed(), R(ELE_HOME-56), R(groundY(ELE_HOME)-91));
  if(E.x-GS.camX<-90 || E.x-GS.camX>W+90){ drawEleSpray(g); return; }
  /* the tub she fills from at Songkran */
  if(E.at==='song'){
    const tx=E.x+E.face*42, ty=groundY(tx);
    pEll(g, tx, ty, 13, 3, '#1d4f6e'); pR(g, tx-13, ty-9, 26, 9, '#2a6f96'); pR(g, tx-13, ty-9, 26, 2, '#3d8cb8');
    pEll(g, tx, ty-9, 13, 2.4, '#7fd0e8'); pEll(g, tx-3+Math.sin(E.t*2)*2, ty-9.4, 4, 1, '#bfe6ff');
  }
  pEll(g, E.x+2*E.face, gy+0.5, 30, 3.6, 'rgba(20,14,24,0.28)');
  const o={ k:1, C:ELE_SKIN.grey, t:E.t, mv:E.mv, walk:E.walk, blink:E.blink, ear:E.ear,
    tr:[E.tr], rider:(E.at==='home' && (DAY.min<5.4*60 || DAY.min>19.2*60))? null : eleMahout, bodyDress:eleVillageDress, headDress:eleVillageHead, tail:Math.sin(E.t*0.7)*0.4, seed:3 };
  eleStamp(g, E.x, gy, E.face, 122, 94, 54, 90, ELE_SKIN.grey.ink, (a,lay)=>eleFigure(a,o,lay));
  /* where the trunk tip ended up, in the world, for the water to come out of */
  if(o._tip && o._tip[0]){ const tp=o._tip[0];
    ELE._tipW={ x:E.x+tp.x*E.face, y:gy+tp.y, dx:tp.dx*E.face, dy:tp.dy }; }
  drawEleSpray(g);
  if(E.bub) bubble(g, E.x+14*E.face, gy-74, E.bub.txt);
}
function drawEleSpray(g){
  for(const s of ELE_SPR){
    if(s.x-GS.camX<-20||s.x-GS.camX>W+20) continue;
    const a=clamp(1-s.t/s.life,0,1);
    if(s.k==='d'){ g.globalAlpha=a*0.35; pEll(g, s.x, s.y, s.r*2.2, s.r*1.8, '#b89a6c'); g.globalAlpha=1; continue; }
    g.globalAlpha=a*0.32;
    pTaper(g, s.x-s.vx*0.024, s.y-s.vy*0.024, s.x, s.y, s.r*0.6, s.r*0.9, '#9fd4ee');
    g.globalAlpha=a*0.78; pEll(g, s.x, s.y, s.r, s.r*1.15, '#c4e8ff');
    g.globalAlpha=a*0.9; pR(g, s.x-s.r*0.4, s.y-s.r*0.4, 1, 1, '#f4fcff');
    g.globalAlpha=1;
  }
}

const KHAM_LINES = [
  'She is fifty-one. She pulled teak out of the hills until they stopped the logging. Then she carried tourists. Now she carries me, and only to the pond.',
  'Boonmee means a great deal of merit. Her first mahout named her. I think he was talking about himself.',
  'She has seen something by you. She does that at the wat, too. I have stopped asking what.',
  'Two hundred kilos a day. Bananas, grass, sugar cane, and once, the whole of Yai Pen\'s hedge.',
  'Thirty years, and she still lets me think it is me deciding where we go.',
];
function eleInteract(set, taken){
  if(!eleOn()) return;
  const E=ELE;
  if(Math.abs(P.x-E.x)>46) return;
  const gy0=groundY(E.x), y=gy0-50;
  if(eleSongkran() && E.at==='song')
    set(E.x+30*E.face, y+4, 'ask Boonmee for a shower', ()=>{
      E.act='shower'; E.actT=0; E.face=Math.sign(P.x-E.x)||E.face; E.hold=3;
      if(!GS.seen.eleShower){ GS.seen.eleShower=true; addMerit(2);
        say([{w:'',t:'She fills her trunk from the tub and lets you have all of it.'},
             {w:'',t:'It goes through you. The kids behind you get it instead, and scream, and ask her to do it again.'}]); }
      else toast(L('all of it, straight through'),'#bfe6ff');
    }, null, 'water');
  if(bagHas('banana'))
    set(E.x+28*E.face, y+12, 'give Boonmee a banana', ()=>{
      bagTake('banana',1);
      E.act='take'; E.actT=0; E.hold=2.4; eleRumble();
      pHeart(E.x+20*E.face, y-4);
      if(GS.talked.eleFed!==DAY.n){ GS.talked.eleFed=DAY.n; addMerit(2); toast('+2', PAL.gold, 'merit'); }
      if(!GS.seen.eleFed){ GS.seen.eleFed=true;
        say([{w:'Lung Kham', t:'She took that from nobody. You saw that? The banana went up in the air by itself.'},
             {w:'Lung Kham', t:'Well. She is not frightened of you, so I will not be either.'}]); }
    }, null, 'give');
  else set(E.x+28*E.face, y+12, 'stroke Boonmee\'s trunk', ()=>{
    E.act='pat'; E.actT=0; E.hold=2; eleRumble();
    pHeart(E.x+26*E.face, y);
    if(GS.talked.elePat!==DAY.n){ GS.talked.elePat=DAY.n; addMerit(1); toast('+1', PAL.gold, 'merit'); }
  }, null, 'pet');
  if(E.mv<0.3)
    set(E.x-2*E.face, gy0-86, 'talk to Lung Kham', ()=>{
      const n=(GS.q.khamN|0); GS.q.khamN=n+1;
      say([{w:'Lung Kham', t:KHAM_LINES[n%KHAM_LINES.length]}]);
    }, null, 'talk');
}

/* ============================================================
   สงกรานต์, with a watering can

   The can holds exactly enough for one good soaking. On the water
   days anybody standing still is fair game, and everybody you get
   gets you straight back — through you, and onto the road.
   ============================================================ */
const SK_BLESS = ['A cool year to you!','Happy Songkran!','Oof, cold!','Got you back!','Splash!'];
function songCanInteract(set){
  if(!eleSongkran() || typeof toolNow!=='function' || toolNow()!=='can') return;
  let best=null, bd=48;
  for(const n of NPCS){ if(n.inside) continue; const d=Math.abs(n.x-P.x); if(d<bd){ bd=d; best=n; } }
  if(!best) return;
  const n=best;
  set(n.x, n.y-36, L('splash')+' '+L(n.name||'them'), ()=>{
    P.face = Math.sign(n.x-P.x)||P.face;
    if(typeof TOOL!=='undefined') TOOL.swing={k:'can', t:0, dur:0.9, hit:true};
    throwWater(P.x+P.face*14, P.y-30, P.face);
    n.bub={t:2.4, txt:L(pick(SK_BLESS))};
    n.face = -P.face;
    setTimeout(()=>{ if(eleSongkran()) throwWater(n.x-P.face*6, n.y-26, -P.face); }, 650);
    const key='sk_'+DAY.n+'_'+(n.name||n.x|0);
    if(!GS.seen[key]){ GS.seen[key]=true; addMerit(1); toast('+1', PAL.gold, 'merit'); }
    if(!GS.seen.songCan){ GS.seen.songCan=true;
      say([{w:'',t:'Water poured on somebody at Songkran is a blessing. You are allowed to be very generous with it.'}]); }
  }, null, 'water');
}
/* and at the wat, the sand chedis: every grain carried in on your feet all
   year is carried back in by the handful, heaped up, and flagged */
const SAND_X = [SALA_X-120, SALA_X-96, SALA_X-74];
function drawSandChedis(g){
  if(!eleSongkran()) return;
  for(let i=0;i<SAND_X.length;i++){
    const x=SAND_X[i]; if(x-GS.camX<-30||x-GS.camX>W+30) continue;
    const gy=groundY(x), h=14+i%2*5+(GS.seen['sand_'+DAY.n]?3:0);
    pTri(g, x, gy-h, x-9, gy, x+9, gy, '#d8c090');
    pTri(g, x, gy-h, x+1, gy, x+9, gy, '#c0a878');
    for(let k=0;k<3;k++) pR(g, x-7+k*2, gy-3-k*3, 14-k*4, 1, '#e8d4a8');
    pR(g, x, gy-h-8, 1, 8, '#8a6a44');
    const fl=Math.sin(GS.t*3+i)*1;
    pPoly(g, [x+1,gy-h-8, x+7+fl,gy-h-6, x+1,gy-h-4], ['#e8403c','#2f86cf','#ffd84a'][i%3]);
    for(let k=0;k<4;k++) pR(g, x-6+k*4, gy-2-(k%2)*2, 2, 2, ['#ff7aa8','#ffd84a','#8fd0ff','#ffffff'][k]);
  }
}
function sandInteract(set){
  if(!eleSongkran()) return;
  const x=SAND_X[1];
  if(Math.abs(P.x-x)>34) return;
  set(x, groundY(x)-30, 'add a handful of sand', ()=>{
    preteAct('water', 1.1, ()=>{
      if(!GS.seen['sand_'+DAY.n]){ GS.seen['sand_'+DAY.n]=true; addMerit(2); toast('+2', PAL.gold, 'merit'); }
      pSpark(x, groundY(x)-18, 6, '#e8d4a8');
      if(!GS.seen.sandChedi){ GS.seen.sandChedi=true;
        say([{w:'',t:'You carry sand out of the wat on your feet all year. At Songkran you bring it back, and heap it up, and put a flag on top.'},
             {w:'',t:'Yours runs through your fingers. It lands on the heap all the same.'}]); }
    });
  }, null, 'pick');
}

/* ============================================================
   ช้างเอราวัณ, in heaven

   White, and big: the same elephant at nearly twice the size, with
   three heads fanned out one behind another, a gold net and a crown
   on each, gold on every tusk and ankle, a red caparison worked in
   gold, and on his back the บุษบก Indra rides in, empty today
   because Indra is inside at the assembly. He stands on the terrace
   between the hall and the chedi and watches you come.
   ============================================================ */
const ERW = { t:0, tr:[Object.assign({},TRUNK.hang),Object.assign({},TRUNK.sway),Object.assign({},TRUNK.hang)],
  act:null, actT:0, blink:0, ear:0, lift:0, lifted:false, face:-1, tips:null };
const ERW_K = 1.72;
function erawanX(){ return (typeof HV_X!=='undefined'? HV_X.erawan : 1520); }
function stepErawan(dt){
  const E=ERW; E.t+=dt;
  E.blink = ((E.t*0.27)%1)<0.03;
  E.ear = lerp(E.ear, E.act? 2.4 : 0.4, dt*3);
  const near = Math.abs(P.x-erawanX())<150;
  const poses=['hang','sway','hang'];
  if(near && !E.act) poses[2] = Math.abs(P.x-erawanX())<90? 'sniff' : 'sway';
  if(E.act==='trumpet'){ E.actT+=dt; poses[2]='up'; poses[1]=E.actT>0.25?'up':'sway'; poses[0]=E.actT>0.5?'up':'hang';
    if(E.actT>2.2){ E.act=null; } }
  if(E.act==='lift'){
    E.actT+=dt; const u=E.actT;
    poses[2] = u<0.6? 'reach' : 'up';
    const up = u<0.6? 0 : u<2.4? Math.sin(clamp((u-0.6)/0.5,0,1)*Math.PI/2) : Math.max(0, 1-(u-2.4)/0.5);
    E.lift=up;
    if(u>0.6 && u<2.9){
      /* round the waist and up, to where the front head can see you */
      const tx=erawanX()+E.face*70, gy=heavenGround(tx);
      P.x = lerp(P.x, tx, clamp(dt*5,0,1)); P.y = gy - up*58; P.vy=0; P.vx=0; P.onGround=false; P.face=-E.face;
      if(Math.random()<dt*10) part({k:'sp', x:P.x+rnd(-12,12), y:P.y-rnd(10,40), vx:rnd(-10,10), vy:-rnd(10,30), life:rnd(.5,1), c:HV.goldL});
    }
    if(u>2.9){ E.act=null; E.lift=0; P.vy=-40; }
  }
  for(let i=0;i<3;i++) trunkTo(E.tr[i], poses[i], clamp(dt*(poses[i]==='up'? 5 : 2.6),0,1));
}
function erawanScratch(){
  const E=ERW;
  eleTrumpet(0.9);
  const x=erawanX();
  for(let i=0;i<18;i++) part({k:'petal', x:x+rnd(-70,60), y:HG-150-rnd(0,30), vx:rnd(-14,14), vy:rnd(8,26), life:rnd(1.6,3), sw:rnd(9), c:pick(['#ff6a4a','#ffd0dc','#fff0a8','#f2a0b8'])});
  for(let i=0;i<12;i++) part({k:'sp', x:x-60+rnd(-16,16), y:HG-110+rnd(-20,20), vx:rnd(-30,30), vy:-rnd(20,50), life:rnd(.6,1.2), c:HV.goldL});
  GS.shake=Math.max(GS.shake||0, 1.2);
  if(typeof HVN!=='undefined' && !HVN.lifted){ HVN.lifted=true; E.act='lift'; E.actT=0; }
  else { E.act='trumpet'; E.actT=0; }
}
function erawanHeadDress(g, hx, hy, k, i, front){
  const Q=v=>v*k, G=HV.gold, GL=HV.goldL, GD=HV.goldD, GX=HV.goldX;
  /* the net of gold over both domes, a lattice of beads */
  for(let yy=-14; yy<=-2; yy+=2.6) for(let xx=-7; xx<=8; xx+=2.6){
    const dA=((xx+3.2)/5.6)**2+((yy+9.4)/5.6)**2, dB=((xx-3.3)/5.2)**2+((yy+8.8)/5.2)**2, dC=(xx/10.4)**2+(yy/11.4)**2;
    if(!(dA<1||dB<1||dC<1)) continue;
    if(yy>-6) continue;
    const odd=((R((yy+14)/2.6)+R((xx+7)/2.6))%2)===0;
    if(odd) pR(g, hx+Q(xx), hy+Q(yy), 1, 1, GD); else pR(g, hx+Q(xx), hy+Q(yy), 1, 1, G);
  }
  /* its edge, a fine band across the brow with beads on it, and one jewel
     hanging from the middle on a chain */
  for(let n=0;n<=10;n++){ const u=n/10, bx=lerp(-4,8.4,u), byy=lerp(-4.8,-5.6,u)-Math.sin(u*Math.PI)*1.4;
    pR(g, hx+Q(bx), hy+Q(byy), 1, 1, n%2? GL : G); if(n%3===0) pR(g, hx+Q(bx), hy+Q(byy)+1, 1, 1, GD); }
  pR(g, hx+Q(8.6), hy-Q(4.6), 1, Q(4), GD);
  pEllO(g, hx+Q(8.8), hy-Q(0.2), Q(1.1), Q(1.4), HV.gem, GX);
  pR(g, hx+Q(8.5), hy-Q(0.8), 1,1, '#ffb0b0');
  /* the crown, standing between the domes */
  drawChada(g, R(hx+Q(0.4)), R(hy-Q(13.4)), 1, {tall:0.62*k, rings:5, w:Q(8.4), bend:0.2});
  /* and a tassel hanging behind the ear */
  pTaper(g, hx-Q(14), hy-Q(4), hx-Q(15), hy+Q(10), Q(1.4), Q(1), HV.red);
  pR(g, hx-Q(15.6), hy+Q(10), Q(2), Q(3), G);
}
function erawanAnklet(g, fx, fy, w2, k){
  pR(g, fx-w2/2-0.5, fy-k*7, w2+1, k*2.2, HV.gold); pR(g, fx-w2/2-0.5, fy-k*7, w2+1, 1, HV.goldL);
  pR(g, fx-w2/2-0.5, fy-k*4.8, w2+1, 1, HV.goldX);
  for(let n=0;n<3;n++) pR(g, fx-w2*0.3+n*w2*0.3, fy-k*4.4, 1, 1, HV.gem2);
}
function erawanBody(g, by, k){
  const Q=v=>v*k, G=HV.gold, GL=HV.goldL, GD=HV.goldD, GX=HV.goldX, RD=HV.red, RDD=HV.redD;
  /* the caparison, red, hanging to the belly, gold at every edge */
  const cap=[-24,-46, 13,-47.5, 18,-40, 17,-23, -20,-22, -25,-34];
  const pts=[]; for(let n=0;n<cap.length;n+=2) pts.push(Q(cap[n]), by+Q(cap[n+1]));
  pPolyO(g, pts, RD, RDD);
  /* worked all over with ลายกนก: rows of gold flame-flowers */
  for(let yy=-43; yy<-25; yy+=4.2) for(let xx=-19; xx<14; xx+=5.4){
    const ox=((R((yy+43)/4.2))%2)? 2.7 : 0, px=Q(xx+ox), py=by+Q(yy);
    pR(g, px, py, 2, 2, G); pR(g, px, py, 1, 1, GL);
    pR(g, px-Q(1.4), py+Q(1), 1, 1, GD); pR(g, px+Q(1.4)+1, py+Q(1), 1, 1, GD);
    pR(g, px, py-Q(1.6), 1, 1, GD);
  }
  /* the border and the fringe */
  pTaper(g, Q(-20), by+Q(-22), Q(17), by+Q(-23), Q(2.4), Q(2.4), G);
  pTaper(g, Q(-20), by+Q(-22.8), Q(17), by+Q(-23.8), 1, 1, GL);
  for(let xx=-19; xx<16; xx+=2.2){ const yb=by+Q(lerp(-21.4,-22.4,(xx+19)/35));
    pR(g, Q(xx), yb, 1, Q(3.4), R(xx*1.3)%2? G : GD); if(R(xx)%3===0) pEll(g, Q(xx), yb+Q(4), 1.2, 1.2, HV.gem); }
  pTaper(g, Q(-23), by+Q(-46), Q(14), by+Q(-47.5), Q(2.2), Q(2.2), G);
  /* a green saddle-cloth over it, under the howdah */
  pPolyO(g, [Q(-16),by+Q(-47), Q(6),by+Q(-47.5), Q(8),by+Q(-37), Q(-17),by+Q(-37)], HV.jade, HV.jadeD);
  for(let xx=-15; xx<7; xx+=3) pR(g, Q(xx), by+Q(-38.6), 1, Q(1.6), GL);
  pTaper(g, Q(-17), by+Q(-37), Q(8), by+Q(-37), Q(1.4), Q(1.4), G);
  /* the chest-band with its bells, where the caparison is tied */
  pTaper(g, Q(14), by+Q(-46), Q(22), by+Q(-22), Q(2.6), Q(2.6), G);
  pTaper(g, Q(14.6), by+Q(-46), Q(22.6), by+Q(-22), 1, 1, GL);
  for(let n=0;n<4;n++){ const u=n/3, bx=Q(lerp(15,21.6,u)), byy=by+Q(lerp(-42,-24,u));
    pEllO(g, bx+Q(1.4), byy+Q(2), Q(1.3), Q(1.6), G, GX); }
  /* the girth, under the belly */
  pTaper(g, Q(-4), by+Q(-47), Q(-2), by+Q(-19.4), Q(2), Q(2), GD);
}
/* the บุษบก: a gold pavilion for one, with a spire in tiers */
function erawanHowdah(g, by, k){
  const Q=v=>v*k, G=HV.gold, GL=HV.goldL, GD=HV.goldD, GX=HV.goldX, RD=HV.red, RDD=HV.redD;
  const cx=Q(-11), base=by+Q(-47.5);
  /* the platform and its railing */
  pPolyO(g, [cx-Q(14),base, cx+Q(14),base, cx+Q(13),base-Q(4.6), cx-Q(13),base-Q(4.6)], G, GX);
  for(let n=-12;n<=12;n+=3) pR(g, cx+Q(n), base-Q(3.6), 1, Q(2.6), n%2? GD : RD);
  pR(g, cx-Q(13), base-Q(4.8), Q(26), 1, GL);
  /* four slim pillars, red lacquer banded in gold */
  const top=base-Q(21);
  for(const px of [-11.5,-4,4,11.5]){
    pTapO(g, cx+Q(px), base-Q(4.6), cx+Q(px), top, Q(1.6), Q(1.4), px===-4||px===4? RDD : RD, GX);
    for(let yy=6; yy<18; yy+=4) pR(g, cx+Q(px)-Q(0.8), base-Q(yy), Q(1.8), 1, G);
  }
  /* a cushion, empty: Indra is inside */
  pEllO(g, cx, base-Q(6.2), Q(8), Q(1.8), HV.blue, HV.blueD);
  pR(g, cx-Q(7), base-Q(7.4), Q(14), 1, HV.blueL);
  /* the lintel, with a fringe of gold drops */
  pPolyO(g, [cx-Q(14),top+Q(1), cx+Q(14),top+Q(1), cx+Q(13),top-Q(2.6), cx-Q(13),top-Q(2.6)], G, GX);
  for(let n=-12;n<=12;n+=2.4) pR(g, cx+Q(n), top+Q(1.4), 1, Q(2)+(R(n)%2?1:0), GD);
  /* three tiers of roof, red with gold edges, each with its little chofa */
  let yb=top-Q(2.6), wv=14;
  for(let tier=0; tier<3; tier++){
    const h=Q(5.4-tier*0.8), w0=Q(wv), w1=Q(wv*0.62);
    pPolyO(g, [cx-w0,yb, cx+w0,yb, cx+w1,yb-h, cx-w1,yb-h], tier%2? RDD : RD, GX);
    pTaper(g, cx-w0, yb, cx-w1, yb-h, 1.2, 1.2, G); pTaper(g, cx+w0, yb, cx+w1, yb-h, 1.2, 1.2, G);
    pR(g, cx-w0, yb-1, w0*2, 1, GL);
    for(const s of [-1,1]){ pTaper(g, cx+s*w0, yb, cx+s*(w0+Q(1.6)), yb-Q(2.8), 1.4, 1, G); pR(g, cx+s*(w0+Q(1.6))-0.5, yb-Q(3.2), 1,1, GL); }
    for(let n=-1;n<=1;n++) pR(g, cx+n*w1*0.6, yb-h*0.5, 1, 1, n? HV.gem2 : HV.gem);
    yb-=h; wv*=0.68;
  }
  /* and the spire: rings of gold narrowing to a point */
  for(let n=0;n<7;n++){ const ww=Q(lerp(3.6,0.8,n/6)), yy=yb-Q(n*2.4);
    pPolyO(g, [cx-ww,yy, cx+ww,yy, cx+ww*0.8,yy-Q(2.2), cx-ww*0.8,yy-Q(2.2)], n%2? GD : G, GX);
    pR(g, cx-ww+1, yy-1, Math.max(1,ww*2-2), 1, GL); }
  pTapO(g, cx, yb-Q(16.6), cx, yb-Q(23), Q(1.2), 0.6, GL, GX);
  pR(g, cx-1, yb-Q(23.6), 2, 2, '#ffffff');
  ERW._spire={x:cx, y:yb-Q(23)};
}
function drawErawanHV(g){
  const E=ERW, x=erawanX(), gy=heavenGround(x), k=ERW_K;
  if(x-HVN.camX<-200 || x-HVN.camX>W+200) return;
  /* he glows, faintly, the way everything up here does */
  drawGlow(g, x, gy-80, 120, '#fff4d0', 0.18+0.04*Math.sin(E.t*0.9));
  pEll(g, x-4*E.face, gy+1, 58, 5, 'rgba(60,30,80,0.22)');
  const o={ k, C:ELE_SKIN.white, white:true, t:E.t, mv:0, walk:0, blink:E.blink, ear:E.ear,
    heads:3, tusk:true, goldTusk:true, tr:E.tr, still:false, seed:1,
    headDress:erawanHeadDress, anklet:erawanAnklet, bodyDress:erawanBody, overDress:erawanHowdah };
  const w=R(118*k), h=R(150*k), ox=R(56*k), oy=R(140*k);
  eleStamp(g, x, gy, E.face, w, h, ox, oy, ELE_SKIN.white.ink, (a,lay)=>eleFigure(a,o,lay));
  if(o._tip) E.tips=o._tip.map(tp=>tp? {x:x+tp.x*E.face, y:gy+tp.y} : null);
  /* sparkles off the gold */
  const r=(E.t*3)|0;
  for(let i=0;i<4;i++){
    const u=Math.abs(Math.sin(r*7.1+i*3.3)), a=Math.max(0,Math.sin(E.t*3*Math.PI+i));
    const sx=x+E.face*(lerp(-40,50,u))*1, sy=gy-lerp(40,190,Math.abs(Math.sin(r*3.7+i)));
    g.globalAlpha=a*0.8; pR(g, sx, sy-1, 1, 3, '#fff8d8'); pR(g, sx-1, sy, 3, 1, '#fff8d8'); g.globalAlpha=1;
  }
}

/* ---------- ภาษาไทย ---------- */
Object.assign(TH, {
  'Lung Kham':'ลุงคำ', 'Boonmee':'พังบุญมี', 'them':'เขา', 'splash':'สาดน้ำใส่',
  'give Boonmee a banana':'ให้กล้วยพังบุญมี',
  "stroke Boonmee's trunk":'ลูบงวงพังบุญมี',
  'talk to Lung Kham':'คุยกับลุงคำ',
  'ask Boonmee for a shower':'ขอให้พังบุญมีพ่นน้ำให้',
  'all of it, straight through':'โดนเต็มงวง ทะลุไปเลย',
  'add a handful of sand':'เติมทรายหนึ่งกำมือ',
  'A cool year to you!':'ขอให้ชุ่มฉ่ำทั้งปี!', 'Happy Songkran!':'สุขสันต์วันสงกรานต์!',
  'Oof, cold!':'โอ๊ย เย็น!', 'Got you back!':'เอาคืนบ้าง!', 'Splash!':'สาดเลย!',
  'She fills her trunk from the tub and lets you have all of it.':'นางดูดน้ำจากอ่างจนเต็มงวง แล้วพ่นใส่เจ้าหมดทั้งงวง',
  'It goes through you. The kids behind you get it instead, and scream, and ask her to do it again.':'น้ำทะลุตัวเจ้าไป เด็ก ๆ ข้างหลังโดนแทน กรี๊ดกันลั่น แล้วก็ขอให้นางพ่นอีก',
  'She took that from nobody. You saw that? The banana went up in the air by itself.':'นางรับกล้วยจากใครก็ไม่รู้ เห็นไหม กล้วยลอยขึ้นไปเอง',
  'Well. She is not frightened of you, so I will not be either.':'เอาเถอะ นางไม่กลัวเจ้า ข้าก็จะไม่กลัวเหมือนกัน',
  'She is fifty-one. She pulled teak out of the hills until they stopped the logging. Then she carried tourists. Now she carries me, and only to the pond.':'นางอายุห้าสิบเอ็ดแล้ว ลากซุงสักลงจากเขาจนเขาเลิกทำไม้ แล้วก็แบกนักท่องเที่ยว ตอนนี้แบกข้า ไปแค่สระน้ำ',
  'Boonmee means a great deal of merit. Her first mahout named her. I think he was talking about himself.':'บุญมีแปลว่ามีบุญมาก ควาญคนแรกตั้งให้ ข้าว่าเขาพูดถึงตัวเองมากกว่า',
  'She has seen something by you. She does that at the wat, too. I have stopped asking what.':'นางเห็นอะไรบางอย่างตรงที่เจ้ายืน ที่วัดนางก็เป็นอย่างนี้ ข้าเลิกถามแล้วว่าอะไร',
  "Two hundred kilos a day. Bananas, grass, sugar cane, and once, the whole of Yai Pen's hedge.":'วันละสองร้อยกิโล กล้วย หญ้า อ้อย แล้วครั้งหนึ่งก็รั้วต้นไม้ของยายเพ็ญทั้งแถว',
  'Thirty years, and she still lets me think it is me deciding where we go.':'สามสิบปีแล้ว นางยังปล่อยให้ข้าคิดว่าข้าเป็นคนเลือกทางเดิน',
  'Water poured on somebody at Songkran is a blessing. You are allowed to be very generous with it.':'น้ำที่สาดใส่กันในวันสงกรานต์คือคำอวยพร ใจกว้างได้เต็มที่',
  'You carry sand out of the wat on your feet all year. At Songkran you bring it back, and heap it up, and put a flag on top.':'ทั้งปีเราพาทรายออกจากวัดติดเท้าไป พอถึงสงกรานต์ก็ขนกลับมาคืน ก่อเป็นเจดีย์ แล้วปักธงไว้บนยอด',
  'Yours runs through your fingers. It lands on the heap all the same.':'ทรายของเจ้าลอดนิ้วไปหมด แต่ก็ตกลงบนกองอยู่ดี',
});
