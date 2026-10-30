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
  // #47: cùng dấu hiệu appTrongWeb của ban-choi-thu.js; PWA ưu tiên hơn UA.
  // Một lần mỗi phiên tab (sessionStorage); không gửi UA hoặc dữ liệu ván.
  if (trang === 'daytro') {
    const ua = window.navigator?.userAgent || '';
    const appTrongWeb = /Messenger/i.test(ua) ? 'messenger' : /FBAN|FBAV|FB_IAB/i.test(ua) ? 'fb'
      : /Instagram/i.test(ua) ? 'ig' : /Zalo/i.test(ua) ? 'zalo'
      : /BytedanceWebview|musical_ly/i.test(ua) ? 'tiktok' : /Line\//i.test(ua) ? 'khac_app' : 'trinh_duyet';
    const moTrong = window.navigator?.standalone || window.matchMedia?.('(display-mode: standalone)').matches ? 'pwa' : appTrongWeb;
    const choPhep = ['tiktok','fb','messenger','zalo','ig','khac_app','trinh_duyet','pwa'];
    let daGui = false;
    try { daGui = sessionStorage.getItem('day-tro-web-mo-trong-phien') === moTrong; } catch {}
    if (!daGui && choPhep.includes(moTrong)) {
      window.gtag('set', 'user_properties', {mo_trong: moTrong});
      try { sessionStorage.setItem('day-tro-web-mo-trong-phien', moTrong); } catch {}
    }
    // Nhóm A/B mỗi ngày (#23) thành thuộc tính người dùng để tách D1 theo nhóm.
    // ban-choi-thu.js gọi lại khi chia nhóm hoặc nhận nhóm từ ván mang sang; một lần mỗi phiên tab.
    window.warmJarNhomAB = nhom => {
      if (!['A', 'B'].includes(nhom)) return;
      try { if (sessionStorage.getItem('day-tro-web-ab-phien') === nhom) return; sessionStorage.setItem('day-tro-web-ab-phien', nhom); } catch {}
      // Tên khác tham số sự kiện ab_mn (đã đăng ký phạm vi sự kiện) để GA4 không trùng định nghĩa.
      window.gtag('set', 'user_properties', {nhom_ab: nhom});
    };
    try { window.warmJarNhomAB(localStorage.getItem('day-tro-ab-mn')); } catch {}
  }
  window.gtag('config', MA_DO, cauHinh);
  window.gtag('event', 'page_view', { send_to: MA_DO, nen_tang: 'web', game: trang });

  // Chỉ nhận tên sự kiện/khóa đã kiểm tra; bỏ chữ nhập, lỗi, email, ID người chơi.
  const truong = trang === 'noitu' ? ['ms', 'soTu', 'thang', 'doKho']
    : trang === 'click' ? ['muc_tieu', 'hanh_dong', 'bo', 'loai', 'diem', 'upgrade', 'seeds', 'lan_thu', 'ngay', 'chuoi', 'do_hiem']
    : ['moc', 'thang', 'buoc', 'bo_qua', 'nhom', 'dat', 'ket_qua', 'kieu', 'tien', 'mac', 'phong', 'sao', 'ma', 'chon', 'bang', 'doan', 'loai', 'lai', 'goi', 'so', 'cap', 'cho', 'nv', 'kq', 'thieu', 'hop_le', 'ben', 'bo_di', 'nhom_mo_dau', 'giay', 'ms_tai', 'cach', 'muc', 'app', 'ab_mn'];
  const suKien = trang === 'noitu' ? ['nap_tu_dien', 'tu_bao_da_vao', 'van_bat_dau', 'van_ket_thuc', 'bao_tu_thieu', 'bao_may_la', 'ky_luc_moi']
    : trang === 'click' ? ['muc_tieu_dat', 'su_kien_bat_ngo', 'album_mo', 'chuoi_ngay', 'premium_sheet_opened', 'premium_granted', 'ad_reward_earned', 'prestige_done', 'shop_opened', 'first_upgrade']
    : ['muc_tieu_dat', 'mo_dau', 'xong_mo_dau', 'thu_thach_30', 'mac_ca', 'cho_thue', 'mo_phong', 'het_thang', 'bi_bung', 'su_kien', 'mo_bang', 'chuyen_khach', 'xong_huong_dan', 'khoe_phong', 'mo_mat_bang', 'tra_sua', 'tiem_banh', 'mua_nha', 'bam_mua', 'goi_xem_khoa', 'xong_viec', 'mo_ruong', 'thanh_tich', 'danh_hieu', 'choi_lai', 'xem_qc', 'bat_dau', 'het_ban_thu', 'web_bam_mua', 'web_tao_don', 'web_mo_khoa', 'web_ung_ho_mo', 'web_khoe_chia_se', 'web_pwa_goi_y', 'web_pwa_cai', 'web_moi_thu_kin_hien', 'web_moi_thu_kin_bam', 'web_moi_thu_kin_de_sau', 'ab_het_luot_ngay', 'web_xoay_do', 'web_thu_thach_xong', 'web_trong_app_hien', 'web_trong_app_mo_chrome', 'web_khoi_phuc_du_may', 'web_ung_ho_chon', 'hd_buoc', 'man_dau_hien', 'web_sk_khach', 'web_hoan_thanh', 'web_khach_trum', 'web_pccc', 'web_sk_mua_hien', 'web_sk_mua_nv', 'web_sk_mua_xong', 'web_nang_cap', 'web_khach_hiem', 'web_tai_xong', 'web_ch_xem_goi', 'web_moi_mo', 'web_moi_qua', 'web_mang_van_moi', 'web_mang_van_tao', 'web_mang_van_nhan'];
  window.warmJarThongKe = (ten, thamSo = {}) => {
    try {
      if (!suKien.includes(ten)) return;
      // Chỉ gửi tham số phễu đã định nghĩa.
      // Sự kiện chia sẻ/cài không mang dữ liệu người chơi.
      const nhomMoiNgay = ['A','B'].includes(thamSo.ab_mn) ? thamSo.ab_mn : null;
      // Món khóa chỉ gửi mã gói.
      if (ten === 'web_mang_van_moi' || ten === 'web_mang_van_tao') { if (!['tiktok','fb','messenger','zalo','ig','khac_app'].includes(thamSo.app)) return; if (ten === 'web_mang_van_tao' && !['intent','sao_chep'].includes(thamSo.cach)) return; thamSo=ten === 'web_mang_van_tao'?{app:thamSo.app,cach:thamSo.cach}:{app:thamSo.app}; } else if (ten === 'web_mang_van_nhan') { if (!((thamSo.hop_le===0&&thamSo.ket_qua==='loi')||(thamSo.hop_le===1&&['nap','giu_cu'].includes(thamSo.ket_qua)))) return; thamSo={hop_le:thamSo.hop_le,ket_qua:thamSo.ket_qua}; } else if (ten === 'web_moi_mo') { if (![0,1].includes(thamSo.hop_le)) return; thamSo={hop_le:thamSo.hop_le}; } else if (ten === 'web_moi_qua') { if (!['gui','nhan'].includes(thamSo.ben)) return; thamSo={ben:thamSo.ben}; } else if (ten === 'web_ch_xem_goi') { if (!['goi_tet','goi_noel','meo_cung','khoi_nghiep'].includes(thamSo.goi)) return; thamSo={goi:thamSo.goi}; } else if (ten === 'web_tai_xong') { if (!['0_1','1_3','3_6','6_10','tren_10'].includes(thamSo.giay) || ![0,1].includes(thamSo.bo_di)) return; thamSo={giay:thamSo.giay,bo_di:thamSo.bo_di}; } else if (ten === 'web_nang_cap') {
        if (!['son','camera','phoi','nuoc','mai','cay'].includes(thamSo.ma)) return;
        thamSo={ma:thamSo.ma};
      } else if (ten === 'web_khach_hiem') {
        if (!['ngheSi','phiCong','veSo','duLich','khaoCo','longTieng','cuuHo','thienVan'].includes(thamSo.ma) || !['thue','bo_qua'].includes(thamSo.kq)) return;
        thamSo={ma:thamSo.ma,kq:thamSo.kq};
      } else if (['web_sk_mua_hien','web_sk_mua_nv','web_sk_mua_xong'].includes(ten)) {
        if (!['tri_an_2026','noel','tet_2027'].includes(thamSo.ma)) return;
        if (ten !== 'web_sk_mua_hien' && thamSo.ma !== 'tri_an_2026') return;
        if (ten === 'web_sk_mua_nv' && !['thue','hoa','sao'].includes(thamSo.nv)) return;
        thamSo = ten === 'web_sk_mua_nv' ? {ma:thamSo.ma,nv:thamSo.nv} : {ma:thamSo.ma};
      } else if (ten === 'web_sk_khach') {
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
