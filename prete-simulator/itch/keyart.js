/* The store art is the game's own pixels, plated and composed at the size
   each picture wants. Nothing here is drawn by hand: if the game changes,
   the cover changes with it.

   The cover is the hook and is allowed to shout — the god, a face, an arrow,
   type with a black edge on it. The banner is the game, wide and quiet, with
   the logo out of the way of anything you would want to look at. */
const {chromium}=require('playwright-core');
const fs=require('fs'), path=require('path');
const OUT=process.argv[2] || '/home/user/animated-octo-couscous/prete-simulator/itch';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:480,height:270},deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/user/animated-octo-couscous/prete-simulator/index.html');
  await p.waitForFunction(()=>typeof WORLD_READY!=='undefined'&&WORLD_READY,{timeout:40000});
  const shots = await p.evaluate(()=>{
    setLang('en');
    if(cv.width!==W) return {err:'canvas is '+cv.width+'x'+cv.height};

    /* ---------- helpers ---------- */
    const copy=()=>{ const c=mkCv(W,H), g=G2(c); g.imageSmoothingEnabled=false;
                     g.drawImage(cv,0,0); return c; };
    const up=(src,scale)=>{ const c=mkCv(src.width*scale, src.height*scale), g=G2(c);
      g.imageSmoothingEnabled=false;
      g.drawImage(src,0,0,src.width,src.height,0,0,c.width,c.height); return c; };
    /* one pass of grade over a finished plate: the game is lit for a screen
       you are already looking at, a thumbnail is competing with forty others */
    const grade=(src,sat,con,brt)=>{
      const c=mkCv(src.width,src.height), g=G2(c);
      g.imageSmoothingEnabled=false;
      g.filter=`saturate(${sat}) contrast(${con}) brightness(${brt})`;
      g.drawImage(src,0,0); g.filter='none'; return c;
    };
    const vign=(g,w,h,a)=>{ const r=g.createRadialGradient(w/2,h*0.48,h*0.30,w/2,h*0.48,h*0.95);
      r.addColorStop(0,'rgba(8,5,18,0)'); r.addColorStop(1,`rgba(8,5,18,${a})`);
      g.fillStyle=r; g.fillRect(0,0,w,h); };
    /* type with a black edge on it, because gold on gold is not type */
    const bold=(g,s,x,y,size,fill,edge)=>{
      pTxt(g,s,x,y+3,'rgba(8,5,14,0.45)',size,'center',true);
      for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){
        if((!dx&&!dy) || dx*dx+dy*dy>5) continue;
        pTxt(g,s,x+dx,y+dy,edge,size,'center',true);
      }
      pTxt(g,s,x,y,fill,size,'center',true);
    };
    const arrow=(g,pts,w,col,edge)=>{
      for(const [c,ww] of [[edge,w+3],[col,w]]){
        for(let i=0;i<pts.length-1;i++)
          pTaper(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],ww,ww,c);
        const a=pts[pts.length-2], q=pts[pts.length-1];
        const an=Math.atan2(q[1]-a[1],q[0]-a[0]), hw=ww*2.0, hl=ww*2.8;
        pTri(g, q[0]+Math.cos(an)*hl, q[1]+Math.sin(an)*hl,
                q[0]+Math.cos(an+Math.PI/2)*hw, q[1]+Math.sin(an+Math.PI/2)*hw,
                q[0]+Math.cos(an-Math.PI/2)*hw, q[1]+Math.sin(an-Math.PI/2)*hw, c);
      }
    };

    /* ---------- plate 1: the pig, three times his size, cracking open over
       him on the village road at dusk. It is the loudest thing that happens
       in this game and the only moment the whole screen is about him. ------ */
    newGame(); GS.state='play'; GS.tut=99; GS.ch=chAt('free');
    DLG=null; VIG=null; HINT=null; FARM.rented=true; GS.q.blessed=true;
    for(const k in GS.seen) GS.seen[k]=true; CH.lock=false;
    DAY.n=7; DAY.min=18.4*60; setTOD(todFromClock(DAY.min),true);
    { const x=HOUSE_XS[3]-30; P.x=x; P.y=groundY(x); P.vx=0; P.face=1;
      GS.camX=clamp(x-W/2,0,WORLD_W-W);
      for(let i=0;i<240;i++) update(1/60);
      DAY.min=18.4*60; setTOD(todFromClock(DAY.min),true);
      P.x=x; P.y=groundY(x); P.vx=0; P.face=1;
      GS.camX=clamp(x-W/2,0,WORLD_W-W);
      HINT=null; VIG=null; DLG=null; GS.toasts.length=0; SPOTS.length=0; PROMPT=null;
      for(const n of NPCS){ n.bub=null; n.bubT=0; }
      for(const sp of SPIRITS){ sp.bub=null; sp.bubT=0; }
      GS.merit=40; GS.human=0;
      startBurst(1); BURST.t=1.18; BURST.ph='charge'; BURST.shake=0;
      render(); }
    const dream = copy();

    /* ---------- plate 2: the rice fields at first light ---------- */
    newGame(); GS.state='play'; GS.tut=99; GS.ch=chAt('free');
    DLG=null; VIG=null; HINT=null; FARM.rented=true; GS.q.blessed=true;
    for(const k in GS.seen) GS.seen[k]=true; CH.lock=false;
    DAY.n=6; DAY.min=7.2*60; setTOD(todFromClock(DAY.min),true);
    { const x=PITCH_X-120; P.x=x; P.y=groundY(x); P.vx=0; P.face=-1;
      GS.camX=clamp(x-W*0.62,0,WORLD_W-W);
      for(let i=0;i<300;i++) update(1/60);
      DAY.min=7.2*60; setTOD(todFromClock(DAY.min),true);
      P.x=x; P.y=groundY(x); P.vx=0; P.face=-1;
      GS.camX=clamp(x-W*0.62,0,WORLD_W-W);
      HINT=null; VIG=null; DLG=null; GS.toasts.length=0; SPOTS.length=0; PROMPT=null;
      for(const n of NPCS){ n.bub=null; n.bubT=0; }
      for(const s of SPIRITS){ s.bub=null; s.bubT=0; }
      render(); }
    const vill = copy();

    /* ---------- plate 3: his face, for the corner of the cover ---------- */
    const FW=120, FH=150;
    const fc=mkCv(FW,FH), fg=G2(fc);
    drawPrete(fg, {...P, x:FW/2, y:FH-6, vx:0, vy:0, state:'idle', act:null, rise:0,
                   onGround:true, phase:0, face:1, eye:1.4, brow:0.8, mouthS:0.6,
                   lean:0, squash:0, swayT:0.7, anim:0, breath:0, headBob:0, headLag:0,
                   blink:3, talk:0, stride:6, chatX:0},
              {dt:1/60, wind:0, sit:0, mouth:0.85, cos:GS.cos, human:0});

    /* ============ THE COVER — 630x500, composed at 315x250 ============ */
    const cw=315, ch=250;
    const cc=mkCv(cw,ch), cg=G2(cc); cg.imageSmoothingEnabled=false;
    /* the god, blown up and pushed right of centre so the face has a corner */
    cg.drawImage(grade(dream,1.28,1.14,1.04), -113, -12, W*1.2, H*1.2);
    vign(cg, cw, ch, 0.62);
    { const gr=cg.createLinearGradient(0,0,0,118);
      gr.addColorStop(0,'rgba(10,8,30,0.72)'); gr.addColorStop(1,'rgba(10,8,30,0)');
      cg.fillStyle=gr; cg.fillRect(0,0,cw,118); }
    /* his face in the corner, staring at it */
    { const fx=56, fy=190, r=42;
      pEll(cg,fx,fy+3,r+4,r+4,'rgba(6,4,14,0.55)');
      pEll(cg,fx,fy,r+3,r+3,'#1d1730');
      pEll(cg,fx,fy,r+1,r+1,'#ffdf9e');
      cg.save(); cg.beginPath(); cg.arc(fx,fy,r,0,TAU); cg.clip();
      pEll(cg,fx,fy,r,r,'#2b2444');
      cg.imageSmoothingEnabled=false;
      /* his head sits about ninety-one pixels up from his heel; put THAT point
         in the middle of the circle, at two and a half times the size */
      const S=3.15, hSX=FW/2, hSY=FH-6-91;
      cg.drawImage(fc, fx - hSX*S, fy - 3 - hSY*S, FW*S, FH*S);
      cg.restore();
      /* and the arrow from him to the thing he is looking at */
      arrow(cg, [[fx+r-6,fy-28],[fx+r+22,fy-54],[fx+r+44,fy-68]], 4.2, '#ffd34a', '#20160a');
    }
    bold(cg,'PRETE',     cw/2, 62, 44, PAL.gold,  '#221604');
    bold(cg,'SIMULATOR', cw/2, 86, 20, '#ffeec4', '#221604');
    pTxt(cg,'เปรต ซิมูเลเตอร์', cw/2+1, 106, 'rgba(8,5,14,0.8)', 9,'center');
    pTxt(cg,'เปรต ซิมูเลเตอร์', cw/2,   105, '#ffd9a0', 9,'center');
    /* one line at the bottom, on a bar, the way a thumbnail carries its claim */
    { const cap='YOU DIED HUNGRY. NOW FARM.';
      const tw=txtW(cap,9)+16;
      pR(cg, cw/2-tw/2, ch-24, tw, 16, 'rgba(12,8,20,0.82)');
      pR(cg, cw/2-tw/2, ch-24, tw, 1,  '#ffd34a');
      pR(cg, cw/2-tw/2, ch-9,  tw, 1,  '#ffd34a');
      pTxt(cg, cap, cw/2, ch-12, '#ffe9b3', 9, 'center'); }

    /* ============ THE BANNER — 1920x620, composed at 480x155 ============ */
    const bw=480, bh=155;
    const bc=mkCv(bw,bh), bg=G2(bc); bg.imageSmoothingEnabled=false;
    bg.drawImage(grade(vill,1.16,1.11,1.04), 0,-113, W,H);
    { const gr=bg.createLinearGradient(0,0,bw*0.56,0);
      gr.addColorStop(0,'rgba(14,12,34,0.76)');
      gr.addColorStop(0.62,'rgba(14,12,34,0.46)');
      gr.addColorStop(1,'rgba(14,12,34,0)');
      bg.fillStyle=gr; bg.fillRect(0,0,bw*0.56,bh); }
    { const gr=bg.createLinearGradient(0,bh-40,0,bh);
      gr.addColorStop(0,'rgba(10,8,24,0)'); gr.addColorStop(1,'rgba(10,8,24,0.55)');
      bg.fillStyle=gr; bg.fillRect(0,bh-40,bw,40); }
    { const tx=bw*0.235;
      bold(bg,'PRETE',     tx, 64, 40, PAL.gold,  '#221604');
      bold(bg,'SIMULATOR', tx, 86, 17, '#ffeec4', '#221604');
      pTxt(bg,'เปรต ซิมูเลเตอร์', tx+1, 105, 'rgba(8,5,14,0.8)', 9,'center');
      pTxt(bg,'เปรต ซิมูเลเตอร์', tx,   104, '#ffd9a0', 9,'center');
      pTxt(bg,'a cozy Thai ghost-village life', tx+1, 120, 'rgba(8,5,14,0.8)', 7,'center');
      pTxt(bg,'a cozy Thai ghost-village life', tx,   119, '#e8e0f4', 7,'center'); }

    /* ---------- and a plain screenshot of the village for the page ---------- */
    return { cover: up(cc,2).toDataURL('image/png'),
             banner: up(bc,4).toDataURL('image/png'),
             title:  up(vill,3).toDataURL('image/png') };
  });
  if(shots.err){ console.log('FAILED:', shots.err); await b.close(); return; }
  for(const [k,name] of [['cover','cover-630x500.png'],['banner','banner-1920x620.png'],['title','title-1440x810.png']]){
    fs.writeFileSync(path.join(OUT,name), Buffer.from(shots[k].split(',')[1],'base64'));
    console.log(name, fs.statSync(path.join(OUT,name)).size, 'bytes');
  }
  console.log('errs', errs.slice(0,3));
  await b.close();
})();
