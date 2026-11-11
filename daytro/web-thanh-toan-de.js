// Tiện ích chuyển khoản chỉ web; không thay QR, tài khoản hay API nhận tiền.
(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.DayTroWeb)return;
  const W=window.DayTroWeb;
  const goiDaXem=new Set();
  function ghi(ten,p={}){
    let sach;
    if(ten==='web_tt_nut'&&['stk','noi_dung','so_tien','luu_qr','mo_app'].includes(p.loai)&&['ok','loi'].includes(p.kq))sach={loai:p.loai,kq:p.kq};
    else if(ten==='web_tt_buoc_chrome'&&['mo_chrome','o_lai'].includes(p.chon))sach={chon:p.chon};
    else if(ten==='web_tt_ly_do'&&['khong_app','khong_quet','chua_muon','de_sau','bo_qua'].includes(p.chon))sach={chon:p.chon};
    else if(ten==='web_tt_nhac_don'&&[0,1,2].includes(p.bam))sach={bam:p.bam};
    else if(ten==='web_ch_xem_goi'&&window.DayTroWeb.GOI_TRANG_TRI.some(g=>g.id===p.goi)){
      const khoa='daytro-xem-goi-'+p.goi;
      if(goiDaXem.has(p.goi))return;
      try{if(sessionStorage.getItem(khoa)==='1')return;sessionStorage.setItem(khoa,'1');}catch{ /* Phiên hiện tại vẫn chống lặp khi trình duyệt chặn lưu. */ }
      goiDaXem.add(p.goi);sach={goi:p.goi};
    }
    else if(ten==='web_moi_them'&&window.DayTroWeb.GOI_TRANG_TRI.some(g=>g.id===p.goi)&&['mua','de_sau'].includes(p.bam))sach={goi:p.goi,bam:p.bam};
    else return;
    try{
      if(location.hostname==='banhmi-collab.github.io'){
        if(window['ga-disable-G-8TG4SYPDPV'])return;
        window.gtag?.('event',ten,{send_to:'G-8TG4SYPDPV',nen_tang:'web',game:'daytro',...sach});
      }else window.warmJarThongKe?.(ten,sach);
    }catch{ /* Thống kê lỗi vẫn chuyển khoản được. */ }
  }
  const css=document.createElement('style');css.textContent=`
    .web-tt-buoc{padding:8px 10px;background:#f8efdF;border-radius:8px;font-size:13px;line-height:1.45}
    .web-tt-buoc p{margin:3px 0;font-size:13px}.web-tt-nut{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}
    .web-hop .web-tt-nut button{min-height:44px;border:1px solid #96785f;border-radius:8px;padding:8px 5px;background:#fff8ee;color:#543b24;font:inherit;font-size:13px;line-height:1.3}
    .web-hop .web-tt-nut button.web-tt-chinh{grid-column:1/-1;min-height:48px;background:#6b4a33;border-color:#6b4a33;color:#fff;font-weight:700;font-size:15px}
    .web-tt-chon{width:100%;min-height:44px;padding:8px;font:inherit;user-select:text}.web-tt-bao{font-size:13px;overflow-wrap:anywhere}
    .web-tt-app{grid-column:1/-1;margin:2px 0 4px;font-size:13px}.web-tt-app p{margin:2px 0 6px;font-weight:700}.web-tt-luoi{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
    .web-hop .web-tt-luoi button{min-height:44px;padding:4px 2px;border:1px solid #96785f;border-radius:8px;background:#fff;color:#3b2f25;font:inherit;font-size:12px;line-height:1.2;overflow-wrap:anywhere}
    .web-hop .web-tt-khac{display:block;margin:6px auto 0;min-height:44px;border:0;background:transparent;color:#543b24;font:inherit;font-size:13px;text-decoration:underline}
    #webNhacDon{background:#f8e4ba;border:1px solid #bc8c45;border-radius:8px;padding:10px;font-size:14px;line-height:1.4;text-align:left}
    #webNhacDon b{color:#543b24}
    #webNhacDon .nhac-nut{display:flex;gap:8px;margin-top:8px}
    #webNhacDon button{min-height:44px;font:inherit;font-weight:700;border-radius:8px;padding:6px 12px;flex:1}
    #webNhacDon .mo{background:#6b4530;color:#fff;border:0}
    #webNhacDon.trong-game{margin:6px 8px;flex-shrink:0}
    #webNhacDon .sau{background:transparent;color:#543b24;border:1px solid #bc8c45;flex:0 0 auto}
  `;document.head.append(css);
  const themChu=(h,t)=>{const p=document.createElement('p');p.textContent=t;h.append(p);return p;};
  // #62: 41/48 người tạo đơn 1–2/11 không chuyển tiền; đang chơi trên chính điện thoại nên phải tự tìm app ngân hàng.
  // Link VietQR chỉ mở app (không điền sẵn tiền/nội dung) nên không gửi kèm số tài khoản; người chơi quét ảnh QR đã lưu.
  const APP=[['mb','MB'],['vcb','VCB'],['vba','Agribank'],['icb','VietinBank'],['bidv','BIDV'],['tcb','Techcom'],['vpb','VPBank'],['tpb','TPBank'],
    ['acb','ACB'],['cake','Cake'],['timo','Timo'],['ocb','OCB'],['lpb','LPBank'],['hdb','HDBank'],['vib-2','VIB'],['shb','SHB'],['seab','SeABank'],['shbvn','Shinhan'],['scb','SCB'],['eib','Eximbank'],['abb','ABBank'],['nab','Nam A Bank']];
  const K_APP='daytro-app-ngan-hang';
  function moApp(nd){
    const hop=document.createElement('div');hop.className='web-tt-app';
    themChu(hop,'Mở app ngân hàng của bạn:');
    const luoi=document.createElement('div');luoi.className='web-tt-luoi';hop.append(luoi);
    let quen='';try{quen=localStorage.getItem(K_APP)||'';}catch{ /* Không nhớ được thì giữ thứ tự mặc định. */ }
    const ds=[...APP].sort((a,b)=>(b[0]===quen)-(a[0]===quen));
    const them=([id,ten],an)=>{
      const b=document.createElement('button');b.type='button';b.textContent=ten;b.dataset.ttApp=id;b.hidden=an;
      b.onclick=()=>{
        try{localStorage.setItem(K_APP,id);}catch{ /* Vẫn mở app được. */ }
        // Chép sẵn nội dung đơn: chuyển khoản tay trong app vẫn dán đúng mã để game tự mở.
        try{navigator.clipboard?.writeText(nd).catch(()=>{});}catch{ /* Không chép được vẫn mở app. */ }
        // Tab mới: trang QR + kiểm tra tiền vẫn chạy, chuyển xong quay lại là thấy game mở.
        window.open('https://dl.vietqr.io/pay?app='+encodeURIComponent(id),'_blank','noopener');
        ghi('web_tt_nut',{loai:'mo_app',kq:'ok'});
      };
      luoi.append(b);return b;
    };
    ds.forEach((x,i)=>them(x,i>=8));
    const khac=document.createElement('button');khac.type='button';khac.textContent='Ngân hàng khác…';khac.className='web-tt-khac';
    khac.onclick=()=>{luoi.querySelectorAll('[hidden]').forEach(b=>b.hidden=false);khac.remove();};
    hop.append(khac);
    return hop;
  }
  function hien(q,n,tien,nd){
    const hd=document.createElement('div');hd.className='web-tt-buoc';q.before(hd);
    const diDong=matchMedia('(max-width:600px)').matches||navigator.maxTouchPoints>0||/Android|iPhone|iPad/i.test(navigator.userAgent);
    const trongApp=/TikTok|musical_ly|Bytedance|FBAN|FBAV|FB_IAB|Messenger|Instagram|Zalo|Line\//i.test(navigator.userAgent);
    // Mã QR hiện ngay trên điện thoại đang chơi nên không quét trực tiếp được: phải lưu ảnh rồi quét từ ảnh.
    // Trình duyệt trong TikTok/Facebook/Zalo thường chặn tải ảnh, chụp màn hình thì luôn được.
    for(const t of diDong?[trongApp?'① Chụp màn hình mã QR này (hoặc nhấn giữ ảnh QR → Lưu ảnh)':'① Bấm “Lưu ảnh QR” ngay dưới (hoặc chụp màn hình)','② Bấm tên ngân hàng của bạn ngay dưới → app mở ra → Quét QR → chọn ảnh vừa lưu','③ Quay lại đây, game tự mở khi nhận tiền','Không quét được? Sao chép số tài khoản và nội dung để chuyển khoản tay.']:['Quét QR bằng app ngân hàng trên điện thoại'])themChu(hd,t);
    const nhom=document.createElement('div');nhom.className='web-tt-nut';
    const bao=document.createElement('div');bao.className='web-tt-bao';bao.setAttribute('role','status');
    q.parentNode.append(nhom,bao);
    if(trongApp)themChu(bao,'Nhấn giữ ảnh QR để lưu vào máy');
    function nut(nhan,loai,fn){const b=document.createElement('button');b.type='button';b.textContent=nhan;b.dataset.ttNut=loai;b.onclick=()=>fn(b);nhom.append(b);return b;}
    async function chep(b,loai,noiDung){
      const nhan=b.dataset.nhan||b.textContent;b.dataset.nhan=nhan;
      try{await navigator.clipboard.writeText(noiDung);bao.replaceChildren();b.textContent='Đã chép ✓';clearTimeout(b.henChep);b.henChep=setTimeout(()=>b.textContent=nhan,2000);ghi('web_tt_nut',{loai,kq:'ok'});}
      catch{bao.replaceChildren();themChu(bao,'Nhấn giữ phần chữ đã chọn để sao chép.');const o=document.createElement('input');o.readOnly=true;o.className='web-tt-chon';o.value=noiDung;o.setAttribute('aria-label',nhan+' bằng cách nhấn giữ');bao.append(o);o.focus();o.select();o.setSelectionRange(0,noiDung.length);ghi('web_tt_nut',{loai,kq:'loi'});}
    }
    function luuQR(){
      try{
        const goc=q.querySelector('canvas');if(!goc)throw Error('Chưa có ảnh');
        const anh=document.createElement('canvas'),le=16;anh.width=goc.width+le*2;anh.height=goc.height+le*2;
        const ve=anh.getContext('2d');ve.fillStyle='#fff';ve.fillRect(0,0,anh.width,anh.height);ve.drawImage(goc,le,le);
        const a=document.createElement('a');if(!('download'in a))throw Error('Không tải được');
        a.download='day-tro-'+nd.replace(/[^A-Za-z0-9_-]+/g,'-')+'.png';a.href=anh.toDataURL('image/png');document.body.append(a);try{a.click();}finally{a.remove();}
        bao.replaceChildren();themChu(bao,'Nếu ảnh chưa lưu: Nhấn giữ ảnh QR để lưu vào máy');ghi('web_tt_nut',{loai:'luu_qr',kq:'ok'});
      }catch{bao.replaceChildren();themChu(bao,'Nhấn giữ ảnh QR để lưu vào máy');ghi('web_tt_nut',{loai:'luu_qr',kq:'loi'});}
    }
    // Điện thoại: nút lưu ảnh đứng đầu, to, khớp bước ①; máy tính giữ thứ tự cũ.
    // #62: hàng ngân hàng ngay dưới nút lưu ảnh, đúng thứ tự bước ① → ②.
    if(diDong){nut('Lưu ảnh QR','luu_qr',luuQR).classList.add('web-tt-chinh');nhom.append(moApp(nd));}
    nut('Sao chép số tài khoản','stk',b=>chep(b,'stk',n.soTk));
    nut('Sao chép nội dung','noi_dung',b=>chep(b,'noi_dung',nd));
    if(Number.isSafeInteger(tien)&&tien>0)nut('Sao chép số tiền','so_tien',b=>chep(b,'so_tien',String(tien)));
    if(!diDong)nut('Lưu ảnh QR','luu_qr',luuQR);
  }
  let daNhac=false;
  // goiChu: tên gói và giá, ví dụ "Mở bản đầy đủ · 19.000đ". Nhắc rõ người chơi đã chọn gì để quay lại trả nốt.
  function nhacDon(ma,tiepTuc,chuaTra=true,hetHan=false,goiChu=''){
    if(daNhac)return;daNhac=true;
    const p=document.createElement('aside');p.id='webNhacDon';
    const c=document.createElement('p');c.style.margin='0';
    const dam=s=>{const b=document.createElement('b');b.textContent=s;return b;};
    if(hetHan)c.append('Bạn từng chọn ',goiChu?dam(goiChu):'một gói',' nhưng chưa chuyển. Mở mã QR mới để thanh toán nhé.');
    else if(chuaTra)c.append(goiChu?'Gói ':'Đơn '+ma+': ',goiChu?dam(goiChu):'',goiChu?' bạn chọn vẫn đang chờ. Chuyển xong là game tự mở.':'chưa chuyển. Chuyển xong là game tự mở.');
    else c.append('Đơn '+ma+(goiChu?' ('+goiChu+')':'')+' đang chờ kiểm tra.');
    p.append(c);
    const hang=document.createElement('div');hang.className='nhac-nut';
    const b=document.createElement('button');b.type='button';b.className='mo';b.textContent=chuaTra||hetHan?'Mở lại mã QR':'Xem đơn';b.onclick=()=>{ghi('web_tt_nhac_don',{bam:1});p.remove();tiepTuc();};
    const s=document.createElement('button');s.type='button';s.className='sau';s.textContent='Để sau';s.onclick=()=>{ghi('web_tt_nhac_don',{bam:2});p.remove();};
    hang.append(b,s);p.append(hang);
    (document.getElementById('nutMo')?.parentNode||document.body).append(p);ghi('web_tt_nhac_don',{bam:0});
    // Người chơi thường bấm Chơi tiếp ngay: màn đầu đóng thì đưa lời nhắc vào game, dưới thanh trên cùng.
    const man=document.getElementById('moDau');
    if(man&&man.contains(p)){const doi=new MutationObserver(()=>{if(man.classList.contains('hien'))return;doi.disconnect();const tren=document.querySelector('#game .tren');if(p.isConnected&&tren){tren.after(p);p.classList.add('trong-game');}});doi.observe(man,{attributes:true,attributeFilter:['class']});}
  }
  W.thanhToanDe={hien,nhacDon,ghi};
})();
