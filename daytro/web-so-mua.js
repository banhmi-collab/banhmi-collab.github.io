// #79.4c Sổ Chủ Trọ theo mùa (chỉ web) — KHUNG, tắt mặc định, chưa bán.
// Bật bằng cau-hinh-web.json "soMua": {ma, ten, tu, den, moc:[{thang, qua}]} trong khoảng tu…den.
// Nhánh miễn phí: mỗi tháng chơi xong trong mùa +1 bước; đủ mốc nhận tiền trong game (nghìn đồng).
// Nhánh quà xịn chỉ hiện chữ "sắp mở" — khi bán phải thêm gói mới ở máy chủ và có phiếu riêng.
(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.DayTroWeb)return;
  const W=window.DayTroWeb,KHOA='day-tro-so-mua';let mua=null;
  fetch('cau-hinh-web.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(c=>{mua=hopLe(c?.soMua);if(mua&&typeof st!=='undefined'&&st)veDay();},()=>{});
  function hopLe(m){if(!m||!/^[\w-]{1,40}$/.test(m.ma||'')||!Array.isArray(m.moc))return null;const tu=Date.parse(m.tu),den=Date.parse(m.den);
    if(!Number.isFinite(tu)||!Number.isFinite(den))return null;const moc=m.moc.filter(x=>Number.isInteger(x?.thang)&&x.thang>0&&Number.isInteger(x?.qua)&&x.qua>0&&x.qua<=2000).slice(0,12);
    return moc.length?{ma:m.ma,ten:String(m.ten||'Mùa mới').slice(0,30),tu,den,moc}:null;}
  const dangMo=(now=Date.now())=>!!mua&&now>=mua.tu&&now<=mua.den;
  const doc=()=>{try{const v=JSON.parse(localStorage.getItem(KHOA));return v&&v.ma===mua?.ma?v:{ma:mua?.ma,thang:0,nhan:[]};}catch{return {ma:mua?.ma,thang:0,nhan:[]};}};
  const ghi=v=>{try{localStorage.setItem(KHOA,JSON.stringify(v));}catch{}};
  // Tháng chơi xong trong mùa: bám sangThang (chỉ khi tháng thật sự tăng).
  const sangCu=sangThang;
  sangThang=function(...a){const truoc=st?.thang;const r=sangCu(...a);if(dangMo()&&st&&st.thang>truoc){const v=doc();v.thang++;ghi(v);capNut();}return r;};
  function nhan(i){const v=doc(),m=mua.moc[i];if(!m||v.thang<m.thang||v.nhan.includes(i))return false;v.nhan.push(i);ghi(v);doiTien(m.qua,'Sổ Chủ Trọ · '+mua.ten);
    try{window.warmJarThongKe?.('web_so_mua_nhan',{ma:mua.ma,moc:m.thang});}catch{}return true;}
  function mo(){
    const u=W.uiMua;if(!u||!dangMo())return;const v=doc(),h=u.bang('Sổ Chủ Trọ · '+mua.ten);h.parentNode.id='soMuaWeb';
    u.chu(h,'Chơi xong mỗi tháng trong mùa là tiến 1 bước. Đã đi '+v.thang+' bước.');
    mua.moc.forEach((m,i)=>{const da=v.nhan.includes(i),du=v.thang>=m.thang;
      const b=u.nut(h,(da?'Đã nhận · ':du?'Nhận · ':'Bước '+m.thang+' · ')+m.qua+'k tiền trong game',()=>{if(nhan(i)){h.parentNode.remove();mo();}},'lai');
      b.dataset.mocSoMua=String(i);b.disabled=da||!du;});
    u.chu(h,'Nhánh quà xịn: sắp mở.','web-ghichu');u.dongNut(h);
  }
  function capNut(){const b=document.querySelector('#dayPhong [data-so-mua]');if(!b)return;const v=doc();b.classList.toggle('co-luot',dangMo()&&mua.moc.some((m,i)=>v.thang>=m.thang&&!v.nhan.includes(i)));}
  const veDayCu=veDay;
  veDay=function(...a){const kq=veDayCu(...a);const co=document.querySelector('#dayPhong [data-so-mua]');
    if(dangMo()&&!co){const sau=document.querySelector('#dayPhong [data-loc]')||document.querySelector('#dayPhong [data-xom]');sau?.insertAdjacentHTML('afterend','<button class="tab" data-so-mua="1" aria-label="Sổ Chủ Trọ theo mùa">📒 Sổ mùa</button>');}
    else if(!dangMo()&&co)co.remove();capNut();return kq;};
  document.getElementById('dayPhong')?.addEventListener('click',e=>{if(e.target.closest('[data-so-mua]')){e.stopImmediatePropagation();if(!st?.dem)mo();}},true);
  window.SoMuaWeb={mo,nhan,doc,dangMo,datThu:m=>{mua=hopLe(m);},KHOA};
})();
