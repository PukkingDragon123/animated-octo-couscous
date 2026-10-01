/* ============================================================
   CLOTH IN THE WIND

   A Thai village is full of things the wind gets hold of: the flag
   on its bamboo pole outside the temple, the yellow dharma-wheel
   flag beside it, the long ธงตะขาบ — the centipede flags — hanging
   off tall poles at the wat for a festival, and washing: a ผ้าขาวม้า,
   a sarong and a shirt pegged on a line between two posts.

   All of it is cloth: points joined by sticks, pinned where it is
   tied, pulled down by its own weight and pushed by the wind where it
   hangs — the same wind the grass and the trees lean in, gusts and
   all — with a flutter on top that grows with the wind. Walk through
   the washing and it swings out of your way.
   ============================================================ */
const CLOTH = { items:[], ready:false };
function clothGrid(x0,y0,cols,rows,sx,sy,pinCol){
  const P2=[];
  for(let j=0;j<=rows;j++) for(let i=0;i<=cols;i++){
    const x=x0+i*sx, y=y0+j*sy;
    P2.push({x,y,px:x,py:y,pin:(pinCol!==undefined && i===pinCol)});
  }
  const S=[], id=(i,j)=>j*(cols+1)+i;
  for(let j=0;j<=rows;j++) for(let i=0;i<=cols;i++){
    if(i<cols) S.push([id(i,j),id(i+1,j),sx]);
    if(j<rows) S.push([id(i,j),id(i,j+1),sy]);
    if(i<cols && j<rows) S.push([id(i,j),id(i+1,j+1),Math.hypot(sx,sy)]);
  }
  return {pts:P2, sticks:S, cols, rows};
}
function clothChain(x0,y0,n,len){
  const P2=[]; for(let i=0;i<=n;i++) P2.push({x:x0,y:y0+i*len,px:x0,py:y0+i*len,pin:i===0});
  const S=[]; for(let i=0;i<n;i++) S.push([i,i+1,len]);
  return {pts:P2, sticks:S, cols:0, rows:n};
}
function clothSetup(){
  if(CLOTH.ready) return; CLOTH.ready=true;
  const add=(o)=>CLOTH.items.push(o);
  /* at the temple gate: the national flag and the dharma-wheel flag, each on a bamboo pole */
  for(const [x,kind] of [[SALA_X-156,'thai'],[SALA_X-126,'dharma']]){
    const gy=groundY(x), top=gy-70;
    add({kind, x, gy, top, cloth:clothGrid(x+1,top+1,8,5,3,3,0)});
  }
  /* the centipede flags, hung for merit at the wat */
  for(const x of [SALA_X+118, CHEDI_X+66]){
    const gy=groundY(x), top=gy-84;
    add({kind:'centipede', x, gy, top, cloth:clothChain(x+6,top+2,11,5)});
  }
  /* a flag outside the shop in town, and one at the crossroad shrine */
  for(const x of [STORE_X-70, CROSS_X-40, HOUSE_XS[2]-34]){ const gy=groundY(x), top=gy-64;
    add({kind:'thai', x, gy, top, cloth:clothGrid(x+1,top+1,8,5,3,3,0)}); }
  /* washing lines between the houses */
  for(const [x0,x1] of [[HOUSE_XS[0]+34, HOUSE_XS[0]+92],[HOUSE_XS[4]+36, HOUSE_XS[4]+90]]){
    const gy=groundY(x0), ly=gy-46, hangs=[];
    const cols=['khaoma','sarong','shirt','khaoma2'];
    for(let k=0;k<4;k++){ const hx=x0+8+k*((x1-x0-16)/3.2);
      const sag=Math.sin((hx-x0)/(x1-x0)*Math.PI)*3;
      const c=clothGrid(hx,ly+sag,3,6,3,3); c.pts.forEach((p,i)=>{ if(i<=3) p.pin=true; });
      hangs.push({c, kind:cols[k]}); }
    add({kind:'line', x:x0, x1, gy, ly, hangs});
  }
}
const CLOTH_G = 70;
function clothStep(c, dt, windX, flutter, t, soft){
  const pts=c.pts;
  for(let i=0;i<pts.length;i++){ const p=pts[i]; if(p.pin) continue;
    const vx=(p.x-p.px)*0.985, vy=(p.y-p.py)*0.985;
    p.px=p.x; p.py=p.y;
    const f=Math.sin(t*7.3+i*1.1+p.py*0.3)*flutter, f2=Math.cos(t*5.1+i*0.7)*flutter*0.6;
    p.x += vx + (windX + f)*dt*dt;
    p.y += vy + (CLOTH_G*(soft||1) + f2)*dt*dt;
  }
  for(let it=0; it<4; it++) for(const [a,b,L] of c.sticks){
    const A=pts[a], B=pts[b], dx=B.x-A.x, dy=B.y-A.y, d=Math.hypot(dx,dy)||1, k=(d-L)/d*0.5;
    if(!A.pin && !B.pin){ A.x+=dx*k; A.y+=dy*k; B.x-=dx*k; B.y-=dy*k; }
    else if(!A.pin){ A.x+=dx*k*2; A.y+=dy*k*2; }
    else if(!B.pin){ B.x-=dx*k*2; B.y-=dy*k*2; }
  }
}
/* anybody walking through it pushes it aside */
function clothPush(c, dt){
  if(typeof P==='undefined' || GS.state!=='play') return;
  for(const p of c.pts){ if(p.pin) continue;
    if(p.y<P.y-66 || p.y>P.y) continue;
    const dx=p.x-P.x; if(Math.abs(dx)>7) continue;
    const s=dx===0? (P.vx>=0?1:-1) : Math.sign(dx);
    p.x += s*(7-Math.abs(dx))*0.35 + P.vx*dt*0.6;
  }
}
function stepClothes(dt){
  if(!WORLD_READY) return;
  clothSetup();
  const t=GS.t||0, n=dt>1/50? Math.min(4,Math.ceil(dt*60)) : 1, h=dt/n;
  for(const it of CLOTH.items){
    if(Math.abs(it.x-GS.camX-W/2) > W) continue;               // only what is near enough to matter
    const wv=(typeof windAt==='function'? windAt(it.x) : GS.wind||0);
    for(let s=0;s<n;s++){
      if(it.kind==='line'){ for(const hg of it.hangs){ clothStep(hg.c, h, wv*140, 40+Math.abs(wv)*160, t, 1); clothPush(hg.c,h); } }
      else if(it.kind==='centipede'){ clothStep(it.cloth, h, wv*170+20, 30+Math.abs(wv)*120, t, 0.7); clothPush(it.cloth,h); }
      else clothStep(it.cloth, h, wv*260+60, 60+Math.abs(wv)*260, t, 0.35);
    }
  }
}

/* ---------- drawing ---------- */
const CL_INK='#1c1216';
function clQuad(g,a,b,c,d,col){ pPoly(g,[a.x,a.y,b.x,b.y,c.x,c.y,d.x,d.y],col); }
function clPole(g,x,gy,top,col){
  pR(g,x-1,top-2,3,gy-top+2,CL_INK); pR(g,x,top-1,1,gy-top+1,col||'#c8b070');
  for(let y=top+6;y<gy;y+=9) pR(g,x-1,y,3,1,'#8a7440');
  pR(g,x-1,top-4,3,3,'#f2c94c'); pR(g,x,top-5,1,1,'#fff0a8');
}
/* a flag's stripe colour at a height down it, 0 at the top */
function flagCol(kind, v){
  if(kind==='thai') return v<1/6? '#d8283a' : v<2/6? '#f6f2ec' : v<4/6? '#2a3a8a' : v<5/6? '#f6f2ec' : '#d8283a';
  return '#f2c230';
}
function drawGridFlag(g, it){
  const c=it.cloth, C=c.cols, Rw=c.rows, P2=c.pts, id=(i,j)=>j*(C+1)+i;
  /* the outline first, a pixel fatter all round */
  for(let j=0;j<Rw;j++) for(let i=0;i<C;i++){
    const a=P2[id(i,j)], b=P2[id(i+1,j)], cc=P2[id(i+1,j+1)], d=P2[id(i,j+1)];
    pPoly(g,[a.x-1,a.y-1,b.x+1,b.y-1,cc.x+1,cc.y+1,d.x-1,d.y+1],CL_INK);
  }
  for(let j=0;j<Rw;j++) for(let i=0;i<C;i++){
    const a=P2[id(i,j)], b=P2[id(i+1,j)], cc=P2[id(i+1,j+1)], d=P2[id(i,j+1)];
    /* a cell turned edge-on to you is in shade: the folds */
    const wdt=((b.x-a.x)+(cc.x-d.x))/2, lit=clamp(wdt/3,0.3,1.1);
    const sub=it.kind==='thai'? 6 : 1;
    for(let k=0;k<sub;k++){
      const v0=k/sub, v1=(k+1)/sub;
      const L=(p,q,u)=>({x:lerp(p.x,q.x,u), y:lerp(p.y,q.y,u)});
      const A=L(a,d,v0), B=L(b,cc,v0), Cc=L(b,cc,v1), D=L(a,d,v1);
      const vv=(j+(v0+v1)/2)/Rw;
      let col=flagCol(it.kind, vv);
      col = lit<0.95? shade(col,-(1-lit)*0.45) : lit>1.02? shade(col,0.12) : col;
      clQuad(g,A,B,Cc,D,col);
    }
  }
  if(it.kind==='dharma'){ const m=P2[id(3,2)]; pEll(g,m.x,m.y,2.4,2.4,'#b8281e'); pR(g,R(m.x),R(m.y),1,1,'#f2c230');
    for(let k=0;k<8;k++){ const an=k/8*TAU; pR(g,R(m.x+Math.cos(an)*2.6),R(m.y+Math.sin(an)*2.6),1,1,'#b8281e'); } }
}
function drawCentipede(g, it){
  const P2=it.cloth.pts;
  /* the arm the flag hangs from */
  pR(g,it.x-1,it.top-1,9,3,CL_INK); pR(g,it.x,it.top,7,1,'#c8b070');
  for(let i=0;i+1<P2.length;i++){
    const a=P2[i], b=P2[i+1], w=3.2;
    const nx=-(b.y-a.y), ny=(b.x-a.x), n=Math.hypot(nx,ny)||1, ux=nx/n*w, uy=ny/n*w;
    pPoly(g,[a.x-ux-1,a.y-uy,a.x+ux+1,a.y+uy,b.x+ux+1,b.y+uy,b.x-ux-1,b.y-uy],CL_INK);
    const col = i%3===0? '#d8283a' : i%3===1? '#f6f2ec' : '#f2c230';
    pPoly(g,[a.x-ux,a.y-uy,a.x+ux,a.y+uy,b.x+ux,b.y+uy,b.x-ux,b.y-uy],col);
    /* the legs that give it its name */
    pTaper(g,a.x+ux,a.y+uy,a.x+ux*2.2,a.y+uy*2.2+1,1,1,CL_INK);
    pTaper(g,a.x-ux,a.y-uy,a.x-ux*2.2,a.y-uy*2.2+1,1,1,CL_INK);
  }
  const e=P2[P2.length-1]; pTaper(g,e.x,e.y,e.x+(e.x-P2[P2.length-2].x),e.y+4,2,1,'#d8283a');
}
const WASH = {
  khaoma:  (u,v)=> ((R(u*6)+R(v*6))%2? '#c8403a' : '#f4e8d8'),
  khaoma2: (u,v)=> ((R(u*6)+R(v*6))%2? '#3a6ab0' : '#f4e8d8'),
  sarong:  (u,v)=> (R(v*8)%2? '#6a3a8a' : '#e8b040'),
  shirt:   (u,v)=> '#f4f0e6',
};
function drawLine(g, it){
  clPole(g,it.x,it.gy,it.ly-2,'#8a6a44'); clPole(g,it.x1,it.gy,it.ly-2,'#8a6a44');
  for(let x=it.x; x<=it.x1; x++){ const u=(x-it.x)/(it.x1-it.x); pR(g,x,R(it.ly+Math.sin(u*Math.PI)*3),1,1,'#3a3032'); }
  for(const hg of it.hangs){
    const c=hg.c, C=c.cols, Rw=c.rows, P2=c.pts, id=(i,j)=>j*(C+1)+i, pat=WASH[hg.kind];
    for(let j=0;j<Rw;j++) for(let i=0;i<C;i++){
      const a=P2[id(i,j)], b=P2[id(i+1,j)], cc=P2[id(i+1,j+1)], d=P2[id(i,j+1)];
      pPoly(g,[a.x-1,a.y,b.x+1,b.y,cc.x+1,cc.y+1,d.x-1,d.y+1],CL_INK); }
    for(let j=0;j<Rw;j++) for(let i=0;i<C;i++){
      const a=P2[id(i,j)], b=P2[id(i+1,j)], cc=P2[id(i+1,j+1)], d=P2[id(i,j+1)];
      const wdt=((b.x-a.x)+(cc.x-d.x))/2, lit=clamp(wdt/3,0.4,1.1);
      let col=pat(i/C, j/Rw); col = lit<0.95? shade(col,-(1-lit)*0.4) : col;
      clQuad(g,a,b,cc,d,col); }
    /* the pegs */
    for(const i of [0,C]){ const p=P2[id(i,0)]; pR(g,R(p.x)-1,R(p.y)-2,2,3,'#c8a060'); }
  }
}
function drawClothes(g){
  if(!CLOTH.ready) return;
  for(const it of CLOTH.items){
    if(it.x-GS.camX<-120 || it.x-GS.camX>W+120) continue;
    if(it.kind==='line') drawLine(g,it);
    else if(it.kind==='centipede'){ clPole(g,it.x,it.gy,it.top); drawCentipede(g,it); }
    else { clPole(g,it.x,it.gy,it.top); drawGridFlag(g,it); }
  }
}
