// Chỉ ghép vào đầu ra web, trước docLuu(): đăng ký đồ/quà trước khi đọc ván.
function tienWeb35(k) {
  const n=Number(k)||0,tron=Math.round(Math.abs(n)>=1000?n/10:n*100)/100;
  return n===0?'0':(Math.abs(n)>=1000?tron.toLocaleString('vi-VN',{maximumFractionDigits:2})+'tr':n.toLocaleString('vi-VN',{maximumFractionDigits:2})+'k');
}
(() => {
  'use strict';
  if(TRONG_APP)return;
  const coD=true,coE=true;
  const dsTrum=[
    {ma:'coGiao',nghe:'Cô giáo về hưu',ten:'Cô Hạnh',kieu:'veHuu',loi:'“Cô cần đủ năm góc sinh hoạt, gọn gàng thì cô mới thuê nha.”',qua:'Thư cảm ơn của cô giáo'},
    {ma:'anhKien',nghe:'Kiến trúc sư',ten:'Anh Kiên',kieu:'kySu',loi:'“Anh soi kỹ lắm, đủ năm chỗ này mà vẫn vừa túi tiền nhé.”',qua:'Bản vẽ của anh Kiên'},
    {ma:'chiBau',nghe:'Mẹ bầu sắp sinh',ten:'Chị Ngọc',kieu:'voChong',loi:'“Chị sắp sinh rồi, cần năm góc này cho cả nhà.”',qua:'Lời chúc của chị Ngọc'},
    {ma:'sepNho',nghe:'Chủ shop online',ten:'Anh Phong',kieu:'banOnline',loi:'“Shop nhỏ mà việc nhiều, đủ năm góc thì anh chốt.”',qua:'Khung đơn hàng may mắn'},
    {ma:'voChongTre',nghe:'Vợ chồng trẻ',ten:'Tâm & Hạnh',kieu:'voChong',loi:'“Tụi em ở nhà cả ngày, năm góc này thiếu một cũng bất tiện.”',qua:'Tranh tổ ấm mới'},
    {ma:'cuGia',nghe:'Ông đi cùng con cháu',ten:'Ông Sáu',kieu:'veHuu',loi:'“Con cháu lựa giùm ông năm thứ này, vừa giá thì ông ở lâu.”',qua:'Thư tay của ông Sáu'},
  ];
  const cacMa=dsTrum.map(x=>x.ma),quaVang='web35-vang',quaPccc='web35-pccc';
  function du() {
    if(!st)return null;
    if(!st.web35||typeof st.web35!=='object'||Array.isArray(st.web35))st.web35={};
    const d=st.web35;
    if(!Array.isArray(d.trumDat))d.trumDat=[];
    if(!Array.isArray(d.trumGap))d.trumGap=[];
    if(!Array.isArray(d.moc))d.moc=[];
    if(!d.mua||typeof d.mua!=='object')d.mua={};
    if(!d.pccc||typeof d.pccc!=='object')d.pccc={tiep:3+Math.max(0,Math.ceil((st.thang-3)/6))*6};
    if(!Number.isInteger(d.trumTiep))d.trumTiep=0;
    if(d.luotKhachThang==null&&st.phong.some(p=>p.mo&&!p.loai&&p.luot<luotThang()))d.luotKhachThang=st.thang;
    return d;
  }
  const ghi35=(ten,thamSo)=>{try{window.warmJarThongKe?.(ten,thamSo);}catch{}};
  const themQua=(ten,ma,ve)=>TREO.push({ten,gia:0,thue:0,qua:ma,ve})-1;
  const vang=themQua('Bằng khen vàng · Chủ trọ của năm',quaVang,()=>TREO[BANG_LINH].ve().replaceAll(OAK,'#C58B24').replaceAll(KEM,'#FFF0B9').replace('BẰNG KHEN','CHỦ TRỌ CỦA NĂM').replace('font-size="13"','font-size="8"'));
  const quaTrum=dsTrum.map((x,i)=>themQua(x.qua,'web35-'+x.ma,()=>`<rect class="n" x="220" y="-224" width="100" height="90" rx="4" fill="${['#C58B24',OAK,DAT,XANH,OAK,'#C58B24'][i]}"/><rect x="228" y="-216" width="84" height="74" fill="${KEM}"/><path class="m" d="M240,-192h60m-60,12h60m-48,12h36"/><circle class="n" cx="270" cy="-153" r="7" fill="${DAT}"/>`));
  const giay=themQua('Giấy chứng nhận an toàn PCCC',quaPccc,()=>TREO[BANG_LINH].ve().replace('BẰNG KHEN','AN TOÀN PCCC').replaceAll(OAK,DAT));
  const tangQua=ma=>{if(!Array.isArray(st.quaTrangTri))st.quaTrangTri=[];if(st.quaTrangTri.includes(ma))return false;st.quaTrangTri.push(ma);return true;};
  if(coE)DO.binhChuaChay={ten:'Bình chữa cháy',gia:150,thue:0,nhom:'pccc',cau:'Có bình chữa cháy rồi, yên tâm hơn nha.',co:[1,1],ve:v=>`<g data-binh-pccc="${v?.lat?1:0}" transform="scale(${v?.lat?-1:1} 1)"><ellipse class="n" cx="0" cy="0" rx="19" ry="9" fill="${MUC}"/><path class="n" d="M-17,-57Q0,-68 17,-57V-5Q0,8 -17,-5Z" fill="#C8452D"/><ellipse class="n" cx="0" cy="-57" rx="17" ry="7" fill="#E67A55"/><rect class="n" x="-5" y="-76" width="10" height="18" fill="${OAK}"/><path class="m" d="M0,-73L18,-77M5,-70Q34,-73 28,-23"/><rect x="-11" y="-43" width="22" height="24" rx="2" fill="${KEM}"/><path class="m" d="M-5,-29h10m-5,-5v10"/></g>`};
  NHOM.pccc={ten:'có bình chữa cháy',icon:'canhBao'};
  const tienCu=tangDoCu;
  tangDoCu=function(k){if(k==='binhChuaChay'&&!du()?.pccc.daBao)return;const d=Object.getOwnPropertyDescriptor(DO,'binhChuaChay');try{if(!k&&d)Object.defineProperty(DO,'binhChuaChay',{...d,enumerable:false});return tienCu.apply(this,arguments);}finally{if(d)Object.defineProperty(DO,'binhChuaChay',d);}};

  // A: chuỗi viết tay/ván cũ cũng được đổi; vùng mua gói và chuyển khoản giữ đ.
  function doiChu(s){return s.replace(/([+−-]?\d[\d.,]*)\s*đ(?!\p{L})/gu,(_,v)=>tienWeb35(Number(v.replace('−','-').replaceAll('.','').replace(',','.'))/1000));}
  function tienTrongGame() {
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode())){if((n.parentElement?.closest('script,style,.web-bang,[data-goi-khoa]')||(n.parentElement?.closest('#manCH')&&!n.parentElement.closest('#chNoi .nv-chu span'))))continue;const s=doiChu(n.nodeValue);if(s!==n.nodeValue)n.nodeValue=s;}
    document.querySelectorAll('#chNoi [data-goi]').forEach(b=>{if(!b.previousElementSibling?.classList.contains('web35-tien-that')){const p=document.createElement('p');p.className='web35-tien-that';p.textContent='Thanh toán bằng tiền thật';b.before(p);}});
  }
  new MutationObserver(tienTrongGame).observe(document.body,{subtree:true,childList:true,characterData:true});

  // B: thêm lựa chọn vào đúng nhóm cũ; không đổi cửa xác suất 40%.
  const vui=chu=>{diuKhach();noi(chu||'“Cảm ơn anh chị nha!”');};
  const chuyenMoi=[
    ['doiChoDo','xin kê lại giường','“Cho em kê giường gần cửa sổ được không ạ?”','Cho kê lại',k=>{vui();k.con++;},'Giữ nguyên',()=>bucThem('“Dạ, phòng hơi bí…”')],
    ['phongToi','than phòng tối','“Em học mỏi mắt quá, anh chị giúp em cái đèn nha?”','Mua đèn · 120k',()=>{chi(120,'đèn cho khách');vui();},'Khách tự mua',()=>bucThem('“Em tưởng chủ trọ sẽ giúp…”')],
    ['nuoiCa','xin nuôi bể cá','“Em nuôi bể cá nhỏ thôi, em giữ sạch mà!”','Cho nuôi · thu 50k',k=>{doiTien(50);k.web35Ca={den:st.thang+1,ro:Math.random()<.3};},'Không cho',()=>noi('“Dạ, hơi tiếc ghê.”')],
    ['lauChung','rủ nấu lẩu chung','“Cả dãy nấu lẩu ngoài hành lang, anh chị góp vui nha?”','Góp 100k',()=>{chi(100,'bữa lẩu');st.uyTin=(st.uyTin||0)+1;},'Cấm vì sợ cháy',()=>loa('Cả dãy cất bếp, hẹn dịp khác')],
    ['ganKhoa','xin thay ổ khoá','“Em tự trả tiền, cho em thay ổ khoá riêng nha?”','Cho thay',()=>vui(),'Không cho',()=>bucThem('“Em vẫn thấy lo lo…”')],
    ['giuXe','xin gửi xe của bạn','“Bạn em ngủ lại, cho gửi xe một đêm nha?”','Thu 50k',()=>doiTien(50),'Từ chối',()=>noi('“Dạ, để em nhờ chỗ khác.”')],
    ['trongRau','xin trồng rau','“Cho em trồng ít rau ngoài sân nha, có rau em biếu!”','Cho trồng',k=>{k.web35Rau=st.thang+1;vui();},'Không cho',()=>loa('Khách cất chậu, không sao cả')],
    ['treoPoster','xin dán poster','“Em dán poster thần tượng thôi, lúc đi em gỡ sạch!”','Cho dán',()=>vui(),'Không cho',()=>bucThem('“Phòng em mà chẳng được dán…”')],
  ];
  const taoChuyen=(c,k)=>({ma:c[0],icon:c[0]==='lauChung'?'banh':'thu',ten:k.ten+' '+c[1],loi:c[2],a:[c[3],()=>{c[4](k);ghi35('web_sk_khach',{ma:c[0],chon:'a'});luu(true);}],b:[c[5],()=>{c[6](k);ghi35('web_sk_khach',{ma:c[0],chon:'b'});luu(true);}]});
  KHO_DO.push(...chuyenMoi.map(c=>k=>taoChuyen(c,k)));

  // C: thêm thành tích ở cuối; không đổi ID/chỉ số đồ treo trong ván cũ.
  if(coD)THANH_TICH.push({id:'trumWeb35',ten:'Trùm cũng phải chịu',mo:'Chinh phục đủ sáu khách khó tính',thuong:0,dat:()=>du()?.trumDat.filter(x=>cacMa.includes(x)).length===6});
  function tienDo(){const d=du();if(!d)return null;const a=THANH_TICH.filter(t=>st.tt?.includes(t.id)).length,b=Object.keys(KIEU).filter(k=>st.gap?.[k]>0).length;
    const mua=[!!(d.mua.trungThu||st.thang>=12),!!(st.ttDem?.noel||st.thang>=3),!!(st.ttDem?.tet||st.thang>=5)],nha=!!st.phong[NHA]?.mo;
    const raw=25*(a/THANH_TICH.length+b/Object.keys(KIEU).length+mua.filter(Boolean).length/3+Number(nha));return{raw,phanTram:raw===100?100:Math.floor(raw),a,b,mua,nha};}
  const css=document.createElement('style');css.textContent=`#nutMucGan{position:static;width:100%;min-height:44px;font:700 13px 'Be Vietnam Pro';text-align:left;padding:8px!important}#game .tren{grid-template-columns:52px minmax(0,1fr) 44px 68px}#game .tren>.muc-gan{display:contents}#game #nutMucGan{width:68px;height:44px;padding:2px!important;font-size:11px;line-height:1.2;display:flex;flex-direction:column;text-align:center}#nutMucGan span{white-space:nowrap}#nutMucGan>b{display:block!important;font-size:12px}#web35Dem{grid-column:1/-1;grid-row:3}#mucGanChu,#mucGanTien,#ngayThuaKe,.muc-gan>b{display:none!important}#web35Dem{font-size:12px;line-height:1.35;padding:2px 8px 5px}#web35TienDo p{margin:8px 0;font-size:14px;line-height:1.4}.web35-tien-that{font-size:12px;line-height:1.35;margin:6px 0!important}.web35-trum{border:3px solid #C58B24!important}.web35-trum #tenKhach:before{content:'Khách khó tính';display:block;color:#795018;font-size:14px;margin-bottom:8px}#web35Sau{display:grid;grid-template-columns:1fr 1fr;gap:8px}#web35Sau article{border:1px solid #9D8667;border-radius:7px;padding:8px;font-size:12px;line-height:1.4}#web35Sau b{display:block}#manMucGan .tam{max-height:90dvh;overflow:auto}#web35Trum{min-height:44px;width:100%;margin:8px 0}.web35-tien-that+.nut{white-space:normal;text-wrap:balance}.web-hop h2,.web-hop .nut,.web-muc-ung-ho button{text-wrap:balance}`;document.head.append(css);
  const dem=document.createElement('div');dem.id='web35Dem';dem.hidden=true;$('#nutMucGan').after(dem);
  const bang=document.createElement('div');bang.id='web35TienDo';$('#mucGanDayDu').after(bang);
  const trumNut=document.createElement('button');trumNut.id='web35Trum';trumNut.className='nut nhe';trumNut.textContent='Khách khó tính · xem 6 món quà';bang.after(trumNut);
  const sau=document.createElement('div');sau.id='web35Sau';sau.hidden=true;trumNut.after(sau);trumNut.onclick=()=>{sau.hidden=!sau.hidden;cap();};
  function hienBang(p){bang.innerHTML=`<p><b>Dãy trọ hoàn thành ${p.phanTram}%</b></p><p>Thành tích: ${p.a}/${THANH_TICH.length} · còn ${THANH_TICH.length-p.a}</p><p>Kiểu khách: ${p.b}/${Object.keys(KIEU).length} · còn ${Object.keys(KIEU).length-p.b} kiểu chưa gặp</p><p>Mùa lễ: ${p.mua.filter(Boolean).length}/3 · ${['Trung thu','Noel','Tết'].filter((_,i)=>!p.mua[i]).join(', ')||'đã qua đủ'}</p><p>Căn hộ: ${p.nha?'đã mua':'chưa mua'}</p>`;sau.innerHTML=dsTrum.map(x=>`<article><b>${x.ten}</b>${du().trumDat.includes(x.ma)?'Đã chinh phục':du().trumGap.includes(x.ma)?'Đã gặp · chưa chinh phục':'Chưa gặp'}<br>${x.qua}</article>`).join('');}
  let dangCap=false;
  function cap(){if(!st||dangCap)return;dangCap=true;try{const p=tienDo(),d=du();$('#nutMucGan').innerHTML='<span>Mục tiêu</span><b>'+p.phanTram+'%</b>';$('#nutMucGan').setAttribute('aria-label','Mục tiêu · Dãy trọ hoàn thành '+p.phanTram+'%');hienBang(p);let moi=false;for(const moc of [25,50,75,100])if(p.raw>=moc&&!d.moc.includes(moc)){d.moc.push(moc);ghi35('web_hoan_thanh',{moc});loa('Dãy trọ đã hoàn thành '+moc+'%!');moi=true;}if(p.raw>=100&&tangQua(quaVang)){loa('Nhận bằng khen vàng · Chủ trọ của năm');moi=true;}
    const pc=d.pccc,phong=st.phong.filter(p=>p.mo&&!p.mb&&!p.loai&&p.khach?.o),co=phong.filter(p=>p.dat.some(v=>v.k==='binhChuaChay')).length;dem.hidden=pc.han==null;if(!dem.hidden)dem.textContent='Kiểm tra PCCC: '+(pc.han>st.thang?'còn '+(pc.han-st.thang)+' tháng':'đến hạn tháng này')+' · '+co+'/'+phong.length+' phòng có bình';if(moi)luu(true);tienTrongGame();}finally{dangCap=false;}}
  const veCu=veHet;veHet=function(...a){const r=veCu(...a);cap();return r;};
  const thanhCu=veThanhTren;veThanhTren=function(...a){const r=thanhCu(...a);cap();return r;};
  const tiemCu=veTiem;veTiem=function(...a){const r=tiemCu(...a);if(!du()?.pccc.daBao)document.querySelector('.the[data-k="binhChuaChay"]')?.remove();return r;};
  $('#nutMucGan').addEventListener('click',cap);

  // D: chốt lượt đầu toàn dãy và vòng sáu tên nằm trong ván lưu.
  let dangTao=null;
  function taoTrum(c,k){const K=KIEU[k.kieu],nhom=[...new Set([...K.can,'ngu','nuoc','mat','ngoi','cay','cat','hoc','phoi'])].filter(n=>Object.values(DO).some(d=>d.nhom===n&&!d.goi&&!d.tiem&&!d.tra));k.can=nhom.slice(0,5);k.ten=c.ten;k.web35Trum=c.ma;k.daMac=true;
    const re=n=>Math.min(...Object.values(DO).filter(d=>d.nhom===n&&!d.goi&&!d.tiem&&!d.tra).map(d=>d.thue));const phong=st.phong[st.o],coDinh=giaPhong()-phong.dat.reduce((s,v)=>s+DO[v.k].thue,0);k.web35Re=coDinh+k.can.reduce((s,n)=>s+re(n),0);k.tran=k.web35Re+50+(cacMa.indexOf(c.ma)%2)*50;return k;}
  const taoCu=taoKhach;taoKhach=function(...a){if(!dangTao)return taoCu(...a);const c=dangTao,k=taoCu(KIEU[c.kieu]?c.kieu:'veHuu');return taoTrum(c,k);};
  const denCu=khachDen;khachDen=function(...a){if(!st||!coD)return denCu(...a);const d=du(),p=st.phong[st.o],duoc=p.mo&&!document.querySelector('.phu.hien')&&!st.dem&&st.luot>0&&!st.khach&&!st.rac.length&&!p.loai&&!p.mb;
    if(duoc&&st.thang>=5&&d.luotKhachThang!==st.thang){dangTao=dsTrum[d.trumTiep%6];}
    try{const r=denCu(...a);if(duoc&&st.khach){d.luotKhachThang=st.thang;if(st.khach.web35Trum){d.trumTiep=(d.trumTiep+1)%6;if(!d.trumGap.includes(st.khach.web35Trum))d.trumGap.push(st.khach.web35Trum);$('#manKhach .tam').classList.add('web35-trum');$('#tenKhach').textContent=st.khach.ten+' · '+dsTrum.find(x=>x.ma===st.khach.web35Trum).nghe;}else $('#manKhach .tam').classList.remove('web35-trum');luu(true);}return r;}finally{dangTao=null;}};
  const hoiCu=cauHoi;
  // cauHoi là const của game nguồn; đầu ra web gọi hàm này qua một nhánh !TRONG_APP.
  function hoiTrum(k){return dsTrum.find(x=>x.ma===k.web35Trum).loi.replace(/[“”]/g,'')+' Cần '+k.can.map(n=>NHOM[n].ten).join(', ')+' · tối đa '+tienWeb35(k.tran)+'.';}
  const khacCu=khachKhac;khachKhac=function(...a){const k=st.khach;if(k?.web35Trum&&!k.o&&!k.di)ghi35('web_khach_trum',{ma:k.web35Trum,kq:'bo_qua'});return khacCu(...a);};
  // Trùm mới ở một tháng; lưu hạn riêng để sự kiện không kéo dài thêm. Ván cũ thiếu hạn giữ nguyên.
  const thueCu=choThueThat;choThueThat=function(...a){const k=st.khach,chua=k&&!k.o,r=thueCu(...a);if(chua&&k.o&&k.web35Trum){k.con=0;k.web35TraPhong=st.thang+1;const d=du();ghi35('web_khach_trum',{ma:k.web35Trum,kq:'thue'});if(!d.trumDat.includes(k.web35Trum)){d.trumDat.push(k.web35Trum);st.uyTin=(st.uyTin||0)+1;tangQua('web35-'+k.web35Trum);doiTien(50,'Tiền cảm ơn khách khó tính');kiemThanhTich();luu(true);cap();}veHet();}return r;};

  // E: báo riêng trước cửa40%, xét hạn đúng một lần khi kết thúc tháng.
  const skCu=suKienThang;suKienThang=function(...a){if(!coE)return skCu(...a);const pc=du().pccc;if(st.thang>=pc.tiep){pc.daBao=true;pc.han=st.thang+2;pc.tiep=st.thang+6;st.skThang=st.thang;luu(true);xepHang(()=>taiHoa({ma:'web35BaoPccc',icon:'canhBao',ten:'Phường báo kiểm tra phòng cháy',loi:'Phường báo: 2 tháng nữa kiểm tra phòng cháy chữa cháy. Phòng nào đang cho thuê cũng phải có bình chữa cháy.',a:['Biết rồi',()=>{veTiem();cap();}]}));veTiem();cap();return;}return skCu(...a);};
  function kiemPccc(){if(!coE)return null;const pc=du().pccc;if(pc.han==null||st.thang<pc.han)return null;const phong=st.phong.map((p,i)=>({p,i})).filter(({p})=>p.mo&&!p.mb&&!p.loai&&p.khach?.o),thieu=phong.filter(({p})=>!p.dat.some(v=>v.k==='binhChuaChay'));pc.han=null;const n=thieu.length;let phat=0;
    if(n){phat=Math.min(1000,n*200,Math.max(0,st.tien));chi(phat,'phạt thiếu bình chữa cháy');for(const {p} of thieu){p.khach.buc=(p.khach.buc||0)+1;if(p.khach.buc>=2)p.khach.con=0;}}
    else if(phong.length){st.uyTin=(st.uyTin||0)+1;tangQua(quaPccc);}
    ghi35('web_pccc',{kq:n?'thieu':'dat',thieu:n});luu(true);cap();return{thieu:n,phong:phong.length,phat};}
  const hetCu=hetThang;hetThang=function(...a){const truoc=st.dem,r=hetCu(...a);if(!truoc&&st.dem){const d=du();if(thangSo(st.thang)===9)d.mua.trungThu=true;const pc=kiemPccc();if(pc)loa(pc.thieu?'PCCC: thiếu '+pc.thieu+' phòng · phạt '+tienWeb35(pc.phat):pc.phong?'PCCC đạt · nhận giấy chứng nhận':'PCCC: chưa có phòng cho thuê · không thưởng');cap();}return r;};
  const sangCu=sangThang;sangThang=function(...a){const thang=st.thang+1;for(const k of dangO()){if(k.web35Trum&&Number.isInteger(k.web35TraPhong)&&thang>=k.web35TraPhong)k.con=0;if(k.web35Rau!=null&&k.web35Rau<=thang){delete k.web35Rau;doiTien(50,'Khách biếu rau');}if(k.web35Ca?.den<=thang){const ro=k.web35Ca.ro;delete k.web35Ca;if(ro)chi(100,'bể cá rò nước');}}return sangCu(...a);};
  window.Web35={tien:tienWeb35,doiChu,du,tienDo,cap,dsTrum,taoTrum,taoChuyen:(ma,k=st.khach)=>taoChuyen(chuyenMoi.find(c=>c[0]===ma),k),chuyen:chuyenMoi.map(c=>c[0]),vang,giay,quaTrum,hoiTrum,kiemPccc};
})();
