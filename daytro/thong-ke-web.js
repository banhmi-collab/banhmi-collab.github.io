// Chỉ được ghép vào website; không nạp trong app Android.
(() => {
  const MA_DO = 'G-8TG4SYPDPV';
  const trang = { '/': 'links', '/daytro/': 'daytro', '/noitu/': 'noitu', '/click/': 'click' }[location.pathname];
  if (!trang || window.ReactNativeWebView) return;
  const thamSo = new URLSearchParams(location.search);
  let thu = thamSo.get('test') === '1' || thamSo.get('analytics_debug') === '1';
  try {
    if (thu) localStorage.setItem('warmjar_test', '1');
    else if (thamSo.get('test') === '0') localStorage.removeItem('warmjar_test');
    thu = thu || localStorage.getItem('warmjar_test') === '1';
  } catch { /* Trình duyệt chặn lưu vẫn bỏ lượt test hiện tại. */ }
  if (thu) {
    window['ga-disable-' + MA_DO] = true;
    window.warmJarThongKe = () => {};
    const hienNhan = () => {
      if (document.getElementById('warmjar-che-do-test')) return;
      const nhan = document.createElement('div');
      nhan.id = 'warmjar-che-do-test';
      nhan.textContent = '🧪 chế độ test – không đếm';
      nhan.style.cssText = 'position:fixed;bottom:6px;left:6px;z-index:2147483647;padding:4px 7px;border-radius:6px;background:#fff5dc;color:#503a20;font:11px/1.4 sans-serif;pointer-events:none';
      document.body.appendChild(nhan);
    };
    if (document.body) hienNhan();
    else document.addEventListener('DOMContentLoaded', hienNhan, { once: true });
    return;
  }
  // Local luôn không gửi số liệu thật, kể cả khi có test=0.
  if (location.hostname !== 'banhmi-collab.github.io') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const viTri = location.origin + location.pathname; // Không gửi query/hash người chơi nhập.
  const cauHinh = {
    anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false,
    send_page_view: false, page_location: viTri, page_referrer: '',
    page_title: { links: 'Warm Jar Games', daytro: 'Dãy Trọ Của Tôi', noitu: 'Nối Từ 45 Giây', click: 'Cozy Mood Clicker' }[trang],
    nen_tang: 'web', game: trang, transport_type: 'beacon',
  };
  // Chỉ giữ nguồn đã quy ước; không gửi query/hash hay chữ người chơi nhập.
  const nguon = thamSo.get('utm_source');
  if (['tiktok', 'youtube', 'facebook', 'nhom', 'zalo', 'khoe_phong', 'gioi_thieu'].includes(nguon)) {
    cauHinh.campaign_source = nguon;
    cauHinh.campaign_medium = 'social';
  }
  window.gtag('js', new Date());
  window.gtag('config', MA_DO, cauHinh);
  window.gtag('event', 'page_view', { send_to: MA_DO, nen_tang: 'web', game: trang });

  // Chỉ nhận tên sự kiện/khóa đã kiểm tra; bỏ chữ nhập, lỗi, email, ID người chơi.
  const truong = trang === 'noitu' ? ['ms', 'soTu', 'thang', 'doKho']
    : trang === 'click' ? ['muc_tieu', 'hanh_dong', 'bo', 'loai', 'diem', 'upgrade', 'seeds', 'lan_thu', 'ngay', 'chuoi', 'do_hiem']
    : ['moc', 'thang', 'buoc', 'bo_qua', 'nhom', 'dat', 'ket_qua', 'kieu', 'tien', 'mac', 'phong', 'sao', 'ma', 'chon', 'bang', 'doan', 'loai', 'lai', 'goi', 'so', 'cap', 'cho', 'kq', 'thieu', 'hop_le', 'ben', 'bo_di', 'nhom_mo_dau', 'giay', 'ms_tai', 'cach', 'muc', 'app', 'ab_mn'];
  const suKien = trang === 'noitu' ? ['nap_tu_dien', 'tu_bao_da_vao', 'van_bat_dau', 'van_ket_thuc', 'bao_tu_thieu', 'bao_may_la', 'ky_luc_moi']
    : trang === 'click' ? ['muc_tieu_dat', 'su_kien_bat_ngo', 'album_mo', 'chuoi_ngay', 'premium_sheet_opened', 'premium_granted', 'ad_reward_earned', 'prestige_done', 'shop_opened', 'first_upgrade']
    : ['muc_tieu_dat', 'mo_dau', 'xong_mo_dau', 'thu_thach_30', 'mac_ca', 'cho_thue', 'mo_phong', 'het_thang', 'bi_bung', 'su_kien', 'mo_bang', 'chuyen_khach', 'xong_huong_dan', 'khoe_phong', 'mo_mat_bang', 'tra_sua', 'tiem_banh', 'mua_nha', 'bam_mua', 'goi_xem_khoa', 'xong_viec', 'mo_ruong', 'thanh_tich', 'danh_hieu', 'choi_lai', 'xem_qc', 'bat_dau', 'het_ban_thu', 'web_bam_mua', 'web_tao_don', 'web_mo_khoa', 'web_ung_ho_mo', 'web_khoe_chia_se', 'web_pwa_goi_y', 'web_pwa_cai', 'web_moi_thu_kin_hien', 'web_moi_thu_kin_bam', 'web_moi_thu_kin_de_sau', 'ab_het_luot_ngay', 'web_xoay_do', 'web_thu_thach_xong', 'web_trong_app_hien', 'web_trong_app_mo_chrome', 'web_khoi_phuc_du_may', 'web_ung_ho_chon', 'hd_buoc', 'man_dau_hien', 'web_sk_khach', 'web_hoan_thanh', 'web_khach_trum', 'web_pccc', 'web_tai_xong', 'web_ch_xem_goi', 'web_moi_mo', 'web_moi_qua'];
  window.warmJarThongKe = (ten, thamSo = {}) => {
    try {
      if (!suKien.includes(ten)) return;
      // Chỉ gửi tham số phễu đã định nghĩa.
      // Sự kiện chia sẻ/cài không mang dữ liệu người chơi.
      const nhomMoiNgay = ['A','B'].includes(thamSo.ab_mn) ? thamSo.ab_mn : null;
      // Món khóa chỉ gửi mã gói.
      if (ten === 'web_moi_mo') { if (![0,1].includes(thamSo.hop_le)) return; thamSo={hop_le:thamSo.hop_le}; } else if (ten === 'web_moi_qua') { if (!['gui','nhan'].includes(thamSo.ben)) return; thamSo={ben:thamSo.ben}; } else if (ten === 'web_ch_xem_goi') { if (!['goi_tet','goi_noel','meo_cung','khoi_nghiep'].includes(thamSo.goi)) return; thamSo={goi:thamSo.goi}; } else if (ten === 'web_tai_xong') { if (!['0_1','1_3','3_6','6_10','tren_10'].includes(thamSo.giay) || ![0,1].includes(thamSo.bo_di)) return; thamSo={giay:thamSo.giay,bo_di:thamSo.bo_di}; } else if (ten === 'web_sk_khach') {
        if (!['doiChoDo','phongToi','nuoiCa','lauChung','ganKhoa','giuXe','trongRau','treoPoster'].includes(thamSo.ma) || !['a','b'].includes(thamSo.chon)) return;
        thamSo = {ma:thamSo.ma,chon:thamSo.chon};
      } else if (ten === 'web_hoan_thanh') {
        if (![25,50,75,100].includes(thamSo.moc)) return; thamSo = {moc:thamSo.moc};
      } else if (ten === 'web_khach_trum') {
        if (!['coGiao','anhKien','chiBau','sepNho','voChongTre','cuGia'].includes(thamSo.ma) || !['thue','bo_qua'].includes(thamSo.kq)) return;
        thamSo = {ma:thamSo.ma,kq:thamSo.kq};
      } else if (ten === 'web_pccc') {
        if (!['dat','thieu'].includes(thamSo.kq) || !Number.isInteger(thamSo.thieu) || thamSo.thieu<0 || thamSo.thieu>6) return;
        thamSo = {kq:thamSo.kq,thieu:thamSo.thieu};
      } else if (ten === 'hd_buoc') { if (!['rac','keo_do','cho_thue','het_thang'].includes(thamSo.buoc) || !Number.isFinite(thamSo.giay) || thamSo.giay < 0) return; thamSo={buoc:thamSo.buoc,giay:Math.round(thamSo.giay)}; } else if (ten === 'man_dau_hien') { if (!Number.isFinite(thamSo.ms_tai) || thamSo.ms_tai < 0) return; thamSo={ms_tai:Math.round(thamSo.ms_tai)}; } else if (ten === 'web_ung_ho_chon') { if (![10000,20000,50000,'tu_nhap'].includes(thamSo.muc)) return; thamSo={muc:thamSo.muc}; } else if (ten === 'web_trong_app_hien') { if (!['fb','messenger','tiktok','zalo','ig','khac'].includes(thamSo.app)) return; thamSo={app:thamSo.app}; } else if (['web_trong_app_mo_chrome','web_khoi_phuc_du_may'].includes(ten)) thamSo={}; else if (ten === 'web_xoay_do') { if (!['don','cum','nho'].includes(thamSo.kieu)) return; thamSo={kieu:thamSo.kieu}; } else if (ten === 'web_thu_thach_xong') { if (!['don_sach','xep_gon','doc_so','lau_cua','khoe_phong','sam_do','trang_tri','sua_do','don_khach','qua_thang','mac_ca','ba_phong','sau_phong','tiem_banh','tra_sua'].includes(thamSo.ma)) return; thamSo={ma:thamSo.ma}; } else if (ten === 'web_moi_thu_kin_bam') { if (![1,2,3].includes(thamSo.buoc)) return; thamSo = {buoc:thamSo.buoc}; } else if (ten === 'web_moi_thu_kin_hien') thamSo = ['da_mua','tu_choi'].includes(thamSo.nhom) ? {nhom:thamSo.nhom} : {}; else if (ten === 'web_moi_thu_kin_de_sau') thamSo = {}; else if (ten === 'goi_xem_khoa') {
        if (!['goi_tet','goi_noel','meo_cung','khoi_nghiep'].includes(thamSo.goi)) return;
        thamSo = {goi:thamSo.goi};
      } else if (ten === 'web_khoe_chia_se') {
        if (!['share','tai_ve'].includes(thamSo.cach)) return;
        thamSo = {cach:thamSo.cach};
      } else if (['web_pwa_goi_y','web_pwa_cai'].includes(ten)) thamSo = {};
      else if (ten.startsWith('web_')) {
        if (ten === 'web_ung_ho_mo') thamSo = {};
        else {
          if (!['web_day_du','combo_tet','goi_tet','goi_noel','meo_cung','khoi_nghiep'].includes(thamSo.goi)) return;
          if (ten === 'web_mo_khoa') {
            if (!['tu_dong','ma_tay','khoi_phuc'].includes(thamSo.cach)) return;
            thamSo = {goi:thamSo.goi,cach:thamSo.cach};
          } else thamSo = {goi:thamSo.goi};
        }
      }
      if (nhomMoiNgay) thamSo = {...thamSo, ab_mn:nhomMoiNgay};
      const sach = { send_to: MA_DO, nen_tang: 'web', game: trang };
      for (const khoa of truong) {
        const v = thamSo[khoa];
        if (typeof v === 'number' && Number.isFinite(v)) sach[khoa] = v;
        else if (typeof v === 'boolean') sach[khoa] = v ? 1 : 0;
        else if (khoa === 'doKho' && ['khó', 'thường', 'dễ'].includes(v)) sach[khoa] = v;
        // Các chuỗi tại điểm gọi là mã nội dung game, không phải văn bản người chơi.
        else if (typeof v === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(v)) sach[khoa] = v;
      }
      if (ten === 'web_tai_xong') sach.transport_type='beacon';
      window.gtag('event', ten, sach);
    } catch { /* Thống kê hỏng không được làm hỏng game. */ }
  };
  // Màn HTML đã thấy được trước game; nhận cả khi thống kê tải chậm.
  let daDoManDau = false;
  const doManDau = () => {
    if (daDoManDau || !Number.isFinite(window.dayTroManDau)) return;
    daDoManDau = true;
    window.warmJarThongKe('man_dau_hien', {ms_tai:window.dayTroManDau});
  };
  doManDau(); window.addEventListener?.('daytro:man-dau', doManDau);
  let daDoTai = false;
  const doTai = () => {
    if (daDoTai || !window.dayTroTaiXong) return;
    daDoTai = true; window.warmJarThongKe('web_tai_xong', window.dayTroTaiXong);
  };
  doTai(); window.addEventListener?.('daytro:tai-xong', doTai);
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
