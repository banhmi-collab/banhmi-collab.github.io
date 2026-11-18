// #80 (Thảo duyệt 18/11) chỉ web: tháng đầu của người mới gọn hơn + lịch ghi đúng tháng thuê.
// Chỉ đổi giao diện: không đổi tiền, luật, RNG hay ván lưu.
(() => {
  'use strict';
  if (window.ReactNativeWebView) return;
  // Người mới: chưa xong hướng dẫn hoặc chưa qua tháng thuê đầu. Ván cũ (đã qua tháng 1) không bị ẩn gì.
  const moi = () => typeof st !== 'undefined' && !!st && ((typeof hdXong !== 'undefined' && !hdXong) || (st.thang || 0) < 1);
  const capNhat = () => document.body.classList.toggle('web80-moi', moi());
  const css = document.createElement('style');
  // Ẩn tạm: phòng/mặt bằng đang khoá, Khoe phòng, Xóm trọ, Quay lộc, dải sự kiện mùa. Sau tháng 1 hiện lại như cũ.
  css.textContent = 'body.web80-moi #dayPhong .tab.khoa,body.web80-moi #dayPhong .tab[aria-label="Khoe phòng"],body.web80-moi #dayPhong .tab[aria-label="Xóm trọ"],body.web80-moi #dayPhong .tab[aria-label="Quay lộc hôm nay"],body.web80-moi #web44Dai{display:none!important}';
  document.head.append(css);
  setInterval(capNhat, 500); capNhat();

  // Chữ chạy "Xong việc: … bấm Việc hôm nay nhận thưởng" chen giữa bong bóng hướng dẫn: tháng đầu bỏ qua,
  // nút Việc hôm nay vẫn đếm và nhận thưởng như cũ.
  if (typeof loa === 'function') {
    const loaCu = loa;
    loa = function(chu, ...ds) {
      if (moi() && typeof chu === 'string' && /^\s*Xong việc:/.test(chu)) return;
      return loaCu.call(this, chu, ...ds);
    };
  }

  // Lịch: trước đây ghi tháng theo lịch trong game (bắt đầu "THÁNG 10") trong khi chữ ở mọi chỗ khác
  // ("Tháng 2 · Linh nhờ…", "Mai chơi tiếp tháng 6") đếm tháng thuê. Ghi theo tháng thuê; dịp Tết giữ nguyên.
  if (typeof veLich === 'function') {
    const veCu = veLich;
    veLich = function(...a) {
      const r = veCu.apply(this, a);
      try {
        const l = document.getElementById('lich');
        if (l && typeof st !== 'undefined' && st && !(typeof laTet === 'function' && laTet())) {
          const so = (st.thang || 0) + 1;
          const t = l.querySelector('.thang'), s = l.querySelector('.so'), n = l.querySelector('.thu');
          if (t) t.textContent = 'THÁNG';
          if (s) s.textContent = so;
          if (n) n.textContent = 'thuê';
          l.setAttribute('aria-label', 'Tháng thuê thứ ' + so);
        }
      } catch { /* Lịch lỗi vẫn chơi được. */ }
      return r;
    };
    try { veLich(); } catch {}
  }
  window.ThangDauWeb = { moi, capNhat };
})();
