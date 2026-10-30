// Tiện ích chuyển khoản chỉ web; không thay QR, tài khoản hay API nhận tiền.
(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.DayTroWeb)return;
  const W=window.DayTroWeb;
  const goiDaXem=new Set();
  function ghi(ten,p={}){
    let sach;
    if(ten==='web_tt_nut'&&['stk','noi_dung','so_tien','luu_qr','mo_app'].includes(p.loai)&&['ok','loi'].includes(p.kq))sach={loai:p.loai,kq:p.kq};
    else if(ten==='web_tt_nhac_don'&&[0,1].includes(p.bam))sach={bam:p.bam};
    else if(ten==='web_ch_xem_goi'&&['goi_tet','goi_noel','meo_cung','khoi_nghiep'].includes(p.goi)){
      const khoa='daytro-xem-goi-'+p.goi;
      if(goiDaXem.has(p.goi))return;
      try{if(sessionStorage.getItem(khoa)==='1')return;sessionStorage.setItem(khoa,'1');}catch{ /* Phiên hiện tại vẫn chống lặp khi trình duyệt chặn lưu. */ }
      goiDaXem.add(p.goi);sach={goi:p.goi};
    }
    else if(ten==='web_moi_them'&&['goi_tet','goi_noel','meo_cung','khoi_nghiep'].includes(p.goi)&&['mua','de_sau'].includes(p.bam))sach={goi:p.goi,bam:p.bam};
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
    #webNhacDon{background:#f8e4ba;border:1px solid #bc8c45;border-radius:8px;padding:8px;font-size:13px;line-height:1.4}
    #webNhacDon button{min-height:44px;font:inherit;color:#543b24;background:transparent;border:0;text-decoration:underline}
  `;document.head.append(css);
  const themChu=(h,t)=>{const p=document.createElement('p');p.textContent=t;h.append(p);return p;};
  function hien(q,n,tien,nd){
    const hd=document.createElement('div');hd.className='web-tt-buoc';q.before(hd);
    const diDong=matchMedia('(max-width:600px)').matches||navigator.maxTouchPoints>0||/Android|iPhone|iPad/i.test(navigator.userAgent);
    const trongApp=/TikTok|musical_ly|Bytedance|FBAN|FBAV|FB_IAB|Messenger|Instagram|Zalo|Line\//i.test(navigator.userAgent);
    // Mã QR hiện ngay trên điện thoại đang chơi nên không quét trực tiếp được: phải lưu ảnh rồi quét từ ảnh.
    // Trình duyệt trong TikTok/Facebook/Zalo thường chặn tải ảnh, chụp màn hình thì luôn được.
    for(const t of diDong?[trongApp?'① Chụp màn hình mã QR này (hoặc nhấn giữ ảnh QR → Lưu ảnh)':'① Bấm “Lưu ảnh QR” ngay dưới (hoặc chụp màn hình)','② Mở app ngân hàng → Quét QR → chọn ảnh vừa lưu','③ Quay lại đây, game tự mở khi nhận tiền','Không quét được? Sao chép số tài khoản và nội dung để chuyển khoản tay.']:['Quét QR bằng app ngân hàng trên điện thoại'])themChu(hd,t);
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
    if(diDong)nut('Lưu ảnh QR','luu_qr',luuQR).classList.add('web-tt-chinh');
    nut('Sao chép số tài khoản','stk',b=>chep(b,'stk',n.soTk));
    nut('Sao chép nội dung','noi_dung',b=>chep(b,'noi_dung',nd));
    if(Number.isSafeInteger(tien)&&tien>0)nut('Sao chép số tiền','so_tien',b=>chep(b,'so_tien',String(tien)));
    if(!diDong)nut('Lưu ảnh QR','luu_qr',luuQR);
  }
  let daNhac=false;
  function nhacDon(ma,tiepTuc,chuaTra=true,hetHan=false){
    if(daNhac)return;daNhac=true;
    const p=document.createElement('aside');p.id='webNhacDon';
    themChu(p,hetHan?'Đơn cũ đã hết hạn':'Bạn còn đơn '+ma+(chuaTra?' chưa chuyển':' đang chờ kiểm tra'));
    const b=document.createElement('button');b.textContent=hetHan?'Tạo đơn mới':'Tiếp tục thanh toán';b.onclick=()=>{ghi('web_tt_nhac_don',{bam:1});p.remove();tiepTuc();};p.append(b);
    (document.getElementById('nutMo')?.parentNode||document.body).append(p);ghi('web_tt_nhac_don',{bam:0});
  }
  W.thanhToanDe={hien,nhacDon,ghi};
})();
