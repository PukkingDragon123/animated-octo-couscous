/* ============================================================
   SLOTS, DRAWERS AND PLANKS

   The pieces of the interface that hold things. A slot is a gold
   frame with an ink line round it and a curl of gold standing out
   of each corner, round a dark leather field that the icon sits
   on — so a sixteen-pixel icon with its own dark line reads against
   it rather than into it. A drawer is walnut planks with iron
   brackets at the ends. A plank is the same, long and thin, for
   the toolbar along the bottom.

   All of them are painted once for their size and kept.
   ============================================================ */
const UI_SPR = new Map();
function uiCached(key, w, h, paint){
  let c=UI_SPR.get(key);
  if(!c){ if(UI_SPR.size>300) UI_SPR.clear(); c=mkCv(w+4,h+4); const g=G2(c); paint(g,2,2); UI_SPR.set(key,c); }
  return c;
}
const UIC = { ink:'#1c1014', G:'#f2c94c', GL:'#fff0a8', GD:'#b07a1e', GX:'#7a4e12',
  lea:'#5a3a24', leaL:'#7a5234', leaD:'#3e2616', emp:'#34241a', empL:'#46321e',
  iron:'#5e7c88', ironL:'#8eb0bc', ironD:'#3a4e58', wal:'#6a4428', walL:'#8a5c36', walD:'#4a2e1a' };

function uiSlotPaint(g, x, y, w, h, on){
  const C=UIC;
  pR(g,x,y+1,w,h-2,C.ink); pR(g,x+1,y,w-2,h,C.ink);
  pR(g,x+1,y+1,w-2,h-2,C.G);
  pR(g,x+1,y+1,w-2,1,C.GL); pR(g,x+1,y+1,1,h-2,C.GL);
  pR(g,x+1,y+h-2,w-2,1,C.GD); pR(g,x+w-2,y+1,1,h-2,C.GD);
  pR(g,x+2,y+2,w-4,h-4,C.GX);
  const F=on? C.lea : C.emp, FL=on? C.leaL : C.empL;
  pR(g,x+3,y+3,w-6,h-6,F);
  /* a soft pool of light in the middle, stepped, not smooth */
  pR(g,x+5,y+5,w-10,h-10,FL); pR(g,x+4,y+6,w-8,h-12,FL);
  pR(g,x+3,y+3,w-6,1,shade(F,-0.3));
  /* the curls on the corners */
  for(const [cx,cy,sx,sy] of [[x,y,1,1],[x+w-1,y,-1,1],[x,y+h-1,1,-1],[x+w-1,y+h-1,-1,-1]]){
    pR(g,cx+sx*2,cy+sy*2,1,1,C.GL); pR(g,cx+sx*3,cy+sy*2,1,1,C.G); pR(g,cx+sx*2,cy+sy*3,1,1,C.G);
    pR(g,cx+sx*3,cy+sy*3,1,1,C.GD);
  }
}
function uiSlot(g, x, y, w, h, o){
  o=o||{};
  const c=uiCached('slot|'+w+'|'+h+'|'+(o.on?1:0), w, h, (gg,X,Y)=>uiSlotPaint(gg,X,Y,w,h,o.on));
  g.drawImage(c, R(x)-2, R(y)-2);
  if(o.sel){ const t=(typeof GS!=='undefined'? GS.t : 0), a=0.65+0.35*Math.sin(t*6);
    g.globalAlpha=a; pR(g,x-1,y-1,w+2,1,'#fff6c0'); pR(g,x-1,y+h,w+2,1,'#fff6c0');
    pR(g,x-1,y-1,1,h+2,'#fff6c0'); pR(g,x+w,y-1,1,h+2,'#fff6c0'); g.globalAlpha=1; }
}

function uiBracket(g, x, y, h){
  const C=UIC;
  pR(g,x,y,5,h,C.ink); pR(g,x+1,y+1,3,h-2,C.iron);
  pR(g,x+1,y+1,1,h-2,C.ironL); pR(g,x+3,y+1,1,h-2,C.ironD);
  for(const yy of [y+3, y+h-4]){ pR(g,x+2,yy,1,1,C.ironL); pR(g,x+2,yy+1,1,1,C.ink); }
}
function uiPlanks(g, x, y, w, h, seed){
  const C=UIC, r=mulberry(seed||7);
  pR(g,x,y+1,w,h-2,C.ink); pR(g,x+1,y,w-2,h,C.ink);
  pR(g,x+1,y+1,w-2,h-2,C.wal);
  /* planks, with their seams and their grain */
  const ph=Math.max(5, Math.min(9, R(h/3)));
  for(let yy=y+1; yy<y+h-1; yy+=ph){
    pR(g,x+1,yy,w-2,1,C.walL);
    if(yy>y+1) pR(g,x+1,yy-1,w-2,1,C.walD);
    for(let i=0;i<w/7;i++){ const gx=x+2+R(r()*(w-8)), gy=yy+1+R(r()*(ph-2));
      if(gy<y+h-2) pR(g,gx,gy,2+R(r()*4),1, r()<0.5? C.walD : shade(C.wal,0.08)); }
  }
  pR(g,x+1,y+h-2,w-2,1,C.walD);
}
function uiDrawer(g, x, y, w, h, seed){
  const c=uiCached('drawer|'+w+'|'+h+'|'+(seed||0), w, h, (gg,X,Y)=>{
    uiPlanks(gg,X,Y,w,h,seed); uiBracket(gg,X+1,Y+1,h-2); uiBracket(gg,X+w-6,Y+1,h-2); });
  g.drawImage(c, R(x)-2, R(y)-2);
}
function uiPlank(g, x, y, w, h, seed){
  const c=uiCached('plank|'+w+'|'+h+'|'+(seed||0), w, h, (gg,X,Y)=>{
    uiPlanks(gg,X,Y,w,h,seed); uiBracket(gg,X-1,Y-1,h+2); uiBracket(gg,X+w-4,Y-1,h+2); });
  g.drawImage(c, R(x)-2, R(y)-2);
}
/* a number in the corner of a slot, with a dark edge so it reads on anything */
function uiCount(g, n, x, y){
  const s=''+n;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) pTxt(g,s,x+dx,y+dy,UIC.ink,7,'right');
  pTxt(g,s,x,y,'#fff4d4',7,'right');
}

/* type with a dark edge, for anything written on wood or leather */
function uiText(g, s, x, y, col, size, align){
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1]]) pTxt(g,s,x+dx,y+dy,UIC.ink,size,align);
  pTxt(g,s,x,y,col,size,align);
}
/* the ledger is a book: a leather cover under everything, stitched round
   the edge, with brass on the corners */
function uiBookCover(g){
  const c=uiCached('cover|'+W+'|'+H, W-4, H-4, (gg,X,Y)=>{
    const w=W-4, h=H-4, r=mulberry(55);
    pR(gg,0,0,W,H,'#2a1420');
    pR(gg,X,Y,w,h,UIC.ink);
    pR(gg,X+1,Y+1,w-2,h-2,'#6a2a2a');
    for(let i=0;i<w*h/14;i++){ const x=X+2+R(r()*(w-4)), y=Y+2+R(r()*(h-4)); pR(gg,x,y,1,1, r()<0.5? '#5e2426' : '#763234'); }
    pR(gg,X+1,Y+1,w-2,1,'#8a3e3a'); pR(gg,X+1,Y+h-2,w-2,1,'#4a1a1e');
    /* the stitching, a dash at a time */
    for(let x=X+6;x<X+w-6;x+=4){ pR(gg,x,Y+4,2,1,'#d8b070'); pR(gg,x,Y+h-5,2,1,'#d8b070'); }
    for(let y=Y+6;y<Y+h-6;y+=4){ pR(gg,X+4,y,1,2,'#d8b070'); pR(gg,X+w-5,y,1,2,'#d8b070'); }
    /* brass corners */
    for(const [cx,cy,sx,sy] of [[X,Y,1,1],[X+w-1,Y,-1,1],[X,Y+h-1,1,-1],[X+w-1,Y+h-1,-1,-1]])
      for(let i=0;i<7;i++) for(let j=0;j<7-i;j++){ const col = i===0||j===0? UIC.GL : (i+j)>4? UIC.GD : UIC.G;
        pR(gg,cx+sx*(i+1),cy+sy*(j+1),1,1,col); }
  });
  g.drawImage(c,0,0);
}
/* a tab on the edge of the book: leather when shut, gold-framed page when open */
function uiTab(g, x, y, w, h, on){
  const c=uiCached('tab|'+w+'|'+h+'|'+(on?1:0), w, h, (gg,X,Y)=>{
    pR(gg,X,Y+1,w,h-1,UIC.ink); pR(gg,X+1,Y,w-2,h,UIC.ink);
    if(on){
      pR(gg,X+1,Y+1,w-2,h-1,UIC.G); pR(gg,X+1,Y+1,w-2,1,UIC.GL); pR(gg,X+w-2,Y+1,1,h-1,UIC.GD);
      pR(gg,X+2,Y+2,w-4,h-2,'#f4e3bc'); pR(gg,X+2,Y+2,w-4,1,'#fffaea');
      for(const cx of [X+2,X+w-3]) pR(gg,cx,Y+2,1,1,UIC.GD);
    } else {
      pR(gg,X+1,Y+1,w-2,h-2,'#8a3432'); pR(gg,X+1,Y+1,w-2,1,'#a84a44'); pR(gg,X+1,Y+h-2,w-2,1,'#5a1e22');
      for(let xx=X+4;xx<X+w-4;xx+=4) pR(gg,xx,Y+3,2,1,'#c89a60');
    }
  });
  g.drawImage(c, R(x)-2, R(y)-2);
}
