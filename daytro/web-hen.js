// Chỉ đổi lời hẹn trên web; lịch, khách đã hẹn và phần thưởng thuộc game gốc.
(() => {
  'use strict';
  if (window.ReactNativeWebView) return;
  const loi = {
    ruong: 'Linh có việc nhờ bạn. Làm đủ ba việc là rương gấp đôi tiền.',
    rac: 'Cô Năm hẹn dọn xóm. 5 bãi rác đầu tiên được thêm 20.000đ mỗi bãi.',
    sua: 'Chú Sáu hẹn ghé. Sự cố đầu tiên bạn bấm sửa được miễn phí.',
    lau: 'Linh hẹn ghé xem cửa sổ, sẽ có thêm một việc Lau thưởng 100.000đ.',
    qua: 'Cô Năm để dành một món treo tường còn thiếu cho bạn. Ghé lấy nha! Đủ bộ rồi thì nhận 100.000đ.',
  };
  for (const mau of HEN_MAI) if (loi[mau.ma]) mau.loi = loi[mau.ma];
  const mauCu = mauHen;
  mauHen = function(h) {
    const mau = mauCu(h);
    return h.loai === 'khach' ? {...mau, loi: `${mau.tenKhach} ghé hỏi phòng. Dọn sẵn một phòng trống để đón nha!`} : mau;
  };
  const hienCu = hienHenMai;
  let loiGanNhat = '';
  hienHenMai = function(...ds) {
    // Trả nguyên chữ của game, chỉ gọi một lần để giữ hẹn và số đo cũ.
    const chu = hienCu.apply(this, ds);
    loiGanNhat = chu;
    window.dispatchEvent(new Event('daytro:hen-hien'));
    return chu;
  };
  // Toast thật trước đây không xuống dòng; lời hẹn dài cần đọc đủ trên màn nhỏ.
  const kieu = document.createElement('style');
  kieu.textContent = '#loa.hen-web-71{white-space:pre-line;box-sizing:border-box;width:max-content;max-width:calc(100% - 24px);border-radius:14px;line-height:1.45;overflow-wrap:anywhere}#loa.cho-hen-71{visibility:hidden}';
  document.head.append(kieu);
  for (const id of ['nvHenMai','henQuayLai']) document.getElementById(id)?.setAttribute('data-loi-hen','');
  const loaCu = loa;
  let cho = null, docDen = 0;
  const phanHoi=document.createElement('output');phanHoi.id='phanHoiHen76';phanHoi.hidden=true;
  phanHoi.setAttribute('role','status');phanHoi.setAttribute('aria-live','polite');
  phanHoi.style.cssText='position:absolute;top:56px;left:12px;right:12px;z-index:12;background:#6B4631;color:#fff;padding:8px 12px;border-radius:10px;font:13px/1.4 "Be Vietnam Pro",sans-serif;overflow-wrap:anywhere;pointer-events:none';
  document.getElementById('phongKhung').append(phanHoi);let tatPhanHoi;
  const laHen = chu => !!loiGanNhat && typeof chu === 'string' && chu.includes(loiGanNhat);
  function thuHien() {
    const l = document.getElementById('loa');
    // Hướng dẫn web tự đóng manDem. Dùng mốc game đã ghi, không gọi lại
    // hienHenMai nên không chọn hẹn/thưởng mới hoặc tăng hen_mai_hien.
    if (!cho && Date.now() >= docDen && st?.thang === 1 && st.daHenQuayLai && !st.web71NhacDau) {
      const mai = docHen().mai;
      const mau = mai && mauHen(mai);
      if (mau?.loi) cho = {chu: 'Ngày mai: ' + mau.loi, nhac: true};
    }
    if (!cho) return;
    // Giữ chốt mà PWA vốn đã đợi. Chữ chưa hiện trong lúc tiền bay/bảng mở.
    if (Date.now() < (cho.sau || 0) || document.querySelector('.tien-bay,.phu.hien,.web-bang')) {
      if (!l.classList.contains('cho-hen-71')) l.classList.add('hen-web-71', 'hien', 'cho-hen-71');
      return;
    }
    const canHien = cho; cho = null;
    if (canHien.nhac) { st.web71NhacDau = true; luu(); }
    l.setAttribute('data-loi-hen','');l.classList.remove('cho-hen-71'); l.classList.add('hen-web-71');
    docDen = Date.now() + 6000;
    loaCu.call(window, canHien.chu, 6000);
  }
  loa = function(chu, ...ds) {
    if (laHen(chu)) { cho = {chu, nhac:false, sau:Date.now()+1}; thuHien(); return; }
    // Hiện phản hồi ngay ở dải riêng, không cắt sáu giây hẹn/PWA đang chờ.
    // Lời hẹn đầu ngày và bản đọc lại trong Việc vẫn do game gốc giữ.
    if (cho || Date.now() < docDen) {
      clearTimeout(tatPhanHoi);phanHoi.textContent=chu;phanHoi.hidden=false;
      tatPhanHoi=setTimeout(()=>{phanHoi.hidden=true;},Number(ds[0])||2600);return;
    }
    document.getElementById('loa').removeAttribute('data-loi-hen');document.getElementById('loa').classList.remove('hen-web-71', 'cho-hen-71');
    return loaCu.call(this, chu, ...ds);
  };
  new MutationObserver(thuHien).observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(thuHien, 100);
})();
