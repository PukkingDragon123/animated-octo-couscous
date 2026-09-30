/* ============================================================
   CLOUDS

   The clouds were three ellipses stacked on each other at one
   eighth opacity, which from a distance is a cloud and close to
   is a pill. These are cumulus: a flat base, a heap of puffs on
   it, a cauliflower of smaller ones on those, and shaded by how
   far each pixel is from the side the light is coming from. At
   dawn the light comes from low down on the right and the
   undersides go orange; at noon it comes from above and the
   bases go grey. Each one is painted once into a canvas for the
   hour it is, and painted again when the hour moves on.
   ============================================================ */
var SKYC = { list:[], key:-1 };
(function(){
  const r=mulberry(9091);
  for(let i=0;i<10;i++){
    const far = i<4;
    SKYC.list.push({ seed:100+i*37, x:r()*1.6,
      y: far? 0.40+r()*0.12 : 0.15+r()*0.25,
      w: far? 40+r()*40 : 70+r()*80, h: far? 7+r()*5 : 12+r()*11,
      sp: far? 0.22+r()*0.18 : 0.45+r()*0.55, par: far? 0.022 : 0.05,
      a: far? 0.72 : 0.94, cv:null, far });
  }
})();
/* five tones, from the edge in the light to the base in the shade */
const SKYC_KEYS = [
  {v:0.00, t:['#4c5690','#363e70','#2a305c','#21274c','#1b1f3e']},
  {v:0.40, t:['#c67e8c','#7e5c88','#5c4a7a','#483e6a','#3c345a']},
  {v:0.56, t:['#ffe2a2','#ffb27c','#e27a8a','#a45c88','#ff9c62']},
  {v:0.72, t:['#fff4d4','#ffdab2','#f2b2a2','#c692aa','#ffca92']},
  {v:1.00, t:['#ffffff','#f6f8fc','#e2e8f2','#c8d2e2','#b6c2d6']},
];
function skycTones(v){
  let a=SKYC_KEYS[0], b=SKYC_KEYS[SKYC_KEYS.length-1];
  for(let i=0;i<SKYC_KEYS.length-1;i++) if(v>=SKYC_KEYS[i].v && v<=SKYC_KEYS[i+1].v){ a=SKYC_KEYS[i]; b=SKYC_KEYS[i+1]; break; }
  const t=b.v===a.v? 0 : (v-a.v)/(b.v-a.v);
  return a.t.map((c,i)=>hx(mix(c,b.t[i],t)));
}
const BAYER4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function skycPaint(c, v){
  const pad=3, w=R(c.w), h=R(c.h), cw=w+pad*2, ch=R(h*2.2)+pad*2, base=ch-pad;
  if(!c.cv || c.cv.width!==cw || c.cv.height!==ch){ c.cv=mkCv(cw,ch); c.mask=null; }
  c.oy = base;                                       // where the flat bottom sits in the canvas
  /* the shape, once: a heap of puffs on a flat base, and smaller ones on those */
  if(!c.mask){
    const m=new Uint8Array(cw*ch), r=mulberry(c.seed);
    const disc=(x0,y0,rr)=>{ for(let y=Math.max(0,Math.floor(y0-rr)); y<=Math.min(ch-1,Math.ceil(y0+rr)); y++)
      for(let x=Math.max(0,Math.floor(x0-rr)); x<=Math.min(cw-1,Math.ceil(x0+rr)); x++)
        if((x-x0)*(x-x0)+(y-y0)*(y-y0)<=rr*rr) m[y*cw+x]=1; };
    const n=Math.max(3, R(w/14));
    let top=base;
    for(let k=0;k<n;k++){
      const u=(k+0.5)/n, bell=Math.pow(Math.sin(u*Math.PI),0.8);
      const rr=h*(0.34+0.62*bell)*(0.8+0.4*r());
      const x0=pad+u*w+(r()-0.5)*w/n*0.7, y0=base-rr*0.78;
      disc(x0,y0,rr); top=Math.min(top,y0-rr);
      if(bell>0.45){ disc(x0-rr*0.42, y0-rr*0.52, rr*0.5); disc(x0+rr*0.38, y0-rr*0.6, rr*0.42);
                     if(r()<0.6) disc(x0+rr*0.05, y0-rr*0.9, rr*0.3); }
    }
    for(let y=R(base-h*0.3); y<base; y++) for(let x=R(pad+w*0.1); x<pad+w*0.9; x++) m[y*cw+x]=1;
    for(const e of [0.1,0.9]){ const rr=h*(0.3+0.12*r()); disc(pad+w*e, base-rr*0.85, rr); }
    for(let x=0;x<cw;x++) for(let y=base; y<ch; y++) m[y*cw+x]=0;       // the base is flat
    c.mask=m; c.top=Math.max(0,Math.floor(top));
  }
  const m=c.mask, T=skycTones(v), top=c.top, hh=Math.max(1,base-top);
  /* where the light is coming from: low on the right at dawn and dusk, overhead by day */
  const low=clamp(1-(v-0.5)/0.4,0,1);
  const lx=lerp(0.30,0.94,low), ly=lerp(-0.95,0.0,low);
  const at=(x,y)=> x>=0&&y>=0&&x<cw&&y<ch? m[y*cw+x] : 0;
  const g=G2(c.cv), id=g.createImageData(cw,ch), d=id.data;
  for(let y=0;y<ch;y++) for(let x=0;x<cw;x++){
    if(!m[y*cw+x]) continue;
    let s=0; while(s<8 && at(R(x+lx*(s+1)), R(y+ly*(s+1)))) s++;
    /* lit by how close the light side is, and by height: the tops are always brighter */
    const lit = clamp(1-s/7,0,1)*0.62 + clamp(1-(y-top)/hh,0,1)*0.48;
    const b=BAYER4[(y&3)*4+(x&3)]/16 - 0.5;
    const q=clamp((1-lit)*3.4 + b*0.55, 0, 3);
    let tone = s<1? 0 : R(q);
    if(y>=base-1) tone = 4;
    else if(y>=base-3 && (low>0.5 || b<0)) tone = low>0.5? 4 : 3;
    const col=T[tone], o=(y*cw+x)*4;
    d[o]=col[0]; d[o+1]=col[1]; d[o+2]=col[2]; d[o+3]=255;
  }
  g.putImageData(id,0,0);
}
/* long thin bands low over the horizon, lit from underneath, at either end of the day */
function skycStreaks(g, v){
  const h=(DAY.min||0)/60;
  const glow = h<12? clamp(1-Math.abs(h-6.2)/1.2,0,1) : clamp(1-Math.abs(h-18.3)/1.3,0,1);
  if(glow<0.02) return;
  const T=skycTones(v), r=mulberry(313);
  for(let i=0;i<7;i++){
    const len=70+r()*170, y=R(112+r()*44), x=((r()*W*1.8 + GS.t*0.6*(1+i%3) - GS.camX*0.03)%(W*1.8)+W*1.8)%(W*1.8)-W*0.4;
    const th=1+(i%3===0?1:0);
    g.globalAlpha=glow*(0.55+0.35*r());
    g.fillStyle=rgb(...T[i%2? 1 : 0]); g.fillRect(R(x), y, R(len), th);
    g.fillStyle=rgb(...T[4]); g.fillRect(R(x+len*0.1), y+th, R(len*0.8), 1);
    for(let k=0;k<6;k++){ g.fillRect(R(x-k*3-2), y, 2, 1); g.fillRect(R(x+len+k*3), y+(k%2), 2, 1); }
  }
  g.globalAlpha=1;
}
function drawCloudsFx(g){
  const v=TOD.v, key=R(v*48);
  if(key!==SKYC.key){ SKYC.key=key; for(const c of SKYC.list) skycPaint(c, v); }
  skycStreaks(g, v);
  const night=1-v;
  for(const c of SKYC.list){
    const span=W*1.6+c.w;
    const x=(((c.x*W*1.5 + GS.t*c.sp*3 - GS.camX*c.par) % span)+span)%span - c.w - W*0.1;
    g.globalAlpha=c.a*(c.far? lerp(1,0.75,night) : 1);
    g.drawImage(c.cv, R(x), R(c.y*H - (c.oy||c.h)));
  }
  g.globalAlpha=1;
}
