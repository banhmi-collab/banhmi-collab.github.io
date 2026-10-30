// Nội dung sau khi dãy trọ đã lớn. Chỉ ghép vào web trước khi đọc ván.
(() => {
  'use strict';
  if(window.ReactNativeWebView||window.CuoiGameWeb)return;
  const nangCap=[
    {ma:'son',ten:'Sơn lại mặt tiền',gia:4000,loi:'Thêm 1 uy tín khi sơn xong',hinh:'<path d="M4 22L20 7 36 22V36H4Z" fill="#d89b73"/><path d="M10 27h20" stroke="#fff0d2" stroke-width="5"/>'},
    {ma:'camera',ten:'Camera hành lang',gia:6000,loi:'Bùng sau lần đầu: 12% còn 9% mỗi khách đủ điều kiện',hinh:'<path d="M5 10h24v16H5Z" fill="#9bada0"/><circle cx="17" cy="18" r="6" fill="#514c3e"/><path d="M29 14l8-4v18l-8-4M15 26v10H6" fill="none" stroke="#514c3e" stroke-width="3"/>'},
    {ma:'phoi',ten:'Sân phơi chung',gia:8000,loi:'Thêm 10k/tháng cho mỗi phòng có khách cần chỗ phơi',hinh:'<path d="M3 7v30M37 7v30M3 12h34" stroke="#876c52" stroke-width="2"/><path d="M8 12h9v17H8zm16 0h9v17h-9z" fill="#e7cda3"/>'},
    {ma:'nuoc',ten:'Máy lọc nước chung',gia:10000,loi:'Thêm 10k/tháng cho mỗi phòng có khách cần nước',hinh:'<rect x="9" y="12" width="24" height="26" rx="3" fill="#d7d9c6"/><rect x="13" y="2" width="16" height="14" rx="4" fill="#99bbbf"/><path d="M17 22h8v8" fill="none" stroke="#685c49" stroke-width="3"/>'},
    {ma:'mai',ten:'Mái che để xe',gia:14000,loi:'Thêm 10k/tháng cho mỗi phòng trọ có người ở',hinh:'<path d="M3 10h32l4 12H1Z" fill="#aa7861"/><path d="M5 22v16m30-16v16" stroke="#785e45" stroke-width="3"/><circle cx="14" cy="33" r="4" fill="#5c6255"/><circle cx="28" cy="33" r="4" fill="#5c6255"/><path d="M14 33l7-8 7 8" stroke="#5c6255" fill="none"/>'},
    {ma:'cay',ten:'Cây xanh hành lang',gia:18000,loi:'Thêm 15k/tháng cho mỗi phòng trọ có người ở',hinh:'<path d="M10 25h22l-4 13H14Z" fill="#bb8563"/><path d="M21 28V9" stroke="#627754" stroke-width="3"/><ellipse cx="14" cy="16" rx="9" ry="5" fill="#82955d"/><ellipse cx="27" cy="9" rx="9" ry="6" fill="#a5ad6d"/>'},
  ];
  const khachHiem=[
    {ma:'ngheSi',hinhNguoi:1,ten:'Chị Mây',nghe:'Nghệ sĩ đường phố',kieu:'caSi',loi:'Chị diễn ở phố cuối tuần. Cần chỗ nghỉ và một góc tập yên yên.'},
    {ma:'phiCong',hinhNguoi:2,ten:'Anh Vũ',nghe:'Phi công nghỉ phép',kieu:'tiepVien',loi:'Anh chỉ ở hai tháng. Phòng đủ tiện nghi để nghỉ giữa hai chuyến nhé.'},
    {ma:'veSo',hinhNguoi:1,ten:'Bà Tư',nghe:'Bà bán vé số',kieu:'veHuu',loi:'Bà đi cả ngày, về cần đủ chỗ sinh hoạt. Con tính giá vừa túi bà nha.'},
    {ma:'duLich',hinhKieu:'banOnline',ten:'Chị Na',nghe:'Người quay ký sự du lịch',kieu:'streamer',loi:'Mình ở lại quay chuyện trong xóm, cần phòng đủ năm góc sinh hoạt.'},
    {ma:'khaoCo',ten:'Anh Bình',nghe:'Nhà khảo cổ',kieu:'danIT',loi:'Anh vừa về từ chuyến khảo sát. Có góc đọc sách và nghỉ ngơi là quý lắm.'},
    {ma:'longTieng',hinhNguoi:1,ten:'Chị An',nghe:'Diễn viên lồng tiếng',kieu:'caSi',loi:'Chị thu âm cả ngày, về phòng chỉ muốn mọi thứ gọn gàng, đủ dùng.'},
    {ma:'cuuHo',hinhKieu:'shipper',ten:'Anh Nam',nghe:'Người cứu hộ động vật',kieu:'yeuMeo',loi:'Anh chăm mấy bạn nhỏ cả ngày. Phòng đủ đồ để anh nghỉ cho lại sức nhé.'},
    {ma:'thienVan',ten:'Cô Ngân',nghe:'Người ngắm sao',kieu:'coGiao',loi:'Cô ở đây hai tháng, ban đêm lên sân ngắm sao, ban ngày đọc sách.'},
  ];
  const maNC=nangCap.map(x=>x.ma),maKH=khachHiem.map(x=>x.ma),qua='web45-du-khach';
  function du(){if(!st)return null;if(!st.webCuoiGame||typeof st.webCuoiGame!=='object'||Array.isArray(st.webCuoiGame))st.webCuoiGame={};const d=st.webCuoiGame;if(!Array.isArray(d.nangCap))d.nangCap=[];if(!Array.isArray(d.gap))d.gap=[];return d;}
  const moNangCap=()=>!!st&&(st.thang>=17||st.phong.slice(0,6).every(p=>p.mo));
  const co=ma=>!!du()?.nangCap.includes(ma),dayDu=()=>!!du()&&maNC.every(co);
  const ghi=(ten,p)=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const quaVe=()=>'<rect class="n" x="220" y="-224" width="100" height="90" fill="#ad895d"/><rect x="228" y="-216" width="84" height="74" fill="#f6e8ce"/><path d="M239 -169l21-29 16 17 16-12 13 24" stroke="#6f8059" stroke-width="4" fill="none"/><circle cx="291" cy="-201" r="7" fill="#cfab61"/>';
  TREO.push({ten:'Tranh tám chuyến ghé xóm',gia:0,thue:0,qua,ve:quaVe});
  for(const n of nangCap)THANH_TICH.push({id:'web45_'+n.ma,ten:n.ten,mo:'Hoàn tất nâng cấp chung cho dãy trọ',thuong:0,dat:()=>co(n.ma)});
  function muaNangCap(ma){const n=nangCap.find(x=>x.ma===ma);if(!n||!moNangCap()||co(ma))return false;if(st.tien<n.gia){loa('Còn thiếu '+dong(n.gia-st.tien));return false;}du().nangCap.push(ma);doiTien(-n.gia,'Nâng cấp: '+n.ten);if(ma==='son')st.uyTin=(st.uyTin||0)+1;ghi('web_nang_cap',{ma});veHet();luu(true);return true;}
  const css=document.createElement('style');css.textContent=`#web45Dai{display:block;width:100%;grid-column:1/-1;text-align:left;pointer-events:none;border:1px solid #a48d68;border-radius:8px;background:#e9ead5;color:#503520;padding:3px 10px;font:11px/1.3 'Be Vietnam Pro',sans-serif}#web45Dai[hidden]{display:none}#web45NangCap article{display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;border-bottom:1px solid #cfbea3;padding:10px 0}#web45NangCap svg{width:44px;height:44px}#web45NangCap p{margin:4px 0;font-size:12px;line-height:1.4}#web45NangCap button{min-height:44px;width:100%;margin-top:6px}#web45San{position:absolute;bottom:19%;left:8%;right:8%;display:flex;gap:4px;pointer-events:none}#web45San svg{width:32px;height:36px;filter:drop-shadow(1px 2px 1px #604f3833)}#web45Khach{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:8px}#web45Khach h3,#web45Khach p{grid-column:1/-1}#web45Khach .sk{padding:8px;font-size:12px}#web45Khach .chua svg{filter:brightness(0);opacity:.22}#web45Khach svg{height:95px;width:65px}#manSK .tam{max-height:90dvh;overflow:auto}`;document.head.append(css);
  const dai=document.createElement('div');dai.id='web45Dai';dai.hidden=true;document.querySelector('.tren').append(dai);dai.setAttribute('aria-label','Nâng cấp dãy trọ · xem trong Mục tiêu');
  const bang=document.createElement('section');bang.id='web45NangCap';document.getElementById('mucGanDayDu').after(bang);
  const san=document.createElement('div');san.id='web45San';san.setAttribute('aria-hidden','true');document.getElementById('phongKhung').append(san);
  let veKhoa='';
  function cap(){if(!st||!daVaoGame)return;const d=du(),mo=moNangCap();dai.hidden=!mo&&st.thang<12;if(!dai.hidden)dai.textContent=mo?'Dãy trọ thêm tiện nghi · '+maNC.filter(co).length+'/6 nâng cấp · Sổ khách hiếm '+d.gap.length+'/8':'Chơi đủ 12 tháng: có khách hiếm ghé xóm · xem trong Sổ khách';
    const khoa=JSON.stringify([mo,d.nangCap,st.tien]);if(khoa===veKhoa)return;veKhoa=khoa;bang.replaceChildren();san.innerHTML=nangCap.filter(n=>co(n.ma)).map(n=>`<svg viewBox="0 0 40 40">${n.hinh}</svg>`).join('');if(!mo)return;
    const t=document.createElement('h3');t.textContent=dayDu()?'Người giữ xóm · đủ sáu nâng cấp':'Nâng cấp dãy trọ';bang.append(t);
    for(const n of nangCap){const a=document.createElement('article'),h=document.createElementNS('http://www.w3.org/2000/svg','svg');h.setAttribute('viewBox','0 0 40 40');h.innerHTML=n.hinh;const v=document.createElement('div'),b=document.createElement('b'),p=document.createElement('p'),nut=document.createElement('button');b.textContent=n.ten;p.textContent=n.loi;nut.className='nut nhe';nut.dataset.nangCap=n.ma;nut.textContent=co(n.ma)?'Đã làm xong':'Làm · '+dong(n.gia);nut.disabled=co(n.ma)||st.tien<n.gia;nut.onclick=()=>muaNangCap(n.ma);v.append(b,p,nut);a.append(h,v);bang.append(a);}
  }
  const veCu=veHet;veHet=function(...a){const r=veCu(...a);cap();return r;};
  const bungCu=bungNay;bungNay=function(...a){return st?.daBung&&co('camera')?Math.random()<.09:bungCu(...a);};
  function tienTienIch(){if(!du())return 0;return st.phong.slice(0,6).filter(p=>p.mo&&!p.loai&&p.khach?.o).reduce((s,p)=>s+(co('phoi')&&p.khach.can.includes('phoi')?10:0)+(co('nuoc')&&p.khach.can.includes('nuoc')?10:0)+(co('mai')?10:0)+(co('cay')?15:0),0);}
  const sangCu=sangThang;sangThang=function(...a){for(const p of st.phong){const k=p.khach;if(k?.webKhachHiem&&st.thang+1>=k.web45Den)k.con=0;}const r=sangCu(...a),d=du();if(d.traThang!==st.thang){d.traThang=st.thang;const t=tienTienIch();if(t)doiTien(t,'Tiện ích chung của dãy trọ');luu(true);}return r;};
  // Lịch dùng bộ rút riêng để không rút thêm RNG của game trong 12 tháng đầu.
  // Hạt riêng được lưu; tải lại không quay lại lượt của tháng đang chơi.
  function rut(d){d.hat=((Math.imul(d.hat,1664525)+1013904223)>>>0);return d.hat/4294967296;}
  function lich(){const d=du();if(!st||st.thang<12)return null;if(d.lich?.thang===st.thang)return d.lich;if(!Number.isInteger(d.hat))d.hat=(Date.now()^Math.imul(st.idKe||1,2654435761))>>>0;
    const mua=window.SuKienWeb?.hienTai();const ra=rut(d),ma=ra<.12?khachHiem[Math.floor(rut(d)*khachHiem.length)].ma:null;d.lich={thang:st.thang,ma:mua?null:ma,daDen:false};luu(true);return d.lich;}
  let dangKhach=null;
  function taoHiem(c,k){const a=['ngu','nuoc','mat','ngoi','hoc'];k.can=a;k.ten=c.ten;const hinhKieu=KIEU[c.hinhKieu||c.kieu]||KIEU.veHuu;k.dang={...hinhKieu.nguoi[c.hinhNguoi||0][1]};k.webKhachHiem=c.ma;k.daMac=true;const re=a.reduce((s,n)=>s+Math.min(...Object.values(DO).filter(d=>d.nhom===n&&!d.goi&&!d.tiem&&!d.tra).map(d=>d.thue)),0);const p=st.phong[st.o];k.tran=GIA_NEN+(p.rong>=7?600:p.rong>5?300:0)+SAN[p.san||0].thue+REM[p.rem||0].thue+TREO[p.treo||0].thue+DEN[p.den||0].thue+re+100;return k;}
  const taoCu=taoKhach;taoKhach=function(...a){return dangKhach?taoHiem(dangKhach,taoCu(KIEU[dangKhach.kieu]?dangKhach.kieu:'danIT')):taoCu(...a);};
  const denCu=khachDen;khachDen=function(...a){const p=st?.phong[st.o],l=lich(),d=du(),duoc=p?.mo&&!p.loai&&!p.mb&&!st.dem&&!st.khach&&!st.rac.length&&st.luot>0&&!document.querySelector('.phu.hien');
    if(duoc&&l?.ma&&!l.daDen&&!window.SuKienWeb?.hienTai()&&window.Web35?.du().luotKhachThang!==st.thang){dangKhach=khachHiem.find(x=>x.ma===l.ma);if(window.Web35)Web35.du().luotKhachThang=st.thang;}
    try{const r=denCu(...a);const k=st.khach;if(k?.webKhachHiem&&!k.o){l.daDen=true;if(!d.gap.includes(k.webKhachHiem))d.gap.push(k.webKhachHiem);document.getElementById('tenKhach').textContent=k.ten+' · '+khachHiem.find(x=>x.ma===k.webKhachHiem).nghe;if(maKH.every(m=>d.gap.includes(m))){if(!Array.isArray(st.quaTrangTri))st.quaTrangTri=[];if(!st.quaTrangTri.includes(qua))st.quaTrangTri.push(qua);}cap();luu(true);}return r;}finally{dangKhach=null;}};
  const hoi=k=>khachHiem.find(x=>x.ma===k.webKhachHiem).loi+' Cần '+k.can.map(n=>NHOM[n].ten).join(', ')+' · tối đa '+dong(k.tran)+'.';
  const thanhCu=veThanhTren;veThanhTren=function(...a){const r=thanhCu(...a),k=st?.khach,c=khachHiem.find(x=>x.ma===k?.webKhachHiem);if(c&&!k.o){document.getElementById('tenKhach').textContent=c.ten+' · '+c.nghe;document.getElementById('phuDePhong').textContent=c.ten+' · '+c.nghe;}return r;};
  const thueCu=choThueThat;choThueThat=function(...a){const k=st.khach,chua=k&&!k.o,r=thueCu(...a);if(chua&&k.o&&k.webKhachHiem){k.con=0;k.web45Den=st.thang+1+(maKH.indexOf(k.webKhachHiem)%2);k.con=k.web45Den-st.thang-1;if(!k.web45DaGhi){k.web45DaGhi=true;ghi('web_khach_hiem',{ma:k.webKhachHiem,kq:'thue'});}noi('Phòng vừa vặn quá, cảm ơn chủ trọ nha.',3000);luu(true);}return r;};
  const khacCu=khachKhac;khachKhac=function(...a){const k=st.khach;if(k?.webKhachHiem&&!k.o&&!k.di&&!k.web45DaGhi){k.web45DaGhi=true;ghi('web_khach_hiem',{ma:k.webKhachHiem,kq:'bo_qua'});}return khacCu(...a);};
  function veSo(){document.getElementById('web45Khach')?.remove();const s=document.createElement('section');s.id='web45Khach';const h=document.createElement('h3');h.textContent='Khách hiếm · '+du().gap.length+'/8';s.append(h);for(const c of khachHiem){const gap=du().gap.includes(c.ma),a=document.createElement('div');a.className='sk'+(gap?'':' chua');const kieu=KIEU[c.hinhKieu||c.kieu]?(c.hinhKieu||c.kieu):'danIT';a.innerHTML=`<svg viewBox="-40 -128 80 132">${veKhach({kieu,dang:KIEU[kieu].nguoi[c.hinhNguoi||0][1]},gap)}</svg>`;const b=document.createElement('b');b.textContent=gap?c.ten+' · '+c.nghe:'Chưa gặp';a.append(b);s.append(a);}const p=document.createElement('p');p.textContent='Gặp đủ tám người: nhận Tranh tám chuyến ghé xóm. Mỗi tháng có 12% cơ hội, nhường tháng có mùa lễ hoặc trùm đã ghé.';s.append(p);document.getElementById('skNoi').append(s);}
  // Nút gốc giữ tham chiếu cũ nên bổ sung listener sau bước vẽ sổ gốc.
  document.getElementById('nutSo').addEventListener('click',veSo);
  window.CuoiGameWeb={nangCap,khachHiem,du,moNangCap,muaNangCap,dayDu,cap,tienTienIch,lich,taoHiem,hoi,veSo};
})();
