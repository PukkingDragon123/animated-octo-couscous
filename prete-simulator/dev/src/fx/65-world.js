/* ============================================================
   THE WORLD, SHADED LIKE THE ICONS

   The icons came out lit and inked and the village around them
   did not: houses, stalls and shrines were flat colour straight
   onto the sky. Everything that is stamped into the world now goes
   through one pass on its way in — at the size it will be drawn, so
   the line is always exactly one pixel —

     · a dark line round the outside, coloured from what it touches
     · a lit edge wherever the sky is above it, a shaded one below
     · a little grain in every flat fill, so paint reads as a surface

   And the trees are no longer painted into the ground at all. They
   are drawn every frame, bending: each one is a spring, pushed by the
   wind where it stands and by the gusts that cross the village, and
   pushed again by anybody walking through its lower branches. A tree
   that is shaken hard enough drops a leaf or two.
   ============================================================ */
const SHADE = { cache:new Map(), trees:[], tset:null, ready:false };
function shHash(x,y){ const h=Math.sin(x*12.9898+y*78.233)*43758.5453; return h-Math.floor(h); }
/* the pass itself, on a canvas already at its final size */
function artShadeCanvas(src, o){
  o=o||{};
  const w=src.width+2, h=src.height+2, c=mkCv(w,h), g=c.getContext('2d',{willReadFrequently:true});
  g.drawImage(src,1,1);
  const id=g.getImageData(0,0,w,h), d=id.data, out=new Uint8ClampedArray(d);
  const A=(x,y)=> (x<0||y<0||x>=w||y>=h)? 0 : d[(y*w+x)*4+3];
  const INK=[20,12,16], grain=o.grain===undefined? 0.05 : o.grain;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const i=(y*w+x)*4, a=d[i+3];
    if(a<128){
      /* the line round the outside */
      if(o.ink===false) continue;
      let r=0,gg=0,b=0,n=0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+dx, Y=y+dy; if(A(X,Y)<128) continue;
        const q=(Y*w+X)*4; r+=d[q]; gg+=d[q+1]; b+=d[q+2]; n++; }
      if(!n) continue;
      out[i]=R(INK[0]*0.75+r/n*0.25*0.5); out[i+1]=R(INK[1]*0.75+gg/n*0.25*0.5); out[i+2]=R(INK[2]*0.75+b/n*0.25*0.5); out[i+3]=255;
      continue;
    }
    /* lit where the sky is over it, shaded where it sits on something */
    let k=1;
    if(A(x,y-1)<128) k+=0.20; else if(A(x,y-2)<128) k+=0.08;
    if(A(x-1,y)<128) k+=0.07;
    if(A(x,y+1)<128) k-=0.16;
    if(A(x+1,y)<128) k-=0.08;
    /* grain: two scales of noise, so it reads as texture and not as static */
    const n1=shHash(x>>1,y>>1)-0.5, n2=shHash(x,y)-0.5;
    k += (n1*0.7+n2*0.3)*grain*2;
    const lift = k>1? (k-1) : 0, drop = k<1? (1-k) : 0;
    for(let c2=0;c2<3;c2++){ let v=d[i+c2]; v = v + (255-v)*lift*0.9 - v*drop; out[i+c2]=clamp(v,0,255); }
  }
  id.data.set(out); g.putImageData(id,0,0);
  return c;
}
/* the stamped image at its drawn size, shaded, kept */
function artShaded(img, sc){
  const key=sc.toFixed(3);
  let m=SHADE.cache.get(img); if(!m){ m=new Map(); SHADE.cache.set(img,m); }
  let c=m.get(key); if(c) return c;
  const w=Math.max(1,R(img.width*sc)), h=Math.max(1,R(img.height*sc));
  const s=mkCv(w,h), g=G2(s); g.imageSmoothingEnabled=false; g.drawImage(img,0,0,w,h);
  c=artShadeCanvas(s); m.set(key,c); return c;
}
function treeSet(){
  if(SHADE.tset) return SHADE.tset;
  const S=new Map();
  const add=(arr,kind)=>{ if(arr) for(const c of arr) S.set(c,kind); };
  add(ART.palm,'palm'); add(ART.banana,'banana'); add(ART.tam,'tam'); add(ART.bamboo,'bamboo');
  add(ART.dead,'dead'); add(ART.blossom,'blossom');
  SHADE.tset=S; return S;
}
/* stamp() asks this first. A tree becomes a live tree; anything else is
   shaded and painted into the ground as before. */
function artShadeStamp(img, x, y, sc){
  if(!img || !img.width) return false;
  const kind=treeSet().get(img);
  const c=artShaded(img, sc);
  const X=R(x-img.width*sc/2)-1, Y=R(y-img.height*sc)-1;
  if(kind){
    /* painted twice (a new game repaints the story props) is still one tree */
    if(SHADE.trees.some(t=>t.x===X && t.y===Y && t.c===c)) return true;
    SHADE.sorted=false;
    SHADE.trees.push({ c, x:X, y:Y, w:c.width, h:c.height, bx:x, kind, a:0, v:0,
      ph:shHash(R(x),7)*TAU, give: TREE_GIVE[kind]||1 });
    return true;
  }
  playG.drawImage(c, X, Y);
  return true;
}
/* how far each kind bends in the same wind */
const TREE_GIVE = { palm:1.6, bamboo:2.0, banana:1.3, tam:0.8, blossom:0.9, dead:0.35 };
function treesSorted(){
  if(!SHADE.sorted){ SHADE.trees.sort((a,b)=>a.x-b.x); SHADE.sorted=true; }
  return SHADE.trees;
}
function treesInView(pad){
  const T=treesSorted(), a=GS.camX-pad, b=GS.camX+W+pad, out=[];
  for(const t of T){ if(t.x+t.w<a) continue; if(t.x>b) break; out.push(t); }
  return out;
}
function stepTreesDyn(dt){
  if(!SHADE.trees.length) return;
  const T=treesInView(120);
  for(const t of T){
    const wv=(typeof windAt==='function'? windAt(t.bx) : GS.wind||0);
    /* the wind leans it over, and it flutters round where the wind is holding it */
    const target = wv*3.2*t.give + Math.sin(GS.t*(1.3+t.give*0.4)+t.ph)*Math.abs(wv)*0.9*t.give;
    t.v += ((target - t.a)*9 - t.v*2.6)*dt;
    /* anybody walking through the low branches pushes it */
    if(typeof P!=='undefined' && Math.abs(P.x-t.bx) < t.w*0.3 && Math.abs(P.vx)>8 && GS.state==='play')
      t.v += P.vx*0.012*t.give;
    t.a += t.v*dt;
    t.a = clamp(t.a, -9, 9);
    /* shaken hard enough, or in a strong gust, it lets a leaf go */
    const shake=Math.abs(t.v)+Math.abs(wv)*1.4;
    if(t.kind!=='dead' && shake>2.2 && Math.random()<dt*(shake-2)*0.9){
      const col = t.kind==='blossom'? pick(['#f0a0c0','#ffd0e0','#f8b8d0']) : pick(['#4f8a4a','#6aa85a','#8ab85a','#c8b048']);
      part({k:'petal', x:t.x+t.w*(0.2+Math.random()*0.6), y:t.y+t.h*(0.1+Math.random()*0.35),
            vx:wv*14+rnd(-6,6), vy:rnd(6,16), life:rnd(2.2,4.2), sw:rnd(9), c:col});
    }
  }
  /* the shake-the-tree trees give their shake to the tree they are */
  if(typeof TREE_SPOTS!=='undefined') for(const s of TREE_SPOTS){ if(s.wob>0.95){
    const t=T.find(q=>Math.abs(q.bx-s.x)<24); if(t) t.v += 18*(Math.random()<0.5?-1:1); } }
}
/* drawn before the ground layer, so the ground covers the foot of every trunk */
function drawTreesDyn(g){
  if(!SHADE.trees.length) return;
  const T=treesInView(40);
  for(const t of T){
    const s=t.a;
    if(Math.abs(s)<0.5){ g.drawImage(t.c, t.x, t.y); continue; }
    /* bent a whole pixel at a time, row by row, more the higher up it goes */
    const SL=3;
    for(let sy=0; sy<t.h; sy+=SL){
      const hf=1-(sy+SL/2)/t.h, off=R(s*Math.pow(clamp(hf,0,1),1.6));
      g.drawImage(t.c, 0, sy, t.w, Math.min(SL,t.h-sy), t.x+off, t.y+sy, t.w, Math.min(SL,t.h-sy));
    }
  }
}

/* ---------- grain in the big layers ----------
   The ground, the hedges and the rooftops behind are big flat fills. A
   pass of smooth noise over them, a few percent either way, and paint reads
   as earth and thatch and leaf. */
function layerGrain(cv, amt, step){
  const g=cv.getContext('2d',{willReadFrequently:true}), W2=cv.width, H2=cv.height, band=1024;
  for(let x0=0; x0<W2; x0+=band){
    const bw=Math.min(band, W2-x0), id=g.getImageData(x0,0,bw,H2), d=id.data;
    for(let y=0;y<H2;y++) for(let x=0;x<bw;x++){
      const i=(y*bw+x)*4; if(d[i+3]<200) continue;
      const X=x0+x, n=(shHash(X>>2,y>>2)-0.5)*0.6 + (shHash(X>>1,y>>1)-0.5)*0.4 + (shHash(X,y)-0.5)*0.25;
      const k=1+n*amt;
      d[i]=clamp(d[i]*k,0,255); d[i+1]=clamp(d[i+1]*k,0,255); d[i+2]=clamp(d[i+2]*k,0,255);
    }
    g.putImageData(id,x0,0);
  }
}
BUILD_STEPS.push(['giving it some grain', ()=>{ layerGrain(playCv,0.16); layerGrain(bgCv,0.12); layerGrain(midCv,0.08); SHADE.ready=true; }]);
TH['giving it some grain'] = 'แต่งพื้นผิว';
