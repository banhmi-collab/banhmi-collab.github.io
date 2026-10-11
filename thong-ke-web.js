// Chỉ được ghép vào website; không nạp trong app Android.
(() => {
  const MA_DO = 'G-8TG4SYPDPV';
  const trang = { '/': 'links', '/daytro/': 'daytro', '/noitu/': 'noitu', '/click/': 'click' }[location.pathname];
  if (!trang || window.ReactNativeWebView) return;
  const debug = new URLSearchParams(location.search).get('analytics_debug') === '1';
  // Local không gửi số liệu thật, trừ khi chủ động mở chế độ DebugView.
  if (location.hostname !== 'banhmi-collab.github.io' && !debug) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const viTri = location.origin + location.pathname; // Không gửi query/hash người chơi nhập.
  const cauHinh = {
    anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false,
    send_page_view: false, page_location: viTri, page_referrer: '',
    page_title: { links: 'Warm Jar Games', daytro: 'Dãy Trọ Của Tôi', noitu: 'Nối Từ 45 Giây', click: 'Cozy Mood Clicker' }[trang],
    nen_tang: 'web', game: trang, transport_type: 'beacon',
  };
  if (debug) cauHinh.debug_mode = true;
  window.gtag('js', new Date());
  window.gtag('config', MA_DO, cauHinh);
  window.gtag('event', 'page_view', { send_to: MA_DO, nen_tang: 'web', game: trang });

  // Chỉ nhận tên sự kiện/khóa đã kiểm tra; bỏ chữ nhập, lỗi, email, ID người chơi.
  const truong = trang === 'noitu' ? ['ms', 'soTu', 'thang', 'doKho']
    : trang === 'click' ? ['muc_tieu', 'hanh_dong', 'bo', 'loai', 'diem', 'upgrade', 'seeds', 'lan_thu', 'ngay', 'chuoi', 'do_hiem']
    : ['moc', 'thang', 'buoc', 'bo_qua', 'nhom', 'dat', 'ket_qua', 'kieu', 'tien', 'mac', 'phong', 'sao', 'ma', 'chon', 'bang', 'doan', 'loai', 'lai', 'goi', 'so', 'cap', 'cho', 'nhom_mo_dau'];
  const suKien = trang === 'noitu' ? ['nap_tu_dien', 'tu_bao_da_vao', 'van_bat_dau', 'van_ket_thuc', 'bao_tu_thieu', 'bao_may_la', 'ky_luc_moi']
    : trang === 'click' ? ['muc_tieu_dat', 'su_kien_bat_ngo', 'album_mo', 'chuoi_ngay', 'premium_sheet_opened', 'premium_granted', 'ad_reward_earned', 'prestige_done', 'shop_opened', 'first_upgrade']
    : ['muc_tieu_dat', 'mo_dau', 'xong_mo_dau', 'thu_thach_30', 'mac_ca', 'cho_thue', 'mo_phong', 'het_thang', 'bi_bung', 'su_kien', 'mo_bang', 'chuyen_khach', 'xong_huong_dan', 'khoe_phong', 'mo_mat_bang', 'tra_sua', 'tiem_banh', 'mua_nha', 'bam_mua', 'xong_viec', 'mo_ruong', 'thanh_tich', 'danh_hieu', 'choi_lai', 'xem_qc', 'bat_dau', 'het_ban_thu'];
  window.warmJarThongKe = (ten, thamSo = {}) => {
    try {
      if (!suKien.includes(ten)) return;
      const sach = { send_to: MA_DO, nen_tang: 'web', game: trang };
      for (const khoa of truong) {
        const v = thamSo[khoa];
        if (typeof v === 'number' && Number.isFinite(v)) sach[khoa] = v;
        else if (typeof v === 'boolean') sach[khoa] = v ? 1 : 0;
        else if (khoa === 'doKho' && ['khó', 'thường', 'dễ'].includes(v)) sach[khoa] = v;
        // Các chuỗi tại điểm gọi là mã nội dung game, không phải văn bản người chơi.
        else if (typeof v === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(v)) sach[khoa] = v;
      }
      window.gtag('event', ten, sach);
    } catch { /* Thống kê hỏng không được làm hỏng game. */ }
  };
  if (trang === 'links') {
    const dichHopLe = ['daytro', 'noitu', 'click', 'nhom', 'tiktok', 'kofi', 'gop_y', 'lam_game'];
    const ghiLink = e => {
      if (e.type === 'auxclick' && e.button !== 1) return;
      const dich = e.target.closest?.('a[data-dich]')?.dataset.dich;
      if (dichHopLe.includes(dich)) {
        try { window.gtag('event', 'bam_lien_ket', { send_to: MA_DO, dich, nen_tang: 'web', game: trang }); } catch {}
      }
    };
    document.addEventListener('click', ghiLink);
    document.addEventListener('auxclick', ghiLink);
  }
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MA_DO;
  document.head.appendChild(tag);
})();
