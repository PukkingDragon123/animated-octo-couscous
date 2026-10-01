/* ============================================================
   ISAN

   The northeast, from the road. What says it from any distance is
   the sugar palm, ต้นตาล: a bare dark trunk twice the height of a
   coconut, standing alone out in the paddies with a round crown of
   fan leaves on top and last year's fronds hanging dead under it.
   They are left standing when the field is cleared, one to a bund,
   and the whole plain is dotted with them to the horizon.

   So: sugar palms standing on the bunds of the terraces behind the
   farm and all through the far paddies, hazier the further back
   they stand; taller ones in the middle distance; a few by the road
   that move in the wind like the other trees. Out in the far
   paddies a field hut, เถียงนา, on its posts, and buffalo with an
   egret riding. In the old forest the laterite earth grows termite
   mounds, and somebody has tied a cloth round one and left a
   garland, because a mound that has stood that long is asked for
   things.

   All of it goes into the painted layers once, before the grain.
   ============================================================ */
/* a sugar palm, h pixels tall, as the road sees it */
function artSugarPalm(h, seed){
  const r=mulberry(seed), W=38, c=mkCv(W,h+2), g=G2(c), cx=R(W/2), top=13;
  /* the trunk: dark, ringed with the scars of old leaves, a little swollen at the foot */
  for(let y=top+5; y<h+2; y++){
    const lean=(seed%3-1)*0.018*(h+2-y), w2 = y>h-3? 4 : 3, x0=R(cx-1.5+lean)-(y>h-3?1:0);
    g.fillStyle=(y%4===0)? '#4e4640' : '#655c54'; g.fillRect(x0,y,w2,1);
    g.fillStyle='#857c70'; g.fillRect(x0,y,1,1);
    g.fillStyle='#3e3834'; g.fillRect(x0+w2-1,y,1,1);
  }
  /* last year's fronds, hanging dead under the crown */
  for(let k=0;k<6;k++){ const a=Math.PI*0.5+(k/5-0.5)*1.9+(r()-0.5)*0.2;
    pTaper(g,cx,top+3,cx+Math.cos(a)*9,top+3+Math.sin(a)*9,1.8,0.8,k%2?'#8a6a40':'#a8844e'); }
  /* the crown: fan leaves on their stalks the whole way round, the ones at
     the back first and darker, the ones on top last and catching the light */
  const n=22, GR=['#8cc060','#66a04a','#4e8a40','#3c7236','#2e5a2c'], fans=[];
  for(let k=0;k<n;k++){ const a=-Math.PI*0.5+(k/(n-1)-0.5)*Math.PI*1.8+(r()-0.5)*0.25; fans.push({a, L:6.5+r()*4, fr:4.6+r()*1.8}); }
  fans.sort((p2,q)=>Math.sin(q.a)-Math.sin(p2.a));
  for(const F of fans){
    const ex=cx+Math.cos(F.a)*F.L, ey=top+Math.sin(F.a)*F.L*0.84, up=-Math.sin(F.a), lit=up>0.2 && Math.cos(F.a)<0.3;
    pTaper(g,cx,top+1,ex,ey,1,1,'#6a7a3a');
    const tone = lit? 0 : up>0.5? 1 : up>-0.1? 2 : up>-0.6? 3 : 4, fr=F.fr;
    pTri(g,ex,ey,ex+Math.cos(F.a-0.8)*fr,ey+Math.sin(F.a-0.8)*fr,ex+Math.cos(F.a+0.8)*fr,ey+Math.sin(F.a+0.8)*fr,GR[tone]);
    /* the pleats of the fan, one dark line down the middle of it */
    pTaper(g,ex,ey,ex+Math.cos(F.a)*fr*0.95,ey+Math.sin(F.a)*fr*0.95,1,1,GR[Math.min(4,tone+1)]);
    if(tone<2){ g.fillStyle='#b8e088'; g.fillRect(R(ex+Math.cos(F.a-0.45)*fr*0.8),R(ey+Math.sin(F.a-0.45)*fr*0.8),1,1); }
  }
  pEll(g,cx,top+1,3.6,2.6,'#3a6630');
  /* the clusters of fruit, dark, in against the crown */
  for(const dx of [-3,2]){ pEll(g,cx+dx,top+4,1.6,1.4,'#3a2a20'); g.fillStyle='#6a4a30'; g.fillRect(cx+dx-1,top+3,1,1); }
  return c;
}
/* the same shape, gone into the haze of distance */
function hazed(img, col, k){
  const c=mkCv(img.width,img.height), g=G2(c);
  g.drawImage(img,0,0); g.globalCompositeOperation='source-atop';
  g.globalAlpha=k; g.fillStyle=col; g.fillRect(0,0,c.width,c.height);
  g.globalAlpha=1; g.globalCompositeOperation='source-over';
  return c;
}
function artFieldHut(){
  const c=mkCv(26,24), g=G2(c);
  for(const x of [4,20]) pR(g,x,11,2,13,'#6a4a2c');
  pR(g,3,16,20,2,'#a07448'); pR(g,3,16,20,1,'#c09060');
  for(let y=0;y<11;y++){ const hw=4+y*0.95; pR(g,R(13-hw),y,R(hw*2),1, y%3===0? '#b89050' : '#caa060'); }
  pR(g,1,10,24,2,'#9a7a40');
  for(let x=9;x<16;x++) for(let y=12;y<15;y++) if((x+y)%2) pR(g,x,y,1,1,'#d8443a'); else pR(g,x,y,1,1,'#f0e6d8');   // a pha khao ma drying
  return c;
}
function artBuffalo(egret){
  const c=mkCv(24,16), g=G2(c);
  for(const x of [6,9,15,18]) pR(g,x,10,2,6,'#3e3c44');
  pEll(g,12,8,8,4.2,'#5a5862'); pEll(g,11,6.4,6,2.2,'#6e6c76');
  pEll(g,4,10,3.4,2.8,'#5a5862'); pR(g,1,11,2,1,'#2a2830');
  pTaper(g,5,7.6,9,5.4,1.4,1,'#d8d0c0'); pTaper(g,3,7.6,1,5,1.2,0.8,'#d8d0c0');                   // horns, swept back
  pTaper(g,20,7,22,11,1.2,0.8,'#3e3c44');
  if(egret){ pEll(g,13,3.2,2.4,1.6,'#fbfbf4'); pEll(g,15,1.6,1,1,'#fbfbf4'); pR(g,16,1,2,1,'#f0b030'); }
  return c;
}
function artTermiteMound(seed){
  const r=mulberry(seed), c=mkCv(28,40), g=G2(c), C=['#dcaa78','#c68e5c','#a87048','#80563a'];
  pEll(g,14,37,13,3.4,C[2]);
  /* a clay castle: a main spire and two lesser ones, built up in lumps */
  pPoly(g,[0,38, 1,31, 3,26, 5,22, 6,16, 8,19, 9,11, 11,4, 12,2, 14,6, 15,14, 17,12, 19,9, 20,14, 22,20, 25,25, 27,31, 28,38],C[1]);
  pPoly(g,[0,38, 1,31, 3,26, 5,22, 6,16, 8,19, 9,11, 11,4, 12,2, 13,38],C[0]);
  pPoly(g,[19,9, 20,14, 22,20, 25,25, 27,31, 28,38, 18,38, 17,20],C[2]);
  pEll(g,5,30,4,4,C[1]); pEll(g,23,31,4.4,4,C[2]); pEll(g,14,33,8,4.6,C[1]); pEll(g,11,32,4,3,C[0]);
  for(let i=0;i<30;i++){ const y=4+r()*33, hw=2+y*0.28; pR(g,R(13+(r()-0.5)*hw*2),R(y),1,1,r()<0.6? C[3] : C[0]); }
  for(let y=8;y<36;y+=5) pR(g,R(9+y*0.1),y,R(8+y*0.2),1,C[2]);
  if(seed%2===0){ pR(g,4,27,20,3,'#d8303a'); pR(g,4,27,20,1,'#f0605a'); pR(g,12,30,3,5,'#d8303a');       // the cloth tied round it
    pEll(g,19,33,2,1.4,'#f0c040'); pEll(g,8,33,1.8,1.3,'#f08ab0'); pR(g,15,33,1,3,'#e8e0d0'); }           // a garland, a stick of incense
  return c;
}
var ISAN = { palms:[] };
function paintIsan(){
  const r=mulberry(4510);
  /* ---- the back layer: sugar palms on the bunds of the terraces ---- */
  { const g=bgG, sc=bgCv.width/WORLD_W;
    const HAZE='#9aaeb4';
    const spans=[[PADDY_A+60,PADDY_B-40,9],[9120,10560,16],[480,700,2],[6960,7200,2]];
    for(const [a,b,n] of spans) for(let i=0;i<n;i++){
      const wx=a+(b-a)*(i+0.25+r()*0.5)/n, ti=(r()*4)|0, t=ti/3, lift=11+ti*9.5;
      const h=R(lerp(84,64,t)+r()*10), img=hazed(artSugarPalm(h,(wx|0)+i), HAZE, lerp(0.22,0.55,t));
      const s2=lerp(0.66,0.46,t), x=R(wx*sc), y=R(groundY(wx))-4-lift+9;
      g.globalAlpha=lerp(0.95,0.72,t);
      g.drawImage(img, R(x-img.width*s2/2), R(y-img.height*s2), R(img.width*s2), R(img.height*s2));
      g.globalAlpha=1;
    }
    /* a field hut out in the far paddies, and buffalo with an egret up */
    for(const [wx,ti,kind] of [[9660,1,'hut'],[10180,2,'hut'],[9420,0,'buf1'],[9980,1,'buf0'],[1240,0,'buf1']]){
      const t=ti/3, lift=11+ti*9.5, x=R(wx*sc), y=R(groundY(wx))-4-lift+9;
      const src = kind==='hut'? artFieldHut() : artBuffalo(kind==='buf1');
      const img=hazed(src, HAZE, lerp(0.18,0.5,t)), s2=kind==='hut'? lerp(0.9,0.6,t) : lerp(0.7,0.5,t);
      g.drawImage(img, R(x-img.width*s2/2), R(y-img.height*s2), R(img.width*s2), R(img.height*s2));
    }
  }
  /* ---- the middle distance: a few tall ones standing up out of the plain ---- */
  { const g=midG, sc=midCv.width/WORLD_W;
    for(const wx of [820,1320,9300,9700,10150,10480,5900,7100]){
      const h=R(96+r()*20), img=hazed(artSugarPalm(h,wx|0), '#8fa4ac', 0.5), s2=0.72;
      const x=R(wx*sc), y=200+R(r()*6);
      g.globalAlpha=0.85;
      g.drawImage(img, R(x-img.width*s2/2), R(y-img.height*s2), R(img.width*s2), R(img.height*s2));
      g.globalAlpha=1;
    }
  }
  /* ---- by the road: live ones, that move in the wind with the rest ---- */
  for(const wx of [9260, 9905, 10420, 610]){
    const img=artSugarPalm(R(88+r()*12), wx);
    if(typeof treeSet==='function') treeSet().set(img,'palm');
    stamp(img, wx, groundY(wx)+2, 1);
    ISAN.palms.push(wx);
  }
  /* ---- termite mounds on the red earth of the old forest ---- */
  for(const [wx,sd] of [[4720,2],[4960,3],[5170,4],[5480,6]]) stamp(artTermiteMound(sd), wx, groundY(wx)+3, 1);
}
BUILD_STEPS.push(['sugar palms on the bunds', paintIsan]);
TH['sugar palms on the bunds'] = 'ต้นตาลบนคันนา';
