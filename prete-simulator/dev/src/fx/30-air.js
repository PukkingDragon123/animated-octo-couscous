/* ============================================================
   THE AIR

   What a Thai village has in it at six in the morning that a
   picture of one usually leaves out: smoke going up from every
   kitchen where the rice is on, a mist lying on the fields and on
   the water until the sun burns it off, dust and pollen hanging in
   the light, egrets going over in lines on their way out to the
   paddies, a fish coming up out of the river and the rings it
   leaves, dew winking in the grass, and at night the sparks off a
   charcoal stove. All of it drawn in the world, so the light pass
   on top of it catches it too.
   ============================================================ */
const FXP = [];            // smoke, sparks, drops: anything that moves on its own
const FXRING = [];         // rings on the water
const FXFLOCK = [];        // birds going over
const AIR = { smokeT:0, fishT:3, flockT:4, ringT:0 };
/* how much of dawn, and how much of dusk, it is */
function airHour(){
  const h=(DAY.min||0)/60;
  return { h, dawn: clamp(1-Math.abs(h-6.2)/1.3,0,1), dusk: clamp(1-Math.abs(h-18.2)/1.4,0,1),
           cook: (h>5.2 && h<8.4) || (h>16.6 && h<19.8) };
}
/* where the water is, for fish and rings */
function airWaters(){
  const out=[{a:POND_X-56, b:POND_X+56, y:x=>R(groundY(x))+2}];
  if(typeof EAST!=='undefined'){
    out.push({a:EAST.river0+10, b:EAST.river1-10, y:()=>RIVER_WATER_Y});
    out.push({a:EAST.lake0+10,  b:EAST.lake1-10,  y:()=>LAKE_WATER_Y});
  }
  return out;
}
function stepAir(dt){
  if(GS.state!=='play' && GS.state!=='intro' && GS.state!=='task') return;
  const A=airHour(), cx=GS.camX, night=1-TOD.v;
  /* ---- kitchen smoke: every house, in the hours somebody is cooking ---- */
  AIR.smokeT-=dt;
  if(AIR.smokeT<=0){
    AIR.smokeT=0.16;
    const src=[];
    if(A.cook) for(const hx of HOUSE_XS) src.push([hx+16, groundY(hx)-10]);
    src.push([KITCHEN_X-12, groundY(KITCHEN_X)-26]);
    if(typeof FARMHOUSE_X!=='undefined' && A.cook) src.push([FARMHOUSE_X+14, groundY(FARMHOUSE_X)-12]);
    for(const [x,y] of src){
      if(x-cx<-80||x-cx>W+80) continue;
      if(Math.random()<0.55) FXP.push({k:'smoke', x:x+rnd(-2,2), y, vx:rnd(-2,2), vy:-rnd(7,11), t:0, life:rnd(5,7.5), r:rnd(1.6,2.6), ph:rnd(TAU)});
    }
    /* sparks off the stove, after dark */
    if(night>0.5 && Math.abs(KITCHEN_X-cx-W/2)<W){
      if(Math.random()<0.6) FXP.push({k:'spark', x:KITCHEN_X-12+rnd(-4,4), y:groundY(KITCHEN_X)-24, vx:rnd(-6,6), vy:-rnd(14,30),
        t:0, life:rnd(0.8,1.6), glow:10, gc:'#ff8a3a', ga:0.5});
    }
  }
  /* ---- a fish, now and then, somewhere on the water in view ---- */
  AIR.fishT-=dt;
  if(AIR.fishT<=0){
    AIR.fishT=rnd(2.5,6);
    const ws=airWaters().filter(w=>w.b>cx-20 && w.a<cx+W+20);
    if(ws.length){ const w=pick(ws), x=clamp(cx+rnd(20,W-20), w.a, w.b), y=w.y(x);
      FXP.push({k:'fish', x, y, vx:rnd(-18,18), vy:-rnd(42,58), t:0, life:1.4, y0:y, sz:rnd(2,3.4)});
      FXRING.push({x, y, t:0, life:1.6, r0:1}); }
  }
  /* ---- insects touching down: small rings all over the water ---- */
  AIR.ringT-=dt;
  if(AIR.ringT<=0){
    AIR.ringT=rnd(0.25,0.7);
    const ws=airWaters().filter(w=>w.b>cx && w.a<cx+W);
    if(ws.length){ const w=pick(ws), x=clamp(cx+rnd(0,W), w.a, w.b); FXRING.push({x, y:w.y(x)+rnd(0,3), t:0, life:rnd(0.9,1.4), r0:0.5}); }
  }
  /* ---- birds going over at dawn and dusk ---- */
  AIR.flockT-=dt;
  if(AIR.flockT<=0){
    AIR.flockT=rnd(7,14);
    if(A.dawn>0.15 || A.dusk>0.15){
      const dir=Math.random()<0.5? 1 : -1, n=5+((Math.random()*5)|0), egret=A.dawn>A.dusk;
      FXFLOCK.push({x: dir>0? -40 : W+40, y:rnd(34,104), dir, n, t:0, sp:rnd(22,34), egret, sc:rnd(0.7,1.1)});
    }
  }
  /* ---- moving it all on ---- */
  const wind=GS.wind||0;
  for(let i=FXP.length-1;i>=0;i--){
    const p=FXP[i]; p.t+=dt;
    if(p.t>=p.life){ FXP.splice(i,1); continue; }
    if(p.k==='smoke'){ p.vx += (wind*9 - p.vx)*dt*0.5; p.vy*=Math.pow(0.86,dt); p.r+=dt*1.7; }
    if(p.k==='spark'){ p.vx*=Math.pow(0.3,dt); p.vy+=10*dt; }
    if(p.k==='fish'){ p.vy+=120*dt; if(p.y>p.y0 && p.vy>0 && !p.in){ p.in=1; FXRING.push({x:p.x, y:p.y0, t:0, life:1.4, r0:1.5});
        for(let k=0;k<5;k++) FXP.push({k:'drop', x:p.x, y:p.y0, vx:rnd(-20,20), vy:-rnd(20,45), t:0, life:0.6, y0:p.y0}); p.life=p.t; } }
    if(p.k==='drop'){ p.vy+=160*dt; if(p.y>p.y0){ p.life=p.t; } }
    p.x+=p.vx*dt; p.y+=p.vy*dt;
  }
  if(FXP.length>260) FXP.splice(0, FXP.length-260);
  for(let i=FXRING.length-1;i>=0;i--){ const r=FXRING[i]; r.t+=dt; if(r.t>=r.life) FXRING.splice(i,1); }
  for(let i=FXFLOCK.length-1;i>=0;i--){ const f=FXFLOCK[i]; f.t+=dt; f.x+=f.dir*f.sp*dt;
    if(f.x<-120||f.x>W+120) FXFLOCK.splice(i,1); }
}

/* ---------- in the sky, behind everything: birds going over ---------- */
function drawAirSky(g){
  const A=airHour(), a=Math.max(A.dawn, A.dusk);
  for(const f of FXFLOCK){
    /* a loose V, each bird on its own wingbeat */
    for(let i=0;i<f.n;i++){
      const side=(i%2? 1 : -1), rank=Math.ceil(i/2);
      const bx=f.x - f.dir*rank*9*f.sc, by=f.y + rank*4.5*f.sc*side + Math.sin(f.t*1.3+i)*1.2;
      const up=Math.sin(f.t*9+i*1.7)>0, s=f.sc;
      const col = f.egret? (A.dawn>0.3? '#fbe8d8' : '#f4f0e8') : '#2a2230';
      g.globalAlpha=clamp(0.35+0.65*a,0,1)*0.9;
      pR(g, R(bx), R(by), 2, 1, col);
      if(up){ pR(g, R(bx-2*s), R(by-1), 2, 1, col); pR(g, R(bx+2*s), R(by-1), 2, 1, col); pR(g, R(bx-3.5*s), R(by-2), 1, 1, col); pR(g, R(bx+3.5*s), R(by-2), 1, 1, col); }
      else { pR(g, R(bx-2*s), R(by+1), 2, 1, col); pR(g, R(bx+2*s), R(by+1), 2, 1, col); }
      if(f.egret) pR(g, R(bx+f.dir*2), R(by), 1, 1, '#e8b050');
      g.globalAlpha=1;
    }
  }
}

/* ---------- in the world ---------- */
function drawAir(g){
  const A=airHour(), cx=GS.camX, night=1-TOD.v;
  const sunSide = TOD.v>0.3;                       // is there a side for the light to be on
  /* smoke: grey, lit warm on the sun's side in the morning */
  for(const p of FXP){
    if(p.k!=='smoke') continue;
    if(p.x-cx<-30||p.x-cx>W+30) continue;
    const u=p.t/p.life, a=(u<0.12? u/0.12 : 1-Math.pow((u-0.12)/0.88,1.4))*0.26;
    const wob=Math.sin(p.t*1.3+p.ph)*1.5;
    const base = night>0.6? '#5a5a70' : mix('#a8a4a8', '#d8d0c8', TOD.v);
    g.globalAlpha=a;
    pEll(g, p.x+wob, p.y, p.r, p.r*0.85, base);
    if(sunSide){ g.globalAlpha=a*0.8; pEll(g, p.x+wob+p.r*0.3, p.y-p.r*0.25, p.r*0.6, p.r*0.5, A.dawn>0.2? '#f6d2b0' : '#f0ece6'); }
    g.globalAlpha=1;
  }
  /* the morning mist, low on the fields and the water, burned off by eight */
  const fog = A.dawn*0.9 + night*0.25;
  if(fog>0.04){
    for(let i=0;i<9;i++){
      const wx = cx + ((i*131 + GS.t*(4+i%3)) % (W+260)) - 130;
      const y = groundY(wx) - 4 - (i%3)*5;
      const col = A.dawn>0.2? '#f6e6dc' : '#9fb4d0';
      g.globalAlpha = fog*(0.07+0.03*(i%2));
      pEll(g, wx, y, 90+(i%4)*30, 7+(i%3)*2, col);
      g.globalAlpha = fog*0.05;
      pEll(g, wx+30, y-5, 60, 5, col);
    }
    g.globalAlpha=1;
  }
  /* rings on the water, one pixel wide, getting wider and fainter */
  for(const r of FXRING){
    if(r.x-cx<-20||r.x-cx>W+20) continue;
    const u=r.t/r.life, rr=r.r0+u*9;
    g.globalAlpha=(1-u)*0.55;
    const col = TOD.v>0.4? '#e8f6ff' : '#9fb8d8';
    for(let k=0;k<14;k++){ const an=k/14*TAU; pR(g, R(r.x+Math.cos(an)*rr), R(r.y+Math.sin(an)*rr*0.28), 1, 1, col); }
    g.globalAlpha=1;
  }
  /* fish, sparks, drops */
  for(const p of FXP){
    if(p.x-cx<-10||p.x-cx>W+10) continue;
    if(p.k==='fish'){
      const ang=Math.atan2(p.vy,p.vx);
      pTaper(g, p.x-Math.cos(ang)*p.sz, p.y-Math.sin(ang)*p.sz, p.x+Math.cos(ang)*p.sz, p.y+Math.sin(ang)*p.sz, 2, 1, '#c8d4dc');
      pR(g, R(p.x), R(p.y)-1, 1, 1, '#ffffff');
    } else if(p.k==='spark'){
      const u=p.t/p.life; g.globalAlpha=1-u; pR(g, R(p.x), R(p.y), 1, 1, u<0.4? '#ffe08a' : '#ff7a2a'); g.globalAlpha=1;
    } else if(p.k==='drop'){
      pR(g, R(p.x), R(p.y), 1, 1, '#d8f0ff');
    }
  }
  /* dust and pollen hanging in the light, and dew in the grass */
  const lit = Math.max(A.dawn*1.0, TOD.v>0.7? 0.35 : 0);
  if(lit>0.05){
    for(let i=0;i<34;i++){
      const sx=((i*89.7 + GS.t*(3+(i%5))) % (W+20)) - 10, sy=60 + ((i*53.3 + Math.sin(GS.t*0.4+i)*14) % 150);
      const bl=0.5+0.5*Math.sin(GS.t*(1.2+(i%4)*0.3)+i*2.1);
      if(bl<0.45) continue;
      g.globalAlpha=lit*0.7*bl; pR(g, R(cx+sx), R(sy+(GS.camY||0)), 1, 1, A.dawn>0.2? '#ffe2a8' : '#fff6d8'); g.globalAlpha=1;
    }
    for(let i=0;i<26;i++){
      const wx=cx+((i*37.1)%W), gy=groundY(wx);
      const tw=Math.sin(GS.t*3.1+i*7.3);
      if(tw<0.86) continue;
      g.globalAlpha=lit*(tw-0.86)*6; pR(g, R(wx), R(gy-2-(i%3)), 1, 1, '#fffcf0'); g.globalAlpha=1;
    }
  }
}
