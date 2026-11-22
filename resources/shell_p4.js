/** @file 立体贺卡引擎下篇：真人友好吹蜡烛、预览壳提示、长按兜底与刺绣编辑 */
const H_MS=140,B_MS=860,M_TO=5000,LF=String.fromCharCode(10),flEl=$('fl'),fhEl=flEl?flEl.querySelector('.flh'):null;
let blw=false,blP=0,bhT=null,bRf=null,bSt=0,bOr=null,hDn=null,sP=false,sS=false,sPT=null,sST=null,wMsg='',hT=null;
let bBf=null,bSr=null,bFl=null,bGn=null;
let mAc=false,mPd=false,mDn=false,mGr=false,mId=0,mTr=false,mLv=0,oBs=false,mBlk='';
let mSt=null,mSr=null,mGn=null,mAn=null,mMt=null,mRf=null,mCx=null;
const lSt=new Set();

function gBuf(c){if(bBf)return bBf;const n=Math.floor(c.sampleRate*1.5),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return(bBf=b);}
function stWind(){try{const c=ensureAC();if(!c)return;spWind(0);const t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=gBuf(c);s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(420,t);f.Q.setValueAtTime(1.6,t);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.15,t+.16);s.connect(f);f.connect(g);g.connect(mC||c.destination);s.start(t);bSr=s;bFl=f;bGn=g;}catch{}}
function spWind(pf){try{if(mCtx&&bGn&&bSr){const t=mCtx.currentTime,ps=bSr;bGn.gain.cancelScheduledValues(t);bGn.gain.setValueAtTime(Math.max(.0001,bGn.gain.value),t);bGn.gain.exponentialRampToValueAtTime(.0001,t+.1);ps.stop(t+.12);}if(pf&&mCtx){const t=mCtx.currentTime,s=mCtx.createBufferSource(),f=mCtx.createBiquadFilter(),g=mCtx.createGain();s.buffer=gBuf(mCtx);f.type='lowpass';f.frequency.setValueAtTime(260,t);f.frequency.exponentialRampToValueAtTime(90,t+.09);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.0001,t+.09);s.connect(f);f.connect(g);g.connect(mC||mCtx.destination);s.start(t);s.stop(t+.1);}}catch{}bSr=bFl=bGn=null;}
function flWind(p,ms){
  if(!flEl||xm)return;
  if(p<=.01){flEl.classList.remove('bw');flEl.style.transform=flEl.style.opacity='';if(fhEl)fhEl.style.transform=fhEl.style.opacity='';return;}
  flEl.classList.add('bw');const sk=10+p*34+Math.sin(ms*.038)*(4+p*5),op=Math.max(.28,1-p*.62).toFixed(3);
  flEl.style.transform=`skewX(${sk.toFixed(1)}deg) scale(${Math.max(.55,1-p*.36).toFixed(3)},${Math.max(.42,1-p*.48).toFixed(3)})`;flEl.style.opacity=op;
  if(fhEl){fhEl.style.transform=`scale(${Math.max(.45,1-p*.5).toFixed(3)})`;fhEl.style.opacity=op;}
}
const trk=s=>(s&&lSt.add(s),s),stp=s=>{if(!s)return;lSt.delete(s);try{s.getTracks().forEach(t=>{try{t.stop();}catch{}});}catch{}};
function tip(m,ms=5500){wMsg=m;clearTimeout(hT);syncUI();hT=setTimeout(()=>{wMsg='';syncUI();},ms);}

/** 停用麦克风并彻底释放音轨 */
function stopMic(){
  mId+=1;mPd=mAc=false;mLv=0;if(mRf){cancelAnimationFrame(mRf);mRf=null;}
  try{[mSr,mGn,mAn,mMt].forEach(n=>n&&n.disconnect());}catch{}
  stp(mSt);Array.from(lSt).forEach(stp);lSt.clear();
  if(mCx&&mCx!==mCtx)mCx.close().catch(()=>{});mSt=mSr=mGn=mAn=mMt=mCx=null;
  if(mOn&&mCtx&&mG)try{mG.gain.setTargetAtTime(MG,mCtx.currentTime,.08);}catch{}
  E.mf.style.width='5%';if(!blw)flWind(0,0);syncUI();
}
/** 判断外层嵌套窗口策略是否已禁用麦克风，避免在预览壳中弹出无效授权框 */
const inFr=(()=>{try{return window.self!==window.top;}catch{return true;}})();
function frBlk(){if(!inFr)return false;try{const p=document.permissionsPolicy||document.featurePolicy;if(p&&typeof p.allowsFeature==='function'&&!p.allowsFeature('microphone'))return true;}catch{}return false;}
/** 安全申请麦克风并识别嵌套预览壳策略拦截 */
async function reqMic(sid,ms=M_TO){
  if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){mBlk='env';return null;}
  if(frBlk()){mDn=true;mBlk='iframe';return null;}
  if(mDn)return null;
  let to=false,tm=null;
  const mk=e=>{if(['NotAllowedError','PermissionDeniedError','SecurityError'].includes((e&&e.name)||'')){mDn=true;mBlk=inFr?'iframe':'denied';}};
  const ask=async()=>{
    try{return await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,googEchoCancellation:false,googNoiseSuppression:false,googAutoGainControl:false,googHighpassFilter:false}});}
    catch(e){mk(e);if(!['OverconstrainedError','ConstraintNotSatisfiedError','TypeError'].includes((e&&e.name)||'')||to||sid!==mId)return null;try{return await navigator.mediaDevices.getUserMedia({audio:true});}catch(e2){mk(e2);return null;}}
  };
  const p=ask().then(st=>{if(st){mGr=true;mBlk='';}if(to||sid!==mId){stp(st);return null;}return trk(st);});
  if(!ms||ms<=0)return p;
  const r=await Promise.race([p,new Promise(r=>{tm=setTimeout(()=>{to=true;r(null);},ms);})]);
  if(tm)clearTimeout(tm);return r;
}
/** 启动真人友好双通道宽带吹气检测（低中频主力气流 + 高通麦呼气，带实时音量反馈） */
async function startMic(cSt,cCx){
  if(cSt)trk(cSt);if(xm||!isOpen||!lit||mAc||mPd){if(cSt)stp(cSt);return false;}
  const sid=++mId;mPd=true;const ctx=cCx||ensureAC();
  if(!ctx){if(cSt)stp(cSt);if(sid===mId)mPd=false;return false;}
  const st=trk(cSt||await reqMic(sid,M_TO));
  if(!st||sid!==mId||!isOpen||!lit){stp(st);if(sid===mId)mPd=false;return false;}
  try{
    if(ctx.state==='suspended')await ctx.resume();
    if(sid!==mId||!isOpen||!lit){stp(st);if(sid===mId)mPd=false;return false;}
    mCx=ctx;mSt=st;mSr=ctx.createMediaStreamSource(st);mGn=ctx.createGain();mGn.gain.value=4.2;
    mAn=ctx.createAnalyser();mAn.fftSize=1024;mAn.smoothingTimeConstant=.22;mMt=ctx.createGain();mMt.gain.value=0;
    mSr.connect(mGn);mGn.connect(mAn);mAn.connect(mMt);mMt.connect(ctx.destination);
    const sr=ctx.sampleRate||48000,bh=sr/1024,tb=mAn.frequencyBinCount;
    const l0=Math.max(1,Math.floor(65/bh)),l1=Math.min(tb-1,Math.max(l0+6,Math.ceil(680/bh)));
    const h0=Math.max(l1+1,Math.floor(950/bh)),h1=Math.min(tb-1,Math.max(h0+10,Math.ceil(3600/bh)));
    const tB=new Float32Array(1024),fB=new Uint8Array(tb),stT=performance.now();
    let cMs=0,cOk=false,lT=0,sR=0,sL=0,sH=0,bR=.008,bL=16,bH=14,chg=0;
    const bs=(lo,hi,tk)=>{
      const cnt=Math.max(1,hi-lo+1);let sm=0,mx=0;for(let i=lo;i<=hi;i++){const v=fB[i];sm+=v;if(v>mx)mx=v;}
      const fl=Math.max(18,mx-36);let ac=0,tp=0,sl=0,p1=0,p2=0,p3=0;
      for(let i=lo;i<=hi;i++){const v=fB[i],pw=Math.pow(10,(v-128)/36);if(v>=fl)ac++;tp+=pw;sl+=Math.log(pw+1e-12);if(pw>=p1){p3=p2;p2=p1;p1=pw;}else if(pw>=p2){p3=p2;p2=pw;}else if(pw>p3)p3=pw;}
      return{m:sm/cnt,sp:ac/cnt,sfm:tp>0?Math.exp(sl/cnt)/(tp/cnt):0,pr:tp>0?((tk<=2?p1+p2:p1+p2+p3)/tp):1};
    };
    mPd=false;mAc=true;syncUI();
    const lp=now=>{
      if(sid!==mId||!mAc||!isOpen||!lit)return;
      const dt=lT?Math.min(.08,Math.max(.004,(now-lT)/1000)):.016;lT=now;
      mAn.getFloatTimeDomainData(tB);mAn.getByteFrequencyData(fB);
      if(now-stT<280){mRf=requestAnimationFrame(lp);return;}
      let sq=0;for(let i=0;i<1024;i++)sq+=tB[i]*tB[i];
      const rms=Math.sqrt(sq/1024),L=bs(l0,l1,2),H=bs(h0,h1,3);
      if(!cOk){
        cMs+=dt*1000;sR+=rms*dt;sL+=L.m*dt;sH+=H.m*dt;
        if(cMs>=380){const sc=cMs/1000;cOk=true;bR=Math.max(.004,sR/sc);bL=Math.max(10,sL/sc);bH=Math.max(8,sH/sc);}
        mRf=requestAnimationFrame(lp);return;
      }
      const loH=L.sfm>=.18&&L.sp>=.38&&L.pr<=.62&&L.m>=H.m*.70&&L.m>=Math.max(24,bL+14)&&rms>=Math.max(.010,bR*1.45);
      const hiH=H.sfm>=.18&&H.sp>=.34&&H.pr<=.38&&H.m>=Math.max(22,bH+14)&&rms>=Math.max(.008,bR*1.40);
      if(loH||hiH){
        const ex=loH?(L.m-bL):(H.m-bH),ws=Math.min(2,Math.max((rms-bR)/Math.max(.01,bR*1.4),ex/24));
        mLv=Math.min(1,.30+ws*.62);chg=Math.min(1,chg+dt*(1.28+Math.min(.45,ws*.28)));
      }else{
        if(rms<Math.max(.055,bR*2)){const al=Math.min(.025,dt*.25);bR=bR*(1-al)+rms*al;bL=bL*(1-al)+L.m*al;bH=bH*(1-al)+H.m*al;}
        mLv=Math.max(0,mLv*Math.pow(.08,dt*3.2));chg=Math.max(0,chg-dt*1.15);
      }
      const live=Math.min(.46,Math.max(0,rms-bR)*7.5);
      E.mf.style.width=`${Math.round(Math.max(5,Math.min(100,Math.max(live,chg*.65+mLv*.35)*100)))}%`;
      if(!blw)flWind(Math.min(1,Math.max(chg,mLv*.88)),now);
      if(chg>=1){stopMic();extC();return;}
      mRf=requestAnimationFrame(lp);
    };
    mRf=requestAnimationFrame(lp);return true;
  }catch{stp(st);if(sid===mId)stopMic();return false;}
}
function cHold(ex=false){clearTimeout(bhT);bhT=null;if(bRf){cancelAnimationFrame(bRf);bRf=null;}const w=blw;blw=false;blP=0;bOr=null;if(w||ex)spWind(ex);flWind(0,0);syncUI();}
function sHold(){
  bhT=null;if(xm||!isOpen||!lit||blw)return;blw=true;blP=0;bSt=performance.now();stWind();syncUI();
  const s=n=>{if(!blw||!isOpen||!lit)return;const e=n-bSt;blP=Math.min(1,e/B_MS);flWind(blP,e);if(mCtx&&bFl)try{bFl.frequency.setTargetAtTime(420+blP*380,mCtx.currentTime,.04);}catch{}if(blP>=1){hDn=bOr;if(bOr==='b')sP=true;else if(bOr==='c')sS=true;cHold(true);extC();return;}bRf=requestAnimationFrame(s);};
  bRf=requestAnimationFrame(s);
}
function extC(){if(xm||!lit)return;lit=false;stopMic();cHold(false);boom();tip('蜡烛已吹灭，愿所有温柔与美好如期而至',4000);}
function togC(){if(xm)return;if(lit)extC();else{lit=true;wMsg='';syncUI();if(isOpen&&mTr)startMic();}}
function starW(){if(!xm||!isOpen)return;const l=$('tl');if(!stOn){stOn=true;l.classList.remove('off');}l.classList.add('bu');clearTimeout(sbT);sbT=setTimeout(()=>l.classList.remove('bu'),3200);boom();tip('圣诞快乐，愿漫天星光与温暖常伴左右',4000);}

let bl=JSON.parse(JSON.stringify(cfg.blessing||{}));try{const s=localStorage.getItem(SKEY);if(s)bl=Object.assign(bl,JSON.parse(s));}catch{}
function rBl(){
  const ln=bl.lines||[],lc=ln.length,cc=ln.reduce((a,s)=>a+(s?s.length:0),0),cp=lc>=8||cc>=92,dn=!cp&&(lc>=6||cc>=64),sc=lc>8||cc>110,c=$('lc');
  c.classList.toggle('tc',cp);c.classList.toggle('td',dn);c.classList.toggle('ts0',sc);
  $('vr').textContent=bl.recipient||'';const bx=$('vl');bx.innerHTML='';ln.forEach(t=>{const p=document.createElement('p');p.textContent=t;bx.appendChild(p);});
  $('vc').textContent=bl.closing||'';$('vs').textContent=bl.signature||'';$('vss').textContent=bl.subSignature||'';
  requestAnimationFrame(()=>{const o=c.querySelector('.lbd');if(o){if(o.scrollHeight>o.clientHeight+2)c.classList.add('ts0');o.scrollTop=0;}});
}
rBl();

/** 同步底部控制栏、火苗状态与顶部提示胶囊 */
function syncUI(){
  E.lo.textContent=isOpen?'合上':'翻开贺卡';E.oc.style.display=isOpen?'inline-flex':'none';skEl.classList.toggle('on',isOpen);
  $('bm').classList.toggle('mo',mOn);$('lm').textContent=mOn?'八音盒':'音乐';
  const bp=$('bp');
  if(xm){bp.classList.toggle('so',stOn);$('lp').textContent='星灯';}
  else{bp.classList.toggle('bo',blw);$('lp').textContent=blw?'吹气中':(lit?'吹蜡烛':'点蜡烛');if(flEl)flEl.style.display=lit?'block':'none';$('sm').style.display=lit?'none':'block';}
  E.br.style.display=(Math.abs(tx)>2||Math.abs(ty)>2)?'inline-flex':'none';
  const t=wMsg||(oBs?'正在准备麦克风，请允许或跳过':(!xm&&blw?'轻轻吹气中，继续按住即可吹灭':(!xm&&isOpen&&lit&&mAc?'对着麦克风轻轻吹气即可吹灭蜡烛':(!isOpen&&!tf?(xm?'轻触封面翻开立体圣诞贺卡':'轻触封面翻开立体生日贺卡'):''))));
  E.st.textContent=t;E.sp.classList.toggle('hd',!t);E.sd.classList.toggle('bl',!xm&&blw);
  E.sd.classList.toggle('ml',!xm&&!blw&&(mAc||oBs)&&!wMsg);E.mt.classList.toggle('on',!xm&&isOpen&&lit&&mAc&&!wMsg&&!blw);
}
syncUI();

/** 翻开/合上贺卡，含麦克风预授权与预览壳无打扰降级引导 */
async function togCard(){
  if(oBs)return;if(isOpen){isOpen=false;stopMic();cHold(false);stopM();syncUI();return;}
  const ctx=ensureAC();
  if(!xm&&lit&&frBlk()){mDn=true;mBlk='iframe';}
  const can=!xm&&lit&&!mDn&&window.isSecureContext&&navigator.mediaDevices&&typeof navigator.mediaDevices.getUserMedia==='function';
  if(!xm&&lit&&!can&&!mBlk)mBlk=(!window.isSecureContext||!navigator.mediaDevices)?'env':'denied';
  if(can&&mGr){isOpen=true;startM();syncUI();startMic(null,ctx);return;}
  let pre=null;
  if(can){oBs=true;mTr=true;const ps=++mId;syncUI();try{pre=await reqMic(ps,M_TO);}catch{pre=null;}finally{oBs=false;}if(ps!==mId){stp(pre);syncUI();return;}}
  isOpen=true;startM();
  if(pre&&!xm&&lit)startMic(pre,ctx);
  else{
    if(pre)stp(pre);
    if(!xm&&lit&&mBlk){tip('长按蜡烛吹灭许愿',5500);return;}
  }
  syncUI();
}
const openL=()=>{cHold(false);sEd(false);const m=$('lm0');m.classList.add('on');m.scrollTop=0;};
const hit=(el,x,y,tp=14)=>{const r=el.getBoundingClientRect();return x>=r.left-12&&x<=r.right+12&&y>=r.top-tp&&y<=r.bottom+12;};
const rSup=k=>{if(k==='b'){clearTimeout(sPT);sPT=setTimeout(()=>{sP=false;},160);}else{clearTimeout(sST);sST=setTimeout(()=>{sS=false;},160);}};

window.addEventListener('pagehide',()=>{stopMic();cHold(false);});document.addEventListener('visibilitychange',()=>{if(document.hidden)cHold(false);});
$('bo').onclick=togCard;$('bm').onclick=()=>(mOn?stopM():startM());$('br').onclick=()=>{tx=ty=0;syncUI();};$('bl').onclick=openL;

const bP=$('bp');
bP.addEventListener('contextmenu',e=>e.preventDefault());
bP.addEventListener('pointerdown',e=>{if(xm||(e.pointerType==='mouse'&&e.button!==0))return;sP=false;clearTimeout(sPT);hDn=null;if(!isOpen||!lit)return;ensureAC();bOr='b';bhT=setTimeout(sHold,H_MS);});
['pointerup','pointercancel','pointerleave'].forEach(v=>bP.addEventListener(v,()=>{if(xm)return;if(hDn==='b'){hDn=null;sP=true;rSup('b');return;}if(bOr!=='b')return;if(blw){sP=true;rSup('b');}cHold(false);}));
bP.addEventListener('click',()=>{if(xm){starW();return;}if(sP){sP=false;clearTimeout(sPT);return;}togC();});
E.pl.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&isOpen){e.preventDefault();xm?starW():togC();}});

const csE=document.querySelector('.lcs'),mE=$('lm0'),fMap=[['ir0','recipient'],['ic0','closing'],['is0','signature'],['iss0','subSignature']];
function sEd(sh){$('eb').classList.toggle('on',sh);csE.classList.toggle('me',sh);if(sh)setTimeout(()=>{mE.scrollTop=0;},30);}
document.querySelectorAll('#eb .ei,#eb .ea').forEach(f=>f.addEventListener('focus',()=>setTimeout(()=>{try{f.scrollIntoView({behavior:'smooth',block:'center'});}catch{}},260)));
function uTip(){const el=$('et');if(!el)return;const lv=($('il0').value||'').split(LF).map(s=>s.trim()).filter(Boolean),tc=lv.reduce((a,s)=>a+s.length,0),ov=lv.length>8||tc>110;el.textContent=ov?`共 ${lv.length} 行 / ${tc} 字（超建议值，保存后支持布内滑动）。`:`共 ${lv.length} 行 / ${tc} 字（建议 3~7 行、100 字以内留白最佳）。`;el.classList.toggle('wn',ov);}
$('il0').addEventListener('input',uTip);
$('bc').onclick=()=>{mE.classList.remove('on');sEd(false);};
$('be').onclick=()=>{const sh=!$('eb').classList.contains('on');if(sh){fMap.forEach(([i,k])=>$(i).value=bl[k]||'');$('il0').value=(bl.lines||[]).join(LF);uTip();}sEd(sh);};
$('bsv').onclick=()=>{const nb={lines:$('il0').value.split(LF).map(s=>s.trim()).filter(Boolean)};fMap.forEach(([i,k])=>nb[k]=$(i).value.trim());bl=nb;try{localStorage.setItem(SKEY,JSON.stringify(bl));}catch{}rBl();sEd(false);};
$('brs').onclick=()=>{bl=JSON.parse(JSON.stringify(cfg.blessing||{}));try{localStorage.removeItem(SKEY);}catch{}rBl();sEd(false);};

const stg=$('sw');
stg.addEventListener('contextmenu',e=>{if(isOpen&&(hit(E.pl,e.clientX,e.clientY,18)||hit(E.el,e.clientX,e.clientY,16)))e.preventDefault();});
stg.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;sS=false;clearTimeout(sST);drg=true;sx=e.clientX;sy=e.clientY;bx=tx;by=ty;mv=0;stg.classList.add('dr');if(!xm&&isOpen&&lit&&hit(E.pl,e.clientX,e.clientY,18)){ensureAC();hDn=null;bOr='c';bhT=setTimeout(sHold,H_MS);}});
stg.addEventListener('pointermove',e=>{if(!drg)return;const dx=e.clientX-sx,dy=e.clientY-sy;mv=Math.hypot(dx,dy);if(mv>=10&&bOr==='c')cHold(false);const n=window.innerWidth<=520;ty=Math.max(n?-14:-24,Math.min(n?14:24,by+dx*.13));tx=Math.max(n?-10:-16,Math.min(n?12:18,bx-dy*.11));syncUI();});
['pointerup','pointercancel','pointerleave'].forEach(v=>stg.addEventListener(v,()=>{drg=false;stg.classList.remove('dr');if(xm)return;if(hDn==='c'){hDn=null;sS=true;rSup('c');return;}if(bOr==='c'){if(blw){sS=true;rSup('c');}cHold(false);}}));
stg.addEventListener('click',e=>{if(sS){sS=false;clearTimeout(sST);return;}if(mv>=10)return;if(!isOpen){togCard();return;}if(hit(E.pl,e.clientX,e.clientY,18)){xm?starW():togC();return;}if(hit(E.el,e.clientX,e.clientY,16))openL();});

window.__cardDebug={getState:()=>({occasion:cfg.occasion||'birthday',fold:cfg.fold||'horizontal',isOpen,openProgress:opP,candleLit:lit,blowing:blw,blowProgress:blP,micActive:mAc,micLevel:mLv,micBlockReason:mBlk,starLightsOn:stOn,musicPlaying:mOn,usePhotoLinen:useLin,userTiltX:tx,userTiltY:ty,layout:{...ly}}),setTilt:(a,b)=>{tx=a;ty=b;syncUI();},startMicWithStream:startMic,stopMicDetector:stopMic,startHoldBlow:sHold,cancelHoldBlow:cHold,extinguishCandle:extC,toggleCandle:togC,triggerStarWish:starW,openLetter:openL,toggleCard:togCard};
