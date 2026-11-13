// #79.2 Thẻ "Chủ trọ chăm" 30 ngày (chỉ web, gói the_cham 19k, cần bản đầy đủ).
// Trả một lần, dùng 30 ngày tính từ lúc máy chủ nhận tiền, KHÔNG tự gia hạn.
// Mỗi ngày vào game: +100k tiền trong game và thêm 1 lượt quay lộc; ngày 7/14/21/28: 200k; ngày 30: 500k + huy hiệu.
// Còn ≤ 3 ngày thì nhắc và cho mua thẻ mới (máy chủ cũng chặn mua khi còn hơn 3 ngày).
(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.DayTroWeb)return;
  const W=window.DayTroWeb,KHOA='day-tro-the-cham',NGAY=86400000,HAN=30;
  const doc=()=>{try{const v=JSON.parse(localStorage.getItem(KHOA));return v&&Array.isArray(v.ds)?v:{ds:[]};}catch{return {ds:[]};}};
  const ghi=v=>{try{localStorage.setItem(KHOA,JSON.stringify(v));return true;}catch{return false;}};
  const ngayMay=(d=new Date())=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  const daVao=()=>typeof st!=='undefined'&&!!st&&typeof daVaoGame!=='undefined'&&daVaoGame&&(typeof hdXong==='undefined'||hdXong);
  // Thẻ đang dùng: lần trả gần nhất còn trong 30 ngày.
  function the(now=Date.now()){
    const v=doc();let moi=null;
    for(const x of v.ds){const t=Date.parse(x.traLuc);if(Number.isFinite(t)&&(!moi||t>moi.t))moi={...x,t};}
    if(!moi||now>=moi.t+HAN*NGAY)return null;
    const ngayThu=Math.min(HAN,Math.max(1,Math.floor((now-moi.t)/NGAY)+1)),con=HAN-ngayThu+1;
    return {ma:moi.ma,bat:moi.t,den:moi.t+HAN*NGAY,ngayThu,con};
  }
  const muaDuoc=()=>{const t=the();return !t||t.con<=3;};
  const ddmm=t=>{const d=new Date(t);return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');};
  const qua=n=>n>=HAN?500:n%7===0?200:100;
  // Ghi đơn đã trả (từ mở quyền tự động hoặc khôi phục mã). Trả true nếu là đơn mới.
  function nhan(bc){
    const ma=bc?.maDayDu,traLuc=bc?.traLuc||new Date().toISOString();if(typeof ma!=='string')return false;
    const v=doc();if(v.ds.some(x=>x.ma===ma))return false;v.ds.push({ma,traLuc});ghi(v);setTimeout(nhanHomNay,0);return true;
  }
  function manDaMua(h){
    const u=W.uiMua,t=the();
    u.chu(h,t?'Thẻ Chủ trọ chăm dùng đến hết '+ddmm(t.den-1)+'.':'Thẻ Chủ trọ chăm đã được ghi nhận.');
    u.chu(h,'Mỗi ngày vào game: +100k và thêm 1 lượt quay lộc. Ngày 7, 14, 21, 28 được 200k; ngày 30 được 500k và huy hiệu.');
    u.chu(h,'Thẻ không tự gia hạn, không trừ tiền thêm.','web-ghichu');
  }
  // Quà mỗi ngày: nhận 1 lần/ngày khi đang dùng thẻ.
  function nhanHomNay(){
    if(!daVao())return null;const t=the();if(!t)return null;const v=doc(),h=ngayMay();
    if(v.nhanNgay===h)return null;
    const k=qua(t.ngayThu);v.nhanNgay=h;v.daNhan=(v.daNhan||0)+1;if(t.ngayThu>=HAN)v.huyHieu=(v.huyHieu||0)+1;if(!ghi(v))return null;
    window.VongQuayWeb?.themLuot(1);
    doiTien(k,'Quà thẻ Chủ trọ chăm');
    try{window.warmJarThongKe?.('web_the_cham_qua',{ngay:t.ngayThu});}catch{}
    hienQua(t,k);
    return {k,ngayThu:t.ngayThu};
  }
  function hienQua(t,k){
    if(document.getElementById('theChamQua'))return;
    const nen=document.createElement('div');nen.id='theChamQua';nen.className='web-bang';
    const hop=document.createElement('div');hop.className='web-hop';nen.append(hop);
    const h2=document.createElement('h2');h2.textContent='Quà thẻ Chủ trọ chăm';hop.append(h2);
    const p=(s,c='')=>{const x=document.createElement('p');x.textContent=s;if(c)x.className=c;hop.append(x);return x;};
    p('Ngày '+t.ngayThu+'/'+HAN+': +'+k+'k vào két và thêm 1 lượt quay lộc hôm nay.');
    if(t.ngayThu>=HAN)p('Bạn đã đi trọn 30 ngày, nhận huy hiệu Chủ trọ chăm!');
    else if(t.con<=3)p('Thẻ còn '+t.con+' ngày. Muốn nhận quà tiếp thì mua thẻ mới trong Cửa hàng (không tự gia hạn).','web-han-ban');
    const b=document.createElement('button');b.type='button';b.className='nut';b.textContent='Nhận';b.onclick=()=>nen.remove();hop.append(b);
    if(t.con<=3&&t.ngayThu<HAN){const g=document.createElement('button');g.type='button';g.className='lai';g.textContent='Xem thẻ mới';g.onclick=()=>{nen.remove();W.moGoi?.('the_cham');};hop.append(g);}
    document.body.append(nen);
  }
  // Thẻ bán trong Cửa hàng (người đã có bản đầy đủ).
  (W.themVaoManMua||=[]).push((noi,{dayDu})=>{
    if(!dayDu||noi.querySelector('[data-the-cham]'))return;
    const u=W.uiMua,t=the(),hop=document.createElement('section');hop.className='web-tron-bo';hop.dataset.theCham='';
    const tde=document.createElement('h4');tde.textContent='Thẻ Chủ trọ chăm · 30 ngày';tde.style.margin='0 0 4px';hop.append(tde);
    u.chu(hop,'Mỗi ngày vào game: +100k và thêm 1 lượt quay lộc. Ngày 7, 14, 21, 28 được 200k; ngày 30 được 500k và huy hiệu.');
    if(t)u.chu(hop,'Đang dùng đến hết '+ddmm(t.den-1)+' (còn '+t.con+' ngày).','web-ghichu');
    const b=u.nut(hop,'19.000đ · dùng 30 ngày · không tự gia hạn',()=>W.moGoi?.('the_cham'));
    if(!muaDuoc()){b.disabled=true;b.textContent='Đang dùng thẻ · mua tiếp khi còn 3 ngày';}
    noi.prepend(hop);
  });
  // Mỗi lần vẽ lại dãy phòng (vào game, sang tháng…) thử nhận quà hôm nay.
  const veDayCu=veDay;
  veDay=function(...a){const kq=veDayCu(...a);if(daVao())setTimeout(nhanHomNay,0);return kq;};
  window.TheChamWeb={the,nhan,nhanHomNay,manDaMua,muaDuoc,qua,KHOA};
})();
