// Ghép riêng vào website bằng tools/dong-goi-web.mjs, không sửa nguồn/app.
(() => {
  if (window.ReactNativeWebView) return;
  const W=window.DayTroWeb, K_DAY='day-tro-web-day-du', K_DON='day-tro-web-don', K_LAN='day-tro-web-lan', K_MAY='day-tro-web-ma-may';
  const doc=(k,mac=null)=>{try{return JSON.parse(localStorage.getItem(k))??mac;}catch{return mac;}};
  const luuWeb=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));};
  const dayDu=()=>!!doc(K_DAY);
  function maMay() {
    let ma=doc(K_MAY);
    if(typeof ma!=='string'||!/^[0-9a-f]{32}$/.test(ma)){
      ma=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');luuWeb(K_MAY,ma);
    }
    return ma;
  }
  const ten=id=>id==='web_day_du'?'Mở bản đầy đủ trên web':GOI_INFO[id]?.ten.trim();
  let daDoHetBanThu=false;
  function doWeb(ten,thamSo={}) {
    try {window.warmJarThongKe?.(ten,thamSo);} catch { /* Đo lỗi vẫn cho chơi/mua. */ }
  }
  function bamMua(goi) {doWeb('web_bam_mua',{goi});return mua(goi);}
  let cauHinh={}, nganHang=null, hen=null, luot=0, dangNhap=false, loiTaiCauHinh=false;
  const taiJSON=async u=>{const r=await fetch(u,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Chưa kết nối được');return r.json();};
  const sanSang=Promise.all([
    taiJSON('cau-hinh-web.json').then(x=>{cauHinh=x;},()=>{loiTaiCauHinh=true;}),
    taiJSON('ngan-hang.json').then(x=>{if(W.nganHangDung(x))nganHang=x;})
  ]).catch(()=>{});
  const css=document.createElement('style');
  css.textContent=`.web-bang{position:fixed;inset:0;z-index:100000;background:#281e14b8;display:flex;overflow:auto;padding:16px;overscroll-behavior:contain}.web-hop{margin:auto;flex:none;width:100%;max-width:380px;padding:20px;background:#fff8ee;color:#3b2f25;border-radius:18px;font:15px/1.5 'Be Vietnam Pro',sans-serif;box-sizing:border-box}.web-hop h2{font:700 23px 'Mali',sans-serif;margin:0 0 12px}.web-hop button,.web-hop a{min-height:44px;box-sizing:border-box}.web-hop .nut{display:block;width:100%;margin:12px 0;white-space:normal}.web-hop input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #96785f;border-radius:8px;font:inherit;margin:6px 0}.web-qr{padding:20px;background:white;width:max-content;max-width:100%;margin:12px auto}.web-qr img,.web-qr canvas{max-width:100%;height:auto}.web-ma{font:700 24px monospace;overflow-wrap:anywhere}.web-hop .lai{display:block;margin:8px auto;padding:10px}.web-hop p{margin:8px 0}.web-hop [role=status]{min-height:24px}`;
  document.head.append(css);
  css.textContent+=`.web-tu-dong{padding:16px}.web-tu-dong h2{font-size:20px;line-height:1.3;margin-bottom:8px}.web-tu-dong p{margin:4px 0;line-height:1.35;font-size:14px}.web-tu-dong .web-qr{padding:10px;margin:8px auto}.web-tu-dong .web-nhan{font-size:12px}.web-tu-dong .web-ma{font-size:22px;margin-top:8px}.web-tu-dong .web-ghichu{font-size:12px}.web-tu-dong .lai{margin:0 auto;padding:8px}.web-vande summary{font-size:13px;text-decoration:underline;cursor:pointer;min-height:24px;text-align:center}.web-vande[open]{margin-top:12px}.web-vande[open] summary{margin-bottom:10px}.web-hop .web-loi{color:#8b3229}`;
  function dong() {clearTimeout(hen);luot++;document.querySelector('.web-bang')?.remove();}
  function bang(tieuDe) {
    dong();const lop=document.createElement('div');lop.className='web-bang';lop.setAttribute('role','dialog');lop.setAttribute('aria-modal','true');lop.setAttribute('aria-label',tieuDe);
    const hop=document.createElement('div');hop.className='web-hop';lop.append(hop);
    const h=document.createElement('h2');h.textContent=tieuDe;hop.append(h);document.body.append(lop);
    return hop;
  }
  function chu(h,noiDung,lop='') {const p=document.createElement('p');p.textContent=noiDung;p.className=lop;h.append(p);return p;}
  function nut(h,nhan,fn,lop='nut') {const b=document.createElement('button');b.type='button';b.className=lop;b.textContent=nhan;b.onclick=fn;h.append(b);return b;}
  function lienKet(h,nhan,url) {try{if(new URL(url).protocol!=='https:')return;}catch{return;}const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=nhan;a.className='nut';h.append(a);}
  function dongNut(h) {nut(h,'Đóng, xem dãy trọ',()=>{dong();tiepHang();},'lai');}
  function hienQR(h,n,tien,nd,gon=false) {
    if(!W.nganHangDung(n)){chu(h,'Đang cập nhật cách ủng hộ');return;}
    const q=document.createElement('div');q.className='web-qr';h.append(q);
    new QRCode(q,{text:W.vietQR(n,tien,nd),width:gon?176:220,height:gon?176:220,correctLevel:QRCode.CorrectLevel.M});
    q.removeAttribute('title');
    chu(h,n.ten+' · '+(n.bin==='970418'?'BIDV':'Ngân hàng '+n.bin)+' · '+n.soTk,'web-nhan');
    if(!gon)chu(h,'Tài khoản nhận của người làm game Warm Jar');
    if(tien)chu(h,tien.toLocaleString('vi-VN')+'đ');chu(h,'Nội dung: '+nd+(gon?' · giữ nguyên, đừng sửa':''));
  }
  function moQuyen(goi,bangChung,cach,hop=null) {
    if(!Object.hasOwn(W.GIA,goi))throw Error('Gói không hợp lệ');
    if(goi!=='web_day_du'&&!dayDu())throw Error('Bạn cần mở bản đầy đủ trước nhé');
    const daCo=goi==='web_day_du'?dayDu():coGoi(goi);
    if(goi==='web_day_du')luuWeb(K_DAY,bangChung);
    else {const ds=new Set([...GOI,goi]);localStorage.setItem(KHOA_GOI,JSON.stringify([...ds]));GOI=ds;nhanGoi();if(st)luu();}
    if(doc(K_DON)?.goi===goi)localStorage.removeItem(K_DON);
    if(!daCo)doWeb('web_mo_khoa',{goi,cach});
    document.getElementById('hetBanThu')?.remove();
    if(hop?.isConnected){clearTimeout(hen);luot++;hop.querySelector('[data-trang-thai]').textContent='Đã nhận, cảm ơn bạn!';}
    else {const h=bang('Đã nhận, cảm ơn bạn!');chu(h,'Đã mở '+ten(goi)+'. Ván đang chơi vẫn được giữ nguyên.');dongNut(h);}
    if(document.getElementById('manCH').classList.contains('hien'))moCuaHang();
  }
  async function nhapMa(goi,ma) {
    if(dangNhap)throw Error('Đang kiểm mã…');
    const lan=doc(K_LAN,[]).filter(t=>Date.now()-t<60000);
    if(lan.length>=5)throw Error('Bạn thử lại sau một phút nhé');
    lan.push(Date.now());luuWeb(K_LAN,lan);dangNhap=true;
    try {
      if(!new RegExp('^['+W.CHU+']{8}$').test(ma.trim().toUpperCase()))throw Error('Mã chưa đúng, bạn kiểm tra lại nhé');
      const bam=await W.bamMa(ma),ds=await taiJSON('ma-web.json');
      if(!ds.some(x=>x.bam===bam&&x.goi===goi))throw Error('Mã chưa đúng gói hoặc đã được thu hồi');
      moQuyen(goi,{maTay:ma.trim().toUpperCase()},'ma_tay');
    } finally {dangNhap=false;}
  }
  function oNhap(h,nhan,fn) {
    const o=document.createElement('input');o.setAttribute('aria-label',nhan);o.placeholder=nhan;o.autocomplete='off';o.maxLength=32;h.append(o);
    const bao=chu(h,'');bao.setAttribute('role','status');
    nut(h,nhan,async()=>{bao.textContent='';try{await fn(o.value);}catch(e){bao.textContent=e.message;}});
  }
  async function api(duong,than) {
    const loiKetNoi=()=>Object.assign(Error('Chưa kết nối được máy chủ. Nếu đã chuyển, đừng chuyển lại nhé.'),{ketNoi:true});
    await sanSang;
    if(loiTaiCauHinh)throw loiKetNoi();
    const url=new URL(cauHinh.mayChu);
    if(url.protocol!=='https:'||url.pathname!=='/'||url.username||url.password)throw Error('Chưa bật mua tự động');
    let r;try{r=await fetch(url.origin+duong,{method:than?'POST':'GET',headers:than?{'Content-Type':'application/json'}:{},body:than?JSON.stringify(than):undefined,cache:'no-store',signal:AbortSignal.timeout(10000)});}catch{throw loiKetNoi();}
    if(r.status>=500)throw loiKetNoi();
    let d;try{d=await r.json();}catch{if(r.ok)throw Error('Máy chủ trả dữ liệu chưa hợp lệ. Bạn thử lại hoặc nhắn Warm Jar nhé.');d={};}
    if(!r.ok){
      const loi=d?.loi;
      const chu=r.status===404?'Không tìm thấy mã đơn, bạn kiểm tra lại từng chữ nhé':loi==='du_may'?'Mã này đã dùng đủ 3 máy. Đổi điện thoại thì nhắn Warm Jar nhé':loi==='chua_tra'?'Đơn chưa được xác nhận. Nếu đã chuyển, nhắn mã đơn cho Warm Jar nhé.':r.status===429?'Bạn thử lại sau một phút nhé':'Chưa thực hiện được. Bạn kiểm tra lại hoặc nhắn Warm Jar nhé.';
      throw Object.assign(Error(chu),{ma:loi,status:r.status});
    }
    return d;
  }
  async function khoiPhuc(ma) {
    ma=ma.trim().toUpperCase();if(!/^DT[A-HJ-NP-Z2-9]{6}$/.test(ma))throw Error('Mã đơn chưa đúng');
    const d=await api('/api/don/'+ma+'/khoi-phuc',{maMay:maMay()});
    if(!d.daTra)throw Error('Đơn chưa được xác nhận. Nếu đã chuyển, nhắn mã đơn cho Warm Jar nhé.');
    moQuyen(d.goi,{maDayDu:ma},'khoi_phuc');
  }
  function duPhong(h,goi,maCu,huongDan=true) {
    if(huongDan)chu(h,'Chuyển xong nhắn mã đơn cho Warm Jar qua FB/Zalo để nhận mã mở gói. Nếu đã chuyển, đừng chuyển lại.');
    if(maCu)chu(h,maCu,'web-ma');
    lienKet(h,'Liên hệ Warm Jar',cauHinh.lienHe);
    oNhap(h,'Nhập mã mở gói',ma=>nhapMa(goi,ma));
    oNhap(h,'Khôi phục bằng mã đơn',khoiPhuc);
  }
  function gapVanDe(h,goi,coDon=true) {
    const g=document.createElement('details');g.className='web-vande';
    const s=document.createElement('summary');s.textContent='Gặp vấn đề?';g.append(s);h.append(g);
    duPhong(g,goi,null,false);
    if(coDon)nut(g,'Tạo đơn mới (chỉ khi chưa chuyển)',()=>{if(confirm('Chỉ tạo đơn mới nếu bạn chưa chuyển tiền cho đơn cũ. Tiếp tục?')){localStorage.removeItem(K_DON);mua(goi);}},'lai');
    return g;
  }
  function hienMaTay(h,goi,ma,n,loi='') {
    h.classList.remove('web-tu-dong');h.replaceChildren(h.firstChild);
    if(loi)chu(h,loi,'web-loi');
    chu(h,'Nhận mã từ Warm Jar');hienQR(h,n,W.GIA[goi],ma);duPhong(h,goi,ma);dongNut(h);
  }
  async function choDon(d,h,phien,bao) {
    if(phien!==luot)return;
    const hoi=async()=>{
      if(phien!==luot)return;
      try {
        const k=await api('/api/don/'+d.ma);
        if(phien!==luot)return;
        if(k.daTra){
          const quyen=await api('/api/don/'+d.ma+'/khoi-phuc',{maMay:maMay()});if(phien!==luot)return;
          if(!quyen.daTra||quyen.goi!==d.goi)throw Error('Chưa xác nhận được quyền mở gói');
          moQuyen(quyen.goi,{maDayDu:d.ma},'tu_dong',h);return;
        }
        if(k.hetHan||Date.now()>=d.hetHan){bao.textContent='Đơn đã hết hạn. Nếu đã chuyển, nhắn mã đơn để Warm Jar kiểm tra.';return;}
        hen=setTimeout(hoi,4000);
      }catch(e){if(phien!==luot)return;if(e.ketNoi)hienMaTay(h,d.goi,d.ma,d.nganHang,e.message);else {bao.textContent=e.message;bao.classList.add('web-loi');}}
    };await hoi();
  }
  async function mua(goi) {
    if(!Object.hasOwn(W.GIA,goi))return;
    if(goi!=='web_day_du'&&!dayDu())goi='web_day_du';
    const h=bang(ten(goi)),phien=luot;chu(h,'Đang chuẩn bị…');await sanSang;if(phien!==luot)return;
    h.lastChild.remove();
    const cu=doc(K_DON);
    let d;
    try {
      if(cu&&cu.goi!==goi&&Date.now()<cu.hetHan){chu(h,'Bạn đang có đơn '+cu.ma+'. Kiểm tra đơn này trước khi mua thêm nhé.');nut(h,'Xem đơn đang chờ',()=>mua(cu.goi));dongNut(h);return;}
      d=cu&&cu.goi===goi ? cu : await api('/api/don',{goi,...(doc(K_DAY,{})||{}),maMay:maMay()});
      if(phien!==luot)return;
      if(d.goi!==goi||d.soTien!==W.GIA[goi]||!/^DT[A-HJ-NP-Z2-9]{6}$/.test(d.ma)||!Number.isFinite(d.hetHan))throw Error('Đơn không hợp lệ');
      if(!(cu&&cu.goi===goi))doWeb('web_tao_don',{goi});
      luuWeb(K_DON,d);
      h.classList.add('web-tu-dong');h.firstChild.textContent=ten(goi)+' · '+d.soTien.toLocaleString('vi-VN')+'đ';
      if(Date.now()<d.hetHan)hienQR(h,d.nganHang,d.soTien,d.noiDung,true);
      else chu(h,'Đơn cũ hết hạn; kiểm tra trước khi tạo đơn mới.');
      const bao=chu(h,'Đang chờ tiền về… game tự mở sau vài giây');bao.setAttribute('role','status');bao.dataset.trangThai='';
      chu(h,d.ma,'web-ma');chu(h,'Chụp lại để khôi phục khi đổi máy','web-ghichu');
      dongNut(h);gapVanDe(h,goi);await choDon(d,h,phien,bao);
    } catch(e) {
      if(phien!==luot)return;
      // Nếu đơn cũ tồn tại, dùng lại mã để không làm người đã chuyển trả lần nữa.
      const ma=cu?.goi===goi?cu.ma:'DT '+({web_day_du:'DAYDU',goi_tet:'TET',goi_noel:'NOEL',meo_cung:'MEO',khoi_nghiep:'KN'}[goi])+' '+W.taoMa(4);
      if(e.status&&!e.ketNoi){chu(h,e.message,'web-loi');dongNut(h);gapVanDe(h,goi,false);}
      else hienMaTay(h,goi,ma,cu?.goi===goi?cu.nganHang:nganHang,e.ketNoi?e.message:'');
    }
  }
  function hetBanThu() {
    if(dayDu())return;
    if(!daDoHetBanThu){daDoHetBanThu=true;doWeb('het_ban_thu');}
    const h=bang('Hết bản chơi thử rồi!');h.parentNode.id='hetBanThu';
    chu(h,'Bạn đã giữ dãy trọ của bà qua 3 tháng đầu. Mở bản đầy đủ trên web để chơi tiếp ván này. Các gói trang trí mua riêng.');
    nut(h,'Mở bản đầy đủ · 19.000đ',()=>bamMua('web_day_du'));
    lienKet(h,'Vào nhóm Xóm Trọ','https://www.facebook.com/groups/xomtrowarmjar');
    nut(h,'Chơi lại từ đầu',()=>{if(confirm('Chơi lại sẽ xoá ván hiện tại. Bạn chắc chứ?')){localStorage.removeItem('day-tro-cua-toi-v2');location.reload();}},'lai');dongNut(h);
  }
  window.moHetBanThu=hetBanThu;
  const hetCu=hetThang;
  hetThang=function(...a){if(st?.thang>=3&&!dayDu()){hetBanThu();return;}return hetCu(...a);};
  // Nguồn website cũ chặn ở đầu hetThang khi thang >= 3; giữ nguyên mốc đó.
  const cuaHangCu=moCuaHang;
  moCuaHang=function(){
    if(!dayDu()){mua('web_day_du');return;}
    cuaHangCu();
    document.querySelector('#chNoi [data-hinh-goi="khong_quang_cao"]')?.closest('.nv').remove();
    document.querySelectorAll('#chNoi [data-goi]').forEach(b=>{b.disabled=false;b.textContent='Mở bằng mã · '+W.GIA[b.dataset.goi].toLocaleString('vi-VN')+'đ';});
  };
  document.getElementById('nutCH').addEventListener('click',e=>{e.stopImmediatePropagation();if(!dayDu())bamMua('web_day_du');else moCuaHang();},true);
  document.getElementById('chNoi').addEventListener('click',e=>{const b=e.target.closest('[data-goi]');if(b){e.stopImmediatePropagation();bamMua(b.dataset.goi);}},true);
  const caiDat=document.getElementById('cdXong').parentNode;
  const ungHo=nut(caiDat,'Ủng hộ Warm Jar',async()=>{doWeb('web_ung_ho_mo');const h=bang('Ủng hộ Warm Jar');const p=luot;await sanSang;if(p!==luot)return;chu(h,'Thích game thì mời mình ly trà sữa nha. Không bắt buộc, chơi game là vui rồi.');hienQR(h,nganHang,null,'UNG HO WARMJAR');if(cauHinh.kofi)lienKet(h,'Ủng hộ qua Ko-fi',cauHinh.kofi);dongNut(h);},'lai');
  ungHo.innerHTML=bieuTuong('qua')+'<span>Ủng hộ Warm Jar</span>';
  nut(caiDat,'Khôi phục bản web / mã đã mua',()=>{const h=bang('Khôi phục bản web');oNhap(h,'Khôi phục bằng mã đơn',khoiPhuc);oNhap(h,'Nhập mã mở bản đầy đủ',ma=>nhapMa('web_day_du',ma));dongNut(h);},'lai');
  let yen=0,daHien=false;
  setInterval(()=>{if(dayDu()||daHien||document.querySelector('.web-bang'))return;yen=st?.thang>=3&&!document.querySelector('.phu.hien:not(#moDau)')?yen+1:0;if(yen>=3){daHien=true;hetBanThu();}},1000);
  sanSang.then(()=>{const d=doc(K_DON);if(d) void mua(d.goi);});
})();
