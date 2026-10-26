// Chỉ bọc phần vẽ web; app vẫn dùng nguồn game nguyên trạng.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  function latHinh(g){
    if(!g || g.querySelector(':scope > [data-lat]'))return;
    const r=g.getBBox(),tam=r.x+r.width/2;
    const ben=document.createElementNS('http://www.w3.org/2000/svg','g');
    ben.dataset.lat='true';ben.setAttribute('transform',`translate(${tam*2} 0) scale(-1 1)`);
    while(g.firstChild)ben.append(g.firstChild);g.append(ben);
  }
  const veCu=veLai;
  veLai=function(...a){const k=veCu(...a);for(const v of st.dat)if(v.lat===true)latHinh(document.querySelector(`#vat .vat[data-id="${v.id}"]`)||document.querySelector(`.vat[data-id="${v.id}"]`));return k;};
  const bongCu=veBongMa;
  veBongMa=function(k,gx,gy,id){const r=bongCu(k,gx,gy,id);if(gx!=null&&st.dat.some(v=>v.id===id&&v.lat===true))latHinh(document.querySelector('#bong-ma > g'));return r;};
  const b=document.createElement('button');b.id='nutLatWeb';b.className='lai';
  b.style.cssText='min-width:44px;min-height:44px;padding:8px;display:inline-flex;gap:5px;align-items:center';
  b.innerHTML='<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20M3 6h5v12H3zM16 6h5v12h-5M2 3l3-2m-3 2 3 2M22 21l-3-2m3 2-3 2"/></svg><span>Lật</span>';
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.onclick=()=>{
    const v=st?.dat.find(v=>v.id===popupId);if(!v||st.dem)return;
    if(v.lat===true)delete v.lat;else v.lat=true;
    veLai();luu();b.setAttribute('aria-pressed',String(v.lat===true));
    try{window.warmJarThongKe?.('web_lat_do');}catch{}
  };
  document.getElementById('popup').append(b);
  const popupCu=hienPopup;
  hienPopup=function(id,e){popupCu(id,e);b.setAttribute('aria-pressed',String(st.dat.find(v=>v.id===id)?.lat===true));
    const p=document.getElementById('popup'),r=p.getBoundingClientRect(),kh=document.getElementById('phongKhung').getBoundingClientRect();
    if(r.right>innerWidth-8)p.style.left=(innerWidth-8-r.width-kh.left+r.width/2)+'px';
  };
})();
