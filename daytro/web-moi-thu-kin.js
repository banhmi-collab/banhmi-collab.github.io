// Lời mời thử kín chỉ ở trình duyệt Android, không thay ván chơi.
(() => {
  'use strict';
  if (window.ReactNativeWebView || !/Android/i.test(navigator.userAgent)) return;
  const khoa = 'day-tro-moi-thu-kin', khoaTuChoi = 'day-tro-web-tu-choi-ban-thu', tuan = 7 * 86400000;
  let bat = false, daHien = false, nutCaiDat;
  const doc = () => { try { return JSON.parse(localStorage.getItem(khoa)) || {}; } catch { return {}; } };
  const luu = v => { try { localStorage.setItem(khoa, JSON.stringify(v)); } catch {} };
  const ghi = (ten, thamSo = {}) => { try { window.warmJarThongKe?.(ten, thamSo); } catch {} };
  const daMua = () => { try { return !!JSON.parse(localStorage.getItem('day-tro-web-day-du')); } catch { return false; } };
  const thang = () => typeof st !== 'undefined' && st ? st.thang : null;
  function ghiMocMua() {
    if (!daMua() || !Number.isFinite(thang())) return;
    const cu = doc();
    // Quyền cũ chưa có mốc: đợi thêm một tháng từ lần đầu ghi nhận.
    if (!Number.isFinite(cu.thangMo)) luu({...cu, thangMo: thang()});
  }
  function nhomMoi() {
    ghiMocMua();
    if (daMua()) return Number.isFinite(doc().thangMo) && thang() >= doc().thangMo + 1 ? 'da_mua' : null;
    try { return Number(localStorage.getItem(khoaTuChoi)) >= 2 ? 'tu_choi' : null; } catch { return null; }
  }
  window.addEventListener('webMoDayDu', ghiMocMua);
  window.addEventListener('webDongHetBanThu', () => {
    if (daMua()) return;
    try { localStorage.setItem(khoaTuChoi, String((Number(localStorage.getItem(khoaTuChoi)) || 0) + 1)); } catch {}
    hien();
  });
  ghiMocMua();
  function dong() { document.getElementById('moiThuKin')?.remove(); if (typeof tiepHang === 'function') tiepHang(); }
  function deSau() { const cu = doc(); luu({...cu, lanSau: Date.now() + tuan}); ghi('web_moi_thu_kin_de_sau'); dong(); }
  function nut(hop, chu, bam, lop = 'nut') {
    const b = document.createElement('button'); b.type = 'button'; b.className = lop;
    b.textContent = chu; b.style.minHeight = '44px'; b.onclick = bam; hop.append(b); return b;
  }
  function hien(thuCong = false) {
    if (!bat || document.querySelector('.web-bang,#hetBanThu,#moiThuKin') || (!thuCong && document.querySelector('.phu.hien'))) return;
    const cu = doc();
    const nhom = nhomMoi();
    if (!thuCong && (!nhom || daHien || cu.daNhan || (cu.soLan || 0) >= 2 || cu.lanSau > Date.now())) return;
    if (thuCong) document.getElementById('manCD')?.classList.remove('hien');
    else { daHien = true; luu({...cu, soLan: (cu.soLan || 0) + 1, lanSau: Date.now() + tuan}); }
    const lop = document.createElement('div'); lop.id = 'moiThuKin'; lop.className = 'phu toi hien';
    lop.setAttribute('role', 'dialog'); lop.setAttribute('aria-modal', 'true'); lop.setAttribute('aria-labelledby', 'moiThuKinTieuDe');
    const hop = document.createElement('div'); hop.className = 'tam';
    hop.style.cssText = 'max-height:calc(100dvh - 32px);overflow:auto';
    hop.innerHTML = '<h2 id="moiThuKinTieuDe">Giúp Dãy Trọ lên CH Play nha!</h2><p>Bạn dùng Android có thể cùng thử bản CH Play và góp ý để dãy trọ tốt hơn.</p>';
    lop.append(hop); document.body.append(lop); ghi('web_moi_thu_kin_hien', nhom ? {nhom} : {});
    const thamGia = nut(hop, 'Tham gia', () => {
      luu({...doc(), daNhan: true});
      hop.innerHTML = '<h2 id="moiThuKinTieuDe">Cùng thử Dãy Trọ</h2><p>Dùng đúng Gmail đang đăng nhập CH Play cho cả 3 bước nhé.</p>';
      const buoc = [
        ['1. Vào nhóm và bấm tham gia nhóm', 'https://groups.google.com/g/day-tro-testers'],
        ['2. Đăng ký tham gia thử nghiệm', 'https://play.google.com/apps/testing/com.warmjar.daytro'],
        ['3. Cài Dãy Trọ trên CH Play', 'https://play.google.com/store/apps/details?id=com.warmjar.daytro']
      ];
      for (const [i, [chu, url]] of buoc.entries()) {
        const a = document.createElement('a'); a.className = 'nut'; a.textContent = chu;
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.style.cssText = 'display:block;min-height:44px;margin:12px 0;white-space:normal';
        a.onclick = () => ghi('web_moi_thu_kin_bam', {buoc: i + 1}); hop.append(a);
      }
      const p = document.createElement('p'); p.textContent = 'Mở game mỗi ngày một chút trong 2 tuần, góp ý trong mục góp ý của CH Play nha.'; hop.append(p);
      nut(hop, 'Đóng', dong, 'lai').focus();
    });
    nut(hop, 'Để sau', deSau, 'lai'); thamGia.focus();
    lop.addEventListener('keydown', e => { if (e.key === 'Escape') deSau(); });
  }
  fetch('cau-hinh-web.json', {cache: 'no-store'}).then(r => r.ok ? r.json() : {}).then(c => {
    bat = c.moiThuKin === true;
    if (!bat) return;
    const caiDat = document.getElementById('cdXong')?.parentNode;
    if (caiDat) { nutCaiDat = nut(caiDat, 'Chơi bản CH Play thử nghiệm', () => hien(true), 'lai'); nutCaiDat.id = 'nutThuKin'; }
    hien(); setInterval(() => hien(), 1500);
  }).catch(() => {});
})();
