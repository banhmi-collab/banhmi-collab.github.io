// #80 chỉ web: màn "Hôm nay nghỉ" nói rõ ngày mai có gì: chương thư Linh kế tiếp, lời hẹn, giờ mở lại tháng miễn phí.
// Chỉ đọc dữ liệu đã có: không thêm thưởng, không đổi hẹn (không gọi hienHenMai), không đổi lượt ngày hay ván.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  // NHA[i]: dòng nhá chương i+2 của thư Linh (Thảo duyệt 18/11/2026). Chương 1 không nhá vì chưa quen Linh.
  const NHA=[
    'Linh đi học về muộn, cả dãy tắt đèn…',
    'Linh nấu nồi canh chua đầu tiên 🍲',
    'Linh thi giữa kỳ môn đầu tiên 📚',
    'Linh nhận điểm thi — đậu hay rớt?',
    'mẹ Linh lên thăm xóm trọ',
    'mẹ Linh gửi chủ trọ một món quà 🎁'
  ];
  const KHOA='day-tro-ngay-mai-80';
  const ngayKhoa=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const the=(cha,lop,chu)=>{const n=document.createElement(cha);if(lop)n.className=lop;n.textContent=chu;return n;};

  // Chương Linh nhắn ngày mai (2–7), 0 khi không có gì để nhá.
  // Hôm nay đã đọc chương c → mai là c+1. Hôm nay chưa đọc → chương c+1 còn chờ hôm nay, mai là c+2.
  function chuongMai(homNay=ngayKhoa()){
    const tt=typeof st!=='undefined'?st?.webThuLinh:null;
    const c=Number.isInteger(tt?.c)&&tt.c>=1&&tt.c<=7?tt.c:0;
    if(!c)return 0;
    const mai=tt.ngay===homNay?c+1:c+2;
    return mai>=2&&mai<=7?mai:0;
  }
  // Đọc lời hẹn ngày mai đã có, giống #77: không gọi hienHenMai nên không đổi hẹn, không tăng hen_mai_hien.
  function henMai(){
    try{const m=docHen().mai;return (m&&mauHen(m)?.loi)||'';}catch{return '';}
  }
  // Giờ mở lại: lượt ngày tính theo ngày giờ máy (web-dot-3-loi.js), nên đếm tới 0 giờ.
  function conLai(bay=new Date()){
    const mai=new Date(bay.getFullYear(),bay.getMonth(),bay.getDate()+1);
    const phut=Math.max(1,Math.ceil((mai-bay)/60000));
    const g=Math.floor(phut/60),p=phut%60;
    return g?g+' giờ '+p+' phút':p+' phút';
  }
  function ghi(ten,p){
    try{
      if(location.hostname==='banhmi-collab.github.io'){
        if(window['ga-disable-G-8TG4SYPDPV'])return;
        window.gtag?.('event',ten,{send_to:'G-8TG4SYPDPV',nen_tang:'web',game:'daytro',...p});
      }else(window.__ngayMaiSk??=[]).push([ten,p]);
    }catch{ /* Thống kê lỗi vẫn chơi được. */ }
  }
  const docLuu=()=>{try{return JSON.parse(localStorage.getItem(KHOA))||{};}catch{return {};}};
  const luuLuu=v=>{try{localStorage.setItem(KHOA,JSON.stringify(v));}catch{}};

  function dung(h){
    if(h.querySelector('.web80-ngay-mai'))return;
    const p=h.querySelectorAll(':scope>p');const moc=p[1]||p[0];if(!moc)return;
    const homNay=ngayKhoa(),ch=chuongMai(homNay);
    // Nhóm #77 "co" có dòng "Ngày x/7 · Ngày mai: <hẹn>": gom lời hẹn vào khối này, dòng #77 chỉ giữ "Ngày x/7".
    // Số đo #77 (web_tuan_dau_hien) đã ghi lúc gắn dòng nên không đổi.
    const hen=henMai();
    if(hen)for(const n of h.querySelectorAll('.web77-tuan')){
      const i=n.textContent.indexOf('Ngày mai:');if(i<0)continue;
      const truoc=n.textContent.slice(0,i).replace(/\s*·\s*$/,'').trim();
      if(truoc)n.textContent=truoc;else n.remove();
    }
    const k=document.createElement('section');k.className='web80-ngay-mai';
    k.append(the('b','','Ngày mai ở xóm'));
    if(ch)k.append(the('p','web80-linh','💌 Ngày mai: '+NHA[ch-2]));
    if(hen)k.append(the('p','web80-hen','🏠 Ngày mai: '+hen));
    const gio=the('p','web80-gio','');
    const thang=(typeof st!=='undefined'&&Number.isInteger(st?.thang)?st.thang:0)+1;
    const veGio=()=>{gio.textContent='🎮 Tháng '+thang+' mở lại sau '+conLai();};
    veGio();k.append(gio);
    moc.after(k);
    gon(h,k);
    const dem=setInterval(()=>{if(!k.isConnected){clearInterval(dem);return;}veGio();},30000);
    const v=docLuu();
    if(v.hien!==homNay){luuLuu({hien:homNay});ghi('web_ngay_mai_hien',{chuong:ch,co_hen:hen?1:0});}
  }
  // Thảo duyệt 18/11: màn nghỉ gọn — trên cùng là "Ngày mai ở xóm" rồi lợi ích + nút mua; phần còn lại gập vào "Xem thêm".
  // Chỉ dời chỗ, không tạo/xoá nút nên mọi nút giữ nguyên việc làm và số đo.
  // Luôn để ngoài: cảnh báo mở trong app (.web-nhac), khối đường về #77, nút "Mai chơi tiếp".
  function gon(h,k){
    if(h.querySelector('.web80-them'))return;
    const tieuDe=h.querySelector(':scope>h2');
    const mua=[...h.querySelectorAll(':scope>button')].find(b=>'moDayDu' in b.dataset);
    if(!tieuDe||!mua)return;
    const loiIch=h.querySelector(':scope>[data-loi-ich]'),daMo=h.querySelector(':scope>[data-da-mo]');
    // Khối "Rủ 1 bạn · mở thêm 1 tháng" (đợt 2) phải nằm ngay dưới nút 19k: đường chơi tiếp của người chưa mua.
    const ruBan=h.querySelector(':scope>.ru-ban');
    const giuNgoai=n=>n===tieuDe||n===k||n===mua||n===loiIch||n===daMo||n===ruBan||n.matches?.('.web-nhac,.web77-duong-ve')||(n.tagName==='BUTTON'&&/Mai chơi tiếp/.test(n.textContent));
    const them=document.createElement('details');them.className='web80-them';
    const tom=document.createElement('summary');tom.textContent='Xem thêm: dãy trọ của bạn, gói khác';them.append(tom);
    for(const n of [...h.children])if(!giuNgoai(n))them.append(n);
    tieuDe.after(k);k.after(...[loiIch,mua,ruBan,daMo].filter(Boolean));
    const cuoi=[...h.children].find(n=>n.tagName==='BUTTON'&&/Mai chơi tiếp/.test(n.textContent));
    if(cuoi)cuoi.before(them);else h.append(them);
  }
  // Lần mở game ở ngày sau lần thấy khối: ghi một lần số ngày cách (1 = quay lại đúng hôm sau).
  function ghiVe(){
    const v=docLuu();if(!v.hien||v.ve)return;
    const homNay=ngayKhoa();if(v.hien===homNay)return;
    const [y,m,d]=v.hien.split('-').map(Number);const a=new Date(y,m-1,d),b=new Date();b.setHours(0,0,0,0);
    const cach=Math.round((b-a)/86400000);
    luuLuu({...v,ve:homNay});
    if(cach>=1&&cach<=30)ghi('web_ngay_mai_ve',{cach});
  }
  ghiVe();
  new MutationObserver(ds=>{for(const d of ds)for(const n of d.addedNodes){
    if(n.nodeType!==1||n.id!=='hetLuotNgay')continue;
    const h=n.querySelector('.web-hop');
    // Chờ một nhịp để #77 gắn dòng tuần đầu trước, rồi mới quyết có lặp lời hẹn không.
    if(h)setTimeout(()=>dung(h),0);
  }}).observe(document.body,{childList:true});

  const css=document.createElement('style');
  css.textContent='.web80-ngay-mai{margin:8px 0;padding:10px 12px;background:#fffdf6;border:1.5px dashed #bc8c45;border-radius:10px;text-align:left;font-size:13px;line-height:1.45;color:#4a2f20}.web80-ngay-mai b{display:block;margin-bottom:4px;font-size:14px;color:#6b4530}.web80-ngay-mai p{margin:3px 0;overflow-wrap:anywhere}.web80-them{margin:10px 0;text-align:left;font-size:13px}.web80-them>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;justify-content:center;color:#6b4530;font-weight:600;text-decoration:underline}';
  document.head.append(css);
  window.NgayMaiWeb={chuongMai,conLai,ngayKhoa,ghiVe,NHA};
})();
