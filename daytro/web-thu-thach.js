(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.DotWeb)return;
  const khoa='day-tro-thu-thach-tuan',Q=window.DotWeb;
  let dangMo=false;
  const doc=()=>{try{return JSON.parse(localStorage.getItem(khoa))||{};}catch{return {};}};
  function cap(loai,n=1){
    if(typeof st==='undefined'||!st||!daVaoGame)return null;
    const hienCo={phong:st.phong.filter(p=>!p.loai&&p.khach?.o).length,tiem:st.phong.some(p=>p.mo&&p.loai==='tiem')?1:0,traSua:st.phong.some(p=>p.mo&&p.loai==='traSua')?1:0};
    const k=Q.capTuan(doc(),Q.tuan(),{loai,n},hienCo);
    try{localStorage.setItem(khoa,JSON.stringify(k.du));}catch{return k;}
    for(const ma of k.moiNhan)try{window.warmJarThongKe?.('web_thu_thach_xong',{ma});}catch{}
    return k;
  }
  const viecCu=viec;
  viec=function(loai,n=1){const r=viecCu(loai,n);cap(loai,n);return r;};
  const veCu=veHet;
  veHet=function(...a){const r=veCu(...a);cap();return r;};
  const doCu=window.warmJarThongKe;
  window.warmJarThongKe=function(ten,thamSo){if(ten==='web_khoe_chia_se')cap('khoe');return doCu?.(ten,thamSo);};
  const hop=document.querySelector('#manNV .tam'),tabs=document.createElement('div'),noi=document.createElement('div');
  tabs.id='tabViecWeb';tabs.style.cssText='display:flex;gap:8px;margin:8px 0';noi.id='thuThachTuan';noi.hidden=true;
  function nut(chu,fn){const b=document.createElement('button');b.type='button';b.className='lai';b.textContent=chu;b.style.cssText='min-height:44px;flex:1';b.onclick=fn;tabs.append(b);return b;}
  const homNay=nut('Hôm nay',()=>{dangMo=false;moViec();}),tuanNay=nut('Tuần này',()=>{dangMo=true;ve();});
  const nv=document.getElementById('nvNoi');hop.insertBefore(tabs,nv);hop.insertBefore(noi,nv);
  function ve(){
    document.getElementById('nvNoi').hidden=dangMo;document.getElementById('nvHen').hidden=dangMo;noi.hidden=!dangMo;
    homNay.setAttribute('aria-pressed',String(!dangMo));tuanNay.setAttribute('aria-pressed',String(dangMo));
    if(!dangMo)return;const k=cap();if(!k)return;
    noi.replaceChildren();const p=document.createElement('p');p.textContent='Ba thử thách mới mỗi thứ Hai. Hoàn thành nhận huy hiệu kỷ niệm, không thưởng tiền hay gói mua.';noi.append(p);
    for(const m of k.ds){const d=document.createElement('div');d.className='nv';d.style.display='block';const b=document.createElement('b');b.textContent=m.ten;const t=document.createElement('p');t.textContent=m.co+'/'+m.can+(m.co>=m.can?' · Đã nhận huy hiệu':'');d.append(b,t);noi.append(d);}
    const h=document.createElement('p');h.textContent='Bộ sưu tập: '+k.du.huyHieu.length+' huy hiệu Chủ trọ chăm chỉ';noi.append(h);
  }
  const moCu=moViec;
  moViec=function(...a){dangMo=false;const r=moCu(...a);ve();return r;};
  window.ThuThachWeb={cap,ve};
})();
