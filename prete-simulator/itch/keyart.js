/* The store art is the game's own title screen, plated without its lettering
   and set again at the size each picture wants. Nothing here is drawn by
   hand: if the game changes, the cover changes with it. */
const {chromium}=require('playwright-core');
const fs=require('fs'), path=require('path');
const OUT=process.argv[2] || __dirname;
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
  // one device pixel per game pixel, so the plate is exactly 480x270
  const p=await b.newPage({viewport:{width:480,height:270},deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(__dirname,'..','index.html'));
  await p.waitForFunction(()=>typeof WORLD_READY!=='undefined'&&WORLD_READY,{timeout:40000});
  const shots = await p.evaluate(()=>{
    setLang('en');
    GS.state='title'; TT.plate=1;
    /* hold the frame on the beat this picture is of: a bird on his hand */
    let held=0;
    for(let i=0;i<3000;i++){
      update(1/60); render();
      if(i>240 && TT.birds.some(b=>b.st==='perch' && b.p===0)){ held=i; break; }
    }
    if(!held){ for(let i=0;i<60;i++){ update(1/60); render(); } }
    if(cv.width!==W) return {err:'canvas is '+cv.width+'x'+cv.height};
    const plate=cv;

    const plateInto=(g,sx,sy,sw,sh)=>{ g.imageSmoothingEnabled=false;
      g.drawImage(plate, sx,sy,sw,sh, 0,0, sw,sh); };
    const up=(src,scale)=>{ const c=mkCv(src.width*scale, src.height*scale), g=G2(c);
      g.imageSmoothingEnabled=false;
      g.drawImage(src,0,0,src.width,src.height,0,0,c.width,c.height); return c; };

    /* ---- the cover: 630x500, composed at 315x250 ---- */
    const cw=315, ch=250;
    const cc=mkCv(cw,ch), cg=G2(cc);
    plateInto(cg, clamp(TT.px-cw/2,0,W-cw), 6, cw, ch);
    // a little more sky behind the type, so gold reads on it
    { const gr=cg.createLinearGradient(0,0,0,ch*0.52);
      gr.addColorStop(0,'rgba(24,30,64,0.44)');
      gr.addColorStop(1,'rgba(24,30,64,0)');
      cg.fillStyle=gr; cg.fillRect(0,0,cw,ch*0.52); }
    pTxt(cg,'PRETE',     cw/2, 64, PAL.gold,   44,'center',true);
    pTxt(cg,'SIMULATOR', cw/2, 87, '#ffe9b3',  20,'center',true);
    pTxt(cg,'เปรต ซิมูเลเตอร์', cw/2, 106, '#ffd9a0', 9,'center');
    pTxt(cg,'a cozy Thai ghost-village life', cw/2, 120, '#e8e0f4', 7,'center');

    /* ---- the banner: 1920x620, composed at 480x155 ---- */
    const bw=480, bh=155;
    const bc=mkCv(bw,bh), bg=G2(bc);
    plateInto(bg, 0, 96, bw, bh);
    { const gr=bg.createLinearGradient(bw*0.44,0,bw,0);
      gr.addColorStop(0,'rgba(20,26,58,0)');
      gr.addColorStop(0.5,'rgba(20,26,58,0.42)');
      gr.addColorStop(1,'rgba(20,26,58,0.62)');
      bg.fillStyle=gr; bg.fillRect(bw*0.44,0,bw*0.56,bh); }
    const tx=bw*0.705;
    pTxt(bg,'PRETE',     tx, 62, PAL.gold,  40,'center',true);
    pTxt(bg,'SIMULATOR', tx, 83, '#ffe9b3', 17,'center',true);
    pTxt(bg,'เปรต ซิมูเลเตอร์', tx, 101, '#ffd9a0', 9,'center');
    pTxt(bg,'a cozy Thai ghost-village life', tx, 116, '#e8e0f4', 7,'center');

    /* ---- and a plain 480x270 screenshot of the title for the page ---- */
    const sc=mkCv(W,H), sg=G2(sc); sg.imageSmoothingEnabled=false;
    TT.plate=0; render(); sg.drawImage(cv,0,0);

    return { cover: up(cc,2).toDataURL('image/png'),
             banner: up(bc,4).toDataURL('image/png'),
             title:  up(sc,3).toDataURL('image/png') };
  });
  if(shots.err){ console.log('FAILED:', shots.err); await b.close(); return; }
  for(const [k,name] of [['cover','cover-630x500.png'],['banner','banner-1920x620.png'],['title','title-1440x810.png']]){
    fs.writeFileSync(path.join(OUT,name), Buffer.from(shots[k].split(',')[1],'base64'));
    console.log(name, fs.statSync(path.join(OUT,name)).size, 'bytes');
  }
  console.log('errs', errs.slice(0,3));
  await b.close();
})();
