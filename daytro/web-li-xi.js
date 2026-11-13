// #79.3 Lì xì bản đầy đủ tặng bạn (chỉ web, gói li_xi 19k, ai cũng mua được).
// Người mua nhận MÃ QUÀ (mã đơn) để gửi bạn; người nhận nhập mã ở "Đã mua? Khôi phục bằng mã đơn" → mở bản đầy đủ.
// Chỉ bày bán trong khoảng cau-hinh-web.json liXi {tu, den}; nhập mã thì lúc nào cũng được.
(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.DayTroWeb)return;
  const W=window.DayTroWeb,KHOA='day-tro-li-xi',WEB='https://banhmi-collab.github.io/daytro/';
  let cauHinh=null;
  fetch('cau-hinh-web.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(c=>{cauHinh=c?.liXi||null;},()=>{});
  const dangBan=(now=Date.now())=>{const tu=Date.parse(cauHinh?.tu||''),den=Date.parse(cauHinh?.den||'');return Number.isFinite(tu)&&Number.isFinite(den)&&now>=tu&&now<=den;};
  const doc=()=>{try{const v=JSON.parse(localStorage.getItem(KHOA));return Array.isArray(v)?v:[];}catch{return [];}};
  function ghiMa(bc){const ma=bc?.maDayDu;if(typeof ma!=='string')return false;const ds=doc();if(ds.includes(ma))return false;ds.push(ma);try{localStorage.setItem(KHOA,JSON.stringify(ds));}catch{}return true;}
  const loiNhan=ma=>`🧧 Lì xì bạn bản đầy đủ game Dãy Trọ Của Tôi! Vào ${WEB} → Cửa hàng → "Đã mua? Khôi phục bằng mã đơn" → nhập mã ${ma}. Ván đang chơi của bạn vẫn giữ nguyên nha.`;
  function manMa(h,bc){
    const u=W.uiMua,ma=bc?.maDayDu||'';
    u.chu(h,'Gửi mã này cho bạn bè. Bạn ấy nhập mã là mở bản đầy đủ trên máy của bạn ấy.');
    const m=document.createElement('p');m.className='web-ma';m.dataset.maLiXi='';m.textContent=ma;m.style.textAlign='center';h.append(m);
    const b=u.nut(h,'Gửi lời chúc kèm mã',async()=>{
      const chu=loiNhan(ma);
      try{if(navigator.share){await navigator.share({text:chu});u.doWeb('web_li_xi_gui',{cach:'chia_se'});return;}}catch{}
      try{await navigator.clipboard.writeText(chu);b.textContent='Đã chép lời chúc · dán vào Zalo/Messenger';u.doWeb('web_li_xi_gui',{cach:'chep'});}catch{b.textContent='Chép tay mã '+ma+' nhé';}
    });b.dataset.guiLiXi='';
    u.chu(h,'Mã nằm trong mục "Lì xì đã mua" ở Cửa hàng nếu bạn cần xem lại.','web-ghichu');
  }
  (W.themVaoManMua||=[]).push((noi,{dayDu})=>{
    const ds=doc();
    if(noi.querySelector('[data-li-xi]')||(!dangBan()&&!ds.length))return;
    const u=W.uiMua,hop=document.createElement('section');hop.className='web-tron-bo';hop.dataset.liXi='';
    const t=document.createElement('h4');t.textContent='🧧 Lì xì bản đầy đủ tặng bạn';t.style.margin='0 0 4px';hop.append(t);
    if(dangBan()){
      u.chu(hop,'Bạn trả 19.000đ, nhận một mã quà. Gửi cho bạn bè: bạn ấy nhập mã là chơi bản đầy đủ, giữ nguyên ván của bạn ấy.');
      u.nut(hop,'Mua lì xì · 19.000đ',()=>W.moGoi?.('li_xi'));
    }
    if(ds.length){const p=u.chu(hop,'Lì xì đã mua: '+ds.join(', '),'web-ghichu');p.dataset.maDaMua='';}
    if(dayDu)noi.prepend(hop);else noi.append(hop);
  });
  window.LiXiWeb={ghiMa,manMa,dangBan,loiNhan,KHOA};
})();
