// Bản chơi thử trên web: cho chơi hết tháng đầu (chuyện của bà), rồi mời chờ bản đầy đủ.
// Chỉ nằm trong website, không có trong app Android.
(() => {
  const KHOA = 'day-tro-cua-toi-v2';
  const thang = () => { try { return JSON.parse(localStorage.getItem(KHOA) || '{}').thang || 0; } catch { return 0; } };
  const dangMoBang = () => document.querySelector('.phu.hien');
  let yen = 0, daHien = false;
  const hien = () => {
    daHien = true;
    const m = document.createElement('div');
    m.id = 'hetBanThu';
    m.innerHTML = `<div class="hop">
      <div class="to">🏠✨</div>
      <h2>Hết bản chơi thử rồi!</h2>
      <p>Bạn đã giữ dãy trọ của bà qua tháng đầu tiên. Bản đầy đủ có thêm Linh, Tú, quán trà sữa, mèo cưng và cả mùa Tết — sắp ra mắt trên <b>Google Play</b>.</p>
      <a class="nut" href="https://www.facebook.com/groups/xomtrowarmjar" target="_blank" rel="noopener noreferrer">Vào nhóm Xóm Trọ</a>
      <button class="lai" type="button">Chơi lại từ đầu</button>
    </div>`;
    const css = document.createElement('style');
    css.textContent = `#hetBanThu{position:fixed;inset:0;z-index:99999;background:rgba(40,30,20,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Be Vietnam Pro',system-ui,sans-serif}
#hetBanThu .hop{background:#FFF8EE;color:#3B2F25;max-width:360px;width:100%;border-radius:18px;padding:22px 20px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.3)}
#hetBanThu .to{font-size:40px}#hetBanThu h2{margin:6px 0 8px;font-size:21px}#hetBanThu p{font-size:15px;line-height:1.5;margin:0 0 16px}
#hetBanThu .nut{display:block;background:#E07A5F;color:#fff;text-decoration:none;border-radius:12px;padding:13px;font-weight:700;margin-bottom:10px}
#hetBanThu .lai{background:none;border:0;color:#7A6A5A;text-decoration:underline;font-size:14px;cursor:pointer;padding:8px}`;
    document.head.appendChild(css);
    document.body.appendChild(m);
    m.querySelector('.lai').onclick = () => { try { localStorage.removeItem(KHOA); } catch {} location.reload(); };
  };
  setInterval(() => {
    if (daHien) return;
    // Chờ hết tháng 1 và người chơi đọc xong thư/bảng đang mở (thư của bà) rồi mới hiện.
    yen = thang() >= 1 && !dangMoBang() ? yen + 1 : 0;
    if (yen >= 3) hien();
  }, 1000);
})();
