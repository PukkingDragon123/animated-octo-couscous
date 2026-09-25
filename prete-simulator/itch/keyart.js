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

    /* ---------- plate 1: the village road at dusk, lanterns lit ----------
       The cover used to shout. It does not any more: no tagline, no English,
       no arrow, no reaction face, no caption bar. A warm evening with the
       lamps on and one thin ghost standing in it, and the game's name. */
    newGame(); GS.state='play'; GS.tut=99; GS.ch=chAt('free');
    DLG=null; VIG=null; HINT=null; FARM.rented=true; GS.q.blessed=true;
    for(const k in GS.seen) GS.seen[k]=true; CH.lock=false;
    DAY.n=6; DAY.min=18.6*60; setTOD(todFromClock(DAY.min),true);
    { const x=HOUSE_XS[2]+34; P.x=x; P.y=groundY(x); P.vx=0; P.face=-1;
      GS.camX=clamp(x-W*0.40,0,WORLD_W-W);
      for(let i=0;i<320;i++) update(1/60);
      DAY.min=18.6*60; setTOD(todFromClock(DAY.min),true);
      P.x=x; P.y=groundY(x); P.vx=0; P.face=-1;
      GS.camX=clamp(x-W*0.40,0,WORLD_W-W);
      HINT=null; VIG=null; DLG=null; GS.toasts.length=0; SPOTS.length=0; PROMPT=null;
      for(const n of NPCS){ n.bub=null; n.bubT=0; }
      for(const sp of SPIRITS){ sp.bub=null; sp.bubT=0; }
      GS.plate=1; render(); GS.plate=0; }
    const dusk = copy();

    /* ---------- plate 1b: THE COVER PROPER ----------
       Him in the paddy in a งอบ with a hoe, the buffalo up to its back
       in the flooded field behind him, and a plate of som tam on the
       dike. Everything in this picture is a thing you actually do. */
    newGame(); GS.state='play'; GS.tut=99; GS.ch=chAt('free');
    DLG=null; VIG=null; HINT=null; GS.q.blessed=true;
    for(const k in GS.seen) GS.seen[k]=true; CH.lock=false;
    /* a farm that has been worked: rented, diked, flooded, and a buffalo
       in the pen to come and lie in it */
    FARM.rented=true; FARM.paddies=true;
    if(FARM.pen) FARM.pen.buffalo=Math.max(1, FARM.pen.buffalo|0);
    for(const pd of PADDIES){ pd.flood=1; pd.stage=Math.max(pd.stage||0, 3); }
    DAY.n=6; DAY.min=9.4*60; setTOD(1,true);
    GS.cos = Object.assign({}, GS.cos, {skirt:'mudmee', ngob:1, hoe:1});
    { const px=PADDY_XS[0]-26;
      P.x=px; P.y=groundY(px); P.vx=0; P.face=1; P.phase=0.55;
      GS.camX=clamp(px-W*0.40,0,WORLD_W-W);
      for(let i=0;i<200;i++) update(1/60);
      /* the buffalo does not walk there in three seconds, so put it there */
      /* grazing, not wallowing: wallowing sinks it into water that is not
         drawn this far up the field, and a buffalo floating at chest height
         over a paddy is a bug rather than a cover */
      BUFF.st='graze'; BUFF.goal='graze'; BUFF.wall=0; BUFF.vx=0; BUFF.head=1;
      BUFF.x=PADDY_XS[0]+70; BUFF.y=groundY(BUFF.x); BUFF.face=-1; BUFF.bird=1;
      DAY.min=9.4*60; setTOD(1,true);
      P.x=px; P.y=groundY(px); P.vx=0; P.face=1;
      GS.camX=clamp(px-W*0.40,0,WORLD_W-W);
      /* lift the camera so the whole of him is in the picture. He is nine
         feet tall and the frame was cutting him off at the shins. */
      GS.camY=36;
      HINT=null; VIG=null; DLG=null; GS.toasts.length=0; SPOTS.length=0; PROMPT=null;
      for(const n of NPCS){ n.bub=null; n.bubT=0; }
      for(const sp of SPIRITS){ sp.bub=null; sp.bubT=0; }
      GS.plate=1; render(); GS.plate=0; }
    const field = copy(); GS.camY=0;
    /* the som tam goes on last, on the dike at his feet, at three times the
       size the inventory draws it — it is a prop in the picture, not an icon */
    { const fg=G2(field);
      const sx2=Math.round(PADDY_XS[0]-58-GS.camX), sy2=Math.round(groundY(PADDY_XS[0]-56)-7);
      pEll(fg,sx2,sy2+3,17,5,'rgba(20,14,8,0.28)');
      drawIcon(fg,'somtam',sx2,sy2,2.1);
      /* a fork of bamboo stuck in it, because nobody photographs som tam
         without something stuck in it */
      pTaper(fg,sx2+5,sy2-2,sx2+11,sy2-13,1.6,1.2,'#c9a866'); }

    /* ---------- plate 2: the temple at first light ---------- */
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
      for(const sp of SPIRITS){ sp.bub=null; sp.bubT=0; }
      GS.plate=1; render(); GS.plate=0; }
    const dawn = copy();

    /* the name, and nothing else. A soft shadow under it rather than a black
       edge — an outline is for shouting over a busy thumbnail and this one is
       not busy. */
    const name = (g,x,y,size)=>{
      pTxt(g,'เปรต ซิมูเลเตอร์', x+1, y+2, 'rgba(18,10,6,0.55)', size, 'center');
      pTxt(g,'เปรต ซิมูเลเตอร์', x,   y,   '#ffeec6',            size, 'center');
    };

    /* ============ THE COVER — 630x500, composed at 315x250 ============ */
    const cw=315, ch=250;
    const cc=mkCv(cw,ch), cg=G2(cc); cg.imageSmoothingEnabled=false;
    /* a light touch on the grade: cozy is warm, not loud. And drawn at one
       to one — blown up, the ground line ends up so near the bottom of the
       frame that the one person in the picture is standing in the title. */
    /* a touch over one to one — at 1:1 the one figure in the picture is
       forty pixels tall in a 315-wide frame, which is a landscape with a
       person in it rather than a cover */
    { const z=1.22, sw=Math.round(cw/z), sh=Math.round(ch/z);
      /* keep him a third in from the left and standing on the lower third */
      const sx0=Math.round(W*0.5-sw*0.52), sy0=Math.round(H-sh-6);
      cg.drawImage(grade(field,1.14,1.06,1.05), sx0, sy0, sw, sh, 0,0, cw, ch); }
    vign(cg, cw, ch, 0.38);
    { /* the name goes at the TOP, over the empty half of an evening sky, so
         the road and everybody on it is left alone */
      const gr=cg.createLinearGradient(0,0,0,86);
      gr.addColorStop(0,'rgba(16,11,30,0.70)');
      gr.addColorStop(0.62,'rgba(16,11,30,0.34)');
      gr.addColorStop(1,'rgba(16,11,30,0)');
      cg.fillStyle=gr; cg.fillRect(0,0,cw,86); }
    name(cg, cw/2, 44, 26);
    /* a hairline the width of the word, with a lantern-gold dot on it */
    { const w2=Math.min(cw-44, txtW('เปรต ซิมูเลเตอร์',26)+34);
      pR(cg, cw/2-w2/2, 55, w2, 1, 'rgba(255,214,140,0.34)');
      pEll(cg, cw/2, 55, 1.6, 1.6, 'rgba(255,226,166,0.85)'); }

    /* ============ THE BANNER — 1920x620, composed at 480x155 ============ */
    const bw=480, bh=155;
    const bc=mkCv(bw,bh), bg=G2(bc); bg.imageSmoothingEnabled=false;
    bg.drawImage(grade(dawn,1.12,1.06,1.03), 0,-113, W,H);
    { const gr=bg.createLinearGradient(0,0,bw*0.52,0);
      gr.addColorStop(0,'rgba(14,12,34,0.72)');
      gr.addColorStop(0.62,'rgba(14,12,34,0.40)');
      gr.addColorStop(1,'rgba(14,12,34,0)');
      bg.fillStyle=gr; bg.fillRect(0,0,bw*0.52,bh); }
    { const gr=bg.createLinearGradient(0,bh-34,0,bh);
      gr.addColorStop(0,'rgba(10,8,24,0)'); gr.addColorStop(1,'rgba(10,8,24,0.42)');
      bg.fillStyle=gr; bg.fillRect(0,bh-34,bw,34); }
    { const sz=21, w2=txtW('เปรต ซิมูเลเตอร์',sz)+26;
      const tx=Math.max(w2/2+14, bw*0.255);
      name(bg, tx, bh*0.55, sz);
      pR(bg, tx-w2/2, bh*0.55+10, w2, 1, 'rgba(255,214,140,0.30)');
      pEll(bg, tx, bh*0.55+10, 1.6, 1.6, 'rgba(255,226,166,0.8)'); }

    /* ---------- and a plain screenshot of the village for the page ---------- */
    return { cover: up(cc,2).toDataURL('image/png'),
             banner: up(bc,4).toDataURL('image/png'),
             title:  up(field,3).toDataURL('image/png') };
  });
  if(shots.err){ console.log('FAILED:', shots.err); await b.close(); return; }
  for(const [k,name] of [['cover','cover-630x500.png'],['banner','banner-1920x620.png'],['title','title-1440x810.png']]){
    fs.writeFileSync(path.join(OUT,name), Buffer.from(shots[k].split(',')[1],'base64'));
    console.log(name, fs.statSync(path.join(OUT,name)).size, 'bytes');
  }
  console.log('errs', errs.slice(0,3));
  await b.close();
})();
