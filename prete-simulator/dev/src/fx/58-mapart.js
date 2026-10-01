/* ============================================================
   THE MAP'S LITTLE PICTURES — ISAN

   Everything that stands on the new map is a small sprite painted
   a pixel at a time the way the item icons are: light from the top
   left, three or four tones down each form, and one black line
   round the outside. They are the things you would see from a hill
   over a village in the northeast: sugar palms standing alone in
   the paddies, houses up on their posts with the jars and the loom
   underneath, the little rice barns, field huts, the sim and the
   lotus-bud that of an Isan wat, buffalo with an egret riding,
   laterite forest and its termite mounds, the Mekong with the
   fishing boats on it, the red lotus sea, flat-topped sandstone
   hills, a Khmer prasat, a morlam stage, a bang fai tower, and a
   kid with a humming kite.

   Each is painted once and kept. map(name, variant) returns it.
   ============================================================ */
var MAP_INK = '#1a1216';
const MSPR = new Map();
/* the palettes: a five-step ramp each, lit to dark */
const MA = {
  leaf: ramp('#5a9a44'), leafD: ramp('#3a7440'), olive: ramp('#8c9c46'), palm: ramp('#4a8a3c'),
  young: ramp('#86c052'), bark: ramp('#6e4e34'), trunkG: ramp('#7a7266'), wood: ramp('#a8744a'),
  woodD: ramp('#7a5236'), thatch: ramp('#c9a45e'), zinc: ramp('#98a6b0'), tile: ramp('#b4523a'),
  white: ramp('#ece4d2'), gold: ramp('#e8b438'), brick: ramp('#b0603e'), laterite: ramp('#b86a40'),
  sand: ramp('#d8b884'), stone: ramp('#a49c8a'), sandst: ramp('#c8a47a'), water: ramp('#5e9cb6'),
  pink: ramp('#ec6c9c'), buff: ramp('#5a5862'), albino: ramp('#e0a89a'), straw: ramp('#e0c066'),
  red: ramp('#d8443a'), blue: ramp('#4a78c0'), sky: ramp('#7ab4d8'), clay: ramp('#b8683c'),
  skin: ramp('#d8a070'), ghost: ramp('#e6ecef'), ele: ramp('#8c8a92'), purple: ramp('#9a4ab0'),
  orange: ramp('#e88a30'), cream: ramp('#f0e2c0'), mint: ramp('#a8d0b4'), black: ramp('#3a3440'),
};
/* name: [w, h, paint(p, variant, rnd)] — w and h leave out the pixel of line round it */
const MSD = {};
function mapArt(name, v){
  v = v||0;
  const key = name+'|'+v;
  let c = MSPR.get(key); if(c) return c;
  const d = MSD[name]; if(!d) return null;
  const w = typeof d[0]==='function'? d[0](v) : d[0], h = typeof d[1]==='function'? d[1](v) : d[1];
  c = mkCv(w+2, h+2);
  const g = c.getContext('2d',{willReadFrequently:true}); g.imageSmoothingEnabled=false;
  d[2](icoPainter(g), v, mulberry(7001 + v*131 + name.length*17), w, h);
  icoOutline(c, MAP_INK);
  MSPR.set(key, c); return c;
}
/* a sprite by its foot: x the middle, y the ground it stands on */
function mapPut(g, name, v, x, y, flip){
  const c = mapArt(name, v); if(!c) return null;
  const X = R(x - c.width/2), Y = R(y - c.height + 1);
  if(flip){ g.save(); g.translate(X + c.width, Y); g.scale(-1,1); g.drawImage(c,0,0); g.restore(); }
  else g.drawImage(c, X, Y);
  return c;
}
/* a small shadow thrown down and to the right, the light being top left */
function mapShadow(g, x, y, rx){
  g.fillStyle='rgba(52,36,24,0.26)';
  const r2=Math.max(1,R(rx));
  for(let i=-r2;i<=r2;i++){ const t=1-(i*i)/(r2*r2+0.01); if(t<=0) continue;
    const hw=Math.max(0,R(Math.sqrt(t)*1.2)); g.fillRect(R(x+1+i), R(y)-hw+1, 1, hw*2+1); }
}

/* ---------------- trees and palms ---------------- */
/* the sugar palm: the one shape that says Isan from any distance — a bare
   straight trunk standing alone on a paddy bund with a round fan of a crown */
MSD.palmyra = [11, v=>12+(v%3), (p,v,r,w,h)=>{
  const top=4;
  for(let y=top+3;y<h;y++){ p.px(5,y,MA.trunkG[y%4===0?1:2]); p.px(6,y,MA.trunkG[3]); }
  p.px(4,h-1,MA.trunkG[3]); p.px(7,h-1,MA.trunkG[4]);
  /* last year's fronds, hanging dead under the crown */
  p.line(3,top+3,2,top+6,'#8a6a40'); p.line(8,top+3,9,top+7,'#7a5a36'); p.line(6,top+4,7,top+7,'#8a6a40');
  p.ball(5.5,top+1,4.6,3.4,MA.palm,{spec:false,dither:0.18});
  for(const [x,y,t] of [[0,top+1,3],[1,top-2,2],[3,top-3,1],[6,top-4,1],[9,top-2,2],[10,top+1,3],[1,top+4,3],[9,top+4,4]]) p.px(x,y,MA.palm[t]);
  p.px(3,top-1,MA.palm[0]); p.px(4,top-2,MA.palm[0]);
  p.line(5,top+1,2,top-1,MA.palm[1]); p.line(6,top+1,8,top-2,MA.palm[2]); p.line(5,top+2,1,top+2,MA.palm[2]); p.line(6,top+2,10,top+2,MA.palm[3]);
}];
MSD.coco = [13, 13, (p,v)=>{
  const s=v%2? 1 : -1, tx=6+s*2, ty=4;
  p.tube([[6,12],[6+s*0.4,9],[6+s*1.2,6],[tx,ty]],2,MA.bark);
  for(const [dx,dy,t] of [[-6,5,2],[6,5,2],[-6,1,1],[6,1,1],[-3,-3,1],[3,-3,0]]){
    const mx=tx+dx*0.5, my=ty+Math.min(dy,0)*0.6-1.6;
    p.line(tx,ty,mx,my,MA.palm[t]); p.line(mx,my,tx+dx,ty+dy,MA.palm[t]);
    p.line(tx,ty+1,mx,my+1,MA.palm[t+2]); p.line(mx,my+1,tx+dx,ty+dy+1,MA.palm[t+2]); }
  p.px(tx-1,ty+1,'#6a4a22'); p.px(tx+1,ty+1,'#7a5a2a'); p.px(tx,ty+2,'#5a3e1c');
}];
/* a round tree in three sizes: mango, tamarind, the trees round a house */
function mapTree(size){ return [[9,12,15][size], [9,12,15][size], (p,v,r,w,h)=>{
  const pal = [MA.leafD, MA.leaf, MA.olive][v%3], cx=w/2, R0=w*0.44;
  p.rect(cx-1,h-4,2,4,MA.bark[2]); p.px(cx,h-4,MA.bark[3]); p.px(cx,h-1,MA.bark[3]);
  if(size>0) p.px(cx-2,h-3,MA.bark[3]);
  p.ball(cx-R0*0.42,h*0.54,R0*0.62,R0*0.56,pal,{spec:false,dither:0.22});
  p.ball(cx+R0*0.44,h*0.56,R0*0.6,R0*0.54,pal,{spec:false,dither:0.22});
  p.ball(cx,h*0.40,R0*0.8,R0*0.64,pal,{spec:false,dither:0.22});
  /* a few clumps of leaf catching the light */
  for(let i=0;i<size+2;i++){ const a=r()*TAU, d=r()*R0*0.5; p.px(cx-1+Math.cos(a)*d, h*0.36+Math.sin(a)*d*0.6, pal[0]); }
  if(v%5===1) for(let i=0;i<3;i++) p.px(cx-R0*0.6+r()*R0*1.2, h*0.46+r()*R0*0.5, v%2? '#f0c040' : '#e8603a');   // fruit
}]; }
MSD.tree0 = mapTree(0); MSD.tree1 = mapTree(1); MSD.tree2 = mapTree(2);
/* the dry dipterocarp forest of the Khorat plateau: tall, thin, crooked,
   light-crowned, with the red earth showing between them */
MSD.dipt = [10, 13, (p,v,r,w,h)=>{
  const lean=(v%3)-1;
  p.line(5,h-1,5+lean,h-5,MA.bark[2],2); p.line(5+lean,h-5,5+lean*0.5,h-8,MA.bark[2]);
  p.line(5+lean,h-5,5+lean+2.4,h-7,MA.bark[3]);
  p.ball(4+lean,4.4,3.4,2.4,MA.olive,{spec:false,dither:0.25});
  p.ball(7+lean,5.4,2.6,1.9,MA.olive,{spec:false,dither:0.25});
  p.ball(5.2+lean,2.4,2.4,2,MA.olive,{spec:false,dither:0.25});
  p.px(3+lean,1,MA.olive[0]); p.px(4+lean,1,MA.olive[1]);
}];
MSD.banana = [11, 11, (p,v,r,w,h)=>{
  const L=ramp('#7cbc4c');
  p.rect(4,h-5,2,5,ramp('#9ab458')[2]); p.px(5,h-5,ramp('#9ab458')[3]);
  icoLeaf(p,5,h-5,0,h-8,1.6,L,false); icoLeaf(p,5,h-5,10,h-7,1.6,L,false);
  icoLeaf(p,5,h-6,1,1,1.5,L,false);   icoLeaf(p,5,h-6,9,0,1.5,L,false);
  icoLeaf(p,5,h-6,5,0,1.3,L,false);
  if(v%2) { p.px(7,h-4,'#c8b040'); p.px(7,h-3,'#b89a30'); p.px(8,h-3,'#7a2a3a'); }   // a bunch, and its flower
}];
MSD.bamboo = [11, 14, (p,v,r,w,h)=>{
  const C=ramp('#9ab84a');
  for(const [x1,y1] of [[1,3],[3,1],[5,0],[8,1],[10,3]]){ p.line(5,h-1,x1,y1,C[x1<5?1:2]); }
  for(const [x,y] of [[2,4],[4,2],[6,1],[8,3],[1,6],[9,6],[3,5],[7,5]]){ p.px(x,y,MA.leaf[1]); p.px(x+1,y,MA.leaf[2]); }
  p.px(4,h-4,C[3]); p.px(6,h-5,C[3]);
}];
MSD.bush = [7, 5, (p,v)=>{ p.ball(3.5,3,3.2,2.2,[MA.leaf,MA.leafD,MA.olive][v%3],{spec:false,dither:0.2});
  if(v%4===1){ p.px(2,2,'#f07aa0'); p.px(5,3,'#f0c040'); } }];
MSD.deadtree = [12, 13, (p,v)=>{
  const C=MA.trunkG;
  p.line(6,12,6,5,C[2],2); p.line(6,6,2,2,C[2]); p.line(6,6,10,1,C[3]); p.line(6,8,10,6,C[3]);
  p.line(3,3,1,3,C[3]); p.line(9,2,11,3,C[3]);
  /* two crows on it */
  p.rect(1,1,2,1,'#2a2430'); p.px(1,0,'#2a2430'); p.px(0,1,'#e0a040');
  p.rect(9,0,2,1,'#2a2430'); p.px(10,0,'#2a2430');
}];
MSD.bodhi = [19, 17, (p,v,r,w,h)=>{
  p.rect(8,h-7,3,7,MA.bark[2]); p.px(10,h-7,MA.bark[3]); p.px(10,h-5,MA.bark[3]);
  /* the props people lean against an old bo tree, and the cloth round it */
  p.line(4,h-1,8,h-6,MA.wood[1]); p.line(15,h-1,11,h-6,MA.wood[2]);
  p.rect(8,h-5,3,1,'#e8403a'); p.rect(8,h-4,3,1,'#f0c040'); p.rect(8,h-3,3,1,'#4aa86a');
  p.ball(5,6.6,4.6,3.6,MA.leafD,{spec:false,dither:0.2}); p.ball(14,6.8,4.4,3.6,MA.leafD,{spec:false,dither:0.2});
  p.ball(9.5,4.6,6.4,4.2,MA.leaf,{spec:false,dither:0.2});
  p.px(7,2,MA.leaf[0]); p.px(8,2,MA.leaf[0]); p.px(12,3,MA.leaf[1]);
}];

/* ---------------- houses and the things round them ---------------- */
/* the Isan house: up on posts, the floor a man's height off the ground,
   and underneath it the loom, the jars, and the hammock in the shade */
MSD.stilt = [18, 13, (p,v)=>{
  const roof = [MA.zinc, MA.tile, MA.thatch][v%3], W0=MA.wood;
  /* the posts and the dark under the house */
  p.rect(2,8,10,5,'#5a4436');
  for(const x of [2,6,11]) p.rect(x,8,1,5,MA.woodD[2]);
  if(v%2){ p.line(3,10,6,11,'#d86a4a'); p.line(6,11,10,10,'#d86a4a'); }      // the hammock
  else { p.ball(8.5,11.4,1.4,1.4,MA.clay,{spec:false}); p.ball(4,11.6,1.2,1.2,MA.clay,{spec:false}); }
  /* the floor and the walls, plank by plank */
  p.rect(1,7,13,1,MA.woodD[3]);
  p.rect(2,4,11,3,W0[2]); for(let x=3;x<13;x+=2) p.rect(x,4,1,3,W0[1]);
  p.rect(12,4,1,3,W0[3]);
  p.rect(6,4,2,3,'#3a2a22');                                                   // the door
  p.rect(9,5,2,1,'#2e2a32'); p.px(9,4,'#6a86a0');                              // a window
  /* the platform out front, and the ladder down from it */
  p.rect(13,7,4,1,W0[1]); p.px(16,8,W0[3]);
  for(let y=8;y<13;y++){ p.px(14,y,W0[3]); if(y%2) p.px(15,y,W0[2]); }
  p.px(16,6,'#4aa04a'); p.px(16,5,'#5ab85a'); p.px(15,6,'#b8683c');             // a pot of basil on the rail
  /* the roof: a steep gable, lit on the left */
  for(let y=0;y<4;y++){ const hw=1.5+y*1.9;
    for(let x=R(7-hw); x<=R(7+hw); x++) p.px(x,y, x<7? roof[y===0?0:1] : x===7? roof[1] : roof[3]); }
  if(v%3===0) for(let x=2;x<13;x+=2) p.px(x,3,roof[4]);                         // zinc ribs
  p.rect(0,3,15,1,roof[3]); p.px(7,0,roof[0]);
}];
MSD.granary = [10, 12, (p,v)=>{
  const roof = v%2? MA.zinc : MA.thatch;
  for(const x of [2,7]) p.rect(x,7,1,5,MA.woodD[2]);
  p.rect(1,4,8,4,MA.wood[2]); p.rect(1,4,1,4,MA.wood[1]); p.rect(8,4,1,4,MA.wood[3]); p.rect(4,5,2,2,'#3a2a22');
  for(let y=0;y<4;y++){ const hw=2+y*1.3; for(let x=R(4.5-hw); x<=R(4.5+hw); x++) p.px(x,y, x<5? roof[1] : roof[3]); }
  p.line(9,6,9.6,11,MA.wood[1]);                                               // a ladder leant on it
}];
/* the field hut: a platform and a roof out in the paddy, for the noon heat */
MSD.hut = [11, 9, (p,v)=>{
  for(const x of [1,9]) p.rect(x,3,1,6,MA.woodD[2]);
  p.rect(1,6,9,1,MA.wood[1]); p.rect(1,7,9,1,MA.wood[3]);
  for(let y=0;y<3;y++){ const hw=2+y*1.8; for(let x=R(5-hw); x<=R(5+hw); x++) p.px(x,y, x<5? MA.thatch[1] : MA.thatch[3]); }
  /* a pha khao ma hung to dry: red and white check */
  for(let x=3;x<7;x++) for(let y=3;y<5;y++) p.px(x,y, (x+y)%2? '#d8443a' : '#f4ecde');
}];
MSD.jars = [7, 5, (p)=>{ p.ball(2.2,2.8,2.2,2.2,MA.clay,{spec:true}); p.ball(5.2,3.2,1.8,1.8,MA.clay,{spec:false});
  p.rect(1,0,3,1,'#3a2418'); p.px(5,1,'#3a2418'); }];
MSD.spirit = [8, 12, (p)=>{
  p.rect(3,6,2,6,MA.white[2]); p.px(4,6,MA.white[3]); p.px(4,9,MA.white[3]);
  p.rect(1,5,6,1,MA.gold[2]);
  p.rect(2,2,4,3,MA.white[1]); p.px(5,2,MA.white[3]); p.px(5,3,MA.white[3]); p.px(3,3,'#8a3a2a');
  p.tri(0.5,2.4,3.5,-0.4,6.5,2.4,MA.gold[1]); p.px(3,0,MA.gold[0]);
  p.px(1,6,'#f07aa0'); p.px(1,7,'#f0c040'); p.px(6,6,'#f07aa0'); p.px(6,7,'#f0c040');     // garlands
  p.px(2,4,'#e8303a');                                                           // the red soda
}];
MSD.cart = [10, 10, (p,v)=>{
  p.rect(1,5,8,3,v%2? MA.blue[2] : MA.red[2]); p.rect(1,5,8,1,'#f4ecde'); p.rect(2,6,3,1,'#bfe0e8');
  p.ball(2.5,8.6,1.2,1.2,MA.black,{spec:false}); p.ball(7.5,8.6,1.2,1.2,MA.black,{spec:false});
  p.rect(5,2,1,3,MA.trunkG[2]);
  for(let x=0;x<10;x++){ const y=R(2-Math.sin((x+0.5)/10*Math.PI)*2); p.px(x,y+1, x%3===0? '#f4ecde' : '#e8503a'); if(y+2<3) p.px(x,y+2,x%3===0?'#d8ccbc':'#b83a2e'); }
}];
MSD.kitchen = [13, 11, (p)=>{
  for(const x of [1,11]) p.rect(x,3,1,8,MA.woodD[2]);
  for(let y=0;y<3;y++){ const hw=3+y*1.8; for(let x=R(6-hw); x<=R(6+hw); x++) p.px(x,y, x<6? MA.thatch[1] : MA.thatch[3]); }
  p.rect(3,7,5,3,MA.clay[2]); p.rect(3,7,5,1,MA.clay[1]); p.rect(4,8,2,1,'#f09030'); p.px(5,8,'#ffd060');   // the stove, lit
  p.ball(5.5,6,2.2,1.4,MA.black,{spec:false});                                  // the pot on it
  p.rect(9,5,2,1,MA.wood[1]); p.px(9,4,'#e8e0d0'); p.px(10,4,'#88b0d8');        // a shelf, a bowl, a cup
}];
MSD.bench = [10, 6, (p)=>{
  p.rect(0,1,10,2,MA.wood[1]); p.rect(0,2,10,1,MA.wood[3]);
  p.rect(1,3,1,3,MA.woodD[2]); p.rect(8,3,1,3,MA.woodD[2]);
  p.rect(2,0,3,1,'#9aa0a8'); p.px(6,0,MA.wood[0]); p.px(7,0,'#6a4a2c');         // a saw, a mallet
  p.px(4,5,'#e8c890'); p.px(6,5,'#e8c890');
}];
MSD.log = [12, 5, (p)=>{
  p.tube([[1,2.5],[10,2]],3,MA.bark);
  p.ball(10.4,2.2,1.5,1.8,ramp('#c89a64'),{spec:false}); p.px(10,2,MA.wood[3]);
  p.px(4,0,MA.bark[2]); p.px(4,1,MA.bark[2]); p.px(6,1,'#5ab84a'); p.px(7,1,'#6ac85a');
}];
MSD.lamp = [6, 12, (p)=>{
  p.rect(3,1,1,11,MA.trunkG[1]); p.px(4,2,MA.trunkG[3]);
  p.rect(0,0,4,1,MA.trunkG[2]); p.rect(0,1,2,1,'#4a4038'); p.px(0,2,'#6a6258');   // the head, dark
  p.rect(2,11,3,1,MA.trunkG[3]);
}];
MSD.grave = [11, 6, (p)=>{
  p.ball(5.5,4.4,5,2.4,ramp('#9a7a52'),{spec:false,dither:0.2});
  p.rect(5,0,1,4,MA.wood[2]); p.rect(4,1,3,1,MA.wood[1]);
  p.px(2,3,'#f09a28'); p.px(3,4,'#f0c040'); p.px(8,3,'#f09a28'); p.px(9,4,'#f0e060');   // marigolds
  p.px(7,2,'#fff0c0');                                                            // a candle
}];
MSD.ruinstupa = [9, 11, (p)=>{
  const B=MA.brick;
  p.rect(0,8,9,3,B[3]); p.rect(0,8,9,1,B[2]);
  p.rect(2,4,5,4,B[2]); p.rect(2,4,1,4,B[1]); p.rect(6,4,1,4,B[3]);
  p.rect(3,2,3,2,B[2]); p.px(3,1,B[1]); p.px(5,1,B[3]);                          // the top broken off
  for(let y=5;y<11;y+=2) for(let x=(y%4?1:3);x<8;x+=4) p.px(x,y,B[4]);           // the courses
  p.px(4,0,'#5aa84a'); p.px(3,0,'#4a9a44'); p.px(5,0,'#6ab85a');                 // a sapling in the top
}];
MSD.bonestupa = [5, 9, (p)=>{
  const Wt=MA.white;
  p.rect(0,7,5,2,Wt[2]); p.rect(0,7,5,1,Wt[1]); p.px(4,8,Wt[3]);
  p.rect(1,4,3,3,Wt[1]); p.px(3,4,Wt[3]); p.px(3,5,Wt[3]); p.px(2,5,'#c89a40');
  p.rect(2,2,1,2,Wt[1]); p.px(2,1,MA.gold[1]); p.px(2,0,MA.gold[0]);
}];
/* a termite mound of the dry forest: a clay castle with its spires up, and
   a cloth tied round it by somebody who asks it for lottery numbers */
MSD.termite = [7, 9, (p,v)=>{
  const C=ramp('#c88a58');
  p.poly([0,8, 1,5, 2,3, 3,0, 4,3, 5,2, 6,5, 7,8],C[2]);
  p.poly([0,8, 1,5, 2,3, 3,0, 3,8],C[1]);
  p.px(5,2,C[1]); p.px(6,5,C[3]); p.px(5,6,C[3]); p.px(2,6,C[3]); p.px(4,4,C[3]);
  p.rect(1,7,6,1,C[3]);
  if(v%2===0){ p.px(2,5,'#e8403a'); p.px(3,5,'#e8403a'); p.px(4,5,'#f0c040'); }
}];
MSD.scarecrow = [7, 10, (p)=>{
  p.rect(3,3,1,7,MA.wood[2]); p.rect(0,4,7,1,MA.wood[2]);
  for(let x=1;x<6;x++) for(let y=4;y<7;y++) p.px(x,y,(x+y)%2? '#d8443a':'#3a58a0');
  p.ball(3.5,2,1.4,1.4,MA.cream,{spec:false}); p.rect(1,0,5,1,MA.straw[2]); p.px(3,0,MA.straw[1]);
}];
MSD.haystack = [9, 9, (p)=>{
  p.ball(4.5,5.4,4.2,3.6,MA.straw,{spec:false,dither:0.3});
  p.rect(4,0,1,3,MA.wood[2]);
  for(const [x,y] of [[2,5],[4,7],[6,4],[3,3],[7,6]]) p.px(x,y,MA.straw[3]);
}];
/* the stone jars and the well of a courtyard are the jars; the rest is chickens */
MSD.chicken = [5, 5, (p,v)=>{
  const B = v%2? MA.cream : ramp('#b8683c');
  p.ball(2.4,3,2,1.5,B,{spec:false}); p.ball(3.6,1.6,1,1,B,{spec:false});
  p.px(4,0,'#e8303a'); p.px(5,1,'#f0b030'); p.px(0,1,v%2?'#d8ccbc':'#2a4a3a'); p.px(0,2,v%2?'#c8bcac':'#305848');
  p.px(2,4,'#e0a030');
}];

/* ---------------- the wat ---------------- */
/* the sim: an Isan ordination hall is small and low and white, with a roof
   in two tiers and the chofa horns up at the ends of the ridge */
MSD.sim = [23, 17, (p)=>{
  const Wt=MA.white, T=MA.tile, G=MA.gold;
  p.rect(1,14,21,3,Wt[2]); p.rect(1,14,21,1,Wt[1]); p.rect(1,16,21,1,Wt[3]);
  p.rect(9,14,5,3,Wt[1]); for(let y=14;y<17;y++){ p.px(8,y,'#4a9a5a'); p.px(14,y,'#4a9a5a'); }   // the naga stair
  p.rect(3,8,17,6,Wt[1]); p.rect(18,8,2,6,Wt[3]);
  p.rect(10,10,3,4,'#6a2a22'); p.rect(10,10,3,1,G[2]);                           // the door
  for(const x of [5,15]){ p.rect(x,10,2,2,'#3a3040'); p.px(x,9,G[2]); p.px(x+1,9,G[2]); }
  /* the lower tier of roof */
  for(let y=4;y<9;y++){ const hw=7+(y-4)*1.1; for(let x=R(11-hw); x<=R(11+hw); x++) p.px(x,y, x<11? T[y%2?1:2] : T[y%2?3:4]); }
  /* the upper tier, gable to the front, gold in its face */
  for(let y=1;y<6;y++){ const hw=1+(y-1)*1.4; for(let x=R(11-hw); x<=R(11+hw); x++) p.px(x,y, G[x<11? 1 : 3]); }
  p.px(11,3,G[0]); p.px(11,4,'#c84a2a');
  p.px(11,0,G[0]); p.px(0,7,G[1]); p.px(22,7,G[3]); p.px(0,6,G[1]); p.px(22,6,G[3]);   // chofa, and the tails at the eaves
}];
/* the that: a tall square spire gathered in to a lotus bud, like Phra That Phanom */
MSD.that = [11, 20, (p)=>{
  const Wt=MA.white, G=MA.gold;
  p.rect(0,17,11,3,Wt[2]); p.rect(0,17,11,1,Wt[1]); p.rect(9,17,2,3,Wt[3]);
  p.rect(1,14,9,3,Wt[1]); p.rect(8,14,2,3,Wt[3]);
  p.rect(2,9,7,5,Wt[1]); p.rect(7,9,2,5,Wt[3]);
  for(const y of [10,12]) for(let x=3;x<7;x+=2) p.px(x,y,G[2]);
  p.rect(4,11,2,2,'#b85a3a');
  for(let y=5;y<9;y++){ const hw=R(3.2-(y-5)*0.4); for(let x=5-hw;x<=5+hw;x++) p.px(x,y, x>5? G[3] : G[1]); }
  p.rect(4,3,3,2,G[2]); p.px(4,3,G[0]); p.px(6,4,G[3]);
  p.rect(5,1,1,2,G[1]); p.rect(4,1,3,1,G[2]); p.px(5,0,G[0]);
}];
MSD.sala = [15, 10, (p)=>{
  for(let y=0;y<4;y++){ const hw=4+y*1.2; for(let x=R(7-hw); x<=R(7+hw); x++) p.px(x,y, x<7? MA.tile[1] : MA.tile[3]); }
  p.rect(1,3,13,1,MA.tile[4]);
  for(const x of [2,12]) p.rect(x,4,1,5,MA.white[2]);
  p.rect(7,4,1,5,MA.white[3]);
  p.rect(1,8,13,2,MA.wood[2]); p.rect(1,8,13,1,MA.wood[1]);
}];
MSD.chedi = [7, 12, (p)=>{
  const Wt=MA.white, G=MA.gold;
  p.rect(0,10,7,2,Wt[2]); p.rect(0,10,7,1,Wt[1]);
  p.ball(3.5,7.6,2.8,2.6,Wt,{spec:false}); p.rect(2,4,3,1,G[2]);
  p.rect(3,1,1,3,G[1]); p.px(3,0,G[0]); p.px(4,2,G[3]);
}];
MSD.wall = [6, 4, (p)=>{ p.rect(0,1,6,3,MA.white[1]); p.rect(0,0,6,1,MA.tile[2]); p.rect(0,3,6,1,MA.white[3]); }];

/* ---------------- town ---------------- */
MSD.shophouse = [12, 15, (p,v)=>{
  const F = [MA.cream, MA.mint, MA.sky, ramp('#e4c0c0')][v%4];
  p.rect(0,0,12,15,F[2]); p.rect(0,0,12,1,F[1]); p.rect(11,0,1,15,F[3]);
  for(const x of [2,7]){ p.rect(x,2,3,3,'#3e4a5a'); p.rect(x,2,3,1,'#8aa8c0'); }
  if(v%3===1){ p.px(3,5,'#4aa04a'); p.px(8,5,'#5ab85a'); }                      // pots on the ledge
  p.rect(0,7,12,2,[MA.red,MA.blue,MA.orange,MA.purple][v%4][2]);
  for(let x=2;x<10;x+=2) p.px(x,7,'#fff4e0');                                   // the sign, its letters too small to read
  p.rect(1,9,10,6,'#8a94a0'); for(let y=10;y<15;y+=2) p.rect(1,y,10,1,'#a8b2bc');
  p.rect(1,9,5,6,'#3a3038'); p.px(2,13,'#e8503a'); p.px(3,12,'#f0c040'); p.px(4,13,'#4ab0d8');   // open: the goods inside
}];
MSD.shop = [18, 13, (p)=>{
  p.rect(1,3,16,10,MA.cream[2]); p.rect(16,3,1,10,MA.cream[3]);
  p.rect(0,0,18,3,MA.red[2]); p.rect(0,0,18,1,MA.red[1]); for(let x=3;x<15;x+=2) p.px(x,1,'#fff4e0');
  for(let x=0;x<18;x++) p.px(x,3,x%4<2? '#3a78c8' : '#f4f0e4'); for(let x=0;x<18;x++) p.px(x,4,x%4<2? '#2a5aa0' : '#d4d0c4');
  p.rect(2,5,9,8,'#3a3038');
  for(let y=6;y<12;y+=2) for(let x=3;x<10;x++) p.px(x,y,['#e8503a','#f0c040','#4ab0d8','#5ac05a','#f4ecde'][(x+y)%5]);
  p.rect(12,8,4,4,'#e8f0f4'); p.rect(12,8,4,1,'#4a88c8');                        // the ice chest
  p.rect(12,6,3,1,MA.wood[1]);
}];
MSD.busstop = [12, 9, (p)=>{
  p.rect(0,0,12,2,MA.white[1]); p.rect(0,1,12,1,'#3a78c8');
  for(const x of [1,10]) p.rect(x,2,1,7,MA.trunkG[2]);
  p.rect(2,2,8,4,MA.white[2]); p.rect(3,3,3,1,'#3a78c8');
  p.rect(2,6,8,1,MA.wood[1]); p.rect(3,7,1,2,MA.woodD[2]); p.rect(8,7,1,2,MA.woodD[2]);
}];
MSD.pole = [5, 14, (p)=>{ p.rect(2,1,1,13,MA.trunkG[1]); p.px(2,6,MA.trunkG[3]); p.rect(0,1,5,1,MA.trunkG[2]); p.px(0,0,'#e8e0d0'); p.px(4,0,'#e8e0d0'); }];
MSD.songthaew = [14, 8, (p,v)=>{
  const C = v%2? MA.blue : MA.red;
  p.rect(0,0,9,1,C[1]); for(const x of [0,8]) p.rect(x,1,1,4,C[2]);
  p.rect(0,4,13,2,C[2]); p.rect(0,4,13,1,C[1]); p.rect(9,1,4,4,C[2]); p.rect(10,2,2,2,'#bfe0f0');
  p.px(3,3,'#d8a070'); p.px(5,3,'#6a4a3a'); p.px(3,2,'#2a2028'); p.px(5,2,'#2a2028');     // somebody riding
  p.ball(3,6.4,1.4,1.4,MA.black,{spec:false}); p.ball(10.5,6.4,1.4,1.4,MA.black,{spec:false});
}];
/* the iron buffalo: the walking-tractor engine bolted to a cart that Isan
   drives to market and to the fields */
MSD.etaen = [12, 8, (p,v)=>{
  p.rect(0,3,7,2,MA.wood[2]); p.rect(0,3,7,1,MA.wood[1]);
  p.rect(7,2,4,3,v%2? '#3a8a5a':'#3a68b0'); p.rect(8,1,1,1,'#2a2a30'); p.rect(8,0,1,1,'#6a6a70');
  p.px(5,1,'#d8a070'); p.px(5,2,'#e8503a'); p.px(4,0,MA.straw[1]); p.px(5,0,MA.straw[1]); p.px(6,0,MA.straw[2]);
  p.ball(2,6,1.6,1.6,MA.black,{spec:false}); p.ball(9.5,6,1.8,1.8,MA.black,{spec:false}); p.px(9,5,'#8a8a90');
}];

/* ---------------- water ---------------- */
MSD.boat = [15, 7, (p,v)=>{
  const H=MA.woodD;
  for(let x=0;x<15;x++){ const lift = x<2? 2-x : x>12? x-12 : 0; p.px(x,4-lift,H[1]); p.px(x,5-lift+ (lift?0:0),H[2]); if(!lift) p.px(x,6,H[3]); }
  p.rect(2,4,11,1,H[2]);
  /* the fisherman in his hat, casting */
  p.rect(10,2,2,2,v%2? '#3a68b0' : '#d8443a'); p.px(10,1,'#d8a070');
  p.rect(9,0,4,1,MA.straw[1]); p.px(12,0,MA.straw[3]);
  p.line(9,2,4,0,'#8a8a80');
  if(v%2===0) for(const [x,y] of [[1,1],[2,0],[3,1],[2,2]]) p.px(x,y,'#b8c0c0');
}];
MSD.raft = [16, 10, (p)=>{
  p.rect(0,8,16,2,MA.straw[2]); for(let x=0;x<16;x+=2) p.px(x,9,MA.straw[3]);
  p.rect(2,4,11,4,MA.wood[2]); p.rect(12,4,1,4,MA.wood[3]); p.rect(6,5,2,3,'#3a2a22');
  for(let y=0;y<4;y++){ const hw=4+y*1.7; for(let x=R(7.5-hw); x<=R(7.5+hw); x++) p.px(x,y, x<7? MA.zinc[1] : MA.zinc[3]); }
  p.px(14,7,'#4aa04a'); p.px(14,6,'#5ab85a'); p.px(1,7,'#d8443a'); p.px(1,6,'#f4ecde');
}];
MSD.lotus = [8, 5, (p,v)=>{
  p.ell(2,3.4,2,1.2,'#4e9a4e'); p.ell(5.5,3.6,2.2,1.2,'#5aa652'); p.ell(4,2.2,1.6,1,'#6ab85a'); p.px(2,3,'#3a7a40');
  if(v%3!==2){ p.px(4,0,'#ffb0cc'); p.px(4,1,'#ec6c9c'); p.px(3,1,'#f08ab0'); p.px(5,1,'#d84a80'); }
  else { p.px(6,1,'#ec6c9c'); p.px(6,2,'#d84a80'); }
}];
MSD.pier = [12, 6, (p)=>{
  p.rect(0,1,12,2,MA.wood[1]); p.rect(0,2,12,1,MA.wood[3]);
  for(const x of [1,5,10]) p.rect(x,3,1,3,MA.woodD[2]);
}];
MSD.heron = [5, 7, (p)=>{
  p.ball(2.4,3.6,1.8,1.4,MA.white,{spec:false}); p.line(3.6,3,4,1,MA.white[1]); p.px(4,0,MA.white[1]); p.px(5,0,'#e8b030');
  p.px(2,5,'#3a3440'); p.px(2,6,'#3a3440'); p.px(3,6,'#3a3440');
}];

/* ---------------- the hills and the ruins ---------------- */
MSD.mushroom = [8, 10, (p)=>{
  const S=MA.sandst;
  p.rect(3,4,2,6,S[2]); p.px(4,5,S[3]); p.px(4,7,S[3]); p.rect(2,9,4,1,S[3]);
  p.ball(4,2.4,3.8,2.2,ramp('#8a6a4a'),{spec:false}); p.rect(1,1,5,1,ramp('#8a6a4a')[1]);
}];
/* a sandstone hill of the plateau: flat on top, cliffs down the sides, a
   skirt of fallen rock, and scrub along the rim. Variants ten and up have a cave */
MSD.mesa = [v=>28+(v%10)*8, 18, (p,v,r,w,h)=>{
  const S=MA.sandst, T=ramp('#b89a70'), cave=v>=10, top=2+(v%3)*2;
  const k=v%10, step=x=> (k===1? (x>w*0.55? 3 : 0) : k===2? (x<w*0.35? 2 : 0) : (x>w*0.3&&x<w*0.5? 1 : 0));
  const topY=x=> top + step(x) + (x<6? (6-x)*2.2 : x>w-7? (x-(w-7))*2.2 : 0);
  for(let x=0;x<w;x++){ const ty=R(topY(x)), lit = x<w*0.34? 1 : x>w*0.72? 3 : 2;
    for(let y=ty;y<h;y++){ let c=S[lit];
      if((y-ty)%4===3) c=S[Math.min(4,lit+1)];
      if(y===ty) c=S[0];
      if(y>=h-3) c=T[lit];
      p.px(x,y,c); } }
  for(let k=0;k<Math.floor(w/9);k++){ const x=(4+r()*(w-8))|0; for(let y=top+2;y<h-4;y++) if(r()<0.7) p.px(x,y,S[4]); }
  for(let x=5;x<w-5;x+=3+(r()*3|0)) p.ball(x,topY(x)-0.6,1.8,1.3,r()<0.3? MA.olive : MA.leafD,{spec:false});
  /* a stream of water down one face, and the pool it makes */
  if(k===2){ const wx=R(w*0.7); for(let y=R(topY(wx))+1;y<h-2;y++) p.px(wx,y,y%3?'#a8d8e8':'#e8f8ff'); p.rect(wx-2,h-2,5,1,'#6eaec2'); }
  for(let x=1;x<w-1;x+=4+(r()*4|0)) p.px(x,h-1,T[4]);
  if(cave){ const cx=R(w/2); p.ell(cx,h-4.5,3.2,4,'#2a2026'); p.rect(cx-3,h-5,7,4,'#2a2026'); p.px(cx-2,h-7,'#5a4640'); p.px(cx+2,h-2,'#e8c080'); }
}];
MSD.boulder = [6, 4, (p,v)=>{ p.ball(3,2.4,3,1.8,v%2? MA.sandst : MA.stone,{spec:false,dither:0.2}); }];
/* a Khmer prasat: the corncob tower on its laterite terrace, as at Phanom Rung */
MSD.prasat = [15, 13, (p)=>{
  const L=MA.laterite, S=ramp('#c8a48a');
  p.rect(0,11,15,2,L[2]); p.rect(0,11,15,1,L[1]);
  p.rect(2,10,11,1,L[1]); for(let x=6;x<9;x++) p.px(x,12,L[0]);
  p.rect(4,6,7,4,S[2]); p.rect(4,6,1,4,S[1]); p.rect(9,6,2,4,S[3]);
  p.rect(6,7,2,3,'#3a2a26'); p.px(7,6,S[0]);
  for(let t=0;t<6;t++){ const y=5-t, hw=[3.8,3.6,3,2.6,2,1.2][t];
    for(let x=R(7-hw); x<=R(7+hw); x++) p.px(x,y, x>7? S[t%2?3:4] : S[t%2?1:2]); }
  p.px(3,7,'#5a9a4a'); p.px(11,9,'#5a9a4a'); p.px(1,10,'#5a9a4a');
  /* its two little sisters, fallen further */
  p.rect(0,7,2,3,S[3]); p.px(0,6,S[2]); p.rect(13,8,2,2,S[3]); p.px(14,7,S[2]);
}];
MSD.stonehead = [10, 10, (p)=>{
  const S=MA.stone;
  p.ball(5,5.6,3.6,3.8,S,{spec:false,dither:0.15});
  for(let x=2;x<9;x+=2) p.px(x,3,S[3]); for(let x=3;x<8;x+=2) p.px(x,2,S[3]);
  p.ball(5,1.4,1.4,1.2,S,{spec:false});
  p.rect(3,6,2,1,S[4]); p.rect(6,6,2,1,S[4]); p.px(5,7,S[3]); p.rect(4,8,3,1,S[4]);
  /* the roots that hold it */
  p.line(0,9,2,4,MA.bark[2]); p.line(9,9,8,5,MA.bark[3]); p.line(1,9,4,9,MA.bark[2]);
  p.px(7,3,'#5a9a4a'); p.px(2,5,'#5a9a4a');
}];
MSD.view = [13, 12, (p)=>{
  const S=MA.sandst;
  p.poly([0,11, 1,7, 4,5, 12,5, 12,11],S[2]); p.rect(0,10,12,2,S[3]); p.line(2,8,11,8,S[3]);
  p.rect(2,4,9,1,MA.wood[1]); p.rect(2,5,9,1,MA.wood[3]);
  for(const x of [2,6,10]) p.rect(x,2,1,2,MA.wood[2]); p.rect(2,2,9,1,MA.wood[1]);
  p.rect(11,0,1,5,MA.trunkG[2]);
  p.rect(8,0,3,1,'#d8443a'); p.rect(8,1,3,1,'#f4f0e8'); p.rect(8,2,3,1,'#2a3a88');    // the flag
}];
MSD.naga = [9, 5, (p)=>{
  const G=ramp('#4a9a6a');
  p.line(0,4,6,2,G[2],2); p.line(6,2,8,0,G[1]); p.px(8,1,G[1]); p.px(7,0,MA.gold[1]);
}];

/* ---------------- people, animals, fun ---------------- */
MSD.buffalo = [13, 9, (p,v)=>{
  const B = v%3===2? MA.albino : ramp('#6c6a76');
  for(const x of [4,5,9,10]) p.rect(x,6,1,3,B[x%2?3:4]);
  p.ball(7,4,4.4,2.4,B,{spec:false,dither:0.1});
  p.ball(2.2,5.6,1.9,1.5,B,{spec:false});                                        // head down, grazing
  p.px(0,6,'#2a2028'); p.px(4,4,B[3]);
  p.px(3,3,'#e8e0d0'); p.px(4,2,'#e8e0d0'); p.px(5,2,'#d8d0c0'); p.px(1,3,'#e8e0d0'); p.px(0,2,'#d8d0c0');   // the horns, swept back
  p.px(11,3,B[3]); p.px(12,4,B[3]); p.px(12,5,B[4]);
  if(v%2===0){ p.rect(7,0,2,2,'#fbfbf4'); p.px(9,1,'#fbfbf4'); p.px(6,0,'#f0b030'); }    // the egret riding it
}];
MSD.elephant = [14, 11, (p)=>{
  const E=MA.ele;
  for(const x of [4,6,10,12]) p.rect(x,7,2,4,E[3]); p.rect(6,7,2,4,E[2]);
  p.ball(8.6,5,5,3.4,E,{spec:false,dither:0.1});
  p.ball(3.4,4,2.6,2.6,E,{spec:false});
  p.line(1.6,5.6,1,9,E[2],2); p.px(1,10,E[3]);                                   // the trunk
  p.px(3,6,'#f4f0e4'); p.px(2,6,'#f4f0e4');                                       // tusks
  p.ball(4.6,3.6,1.4,2,E,{spec:false});                                          // the ear
  p.px(2,3,'#1a1216');
  p.rect(7,1,4,3,'#c8302a'); p.rect(7,1,4,1,MA.gold[1]); p.px(9,3,MA.gold[2]);   // a red cloth on her back
}];
MSD.dog = [9, 5, (p,v)=>{
  const C = [ramp('#d8a060'), ramp('#ece2d0'), ramp('#4a3a34')][v%3];
  if(v>=3){                                                                        // sitting up, ears up
    p.ball(3,3.2,2.2,1.8,C,{spec:false}); p.ball(5.6,1.8,1.6,1.4,C,{spec:false});
    p.px(4,0,C[3]); p.px(6,0,C[3]); p.px(7,2,C[1]); p.px(8,2,'#2a2028'); p.px(6,1,'#2a2028');
    p.px(5,4,C[3]); p.px(0,3,C[2]); p.px(1,4,C[2]); return; }
  p.ball(4,3.2,3.4,1.7,C,{spec:false}); p.ball(7,3.2,1.6,1.3,C,{spec:false});   // curled up asleep in the sun
  p.px(7,1,C[3]); p.px(6,2,C[3]); p.px(7,3,'#3a2a2a'); p.px(8,3,C[1]);
  p.px(0,3,C[2]); p.px(1,4,C[2]);
  if(v%3===0){ p.px(3,2,C[3]); p.px(4,2,C[3]); }
}];
MSD.cat = [6, 6, (p,v)=>{
  const C = [ramp('#e8983c'), ramp('#3a3440'), ramp('#e8dcc0')][v%3];
  p.ball(2.6,3.8,2,2,C,{spec:false}); p.ball(3.4,1.6,1.4,1.4,C,{spec:false});
  p.px(2,0,C[2]); p.px(4,0,C[2]); p.px(5,4,C[2]); p.px(5,3,C[2]);
  if(v%3===2){ p.px(3,2,'#6a4a3a'); p.px(2,5,'#6a4a3a'); }
  if(v%3===0){ p.px(2,4,C[3]); p.px(3,5,C[3]); }
}];
/* wao aek: the Isan kite with a bow on its head that hums in the wind */
MSD.kite = [9, 8, (p,v)=>{
  p.line(0,2,4,0,'#5a3a24'); p.line(4,0,8,2,'#5a3a24');
  p.poly([4,1, 7,4, 4,7, 1,4], v%2? MA.red[2] : MA.orange[1]);
  p.poly([4,1, 4,7, 1,4], v%2? MA.red[1] : MA.gold[1]);
  p.px(4,4,'#2a58a8');
}];
MSD.kid = [4, 6, (p,v)=>{
  p.px(1,0,'#2a2028'); p.px(2,0,'#2a2028'); p.px(1,1,'#d8a070'); p.px(2,1,'#c89060');
  p.rect(1,2,2,2,v%2? '#e8503a' : '#3a78c8'); p.px(3,2,'#d8a070');
  p.px(1,4,'#2a2a40'); p.px(2,4,'#2a2a40'); p.px(1,5,'#c89060'); p.px(2,5,'#c89060');
}];
MSD.farmer = [6, 6, (p,v)=>{
  p.rect(0,1,6,1,MA.straw[1]); p.rect(1,0,4,1,MA.straw[0]); p.px(5,1,MA.straw[3]);
  p.rect(2,2,3,2,v%2? '#3a68b0' : '#8a4a8a'); p.px(1,3,'#d8a070'); p.px(1,4,'#d8a070');
  p.px(2,4,'#2a2a40'); p.px(4,4,'#2a2a40'); p.px(2,5,'#c89060'); p.px(4,5,'#c89060');
}];
/* the bang fai tower: bamboo scaffold the rockets go up off in the sixth month */
MSD.bangfai = [7, 16, (p)=>{
  const Bm=ramp('#c8b060');
  p.line(1,15,3,0,Bm[1]); p.line(5,15,3,0,Bm[3]);
  for(let y=4;y<15;y+=4){ const hw=R((y/15)*2); p.line(3-hw,y,3+hw,y,Bm[2]); }
  p.px(3,0,'#d8443a'); p.px(2,1,'#f0c040'); p.px(4,1,'#4aa04a');
}];
/* a morlam stage, set up for the night: speaker stacks as tall as the band */
MSD.morlam = [18, 12, (p)=>{
  p.rect(3,1,12,7,'#6a2a8a'); p.rect(3,1,12,1,'#9a4ab0');
  for(let x=4;x<15;x+=2) p.px(x,1,['#f0e060','#60e0f0','#f070b0'][x%3]);
  p.rect(2,8,14,4,'#3a2a30'); p.rect(2,8,14,1,MA.wood[1]);
  for(const x0 of [0,15]){ p.rect(x0,3,3,9,'#1e1a22'); for(let y=4;y<11;y+=3){ p.px(x0+1,y,'#6a6a72'); p.px(x0+1,y+1,'#4a4a52'); } }
  p.rect(8,4,2,4,'#f0c040'); p.px(8,3,'#d8a070'); p.px(9,3,'#2a2028'); p.px(9,4,'#fff0a0');
  p.rect(5,5,1,3,'#f070b0'); p.px(5,4,'#d8a070'); p.rect(12,5,1,3,'#60d0f0'); p.px(12,4,'#d8a070');
}];
/* Nang Tani, who lives in a wild banana: shy, not frightening */
MSD.tani = [11, 12, (p)=>{
  const L=ramp('#7cbc4c');
  icoLeaf(p,5,7,0,4,1.6,L,false); icoLeaf(p,5,7,10,4,1.6,L,false); icoLeaf(p,5,6,3,0,1.4,L,false); icoLeaf(p,5,6,8,0,1.4,L,false);
  p.rect(4,7,2,5,ramp('#9ab458')[2]);
  p.ball(7.6,7.2,1.6,1.8,MA.ghost,{spec:false}); p.rect(6,6,1,4,'#2a2028'); p.px(9,6,'#2a2028');
  p.px(7,7,'#2a2028'); p.px(8,7,'#2a2028'); p.px(8,8,'#e88aa0');
  p.rect(6,9,3,3,ramp('#8ad08a')[1]);
}];
MSD.flagthai = [5, 11, (p)=>{
  p.rect(0,0,1,11,MA.trunkG[1]);
  p.rect(1,0,4,1,'#d8303a'); p.rect(1,1,4,1,'#f4f0e8'); p.rect(1,2,4,2,'#2a3a88'); p.rect(1,4,4,1,'#f4f0e8'); p.rect(1,5,4,1,'#d8303a');
}];
MSD.sign = [9, 8, (p)=>{
  p.rect(4,3,1,5,MA.wood[2]); p.rect(0,0,9,4,MA.wood[1]); p.rect(0,3,9,1,MA.wood[3]);
  p.rect(1,1,5,1,'#5a3a24'); p.px(7,1,'#5a3a24');
}];
/* the one stamped on the road for you: his pale face, the tuft, the eyes */
MSD.me = [9, 11, (p)=>{
  p.tri(2,5,4.5,10.6,7,5,MA.red[2]); p.px(4,9,MA.red[3]);
  p.ball(4.5,4.4,4,3.8,MA.ghost,{spec:true,dither:0.08});
  p.px(3,4,'#1a1216'); p.px(6,4,'#1a1216'); p.px(3,3,'#fffdf4'); p.px(6,3,'#fffdf4');
  p.px(4,6,'#5a3a40'); p.px(5,6,'#5a3a40'); p.px(2,5,'#f0a8b8'); p.px(7,5,'#f0a8b8');
  p.px(4,0,'#6a8a50'); p.px(5,0,'#4a7a40');
}];
/* a ghost you have met, small, on the road where you met it */
MSD.spook = [6, 7, (p,v)=>{
  const C = v? ramp('#f090b0') : ramp('#b8b0d0');
  p.ball(3,2.6,2.8,2.6,C,{spec:false});
  p.rect(0,3,6,3,C[2]); p.rect(5,3,1,3,C[3]);
  p.px(0,6,C[2]); p.px(2,6,C[2]); p.px(4,6,C[2]);
  p.px(2,2,'#1a1216'); p.px(4,2,'#1a1216');
}];
