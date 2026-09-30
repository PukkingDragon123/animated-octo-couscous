/* ============================================================
   LIGHT, WATER AND AIR

   A WebGL pass over the world, after it is drawn and before the
   interface goes on top. The world is painted as it always was,
   into the same canvas, at the same scale; at the point in the
   frame where the village is finished and the purse and the clock
   are about to be drawn, that canvas becomes a texture, the pass
   below runs on it into a second canvas underneath, and the first
   canvas is cleared so that the interface drawn into it next sits
   on top, untouched by any of it. Nothing about how the game draws
   has to know.

   What the pass does:
     light     every lamp, lantern, candle, fire, firefly and ghost
               in view is splatted, in its own colour, into a small
               light map. Surfaces near a light take its colour in
               proportion to how bright they already are, which is
               what light does to a wall, and the air round it glows
               a little.
     water     the pond, the river, the lotus lake and the basin in
               heaven reflect what is above them, row by row, with a
               ripple that moves a whole pixel at a time the way
               water does in pixel art, a fresnel that is strongest
               at the surface and fades with depth, a bright line
               where the surface meets the light, and glints.
     sun       at dawn and dusk the sun has a bloom round it and
               rays coming off it, occluded by whatever stands in
               front of it: the rays come out between the houses and
               through the palms, not across them.
     bloom     anything bright bleeds a little light into what is
               round it, more at night than by day.
     grade     a colour grade for the hour: cool shadows and a warm
               top at dawn, a clean bright noon, orange and magenta at
               dusk, and blue at night.

   With no WebGL, or on a device too slow for it, none of this runs
   and the game draws exactly as it did.
   ============================================================ */
/* var, not const: resize() asks after it while the page is still loading,
   and a const that has not been reached yet cannot even be asked about */
var FX = {
  on:false, kind:'', gl:null, cv:null, prog:null, u:{}, t:{}, err:'',
  want: 1, frames:0, slow:0, sunA:0,
  lightCv: mkCv(240,135), bloomA: mkCv(240,135), bloomB: mkCv(120,68), bloomC: mkCv(60,34), maskCv: mkCv(W,H),
  bodies: [], hvBodies: null,
  dbg: {light:1, bloom:1, sun:1, water:1, grade:1},
};
FX.lightG = G2(FX.lightCv);
FX.bloomAG = FX.bloomA.getContext('2d'); FX.bloomBG = FX.bloomB.getContext('2d'); FX.bloomCG = FX.bloomC.getContext('2d');
FX.maskG = G2(FX.maskCv);

FX.VS = `attribute vec2 aPos; varying vec2 vUv;
void main(){ vUv = vec2(aPos.x*0.5+0.5, 0.5-aPos.y*0.5); gl_Position = vec4(aPos,0.0,1.0); }`;
FX.FS = `precision mediump float;
varying vec2 vUv;
uniform sampler2D uScene, uBloomA, uBloomB, uBloomC, uLight, uMask;
uniform vec2 uGame;                       /* one game pixel, in uv */
uniform float uT, uNight, uRays, uWater, uBloom, uLightK;
uniform vec3 uSun;                        /* x, y in uv, strength */
uniform vec3 uSunCol, uShadow, uHigh;
uniform vec4 uGrade;                      /* saturation, contrast, exposure, vignette */
uniform float uBlack;                     /* the black point: what the 2D wash lifted, taken back */
float luma(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
void main(){
  vec2 uv = vUv;
  vec3 col = texture2D(uScene, uv).rgb;

  /* ---- water ---- */
  if(uWater > 0.5){
    vec4 m = texture2D(uMask, uv);
    if(m.r > 0.5){
      float depthPx = m.g*255.0/4.0;                  /* game pixels below the waterline */
      float row = floor(uv.y/uGame.y);
      float y0 = (row - depthPx)*uGame.y;             /* the waterline, in uv */
      float k = clamp(depthPx/22.0, 0.0, 1.0);
      /* the ripple moves whole pixels, row by row, and grows with depth */
      float sh = floor(sin(row*0.83 + uT*2.1)*1.4*(0.35+k) + sin(row*2.31 - uT*3.3)*0.6 + 0.5);
      float sv = floor(sin(row*0.57 + uT*1.3)*0.8*k + 0.5);
      vec2 r = vec2(uv.x + sh*uGame.x, y0 - (depthPx + 1.0 + sv)*uGame.y);
      vec3 refl = texture2D(uScene, r).rgb;
      /* only where the pixel is still water: a boat, a bobber, a pile
         or a lotus leaf standing in it keeps its own colour */
      float guard = smoothstep(-0.03, 0.05, col.b - col.r);
      float fres = mix(0.72, 0.28, k);
      vec3 tint = mix(vec3(0.80,0.92,1.0), vec3(0.55,0.72,0.82), k);
      vec3 w = mix(col, refl*tint + col*0.12, fres*guard);
      /* the bright skin right at the surface */
      w += vec3(0.20,0.24,0.26)*(1.0 - smoothstep(0.0, 1.5, depthPx))*guard*(0.4+0.6*luma(refl));
      /* glints: a few pixels at a time catch the sky and wink out */
      vec2 cell = floor(uv/uGame);
      float g = step(0.985 - 0.01*(1.0-k), hash(cell + floor(uT*3.0 + cell.x*0.05)));
      w += g*guard*(1.0-k)*vec3(1.0,0.97,0.9)*(0.25 + 0.9*luma(refl));
      col = w;
    }
  }

  /* ---- light: lit surfaces take the light's colour, and the air glows ---- */
  vec3 L = texture2D(uLight, uv).rgb*uLightK;
  L = min(L, vec3(1.1));
  col = col + col*L*1.25 + L*L*0.10;

  /* ---- bloom ---- */
  vec3 bA = texture2D(uBloomA, uv).rgb, bB = texture2D(uBloomB, uv).rgb, bC = texture2D(uBloomC, uv).rgb;
  vec3 bl = max(bA - 0.80, 0.0)*0.60 + max(bB - 0.72, 0.0)*0.72 + max(bC - 0.64, 0.0)*0.85;
  col += bl*uBloom;

  /* ---- the sun: a bloom round it, and rays off it ---- */
  if(uSun.z > 0.01){
    vec2 d = uv - uSun.xy; d.x *= 1.7778;
    float dist = length(d);
    /* the glow is in the air, so it is strongest over the bright sky and
       weakest over whatever is standing between you and the sun */
    float open = 0.15 + 0.85*smoothstep(0.45, 0.90, luma(bA));
    col += uSunCol*uSun.z*(0.26*exp(-dist*8.0) + 0.06*exp(-dist*2.2))*open;
    if(uRays > 0.01){
      vec2 stp = (uSun.xy - uv)/30.0; vec2 p = uv; float acc = 0.0; float wt = 1.0;
      for(int i=0; i<30; i++){ p += stp;
        vec3 s = texture2D(uBloomC, p).rgb;
        acc += max(luma(s) - 0.58, 0.0)*wt; wt *= 0.935; }
      col += uSunCol*acc*uRays*0.075;
    }
  }

  /* ---- the grade for the hour ---- */
  col = max(col - uBlack, 0.0)/(1.0 - uBlack);
  col *= uGrade.z;
  float l = luma(col);
  col = mix(vec3(l), col, uGrade.x);
  col = (col - 0.5)*uGrade.y + 0.5;
  col += uShadow*(1.0 - smoothstep(0.0, 0.55, l))*0.14 + uHigh*smoothstep(0.42, 1.0, l)*0.12;
  /* a vignette, soft and round */
  vec2 q = uv - 0.5; q.x *= 1.25;
  col *= 1.0 - uGrade.w*smoothstep(0.30, 0.78, length(q));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

FX.init = function(){
  if(FX.gl || FX.err) return;
  if(!FX_GL_OK){ FX.err='no webgl'; return; }
  try{
    const c=document.createElement('canvas'); c.id='fx';
    const st=c.style;
    st.position='absolute'; st.left='50%'; st.top='50%'; st.transform='translate(-50%,-50%)';
    st.pointerEvents='none'; st.zIndex='1';
    cv.style.position='relative'; cv.style.zIndex='2';
    const wrap=cv.parentNode; wrap.insertBefore(c, cv);
    const gl=c.getContext('webgl',{alpha:false, antialias:false, depth:false, stencil:false,
                                    preserveDrawingBuffer:true, premultipliedAlpha:false, powerPreference:'high-performance'});
    if(!gl) throw new Error('no context');
    const sh=(type,src)=>{ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const p=gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, FX.VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FX.FS));
    gl.bindAttribLocation(p,0,'aPos'); gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    gl.useProgram(p);
    const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 3,-1, -1,3]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    for(const n of ['uScene','uBloomA','uBloomB','uBloomC','uLight','uMask','uGame','uT','uNight','uRays','uWater','uBloom','uLightK',
                    'uSun','uSunCol','uShadow','uHigh','uGrade','uBlack']) FX.u[n]=gl.getUniformLocation(p,n);
    const mk=(unit,smooth)=>{ const t=gl.createTexture(); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,t);
      const f=smooth? gl.LINEAR : gl.NEAREST;
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,f); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,f);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      return {t, unit}; };
    FX.t.scene=mk(0,false); FX.t.bA=mk(1,true); FX.t.bB=mk(2,true); FX.t.bC=mk(3,true); FX.t.light=mk(4,true); FX.t.mask=mk(5,false);
    gl.uniform1i(FX.u.uScene,0); gl.uniform1i(FX.u.uBloomA,1); gl.uniform1i(FX.u.uBloomB,2);
    gl.uniform1i(FX.u.uBloomC,3); gl.uniform1i(FX.u.uLight,4); gl.uniform1i(FX.u.uMask,5);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    FX.gl=gl; FX.cv=c; FX.prog=p;
    FX.kind = (gl.getParameter(gl.VERSION)||'webgl');
    FX.resize();
  }catch(e){ FX.err=String(e && e.message || e); FX.gl=null; if(FX.cv){ FX.cv.remove(); FX.cv=null; } }
};
FX.resize = function(){
  if(!FX.cv) return;
  FX.cv.width=cv.width; FX.cv.height=cv.height;
  FX.cv.style.width=cv.style.width; FX.cv.style.height=cv.style.height;
  FX.cv.style.imageRendering=cv.style.imageRendering;
  FX.gl.viewport(0,0,FX.cv.width,FX.cv.height);
};
/* 1 on, 0 off; remembered on this device */
FX.set = function(v){
  FX.want = v? 1 : 0;
  try{ localStorage.setItem('prete-fx', String(FX.want)); }catch(e){}
  if(FX.want) FX.init();
  FX.on = !!(FX.want && FX.gl);
  if(FX.cv) FX.cv.style.display = FX.on? 'block' : 'none';
};
{ let v=null; try{ v=localStorage.getItem('prete-fx'); }catch(e){}
  FX.want = v==='0'? 0 : 1; }

/* ---------- the water, found once in the painted world ----------
   Each body of water is a strip of the play layer: which of its pixels
   are water, and how far each is below its own waterline. Found by colour
   in the painting itself, so a pile, a step or a lotus leaf standing in the
   water is not water and keeps its place in front of the reflection. */
function fxWaterBody(src, x0, x1, yTop, yBot, surf, isWater, layer){
  const w=Math.max(1,R(x1-x0)), h=Math.max(1,R(yBot-yTop));
  const d=src.getContext('2d').getImageData(R(x0), R(yTop), w, h).data;
  const c=mkCv(w,h), g=c.getContext('2d'), im=g.createImageData(w,h), o=im.data;
  for(let x=0;x<w;x++){
    const sy=surf(x0+x)-yTop;                 // this column's waterline, in the strip
    for(let y=0;y<h;y++){
      const i=(y*w+x)*4;
      if(y<sy-0.5) continue;
      const r=d[i], gg=d[i+1], b=d[i+2], a=d[i+3];
      if(a<200 || !isWater(r,gg,b)) continue;
      o[i]=255; o[i+1]=clamp(R((y-sy)*4),0,255); o[i+2]=0; o[i+3]=255;
    }
  }
  g.putImageData(im,0,0);
  return {x0:R(x0), y0:R(yTop), w, h, cv:c, layer:layer||'play'};
}
const fxBlue = (r,g,b)=> b-r > 10 && r < 190;
function fxFindWater(){
  FX.bodies.length=0;
  const src=playCv;
  FX.bodies.push(fxWaterBody(src, POND_X-70, POND_X+70, groundY(POND_X)-6, groundY(POND_X)+16,
                             x=>R(groundY(x))+1, fxBlue));
  if(typeof EAST!=='undefined'){
    FX.bodies.push(fxWaterBody(src, EAST.river0, EAST.river1, RIVER_WATER_Y-1, H, ()=>RIVER_WATER_Y, fxBlue));
    FX.bodies.push(fxWaterBody(src, EAST.lake0, EAST.lake1, LAKE_WATER_Y-1, H, ()=>LAKE_WATER_Y, fxBlue));
    /* and the water going away behind them, on the back layer: the river
       out to the raft houses, and the lotus sea to its far shore */
    const sc=bgCv.width/WORLD_W, X=wx=>R(wx*sc);
    FX.bodies.push(fxWaterBody(bgCv, X(EAST.river0-60), X(EAST.river1+60), 180, H, ()=>181, fxBlue, 'bg'));
    FX.bodies.push(fxWaterBody(bgCv, X(EAST.lake0-40), X(EAST.lake1+40), 184, H, ()=>185, fxBlue, 'bg'));
  }
}
BUILD_STEPS.push(['the water', fxFindWater]);
/* heaven's basin, from heaven's own painting, the first time it is needed */
function fxHeavenWater(){
  if(FX.hvBodies || !HV_ART) return FX.hvBodies||[];
  const y=HG+HTOP;
  FX.hvBodies=[fxWaterBody(HV_ART.play, HV_X.pond0, HV_X.pond1, y-3, y+10, ()=>y-2, fxBlue)];
  for(const b of FX.hvBodies) b.y0 -= HTOP;       // back into heaven's world rows
  return FX.hvBodies;
}

/* ---------- the light map ---------- */
const _fxSpr = new Map();
function fxLightSprite(col){
  if(typeof col!=='string' || col[0]!=='#') col=PAL.lamp;
  let s=_fxSpr.get(col); if(s) return s;
  s=mkCv(64,64); const g=s.getContext('2d');
  const c=hx(col), gr=g.createRadialGradient(32,32,0,32,32,32);
  /* an inverse-square-ish falloff with no edge anywhere in it */
  for(const [t,a] of [[0,1],[0.12,0.72],[0.28,0.40],[0.46,0.19],[0.66,0.07],[0.84,0.02],[1,0]])
    gr.addColorStop(t,`rgba(${c[0]},${c[1]},${c[2]},${a})`);
  g.fillStyle=gr; g.fillRect(0,0,64,64);
  _fxSpr.set(col,s); return s;
}
function fxLights(realm, cx, cy, night){
  const g=FX.lightG;
  /* onto black, not onto nothing: a faint light drawn on a transparent
     canvas comes out of the texture upload at full brightness, because
     the colour is divided back out by its own alpha on the way */
  g.globalCompositeOperation='source-over'; g.globalAlpha=1; g.fillStyle='#000'; g.fillRect(0,0,240,135);
  g.globalCompositeOperation='lighter';
  const put=(x,y,r,col,a)=>{
    const sx=(x-cx)*0.5, sy=(y-cy)*0.5, rr=r*0.5;
    if(sx<-rr||sx>240+rr||sy<-rr||sy>135+rr||a<=0.01) return;
    g.globalAlpha=clamp(a,0,1); g.drawImage(fxLightSprite(col), sx-rr, sy-rr, rr*2, rr*2);
  };
  if(realm==='village'){
    if(night>0.04){
      for(const l of LIGHTS){ if(!l.on) continue;
        const fl=l.flick? 1-Math.random()*l.flick*0.6 : 1;
        put(l.x, l.y, l.r*1.35*fl, l.c||PAL.lamp, l.a*night*night*0.5); }
      const n2=night*night;
      for(const f of FIREFLIES){ const bl=0.5+0.5*Math.sin(f.t*2.2); if(bl>0.35) put(f.x,f.y,12,'#c6ff9a',0.45*bl*n2); }
      for(const s of SPIRITS) put(s.x, s.y-24, 40, s.friend? '#ffb0c8' : '#b8c8ff', 0.22*n2);
      if(typeof TANI!=='undefined') put(TANI.x, TANI.y-18, 44, '#a8ffcf', 0.25*n2);
      put(KITCHEN_X-10, groundY(KITCHEN_X)-30, 64, '#ff8a3a', 0.40*n2);
      if(GS.cos.halo) put(P.x, P.y-60, 60, '#ffe6a0', 0.35*n2);
    }
    for(const p of PT) if(p.k==='orb' && p.t>=0) put(p.x,p.y,16,'#ffe6a0',0.6);
    if(typeof FXP!=='undefined') for(const e of FXP) if(e.glow) put(e.x, e.y, e.glow, e.gc||'#ffb060', e.ga||0.3);
  } else if(realm==='heaven'){
    /* heaven is lit from everywhere at once; what it has is gold, which
       glows a little whatever the hour */
    put(HV_X.throne, HG-STAIR_RISE-80, 160, '#fff0c0', 0.35);
    put(HV_X.chedi, HG-90, 120, '#ffe6a0', 0.25);
  }
  g.globalAlpha=1; g.globalCompositeOperation='source-over';
}

/* ---------- the grade for the hour ---------- */
function fxGrade(){
  const h=(DAY.min||0)/60, v=TOD.v, night=1-v;
  const morning = h<12;
  /* how much of dawn, or of dusk, it is right now */
  const dawn = morning? clamp(1-Math.abs(h-6.25)/1.35,0,1) : 0;
  const dusk = !morning? clamp(1-Math.abs(h-18.3)/1.5,0,1) : 0;
  const g={ black: lerp(0.10, 0.03, night), sat:1.08, con:1.10, exp:1.04, vig:0.22, shadow:[0.10,0.12,0.30], high:[0.25,0.18,0.05], bloom:0.35, rays:0, sun:0, sunCol:[1,0.8,0.55] };
  /* night: blue, a little less colour, more bloom round the lamps */
  g.sat = lerp(g.sat, 0.86, night); g.con = lerp(g.con, 1.08, night);
  g.shadow = [lerp(0.10,0.05,night), lerp(0.12,0.08,night), lerp(0.30,0.42,night)];
  g.high = [lerp(0.25,0.30,night), lerp(0.18,0.22,night), lerp(0.05,0.10,night)];
  g.bloom = lerp(0.32, 0.9, night); g.vig = lerp(0.20, 0.34, night);
  /* dawn: cold shadows, a hot top, and the rays */
  if(dawn>0){ g.shadow=[lerp(g.shadow[0],0.22,dawn),lerp(g.shadow[1],0.10,dawn),lerp(g.shadow[2],0.42,dawn)];
    g.high=[lerp(g.high[0],0.55,dawn),lerp(g.high[1],0.30,dawn),lerp(g.high[2],0.08,dawn)];
    g.sat=lerp(g.sat,1.20,dawn); g.con=lerp(g.con,1.24,dawn); g.black=lerp(g.black,0.12,dawn);
    g.bloom=lerp(g.bloom,0.46,dawn); g.rays=dawn; g.sunCol=[1.0,0.72,0.42]; }
  if(dusk>0){ g.shadow=[lerp(g.shadow[0],0.30,dusk),lerp(g.shadow[1],0.08,dusk),lerp(g.shadow[2],0.36,dusk)];
    g.high=[lerp(g.high[0],0.60,dusk),lerp(g.high[1],0.24,dusk),lerp(g.high[2],0.04,dusk)];
    g.sat=lerp(g.sat,1.14,dusk); g.con=lerp(g.con,1.18,dusk); g.bloom=lerp(g.bloom,0.46,dusk); g.rays=dusk*0.8; g.sunCol=[1.0,0.58,0.32]; }
  return g;
}

/* ---------- the pass ---------- */
FX.capture = function(realm){
  if(!FX.on) return;
  const gl=FX.gl;
  const inHeaven = realm==='heaven';
  const cx = inHeaven? R(HVN.camX) : R(GS.camX), cy = inHeaven? R(HVN.camY) : R(GS.camY||0);
  const night = inHeaven? 0 : 1-TOD.v;
  /* heaven is white cloud and gold, so it wants very little bloom and a
     black point, or the whole of it glows into one pale sheet */
  const G = inHeaven? {black:0.08,sat:1.08,con:1.14,exp:0.96,vig:0.20,shadow:[0.20,0.12,0.40],high:[0.30,0.22,0.06],bloom:0.16,rays:0.55,sun:1,sunCol:[1,0.86,0.6]}
                    : (realm==='title'? Object.assign(fxGrade(),{rays:0.5,bloom:0.22,black:0.05}) : fxGrade());
  /* the light map */
  fxLights(inHeaven? 'heaven' : (realm==='title'? 'title' : 'village'), cx, cy, night);
  /* the water mask, in screen space */
  const mg=FX.maskG; mg.clearRect(0,0,W,H);
  let water=0;
  if(realm!=='title'){
    const list = inHeaven? fxHeavenWater() : FX.bodies;
    for(const b of list){
      const sx = b.layer==='bg'? b.x0-R(cx*PX.bg) : b.x0-cx, sy = b.layer==='bg'? b.y0-R(cy*0.55) : b.y0-cy;
      if(sx>W || sx+b.w<0 || sy>H || sy+b.h<0) continue;
      mg.drawImage(b.cv, sx, sy); water=1;
    }
  }
  /* the bloom chain: each step half the size of the one before, smoothed */
  const bA=FX.bloomAG, bB=FX.bloomBG, bC=FX.bloomCG;
  bA.imageSmoothingEnabled=true; bB.imageSmoothingEnabled=true; bC.imageSmoothingEnabled=true;
  bA.drawImage(cv,0,0,cv.width,cv.height,0,0,240,135);
  bB.drawImage(FX.bloomA,0,0,240,135,0,0,120,68);
  bC.drawImage(FX.bloomB,0,0,120,68,0,0,60,34);
  /* up it all goes */
  const up=(tx,src)=>{ gl.activeTexture(gl.TEXTURE0+tx.unit); gl.bindTexture(gl.TEXTURE_2D,tx.t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src); };
  up(FX.t.scene, cv); up(FX.t.bA, FX.bloomA); up(FX.t.bB, FX.bloomB); up(FX.t.bC, FX.bloomC);
  up(FX.t.light, FX.lightCv); up(FX.t.mask, FX.maskCv);
  /* where the sun is, as the sky draws it */
  let sun=[0.8,0.5,0];
  if(inHeaven){ const kx=(HV_ART.far.width-110) - cx*HPX.far; sun=[kx/W, (60-cy*0.1)/H, 0.55]; }
  else if(realm==='title'){ sun=[0.80, 0.30, 0.5]; }
  else { const S=skyNow(); if(S.sun>0.01){ const rise=clamp((TOD.v-0.46)/0.54,0,1);
      /* a sun low in the sky fills the air with light; at noon it is just bright */
      sun=[(W*0.80 - GS.camX*0.015)/W, lerp(168,26,rise)/H, clamp(S.sun*1.3,0,1)*(0.22 + 0.78*clamp(G.rays,0,1))]; } }
  const u=FX.u;
  gl.uniform2f(u.uGame, 1/W, 1/H);
  gl.uniform1f(u.uT, GS.t);
  gl.uniform1f(u.uNight, night);
  gl.uniform1f(u.uRays, FX.slow>1? 0 : G.rays);
  gl.uniform1f(u.uWater, water*FX.dbg.water);
  gl.uniform1f(u.uBloom, G.bloom*FX.dbg.bloom);
  gl.uniform1f(u.uLightK, FX.dbg.light);
  gl.uniform3f(u.uSun, sun[0], sun[1], sun[2]*FX.dbg.sun);
  gl.uniform3f(u.uSunCol, G.sunCol[0], G.sunCol[1], G.sunCol[2]);
  gl.uniform3f(u.uShadow, G.shadow[0], G.shadow[1], G.shadow[2]);
  gl.uniform3f(u.uHigh, G.high[0], G.high[1], G.high[2]);
  gl.uniform4f(u.uGrade, G.sat, G.con, G.exp, G.vig);
  gl.uniform1f(u.uBlack, G.black==null? 0.05 : G.black);
  gl.drawArrays(gl.TRIANGLES,0,3);
  /* and clear the canvas the interface is about to be drawn on */
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); ctx.restore();
  FX.frames++;
};
/* a screen that was drawn outside the pass paints the whole canvas
   itself, so the pass underneath simply is not seen; nothing to do */
FX.flush = function(){};

/* if the device cannot keep up with it, it steps down: first the rays,
   then all of it */
FX.watch = function(dt){
  if(!FX.on) return;
  FX._acc=(FX._acc||0)+dt; FX._n=(FX._n||0)+1;
  if(FX._acc>=4){
    const avg=FX._acc/FX._n;
    /* stepping down is for this sitting only; it is not written down */
    if(avg>1/22){ FX.slow++; if(FX.slow>=3){ FX.on=false; if(FX.cv) FX.cv.style.display='none'; } }
    else if(avg<1/40) FX.slow=Math.max(0,FX.slow-1);
    FX._acc=0; FX._n=0;
  }
};
FX.set(FX.want);
