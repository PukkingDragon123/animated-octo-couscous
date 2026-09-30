/* ============================================================
   THE MAP, PAINTED

   The map was three strips of coloured country cut off square at
   both ends, with the road running off the right of one and back
   on at the left of the next — a diagram, and a cropped one.

   It is one picture now. The road snakes: west to east along the
   top, round a bend at the right-hand edge, back east to west
   across the middle, round again at the left, and east to the end
   of the world along the bottom. The land it runs through is
   painted the whole height of the page, one country flowing into
   the next with no seams in it — paddies laid out in their dikes,
   stilt houses under palms, the wat with its chedi, the forest
   thickening into the deep country, the shophouses of the town,
   the river with the long bridge over it, the lotus lake, the
   limestone hills and the red prangs of the ruins — and where you
   have never walked, mist lying on it.

   The painting is kept and done again only when there is more of
   the road you have seen. The pins, the names and you are drawn
   over it every frame.
   ============================================================ */
const PMAP = { key:'', cv:null, geo:null };
const PM_INK = '#4a3424';
/* what each zone is painted with: ground, a second ground to mottle it with */
const PM_ZONE = {
  charnel:{g:'#b8b4a0', g2:'#a6a290', k:'grave'},
  roadside:{g:'#b8c888', g2:'#a4b87a', k:'meadow'},
  paddy:{g:'#9cc48a', g2:'#86b47c', k:'paddy'},
  villageW:{g:'#c8c090', g2:'#b4b07e', k:'village'},
  centre:{g:'#c8c090', g2:'#b4b07e', k:'village'},
  grove:{g:'#a8c47e', g2:'#94b470', k:'grove'},
  wat:{g:'#d0c498', g2:'#bcb286', k:'wat'},
  forest:{g:'#8cb07a', g2:'#7aa06c', k:'forest'},
  deep:{g:'#78a06c', g2:'#66905e', k:'deep'},
  cross:{g:'#c4bc98', g2:'#b0aa88', k:'cross'},
  town:{g:'#c8c0b0', g2:'#b6aea0', k:'town'},
  far:{g:'#a0c890', g2:'#8cb880', k:'paddy'},
  river:{g:'#8cbcd0', g2:'#7aaec4', k:'river'},
  bank:{g:'#b4c888', g2:'#a0b87a', k:'bank'},
  lake:{g:'#9cc8bc', g2:'#88b8ac', k:'lake'},
  hill:{g:'#b8b89a', g2:'#a4a488', k:'karst'},
  ruins:{g:'#ccbc94', g2:'#baaa84', k:'ruins'},
};
function pmGeo(x0,y0,w,h){
  const top=y0+24, bot=y0+h-20, rows=MAP_ROWS, rowH=(bot-top)/rows;
  const mx=x0+22, mw=w-44, seg=WORLD_W/rows;
  const G={x0,y0,w,h,top,bot,rowH,mx,mw,seg,rows,ry:[]};
  for(let r=0;r<rows;r++) G.ry.push(top+rowH*(r+0.5));
  G.row = wx => Math.min(rows-1, Math.floor(wx/seg));
  G.X = wx => { const r=G.row(wx), u=(wx-r*seg)/seg; return mx + mw*(r%2? 1-u : u); };
  G.bend = wx => Math.sin(wx*0.0016)*2.2 + Math.sin(wx*0.00052+1.1)*1.6;
  G.Y = wx => G.ry[G.row(wx)] + G.bend(wx);
  /* which world x a map column is, on a given row */
  G.W = (px,r) => { const u=(px-mx)/mw; return r*seg + seg*(r%2? 1-u : u); };
  return G;
}
/* smooth value noise, for ground that is mottled rather than striped */
function pmHash(i,j){ const h=Math.sin(i*127.1+j*311.7)*43758.5453; return h-Math.floor(h); }
function pmNoise(x,y,s){
  const X=x/s, Y=y/s, i=Math.floor(X), j=Math.floor(Y), fx=X-i, fy=Y-j;
  const u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy);
  const a=pmHash(i,j), b=pmHash(i+1,j), c=pmHash(i,j+1), d=pmHash(i+1,j+1);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function pmSeenKey(){
  let s=''; const n=Math.ceil(WORLD_W/MAPSTEP);
  for(let i=0;i<n;i++) s+=(GS.seenX&&GS.seenX[i])? '1':'0';
  return s+'|'+LANG;
}

/* ---------- the little painted things ---------- */
function pmTree(g,x,y,r,dark){
  const C=dark? ['#2e5a34','#3e7442','#56904e','#7aac62'] : ['#3e6e3a','#528a46','#6ea656','#94c46e'];
  pEll(g,x+1.4,y+r*0.9,r*0.95,r*0.38,'rgba(60,50,30,0.30)');
  pR(g,R(x),R(y),1,R(r*0.8)+1,'#6a4a2c');
  pEll(g,x,y-r*0.3,r,r*0.86,C[0]); pEll(g,x-0.4,y-r*0.45,r*0.84,r*0.7,C[1]);
  pEll(g,x-r*0.3,y-r*0.66,r*0.46,r*0.38,C[2]); pR(g,R(x-r*0.45),R(y-r*0.8),1,1,C[3]);
}
function pmPalm(g,x,y){
  pEll(g,x+2,y+1,2.4,0.8,'rgba(60,50,30,0.28)');
  pTaper(g,x,y+1,x+1,y-6,1.4,1,'#8a6a44');
  for(const [dx,dy] of [[-3.4,-4.4],[3.6,-4.8],[-2.6,-7.6],[2.8,-7.8],[0,-8.6]]) pTaper(g,x+1,y-6,x+1+dx,y-6+dy*0.5+2,1.4,0.6,dy<-7?'#6aa44e':'#4a8a40');
}
function pmBanana(g,x,y){
  pTaper(g,x,y+1,x,y-4,1.6,1.2,'#7a9a4c');
  for(const s of [-1,1]) pTaper(g,x,y-4,x+s*4,y-2.6,2.2,1,s<0?'#5a9a48':'#72b056');
  pTaper(g,x,y-4,x+0.6,y-8,2,0.8,'#82bc5e');
}
function pmHouse(g,x,y,roof){
  pR(g,x-3,y+2,9,1,'rgba(60,50,30,0.30)');
  pR(g,x-3,y-1,1,3,'#5a3e28'); pR(g,x+3,y-1,1,3,'#5a3e28');
  pR(g,x-3,y-4,7,3,'#b48a58'); pR(g,x-3,y-4,7,1,'#d0a870'); pR(g,x+1,y-3,1,1,'#3a2a1c');
  pTri(g,x+0.5,y-8,x-4.5,y-4,x+5.5,y-4,roof||'#a8483a'); pTri(g,x+0.5,y-8,x-4.5,y-4,x+0.5,y-4,shade(roof||'#a8483a',0.18));
}
function pmChedi(g,x,y,s,col){
  s=s||1; const C=col||'#e8c050';
  pEll(g,x+2*s,y+1,4*s,1.2,'rgba(60,50,30,0.30)');
  pR(g,R(x-4*s),R(y-1*s),R(8*s),R(1*s)+1,shade(C,-0.25));
  pEll(g,x,y-3*s,3*s,2.6*s,C); pEll(g,x-1*s,y-3.6*s,1.4*s,1.2*s,shade(C,0.3));
  pTaper(g,x,y-5*s,x,y-11*s,2.4*s,0.6,C); pR(g,R(x),R(y-12*s),1,1,shade(C,0.4));
}
function pmWat(g,x,y){
  pR(g,x-8,y+1,18,1,'rgba(60,50,30,0.30)');
  pR(g,x-7,y-4,14,5,'#f0e8d8'); pR(g,x-7,y-4,14,1,'#ffffff'); pR(g,x-1,y-2,2,3,'#6a4a2c');
  pTri(g,x,y-11,x-9,y-4,x+9,y-4,'#d0602e'); pTri(g,x,y-11,x-9,y-4,x,y-4,'#e8844a');
  pTri(g,x,y-14,x-5,y-9,x+5,y-9,'#3a8a5a');
  pR(g,x-9,y-5,1,2,'#f2c94c'); pR(g,x+9,y-5,1,2,'#f2c94c'); pR(g,x,y-15,1,2,'#f2c94c');
}
function pmShop(g,x,y,h,c){
  pR(g,x+1,y+1,8,1,'rgba(60,50,30,0.3)');
  pR(g,x,y-h,7,h,c); pR(g,x+5,y-h,2,h,shade(c,-0.2)); pR(g,x,y-h,7,1,shade(c,0.3));
  for(let yy=y-h+2; yy<y-1; yy+=3) pR(g,x+1,yy,3,1,'#5a6070');
}
function pmKarst(g,x,y,h){
  pEll(g,x+3,y+1,5,1.2,'rgba(60,50,30,0.3)');
  pPoly(g,[x-4,y, x+5,y, x+4,y-h+2, x+1,y-h, x-3,y-h+3],'#a8a494');
  pPoly(g,[x+1,y, x+5,y, x+4,y-h+2, x+1,y-h],'#888474');
  pEll(g,x,y-h+1.4,3.2,1.8,'#5a9a52'); pEll(g,x-1,y-h+1,1.4,0.8,'#82bc6a');
  pR(g,R(x-1),R(y-h*0.5),1,3,'#6a6658');
}
function pmPrang(g,x,y){
  pR(g,x-3,y+1,8,1,'rgba(60,50,30,0.3)');
  for(let i=0;i<5;i++) pR(g,R(x-3+i*0.6),R(y-2-i*2),R(7-i*1.2),2, i%2? '#b86a44':'#9a5234');
  pR(g,R(x),R(y-13),1,2,'#9a5234');
}
function pmStupa(g,x,y){ pR(g,x-2,y-1,5,2,'#8a867a'); pTri(g,x+0.5,y-6,x-2,y-1,x+3,y-1,'#a4a090'); pR(g,x+2,y+1,4,1,'rgba(60,50,30,0.25)'); }

/* ---------- the painting ---------- */
function pmPaint(G){
  const {x0,y0,w,h}=G;
  const c=mkCv(w,h), r=mulberry(4040); let g=G2(c);
  const ox=-x0, oy=-y0;
  g.translate(ox,oy);
  /* the paper, with age in it */
  pR(g,x0,y0,w,h,'#ecdcb4');
  for(let i=0;i<w*h/9;i++){ const px=x0+R(r()*w), py=y0+R(r()*h); pR(g,px,py,1,1, r()<0.5? '#e2d0a4':'#f4e8c8'); }
  for(let i=0;i<14;i++){ pEll(g,x0+r()*w,y0+r()*h,20+r()*40,10+r()*20,'rgba(200,170,110,0.06)'); }
  /* the land, a column at a time, the whole height of each row */
  const BAND=G.rowH;
  for(let row=0; row<G.rows; row++){
    const t0=R(G.top+row*BAND), t1=R(G.top+(row+1)*BAND);
    for(let px=R(G.mx); px<R(G.mx+G.mw); px++){
      const wx=G.W(px+0.5,row);
      const known = seenAt(wx);
      const z=zoneAt(wx), Z=PM_ZONE[z.id]||PM_ZONE.roadside;
      /* soften the seam into the next zone with a dither */
      let zb=Z;
      for(const d of [-90,90]){ const z2=zoneAt(wx+d); if(z2.id!==z.id && r()<0.35) zb=PM_ZONE[z2.id]||Z; }
      for(let py=t0; py<t1; py++){
        let col;
        if(!known) col = ((px+py)%3===0)? '#ddd0ae' : '#e4d8b8';
        else {
          const v=(py-t0)/(t1-t0);
          const n=pmNoise(px,py,7)*0.65+pmNoise(px+50,py,3)*0.35 + (ICO_BAYER[(py&3)*4+(px&3)]/16-0.5)*0.18;
          col = n>0.64? shade(zb.g,0.08) : n>0.42? zb.g : zb.g2;
          if(v<0.1) col=mix(col,'#dfe4d0',0.25*(1-v/0.1));      // the far edge of each row lies in a haze
          if(v>0.88) col=shade(col,-0.10);
          /* the lie of the land, lit from the top left like everything else */
          const rel=(pmNoise(px-1,py-1,9)-pmNoise(px+1,py+1,9))*2.2;
          col=shade(col, clamp(rel,-0.13,0.13));
        }
        g.fillStyle=col; g.fillRect(px,py,1,1);
      }
    }
    /* a line of far hills along the top of the row, blue with distance */
    for(let px=R(G.mx); px<R(G.mx+G.mw); px++){ if(!seenAt(G.W(px+0.5,row))) continue;
      const hh=3+R(pmNoise(px,row*40,11)*6); for(let k=0;k<hh;k++){ g.fillStyle=k===hh-1? '#aebca8':'#b8c4b0'; g.fillRect(px,t0+1+(6-hh)+k+2,1,1); } }
    /* the rows meet in a soft fold, not a cut */
    g.globalAlpha=0.35; pR(g,R(G.mx),t1-1,R(G.mw),1,'#8a7450'); g.globalAlpha=0.18; pR(g,R(G.mx),t1,R(G.mw),1,'#fff4d8'); g.globalAlpha=1;
  }
  /* what stands on it goes on a layer of its own, so it can be inked and
     lit the way the icons are before it is laid onto the ground */
  const gMain=g, fcv=mkCv(w,h); g=G2(fcv); g.translate(ox,oy);
  /* what stands on it, zone by zone, where you have been */
  const road=(px,py,row)=> Math.abs(py-G.Y(G.W(px,row)))<4.5;
  for(let row=0; row<G.rows; row++){
    const t0=G.top+row*BAND, t1=G.top+(row+1)*BAND;
    const items=[];
    for(let px=G.mx+3; px<G.mx+G.mw-3; px+=1){
      const wx=G.W(px,row); if(!seenAt(wx)) continue;
      const Z=PM_ZONE[zoneAt(wx).id]||PM_ZONE.roadside, k=Z.k;
      const put=(fn,py,n)=>{ if(py>t0+3 && py<t1-2 && !road(px,py,row)) items.push({py,fn}); };
      const rr=r();
      if(k==='paddy'){
        if(px%7===0) for(let py=t0+4;py<t1-2;py+=5) if(!road(px,py,row)){ const y2=py;
          items.push({py:y2-100, fn:()=>{ const G2m=gMain; pR(G2m,px,y2,6,4,'#7cb86e'); pR(G2m,px,y2,6,1,'#a8d890'); pR(G2m,px,y2+3,6,1,'#5e9a58');
            for(let i=0;i<3;i++) pR(G2m,px+1+i*2,y2+1,1,2,'#4e8a48'); }}); }
      } else if(k==='forest' || k==='deep'){
        if(rr<(k==='deep'?0.34:0.24)) put(()=>pmTree(g,px,items._y,2.4+r()*1.8,k==='deep'), t0+4+r()*(BAND-8));
      } else if(k==='grove'){
        if(rr<0.18) put(()=>pmBanana(g,px,items._y), t0+8+r()*(BAND-12));
      } else if(k==='village'){
        if(rr<0.11) put(()=>pmHouse(g,px,items._y,r()<0.5?'#a8483a':'#8a5a3a'), t0+12+r()*(BAND-16));
        else if(rr<0.18) put(()=>pmPalm(g,px,items._y), t0+10+r()*(BAND-14));
      } else if(k==='wat'){
        if(rr<0.06) put(()=>pmTree(g,px,items._y,2.6,false), t0+6+r()*(BAND-10));
        else if(rr<0.08) put(()=>pmChedi(g,px,items._y,0.6,'#f0e8d8'), t0+10+r()*(BAND-14));
      } else if(k==='town'){
        if(px%9===0){ for(const yy of [t0+14, t1-4]) put(()=>pmShop(g,px,items._y,5+R(r()*6),r()<0.5?'#c8c4bc':'#b8b0a4'), yy); }
      } else if(k==='river'){
        if(rr<0.5){ const yy=t0+2+r()*(BAND-4); items.push({py:yy, fn:()=>{ pR(gMain,px,R(yy),2+R(r()*3),1,'rgba(255,255,255,0.55)'); }}); }
      } else if(k==='lake'){
        if(rr<0.12) put(()=>{ pEll(g,px,items._y,2,1,'#4e9a5a'); if(r()<0.4) pR(g,px,R(items._y)-2,1,1,'#f08ab0'); }, t0+4+r()*(BAND-6));
      } else if(k==='karst'){
        if(rr<0.13) put(()=>pmKarst(g,px,items._y,8+R(r()*12)), t0+16+r()*(BAND-20));
        else if(rr<0.12) put(()=>pmTree(g,px,items._y,2,true), t0+6+r()*(BAND-8));
      } else if(k==='ruins'){
        if(wx>EAST.edge){ if(px%3===0) items.push({py:t0-50, fn:()=>{ for(let yy=t0+2; yy<t1-1; yy+=3) pR(gMain,px,R(yy),3,1,'rgba(150,180,110,0.5)'); }}); }
        else if(rr<0.05) put(()=>pmPrang(g,px,items._y), t0+14+r()*(BAND-18));
        else if(rr<0.12) put(()=>pmTree(g,px,items._y,2.2,false), t0+6+r()*(BAND-8));
      } else if(k==='grave'){
        if(rr<0.05) put(()=>pmStupa(g,px,items._y), t0+8+r()*(BAND-12));
      } else if(k==='cross'){
        if(Math.abs(wx-CROSS_X)<14) items.push({py:t0-60, fn:()=>{ pR(gMain,px-1,t0+2,4,BAND-4,'#d8c8a0'); pR(gMain,px-1,t0+2,1,BAND-4,'#b8a47a'); }});
        else if(rr<0.05) put(()=>pmTree(g,px,items._y,2,false), t0+6+r()*(BAND-10));
      } else {
        if(rr<0.05) put(()=>pmTree(g,px,items._y,2.2,false), t0+6+r()*(BAND-10));
        else if(rr<0.1) put(()=>{ pR(g,px,R(items._y),1,1,r()<0.5?'#f0e060':'#f08ab0'); }, t0+6+r()*(BAND-8));
      }
      /* grass in everything that grows, stones in what does not */
      if(k!=='river' && k!=='lake' && k!=='town' && r()<0.22){ const yy=t0+8+r()*(BAND-10);
        if(!road(px,yy,row)) items.push({py:yy, fn: (k==='karst'||k==='grave'||k==='ruins')
          ? ()=>{ pR(g,px,R(yy),2,1,'#9a9484'); pR(g,px,R(yy)-1,1,1,'#c8c2b0'); }
          : ()=>{ pR(g,px,R(yy)-1,1,2,'#5e8e44'); pR(g,px+1,R(yy),1,1,'#7aaa56'); }}); }
    }
    /* back to front, so the ones lower on the page stand in front */
    items.sort((a,b)=>a.py-b.py);
    for(const it of items){ items._y=it.py; it.fn(); }
    /* the big landmarks, painted bigger */
    if(seenAt(SALA_X) && G.row(SALA_X)===row){ const x=G.X(SALA_X); pmWat(g,x-14,G.Y(SALA_X)-6); pmChedi(g,x+14,G.Y(SALA_X)-6,1.1); }
    for(const [wx2,s2] of [[112,0.8],[GRAVE_X,0.7]]) if(seenAt(wx2) && G.row(wx2)===row) pmChedi(g,G.X(wx2)+8,G.Y(wx2)-7,s2,'#b8b4a4');
  }
  g=gMain;
  { const sh=artShadeCanvas(fcv,{grain:0.04}); g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(sh,-1,-1); g.restore(); }
  /* mist over what you have not walked */
  for(let row=0; row<G.rows; row++){
    const t0=G.top+row*BAND;
    for(let px=G.mx; px<G.mx+G.mw; px+=6){
      if(seenAt(G.W(px,row))) continue;
      for(let k=0;k<2;k++){ const fy=t0+4+r()*(BAND-8);
        g.globalAlpha=0.55; pEll(g,px,fy,6+r()*5,2.6,'#f4ecd6'); g.globalAlpha=0.4; pEll(g,px+2,fy-1.4,4,1.6,'#fffaf0'); g.globalAlpha=1; }
    }
  }
  /* the road */
  const step=G.seg/G.mw/2;
  for(let wx=0; wx<Math.min(WORLD_W,EAST.edge+60); wx+=step){
    const px=G.X(wx), py=G.Y(wx), seen=seenAt(wx);
    if(seen){ pR(g,R(px)-1,R(py)-2,3,5,'#8a6a44'); pR(g,R(px)-1,R(py)-1,3,3,'#e0c894'); pR(g,R(px),R(py)-1,1,1,'#f4e2b4'); }
    else if((R(px)+R(py))%4===0) pR(g,R(px),R(py),1,1,'rgba(120,98,66,0.55)');
  }
  /* the river crosses under the long bridge: planks over the water */
  if(seenAt(EAST.river0)) for(let wx=EAST.river0; wx<EAST.river1; wx+=step*4){ const px=G.X(wx), py=G.Y(wx);
    pR(g,R(px),R(py)-2,1,5,'#6a4a2c'); }
  /* the bends: round the end of one row and into the next */
  for(let row=0; row+1<G.rows; row++){
    const right = row%2===0, ex = right? G.mx+G.mw : G.mx;
    const y1=G.Y(G.seg*(row+1)-1), y2=G.Y(G.seg*(row+1)+1), cy=(y1+y2)/2, ry=(y2-y1)/2;
    const seen=seenAt(G.seg*(row+1));
    for(let a=-Math.PI/2; a<=Math.PI/2; a+=0.02){
      const px=ex+(right?1:-1)*Math.cos(a)*14, py=cy+Math.sin(a)*ry;
      if(seen){ pR(g,R(px)-1,R(py)-1,3,3,'#8a6a44'); pR(g,R(px),R(py),1,1,'#e0c894'); }
      else if(R(a*50)%4===0) pR(g,R(px),R(py),1,1,'rgba(120,98,66,0.55)');
    }
  }
  /* the paper darkens toward its edges, as old paper does */
  { g.save(); g.setTransform(1,0,0,1,0,0);
    const vg=g.createRadialGradient(w/2,h/2,Math.min(w,h)*0.35,w/2,h/2,Math.max(w,h)*0.62);
    vg.addColorStop(0,'rgba(120,80,40,0)'); vg.addColorStop(1,'rgba(120,80,40,0.22)');
    g.fillStyle=vg; g.fillRect(0,0,w,h); g.restore(); }
  /* the border: a double rule in ink with a gold key-pattern between */
  pR(g,x0,y0,w,2,PM_INK); pR(g,x0,y0+h-2,w,2,PM_INK); pR(g,x0,y0,2,h,PM_INK); pR(g,x0+w-2,y0,2,h,PM_INK);
  pR(g,x0+4,y0+4,w-8,1,PM_INK); pR(g,x0+4,y0+h-5,w-8,1,PM_INK); pR(g,x0+4,y0+4,1,h-8,PM_INK); pR(g,x0+w-5,y0+4,1,h-8,PM_INK);
  for(let x=x0+6;x<x0+w-6;x+=4){ pR(g,x,y0+2,2,1,'#c89a40'); pR(g,x,y0+h-3,2,1,'#c89a40'); }
  for(let y=y0+6;y<y0+h-6;y+=4){ pR(g,x0+2,y,1,2,'#c89a40'); pR(g,x0+w-3,y,1,2,'#c89a40'); }
  for(const [cx,cy] of [[x0+4,y0+4],[x0+w-5,y0+4],[x0+4,y0+h-5],[x0+w-5,y0+h-5]]){
    pEll(g,cx,cy,3,3,PM_INK); pEll(g,cx,cy,2,2,'#e8c050'); pR(g,R(cx),R(cy),1,1,'#fff0a8'); }
  return c;
}

/* ---------- the names, the pins, and you ---------- */
function pmRibbon(g, x, y, w, hh){
  hh=hh||9;
  pR(g,x+1,y-hh+2,w,hh,'rgba(60,40,20,0.30)');
  pR(g,x,y-hh+1,w,hh,PM_INK); pR(g,x+1,y-hh+2,w-2,hh-2,'#f8eed4'); pR(g,x+1,y-hh+2,w-2,1,'#fffaea');
  pTri(g,x,y-hh+1,x-3,y-hh+3,x,y-1,PM_INK); pTri(g,x+w,y-hh+1,x+w+3,y-hh+3,x+w,y-1,PM_INK);
}
function drawMap(g,x0,y0,w,h){
  const G=pmGeo(x0,y0,w,h);
  const key=pmSeenKey()+'|'+x0+','+y0+','+w+','+h;
  if(PMAP.key!==key){ PMAP.key=key; PMAP.cv=pmPaint(G); }
  g.drawImage(PMAP.cv, x0, y0);
  /* the title, on a ribbon at the top, and how much of it you have walked */
  const ttl=L('THE ROAD'), tw=txtW(ttl,8)+16;
  pmRibbon(g, x0+12, y0+20, tw, 13);
  pTxt(g, ttl, x0+12+tw/2, y0+17, PM_INK, 8, 'center');
  const pc=Math.round(seenFrac()*100), tail=L('walked')+' '+pc+'%';
  pTxt(g, tail, x0+w-12, y0+16, pc>70?'#4e6a34':PM_INK, 6, 'right');
  const sub=L('west to east, and then east again'), sa=x0+22+tw, sb=x0+w-18-txtW(tail,6);
  if(sb-sa > txtW(sub,6)) pTxt(g,sub,sa,y0+16,'#7a6040',6);

  MAP_LABELS.length=0;
  for(let row=0; row<G.rows; row++){
    const wa=row*G.seg, wb=(row+1)*G.seg;
    const pins=MAP_PINS.filter(pn=>{ const wx=pn.x(); return wx>=wa && wx<wb && seenAt(wx); })
      .map(pn=>({pn, px:G.X(pn.x()), py:G.Y(pn.x())})).sort((a,b)=>a.px-b.px);
    const edge=[-1e9,-1e9];
    pins.forEach((it,i)=>{
      const nm=L(it.pn.n), lw=Math.max(txtW(nm,6),14)+6;
      const want=it.px-lw/2, push=s=>Math.max(0,(edge[s]+6)-want);
      let s = push(0)<=push(1)? 0 : 1;
      if(push(0)<=0 && push(1)<=0) s=i%2;
      let la=Math.max(want, edge[s]+6);
      la=clamp(la, G.mx-6, x0+w-12-lw);
      edge[s]=la+lw;
      const up=s===0, iy=it.py+(up? -9 : 9), tb=iy+(up? -8 : 14);
      const done=it.pn.done&&it.pn.done();
      pR(g,R(it.px),R(Math.min(iy,it.py))+3,1,Math.max(1,R(Math.abs(iy-it.py))-4),'rgba(74,52,36,0.7)');
      if(Math.abs(la+lw/2-it.px)>6){ const a2=Math.min(la+lw/2,it.px), b3=Math.max(la+lw/2,it.px);
        pR(g,R(a2),R(up?tb+1:tb-8),R(b3-a2),1,'rgba(74,52,36,0.45)'); }
      /* a medallion with the picture in it */
      pEll(g,it.px+1,iy+1,6.4,6.4,'rgba(60,40,20,0.35)');
      pEll(g,it.px,iy,6.4,6.4,PM_INK); pEll(g,it.px,iy,5.4,5.4, done?'#e8c050':'#c8a060');
      pEll(g,it.px,iy,4.4,4.4, done?'#eaf2d6':'#f8eed4');
      mapIcon(g,it.pn.ic,it.px,iy+1, done?'#4e6a34':'#4a3424', done?'#8ab064':'#9c8460');
      pmRibbon(g, la, tb, lw);
      pTxt(g, nm, la+lw/2, tb-1, done?'#4e6a34':PM_INK, 6, 'center');
      MAP_LABELS.push({n:nm, row, side:s, a:la-3, b:la+lw+3, y:tb});
    });
    /* the ghosts you have met, on the road */
    SPIRITS.forEach(sp=>{
      if(sp.x<wa||sp.x>=wb || !seenAt(sp.x)) return;
      const px=G.X(sp.x), py=G.Y(sp.x)+4;
      pEll(g,px,py,3.2,3.2,PM_INK); pEll(g,px,py,2.4,2.4, sp.friend?'#e8829e':'#b8aec8');
      if(sp.friend) icoHeart(g,px,py,0.5,'#6e2038');
    });
  }
  /* the zones' names, painted small into the country where there is room */
  for(const z of ZONES){
    const mid=(z.a+Math.min(z.b,EAST.edge))/2; if(!seenAt(mid) || z.a>EAST.edge) continue;
    const row=G.row(mid), nm=L(z.s||z.name), zw=txtW(nm,6);
    const px=G.X(mid), band=G.top+row*G.rowH, yy=R(band+G.rowH-4);
    const a=px-zw/2, b=px+zw/2;
    if(a<G.mx || b>G.mx+G.mw) continue;
    if(MAP_LABELS.some(l=>l.row===row && l.side===1 && a<l.b+2 && l.a-2<b)) continue;

    pTxt(g, nm, px, yy, 'rgba(58,40,26,0.78)', 6, 'center');
    MAP_LABELS.push({n:nm, row, side:1, a, b, y:yy, zone:true});
  }
  /* and you: a red pin, bobbing */
  { const wx=clamp(P.x,0,WORLD_W-1), px=G.X(wx), py=G.Y(wx), bob=Math.sin(GS.t*3)*1.4;
    pEll(g,px+1,py+2,3,1.2,'rgba(40,20,10,0.4)');
    pTaper(g,px,py+1+bob,px,py-7+bob,1.2,1.2,PM_INK);
    pEll(g,px,py-8+bob,3.6,3.6,PM_INK); pEll(g,px,py-8+bob,2.8,2.8,'#e0402c'); pR(g,R(px-1),R(py-10+bob),1,1,'#ffb0a0'); }
  /* W at the head of the road, E at the end of it */
  const wy=G.Y(0), ey=G.Y(Math.min(WORLD_W-1,EAST.edge));
  pTxt(g, compass('w'), G.mx-10, wy+2, PM_INK, 6, 'center');
  pTxt(g, compass('e'), G.X(EAST.edge)+10*(G.row(EAST.edge)%2?-1:1), ey+2, PM_INK, 6, 'center');
  /* a compass rose, a scale, and the friends you have made */
  { const cx2=x0+w-22, cy2=y0+h-11;
    for(let i=0;i<8;i++){ const a=i*Math.PI/4-Math.PI/2, L2=i%2? 4 : 8;
      pTaper(g,cx2,cy2,cx2+Math.cos(a)*L2,cy2+Math.sin(a)*L2, i%2?1:2.2, 0.8, i===0?'#a8281e':PM_INK); }
    pEll(g,cx2,cy2,1.8,1.8,'#e8c050'); pTxt(g, compass('n'), cx2-12, cy2-3, '#a8281e', 6, 'center'); }
  { const sx=x0+14, sy=y0+h-9, sw=40;
    pR(g,sx,sy,sw,2,PM_INK); pR(g,sx,sy,R(sw/2),2,'#f8eed4'); pR(g,sx,sy-2,1,6,PM_INK); pR(g,sx+sw-1,sy-2,1,6,PM_INK);
    pTxt(g,L("half an hour's walk"),sx+sw+6,sy+2,PM_INK,6); }
  icoHeart(g,x0+w-110,y0+h-9,0.7,PM_INK);
  pTxt(g,SPIRITS.filter(s=>s.friend).length+'/'+SPIRITS.length,x0+w-102,y0+h-7,PM_INK,6);
}
