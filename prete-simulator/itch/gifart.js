/* The two moving pictures for the store page, out of the game itself:
   the village at first light, with the light pass on.

     node itch/gifart.js            writes cover-630x500.gif and banner-1920x620.gif,
                                    and a still of each as .png
     node itch/gifart.js stills     writes one PNG of each, for framing

   It is a merit day. Four monks are walking the lane barefoot and the
   village is kneeling along it with rice; the sun is just up behind the
   houses, the kitchens are going, and Boonmee is coming down the road
   from the banana grove with Lung Kham on her neck.

   The world is rendered at 480x270 as always, cropped, and blown up by a
   whole number so every pixel stays square. The last half second of each
   loop dissolves into the first, so it goes round without a jump.

   Needs playwright-core and gifenc (npm i playwright-core gifenc) and a
   chromium that can do WebGL in software (the flags below). */
const {chromium}=require('playwright-core');
const {GIFEncoder, quantize, applyPalette}=require('gifenc');
const fs=require('fs'), path=require('path');
const OUT=path.resolve(__dirname);
const STILLS=process.argv[2]==='stills';
const EXE=process.env.CHROMIUM || '/opt/pw-browsers/chromium';

const SHOTS = {
  cover:  { file:'cover-630x500.gif',   png:'cover-630x500.png',   scale:2, crop:[0,0,315,250], outW:630, outH:500 },
  banner: { file:'banner-1920x620.gif', png:'banner-1920x620.png', scale:4, crop:[0,0,480,155], outW:1920, outH:620 },
};
const FPS=20, LOOP=80, BLEND=12;

(async()=>{
  const b=await chromium.launch({executablePath:EXE,
    args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:480,height:270},deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(__dirname,'..','index.html'));
  await p.waitForFunction(()=>typeof WORLD_READY!=='undefined'&&WORLD_READY,{timeout:60000});
  const fx=await p.evaluate(()=>typeof FX!=='undefined' && FX.on);
  console.log('light pass', fx? 'on' : 'OFF — these will be flat');

  /* set the morning up, once per picture */
  const stage = (k)=>p.evaluate((k)=>{
    setLang('th');
    newGame(); chGo('free'); CH.lock=false; GS.state='play'; GS.tut=99;
    DLG=null; VIG=null; HINT=null; FARM.rented=true; GS.q.blessed=true; GS.q.metPhra=true; PHRA.shown=true;
    for(const kk in GS.seen) GS.seen[kk]=true;
    GS.mem={wake:1,take:1,drink:1,scale:1,bowl:1};
    DAY.n=3;                                     // a merit day
    const MIN = 6.55*60;
    DAY.min=MIN; setTOD(todFromClock(MIN),true);
    const S = k==='cover'
      ? { cam:2150, camY:-16, px:2424, pface:1, ele:2600, lead:2474 }
      : { cam:2150, camY:0, px:2318, pface:1, ele:2598, lead:2470 };
    window.__S=S;
    /* she walks at her own pace wherever the picture wants her */
    window.elePlan = ()=>({x:ELE.x-30, dir:-1, at:'walk'});
    ELE.x=S.ele; ELE.face=-1; ELE.lastX=ELE.x;
    /* the clouds hold still, or the loop jumps */
    if(!window.__clouds){ window.__clouds=drawCloudsFx; }
    window.drawCloudsFx = g=>{ const t=GS.t; GS.t=100; window.__clouds(g); GS.t=t; };
    const hold=()=>{
      DAY.min=MIN; setTOD(todFromClock(MIN),true);
      P.x=S.px; P.y=groundY(S.px); P.vx=0; P.face=S.pface; P.act=null;
      HINT=null; VIG=null; DLG=null; GS.toasts.length=0; SPOTS.length=0; PROMPT=null;
      for(const n of NPCS){ n.bub=null; n.bubT=0; }
      for(const sp of SPIRITS){ sp.bub=null; sp.bubT=0; }
      GS.camX=S.cam; GS.camY=S.camY;
    };
    window.__hold=hold;
    /* run the morning a few seconds so the smoke is up and the birds are out */
    for(let i=0;i<260;i++){ update(1/30); hold(); }
    /* and then put everybody where the picture wants them: the round, already
       out on the lane, and her a little way up the road behind it */
    roundReset(); ROUND.state='walk'; ROUND.lead=S.lead;
    for(const gv of ROUND.givers) if(gv.x+16>S.lead) gv.served=true;
    ELE.x=S.ele; ELE.lastX=ELE.x;
    for(let i=0;i<6;i++){ update(1/30); hold(); }
    return true;
  }, k);

  /* one frame: step, draw, and read back the crop with the light pass under the UI layer */
  const grab = (k, n, dt)=>p.evaluate(([k,n,dt,C])=>{
    const out=[];
    const c=document.createElement('canvas'); c.width=C[2]; c.height=C[3];
    const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
    for(let i=0;i<n;i++){
      update(dt); window.__hold();
      GS.plate=1; render(); GS.plate=0;
      g.clearRect(0,0,c.width,c.height);
      const fxc=document.getElementById('fx');
      if(fxc && FX.on) g.drawImage(fxc, C[0],C[1],C[2],C[3], 0,0,C[2],C[3]);
      g.drawImage(cv, C[0],C[1],C[2],C[3], 0,0,C[2],C[3]);
      /* the name, over the sky */
      titleOn(g, k, c.width, c.height);
      const d=g.getImageData(0,0,c.width,c.height).data;
      let s=''; for(let j=0;j<d.length;j+=8192) s+=String.fromCharCode.apply(null, d.subarray(j,j+8192));
      out.push(btoa(s));
    }
    return out;
    function titleOn(g,k,w,h){
      const NAME='เปรต ซิมูเลเตอร์';
      if(k==='banner'){
        const gr=g.createLinearGradient(0,0,w*0.46,0);
        gr.addColorStop(0,'rgba(20,10,30,0.62)'); gr.addColorStop(0.6,'rgba(20,10,30,0.30)'); gr.addColorStop(1,'rgba(20,10,30,0)');
        g.fillStyle=gr; g.fillRect(0,0,w*0.46,h);
        const sz=19, tx=Math.max(txtW(NAME,sz)/2+16, w*0.2), ty=R(h*0.30);
        pTxt(g,NAME,tx+1,ty+2,'rgba(18,8,6,0.6)',sz,'center'); pTxt(g,NAME,tx,ty,'#ffeec6',sz,'center');
        const w2=txtW(NAME,sz)+20; pR(g,tx-w2/2,ty+10,w2,1,'rgba(255,214,140,0.38)'); pEll(g,tx,ty+10,1.6,1.6,'rgba(255,226,166,0.9)');
      } else {
        const gr=g.createLinearGradient(0,0,0,40);
        gr.addColorStop(0,'rgba(24,12,34,0.62)'); gr.addColorStop(1,'rgba(24,12,34,0)');
        g.fillStyle=gr; g.fillRect(0,0,w,40);
        const sz=13, tx=R(w/2), ty=16;
        pTxt(g,NAME,tx+1,ty+1,'rgba(18,8,6,0.6)',sz,'center'); pTxt(g,NAME,tx,ty,'#ffeec6',sz,'center');
      }
    }
  }, [k,n,dt,SHOTS[k].crop]);

  for(const k of Object.keys(SHOTS)){
    const S=SHOTS[k], [cx,cy,cw,ch]=S.crop;
    /* where the crop sits in the frame is the picture's own business */
    if(k==='cover'){ S.crop[0]=165; S.crop[1]=0; }
    else { S.crop[0]=0; S.crop[1]=76; }
    await stage(k);
    const frames=[];
    const total = STILLS? 1 : LOOP+BLEND;
    while(frames.length<total){ const got=await grab(k, Math.min(10,total-frames.length), 1/FPS); frames.push(...got.map(s=>Buffer.from(s,'base64'))); }
    const W1=S.crop[2], H1=S.crop[3];
    if(STILLS){ writePNG(path.join(OUT, k+'-still.png'), frames[0], W1, H1, S.scale); console.log(k,'still written'); continue; }
    /* the dissolve: the first BLEND frames of the loop are mixed with the ones just after its end */
    const loop=[];
    for(let i=0;i<LOOP;i++){
      if(i<BLEND){ const a=frames[LOOP+i], bb=frames[i], u=i/BLEND, m=Buffer.alloc(a.length);
        for(let j=0;j<a.length;j++) m[j]=R(a[j]*(1-u)+bb[j]*u);
        loop.push(m); }
      else loop.push(frames[i]);
    }
    /* one palette for the whole loop, from a sample of it */
    const samp=[]; for(let i=0;i<LOOP;i+=4) samp.push(loop[i]);
    const all=Buffer.concat(samp);
    const pal=quantize(new Uint8Array(all.buffer, all.byteOffset, all.length), 255, {format:'rgb565'});
    while(pal.length<256) pal.push([0,0,0]);
    const TI=255;
    const gif=GIFEncoder();
    const OW=S.outW, OH=S.outH, sc=S.scale;
    let prev=null;
    for(let i=0;i<LOOP;i++){
      const idx1=applyPalette(new Uint8Array(loop[i].buffer, loop[i].byteOffset, loop[i].length), pal.slice(0,255), 'rgb565');
      const big=new Uint8Array(OW*OH);
      for(let y=0;y<OH;y++){ const sy=Math.min(H1-1,(y/sc)|0);
        for(let x=0;x<OW;x++) big[y*OW+x]=idx1[sy*W1+Math.min(W1-1,(x/sc)|0)]; }
      let fr=big;
      if(prev){ fr=new Uint8Array(big); for(let j=0;j<fr.length;j++) if(fr[j]===prev[j]) fr[j]=TI; }
      gif.writeFrame(fr, OW, OH, i===0? {palette:pal, delay:1000/FPS, repeat:0}
                                     : {delay:1000/FPS, transparent:true, transparentIndex:TI, dispose:1});
      prev=big;
    }
    gif.finish();
    /* and one still of it, for anywhere that will not take a moving picture */
    writePNG(path.join(OUT,S.png), loop[BLEND+8], W1, H1, sc);
    fs.writeFileSync(path.join(OUT,S.file), Buffer.from(gif.bytes()));
    console.log(S.file, (fs.statSync(path.join(OUT,S.file)).size/1048576).toFixed(2)+' MB', LOOP+' frames');
  }
  console.log(errs.length? 'page errors: '+errs.slice(0,3).join(' | ') : 'no page errors');
  await b.close();
})();

/* a plain PNG writer, so the stills need nothing but zlib */
function writePNG(file, rgba, w, h, sc){
  const zlib=require('zlib');
  const W2=w*sc, H2=h*sc, raw=Buffer.alloc((W2*4+1)*H2);
  for(let y=0;y<H2;y++){ raw[y*(W2*4+1)]=0; const sy=(y/sc)|0;
    for(let x=0;x<W2;x++){ const s=(sy*w+((x/sc)|0))*4, d=y*(W2*4+1)+1+x*4;
      raw[d]=rgba[s]; raw[d+1]=rgba[s+1]; raw[d+2]=rgba[s+2]; raw[d+3]=255; } }
  const crc=(buf)=>{ let c=~0; for(const x of buf){ c^=x; for(let k=0;k<8;k++) c=(c>>>1)^(0xEDB88320&-(c&1)); } return ~c>>>0; };
  const chunk=(t,d)=>{ const l=Buffer.alloc(4); l.writeUInt32BE(d.length); const td=Buffer.concat([Buffer.from(t),d]);
    const c=Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l,td,c]); };
  const ih=Buffer.alloc(13); ih.writeUInt32BE(W2,0); ih.writeUInt32BE(H2,4); ih[8]=8; ih[9]=6; ih[10]=0; ih[11]=0; ih[12]=0;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR',ih), chunk('IDAT',zlib.deflateSync(raw)), chunk('IEND',Buffer.alloc(0))]));
}
function R(v){ return Math.round(v); }
