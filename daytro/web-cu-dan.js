// Chỉ web. #57: mời người đã mua vào nhóm Facebook "Xóm Trọ Warm Jar" (191 người 2/11) để nghe tin khách trọ mới, đồ Tết, bản cập nhật.
// Nút nhóm trong Cài đặt đã có sẵn cho mọi người (#nutCongDong, game.js) nên lớp này chỉ thêm bảng cảm ơn và lời mời một lần.
// Game không giữ số điện thoại hay tên ai; chỉ mở đường dẫn nhóm. Chưa có đường dẫn trong cau-hinh-web.json thì không hiện gì.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const daMua=()=>{try{return !!JSON.parse(localStorage.getItem('day-tro-web-day-du'));}catch{return false;}};
  const khoaMoi='day-tro-web-zalo-moi',khoaGhe='day-tro-web-zalo-ghe';
  const doLuot=(cho,bam)=>{try{window.warmJarThongKe?.('web_nhom',{cho,bam});}catch{}};
  const css=document.createElement('style');
  css.textContent=`.web-zalo{margin:12px 0;padding:12px;border:1px solid #8aa37b;border-radius:12px;background:#f3f7ec;color:#3f3424;font:14px/1.5 'Be Vietnam Pro',sans-serif}.web-zalo p{margin:0 0 8px}.web-zalo a,#webZaloMoi a{display:flex;align-items:center;justify-content:center;min-height:44px;padding:6px 12px;border-radius:10px;background:#0068ff;color:#fff;font-weight:700;text-decoration:none}#webZaloMoi{position:fixed;bottom:12px;left:12px;right:12px;max-width:420px;margin:auto;padding:12px;background:#fff8ee;color:#503520;border:1px solid #886349;border-radius:12px;z-index:800;box-shadow:0 3px 12px #50352033;font:14px/1.5 'Be Vietnam Pro',sans-serif}#webZaloMoi p{margin:0 0 8px}#webZaloMoi .lai{min-height:44px;margin-top:6px;width:100%}`;
  document.head.append(css);
  const nutZalo=(link,cho)=>{const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Vào nhóm Xóm Trọ trên Facebook';a.onclick=()=>doLuot(cho,'vao');return a;};
  function ganCamOn(link){
    const lop=document.getElementById('webMoiThem'),hop=lop?.querySelector('.web-hop');
    if(!hop||hop.querySelector('.web-zalo'))return;
    const khung=document.createElement('section');khung.className='web-zalo';
    const p=document.createElement('p');p.textContent='Vào nhóm Xóm Trọ Warm Jar trên Facebook để biết trước khi có khách trọ mới, đồ Tết và bản cập nhật.';
    khung.append(p,nutZalo(link,'cam_on'));
    const deSau=[...hop.querySelectorAll('button.lai')].pop();if(deSau)deSau.before(khung);else hop.append(khung);
    try{localStorage.setItem(khoaMoi,'1');}catch{}
  }
  // Người mua từ trước khi có nhóm: mời một lần, từ lần ghé thứ hai trở đi, khi màn chơi đang trống.
  function moiMotLan(link){
    try{if(localStorage.getItem(khoaMoi)==='1')return;}catch{return;}
    if(typeof daVaoGame==='undefined'||!daVaoGame||document.querySelector('.phu.hien,.web-bang,#muaLeLoiMoi,#webZaloMoi'))return;
    try{localStorage.setItem(khoaMoi,'1');}catch{return;}
    const hop=document.createElement('aside');hop.id='webZaloMoi';hop.setAttribute('aria-label','Mời vào nhóm Xóm Trọ');
    const p=document.createElement('p');p.textContent='Dãy trọ có nhóm Xóm Trọ trên Facebook! Vào để biết trước khi có khách trọ mới và đồ Tết nha.';
    const a=nutZalo(link,'loi_moi');a.addEventListener('click',()=>hop.remove());
    const dong=document.createElement('button');dong.type='button';dong.className='lai';dong.textContent='Để sau';dong.onclick=()=>{doLuot('loi_moi','de_sau');hop.remove();};
    hop.append(p,a,dong);document.body.append(hop);doLuot('loi_moi','hien');
  }
  let lanGhe=0;
  try{lanGhe=(Number(sessionStorage.getItem(khoaGhe))||Number(localStorage.getItem(khoaGhe))+1||1);sessionStorage.setItem(khoaGhe,String(lanGhe));localStorage.setItem(khoaGhe,String(lanGhe));}catch{}
  fetch('cau-hinh-web.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(c=>{
    // Chỉ nhận nhóm Facebook đúng dạng; link lạ trong cấu hình bị bỏ qua.
    const link=typeof c.nhom==='string'&&/^https:\/\/www\.facebook\.com\/groups\/[A-Za-z0-9.]+\/?$/.test(c.nhom)?c.nhom:'';
    if(!link)return;
    window.CuDanWeb={link};
    const xem=()=>{if(!daMua())return;ganCamOn(link);if(lanGhe>=2)moiMotLan(link);};
    xem();setInterval(xem,1500);
  }).catch(()=>{});
})();
