/* ============================================================
   THE ICONS, REDRAWN

   Every item used to be drawn out of four or five ellipses at
   whatever size the caller asked for — at the size the basket
   draws them, nine pixels of blob. They are sixteen-pixel sprites
   now, painted a pixel at a time the way item icons are painted:
   light from the top left, a highlight you can see, three or four
   tones down each form, and one dark line round the outside that
   takes its colour from whatever it is next to, so a mango's line
   is a dark red-brown and a lime's a dark green.

   Each one is painted once into a small canvas and kept. The
   painters below work on a sixteen-by-sixteen grid with a pixel of
   room round it for the line.
   ============================================================ */
var ICON16 = {};
const ICO = { cache:new Map(), S:16, P:1 };
const ICO_L = (()=>{ const x=-0.52, y=-0.62, z=0.58, n=Math.hypot(x,y,z); return [x/n,y/n,z/n]; })();
const ICO_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
/* a ramp from one colour: highlight, light, base, shade, deep */
function ramp(c){ return [shade(c,0.5), shade(c,0.2), c, shade(c,-0.26), shade(c,-0.48)]; }
function rampOf(hi,li,mid,dk,dp){ return [hi,li,mid,dk,dp]; }

function icoPainter(g){
  const O=ICO.P;
  const p = {
    g,
    px(x,y,c){ g.fillStyle=c; g.fillRect(R(x)+O,R(y)+O,1,1); },
    rect(x,y,w,h,c){ g.fillStyle=c; g.fillRect(R(x)+O,R(y)+O,R(w),R(h)); },
    /* a flat ellipse, by pixel centre, so small ones come out round */
    ell(cx,cy,rx,ry,c){ g.fillStyle=c;
      for(let y=Math.floor(cy-ry-1); y<=Math.ceil(cy+ry+1); y++) for(let x=Math.floor(cx-rx-1); x<=Math.ceil(cx+rx+1); x++){
        const dx=(x+0.5-cx)/rx, dy=(y+0.5-cy)/ry; if(dx*dx+dy*dy<=1) g.fillRect(x+O,y+O,1,1); } },
    /* a lit ellipsoid: the whole of most fruit */
    ball(cx,cy,rx,ry,R5,o){ o=o||{};
      const lx=ICO_L[0], ly=ICO_L[1], lz=ICO_L[2], dith=o.dither===undefined? 0.10 : o.dither;
      for(let y=Math.floor(cy-ry-1); y<=Math.ceil(cy+ry+1); y++) for(let x=Math.floor(cx-rx-1); x<=Math.ceil(cx+rx+1); x++){
        const nx=(x+0.5-cx)/rx, ny=(y+0.5-cy)/ry, q=nx*nx+ny*ny; if(q>1) continue;
        if(o.clip && !o.clip(x,y)) continue;
        const nz=Math.sqrt(1-q), d=nx*lx+ny*ly+nz*lz + (ICO_BAYER[(y&3)*4+(x&3)]/16-0.5)*dith;
        let i = d>0.86? 0 : d>0.58? 1 : d>0.18? 2 : d>-0.22? 3 : 4;
        if(o.noHi && i===0) i=1;
        /* a little light thrown back up into the shadow side, off the ground */
        if(o.bounce && i===4 && ny>0.55) i=3;
        g.fillStyle=R5[i]; g.fillRect(x+O,y+O,1,1);
      }
      if(o.spec!==false){ const sx=R(cx-rx*0.42-0.5), sy=R(cy-ry*0.5-0.5); g.fillStyle=o.specC||'#fffdf2'; g.fillRect(sx+O,sy+O,1,1);
        if(rx>=4) g.fillRect(sx+O+1,sy+O,1,1); }
    },
    line(x0,y0,x1,y1,c,w){ w=w||1; g.fillStyle=c;
      const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2));
      for(let i=0;i<=n;i++){ const t=i/n, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t;
        g.fillRect(Math.floor(x-w/2+0.5)+O, Math.floor(y-w/2+0.5)+O, w, w); } },
    /* a stroke along a list of points, thick, with a shade line under and a light one over */
    tube(pts,w,R5,o){ o=o||{};
      const seg=(c,ww,dy,dx)=>{ for(let i=0;i+1<pts.length;i++) p.line(pts[i][0]+(dx||0),pts[i][1]+(dy||0),pts[i+1][0]+(dx||0),pts[i+1][1]+(dy||0),c,ww); };
      seg(R5[3],w,0.9,0.4); seg(R5[2],w,0,0);
      if(w>=2) seg(R5[1],1,-(w/2-0.5),-(o.lx||0.3));
    },
    poly(pts,c){ const o=[]; for(let i=0;i<pts.length;i+=2) o.push(pts[i]+O,pts[i+1]+O); pPoly(g,o,c); },
    tri(ax,ay,bx,by,cx,cy,c){ pTri(g,ax+O,ay+O,bx+O,by+O,cx+O,cy+O,c); },
  };
  return p;
}
/* the line round the outside, coloured from what it touches */
function icoOutline(c, ink){
  const g=c.getContext('2d'), w=c.width, h=c.height, id=g.getImageData(0,0,w,h), d=id.data, out=new Uint8ClampedArray(d);
  const INK=hx(ink||'#1d1218');
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const o=(y*w+x)*4; if(d[o+3]>100) continue;
    let r=0,gg=0,b=0,n=0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+dx, Y=y+dy; if(X<0||Y<0||X>=w||Y>=h) continue;
      const q=(Y*w+X)*4; if(d[q+3]>100){ r+=d[q]; gg+=d[q+1]; b+=d[q+2]; n++; } }
    if(!n) continue;
    r/=n; gg/=n; b/=n;
    out[o]=R(INK[0]*0.72+r*0.28*0.55); out[o+1]=R(INK[1]*0.72+gg*0.28*0.55); out[o+2]=R(INK[2]*0.72+b*0.28*0.55); out[o+3]=255;
  }
  id.data.set(out); g.putImageData(id,0,0);
}
function icoSprite(id){
  let c=ICO.cache.get(id); if(c!==undefined) return c;
  const f=ICON16[id]; if(!f){ ICO.cache.set(id,null); return null; }
  c=mkCv(ICO.S+ICO.P*2, ICO.S+ICO.P*2);
  const g=c.getContext('2d',{willReadFrequently:true}); g.imageSmoothingEnabled=false;
  try{ f(icoPainter(g)); icoOutline(c); }catch(e){ ICO.cache.set(id,null); return null; }
  ICO.cache.set(id,c); return c;
}
/* the size an old caller asked for, in whole multiples of sixteen */
function icoScale(s){ return Math.max(1, Math.round(s*0.9)); }
/* drawIcon asks this first; true means it was drawn */
function iconSprite(g, id, x, y, s){
  if(s<0.55) return false;                    // the little fruit hanging on plants in the world keep their old drawing
  const c=icoSprite(id); if(!c) return false;
  const k=icoScale(s), w=c.width*k, h=c.height*k;
  const sm=g.imageSmoothingEnabled; g.imageSmoothingEnabled=false;
  g.drawImage(c, R(x-w/2), R(y-h/2), w, h);
  g.imageSmoothingEnabled=sm;
  return true;
}

/* ---------------- palettes ---------------- */
const IC = {
  leafR: rampOf('#c8f08a','#8fd05a','#5aa640','#3a7a34','#265a2c'),
  leafD: rampOf('#9fdc7a','#5fae52','#3f8a44','#2a6636','#1c4a2a'),
  stem:  rampOf('#c8a070','#a07a4a','#7a5634','#5a3c24','#3e2818'),
  wood:  rampOf('#f0c890','#d8a468','#b8804a','#8a5a32','#643e22'),
  white: rampOf('#ffffff','#f8f4ea','#e8e0cc','#c8bca4','#a0937c'),
  plate: rampOf('#ffffff','#f4f6f8','#dfe4ea','#b8c0cc','#8a94a4'),
  gold:  rampOf('#fff6b8','#ffe070','#f2c040','#c89024','#8a5a14'),
  red:   rampOf('#ffb0a0','#ff6450','#e0302c','#a81c24','#70101c'),
  clay:  rampOf('#f0b890','#d8845a','#b8603c','#8a4028','#5e2a1c'),
  rice:  rampOf('#ffffff','#fbf8ee','#efe8d4','#d6ccb2','#b4a88c'),
};

/* ---------------- templates ---------------- */
function icoLeaf(p, x0,y0,x1,y1,w,R5, vein){
  const n=10, dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
  for(let i=0;i<=n;i++){ const t=i/n, ww=Math.sin(t*Math.PI)*w;
    for(let s=-ww; s<=ww; s+=0.5){ const x=x0+dx*t+nx*s, y=y0+dy*t+ny*s;
      p.px(Math.floor(x), Math.floor(y), s<-ww*0.3? R5[1] : s>ww*0.45? R5[3] : R5[2]); } }
  if(vein!==false) p.line(x0,y0,x0+dx*0.85,y0+dy*0.85,R5[3]);
}
function icoFish(p, o){
  const B=o.body, len=o.len||6.4, ht=o.ht||3.2, cx=o.cx||7.2, cy=o.cy||8.5;
  /* tail */
  p.poly([cx-len+1,cy, cx-len-3,cy-3.4, cx-len-2,cy, cx-len-3,cy+3.6], o.fin||B[3]);
  p.poly([cx-len+1,cy, cx-len-2.4,cy-2.4, cx-len-2,cy], o.finL||B[2]);
  /* fins */
  p.poly([cx-2.4,cy-ht+0.4, cx+1.6,cy-ht-2.4, cx+2.6,cy-ht+0.6], o.fin||B[3]);
  p.poly([cx-1,cy+ht-0.4, cx+1,cy+ht+1.8, cx+2.4,cy+ht-0.6], o.fin||B[3]);
  p.ball(cx,cy,len,ht,B,{dither:0.06});
  if(o.belly) for(let x=-len+2;x<len-1;x++) p.px(cx+x, cy+ht-1.2, o.belly);
  if(o.stripes) for(const sx of o.stripes) p.line(cx+sx,cy-ht+0.8,cx+sx-0.6,cy+ht-1.2,o.stripeC||B[3]);
  if(o.spots) for(const [sx,sy] of o.spots) p.px(cx+sx, cy+sy, o.spotC||B[3]);
  if(o.whisk){ p.line(cx+len-0.6,cy+0.6,cx+len+1.6,cy+2.4,o.whisk); p.line(cx+len-1,cy+0.8,cx+len,cy+3.4,o.whisk); }
  /* the eye and the gill */
  p.px(cx+len-2.2, cy-0.8, '#fffdf2'); p.px(cx+len-2.2, cy-0.2+0.6, '#141018');
  p.line(cx+len-3.6, cy-ht+1.2, cx+len-3.8, cy+ht-1.6, B[3]);
}
function icoBeetle(p, o){
  const B=o.body, cx=8, cy=o.cy||9;
  /* legs, three a side */
  for(let i=0;i<3;i++){ const yy=cy-1.5+i*2.2;
    p.line(cx-3.6,yy,cx-6,yy+1.4+i*0.4,'#2a2028'); p.line(cx+3.6,yy,cx+6,yy+1.4+i*0.4,'#2a2028'); }
  p.ball(cx,cy+0.5,o.rx||4.2,o.ry||5,B,{dither:0.05});
  p.ball(cx,cy-4.6,o.hrx||2.8,2.2,o.head||B,{spec:false});
  if(o.split!==false) p.line(cx,cy-3,cx,cy+5,B[4]);
  if(o.spots) for(const [sx,sy] of o.spots) p.px(cx+sx,cy+sy,o.spotC||'#1a1218');
  if(o.horn){ p.line(cx,cy-6,cx,cy-9.6,o.horn,2); p.line(cx,cy-9.6,cx+1.4,cy-11.2,o.horn); }
  if(o.jaws){ p.line(cx-1.4,cy-6,cx-3,cy-10,o.jaws,2); p.line(cx+1.4,cy-6,cx+3,cy-10,o.jaws,2);
              p.px(cx-2,cy-8.4,o.jaws); p.px(cx+2,cy-8.4,o.jaws); }
  p.line(cx-1,cy-6.4,cx-2.6,cy-8.6,'#2a2028'); p.line(cx+1,cy-6.4,cx+2.6,cy-8.6,'#2a2028');
}
function icoWings(p, o){
  /* a butterfly or moth from above: two wings a side, body down the middle */
  const cx=8, cy=8.2, A=o.fore, Bw=o.hind||o.fore;
  p.ball(cx-3.6,cy-2.2,3.8,3.4,A,{spec:false,dither:0.04}); p.ball(cx+3.6,cy-2.2,3.8,3.4,A,{spec:false,dither:0.04});
  p.ball(cx-2.8,cy+3,2.9,2.8,Bw,{spec:false,dither:0.04}); p.ball(cx+2.8,cy+3,2.9,2.8,Bw,{spec:false,dither:0.04});
  if(o.edge){ for(const s of [-1,1]){ p.line(cx+s*6.6,cy-4,cx+s*6.8,cy-0.6,o.edge); p.line(cx+s*5,cy+4.4,cx+s*3,cy+5.6,o.edge); } }
  if(o.spots) for(const [sx,sy,c] of o.spots){ p.px(cx+sx,cy+sy,c||'#fffdf2'); p.px(cx-sx-1,cy+sy,c||'#fffdf2'); }
  p.line(cx-0.5,cy-4.6,cx-0.5,cy+5,'#2a1c20',2);
  p.line(cx-1,cy-4.6,cx-2.8,cy-7,'#2a1c20'); p.line(cx,cy-4.6,cx+1.8,cy-7,'#2a1c20');
}
function icoPlate(p, o){
  o=o||{};
  p.ell(8,11.6,7.2,3.4,IC.plate[3]); p.ell(8,11,7.2,3.2,IC.plate[1]); p.ell(8,10.8,5.6,2.3,IC.plate[2]);
  if(o.rim) for(let i=0;i<12;i++){ const a=i/12*TAU; p.px(8+Math.cos(a)*6.4, 11+Math.sin(a)*2.8, o.rim); }
}
function icoBowl(p, o){
  const C=o.bowl||IC.clay;
  p.ell(8,8.6,7,2.4,C[3]);                                   // the far rim, inside
  p.ell(8,8.8,6.2,1.9,o.soup||'#e8703a');
  p.ball(8,10,7,5.4,C,{clip:(x,y)=>y>=8,spec:false});
  p.line(1.6,9,14.4,9,C[1]);
  p.rect(4.5,14.6,7,1,C[4]);
}
function icoSack(p, R5, band){
  p.ball(8,10,5.8,5.4,R5,{dither:0.14});
  p.poly([4.6,5.4, 11.4,5.4, 10,2.4, 6,2.4], R5[2]);
  p.line(5,5.6,11,5.6,band||'#7a4a24',1); p.line(6.4,2.6,9.6,2.6,R5[1]);
  for(let i=0;i<6;i++) p.px(4+i*1.6+(i%2), 9+(i%3)*1.6, R5[3]);
}

/* ---------------- the fruit ---------------- */
Object.assign(ICON16, {
  banana: p=>{
    /* a hand of three, hanging off the stalk: each one its own curve, with
       the shade under it so they stay three and not one yellow lump */
    const Y=rampOf('#fffac8','#ffea70','#f6c832','#c8962a','#8a6418');
    const ban=(ox,oy)=>{ const pts=[]; for(let i=0;i<=6;i++){ const t=i/6; pts.push([3+ox+t*9.6, 3.6+oy+Math.sin(t*Math.PI*0.9)*6.4+t*2.6]); }
      for(const q of pts) p.px(q[0],q[1]+2,Y[4]);
      p.tube(pts,3,Y); p.px(pts[6][0]+0.6,pts[6][1],'#5a3c1c'); };
    ban(0,-0.6); ban(-1.4,2); ban(-2.4,4.6);
    p.line(1,1,3,4,IC.stem[3],2); p.px(1,0.6,IC.stem[2]);
  },
  mango: p=>{
    const M=rampOf('#fff4b0','#ffd860','#f4a832','#d8742a','#9a4a1c');
    p.ball(7.6,9.4,5.4,5.8,M,{bounce:true});
    for(const [x,y] of [[10,6],[11,7],[10,7],[11,8],[12,8]]) p.px(x,y,'#f08a3c');
    p.line(8.6,3.8,9.4,2.2,IC.stem[3],1);
    icoLeaf(p,9.4,3,14.4,1.6,1.8,IC.leafR);
  },
  papaya: p=>{
    const G=rampOf('#e8f8a0','#b8e070','#84bc48','#5a9034','#3a6624');
    p.ball(8,8.6,4.6,6.8,G,{bounce:true});
    for(const [x,y] of [[6,10],[7,11],[9,12],[10,9]]) p.px(x,y,'#d8d85a');
    p.line(8,1.4,8,2.6,IC.stem[3],2);
  },
  coconut: p=>{
    /* green, the top taken off, and a straw in it: the way it is sold */
    const G=rampOf('#d8f090','#9fd05a','#6aa83c','#4a8030','#2e5a22');
    p.ball(8,9.6,6.2,5.6,G,{bounce:true});
    p.ell(8,5.4,3.2,1.5,'#f8f2e0'); p.ell(8,5.4,2.2,0.9,'#fffdf4');
    p.line(9.2,5,12.4,0.6,'#f06a8a',2); p.line(9.6,5,12.6,1,'#ffb0c4',1);
  },
  lime: p=>{
    const G=rampOf('#eaffb0','#b8e862','#80c03a','#58962c','#3a6a20');
    p.ball(7.6,9.4,5,5,G,{bounce:true});
    for(const [x,y] of [[5,8],[8,11],[10,9],[7,6]]) p.px(x,y,G[3]);
    icoLeaf(p,8.6,4.4,13.6,2,2,IC.leafR);
  },
  durian: p=>{
    const G=rampOf('#e8e8a0','#c0c060','#949a3c','#6a742c','#4a5020');
    for(let i=0;i<14;i++){ const a=i/14*TAU, x=8+Math.cos(a)*6, y=9+Math.sin(a)*5.8;
      p.tri(x,y, x+Math.cos(a)*1.8, y+Math.sin(a)*1.8, x+Math.cos(a+0.5)*0.5, y+Math.sin(a+0.5)*0.5, G[3]); }
    p.ball(8,9,5.8,5.6,G,{dither:0.4});
    for(let y=5;y<14;y+=2) for(let x=4+(y%4?1:0);x<13;x+=2) p.px(x,y,G[1]);
    p.line(8,3.6,8.6,1.4,IC.stem[3],2);
  },
  mangosteen: p=>{
    const P=rampOf('#c890c8','#8a4a8a','#5e2a60','#3e1a44','#28102e');
    p.ball(8,9.6,5.6,5.2,P,{bounce:true});
    const L=IC.leafD;
    for(const [dx,dy] of [[-3,0],[3,0],[-1.4,-1],[1.4,-1]]) p.ell(8+dx,4.8+dy*0.5,1.8,1.1,dx<0?L[2]:L[1]);
    p.line(8,3.6,8,1.2,L[3],2);
  },
  rambutan: p=>{
    const Rr=rampOf('#ffb088','#ff5a40','#d8282c','#a0182a','#6a0e1e');
    p.ball(8,9,5,5,Rr,{spec:false});
    for(let i=0;i<22;i++){ const a=i/22*TAU, x=8+Math.cos(a)*5, y=9+Math.sin(a)*5;
      p.line(x,y,x+Math.cos(a+0.6)*2.2,y+Math.sin(a+0.6)*2.2, i%3? '#e8402c' : '#a8c048'); }
    for(const [x,y] of [[6,7],[8,6],[10,8],[7,10],[9,11],[11,10],[5,9]]) p.px(x,y,Rr[3]);
    p.px(6,6,'#fff0d8');
  },
  longan: p=>{
    const T=rampOf('#fff0c0','#e8c888','#c8a060','#9a7440','#6a4e2a');
    p.line(8,1,8,4,IC.stem[3]); p.line(8,4,4.6,6,IC.stem[3]); p.line(8,4,11.6,6,IC.stem[3]);
    for(const [x,y] of [[4.6,9],[11.4,9],[8,12],[8,7.6]]) p.ball(x,y,3,3,T,{dither:0.05});
  },
  jackfruit: p=>{
    const J=rampOf('#f0f098','#cad060','#9aac3c','#6e8430','#4a5c22');
    p.ball(8,9,5.6,6.6,J,{dither:0.3,bounce:true});
    for(let y=3;y<16;y+=2) for(let x=3+(y%4?1:0);x<14;x+=2) p.px(x,y,J[3]);
    p.line(8,2.4,7.4,0.4,IC.stem[3],2);
  },
});

/* ---------------- herbs ---------------- */
Object.assign(ICON16, {
  chili: p=>{
    const Rr=rampOf('#ffb098','#ff5a3a','#e0282a','#a8161e','#700e16');
    p.tube([[3,4],[5,9],[8,12.6],[12,14.4]],3,Rr);
    p.tube([[6,3],[8.6,7.4],[11.4,10.4],[14.4,11]],2,rampOf('#ffd0a0','#ff8a40','#f06a28','#b8481e','#7a2a12'));
    p.line(3,4,2.4,1.6,'#4a9a3c',2); p.line(6,3,6.6,1.2,'#4a9a3c',1);
  },
  lemongrass: p=>{
    for(const [dx,c] of [[-3,IC.leafD],[0,IC.leafR],[3,IC.leafD]]){
      p.line(8+dx*0.4,15,8+dx*0.6,8,'#f0f0cc',2); p.line(8+dx*0.4+1,15,8+dx*0.6+1,8,'#d0d8a0',1);
      p.line(8+dx*0.6,8,8+dx*1.4,1,c[2],2); p.line(8+dx*0.6,8,8+dx*1.4-0.5,1.4,c[1],1); }
    p.rect(5,11,6,1,'#b8904a');
  },
  herb: p=>{
    p.line(8,15,8,6,IC.leafD[3]); p.line(8,10,4.4,6,IC.leafD[3]); p.line(8,9,11.6,5,IC.leafD[3]);
    for(const [x,y,r] of [[4,5,2.2],[8,4.4,2.4],[12,4.6,2.2],[5.4,8.6,1.8],[10.8,8,1.8],[8,1.6,1.6]])
      p.ball(x,y,r,r*0.86,IC.leafR,{spec:false,dither:0});
  },
  basil: p=>{
    const L=rampOf('#b8e090','#7cbc5c','#4e944a','#356c3a','#244c2a');
    p.line(8,15,8,2,'#6a4a5a',1);
    for(const [y,s] of [[12,1],[9,-1],[6,1],[3.4,-1]]){
      icoLeaf(p,8,y,8+s*5.6,y-2.4,1.7,L,false); icoLeaf(p,8,y+0.6,8-s*4.6,y-1.4,1.5,L,false); }
    p.px(8,1,'#b86a9a'); p.px(7,1.6,'#b86a9a');
  },
  pandan: p=>{
    const L=rampOf('#a8e088','#62b456','#3a8c44','#28683a','#1a4a2c');
    for(const [x1,y1] of [[2,2],[6,0.6],[10.6,0.8],[14,3]]) icoLeaf(p,8,15,x1,y1,1.6,L);
    p.rect(6,13,4,2,'#d8c890');
  },
  kaffir: p=>{
    /* the leaf that is two leaves, one above the other */
    const L=IC.leafD;
    icoLeaf(p,3,13,7,9,2.6,L); icoLeaf(p,7,9,13.4,2.4,3.2,L);
    p.line(2,14.6,3,13,IC.stem[3]);
    p.ball(12.4,12.2,2.6,2.6,rampOf('#eaffb0','#b8e862','#80c03a','#58962c','#3a6a20'),{dither:0});
  },
  galangal: p=>{
    const G=rampOf('#fff4e8','#f4dcc8','#e0b8a0','#b88a78','#8a5e54');
    p.tube([[2,10],[6,9],[10,10.4],[13.6,8]],4,G);
    p.ball(5,7,2.4,2.2,G,{dither:0}); p.ball(11,6.8,2,2.4,G,{dither:0});
    for(const x of [4,7,10,12.6]) p.line(x,8.6,x-0.4,11.4,'#c87890');
    p.line(11,4.6,11.6,2.4,'#6aa840',1);
  },
  morning: p=>{
    /* ผักบุ้ง: hollow stems in a bundle, arrow-shaped leaves at the top */
    for(let i=0;i<4;i++) p.line(5+i*1.4,15,4+i*2.2,5,i%2?'#a8d070':'#8ab85a',1);
    for(const [x,y,s] of [[3,4,-1],[7,2.6,0],[11,3.6,1],[13,6,1]]){
      p.tri(x,y-3, x-2.4+s,y+1.4, x+2.4+s,y+1.4, IC.leafR[2]); p.tri(x,y-3, x-2.4+s,y+1.4, x+s*0.4,y+0.6, IC.leafR[1]); }
    p.rect(4.6,11,6,1.4,'#c8403a');
  },
});

/* ---------------- the farm, the kitchen, the house ---------------- */
Object.assign(ICON16, {
  rice: p=>{
    /* กระติบข้าว: the woven basket sticky rice comes in */
    const W=rampOf('#fff0b8','#f0d088','#d8a860','#aa7c3c','#7a5424');
    p.ball(8,10.4,5.6,4.6,W,{clip:(x,y)=>y>=6.5,dither:0.2,spec:false});
    p.rect(2.6,6,10.8,2.6,W[2]); p.rect(2.6,6,10.8,1,W[1]); p.rect(2.6,8.4,10.8,1,W[3]);
    for(let y=9;y<15;y+=2) for(let x=3+(y%4?1:0);x<13;x+=2) p.px(x,y,W[3]);
    p.ell(8,5.4,4.6,1.4,W[1]); p.line(3,6,2,2,'#8a5a2c'); p.line(13,6,14,2,'#8a5a2c'); p.line(2,2,14,2,'#8a5a2c');
  },
  egg: p=>{ p.ball(8,9,4.6,5.8,rampOf('#ffffff','#fbf6ea','#ecdfc8','#c8b89c','#a0907a'),{bounce:true}); },
  duckEgg: p=>{ p.ball(8,9,4.8,5.8,rampOf('#ffffff','#e8f6f2','#c8e4dc','#98c0b8','#6e9690'),{bounce:true});
    for(const [x,y] of [[6,9],[10,11],[9,6]]) p.px(x,y,'#a0c4bc'); },
  milk: p=>{
    const G=rampOf('#ffffff','#f4f8fa','#dfe8ee','#b0c0cc','#8494a4');
    p.rect(4,5,8,10,G[2]); p.rect(4,5,2,10,G[1]); p.rect(10,5,2,10,G[3]);
    p.rect(5,7,6,7,'#fbf8f0'); p.rect(5,7,1,7,'#ffffff'); p.rect(10,7,1,7,'#e0d8c8');
    p.rect(6,2,4,3,G[2]); p.rect(5.6,1,5,1.6,'#3a78c8'); p.rect(5.6,1,5,0.6,'#6aa0e8');
    p.rect(6,10,4,2,'#3a78c8');
  },
  seed: p=>{
    const K=rampOf('#fff0d0','#f0d8a8','#dcb880','#b08a58','#806038');
    p.poly([3,4, 13,4, 14,15, 2,15], K[2]); p.poly([3,4, 5,4, 4,15, 2,15], K[1]); p.poly([12,4,13,4,14,15,12,15], K[3]);
    p.rect(3,3,10,1.4,K[3]); p.ell(8,9.6,2.6,2.6,'#6aa840'); p.px(7,9,'#b8e080');
    for(const [x,y] of [[5,1],[8,0.6],[11,1.4],[9,2]]) p.ell(x,y,1,0.8,'#8a6a3a');
  },
  manure: p=>{
    const B=rampOf('#c8a078','#9a7050','#74503a','#54382a','#3a261e');
    p.ball(8,12,6,3,B,{dither:0.1}); p.ball(8,8.6,4.2,2.8,B,{dither:0.1}); p.ball(8.4,5.4,2.4,2.2,B,{dither:0.1});
    p.line(9,3.4,10.4,1.6,B[3]);
  },
  bran: p=>{ icoSack(p, rampOf('#f8e8c0','#e0c890','#c8a868','#9a7c48','#6e5630'));
    for(const [x,y] of [[2,15],[4,15.4],[13,15],[11.6,15.4],[14,14.6]]) p.px(x,y,'#b08850'); },
  wood: p=>{
    const W=IC.wood;
    for(const [y,dx] of [[10,0],[5.4,1.2]]){
      p.rect(1+dx,y,12,4,W[2]); p.rect(1+dx,y,12,1,W[1]); p.rect(1+dx,y+3,12,1,W[3]);
      for(const x of [4,8,11]) p.px(x+dx,y+1.6,W[3]);
      p.ell(13+dx,y+2,1.8,2.2,'#f0d4a0'); p.px(13+dx,y+2,W[3]); }
  },
  clay: p=>{
    const C=rampOf('#f4b898','#d8845c','#b4603c','#8a4028','#5e2a1c');
    p.ball(8,10,6,4.6,C,{bounce:true}); p.ball(6,6.6,3,2.2,C,{spec:false});
    p.ell(9.4,9,1.4,1,C[3]); p.px(9,8.6,C[4]);
  },
  flower: p=>{
    /* จำปี-white, five petals, yellow at the heart */
    const Wp=rampOf('#ffffff','#fffaf0','#f0e8d8','#d0c4ac','#a89c84');
    for(let i=0;i<5;i++){ const a=i/5*TAU-Math.PI/2; p.ball(8+Math.cos(a)*3.6,8+Math.sin(a)*3.6,2.8,2.8,Wp,{spec:false,dither:0}); }
    p.ball(8,8,2,2,rampOf('#fff8b0','#ffe060','#f4b830','#c8841c','#8a5a14'),{dither:0});
  },
  leaf: p=>{
    const L=rampOf('#b0e890','#72c060','#4a9a4c','#327a3c','#205a2c');
    icoLeaf(p,1.4,14.4,14.4,1.6,4.2,L);
    for(let i=1;i<6;i++){ const t=i/6, x=1.4+13*t, y=14.4-12.8*t; p.line(x,y,x+2,y+1.4,L[3]); p.line(x,y,x-1.4,y-2,L[3]); }
  },
  bamboo: p=>{
    const B=rampOf('#f0f0b0','#d0d074','#a8ac4c','#7a8038','#545a26');
    for(const x of [4,9]){ p.rect(x,1,3,15,B[2]); p.rect(x,1,1,15,B[1]); p.rect(x+2,1,1,15,B[3]);
      for(const y of [5,10]) { p.rect(x-0.4,y,3.8,1,B[4]); p.rect(x,y+1,3,1,B[1]); } }
    icoLeaf(p,12,5,15,1,1.4,IC.leafR);
  },
  collar: p=>{
    for(let a=0;a<TAU;a+=0.04) for(const rr of [4.6,5.4]){ const x=8+Math.cos(a)*rr, y=7.6+Math.sin(a)*rr*0.8;
      p.px(Math.floor(x),Math.floor(y), Math.sin(a)<-0.3? '#ff6a58' : Math.sin(a)>0.4? '#8a1c20' : '#d8403a'); }
    p.rect(12,5,2,3,'#d8d8e0'); p.px(12,5,'#ffffff');
    p.ball(8,13.4,2,2,IC.gold,{dither:0});
  },
});

/* ---------------- dishes ---------------- */
Object.assign(ICON16, {
  mooping: p=>{
    const M=rampOf('#f0b878','#c87838','#9a5024','#6e3418','#4a2210');
    for(const off of [0,3]){
      p.line(1+off,15,14+off*0.2,2+off*0.6,'#d8c090');
      for(let i=0;i<3;i++){ const t=0.25+i*0.22, x=1+off+(13-off*0.8)*t, y=15-(13-off*0.6)*t; p.ball(x,y,2.2,2,M,{dither:0.2,spec:i===0}); p.px(x-1,y,M[4]); } }
  },
  somtam: p=>{
    icoPlate(p);
    for(let i=0;i<30;i++){ const a=i*2.4, r=(i%5)*0.9; p.px(8+Math.cos(a)*r*1.3, 9.6+Math.sin(a)*r*0.6-1, i%3? '#c8e87a':'#9ad05a'); }
    p.ball(5.4,9,1.6,1.3,IC.red,{spec:false,dither:0}); p.ball(10.8,9.4,1.6,1.3,IC.red,{spec:false,dither:0});
    for(const [x,y] of [[7,8],[9,10],[11,8]]) p.px(x,y,'#e0302c');
    for(const [x,y] of [[6,11],[9,7],[8,11]]) p.px(x,y,'#d8a868');
  },
  stickyMango: p=>{
    icoPlate(p);
    p.ball(5.6,9,3.8,2.8,IC.rice,{dither:0.2});
    for(const dx of [0,2.4,4.8]) p.ball(10+dx*0.5,8.6+dx*0.2,2.6,1.6,rampOf('#fff8b8','#ffe068','#f6c030','#d0901e','#9a6014'),{spec:false,dither:0});
    p.line(4,7.4,7,8,'#fff8e8'); p.px(5,10,'#e8e0c0');
  },
  tomyum: p=>{
    icoBowl(p,{soup:'#f0782c'});
    p.ell(6,8.6,1.6,0.9,'#ff9a78'); p.px(5,8.4,'#ffd0c0');
    p.line(9,8.8,12,8.2,'#6aa840'); p.px(11,9,'#e0302c'); p.px(7.4,9,'#fff0b0');
    p.line(3,4,6,1,'#f0f0e0'); p.line(10,4,12,1.6,'#f0f0e0');
  },
  friedBanana: p=>{
    const F=rampOf('#fff0a0','#f8c850','#e0962c','#b0681c','#7a4412');
    p.poly([1,12, 15,12, 14,15, 2,15], '#e8dcc0'); p.line(1,12,15,12,'#fff8e8');
    for(const [x,y,r] of [[5,10,3.2],[10.4,10.2,3],[7.6,6.6,3]]){ p.ball(x,y,r,r*0.7,F,{dither:0.3}); p.px(x-1,y,F[4]); p.px(x+1,y+1,F[3]); }
  },
  khanomkrok: p=>{
    p.ell(8,10.8,7.4,4.4,'#3a3438'); p.ell(8,10.4,7,4,'#5a5258');
    for(const [x,y] of [[4.6,9],[8,8.2],[11.4,9],[5.6,12],[10.4,12]]){
      p.ball(x,y,1.8,1.4,rampOf('#fff8e0','#f8ecc8','#e8d4a0','#c09a60','#8a6a3a'),{spec:false,dither:0});
      p.px(x,y-0.6,'#6aa840'); }
  },
  padkaphrao: p=>{
    icoPlate(p);
    p.ball(6,9.4,4,2.6,IC.rice,{dither:0.2});
    for(let i=0;i<10;i++) p.px(9+(i%4)*1.2, 9+((i*3)%4)*0.8, i%3?'#8a4a2a':'#4e944a');
    /* the fried egg on top, crispy at the edge */
    p.ell(7,7,3.2,2.2,'#e8c890'); p.ell(7,7,2.6,1.7,'#fffcf2'); p.ball(7.4,6.8,1.3,1.1,rampOf('#fff4b0','#ffd040','#f4a820','#c8781a','#8a5010'),{dither:0});
  },
  greenCurry: p=>{
    icoBowl(p,{soup:'#a8c860',bowl:IC.plate});
    p.ell(6,8.6,1.4,0.8,'#f8f4e0'); p.ell(10,8.8,1.2,0.7,'#e8e8c0'); p.px(8,8.4,'#e0302c'); p.px(11.4,8.2,'#3a8a3c');
  },
  durianRice: p=>{
    icoPlate(p);
    p.ball(6,9.4,3.8,2.6,IC.rice,{dither:0.2});
    p.ball(10.4,8.8,3.2,2.4,rampOf('#fffac8','#fff080','#f0d850','#c8aa30','#8a7418'),{dither:0.1});
  },
  sangkhaya: p=>{
    const G=rampOf('#e8ffc8','#b8e888','#84c85a','#5a9a44','#3a6a30');
    p.poly([2,8, 11,4, 14,7, 14,12, 5,15, 2,12], '#c8a46a');
    p.poly([2,8, 11,4, 14,7, 5,11], G[1]); p.poly([2,8, 5,11, 5,15, 2,12], G[3]); p.poly([5,11,14,7,14,12,5,15], G[2]);
    p.line(2,8,11,4,G[0]); p.line(5,11,14,7,'#fff8d0');
  },
  ruamMit: p=>{
    /* ทับทิมกรอบ and friends in coconut milk, in a glass */
    const Gl=rampOf('#ffffff','#e8f4fa','#c8dcea','#98b0c4','#6e8498');
    p.poly([2,4, 14,4, 12,14, 4,14], '#fbf6ec');
    for(const [x,y,c] of [[5,7,'#e0304a'],[7,9,'#e0304a'],[10,7,'#3aa860'],[9,11,'#f0c040'],[6,11,'#e0304a'],[11,10,'#3aa860'],[8,6,'#f0f0f0']]) p.ell(x,y,1.1,1,c);
    p.line(2,4,4,14,Gl[3]); p.line(14,4,12,14,Gl[3]); p.line(3,4,4.6,13,Gl[0]);
    for(const [x,y] of [[4,3],[7,2],[10,2.4],[12,3]]) p.ell(x,y,1.6,1.1,'#ffffff');
  },
});

/* ---------------- things you make ---------------- */
Object.assign(ICON16, {
  garland: p=>{
    for(let i=0;i<18;i++){ const a=i/18*TAU, x=8+Math.cos(a)*5, y=6.4+Math.sin(a)*4.4;
      p.ball(x,y,1.3,1.3,IC.white,{spec:false,dither:0}); }
    p.ball(8,11,2,2,IC.red,{dither:0}); p.line(8,13,8,15.6,'#e8c040',2); p.line(6.4,13,5.4,15.6,'#f0f0e0'); p.line(9.6,13,10.6,15.6,'#f0f0e0');
  },
  krathong: p=>{
    const L=IC.leafD;
    p.ell(8,12,7,2.8,L[3]); p.ell(8,11.4,6.6,2.4,L[2]);
    for(let i=0;i<7;i++){ const x=2.6+i*1.8; p.tri(x-1,11, x+1,11, x,7.6+(i%2), i%2? L[1]:L[2]); }
    for(const [x,c] of [[5,'#f0a0c0'],[8,'#ffe070'],[11,'#f0a0c0']]) p.ball(x,9.6,1.6,1.4,ramp(c),{spec:false,dither:0});
    p.rect(8,3,1,5,'#f8f0d8'); p.ell(8.4,2,1,1.6,'#ffc040'); p.px(8,1.6,'#fffac0');
    p.line(5.4,9,4,2,'#c8603a'); p.line(10.6,9,12,2.4,'#c8603a');
  },
  basket: p=>{
    const W=rampOf('#fff0b8','#f0d088','#d8a860','#aa7c3c','#7a5424');
    p.poly([1,6, 15,6, 13,15, 3,15], W[2]);
    for(let y=7;y<15;y+=2) for(let x=2+(y%4?1:0);x<14;x+=2) p.px(x,y,W[3]);
    for(let y=8;y<15;y+=2) for(let x=3+(y%4?0:1);x<14;x+=2) p.px(x,y,W[1]);
    p.rect(0.6,5,14.8,2,W[1]); p.rect(0.6,6.4,14.8,0.8,W[3]);
    for(let a=Math.PI;a<=TAU;a+=0.06) p.px(8+Math.cos(a)*6.4, 5+Math.sin(a)*4.6, W[3]);
  },
  lantern: p=>{
    const Rr=rampOf('#ffd8a0','#ff9a50','#f06a30','#c0401e','#80261a');
    p.ball(8,8.6,5,6,Rr,{dither:0.08});
    for(const x of [5,8,11]) p.line(x,3,x+(x-8)*0.2,14.2,Rr[3]);
    p.ell(8,9,2.4,3,'#ffe8a0'); p.ell(8,9,1.2,1.8,'#fffae0');
    p.rect(6,1,4,1.6,'#6a4a2a'); p.rect(6,14.6,4,1.4,'#6a4a2a');
  },
  shrine: p=>{
    p.rect(7,9,2,7,'#e8dcc8'); p.rect(7,9,1,7,'#fffaf0');
    p.rect(3,6,10,4,'#f4e8c8'); p.rect(3,9,10,1,'#c8b890');
    p.poly([1.6,6.4, 14.4,6.4, 8,1], '#d8302c'); p.poly([1.6,6.4,8,1,8,6.4],'#f05a40');
    p.line(1.6,6.4,14.4,6.4,IC.gold[2]); p.px(8,0.6,IC.gold[1]); p.px(1,5.4,IC.gold[2]); p.px(15,5.4,IC.gold[2]);
    p.rect(7,7,2,2,IC.gold[2]);
  },
  parijata: p=>{
    const Rr=rampOf('#ffd0b8','#ff8a6a','#f0503a','#c0302a','#801c1c');
    for(let i=0;i<6;i++){ const a=i/6*TAU; p.ball(8+Math.cos(a)*3.8,8+Math.sin(a)*3.8,2.6,2.4,Rr,{spec:false,dither:0}); }
    p.ball(8,8,2.4,2.4,IC.gold,{dither:0});
    for(let i=0;i<6;i++){ const a=i/6*TAU+0.5; p.px(8+Math.cos(a)*5.6,8+Math.sin(a)*5.6,'#fff0c0'); }
  },
});

/* ---------------- bugs ---------------- */
Object.assign(ICON16, {
  firefly: p=>{
    p.ell(8,11.4,4.6,4.6,'rgba(220,255,140,0.35)');
    icoBeetle(p,{body:rampOf('#8a8a70','#5a5a4a','#3e3e36','#2a2a26','#1a1a18'),rx:2.8,ry:4.2,head:ramp('#e87838')});
    p.ball(8,12.4,2.6,2.2,rampOf('#ffffff','#f4ffc0','#d8ff70','#a8e040','#78b030'),{dither:0});
  },
  dragonfly: p=>{
    const Wg=rampOf('#ffffff','#e8f8ff','#c0e8f8','#88c0e0','#6098c0');
    for(const [y,s] of [[5,1],[8,0.8]]){ p.ell(3.4,y,3.4,1.2*s,Wg[2]); p.ell(12.6,y,3.4,1.2*s,Wg[2]); p.px(2,y,Wg[0]); p.px(14,y,Wg[0]); }
    p.line(8,3,8,15,'#2a70c8',2); p.line(8.5,4,8.5,15,'#5aa0f0',1);
    p.ball(8,2.6,2,1.8,rampOf('#c8ffe8','#6ae0b0','#30b080','#1e7a58','#12503a'),{dither:0});
    for(let y=7;y<15;y+=2) p.px(8,y,'#1a4a8a');
  },
  cicada: p=>{
    const Wg=rampOf('#ffffff','#f0f8f4','#d0e4dc','#98b4ac','#6e8c84');
    p.poly([8,4, 1.6,9, 2.6,14, 7,9], Wg[2]); p.poly([8,4, 14.4,9, 13.4,14, 9,9], Wg[2]);
    p.line(2,9,7,5,Wg[3]); p.line(14,9,9,5,Wg[3]);
    icoBeetle(p,{body:rampOf('#c8a878','#9a7a4a','#6e5432','#4e3a22','#322414'),rx:2.8,ry:4.6,split:false});
    p.px(5.6,3.6,'#e04030'); p.px(10.4,3.6,'#e04030');
  },
  beetle: p=>icoBeetle(p,{body:rampOf('#b89a88','#6e5448','#4a342c','#2e201c','#1c1210'),horn:'#3a2a24'}),
  stag:   p=>icoBeetle(p,{body:rampOf('#d0a078','#8a5a3a','#5e3a24','#3e2618','#28180e'),jaws:'#6a4028',rx:3.8,ry:4.4}),
  ladybug:p=>icoBeetle(p,{body:IC.red,head:rampOf('#8a8a90','#4a4a50','#2a2a30','#1a1a20','#101014'),spots:[[-2,-1],[2,-1],[-2.4,2.4],[2,2.4],[0,4.4]],rx:4.6,ry:4.6}),
  jewel:  p=>icoBeetle(p,{body:rampOf('#e0ffd0','#60e0a0','#20a878','#1a7a64','#10504a'),head:rampOf('#ffe0f8','#e080d0','#a04aa8','#6a2a7a','#401a50'),rx:3.4,ry:5.2}),
  waterbug: p=>icoBeetle(p,{body:rampOf('#e0c8a0','#a88860','#7a603e','#54402a','#382a1c'),rx:4.8,ry:5.6,hrx:2.2}),
  cricket: p=>{
    p.line(4,11,1.4,14.6,'#3a2a20'); p.line(12,11,14.6,14.6,'#3a2a20'); p.line(5,8,1,5,'#3a2a20'); p.line(11,8,15,5,'#3a2a20');
    p.ball(8,9.6,3.2,5,rampOf('#b89070','#7a5a3e','#54402c','#3a2c1e','#241a12'),{dither:0.05});
    p.ball(8,4,2.4,2,rampOf('#9a7a5a','#5a4430','#3a2c20','#2a2018','#1a1410'),{spec:false});
    p.line(7,2.4,3,0.4,'#3a2a20'); p.line(9,2.4,13,0.4,'#3a2a20');
  },
  grasshopper: p=>{
    const G=rampOf('#e8ffa8','#a8e060','#70b83c','#4e8a30','#305c22');
    p.line(4,9,1,15,G[3]); p.line(12,9,15,15,G[3]); p.line(4,9,6,4,G[3],2); p.line(12,9,10,4,G[3],2);
    p.ball(8,9.4,2.8,5.8,G,{dither:0.05});
    p.ball(8,3.4,2.2,2,G,{spec:false}); p.px(7,3,'#1a1a18'); p.px(9,3,'#1a1a18');
    p.line(7,2,4,0,G[3]); p.line(9,2,12,0,G[3]);
  },
  mantis: p=>{
    const G=rampOf('#f0ffc0','#b8e878','#80c050','#58963a','#3a6a28');
    p.line(8,6,8,15,G[2],2); p.line(8.6,7,8.6,15,G[1]);
    p.line(8,7,4,4,G[3],2); p.line(4,4,5,8,G[2]); p.line(8,7,12,4,G[3],2); p.line(12,4,11,8,G[2]);
    p.line(8,11,4,15,G[3]); p.line(8,11,12,15,G[3]);
    p.tri(5.6,2.4,10.4,2.4,8,5.6,G[2]); p.px(6,2.6,'#1a1a18'); p.px(10,2.6,'#1a1a18');
  },
  butterfly: p=>icoWings(p,{fore:rampOf('#ffe0a0','#ffb040','#f0801e','#b85418','#7a3410'),edge:'#2a1c18',spots:[[4.6,-3.4],[5.4,-1.2]]}),
  atlas:     p=>icoWings(p,{fore:rampOf('#f8c8a0','#d8845a','#a8503a','#7a3428','#50201c'),hind:rampOf('#f0b890','#c0703c','#94482c','#6a2e20','#441c16'),edge:'#f0e0c0',spots:[[3.6,-2.6,'#fff8f0'],[2.6,3,'#fff8f0']]}),
  birdwing:  p=>icoWings(p,{fore:rampOf('#8a8a90','#3a3a40','#222228','#16161c','#0c0c10'),hind:rampOf('#fff8b0','#ffe060','#f0c030','#b88a1e','#7a5a12'),edge:'#1a1a20'}),
  goldwing:  p=>icoWings(p,{fore:IC.gold,edge:'#8a5a14',spots:[[4.4,-3,'#fffae0']]}),
  starmoth:  p=>icoWings(p,{fore:rampOf('#a0b0f0','#5a68c8','#3a3e98','#262a6a','#181a44'),edge:'#c0c8ff',spots:[[4.4,-3.2,'#fffac0'],[2.4,-1,'#fffac0'],[3,3.4,'#fffac0']]}),
});

/* ---------------- fish ---------------- */
Object.assign(ICON16, {
  tilapia:  p=>icoFish(p,{body:rampOf('#f0f4f4','#c0ccd0','#8e9ca4','#62707a','#424c56'),stripes:[-2,0,2],stripeC:'#6a7880',belly:'#d8e0e0'}),
  perch:    p=>icoFish(p,{body:rampOf('#e8ecc0','#b0b87a','#7e8a50','#586238','#3a4226'),spots:[[-1,-1],[2,0]],spotC:'#3a4226'}),
  barb:     p=>icoFish(p,{body:rampOf('#ffffff','#e8ecf0','#c4ccd6','#949eac','#6a7482'),fin:'#f07a30',finL:'#ffb060',belly:'#fafcff'}),
  betta:    p=>{ const Rr=rampOf('#ffc0d0','#ff5a78','#d82a50','#a01a3c','#6a1028');
    p.poly([4,8, 0,2, 1,8, 0,15], Rr[3]); p.poly([4,8, 1,4, 1.6,8],Rr[1]);
    p.poly([6,6, 9,1.6, 11,6], Rr[3]); p.poly([6,11, 9,15.4, 11,11], Rr[3]);
    icoFish(p,{body:Rr,len:4.6,ht:2.8,cx:9,fin:Rr[3]}); },
  snakehead:p=>icoFish(p,{body:rampOf('#c8c0a0','#8a8468','#5e5a46','#403e30','#2a2820'),len:7,ht:2.6,spots:[[-4,0],[-1,1],[2,-1],[-2,-1]],spotC:'#2a2820'}),
  catfish:  p=>icoFish(p,{body:rampOf('#d8c8b0','#a08c70','#76644e','#544636','#3a2e24'),len:6.6,ht:2.8,whisk:'#3a2e24',belly:'#c8b8a0'}),
  gourami:  p=>icoFish(p,{body:rampOf('#e0e0b0','#a8a870','#7a7c4c','#565a34','#3a3e24'),stripes:[-3,-1,1,3],stripeC:'#4a4e2a'}),
  eel:      p=>{ const E=rampOf('#e8d8a8','#b89a64','#8a6c40','#624c2c','#40321e');
    p.tube([[1,11],[4,8],[7,11],[10,8],[13,7],[15,5]],3,E); p.px(14,5,'#141018'); p.px(13.6,4.4,'#fffdf2'); },
  shrimp:   p=>{ const S=rampOf('#fff0e8','#ffb8a0','#f08870','#c05a48','#8a3a30');
    for(let i=0;i<5;i++){ const a=Math.PI*0.2+i*0.42; p.ball(8+Math.cos(a)*4,8+Math.sin(a)*4,2.2,2,S,{spec:i===4,dither:0}); }
    p.poly([4,4, 1,2, 2,6], S[3]); p.line(11,5,15,1,S[3]); p.line(11,6,15,3,S[3]); p.px(11,5,'#141018'); },
  prawn:    p=>{ const S=rampOf('#e8f0ff','#9ab0e0','#6a80c0','#4a5a94','#303c66');
    p.tube([[2,12],[5,10],[9,9],[12,7]],4,S); p.poly([2,12, 0,9, 0,15],S[3]);
    p.line(12,7,15,2,'#3050c8',2); p.line(11,8,14,11,'#3050c8',2); p.px(14.6,1.4,'#6a90ff');
    p.line(13,6,16,4,S[3]); p.px(12,6,'#141018'); },
  pla_buk:  p=>icoFish(p,{body:rampOf('#f0f0f4','#b8bcc8','#8a8ea0','#62667a','#42465a'),len:7,ht:3.6,cy:8.6,belly:'#e0e0e8'}),
  goldfish: p=>icoFish(p,{body:rampOf('#fff4b0','#ffc040','#f08a1e','#c05a14','#80380e'),len:5,ht:3.6,cx:8.6,fin:'#ffd060',finL:'#fff0a0'}),
  lotusfish:p=>icoFish(p,{body:rampOf('#ffffff','#fff0f4','#f8c8d8','#d890a8','#a86078'),fin:'#f07aa0',spots:[[-1,-1],[1.6,0],[-3,0.6]],spotC:'#f05a80'}),
});

/* ---------------- things in the ground ---------------- */
Object.assign(ICON16, {
  bone: p=>{ const B=rampOf('#ffffff','#fbf6e8','#e8dcc0','#c0ae8c','#94825e');
    p.line(4,12,12,4,B[2],3); p.line(4,11,11.4,3.6,B[1],1);
    for(const [x,y] of [[2.6,12],[4,14],[12,2],[14,4]]) p.ball(x,y,1.9,1.9,B,{spec:false,dither:0}); },
  shellf: p=>{ const S=rampOf('#f0e8d8','#d0c4a8','#a89a7c','#7e7058','#5a4e3c');
    p.ball(8,8.6,6,5.8,S,{dither:0.1});
    for(let a=0;a<TAU*2.2;a+=0.1){ const r=a*0.4; p.px(8+Math.cos(a)*r,8.6+Math.sin(a)*r,S[3]); } },
  coin: p=>{ p.ball(8,8,6,6,IC.gold,{dither:0.05}); p.ell(8,8,4.2,4.2,IC.gold[3]); p.ell(8,8,3.6,3.6,IC.gold[2]);
    p.rect(7,7,2,2,'#3a2a14'); p.px(5,5,'#fffae0'); p.px(6,4,'#fffae0'); },
  amulet: p=>{ p.ell(8,8.6,5.4,7,IC.gold[3]); p.ell(8,8.6,4.4,6,'#6a4a3a');
    p.ball(8,9,3.4,4.8,rampOf('#e8d0a8','#c0a070','#9a7a4a','#6e5432','#4a3820'),{spec:false});
    p.ball(8,6.4,1.2,1.2,rampOf('#f8e8c0','#d8c090','#b09868','#806c48','#5a4c34'),{spec:false,dither:0}); p.rect(7,8,2,4,'#8a6a42');
    p.rect(7,0.6,2,1.6,IC.gold[2]); },
  banchiang: p=>{ const C=rampOf('#ffd8b0','#f0b080','#d8905a','#a8663c','#784226');
    p.ball(8,10,6,5,C,{bounce:true}); p.rect(5,3,6,3,C[2]); p.rect(4,2,8,1.6,C[1]);
    for(let a=0;a<TAU;a+=0.12){ p.px(5+Math.cos(a)*2,10+Math.sin(a)*2,'#9a2a1c'); p.px(11+Math.cos(a+1)*2,10+Math.sin(a+1)*2,'#9a2a1c'); } },
  figurine: p=>{ /* the clay elephant with one ear missing */
    const C=rampOf('#f4c8a0','#d89a6a','#b8784a','#8a5434','#5e3822');
    p.ball(8,9,5,3.6,C,{dither:0.05}); p.ball(12.4,7,2.6,2.6,C,{spec:false});
    p.line(14,8,14.6,12,C[2],2); for(const x of [5,7,10,11.6]) p.rect(x,11.4,1.6,3.4,C[3]);
    p.px(13,6,'#2a1a14'); p.line(3,8,2,11,C[3]); },
  clam: p=>{ const S=rampOf('#f0f0f4','#c8ccd8','#a0a4b4','#747888','#50546a');
    p.ball(8,9,6.4,5,S,{dither:0.06});
    for(let i=-3;i<=3;i++) p.line(8,13.6,8+i*1.8,4.6,S[3]); p.rect(6,13,4,2,S[3]); },
  crystal: p=>{
    const C=rampOf('#ffffff','#e0f0ff','#a8d0f8','#7aa0e0','#5070b8');
    p.poly([8,0.6, 11,5, 10,15, 6,15, 5,5], C[2]); p.poly([8,0.6, 5,5, 6,15, 8,15], C[1]); p.line(8,1,8,14,C[0]);
    p.poly([3,6, 5,9, 4.6,15, 2,15, 1.6,9], C[3]); p.poly([13,7, 14.6,10, 14,15, 11.6,15, 11.4,10], C[3]);
    p.px(7,3,'#ffffff'); },
  bottle: p=>{ const G=rampOf('#e8fff0','#a8e0c0','#6aa888','#4a7a64','#305444');
    p.ball(8,11,4.6,4.6,G,{dither:0.05}); p.rect(6.4,2,3.2,6,G[2]); p.rect(6.4,2,1,6,G[1]); p.rect(6,1,4,1.6,'#8a6a42');
    p.line(5.4,9,5.6,13,G[0]); },
});

/* ---------------- the tools ---------------- */
var TOOL16 = {
  hand: p=>{ const S=rampOf('#fff4e0','#f8dcb8','#e8c090','#c0946a','#8a6a4a');
    p.ball(8,10.4,4.4,4,S,{spec:false,dither:0});
    for(let k=0;k<4;k++){ const x=4.6+k*2.3; p.line(x,9,x+(k-1.5)*0.3,3.4+Math.abs(k-1.5)*0.7,S[2],2); p.px(x,3.4+Math.abs(k-1.5)*0.7,S[1]); }
    p.line(4,11,1.4,8,S[2],2); p.line(9,10,9,13,S[3]); },
  net: p=>{ p.line(1,15,8,8,IC.wood[3],2); p.line(1.4,14.4,7.6,8.2,IC.wood[1]);
    for(let a=0;a<TAU;a+=0.05) p.px(10.4+Math.cos(a)*4.6,5.6+Math.sin(a)*4.6,'#8a8a94');
    for(let y=2;y<10;y+=2) for(let x=7;x<15;x+=2){ const dx=x-10.4, dy=y-5.6; if(dx*dx+dy*dy<18) p.px(x,y,'#f0f0f4'); } },
  rod: p=>{ const B=rampOf('#fff0b0','#e8d080','#c8a858','#9a7c3c','#6a5428');
    p.line(1,15,14,1,B[3],2); p.line(1.4,14.4,13.6,1.4,B[1]);
    for(const t of [0.3,0.55,0.8]) p.px(1+13*t,15-14*t,B[4]);
    p.line(14,1,14.4,11,'#f4f4f4'); p.ball(14,12,1.6,1.8,IC.red,{dither:0}); p.px(14,10.4,'#ffffff'); },
  shovel: p=>{ const M=rampOf('#ffffff','#dfe6ee','#b0bcc8','#7e8a98','#56606e');
    p.line(3,1,8,8,IC.wood[3],2); p.line(3.4,1,8,7.4,IC.wood[1]); p.rect(1.6,0.4,4,1.4,IC.wood[2]);
    p.poly([6,8, 11,5, 15,10, 12,15, 7,12], M[2]); p.poly([6,8,11,5,12,7,8,10], M[1]); p.line(7,12,12,15,M[3]); p.px(9,8,M[0]); },
  axe: p=>{ const M=rampOf('#ffffff','#dfe6ee','#b0bcc8','#7e8a98','#56606e');
    p.line(3,15,10,3,IC.wood[3],2); p.line(3.4,14.4,10,3.6,IC.wood[1]);
    p.poly([8,2, 14,0.6, 15,6, 11,6.4, 9,5], M[2]); p.poly([8,2,14,0.6,14.4,2.4,9,3.4], M[1]); p.line(15,1,15.4,5.6,M[0]); },
  can: p=>{ const B=rampOf('#c0f0ff','#70c8f0','#3a98d0','#2a6ea0','#1c4a74');
    p.ball(7,10,5,4.6,B,{dither:0.05});
    p.line(11,9,15,4,B[3],2); p.line(11,8.4,14.6,4,B[1]); p.rect(14,2.6,2,2,B[2]);
    for(let a=Math.PI;a<=TAU;a+=0.06) p.px(7+Math.cos(a)*3.6, 5.6+Math.sin(a)*3.4, B[3]);
    p.ell(7,5.6,3,0.8,B[4]); },
};
function toolSprite(t){
  const key='tool:'+t; let c=ICO.cache.get(key); if(c!==undefined) return c;
  const f=TOOL16[t]; if(!f){ ICO.cache.set(key,null); return null; }
  c=mkCv(ICO.S+ICO.P*2, ICO.S+ICO.P*2); const g=c.getContext('2d',{willReadFrequently:true}); g.imageSmoothingEnabled=false;
  f(icoPainter(g)); icoOutline(c); ICO.cache.set(key,c); return c;
}
function toolSpriteDraw(g, t, x, y, s){
  const c=toolSprite(t); if(!c) return false;
  const k=Math.max(1, Math.round(s*0.8)), w=c.width*k, h=c.height*k;
  const sm=g.imageSmoothingEnabled; g.imageSmoothingEnabled=false;
  g.drawImage(c, R(x-w/2), R(y-h/2), w, h); g.imageSmoothingEnabled=sm; return true;
}
