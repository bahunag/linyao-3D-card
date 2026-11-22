"""林爻3D贺卡纯本地刀模抠图与母版打包器(V8.6,仅Pillow,零联网)"""
import argparse as ag,base64 as b64,colorsys as cs,hashlib as hl,io,json,math,os,random as rd,re,sys,uuid
from collections import deque
from pathlib import Path
from PIL import Image as Im,ImageChops as Ic,ImageDraw as Id,ImageFilter as If,ImageOps as Io

RES,EXTS,BS,NL=Path(__file__).resolve().parent.parent/"resources",(".png",".jpg",".jpeg",".webp"),chr(92),chr(10)
LZ,BL,BC,GB,AC,NW=Im.Resampling.LANCZOS,Im.Resampling.BILINEAR,Im.Resampling.BICUBIC,If.GaussianBlur,Im.alpha_composite,Im.new
f1=lambda wd,*ss:next((str(wd/f"{s}{e}") for s in ss for e in EXTS if wd and wd.is_dir() and (wd/f"{s}{e}").is_file()),None)
cl=lambda v,a,b:a if v<a else (b if v>b else v)
okf=lambda p:bool(p and os.path.isfile(p))

def flood_bg(rgb,hole=0):
    w,h=rgb.size;px=rgb.load();pts=[(x,y) for x in(0,min(3,w-1),w-1,max(0,w-4)) for y in(0,h-1)][:8]
    ac=sum(min(px[x,y]) for x,y in pts)/len(pts);th=238 if ac>=246 else (int(ac-10) if ac>=232 else 228)
    vis,bg,q=bytearray(w*h),bytearray(w*h),deque();ok=lambda x,y:min(px[x,y])>=th and max(px[x,y])-min(px[x,y])<=18
    def sd(x,y):
        i=y*w+x
        if not vis[i] and ok(x,y):vis[i]=bg[i]=1;q.append((x,y))
    for x in range(w):sd(x,0);sd(x,h-1)
    for y in range(h):sd(0,y);sd(w-1,y)
    if hole:
        for ry in(.68,.78,.88):sd(w//2,min(h-1,int(h*ry)))
    while q:
        cx,cy=q.popleft()
        for nx,ny in((cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1)):
            if 0<=nx<w and 0<=ny<h and not vis[ny*w+nx]:
                ni=ny*w+nx;vis[ni]=1
                if ok(nx,ny):bg[ni]=1;q.append((nx,ny))
    return Im.frombytes("L",(w,h),bytes(0 if b else 255 for b in bg))

def clean_dots(m):
    w,h=m.size;raw=m.tobytes();vis=bytearray(w*h);cs0=[]
    for i in range(w*h):
        if not raw[i] or vis[i]:continue
        c,q=[],deque([i]);vis[i]=1;x0,y0,x1,y1=w,h,-1,-1
        while q:
            u=q.popleft();c.append(u);x,y=u%w,u//w;x0,x1,y0,y1=min(x0,x),max(x1,x),min(y0,y),max(y1,y)
            for v,ok in((u-1,x>0),(u+1,x+1<w),(u-w,y>0),(u+w,y+1<h)):
                if ok and raw[v] and not vis[v]:vis[v]=1;q.append(v)
        cs0.append((c,(x0,y0,x1,y1)))
    if not cs0:return m
    ma=max(len(c) for c,_ in cs0);ct=max(24,int(ma*.02));mx0,my0,mx1,my1=w,h,-1,-1
    for c,(x0,y0,x1,y1) in cs0:
        if len(c)>=ct or len(c)==ma:mx0,my0,mx1,my1=min(mx0,x0),min(my0,y0),max(mx1,x1),max(my1,y1)
    nd,fd,ft,mt=max(14,int(min(w,h)*.04)),max(20,int(min(w,h)*.06)),max(320,int(ma*.045)),max(24,int(ma*.0025))
    out=bytearray(w*h)
    for c,(x0,y0,x1,y1) in cs0:
        a,d=len(c),max(mx0-x1,x0-mx1,my0-y1,y0-my1,0)
        if a>=ct or a==ma or (a>=5 if d<=nd else (a>=ft if d>fd else a>=mt)):
            for p in c:out[p]=255
    return Im.frombytes("L",(w,h),bytes(out))

def strip_rim(rgba,md=15):
    w,h=rgba.size;px=rgba.load();ds=[-1]*(w*h);rm=bytearray(w*h);q=deque()
    for y in range(h):
        for x in range(w):
            if px[x,y][3]<=180:i=y*w+x;ds[i]=0;rm[i]=1;q.append((x,y))
    while q:
        cx,cy=q.popleft();cd=ds[cy*w+cx]
        if cd>=md:continue
        for nx,ny in((cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1)):
            if 0<=nx<w and 0<=ny<h and ds[ny*w+nx]==-1:
                ni=ny*w+nx;r,g,b,a=px[nx,ny]
                if a<=210 or (r>=g-3 and g>=b-3 and min(r,g,b)>=188 and max(r,g,b)-min(r,g,b)<=32):ds[ni]=cd+1;rm[ni]=1;q.append((nx,ny))
                else:ds[ni]=md+1
    return clean_dots(Im.frombytes("L",(w,h),bytes(0 if v else 255 for v in rm)))

def vis_ok(rgba):
    w,h=rgba.size;t=w*h;op=dr=0
    if t<=0:return False,0.
    for r,g,b,a in rgba.convert("RGBA").getdata():
        if a>200:
            op+=1
            if min(r,g,b)<238 or max(r,g,b)-min(r,g,b)>12:dr+=1
    return (op>=min(400,max(80,t//12)) and dr>=max(60,min(200,int(t*.004))) and op/t>=.012),round(op/t,4)

def standee(src,bd=12,ms=860,hole=0,rfg=0):
    raw=Im.open(src)
    if max(raw.size)>ms:raw.thumbnail((ms,ms),LZ)
    if raw.mode in("RGBA","LA","PA") or "transparency" in raw.info:
        r0=raw.convert("RGBA");ac=r0.getchannel("A");w0,h0=r0.size
        if ac.getextrema()[0]<20:
            apx=ac.load();st=max(1,min(w0,h0)//64)
            bs=[apx[x,y] for x in range(0,w0,st) for y in(0,h0-1)]+[apx[x,y] for y in range(0,h0,st) for x in(0,w0-1)]
            btr=sum(v<30 for v in bs)/max(1,len(bs));ttr=sum(ac.histogram()[:30])/max(1,w0*h0)
            if btr>=.55 or (ttr>=.15 and btr>=.35):
                res=r0.copy();res.putalpha(Ic.darker(ac,clean_dots(ac.point(lambda p:255 if p>24 else 0))))
                bb=res.getchannel("A").getbbox();out=res.crop(bb) if bb else res
                return (out,strip_rim(out)) if rfg else out
        img=AC(NW("RGBA",r0.size,(255,255,255,255)),r0).convert("RGB")
    else:img=raw.convert("RGB")
    fg=clean_dots(flood_bg(img,hole));pad=bd*2+12;cw,ch=img.width+pad*2,img.height+pad*2
    ip=NW("RGB",(cw,ch),(255,255,255));ip.paste(img,(pad,pad));mp=NW("L",(cw,ch),0);mp.paste(fg,(pad,pad));die=mp
    for _ in range(max(1,bd//2)):die=die.filter(If.MaxFilter(5))
    da=die.filter(GB(3.)).point(lambda p:0 if p<95 else min(255,int((p-95)*3.2)))
    pp=Im.composite(NW("RGB",(cw,ch),(216,206,188)),NW("RGB",(cw,ch),(250,246,236)),Ic.subtract(da,da.filter(If.MinFilter(3))).point(lambda p:int(p*.52)))
    res=Im.composite(ip,pp,mp.filter(GB(.35))).convert("RGBA");res.putalpha(da)
    bb=res.getchannel("A").getbbox();bx=(max(0,bb[0]-6),max(0,bb[1]-6),min(cw,bb[2]+6),min(ch,bb[3]+6)) if bb else (0,0,cw,ch)
    return (res.crop(bx),mp.crop(bx)) if rfg else res.crop(bx)

def align_feet(im):
    s=im.getchannel("A").point(lambda v:255 if v>=192 else 0);bb=s.getbbox()
    if not bb:return im
    l,t,r,b=bb;w,h=r-l,b-t;ft=[]
    for a0,a1 in((.07,.31),(.69,.93)):
        es=sorted(bx[3] for x in range(l+int(a0*w),l+int(a1*w)) if (bx:=s.crop((x,t,x+1,b)).getbbox()))
        if not es:return im
        ft.append(t+es[int(.8*(len(es)-1))])
    sh=min(ft)
    if b-sh>h*.07:return im
    cut=sh-max(1,h//300);sp=s.crop((0,cut-1,im.width,cut)).getbbox()
    return im.crop((sp[0],0,sp[2],cut)) if (sp and sp[0]-l<=w*.02 and r-sp[2]<=w*.02) else im.crop((0,0,im.width,cut))

def scan_row(pm,y,x0,x1):
    sg,on,s0=[],0,0
    for x in range(x0,x1):
        if pm[x,y]>128:
            if not on:on,s0=1,x
        elif on:on=0;sg.append((s0,x-1))
    if on:sg.append((s0,x1-1))
    return sg

def detect_wick(rgba,fg=None):
    """基于纯前景轮廓定位顶部居中单蜡烛芯(零误伤白奶油蛋糕)"""
    w,h=rgba.size;m=fg if(fg is not None and fg.size==(w,h)) else strip_rim(rgba);bb=m.getbbox()
    if not bb:return None
    ft=bb[1];mp,cp=m.load(),rgba.load();fgp=lambda x,y:0<=x<w and 0<=y<h and mp[x,y]>128
    msw,mdx,mch=max(20,int(w*.095)),max(6,int(w*.025)),max(8,int(h*.022));chs,act=[],[]
    for y in range(max(0,ft),min(h-1,int(h*.52))):
        mg=[]
        for a0,a1 in scan_row(mp,y,int(w*.18),int(w*.82)):
            if mg and a0-mg[-1][1]<=2:mg[-1]=(mg[-1][0],a1)
            else:mg.append((a0,a1))
        nar=[(a0,a1,(a0+a1)*.5,a1-a0+1) for a0,a1 in mg if 1<=a1-a0+1<=msw];nxt,us=[],set()
        for ch in act:
            ly,lcx,lw=ch[-1][0],ch[-1][3],ch[-1][4]
            if y-ly>3:
                if ly-ch[0][0]+1>=mch and len(ch)>=6:chs.append(ch)
                continue
            cd=[(abs(cx-lcx),i,(y,a0,a1,cx,wd)) for i,(a0,a1,cx,wd) in enumerate(nar) if i not in us and abs(cx-lcx)<=mdx and wd<=lw*2.4+6]
            if cd:_,i,it=min(cd);us.add(i);ch.append(it)
            nxt.append(ch)
        nxt+=[[(y,a0,a1,cx,wd)] for i,(a0,a1,cx,wd) in enumerate(nar) if i not in us];act=nxt
    chs+=[ch for ch in act if ch[-1][0]-ch[0][0]+1>=mch and len(ch)>=6]
    bsc,bpt=-1e9,None;ss,ms,gr=max(14,int(w*.055)),max(7,int(w*.025)),max(22,int(h*.11))
    for ch in chs:
        y0,y1=ch[0][0],ch[-1][0];ax=sum(p[3] for p in ch[:6])/min(6,len(ch));aw=sum(p[4] for p in ch)/len(ch);bx=ch[-1][3]
        if not(w*.22<=ax<=w*.78) or abs(bx-ch[0][3])>max(9,int(w*.048)):continue
        lx=int(round(bx));cb=gv=0;bt=None
        for cy in range(y1+1,min(h-1,y1+gr)):
            if not any(fgp(x,cy) for x in range(max(0,lx-12),min(w,lx+13))):
                gv+=1;cb=0
                if gv>=5:break
                continue
            lc=sum(fgp(x,cy) for x in range(max(0,lx-ss*2),max(0,lx-2)));rc=sum(fgp(x,cy) for x in range(min(w,lx+3),min(w,lx+ss*2+1)))
            if lc>=ms and rc>=ms and lc+rc>=max(24,int(aw*2.2)):
                cb+=1
                if cb>=2:bt=cy-1;break
            else:cb=0
        if bt is None:continue
        de=min(h-1,bt+max(28,int(h*.085)))
        if sum(sum(fgp(x,dy) for x in range(max(0,lx-ss),min(w,lx+ss+1)))>=max(14,int(ss*.8)) for dy in range(bt,de))/max(1,de-bt)<.72:continue
        sc=5.*max(0.,1.-(y0-ft)/max(1.,h*.24))+4.*max(0.,1.-abs(ax/w-.5)*2.2)+min(4.2,(y1-y0+1)/max(2.,aw))+5.
        if sc>bsc:bsc,bpt=sc,(ax,y0)
    if not bpt or bsc<7.:return None
    wx,wy=bpt;ix=int(round(wx))
    for ty in range(max(0,int(wy)-6),int(wy)):
        ps=[xx for xx in range(max(0,ix-3),min(w,ix+4)) if cp[xx,ty][3]>200 and max(cp[xx,ty][:3])<150]
        if ps:wx,wy=sum(ps)/len(ps),float(ty);break
    return {"leftPct":round(cl(wx/w*100.,22.,78.),2),"topPct":round(cl(wy/h*100.+.35,2.,45.),2)}

def make_linen(w=520,h=710):
    """纯Pillow织出暖沙原麻3D高度场棉麻底布、厚鼓滚边、粗棉绳锁边与手撕毛边"""
    rng,ts,k3=rd.Random(20261121),144,math.pi/3.;hg=[0.]*(ts*ts)
    for y in range(ts):
        rw,xw=y*ts,math.sin(y*6*math.pi/ts+.5)*.65
        for x in range(ts):
            sv,tv=math.sin((x+xw+y*.18)*k3),math.sin((y+math.sin(x*8*math.pi/ts+1.2)*.55)*k3)
            wa,we=abs(sv)*(1+.3*tv)*.8,abs(tv)*(1-.3*sv)*1.1;hg[rw+x]=.5*max(wa,we)+.22*(wa+we)+rng.uniform(-.16,.16)
    bf,k=bytearray(ts*ts*3),0
    for y in range(ts):
        ru,rm,rd0=((y-1)%ts)*ts,y*ts,((y+1)%ts)*ts
        for x in range(ts):
            v=(.68*(hg[rm+(x+1)%ts]-hg[rm+(x-1)%ts])+.73*(hg[rd0+x]-hg[ru+x]))*20.5+(hg[rm+x]-.78)*14.+rng.uniform(-5.5,5.5)-(rng.uniform(11.,23.) if rng.random()<.009 else 0.)
            bf[k]=int(cl(223+v,136,250));bf[k+1]=int(cl(214+v*.96,126,244));bf[k+2]=int(cl(197+v*.89,110,228));k+=3
    tl,bs=Im.frombytes("RGB",(ts,ts),bytes(bf)),NW("RGB",(w,h))
    for ty in range(0,h,ts):
        for tx in range(0,w,ts):bs.paste(tl,(tx,ty))
    bs=bs.filter(GB(.24));mw,mh,mx,my=w//2,h//2,38,40;hm=NW("L",(mw,mh),176);hd=Id.Draw(hm)
    hd.rectangle([mx//2+3,my//2+3,mw-mx//2-3,mh-my//2-3],fill=124);hd.rectangle([mx//2,my//2,mw-mx//2,mh-my//2],outline=64,width=6)
    hd.line([(int(mw*.15),int(mh*.64)),(int(mw*.52),int(mh*.4)),(int(mw*.86),int(mh*.25))],fill=140,width=28,joint="curve")
    hm=Im.blend(hm.filter(GB(6.5)).resize((w,h),BC),Im.frombytes("L",(16,22),bytes(rng.randint(104,150) for _ in range(352))).resize((w,h),BC).filter(GB(24)),.28)
    shf=lambda dx,dy,c:Ic.subtract(Ic.offset(hm,dx,dy),Ic.offset(hm,-dx,-dy)).point(lambda p:int(p*c))
    la,da=Ic.add(Ic.add(shf(4,0,.62),shf(0,4,.68)),hm.point(lambda p:max(0,int((p-126)*.45)))),Ic.add(Ic.add(shf(-4,0,.6),shf(0,-4,.65)),hm.point(lambda p:max(0,int((126-p)*.56))))
    bs=Ic.subtract(Ic.add(bs,Im.merge("RGB",(la,la.point(lambda p:int(p*.97)),la.point(lambda p:int(p*.91))))),Im.merge("RGB",(da,da.point(lambda p:int(p*1.03)),da.point(lambda p:int(p*1.09)))))
    lays=[NW("RGBA",(w,h),(c[0],c[1],c[2],0)) for c in((82,66,50),(62,47,34),(70,56,42),(235,228,212))]
    Id.Draw(lays[0]).rectangle([mx,my,w-mx,h-my],outline=(82,66,50,62),width=7);dd,sd,td=(Id.Draw(lays[i]) for i in(1,2,3))
    qb=lambda x0,y0,xm,ym,x1,y1,t:((1-t)**2*x0+2*(1-t)*t*(2*xm-.5*(x0+x1))+t*t*x1,(1-t)**2*y0+2*(1-t)*t*(2*ym-.5*(y0+y1))+t*t*y1)
    for cnt,p0,p1,hz,fx,iv in((11,mx+6,w-mx-6,1,my,-1),(11,mx+6,w-mx-6,1,h-my,1),(16,my+6,h-my-6,0,mx,-1),(16,my+6,h-my-6,0,w-mx,1)):
        st=(p1-p0)/cnt;sl=st*.79
        for i in range(cnt):
            a=p0+i*st+(st-sl)*.5+rng.uniform(-1.5,1.5);b=a+sl+rng.uniform(-2.,2.);ti=rng.uniform(-1.8,1.8)
            j1,j2,ar,tk=rng.uniform(-1.4,1.4)+ti,rng.uniform(-1.4,1.4)-ti,rng.uniform(.8,2.)*iv,rng.uniform(.88,1.14)
            x0,y0,xm,ym,x1,y1=(a,fx+j1,(a+b)*.5,fx+(j1+j2)*.5+ar,b,fx+j2) if hz else (fx+j1,a,fx+(j1+j2)*.5+ar,(a+b)*.5,fx+j2,b)
            for ex,ey in((x0,y0),(x1,y1)):dd.ellipse([ex-2.8,ey-2.8,ex+2.8,ey+2.8],fill=(56,42,28,175))
            pts=[qb(x0,y0,xm,ym,x1,y1,j/10.) for j in range(11)];sd.line([(px+1.4,py+2.6) for px,py in pts],fill=(66,52,38,140),width=round(5.8*tk),joint="curve")
            for j in range(10):
                pf=.38+.62*math.sin((j+.5)/10.*math.pi)**.46;pa,pb=pts[j],pts[j+1]
                for dx,dy,col,wd0 in((0,0,(162,148,128,238),6.),(-.35,-.45,(235,227,210,255),4.8),(-.85,-1.05,(254,251,245,228),2.2)):
                    td.line([(pa[0]+dx,pa[1]+dy),(pb[0]+dx,pb[1]+dy)],fill=col,width=max(1 if wd0<3 else 2,round(wd0*tk*pf)))
    comp=bs.convert("RGBA")
    for ly,br in zip(lays,(3.4,2.3,1.9,.42)):comp=AC(comp,ly.filter(GB(br)))
    poly=[]
    for cs0,fb,s0,s1,hz,ph in((140,15,16,w-17,1,.4),(190,w-17,16,h-17,0,1.9),(140,h-17,w-17,16,1,3.2),(190,15,h-17,16,0,4.7)):
        off=0.
        for s in range(cs0):
            t=s/max(1,cs0-1);cr=(1.-math.sin(t*math.pi)**.18)*3.5;off=off*.72+rng.uniform(-1.9,1.9)
            v=fb+cl(off+math.sin(t*math.pi*3.8+ph)*3.2+math.sin(t*math.pi*11.2+ph*1.9)*1.5,-8.,8.)+(-cr if fb>100 else cr);p=s0+(s1-s0)*t
            poly.append((round(p),round(v)) if hz else (round(v),round(p)))
    ec,rs=NW("RGBA",(w,h),(234,226,210,0)),NW("RGBA",(w,h),(138,122,102,0))
    Id.Draw(ec).line(poly+[poly[0]],fill=(241,234,219,220),width=7);Id.Draw(rs).line(poly[140:470],fill=(138,122,102,145),width=7)
    cr=AC(AC(AC(NW("RGBA",(w,h),(232,224,208,255)),comp),ec.filter(GB(1.9))),rs.filter(GB(2.6)))
    am=NW("L",(w,h),0);ad=Id.Draw(am);ad.polygon(poly,fill=255);np=len(poly)
    for k in range(np):
        x0,y0=poly[k];xp,yp=poly[(k-2)%np];xn,yn=poly[(k+2)%np];tv=max(1.,math.hypot(xn-xp,yn-yp));ox,oy=(yn-yp)/tv,-(xn-xp)/tv
        for _ in range(2):
            a,fl=rng.uniform(-.95,.95),rng.uniform(1.4,4.2)
            ad.line([(x0-ox*1.2,y0-oy*1.2),(x0+(ox*math.cos(a)-oy*math.sin(a))*fl,y0+(ox*math.sin(a)+oy*math.cos(a))*fl)],fill=rng.randint(120,234),width=1 if rng.random()>.32 else 2)
    out=cr.convert("RGBA");out.putalpha(am.filter(GB(.52)));return out

def erode(m,r):
    for _ in range(max(1,r//2)):m=m.filter(If.MinFilter(5))
    return m

def tree_lights(rgba):
    w,h=rgba.size;sol=rgba.convert("RGBA").getchannel("A").point(lambda p:255 if p>215 else 0);sbb=sol.getbbox()
    if not sbb:return {"topStar":None,"lights":[]}
    spx=sol.load();tr=cl(int(min(w,h)*.02),4,10);tm=erode(sol,tr)
    if not tm.getbbox():tm=sol
    ts=None
    for pm in(tm.load(),spx):
        pk=[]
        for y in range(int(h*.01),int(h*.35)):
            ss=scan_row(pm,y,0,w)
            if ss:
                lg=max(ss,key=lambda s:s[1]-s[0])
                if lg[1]-lg[0]>=2:pk.append((y,(lg[0]+lg[1])*.5))
                if len(pk)>=5:break
        if pk:
            cx,cy=cl(sum(p[1] for p in pk)/len(pk),w*.04,w*.96),cl(pk[0][0]+max(2,int(h*.012)),h*.025,h*.3)
            if spx[int(cx),int(cy)]>128:ts={"leftPct":round(cx/w*100.,2),"topPct":round(cy/h*100.,2)};break
    cm=erode(sol,cl(int(min(w,h)*.036),12,22))
    if not cm.getbbox():cm=erode(sol,max(6,tr))
    cpx,ct,cb,ls,md2,ix=cm.load(),(ts["topPct"]/100.*h if ts else float(sbb[1])),h*.74,[],max(12.,min(w,h)*.075)**2,0
    for lr,cnt in zip((.18,.36,.54,.72,.9),(2,2,3,3,3)):
        yb=int(round(ct+(cb-ct)*lr))
        if not(4<yb<h-4):continue
        sgs=[s for s in scan_row(cpx,yb,0,w) if s[1]-s[0]>=max(8,int(w*.035))];tw=sum(s[1]-s[0] for s in sgs)
        for si,(x0,x1) in enumerate(sgs):
            sw=x1-x0;q=max(1,cnt//len(sgs)) if(si==0 and len(sgs)>=2) else max(1,round(cnt*sw/max(1,tw)))
            pd=min(sw*.22,max(4.,w*.02));uw=max(1.,sw-2*pd)
            for k in range(q):
                cx,cy=x0+pd+uw*(.5 if q==1 else .15+.7*k/(q-1)),cl(yb+((-1)**(ix+k))*min(6.,h*.012),ct+8,cb)
                if not(2<=int(cx)<w-2 and 2<=int(cy)<h-2 and cpx[int(cx),int(cy)]>128) or any((cx-p["_x"])**2+(cy-p["_y"])**2<md2 for p in ls):continue
                ls.append({"_x":cx,"_y":cy,"leftPct":round(cl(cx/w*100.,4.,96.),2),"topPct":round(cl(cy/h*100.,5.,88.),2),"size":10 if ix%3==0 else 8,"delay":round((ix*.37)%2.2,2),"duration":round(1.55+(ix%4)*.32,2),"warm":ix%2==0});ix+=1
    for p in ls:p.pop("_x",None);p.pop("_y",None)
    return {"topStar":ts,"lights":ls[:13]}

def fit_s(path,sz,cr=1.45,mode="auto"):
    im=Im.open(path).convert("RGB");sw,sh=im.size;dw,dh=sz;rd0=max((sw/sh)/(dw/dh),(dw/dh)/(sw/sh)) if sw*sh else 1.
    if mode=="contain" or (mode=="auto" and rd0>cr):
        px=im.load();sm=[px[x,y] for x in range(0,sw,max(1,sw//24)) for y in(0,sh-1)]+[px[x,y] for y in range(0,sh,max(1,sh//24)) for x in(0,sw-1)]
        cv=NW("RGB",sz,tuple(int(sum(c[i] for c in sm)/len(sm)) for i in range(3)) if sm else (246,241,232));ct=Io.contain(im,sz,LZ);cv.paste(ct,((dw-ct.width)//2,(dh-ct.height)//2));return cv
    return Io.fit(im,sz,LZ)

def palette(cov):
    h2x=lambda hd,sp,lp:"#"+"".join(f"{int(round(c*255)):02x}" for c in cs.hls_to_rgb((hd%360.)/360.,cl(lp/100.,0.,1.),cl(sp/100.,0.,1.)))
    bks=[[0,0,0,0] for _ in range(12)];tr=tg=tb=cn=0
    for r,g,b in cov.convert("RGB").resize((64,64),BL).getdata():
        tr+=r;tg+=g;tb+=b;cn+=1;h,l,s=cs.rgb_to_hls(r/255.,g/255.,b/255.)
        if s>.18 and .18<l<.84:bk=bks[int((h*360.)//30)%12];bk[0]+=1;bk[1]+=r;bk[2]+=g;bk[3]+=b
    bks.sort(key=lambda x:x[0],reverse=True);p1=bks[0] if bks[0][0] else [1,79,115,72];p2=bks[1] if bks[1][0]>4 else [1,181,73,107]
    ph,pl,ps=cs.rgb_to_hls(p1[1]/p1[0]/255.,p1[2]/p1[0]/255.,p1[3]/p1[0]/255.);sh,sl,ss=cs.rgb_to_hls(p2[1]/p2[0]/255.,p2[2]/p2[0]/255.,p2[3]/p2[0]/255.)
    ah,pd,sd=cs.rgb_to_hls(tr/cn/255.,tg/cn/255.,tb/cn/255.)[0]*360.,ph*360.,sh*360.;cl0=165.<=pd<=265.;th=ah if cl0 else cl(ah,28.,42.)
    return {"styleName":"定制同系艺术风格","tableInner":h2x(th,22 if cl0 else 34,86),"tableOuter":h2x(th,18 if cl0 else 28,74),"paperCream":"#faf6ec","primaryAccent":h2x(pd,cl(ps*100,30,58),cl(pl*100,32,46)),"secondaryAccent":h2x(sd,cl(ss*100,34,65),cl(sl*100,38,58)),"waxSealColor":h2x(sd,62,44) if(sd<35 or sd>320) else "#b9382e","filterCss":"none"}

def uri(im,q=86,md=None):
    w=im.copy()
    if md and max(w.size)>md:w.thumbnail((md,md),LZ)
    b=io.BytesIO()
    try:w.save(b,format="WEBP",quality=q,method=4);mt="image/webp"
    except Exception:
        b=io.BytesIO();a="A" in w.getbands();(w if a else w.convert("RGB")).save(b,format="PNG" if a else "JPEG",quality=q,optimize=True);mt="image/png" if a else "image/jpeg"
    return f"data:{mt};base64,{b64.b64encode(b.getvalue()).decode('ascii')}"

def sim(p1,p2):
    a,b=(list(Im.open(p).convert("RGB").resize((64,64),BL).getdata()) for p in(p1,p2))
    return round(1.-sum(abs(x[0]-y[0])+abs(x[1]-y[1])+abs(x[2]-y[2]) for x,y in zip(a,b))/(64*64*765.),4)

def chk_chr(cp,pp,st):
    raw=Im.open(cp)
    if max(raw.size)>320:raw.thumbnail((320,320),BL)
    w,h=raw.size;tr=0
    if raw.mode in("RGBA","LA","PA") or "transparency" in raw.info:
        ac=raw.convert("RGBA").getchannel("A");apx=ac.load()
        if ac.getextrema()[0]<20:
            sk=max(1,min(w,h)//48);bs=[apx[x,y] for x in range(0,w,sk) for y in(0,h-1)]+[apx[x,y] for y in range(0,h,sk) for x in(0,w-1)]
            tr=bool(bs and sum(v<40 for v in bs)/len(bs)>=.5)
    if not tr:
        px=raw.convert("RGB").load();bd=max(3,min(w,h)//32);tot=wh=0
        for y in range(h):
            for x in range(w):
                if x<bd or x>=w-bd or y<bd or y>=h-bd:
                    r,g,b=px[x,y];tot+=1
                    if min(r,g,b)>=224 and max(r,g,b)-min(r,g,b)<=26:wh+=1
        if wh/max(1,tot)<.6:
            if st:raise SystemExit("错误：人物白底不足，疑似带背景原照。")
            print("[警告]人物白底不足",file=sys.stderr)
    if okf(pp) and sim(cp,pp)>=.94:
        if st:raise SystemExit("错误：人物与原照雷同。")
        print("[警告]人物与原照雷同",file=sys.stderr)

def norm_b(raw,occ):
    if not isinstance(raw,dict):raise ValueError("须为JSON对象")
    xm=occ=="christmas";dl=(["雪花轻落窗台，圣诞灯火正暖","愿今年所有的温柔与期盼","都化作冬日里的星光与好运","平安顺遂，温暖常伴左右"] if xm else ["又长大一岁啦，愿新岁的每一天","都有温暖的风吹散烦恼","愿你永远被爱包围","平安顺遂，自在闪耀"])
    lv=raw.get("lines")
    if lv is None:ls=dl
    elif isinstance(lv,str):ls=[p.strip() for p in re.split("["+chr(13)+NL+"。！？；;]+",lv) if p.strip()] or dl
    elif isinstance(lv,list):ls=[str(x or "").strip() for x in lv if str(x or "").strip()] or dl
    else:raise ValueError("lines无效")
    return {"recipient":str(raw.get("recipient") or "亲爱的朋友：").strip(),"lines":ls,"closing":str(raw.get("closing") or ("圣诞快乐，冬日安暖！" if xm else "生日快乐，万事胜意！")).strip(),"signature":str(raw.get("signature") or "你的好友").strip(),"subSignature":str(raw.get("subSignature") or "").strip()}

def assemble(cfg):
    c,d,j3,j4=((RES/n).read_text(encoding="utf-8") for n in("shell_p1.css","shell_p2.html","shell_p3.js","shell_p4.js"))
    js=json.dumps(cfg,ensure_ascii=False)
    for k,v in(("<","u003c"),(">","u003e"),("&","u0026"),(chr(0x2028),"u2028"),(chr(0x2029),"u2029")):js=js.replace(k,BS+v)
    return f'<!DOCTYPE html>{NL}<html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><title>手绘立体纸艺贺卡</title><style>{NL}{c}{NL}</style></head><body><script>window.CARD_CONFIG=/*__CARD_CONFIG_START__*/{js}/*__CARD_CONFIG_END__*/;</script>{NL}{d}{NL}<script>(function(){{{NL}{j3}{NL}{j4}{NL}}})();</script></body></html>{NL}'

def main():
    ap=ag.ArgumentParser(description="立体贺卡打包器")
    for k in("work-dir","cover","character","portrait","inside","inside-top","inside-bottom","inside-left","inside-right","arch","cake","tree","style-ref","style-json","blessing","recipient","lines-text","closing","signature","sub-signature","card-id","wick-pos"):ap.add_argument("--"+k)
    ap.add_argument("--occasion",choices=("birthday","christmas"),default="birthday");ap.add_argument("--fold",choices=("horizontal","vertical"),default="horizontal");ap.add_argument("--cover-fit",choices=("auto","contain","crop"),default="auto")
    for k in("strict-redraw-check","allow-draft","allow-missing-wick"):ap.add_argument("--"+k,action="store_true")
    ap.add_argument("--output",required=True);a=ap.parse_args();wd,vt,xm=(Path(a.work_dir) if a.work_dir else None),a.fold=="vertical",a.occasion=="christmas"
    for k in("cover","character","portrait","inside","inside_top","inside_bottom","inside_left","inside_right","arch","cake","tree","style_ref","style_json","blessing"):
        if getattr(a,k) and not os.path.isfile(getattr(a,k)):ap.error(f"不存在--{k}")
    cov=a.cover or (f1(wd,"cover_vertical_raw","cover_4x3_raw","cover_raw") if vt else f1(wd,"cover_raw","cover_3x4_raw"))
    cp,pp=a.character or f1(wd,"character_raw"),a.portrait or f1(wd,"portrait","photo","selfie")
    ins=a.inside or (f1(wd,"inside_vertical_raw","inside_2x3_raw") if vt else f1(wd,"inside_raw"))
    tp,bp=a.inside_top or (f1(wd,"inside_top") if vt else None),a.inside_bottom or (f1(wd,"inside_bottom") if vt else None)
    il,ir,ar=a.inside_left or f1(wd,"inside_left"),a.inside_right or f1(wd,"inside_right"),a.arch or f1(wd,"arch_raw","christmas_arch_raw")
    if xm:
        if a.cake or a.wick_pos:ap.error("圣诞禁传--cake/--wick-pos")
        pr=a.tree or f1(wd,"tree_raw","christmas_tree_raw")
    else:
        if a.tree:ap.error("生日请传--cake")
        pr=a.cake or f1(wd,"cake_raw")
    for c,m in((not okf(cov),"缺封面"),(not okf(cp),"缺人物"),(not okf(pr),"缺道具"),(vt and (tp or bp) and not(okf(tp) and okf(bp)),"上下拆页须成对"),(not vt and (il or ir) and not(okf(il) and okf(ir)),"左右拆页须成对"),(vt and not(tp and bp) and not okf(ins),"上下版缺内页"),(not a.allow_draft and not vt and not(il and ir) and not okf(ins),"横版缺内页"),(not a.allow_draft and not okf(ar),"缺拱门")):
        if c:ap.error(m)
    rf=a.style_ref or f1(wd,"style_ref")
    if a.strict_redraw_check and not okf(rf):ap.error("严格模式需--style-ref")
    if okf(rf) and sim(cov,rf)>=.96:
        if a.strict_redraw_check:raise SystemExit("错误：封面与参考图雷同。")
        print("[警告]封面与参考图雷同",file=sys.stderr)
    chk_chr(cp,pp,a.strict_redraw_check);mwk=None
    if a.wick_pos:
        ps=[p.strip() for p in re.split("[,， ]+",str(a.wick_pos).strip()) if p.strip()]
        if len(ps)!=2 or not(1.<=float(ps[0])<=99. and 1.<=float(ps[1])<=99.):ap.error("wick-pos须为1~99的L,T")
        mwk={"leftPct":round(float(ps[0]),2),"topPct":round(float(ps[1]),2)}
    cim=fit_s(cov,(1000,750) if vt else (750,1000),1.06,a.cover_fit);cov_u,thm=uri(cim,88),palette(cim)
    sp=a.style_json or (str(wd/"style_profile.json") if wd and (wd/"style_profile.json").is_file() else None)
    if okf(sp):
        try:
            st=json.loads(Path(sp).read_text(encoding="utf-8")).get("styleTheme")
            if isinstance(st,dict):thm.update({k:v for k,v in st.items() if v})
        except Exception:pass
    cst=standee(cp,13,820,0);ok,rt=vis_ok(cst)
    if not ok:raise SystemExit(f"错误：人物空白({rt*100:.1f}%)")
    chr_u,ilu,iru=uri(cst,88,760),"",""
    if vt and tp and bp:ilu,iru=uri(fit_s(tp,(1000,750)),86),uri(fit_s(bp,(1000,750)),86)
    elif not vt and okf(il) and okf(ir):ilu,iru=uri(fit_s(il,(700,934)),86),uri(fit_s(ir,(700,934)),86)
    elif okf(ins):
        si=fit_s(ins,(1000,1500) if vt else (1400,934))
        ilu,iru=(uri(si.crop((0,0,1000,750)),86),uri(si.crop((0,750,1000,1500)),86)) if vt else (uri(si.crop((0,0,700,934)),86),uri(si.crop((700,0,1400,934)),86))
    aru=""
    if okf(ar):
        ast=standee(ar,10,920,1);ast=align_feet(ast) if vt else ast;ok,rt=vis_ok(ast)
        if not ok:raise SystemExit(f"错误：拱门空白({rt*100:.1f}%)")
        aru=uri(ast,86,880)
    pst,pfg=standee(pr,11,760,0,1);ok,rt=vis_ok(pst)
    if not ok:raise SystemExit(f"错误：道具空白({rt*100:.1f}%)")
    tl,pru=(tree_lights(pst) if xm else None),uri(pst,88,680)
    wk={"leftPct":44.6,"topPct":7.5} if xm else (mwk or detect_wick(pst,pfg))
    if not xm and wk is None:
        if a.strict_redraw_check and not a.allow_missing_wick:raise SystemExit("错误：未检出蜡烛芯，请重画或传--wick-pos/--allow-missing-wick。")
        print("[警告]未检出蜡烛芯，已隐藏烛火",file=sys.stderr)
    lin_u,rb=uri(make_linen(),78),{};bpj=a.blessing or (str(wd/"blessing.json") if wd and (wd/"blessing.json").is_file() else None)
    if okf(bpj):
        rb=json.loads(Path(bpj).read_text(encoding="utf-8"))
        if not isinstance(rb,dict):raise SystemExit("错误：blessing.json须为对象")
    for fk,bk in(("recipient","recipient"),("closing","closing"),("signature","signature"),("sub_signature","subSignature")):
        if getattr(a,fk) is not None:rb[bk]=getattr(a,fk)
    if a.lines_text is not None:rb["lines"]=a.lines_text.replace(BS+"n",NL)
    try:bcfg=norm_b(rb,a.occasion)
    except ValueError as e:raise SystemExit(f"错误：祝福语无效:{e}")
    ah=hl.sha256()
    for s in(a.occasion,a.fold,cov_u,chr_u,ilu,iru,pru,aru):ah.update(s.encode("utf-8"));ah.update(b"|")
    ad,op=ah.hexdigest(),Path(a.output)
    if (a.card_id or "").strip():cid=re.sub("[^A-Za-z0-9_-]","",a.card_id.strip())[:24] or uuid.uuid4().hex[:12]
    elif wd is not None:
        wd.mkdir(parents=True,exist_ok=True);idf=wd/".card_id";lid=re.sub("[^A-Za-z0-9_-]","",idf.read_text(encoding="utf-8").strip())[:24] if idf.is_file() else ""
        if not lid:
            lid=uuid.uuid4().hex[:12]
            try:idf.write_text(lid,encoding="utf-8")
            except OSError:pass
        cid=hl.sha256(f"{lid}|{ad}".encode("utf-8")).hexdigest()[:16]
    else:cid=hl.sha256(f"{ad}|{op.resolve()}|{json.dumps(bcfg,ensure_ascii=False,sort_keys=True)}".encode("utf-8")).hexdigest()[:16]
    cfg={"cardId":cid,"occasion":a.occasion,"fold":a.fold,"coverImageUrl":cov_u,"characterImageUrl":chr_u,"insideLeftUrl":ilu,"insideRightUrl":iru,"cakeTableUrl":pru,"archUrl":aru,"linenImageUrl":lin_u,"cakeWickPos":wk,"styleTheme":thm,"blessing":bcfg}
    if tl is not None:cfg["treeLights"]=tl
    op.parent.mkdir(parents=True,exist_ok=True);op.write_text(assemble(cfg),encoding="utf-8")
    print(f"[OK] {'圣诞' if xm else '生日'}({'4:3上下' if vt else '左右横版'}) -> {op} ({op.stat().st_size/1024:.1f} KB)")

if __name__=="__main__":
    sys.stdout.reconfigure(encoding="utf-8");sys.stderr.reconfigure(encoding="utf-8");main()
