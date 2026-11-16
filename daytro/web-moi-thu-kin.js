// Lời mời chơi trên app CH Play, chỉ ở trình duyệt Android, không thay ván chơi.
// 16/11: app đã lên CH Play công khai (6/11) nên bỏ lời mời "thử kín 2 tuần" (người thử chơi đủ 2 tuần rồi gỡ app).
// Giờ trỏ thẳng trang CH Play + cho sao chép mã ván để dán vào app (Cài đặt → Nhận ván từ web).
// Không tự mời người đã mua bản đầy đủ trên web: quyền mua trên web chưa mang sang app được.
(() => {
  'use strict';
  if (window.ReactNativeWebView || !/Android/i.test(navigator.userAgent)) return;
  const khoa = 'day-tro-moi-app', khoaCu = 'day-tro-moi-thu-kin', khoaTuChoi = 'day-tro-web-tu-choi-ban-thu', tuan = 7 * 86400000;
  const CH_PLAY = 'https://play.google.com/store/apps/details?id=com.warmjar.daytro';
  // maVanApp: chỉ bật khi bản app có “Nhận ván từ web” (vc20+) đã lên CH Play.
  let bat = false, coMa = false, daHien = false, nutCaiDat;
  const docKhoa = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };
  const doc = () => docKhoa(khoa);
  const luu = v => { try { localStorage.setItem(khoa, JSON.stringify(v)); } catch {} };
  const ghi = (ten, thamSo = {}) => { try { window.warmJarThongKe?.(ten, thamSo); } catch {} };
  const daMua = () => { try { return !!JSON.parse(localStorage.getItem('day-tro-web-day-du')); } catch { return false; } };
  function nhomMoi() {
    if (daMua()) return null;
    try { return Number(localStorage.getItem(khoaTuChoi)) >= 2 ? 'tu_choi' : null; } catch { return null; }
  }
  window.addEventListener('webDongHetBanThu', () => {
    if (daMua()) return;
    try { localStorage.setItem(khoaTuChoi, String((Number(localStorage.getItem(khoaTuChoi)) || 0) + 1)); } catch {}
    hien();
  });
  function dong() { document.getElementById('moiThuKin')?.remove(); if (typeof tiepHang === 'function') tiepHang(); }
  function deSau() { const cu = doc(); luu({...cu, lanSau: Date.now() + tuan}); ghi('web_moi_thu_kin_de_sau'); dong(); }
  function nut(hop, chu, bam, lop = 'nut') {
    const b = document.createElement('button'); b.type = 'button'; b.className = lop;
    b.textContent = chu; b.style.minHeight = '44px'; b.onclick = bam; hop.append(b); return b;
  }
  function chu(hop, t) { const p = document.createElement('p'); p.textContent = t; hop.append(p); return p; }
  async function saoChep(bao, hop) {
    const api = window.MangVanWeb;
    if (!api?.taoMa) { bao.textContent = 'Chưa tạo được mã ván, bạn tải lại trang thử nhé.'; return; }
    const maCho = api.taoMa();
    try {
      if (navigator.clipboard?.write && window.ClipboardItem) await navigator.clipboard.write([new ClipboardItem({'text/plain': maCho.then(s => new Blob([s], {type: 'text/plain'}))})]);
      else await navigator.clipboard.writeText(await maCho);
    } catch (e) {
      let ma;
      try { ma = await maCho; } catch (e2) { bao.textContent = e2?.message === 'Chưa có ván' ? 'Chơi vài lượt rồi lấy mã nhé.' : 'Chưa tạo được mã ván, bạn thử lại nhé.'; return; }
      let o = hop.querySelector('textarea');
      if (!o) { o = document.createElement('textarea'); o.readOnly = true; o.rows = 3; o.style.cssText = 'width:100%;box-sizing:border-box'; hop.insertBefore(o, bao.nextSibling); }
      o.value = ma; o.select();
      if (!document.execCommand('copy')) { bao.textContent = 'Nhấn giữ ô bên dưới để sao chép mã.'; return; }
    }
    bao.textContent = 'Đã sao chép mã ván. Cài app xong, vào Cài đặt → “Nhận ván từ web” rồi dán mã.';
    ghi('web_moi_thu_kin_bam', {buoc: 1});
  }
  function hien(thuCong = false) {
    if (!bat || document.querySelector('.web-bang,#hetBanThu,#moiThuKin') || (!thuCong && document.querySelector('.phu.hien'))) return;
    const cu = doc();
    const nhom = nhomMoi();
    if (!thuCong && (!nhom || daHien || cu.daNhan || docKhoa(khoaCu).daNhan || (cu.soLan || 0) >= 2 || cu.lanSau > Date.now())) return;
    if (thuCong) document.getElementById('manCD')?.classList.remove('hien');
    else { daHien = true; luu({...cu, soLan: (cu.soLan || 0) + 1, lanSau: Date.now() + tuan}); }
    const lop = document.createElement('div'); lop.id = 'moiThuKin'; lop.className = 'phu toi hien';
    lop.setAttribute('role', 'dialog'); lop.setAttribute('aria-modal', 'true'); lop.setAttribute('aria-labelledby', 'moiThuKinTieuDe');
    const hop = document.createElement('div'); hop.className = 'tam';
    hop.style.cssText = 'max-height:calc(100dvh - 32px);overflow:auto';
    hop.innerHTML = '<h2 id="moiThuKinTieuDe">Dãy Trọ đã có trên CH Play</h2>';
    chu(hop, coMa ? 'Bản app chơi được cả khi không có mạng. Muốn chơi tiếp dãy trọ này trong app: sao chép mã ván, cài app, rồi vào Cài đặt → “Nhận ván từ web” và dán mã.'
      : 'Bản app chơi được cả khi không có mạng. App bắt đầu dãy trọ mới; ván ở web vẫn giữ nguyên, chơi song song được.');
    const nho = chu(hop, coMa ? 'Đồ và quyền đã mua trên web chưa mang sang app được. Ván ở web vẫn giữ nguyên.' : 'Đồ và quyền đã mua trên web chưa mang sang app được.'); nho.style.fontSize = '13px';
    lop.append(hop); document.body.append(lop); ghi('web_moi_thu_kin_hien', nhom && !thuCong ? {nhom} : {});
    const nutMa = coMa ? nut(hop, 'Sao chép mã ván', () => saoChep(bao, hop), 'lai') : null;
    const bao = chu(hop, ''); bao.setAttribute('role', 'status');
    const a = document.createElement('a'); a.className = 'nut'; a.textContent = 'Mở CH Play';
    a.href = CH_PLAY; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.style.cssText = 'display:block;min-height:44px;margin:12px 0;white-space:normal';
    a.onclick = () => { luu({...doc(), daNhan: true}); ghi('web_moi_thu_kin_bam', {buoc: 3}); }; hop.append(a);
    nut(hop, 'Để sau', deSau, 'lai'); (nutMa || a).focus();
    lop.addEventListener('keydown', e => { if (e.key === 'Escape') deSau(); });
  }
  fetch('cau-hinh-web.json', {cache: 'no-store'}).then(r => r.ok ? r.json() : {}).then(c => {
    bat = c.moiThuKin === true; coMa = c.maVanApp === true;
    if (!bat) return;
    const caiDat = document.getElementById('cdXong')?.parentNode;
    if (caiDat) { nutCaiDat = nut(caiDat, 'Chơi trên app CH Play', () => hien(true), 'lai'); nutCaiDat.id = 'nutThuKin'; }
    hien(); setInterval(() => hien(), 1500);
  }).catch(() => {});
})();
