/** @file 立体贺卡引擎上篇：主题隔离、3D零穿模渲染与防破音八音盒 */
const $=i=>document.getElementById(i),cfg=window.CARD_CONFIG||{},xm=cfg.occasion==='christmas',tf=cfg.fold==='vertical';
document.documentElement.classList.toggle('tf',tf);document.documentElement.classList.toggle('xm',xm);

/** 计算独立存储键，防止多卡祝福语串词 */
const SKEY=(()=>{
  if(typeof cfg.cardId==='string'&&cfg.cardId.trim())return `pc8_${cfg.cardId.trim()}`;
  const s=`${xm?'x':'b'}|${tf?'v':'h'}|${location.pathname}|${JSON.stringify(cfg.blessing||{})}`;
  let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return `pc8_${(h>>>0).toString(16)}`;
})();

if(xm){
  document.title=tf?'圣诞快乐 · 4:3 立体贺卡':'圣诞快乐 · 手绘立体贺卡';
  ['mnc','hc','wk','iw'].forEach(k=>$(k).style.display='none');
  ['mnt','ht','tl','is'].forEach(k=>$(k).style.display='block');
  $('mnx').textContent='MERRY CHRISTMAS';
  $('hx').innerHTML='<span class="nw">MERRY&nbsp;~</span><br/><span class="nw">CHRISTMAS&nbsp;!</span>';
  $('lp').textContent='星灯';$('pl').setAttribute('aria-label','点击圣诞树点亮星灯');
}else{
  document.title=tf?'生日快乐 · 4:3 立体贺卡':'生日快乐 · 手绘立体贺卡';
  $('pl').setAttribute('aria-label','轻触或长按吹灭蜡烛');
}
if(tf)document.querySelector('#ct span').textContent=xm?'轻触向上掀开圣诞贺卡':'轻触向上掀开立体贺卡';
else if(xm)document.querySelector('#ct span').textContent='轻触翻开圣诞立体贺卡';

const isU=v=>typeof v==='string'&&v.trim().length>0&&!v.includes('{{'),thm=cfg.styleTheme||{},rs=document.documentElement.style;
[['tableInner','--bi'],['tableOuter','--bo'],['paperCream','--pc'],['primaryAccent','--acc'],['secondaryAccent','--acc2'],['waxSealColor','--wax'],['filterCss','--flt']].forEach(([k,v])=>{if(thm[k])rs.setProperty(v,thm[k]);});
const acc=thm.primaryAccent||'#4f7348',flw=thm.secondaryAccent||'#b5496b';
const EMP='data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%204%204%22%3E%3Crect%20width%3D%224%22%20height%3D%224%22%20fill%3D%22%23faf6ec%22/%3E%3C/svg%3E';
const gU=v=>isU(v)?v:EMP;
$('ci').src=gU(cfg.coverImageUrl);$('il').src=gU(cfg.insideLeftUrl);$('ir').src=gU(cfg.insideRightUrl);
const aI=$('ai'),cI=$('ci2'),pI=$('pi'),pS=$('pl0'),eS=$('el0'),pop=$('ps');
const ly={aW:tf?528:510,aH:tf?396:300,cW:tf?280:240,cH:tf?368:292,pW:tf?160:168,pH:tf?194:198,pX:tf?-194:-224,pY:tf?374:206,eX:tf?194:228,eY:tf?368:202};

/** 按立牌真实比例动态适配防撞间距（上下版拱门齐边大气、人物居中放大） */
function fitLy(){
  const f=(im,el,mw,mh,wk,hk)=>{if(!im.naturalWidth)return;const s=Math.min(mw/im.naturalWidth,mh/im.naturalHeight);ly[wk]=Math.round(im.naturalWidth*s);ly[hk]=Math.round(im.naturalHeight*s);if(el)Object.assign(el.style,{width:ly[wk]+'px',height:ly[hk]+'px',marginLeft:(-ly[wk]/2)+'px',marginTop:(-ly[hk])+'px'});};
  f(aI,$('al'),tf?528:536,tf?410:316,'aW','aH');
  if(tf&&aI.naturalWidth&&ly.aW<476){ly.aW=Math.min(516,Math.round(ly.aW*1.15));Object.assign($('al').style,{width:ly.aW+'px',marginLeft:(-ly.aW/2)+'px'});[aI,$('a2'),$('a3')].forEach(x=>x.style.objectFit='fill');}
  f(cI,$('cl'),tf?330:262,tf?372:308,'cW','cH');f(pI,null,tf?164:178,tf?198:210,'pW','pH');
  pS.style.setProperty('--pw',ly.pW+'px');pS.style.setProperty('--ph',ly.pH+'px');const ph=ly.pW/2;
  if(tf){ly.pX=-Math.round(Math.max(186,Math.min(268-ph,ly.cW/2+ph*.42+10)));ly.pY=374;ly.eX=Math.round(Math.max(188,Math.min(204,ly.cW/2+54)));ly.eY=368;}
  else{ly.pX=-Math.round(Math.max(210,Math.min(400-ph,ly.cW/2+ph+18)));ly.pY=208;ly.eX=Math.round(Math.max(216,Math.min(334,ly.cW/2+88)));ly.eY=204;}
}
[aI,cI,pI].forEach(i=>i.addEventListener('load',fitLy));
aI.src=$('a3').src=$('a2').src=gU(cfg.archUrl);cI.src=$('c1').src=$('c2').src=$('c3').src=gU(cfg.characterImageUrl);pI.src=$('p3').src=$('p2').src=gU(cfg.cakeTableUrl);
if(!xm){
  if(cfg.cakeWickPos&&typeof cfg.cakeWickPos.leftPct==='number'){$('wk').style.display='';$('wk').style.left=cfg.cakeWickPos.leftPct+'%';$('wk').style.top=cfg.cakeWickPos.topPct+'%';}
  else if(cfg.cakeWickPos===null)$('wk').style.display='none';
}
if(xm){
  const tl=cfg.treeLights||{},se=$('t0'),ts=Object.prototype.hasOwnProperty.call(tl,'topStar')?tl.topStar:{leftPct:50,topPct:8.5};
  if(se){if(ts&&typeof ts.leftPct==='number'){se.style.display='';se.style.left=ts.leftPct+'%';se.style.top=ts.topPct+'%';}else se.style.display='none';}
  const def=[[45,24,9,.1,1.7,1],[56,29,8,.5,2,0],[39,39,10,.9,1.6,1],[58,42,8,1.3,2.1,0],[33,53,10,.3,1.8,1],[50,51,9,.8,1.6,0],[65,55,8,1.4,2.2,1],[30,67,9,.6,1.9,0],[48,65,10,1.1,1.7,1],[67,68,9,.2,2,0]].map(([leftPct,topPct,size,delay,duration,warm])=>({leftPct,topPct,size,delay,duration,warm:!!warm}));
  const w=$('tw');w.innerHTML='';
  (Array.isArray(tl.lights)?tl.lights:def).forEach(pt=>{const n=document.createElement('span'),sz=pt.size||9;n.className='sln';n.style.cssText=`left:${pt.leftPct}%;top:${pt.topPct}%;width:${sz}px;height:${sz}px;--dl:${pt.delay||0}s;--d:${pt.duration||1.8}s;--c:${pt.warm?'#fff9d6':'#fff'};--g:${pt.warm?'rgba(255,214,102,.92)':'rgba(255,244,196,.88)'}`;w.appendChild(n);});
}
const useLin=isU(cfg.linenImageUrl);if(useLin){$('lbg').src=cfg.linenImageUrl;$('lbg').style.display='block';$('lc').classList.add('hi');}
const skEl=$('sk');[[15,18],[28,12],[46,15],[67,14],[82,20],[12,36],[88,34]].forEach(([x,y],i)=>{const s=document.createElement('span');s.className='sd';s.style.cssText=`left:${x}%;top:${y}%;width:3.5px;height:3.5px;animation-delay:${i*.4}s`;skEl.appendChild(s);});

let isOpen=false,opP=0,lit=true,stOn=true,sbT=null,tx=0,ty=0,sSc=1,cSc=1,drg=false,sx=0,sy=0,bx=0,by=0,mv=0;
const E={rig:$('rig'),sh:$('tsh'),lf:$('ll'),rf:$('rl'),al:$('al'),cl:$('cl'),cs:$('cs'),pl:$('pl'),el:$('el'),ct:$('ct'),oc:$('oc'),lo:$('lo'),sp:$('sp'),sd:$('sd'),st:$('st'),mt:$('mt'),mf:$('mf'),br:$('br')};
function upSc(){
  const vw=window.innerWidth,sh=$('sw').clientHeight||(window.innerHeight-110);
  if(tf){sSc=Math.max(.24,Math.min(1.02,Math.min((vw-28)/700,(sh-28)/910)));cSc=Math.max(.28,Math.min(1.02,Math.min((vw-32)/620,(sh-28)/470)));return;}
  sSc=Math.max(.22,Math.min(1.12,Math.min((vw-28)/1000,(sh-28)/610)));
}
upSc();window.addEventListener('resize',upSc);if('ResizeObserver' in window)new ResizeObserver(upSc).observe($('sw'));

let lTs=0;
/** 两段式零穿模 3D 渲染循环 */
function loop3D(ts){
  const now=typeof ts==='number'?ts:performance.now(),dt=lTs?Math.min(.08,Math.max(.004,(now-lTs)/1000)):.016;lTs=now;
  const df=(isOpen?1:0)-opP;opP=Math.abs(df)>.0012?opP+df*(1-Math.exp(-dt*4.8)):(isOpen?1:0);
  const p=opP,le=1-Math.pow(1-Math.min(1,p/.56),2.2);E.ct.style.opacity=p<.08?'1':'0';
  if(tf){
    const sc=cSc+(sSc-cSc)*le;
    E.rig.style.transform=`scale(${sc.toFixed(4)}) translate3d(0,${(-206+218*le).toFixed(1)}px,0) rotateX(${(8+38*le+tx).toFixed(2)}deg) rotateY(${ty.toFixed(2)}deg)`;
    E.sh.style.transform='translate3d(0,16px,-24px)';E.lf.style.transform=`translateZ(${(3.2*(1-le)).toFixed(2)}px) rotateX(${(-179.4+153.4*le).toFixed(2)}deg)`;E.rf.style.transform='rotateX(0deg)';
    if(p<.58){pop.classList.add('ph');requestAnimationFrame(loop3D);return;}
    pop.classList.remove('ph');const r=Math.sin(((p-.58)/.42)*Math.PI/2),y=Math.max(.04,r).toFixed(4);
    E.al.style.transform=`translate3d(0,16px,10px) rotateX(-68deg) scaleY(${y})`;E.cl.style.transform=`translate3d(0,258px,16px) rotateX(-70deg) scaleY(${y})`;
    E.cs.style.opacity=(.28*r).toFixed(3);E.cs.style.transform=`translate3d(0,262px,2px) scale(${(.85+.35*r).toFixed(3)})`;
    pS.style.transform=`translate3d(${ly.pX}px,${ly.pY}px,10px)`;E.pl.style.transform=`rotateX(-70deg) scaleY(${y})`;
    eS.style.transform=`translate3d(${ly.eX}px,${ly.eY}px,10px)`;E.el.style.transform=`rotateX(-64deg) scaleY(${y})`;
    requestAnimationFrame(loop3D);return;
  }
  const sc=sSc+(Math.max(.42,sSc)-sSc)*(1-le),pa=3.5*le,la=179.4*(1-le)+pa;
  E.rig.style.transform=`scale(${sc.toFixed(4)}) translate3d(${(-215*(1-le)).toFixed(1)}px,${(40*le).toFixed(1)}px,0) rotateX(${(10+38*le+tx).toFixed(2)}deg) rotateY(${(-4*(1-le)+ty).toFixed(2)}deg)`;
  E.sh.style.width=`${(440+420*le).toFixed(1)}px`;E.sh.style.transform=`translate3d(${(215*(1-le)).toFixed(1)}px,20px,-24px)`;
  E.lf.style.transform=`translateZ(${(3.2*(1-le)).toFixed(2)}px) rotateY(${la.toFixed(2)}deg)`;E.rf.style.transform=`rotateY(${(-pa).toFixed(2)}deg)`;
  if(p<.58){pop.classList.add('ph');requestAnimationFrame(loop3D);return;}
  pop.classList.remove('ph');const r=Math.sin(((p-.58)/.42)*Math.PI/2),y=Math.max(.04,r).toFixed(4),rd=pa*Math.PI/180,lr=la*Math.PI/180,ms=Math.max(Math.sin(rd),Math.sin(lr)),az=ly.aW*.5*ms+14,cz=ly.cW*.5*ms+18;
  E.al.style.transform=`translate3d(0,-46px,${az.toFixed(1)}px) rotateX(-68deg) scaleY(${y})`;E.cl.style.transform=`translate3d(0,158px,${cz.toFixed(1)}px) rotateX(-70deg) scaleY(${y})`;
  E.cs.style.opacity=(.28*r).toFixed(3);E.cs.style.transform=`translate3d(0,162px,${(cz-6).toFixed(1)}px) scale(${(.7+.3*r).toFixed(3)})`;
  pS.style.transform=`translate3d(${(ly.pX*Math.cos(lr)).toFixed(1)}px,${ly.pY}px,${(-ly.pX*Math.sin(lr)+10).toFixed(1)}px) rotateY(${la.toFixed(2)}deg)`;E.pl.style.transform=`rotateX(-70deg) scaleY(${y})`;
  eS.style.transform=`translate3d(${(ly.eX*Math.cos(rd)).toFixed(1)}px,${ly.eY}px,${(ly.eX*Math.sin(rd)+10).toFixed(1)}px) rotateY(${(-pa).toFixed(2)}deg)`;E.el.style.transform=`rotateX(-64deg) scaleY(${y})`;
  requestAnimationFrame(loop3D);
}
requestAnimationFrame(loop3D);

let mCtx=null,mG=null,mR=null,mT=null,mI=0,mOn=false,mC=null;
const MG=.78,FR={D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,Bb4:466.2,B4:493.9,C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784,A5:880},BEAT=xm?420:560;
const SC=(xm?'G4:1,C5:1:E4,C5:.5,D5:.5,C5:.5,B4:.5,A4:1:F4,A4:1,A4:1,D5:1:F4,D5:.5,E5:.5,D5:.5,C5:.5,B4:1:G4,G4:1,G4:1,E5:1:G4,E5:.5,F5:.5,E5:.5,D5:.5,C5:1:A4,A4:1,G4:.5,G4:.5,A4:1:F4,D5:1:G4,B4:1:G4,C5:2.8:E4:1':'C5:.75,C5:.25,D5:1:F4,C5:1:A4,F5:1:A4,E5:2:G4,C5:.75,C5:.25,D5:1:E4,C5:1:G4,G5:1:Bb4,F5:2:A4,C5:.75,C5:.25,C5:1:F4,A5:1:C5,F5:1:A4,E5:1:G4,D5:1.6:F4,Bb4:.75,Bb4:.25,A5:1:C5,F5:1:A4,G5:1:Bb4,F5:2.8:A4:1').split(',').map(s=>{const a=s.split(':');return[a[0],+a[1],a[2]||'',+a[3]||0];});

/** 唤醒 Web Audio 并串接防破音限幅器 */
function ensureAC(){
  try{
    if(!mCtx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
      mCtx=new AC();mC=mCtx.createDynamicsCompressor();mC.threshold.value=-12;mC.knee.value=10;mC.ratio.value=8;mC.attack.value=.002;mC.release.value=.14;
      const o=mCtx.createGain();o.gain.value=.84;mC.connect(o);o.connect(mCtx.destination);
      mG=mCtx.createGain();mG.gain.value=MG;mG.connect(mC);mR=mCtx.createGain();mR.gain.value=.36;
      const d=mCtx.createDelay(),fb=mCtx.createGain(),lp=mCtx.createBiquadFilter();d.delayTime.value=.17;fb.gain.value=.28;lp.type='lowpass';lp.frequency.value=3200;
      mR.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(mG);
      try{const b=mCtx.createBuffer(1,1,mCtx.sampleRate),s=mCtx.createBufferSource();s.buffer=b;s.connect(mCtx.destination);s.start(0);}catch{}
    }
    if(mCtx.state==='suspended')mCtx.resume().catch(()=>{});return mCtx;
  }catch{return null;}
}
function pluck(f,v){
  if(!mCtx||!f)return;const n=mCtx.currentTime;
  [['sine',1,.78,.007,1.42,1.48,1],['triangle',2,.26,.004,.42,.45,1],['sine',3.01,.15,.003,.11,.13,0]].forEach(([t,m,a,ak,dc,sp,rv])=>{
    const o=mCtx.createOscillator(),g=mCtx.createGain();o.type=t;o.frequency.setValueAtTime(f*m,n);
    g.gain.setValueAtTime(.0001,n);g.gain.linearRampToValueAtTime(a*v,n+ak);g.gain.exponentialRampToValueAtTime(.0001,n+dc);
    o.connect(g);g.connect(mG);if(rv)g.connect(mR);o.start(n);o.stop(n+sp);
  });
}
function stepM(){if(!mOn)return;const[n,b,h,e]=SC[mI];pluck(FR[n],1);if(h)pluck(FR[h],.46);mI=(mI+1)%SC.length;mT=setTimeout(stepM,b*BEAT+(e?1100:0));}
function startM(){if(mOn)return;const c=ensureAC();if(c&&mG){mG.gain.setValueAtTime(MG,c.currentTime);mOn=true;mI=0;clearTimeout(mT);stepM();}syncUI();}
function stopM(){mOn=false;clearTimeout(mT);if(mCtx&&mG)try{mG.gain.setTargetAtTime(.0001,mCtx.currentTime,.08);}catch{}syncUI();}
function boom(){
  const l=$('pt'),cs=xm?['#fff','#fdf6e3','#c84b3e','#4f7348','#e8b954']:[flw,acc,'#e899ab','#f0be59'];
  for(let i=0;i<28;i++){const s=document.createElement('span'),sn=xm&&i%2===0,z=sn?5+(i%5):9+(i%6);s.className=sn?'ptl sf':'ptl';s.style.cssText=`left:${6+Math.random()*88}%;width:${z}px;height:${z}px;background:${cs[i%cs.length]};animation-delay:${(Math.random()*.9).toFixed(2)}s;--dx:${Math.round((Math.random()-.5)*115)}px`;l.appendChild(s);setTimeout(()=>s.remove(),4800);}
}
