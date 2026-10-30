// Ghép riêng vào website bằng tools/dong-goi-web.mjs, không sửa nguồn/app.
(() => {
  if (window.ReactNativeWebView) return;
  const W=window.DayTroWeb, K_DAY='day-tro-web-day-du', K_DON='day-tro-web-don', K_LAN='day-tro-web-lan', K_MAY='day-tro-web-ma-may';
  const doc=(k,mac=null)=>{try{return JSON.parse(localStorage.getItem(k))??mac;}catch{return mac;}};
  const luuWeb=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));};
  const dayDu=()=>!!doc(K_DAY);
  const quyTac=window.DotWeb, khoaNhom='day-tro-ab-mn', khoaLuot='day-tro-ab-luot';
  let nhomDaChon='A';
  if(quyTac){
    try{
      const cu=localStorage.getItem(khoaNhom);
      nhomDaChon=quyTac.nhom(cu,!!docLuu(),crypto.getRandomValues(new Uint32Array(1))[0]/4294967296);
      localStorage.setItem(khoaNhom,nhomDaChon);
    }catch{nhomDaChon='A';}
  }
  const nhomHienTai=()=>quyTac?.nhomBat(nhomDaChon,cauHinh.abMoiNgay)||'A';
  function luotNgay(dung=false){
    const k=quyTac.luot(doc(khoaLuot,{}),quyTac.ngay(),dung);
    try{luuWeb(khoaLuot,k.luu);}catch{return false;}
    return k.con;
  }
  const maMayDung=ma=>typeof ma==='string'&&/^[0-9a-f]{32}$/.test(ma);
  function mayTrongDB(ma) {
    return new Promise(xong=>{
      let db,daXong=false;
      const tra=k=>{if(daXong)return;daXong=true;clearTimeout(henDB);db?.close();xong(k);};
      const henDB=setTimeout(()=>tra(null),1500);
      try {
        const mo=indexedDB.open('day-tro-web-may',1);
        mo.onupgradeneeded=()=>{if(!mo.result.objectStoreNames.contains('may'))mo.result.createObjectStore('may');};
        mo.onerror=mo.onblocked=()=>tra(null);
        mo.onsuccess=()=>{
          db=mo.result;if(daXong){db.close();return;}
          db.onversionchange=()=>db.close();
          try{
            const gd=db.transaction('may',ma?'readwrite':'readonly'),kho=gd.objectStore('may');
            const yc=ma?kho.put(ma,K_MAY):kho.get(K_MAY);
            gd.oncomplete=()=>tra(ma||yc.result);gd.onerror=gd.onabort=()=>tra(null);
          }catch{tra(null);}
        };
      }catch{tra(null);}
    });
  }
  let mayDaDoc;
  function maMay() {
    // Chia sẻ cùng lời hẹn để hai thao tác mua/khôi phục không tạo hai mã.
    return mayDaDoc??= (async()=>{
      let ma=doc(K_MAY);
      if(!maMayDung(ma))ma=await mayTrongDB();
      if(!maMayDung(ma))try{ma=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(K_MAY+'='))?.slice(K_MAY.length+1);}catch{}
      if(!maMayDung(ma))ma=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
      try{luuWeb(K_MAY,ma);}catch{}
      try{document.cookie=K_MAY+'='+ma+'; Max-Age=34560000; Path=/daytro/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');}catch{}
      await mayTrongDB(ma);
      return ma;
    })();
  }
  const ten=id=>id==='combo_tet'?'Bản đầy đủ + Gói Tết':id==='web_day_du'?'Mở bản đầy đủ trên web':GOI_INFO[id]?.ten.trim();
  let daDoHetBanThu=false;
  function doWeb(ten,thamSo={}) {
    try {window.warmJarThongKe?.(ten,{...thamSo,ab_mn:nhomHienTai()});} catch { /* Đo lỗi vẫn cho chơi/mua. */ }
  }
  function bamMua(goi) {doWeb('web_bam_mua',{goi});return mua(goi);}
  let cauHinh={}, nganHang=null, hen=null, luot=0, dangNhap=false, loiTaiCauHinh=false, dungHoiDon=null;
  const taiJSON=async u=>{const r=await fetch(u,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Chưa kết nối được');return r.json();};
  const sanSang=Promise.all([
    taiJSON('cau-hinh-web.json').then(x=>{cauHinh=x;},()=>{loiTaiCauHinh=true;}),
    taiJSON('ngan-hang.json').then(x=>{if(W.nganHangDung(x))nganHang=x;})
  ]).catch(()=>{});
  W.sanSang=sanSang;
  W.nhomMoiNgay=nhomHienTai;
  // #47: ván mang từ trình duyệt khác đem theo nhóm A/B; ghi lại để người chơi không đổi nhóm.
  W.datNhomMoiNgay=n=>{if(!quyTac||!['A','B'].includes(n))return;nhomDaChon=n;try{localStorage.setItem(khoaNhom,n);}catch{}try{window.warmJarNhomAB?.(n);}catch{}};
  if(quyTac)try{window.warmJarNhomAB?.(nhomDaChon);}catch{}
  const css=document.createElement('style');
  css.textContent=`.web-bang{position:fixed;inset:0;z-index:100000;background:#281e14b8;display:flex;overflow:auto;padding:16px;overscroll-behavior:contain}.web-hop{margin:auto;flex:none;width:100%;max-width:380px;padding:20px;background:#fff8ee;color:#3b2f25;border-radius:18px;font:15px/1.5 'Be Vietnam Pro',sans-serif;box-sizing:border-box}.web-hop h2{font:700 23px 'Mali',sans-serif;margin:0 0 12px}.web-hop button,.web-hop a{min-height:44px;box-sizing:border-box}.web-hop .nut{display:block;width:100%;margin:12px 0;white-space:normal}.web-hop input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #96785f;border-radius:8px;font:inherit;margin:6px 0}.web-qr{padding:20px;background:white;width:max-content;max-width:100%;margin:12px auto}.web-qr img,.web-qr canvas{max-width:100%;height:auto}.web-ma{font:700 24px monospace;overflow-wrap:anywhere}.web-hop .lai{display:block;margin:8px auto;padding:10px}.web-hop p{margin:8px 0}.web-hop [role=status]{min-height:24px}`;
  document.head.append(css);
  css.textContent+=`.web-tu-dong{padding:16px}.web-tu-dong h2{font-size:20px;line-height:1.3;margin-bottom:8px}.web-tu-dong p{margin:4px 0;line-height:1.35;font-size:14px}.web-tu-dong .web-qr{padding:10px;margin:8px auto}.web-tu-dong .web-nhan{font-size:12px}.web-tu-dong .web-ma{font-size:22px;margin-top:8px}.web-tu-dong .web-ghichu{font-size:12px}.web-tu-dong .lai{margin:0 auto;padding:8px}.web-vande summary{font-size:13px;text-decoration:underline;cursor:pointer;min-height:24px;text-align:center}.web-vande[open]{margin-top:12px}.web-vande[open] summary{margin-bottom:10px}.web-hop .web-loi{color:#8b3229}`;
  css.textContent+=`.web-combo{border:1px dashed #96785f;padding:10px;margin:12px 0;text-align:center}.web-combo .tem-goi{display:block;width:90px;height:70px;margin:auto}.web-combo .nut{white-space:normal;line-height:1.4;margin:8px 0}.web-hop .web-ghichu{font-size:12px;text-align:center}.web-combo p{font-size:12px}`;
  css.textContent+=`.web-goi-card{border:1px solid #b99b80;border-radius:12px;padding:12px;margin:12px 0}.web-goi-card header{display:flex;align-items:center;gap:12px}.web-goi-card .tem-goi{flex:none;width:76px;height:76px}.web-goi-card h4{font-size:16px;margin:0}.web-goi-card p{font-size:13px;line-height:1.5}.web-goi-card .nut{font-size:13px}.web-con-cho{background:#f8efdf;border-radius:12px;padding:12px;margin:12px 0}.web-con-cho h3{margin:0 0 6px;font-size:17px}.web-con-cho p{display:flex;align-items:center;gap:8px}.web-con-cho svg{flex:none;width:24px;height:24px}.web-goi-card .web-gia-goi{font-weight:700;font-size:15px}`;
  function dong() {dungHoiDon?.();clearTimeout(hen);luot++;document.querySelector('.web-bang')?.remove();}
  function bang(tieuDe) {
    dong();const lop=document.createElement('div');lop.className='web-bang';lop.setAttribute('role','dialog');lop.setAttribute('aria-modal','true');lop.setAttribute('aria-label',tieuDe);
    const hop=document.createElement('div');hop.className='web-hop';lop.append(hop);
    const h=document.createElement('h2');h.textContent=tieuDe;hop.append(h);document.body.append(lop);nhacTrongApp(hop);
    return hop;
  }
  function chu(h,noiDung,lop='') {const p=document.createElement('p');p.textContent=noiDung;p.className=lop;h.append(p);return p;}
  function nut(h,nhan,fn,lop='nut') {if(/\d[\d.]*đ/.test(nhan)){if(h.classList.contains('web-muc-ung-ho')){if(!h.previousElementSibling?.classList.contains('web-tien-that')){const p=document.createElement('p');p.className='web-ghichu web-tien-that';p.textContent='Thanh toán bằng tiền thật';h.before(p);}}else chu(h,'Thanh toán bằng tiền thật','web-ghichu');}const b=document.createElement('button');b.type='button';b.className=lop;b.textContent=nhan;b.onclick=fn;h.append(b);return b;}
  function lienKet(h,nhan,url) {try{if(new URL(url).protocol!=='https:')return;}catch{return;}const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=nhan;a.className='nut';h.append(a);}
  const linkGame='https://banhmi-collab.github.io/daytro/';
  const ua=navigator.userAgent;
  const appTrongWeb=/Messenger/i.test(ua)?'messenger':/FBAN|FBAV|FB_IAB/i.test(ua)?'fb':/Instagram/i.test(ua)?'ig':/Zalo/i.test(ua)?'zalo':/BytedanceWebview|musical_ly/i.test(ua)?'tiktok':/Line\//i.test(ua)?'khac':null;
  const trongApp=appTrongWeb&&!navigator.standalone&&!window.matchMedia('(display-mode: standalone)').matches;
  css.textContent+=`.web-nhac{background:#f8e4ba;border:1px solid #bc8c45;border-radius:10px;padding:8px;margin:8px 0;font:12px/1.4 'Be Vietnam Pro',sans-serif;color:#3b2f25}.web-nhac p{font-size:12px}.web-nhac-thao-tac{display:flex;gap:8px;flex-wrap:wrap}.web-nhac a,.web-sao-chep{display:inline-flex;align-items:center;justify-content:center;padding:8px;border:1px solid #96785f;border-radius:8px;background:#fff8ee;color:#543b24;font:inherit;cursor:pointer;text-decoration:none;min-height:44px}.web-buoc{font-size:12px;line-height:1.45}.web-buoc p{margin:3px 0}`;
  function saoChep(h,nhan,noiDung) {
    nut(h,nhan,async()=>{try{await navigator.clipboard.writeText(noiDung);}catch{const o=document.createElement('textarea');o.value=noiDung;h.append(o);o.select();const duoc=document.execCommand('copy');o.remove();if(!duoc){chu(h,'Bạn nhấn giữ để sao chép: '+noiDung);return;}}chu(h,'Đã sao chép');},'web-sao-chep');
  }
  function nhacTrongApp(h) {
    if(!trongApp||h.querySelector('.web-nhac'))return;
    const n=document.createElement('aside');n.className='web-nhac';h.append(n);
    const tenApp={messenger:'Messenger',fb:'Facebook',ig:'Instagram',zalo:'Zalo',tiktok:'TikTok',khac:'ứng dụng này'}[appTrongWeb];
    if(window.MangVanWeb){
      chu(n,'Bạn đang mở trong '+tenApp+'. Mang dãy trọ sang Chrome/Safari để mai chơi tiếp. Gói đã mua vẫn khôi phục bằng mã đơn.');
      const tt=document.createElement('div');tt.className='web-nhac-thao-tac';n.append(tt);
      if(/Android/i.test(ua))window.MangVanWeb.ganNut(tt,{chrome:true}).addEventListener('click',()=>doWeb('web_trong_app_mo_chrome'));
      window.MangVanWeb.ganNut(tt);if(!/Android/i.test(ua))window.MangVanWeb.huongDan(n);
      doWeb('web_trong_app_hien',{app:appTrongWeb});return;
    }
    chu(n,'Bạn đang mở trong '+tenApp+'. Mở bằng Chrome/Safari để không mất bản đã mua.');
    const thaoTac=document.createElement('div');thaoTac.className='web-nhac-thao-tac';
    if(/Android/i.test(ua)){
      const a=document.createElement('a');a.className='lai';a.textContent='Mở bằng Chrome';a.href='intent://banhmi-collab.github.io/daytro/#Intent;scheme=https;package=com.android.chrome;end';
      a.onclick=()=>doWeb('web_trong_app_mo_chrome');thaoTac.append(a);
    }else chu(n,'Bấm ••• → Mở trong trình duyệt');
    n.append(thaoTac);saoChep(thaoTac,'Sao chép link',linkGame);doWeb('web_trong_app_hien',{app:appTrongWeb});
  }
  function chuanMa(ma){ma=ma.replace(/\s/g,'').toUpperCase();if(/[O0I1]/.test(ma))throw Error('Mã không có chữ O, I và số 0, 1; kiểm tra lại nhé');return ma;}
  function buocMua(h,ma='DTxxxxxx') {
    const ds=document.createElement('div');ds.className='web-buoc';h.append(ds);
    for(const t of ['① Mở bằng Chrome/Safari trước khi mua.','② Quét QR, chuyển đúng số tiền, giữ nguyên nội dung '+ma+'.','③ Chờ trên màn này, game tự mở.','④ Chụp lại mã đơn này; đổi máy dùng nó để khôi phục.'])chu(ds,t);
  }
  function huongDanMua(){const h=bang('Hướng dẫn mua');buocMua(h);nut(h,'Đóng',()=>{dong();tiepHang();},'lai');}
  function hoTroDuMay(h,ma) {
    h.closest('.web-hop')?.querySelectorAll('[data-tao-don]').forEach(b=>b.remove());
    h.querySelector('[data-ho-tro-may]')?.remove();
    const n=document.createElement('div');n.dataset.hoTroMay='';h.append(n);
    lienKet(n,'Nhắn Warm Jar qua nhóm Xóm Trọ','https://www.facebook.com/groups/xomtrowarmjar');saoChep(n,'Sao chép mã',ma.replace(/\s/g,'').toUpperCase());doWeb('web_khoi_phuc_du_may');
  }
  function moKhoiPhuc() {
    const h=bang('Khôi phục bản web');
    chu(h,'① Nhập mã đơn đã chuyển tiền (DT…, trong ảnh chụp hoặc nội dung chuyển khoản).');
    chu(h,'② Không bấm mua lại để lấy mã mới: mã mới chưa trả tiền nên không mở được.');
    chu(h,'③ Mã đơn DT… → ô trên. Mã 8 chữ Warm Jar gửi riêng → ô dưới.');
    oNhap(h,'Khôi phục bằng mã đơn',khoiPhuc);const d=doc(K_DON);
    if(d?.ma)chu(h,'Bạn đang có đơn '+d.ma+' chưa trả tiền. Nếu đã mua trước đó, nhập mã đơn cũ đã chuyển tiền.');
    oNhap(h,'Nhập mã mở bản đầy đủ',ma=>nhapMa('web_day_du',ma));dongNut(h,true);
  }
  function dieuKhoan(h){if(h.querySelector('[data-dieu-khoan]'))return;const p=document.createElement('p');p.style.cssText='font-size:12px;text-align:center;margin:12px 0 0';const a=document.createElement('a');a.textContent='Điều khoản mua';a.href='https://banhmi-collab.github.io/daytro/dieu-khoan.html';a.target='_blank';a.rel='noopener noreferrer';a.dataset.dieuKhoan='';p.append(a);h.append(p);}
  function chanMua(h) {if(!h.querySelector('[data-huong-dan-mua]'))nut(h,'Hướng dẫn mua',huongDanMua,'lai').dataset.huongDanMua='';dieuKhoan(h);}
  function dongNut(h,coMua=false) {nut(h,'Đóng, xem dãy trọ',()=>{dong();tiepHang();},'lai');if(coMua)chanMua(h);}
  function hienQR(h,n,tien,nd,gon=false,nhanTien='') {
    if(!W.nganHangDung(n)){chu(h,'Đang cập nhật cách ủng hộ');return;}
    const q=document.createElement('div');q.className='web-qr';h.append(q);
    new QRCode(q,{text:W.vietQR(n,tien,nd),width:gon?176:220,height:gon?176:220,correctLevel:QRCode.CorrectLevel.M});
    q.removeAttribute('title');
    chu(h,n.ten+' · '+(n.bin==='970418'?'BIDV':'Ngân hàng '+n.bin)+' · '+n.soTk,'web-nhan');
    if(!gon)chu(h,'Tài khoản nhận của người làm game Warm Jar');
    if(tien)chu(h,nhanTien+tien.toLocaleString('vi-VN')+'đ');chu(h,'Nội dung: '+nd+(gon?' · giữ nguyên, đừng sửa':''));
    W.thanhToanDe?.hien(q,n,tien,nd);
  }
  function moQuyen(goi,bangChung,cach,hop=null) {
    if(!Object.hasOwn(W.GIA,goi))throw Error('Gói không hợp lệ');
    if(!['web_day_du','combo_tet'].includes(goi)&&!dayDu())throw Error('Bạn cần mở bản đầy đủ trước nhé');
    const daCo=goi==='combo_tet'?dayDu()&&coGoi('goi_tet'):goi==='web_day_du'?dayDu():coGoi(goi);
    if(goi==='combo_tet'){
      luuWeb(K_DAY,bangChung);
      const ds=new Set([...GOI,'goi_tet']);localStorage.setItem(KHOA_GOI,JSON.stringify([...ds]));GOI=ds;if(st)luu();
    }
    else if(goi==='web_day_du')luuWeb(K_DAY,bangChung);
    else {const ds=new Set([...GOI,goi]);localStorage.setItem(KHOA_GOI,JSON.stringify([...ds]));GOI=ds;nhanGoi();if(st)luu();}
    if(doc(K_DON)?.goi===goi)localStorage.removeItem(K_DON);
    document.getElementById('webNhacDon')?.remove();
    if(!daCo)doWeb('web_mo_khoa',{goi,cach});
    if(['web_day_du','combo_tet'].includes(goi))window.dispatchEvent(new Event('webMoDayDu'));
    document.getElementById('hetBanThu')?.remove();
    if(hop?.isConnected){clearTimeout(hen);luot++;hop.querySelector('[data-trang-thai]').textContent='Đã nhận, cảm ơn bạn!';hop.querySelector('[data-huong-dan-mua]')?.remove();hop.querySelector('[data-dieu-khoan]')?.parentNode.remove();}
    else {const h=bang('Đã nhận, cảm ơn bạn!');chu(h,'Đã mở '+ten(goi)+'. Ván đang chơi vẫn được giữ nguyên.');dongNut(h);}
    veTiem();
    if(document.getElementById('manCH').classList.contains('hien'))moCuaHang();
    if(goi==='web_day_du'&&!daCo&&cach==='tu_dong')moiThem();
  }
  async function nhapMa(goi,ma) {
    ma=chuanMa(ma);
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
    o.oninput=()=>{o.value=o.value.replace(/\s/g,'').toUpperCase();bao.textContent=/[O0I1]/.test(o.value)?'Mã không có chữ O, I và số 0, 1; kiểm tra lại nhé':'';};
    nut(h,nhan,async()=>{bao.textContent='';try{await fn(chuanMa(o.value));}catch(e){bao.textContent=e.message;if(e.ma==='du_may')hoTroDuMay(h,o.value);}});
    return o;
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
      const chu=r.status===404?'Không tìm thấy mã đơn, bạn kiểm tra lại từng chữ nhé':loi==='da_co_goi'?'Gói Tết đã có trong combo. Khôi phục bằng mã đơn để nhận lại nhé.':loi==='da_co_day_du'?'Bạn đã có bản đầy đủ. Chọn gói Tết riêng để không mua trùng nhé.':loi==='du_may'?'Mã này đã dùng đủ 3 máy. Nhắn Warm Jar kèm mã đơn để được mở thêm (miễn phí)':loi==='chua_tra'?'Mã này chưa nhận được tiền. Nếu đã mua trước đó, hãy nhập mã đơn cũ đã thanh toán.':r.status===429?'Bạn thử lại sau một phút nhé':'Chưa thực hiện được. Bạn kiểm tra lại hoặc nhắn Warm Jar nhé.';
      throw Object.assign(Error(chu),{ma:loi,status:r.status});
    }
    return d;
  }
  async function khoiPhuc(ma) {
    ma=chuanMa(ma);if(!/^DT[A-HJ-NP-Z2-9]{6}$/.test(ma))throw Error('Mã đơn chưa đúng');
    const d=await api('/api/don/'+ma+'/khoi-phuc',{maMay:await maMay()});
    if(!d.daTra)throw Error('Mã này chưa nhận được tiền. Nếu đã mua trước đó, hãy nhập mã đơn cũ đã thanh toán.');
    moQuyen(d.goi,{maDayDu:ma},'khoi_phuc');
  }
  function duPhong(h,goi,maCu,huongDan=true) {
    if(huongDan)chu(h,'Nếu đã chuyển, nhắn mã đơn cho Warm Jar qua FB/Zalo để kiểm tra. Đừng chuyển lại nhé.');
    if(maCu)chu(h,maCu,'web-ma');
    lienKet(h,'Liên hệ Warm Jar',cauHinh.lienHe);
    chu(h,'① Nhập mã đơn DT… đã chuyển tiền vào ô trên; mã 8 chữ Warm Jar gửi riêng vào ô dưới.');
    chu(h,'② Không mua lại lấy mã mới: mã mới chưa trả tiền nên không mở được.');
    oNhap(h,'Khôi phục bằng mã đơn',khoiPhuc);const d=doc(K_DON);
    if(d?.ma)chu(h,'Bạn đang có đơn '+d.ma+' chưa trả tiền. Nếu đã mua trước đó, nhập mã đơn cũ đã chuyển tiền.');
    oNhap(h,'Nhập mã mở gói',ma=>nhapMa(goi,ma));
  }
  function gapVanDe(h,goi,coDon=true) {
    const g=document.createElement('details');g.className='web-vande';
    const s=document.createElement('summary');s.textContent='Gặp vấn đề?';g.append(s);h.append(g);
    duPhong(g,goi,null,false);
    if(coDon)nut(g,'Tạo đơn mới (chỉ khi chưa chuyển)',()=>{if(confirm('Chỉ tạo đơn mới nếu bạn chưa chuyển tiền cho đơn cũ. Tiếp tục?')){localStorage.removeItem(K_DON);mua(goi);}},'lai').dataset.taoDon='';
    const dk=h.querySelector('[data-dieu-khoan]')?.parentNode;if(dk)h.append(dk);
    return g;
  }
  function hienMaTay(h,goi,ma,n,loi='') {
    h.classList.remove('web-tu-dong');h.replaceChildren(h.firstChild);
    nhacTrongApp(h);if(loi)chu(h,loi,'web-loi');
    chu(h,'Nhờ Warm Jar kiểm tra đơn');hienQR(h,n,W.GIA[goi],ma);duPhong(h,goi,ma);dongNut(h,true);
  }
  async function choDon(d,h,phien,bao) {
    if(phien!==luot)return;
    let daDung=false,dangHoi=false;
    const dung=()=>{daDung=true;clearTimeout(hen);document.removeEventListener('visibilitychange',doiAnHien);if(dungHoiDon===dung)dungHoiDon=null;};
    const doiAnHien=()=>{clearTimeout(hen);if(!document.hidden)void hoi();};
    const hoi=async()=>{
      if(daDung||phien!==luot||document.hidden||dangHoi)return;
      dangHoi=true;
      try {
        const k=await api('/api/don/'+d.ma);
        if(daDung||phien!==luot||document.hidden)return;
        if(k.daTra){
          const quyen=await api('/api/don/'+d.ma+'/khoi-phuc',{maMay:await maMay()});if(phien!==luot)return;
          if(!quyen.daTra||quyen.goi!==d.goi)throw Error('Chưa xác nhận được quyền mở gói');
          dung();
          moQuyen(quyen.goi,{maDayDu:d.ma},'tu_dong',h);return;
        }
        const tuMoDen=Number.isFinite(k.tuMoDen)?k.tuMoDen:Number.isFinite(d.tuMoDen)?d.tuMoDen:d.hetHan+23.5*3600000;
        if(Date.now()>tuMoDen){dung();bao.textContent='Đơn đã quá 24 giờ. Nếu đã chuyển, nhắn mã đơn để Warm Jar kiểm tra.';return;}
        const daHetHan=k.hetHan||Date.now()>=d.hetHan;
        if(daHetHan)bao.textContent='Nếu đã chuyển, game sẽ tự mở khi tiền về (trong 24 giờ). Giữ mã đơn, đừng chuyển lại.';
        hen=setTimeout(hoi,daHetHan?60000:4000);
      }catch(e){if(daDung||phien!==luot)return;dung();if(e.ketNoi)hienMaTay(h,d.goi,d.ma,d.nganHang,e.message);else {bao.textContent=e.message;bao.classList.add('web-loi');if(e.ma==='du_may')hoTroDuMay(h,d.ma);}}
      finally{dangHoi=false;}
    };
    dungHoiDon=dung;document.addEventListener('visibilitychange',doiAnHien);await hoi();
  }
  async function mua(goi) {
    if(!Object.hasOwn(W.GIA,goi))return;
    if(goi==='combo_tet'&&(dayDu()||coGoi('goi_tet'))){const h=bang('Bạn đã có một phần của combo');chu(h,'Giữ quyền đã mua; chọn phần còn thiếu, không cần mua lại combo.');if(!dayDu())nut(h,'Mở bản đầy đủ · 19.000đ',()=>bamMua('web_day_du'));else if(!coGoi('goi_tet'))nut(h,'Gói Tết · 25.000đ',()=>bamMua('goi_tet'));dongNut(h,true);return;}
    if(!['web_day_du','combo_tet'].includes(goi)&&!dayDu()){chonBanDayDu(false);return;}
    const h=bang(ten(goi)),phien=luot;chu(h,'Đang chuẩn bị…');await sanSang;if(phien!==luot)return;
    h.lastChild.remove();
    const cu=doc(K_DON);
    let d;
    try {
      if(cu&&cu.goi!==goi&&Date.now()<cu.hetHan){
        chu(h,'Bạn đang có đơn '+cu.ma+' ('+ten(cu.goi)+'). Kiểm tra đơn này trước khi mua thêm nhé.');
        nut(h,'Xem đơn đang chờ',()=>mua(cu.goi));
        nut(h,'Đổi sang '+(goi==='web_day_du'?'Bản đầy đủ':ten(goi))+' · '+W.GIA[goi].toLocaleString('vi-VN')+'đ',()=>doiGoi(cu,goi),'lai').dataset.doiGoi='';
        chu(h,'Chỉ đổi khi bạn chưa chuyển tiền cho đơn '+cu.ma+'.','web-ghichu');
        dongNut(h,true);return;
      }
      d=cu&&cu.goi===goi ? cu : await api('/api/don',{goi,...(doc(K_DAY,{})||{}),maMay:await maMay()});
      if(phien!==luot)return;
      if(d.goi!==goi||d.soTien!==W.GIA[goi]||!/^DT[A-HJ-NP-Z2-9]{6}$/.test(d.ma)||!Number.isFinite(d.hetHan))throw Error('Đơn không hợp lệ');
      if(!(cu&&cu.goi===goi))doWeb('web_tao_don',{goi});
      luuWeb(K_DON,d);
      h.classList.add('web-tu-dong');h.firstChild.textContent=ten(goi)+' · '+d.soTien.toLocaleString('vi-VN')+'đ';
      if(Date.now()<d.hetHan)hienQR(h,d.nganHang,d.soTien,d.noiDung,true);
      else chu(h,'Đơn cũ hết hạn; kiểm tra trước khi tạo đơn mới.');
      const bao=chu(h,'Đang chờ tiền về… game tự mở sau vài giây');bao.setAttribute('role','status');bao.dataset.trangThai='';
      chu(h,d.ma,'web-ma');if(!W.thanhToanDe){buocMua(h,d.ma);saoChep(h,'Sao chép mã đơn',d.ma);}
      if(goi==='web_day_du'&&!coGoi('goi_tet'))nut(h,'Đổi sang Bản đầy đủ + Gói Tết · 39.000đ',()=>doiGoi(d,'combo_tet'),'lai').dataset.doiGoi='';
      dongNut(h,true);gapVanDe(h,goi);await choDon(d,h,phien,bao);
    } catch(e) {
      if(phien!==luot)return;
      // Nếu đơn cũ tồn tại, dùng lại mã để không làm người đã chuyển trả lần nữa.
      const ma=cu?.goi===goi?cu.ma:'DT '+({web_day_du:'DAYDU',combo_tet:'COMBO',goi_tet:'TET',goi_noel:'NOEL',meo_cung:'MEO',khoi_nghiep:'KN'}[goi])+' '+W.taoMa(4);
      if(e.status&&!e.ketNoi){chu(h,e.message,'web-loi');dongNut(h,true);gapVanDe(h,goi,false);}
      else hienMaTay(h,goi,ma,cu?.goi===goi?cu.nganHang:nganHang,e.ketNoi?e.message:'');
    }
  }
  // Combo là nút to ngang nút 19k; hiện ở mọi màn mời mở bản đầy đủ.
  function khoiCombo(h) {
    if(coGoi('goi_tet'))return;
    const combo=document.createElement('div');combo.className='web-combo';combo.innerHTML=hinhGoi('goi_tet');h.append(combo);
    nut(combo,'Bản đầy đủ + Gói Tết · 39.000đ (tiết kiệm 5.000đ)',()=>bamMua('combo_tet'));
    chu(combo,'Mở đủ hai quyền lợi, giữ nguyên ván đang chơi. Đồ có giá trong tiệm vẫn mua bằng tiền trong game.');
  }
  const goiTrangTri=['goi_tet','goi_noel','meo_cung','khoi_nghiep'];
  const doCuaHang=(ten,p)=>W.thanhToanDe?.ghi(ten,p);
  function theGoi(h,goi,nhan,chon){
    const the=document.createElement('section');the.className='web-goi-card';the.dataset.goiTrangTri=goi;
    const dau=document.createElement('header');dau.innerHTML=W.hinhGoiTrangTri?.(goi)||hinhGoi(goi);
    const t=document.createElement('h4');t.textContent=GOI_INFO[goi].ten.trim();dau.append(t);the.append(dau);
    chu(the,GOI_INFO[goi].mo);chu(the,W.GIA[goi].toLocaleString('vi-VN')+'đ','web-gia-goi');
    nut(the,nhan,chon);h.append(the);
    const v=the.querySelector('svg');if(v&&W.hinhGoiTrangTri){const b=v.getBBox(),d=Math.max(b.width,b.height)+24;v.setAttribute('viewBox',`${b.x+b.width/2-d/2} ${b.y+b.height/2-d/2} ${d} ${d}`);}
    if(typeof IntersectionObserver==='function'){
      const io=new IntersectionObserver(ds=>{for(const e of ds)if(!the.isConnected||e.isIntersecting&&e.intersectionRatio>=.25){if(the.isConnected)doCuaHang('web_ch_xem_goi',{goi});io.disconnect();}},{threshold:.25});io.observe(the);
    }
    return the;
  }
  function gioiThieuGoi(h){
    const muc=document.createElement('section');muc.dataset.trangTri='';const t=document.createElement('h3');t.textContent='Gói trang trí';muc.append(t);h.append(muc);
    for(const goi of goiTrangTri){
      const the=theGoi(muc,goi,coGoi(goi)?'Bạn đã có gói này':'Mua sau khi mở bản đầy đủ',()=>{
        h.querySelector('[data-mo-day-du]')?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
      });the.querySelector('header').insertAdjacentHTML('beforeend',bieuTuong('khoa'));
    }
  }
  let daMoiThem=false;
  function moiThem(){
    try{if(localStorage.getItem('day-tro-web-moi-them')==='1')return;}catch{}
    if(daMoiThem)return;
    const mua=window.MuaLeWeb?.muaLe(),ds=[mua?.goi,'meo_cung','goi_tet','goi_noel','khoi_nghiep'].filter((g,i,a)=>g&&a.indexOf(g)===i&&!coGoi(g)).slice(0,2);
    if(!ds.length)return;daMoiThem=true;try{localStorage.setItem('day-tro-web-moi-them','1');}catch{}
    const h=bang('Cảm ơn bạn đã ủng hộ!');h.parentNode.id='webMoiThem';
    for(const goi of ds)theGoi(h,goi,'Mua · '+W.GIA[goi].toLocaleString('vi-VN')+'đ',()=>{doCuaHang('web_moi_them',{goi,bam:'mua'});bamMua(goi);});
    nut(h,'Để sau',()=>{for(const goi of ds)doCuaHang('web_moi_them',{goi,bam:'de_sau'});dong();tiepHang();},'lai');
  }
  function conCho(h){
    const hop=document.createElement('section');hop.className='web-con-cho';hop.dataset.conCho='';const t=document.createElement('h3');t.textContent='Còn chờ bạn';hop.append(t);h.append(hop);
    const phong=Array.isArray(st?.phong)?st.phong:[],con=6-phong.slice(0,6).filter(p=>p.mo).length;
    const dong=(icon,noiDung)=>{const p=document.createElement('p');p.innerHTML=bieuTuong(icon);const s=document.createElement('span');s.textContent=noiDung;p.append(s);hop.append(p);};
    hop.dataset.phong=String(con);dong('nha',con?con+' phòng nữa chưa mở':'Bạn đã mở đủ 6 phòng trọ');
    if(!phong[6]?.mo)dong('nha','Tiệm bánh hoặc quán trà sữa');
    dong('chiaKhoa',phong[7]?.mo?'Bạn đã có căn hộ riêng':'Căn hộ riêng 60 triệu');dong('qua','Noel, Tết ở xóm trọ');
  }
  // Đổi đơn chờ sang gói khác. Hỏi máy chủ trước: đơn cũ đã nhận tiền thì
  // mở quyền đơn cũ, không tạo đơn mới (tránh người đã chuyển phải trả lần nữa).
  async function doiGoi(cu,goiMoi) {
    const h=bang('Đổi gói'),phien=luot;chu(h,'Đang kiểm tra đơn '+cu.ma+'…');
    try {
      const k=await api('/api/don/'+cu.ma);if(phien!==luot)return;
      if(k.daTra){
        const quyen=await api('/api/don/'+cu.ma+'/khoi-phuc',{maMay:await maMay()});if(phien!==luot)return;
        if(!quyen.daTra)throw Error('Chưa xác nhận được đơn cũ');
        moQuyen(quyen.goi,{maDayDu:cu.ma},'tu_dong');return;
      }
    } catch(e) {
      if(phien!==luot)return;h.lastChild.remove();
      chu(h,'Chưa kiểm tra được đơn '+cu.ma+'. Thử lại sau ít phút nhé.','web-loi');dongNut(h,true);return;
    }
    localStorage.removeItem(K_DON);
    return bamMua(goiMoi);
  }
  function chonBanDayDu(daHet) {
    if(dayDu())return;
    const het=daHet||(st?.thang>=3);
    const h=bang(het?'Hết bản chơi thử rồi!':'Bạn đang chơi miễn phí 3 tháng đầu');h.parentNode.id='hetBanThu';
    chu(h,het?'Bạn đã giữ dãy trọ của bà qua 3 tháng đầu. Mở bản đầy đủ trên web để chơi tiếp ván này. Các gói trang trí mua riêng.':'Mở bản đầy đủ bất cứ lúc nào để chơi không giới hạn. Các gói trang trí mua riêng.');
    if(het)conCho(h);
    nut(h,'Mở bản đầy đủ · 19.000đ',()=>bamMua('web_day_du')).dataset.moDayDu='';
    khoiCombo(h);
    gioiThieuGoi(h);
    nut(h,'Đã mua? Khôi phục bằng mã đơn',moKhoiPhuc,'lai');
    lienKet(h,'Vào nhóm Xóm Trọ','https://www.facebook.com/groups/xomtrowarmjar');
    nut(h,'Đóng, xem dãy trọ',()=>{dong();tiepHang();if(daHet&&!dayDu())window.dispatchEvent(new Event('webDongHetBanThu'));},'lai');
    chanMua(h);
    nut(h,'Chơi lại từ đầu',()=>{if(confirm('Chơi lại sẽ xoá ván hiện tại. Bạn chắc chứ?')){localStorage.removeItem('day-tro-cua-toi-v2');location.reload();}},'lai');
  }
  function hetBanThu() {if(dayDu())return;if(!daDoHetBanThu){daDoHetBanThu=true;doWeb('het_ban_thu');}chonBanDayDu(true);}
  window.moHetBanThu=hetBanThu;
  window.moHetLuotNgay=()=>nghiHomNay();
  const hetCu=hetThang;
  function nghiHomNay(){
    if(document.getElementById('hetLuotNgay'))return;
    const h=bang('Hôm nay dãy trọ nghỉ rồi');h.parentNode.id='hetLuotNgay';
    chu(h,'Mai quay lại chơi tiếp tháng '+(st.thang+1)+' nhé — hoặc mở bản đầy đủ để chơi thoải mái (19.000đ).');
    chu(h,'Mai có khách mới. Hôm nay bạn vẫn xem và trang trí phòng được nha.');
    nut(h,'Mở bản đầy đủ · 19.000đ',()=>bamMua('web_day_du'));
    khoiCombo(h);
    nut(h,'Mai chơi tiếp',()=>{dong();tiepHang();},'lai');doWeb('ab_het_luot_ngay');
    if(!daDoHetBanThu){daDoHetBanThu=true;doWeb('het_ban_thu');}
  }
  hetThang=function(...a){if(st?.thang>=3&&!dayDu()){
    if(nhomHienTai()!=='B'){hetBanThu();return;}
    if(!luotNgay()){nghiHomNay();return;}
  }return hetCu(...a);};
  const sangCu=sangThang;
  sangThang=function(...a){const truoc=st?.thang;const r=sangCu(...a);if(quyTac&&nhomHienTai()==='B'&&!dayDu()&&truoc>=3&&st.thang>truoc)luotNgay(true);return r;};
  const batDauCu=batDau;
  batDau=function(...a){try{localStorage.removeItem(khoaLuot);}catch{}return batDauCu(...a);};
  // Nguồn website cũ chặn ở đầu hetThang khi thang >= 3; giữ nguyên mốc đó.
  const cuaHangCu=moCuaHang;
  moCuaHang=function(){
    // Chưa mở bản đầy đủ: cho chọn 19k hoặc combo, không tạo đơn ngay.
    if(!dayDu()){chonBanDayDu(false);return;}
    cuaHangCu();
    document.querySelector('#chNoi [data-hinh-goi="khong_quang_cao"]')?.closest('.nv').remove();
    document.querySelectorAll('#chNoi [data-goi]').forEach(b=>{b.disabled=false;b.textContent='Mua · '+W.GIA[b.dataset.goi].toLocaleString('vi-VN')+'đ';});
  };
  W.moGoi=goi=>{if(Object.hasOwn(W.GIA,goi))bamMua(goi);};
  document.getElementById('nutCH').addEventListener('click',e=>{e.stopImmediatePropagation();if(!dayDu())chonBanDayDu(false);else moCuaHang();},true);
  document.getElementById('chNoi').addEventListener('click',e=>{const b=e.target.closest('[data-goi]');if(b){e.stopImmediatePropagation();bamMua(b.dataset.goi);}},true);
  const caiDat=document.getElementById('cdXong').parentNode;
  css.textContent+=`.web-ung-ho{padding:16px;font-size:13px}.web-ung-ho h2{font-size:21px}.web-muc-ung-ho{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0}.web-muc-ung-ho button{min-height:60px;padding:6px;border:1px solid #a58669;border-radius:10px;background:#fff8ee;color:#543b24;font:inherit;font-size:12px;line-height:1.4}.web-muc-ung-ho button[aria-pressed=true]{background:#f8e4ba;border:2px solid #76543c;font-weight:700}.web-ung-ho input{font-size:13px;min-height:44px;margin:2px 0}.web-ung-ho label{display:block;font-size:12px}.web-ung-ho [role=status]:empty{display:none}.web-ung-ho .web-qr{padding:8px;margin:6px auto}.web-ung-ho .web-qr img,.web-ung-ho .web-qr canvas{width:144px;height:144px}.web-ung-ho-qr p{font-size:12px;margin:2px 0}.web-ung-ho .nut{margin:6px 0}.web-ung-ho .lai{margin:0 auto}`;
  async function moUngHo() {
    doWeb('web_ung_ho_mo');const h=bang('Ủng hộ Warm Jar'),p=luot;
    h.classList.add('web-ung-ho');await sanSang;if(p!==luot)return;
    chu(h,'Thích game thì mời mình ly trà sữa nha. Không bắt buộc, chơi game là vui rồi.');
    const muc=document.createElement('div');muc.className='web-muc-ung-ho';muc.setAttribute('role','group');muc.setAttribute('aria-label','Chọn mức ủng hộ');h.append(muc);
    const ds=[];
    for(const [tien,nhan] of [[10000,'🧋 Ly trà đá · 10.000đ'],[20000,'🧋 Ly trà sữa · 20.000đ'],[50000,'🍜 Tô bún · 50.000đ']]){
      const b=nut(muc,nhan,()=>{o.value='';bao.textContent='';o.removeAttribute('aria-invalid');chon(tien,tien);},'');b.dataset.muc=String(tien);ds.push(b);
    }
    const nhan=document.createElement('label');nhan.textContent='Tự nhập số khác (5.000–500.000đ)';h.append(nhan);
    const o=document.createElement('input');o.type='number';o.inputMode='numeric';o.min='5000';o.max='500000';o.step='1';o.setAttribute('aria-label','Tự nhập số khác');nhan.append(o);
    const bao=chu(h,'','web-loi');bao.setAttribute('role','status');
    const qr=document.createElement('div');qr.className='web-ung-ho-qr';h.append(qr);
    function chon(tien,loai,doLuot=true){
      ds.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.muc)===loai)));
      qr.replaceChildren();hienQR(qr,nganHang,tien,'UNG HO WARMJAR',true,'Số tiền: ');
      if(doLuot)doWeb('web_ung_ho_chon',{muc:loai});
    }
    function docTien(){const tien=Number(o.value);return /^\d+$/.test(o.value)&&Number.isSafeInteger(tien)&&tien>=5000&&tien<=500000?tien:null;}
    o.oninput=()=>{const tien=docTien(),dung=tien!==null;bao.textContent=dung||!o.value?'':'Bạn nhập số nguyên từ 5.000đ đến 500.000đ nhé';o.setAttribute('aria-invalid',String(!dung&&!!o.value));if(dung)chon(tien,'tu_nhap',false);};
    o.onchange=()=>{o.oninput();if(docTien()!==null)doWeb('web_ung_ho_chon',{muc:'tu_nhap'});};
    chon(20000,20000,false);
    if(cauHinh.kofi)lienKet(h,'Ủng hộ qua Ko-fi',cauHinh.kofi);dongNut(h);
  }
  const ungHo=nut(caiDat,'Ủng hộ Warm Jar',moUngHo,'lai');
  ungHo.innerHTML=bieuTuong('qua')+'<span>Ủng hộ Warm Jar</span>';
  nut(caiDat,'Khôi phục bản web / mã đã mua',moKhoiPhuc,'lai');
  nut(caiDat,'Hướng dẫn mua',huongDanMua,'lai');
  dieuKhoan(caiDat);
  let yen=0,daHien=false;
  setInterval(()=>{if(nhomHienTai()==='B'||dayDu()||daHien||document.querySelector('.web-bang'))return;yen=st?.thang>=3&&!document.querySelector('.phu.hien:not(#moDau)')?yen+1:0;if(yen>=3){daHien=true;hetBanThu();}},1000);
  sanSang.then(()=>{
    const p=document.createElement('p');p.id='webMienPhi';p.style.cssText='font-size:13px;line-height:1.5;margin:8px 0';
    p.textContent=nhomHienTai()==='B'?'Mỗi ngày chơi miễn phí, mở đầy đủ để chơi không giới hạn':'3 tháng đầu miễn phí';
    document.getElementById('nutMo')?.parentNode.append(p);
    if(trongApp){let daNhac=false;try{daNhac=sessionStorage.getItem('day-tro-web-nhac-app')==='1';sessionStorage.setItem('day-tro-web-nhac-app','1');}catch{}if(!daNhac)nhacTrongApp(p.parentNode);}
  });
  void maMay();
  sanSang.then(async()=>{
    const d=doc(K_DON);if(!d||!Object.hasOwn(W.GIA,d.goi)||!/^DT[A-HJ-NP-Z2-9]{6}$/.test(d.ma))return;
    if(!W.thanhToanDe){void mua(d.goi);return;}
    try{
      const k=await api('/api/don/'+d.ma);
      if(doc(K_DON)?.ma!==d.ma)return;
      if(k.daTra){const quyen=await api('/api/don/'+d.ma+'/khoi-phuc',{maMay:await maMay()});if(quyen.daTra&&quyen.goi===d.goi)moQuyen(d.goi,{maDayDu:d.ma},'tu_dong');}
      else if(k.hetHan||!Number.isFinite(d.hetHan)||Date.now()>=d.hetHan){localStorage.removeItem(K_DON);W.thanhToanDe.nhacDon('',()=>mua(d.goi),true,true);}
      else W.thanhToanDe.nhacDon(d.ma,()=>mua(d.goi));
    }catch{if(doc(K_DON)?.ma===d.ma)W.thanhToanDe.nhacDon(d.ma,()=>mua(d.goi),false);}
  });
})();
