// Xoay và đặt chồng chỉ trên web; không đổi nguồn game/app hoặc giá đồ.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const DOI_XUNG=new Set(['gheNhua','senDa','xuongRong','luoiHo','cayKhe','cayThongMini','maiVang','banhChung','hopQuaNoel','cucWifi']);
  // Ghế web có bốn mặt khoét vòm: phần rỗng không tô màu nền để che đồ phía sau.
  DO.gheNhua.ve=function(){
    const B=52,A=40,H=66,mauSau='#AB694D';
    const mat=(m,ten,mau)=>{
      const diem=(u,v)=>P(...m[0].map((a,i)=>{const duoi=a+(m[1][i]-a)*u,tren=m[3][i]+(m[2][i]-m[3][i])*u;return duoi+(tren-duoi)*v;}));
      const p=a=>a.map(f).join(',');
      const ngoai='M'+m.map(q=>p(P(...q))).join(' L')+' Z';
      const vom=`M${p(diem(.24,0))} L${p(diem(.24,.42))} Q${p(diem(.5,.82))} ${p(diem(.76,.42))} L${p(diem(.76,0))} Z`;
      return `<path class="n" data-mat-ghe="${ten}" fill="${mau}" fill-rule="evenodd" d="${ngoai} ${vom}"/>`;
    };
    const sauTrai=[[-B,B,0],[-B,-B,0],[-A,-A,H],[-A,A,H]];
    const sauPhai=[[B,-B,0],[-B,-B,0],[-A,-A,H],[A,-A,H]];
    const truocTrai=[[-B,B,0],[B,B,0],[A,A,H],[-A,A,H]];
    const truocPhai=[[B,-B,0],[B,B,0],[A,A,H],[A,-A,H]];
    const toa=[[-47,-47,H+10],[47,-47,H+10],[47,47,H+10],[-47,47,H+10]].map(q=>P(...q));
    const [,y]=P(0,0,H+10),loTay=`M-26,${f(y)} a26,10 0 1 0 52,0 a26,10 0 1 0 -52,0 Z`;
    return mat(sauTrai,'sau-trai',mauSau)+mat(sauPhai,'sau-phai',mauSau)
      +mat(truocTrai,'truoc-trai',DAT)+mat(truocPhai,'truoc-phai',DAT)
      +poly([[-47,47,H],[47,47,H],[47,47,H+10],[-47,47,H+10]],DAT)
      +poly([[47,-47,H],[47,47,H],[47,47,H+10],[47,-47,H+10]],DAT)
      +`<path class="n" data-mat-ghe="mat-ngoi" fill="${DAT}" fill-rule="evenodd" d="M${toa.map(p=>p.map(f).join(',')).join(' L')} Z ${loTay}"/>`;
  };
  const coGoc=k=>(DO[k].co||[1,1]).slice();
  const huongGhe=v=>Number.isInteger(v.huong)&&v.huong>=0&&v.huong<4?v.huong:v.lat===true?1:0;
  const phuGiuong=k=>k==='chanGoi'||k==='man';
  const tham=v=>v.k==='thamLot';
  let dsThu=null;
  const ds=()=>dsThu||st.dat;
  const tim=id=>ds().find(v=>v.id===id);
  Object.assign(MAT,{giuong:44,sofa:46});
  function kich(v){
    const m=v.tren&&tim(v.tren);
    if(m?.k==='giuong'&&phuGiuong(v.k))return kich(m);
    const co=coGoc(v.k);
    if(Array.isArray(v.co)&&v.co.length===2&&v.co.every(Number.isInteger)
      &&((v.co[0]===co[0]&&v.co[1]===co[1])||(v.co[0]===co[1]&&v.co[1]===co[0])))return v.co.slice();
    return v.lat===true?[co[1],co[0]]:co;
  }
  const tam=v=>{const [w,d]=kich(v);return [(v.gx+w/2)*T,(v.gy+d/2)*T];};
  const oVat=v=>{const [w,d]=kich(v),a=[];for(let x=0;x<w;x++)for(let y=0;y<d;y++)a.push(`${v.gx+x},${v.gy+y}`);return a;};
  const cham=(a,b)=>oVat(a).some(c=>oVat(b).includes(c));
  const trongPhong=v=>{const [w,d]=kich(v);return Number.isInteger(v.gx)&&Number.isInteger(v.gy)&&v.gx>=0&&v.gy>=0&&v.gx+w<=N&&v.gy+d<=N;};
  function trenMat(v,m){
    if(!m||!MAT[m.k])return false;
    if(m.k==='giuong'?!phuGiuong(v.k):!NHO.has(v.k))return false;
    const vung=new Set(oVat(m));if(!oVat(v).every(c=>vung.has(c)))return false;
    return !ds().some(x=>x.id!==v.id&&x.tren===m.id&&cham(v,x)
      &&!(m.k==='giuong'&&phuGiuong(x.k)&&x.k!==v.k));
  }
  function mau(k,gx,gy,id){
    const v={...((id&&tim(id))||{}),k,gx,gy,id},m=v.tren&&tim(v.tren);
    if(m&&phuGiuong(k)&&!oVat(m).includes(`${gx},${gy}`)){delete v.tren;delete v.co;}
    return v;
  }
  // datDuoc của game gọi hai hàm này cho cả kéo thả lẫn giao dịch xoay.
  datSan=function(k,gx,gy,id){
    const v=mau(k,gx,gy,id);if(!trongPhong(v))return false;
    return tham(v)||!ds().some(x=>x.id!==id&&!x.tren&&!tham(x)&&cham(v,x));
  };
  beMat=function(k,gx,gy,id){
    const v=mau(k,gx,gy,id);
    for(const m of ds()){
      if(m.id===id||m.tren||!MAT[m.k])continue;
      // Chăn/màn phủ cả nệm, thả ở bất kỳ ô nào trên giường đều về gốc giường.
      const t=m.k==='giuong'&&phuGiuong(k)?{...v,gx:m.gx,gy:m.gy,tren:m.id}:v;
      if(m.k==='giuong'&&phuGiuong(k)&&!oVat(m).includes(`${gx},${gy}`))continue;
      if(trenMat(t,m))return m;
    }
    return null;
  };
  // Giữ ô thảm cho rác/sự kiện cũ để không đổi chuỗi ngẫu nhiên của ván.
  // Riêng kiểm đặt đồ ở datSan bên trên bỏ qua thảm, nên mọi đồ vẫn đặt lên được.
  o=function(k,gx,gy){const v=ds().find(x=>x.k===k&&x.gx===gx&&x.gy===gy)||{k,gx,gy};return oVat(v);};
  const racCu=taoRac,buiCu=buiDauThang;
  taoRac=function(n,p=st.phong[st.o]){const cu=dsThu;dsThu=p.dat;try{return racCu(n,p);}finally{dsThu=cu;}};
  buiDauThang=function(p){const cu=dsThu;dsThu=p.dat;try{return buiCu(p);}finally{dsThu=cu;}};
  function dongCo(v){const co=kich(v),goc=coGoc(v.k);if(co[0]===goc[0]&&co[1]===goc[1])delete v.co;else v.co=co;}
  function ganMat(v){if(v.k==='gheTua'){if('huong' in v||'lat' in v)v.huong=huongGhe(v);delete v.lat;}const m=v.tren&&tim(v.tren);if(m?.k==='giuong'&&phuGiuong(v.k)){v.gx=m.gx;v.gy=m.gy;dongCo(v);}else if(v.co)dongCo(v);}
  const muaCu=mua;
  mua=function(...a){const n=st.dat.length,r=muaCu(...a);if(st.dat.length>n){ganMat(st.dat.at(-1));veLai();luu();}return r;};
  // Game xoá keo trước khi tính ô ở pointerup: giữ id trong đúng sự kiện thả.
  let idDangTha=null;
  window.addEventListener('pointerup',()=>{idDangTha=keo?.id??null;},true);
  window.addEventListener('pointerup',()=>{idDangTha=null;});
  // Giữ nguyên vị trí chạm nhưng trừ đúng nửa kích thước món đã xoay.
  oDuoiTay=function(e,k){const q=diemSvg(e),[x,y]=veSan(q.x,q.y),[w,d]=kich(tim(keo?.id??idDangTha)||{k});return [Math.round(x/T-w/2),Math.round(y/T-d/2)];};
  const doiHuong=v=>{if(v.k==='gheTua'){v.huong=(huongGhe(v)+1)%4;delete v.lat;}else if(v.lat===true)delete v.lat;else v.lat=true;};
  function conCua(id){const a=[];const them=n=>{for(const v of ds())if(v.tren===n&&!a.includes(v)){a.push(v);them(v.id);}};them(id);return a;}
  function thuXoay(id,caCum){
    const goc=st.dat,thu=goc.map(v=>({...v,...(v.co?{co:v.co.slice()}:{} )}));dsThu=thu;
    try{
      const v=tim(id);if(!v)return null;
      const con=conCua(id),cu=kich(v),nho=!!v.tren;
      if(!caCum&&!nho&&cu[0]!==cu[1]&&con.some(c=>phuGiuong(c.k)&&tim(c.tren)?.k==='giuong'))return null;
      doiHuong(v);
      // Món trên mặt chỉ xoay hình; không đổi ô chiếm hoặc món đỡ.
      const coMoi=nho?cu:[cu[1],cu[0]];v.co=coMoi;
      if(caCum&&!nho){
        for(const c of con){
          const m=tim(c.tren),banCu=goc.find(x=>x.id===c.tren),co=kich(c);
          const x=c.gx-banCu.gx+co[0]/2,y=c.gy-banCu.gy+co[1]/2;
          doiHuong(c);c.co=[co[1],co[0]];
          // Ghế bốn hướng quay 90° thật: (x,y) -> (d-y,x).
          // Những món hai hướng giữ phép đổi trục như bản cũ.
          let gx=m.gx+(m.k==='gheTua'?kich(m)[0]-y:y)-c.co[0]/2,gy=m.gy+x-c.co[1]/2;
          if(m.k==='giuong'&&phuGiuong(c.k)){c.gx=m.gx;c.gy=m.gy;dongCo(c);continue;}
          const [w,d]=kich(m),[cw,cd]=kich(c),cho=[];
          for(let i=m.gx;i<=m.gx+w-cw;i++)for(let j=m.gy;j<=m.gy+d-cd;j++)cho.push([i,j]);
          cho.sort((a,b)=>(Math.abs(a[0]-gx)+Math.abs(a[1]-gy))-(Math.abs(b[0]-gx)+Math.abs(b[1]-gy)));
          const viTri=cho.find(([a,b])=>trenMat({...c,gx:a,gy:b},m));if(!viTri)return null;
          [c.gx,c.gy]=viTri;dongCo(c);
        }
      }
      if(!datDuoc(v.k,v.gx,v.gy,v.id))return null;
      if(v.tren&&!trenMat(v,tim(v.tren)))return null;
      if(con.some(c=>!trongPhong(c)||!trenMat(c,tim(c.tren))))return null;
      // Chuẩn hoá sau khi kiểm xong để xoay hai lần trả về đúng dữ liệu cũ.
      for(const c of [v,...con])dongCo(c);
      return {thu,kieu:nho?'nho':caCum&&con.length?'cum':'don'};
    }finally{dsThu=null;}
  }
  function xoay(caCum){
    if(st.dem)return;
    const v=st.dat.find(x=>x.id===popupId);
    if(!v||(DOI_XUNG.has(v.k)&&(!caCum||v.tren||!conCua(v.id).length)))return;
    const id=popupId,r=thuXoay(id,caCum);
    if(!r){loa('Không đủ chỗ để xoay');return;}
    for(const v of st.dat){const moi=r.thu.find(x=>x.id===v.id);for(const k of ['gx','gy','lat','huong','co']){if(k in moi)v[k]=moi[k];else delete v[k];}}
    veLai();luu();capNhatNut();
    try{window.warmJarThongKe?.('web_xoay_do',{kieu:r.kieu});}catch{}
  }
  // Màn theo kích thước nệm (202×92), không phóng to làm tràn giường.
  function manTrenGiuong(doiTruc){
    const w=doiTruc?92:202,d=doiTruc?202:92,x=-w/2,y=-d/2,h=104;
    return [[x,y],[x+w,y],[x+w,y+d],[x,y+d]].map(([a,b])=>{const p=P(a,b,0),q=P(a,b,h);return `<path class="m" d="M${pts([p,q])}"/>`;}).join('')
      +poly([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],KEM).replace('class="n"','class="n" opacity=".45" pointer-events="stroke"')
      +poly([[x+w,y,h],[x+w,y+d,h],[x+w,y+d,0],[x+w,y,0]],KEM).replace('class="n"','class="n" opacity=".35" pointer-events="stroke"')
      +poly([[x,y+d,h],[x+w,y+d,h],[x+w,y+d,0],[x,y+d,0]],KEM).replace('class="n"','class="n" opacity=".35" pointer-events="stroke"');
  }
  function hinh(v){const m=v.tren&&tim(v.tren),giuong=m?.k==='giuong',net=giuong&&v.k==='man';return {ve:net?manTrenGiuong((kich(m)[0]<kich(m)[1])!==(v.lat===true)):v.k==='gheTua'?DO[v.k].ve(v):DO[v.k].ve(),to:net?1:giuong&&v.k==='chanGoi'?.88:(DO[v.k].to||1)};}
  const noiDung=(v,s)=>v.k!=='gheTua'&&v.lat===true?`<g data-lat="true" transform="scale(-1 1)">${s}</g>`:s;
  function veVat(g,v){if(!g)return;const [x,y]=tam(v),[X,Y]=P(x,y,v.tren?caoTren(v.tren):0),hv=hinh(v);g.setAttribute('transform',`translate(${f(X)},${f(Y)}) scale(${hv.to})`);g.innerHTML=noiDung(v,hv.ve);g.dataset.co=kich(v).join(',');}
  const veCu=veLai;
  veLai=function(...a){
    st.dat.forEach(ganMat);const r=veCu(...a);
    for(const v of st.dat){const g=document.querySelector(`.vat[data-id="${v.id}"]`);veVat(g,v);if(g&&tham(v))document.getElementById('sang').after(g);}
    const bong=[...document.querySelectorAll('.bong-do ellipse')];st.dat.filter(v=>!v.tren).forEach((v,i)=>{
      const [X,Y]=P(...tam(v),0),el=bong[i];if(!el)return;
      el.setAttribute('cx',f(X+10));el.setAttribute('cy',f(Y+6));
      if(v.k==='gheTua'){
        const h=huongGhe(v),[dx,dy]=[[1,0],[0,1],[-1,0],[0,-1]][h], [u,w]=P(dx*12,dy*12,0),cx=X+u+8,cy=Y+w+6;
        el.setAttribute('cx',f(cx));el.setAttribute('cy',f(cy));el.setAttribute('rx','63');el.setAttribute('ry','22');
        el.setAttribute('transform',`rotate(${h%2?150:30} ${f(cx)} ${f(cy)})`);el.dataset.gheHuong=h;
      }
    });
    const den=[...document.querySelectorAll('.quang-den')];st.dat.filter(v=>v.k==='denNgu').forEach((v,i)=>{const [X,Y]=P(...tam(v),(v.tren?caoTren(v.tren):0)+90);den[i]?.setAttribute('cx',f(X));den[i]?.setAttribute('cy',f(Y));});
    return r;
  };
  veBongMa=function(k,gx,gy,id){
    const sang=document.getElementById('sang'),ma=document.getElementById('bong-ma');
    if(gx==null){sang.innerHTML=ma.innerHTML='';return;}
    const v=mau(k,gx,gy,id),m=!datSan(k,gx,gy,id)&&beMat(k,gx,gy,id);if(m)v.tren=m.id;else delete v.tren;ganMat(v);
    const [w,d]=kich(v),ok=datDuoc(k,gx,gy,id),x=Math.max(0,Math.min(v.gx,N-w)),y=Math.max(0,Math.min(v.gy,N-d));
    sang.innerHTML=`<polygon class="${ok?'o-sang':'o-sai'}" points="${pts([[x,y],[x+w,y],[x+w,y+d],[x,y+d]].map(([a,b])=>P(a*T,b*T,0)))}"/>`;
    ma.innerHTML='<g></g>';veVat(ma.firstChild,{...v,gx:x,gy:y});
  };
  const b=document.createElement('button');b.id='nutLatWeb';b.className='lai';
  b.style.cssText='min-width:44px;min-height:44px;padding:8px;display:inline-flex;gap:5px;align-items:center';
  b.innerHTML='<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></svg><span>Xoay</span>';
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.onclick=()=>xoay(true);
  document.getElementById('popup').append(b);
  const rieng=document.createElement('button');rieng.id='nutXoayRiengWeb';rieng.className='lai';rieng.textContent='Chỉ xoay món này';rieng.style.minHeight='44px';rieng.hidden=true;rieng.addEventListener('pointerdown',e=>e.stopPropagation());rieng.onclick=()=>xoay(false);document.getElementById('popup').append(rieng);
  function capNhatNut(){const v=st.dat.find(x=>x.id===popupId),coCon=v&&!v.tren&&conCua(v.id).length>0,doi=DOI_XUNG.has(v?.k);b.querySelector('span').textContent=coCon?'Xoay cả cụm':'Xoay';b.hidden=!v||(doi&&!coCon);b.style.display=b.hidden?'none':'inline-flex';rieng.hidden=!coCon||doi;b.setAttribute('aria-pressed',String(v?.k==='gheTua'?huongGhe(v)!==0:v?.lat===true));}
  const popupCu=hienPopup;
  hienPopup=function(id,e){popupCu(id,e);capNhatNut();
    const p=document.getElementById('popup'),r=p.getBoundingClientRect(),kh=document.getElementById('phongKhung').getBoundingClientRect();
    p.style.maxWidth='calc(100vw - 16px)';
    if(r.right>innerWidth-8)p.style.left=(innerWidth-8-r.width-kh.left+r.width/2)+'px';
  };
  veLai();
})();
