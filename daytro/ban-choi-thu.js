// Bản chơi thử trên web: cho chơi qua 3 tháng đầu, rồi mời chờ bản đầy đủ.
// Chỉ nằm trong website, không có trong app Android.
(() => {
  const KHOA = 'day-tro-cua-toi-v2';
  const thang = () => { try { return JSON.parse(localStorage.getItem(KHOA) || '{}').thang || 0; } catch { return 0; } };
  const dangMoBang = () => document.querySelector('.phu.hien:not(#moDau)');
  let yen = 0, daHien = false;
  const hien = () => {
    if (document.getElementById('hetBanThu')) return;
    const lanDau = !daHien;
    daHien = true;
    const m = document.createElement('div');
    m.id = 'hetBanThu';
    m.innerHTML = `<div class="hop">
      <div class="bieu-tuong">🏠✨</div>
      <h2>Hết bản chơi thử rồi!</h2>
      <p>Bạn đã giữ dãy trọ của bà qua 3 tháng đầu. Bản đầy đủ có thêm Linh, Tú, quán trà sữa, mèo cưng và cả mùa Tết — sắp ra mắt trên <b>Google Play</b>.</p>
      <a class="nut" href="https://www.facebook.com/groups/xomtrowarmjar" target="_blank" rel="noopener noreferrer">Vào nhóm Xóm Trọ</a>
      <button class="lai" type="button">Chơi lại từ đầu</button>
      <button class="dong-ban-thu" type="button">Đóng, xem dãy trọ</button>
    </div>`;
    const css = document.createElement('style');
    css.textContent = `#hetBanThu{position:fixed;inset:0;z-index:99999;background:rgba(40,30,20,.72);display:flex;overflow-y:auto;overscroll-behavior:contain;padding:1rem;font-family:'Be Vietnam Pro',system-ui,sans-serif}
#hetBanThu .hop{flex:none;margin:auto;background:#FFF8EE;color:#3B2F25;max-width:360px;width:100%;border-radius:18px;padding:1.375rem 1.25rem;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.3)}
#hetBanThu .bieu-tuong{font-size:2.5rem}#hetBanThu h2{margin:.375rem 0 .5rem;font-size:1.3125rem}#hetBanThu p{font-size:.9375rem;line-height:1.5;margin:0 0 1rem}
#hetBanThu .nut{display:block;background:#E07A5F;color:#fff;text-decoration:none;border-radius:12px;padding:.8125rem;font-size:1rem;font-weight:700;margin-bottom:.625rem}
#hetBanThu .lai,#hetBanThu .dong-ban-thu{display:block;margin:0 auto;background:none;border:0;color:#7A6A5A;text-decoration:underline;font:inherit;font-size:.875rem;cursor:pointer;padding:.5rem;min-height:44px}`;
    if (lanDau) document.head.appendChild(css);
    document.body.appendChild(m);
    if (lanDau) try { window.warmJarThongKe?.('het_ban_thu'); } catch { /* Game vẫn chạy khi thống kê lỗi. */ }
    m.querySelector('.lai').onclick = () => { try { localStorage.removeItem(KHOA); } catch {} location.reload(); };
    m.querySelector('.dong-ban-thu').onclick = () => {
      // Khi tải lại, mở đúng ván đã lưu để nút Đóng dẫn về dãy trọ.
      if (document.querySelector('#moDau.hien')) document.getElementById('nutMo')?.click();
      m.remove();
    };
  };
  // Điểm chặn sang tháng chỉ được ghép vào bản web; đóng lớp không xoá ván.
  window.moHetBanThu = hien;
  setInterval(() => {
    if (daHien) return;
    // Chờ qua 3 tháng và người chơi đọc xong thư/bảng đang mở rồi mới hiện.
    yen = thang() >= 3 && !dangMoBang() ? yen + 1 : 0;
    if (yen >= 3) hien();
  }, 1000);
})();
