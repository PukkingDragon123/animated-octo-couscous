/* ============================================================
   THE STORE ART

   Not painted anywhere. Both pictures are this game, running, with
   GS.plate set — which takes the purse, the clock, the prompts and the
   thumb controls off and leaves the village — and the lettering set over
   the top at the size each picture wants. Change the game and the store
   art changes with it.

     node keyart.js [outdir]
   ============================================================ */
const {chromium}=require('playwright-core');
const fs=require('fs'), path=require('path');
const OUT=process.argv[2] || __dirname;
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',
                                 args:['--no-sandbox']});
  // one device pixel per game pixel, so a plate is exactly 480x270
  const p=await b.newPage({viewport:{width:480,height:270},deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(__dirname,'..','index.html'));
  await p.waitForFunction(()=>typeof WORLD_READY!=='undefined'&&WORLD_READY,{timeout:60000});

  const plate = (where, camNudge, hour)=>p.evaluate(([where,camNudge,hour])=>{
    setLang('en');
    newGame(); chGo('free'); GS.state='play'; GS.tut=99; GS.plate=1;
    DLG=null; VIG=null; BURST=null; HINT=null; PROMPT=null;
    FARM.rented=true; FARM.rice=true; GS.merit=40;
    for(const s of SPIRITS) s.met=true;
    DAY.n=8; DAY.min=hour*60; setTOD(todFromClock(DAY.min),true);
    const x=eval(where);
    P.x=x-34; P.y=groundY(P.x); P.face=1; P.vx=0; P.state='idle';
    GS.camX=clamp(P.x-W/2+camNudge,0,WORLD_W-W); GS.camY=0;
    /* let the village settle — lamps warm up, the wok lights, the bugs come
       out — and only then put the camera where the picture wants it, because
       three hundred frames of update will have walked it back to centre */
    for(let i=0;i<300;i++){ update(1/60); render(); }
    GS.camX=clamp(P.x-W/2+camNudge,0,WORLD_W-W); GS.camY=0;
    render();
    return { px:P.x-GS.camX, cam:GS.camX };
  },[where,camNudge,hour]);

  /* one plate, one crop, one block of type, one PNG */
  const make = (crop, scale, draw)=>p.evaluate(([crop,scale,drawSrc])=>{
    const c=mkCv(crop[2]*scale, crop[3]*scale), g=G2(c);
    g.imageSmoothingEnabled=false;
    g.drawImage(cv, crop[0],crop[1],crop[2],crop[3], 0,0, c.width,c.height);
    (new Function('g','w','h','S', drawSrc))(g, c.width, c.height, scale);
    return c.toDataURL('image/png');
  },[crop,scale,draw]);

  /* ---- the cover: the noodle stall at night, 630x500 ---- */
  await plate('CART_X', 18, 20.6);
  const cover = await make([44,4,315,250], 2, `
    /* the type keeps to the left, where the tamarind and the lanterns are;
       he stands clear of it on the right, which is the whole point of him */
    let gr=g.createLinearGradient(0,0,w*0.86,0);
    gr.addColorStop(0,'rgba(8,10,30,0.62)'); gr.addColorStop(1,'rgba(8,10,30,0)');
    g.fillStyle=gr; g.fillRect(0,0,w*0.86,h);
    gr=g.createLinearGradient(0,0,0,h*0.60);
    gr.addColorStop(0,'rgba(8,10,30,0.46)'); gr.addColorStop(1,'rgba(8,10,30,0)');
    g.fillStyle=gr; g.fillRect(0,0,w,h*0.60);
    pTxt(g,'PRETE',      26, 104, PAL.gold,  84,'left',true);
    pTxt(g,'SIMULATOR',  30, 150, '#ffe9b3', 42,'left',true);
    pTxt(g,'เปรต ซิมูเลเตอร์', 30, 196, '#ffd9a0', 19,'left');
    pTxt(g,'a cozy Thai ghost-village life', 30, 226, '#cfd0e8', 14,'left');
  `);

  /* ---- the banner: the road under the wires, 1920x620 ---- */
  await plate('LAMP_XS[BROKEN_LAMP]', 106, 20.6);
  const banner = await make([0,52,480,155], 4, `
    const gr=g.createLinearGradient(w*0.34,0,w,0);
    gr.addColorStop(0,'rgba(8,10,30,0)'); gr.addColorStop(0.5,'rgba(8,10,30,0.50)');
    gr.addColorStop(1,'rgba(8,10,30,0.70)');
    g.fillStyle=gr; g.fillRect(w*0.34,0,w*0.66,h);
    const tx=w*0.695;
    pTxt(g,'PRETE',      tx, 224, PAL.gold,  154,'center',true);
    pTxt(g,'SIMULATOR',  tx, 312, '#ffe9b3',  56,'center',true);
    pTxt(g,'เปรต ซิมูเลเตอร์', tx, 392, '#ffd9a0', 38,'center');
    pTxt(g,'a cozy Thai ghost-village life', tx, 456, '#cfd0e8', 28,'center');
  `);

  /* ---- and the title screen, unlettered by nothing, for the gallery ---- */
  const title = await p.evaluate(()=>{
    GS.plate=0; GS.state='title';
    for(let i=0;i<240;i++){ update(1/60); render(); }
    const c=mkCv(W*3,H*3), g=G2(c); g.imageSmoothingEnabled=false;
    g.drawImage(cv,0,0,W,H,0,0,c.width,c.height);
    return c.toDataURL('image/png');
  });

  for(const [data,name] of [[cover,'cover-630x500.png'],[banner,'banner-1920x620.png'],
                            [title,'title-1440x810.png']]){
    fs.writeFileSync(path.join(OUT,name), Buffer.from(data.split(',')[1],'base64'));
    console.log(name, fs.statSync(path.join(OUT,name)).size, 'bytes');
  }
  console.log('errs', errs.slice(0,3));
  await b.close();
})();
