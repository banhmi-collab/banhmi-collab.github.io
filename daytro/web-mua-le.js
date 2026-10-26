// Mùa lễ chỉ là lớp trang trí web, không thay ngày/tháng hay kinh tế game.
(() => {
  'use strict';
  function muaLe(d=new Date()){
    const y=d.getFullYear(),m=d.getMonth()+1,n=d.getDate();
    if(m===12&&n<=26)return {mua:'noel',ky:'noel-'+y,goi:'goi_noel'};
    const ngay=y*10000+m*100+n;
    if(ngay>=20270122&&ngay<=20270215)return {mua:'tet',ky:'tet-2027',goi:'goi_tet'};
    return null;
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={muaLe};return;}
  if(window.ReactNativeWebView)return;
  window.MuaLeWeb={muaLe};
  const khoa='day-tro-mua-le',daThay=new Set();
  try{const ds=JSON.parse(localStorage.getItem(khoa));if(Array.isArray(ds))for(const k of ds)if(typeof k==='string')daThay.add(k);}catch{}
  const css=document.createElement('style');
  css.textContent=`#muaLeTrangTri{position:absolute;inset:0;overflow:hidden;pointer-events:none}#muaLeTrangTri i{position:absolute;top:8%;left:var(--x);color:#fff;font-style:normal;font-size:22px;text-shadow:0 1px 2px #795336;animation:mua-le-roi 14s linear infinite;animation-delay:var(--tre)}#muaLeTrangTri[data-mua=tet] i{color:#e2b635}#muaLeLoiMoi{position:fixed;bottom:12px;left:12px;right:12px;max-width:420px;margin:auto;padding:12px;background:#fff8ee;color:#503520;border:1px solid #886349;border-radius:12px;z-index:800;box-shadow:0 3px 12px #50352033;font:14px/1.5 'Be Vietnam Pro',sans-serif}#muaLeLoiMoi p{margin:0 0 6px}#muaLeLoiMoi button{min-height:44px;min-width:44px;white-space:normal;margin-right:12px}@keyframes mua-le-roi{to{transform:translate(14px,260px);opacity:.1}}@media(prefers-reduced-motion:reduce){#muaLeTrangTri i{animation:none}}`;
  document.head.append(css);
  let kyVe='';
  function cap(){
    const mua=muaLe(),khung=document.getElementById('phongKhung');if(!khung)return;
    if(kyVe!==(mua?.ky||'')){
      kyVe=mua?.ky||'';document.getElementById('muaLeTrangTri')?.remove();document.getElementById('muaLeLoiMoi')?.remove();
      if(mua){const trang=document.createElement('div');trang.id='muaLeTrangTri';trang.dataset.mua=mua.mua;trang.setAttribute('aria-hidden','true');
        for(let i=0;i<6;i++){const v=document.createElement('i');v.style.cssText=`--x:${8+i*16}%;--tre:-${i*2}s`;v.innerHTML=mua.mua==='tet'?'<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="5" r="4"/><circle cx="5" cy="9" r="4"/><circle cx="7" cy="15" r="4"/><circle cx="14" cy="15" r="4"/><circle cx="15" cy="8" r="4"/><circle cx="10" cy="10" r="2" fill="#93592e"/></svg>':'<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="white"/></svg>';trang.append(v);}khung.append(trang);}
      if(typeof st!=='undefined'&&st&&typeof veTiem==='function')veTiem();
    }
    if(!mua||daThay.has(mua.ky)||!daVaoGame||document.querySelector('.phu.hien,.web-bang'))return;
    const hop=document.createElement('aside');hop.id='muaLeLoiMoi';hop.setAttribute('aria-label','Lời nhắn mùa lễ');
    const p=document.createElement('p');p.textContent=mua.mua==='tet'?'Cô Ba gửi lời chúc Tết tới dãy trọ. Muốn thêm chút sắc xuân thì ghé xem đồ Tết nha.':'Noel ghé xóm trọ rồi. Cô Ba có vài món Noel để bạn ngắm và bày phòng nha.';hop.append(p);
    const b=document.createElement('button');b.className='lai';b.textContent=mua.mua==='tet'?'Xem gói Tết':'Xem gói Noel';b.onclick=()=>{hop.remove();window.DayTroWeb?.moGoi(mua.goi);};
    const dong=document.createElement('button');dong.className='lai';dong.textContent='Đóng';dong.onclick=()=>hop.remove();hop.append(b,dong);document.body.append(hop);
    daThay.add(mua.ky);try{localStorage.setItem(khoa,JSON.stringify([...daThay]));}catch{}
  }
  window.MuaLeWeb.cap=cap;cap();setInterval(cap,1500);
})();
