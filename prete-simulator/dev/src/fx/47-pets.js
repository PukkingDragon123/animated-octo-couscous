/* ============================================================
   THE CATS AND THE DOGS, DRAWN AGAIN

   Every cat in the village was the same orange cat, and every
   dog you could befriend was the same tan dog. They were drawn
   out of a few ellipses with no line round them, and against a
   busy lane they melted into it.

   Now each one is somebody. The cats are the cats of Thailand:
   a Siamese, วิเชียรมาศ, cream with her points gone dark; a
   silver-blue Korat, สีสวาด, the luck-cat; a white Khao Manee
   with one blue eye and one gold; a tuxedo in white socks; a
   calico who owns the shop; a grey tabby too fat to jump; and
   the ginger who gets stuck in the tamarind. The dogs are soi
   dogs — lean, short-haired, ears up, tails curled over their
   backs — each in its own coat, and Gohan, who is a Bangkaew,
   the white Thai spitz with the ruff and the plume.

   Big heads, eyes with a light in them, and a black line round
   every one of them, like everybody else in the village now.
   Each is painted into a scratch canvas in the pose it is in
   this frame, and stamped with a one-pixel ring of ink.
   ============================================================ */
const PET_INK = '#1a1216';
const PETK = { c:null, g:null, t:null, tg:null };
const PK_W = 64, PK_H = 40, PK_OX = 32, PK_OY = 34;
/* paint(a) draws in world space; it comes out with a line round it */
function petInked(g, x, y, paint){
  if(!PETK.c){ PETK.c=mkCv(PK_W,PK_H); PETK.g=G2(PETK.c); PETK.t=mkCv(PK_W,PK_H); PETK.tg=G2(PETK.t); }
  const bx=R(x), by=R(y), a=PETK.g, t=PETK.tg;
  a.setTransform(1,0,0,1,0,0); a.globalAlpha=1; a.globalCompositeOperation='source-over';
  a.clearRect(0,0,PK_W,PK_H);
  a.setTransform(1,0,0,1,PK_OX-bx,PK_OY-by); a.imageSmoothingEnabled=false;
  paint(a);
  a.setTransform(1,0,0,1,0,0);
  t.setTransform(1,0,0,1,0,0); t.globalCompositeOperation='source-over';
  t.clearRect(0,0,PK_W,PK_H); t.drawImage(PETK.c,0,0);
  t.globalCompositeOperation='source-in'; t.fillStyle=PET_INK; t.fillRect(0,0,PK_W,PK_H);
  t.globalCompositeOperation='source-over';
  const X=bx-PK_OX, Y=by-PK_OY;
  g.drawImage(PETK.t,X-1,Y); g.drawImage(PETK.t,X+1,Y); g.drawImage(PETK.t,X,Y-1); g.drawImage(PETK.t,X,Y+1);
  g.drawImage(PETK.c,X,Y);
}
/* an eye with a light in it: two by two, the light in the top corner nearest
   the sky. Shut, it is a short curve. */
function petEye(a, x, y, iris, shut){
  x=R(x); y=R(y);
  if(shut){ pR(a,x-1,y,1,1,PET_INK); pR(a,x,y+1,2,1,PET_INK); pR(a,x+2,y,1,1,PET_INK); return; }
  pR(a,x,y,2,2,PET_INK); if(iris) pR(a,x+1,y+1,1,1,iris); pR(a,x,y,1,1,'#fffdf4');
}

/* ---------------- the coats ---------------- */
/* b base, l lit, d shade, w the pale parts, and what marks it */
const CAT_COATS = {
  ginger:  {b:'#e8983c', l:'#f6b862', d:'#b86a26', w:'#fbeedc', eye:'#7aa83a', stripes:'#b0601e'},
  siamese: {b:'#efe2c6', l:'#faf2e0', d:'#cdbb98', w:'#fbf4e6', eye:'#4a9ae0', points:'#5a3e30'},
  greytab: {b:'#9a9a9e', l:'#b8b8bc', d:'#707076', w:'#e8e6e2', eye:'#c8a830', stripes:'#56565e', fat:1},
  biscuit: {b:'#dcb880', l:'#ecd0a0', d:'#b8925a', w:'#fbf2e2', eye:'#9a7a2a', socks:1},
  manee:   {b:'#f6f2ea', l:'#ffffff', d:'#d8d0c2', w:'#ffffff', eye:'#4a9ae0', eye2:'#e0a820'},
  tux:     {b:'#2e2a32', l:'#4a4450', d:'#1e1a22', w:'#f4f0e8', eye:'#c8c030', socks:1, bib:1},
  korat:   {b:'#8a98a8', l:'#a8b6c4', d:'#66727e', w:'#b8c4d0', eye:'#7ac04a'},
  calico:  {b:'#f6f0e4', l:'#ffffff', d:'#d8ccb8', w:'#ffffff', eye:'#c8a030', patches:[['#e8983c',-2,-6,2.4,1.8],['#2e2a32',1,-4,1.8,1.5],['#e8983c',2.4,-11,1.6,1.2],['#2e2a32',0,-12,1.4,1]]},
};
/* who is who */
const PET_LOOK = {
  'Meow-Meow':'siamese', 'Fat Somchai':'greytab', 'Biscuit':'biscuit', "The Monk's":'manee',
  'Two-Socks':'tux', 'Noodle':'korat', 'Shop Cat':'calico',
  'Daeng':'red', 'Tao':'blacktan', 'Moo':'patch', 'Lucky':'tan', 'Boss':'black', 'Crossroad':'dusty', 'Nine':'brindle',
};
const DOG_LOOKS = {
  tan:     {b:'#c9a06a', l:'#dcb880', d:'#a07a4a', w:'#ecd8b4', muzzle:'#5a4030'},
  black:   {b:'#3a3438', l:'#56505a', d:'#262226', w:'#f0ebe2', socks:1, bib:1},
  dusty:   {b:'#e0d6c6', l:'#f0e8dc', d:'#bcae9a', w:'#f6f0e6', ear:'#c9a06a'},
  red:     {b:'#b86a34', l:'#d0864c', d:'#8a4a22', w:'#e8c8a0'},
  blacktan:{b:'#3a3032', l:'#54484a', d:'#262022', w:'#c8904e', brows:1, socks:'#c8904e'},
  patch:   {b:'#f0e4dc', l:'#fbf4ee', d:'#d0bfb4', w:'#fbf4ee', patch:'#3a3032', pink:1},
  brindle: {b:'#8a6a44', l:'#a8845a', d:'#644a2e', w:'#d8c4a0', stripes:'#4a3622'},
};
/* the road dogs by the shop keep the four coats they always had */
const ROAD_DOG_LOOK = ['tan','black','dusty','red'];
function catCoat(o){ return CAT_COATS[(o && o.coat) || 'ginger'] || CAT_COATS.ginger; }
function dogLook(k){ return DOG_LOOKS[k] || DOG_LOOKS.tan; }

/* ---------------- a cat ----------------
   c: {x, y, face, anim, phase, state:'sit'|'walk'|'tree', coat, collar} */
function drawCat(g, c){
  const x=c.x, y=c.y, f=c.face||1, t=c.anim||0, C=catCoat(c);
  const walk = c.state==='walk', sleep = c.state==='sleep', fat = C.fat? 1.2 : 1;
  pEll(g, x, y-0.5, walk? 7 : 6*fat, 1.8, 'rgba(10,8,20,0.32)');
  petInked(g, x, y, a => walk? catWalk(a,x,y,f,t,c.phase||0,C,fat,c) : sleep? catSleep(a,x,y,f,t,C,fat,c) : catSit(a,x,y,f,t,C,fat,c.state==='tree',c));
  if(sleep) petZ(g, x+4*f, y-9, t+1.7);
}
function catMarks(a, C, X, y, f, head){
  if(C.stripes){ for(const [dx,dy] of head? [[1.2,-12.2],[2.2,-12.6],[3.2,-12.2]] : [[-2.6,-7.4],[-1.2,-8],[0.2,-8.2]]) pR(a,R(X(dx)),R(y+dy),1,head?1:2,C.stripes); }
  if(C.patches && !head) for(const [col,dx,dy,rx,ry] of C.patches) pEll(a,X(dx),y+dy,rx,ry,col);
}
function catSit(a, x, y, f, t, C, fat, tree, o){
  const X=dx=>x+dx*f, sw=Math.sin(t*2.1);
  const pt=C.points, tailC=pt||C.d;
  /* the tail: round the front paws on the ground, or down off the branch */
  if(tree){ pTaper(a,X(-3),y-2,X(-3.6)+sw,y+5,2.4,1.6,tailC); pTaper(a,X(-3.6)+sw,y+5,X(-2.8)+sw*1.4,y+9,1.6,1.2,tailC); }
  else { for(const [dx,dy,wd] of [[-3.4,-2.4,2.4],[-5,-1.2,2.2],[-4.4,-0.2,2],[-2,0,1.8],[0.6,-0.2,1.6]]) pEll(a,X(dx),y+dy,wd*0.6,1.1,tailC);
    pR(a,R(X(1.2+sw*0.4)),R(y-1),1,1,tailC); }
  /* the haunch, the body, the chest */
  pEll(a,X(-1.8),y-3.2,3.4*fat,3.1,C.d);
  pEll(a,X(-0.6),y-4.9,3.9*fat,4.3,C.b);
  pEll(a,x-1.2,y-5.9,2.5*fat,2.6,C.l);
  if(C.bib||C.w) pEll(a,X(1.7),y-4.6,1.7,2.8,C.w);
  catMarks(a,C,X,y,f,false);
  /* the front legs and paws */
  const legC = pt||C.b, pawC = C.socks||pt? (pt||C.w) : C.b;
  pR(a,R(X(0.6)),R(y-3.2),1,2,legC); pR(a,R(X(2.6)),R(y-3.2),1,2,legC);
  pR(a,R(Math.min(X(0),X(1.4))),R(y-1.2),2,1,C.socks? C.w : pawC); pR(a,R(Math.min(X(2),X(3.4))),R(y-1.2),2,1,C.socks? C.w : pawC);
  /* the head: big, and a little tipped toward whatever it is looking at */
  const hx=X(2.1), hy=y-10+(o&&o.look? 0.6:0);
  /* ears first, so the head sits in front of their roots */
  const earC = pt||C.d, earF = pt||C.b;
  pTri(a,X(-0.8),hy-2,X(-0.6),hy-6.2,X(1.6),hy-3,earC);
  pTri(a,X(2.8),hy-3.2,X(4.6),hy-6.2,X(5.8),hy-2.2,earF);
  pR(a,R(X(4.4)),R(hy-4.2),1,1,'#f0a0b0');
  pEll(a,hx,hy,4.0*(fat>1?1.06:1),3.5,C.b);
  pEll(a,hx-0.9,hy-0.8,2.7,2.2,C.l);
  if(pt) pEll(a,X(3.4),hy+0.9,2.2,1.9,pt);                                        // the Siamese mask
  else if(C.bib) pEll(a,X(3.4),hy+1.3,1.9,1.4,C.w);
  else pEll(a,X(3.4),hy+1.2,1.8,1.3,C.w);
  catMarks(a,C,X,y,f,true);
  /* the eyes, and a blink now and then */
  const shut = (t*0.7)%4.3 < 0.14;
  petEye(a, f>0? hx-1.6 : hx-0.4, hy-0.8, C.eye, shut);
  petEye(a, f>0? hx+1.4 : hx-3.4, hy-0.8, C.eye2||C.eye, shut);
  pR(a,R(X(4.4)),R(hy+1.2),1,1,'#e87a90');                                        // the nose
  pR(a,R(X(3.6)),R(hy+2.2),1,1,pt? '#2a2028' : shade(C.w,-0.3));
  if(o && o.collar){ pR(a,R(Math.min(X(0.4),X(3.4))),R(hy+3.2),4,1,'#d8303a'); pR(a,R(X(2)),R(hy+4),1,1,'#f0c040'); }
}
/* asleep: a loaf, paws tucked, the tail round over the nose */
function catSleep(a, x, y, f, t, C, fat, o){
  const X=dx=>x+dx*f, pt=C.points, br=Math.sin(t*1.3)*0.3+Math.sin(t*0.41)*0.3;
  pEll(a,X(-0.6),y-3.4,5.2*fat,3.4+br*0.3,C.b);
  pEll(a,x-1.4,y-4.6-br*0.3,3.6*fat,1.8,C.l);
  catMarks(a,C,X,y+3.4,f,false);
  const hx=X(3.2), hy=y-4.6;
  pTri(a,X(1.6),hy-2,X(1.6),hy-5,X(3.4),hy-2.6,pt||C.d);
  pTri(a,X(3.6),hy-2.6,X(5),hy-5,X(5.6),hy-1.8,pt||C.b);
  pEll(a,hx,hy,3,2.6,C.b); pEll(a,hx-0.6,hy-0.8,1.9,1.4,C.l);
  if(pt) pEll(a,X(4),hy+0.6,1.8,1.4,pt); else pEll(a,X(4),hy+0.8,1.5,1.1,C.w);
  petEye(a, f>0? hx-0.8 : hx-1.2, hy-0.4, null, true);
  /* the tail wrapped round the front, over the paws */
  for(const [dx,dy,r0] of [[-5,-1.4,1.4],[-2.4,-0.6,1.3],[0.4,-0.5,1.2],[3,-0.8,1.1],[5,-1.6,1]]) pEll(a,X(dx),y+dy,r0,1,pt||C.d);
  if(o && o.collar) pR(a,R(Math.min(X(1.6),X(3))),R(hy+2.2),2,1,'#d8303a');
}
function catWalk(a, x, y, f, t, ph, C, fat, o){
  const X=dx=>x+dx*f, pt=C.points, legC=pt||C.b, bob=Math.abs(Math.sin(ph))*0.5;
  const step=i=>Math.sin(ph+i*Math.PI*0.5+(i>1?Math.PI:0))*1.6;
  /* the far legs, in shade */
  pLimb(a,X(-2.6),y-4,X(-2.6)+step(1)*f,y-0.6,1.6,shade(legC,-0.18));
  pLimb(a,X(3.6),y-4,X(3.6)+step(3)*f,y-0.6,1.6,shade(legC,-0.18));
  /* the tail up, with a question mark in the end of it */
  const tw=Math.sin(t*2.6)*0.8;
  pTaper(a,X(-5),y-6,X(-7)+tw,y-10,2,1.6,pt||C.d); pTaper(a,X(-7)+tw,y-10,X(-5.6)+tw,y-12.4,1.6,1.3,pt||C.d);
  /* the body */
  pEll(a,x,y-5.4-bob,5.4*fat,2.8,C.b);
  pEll(a,x-0.8,y-6.4-bob,4.0*fat,1.6,C.l);
  pR(a,R(Math.min(X(-2),X(3))),R(y-3.4-bob),5,1,C.w);
  catMarks(a,C,X,y-bob,f,false);
  /* the near legs */
  pLimb(a,X(-3.8),y-4,X(-3.8)+step(0)*f,y-0.6,1.8,legC);
  pLimb(a,X(2.4),y-4,X(2.4)+step(2)*f,y-0.6,1.8,legC);
  if(C.socks){ pR(a,R(X(-3.8)+step(0)*f),R(y-1),1,1,C.w); pR(a,R(X(2.4)+step(2)*f),R(y-1),1,1,C.w); }
  /* the head, up and forward */
  const hx=X(6), hy=y-8.4-bob;
  pTri(a,X(4.2),hy-2,X(4.4),hy-5.6,X(6.2),hy-2.8,pt||C.d);
  pTri(a,X(6.6),hy-2.8,X(8.2),hy-5.6,X(8.8),hy-1.8,pt||C.b);
  pEll(a,hx,hy,3.4,3.1,C.b); pEll(a,hx-0.7,hy-0.8,2.2,1.8,C.l);
  pEll(a,X(7.6),hy+1,1.6,1.2,pt||C.w);
  catMarks(a,C,dx=>hx+(dx-2.1)*f,y+1.6-bob,f,true);
  petEye(a, f>0? hx+0.6 : hx-2.6, hy-0.8, C.eye, (t*0.7)%4.3<0.14);
  pR(a,R(X(9.2)),R(hy+0.6),1,1,'#e87a90');
  if(o && o.collar){ pR(a,R(Math.min(X(4.2),X(6.2))),R(hy+2.4),3,1,'#d8303a'); }
}

/* ---------------- a soi dog ----------------
   d: {x, face, st:'sleep'|'up', t, sp, bark, coat, look, collar} */
function drawRoadDog(g, d){
  const x=d.x, gy=d.y!==undefined? d.y : groundY(x), f=d.face||1, t=d.t||0;
  const C = dogLook(d.look || ROAD_DOG_LOOK[(d.coat||0)%ROAD_DOG_LOOK.length]);
  const sleep = d.st==='sleep' && !(d.bark>0);
  pEll(g, x, gy-0.5, sleep? 10 : 9, 2.2, 'rgba(10,8,20,0.30)');
  petInked(g, x, gy, a => sleep? dogSleep(a,x,gy,f,t,C,d) : dogUp(a,x,gy,f,t,C,d));
  if(sleep) petZ(g, x+6*f, gy-9, t);
}
function dogCoatMarks(a, C, X, y, bob){
  if(C.stripes) for(let i=0;i<4;i++) pR(a,R(X(-4+i*2.4)),R(y-11-bob),1,3,C.stripes);
  if(C.bib) pEll(a,X(4.6),y-9-bob,1.8,2.6,C.w);
}
function dogUp(a, x, y, f, t, C, d){
  const X=dx=>x+dx*f;
  const barking = d.bark>0, beat = barking? (d.bark*3.4)%1 : 0, open = barking? Math.max(0,Math.sin(beat*Math.PI)) : 0;
  const walk = !!d.sp && !barking, ph=t*8.5, bob = walk? Math.abs(Math.sin(ph))*0.6 : 0;
  const step = i => walk? Math.sin(ph+(i%2?Math.PI:0)+(i>1?Math.PI*0.5:0))*2.2 : 0;
  const legD = shade(C.b,-0.2), sockC = C.socks===1? C.w : (C.socks||null);
  /* far legs */
  pLimb(a,X(-4.4),y-8,X(-4.8)+step(1)*f,y-0.6,1.8,legD);
  pLimb(a,X(4.6),y-8,X(5)+step(3)*f,y-0.6,1.8,legD);
  /* the tail, curled up over the back — wagging if it is pleased, stiff if it is barking */
  const wag = barking? Math.sin(t*14)*1.4 : Math.sin(t*5)*0.8;
  pTaper(a,X(-6.4),y-10.4-bob,X(-8.2)+wag*f,y-14.6,2.4,2,C.d);
  pTaper(a,X(-8.2)+wag*f,y-14.6,X(-5.8)+wag*f,y-16.4,2,1.4,C.d);
  pR(a,R(X(-5.8)+wag*f),R(y-16.8),1,1,C.l);
  /* the body: a deep chest, a waist tucked up under it */
  pEll(a,x,y-9.4-bob,7.2,3.3,C.b);
  pEll(a,X(4),y-9.2-bob,3.3,3.9,C.b);
  pEll(a,x-1.2,y-10.8-bob,5.2,1.7,C.l);
  pR(a,R(Math.min(X(-2.6),X(3.4))),R(y-6.6-bob),6,1,C.w);
  dogCoatMarks(a,C,X,y,bob);
  /* near legs, with socks if it has them */
  const L1=X(-3.2), L2=X(5.6);
  pLimb(a,L1,y-8,L1+step(0)*f,y-0.6,2,C.b); pLimb(a,L2,y-8,L2+step(2)*f,y-0.6,2,C.b);
  if(sockC){ pR(a,R(L1+step(0)*f-1),R(y-2),2,2,sockC); pR(a,R(L2+step(2)*f-1),R(y-2),2,2,sockC); }
  /* neck and head; up and back when it barks */
  const lift = barking? 2.2+open*1.2 : 0;
  const hx=X(8.8), hy=y-14.2-lift-bob;
  pTaper(a,X(5),y-10.6-bob,hx-1.6*f,hy+1,4.2,3.4,C.b);
  if(d.collar){ pTaper(a,X(5.8),y-11.4-bob,X(6.8),y-13.4-bob-lift*0.6,1.8,1.8,'#d8303a'); pR(a,R(X(6.8)),R(y-11.2-bob),1,1,'#f0c040'); }
  /* the ears: up, both of them, the way a Thai dog's are */
  const earC=C.ear||C.d, flick=Math.max(0,Math.sin(t*0.9)-0.96)*14;
  pTri(a,hx-1.8*f,hy-1.6,hx-2.2*f,hy-5.4-flick*0.1,hx-0.2*f,hy-2.4,shade(earC,-0.1));
  pTri(a,hx-0.2*f,hy-2.4,hx+0.8*f,hy-6,hx+2*f,hy-1.8,earC);
  pR(a,R(hx+0.8*f),R(hy-3.4),1,1,'#e8a0a8');
  pEll(a,hx,hy,3.4,3.0,C.b);
  pEll(a,hx-0.8,hy-0.8,2.2,1.7,C.l);
  if(C.brows){ pR(a,R(hx+0.4*f),R(hy-2),1,1,C.w); pR(a,R(hx+2*f),R(hy-1.6),1,1,C.w); }
  /* the muzzle — open on the beat when it barks */
  const mc = C.muzzle||C.l;
  pTaper(a,hx+1.6*f,hy+0.8,hx+4.6*f,hy+1.4-open*1.2,2.8,2.2,mc);
  if(open>0.25){ pTri(a,hx+2*f,hy+1.4,hx+5*f,hy+1.6+open*2.4,hx+2*f,hy+2.6+open*1.8,'#4a2020'); pR(a,R(hx+3*f),R(hy+2+open*1.2),2,1,'#e87a8a'); }
  pR(a,R(hx+4.8*f),R(hy+0.4-open*1.2),1,1,C.pink? '#d87888' : '#1a1216');          // the nose
  if(C.patch){ pR(a,R(hx-0.4),R(hy-2),4,3,C.patch); pR(a,R(hx+(f>0?3:-1)),R(hy-1),1,1,C.patch); }
  petEye(a, f>0? hx+0.4 : hx-2.4, hy-0.9, barking? null : '#5a3a20', !barking && (t*0.6)%5.1<0.12);
}
function dogSleep(a, x, y, f, t, C, d){
  const X=dx=>x+dx*f, br=Math.sin(t*1.25)*0.35+Math.sin(t*0.37)*0.4;
  const tw = Math.max(0, Math.sin(t*0.53)-0.93)*8, ef = Math.max(0, Math.sin(t*0.41+1.7)-0.95)*16;
  /* curled up in a ring, nose to tail: the round of the back, the haunch,
     the tail brought round the front, the head down on the paws inside it */
  pEll(a,X(-1),y-4.6,6.6,4.4+br*0.35,C.b);
  pEll(a,X(-3),y-3.6,3.4,3,C.d);
  pEll(a,x-2.2,y-6.2-br*0.3,4.4,2,C.l);
  if(C.stripes) for(let i=0;i<3;i++) pR(a,R(X(-4+i*2.6)),R(y-7.6-br*0.3),1,2,C.stripes);
  if(C.patch) pEll(a,X(-2.6),y-6,2.2,1.4,C.patch);
  /* the tail, round the front along the ground */
  for(const [dx,dy,r0] of [[-6.4,-1.8,1.5],[-4,-0.8,1.4],[-1,-0.6,1.3],[2,-0.8,1.2]]) pEll(a,X(dx),y+dy,r0,1.1,C.d);
  pR(a,R(X(3.2)),R(y-1),1,1,C.l);
  /* the paws, and the head down on them */
  pR(a,R(Math.min(X(3.6),X(6)))+(f>0?R(tw*0.3):-R(tw*0.3)),R(y-1.4),3,1,C.socks===1? C.w : (C.socks||C.l));
  const hx=X(3.6), hy=y-4.2;
  pEll(a,hx,hy,3.3,2.8,C.b); pEll(a,hx-0.6,hy-0.9,2.1,1.5,C.l);
  if(C.patch) pR(a,R(hx-0.4),R(hy-1.6),3,2,C.patch);
  pTaper(a,hx+1.8*f,hy+0.8,hx+4.2*f,hy+1.6,2.4,1.8,C.muzzle||C.l);
  pR(a,R(hx+4.4*f),R(hy+1.2),1,1,C.pink? '#d87888' : '#1a1216');
  /* one ear laid back, flicking now and then */
  pTri(a,hx-0.8*f,hy-2.2-ef*0.1,hx-3.8*f,hy-1.4,hx-0.2*f,hy+0.2,C.ear||C.d);
  petEye(a, f>0? hx+0.2 : hx-2.2, hy-0.8, null, true);
  if(d.collar) pR(a,R(Math.min(X(1.2),X(2.6))),R(y-3.4),2,2,'#d8303a');
}
/* a z going up off a sleeping animal now and then */
function petZ(g, x, y, t){
  const cyc=(t*0.30)%1; if(cyc>0.55) return;
  const u=cyc/0.55, al=(u<0.15?u/0.15:1)*(1-u)*0.9, zx=R(x+u*6), zy=R(y-u*11);
  g.globalAlpha=al;
  pR(g,zx,zy,3,1,'#f4ecd8'); pR(g,zx+1,zy+1,1,1,'#f4ecd8'); pR(g,zx,zy+2,3,1,'#f4ecd8');
  g.globalAlpha=1;
}

/* ---------------- Gohan, the Bangkaew ----------------
   d: {x, y, face, t, st:'sleep'|'walk'|'sit', collar} */
function drawFluffyDog(g, d){
  const x=d.x, gy=d.y!==undefined? d.y : groundY(x), f=d.face||1, t=d.t||0, st=d.st;
  pEll(g, x, gy-0.5, st==='sleep'? 11 : 10, 2.4, 'rgba(10,8,20,0.30)');
  petInked(g, x, gy, a => st==='sleep'? gohanSleep(a,x,gy,f,t,d) : gohanUp(a,x,gy,f,t,st==='walk',d));
  if(st==='sleep') petZ(g, x+7*f, gy-10, t);
}
const GOHAN = {b:'#f4efe6', l:'#ffffff', d:'#d8cfc0', w:'#fffdf6', cream:'#ecd8b8'};
function fluff(a, x, y, rx, ry, col, n, seed){
  pEll(a,x,y,rx,ry,col);
  for(let i=0;i<n;i++){ const an=seed+i*2.4; pEll(a,x+Math.cos(an)*rx*0.9,y+Math.sin(an)*ry*0.9,1.4,1.2,col); }
}
function gohanUp(a, x, y, f, t, walk, d){
  const X=dx=>x+dx*f, C=GOHAN, ph=t*7, bob= walk? Math.abs(Math.sin(ph))*0.6 : 0;
  const step = i => walk? Math.sin(ph+(i%2?Math.PI:0)+(i>1?Math.PI*0.5:0))*2 : 0;
  const sit = !walk;
  /* far legs */
  if(!sit) { pLimb(a,X(-4.2),y-8,X(-4.6)+step(1)*f,y-0.6,2,C.d); }
  pLimb(a,X(4.6),y-8,X(5)+step(3)*f,y-0.6,2,C.d);
  /* the plume over the back, the best thing about him */
  const wag=Math.sin(t*4)*0.8;
  fluff(a,X(-6.4)+wag*f,y-14.4,3.4,2.8,C.d,5,1.1);
  fluff(a,X(-5.4)+wag*f,y-15.4,2.8,2.2,C.b,4,0.3);
  pEll(a,X(-4.4)+wag*f,y-16.2,1.8,1.2,C.l);
  /* the body, sitting or standing, all coat */
  if(sit){ fluff(a,X(-1.8),y-5.2,4.6,4.4,C.d,5,0.7); fluff(a,X(0),y-7.4,4.4,5,C.b,6,0.2); pEll(a,x-1.2,y-8.6,2.8,2.8,C.l); }
  else { fluff(a,x,y-9.6-bob,7.6,3.8,C.b,7,0.5); pEll(a,x-1.2,y-11-bob,5.4,1.8,C.l); }
  /* near legs */
  if(!sit) pLimb(a,X(-3),y-8,X(-3)+step(0)*f,y-0.6,2.2,C.b);
  pLimb(a,X(5.8),y-8,X(6)+step(2)*f,y-0.6,2.2,C.b);
  if(sit){ pLimb(a,X(3.6),y-7,X(3.8),y-0.6,2.2,C.b); pEll(a,X(-2.4),y-1.4,3,1.4,C.d); }
  /* the ruff: a collar of coat round the neck */
  const hy0 = sit? y-14.6 : y-14.2-bob, hx=X(sit? 3.8 : 8.6), hy=hy0;
  fluff(a,hx-1.2*f,hy+3.4,4,3.2,C.cream,6,0.9);
  fluff(a,hx-1*f,hy+2.6,3.2,2.4,C.w,5,0.2);
  if(d.collar) pR(a,R(Math.min(hx-3*f,hx+1*f)),R(hy+4.6),4,1,'#d8303a');
  /* the fox's face and the two sharp ears */
  pTri(a,hx-1.8*f,hy-1.8,hx-2*f,hy-6,hx+0*f,hy-2.6,C.d);
  pTri(a,hx+0*f,hy-2.6,hx+1.2*f,hy-6.4,hx+2.4*f,hy-2,C.b);
  pR(a,R(hx+1*f),R(hy-3.8),1,1,'#f0b0b8');
  pEll(a,hx,hy,3.4,3.0,C.b); pEll(a,hx-0.8,hy-0.8,2.2,1.7,C.l);
  pTaper(a,hx+1.6*f,hy+0.8,hx+4.4*f,hy+1.2,2.6,1.8,C.w);
  pR(a,R(hx+4.6*f),R(hy+0.6),1,1,'#1a1216');
  petEye(a, f>0? hx+0.3 : hx-2.3, hy-0.9, '#4a3020', (t*0.6)%5.3<0.12);
}
function gohanSleep(a, x, y, f, t, d){
  const X=dx=>x+dx*f, C=GOHAN, br=Math.sin(t*1.15)*0.4+Math.sin(t*0.33)*0.4;
  fluff(a,X(-4),y-3.6,3.6,3,C.d,4,0.4);
  fluff(a,X(-1),y-4.8,7,4.4+br*0.35,C.b,8,0.2);
  pEll(a,x-1.6,y-6.4-br*0.3,6,2,C.l);
  /* the plume laid over his nose like a blanket */
  fluff(a,X(2),y-2.4,4.4,2,C.d,5,1.3);
  fluff(a,X(2.6),y-3,3.4,1.5,C.b,4,0.6);
  const hx=X(4.6), hy=y-4.6;
  pEll(a,hx,hy,3.2,2.6,C.b); pEll(a,hx-0.6,hy-0.9,2,1.4,C.l);
  pTri(a,hx-1*f,hy-2.2,hx-2.4*f,hy-5.4,hx+0.6*f,hy-2.2,C.d);
  pTri(a,hx+0.6*f,hy-2.2,hx+1.6*f,hy-5.2,hx+2.6*f,hy-1.8,C.b);
  pR(a,R(hx+3.8*f),R(hy+0.8),1,1,'#1a1216');
  petEye(a, f>0? hx+0.2 : hx-2.2, hy-0.8, null, true);
  if(d.collar) pR(a,R(Math.min(X(4),X(5.4))),R(y-2.6),2,2,'#d8303a');
}
