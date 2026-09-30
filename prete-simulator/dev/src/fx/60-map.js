/* ============================================================
   THE MAP — THE ROAD THROUGH ISAN

   A new map, drawn from nothing. The road still snakes across the
   page — west to east along the top, round a bend, back along the
   middle, round again, and out east along the bottom — because
   that is the only way sixteen thousand pixels of road will fit on
   one page at a size you can read. Everything else is new.

   The country is the northeast. Paddies laid out in their bunds,
   green or gold with the season and some of them standing in
   water, with sugar palms on the bunds. Houses on posts with the
   jars and the hammock underneath, rice barns, field huts, the
   white sim and the lotus-bud that of the wat inside its wall, a
   morlam stage in the middle of the village, the red laterite
   earth and thin crooked trees of the dry forest, the town, gold
   paddies with haystacks and a bang fai tower, the river with the
   fishing boats and the raft houses, the red lotus sea, the
   flat-topped sandstone hills with their mushroom rocks, and a
   Khmer prasat on its terrace at the end. Buffalo with an egret
   riding, dogs asleep, a cat in the tamarind, a kid with a kite.

   Every one of those is a small sprite with a black line round
   it, lit from the top left like the item icons. Where you have
   never walked, cloud lies over the country. The border is a band
   of khit, the woven pattern of Isan cloth.

   The painting is kept and made again only when there is more of
   the road you have seen. The pins, the names, the birds and you
   are drawn over it every frame.
   ============================================================ */
const PMAP = { key:'', cv:null, lay:null, anim:null };
/* each part of the road's ground: three tones, light to dark, and what grows there */
const PMG = {
  charnel: {t:['#c4c4a4','#b0b294','#9a9e84'], k:'grave'},
  roadside:{t:['#c6d690','#b0c67e','#9ab26e'], k:'meadow'},
  paddy:   {t:['#b6d488','#a2c478','#8cae68'], k:'paddy'},
  villageW:{t:['#ddca9a','#cdb686','#b9a072'], k:'village'},
  centre:  {t:['#ddca9a','#cdb686','#b9a072'], k:'village'},
  grove:   {t:['#b2ce82','#9ebe72','#88aa64'], k:'grove'},
  wat:     {t:['#d4cc9c','#c4ba8a','#b0a678'], k:'wat'},
  forest:  {t:['#d2a272','#c28e60','#aa7852'], k:'dry'},
  deep:    {t:['#90b272','#7ca064','#688e56'], k:'deep'},
  cross:   {t:['#c8ca9a','#b8ba88','#a4a676'], k:'cross'},
  town:    {t:['#d2cec2','#c2beb2','#aeaa9e'], k:'town'},
  far:     {t:['#d4d08a','#c4c07a','#aeaa68'], k:'gold'},
  river:   {t:['#c8d496','#b4c484','#a0b070'], k:'river'},
  bank:    {t:['#c6d290','#b2c280','#9cae6e'], k:'bank'},
  lake:    {t:['#bcd49a','#a8c488','#94b076'], k:'lake'},
  hill:    {t:['#dcc696','#ccb484','#b89e70'], k:'hill'},
  ruins:   {t:['#ccc28e','#bcb07c','#a89c6a'], k:'ruins'},
};
const PM_WATER = ['#86c0d0','#6eaec2','#5a9ab0'];
/* which ground every ten pixels of the world stands on, looked up once */
var PM_ZT = [];
BUILD_STEPS.push(['drawing the map', ()=>{ PM_ZT=[]; for(let x=0;x<WORLD_W+10;x+=10) PM_ZT.push(PMG[zoneAt(Math.min(WORLD_W-1,x+5)).id]||PMG.roadside); }]);
TH['drawing the map'] = 'วาดแผนที่';
const PM_PLOT  = ['#8cc860','#98cc66','#a6d26c','#7cbc58','#b0d472'];
const PM_GOLD  = ['#dcc860','#e4d06a','#d2be5a','#c8c262','#e8d888'];
/* what stands about in each kind of country: [sprite, variant, weight], and how thick */
const PM_FLORA = {
  grave:  {d:0.07, o:[['bonestupa',0,3],['bush',2,2],['tree0',0,1],['deadtree',0,1]], s:['bonestupa',0]},
  meadow: {d:0.10, o:[['tree1',1,2],['bush',1,2],['tree0',1,2],['palmyra',0,2]], s:['tree0',1]},
  paddy:  {d:0.035,o:[['palmyra',0,4],['palmyra',1,3],['palmyra',2,2]]},
  gold:   {d:0.035,o:[['palmyra',1,4],['palmyra',2,3],['haystack',0,2]]},
  village:{d:0.14, o:[['coco',0,3],['coco',1,2],['banana',0,3],['tree1',1,2],['tree0',0,1],['bush',1,2]], s:['banana',1]},
  grove:  {d:0.20, o:[['banana',0,6],['banana',1,3],['bush',0,1],['coco',1,1]], s:['banana',0]},
  wat:    {d:0.05, o:[['tree1',0,1],['bush',3,1],['coco',0,1]]},
  dry:    {d:0.13, o:[['dipt',0,5],['dipt',1,4],['dipt',2,3],['termite',0,2],['bush',2,1]], s:['termite',0]},
  deep:   {d:0.40, o:[['tree2',0,4],['tree1',0,4],['tree2',2,2],['tree0',0,2],['bamboo',0,1]], s:['tree0',0]},
  cross:  {d:0.06, o:[['tree1',1,2],['bush',0,2],['palmyra',0,1]]},
  town:   {d:0.02, o:[['tree0',1,1]]},
  river:  {d:0.0,  o:[]},
  bank:   {d:0.12, o:[['coco',0,2],['bush',0,2],['tree1',1,1],['bamboo',0,1]]},
  lake:   {d:0.0,  o:[]},
  hill:   {d:0.07, o:[['dipt',1,3],['bush',2,2],['mushroom',0,2],['boulder',0,1],['boulder',1,1]], s:['mushroom',0]},
  ruins:  {d:0.08, o:[['tree1',2,3],['palmyra',0,2],['tree0',2,2],['bush',2,1],['boulder',1,1]], s:['tree0',2]},
};

/* ---------- where things go on the page ----------
   The scale is an illustrator's, not a surveyor's. The road turns at the
   edge of the grove and at the edge of the river, so each row is one kind
   of journey — the village, then the long way through the forest and the
   town, then the water and the old country — and inside a row the busy
   places are given more of the page than the empty ones: a stretch of the
   village takes half as much again as the same length of forest. */
const PM_SPLIT = [0, 3800, 10600];
const PM_WEIGHT = { charnel:1.0, roadside:1.0, paddy:0.8, villageW:1.45, centre:1.5, grove:0.85, wat:1.15, forest:0.75,
                    deep:0.7, cross:1.0, town:0.95, far:0.8, river:0.9, bank:1.1, lake:0.9, hill:0.8, ruins:1.05 };
let PM_S = null;
function pmS(){
  if(PM_S) return PM_S;
  const n=Math.ceil(WORLD_W/10)+1, t=new Float64Array(n);
  for(let i=1;i<n;i++) t[i]=t[i-1]+10*(PM_WEIGHT[zoneAt((i-0.5)*10).id]||1);
  return PM_S=t;
}
function pmSat(wx){ const t=pmS(), f=clamp(wx,0,WORLD_W)/10, i=Math.min(t.length-2,Math.floor(f)); return t[i]+(t[i+1]-t[i])*(f-i); }
function pmSinv(S){
  const t=pmS(); let lo=0, hi=t.length-1;
  if(S<=0) return 0; if(S>=t[hi]) return WORLD_W;
  while(hi-lo>1){ const m=(lo+hi)>>1; if(t[m]<=S) lo=m; else hi=m; }
  return (lo + (S-t[lo])/Math.max(1e-6,t[hi]-t[lo]))*10;
}
function pmGeo(x0,y0,w,h){
  const B=6, top=y0+B+1, bot=y0+h-B-1, rows=MAP_ROWS, rowH=(bot-top)/rows;
  const mx=x0+22, mw=w-44;
  const b=[...PM_SPLIT.slice(0,rows), WORLD_W], Sb=b.map(pmSat);
  const G={x0,y0,w,h,B,top,bot,rowH,mx,mw,rows,ry:[],b};
  for(let r=0;r<rows;r++) G.ry.push(top+rowH*(r+0.5));
  G.row = wx => { let r=0; while(r<rows-1 && wx>=b[r+1]) r++; return r; };
  G.u = wx => { const r=G.row(wx); return (pmSat(wx)-Sb[r])/(Sb[r+1]-Sb[r]); };
  G.X = wx => { const r=G.row(wx), u=G.u(wx); return mx + mw*(r%2? 1-u : u); };
  G.bend = wx => Math.sin(wx*0.0016)*2.2 + Math.sin(wx*0.00052+1.1)*1.6;
  G.Y = wx => G.ry[G.row(wx)] + G.bend(wx);
  /* which world x a map column is, on a given row; past the ends it is the end */
  G.W = (px,r) => { let u=clamp((px-mx)/mw,0,1); if(r%2) u=1-u; return clamp(pmSinv(Sb[r]+u*(Sb[r+1]-Sb[r])), 0, WORLD_W-1); };
  G.t0 = r => R(top + r*rowH);
  G.t1 = r => R(top + (r+1)*rowH);
  return G;
}
/* a fixed field of random numbers, looked up rather than worked out: the
   ground pass asks for a few of these per pixel */
const PM_LAT = (()=>{ const r=mulberry(9091), t=new Float32Array(65536); for(let i=0;i<65536;i++) t[i]=r(); return t; })();
function pmHash(i,j){ return PM_LAT[((i&255)<<8)|(j&255)]; }
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

/* ---------- the names: laid out first, so nothing gets painted under them ----------
   Each pin is a stop on the road itself, like a stop on a railway map, and
   its name is a small tag just above or just below it. Stops that crowd are
   pushed apart along the road until they sit shoulder to shoulder; tags take
   whichever side leaves them where they belong. That leaves most of every row
   to the country. */
const PM_STOP = 14;
/* Thai sits taller than the pixel font: marks above the letters and below them */
const pmTH = ()=> LANG==='th'? 3 : 0;
function pmLayout(G){
  const pins=[], zones=[];
  for(let row=0; row<G.rows; row++){
    const wa=G.b[row], wb=G.b[row+1], lo=G.mx+4, hi=G.mx+G.mw-4;
    const list=MAP_PINS.filter(pn=>{ const wx=pn.x(); return wx>=wa && wx<wb && seenAt(wx); })
      .map(pn=>({pn, wx:pn.x(), px:G.X(pn.x())})).sort((a,b)=>a.px-b.px);
    for(const it of list) it.sx=clamp(it.px,lo,hi);
    for(let k=0;k<80;k++){ let moved=false;
      for(let i=0;i+1<list.length;i++){ const a=list[i], b=list[i+1], d=b.sx-a.sx;
        if(d<PM_STOP-0.01){ const pu=(PM_STOP-d)/2; a.sx=Math.max(lo,a.sx-pu); b.sx=Math.min(hi,b.sx+pu); moved=true; } }
      if(!moved) break; }
    for(const it of list) it.sy=G.Y(G.W(it.sx,row));
    const edge=[-1e9,-1e9];
    list.forEach((it,i)=>{
      const nm=L(it.pn.n), lw=Math.max(txtW(nm,6),14)+6;
      const want=it.sx-lw/2, push=s=>Math.max(0,(edge[s]+6)-want);
      let s = push(0)<=push(1)? 0 : 1;
      if(push(0)<=0 && push(1)<=0) s=i%2;
      let la=Math.max(want, edge[s]+6);
      la=clamp(la, G.x0+G.B+5, G.x0+G.w-G.B-5-lw);
      edge[s]=la+lw;
      const tb = s===0? R(it.sy)-8 : R(it.sy)+17+pmTH();
      pins.push({pn:it.pn, wx:it.wx, px:it.px, sx:it.sx, sy:it.sy, tb, la, lw, s, row, nm});
    });
  }
  /* the names of the parts of the road run along the foot of each row, in a
     lane of their own */
  for(const z of ZONES){
    const mid=(z.a+Math.min(z.b,EAST.edge))/2; if(!seenAt(mid) || z.a>EAST.edge) continue;
    const row=G.row(mid), nm=L(z.s||z.name), zw=txtW(nm,6);
    const px=G.X(mid), yy=G.t1(row)-3, a=px-zw/2, b=px+zw/2;
    if(a<G.x0+G.B+3 || b>G.x0+G.w-G.B-3) continue;
    if(pins.some(l=>l.row===row && l.s===1 && l.tb>yy-9 && a<l.la+l.lw+4 && l.la-4<b)) continue;
    if(pmCartouches(G).some(r=>a<r[0]+r[2]+2 && r[0]-2<b && yy-7<r[1]+r[3] && r[1]<yy+2)) continue;
    if(zones.some(q=>q.row===row && a<q.b+6 && q.a-6<b)) continue;
    if(pins.some(l=>l.nm.toLowerCase().includes(nm.toLowerCase()) || nm.toLowerCase().includes(l.nm.toLowerCase()))) continue;
    zones.push({nm, px, yy, a, b, row});
  }
  return {pins, zones};
}
/* the pieces of paper laid over the corners of the country: [x, y, w, h] */
function pmCartouches(G){
  const {x0,y0,w,h}=G, tw=txtW(L('THE ROAD'),8)+16, pc=Math.round(seenFrac()*100);
  const tl=txtW(L('walked')+' '+pc+'%',6)+8, sc=txtW(L("half an hour's walk"),6)+58;
  return [[x0+9,y0,tw+3,15], [x0+w-12-tl,y0,tl+3,13], [x0+9,y0+h-14,sc,14], [x0+w-124,y0+h-13,30,13], [x0+w-36,y0+h-30,30,30]];
}
/* which side of the road a pin's name went, near a world x: 0 above, 1 below, -1 none */
function pmLabelSide(lay, wx, near){
  let best=-1, bd=near||90;
  for(const l of lay.pins){ const d=Math.abs(l.wx-wx); if(d<bd){ bd=d; best=l.s; } }
  return best;
}

/* ---------- the painting ---------- */
function pmPaint(G, lay){
  const {x0,y0,w,h,B}=G;
  const c=mkCv(w,h), g=G2(c), rnd=mulberry(4040);
  const anim={ water:[], smoke:[], kite:null, rocket:null, boats:[] };
  /* what is already taken on the page, a pixel at a time */
  const occ=new Uint8Array(w*h);
  const mark=(x,y,ww,hh,v)=>{ x=R(x)-x0; y=R(y)-y0; for(let j=Math.max(0,y); j<Math.min(h,y+R(hh)); j++) for(let i=Math.max(0,x); i<Math.min(w,x+R(ww)); i++) occ[j*w+i]=v||1; };
  const free=(x,y,ww,hh)=>{ x=R(x)-x0; y=R(y)-y0; if(x<0||y<0||x+ww>w||y+hh>h) return false;
    for(let j=y; j<y+R(hh); j++) for(let i=x; i<x+R(ww); i++) if(occ[j*w+i]) return false; return true; };
  const seenPx=(px,row)=>seenAt(G.W(px+0.5,row));
  /* how high and how low the road runs under something this wide */
  const roadSpan=(x,hw,row)=>{ let a=1e9,b=-1e9; for(let q=x-hw-1;q<=x+hw+1;q++){ const y=G.Y(G.W(q,row)); a=Math.min(a,y); b=Math.max(b,y); } return [a,b]; };
  const rowOf=py=>clamp(Math.floor((py-G.top)/G.rowH),0,G.rows-1);

  /* ---- the ground, a pixel at a time ---- */
  const im=g.createImageData(w,h), D=im.data;
  const put=(x,y,col)=>{ const i=((y-y0)*w+(x-x0))*4; D[i]=col[0]; D[i+1]=col[1]; D[i+2]=col[2]; D[i+3]=255; };
  const HX=new Map(), H=s=>{ let v=HX.get(s); if(!v){ v=hx(s); HX.set(s,v); } return v; };
  const mixA=(a,b,t)=>[a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
  const shadeA=(a,t)=> t>=0? mixA(a,[255,255,255],t) : mixA(a,[16,10,14],-t);
  const PAPER=H('#ecdcb4'), PAPER2=H('#e2d0a4'), HAZE=H('#eae6ce');
  for(let yy=y0;yy<y0+h;yy++) for(let xx=x0;xx<x0+w;xx++) put(xx,yy, ((xx*7+yy*13)%11===0)? PAPER2 : PAPER);
  /* the special ground: water, the wat's sand, the pond and the baray — decided
     now so the pixel pass can ask about it */
  const wet=[]; // {row, x0,x1,y0,y1, f(x,y)->bool}
  const pondSide = pmLabelSide(lay,700)===1? -1 : 1;
  const watSide  = pmLabelSide(lay,SALA_X,160)===0? 1 : -1;
  for(let row=0; row<G.rows; row++){
    const t0=G.t0(row), t1=G.t1(row);
    /* the paddies' bunds: a grid of plots, different on every row */
    const pr=mulberry(900+row*77), colOf=new Int16Array(w), colX=[], colW=[], cells=[];
    for(let x=0, k=0; x<w; k++){ const cw=7+(pr()*8|0); colX.push(x); colW.push(cw);
      const cl=new Int16Array(t1-t0+1), cy=[], ch=[]; for(let y=0, j=0; y<=t1-t0; j++){ const hh=4+(pr()*5|0); cy.push(y); ch.push(hh); for(let q=y;q<Math.min(t1-t0+1,y+hh);q++) cl[q]=j; y+=hh; }
      cells.push({cl,cy,ch}); for(let q=x;q<Math.min(w,x+cw);q++) colOf[q]=k; x+=cw; }
    /* where each column is in the world, and whether it has been seen, once per column */
    const WX=new Float64Array(w), SN=new Uint8Array(w);
    for(let xx=x0+B; xx<x0+w-B; xx++){ const wx=G.W(xx+0.5,row); WX[xx-x0]=wx; SN[xx-x0]=seenAt(wx)?1:0; }
    for(let yy=t0; yy<t1; yy++) for(let xx=x0+B; xx<x0+w-B; xx++){
      if(!SN[xx-x0]) continue;
      const wx=WX[xx-x0];
      const bay=ICO_BAYER[(yy&3)*4+(xx&3)]/16-0.5;
      const Z=PM_ZT[Math.min(PM_ZT.length-1,Math.max(0,((wx+bay*70)/10)|0))], k=Z.k;
      const n=pmNoise(xx,yy,12)*0.62+pmNoise(xx+40,yy*1.4,4.5)*0.38+bay*0.16;
      let col=H(Z.t[n>0.6?0:n<0.38?2:1]);
      const hs=pmHash(xx,yy);
      /* the river and the lotus sea run across the road, top of the page to the bottom */
      const wav=Math.sin(yy*0.35+row)*14;
      const inRiver = wx+wav>EAST.river0 && wx+wav<EAST.river1, inLake = wx+wav>EAST.lake0+30 && wx+wav<EAST.lake1-30;
      const inStream = Math.abs(wx+Math.sin(yy*0.5)*18-6330)<16;
      if(inRiver || inLake || inStream){
        const wn=pmNoise(xx*0.6,yy*2.2,3);
        col=H(PM_WATER[wn>0.66?0:wn<0.3?2:1]);
        if(inRiver && (yy+(xx>>1))%5===0 && hs>0.55) col=H('#a8d4e0');
        if(inLake && hs>0.965) col=H('#c8eae8');
      } else if(Math.abs(wx+wav-EAST.river0)<60 || Math.abs(wx+wav-EAST.river1)<50 || (wx+wav>EAST.lake0-10 && wx+wav<EAST.lake0+30) || (wx+wav>EAST.lake1-30 && wx+wav<EAST.lake1+10)){
        col=H(hs>0.5?'#e4d09e':'#d8c490');                                   // sand on the banks
      } else if(k==='paddy' || k==='gold'){
        const lx=xx-x0, kk=colOf[lx], cc=cells[kk], j=cc.cl[yy-t0], px2=lx-colX[kk], py2=(yy-t0)-cc.cy[j];
        if(px2===0 || py2===0) col=H(hs>0.3? '#cfae74' : '#dcbe86');                        // the bund
        else if(px2===1 || py2===1) col=H('#6e9e4e');                                         // its shadow in the plot
        else { const pk=pmHash(kk*3+row, j*7+row*13), P=k==='gold'? PM_GOLD : PM_PLOT;
          if(pk>0.83 && k==='paddy'){ col=H(hs>0.9?'#d6f0ec':'#9ccac6'); if((px2+py2)%3===0) col=H('#78b860'); }   // a plot standing in water, just planted
          else { col=H(P[(pk*5)|0]); if(px2%2===0 && (py2+px2)%3!==0) col=shadeA(col,-0.09); if(hs>0.97) col=shadeA(col,0.18); } }
      } else if(k==='meadow' || k==='grove' || k==='bank'){
        if(hs>0.986) col=H(['#f4e060','#f08ab0','#fff4e8','#f0a040'][(hs*1000|0)%4]);
        else if(hs>0.95) col=shadeA(col,-0.14);
      } else if(k==='dry'){
        if(hs>0.95) col=H(hs>0.975?'#8a9c46':'#a0ac56');                                     // grass in the red earth
        else if(hs<0.02) col=H('#a86a44');
      } else if(k==='grave' || k==='hill' || k==='ruins'){
        if(hs>0.975) col=H(hs>0.99?'#e8e2d0':'#9a9484');
      } else if(k==='deep'){
        if(hs>0.9) col=shadeA(col,-0.12);
      } else if(k==='town'){
        if((xx+yy*3)%9===0) col=shadeA(col,-0.05);
      }
      /* the far edge of each row lies in a haze, and each row ends in a lip of shade */
      if(yy-t0<3) col=mixA(col,HAZE,0.30*(1-(yy-t0)/3));
      if(yy>=t1-2) col=shadeA(col, yy===t1-1? -0.16 : -0.07);
      put(xx,yy,col);
      if((inRiver||inLake) && hs>0.992) anim.water.push([xx,yy]);
    }
  }
  /* the wat's sand inside its wall, the pond and the baray */
  const sideBox=(wa,wb,side,depth)=>{ const pa=G.X(wa), pb=G.X(wb), a=Math.min(pa,pb), b=Math.max(pa,pb), row=G.row(wa), ry=G.Y((wa+wb)/2);
    return side<0? {row, x:R(a), y:G.t0(row)+3, w:R(b-a), h:R(ry-5-(G.t0(row)+3))} : {row, x:R(a), y:R(ry+6), w:R(b-a), h:R(G.t1(row)-3-(ry+6))}; };
  const fillBox=(bx,fn)=>{ for(let yy=bx.y; yy<bx.y+bx.h; yy++) for(let xx=bx.x; xx<bx.x+bx.w; xx++){ const col=fn(xx-bx.x,yy-bx.y,bx.w,bx.h,xx,yy); if(col) put(xx,yy,H(col)); } };
  const WAT = seenAt(SALA_X)? sideBox(3880,4500,watSide,0) : null;
  if(WAT) fillBox(WAT,(i,j,ww,hh,xx,yy)=>{ const e=i===0||j===0||i===ww-1||j===hh-1;
    if(e) return (watSide<0 && j===hh-1 && Math.abs(i-ww/2)<5) || (watSide>0 && j===0 && Math.abs(i-ww/2)<5)? '#e8dcb8' : (j===0? '#c85a3a' : '#f4f0e4');
    if(i===1||j===1) return '#cfc098'; return pmHash(xx,yy)>0.93? '#dccca0' : '#e8dcb8'; });
  if(seenAt(700)){ const cx=G.X(700)+4, cy=G.Y(700)+pondSide*23, rx=8, ry=3.4;
    for(let yy=R(cy-ry-1); yy<=R(cy+ry+1); yy++) for(let xx=R(cx-rx-1); xx<=R(cx+rx+1); xx++){ const d=((xx-cx)/rx)**2+((yy-cy)/ry)**2;
      if(d<1) put(xx,yy,H(d<0.5? (pmHash(xx,yy)>0.9?'#a6d2dc':'#6eaec2') : '#5a9ab0')); else if(d<1.55) put(xx,yy,H('#a88258')); }
    anim.water.push([R(cx-3),R(cy)],[R(cx+2),R(cy-1)]); PMAP._pond=[R(cx-rx-2),R(cy-ry-2),R(rx*2+5),R(ry*2+5)]; }
  PMAP._baray=null; PMAP._pond=null;
  if(seenAt(14650)){ const bx=sideBox(14540,14800,pmLabelSide(lay,14650,200)===1? -1 : 1,0); PMAP._baray=[bx.x-1,bx.y+1,bx.w+2,bx.h-2];
    const pad=2; fillBox({row:bx.row,x:bx.x,y:bx.y+pad,w:bx.w,h:bx.h-pad*2},(i,j,ww,hh)=>{ if(i<2||j<2||i>=ww-2||j>=hh-2) return (i+j)%2? '#b8683e' : '#a85a36';
      return (i*3+j)%11===0? '#a6d2dc' : '#6eaec2'; }); }
  g.putImageData(im,0,0);
  g.translate(-x0,-y0);

  /* ---- the road: reserved first, so nothing is put down on it ---- */
  const path=[];
  for(let row=0; row<G.rows; row++){
    const dir=row%2? -1 : 1, a=row%2? G.mx+G.mw : G.mx, b=row%2? G.mx : G.mx+G.mw;
    for(let px=a; dir>0? px<=b : px>=b; px+=dir*0.5){ const wx=G.W(px,row); path.push({x:px, y:G.Y(wx), wx, seen:seenAt(wx)}); }
    if(row+1<G.rows){
      const right=row%2===0, ex=right? G.mx+G.mw : G.mx;
      const wb=G.b[row+1], y1=G.Y(wb-1), y2=G.Y(wb+1), cy=(y1+y2)/2, ryy=(y2-y1)/2, wx=wb, sn=seenAt(wx);
      for(let an=-Math.PI/2; an<=Math.PI/2; an+=0.012) path.push({x:ex+(right?1:-1)*Math.cos(an)*15, y:cy+Math.sin(an)*ryy, wx, seen:sn, bend:true});
    }
  }
  for(const q of path) mark(q.x-4, q.y-4, 9, 9, 2);
  /* and the names */
  for(const l of lay.pins){ mark(l.sx-8,l.sy-8,17,17); mark(l.la-3,l.tb-10-pmTH(),l.lw+6,12+pmTH());
    const mid=l.la+l.lw/2; if(Math.abs(mid-l.sx)>l.lw/2-3) mark(Math.min(mid,l.sx)-1, l.s===0? l.tb-1 : l.tb-10, Math.abs(mid-l.sx)+2, 11); }
  for(const z of lay.zones) mark(z.a-3,z.yy-7,z.b-z.a+6,9);
  /* the cartouches laid over the country: the title, how far you have walked,
     the scale, the friends, the compass */
  for(const r of pmCartouches(G)) mark(r[0],r[1],r[2],r[3]);
  if(PMAP._pond && seenAt(700)) mark(...PMAP._pond);
  if(PMAP._baray) mark(...PMAP._baray);

  const isWater=(wx)=> (wx>EAST.river0-10 && wx<EAST.river1+10) || (wx>EAST.lake0+20 && wx<EAST.lake1-20);
  const bridgeAt=(wx)=> wx>EAST.river0-40 && wx<EAST.river1+40;
  const walkAt=(wx)=> wx>EAST.lake0 && wx<EAST.lake1;
  /* ink, then red earth, then the worn middle of it */
  const disc=(x,y,r,col)=>{ g.fillStyle=col; x=R(x); y=R(y); const hw=r===3? [1,2,3,3,3,2,1] : r===2? [1,2,2,2,1] : [0,1,0];
    for(let i=0;i<hw.length;i++) g.fillRect(x-hw[i], y-(hw.length>>1)+i, hw[i]*2+1, 1); };
  for(const q of path) if(q.seen) disc(q.x,q.y,3,MAP_INK);
  for(const q of path) if(q.seen){ const br=bridgeAt(q.wx)&&!q.bend, bw=walkAt(q.wx)&&!q.bend;
    disc(q.x,q.y,2, br? '#b88a58' : bw? '#c89a64' : '#c88a5a'); }
  for(const q of path) if(q.seen){ const br=bridgeAt(q.wx)&&!q.bend, bw=walkAt(q.wx)&&!q.bend;
    if(br||bw){ if(R(q.x)%2===0) pR(g,R(q.x),R(q.y)-2,1,5,'#8a5e3a'); }
    else { pR(g,R(q.x),R(q.y)-1,1,1,'#e2ac72'); if(pmHash(R(q.x),9)>0.8) pR(g,R(q.x),R(q.y)+1,1,1,'#a86e46'); } }
  /* the rails of the long bridge, and its posts in the water */
  for(const q of path) if(q.seen && bridgeAt(q.wx) && !q.bend){ pR(g,R(q.x),R(q.y)-4,1,1,'#6a4a2c'); pR(g,R(q.x),R(q.y)+4,1,1,'#6a4a2c');
    if(R(q.x)%6===0){ pR(g,R(q.x),R(q.y)-5,1,2,'#6a4a2c'); pR(g,R(q.x),R(q.y)+5,1,2,'#4a3420'); } }
  /* the side road at the crossroad, north and south as far as the row goes */
  if(seenAt(CROSS_X)){ const cx=R(G.X(CROSS_X)), row=G.row(CROSS_X), ya=G.t0(row)+2, yb=G.t1(row)-3;
    for(let yy=ya; yy<=yb; yy++){ pR(g,cx-3,yy,7,1,MAP_INK); pR(g,cx-2,yy,5,1,'#c88a5a'); if(yy%3) pR(g,cx,yy,1,1,'#e2ac72'); }
    mark(cx-4,ya,9,yb-ya); }

  /* ---- the big shapes of the country: hills, the wat's wall ---- */
  const placed=[];
  const place=(name,v,x,y,o)=>{ o=o||{};
    const s=mapArt(name,v); if(!s) return false;
    const bx=R(x-s.width/2), by=R(y-s.height+1), pad=o.pad===undefined? 0 : o.pad;
    const row=o.row===undefined? rowOf(y-1) : o.row;
    if(!o.force){
      if(bx<x0+B+1 || bx+s.width>x0+w-B-1) return false;
      if(by<G.t0(row)+1 || y>G.t1(row)-2) return false;
      if(!seenPx(x,row)) return false;
      if(!free(bx-pad,by-pad,s.width+pad*2,s.height+pad*2)) return false;
    }
    const sh=o.shrink||0; mark(bx+sh,by+sh,s.width-sh*2,s.height-sh*2);
    placed.push({name,v,x,y,flip:!!o.flip,sh:o.shadow!==false,w:s.width});
    return true;
  };
  /* a sprite beside the road at a world x, on the side the names left alone */
  const beside=(wx,name,v,o)=>{ o=o||{};
    if(!seenAt(wx)) return false;
    const row=G.row(wx), s=mapArt(name,v); if(!s) return false;
    const side = o.side || (pmLabelSide(lay,wx,o.near)===0? 1 : -1), g0=o.gap||0;
    /* next to the road if there is room, and further out past the names if not */
    for(const sd of [side,-side]){
      for(let gap=g0; gap<=g0+(o.only? 0 : 24); gap+=3){
        let out=0;
        for(const dx of (o.wide? [0,3,-3,6,-6,10,-10,14,-14,19,-19,25,-25,32,-32] : [0,2,-2,4,-4,7,-7,10,-10,14,-14])){
          const x=G.X(wx)+(o.dx||0)*(row%2?-1:1)+dx, [ra,rb]=roadSpan(x,s.width/2,row);
          const y= sd<0? Math.floor(ra)-6-gap : Math.ceil(rb)+6+s.height-1+gap;
          if(y-s.height+1<G.t0(row)+1 || y>G.t1(row)-2){ out++; continue; }
          if(place(name,v,x,y,Object.assign({row},o))) return true;
        }
        if(out>=(o.wide?15:11)) break;
      }
      if(o.only) break;
    }
    return false;
  };
  /* sandstone hills along the far side of the cave country */
  if(seenAt(12900) || seenAt(14000)){
    const row=G.row(13500);
    for(const [wa,v] of [[13080,2],[13760,13],[14200,1]]){ if(!seenAt(wa)) continue;
      const x=G.X(wa), ry=G.Y(wa), s=mapArt('mesa',v);
      const side=(v>=10 || pmLabelSide(lay,wa,200)!==0)? -1 : 1;
      const y= side<0? ry-5 : Math.min(G.t1(row)-3, ry+5+s.height);
      place('mesa',v,x,y,{row,force:true});
      mark(R(x-s.width/2), R(y-s.height+1), s.width, s.height);
      if(v>=10) anim.cave={x, y}; }
  }
  /* the wat inside its wall: the sim, the that, a sala, the bodhi, little chedis */
  if(WAT){
    const row=WAT.row, by=watSide<0? WAT.y+WAT.h-2 : WAT.y+WAT.h-2;
    const at=wx=>G.X(wx);
    const inside=[['sim',0,SALA_X,0],['that',0,CHEDI_X,0],['bodhi',0,4230,-1],['sala',0,3950,0],['chedi',0,4440,0],['chedi',0,3900,-2],['flagthai',0,4010,-4],['bush',0,4160,-3],['tree0',0,4480,-6]];
    for(const [n,v,wx,dy] of inside){ const s=mapArt(n,v), x=at(wx), y=by+dy;
      if(y-s.height+1<WAT.y+1) continue;
      place(n,v,x,y,{row,force:true}); }
    mark(WAT.x-1,WAT.y-1,WAT.w+2,WAT.h+2);
  }

  /* ---- the places the pins are about ---- */
  const L2=(wx,n,v,o)=>beside(wx,n,v,o);
  L2(112,'ruinstupa',0,{wide:1}); L2(250,'grave',0,{wide:1}); L2(60,'bonestupa',0,{side:-1}); L2(170,'bonestupa',0,{side:1}); L2(340,'bonestupa',0,{side:-1}); L2(420,'deadtree',0,{side:-1,dx:2});
  L2(566,'cart',1,{wide:1}); L2(640,'tree1',1,{side:-1});
  L2(800,'elephant',0,{side:pondSide,dx:6,gap:1});
  L2(FARMHOUSE_X,'stilt',2,{dx:2}); L2(FARMHOUSE_X+60,'jars',0,{gap:0});
  L2(1060,'hut',0,{side:1,dx:4,gap:6}); L2(1180,'buffalo',0,{side:-1,gap:4}); L2(1300,'scarecrow',0,{side:1,gap:3}); L2(1380,'buffalo',3,{side:-1,gap:9,flip:1});
  L2(1250,'farmer',0,{side:-1,gap:12}); L2(1000,'farmer',1,{side:-1,gap:2});
  HOUSE_XS.forEach((hx2,i)=>{ const v=[1,0,2,0,1,1][i%6];
    if(L2(hx2,'stilt',v,{flip:i%2===1})){ L2(hx2+(i%2?-70:70),'granary',i%2,{gap:1}); L2(hx2-(i%2?-60:60),i%3?'coco':'banana',i%2,{gap:2}); } });
  L2(1990,'log',0); L2(2060,'lamp',0); L2(2340,'bench',0); L2(2500,'spirit',0); L2(2650,'tree2',1,{dx:0}); L2(2790,'kitchen',0);
  L2(2600,'morlam',0,{side:1,gap:1,near:60,wide:1});
  L2(3340,'tani',0,{wide:1});
  L2(6330,'bamboo',0,{side:-1,dx:6}); L2(6330,'heron',0,{side:1,dx:-5});
  L2(CROSS_X+80,'sign',0,{side:-1}); L2(7560,'busstop',0); L2(7620,'songthaew',0,{side:1,gap:0});
  L2(STORE_X,'shop',0,{dx:1});
  L2(9860,'hut',1,{gap:4}); L2(10000,'bangfai',0,{side:-1,gap:3,wide:1}); L2(9700,'buffalo',2,{side:1,gap:5}); L2(9450,'haystack',0,{side:1,gap:2}); L2(10300,'haystack',0,{side:-1,gap:6});
  L2(10250,'kid',1,{side:1,gap:4});
  L2(11700,'pier',0,{gap:0}); L2(11820,'sala',0,{dx:2});
  L2(12430,'sala',0,{gap:2});
  L2(14960,'prasat',0,{wide:1}); L2(14880,'naga',0,{gap:0,dx:-3}); L2(15280,'stonehead',0); L2(15590,'view',0);
  L2(15420,'bodhi',0,{side:-1,wide:1}); L2(14700,'palmyra',1,{side:-1,wide:1}); L2(15120,'tree1',2,{side:1,wide:1});

  /* the town: shophouses in a row along both sides, as a town is */
  if(seenAt(8300)){
    let i=0;
    for(let wx=7820; wx<9020; wx+=150){ if(Math.abs(wx-STORE_X)<120){ i++; continue; }
      beside(wx,'shophouse',i%4,{side:-1,only:true,gap:0}); beside(wx+70,'shophouse',(i+2)%4,{side:1,only:true,gap:0}); i++; }
    for(let wx=7900; wx<9000; wx+=330) beside(wx,'pole',0,{side:-1,only:true,gap:0});
  }
  /* the river: fishing boats on it, a raft house moored, and on the lotus sea, lotus */
  if(seenAt(11100)){
    const row=G.row(11100);
    for(const [wx,side,v] of [[10860,-1,0],[11350,1,1],[11050,1,0]]){ if(beside(wx,'boat',v,{side,gap:2,wide:1,shadow:false})){ const b=placed[placed.length-1]; anim.boats.push({x:b.x,y:b.y,v}); } }
    beside(11200,'raft',0,{side:-1,gap:6}); beside(11480,'raft',0,{side:1,gap:3});
  }
  if(seenAt(12400)){
    const row=G.row(12400), t0=G.t0(row), t1=G.t1(row), lr=mulberry(123);
    for(let k=0;k<600;k++){ const wx=EAST.lake0+60+lr()*(EAST.lake1-EAST.lake0-120), x=G.X(wx), y=t0+4+lr()*(t1-t0-6);
      if(Math.abs(y-G.Y(wx))<7) continue; place('lotus',(k*7)%3,x,y,{row,shadow:false,shrink:2,pad:-1}); }
  }

  /* ---- who lives here: animals, and the odd person ---- */
  const beast=[[1520,'dog',0,1],[1880,'chicken',0,-1],[1905,'chicken',1,-1],[2230,'dog',3,1],[2420,'cat',1,-1],[2900,'chicken',1,1],[2940,'dog',1,-1],
               [4390,'dog',2,1],[7450,'dog',0,-1],[8420,'dog',4,1],[8700,'cat',0,1],[3100,'chicken',0,-1],[11760,'cat',2,1]];
  for(const [wx,n,v,sd] of beast) beside(wx,n,v,{side:sd,gap:1});
  /* the cat is up the tamarind, where the pin says */
  { const t=placed.find(p=>p.name==='tree2' && Math.abs(p.x-G.X(2650))<12); if(t){ const s=mapArt('tree2',1);
      placed.push({name:'cat',v:0,x:t.x+3,y:t.y-s.height+8,flip:false,sh:false,w:7}); } }

  /* ---- and then everything that grows, thick or thin by the country: a
     jittered grid of places to try, as close together as that country grows ---- */
  const SPACE = {grave:9, meadow:9, paddy:14, gold:14, village:8, grove:6, wat:14, dry:6, deep:4, cross:10, town:22, bank:8, hill:10, ruins:9, river:0, lake:0};
  for(let row=0; row<G.rows; row++){
    const t0=G.t0(row), t1=G.t1(row), fr=mulberry(313+row*17);
    for(let py=t0+4; py<t1-2; py+=4) for(let px=x0+B+3; px<x0+w-B-3; px+=4){
      const wx=G.W(px,row); if(!seenAt(wx)) continue;
      if(isWater(wx) && zoneAt(wx).id!=='bank') continue;
      const Z=PMG[zoneAt(wx).id]||PMG.roadside, F=PM_FLORA[Z.k], sp=SPACE[Z.k]; if(!F || !F.o.length || !sp) continue;
      /* one try per cell of this country's spacing */
      if(fr() > 16/(sp*sp)) continue;
      const X=px+fr()*4-2, Y=py+fr()*4-2, thick = Z.k==='deep'||Z.k==='dry'||Z.k==='grove';
      /* and if the first thing will not fit there, something smaller might */
      for(let tries=0; tries<2; tries++){
        let tot=0; for(const o of F.o) tot+=o[2]; let pk=fr()*tot, ch=F.o[0]; for(const o of F.o){ pk-=o[2]; if(pk<=0){ ch=o; break; } }
        if(tries){ if(!F.s || fr()<0.5) break; ch=F.s; }
        const tree=/tree|dipt|palm|coco|banana|bamboo/.test(ch[0]);
        if(place(ch[0],ch[1],X,Y,{row,shrink:tree?(ch[0]==='palmyra'?3:2):0,pad:tree&&thick? -2 : 0,flip:fr()<0.5})) break;
      }
    }
  }

  /* ---- stand it all up: shadows first, then back to front ---- */
  placed.sort((a,b)=>a.y-b.y); PMAP.placed=placed.length;
  for(const p of placed) if(p.sh) mapShadow(g, p.x, p.y, p.w*0.42);
  for(const p of placed) mapPut(g, p.name, p.v, p.x, p.y, p.flip);
  /* things for the frame loop to move */
  const kid=placed.find(p=>p.name==='kid'); if(kid) anim.kite={x:kid.x+1, y:kid.y-5};
  const bf=placed.find(p=>p.name==='bangfai'); if(bf) anim.rocket={x:bf.x, y:bf.y-18};
  const kt=placed.find(p=>p.name==='kitchen'); if(kt) anim.smoke.push({x:kt.x-1, y:kt.y-9});
  for(const p of placed) if(p.name==='stilt' && pmHash(p.x,3)>0.6) anim.smoke.push({x:p.x+(p.flip?-3:3), y:p.y-14});

  /* ---- cloud, over everything you have not walked ----
     painted into a buffer of tones first and turned into pixels once: a
     page that is mostly cloud, which is every page early on, was a few
     hundred thousand little rectangles and several seconds of waiting */
  { const tone=new Uint8Array(w*h), cr=mulberry(77);
    let any=false;
    for(let row=0; row<G.rows; row++){
      const t0=G.t0(row)-y0, t1=G.t1(row)-y0;
      for(let px=x0+B; px<x0+w-B; px+=5){
        if(seenPx(px,row) && seenPx(px+4,row)) continue;
        any=true;
        for(let k=0;k<3;k++){ const cx=px-x0+cr()*5, cy=t0+4+cr()*(t1-t0-8), r0=4+cr()*6, rx=r0*1.3;
          const ya=Math.max(t0,R(cy-r0)), yb=Math.min(t1-1,R(cy+r0)), xa=Math.max(B,R(cx-rx)), xb=Math.min(w-B-1,R(cx+rx));
          for(let yy=ya; yy<=yb; yy++){ const dy=(yy-cy)/r0; for(let xx=xa; xx<=xb; xx++){
            const dx=(xx-cx)/rx; if(dx*dx+dy*dy>1) continue;
            const lit=-dx*0.5-dy*0.8+(ICO_BAYER[(yy&3)*4+(xx&3)]/16-0.5)*0.3;
            tone[yy*w+xx] = lit>0.5? 1 : lit>-0.25? 2 : lit>-0.7? 3 : 4; } } }
      }
    }
    if(any){
      const cc=mkCv(w,h), cg=cc.getContext('2d',{willReadFrequently:true}), ci=cg.createImageData(w,h), cd=ci.data;
      const TONE=[null,[255,255,255],[246,240,226],[230,220,198],[212,200,174]];
      for(let i=0;i<w*h;i++){ const t=tone[i]; if(!t) continue; const c2=TONE[t]; cd[i*4]=c2[0]; cd[i*4+1]=c2[1]; cd[i*4+2]=c2[2]; cd[i*4+3]=255; }
      cg.putImageData(ci,0,0); icoOutline(cc,'#8a7a64');
      g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cc,0,0); g.restore();
    }
  }
  /* the road you have not walked, dotted on top of the cloud */
  for(let i=0;i<path.length;i+=5){ const q=path[i]; if(!q.seen) pR(g,R(q.x),R(q.y),1,1,'rgba(74,52,36,0.6)'); }

  /* ---- the paper's age, and a border of khit ---- */
  { g.save(); g.setTransform(1,0,0,1,0,0);
    const vg=g.createRadialGradient(w/2,h/2,Math.min(w,h)*0.40,w/2,h/2,Math.max(w,h)*0.64);
    vg.addColorStop(0,'rgba(120,80,40,0)'); vg.addColorStop(1,'rgba(110,70,30,0.20)');
    g.fillStyle=vg; g.fillRect(0,0,w,h); g.restore(); }
  pmKhit(g,x0,y0,w,h);
  PMAP.anim=anim;
  return c;
}
/* khit: the diamond-and-hook weave of Isan cloth, red and gold on indigo */
function pmKhit(g,x0,y0,w,h){
  const IND='#2a2e5e', RD='#c8403a', GD='#f0c048', WT='#f4ecd8';
  pR(g,x0,y0,w,6,MAP_INK); pR(g,x0,y0+h-6,w,6,MAP_INK); pR(g,x0,y0,6,h,MAP_INK); pR(g,x0+w-6,y0,6,h,MAP_INK);
  pR(g,x0+1,y0+1,w-2,4,IND); pR(g,x0+1,y0+h-5,w-2,4,IND); pR(g,x0+1,y0+1,4,h-2,IND); pR(g,x0+w-5,y0+1,4,h-2,IND);
  const motif=(x,y,vert)=>{ const P=[[1,0,GD],[0,1,GD],[1,1,RD],[2,1,GD],[1,2,GD],[1,3,0]];
    for(const [a,b,c] of P){ if(!c) continue; const X=vert? x+b : x+a, Y=vert? y+a : y+b; pR(g,X,Y,1,1,c); } };
  for(let x=x0+7; x<x0+w-9; x+=6){ motif(x,y0+1,false); motif(x,y0+h-5,false); pR(g,x+4,y0+2,1,1,WT); pR(g,x+4,y0+h-4,1,1,WT); }
  for(let y=y0+7; y<y0+h-9; y+=6){ motif(x0+1,y,true); motif(x0+w-5,y,true); pR(g,x0+2,y+4,1,1,WT); pR(g,x0+w-4,y+4,1,1,WT); }
  for(const [cx,cy] of [[x0+3,y0+3],[x0+w-4,y0+3],[x0+3,y0+h-4],[x0+w-4,y0+h-4]]){
    pR(g,cx-3,cy-3,7,7,MAP_INK); pR(g,cx-2,cy-2,5,5,GD); pR(g,cx-1,cy-1,3,3,RD); pR(g,cx,cy,1,1,'#fff0a8'); }
  /* and a thin gold rule inside it */
  pR(g,x0+6,y0+6,w-12,1,'#c8a048'); pR(g,x0+6,y0+h-7,w-12,1,'#8a6a30');
  pR(g,x0+6,y0+6,1,h-12,'#c8a048'); pR(g,x0+w-7,y0+6,1,h-12,'#8a6a30');
}

/* ---------- the names, the pins, and you ---------- */
const PM_MED = new Map();
function pmMedal(done){
  let c=PM_MED.get(done); if(c) return c;
  c=mkCv(15,15); const g=c.getContext('2d');
  const G5=done? ramp('#9cc46a') : MA.gold;
  for(let y=0;y<15;y++) for(let x=0;x<15;x++){ const dx=x-7, dy=y-7, d=Math.hypot(dx,dy);
    let col=null;
    if(d<=7.1) col=MAP_INK;
    if(d<=6.1){ const l=(-dx-dy)/8.6; col= l>0.45? G5[0] : l>0.05? G5[1] : l>-0.4? G5[2] : G5[3]; }
    if(d<=4.6) col=done? '#eef4dc' : '#f8eed6';
    if(d<=4.6 && dx+dy>3.6) col=done? '#dce8c4' : '#eadcbc';
    if(col){ g.fillStyle=col; g.fillRect(x,y,1,1); } }
  PM_MED.set(done,c); return c;
}
/* a name tag: paper in a black line with its corners taken off. y is its bottom row */
function pmTag(g, x, y, w, hh){
  hh=(hh||10)+pmTH();
  pR(g,x+2,y-hh+3,w-1,hh-1,'rgba(40,24,16,0.28)');
  pR(g,x+1,y-hh+1,w-2,hh,MAP_INK); pR(g,x,y-hh+2,w,hh-2,MAP_INK);
  pR(g,x+1,y-hh+2,w-2,hh-2,'#f8eed4'); pR(g,x+1,y-hh+2,w-2,1,'#fffcf0'); pR(g,x+1,y-1,w-2,1,'#e2d2ae');
}
/* type with no shadow under it, for a halo of paper round a name */
function pmTxtNS(g,s,x,y,col,size,align){
  s=L(String(s)); if(!s.length) return;
  const w=txtW(s,size), dx= align==='center'? -w/2 : align==='right'? -w : 0, P=fontPick(size);
  if(!THAI_RE.test(s)){ g.drawImage(txtSprite(s,size,col,null), R(x+dx), R(y-P.h*P.s)); return; }
  let cx=x+dx;
  for(const r of txtRuns(s)){
    if(r.th){ thaiBlit(g, thaiSprite(r.s,size,col,null), cx, y); cx+=thaiMeasure(r.s,size); }
    else { g.drawImage(txtSprite(r.s,size,col,null), R(cx), R(y-P.h*P.s)); cx+=latinW(r.s,size)+1; }
  }
}
function pmHaloTxt(g,s,x,y,col,halo,size,align){
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) pmTxtNS(g,s,x+dx,y+dy,halo,size,align);
  pmTxtNS(g,s,x,y,col,size,align);
}
function drawMap(g,x0,y0,w,h){
  const G=pmGeo(x0,y0,w,h);
  const key=pmSeenKey()+'|'+x0+','+y0+','+w+','+h;
  if(PMAP.key!==key){ PMAP.key=key; PMAP.lay=pmLayout(G); PMAP.cv=pmPaint(G,PMAP.lay); }
  const lay=PMAP.lay, A=PMAP.anim||{}, t=GS.t||0;
  g.drawImage(PMAP.cv, x0, y0);

  /* what moves: the water, the smoke, a kite, a rocket, boats, birds */
  for(let i=0;i<(A.water||[]).length;i++){ const [wx,wy]=A.water[i]; const tw=Math.sin(t*2.6+i*1.7);
    if(tw>0.55) pR(g,wx,wy,1,1,'#f4fcff'); if(tw>0.9) { pR(g,wx-1,wy,1,1,'rgba(244,252,255,0.6)'); pR(g,wx+1,wy,1,1,'rgba(244,252,255,0.6)'); } }
  for(const s of (A.smoke||[])) for(let k=0;k<3;k++){ const u=((t*0.35)+k/3)%1;
    g.globalAlpha=0.7*(1-u); pEll(g,s.x+Math.sin(u*5+k)*1.2+u*3, s.y-u*9, 0.8+u*1.8, 0.8+u*1.4, '#f4f0e8'); g.globalAlpha=1; }
  if(A.kite){ const kx=A.kite.x+9+Math.sin(t*0.9)*2.2, ky=A.kite.y-12+Math.sin(t*1.7)*1.4;
    for(let i=1;i<9;i++){ const u=i/9; pR(g,R(lerp(A.kite.x,kx,u)),R(lerp(A.kite.y,ky+4,u)+Math.sin(u*Math.PI)*2),1,1,'rgba(40,30,30,0.55)'); }
    for(let i=0;i<5;i++) pR(g,R(kx+1-i*0.6+Math.sin(t*4+i)*0.8),R(ky+8+i),1,1,i%2?'#f0c040':'#e8403a');
    mapPut(g,'kite',1,kx,ky+7); }
  if(A.rocket){ const cyc=(t%9)/9;
    if(cyc<0.34){ const u=cyc/0.34, rx=A.rocket.x+u*u*6, ry=A.rocket.y-u*34;
      for(let k=1;k<7;k++){ const uu=Math.max(0,u-k*0.035); g.globalAlpha=0.55*(1-k/7); pEll(g,A.rocket.x+uu*uu*6,A.rocket.y-uu*34+2,1+k*0.3,1+k*0.3,'#f8f4ec'); }
      g.globalAlpha=1; pR(g,R(rx),R(ry),1,3,'#c8403a'); pR(g,R(rx),R(ry)-1,1,1,'#f0c040'); pR(g,R(rx),R(ry)+3,1,2,'#8a6a40'); pR(g,R(rx),R(ry)+5,1,1,'#ffd060'); }
  }
  for(const b of (A.boats||[])){ if(Math.sin(t*1.8+b.x)>0.2){ pR(g,R(b.x-7),R(b.y+1),2,1,'#a8d4e0'); pR(g,R(b.x+6),R(b.y+1),2,1,'#a8d4e0'); } }
  for(let f=0; f<2; f++){ const bx=x0+((t*6+f*230)%(w+60))-30, by=y0+30+f*62+Math.sin(t*0.4+f)*4;
    for(let k=0;k<3;k++){ const px=bx-k*5-(k===1?0:0), py=by+(k===1? -2 : k*1.5), fl=Math.sin(t*9+k)>0?1:0;
      if(px<x0+8||px>x0+w-10) continue;
      pR(g,R(px)-2,R(py)-fl,2,1,'#3a2a2a'); pR(g,R(px)+1,R(py)-fl,2,1,'#3a2a2a'); pR(g,R(px),R(py)+1-fl,1,1,'#3a2a2a'); } }

  /* the title, on a banner at the top, and how much of it you have walked */
  const ttl=L('THE ROAD'), tw=txtW(ttl,8)+16;
  pmTag(g, x0+10, y0+13, tw, 13);
  pTxt(g, ttl, x0+10+tw/2, y0+11-(pmTH()?1:0), MAP_INK, 8, 'center');
  const pc=Math.round(seenFrac()*100), tail=L('walked')+' '+pc+'%', tl=txtW(tail,6)+8;
  pmTag(g, x0+w-10-tl, y0+11, tl, 10);
  pTxt(g, tail, x0+w-10-tl/2, y0+9-(pmTH()?1:0), pc>70?'#3e5a26':MAP_INK, 6, 'center');

  /* the ghosts you have met, on the road where you met them */
  for(const sp of SPIRITS){ if(!seenAt(sp.x)) continue;
    const px=G.X(sp.x), py=G.Y(sp.x)+Math.sin(t*2+sp.x)*0.8;
    if(lay.pins.some(l=>Math.abs(l.sx-px)<9 && l.row===G.row(sp.x))) continue;
    mapPut(g,'spook',sp.friend?1:0,px,py+3);
    if(sp.friend) icoHeart(g,px+4,py-6,0.45,'#c83a5a'); }
  MAP_LABELS.length=0;
  /* a tag pushed off its stop keeps a line back to it */
  for(const l of lay.pins){ const up=l.s===0, mid=l.la+l.lw/2;
    if(Math.abs(mid-l.sx)>l.lw/2-3){ const ex= mid>l.sx? l.la+1 : l.la+l.lw-2, ey= l.tb-4-(pmTH()>>1);
      pR(g,R(Math.min(ex,l.sx)),R(ey),R(Math.abs(ex-l.sx))+1,1,MAP_INK);
      pR(g,R(l.sx),R(Math.min(ey,l.sy)),1,R(Math.abs(ey-l.sy)),MAP_INK); } }
  for(const l of lay.pins){
    const done=l.pn.done&&l.pn.done(), mid=l.la+l.lw/2;
    pmTag(g, l.la, l.tb, l.lw);
    pTxt(g, l.nm, mid, l.tb-2-(pmTH()?1:0), done?'#3e5a26':MAP_INK, 6, 'center');
    MAP_LABELS.push({n:l.nm, row:l.row, side:l.s, a:l.la-2, b:l.la+l.lw+2, y:l.tb});
  }
  for(const l of lay.pins){
    const done=l.pn.done&&l.pn.done();
    g.drawImage(pmMedal(!!done), R(l.sx)-7, R(l.sy)-7);
    mapIcon(g,l.pn.ic,l.sx,l.sy+1, done?'#3e5a26':'#3a2418', done?'#7aa050':'#a07a4a');
  }
  /* the parts of the road, written small into the country */
  for(const z of lay.zones){
    pmHaloTxt(g, z.nm, z.px, z.yy, '#3a2618', '#f0e4c4', 6, 'center');
    MAP_LABELS.push({n:z.nm, row:z.row, side:2, a:z.a, b:z.b, y:z.yy, zone:true});
  }
  /* and you: his face on a pin, bobbing */
  { const wx=clamp(P.x,0,WORLD_W-1), px=G.X(wx), py=G.Y(wx), bob=Math.sin(t*3)*1.4;
    const u=(t*0.8)%1; g.globalAlpha=0.8*(1-u);
    for(let a2=0;a2<TAU;a2+=0.14){ pR(g,R(px+Math.cos(a2)*(4+u*9)),R(py+Math.sin(a2)*(2+u*4.5)),1,1,'#e8403a'); }
    g.globalAlpha=1;
    mapShadow(g,px,py+1,3);
    mapPut(g,'me',0,px,py-1+bob); }
  /* W at the head of the road, E at the end of it */
  const wy=G.Y(0), ey=G.Y(Math.min(WORLD_W-1,EAST.edge));
  pmHaloTxt(g, compass('w'), G.mx-12, wy+3, MAP_INK, '#f0e4c4', 6, 'center');
  pmHaloTxt(g, compass('e'), G.X(EAST.edge)+11*(G.row(EAST.edge)%2?-1:1), ey+3, MAP_INK, '#f0e4c4', 6, 'center');
  /* a compass rose, a scale, and the friends you have made */
  { const cx2=x0+w-21, cy2=y0+h-15;
    pEll(g,cx2,cy2,11,11,MAP_INK); pEll(g,cx2,cy2,10,10,'#f8eed4'); pEll(g,cx2,cy2,8,8,'#efe2c2');
    for(let i=0;i<8;i++){ const a=i*Math.PI/4-Math.PI/2, L2=i%2? 4 : 8;
      pTaper(g,cx2,cy2,cx2+Math.cos(a)*(L2+1),cy2+Math.sin(a)*(L2+1), i%2?2:3.2, 1, MAP_INK); }
    for(let i=0;i<8;i++){ const a=i*Math.PI/4-Math.PI/2, L2=i%2? 4 : 8;
      pTaper(g,cx2,cy2,cx2+Math.cos(a)*L2,cy2+Math.sin(a)*L2, i%2?1:2, 0.6, i===0?'#d8403a':i%2?'#a07a4a':'#f0c048'); }
    pEll(g,cx2,cy2,1.8,1.8,MAP_INK); pR(g,cx2,cy2,1,1,'#fff0a8');
    pmTag(g, cx2-4, cy2-11, 9, 9); pTxt(g, compass('n'), cx2+0.5, cy2-13, '#b8302a', 6, 'center'); }
  { const sx=x0+16, sy=y0+h-8, sw=40, lw=txtW(L("half an hour's walk"),6);
    pmTag(g, sx-6, sy+6, sw+lw+18, 11);
    pR(g,sx-1,sy-1,sw+2,4,MAP_INK); pR(g,sx,sy,R(sw/2),2,'#f8eed4'); pR(g,sx+R(sw/2),sy,sw-R(sw/2),2,'#c8403a');
    pR(g,sx-1,sy-3,1,7,MAP_INK); pR(g,sx+sw,sy-3,1,7,MAP_INK);
    pTxt(g,L("half an hour's walk"),sx+sw+6,sy+3-(pmTH()?1:0),MAP_INK,6); }
  pmTag(g, x0+w-122, y0+h-2, 28, 11);
  icoHeart(g,x0+w-115,y0+h-7,0.7,'#c83a5a');
  pTxt(g,SPIRITS.filter(s=>s.friend).length+'/'+SPIRITS.length,x0+w-109,y0+h-4,MAP_INK,6);
}
