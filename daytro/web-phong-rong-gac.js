// Chỉ web: nới phòng hai nấc, gợi ý không chặn và không đổi khoá ván cũ.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const gia7=6000,duocNoi=p=>p&&!p.mb&&!p.loai&&(p.rong||5)<7;
  const oCu=oDuoiTay;
  function oTrenGac(e,k){
    if(!NHO.has(k)&&k!=='chanGoi')return null;
    const q=diemSvg(e),[x,y]=veSan(q.x,q.y+MAT.gac);
    const gac=st.dat.find(v=>v.k==='gac'&&!v.tren&&x>=v.gx*T&&y>=v.gy*T&&x<(v.gx+2)*T&&y<(v.gy+2)*T);
    return gac?[Math.floor(x/T),Math.floor(y/T)]:null;
  }
  // Con trỏ trên mặt gác ở z164; các món khác vẫn dùng điểm sàn của #29.
  oDuoiTay=function(e,k){return oTrenGac(e,k)||oCu(e,k);};
  svg.addEventListener('pointerdown',e=>{
    if(!st?.chon||st.dem)return;const k=st.chon,viTri=oTrenGac(e,k);if(!viTri)return;
    e.stopImmediatePropagation();e.preventDefault();
    if(datDuoc(k,...viTri)){st.chon=null;mua(k,...viTri);}else loa('Chỗ này không đặt được');
  },true);
  const style=document.createElement('style');style.textContent=`#goiYNoiWeb{position:fixed;left:12px;right:12px;bottom:200px;z-index:48;max-width:400px;margin:auto;background:#FFF9EC;color:#563D2C;border:2px solid #795039;border-radius:14px;padding:12px;box-shadow:0 4px 14px #0002;font:15px/1.4 "Be Vietnam Pro",sans-serif}#goiYNoiWeb[hidden]{display:none}#goiYNoiWeb p{margin:0 0 8px}#goiYNoiWeb .nut-noi{display:flex;gap:8px}#goiYNoiWeb button{min-height:44px;min-width:44px;padding:8px 12px;border:1px solid #795039;border-radius:9px;background:#FFFDF7;color:#563D2C;font:inherit}#goiYNoiWeb button:first-child{flex:1}#ttNoi button[data-l="rong"]{min-height:44px;min-width:44px}`;document.head.append(style);
  const goi=document.createElement('aside');goi.id='goiYNoiWeb';goi.hidden=true;goi.setAttribute('role','status');goi.setAttribute('aria-live','polite');
  goi.innerHTML='<p>Phòng chật rồi? Vào Trang trí → Nới rộng</p><div class="nut-noi"><button type="button" id="moNoiWeb">Mở Trang trí</button><button type="button" id="tatNoiWeb">Để sau</button></div>';document.body.append(goi);
  const an=()=>{goi.hidden=true;};
  document.getElementById('tatNoiWeb').onclick=an;
  document.getElementById('moNoiWeb').onclick=()=>{an();moTrangTri();};
  function goiY(){
    const p=st?.phong[st.o];if(!duocNoi(p)||p.daGoiYNoiWeb||st.dem)return;
    for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(datSan('gheNhua',x,y))return;
    p.daGoiYNoiWeb=true;goi.hidden=false;luu(true);
  }
  const muaCu=mua;
  mua=function(...a){const n=st.dat.length,r=muaCu(...a);if(st.dat.length>n)goiY();return r;};
  let truocKeo='';
  const dauDat=()=>st?.dat?.map(v=>[v.id,v.gx,v.gy,v.tren].join(':')).join('|')||'';
  window.addEventListener('pointerdown',()=>{truocKeo=dauDat();},true);
  window.addEventListener('pointerup',()=>{if(truocKeo!==dauDat())goiY();});
  const veCu=veLai;
  let phongHien=null;
  veLai=function(...a){if(phongHien!==st.o){an();phongHien=st.o;}return veCu(...a);};
  const trangTriCu=moTrangTri;
  moTrangTri=function(...a){
    an();const r=trangTriCu(...a),p=st.phong[st.o],noi=document.getElementById('ttNoi');
    if(duocNoi(p)){
      let nhom=[...noi.querySelectorAll('.tt-nhom')].find(n=>n.querySelector('[data-l="rong"]'));
      if(!nhom){nhom=document.createElement('div');nhom.className='tt-nhom';nhom.innerHTML='<b>Nới rộng phòng</b><div class="tt-chon"><button class="tt" data-l="rong" data-i="7" style="--m:#F2E8D5">Đập tường nới ra 7×7 (phòng +300k nữa) · 6.000k</button></div>';}
      noi.prepend(nhom);
    }
    return r;
  };
  document.getElementById('ttNoi').addEventListener('click',e=>{
    const b=e.target.closest('[data-l="rong"]');if(!b)return;e.stopImmediatePropagation();
    const p=st.phong[st.o],n=+(b.dataset.i),cu=p.rong||5;if(!duocNoi(p)||n!==cu+1)return;
    const gia=n===7?gia7:NOI_RONG;
    if(st.tien<gia){loa(`Còn thiếu ${dong(gia-st.tien)}`);return;}
    p.rong=n;doiTien(-gia,`−${dong(gia)} nới rộng phòng`);viec('trangTri');cop();veHet();moTrangTri();
  },true);
})();
