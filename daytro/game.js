// Dãy Trọ Của Tôi — bản chơi thử giai đoạn 1: 1 phòng, khách hỏi thuê ghép
// ngẫu nhiên, 6 tháng từ tháng 10 tới Tết.
//
// Hình đồ đạc lấy thẳng từ ../thu-svg/ve.js (P, C, S, poly, hop, các hàm vẽ
// từng món và 5 màu). File này chỉ lo căn phòng, khách và luật chơi.
//
// Tiền tính bằng NGHÌN ĐỒNG (1850 = 1.850.000đ) cho gọn số.
// Thêm ?bung vào địa chỉ để lần thu tiền đầu tiên chắc chắn bị bùng (quay video).

const T = 120, HW = 300;   // cỡ một ô, cao tường
let N = 5, NT = N * T;       // số ô mỗi cạnh của PHÒNG ĐANG XEM: 5, nới rộng thì 6 (datKhung)
const $ = s => document.querySelector(s);

// Chạy trong app điện thoại (WebView của app/) hay trong trình duyệt. Trong app thì
// game gửi tin cho app qua postMessage; app trả lời bằng window.tuApp (cuối file).
const TRONG_APP = !!window.ReactNativeWebView;
const KHOA_GOI = 'day-tro-goi';
let GOI = new Set(), GIA_GOI = {};
try { GOI = new Set(JSON.parse(localStorage.getItem(KHOA_GOI)) || []); } catch { /* chưa mua gì */ }
const coGoi = id => GOI.has(id);
const guiApp = m => { try { window.ReactNativeWebView?.postMessage(JSON.stringify(m)); } catch { /* không có app thì thôi */ } };
const ghi = (ten, thamSo) => {
  guiApp({ loai: 'sukien', ten, thamSo });
  // Web chỉ dùng bộ đo nếu trang chủ đã nạp; không tự thêm kết nối hay mã tài khoản.
  if (!window.ReactNativeWebView && typeof window.gtag === 'function') {
    try { window.gtag('event', ten, thamSo); } catch { /* thống kê lỗi vẫn chơi được */ }
  }
};
const MUC = '#6B4631';

// Đọc giá trị cấu hình từ App (Firebase Remote Config qua window.CAU_HINH).
// Kiểm tra kiểu và giới hạn chặt chẽ; sai hoặc chạy web thuần thì dùng mặc định.
function cauHinh(khoa, macDinh) {
  const ch = (typeof window !== 'undefined' && window.CAU_HINH) || null;
  if (!ch || typeof ch !== 'object' || !(khoa in ch)) return macDinh;
  const v = ch[khoa];
  switch (khoa) {
    case 'kien_nhan_ms': {
      const n = Number(v);
      return Number.isFinite(n) && n >= 8000 && n <= 30000 ? n : macDinh;
    }
    case 'mo_phong': {
      let arr = v;
      if (typeof arr === 'string') {
        try { arr = JSON.parse(arr); } catch { return macDinh; }
      }
      if (!Array.isArray(arr) || arr.length !== 6) return macDinh;
      if (arr.some(x => typeof x !== 'number' || !Number.isFinite(x) || x < 0)) return macDinh;
      if (arr[0] !== 0) return macDinh;
      return arr;
    }
    case 'mo_dau_thua_ke':
    case 'bung_lan_dau_nhe': {
      if (typeof v === 'boolean') return v;
      if (v === 'true' || v === '1' || v === 1) return true;
      if (v === 'false' || v === '0' || v === 0) return false;
      return macDinh;
    }
    case 'tien_vang_gio': {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= 500 ? n : macDinh;
    }
    case 'tien_vang_tran_gio': {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1 && n <= 72 ? n : macDinh;
    }
    case 'su_kien_mua': {
      if (typeof v !== 'string') return macDinh;
      const s = v.trim().toLowerCase();
      return ['tet', 'noel', ''].includes(s) ? s : macDinh;
    }
    case 'he_so_doanh_thu': {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0.1 && n <= 10 ? n : macDinh;
    }
    default:
      return v !== undefined && v !== null ? v : macDinh;
  }
}


// ── Đồ trong tiệm ──────────────────────────────────────────────────────────
// gia: tiền mua. thue: có món này thì giá phòng tăng bấy nhiêu mỗi tháng.
// co: số ô chiếm [theo x, theo y]. to: phóng to khi đặt trong phòng.
const DO = {
  chanGoi:  { ten: 'Chăn gối',     gia: 200,  thue: 100, ve: chanGoi,  nhom: 'ngu',  cau: 'Gối thơm mùi nắng, giống ở nhà ghê.' },
  man:      { ten: 'Màn (mùng)',   gia: 250,  thue: 100, ve: man,      nhom: 'ngu',  cau: 'Có màn rồi, muỗi hết đường vô!', co: [2, 1], to: 1.35 },
  noiCom:   { ten: 'Nồi cơm điện', gia: 250,  thue: 100, ve: noiCom,   nhom: 'nau',  cau: 'Có nồi cơm rồi! Khỏi ăn mì gói.' },
  binhNuoc: { ten: 'Bình nước',    gia: 150,  thue: 50,  ve: binhNuoc, nhom: 'nuoc', cau: 'Nước mát quá trời.' },
  quatCay:  { ten: 'Quạt cây',     gia: 300,  thue: 150, ve: quatCay,  nhom: 'mat',  cau: 'Mát rượi! Để số 3 luôn.' },
  dayPhoi:  { ten: 'Dây phơi',     gia: 100,  thue: 50,  ve: dayPhoi,  nhom: 'phoi', cau: 'Đồ phơi chỗ này mau khô ghê.', co: [2, 1], to: 1.1 },
  gheNhua:  { ten: 'Ghế nhựa',     gia: 80,   thue: 50,  ve: gheNhua,  nhom: 'ngoi', cau: 'Ghế nhựa, ngồi như ở quán cóc.' },
  senDa:    { ten: 'Sen đá',       gia: 60,   thue: 50,  ve: senDa,    nhom: 'cay',  cau: 'Bé xíu mà dễ thương ghê.' },
  luoiHo:   { ten: 'Lưỡi hổ',      gia: 120,  thue: 50,  ve: luoiHo,   nhom: 'cay',  cau: 'Nghe nói cây này lọc không khí đó.' },
  cayKhe:   { ten: 'Cây khế',      gia: 400,  thue: 100, ve: cayKhe,   nhom: 'cay',  cau: 'Cây khế! Y như sân nhà ngoại.' },
  tuVai:    { ten: 'Tủ vải',       gia: 350,  thue: 150, ve: tuVai,    nhom: 'cat',  cau: 'Hết cảnh quần áo chất trong vali.' },
  oMeo:     { ten: 'Ổ mèo',        gia: 150,  thue: 50,  ve: oMeo,     nhom: 'meo',  cau: 'Mèo có ổ rồi, nó chịu lắm nè.' },
  choXe:    { ten: 'Chỗ để xe',    gia: 150,  thue: 100, ve: choXe,    nhom: 'xe',   cau: 'Có chỗ để xe, khỏi lo mất xe.', co: [2, 1] },
  wc:       { ten: 'WC riêng',     gia: 900,  thue: 400, ve: wc,       nhom: 'wc',   cau: 'WC riêng! Khỏi xếp hàng buổi sáng.' },
  maiVang:  { ten: 'Chậu mai vàng', gia: 350, thue: 100, ve: caiMai, nhom: 'tet', cau: 'Mai vàng! Thấy Tết về tới cửa luôn.', tet: true },
  banhChung:{ ten: 'Bánh chưng',   gia: 200,  thue: 50,  ve: banhChung, nhom: 'tet', cau: 'Bánh chưng! Nhớ nồi bánh nhà ngoại ghê.', tet: true },
  cayThongMini: { ten: 'Cây thông mini', gia: 350, thue: 100, ve: cayThongMini, nhom: 'cay', cau: 'Cây thông bé xíu, góc phòng ấm áp ghê.', goi: 'goi_noel' },
  hopQuaNoel: { ten: 'Hộp quà Noel', gia: 100, thue: 50, ve: hopQuaNoel, nhom: 'noel', cau: 'Quà Noel! Bày trên bàn nhìn vui ghê.', goi: 'goi_noel' },
  cucWifi:  { ten: 'Cục wifi',     gia: 200,  thue: 100, ve: cucWifi,  nhom: 'wifi', cau: 'Wifi full vạch, sướng!', to: 1.9 },
  xuongRong:{ ten: 'Xương rồng',   gia: 50,   thue: 50,  ve: xuongRong, nhom: 'cay', cau: 'Xương rồng, khỏi tưới cũng sống.' },
  denNgu:   { ten: 'Đèn ngủ',      gia: 120,  thue: 50,  ve: denNgu,   nhom: 'ngu',  cau: 'Đèn ngủ vàng vàng, dễ ngủ ghê.' },
  banTra:   { ten: 'Bàn trà',      gia: 150,  thue: 50,  ve: banTra,   nhom: 'ngoi', cau: 'Có chỗ ngồi uống trà rồi.' },
  thamLot:  { ten: 'Thảm',         gia: 200,  thue: 100, ve: thamLot,  nhom: 'tham', cau: 'Thảm êm ghê, đi chân trần luôn.', co: [2, 1] },
  guong:    { ten: 'Gương đứng',   gia: 200,  thue: 50,  ve: guong,    nhom: 'cat',  cau: 'Có gương soi cả người, sáng đi làm tiện ghê.' },
  keSach:   { ten: 'Kệ sách',      gia: 250,  thue: 100, ve: keSach,   nhom: 'hoc',  cau: 'Kệ sách! Sách vở hết nằm dưới đất.' },
  loaGo:    { ten: 'Loa gỗ',       gia: 250,  thue: 100, ve: loaGo,    nhom: 'loa',  cau: 'Loa kêu ấm ghê, nghe nhạc đã tai.' },
  bepGa:    { ten: 'Bếp ga',       gia: 300,  thue: 100, ve: bepGa,    nhom: 'nau',  cau: 'Bếp ga đôi, nấu cơm nhà được rồi.' },
  banHoc:   { ten: 'Bàn học',      gia: 300,  thue: 100, ve: banHoc,   nhom: 'hoc',  cau: 'Có bàn học rồi, khỏi nằm bò ra đất học.' },
  noiChien: { ten: 'Nồi chiên không dầu', gia: 350, thue: 100, ve: noiChien, nhom: 'nau', cau: 'Nồi chiên không dầu! Tối nay gà chiên.' },
  giuong:   { ten: 'Giường sắt',   gia: 700,  thue: 250, ve: giuong,   nhom: 'ngu',  cau: 'Giường thiệt luôn, khỏi ngủ đất!', co: [2, 1] },
  sofa:     { ten: 'Sofa',         gia: 800,  thue: 200, ve: sofa,     nhom: 'ngoi', cau: 'Sofa! Phòng trọ mà sang như căn hộ.', co: [2, 1] },
  tuLanh:   { ten: 'Tủ lạnh',      gia: 800,  thue: 250, ve: tuLanh,   nhom: 'nau',  cau: 'Tủ lạnh! Có nước đá uống rồi.' },
  mayLanh:  { ten: 'Máy lạnh',     gia: 900,  thue: 350, ve: mayLanh,  nhom: 'lanh', cau: 'Máy lạnh! Hết cảnh nóng như lò.' },
  mayGiat:  { ten: 'Máy giặt',     gia: 900,  thue: 300, ve: mayGiat,  nhom: 'giat', cau: 'Máy giặt! Khỏi giặt tay mỏi lưng.' },
  gac:      { ten: 'Gác gỗ',       gia: 1200, thue: 500, ve: gac,      nhom: 'gac',  cau: 'Có gác! Tối leo lên đó nằm.', co: [2, 2] },
};

// Đòi hỏi của khách = nhóm đồ. Chữ viết y như câu khách nói ngoài đời.
// Đồ có mặt phẳng để đặt đồ nhỏ lên: chiều cao mặt trên, tính theo đơn vị hình vẽ trong ve.js.
const MAT = { banHoc: 77, keSach: 150, banTra: 34, tuVai: 176, tuLanh: 172, quayThu: 88, tuKinh: 101, keBanhMi: 137, quayPha: 96, tuTopping: 112, banGheCao: 102 };
const NHO = new Set(['cucWifi', 'denNgu', 'loaGo', 'senDa', 'xuongRong', 'noiCom', 'noiChien', 'hopQuaNoel']);
// Đồ tiệm bánh: chỉ bán trong mặt bằng mở tiệm. `ban` = tiền bán được mỗi tháng nhờ món đó.
const DO_TIEM = {
  loNuong: { ten: 'Lò nướng bánh', gia: 1500, thue: 0, ban: 900, ve: loNuong, nhom: 'tiemLo', tiem: true, cau: 'Thơm lừng mùi bánh mới ra lò!' },
  tuKinh:  { ten: 'Tủ kính bánh',  gia: 800,  thue: 0, ban: 600, ve: tuKinh,  nhom: 'tiemTu', tiem: true, cau: 'Bánh bày lên nhìn là muốn mua.' },
  quayThu: { ten: 'Quầy thu ngân', gia: 600,  thue: 0, ban: 300, ve: quayThu, nhom: 'tiemQuay', tiem: true, cau: 'Tính tiền nhanh gọn.' },
  banQuan: { ten: 'Bàn quán',      gia: 500,  thue: 0, ban: 400, ve: banQuan, nhom: 'tiemBan', tiem: true, cau: 'Khách ngồi lại ăn tại chỗ.', co: [2, 1] },
  keBanhMi: { ten: 'Kệ bánh mì',   gia: 700,  thue: 0, ban: 500, ve: keBanhMi, nhom: 'tiemKe', tiem: true, cau: 'Bánh mì mới ra lò, giòn rụm!' },
  mayCaPhe: { ten: 'Máy pha cà phê', gia: 1200, thue: 0, ban: 800, ve: mayCaPhe, nhom: 'tiemCaPhe', tiem: true, cau: 'Thơm mùi cà phê, khách ngồi lâu hơn.' },
};
const DO_TRA = {
  quayPha: { ten: 'Quầy pha chế', gia: 1500, thue: 0, ban: 1100, ve: quayPha, nhom: 'traQuay', tra: true, co: [2, 1], cau: 'Quầy pha sẵn sàng, lắc trà thôi!' },
  tuTopping: { ten: 'Tủ topping', gia: 900, thue: 0, ban: 750, ve: tuTopping, nhom: 'traTu', tra: true, cau: 'Trân châu với thạch đầy tủ rồi!' },
  mayDanNap: { ten: 'Máy dán nắp ly', gia: 900, thue: 0, ban: 650, ve: mayDanNap, nhom: 'traMay', tra: true, cau: 'Dán kín nắp, giao trà không sợ đổ.' },
  banGheCao: { ten: 'Bàn ghế cao', gia: 650, thue: 0, ban: 700, ve: banGheCao, nhom: 'traBan', tra: true, co: [2, 1], cau: 'Có chỗ ngồi nhâm nhi trà sữa rồi.' },
  bangMenuDen: { ten: 'Bảng menu đèn', gia: 600, thue: 0, ban: 650, ve: bangMenuDen, nhom: 'traMenu', tra: true, cau: 'Menu sáng lên, khách đứng chọn món.' },
};
Object.assign(DO, DO_TIEM, DO_TRA);
if (!TRONG_APP) {
  DO.gheTua = {ten:'Ghế tựa nhựa',nhom:'ngoi',co:[1,1],gia:120,thue:50,cau:'Có ghế tựa, ngồi lâu khỏi mỏi lưng.',ve:()=>DO.gheNhua.ve()};
  try { window.themDoWeb?.(DO); } catch { /* Giữ hình dự phòng, không bỏ món đã mua. */ }
}

const NHOM = {
  ngu:  { ten: 'có chỗ ngủ',     d: 'M3 18h18M4 18v-6h16v6M6 12V9h5v3' },
  nau:  { ten: 'nấu ăn được',    d: 'M4 12h16a8 8 0 0 1-16 0zM9 8c0-1.2 1-1.6 1-3M14 8c0-1.2 1-1.6 1-3' },
  nuoc: { ten: 'có nước uống',   d: 'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z' },
  mat:  { ten: 'phòng mát',      d: 'M12 10c-1-4 3-6 5-4s-1 4-5 4zM14 13c4 0 5 4 2.5 5s-3.5-2-2.5-5zM10 13c-3 3-6 1-5-1.5s4-1.5 5 1.5z' },
  phoi: { ten: 'có chỗ phơi đồ', d: 'M8 4L4 7l2 3 2-1v11h8V9l2 1 2-3-4-3c-1 1.5-2.5 2-4 2s-3-.5-4-2z' },
  ngoi: { ten: 'có chỗ ngồi',    d: 'M5 9h14M6 9l-1 11M18 9l1 11M7 14h10M5 9V7h14v2' },
  cay:  { ten: 'có cây xanh',    d: 'M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8' },
  cat:  { ten: 'có tủ đồ',       d: 'M12 7a2 2 0 1 1 2-2M12 7v2l9 7H3l9-7' },
  gac:  { ten: 'có gác',         d: 'M8 3v18M16 3v18M8 7h8M8 12h8M8 17h8' },
  meo:  { ten: 'cho nuôi mèo',   d: 'M5 10V4l4 3h6l4-3v6c0 5-3 9-7 9s-7-4-7-9z' },
  xe:   { ten: 'có chỗ để xe',   d: 'M4 4h16v16H4zM9 17V7h4a3 3 0 0 1 0 6H9' },
  tet:  { ten: 'có không khí Tết', d: 'M12 3v5M12 8c-4 0-6 3-6 6s2 6 6 6 6-3 6-6-2-6-6-6zM9 14h6M12 11v6' },
  noel: { ten: 'có không khí Noel', d: 'M12 3l5 6h-3l5 6h-5v6h-4v-6H5l5-6H7z' },
  wifi: { ten: 'có wifi mạnh',   d: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01' },
  lanh: { ten: 'có máy lạnh',    d: 'M12 3v18M4 7.5l16 9M20 7.5l-16 9' },
  hoc:  { ten: 'có bàn học',     d: 'M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7z' },
  giat: { ten: 'có máy giặt',    d: 'M5 3h14v18H5zM8 14a4 4 0 1 0 8 0a4 4 0 1 0-8 0M8 6h2' },
  tham: { ten: 'có thảm',        d: 'M3 8h18v8H3zM6 8v8M18 8v8' },
  loa:  { ten: 'có loa',         d: 'M5 9v6h4l5 4V5L9 9zM17 9a4 4 0 0 1 0 6' },
  wc:   { ten: 'WC riêng',       d: 'M6 3h5v8H6zM4 11h15a6 6 0 0 1-6 6h-2l1 4H8l1-4a5 5 0 0 1-5-6z' },
};
const TIM = 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z';

// Người đang ở lâu lâu xin thêm một món. Chiều ý thì được bo và ở thêm tháng.
const MUON = {
  mat:  'Phòng nóng quá anh chị ơi, có cái quạt thì đỡ.',
  cay:  'Phòng có chút cây xanh thì đỡ ngột ngạt ha.',
  nuoc: 'Đi mua nước bình hoài mệt quá.',
  ngoi: 'Bạn tới chơi mà không có ghế ngồi…',
  phoi: 'Đồ giặt xong không có chỗ phơi luôn.',
  cat:  'Quần áo chất đống trong vali hoài.',
  nau:  'Ăn mì gói hoài ngán quá trời.',
  meo:  'Em lượm được con mèo… cho em nuôi nha?',
  wifi: 'Wifi yếu quá anh chị ơi, lắp cục mới giùm em.',
  lanh: 'Nóng quá, phòng mà có máy lạnh thì đỉnh.',
  hoc:  'Thiếu cái bàn học, em toàn nằm bò ra học.',
  giat: 'Giặt tay hoài mỏi tay quá anh chị ơi.',
  tet:  'Sắp Tết rồi, phòng có chút mai vàng cho vui ha anh chị.',
};

// ── Khách hỏi thuê: kiểu người × giá × đòi hỏi, ghép ngẫu nhiên ────────────
const NU = { ao: DAT, quan: XANH, toc: 'dai', mauToc: MUC, kep: true };
const NAM = { ao: XANH, quan: XAM, dai: true, toc: 'ngan', mauToc: MUC };
const VO_CHONG = [{ ao: OAK, quan: DAT, toc: 'dai', mauToc: MUC, kep: true }, NAM];
const KIEU = {
  sinhVien: {
    ten: 'sinh viên', tran: [1500, 2000], o: [2, 3],
    nguoi: [['Linh', NU], ['Nhi', { ...NU, ao: OAK }], ['Tú', NAM], ['Khoa', { ...NAM, ao: OAK }]],
    can: ['ngu', 'nau', 'nuoc', 'gac', 'meo', 'xe', 'mat', 'ngoi'],
    tang: ['gần trường', 'giờ giấc tự do'],
    hoi: (gia, can) => `Anh chị ơi, em sinh viên, tìm phòng dưới ${gia}, ${can} ạ.`,
    chot: ['Chốt luôn ạ! Mai em dọn đồ qua.', 'Đẹp hơn em tưởng luôn á!'],
  },
  congNhan: {
    ten: 'công nhân ca đêm', tran: [1500, 2000], o: [2, 4],
    nguoi: [['Hùng', { ...NAM, non: true }], ['Thắm', { ...NAM, toc: 'dai', non: true }]],
    can: ['ngu', 'mat', 'xe', 'nau', 'nuoc', 'phoi'],
    tang: ['giờ giấc tự do', 'không chung chủ'],
    hoi: (gia, can) => `Em làm ca đêm, cần phòng dưới ${gia}, ${can}. Ban ngày em ngủ nha anh.`,
    chot: ['Được đó anh, chiều em chở đồ qua.', 'Vậy là có chỗ ngủ ngon rồi.'],
  },
  voChong: {
    ten: 'cặp đôi mới cưới', tran: [2000, 3000], o: [3, 4],
    nguoi: [['Tâm & Hạnh'], ['Phúc & Duyên'], ['Nam & Thư']],
    can: ['wc', 'nau', 'cat', 'gac', 'cay', 'ngu', 'ngoi'],
    tang: ['không chung chủ', 'cửa sổ thoáng'],
    hoi: (gia, can) => `Tụi em mới cưới, tìm phòng dưới ${gia}, ${can} ạ.`,
    chot: ['Nhà mới của tụi mình nè!', 'Ưng quá, tụi em lấy liền.'],
  },
  veHuu: {
    ten: 'người về hưu', tran: [1500, 2000], o: [3, 4],
    nguoi: [['Ông Sáu', { ...NAM, ao: KEM, mauToc: XAM, kinh: true }], ['Bà Năm', { ao: OAK, quan: MUC, dai: true, toc: 'dai', mauToc: XAM, kinh: true }]],
    can: ['cay', 'nuoc', 'ngoi', 'mat', 'wc', 'meo'],
    tang: ['cửa sổ thoáng', 'gần chợ'],
    hoi: (gia, can) => `Con ơi, tui kiếm phòng dưới ${gia}, ${can}. Yên tĩnh là được.`,
    chot: ['Được đó con, phòng thoáng ghê.', 'Ở đây chắc sống lâu trăm tuổi.'],
  },
  shipper: {
    ten: 'shipper', tran: [1500, 2000], o: [2, 3],
    nguoi: [['Tuấn', { ...NAM, ao: DAT, non: true }], ['Duy', { ...NAM, ao: XANH, non: true }]],
    can: ['xe', 'ngu', 'nuoc', 'wifi'],
    tang: ['giờ giấc tự do', 'gần đường lớn'],
    hoi: (gia, can) => `Em chạy giao hàng, cần phòng dưới ${gia}, ${can}. Về khuya chút anh thông cảm nha.`,
    chot: ['Chốt đơn! À nhầm, chốt phòng.', 'Giao xong đơn cuối em dọn qua liền.'],
    mac: 'Bớt chút đi anh, tiền xăng giờ mắc quá trời.',
    la: ['Em được lên làm trưởng nhóm giao hàng, chuyển qua quận khác rồi.', 'Em'],
  },
  danIT: {
    ten: 'dân IT làm đêm', tran: [2000, 3000], o: [3, 4],
    nguoi: [['Khang', { ...NAM, ao: XAM, kinh: true }], ['Phúc', { ...NAM, ao: XANH, kinh: true }]],
    can: ['wifi', 'mat', 'ngoi', 'ngu'],
    tang: ['yên tĩnh', 'giờ giấc tự do'],
    hoi: (gia, can) => `Em code ban đêm, cần phòng dưới ${gia}, ${can}. Wifi mà lag là em khóc đó.`,
    chot: ['Wifi ổn áp, deploy liền!', 'Phòng này chạy mượt như code không bug.'],
    mac: 'Bớt 200k đi anh, dự án tháng này chưa trả lương em.',
    la: ['Em nhận việc remote cho công ty nước ngoài, về quê làm luôn.', 'Em'],
  },
  banOnline: {
    ten: 'chị bán hàng online', tran: [2000, 3000], o: [3, 4],
    nguoi: [['Chị Hoa', { ...NU, ao: DAT, kep: false }], ['Chị Trang', { ...NU, ao: OAK, kep: false }]],
    can: ['cat', 'wifi', 'phoi', 'ngoi'],
    tang: ['không chung chủ', 'có chỗ nhận hàng'],
    hoi: (gia, can) => `Chị bán hàng online, cần phòng dưới ${gia}, ${can}. Hàng chất nhiều lắm em ơi.`,
    chot: ['Chốt! Chị lên live báo khách liền.', 'Ưng rồi, để chị dọn hàng qua.'],
    mac: 'Em bớt chị 200k, chị giới thiệu khách cho em nha.',
    la: ['Shop chị đông khách, chị thuê được mặt bằng riêng rồi.', 'Chị'],
  },
  duHoc: {
    ten: 'du học sinh mới về', tran: [2000, 3000], o: [2, 3],
    nguoi: [['Minh', { ...NAM, ao: KEM, kinh: true }], ['Ngân', { ...NU, ao: XANH }]],
    can: ['wc', 'mat', 'wifi', 'cay'],
    tang: ['cửa sổ thoáng', 'gần trung tâm'],
    hoi: (gia, can) => `Mình mới về nước, tìm phòng dưới ${gia}, ${can}. Sạch sẽ là được nha.`,
    chot: ['Nice! Phòng xinh ghê.', 'Oke, deal nha!'],
    mac: 'Bên kia người ta giảm cho mình 10% đó…',
    la: ['Mình tìm được việc ở Hà Nội, phải chuyển ra ngoài đó rồi.', 'Mình'],
  },
  coGiao: {
    ten: 'cô giáo mầm non', tran: [1500, 2000], o: [3, 4],
    nguoi: [['Cô Lan', { ...NU, ao: XANH, kep: false }], ['Cô Hương', { ...NU, ao: KEM, kep: false }]],
    can: ['cay', 'nau', 'nuoc', 'cat'],
    tang: ['gần trường', 'yên tĩnh'],
    hoi: (gia, can) => `Cô dạy mầm non, cần phòng dưới ${gia}, ${can}. Sáng cô đi sớm lắm.`,
    chot: ['Phòng dễ thương y như lớp của cô.', 'Được đó em, cô ưng.'],
    mac: 'Lương giáo viên ít lắm, em bớt cho cô chút nha.',
    la: ['Cô được chuyển về dạy trường gần nhà rồi.', 'Cô'],
  },
  yeuMeo: {
    ten: 'hội yêu mèo', tran: [1500, 2000], o: [2, 4],
    nguoi: [['Mai', { ...NU, ao: OAK }], ['Thư', { ...NU, ao: DAT }]],
    can: ['meo', 'cay', 'ngu', 'mat'],
    tang: ['cho nuôi thú cưng', 'cửa sổ thoáng'],
    hoi: (gia, can) => `Em có hai bé mèo, cần phòng dưới ${gia}, ${can}. Mèo em ngoan lắm ạ.`,
    chot: ['Tụi mèo sẽ thích lắm cho coi!', 'Meow! À dạ em chốt.'],
    mac: 'Bớt cho em ít tiền mua pate mèo nha anh.',
    la: ['Em với hai bé mèo dọn về ở với bạn thân rồi.', 'Em'],
  },
  thoHo: {
    ten: 'thợ hồ', tran: [1500], o: [2, 3],
    nguoi: [['Anh Tư', { ...NAM, ao: OAK, non: true }], ['Anh Bảy', { ...NAM, ao: XAM, non: true }]],
    can: ['ngu', 'nuoc', 'xe', 'phoi'],
    tang: ['giờ giấc tự do', 'gần công trình'],
    hoi: (gia, can) => `Anh làm hồ, cần phòng dưới ${gia}, ${can}. Rẻ rẻ thôi em.`,
    chot: ['Được, mai anh dọn qua.', 'Phòng vậy là ngon rồi em.'],
    mac: 'Bớt cho anh trăm, công trình chưa trả tiền.',
    la: ['Công trình xong rồi, anh theo đội qua tỉnh khác làm.', 'Anh'],
  },
  giaDinh: {
    ten: 'gia đình có con nhỏ', tran: [2000, 3000], o: [3, 4],
    nguoi: [['Anh Hải & bé Na'], ['Chị Thảo & bé Bin']],
    can: ['wc', 'nau', 'ngu', 'cay', 'cat'],
    tang: ['an ninh tốt', 'gần trường mầm non'],
    hoi: (gia, can) => `Nhà anh có bé nhỏ, cần phòng dưới ${gia}, ${can}. An toàn cho con là được.`,
    chot: ['Bé nhà anh chắc thích lắm.', 'Ưng rồi, cuối tuần dọn qua.'],
    mac: 'Nuôi con tốn quá em ơi, bớt anh chút.',
    la: ['Nhà anh gom đủ tiền mua căn hộ nhỏ rồi. Bé Na còn vẽ tặng phòng một bức tranh.', 'Anh'],
  },
  vanPhong: {
    ten: 'nhân viên văn phòng', tran: [2000, 3000], o: [3, 4],
    nguoi: [['Hằng', { ...NU, ao: KEM }], ['Quân', { ...NAM, ao: XANH }]],
    can: ['mat', 'wifi', 'ngu', 'ngoi', 'cat'],
    tang: ['gần công ty', 'không chung chủ'],
    hoi: (gia, can) => `Em làm văn phòng, cần phòng dưới ${gia}, ${can}. Đi làm về chỉ muốn nằm thôi.`,
    chot: ['Chốt kèo! Tối nay em ngủ ngon rồi.', 'Phòng chill ghê.'],
    mac: 'Bớt 200k đi anh, cuối tháng em nghèo lắm.',
    la: ['Em được tăng lương, chuyển qua căn hộ gần công ty.', 'Em'],
  },
  caSi: {
    ten: 'ca sĩ phòng trà', tran: [2000, 3000], o: [2, 3],
    nguoi: [['Anh Tùng', { ...NAM, ao: DAT }], ['Chị Ly', { ...NU, ao: DAT, kep: false }]],
    can: ['gac', 'mat', 'cay'],
    tang: ['giờ giấc tự do', 'gần phòng trà'],
    hoi: (gia, can) => `Anh hát phòng trà, cần phòng dưới ${gia}, ${can}. Anh về khuya nhưng không ồn đâu.`,
    chot: ['Phòng này có hồn, anh thích.', 'Cho anh một tràng pháo tay!'],
    mac: 'Bớt anh chút, anh hát tặng em một bài.',
    la: ['Anh được mời hát ở Đà Lạt cả mùa, đành chia tay căn phòng.', 'Anh'],
  },
  streamer: {
    ten: 'streamer', tran: [1500, 2000], o: [2, 3],
    nguoi: [['Nam', { ...NAM, ao: DAT }], ['Tín', { ...NAM, ao: OAK, kinh: true }]],
    can: ['wifi', 'mat', 'ngoi'],
    tang: ['cách âm tốt', 'giờ giấc tự do'],
    hoi: (gia, can) => `Em làm streamer, cần phòng dưới ${gia}, ${can}. Wifi phải khỏe, không là mất view.`,
    chot: ['Lên sóng liền, cảm ơn anh!', 'Góc này quay stream đẹp nè.'],
    mac: 'Anh bớt em 200k, em shout-out phòng anh trên live.',
    la: ['Kênh em lên 100 nghìn follow rồi, em thuê studio riêng.', 'Em'],
  },
  baChauCon: {
    ten: 'bà lên chăm cháu', tran: [1500, 2000], o: [3, 4],
    nguoi: [['Bà Tư', { ao: OAK, quan: MUC, dai: true, toc: 'dai', mauToc: XAM, kinh: true }]],
    can: ['nau', 'nuoc', 'cay', 'ngoi'],
    tang: ['gần chợ', 'yên tĩnh'],
    hoi: (gia, can) => `Bà lên chăm cháu, kiếm phòng dưới ${gia}, ${can}. Có chỗ nấu nồi canh là được.`,
    chot: ['Phòng sạch sẽ, bà ưng.', 'Được con, bà cảm ơn nha.'],
    mac: 'Con bớt cho bà chút, bà nấu chè cho con ăn.',
    la: ['Cháu lớn đi học rồi, bà về quê trồng rau đây.', 'Bà'],
  },
  tiepVien: {
    ten: 'tiếp viên hàng không', tran: [2500, 3000], o: [1, 2],
    nguoi: [['Vy', { ...NU, ao: XANH }], ['Trâm', { ...NU, ao: DAT }], ['Hoàng', { ...NAM, ao: KEM }]],
    can: ['ngu', 'mat', 'cat'],
    tang: ['yên tĩnh', 'rèm che sáng', 'giờ giấc tự do'],
    hoi: (gia, can) => `Em bay chuyến đêm, tìm phòng dưới ${gia}, ${can}. Chỉ cần chỗ ngủ thật ngon thôi ạ.`,
    chot: ['Chốt ạ! Hạ cánh là em về ngủ liền.', 'Phòng êm quá, ngủ một giấc tới giờ ra sân bay luôn.'],
    la: ['Em đổi lịch bay, chuyển về gần sân bay hơn; nhớ những giấc ngủ ngon ở đây lắm.', 'Em'],
  },
  ptGym: {
    ten: 'huấn luyện viên gym', tran: [2000, 2500], o: [2, 4],
    nguoi: [['Anh Sơn', { ...NAM, ao: DAT }], ['Anh Vinh', { ...NAM, ao: OAK }], ['Chị My', { ...NU, ao: XANH, kep: false }]],
    can: ['phoi', 'nau', 'nuoc', 'ngu'],
    tang: ['gần phòng tập', 'giờ giấc tự do'],
    hoi: (gia, can) => `Mình tập hai buổi một ngày, cần phòng dưới ${gia}, ${can}. Có tủ lạnh trữ đồ ăn thì tuyệt nha!`,
    chot: ['Chốt! Tạ ở phòng tập, cơm gà ở phòng này.', 'Phòng ngon đó, tập xong về nấu cơm luôn!'],
    mac: 'Bớt mình 200k nha, mình chỉ cách tập cho khỏe, khỏi mua thẻ gym!',
    la: ['Mình mở được phòng tập riêng rồi, cảm ơn bạn đã cho mình chỗ nấu cơm gà mỗi tối.', 'Mình'],
  },
  bacSi: {
    ten: 'bác sĩ nội trú', tran: [2000, 3000], o: [3, 4],
    nguoi: [['Bác sĩ An', { ...NAM, ao: KEM, kinh: true }], ['Bác sĩ Ngọc', { ...NU, ao: KEM }], ['Bác sĩ Đức', { ...NAM, ao: XANH }]],
    can: ['ngu', 'hoc', 'lanh'],
    tang: ['yên tĩnh', 'gần bệnh viện'],
    hoi: (gia, can) => `Em trực 36 tiếng rồi… tìm phòng dưới ${gia}, ${can}. Có giường là em ngủ ngay được ạ.`,
    chot: ['Em chốt ạ, tiền trọ em chuyển đúng hẹn nha.', 'Có bàn đọc bệnh án, có chỗ ngủ… quá đủ rồi ạ!'],
    la: ['Em kết thúc kỳ nội trú, chuyển về bệnh viện mới; cảm ơn anh chị đã giữ cho em một góc nghỉ yên tĩnh.', 'Em'],
  },
  anhTay: {
    ten: 'anh Tây học tiếng Việt', tran: [2000, 3000], o: [2, 3],
    nguoi: [['Alex', { ...NAM, ao: OAK, mauToc: OAK }], ['Ben', { ...NAM, ao: KEM, mauToc: DAT }], ['Tom', { ...NAM, ao: XANH, mauToc: OAK, kinh: true }]],
    can: ['wifi', 'ngoi', 'nau'],
    tang: ['gần lớp tiếng Việt', 'gần chợ'],
    hoi: (gia, can) => `Xin chào! Tôi… tìm phòng dưới ${gia}, ${can}. Wifi… mạnh mạnh ạ?`,
    chot: ['Tôi chốt… phòng! Nói đúng chưa ạ?', 'Phòng đẹp quá! Cảm ơn nhiều nhiều nha!'],
    la: ['Tôi học xong khóa tiếng Việt rồi, cảm ơn chủ trọ nhiều nhiều; giờ tôi biết nói “nhớ xóm trọ” rồi ạ.', 'Tôi'],
  },
};
// Câu mặc cả của 4 kiểu khách đầu tiên.
KIEU.sinhVien.mac = 'Anh chị bớt em 200k nha, cuối tháng em ăn mì gói cả tuần rồi.';
KIEU.congNhan.mac = 'Bớt chút đi anh, lương công nhân có nhiêu đâu.';
KIEU.voChong.mac = 'Tụi em mới cưới, còn nợ tiền cỗ, bớt tụi em chút nha.';
KIEU.veHuu.mac = 'Già rồi, lương hưu ít, bớt cho tui chút con.';
// Đòi hỏi của đồ đợt 2 (máy lạnh, bàn học, máy giặt, loa, thảm).
KIEU.sinhVien.can.push('hoc'); KIEU.danIT.can.push('hoc', 'lanh'); KIEU.duHoc.can.push('lanh', 'giat');
KIEU.vanPhong.can.push('lanh', 'giat'); KIEU.voChong.can.push('lanh', 'giat'); KIEU.giaDinh.can.push('giat', 'lanh');
KIEU.streamer.can.push('loa', 'lanh'); KIEU.banOnline.can.push('giat'); KIEU.coGiao.can.push('hoc');
KIEU.caSi.can.push('loa'); KIEU.yeuMeo.can.push('tham');

// Chuyện phát sinh khi đang có người ở. Để quá lâu là người ở bực.
const SU_CO = {
  den:   { icon: 'den', ten: 'Bóng đèn cháy', gia: 50, cau: 'Anh chị ơi, bóng đèn cháy rồi, tối thui à!', o: [50, 30] },
  voi:   { icon: 'nuoc', ten: 'Vòi nước rỉ',   gia: 80, cau: 'Vòi nước nhỏ giọt cả đêm, em ngủ không được.', o: [24, 52] },
  chuot: { icon: 'chuot', ten: 'Có chuột',      gia: 60, cau: 'Áaa! Có con chuột chạy ngang phòng!', o: [62, 72] },
  wifi:  { icon: 'wifi', ten: 'Rớt wifi',      gia: 0,  cau: 'Anh ơi wifi rớt rồi, em đang học online!', o: [76, 34] },
};
const KIEN_NHAN = cauHinh('kien_nhan_ms', 18000);
const NHAC_THEM_SU_CO = KIEN_NHAN * 2;
const RAC = ['mi', 'chai', 'giay', 'tui', 'bui'];
const KHOA = 'day-tro-cua-toi-v2', KHOA_HD = 'day-tro-huong-dan', KHOA_NGAY = 'day-tro-ngay', KHOA_VIEC = 'day-tro-viec', KHOA_VANG = 'day-tro-vang';
const KHOA_HEN = 'day-tro-hen';
let daVaoGame = false;

// Dãy 6 phòng. Mở phòng mới tốn tiền; mỗi phòng một màu tường cho dễ nhận.
const MO_PHONG = cauHinh('mo_phong', [0, 5500, 5500, 7000, 9000, 12000]);
// Trang trí từng phòng: sơn tường (chọn trong MAU_TUONG), lát sàn, treo rèm. Sàn đẹp, rèm làm giá phòng tăng.
const TEN_SON = ['Xanh bạc hà', 'Hồng phấn', 'Vàng kem', 'Xanh trời', 'Tím lavender', 'Cam đất'], GIA_SON = 200;
const SAN = [{ ten: 'Gạch men', mau: '#EAE3D6', kieu: 'gach', gia: 0, thue: 0 },
             { ten: 'Sàn gỗ', mau: '#E2C49A', kieu: 'go', gia: 600, thue: 150 },
             { ten: 'Gạch bông', mau: '#EAE3D6', kieu: 'bong', gia: 500, thue: 100 }];
const REM = [{ ten: 'Không rèm', mau: null, gia: 0, thue: 0 }, { ten: 'Rèm xanh lá', mau: XANH, gia: 150, thue: 50 },
             { ten: 'Rèm đỏ đất', mau: DAT, gia: 150, thue: 50 }, { ten: 'Rèm kem', mau: KEM, gia: 150, thue: 50 },
             { ten: 'Rèm hồng', mau: '#E88FA3', gia: 150, thue: 50 }, { ten: 'Rèm xanh trời', mau: '#9CC3D5', gia: 150, thue: 50 }];
const REM_YEN = REM.push({ ten: 'Rèm cách âm', mau: KEM, gia: 250, thue: 50 }) - 1;
// Đồ treo tường phải (vẽ phẳng ở toạ độ tường: u dọc tường, v từ sàn lên là âm), tâm quanh u=270, v=-175.
const TREO = [
  { ten: 'Không treo', gia: 0, thue: 0, ve: () => '' },
  { ten: 'Tranh phong cảnh', gia: 120, thue: 30, ve: () => `<path class="m" d="M270,-238 L232,-218 M270,-238 L308,-218"/><circle class="n" cx="270" cy="-239" r="4" fill="${XAM}"/>`
      + `<rect class="n" x="212" y="-218" width="116" height="84" fill="${OAK}"/><rect class="n" x="222" y="-208" width="96" height="64" fill="#CDE3EC"/>`
      + `<circle cx="296" cy="-190" r="10" fill="${VANG_MAI}"/><path class="n" fill="${XANH}" d="M222,-150 Q250,-186 276,-160 Q292,-176 318,-156 L318,-144 L222,-144 Z"/>` },
  { ten: 'Đồng hồ treo', gia: 100, thue: 20, ve: () => `<circle class="n" cx="270" cy="-176" r="42" fill="${KEM}"/><circle class="m" cx="270" cy="-176" r="34"/>`
      + [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2; return `<path class="m" d="M${f(270 + Math.cos(a) * 28)},${f(-176 + Math.sin(a) * 28)} L${f(270 + Math.cos(a) * 34)},${f(-176 + Math.sin(a) * 34)}"/>`; }).join('')
      + `<path class="n" d="M270,-176 L270,-200 M270,-176 L286,-168" fill="none"/><circle cx="270" cy="-176" r="4" fill="${MUC}"/>` },
  { ten: 'Kệ treo cây', gia: 180, thue: 50, ve: () => `<rect class="n" x="204" y="-150" width="132" height="10" rx="2" fill="${OAK}"/>`
      + `<path class="n" fill="none" d="M220,-140 L220,-124 L236,-140 M320,-140 L320,-124 L304,-140"/>`
      + [232, 270, 308].map((x, i) => `<path class="n" fill="${[DAT, KEM, DAT][i]}" d="M${x - 12},-172 L${x + 12},-172 L${x + 9},-150 L${x - 9},-150 Z"/>`
        + `<path class="n" fill="${XANH}" d="M${x},-172 Q${x - 18},-196 ${x - 6},-204 Q${x},-186 ${x},-172 Q${x + 4},-200 ${x + 16},-196 Q${x + 12},-180 ${x},-172 Z"/>`).join('') },
  { ten: 'Câu đối đỏ', gia: 100, thue: 50, goi: 'goi_tet', ve: () => [214, 326].map(x => `<rect class="n" x="${x - 14}" y="-238" width="28" height="118" fill="${DAT}"/>`
      + [0, 1, 2].map(j => `<circle cx="${x}" cy="${-214 + j * 36}" r="7" fill="${VANG_MAI}"/>`).join('')).join('')
      + `<rect class="n" x="252" y="-214" width="36" height="36" fill="${DAT}" transform="rotate(45 270 -196)"/>`
      + `<text x="270" y="-189" text-anchor="middle" font-size="18" font-weight="800" fill="${VANG_MAI}" font-family="Be Vietnam Pro, sans-serif">Phúc</text>` },
  { ten: 'Biển neon Dãy Trọ', gia: 0, thue: 80, goi: 'khoi_nghiep', ve: () => `<rect class="n" x="196" y="-236" width="148" height="78" rx="10" fill="#3A4668"/>`
      + `<text x="270" y="-196" text-anchor="middle" font-size="26" font-weight="800" fill="none" stroke="#E88FA3" stroke-width="5" opacity=".45" font-family="Be Vietnam Pro, sans-serif">DÃY TRỌ</text>`
      + `<text x="270" y="-196" text-anchor="middle" font-size="26" font-weight="800" fill="#FFE3EA" font-family="Be Vietnam Pro, sans-serif">DÃY TRỌ</text>`
      + `<text x="270" y="-172" text-anchor="middle" font-size="13" font-weight="800" fill="${VANG_MAI}" font-family="Be Vietnam Pro, sans-serif">★ CỦA TÔI ★</text>` },
  { ten: 'Poster ban nhạc', gia: 90, thue: 20, ve: () => `<rect class="n" x="228" y="-236" width="84" height="112" fill="${DAT}"/>`
      + `<circle class="n" cx="270" cy="-196" r="24" fill="${VANG_MAI}"/><path class="m" d="M240,-150 L256,-162 L270,-146 L284,-162 L300,-150"/>`
      + `<path class="m" d="M240,-136 L300,-136"/><circle cx="232" cy="-232" r="3" fill="${XAM}"/><circle cx="308" cy="-232" r="3" fill="${XAM}"/>` },
  { ten: 'Vòng nguyệt quế Noel', gia: 120, thue: 50, goi: 'goi_noel', ve: () => `<g transform="translate(270,-188)">${vongNguyetQueNoel()}</g>` },
];
// Đèn dây vàng chạy dọc mép trên cả hai tường (u 0→600, v quanh -280).
const denDay = () => {
  let s = '<path class="m" d="M10,-286 Q155,-258 300,-286 Q445,-258 590,-286"/>';
  for (let i = 0; i < 17; i++) { const x = 20 + i * 34, y = -286 + Math.sin(((x - 10) % 290) / 290 * Math.PI) * 24 + 10; s += `<circle class="n" cx="${f(x)}" cy="${f(y)}" r="6" fill="${VANG_MAI}"/>`; }
  return s;
};
const denLong = () => [150, 450].map(x => `<path class="m" d="M${x},-292 L${x},-270"/><rect class="n" x="${x - 10}" y="-272" width="20" height="6" rx="2" fill="${OAK}"/>`
  + `<ellipse class="n" cx="${x}" cy="-246" rx="24" ry="22" fill="${DAT}"/><path class="m" d="M${x},-266 L${x},-226 M${x - 12},-262 Q${x - 20},-246 ${x - 12},-230 M${x + 12},-262 Q${x + 20},-246 ${x + 12},-230"/>`
  + `<rect class="n" x="${x - 10}" y="-226" width="20" height="6" rx="2" fill="${OAK}"/><path d="M${x},-220 L${x},-202" stroke="${VANG_MAI}" stroke-width="4" stroke-linecap="round"/>`).join('');
const DEN = [{ ten: 'Không đèn', gia: 0, thue: 0 }, { ten: 'Đèn dây vàng', gia: 150, thue: 50 }, { ten: 'Đèn lồng đỏ', gia: 100, thue: 50, goi: 'goi_tet' },
  { ten: 'Đèn dây Noel', gia: 150, thue: 50, goi: 'goi_noel' }];
const veDen = i => i === 1 ? denDay() : i === 2 ? denLong() : i === 3 ? dayDenNoel(NT) : '';
const MAU_TUONG = [['#CFE0D3', '#DCE8DD'], ['#F2D9D5', '#F7E4E0'], ['#EFE3C4', '#F5ECD6'],
                   ['#D3E0EE', '#E0EAF4'], ['#E2D8EC', '#ECE4F3'], ['#F1DCC6', '#F6E6D6']];
// st.dat, st.khach, st.rac, st.giay, st.luot luôn là của PHÒNG ĐANG XEM — nhờ
// vậy phần lớn luật chơi viết cho 1 phòng vẫn dùng nguyên được.
const RIENG = ['dat', 'khach', 'rac', 'giay', 'luot'];
function ganPhong(v) {
  RIENG.forEach(t => Object.defineProperty(v, t, {
    get: () => v.phong[v.o][t], set: x => { v.phong[v.o][t] = x; }, enumerable: false, configurable: true,
  }));
  return v;
}

// Tai hoạ đầu tháng: một cảnh, hai lựa chọn. Tốn tiền cho yên, hoặc liều.
// canKhach: chỉ xảy ra khi phòng đang có người ở.
const TAI_HOA = {
  cupDien: { icon: 'den', ten: 'Cúp điện cả xóm', canKhach: true,
    loi: 'Trời 38 độ, cả xóm cúp điện tới chiều. Khách than nóng quá trời.',
    a: ['Mua quạt sạc cho khách · 150k', () => { chi(150, 'quạt sạc'); noi('Anh chị chu đáo ghê!'); diuKhach(); }],
    b: ['Ráng chịu', () => bucThem('Nóng muốn xỉu luôn…')] },
  muaNgap: { icon: 'nuoc', ten: 'Mưa ngập tới mắt cá',
    loi: 'Mưa lớn cả đêm, nước tràn vô phòng, bùn đất khắp sàn.',
    a: ['Thuê máy bơm · 200k', () => { chi(200, 'máy bơm'); loa('Nước rút rồi, sàn sạch trơn'); }],
    b: ['Tự xắn quần tát nước', () => { st.rac.push(...taoRac(5).map(v => ({ ...v, loai: 'bui' }))); loa('Chạm hoặc vuốt để lau bùn'); }] },
  troXe: { icon: 'canhBao', ten: 'Trộm xe đầu hẻm',
    loi: 'Nhà bên mất chiếc xe đạp lúc 3 giờ sáng. Cả xóm xôn xao.',
    a: ['Lắp camera hành lang · 300k', () => { chi(300, 'camera'); st.camera = true; loa('Có camera · hết lo mất đồ'); diuKhach(); }],
    b: ['Khoá cửa kỹ là được', () => { if (Math.random() < .5) bucThem('Ở đây có an toàn không anh chị…'); else loa('Hú hồn, không sao'); }] },
  karaoke: { icon: 'canhBao', ten: 'Hàng xóm hát karaoke', canKhach: true,
    loi: 'Nhà đối diện đám giỗ, hát karaoke tới 12 giờ đêm. "Để anh hát bài này nữa thôi…"',
    a: ['Mang bịch trái cây qua xin nhỏ tiếng · 50k', () => { chi(50, 'trái cây'); loa('Hàng xóm vui vẻ tắt loa'); diuKhach(); }],
    b: ['Ráng nghe', () => bucThem('Em thuộc luôn cả album rồi…')] },
  tamTru: { icon: 'bangKhen', ten: 'Kiểm tra tạm trú', canKhach: true,
    loi: 'Công an khu vực ghé hỏi: người thuê phòng mình đã đăng ký tạm trú chưa?',
    a: ['Dẫn khách đi đăng ký liền', () => loa('Giấy tờ đầy đủ · yên tâm')],
    b: ['Hẹn để mai', () => { if (Math.random() < .5) chi(500, 'tiền phạt'); else loa('Được nhắc nhở, lần sau nhớ nha'); }] },
  khachVip: { icon: 'sao', ten: 'Khách VIP ở một tháng', canTrong: true,
    loi: 'Anh khách đi công tác xin thuê một tháng. Phòng sạch là được, ảnh trả gấp đôi luôn!',
    a: [() => `Nhận khách · +${gon(giaPhong() * 2)}`, () => {
      const k = taoKhach();
      k.ten = 'Anh khách VIP'; k.can = []; k.tran = giaPhong() * 2; st.khach = k;
      choThueThat(0, true);
      const them = k.tien; k.tien *= 2; k.con = 0;
      doiTien(them, `+${dong(them)} khách VIP`); loa('Trả đủ hai phần tiền · tháng sau anh đi công tác tiếp');
    }],
    b: ['Để phòng cho khách ở lâu', () => loa('Anh hẹn dịp khác ghé nha!')] },
  choDoCu: { icon: 'nha', ten: 'Bà hàng xóm cho đồ cũ',
    loi: 'Bà chủ trọ kế bên dọn kho: “Đồ còn xài tốt nè, con lấy về bày phòng đi!”',
    a: ['Nhận đồ, cảm ơn bà', () => tangDoCu()],
    b: ['Nhường cho người đang cần', () => loa('Bà đem cho bạn sinh viên mới lên phố rồi')] },
  tromRinh: { icon: 'canhBao', ten: 'Có người rình trước dãy',
    loi: 'Một người cứ ngó vô dãy trọ rồi quay xe. Cô bán nước bảo coi chừng trộm đó!',
    a: ['Lắp camera · 300k', () => { chi(300, 'camera'); st.camera = true; loa('Camera sáng đèn · người lạ đi mất'); }, 300],
    b: ['Khoá cửa rồi liều', () => { if (Math.random() < .5) chi(200, 'bị trộm'); else loa('Hú hồn, đêm nay yên ổn'); }] },
  nguoiYeuCu: { icon: 'thu', ten: 'Người yêu cũ tới làm loạn', canKhach: true,
    loi: 'Người yêu cũ của khách đứng ngoài cửa gọi tên om sòm. Cả dãy hóng, khách thì muốn độn thổ.',
    a: ['Khuyên người kia về, dỗ khách', () => { diuKhach(); noi('Cảm ơn anh chị, em đỡ ngại rồi.'); }],
    b: ['Chuyện riêng, tự giải quyết', () => bucThem('Em đang rối mà anh chị…')] },
  matDienDem: { icon: 'den', ten: 'Cả dãy tối thui', canKhach: true,
    loi: 'Đang nấu cơm thì mất điện. Khách soi đèn điện thoại, muỗi bay như đi hội.',
    a: ['Mua đèn sạc · 120k', () => { chi(120, 'đèn sạc'); diuKhach(); loa('Có đèn rồi · cả dãy ngồi ăn cơm chung'); }, 120],
    b: ['Chờ điện về thôi', () => bucThem('Tối quá, em còn chưa ăn cơm…')] },
  tuThien: { icon: 'thu', ten: 'Mượn sân phát quà',
    loi: 'Đoàn từ thiện xin mượn sân một buổi phát quà. Chỉ cần chút chỗ đứng, không tốn tiền mình.',
    a: ['Mời vô sân · +1 uy tín', () => doiUyTin(1, 'Cả xóm quý chủ trọ hơn · +1 uy tín')],
    b: ['Hôm nay sân đang bận', () => loa('Đoàn cảm ơn rồi qua sân nhà bên')] },
  quenVi: { icon: 'tien', ten: 'Khách để quên ví', canKhach: true,
    loi: 'Dọn sân thấy ví của khách, trong có 300k. Khách đang chạy khắp nơi tìm muốn khóc.',
    a: ['Trả lại · +1 uy tín', () => { doiUyTin(1, 'Khách mừng quá · +1 uy tín'); diuKhach(); }],
    b: ['Giữ 300k, chắc không ai biết', () => {
      doiTien(300, '+300.000đ trong ví');
      if (Math.random() < .3) { doiUyTin(-2, 'Khách phát hiện rồi · −2 uy tín'); bucThem('Em thấy anh chị nhặt ví mà…'); }
      else loa('Cất ví rồi mà thấy trong lòng hơi cấn…');
    }] },
  meoHoang: { icon: 'meo', ten: 'Ổ mèo con trong kho',
    loi: 'Mèo hoang đẻ một ổ trong kho. Mấy bé bé xíu, khách đứng nhìn hoài không chịu đi làm.',
    a: ['Nuôi luôn, bày một ổ mèo', () => tangDoCu('oMeo')],
    b: ['Tìm người nhận nuôi · +1 uy tín', () => doiUyTin(1, 'Mấy bé có nhà mới rồi · +1 uy tín')] },
  sinhNhat: { icon: 'banh', ten: 'Sinh nhật vang cả dãy', canKhach: true,
    loi: 'Khách mở sinh nhật, hát to quá trời. Nhà bên đã thò đầu qua cửa sổ ba lần rồi.',
    a: ['Nhắc nhỏ tiếng, vẫn chúc mừng', () => { diuKhach(); loa('Khách hạ loa · nhà bên ngủ được rồi'); }],
    b: ['Qua góp vui · +1 uy tín', () => doiUyTin(1, 'Khách vui · +1 uy tín. Nhà bên nhắc mai nhớ nhỏ tiếng nha!')] },
  noDon: { icon: 'qua', ten: 'Khách livestream nổ đơn', canKhach: true,
    loi: 'Khách bán hàng chốt cả trăm đơn, cười từ sáng tới giờ: “Nhờ phòng mình hợp vía đó!”',
    a: ['Nhận tiền cảm ơn · +200k', () => { doiTien(200, '+200.000đ khách cảm ơn'); diuKhach(); }],
    b: ['Giữ tiền nhập hàng đi · +1 uy tín', () => doiUyTin(1, 'Khách quý chủ trọ ghê · +1 uy tín')] },
};

// Lá thư khách để lại khi dọn đi vui vẻ: [chuyện riêng, cách xưng].
const LA = {
  sinhVien: ['Em ra trường rồi! Mấy năm ở trọ, phòng mình là chỗ em thấy giống nhà nhất.', 'Em'],
  congNhan: ['Em được lên tổ trưởng, chuyển qua ở gần xưởng mới.', 'Em'],
  voChong:  ['Tụi em sắp có em bé, về quê cho ông bà phụ trông.', 'Tụi em'],
  veHuu:    ['Con cháu đón tui về ở chung rồi.', 'Tui'],
};

const TIEN_DAU = 3000, GIA_NEN = 800, TIP = 100;
const LUOT = 3;                  // số người hỏi thuê tối đa mỗi tháng
const SO_THANG = 6;              // tháng 10 → tháng 3 (Tết)
const MUC_TIEU = [1200, 1500, 1500, 1800, 2000, 2200];
const QUAY = location.search.includes('bung');

const bat = a => a[Math.floor(Math.random() * a.length)];
const tron = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const khoang = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));
const dong = k => TRONG_APP ? (k * 1000).toLocaleString('vi-VN') + 'đ' : tienWeb35(k);
const gon = k => k >= 1000 ? (k / 1000).toLocaleString('vi-VN') + 'tr' : k ? k + 'k' : '0';
const trieu = k => TRONG_APP ? (k / 1000).toLocaleString('vi-VN') + ' triệu' : tienWeb35(k);
const thangSo = i => (9 + i) % 12 + 1;
const namSo = i => 2026 + Math.floor((9 + i) / 12);
const mucTieu = i => MUC_TIEU[i] ?? 2200 + (i - 5) * 200;

// Một mục tiêu gần, phần thưởng nhỏ chỉ nhận một lần trong mỗi ván.
const MOC_GAN = [
  { ma: 'don', ten: 'Dọn sạch phòng đầu tiên', dat: () => !st.phong[0].rac.length },
  { ma: 'khach', ten: 'Đón khách đầu tiên', dat: () => st.soKhach > 0 },
  { ma: 'thang', ten: 'Cho thuê đủ 1 tháng', dat: () => st.thangThueDau != null && st.thang > st.thangThueDau },
  { ma: 'tien', ten: 'Để dành tiền mở phòng 2', dat: () => st.tien >= MO_PHONG[1] || st.phong[1].mo },
  { ma: 'phong2', ten: 'Mở phòng 2', dat: () => st.phong[1].mo },
  { ma: 'haiKhach', ten: 'Có 2 phòng đang cho thuê', dat: () => st.phong.filter(p => !p.loai && p.khach?.o).length >= 2 },
  { ma: 'matBang', ten: 'Để dành tiền mở mặt bằng', dat: () => st.phong[MB].mo },
  { ma: 'canHo', ten: 'Để dành tiền mua căn hộ riêng', dat: () => st.phong[NHA].mo },
];
const BANG_LINH = TREO.push({ ten: 'Bằng khen của Linh', gia: 0, thue: 0, qua: 'linh', ve: () =>
  `<rect class="n" x="206" y="-222" width="128" height="90" fill="${OAK}"/><rect class="n" x="214" y="-214" width="112" height="74" fill="${KEM}"/>`
  + `<text x="270" y="-191" text-anchor="middle" font-size="13" font-weight="800" fill="${MUC}">BẰNG KHEN</text><path class="m" d="M234,-180 L306,-180 M246,-169 L294,-169"/>`
  + `<circle cx="270" cy="-155" r="9" fill="${DAT}"/><path d="M265,-149 L263,-136 L270,-141 L277,-136 L275,-149" fill="${DAT}"/>` }) - 1;
const QUA_NGAY_TREO = ['Dây cờ vải', 'Tranh hoa nhỏ', 'Tranh ngôi nhà'].map((ten, i) => TREO.push({
  ten, gia: 0, thue: 0, qua: 'ngay' + i, ve: () => i === 0
    ? `<path class="m" d="M204,-208 Q270,-180 336,-208"/>` + [224, 252, 280, 308].map((x, j) => `<path class="n" d="M${x - 9},-197 L${x + 9},-197 L${x},-175 Z" fill="${[DAT, XANH, KEM, OAK][j]}"/>`).join('')
    : `<rect class="n" x="232" y="-220" width="76" height="84" rx="3" fill="${OAK}"/><rect x="239" y="-213" width="62" height="70" fill="${KEM}"/>`
      + (i === 1 ? `<path class="m" d="M270,-153 L270,-185 M270,-170 L255,-182"/><circle cx="270" cy="-190" r="16" fill="${DAT}"/><circle cx="270" cy="-190" r="6" fill="${VANG_MAI}"/>`
        : `<path class="n" d="M249,-176 L270,-197 L291,-176 L291,-153 L249,-153 Z" fill="${XANH}"/><rect x="266" y="-170" width="10" height="17" fill="${OAK}"/>`),
}) - 1);
function kiemMucGan() {
  if (!st?.mocDat) return;
  let thuong = 0;
  for (const m of MOC_GAN) {
    if (st.mocDat.includes(m.ma)) continue;
    if (!m.dat()) break;
    st.mocDat.push(m.ma); thuong += 100;
    ghi('muc_tieu_dat', { moc: m.ma, thang: st.thang + 1 });
    setTimeout(() => loa(` ${m.ten} · thưởng 100k!`), 600 + thuong * 10);
  }
  if (thuong) doiTien(thuong, ' Thưởng mục tiêu');
}
function veMucGan() {
  const m = MOC_GAN.find(m => !st.mocDat?.includes(m.ma));
  let chu = m?.ten || 'Dãy trọ ngày càng đẹp · bày căn hộ theo ý bạn';
  const gia = m?.ma === 'tien' ? MO_PHONG[1] : m?.ma === 'matBang' ? COC_MB + THUE_MB + 800 : m?.ma === 'canHo' ? GIA_NHA : 0;
  if (gia) chu = `Còn thiếu ${dong(Math.max(0, gia - st.tien))} để ${m.ma === 'tien' ? 'mở phòng 2' : m.ma === 'matBang' ? 'mở mặt bằng' : 'mua căn hộ'}`;
  $('#mucGanChu').textContent = chu;
  $('#mucGanTien').hidden = !gia;
  $('#mucGanTien').value = Math.max(0, st.tien); $('#mucGanTien').max = gia || 1;
  const c = st.thuaKe, ngay = $('#ngayThuaKe');
  ngay.hidden = !c;
  ngay.textContent = !c ? '' : c.dat ? 'Ngày 30/30 · Đã giữ được dãy trọ của bà ♡'
    : c.giaHan ? 'Ngày 30/30 · Được thêm thời gian, mình đón khách nhé'
      : 'Ngày 1/30 · Đón khách, giữ dãy trọ của bà qua kỳ thuê đầu';
}
$('#nutMucGan').addEventListener('click', () => xepHang(() => {
  const uyTin = $('#mucGanUyTin');
  if (uyTin) uyTin.textContent = `${veSao(saoDay())} · Uy tín ${st.uyTin || 0}. Sao cho biết dãy trọ được khách quý đến đâu. Chăm khách, sửa sự cố và xử lý chuyện trong xóm giúp tăng uy tín.`;
  $('#mucGanDayDu').textContent = $('#mucGanChu').textContent;
  $('#mucGanNgay').textContent = $('#ngayThuaKe').textContent;
  $('#mucGanThang').textContent = $('#mucTieu').textContent;
  const thanh = $('#mucGanTien'), dayDu = $('#mucGanThanh');
  dayDu.hidden = thanh.hidden; dayDu.max = thanh.max; dayDu.value = thanh.value;
  $('#manMucGan').classList.add('hien'); huongDan();
}));
// Cả vùng tên phòng nhận chạm, nên không cần ô sao bé khó bấm.
$('.giua').addEventListener('click', () => $('#nutMucGan').click());
$('.giua').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#nutMucGan').click(); } });
$('#mucGanXong').addEventListener('click', () => {
  $('#manMucGan').classList.remove('hien'); tiepHang(); huongDan();
});
// Thêm cuối danh sách để chỉ số đồ treo trong ván cũ không đổi.
const ANH_BA = TREO.push({ ten: 'Ảnh bà', gia: 0, thue: 0, qua: 'ba', ve: () =>
  `<rect class="n" x="226" y="-228" width="88" height="102" rx="4" fill="${OAK}"/>`
  + `<rect x="233" y="-221" width="74" height="88" fill="${KEM}"/>`
  + `<path d="M245,-139 Q245,-168 270,-168 Q295,-168 295,-139" fill="${XANH}"/>`
  + `<circle cx="270" cy="-190" r="22" fill="#CBC7BF"/><circle cx="270" cy="-183" r="17" fill="${KEM}"/>`
  + `<path class="m" d="M257,-184 h9 m8,0 h9 M266,-184 h8 M263,-174 Q270,-168 277,-174"/>` }) - 1;
// Nối sau cả Ảnh bà để mọi chỉ số trang trí của ván cũ giữ nguyên.
const QUA_CHUOI_TREO = ['Khung hoa hẹn mai', 'Khung mèo bên cửa', 'Khung nắng đầu ngõ'].map((ten, i) => TREO.push({
  ten, gia: 0, thue: 0, qua: 'chuoi' + i, ve: () => `<rect class="n" x="222" y="-226" width="96" height="94" rx="8" fill="${OAK}"/>`
    + `<rect x="230" y="-218" width="80" height="78" rx="4" fill="${KEM}"/>`
    + `<text x="270" y="-165" text-anchor="middle" font-size="39">${['', '', ''][i]}</text>`,
}) - 1);
const MO_DAU_THUA_KE = [
  ['Lá thư trong ngăn tủ', 'Bà nội để lại cho bạn một dãy trọ cũ. Trong ngăn tủ còn một lá thư, gấp ngay ngắn…'],
  ['Bà gửi cháu', '“Bà giao cho con. Giữ được nó 30 ngày, có người thuê, thì nó là của con.”\n\n— Bà nội'],
  ['Tin nhắn của người nhà', '“30 ngày nữa không ra gì thì bán.”\n\nMình cứ thử đã. Dãy trọ này còn bao chuyện của bà.'],
  ['Mình mở cửa nhé', 'Một kỳ thuê trong game là 30 ngày. Mình dọn phòng, bày đồ rồi đón khách đầu tiên nhé.\n\nChưa kịp thì được thêm thời gian, đừng lo.'],
];
function moThuaKe() {
  const c = st.thuaKe;
  if (!c || c.buoc >= MO_DAU_THUA_KE.length) return;
  const [ten, loiCu] = MO_DAU_THUA_KE[c.buoc];
  // Giữ mã bước 0..4 để ván cũ tiếp tục đúng chỗ; gộp các khung chưa đọc.
  const chu = c.buoc === 0 ? `${loiCu}\n\n${MO_DAU_THUA_KE[1][1]}`
    : c.buoc === 2 ? `${loiCu}\n\n${MO_DAU_THUA_KE[3][1]}` : loiCu;
  $('#thuaKeBuoc').textContent = `Chuyện của bà · ${c.buoc < 2 ? 1 : 2}/2`;
  $('#thuaKeTen').textContent = ten; $('#thuaKeChu').textContent = chu;
  $('#nutThuaKe').textContent = c.buoc >= 2 ? 'Dọn phòng thôi' : 'Đọc tiếp';
  $('#boQuaThuaKe').hidden = false;
  $('#manThuaKe').classList.add('hien'); huongDan();
  ghi('mo_dau', { buoc: c.buoc + 1, bo_qua: 0 });
}
function moThuBa() {
  const c = st.thuaKe;
  if (!c?.thuChoDoc) return tiepHang();
  $('#thuaKeBuoc').textContent = c.dat ? 'Ngày 30/30 · Quà của bà' : 'Ngày 30/30 · Tin nhắn người nhà';
  $('#thuaKeTen').textContent = c.dat ? 'Bà biết con làm được mà' : 'Mình cứ từ từ';
  $('#thuaKeChu').textContent = c.thuChoDoc;
  $('#nutThuaKe').textContent = c.dat ? 'Giữ dãy trọ cùng bà ♡' : 'Mình đón khách tiếp';
  $('#boQuaThuaKe').hidden = true;
  $('#manThuaKe').classList.add('hien');
}
function tiepThuaKe(boQua = false) {
  if (thuVayDang) return nhanThuBa(!boQua);
  const c = st.thuaKe;
  if (!c) return;
  if (c.buoc < MO_DAU_THUA_KE.length) {
    if (boQua) ghi('mo_dau', { buoc: c.buoc + 1, bo_qua: 1 });
    c.buoc = boQua || c.buoc >= 2 ? MO_DAU_THUA_KE.length : 2;
    if (c.buoc < MO_DAU_THUA_KE.length) { luu(); return moThuaKe(); }
    xongMoDau(boQua);
  } else c.thuChoDoc = null;
  $('#manThuaKe').classList.remove('hien');
  luu(); tiepHang(); huongDan();
}
$('#nutThuaKe').addEventListener('click', () => tiepThuaKe());
$('#boQuaThuaKe').addEventListener('click', () => tiepThuaKe(true));
function xongMoDau(boQua = false) {
  // Ván có trước thử nghiệm không tự gán nhóm hay phát lại mốc phễu.
  if (!st.nhomMoDau || st.moDauXong) return;
  st.moDauXong = true;
  ghi('xong_mo_dau', { nhom: st.nhomMoDau, bo_qua: boQua ? 1 : 0 });
  luu();
}
function kiemThuThach30() {
  const c = st.thuaKe;
  // Kỳ thuê đầu (st.thang 0 → 1) tương đương 30 ngày; không đổi lịch/thời gian thật.
  if (!c || c.dat || st.thang < 1) return;
  const dat = st.phong.some(p => p.mo && !p.loai && p.khach?.o);
  if (!dat && c.giaHan) return;
  c.dat = dat; c.giaHan = !dat;
  if (dat && !st.quaTrangTri.includes('ba')) st.quaTrangTri.push('ba');
  c.thuChoDoc = dat
    ? '“Thấy có người về ở, bà mừng lắm. Con giữ được mái nhà này rồi. Cứ chăm chút từng chút một nhé.”\n\n— Bà nội\n\n Đã nhận Ảnh bà. Vào Trang trí → Treo tường để đặt trong phòng.'
    : '“Thôi, cho thêm thời gian. Cứ dọn cho gọn rồi đón người về ở nhé.”\n\nDãy trọ vẫn ở đây, mình làm tiếp thôi.';
  st.la = [...(st.la || []), c.thuChoDoc];
  ghi('thu_thach_30', { dat: dat ? 1 : 0 });
  xepHang(() => { if (st.thuaKe === c) moThuBa(); else tiepHang(); });
}
// Sao dãy trọ 1→5 theo UY TÍN: tháng đạt mục tiêu, khách dọn đi vui vẻ để lại thư,
// chiều khách dịp lễ → cộng; khách bỏ đi vì bực hay vì bị dọn mất đồ → trừ.
// Sao cao thì mỗi tháng có thêm người hỏi thuê, và khách chịu chi hơn.
const MOC_SAO = [0, 3, 6, 10, 15];
const saoDay = () => MOC_SAO.filter(m => (st.uyTin || 0) >= m).length;
const veSao = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const luotThang = () => LUOT + (saoDay() >= 3 ? 1 : 0) + (saoDay() >= 5 ? 1 : 0);
// Năm âm lịch theo can chi: 2027 = Đinh Mùi.
const canChi = y => ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'][y % 10] + ' '
  + ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'][y % 12];
// Tháng 12 và tháng 1 là "sắp Tết" (bán đồ Tết, khách đòi không khí Tết); tháng 2 là Tết.
const ganTet = () => cauHinh('su_kien_mua', '') === 'tet' || [12, 1, 2].includes(thangSo(st.thang));
const laTet = () => thangSo(st.thang) === 2;

let st;   // trạng thái ván chơi
const phongMoi = (x = {}) => ({ mo: false, dat: [], khach: null, rac: [], giay: null, luot: LUOT, ...x });
// Hai phòng đặc biệt nằm sau 6 phòng trọ: mặt bằng thuê của người khác (số 7) và căn hộ riêng (số 8).
// Mặt bằng có loai 'tiem', 'traSua' hoặc không có loai (cho thuê lại làm trọ).
const phongDB = () => [phongMoi({ mb: true, luot: 0, rong: 6 }), phongMoi({ loai: 'nha', luot: 0, rong: 6 })];
const MB = 6, NHA = 7;
const COC_MB = 3000, THUE_MB = 1500, LUONG_NV = 1500, GIA_NHA = 60000;
const DIEN_TRA = 300;
const laQuan = p => p.loai === 'tiem' || p.loai === 'traSua';
const tenQuan = p => p.loai === 'traSua' ? ' Quán trà sữa' : ' Tiệm bánh';
const tenP = i => i < 6 ? `P.${i + 1}` : st.phong[i].loai === 'nha' ? 'Căn hộ' : laQuan(st.phong[i]) ? tenQuan(st.phong[i]) : 'Mặt bằng';
function moi() {
  st = ganPhong({ thang: 0, tien: TIEN_DAU, o: 0, idKe: 1, dem: false, chon: null,
    phong: [...Array.from({ length: 6 }, (_, i) => phongMoi({ mo: i === 0 })), ...phongDB()],
    thu: 0, sao: 0, tong: 0, soKhach: 0, daBung: 0, tiep: false, suCo: null, saoThang: -1, uyTin: 0, gap: {}, tt: [], ttDem: {} });
  clearTimeout(henTT); hangTT = []; $('#ttBao').classList.remove('hien');
  st.rac = taoRac(6);   // nhận lại phòng cũ: bụi bặm, rác của người trước
  st.mocDat = []; st.thangThueDau = null;
  st.vayBa = { no: 0, lan: -6, cho: null }; st.thangThueGan = 0;
  thuVayDang = false; lucThaoTac = Date.now(); nhacDauDa = '';
  st.chuyenLinh = null; st.quaTrangTri = [];
  st.thuaKe = cauHinh('mo_dau_thua_ke', true) ? { buoc: 0, dat: false, giaHan: false, thuChoDoc: null } : null;
  st.nhomMoDau = st.thuaKe ? 'co' : 'khong'; st.moDauXong = false;
  tienHien = TIEN_DAU;
}

// Rác rải trên các ô trống, lệch ngẫu nhiên trong ô cho trông tự nhiên.
function taoRac(n, p = st.phong[st.o]) {
  const ban = new Set(p.dat.flatMap(v => o(v.k, v.gx, v.gy))), cho = [];
  const n0 = p.rong || 5;
  for (let gx = 0; gx < n0; gx++) for (let gy = 0; gy < n0; gy++) {
    const c = `${gx},${gy}`;
    if (!ban.has(c) && !(p.giay && p.giay.join() === c)) cho.push([gx, gy]);
  }
  return tron(cho).slice(0, n).map(([gx, gy]) => ({ id: st.idKe++, gx, gy, ox: (Math.random() - .5) * 60, oy: (Math.random() - .5) * 60, loai: bat(RAC) }));
}

// Những tháng đầu: khách đang ở có hai chỗ bụi nhỏ để chủ trọ chăm phòng.
// Việc tự chọn, không phạt nếu bỏ qua; không sinh lại khi vẽ hay tải ván.
function buiDauThang(p) {
  if (st.thang >= 6 || p.loai || !p.mo || !p.khach?.o || p.rac.length || p.donDauThang === st.thang) return;
  p.donDauThang = st.thang;
  const ban = new Set(p.dat.flatMap(v => o(v.k, v.gx, v.gy))), cho = [];
  for (let gy = (p.rong || 5)-1; gy >= 0; gy--) for (let gx = 0; gx < (p.rong || 5); gx++) {
    if (!ban.has(`${gx},${gy}`) && p.giay?.join() !== `${gx},${gy}`) cho.push([gx,gy]);
  }
  p.rac = cho.slice(0,2).map(([gx,gy])=>({id:st.idKe++,gx,gy,ox:0,oy:0,loai:'bui'}));
}

// Lưu ván vào máy người chơi: mai mở lại chơi tiếp (cần cho đo quay lại ngày 2–3).
let henLuuApp;
function luu(ngay = false) {
  try { localStorage.setItem(KHOA_VANG, Date.now()); } catch { /* như dưới */ }
  try { localStorage.setItem(KHOA, JSON.stringify({ ...st, suCo: null, dem: false, chon: null })); } catch { /* không lưu được thì thôi */ }
  // Trong app: gửi thêm một bản sao cho app cất (AsyncStorage), phòng khi dữ liệu WebView bị xoá.
  // Thao tác thường gom 800ms; mốc quan trọng và vào nền gửi đồng bộ.
  if (TRONG_APP) {
    clearTimeout(henLuuApp);
    const gui = () => guiApp({ loai: 'luu', du: JSON.stringify({ ...st, suCo: null, dem: false, chon: null }) });
    if (ngay) gui(); else henLuuApp = setTimeout(gui, 800);
  }
}
function docLuu() {
  // Bản trong máy hỏng thì thử bản sao app cất (AsyncStorage), rồi mới coi như chưa có ván.
  let ls = null;
  try { ls = localStorage.getItem(KHOA); } catch { /* như dưới */ }
  for (const nguon of [ls, window.BAN_SAO]) {
    try { const v = JSON.parse(nguon || 'null'); if (v && Array.isArray(v.phong)) return v; } catch { /* thử nguồn sau */ }
  }
  return null;
}

function taoKhach(kieuHen) {
  if (!kieuHen && !st.chuyenLinh) return { kieu: 'sinhVien', ten: 'Linh', dang: NU, can: ['ngu', 'nuoc', 'hoc'], tran: 1500, tang: 'phòng yên tĩnh trước kỳ thi', o: false, chuyen: 'linh' };
  const kieu = kieuHen || bat(Object.keys(KIEU)), K = KIEU[kieu];
  const [ten, dang] = kieuHen ? K.nguoi[0] : bat(K.nguoi);
  const can = tron(K.can).slice(0, Math.random() < .5 ? 2 : 3);
  if (ganTet() && Math.random() < .5) can.unshift('tet');   // pop bên dưới bỏ từ cuối, giữ lại đòi hỏi Tết
  // Trần giá phải luôn làm được: tính giá phòng rẻ nhất vẫn đủ đòi hỏi.
  const re = n => Math.min(...Object.values(DO).filter(d => d.nhom === n).map(d => d.thue));
  let tran;
  for (;;) {
    const san = GIA_NEN + can.reduce((s, n) => s + re(n), 0);
    tran = K.tran.filter(c => c >= san + 100);
    if (tran.length) break;
    can.pop();
  }
  // Dãy trọ 4 sao trở lên có tiếng: khách chọn mức giá cao nhất mình chịu được.
  return { kieu, ten, dang, can, tran: saoDay() >= 4 ? Math.max(...tran) : bat(tran), tang: bat(K.tang), o: false };
}
const cauHoi = k => !TRONG_APP && k.web35Trum ? window.Web35.hoiTrum(k) : KIEU[k.kieu].hoi(trieu(k.tran), [...k.can.map(n => NHOM[n].ten), k.tang].join(', '));

// ── Phòng và luật ──────────────────────────────────────────────────────────
const NOI_RONG = 3000;   // nới rộng 5×5 → 6×6
const giaPhong = () => { const p = st.phong[st.o]; return GIA_NEN + (!TRONG_APP && !p.mb && !p.loai && p.rong >= 7 ? 600 : p.rong > 5 ? 300 : 0) + st.dat.reduce((s, v) => s + DO[v.k].thue, 0) + SAN[p.san || 0].thue + REM[p.rem || 0].thue + TREO[p.treo || 0].thue + DEN[p.den || 0].thue; };
const coNhom = n => st.dat.some(v => DO[v.k].nhom === n);
const duCan = k => k.can.every(coNhom);
const vuaGia = k => giaPhong() <= k.tran;
const ungY = () => !!st.khach && !st.khach.o && duCan(st.khach) && vuaGia(st.khach);
const nhomThem = k => new Set(st.dat.map(v => DO[v.k].nhom).filter(n => !k.can.includes(n))).size;
const canNhom = () => !st.khach ? [] : st.khach.o ? (st.khach.muon ? [st.khach.muon] : []) : st.khach.can;

// ── Toạ độ ─────────────────────────────────────────────────────────────────
const coCua = k => DO[k].co || [1, 1];
const tamO = (k, gx, gy) => { const [w, d] = coCua(k); return [(gx + w / 2) * T, (gy + d / 2) * T]; };
const mat = () => new Set(st.dat.flatMap(v => o(v.k, v.gx, v.gy)));
function o(k, gx, gy) {
  const [w, d] = coCua(k), r = [];
  for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) r.push(`${gx + i},${gy + j}`);
  return r;
}
function datSan(k, gx, gy, boQua) {
  const [w, d] = coCua(k);
  if (gx < 0 || gy < 0 || gx + w > N || gy + d > N) return false;
  const ban = new Set(st.dat.filter(v => v.id !== boQua && !v.tren).flatMap(v => o(v.k, v.gx, v.gy)));
  return o(k, gx, gy).every(c => !ban.has(c));
}
// Đồ nhỏ thả lên ô có bàn / kệ / tủ: trả về món làm mặt (mỗi mặt chỉ một món nhỏ).
function beMat(k, gx, gy, boQua) {
  if (!NHO.has(k)) return null;
  const c = `${gx},${gy}`;
  const m = st.dat.find(v => MAT[v.k] && v.id !== boQua && o(v.k, v.gx, v.gy).includes(c));
  return m && !st.dat.some(v => v.tren === m.id && v.id !== boQua) ? m : null;
}
const datDuoc = (k, gx, gy, boQua) => datSan(k, gx, gy, boQua) || !!beMat(k, gx, gy, boQua);
// Độ cao màn hình của món nhỏ đang nằm trên mặt (0 nếu nằm dưới sàn).
const caoTren = id => { const m = st.dat.find(v => v.id === id); return m ? MAT[m.k] * (DO[m.k].to || 1) : 0; };
// Từ điểm trên màn hình (toạ độ svg) về toạ độ sàn — ngược lại hàm P ở z = 0.
function veSan(X, Y) {
  const a = X / C, b = Y / S;
  return [(a + b) / 2, (b - a) / 2];
}

// ── Vẽ căn phòng ───────────────────────────────────────────────────────────
const svg = $('#phong');
function datKhung() {
  N = st?.phong[st.o]?.rong || 5; NT = N * T;
  svg.setAttribute('viewBox', `${-NT * C - 30} ${-HW - 40} ${2 * NT * C + 60} ${HW + NT + 90}`);
}
datKhung();

function tuongVaSan() {
  const toi = st.dem;
  const ph = st.phong[st.o], mt = MAU_TUONG[(ph.son ?? st.o) % MAU_TUONG.length], san = SAN[ph.san || 0], rem = REM[ph.rem || 0];
  let s = poly([[0, 0, 0], [0, NT, 0], [0, NT, HW], [0, 0, HW]], mt[0])      // tường trái
        + poly([[0, 0, 0], [NT, 0, 0], [NT, 0, HW], [0, 0, HW]], mt[1]);     // tường phải
  // Cửa sổ song sắt trên tường trái. Ma trận đưa hình phẳng vào mặt phẳng x = 0.
  s += `<g transform="matrix(${f(-C)},${f(S)},0,1,0,0)">`
     + `<rect class="n" x="160" y="-250" width="200" height="140" fill="${OAK}"/>`
     + `<rect class="n" x="172" y="-238" width="176" height="116" fill="${toi ? '#3A4668' : '#CDE3EC'}"/>`
     + (toi ? `<circle class="n" cx="310" cy="-206" r="14" fill="${KEM}"/>`
            : `<ellipse class="tron" cx="215" cy="-200" rx="26" ry="10" fill="#fff"/><ellipse class="tron" cx="236" cy="-208" rx="16" ry="10" fill="#fff"/>`)
     + [196, 220, 244, 268, 292, 316].map(x => `<path class="m" d="M${x},-238 L${x},-122"/>`).join('')
     + `<path class="n" fill="${KEM}" d="M172,-238 L206,-238 Q196,-200 210,-160 Q200,-140 206,-122 L172,-122 Z"/>`
     + `<rect class="n" x="150" y="-112" width="220" height="12" fill="${OAK}"/>`
     + (ph.loai === 'tiem' ? tuongTiem([70, 470]) : '')
     + (ph.loai === 'traSua' ? tuongTra() : '')
     + veDen(ph.den)
     + (rem.mau ? `<rect class="n" x="144" y="-268" width="232" height="8" rx="4" fill="${OAK}"/>`
       + `<path class="n" fill="${rem.mau}" d="M150,-262 L198,-262 Q188,-200 202,-140 Q192,-118 200,-98 L150,-98 Z"/>`
       + `<path class="n" fill="${rem.mau}" d="M370,-262 L322,-262 Q332,-200 318,-140 Q328,-118 320,-98 L370,-98 Z"/>`
       + `<path class="m" d="M166,-258 Q162,-180 168,-102 M184,-258 Q178,-190 184,-104 M354,-258 Q358,-180 352,-102 M336,-258 Q342,-190 336,-104"/>` : '')
     + (ph.cuaSach ? `<path class="m cua-sach" d="M230,-214 L230,-198 M222,-206 L238,-206 M290,-182 L290,-170 M284,-176 L296,-176"/>` : '')
     + `</g>`;
  // Nón lá treo đinh, ổ điện, và số phòng trên tường phải (mặt phẳng y = 0).
  s += `<g transform="matrix(${f(C)},${f(S)},0,1,0,0)">`
     + (ph.loai === 'tiem' ? tuongTiem([600]) + menuTiem()
        : ph.loai === 'traSua' ? tuongTra() + menuTra()
        : `<path class="m" d="M420,-232 L392,-196 M420,-232 L448,-196"/>`
        + `<circle class="n" cx="420" cy="-234" r="4" fill="${XAM}"/>`
        + `<circle class="n" cx="420" cy="-160" r="48" fill="${KEM}"/>`
        + `<circle class="m" cx="420" cy="-160" r="33"/><circle class="m" cx="420" cy="-160" r="18"/>`
        + `<circle class="n" cx="420" cy="-160" r="5" fill="${OAK}"/>`)
     + `<rect class="n" x="150" y="-66" width="28" height="36" rx="5" fill="${KEM}"/>`
     + `<circle class="tron" cx="160" cy="-48" r="2.5" fill="${MUC}"/><circle class="tron" cx="168" cy="-48" r="2.5" fill="${MUC}"/>`
     + (ph.loai === 'tiem' ? `<rect class="n" x="30" y="-252" width="170" height="44" rx="8" fill="${DAT}"/>`
          + `<text x="115" y="-221" text-anchor="middle" font-size="24" font-weight="800" fill="${KEM}" font-family="Be Vietnam Pro, sans-serif">TIỆM BÁNH</text>`
        : ph.loai === 'traSua' ? `<rect class="n" x="30" y="-252" width="210" height="44" rx="8" fill="${XANH}"/>`
          + `<text x="135" y="-221" text-anchor="middle" font-size="24" font-weight="800" fill="${KEM}" font-family="Be Vietnam Pro, sans-serif">TRÀ SỮA</text>`
        : ph.loai === 'nha' ? ''
        : `<rect class="n" x="60" y="-250" width="56" height="40" rx="6" fill="${DAT}"/>`
          + `<text x="88" y="-221" text-anchor="middle" font-size="${st.o < 6 ? 26 : 20}" font-weight="800" fill="${KEM}" font-family="Be Vietnam Pro, sans-serif">${st.o < 6 ? 'P.' + (st.o + 1) : 'MB'}</text>`)
     + TREO[ph.treo || 0].ve() + veDen(ph.den)
     + (ganTet() ? tuongTet() : '') + tuongLe()
     + `</g>`;
  // Sàn: gạch men 60×60 (mỗi ô chơi 2×2 viên), sàn gỗ (ván dọc), hoặc gạch bông (ô xen màu).
  s += poly([[0, 0, 0], [NT, 0, 0], [NT, NT, 0], [0, NT, 0]], san.mau);
  if (san.kieu === 'bong') {
    for (let gx = 0; gx < N * 2; gx++) for (let gy = 0; gy < N * 2; gy++) if ((gx + gy) % 2)
      s += `<polygon class="ron" fill="#E6CDB6" points="${pts([[gx, gy], [gx + 1, gy], [gx + 1, gy + 1], [gx, gy + 1]].map(([a, b]) => P(a * 60, b * 60, 0)))}"/>`;
  }
  if (san.kieu === 'go') {
    for (let i = 1; i < 15; i++) {
      const a = P(0, i * 40, 0), b = P(NT, i * 40, 0);
      s += `<path class="ron" style="stroke:#C9A676" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`;
      for (let x = ((i * 157) % 200) + 60; x < NT; x += 200) { const c = P(x, (i - 1) * 40, 0), d = P(x, i * 40, 0); s += `<path class="ron" style="stroke:#C9A676" d="M${f(c[0])},${f(c[1])} L${f(d[0])},${f(d[1])}"/>`; }
    }
    return s;
  }
  for (let i = 1; i < N * 2; i++) {
    const a = P(i * 60, 0, 0), b = P(i * 60, NT, 0), c = P(0, i * 60, 0), d = P(NT, i * 60, 0);
    s += `<path class="ron" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])} M${f(c[0])},${f(c[1])} L${f(d[0])},${f(d[1])}"/>`;
  }
  return s;
}

function tuongTet() {
  const den = x => `<path class="m" d="M${x},-270 L${x},-252"/>`
    + `<rect class="n" x="${x - 12}" y="-254" width="24" height="6" rx="2" fill="${OAK}"/>`
    + `<ellipse class="n" cx="${x}" cy="-232" rx="20" ry="18" fill="${DAT}"/>`
    + `<path class="m" d="M${x},-250 L${x},-214 M${x - 10},-247 Q${x - 16},-232 ${x - 10},-217 M${x + 10},-247 Q${x + 16},-232 ${x + 10},-217"/>`
    + `<rect class="n" x="${x - 10}" y="-216" width="20" height="5" rx="2" fill="${OAK}"/>`
    + `<path d="M${x},-211 L${x},-196" stroke="${VANG_MAI}" stroke-width="4" stroke-linecap="round"/>`;
  return `<rect class="n" x="190" y="-296" width="200" height="26" rx="4" fill="${DAT}"/>`
    + `<text x="290" y="-277" text-anchor="middle" font-size="14" font-weight="800" fill="${VANG_MAI}" font-family="Be Vietnam Pro, sans-serif">CHÚC MỪNG NĂM MỚI</text>`
    + den(215) + den(300);
}

// Tháng 9: hai đèn ông sao. Tháng 12: dây đèn Noel dọc mép trên tường.
function tuongLe() {
  const t = thangSo(st.thang);
  if (t === 9) {
    const sao = (x, y) => {
      const d = [];
      for (let k = 0; k < 10; k++) { const g = -Math.PI / 2 + k * Math.PI / 5, r2 = k % 2 ? 11 : 26; d.push([x + Math.cos(g) * r2, y + Math.sin(g) * r2]); }
      return `<path class="m" d="M${x},-280 L${x},${y - 26}"/><polygon class="n" fill="${DAT}" points="${d.map(q => q.map(f).join(',')).join(' ')}"/>`
        + `<circle cx="${x}" cy="${y}" r="7" fill="${VANG_MAI}"/><path d="M${x},${y + 24} L${x},${y + 44}" stroke="${VANG_MAI}" stroke-width="4" stroke-linecap="round"/>`;
    };
    return sao(250, -236) + sao(340, -222);
  }
  if (t === 12 && st.phong[st.o].den !== 3) {
    const mau = [DAT, VANG_MAI, XANH, '#E88FA3'];
    let s = '<path class="m" d="M20,-282 Q150,-252 290,-282 Q420,-252 560,-282"/>';
    for (let i = 0; i < 16; i++) {
      const x = 30 + i * 34, dx = (x % 270) / 270, y = -282 + Math.sin(dx * Math.PI) * 26 + 10;
      s += `<ellipse class="n" cx="${f(x)}" cy="${f(y)}" rx="6" ry="9" fill="${mau[i % 4]}"/>`;
    }
    return s;
  }
  return '';
}

// Một người đứng quay mặt ra, gốc toạ độ ở gót chân. p: màu áo, quần, kiểu tóc…
function nguoi(p, vui) {
  const mieng = vui ? 'M-4,-88 Q0,-83 4,-88' : 'M-3,-87 L3,-87';
  const mat = vui ? '<path class="m" d="M-8,-94 Q-6,-97 -4,-94 M4,-94 Q6,-97 8,-94"/>'
                  : `<circle class="tron" cx="-6" cy="-94" r="2.2" fill="${MUC}"/><circle class="tron" cx="6" cy="-94" r="2.2" fill="${MUC}"/>`;
  const chan = p.dai ? p.quan : KEM, dai = p.toc === 'dai';
  return `<rect class="n" x="-11" y="-27" width="8" height="27" rx="3" fill="${chan}"/>`
    + `<rect class="n" x="3" y="-27" width="8" height="27" rx="3" fill="${chan}"/>`
    + (p.dai ? `<path class="n" fill="${p.quan}" d="M-14,-45 L14,-45 L14,-26 L-14,-26 Z"/><path class="m" d="M0,-36 L0,-26"/>`
             : `<path class="n" fill="${p.quan}" d="M-14,-45 L14,-45 L15,-24 L2,-24 L0,-31 L-2,-24 L-15,-24 Z"/>`)
    + `<ellipse class="n" cx="-19" cy="-52" rx="4.5" ry="10" fill="${KEM}"/><ellipse class="n" cx="19" cy="-52" rx="4.5" ry="10" fill="${KEM}"/>`
    + `<path class="n" fill="${p.ao}" d="M-15,-78 Q0,-83 15,-78 L21,-60 L14,-57 L14,-43 L-14,-43 L-14,-57 L-21,-60 Z"/>`
    + (dai ? `<path class="n" fill="${p.mauToc}" d="M-20,-96 Q-22,-121 0,-121 Q22,-121 20,-96 L21,-80 L-21,-80 Z"/>` : '')
    + `<circle class="n" cx="0" cy="-96" r="18" fill="${KEM}"/>`
    + (dai ? `<path class="n" fill="${p.mauToc}" d="M-18,-99 Q-16,-117 0,-117 Q16,-117 18,-99 Q11,-105 5,-103 Q-1,-110 -8,-102 Q-13,-105 -18,-99 Z"/>`
           : `<path class="n" fill="${p.mauToc}" d="M-18.5,-94 Q-20,-118 0,-118 Q20,-118 18.5,-94 Q16,-104 8,-106 Q0,-103 -8,-106 Q-16,-104 -18.5,-94 Z"/>`)
    + (p.kep ? `<rect class="n" x="9" y="-113" width="9" height="5" rx="2" fill="${OAK}"/>` : '')
    + mat
    + `<ellipse class="tron" cx="-11" cy="-88" rx="3.2" ry="2" fill="${DAT}"/><ellipse class="tron" cx="11" cy="-88" rx="3.2" ry="2" fill="${DAT}"/>`
    + `<path class="m" d="${mieng}"/>`
    + (p.kinh ? '<circle class="m" cx="-6" cy="-94" r="5.5"/><circle class="m" cx="6" cy="-94" r="5.5"/><path class="m" d="M-.5,-94 L.5,-94"/>' : '')
    + (p.non ? `<path class="n" fill="${OAK}" d="M-19,-102 Q-19,-123 0,-123 Q19,-123 19,-102 Z"/><path class="n" fill="${OAK}" d="M12,-104 Q26,-105 30,-100 L15,-100 Z"/>` : '');
}
const veKhach = (k, vui) => (k.kieu === 'voChong' || k.kieu === 'giaDinh')
  ? `<g transform="translate(-15,0)">${nguoi(VO_CHONG[0], vui)}</g><g transform="translate(15,2)">${nguoi(VO_CHONG[1], vui)}</g>`
  : nguoi(k.dang, vui);

// Chỗ khách đứng: ô trống gần giữa phòng nhất, ưu tiên phía trước.
function oTrong() {
  const ban = mat();
  const thu = [];
  for (let gx = 0; gx < N; gx++) for (let gy = 0; gy < N; gy++) thu.push([gx, gy]);
  thu.sort((a, b) => (Math.abs(a[0] - 2.4) + Math.abs(a[1] - 2.8)) - (Math.abs(b[0] - 2.4) + Math.abs(b[1] - 2.8)));
  return thu.find(([gx, gy]) => !ban.has(`${gx},${gy}`)) || [2, 2];
}

// Tờ giấy khách bùng để lại, nằm phẳng trên sàn.
function veGiay() {
  if (!st.giay) return '';
  const [gx, gy] = st.giay, [X, Y] = P((gx + .5) * T, (gy + .5) * T, 0);
  const chu = (y, s) => `<text x="0" y="${y}" text-anchor="middle" font-family="Pangolin, cursive" font-size="19" fill="${MUC}">${s}</text>`;
  return `<g id="giay" transform="translate(${f(X)},${f(Y)}) matrix(${f(C)},${f(S)},${f(-C)},${f(S)},0,0) rotate(-10) scale(1.5)">`
    + `<rect class="n" x="-52" y="-36" width="104" height="72" rx="2" fill="#FFFFFF"/>`
    + chu(-6, 'Em về quê') + chu(20, 'ạ ') + `</g>`;
}

function veRac(loai) {
  if (loai === 'mi') return hop(-18, -14, 0, 36, 28, 7, DAT) + poly([[-6, -14, 7], [6, -14, 7], [6, 14, 7], [-6, 14, 7]], KEM);
  if (loai === 'chai') return `<g transform="rotate(-20)"><rect class="n" x="-26" y="-10" width="40" height="16" rx="7" fill="#CDE3EC"/><rect class="n" x="13" y="-7" width="10" height="10" rx="2" fill="${XANH}"/></g>`;
  if (loai === 'giay') return `<path class="n" fill="#fff" d="M-16,-4 L-8,-16 L4,-12 L14,-18 L18,-4 L10,6 L-4,8 L-14,4 Z"/><path class="m" d="M-8,-8 L2,-4 L8,-12"/>`;
  if (loai === 'tui') return `<path class="n" fill="${KEM}" d="M-18,4 Q-20,-14 -8,-16 L-6,-26 Q0,-30 2,-22 L4,-16 Q18,-14 16,4 Q0,10 -18,4 Z"/>`;
  return `<g class="vet-bui" aria-hidden="true"><ellipse cx="-6" cy="0" rx="22" ry="10" fill="#9F896D" opacity=".55"/><ellipse cx="12" cy="4" rx="14" ry="7" fill="#9F896D" opacity=".45"/><path class="m" d="M-17,-2l6,2m10,3l5,-1m5,3l4,1"/><circle cx="-10" cy="-5" r="2" fill="#79634F"/><circle cx="8" cy="0" r="1.8" fill="#79634F"/></g>`;
}

// Lớp trang trí đứng yên: không đổi tường/sàn/đồ, ô đặt hay vùng chạm.
function anhSangPhong(lx, ly) {
  const diem=ds=>ds.map(([x,y])=>P(x*NT,y*NT,0).map(f).join(',')).join(' ');
  let bong='';
  st.dat.filter(v=>!v.tren).forEach(v=>{
    const [x,y]=tamO(v.k,v.gx,v.gy),[X,Y]=P(x,y,0),rong=(DO[v.k].co||[1])[0];
    bong+=`<ellipse cx="${f(X+10)}" cy="${f(Y+6)}" rx="${28+rong*14}" ry="16"/>`;
  });
  if(st.khach){const [X,Y]=P((lx+.5)*T,(ly+.5)*T,0);bong+=`<ellipse cx="${f(X+8)}" cy="${f(Y+3)}" rx="40" ry="13"/>`;}
  const den=st.dat.filter(v=>v.k==='denNgu').map(v=>{
    const [x,y]=tamO(v.k,v.gx,v.gy),[X,Y]=P(x,y,(v.tren?caoTren(v.tren):0)+90);
    return `<ellipse class="quang-den" cx="${f(X)}" cy="${f(Y)}" rx="86" ry="72" fill="url(#den-am)"/>`;
  }).join('');
  return `<defs><filter id="bong-am" x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><radialGradient id="den-am"><stop stop-color="#FFE4A0" stop-opacity=".5"/><stop offset="1" stop-color="#FFE4A0" stop-opacity="0"/></radialGradient></defs>`
    + `<g class="anh-sang-phong" pointer-events="none" aria-hidden="true"><polygon class="vet-nang" points="${diem([[0,.2],[0,.53],[.72,1],[1,.69]])}" fill="#F6D77A" opacity=".28"/><g class="bong-do" fill="#745838" opacity=".18" filter="url(#bong-am)">${bong}</g>${den}</g>`;
}

let vuiDenLuc = 0;
function veLai() {
  datKhung();
  const sc = $('#suCo');
  if (sc) sc.style.display = st.suCo ? '' : 'none';
  const [lx, ly] = oTrong();
  const vat = st.dat.map(v => {
    const m = v.tren && st.dat.find(x => x.id === v.tren);
    const [cx, cy] = tamO(v.k, v.gx, v.gy), [X, Y] = P(cx, cy, m ? caoTren(v.tren) : 0);
    const sau = m ? tamO(m.k, m.gx, m.gy).reduce((a, b) => a + b) + .5 : cx + cy;
    return { sau, s: `<g class="vat" data-id="${v.id}" transform="translate(${f(X)},${f(Y)}) scale(${DO[v.k].to || 1})">${DO[v.k].ve()}</g>` };
  });
  st.rac.forEach(r => {
    const x = (r.gx + .5) * T + r.ox, y = (r.gy + .5) * T + r.oy, [X, Y] = P(x, y, 0);
    vat.push({ sau: x + y - 60, s: `<g class="rac" data-rac="${r.id}" transform="translate(${f(X)},${f(Y)}) scale(2.4)">${veRac(r.loai)}<circle cx="0" cy="-4" r="26" fill="transparent"/></g>` });
  });
  const k = st.khach;
  if (k) {
    const [LX, LY] = P((lx + .5) * T, (ly + .5) * T, 0);
    const vui = Date.now() < vuiDenLuc || ungY() || (k.o && !k.muon && st.suCo?.o !== st.o);
    vat.push({ sau: (lx + ly + 1) * T, s: `<g id="nguoi" transform="translate(${f(LX)},${f(LY)}) scale(2.2)"><g class="linh-than">${veKhach(k, vui)}</g></g>` });
    // Chiếc vali: nằm cạnh khách cho tới khi phòng có tủ để cất đồ.
    if (!coNhom('cat')) {
      const [VX, VY] = P((lx + .5) * T + 46, (ly + .5) * T - 34, 0);
      vat.push({ sau: (lx + ly + 1) * T - 1, s: `<g transform="translate(${f(VX)},${f(VY)})">${hop(-14, -24, 0, 28, 48, 60, XAM)}<path class="n" fill="none" d="M-10,-78 Q-10,-92 2,-92 Q12,-92 12,-80"/></g>` });
    }
  }
  if (!k && laQuan(st.phong[st.o])) {
    const ph = st.phong[st.o], ban = mat(), thu = [];
    for (let gx = 0; gx < N; gx++) for (let gy = 0; gy < N; gy++) if (!ban.has(`${gx},${gy}`)) thu.push([gx, gy]);
    const ve = ([gx, gy], p, sau, them = '') => { const [X, Y] = P((gx + .5) * T, (gy + .5) * T, 0); vat.push({ sau: (gx + gy + 1) * T + sau, s: `<g transform="translate(${f(X)},${f(Y)}) scale(2.2)">${nguoi(p, true)}${them}</g>` }); };
    thu.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    if (ph.nv && thu.length) ve(thu.shift(), { ao: KEM, quan: DAT, dai: true, toc: 'dai', mauToc: MUC, kep: true }, 0, TAP_DE);
    // Khách đứng quanh quầy: càng bán chạy càng đông (tối đa 3 người).
    const dt = doanhThu(ph, true), moc = ph.dat.find(v => ph.loai === 'traSua' ? v.k === 'quayPha' || v.k === 'tuTopping' : v.k === 'quayThu' || v.k === 'tuKinh');
    if (dt && moc) {
      thu.sort((a, b) => (Math.abs(a[0] - moc.gx) + Math.abs(a[1] - moc.gy)) - (Math.abs(b[0] - moc.gx) + Math.abs(b[1] - moc.gy)));
      [NU, NAM, { ...NU, ao: DAT, toc: 'ngan', kep: false }].slice(0, Math.min(3, 1 + Math.floor(dt / 1500))).forEach((p, i) => thu[i] && ve(thu[i], p, 0));
    }
  }
  if (coGoi('meo_cung')) {
    const ban = mat(), trong = [];
    for (let gx = 0; gx < N; gx++) for (let gy = 0; gy < N; gy++) if (!ban.has(`${gx},${gy}`) && !(gx === lx && gy === ly)) trong.push([gx, gy]);
    if (trong.length) {
      const nhip = Math.floor(Date.now() / 8000), [gx, gy] = trong[(nhip * 7 + st.o * 3) % trong.length];
      const [X, Y] = P((gx + .5) * T, (gy + .5) * T, 0);
      vat.push({ sau: (gx + gy + 1) * T - 2, s: `<g class="meo" transform="translate(${f(X)},${f(Y)}) scale(2.5)">${veMeo(st.dem || nhip % 3 === 0)}</g>` });
    }
  }
  vat.sort((a, b) => a.sau - b.sau);
  svg.innerHTML = tuongVaSan() + anhSangPhong(lx,ly) + '<g id="sang"></g>' + veGiay() + vat.map(v => v.s).join('')
    + '<g id="bong-ma" opacity=".75"></g>'
    + `<rect id="dem" x="-2000" y="-2000" width="4000" height="4000" fill="#1E2744" opacity="${st.dem ? .38 : st.suCo?.loai === 'den' && st.suCo.o === st.o ? .26 : 0}"/>`;
}

// ── Thanh trên, thẻ khách, tiệm ────────────────────────────────────────────
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="${MUC}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${NHOM[n].d}"/></svg>`;
const chip = (n, lop, truoc = '') => `<span class="chip ${lop}">${icon(n)}${truoc}${NHOM[n].ten}<span class="dau">✓</span></span>`;

let tienHien = 0, giuTien = 0;
function veThanhTren() {
  if (!giuTien) tienHien = st.tien;
  $('#xu').textContent = dong(tienHien);
  $('#sao').textContent = veSao(saoDay());
  $('#sao').title = `Uy tín dãy trọ: ${st.uyTin || 0}`;
  const soLa = (st.la || []).length + (st.chuyenLinh?.choDoc ? 1 : 0);
  $('#nutHop').classList.toggle('rung', !!st.chuyenLinh?.choDoc);
  if (soLa) $('#nutHop').dataset.so = soLa; else delete $('#nutHop').dataset.so;
  veNutViec();
  veMucGan();
  requestAnimationFrame(huongDan);
  veDay();
  $('#mucTieu').textContent = `Tháng này ${gon(st.thu)}/${gon(mucThang())}`;
  const k = st.khach, ph = st.phong[st.o];
  let ten, chips = '';
  if (laQuan(ph)) {
    const co = x => ph.dat.some(v => v.k === x);
    const can = ph.loai === 'traSua' ? ['quayPha', 'tuTopping'] : ['loNuong', 'tuKinh'];
    ten = `${tenQuan(ph)} của bạn`;
    chips = can.map(x => `<span class="chip ${co(x) ? 'xong' : 'sai'}">${DO[x].ten}<span class="dau">✓</span></span>`).join('')
      + `<span class="chip gia xong">Bán ~${gon(doanhThu(ph, true))} · thuê ${gon(THUE_MB)}${ph.loai === 'traSua' ? ` · điện ${gon(DIEN_TRA)}` : ''}${ph.nv ? ` · lương ${gon(LUONG_NV)}` : ''}</span>`;
  } else if (ph.loai === 'nha') {
    ten = ' Căn hộ của bạn';
    chips = `<span class="chip xong">Độ ấm cúng ${amCung(ph)}</span>`;
  } else if (!k) ten = `${st.o < 6 ? 'Phòng ' + (st.o + 1) : 'Mặt bằng'} ` + (st.rac.length ? 'bừa bộn quá…' : st.giay ? 'trống trơn…' : 'đang trống');
  else if (!k.o) {
    ten = `${k.ten} · ${KIEU[k.kieu].ten}`;
    chips = k.can.map(n => chip(n, coNhom(n) ? 'xong' : '')).join('')
      + `<span class="chip gia ${vuaGia(k) ? 'xong' : 'sai'}">Giá ${gon(giaPhong())} · dưới ${gon(k.tran)}</span>`;
  } else {
    ten = `${k.ten} đang ở · ${k.con ? `còn ${k.con} tháng` : 'tháng cuối'} · ${gon(k.tien)}/tháng`;
    chips = k.can.filter(n => !coNhom(n)).map(n => chip(n, 'sai', 'thiếu: ')).join('')
      + (k.muon ? chip(k.muon, 'muon', 'muốn: ') : '');
    if (ph.yenTinh) chips += `<span class="chip xong"> ${ph.yenTinh === 'rem' ? 'Có rèm cách âm' : 'Hàng xóm giữ yên sau 22 giờ'}</span>`;
  }
  // Chỉ tách nhãn nhìn thấy; giữ dữ liệu ván và bản HTML cũ dùng đối chiếu được.
  const phuDe = $('#phuDePhong');
  $('#tenNgay').textContent = phuDe ? ph.loai ? ten : st.o < 6 ? `Phòng ${st.o + 1}` : 'Mặt bằng' : ten;
  if (phuDe) {
    phuDe.textContent = ph.loai ? '' : ten.replace(/^Phòng \d+\s*/, '').trim();
    if(k?.o && !ph.loai) phuDe.insertAdjacentHTML('afterbegin',bieuTuong('chiaKhoa'));
  }
  $('#danhHieu').textContent = danhHieu();
  $('#can').innerHTML = chips;

  const chinh = $('#nutChinh'), phu = $('#nutPhu');
  phu.hidden = !!k?.o;
  phu.disabled = chinh.disabled = st.dem;
  if (ph.loai) {
    chinh.textContent = 'Hết tháng';
    phu.hidden = !laQuan(ph);
    phu.textContent = ph.nv ? 'Cho nhân viên nghỉ' : `Thuê nhân viên · ${gon(LUONG_NV)}/tháng`;
  } else if (k && !k.o) {
    phu.textContent = st.luot > 0 ? 'Khách khác' : 'Mời về';
    chinh.textContent = `Cho thuê · ${gon(giaPhong())}`;
    chinh.disabled = st.dem || !ungY();
  } else if (!k && st.rac.length) {
    chinh.textContent = `Dọn rác · còn ${st.rac.length}`;
    chinh.disabled = true;
    phu.textContent = 'Hết tháng';
  } else {
    chinh.textContent = !k && st.luot > 0 ? 'Tìm khách mới' : 'Hết tháng';
    if (!k && st.luot > 0) phu.textContent = 'Hết tháng';
    else if (!k && coQcKhach()) nhanHinh(phu, 'tivi', 'Thêm 1 khách');
    else phu.hidden = true;
  }
  for(const b of [chinh,phu]) if(b.textContent==='Hết tháng') nhanHinh(b,'lich','Hết tháng');
}

function veLich() {
  $('#lich').innerHTML = `<div class="to"><div class="thang">${laTet() ? 'TẾT ' : 'THÁNG'}</div><div class="so">${thangSo(st.thang)}</div><div class="thu">${namSo(st.thang)}</div></div>`;
}

function veTiem() {
  const can = canNhom();
  // Món khách đang cần lên đầu kệ, còn lại xếp từ rẻ tới đắt.
  const canMua = d => can.includes(d.nhom) && !coNhom(d.nhom);
  const ph = st.phong[st.o], rieng = d => !!(d.tiem || d.tra);
  const xep = Object.entries(DO).filter(([, d]) => (!d.goi || coGoi(d.goi)) && (!d.tet || ganTet() || coGoi('goi_tet')) && (!d.tiem || ph.loai === 'tiem') && (!d.tra || ph.loai === 'traSua')).sort((a, b) => (rieng(b[1]) - rieng(a[1])) || (canMua(b[1]) - canMua(a[1])) || (a[1].gia - b[1].gia));
  $('#ke').innerHTML = xep.map(([k, d]) => {
    const trung = can.includes(d.nhom) && coNhom(d.nhom);
    return `<div class="the ${canMua(d) ? 'can-mua' : ''} ${trung ? 'da-co' : ''} ${d.gia > st.tien ? 'het-tien' : ''} ${st.chon === k ? 'dang-chon' : ''}" data-k="${k}" tabindex="0" role="button" aria-label="${d.ten}, ${dong(d.gia)}">`
      + `<div class="nhan">${canMua(d) ? 'Khách cần' : 'Đã có'}</div>${d.tet ? '<div class="hang-tet">Hàng Tết</div>' : ''}`
      + `<svg viewBox="-150 -290 300 350">${d.ve()}</svg>`
      + `<div class="ten">${d.ten}</div><div class="gia">${gon(d.gia)}</div><div class="thue">${rieng(d) ? `bán ~${d.ban}k/th` : `phòng +${d.thue}k`}</div></div>`;
  }).join('');
  // Ôm sát khung hình quanh từng món, để món nhỏ như sen đá không bị lọt thỏm.
  document.querySelectorAll('#ke svg').forEach(v => {
    const b = v.getBBox(), dem = 12, canh = Math.max(b.width, b.height) + dem * 2;
    v.setAttribute('viewBox', `${f(b.x + b.width / 2 - canh / 2)} ${f(b.y + b.height / 2 - canh / 2)} ${f(canh)} ${f(canh)}`);
  });
}

function veHet() { kiemThanhTich(); $('#phongKhung').classList.toggle('tet', ganTet()); veLai(); veThanhTren(); veTiem(); nhacKet(); luu(); henThuBa(); }

// Thư cứu vốn dùng lại khung thư bà, khoản mượn không tính là doanh thu/quà.
let thuVayDang = false, henVayBa;
function deNghiBa() {
  if (!st || st.dem) return null;
  const k = st.khach, thieu = k && !k.o ? k.can.filter(n => !coNhom(n)) : [];
  const mon = Object.entries(DO).filter(([,d]) => thieu.includes(d.nhom) && !d.tiem && !d.tra
    && (!d.goi || coGoi(d.goi)) && (!d.tet || ganTet() || coGoi('goi_tet'))).sort((a,b) => a[1].gia-b[1].gia)[0];
  const ket = st.thang - (st.thangThueGan ?? st.thang) >= 3;
  if (!(st.tien < 0 || mon && st.tien < mon[1].gia || ket)) return null;
  const muc = mon?.[1].gia || 100;
  const goiY = mon ? `${k.ten} đang cần ${mon[1].ten.toLowerCase()}. Con mua món này ở kệ đồ, rồi đặt vào phòng nhé.`
    : st.rac.length ? 'Con chạm từng bãi rác trong phòng, dọn sạch rồi bấm Tìm khách mới nhé.'
      : k && !k.o && !vuaGia(k) ? 'Giá phòng đang cao hơn túi tiền khách. Chạm món đồ chưa cần rồi chọn Cất lại để lấy lại tiền.'
        : 'Con giữ lại đồ khách cần, cất bớt đồ đắt chưa dùng để lấy lại vốn. Khoan mở thêm phòng hoặc quán nhé.';
  return { tien: Math.min(2000, Math.max(0, Math.ceil(muc-st.tien))), goiY };
}
function henThuBa() {
  clearTimeout(henVayBa);
  if (daVaoGame) henVayBa = setTimeout(kiemThuBa, 0);
}
function kiemThuBa() {
  if (!daVaoGame || document.querySelector('.phu.hien') || st.dem) return;
  const v = st.vayBa ||= { no: 0, lan: -6, cho: null };
  if (!v.cho) {
    if (st.thang-v.lan < 6) return;
    const de = deNghiBa(); if (!de) return;
    v.cho = de; v.lan = st.thang; luu(true);
  }
  thuVayDang = true;
  $('#thuaKeBuoc').textContent = 'Thư bà nội';
  $('#thuaKeTen').textContent = 'Có bà đỡ một tay';
  $('#thuaKeChu').textContent = `“${v.cho.goiY}\n\n${v.cho.tien ? `Bà cho con mượn ${dong(v.cho.tien)}, không tính lãi. Mỗi tháng trích 20% tiền thu để trả, khi có tiền trong túi. Còn nợ bà: ${dong(v.no)}.` : 'Con còn đủ vốn, cứ làm từng chút nhé.'}\n\n— Bà nội”`;
  $('#nutThuaKe').textContent = v.cho.tien ? 'Nhận khoản mượn' : 'Con nhớ rồi';
  $('#boQuaThuaKe').hidden = !v.cho.tien;
  $('#boQuaThuaKe').textContent = 'Để con tự xoay xở';
  $('#manThuaKe').classList.add('hien');
}
function nhanThuBa(nhan) {
  if (!thuVayDang) return;
  const v = st.vayBa;
  if (nhan && v.cho) { st.tien += v.cho.tien; v.no += v.cho.tien; }
  v.cho = null; thuVayDang = false;
  $('#boQuaThuaKe').textContent = 'Bỏ qua';
  $('#manThuaKe').classList.remove('hien');
  veHet(); luu(true); tiepHang();
}
function traNoBa() {
  const v = st.vayBa;
  if (!v || v.traThang === st.thang) return;
  v.traThang = st.thang;
  v.vuaTra = Math.min(v.no, Math.floor(Math.max(0,st.thu)*.2), Math.max(0,st.tien));
  v.no -= v.vuaTra; st.tien -= v.vuaTra;
  luu(true);
}
const treKhach = ms => st.thang < 2 ? Math.min(ms,200) : ms;
let lucThaoTac = Date.now(), nhacDauDa = '';
for (const suKien of ['pointerdown','keydown','click']) document.addEventListener(suKien, () => { lucThaoTac = Date.now(); }, {passive:true});
setInterval(() => {
  if (!daVaoGame || st.thang >= 2 || st.dem || st.suCo || document.querySelector('.phu.hien')) { lucThaoTac = Date.now(); return; }
  if (Date.now()-lucThaoTac <= 8000) return;
  const viec = st.rac.length ? 'rac' : st.khach && !st.khach.o ? 'do' : 'thang';
  const ma = st.thang + ':' + viec;
  if (nhacDauDa === ma) return;
  nhacDauDa = ma;
  $('#nhoIcon').innerHTML = bieuTuong('thu'); $('#nhoAnh').hidden = true; $('#nhoQC').hidden = true;
  $('#nhoTen').textContent = 'Mình làm gì tiếp nhỉ?';
  $('#nhoLoi').textContent = viec === 'rac' ? 'Chạm vào từng bãi rác trên sàn để dọn. Phòng sạch rồi mình đón khách nhé.'
    : viec === 'do' ? 'Xem món có nhãn Khách cần trên kệ. Kéo vào phòng, đủ đồ và vừa giá thì bấm Cho thuê nhé.'
      : 'Phòng đã ổn rồi. Bấm Hết tháng để thu tiền, sang tháng mới sẽ có khách và chuyện mới nhé.';
  $('#nhoNut').textContent = 'Biết rồi';
  $('#nhoNut').onclick = () => { $('#manNho').classList.remove('hien'); lucThaoTac = Date.now(); tiepHang(); };
  $('#manNho').classList.add('hien');
}, 1000);

// Chống kẹt: thiếu tiền, hoặc phòng đắt quá trần giá của khách, thì chỉ đường gỡ.
function nhacKet() {
  const k = st.khach;
  if (st.dem || !k || k.o) return;
  const thieu = k.can.filter(n => !coNhom(n));
  if (thieu.length) {
    const reNhat = Math.min(...Object.values(DO).filter(d => thieu.includes(d.nhom)).map(d => d.gia));
    if (reNhat > st.tien && st.dat.length) setTimeout(() => loa('Thiếu tiền rồi · chạm một món trong phòng để cất lại'), 900);
  } else if (!vuaGia(k)) setTimeout(() => { if (st.khach === k && !vuaGia(k)) loa(`Giá phòng vượt ${trieu(k.tran)} · cất bớt đồ`); }, 900);
}

// ── Lời nói, tim bay, tiền bay, thông báo ──────────────────────────────────
let hetBong;
function viTriNguoi() {
  const g = $('#nguoi') || $('#giay'), k = $('#phongKhung').getBoundingClientRect();
  if (!g) return [k.width / 2, k.height / 2];
  const r = g.getBoundingClientRect();
  return [r.left + r.width / 2 - k.left, r.top - k.top];
}
function noi(cau, lau = 3200) {
  const b = $('#bong'), [x, y] = viTriNguoi();
  b.textContent = cau;
  b.style.left = Math.min(Math.max(x, 120), $('#phongKhung').clientWidth - 120) + 'px';
  b.style.top = Math.max(y, 90) + 'px';
  b.classList.add('hien');
  clearTimeout(hetBong);
  hetBong = setTimeout(() => b.classList.remove('hien'), lau);
}
function timBay() {
  const [x, y] = viTriNguoi();
  for (let i = 0; i < 3; i++) {
    const t = document.createElement('div');
    t.className = 'tim';
    t.style.left = (x + (i - 1) * 22) + 'px';
    t.style.top = (y + 10) + 'px';
    t.style.animationDelay = i * 0.12 + 's';
    t.innerHTML = `<svg viewBox="0 0 24 24"><path d="${TIM}" fill="${DAT}" stroke="${MUC}" stroke-width="2"/></svg>`;
    $('#phongKhung').appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }
}
function nhay() {
  const g = document.querySelector('#nguoi .linh-than');
  if (!g) return;
  g.classList.remove('nhay'); void g.getBoundingClientRect(); g.classList.add('nhay');
}
function loa(chu, lau = 2600) {
  const l = $('#loa');
  l.textContent = chu; l.classList.add('hien');
  clearTimeout(loa.h);
  loa.h = setTimeout(() => l.classList.remove('hien'), lau);
}

// Tiền bay. kieu 'cong': từ khách bay vào túi. 'tru': từ túi rơi xuống.
// 'bung': chữ đỏ to giữa phòng, không đụng tới túi tiền.
function tienBay(chu, kieu, xong) {
  const g = $('#game').getBoundingClientRect(), kh = $('#phongKhung').getBoundingClientRect();
  const tui = $('.xu').getBoundingClientRect();
  const [px, py] = viTriNguoi();
  const x0 = px + kh.left - g.left, y0 = py + kh.top - g.top;
  const x1 = tui.left + tui.width / 2 - g.left, y1 = tui.top + tui.height / 2 - g.top;
  const el = document.createElement('div');
  el.className = 'tien-bay ' + kieu;
  el.textContent = chu;
  const giua = 'translate(-50%,-50%)';
  let kf, lau;
  if (kieu === 'cong') {
    el.style.left = x0 + 'px'; el.style.top = y0 + 'px';
    kf = [{ transform: `${giua} scale(.5)`, opacity: 0 },
          { transform: `${giua} translateY(-46px) scale(1.2)`, opacity: 1, offset: .35 },
          { transform: `${giua} translateY(-46px) scale(1.2)`, opacity: 1, offset: .55 },
          { transform: `${giua} translate(${x1 - x0}px,${y1 - y0}px) scale(.4)`, opacity: .4 }];
    lau = 1700;
  } else if (kieu === 'tru') {
    el.style.left = Math.min(x1, g.width - 120) + 'px'; el.style.top = (y1 + 34) + 'px';
    kf = [{ transform: `${giua} scale(.6)`, opacity: 0 },
          { transform: `${giua} scale(1.1)`, opacity: 1, offset: .2 },
          { transform: `${giua} translateY(40px)`, opacity: 1, offset: .8 },
          { transform: `${giua} translateY(60px)`, opacity: 0 }];
    lau = 2400;
  } else {
    el.style.left = Math.min(Math.max(x0, 130), g.width - 130) + 'px'; el.style.top = (y0 - 30) + 'px';
    kf = [{ transform: `${giua} scale(.3)`, opacity: 0 },
          { transform: `${giua} scale(1.25) rotate(-4deg)`, opacity: 1, offset: .15 },
          { transform: `${giua} scale(1) rotate(3deg)`, opacity: 1, offset: .25 },
          { transform: `${giua} scale(1) rotate(-2deg)`, opacity: 1, offset: .35 },
          { transform: `${giua} scale(1)`, opacity: 1, offset: .85 },
          { transform: `${giua} translateY(20px)`, opacity: 0 }];
    lau = 3200;
  }
  $('#game').appendChild(el);
  el.animate(kf, { duration: lau, easing: 'ease-in-out', fill: 'forwards' }).onfinish = () => { el.remove(); xong?.(); };
}
// Đổi tiền có hiệu ứng: số trên túi chỉ chạy khi tờ tiền bay tới nơi.
function doiTien(k, chu, tre = 0) {
  giuTien++;
  st.tien += k;
  if (k > 0) { st.thu += k; st.tong += k; }
  kiemMucGan();
  if (st.tien < 0 && !st.daThuNo) {
    st.daThuNo = true;
    const la = 'Gửi bạn chủ trọ,\nThiếu tiền thì mình gỡ từng chút nha:\n1. Dọn phòng trống, đón khách để có tiền thuê.\n2. Cất bớt đồ đắt chưa cần dùng, lấy lại tiền mua.\n3. ' + (TRONG_APP ? 'Cuối tháng có thể tự chọn xem quảng cáo để nhận thêm tiền.' : 'Khoan mở thêm phòng hoặc quán; giữ tiền sửa đồ cho khách.') + '\nKhông cần vội, xóm trọ vẫn chờ bạn.\n— Cô Ba';
    st.la = [...(st.la || []), la];
    xepHang(() => moLa(la));
  }
  luu(true);   // quà / thưởng / thu tiền phải tới cả bản sao app ngay
  // Chỉ hẹn hiệu ứng; ví và sổ thu đã lưu đồng bộ ở trên.
  const hieuUng = () => {
    veThanhTren();
    tienBay(chu || (k > 0 ? '+' : '−') + dong(Math.abs(k)), k > 0 ? 'cong' : 'tru', () => { giuTien--; demTien(k > 0); });
  };
  if (tre > 0) setTimeout(hieuUng, tre); else hieuUng();
}
function demTien(len) {
  if (giuTien) return;
  const a = tienHien, b = st.tien, t0 = performance.now();
  const buoc = () => {
    const u = Math.min(1, (performance.now() - t0) / 500);
    tienHien = Math.round(a + (b - a) * u);
    $('#xu').textContent = dong(tienHien);
    if (u < 1 && !giuTien) requestAnimationFrame(buoc);
  };
  requestAnimationFrame(buoc);
  const x = $('.xu'); x.classList.remove('nay'); void x.offsetWidth; x.classList.add('nay');
  if (len) { ting(); guiApp({ loai: 'rung', kieu: 'thanhcong' }); }
  veThanhTren();
}

// Âm thanh tự tạo bằng WebAudio, không cần file.
let am;
function tieng(not, dang = 'sine', to = .25) {
  try {
    am = am || new AudioContext();
    const t0 = am.currentTime;
    not.forEach(([hz, luc, dai, hz2]) => {
      const o = am.createOscillator(), g = am.createGain();
      o.type = dang;
      o.frequency.setValueAtTime(hz, t0 + luc);
      if (hz2) o.frequency.exponentialRampToValueAtTime(hz2, t0 + luc + dai);
      g.gain.setValueAtTime(to, t0 + luc); g.gain.exponentialRampToValueAtTime(.001, t0 + luc + dai);
      o.connect(g).connect(am.destination); o.start(t0 + luc); o.stop(t0 + luc + dai + .02);
    });
  } catch { /* không có âm thanh cũng không sao */ }
}
const cop = () => { tieng([[220, 0, .16, 90]], 'sine', .35); guiApp({ loai: 'rung', kieu: 'nhe' }); };                         // đặt đồ xuống
const ting = () => tieng([[1320, 0, .15], [1760, .08, .35]], 'sine', .18);         // tiền vào túi
const dingDong = () => tieng([[660, 0, .5], [523, .32, .7]], 'sine', .2);          // khách tới
const goCuaAm = () => tieng([[170, 0, .07, 120], [170, .2, .07, 120], [170, .4, .07, 120]], 'square', .12);
const buon = () => tieng([[392, 0, .35], [330, .3, .35], [262, .6, .8]], 'triangle', .25);

// ── Mua, dời, cất ──────────────────────────────────────────────────────────
function mua(k, gx, gy) {
  const d = DO[k], kh = st.khach;
  if ((d.tiem && st.phong[st.o].loai !== 'tiem') || (d.tra && st.phong[st.o].loai !== 'traSua')) return;
  if (d.goi && !coGoi(d.goi)) { moCuaHang(); return; }
  if (d.gia > st.tien) { loa(`Còn thiếu ${dong(d.gia - st.tien)}`); return; }
  const moi = !!kh && canNhom().includes(d.nhom) && !coNhom(d.nhom);
  const truoc = ungY();
  st.tien -= d.gia;
  const tren = datSan(k, gx, gy) ? null : beMat(k, gx, gy)?.id;
  st.dat.push({ id: st.idKe++, k, gx, gy, ...(tren ? { tren } : {}) });
  luu(true);
  viec('mua');
  cop();
  if (moi) vuiDenLuc = Date.now() + 2500;
  if (moi && kh.o) {
    // Chiều ý người đang ở: được bo, ở thêm một tháng.
    kh.muon = null; kh.con++;
    veHet(); nhay(); timBay();
    noi('Cảm ơn anh chị nha! Em ở thêm một tháng nữa.');
    doiTien(TIP, `+${dong(TIP)} tiền bo`);
    return;
  }
  veHet();
  if (moi) { nhay(); timBay(); noi(d.cau); }
  else if (kh && Math.random() < .4) noi(bat(['Dễ thương ghê!', 'Để đây hợp nè.', 'Phòng xịn dần rồi đó.']), 2000);
  if (!truoc && ungY()) setTimeout(() => { if (ungY()) loa('Khách ưng rồi · bấm Cho thuê'); }, 1400);
}
function catLai(id) {
  const v = st.dat.find(x => x.id === id);
  if (!v) return;
  st.tien += DO[v.k].gia;
  st.dat.filter(x => x.tren === id).forEach(x => { st.tien += DO[x.k].gia; });
  st.dat = st.dat.filter(x => x.id !== id && x.tren !== id);
  kiemMucGan();
  veHet();
  if (st.khach?.o && !duCan(st.khach)) loa('Cất đồ khách cần · cuối tháng khách sẽ bỏ đi');
}

// ── Kéo thả ────────────────────────────────────────────────────────────────
// Một kiểu kéo cho cả chuột lẫn ngón tay. Chạm mà không kéo thì là "chọn":
// thẻ trong tiệm → chọn món rồi chạm vào sàn để đặt; đồ trong phòng → hiện nút cất.
let keo = null;
const keDoc = () => matchMedia('(orientation: landscape) and (min-width: 640px)').matches;
function diemSvg(e) {
  const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}
function oDuoiTay(e, k) {
  const q = diemSvg(e), [x, y] = veSan(q.x, q.y), [w, d] = coCua(k);
  return [Math.round(x / T - w / 2), Math.round(y / T - d / 2)];
}
function veBongMa(k, gx, gy, boQua) {
  const hl = $('#sang'), ma = $('#bong-ma');
  if (gx == null) { hl.innerHTML = ma.innerHTML = ''; return; }
  const ok = datDuoc(k, gx, gy, boQua), [w, d] = coCua(k);
  const x0 = Math.max(0, Math.min(gx, N - w)), y0 = Math.max(0, Math.min(gy, N - d));
  hl.innerHTML = `<polygon class="${ok ? 'o-sang' : 'o-sai'}" points="${pts([[x0, y0], [x0 + w, y0], [x0 + w, y0 + d], [x0, y0 + d]].map(([a, b]) => P(a * T, b * T, 0)))}"/>`;
  const m = !datSan(k, gx, gy, boQua) && beMat(k, gx, gy, boQua);
  const [cx, cy] = tamO(k, x0, y0), [X, Y] = P(cx, cy, m ? caoTren(m.id) : 0);
  ma.innerHTML = `<g transform="translate(${f(X)},${f(Y)}) scale(${DO[k].to || 1})">${DO[k].ve()}</g>`;
}

$('#ke').addEventListener('pointerdown', e => {
  const the = e.target.closest('.the');
  if (!the || st.dem) return;
  keo = { k: the.dataset.k, tuTiem: true, x: e.clientX, y: e.clientY, keo: false };
});
let quet = false;
function don(id, e) {
  if (!st.rac.some(r => r.id === id)) return;
  st.rac = st.rac.filter(r => r.id !== id);
  anHuongDanRac();
  viec('rac');
  thuongHen('rac', 20, 5);
  kiemMucGan();
  tieng([[1400, 0, .09, 500]], 'triangle', .12);
  const k = $('#phongKhung').getBoundingClientRect(), l = document.createElement('div');
  l.className = 'lap'; l.innerHTML = bieuTuong('sao');
  l.style.left = (e.clientX - k.left) + 'px'; l.style.top = (e.clientY - k.top) + 'px';
  $('#phongKhung').appendChild(l);
  setTimeout(() => l.remove(), 900);
  veLai(); veThanhTren(); luu();
  if (!st.rac.length) {
    loa('Sạch bong! ');
    if (!st.khach && !st.dem) setTimeout(khachDen, treKhach(900));
  }
}
svg.addEventListener('pointerdown', e => {
  if (st.dem) return;
  const rac = e.target.closest('.rac');
  if (rac) { quet = true; don(+rac.dataset.rac, e); return; }
  const g = e.target.closest('.vat');
  if (g) {
    const v = st.dat.find(x => x.id === +g.dataset.id);
    keo = { k: v.k, id: v.id, x: e.clientX, y: e.clientY, keo: false };
    svg.setPointerCapture(e.pointerId);
  } else if (st.chon) {
    const [gx, gy] = oDuoiTay(e, st.chon);
    if (datDuoc(st.chon, gx, gy)) { const k = st.chon; st.chon = null; mua(k, gx, gy); }
    else loa('Chỗ này không đặt được');
  }
  anPopup();
});
window.addEventListener('pointermove', e => {
  if (quet) {
    const r = document.elementFromPoint(e.clientX, e.clientY)?.closest('.rac');
    if (r) don(+r.dataset.rac, e);
    return;
  }
  if (!keo) return;
  if (!keo.keo && Math.hypot(e.clientX - keo.x, e.clientY - keo.y) > 8) {
    // Kéo theo chiều cuộn của kệ là cuộn kệ, không phải kéo đồ. Kệ cuộn ngang
    // khi cầm dọc, cuộn dọc khi xoay ngang.
    const ngang = Math.abs(e.clientX - keo.x) > Math.abs(e.clientY - keo.y);
    if (keo.tuTiem && ngang === !keDoc()) { keo = null; return; }
    keo.keo = true;
    if (keo.id) document.querySelector(`.vat[data-id="${keo.id}"]`)?.setAttribute('opacity', '.25');
  }
  if (!keo.keo) return;
  e.preventDefault();
  const r = svg.getBoundingClientRect();
  const trong = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
  if (trong) { const [gx, gy] = oDuoiTay(e, keo.k); veBongMa(keo.k, gx, gy, keo.id); }
  else veBongMa();
}, { passive: false });
window.addEventListener('pointerup', e => {
  quet = false;
  if (!keo) return;
  const k = keo;
  keo = null;
  veBongMa();
  if (!k.keo) {
    if (k.tuTiem) { st.chon = st.chon === k.k ? null : k.k; veTiem(); if (st.chon) loa('Chạm vào sàn để đặt'); }
    else hienPopup(k.id, e);
    return;
  }
  const r = svg.getBoundingClientRect();
  const trong = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
  const [gx, gy] = trong ? oDuoiTay(e, k.k) : [-9, -9];
  if (k.tuTiem) {
    if (trong && datDuoc(k.k, gx, gy)) mua(k.k, gx, gy);
    else if (trong) loa('Chỗ này không đặt được');
  } else {
    const v = st.dat.find(x => x.id === k.id);
    if (trong && datDuoc(k.k, gx, gy, k.id)) {
      const doiCho = v.gx !== gx || v.gy !== gy || (v.tren || null) !== (datSan(k.k, gx, gy, k.id) ? null : beMat(k.k, gx, gy, k.id)?.id || null);
      const tren = datSan(k.k, gx, gy, k.id) ? null : beMat(k.k, gx, gy, k.id)?.id;
      st.dat.filter(x => x.tren === v.id).forEach(x => { x.gx += gx - v.gx; x.gy += gy - v.gy; });
      v.gx = gx; v.gy = gy;
      if (tren) v.tren = tren; else delete v.tren;
      if (doiCho) viec('sapXep');
      cop();
    }
    veHet();
  }
});

let popupId = null;
function hienPopup(id, e) {
  const p = $('#popup'), khung = $('#phongKhung').getBoundingClientRect();
  popupId = id;
  $('#nutCat').textContent = `Cất lại · +${gon(DO[st.dat.find(v => v.id === id).k].gia)}`;
  p.style.left = (e.clientX - khung.left) + 'px';
  p.style.top = (e.clientY - khung.top - 8) + 'px';
  p.style.display = 'block';
}
function anPopup() { $('#popup').style.display = 'none'; popupId = null; }
$('#nutCat').addEventListener('pointerdown', e => e.stopPropagation());
$('#nutCat').addEventListener('click', () => { if (popupId) catLai(popupId); anPopup(); });

// ── Khách tới, cho thuê ────────────────────────────────────────────────────
function khachDen() {
  if (document.querySelector('.phu.hien')) { xepHang(khachDen); return; }
  if (st.luot <= 0 || st.dem || st.rac.length || st.khach || st.phong[st.o].loai) return;
  $('#khachPhong').textContent = `Có người hỏi thuê phòng ${st.o + 1}`;
  st.luot--; st.giay = null;
  const hen = henHomNay();
  st.khach = taoKhach(hen?.khach ? hen.kieuKhach || 'bacSi' : null);
  if (hen?.khach) { hen.khach = false; ghiHen(docHen()); }
  veHet();
  const k = st.khach;
  $('#anhKhach').innerHTML = `<svg viewBox="-55 -130 110 136">${veKhach(k, true)}</svg>`;
  $('#tenKhach').textContent = `${k.ten} · ${KIEU[k.kieu].ten}`;
  $('#loiKhach').textContent = `“${cauHoi(k)}”`;
  $('#yeuCau').innerHTML = `<div class="tran">Dưới ${trieu(k.tran)}</div>`
    + k.can.map(n => chip(n, '')).join('')
    + `<span class="chip xong">${k.tang}<span class="dau">✓</span></span>`;
  $('#nutKhac').hidden = st.luot <= 0;
  $('#nutKhac').textContent = `Mời khách khác (còn ${st.luot})`;
  $('#manKhach').classList.add('hien');
  dingDong();
}
$('#nutXem').addEventListener('click', () => {
  $('#manKhach').classList.remove('hien');
  setTimeout(huongDan, 50);
  if (st.khach) noi(cauHoi(st.khach), 4200);
  tiepHang();
});
$('#nutKhac').addEventListener('click', () => { $('#manKhach').classList.remove('hien'); khachKhac(); });

function khachKhac() {
  const k = st.khach, p = st.phong[st.o];
  if (!k || k.o || k.di) return;
  k.di = true;
  if (k.daMac) ghi('mac_ca', { ket_qua: 'khach_di' });
  noi(bat(['Thôi để em tìm chỗ khác.', 'Dạ em đi xem thêm vài chỗ nữa.']), 1600);
  setTimeout(() => {
    p.khach = null; veHet();
    if (p !== st.phong[st.o]) return;
    if (st.luot > 0) setTimeout(khachDen, treKhach(500));
    else loa('Hết người hỏi thuê tháng này');
  }, 1300);
}

// Gần một nửa số khách mặc cả trước khi chốt. Chiều khách thì khách ở lâu hơn,
// giữ giá thì có thể mất khách hoặc khách ở mà trong lòng hơi bực.
function choThue() {
  const k = st.khach;
  if (!ungY()) return;
  const mac = KIEU[k.kieu].mac;
  if (mac && !k.daMac && Math.random() < .45) {
    k.daMac = true;
    taiHoa({
      ma: 'macCa', icon: 'tien', ten: `${k.ten} mặc cả`,
      loi: `“${mac}”\nGiá phòng đang là ${dong(giaPhong())}/tháng.`,
      a: ['Đồng ý bớt 200k', () => choThueThat(200, true)],
      c: ['Bớt 100k thôi', () => { if (Math.random() < .65) choThueThat(100); else khachKhac(); }],
      b: ['Giữ nguyên giá', () => { if (Math.random() < .45) choThueThat(0, false, true); else khachKhac(); }],
    });
    return;
  }
  choThueThat(0);
}
function choThueThat(giam, vui, hoiBuc) {
  const k = st.khach;
  if (!k || k.o) return;
  const hon = nhomThem(k) >= 2;   // bày hơn mong đợi: khách ở lâu hơn
  k.o = true; k.tien = Math.max(GIA_NEN, giaPhong() - giam);
  if (k.daMac) ghi('mac_ca', { ket_qua: giam ? 'bot' : 'giu_gia' });
  k.con = khoang(KIEU[k.kieu].o) - 1 + (hon ? 1 : 0) + (vui ? 1 : 0); k.muon = null;
  if (hoiBuc) k.buc = 1;
  st.soKhach++;
  st.thangThueGan = st.thang;
  buiDauThang(st.phong[st.o]);
  if (st.thangThueDau == null) st.thangThueDau = st.thang;
  if (k.chuyen === 'linh' && !st.chuyenLinh) {
    k.con = Math.max(k.con, 5);
    st.chuyenLinh = { doan: 0, batDau: st.thang, phong: st.o, choDoc: null, chon: null };
    thuLinh(1);
  }
  if (k.daMac && !giam) st.ttDem.mac = (st.ttDem.mac || 0) + 1;
  viec('thue'); if (giam || hoiBuc) viec('macCa');
  const moiGap = !st.gap?.[k.kieu];
  st.gap = { ...(st.gap || {}), [k.kieu]: (st.gap?.[k.kieu] || 0) + 1 };
  if (moiGap) setTimeout(() => loa(`Sổ khách: thêm kiểu mới · ${Object.keys(st.gap).length}/${Object.keys(KIEU).length}`), 2600);
  ghi('cho_thue', { kieu: k.kieu, tien: giaPhong() - giam, mac: giam || hoiBuc ? 1 : 0 });
  vuiDenLuc = Date.now() + 3000;
  kiemThuThach30();
  veHet(); nhay(); timBay();
  noi(vui ? 'Anh chị dễ thương quá! Em ở lâu luôn.' : hoiBuc ? 'Thôi được… em chịu.'
    : bat(KIEU[k.kieu].chot) + (hon ? ' Phòng xịn hơn em tưởng!' : ''), 3000);
  doiTien(k.tien);
  if (hon) setTimeout(() => loa('Hơn mong đợi · khách ở thêm 1 tháng'), 1800);
  henSuCo(9000, .5);
}

$('#nutChinh').addEventListener('click', () => {
  const k = st.khach;
  if (k && !k.o) return choThue();
  if (!k && st.rac.length) return;
  if (!k && st.luot > 0) return khachDen();
  hetThang();
});
$('#nutPhu').addEventListener('click', () => laQuan(st.phong[st.o]) ? doiNhanVien() : st.khach && !st.khach.o ? khachKhac() : !st.khach && !st.luot && coQcKhach() ? qcThemKhach() : hetThang());

// ── Sự cố giữa tháng ───────────────────────────────────────────────────────
// Sự cố gắn với một phòng. Đang xem phòng khác thì ô phòng đó nháy .
function henSuCo(tre, kha) {
  const thang = st.thang;
  setTimeout(() => { if (st.thang === thang && Math.random() < kha) suCoToi(); }, tre);
}
function suCoToi() {
  if (st.dem || st.suCo || document.querySelector('.phu.hien')) return;
  const ds = st.phong.map((p, i) => p.khach?.o ? i : -1).filter(i => i >= 0);
  if (!ds.length) return;
  const o = ds.includes(st.o) && Math.random() < .6 ? st.o : bat(ds);
  const loai = bat(Object.keys(SU_CO)), s = SU_CO[loai];
  st.suCo = { loai, o, batDau: Date.now(), t: setTimeout(xetKienNhan, KIEN_NHAN) };
  const b = document.createElement('button');
  b.className = 'su-co'; b.id = 'suCo';
  b.innerHTML = noiDungSuCo(s, o, KIEN_NHAN);
  b.addEventListener('click', suaSuCo);
  $('#phongKhung').appendChild(b);
  st.suCo.gap = setTimeout(() => b.classList.add('gap'), KIEN_NHAN - 5000 + 1);
  veLai(); veDay();
  if (o === st.o) noi(s.cau, 3400);
  else loa(`${tenP(o)}: ${s.ten}! Chạm ô phòng để sửa`);
  tieng([[880, 0, .12], [880, .18, .12]], 'square', .08);
}
function noiDungSuCo(s, o, thoiGian, nhac = false) {
  return `<span class="bieu">${bieuTuong(s.icon)}</span><span>${nhac ? 'Khách nhắc thêm ' + Math.round(thoiGian / 1000) + ' giây<br>' : ''}${tenP(o)} · ${s.ten}<br><b>${s.gia ? 'Sửa ngay · ' + gon(s.gia) : 'Khởi động lại ngay'}</b></span><i class="kien"><i style="animation-duration:${thoiGian}ms"></i></i>`;
}
function xetKienNhan() {
  if (!st.suCo) return;
  if (st.nhacSuCoThang === st.thang) { hetKienNhan(); return; }
  // Lần chậm đầu tháng vẫn chỉ nhắc như cũ, nhưng còn một cơ hội tự bấm sửa.
  st.nhacSuCoThang = st.thang;
  st.suCo.chiNhac = true;
  st.suCo.t = setTimeout(hetKienNhan, NHAC_THEM_SU_CO);
  const s = SU_CO[st.suCo.loai], b = $('#suCo');
  if (b) { b.innerHTML = noiDungSuCo(s, st.suCo.o, NHAC_THEM_SU_CO, true); b.classList.add('gap'); }
  loa(`${tenP(st.suCo.o)}: khách nhắc thêm ${Math.round(NHAC_THEM_SU_CO / 1000)} giây, chạm nút để sửa nhé.`);
  luu(true);
}
function boSuCo() {
  if (!st?.suCo) return;
  clearTimeout(st.suCo.t);
  clearTimeout(st.suCo.gap);
  st.suCo = null;
  $('#suCo')?.remove();
}
function suaSuCo() {
  const s = SU_CO[st.suCo?.loai];
  if (!s) return;
  const hen = henHomNay(), mienPhi = hen?.loai === 'sua' && !hen.dung.sua;
  if (!mienPhi && s.gia > st.tien) { loa(`Còn thiếu ${dong(s.gia - st.tien)}`); return; }
  if (st.o !== st.suCo.o) chuyenPhong(st.suCo.o, true);
  const nhanh = Date.now() - st.suCo.batDau < KIEN_NHAN / 2;
  boSuCo();
  if (mienPhi) { hen.dung.sua = true; ghiHen(docHen()); loa('Chú Sáu sửa giúp, không tốn tiền!'); }
  else st.tien -= s.gia;
  viec('sua');
  cop();
  vuiDenLuc = Date.now() + 2500;
  veHet(); nhay(); timBay();
  noi(nhanh ? 'Sửa lẹ ghê! Cảm ơn anh chị.' : 'Cảm ơn anh chị nha.', 2400);
  if (nhanh) doiTien(50, '+50.000đ tiền bo');
  henSuCo(6000, .35);   // lâu lâu xui, hỏng tiếp món khác
}
function hetKienNhan() {
  const o = st.suCo?.o, k = o == null ? null : st.phong[o].khach;
  const chiNhac = !!st.suCo?.chiNhac;
  boSuCo();
  if (!k) return;
  if (chiNhac || st.nhacSuCoThang !== st.thang) {
    st.nhacSuCoThang = st.thang;
    loa(`${tenP(o)}: lần này khách chỉ nhắc. Nhớ sửa sớm lần sau nhé.`);
    veHet(); luu(true); return;
  }
  k.buc = (k.buc || 0) + 1;
  if (k.buc >= 2) k.con = 0;
  const cau = k.buc >= 2 ? 'Chậm quá! Hết tháng này em dọn đi.' : 'Chủ trọ gì mà chậm quá…';
  if (o === st.o) noi(cau, 3000); else loa(`${tenP(o)} · ${k.ten}: ${cau}`);
  tieng([[300, 0, .3, 200]], 'triangle', .2);
  veHet();
}

// ── Hàng chờ: thư, tai hoạ, khách… hiện lần lượt, không chồng lên nhau ──────
let hang = [];
function xepHang(fn) { hang.push(fn); tiepHang(); }
function tiepHang() { if (hang.length && !document.querySelector('.phu.hien')) hang.shift()(); }

// ── Dãy phòng ──────────────────────────────────────────────────────────────
const soMo = () => st.phong.filter(p => p.mo && !p.loai).length;
const mucThang = () => mucTieu(st.thang) + 1000 * (soMo() - 1);
function veDay() {
  const sau = st.phong.slice(0, 6).findIndex(p => !p.mo);
  const mb = st.phong[MB], nha = st.phong[NHA];
  const dac = (mb.mo ? `<button class="tab ${st.o === MB ? 'dang' : ''}" data-p="${MB}">${laQuan(mb) ? tenQuan(mb) : 'MB' + (mb.khach && !mb.khach.o ? ' ' : '')}</button>`
      : `<button class="tab khoa" data-mb="1">${soMo() < 2 ? ' Mặt bằng · cần P.2' : ' Mặt bằng'}</button>`)
    + (nha.mo ? `<button class="tab ${st.o === NHA ? 'dang' : ''}" data-p="${NHA}"> Nhà</button>` : `<button class="tab khoa" data-nha="1"> ${gon(GIA_NHA)}</button>`);
  $('#dayPhong').innerHTML = st.phong.slice(0, 6).map((p, i) => {
    if (!p.mo) return i === sau ? `<button class="tab khoa" data-p="${i}" aria-label="Mở phòng ${i + 1}, ${dong(MO_PHONG[i])}">＋ P.${i + 1}<span class="gia-phong">${gon(MO_PHONG[i])}</span></button>` : '';
    const k = p.khach, gap = st.suCo?.o === i;
    const dau = gap ? bieuTuong('canhBao') : p.rac.length ? bieuTuong('tay') : k && !k.o ? bieuTuong('chuong') : k ? bieuTuong('vui') : '';
    return `<button class="tab ${i === st.o ? 'dang' : ''} ${gap ? 'gap' : ''}" data-p="${i}">P.${i + 1}${dau ? ' ' + dau : ''}</button>`;
  }).join('') + '<button class="tab tt-mo" data-tt="1">' + bieuTuong('trangTri') + ' Trang trí</button><button class="tab" data-khoe="1" aria-label="Khoe phòng">' + bieuTuong('mayAnh') + '</button>' + dac;
}
$('#dayPhong').addEventListener('click', e => {
  const b = e.target.closest('.tab');
  if (!b || st.dem) return;
  if (b.dataset.tt) { moTrangTri(); return; }
  if (b.dataset.khoe) { khoePhong(); return; }
  if (b.dataset.mb) { moMatBang(); return; }
  if (b.dataset.nha) { muaNha(); return; }
  const i = +b.dataset.p;
  if (st.phong[i].mo) chuyenPhong(i); else moPhong(i);
});
function chuyenPhong(i, yen) {
  if (i === st.o && !yen) return;
  st.o = i; st.chon = null; anPopup();
  $('#bong').classList.remove('hien');
  veHet();
  if (yen) return;
  const k = st.khach;
  if (k && !k.o) noi(cauHoi(k), 3600);
  else if (k?.muon) noi(MUON[k.muon], 3000);
  else if (!k && !st.rac.length && st.luot > 0) setTimeout(khachDen, treKhach(400));
}
function moPhong(i, daHoi = false) {
  if (!Number.isInteger(i) || i < 1 || i > 5 || st.phong[i].mo || !st.phong[i - 1].mo) return;
  const gia = MO_PHONG[i];
  if (st.tien < gia) { loa(`Cần ${dong(gia)} để mở phòng ${i + 1}`); return; }
  // Dự phòng điện nước 200k + sửa sự cố trung bình 50k mỗi phòng/tháng.
  const duPhong = (soMo() + 1) * 250;
  if (!daHoi && st.tien - gia < duPhong) {
    taiHoa({ ma: 'hoiMoPhong', icon: 'tien', ten: 'Giữ một ít tiền phòng thân',
      loi: `Mở xong còn ${dong(st.tien - gia)}, chưa đủ chi phí tháng tới (khoảng ${dong(duPhong)} cho điện nước và sửa đồ). Vẫn mở?`,
      a: ['Để dành thêm', () => {}], b: ['Vẫn mở', () => moPhong(i, true)] });
    return;
  }
  const p = st.phong[i];
  p.mo = true; p.rac = taoRac(5, p);
  ghi('mo_phong', { phong: i + 1 });
  doiTien(-gia, `−${dong(gia)} mở phòng ${i + 1}`);
  chuyenPhong(i, true);
  tieng([[523, 0, .2], [659, .12, .2], [784, .24, .2], [1047, .36, .5]], 'triangle', .2);
  loa(`Mở phòng ${i + 1}! Dọn dẹp rồi đón khách`);
}

// ── Cuối tháng, đầu tháng ──────────────────────────────────────────────────
function hetThang(daHoi = false) {
  if (st.dem) return;
  if (st.suCo && !daHoi) {
    const s = SU_CO[st.suCo.loai], hen = henHomNay();
    const gia = hen?.loai === 'sua' && !hen.dung.sua ? 0 : s.gia;
    taiHoa({ma:'nhacSuaTruocThu',icon:'sua',ten:'Còn một việc ở '+tenP(st.suCo.o),
      loi:`${s.ten} vẫn chưa sửa. Sửa trước khi thu tiền để khách khỏi chờ nhé.\nPhí sửa: ${dong(gia)}. Bạn vẫn có thể để vậy và kết thúc tháng.`,
      a:['Sửa rồi thu tiền',()=>{suaSuCo();hetThang(true);},gia],
      b:['Để vậy, thu tiền',()=>hetThang(true)]});
    return;
  }
  traNoBa();
  if (st.suCo) hetKienNhan();   // để sự cố tới tối là tính như để khách chờ quá lâu
  hang = [];
  st.dem = true; st.chon = null; anPopup();
  if (laTet()) st.ttDem.tet = true;
  if (thangSo(st.thang) === 12) st.ttDem.noel = true;
  const k = st.khach, muc = mucThang(), dat = st.thu >= muc;
  const saoTruoc = saoDay();
  if (dat && st.saoThang !== st.thang) { st.sao++; st.saoThang = st.thang; st.uyTin = (st.uyTin || 0) + 1; }
  if (saoDay() > saoTruoc) xepHang(() => lenSao(saoDay()));
  viec('thang');
  ghi('het_thang', { thang: st.thang + 1, dat: dat ? 1 : 0, phong: soMo(), tien: Math.round(st.tien), sao: saoDay() });
  veHet();
  if (k?.o) noi(bat(['Ngủ ngon nha anh chị.', 'Hôm nay mệt ghê…', 'Mai đi làm sớm.']), 2000);
  const ds = st.phong.map((p, i) => !p.mo || p.loai === 'nha' ? '' : laQuan(p) ? `${tenQuan(p)}: lãi dự kiến ${gon(laiTiem(p, true))}` : p.khach?.o
    ? `${tenP(i)}: ${p.khach.ten}, ${p.khach.con ? `còn ${p.khach.con} tháng` : 'tháng cuối'}` : `${tenP(i)}: trống`).filter(Boolean).join('\n');
  setTimeout(() => {
    $('#demTen').textContent = `Tối 30 · tháng ${thangSo(st.thang)}`;
    $('#demLoi').textContent = `Thu tháng này: ${dong(st.thu)}\nMục tiêu: ${dong(muc)} · ${dat ? 'Đạt ' : 'hụt rồi'}\nTrả bà tháng này: ${dong(st.vayBa?.vuaTra || 0)} · Còn nợ: ${dong(st.vayBa?.no || 0)}\n\n${ds}`;
    $('#nutSang').textContent = st.thang === SO_THANG - 1 && !st.tiep ? 'Xem sổ chủ trọ' : `Sáng mùng 1 · tháng ${thangSo(st.thang + 1)}`;
    const gap = Math.min(st.thu, 3000);
    $('#nutGapDoi').hidden = !TRONG_APP || gap <= 0 || st.qcThang === st.thang;
    nhanHinh($('#nutGapDoi'), 'tivi', `Xem quảng cáo: nhận thêm ${dong(gap)}`);
    $('#nutGapDoi').onclick = () => xemQC('gap_doi', duoc => {
      if (!duoc) return;
      st.qcThang = st.thang; $('#nutGapDoi').hidden = true;
      doiTien(gap, `+${dong(gap)} gấp đôi`);
    });
    $('#manDem').classList.add('hien');
    const hen = $('#henQuayLai');
    if (hen) {
      hen.hidden = st.thang !== 0 || !!st.daHenQuayLai;
      if (!hen.hidden) { hen.textContent = hienHenMai(); st.daHenQuayLai = true; luu(); }
    }
  }, k?.o ? 2100 : 1200);
}

$('#nutSang').addEventListener('click', () => {
  $('#manDem').classList.remove('hien');
  if (st.thang === SO_THANG - 1 && !st.tiep) moSo();
  else sangThang();
});

// Lần bùng đầu tiên đến chắc chắn trong 6 tháng — đây là chuyện để kể.
function bungNay() {
  if (QUAY && !st.daBung) return true;
  if (st.daBung) return Math.random() < .12;
  if (st.thang >= 3) return true;
  return st.thang >= 2 && Math.random() < .5;
}

// Đầu tháng: đi một vòng cả dãy — thu tiền, người dọn đi, người bùng.
function sangThang() {
  // Xé tờ lịch: tờ cũ rơi xuống, tờ mới đã nằm sẵn bên dưới.
  const cu = $('#lich .to').cloneNode(true);
  st.thang++; st.thu = 0; st.dem = false;
  kiemMucGan();
  let cong = 0, bung = -1;
  const thu = [], bao = [];
  st.phong.forEach((p, i) => {
    p.luot = p.loai ? 0 : luotThang();
    const k = p.khach;
    if (!p.mo || !k) return;
    if (!k.o) { p.khach = null; return; }            // người hỏi thuê hôm qua đã đi chỗ khác
    const co = n => p.dat.some(v => DO[v.k].nhom === n);
    if (!k.can.every(co)) {
      p.khach = null; p.rac = taoRac(khoang([3, 5]), p);
      bao.push(`${tenP(i)}: ${k.ten} bỏ đi vì bị dọn mất đồ`);
      st.uyTin = Math.max(0, (st.uyTin || 0) - 1);
      return;
    }
    if (k.con <= 0) {
      const la = (k.buc || 0) < 2 && viLa(k, p);
      p.khach = null; p.rac = taoRac(khoang([3, 5]), p);
      if (la) { st.la = [...(st.la || []), la]; thu.push(la); st.uyTin = (st.uyTin || 0) + 1; }
      else { bao.push(`${tenP(i)}: ${k.ten} dọn đi vì bực`); st.uyTin = Math.max(0, (st.uyTin || 0) - 1); }
      return;
    }
    if (bung < 0 && k.kieu !== 'bacSi' && !(!QUAY && k.chuyen === 'linh' && st.chuyenLinh?.doan < 3) && bungNay()) { bung = i; return; }
    k.con--; cong += k.tien;
    if (k.no) {
      if (Math.random() < .85) { cong += k.no + 50; bao.push(`${tenP(i)}: ${k.ten} trả nợ ${gon(k.no)}, kèm quà cảm ơn`); k.no = 0; }
      else bao.push(`${tenP(i)}: ${k.ten} hẹn tháng sau mới trả nợ`);
    }
    if (!k.muon && Math.random() < .4) k.muon = (ganTet() && !co('tet') ? 'tet' : tron(Object.keys(MUON).filter(n => n !== 'tet')).find(n => !co(n))) || null;
  });
  kiemThuThach30();
  st.ttDem.yen = bung >= 0 || !cong ? 0 : (st.ttDem.yen || 0) + 1;
  st.phong.forEach(buiDauThang);
  veHet(); veLich();
  const mb = ketMatBang();
  if (cong) doiTien(cong, undefined, 700);
  if (mb) doiTien(mb.tien, mb.chu, 1500);
  luu(true);
  cu.classList.add('xe');
  $('#lich').appendChild(cu);
  setTimeout(() => cu.remove(), 1000);

  if (cong) setTimeout(() => loa(`Thu tiền trọ tháng ${thangSo(st.thang)}`), 700);
  bao.forEach((b, j) => setTimeout(() => loa(b), 2600 + j * 2600));
  setTimeout(() => {
    kiemChuyenLinh();
    if (thangSo(st.thang) === 9 && dangO().length) xepHang(() => taiHoa(TRUNG_THU));
    if ((thangSo(st.thang) === 12 || cauHinh('su_kien_mua', '') === 'noel') && dangO().length) xepHang(() => taiHoa(NOEL));
    if (laTet()) {
      xepHang(() => taiHoa(GIAO_THUA));
      if (st.phong.some(p => p.khach?.o)) xepHang(() => taiHoa(VE_QUE));
    }
    thu.forEach(la => xepHang(() => moLa(la)));
    if (bung >= 0) xepHang(() => { chuyenPhong(bung, true); goCua(st.khach); });
    suKienThang();
    henChuyenDayTro();
    xepHang(() => {
      const k = st.khach;
      if (!k && !st.rac.length && st.luot > 0) khachDen();
      else if (k?.muon) noi(MUON[k.muon], 3200);
    });
    henSuCo(9000, .75);
  }, 1800);
}

// Tai hoạ: bùng tiền trọ.
function goCua(k) {
  $('#goTen').textContent = `Mùng 1 tháng ${thangSo(st.thang)} · ngày thu tiền trọ`;
  $('#goLoi').textContent = `Cốc cốc cốc… ${k.ten} ơi, đóng tiền trọ nè!`;
  $('#nutMoCua').textContent = `Mở cửa phòng ${st.o + 1}`;
  $('#manGo').classList.add('hien');
  goCuaAm();
}
$('#nutMoCua').addEventListener('click', () => {
  $('#manGo').classList.remove('hien');
  const k = st.khach;
  if (!k) return;
  const lanDau = !st.daBung;
  const nhe = lanDau && cauHinh('bung_lan_dau_nhe', false);
  st.giay = oTrong(); st.khach = null; st.daBung++;
  ghi('bi_bung', { thang: st.thang + 1 });
  // Đi luôn một món đồ nhỏ.
  const nho = tron(st.dat.filter(v => ['quatCay', 'noiCom', 'binhNuoc', 'gheNhua', 'senDa'].includes(v.k)))[0];
  const mang = !nhe && nho && !st.camera && Math.random() < .6;
  if (mang) st.dat = st.dat.filter(v => v !== nho);
  st.rac = taoRac(4);
  veHet();
  buon();
  setTimeout(() => noi('Em về quê ạ ', 3600), 300);
  const tienBung = nhe ? Math.round(k.tien * 0.5) : k.tien;
  setTimeout(() => tienBay(`Bùng ${dong(tienBung)}`, 'bung'), 900);
  if (nhe) {
    const guiLai = k.tien - tienBung;
    if (guiLai > 0) setTimeout(() => { doiTien(guiLai, `+${dong(guiLai)} khách gửi lại`); loa(`Khách để lại thư và ${dong(guiLai)} tiền phòng`); }, 1500);
  }
  let dn = Math.min(st.tien, 150 + Math.floor(Math.random() * 4) * 50);
  if (nhe) dn = Math.round(dn * 0.5);
  if (dn > 0) setTimeout(() => { doiTien(-dn, `−${dong(dn)} điện nước`); loa(`Còn nợ tiền điện nước ${dong(dn)}`); }, 3400);
  if (mang) setTimeout(() => loa(`Mang theo luôn cái ${DO[nho.k].ten.toLowerCase()} `), 6200);
  setTimeout(tiepHang, 7000);
});

// ── Tai hoạ ────────────────────────────────────────────────────────────────
function chi(x, lydo) {
  x = Math.min(x, st.tien);
  if (x > 0) doiTien(-x, `−${dong(x)} ${lydo}`);
}
function bucThem(cau) {
  const k = st.khach;
  if (!k?.o) return;
  k.buc = (k.buc || 0) + 1;
  if (k.buc >= 2) { k.con = 0; loa('Khách bực · cuối tháng sẽ dọn đi'); }
  noi(cau, 2800);
}
function diuKhach() { const k = st.khach; if (k?.o && k.buc) k.buc--; }
function doiUyTin(so, chu) { st.uyTin = Math.max(0, (st.uyTin || 0) + so); loa(chu); }
// Chỉ tặng đồ hợp phòng, đã mở khóa và có chỗ đặt; không trừ tiền người chơi.
function tangDoCu(mon) {
  const ds = mon ? [mon] : tron(Object.keys(DO).filter(k => DO[k].gia <= 150 && !DO[k].tiem && !DO[k].tra && (!DO[k].goi || coGoi(DO[k].goi)) && (!DO[k].tet || ganTet() || coGoi('goi_tet'))));
  for (const k of ds) for (let gx = 0; gx < N; gx++) for (let gy = 0; gy < N; gy++) {
    if (!datDuoc(k, gx, gy)) continue;
    const tren = datSan(k, gx, gy) ? null : beMat(k, gx, gy)?.id;
    st.dat.push({ id: st.idKe++, k, gx, gy, ...(tren ? { tren } : {}) });
    loa(`Được tặng ${DO[k].ten.toLowerCase()} · khỏi mất tiền`); return;
  }
  loa('Phòng kín đồ rồi · cần chừa chỗ trống để nhận đồ nha');
}
const phongTrongVip = () => st.phong.map((p, i) => p.mo && !p.loai && !p.khach && !p.rac.length ? i : -1).filter(i => i >= 0);
const suKienDuoc = () => Object.keys(TAI_HOA).filter(l => l !== st.skTruoc && (!TAI_HOA[l].canKhach || dangO().length) && (!TAI_HOA[l].canTrong || phongTrongVip().length));
function suKienThang() {
  if (st.skThang === st.thang) return;
  const thang = st.thang;
  st.skThang = thang; luu();
  if (Math.random() >= .4) return;
  xepHang(() => {
    const ds = [...suKienDuoc(), ...(dangO().length && st.skTruoc !== 'khachKho' ? ['khachKho'] : [])];
    if (st.dem || st.thang !== thang || !ds.length) { tiepHang(); return; }
    const ma = bat(ds);
    if (ma === 'khachKho') { st.skTruoc = ma; luu(); khoDo(); hoaDangMa = ma; }
    else taiHoa(ma);
  });
}
let hoaDang = null, hoaDangMa = null;
function taiHoa(loai) {
  const coNguoi = st.phong.map((p, i) => p.khach?.o ? i : -1).filter(i => i >= 0);
  const ma = typeof loai === 'object' ? null : loai || bat(suKienDuoc());
  const h = ma ? TAI_HOA[ma] : typeof loai === 'object' ? loai : null;
  if (!h || (h.canKhach && !coNguoi.length) || (h.canTrong && !phongTrongVip().length)) { tiepHang(); return; }
  if (h.canKhach && !st.khach?.o && coNguoi.length) chuyenPhong(bat(coNguoi), true);
  if (h.canTrong) chuyenPhong(bat(phongTrongVip()), true);
  if (ma) { st.skTruoc = ma; luu(); }
  hoaDang = h; hoaDangMa = ma;
  $('#hoaIcon').innerHTML = bieuTuong(h.icon);
  $('#hoaTen').textContent = h.ten;
  $('#hoaLoi').textContent = h.loi;
  const nhan = x => typeof x === 'function' ? x() : x;
  $('#hoaA').textContent = nhan(h.a[0]);
  $('#hoaB').hidden = !h.b;
  if (h.b) $('#hoaB').textContent = nhan(h.b[0]);
  $('#hoaC').hidden = !h.c;
  if (h.c) $('#hoaC').textContent = nhan(h.c[0]);
  $('#hoaD').hidden = !h.d;
  if (h.d) $('#hoaD').textContent = nhan(h.d[0]);
  if (h.ma === 'moMatBang') for (const [nut, hinh] of [['A', 'banh'], ['C', 'nha'], ['D', 'tra']]) nhanHinh($('#hoa' + nut), hinh, $('#hoa' + nut).textContent);
  $('#manHoa').classList.add('hien');
  tieng([[523, 0, .2], [415, .2, .35]], 'triangle', .2);
}
function chonHoa(i) {
  const h = hoaDang;
  if (!h) return;
  const chon = [h.a, h.b, h.c, h.d][i];
  if (!chon) return;
  if (chon[2] > st.tien) { $('#hoaLoi').textContent = h.loi + `\n\nCòn thiếu ${dong(chon[2] - st.tien)}. Chọn cách khác nha.`; return; }
  const ma = hoaDangMa;
  hoaDang = null; hoaDangMa = null;
  $('#manHoa').classList.remove('hien');
  ghi('su_kien', { ma: h.ma || ma, chon: ['a', 'b', 'c', 'd'][i] });
  chon[1]();
  if (ma) st.ttDem.hoa = (st.ttDem.hoa || 0) + 1;
  veHet();
  tiepHang();
}
$('#hoaA').addEventListener('click', () => chonHoa(0));
$('#hoaB').addEventListener('click', () => chonHoa(1));
$('#hoaC').addEventListener('click', () => chonHoa(2));
$('#hoaD').addEventListener('click', () => chonHoa(3));

// Chuyện lâu năm của dãy: khách tự góp, lựa chọn chỉ để nhớ chuyện cùng nhau.
const CHUYEN_DAY_TRO = [
  { ma: 'buaComDayTro', tuThang: 21, ten: 'Bữa cơm cuối hẻm',
    loi: () => 'Ở với nhau cũng lâu rồi, khách rủ mỗi phòng mang một món ăn chung. Có người ôm nồi canh, có người đem đúng hai cái chén. “Chủ trọ chọn chỗ ngồi đi, tụi em lo món rồi!”',
    a: ['Trải chiếu ngoài sân', 'Cả dãy ngồi ngoài sân, chuyền nhau tô canh. “Mai nhớ trả em cái chén nha!”'],
    b: ['Kê bàn dọc hành lang', 'Bàn ghép dọc hành lang, phòng nào cũng mang ghế ra. Bữa cơm kéo dài tới lúc đèn đường sáng.'] },
  { ma: 'gocChungDayTro', tuThang: 25, ten: 'Góc nhỏ của cả dãy',
    loi: () => `${luaChonChuyen('buaComDayTro') === 0 ? 'Nhớ bữa trải chiếu ngoài sân' : 'Nhớ bữa ghép bàn dọc hành lang'}, khách muốn giữ một góc để gặp nhau. Bạn mới mang vài cuốn sách, cô phòng bên có cây đang tách nhánh. “Đồ tụi em tự góp, anh chị thích bắt đầu bằng gì?”`,
    a: ['Góp sách, đọc rồi chuyền tay', 'Trang đầu có dòng nhắn: “Đọc xong để lại đây cho người tới sau nha.” Góc sách nhỏ có bạn đọc đầu tiên.'],
    b: ['Góp cây, thay nhau tưới', 'Mỗi chậu có một mẩu giấy ghi tên người chăm. Sáng mai ra sân, chắc lại có cớ hỏi nhau một câu.'] },
];
function luaChonChuyen(ma) {
  const du = st.chuyenDayTro;
  return du && typeof du === 'object' && !Array.isArray(du) && [0, 1].includes(du[ma]) ? du[ma] : null;
}
function henChuyenDayTro() {
  if (st.dem || !dangO().length) return;
  const chuyen = CHUYEN_DAY_TRO.find(c => luaChonChuyen(c.ma) === null);
  if (!chuyen || st.thang + 1 < chuyen.tuThang) return;
  const thang = st.thang;
  xepHang(() => {
    if (st.dem || st.thang !== thang || !dangO().length || luaChonChuyen(chuyen.ma) !== null) { tiepHang(); return; }
    const chon = i => {
      const du = st.chuyenDayTro;
      st.chuyenDayTro = { ...(du && typeof du === 'object' && !Array.isArray(du) ? du : {}), [chuyen.ma]: i };
      luu(true); loa(chuyen[i ? 'b' : 'a'][1]);
    };
    taiHoa({ ma: chuyen.ma, icon: 'thu', ten: chuyen.ten, loi: chuyen.loi(),
      a: [chuyen.a[0], () => chon(0)], b: [chuyen.b[0], () => chon(1)] });
  });
}

// ── Tết ────────────────────────────────────────────────────────────────────
const dangO = () => st.phong.filter(p => p.khach?.o).map(p => p.khach);
const GIAO_THUA = {
  ma: 'giaoThua',
  icon: 'lich', get ten() { const y = namSo(st.thang); return `Giao thừa · Tết ${canChi(y)} ${y}`; },
  loi: 'Pháo hoa rực trời. Cả dãy trọ ra sân chúc Tết: "Chúc anh chị năm mới phát tài!"',
  a: [() => `Lì xì mỗi phòng 100k · ${gon(100 * dangO().length)}`, () => {
    const ds = dangO();
    chi(100 * ds.length, 'lì xì');
    ds.forEach(k => { k.buc = 0; k.con++; });
    if (ds.length) loa('Khách vui quá · ra Giêng ở thêm 1 tháng');
    phaoHoa();
  }],
  b: ['Chúc Tết lại thôi', () => { loa('Chúc mừng năm mới!'); phaoHoa(); }],
};
const VE_QUE = {
  ma: 'veQue',
  icon: 'nha', ten: 'Khách về quê ăn Tết',
  loi: 'Cả dãy về quê gần hết tháng, phòng khoá cửa im lìm. Khách nhắn xin giảm nửa tiền trọ tháng Tết…',
  a: [() => `Giảm một nửa · ${gon(Math.round(dangO().reduce((t, k) => t + k.tien, 0) / 100) * 50)}`, () => {
    const ds = dangO();
    chi(Math.round(ds.reduce((t, k) => t + k.tien, 0) / 100) * 50, 'giảm tiền Tết');
    ds.forEach(k => k.con++);
    loa('Khách cảm động · hứa ở lâu');
  }],
  b: ['Thu đủ, Tết ai cũng tốn', () => {
    dangO().forEach(k => { k.buc = (k.buc || 0) + 1; if (k.buc >= 2) k.con = 0; });
    loa('Khách hơi buồn…');
  }],
};
const TRUNG_THU = {
  ma: 'trungThu',
  icon: 'banh', ten: 'Tết Trung thu',
  loi: 'Rằm tháng Tám tới rồi. Dãy trọ toàn người xa nhà… Mua bánh trung thu tặng mỗi phòng một hộp?',
  a: [() => `Tặng mỗi phòng 1 hộp · ${gon(80 * dangO().length)}`, () => {
    chi(80 * dangO().length, 'bánh trung thu');
    dangO().forEach(k => { k.buc = 0; k.con++; });
    st.uyTin = (st.uyTin || 0) + 1;
    loa('Khách cảm động · uy tín dãy trọ tăng');
  }],
  b: ['Thôi, năm sau', () => loa('Trung thu lặng lẽ trôi qua…')],
};
const NOEL = {
  ma: 'noel',
  icon: 'cay', ten: 'Giáng sinh',
  loi: 'Mấy bạn trẻ trong dãy rủ nhau trang trí Noel, xin chủ trọ góp tiền mua dây đèn.',
  a: ['Góp 200k, cả dãy lung linh', () => {
    chi(200, 'dây đèn Noel');
    dangO().forEach(k => { if (k.buc) k.buc--; });
    st.uyTin = (st.uyTin || 0) + 1;
    loa('Dãy trọ lung linh · uy tín tăng');
  }],
  b: ['Tiết kiệm, không góp', () => loa('Cả dãy tắt đèn đi ngủ sớm…')],
};
// Lên sao: một cảnh ăn mừng và tiền thưởng.
function lenSao(n) {
  taiHoa({
    ma: 'lenSao', icon: 'sao', ten: `Dãy trọ lên ${n} sao!`,
    loi: `${veSao(n)}\nTiếng lành đồn xa, ${n >= 3 ? 'mỗi tháng có thêm người tới hỏi thuê' : 'khách bắt đầu biết tới dãy trọ của bạn'}.`
      + (n >= 4 ? '\nKhách giàu cũng tìm tới.' : ''),
    a: [`Nhận thưởng ${gon(500 * n)}`, () => { doiTien(500 * n, `+${dong(500 * n)} thưởng ${n} sao`); phaoHoa(); }],
  });
}
function phaoHoa() {
  const g = $('#game'), mau = ['#C8452D', VANG_MAI, '#9CAF8C', '#D9B27C', '#E88FA3'];
  tieng([[200, 0, .5, 900], [1200, .5, .6, 400], [300, .9, .5, 1100], [1000, 1.4, .6, 300]], 'sawtooth', .05);
  for (let n = 0; n < 7; n++) setTimeout(() => {
    const b = document.createElement('div');
    b.className = 'phao';
    b.style.left = (15 + Math.random() * 70) + '%';
    b.style.top = (12 + Math.random() * 35) + '%';
    const c = bat(mau);
    b.innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="--g:${i * 360 / 14}deg;background:${c}"></i>`).join('');
    g.appendChild(b);
    setTimeout(() => b.remove(), 1300);
  }, n * 380);
}

// ── Khách "khó đỡ": chuyện riêng của người đang ở ──────────────────────────
const KHO_DO = [
  k => ({ ma: 'oKe', icon: 'nha', ten: `${k.ten} dẫn bạn về ở ké`,
    loi: '“Bạn em ở nhờ vài hôm thôi anh chị, nó mới lên thành phố…”',
    a: ['Thu thêm 300k tiền điện nước', () => { doiTien(300, '+300.000đ điện nước'); bucThem('Dạ… em đóng liền.'); }],
    b: ['Thôi, cho ở vài hôm', () => { chi(150, 'điện nước hao'); diuKhach(); noi('Anh chị tốt ghê!'); }] }),
  k => ({ ma: 'nuoiCho', icon: 'meo', ten: `${k.ten} lén nuôi chó`,
    loi: 'Nửa đêm nghe “gâu gâu” từ phòng. Hỏi thì bảo: “Em giữ giùm bạn thôi…”',
    a: ['Cho nuôi, thu phí vệ sinh 100k', () => doiTien(100, '+100.000đ phí vệ sinh')],
    b: ['Không được, gửi chỗ khác', () => bucThem('Tội bé lắm anh chị ơi…')] }),
  k => ({ ma: 'khatTien', icon: 'thu', ten: `${k.ten} xin khất tiền trọ`,
    loi: '“Anh chị ơi cho em khất một tuần, lương về em trả liền, thề luôn!”',
    a: ['Cho khất', () => { const t = Math.min(k.tien, st.tien); chi(t, 'cho khất'); st.thu = Math.max(0, st.thu - t); k.no = (k.no || 0) + t; noi('Em cảm ơn anh chị nhiều lắm!'); }],
    b: ['Đòi luôn, không khất', () => bucThem('Dạ… để em đi mượn.')] }),
  k => ({ ma: 'muonTien', icon: 'tien', ten: `${k.ten} hỏi mượn tiền`,
    loi: '“Anh chị cho em mượn 500k, cuối tháng em trả đủ ạ.”',
    a: ['Cho mượn 500k', () => { const t = Math.min(500, st.tien); chi(t, 'cho mượn'); k.no = (k.no || 0) + t; noi('Em hứa trả đúng hẹn!'); }],
    b: ['Từ chối khéo', () => bucThem('Dạ… vậy thôi.')] }),
  k => ({ ma: 'sinhNhatKhach', icon: 'banh', ten: `${k.ten} làm tiệc sinh nhật`,
    loi: 'Cả chục người kéo tới, hát hò tới 1 giờ sáng. Phòng bên cạnh gõ cửa than phiền.',
    a: ['Nhắc nhở nhẹ nhàng', () => loa('Tiệc tan, khách xin lỗi cả dãy')],
    b: ['Kệ, tuổi trẻ mà', () => { st.phong.forEach(p => { if (p.khach?.o && p.khach !== k) p.khach.buc = (p.khach.buc || 0) + 1; }); loa('Các phòng khác bực mình…'); }] }),
];
function khoDo() {
  const ds = st.phong.map((p, i) => p.khach?.o ? i : -1).filter(i => i >= 0);
  if (!ds.length) { tiepHang(); return; }
  chuyenPhong(bat(ds), true);
  taiHoa(bat(KHO_DO)(st.khach));
}

// ── Trang trí phòng ────────────────────────────────────────────────────────
function moTrangTri() {
  const p = st.phong[st.o], son = (p.son ?? st.o) % MAU_TUONG.length;
  const nut = (l, i, ten, mau, gia, dang) => {
    const x = ({ treo: TREO, den: DEN })[l]?.[i], khoa = (x?.goi && !coGoi(x.goi)) || (x?.qua && !st.quaTrangTri?.includes(x.qua));
    return `<button class="tt ${dang ? 'dang' : ''}" data-l="${l}" data-i="${i}" style="--m:${mau}">${khoa ? bieuTuong('khoa') : ''}${ten}${khoa ? ' · ' + (x.qua ? x.qua === 'linh' ? 'quà của Linh' : x.qua === 'ba' ? 'quà giữ dãy trọ' : 'quà việc hôm nay' : GOI_INFO[x.goi]?.ten || 'gói') : gia && !dang ? ' · ' + gon(gia) : ''}</button>`;
  };
  $('#ttTen').textContent = `Trang trí ${st.o < 6 ? 'phòng ' + (st.o + 1) : tenP(st.o).toLowerCase()}`;
  $('#ttNoi').innerHTML =
    `<div class="tt-nhom"><b>Sơn tường</b><div class="tt-chon">${MAU_TUONG.map((m, i) => nut('son', i, TEN_SON[i], m[0], GIA_SON, son === i)).join('')}</div></div>`
    + `<div class="tt-nhom"><b>Lát sàn</b><div class="tt-chon">${SAN.map((x, i) => nut('san', i, x.ten + (x.thue ? ` (phòng +${x.thue}k)` : ''), x.mau, x.gia, (p.san || 0) === i)).join('')}</div></div>`
    + `<div class="tt-nhom"><b>Rèm cửa sổ</b><div class="tt-chon">${REM.map((x, i) => nut('rem', i, x.ten, x.mau || '#FFFDF8', x.gia, (p.rem || 0) === i)).join('')}</div></div>`
    + `<div class="tt-nhom"><b>Treo tường</b><div class="tt-chon">${TREO.map((x, i) => nut('treo', i, x.ten + (x.thue ? ` (+${x.thue}k)` : ''), '#FFFDF8', x.gia, (p.treo || 0) === i)).join('')}</div></div>`
    + (!p.loai && !(p.rong > 5) ? `<div class="tt-nhom"><b>Nới rộng phòng</b><div class="tt-chon">${nut('rong', 6, 'Đập tường nới ra 6×6 (phòng +300k)', KEM, NOI_RONG, false)}</div></div>` : '')
    + `<div class="tt-nhom"><b>Đèn trang trí</b><div class="tt-chon">${DEN.map((x, i) => nut('den', i, x.ten + (x.thue ? ` (+${x.thue}k)` : ''), i ? VANG_MAI : '#FFFDF8', x.gia, (p.den || 0) === i)).join('')}</div></div>`;
  if (!$('#manTT').classList.contains('hien')) ghi('mo_bang', { bang: 'trang_tri' });
  $('#manTT').classList.add('hien');
}
$('#ttNoi').addEventListener('click', e => {
  const b = e.target.closest('.tt');
  if (!b) return;
  const p = st.phong[st.o], l = b.dataset.l, i = +b.dataset.i;
  const qua = ({ treo: TREO, den: DEN })[l]?.[i]?.qua;
  if (qua && !st.quaTrangTri?.includes(qua)) { loa('Món quà này chưa nhận được'); return; }
  const goi = ({ treo: TREO, den: DEN })[l]?.[i]?.goi;
  if (goi && !coGoi(goi)) { $('#manTT').classList.remove('hien'); moCuaHang(); return; }
  if ((l === 'son' ? (p.son ?? st.o) % MAU_TUONG.length : (p[l] || 0)) === i) return;
  const gia = l === 'son' ? GIA_SON : l === 'rong' ? NOI_RONG : ({ san: SAN, rem: REM, treo: TREO, den: DEN })[l][i].gia;
  if (gia && gia > st.tien) { loa(`Còn thiếu ${dong(gia - st.tien)}`); return; }
  p[l] = i;
  if (gia) doiTien(-gia, `−${dong(gia)} trang trí`);
  viec('trangTri');
  cop(); veHet(); moTrangTri();
});
$('#ttXong').addEventListener('click', () => { $('#manTT').classList.remove('hien'); tiepHang(); });

// ── Sổ khách: sưu tầm đủ các kiểu người thuê ────────────────────────────────
function moSoKhach() {
  viec('docSo');
  const ds = Object.keys(KIEU), co = st.gap || {};
  $('#skTen').textContent = `Sổ khách · ${Object.keys(co).length}/${ds.length} kiểu`;
  $('#skNoi').innerHTML = ds.map(kieu => {
    const K = KIEU[kieu], gap = co[kieu];
    const hinh = veKhach({ kieu, dang: K.nguoi[0][1] }, !!gap);
    return `<div class="sk ${gap ? '' : 'chua'}"><svg viewBox="-40 -128 80 132">${hinh}</svg>`
      + `<b>${gap ? K.ten : '???'}</b><span>${gap ? `đã ở ${gap} lần` : 'chưa gặp'}</span></div>`;
  }).join('');
  if (!$('#manSK').classList.contains('hien')) ghi('mo_bang', { bang: 'so_khach' });
  $('#manSK').classList.add('hien');
}
$('#nutSo').addEventListener('click', moSoKhach);
$('#skXong').addEventListener('click', () => { $('#manSK').classList.remove('hien'); tiepHang(); });

// ── Lá thư và hộp thư ──────────────────────────────────────────────────────
let laLinhDang = 0;
const THU_LINH = [null,
  'Anh chị ơi, em là Linh, học kỳ này thi nhiều quá trời. Em xin góc phòng yên yên để ôn bài nha. Có nước uống với chỗ ngồi học là em mừng rồi!\n— Linh',
  'Anh chị ơi, phòng bên mở nhạc khuya, em đọc một trang mà quên hết trơn… Mình có cách nào đỡ ồn không ạ?\n— Linh',
  'Em thi đậu rồi anh chị ơi! Bữa được ngủ yên, em ôn bài vô hẳn. Em gửi anh chị tấm bằng khen này, treo trong phòng cho vui nha. Cảm ơn anh chị nhiều thiệt nhiều!\n— Linh',
];
function thuLinh(doan) {
  const c = st.chuyenLinh;
  c.doan = doan; c.choDoc = doan;
  st.la = [...(st.la || []), THU_LINH[doan]];
  if (doan === 3 && !st.quaTrangTri.includes('linh')) st.quaTrangTri.push('linh');
  ghi('chuyen_khach', { ten: 'linh', doan });
  luu(); veThanhTren();
  xepHang(moChuyenLinh);
}
function kiemChuyenLinh() {
  const c = st.chuyenLinh;
  if (!c || c.choDoc) return;
  if (c.doan === 1 && st.thang >= c.batDau + 2) thuLinh(2);
  else if (c.doan === 2 && c.chon && st.thang >= c.chonLuc + 2) thuLinh(3);
}
function moChuyenLinh() {
  const c = st.chuyenLinh;
  if (!c?.choDoc) { tiepHang(); return; }
  if (c.choDoc === 2) {
    const xong = chon => {
      const p = st.phong[c.phong];
      if (chon === 'rem') { doiTien(-REM[REM_YEN].gia, 'Rèm cách âm cho Linh'); p.rem = REM_YEN; }
      p.yenTinh = chon; c.chon = chon; c.chonLuc = st.thang; c.choDoc = null;
      if (p.khach?.chuyen === 'linh') { p.khach.buc = 0; p.khach.con = Math.max(p.khach.con, 3); }
      c.ketQua = chon === 'rem' ? 'Rèm dày chặn bớt tiếng ồn, Linh ngủ ngon hơn rồi.' : 'Phòng bên đồng ý nhỏ tiếng sau 22 giờ. Linh yên tâm ôn bài.';
      st.la.push('Anh chị ơi, ' + c.ketQua + '\n— Linh');
      chuyenPhong(c.phong, true); loa(c.ketQua);
    };
    taiHoa({ ma: 'linhTiengOn', icon: 'thu', ten: 'Thư của Linh · 2/3', loi: THU_LINH[2],
      a: ['Mua rèm cách âm · 250k', () => xong('rem'), REM[REM_YEN].gia],
      b: ['Nói chuyện với phòng bên', () => xong('noiChuyen')] });
    return;
  }
  moLa(THU_LINH[c.choDoc]); laLinhDang = c.choDoc;
  $('#laTen').textContent = `Thư của Linh · ${c.choDoc}/3`;
  if (c.choDoc === 3) $('#laChu').textContent += '\n\n Đã nhận Bằng khen của Linh. Vào Trang trí → Treo tường để bày trong phòng.';
}
function viLa(k, p = st.phong[st.o]) {
  const [chuyen, xung] = LA[k.kieu] || KIEU[k.kieu].la || ['Em chuyển đi rồi, cảm ơn anh chị thời gian qua.', 'Em'];
  const mon = tron(p.dat).slice(0, 2).map(v => DO[v.k].ten.toLowerCase());
  const nho = mon.length ? mon.join(' với ') : 'căn phòng nhỏ';
  return `Gửi anh chị chủ trọ,\n${chuyen}\n${xung} sẽ nhớ ${nho} lắm.\nCảm ơn anh chị nhiều!\n— ${k.ten}, tháng ${thangSo(st.thang)}`;
}
function moLa(la) {
  laLinhDang = 0;
  $('#laTen').textContent = 'Lá thư dưới cửa';
  $('#laChu').textContent = la;
  $('#manLa').classList.add('hien');
  tieng([[784, 0, .3], [988, .15, .4]], 'sine', .15);
}
$('#nutHop').addEventListener('click', () => {
  if (st.chuyenLinh?.choDoc) return moChuyenLinh();
  laLinhDang = 0;
  const ds = st.la || [];
  $('#laTen').textContent = `Hộp thư · ${ds.length} lá`;
  $('#laChu').textContent = ds.length ? [...ds].reverse().join('\n\n') : 'Chưa có lá thư nào.\nKhách ở vui, lúc dọn đi sẽ để lại thư.';
  if (!$('#manLa').classList.contains('hien')) ghi('mo_bang', { bang: 'hop_thu' });
  $('#manLa').classList.add('hien');
});
$('#nutDongLa').addEventListener('click', () => {
  if (laLinhDang && st.chuyenLinh?.choDoc === laLinhDang) { st.chuyenLinh.choDoc = null; luu(); veThanhTren(); }
  laLinhDang = 0;
  $('#manLa').classList.remove('hien');
  tiepHang();
});

// ── Hẹn ngày mai: ngày lịch trên máy, tách khỏi tháng trong ván ───────────
const HEN_MAI = [
  { ma: 'khach', icon: 'bacSi', loi: 'Bác sĩ An ghé hỏi phòng. Dọn một phòng trọ trống để đón nha!', den: 'Bác sĩ An đã ghé! Lượt khách kế tiếp ở phòng trọ trống, sạch sẽ là bác sĩ An.' },
  { ma: 'ruong', icon: 'qua', loi: 'Linh hẹn rương gấp đôi tiền, làm đủ ba việc ngày mai nhé!', den: 'Linh đã gửi quà: rương việc hôm nay có gấp đôi tiền thưởng.' },
  { ma: 'rac', icon: 'tay', loi: 'Cô Năm thưởng thêm 20.000đ mỗi bãi rác, tối đa 5 bãi.', den: 'Cô Năm nhờ dọn xóm: 5 bãi rác đầu tiên hôm nay được thêm 20.000đ/bãi.' },
  { ma: 'sua', icon: 'sua', loi: 'Chú Sáu sửa giúp một sự cố miễn phí trong ngày.', den: 'Chú Sáu tới rồi: sự cố đầu tiên bạn bấm sửa hôm nay được miễn phí.' },
  { ma: 'lau', icon: 'trangTri', loi: 'Linh thưởng thêm 100.000đ khi bạn lau cửa sổ một lần.', den: 'Linh giữ lời: lau cửa sổ trong Việc hôm nay để nhận thêm 100.000đ, một lần thôi nha.' },
  { ma: 'qua', icon: 'trangTri', loi: 'Cô Năm tặng món treo tường còn thiếu; đủ bộ thì nhận 100.000đ.', den: 'Cô Năm mang quà treo tường tới rồi!' },
];
function ngayLech(n, tu = new Date()) { const d = new Date(tu); d.setDate(d.getDate() + n); return d.toDateString(); }
// Hạt lấy từ chuỗi ngày địa phương; không dùng Math.random của luật chơi.
function hatNgay(ngay) { const d = new Date(ngay); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
function tronTheoHat(ds, hat) {
  const k = ds.slice(); let n = (hat ^ 0x9e3779b9) >>> 0;
  for (let i = k.length - 1; i > 0; i--) {
    n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
    const j = (n >>> 0) % (i + 1); [k[i], k[j]] = [k[j], k[i]];
  }
  return k;
}
// Mỗi tuần đủ sáu loại và một loại lặp; xét cả đuôi tuần trước để mọi
// cửa sổ bảy ngày đều có tối đa hai lần/loại, không trùng hai ngày kề nhau.
const henTuan = new Map(); let henTuanCuoi = -1, henDuoi = [];
function henTheoNgay(ngay) {
  const hat = hatNgay(ngay), tuan = Math.floor(hat / 7), thu = ((hat % 7) + 7) % 7;
  if (tuan < 0) return HEN_MAI[((hat % 6) + 6) % 6];
  while (henTuanCuoi < tuan) {
    const soTuan = ++henTuanCuoi, ds = [], uuTien = Array.from({length:7}, (_, i) => tronTheoHat([0,1,2,3,4,5], soTuan * 31 + i));
    const chon = () => {
      if (ds.length === 7) return new Set(ds).size === 6;
      for (const n of uuTien[ds.length]) {
        const duoi = [...henDuoi, ...ds].slice(-6);
        if (duoi.at(-1) === n || duoi.filter(x => x === n).length >= 2) continue;
        ds.push(n);
        if (6 - new Set(ds).size <= 7 - ds.length && chon()) return true;
        ds.pop();
      }
      return false;
    };
    chon(); henTuan.set(soTuan, ds); henDuoi = ds.slice(-6);
  }
  return HEN_MAI[henTuan.get(tuan)[thu]];
}
const KHACH_HEN = ['bacSi', 'anhTay', 'caSi', 'tiepVien', 'streamer'];
function kieuKhachHen(ngay) { return tronTheoHat(KHACH_HEN, hatNgay(ngay))[0]; }
function mauHen(h) {
  const mau = HEN_MAI.find(x => x.ma === h.loai);
  if (h.loai !== 'khach') return mau;
  // Hẹn bản cũ chưa có kiểu khách luôn là bác sĩ An: giữ nguyên lời đã hứa.
  const kieu = KHACH_HEN.includes(h.kieuKhach) ? h.kieuKhach : 'bacSi', ten = KIEU[kieu].nguoi[0][0];
  return {...mau, icon:kieu === 'bacSi' ? 'bacSi' : 'nha', tenKhach:ten, loi:`${ten} ghé hỏi phòng. Dọn một phòng trọ trống để đón nha!`,
    den:`${ten} đã ghé! Lượt khách kế tiếp ở phòng trọ trống, sạch sẽ là ${ten}.`};
}
function taoHenMai(ngay) {
  const loai = henTheoNgay(ngay).ma;
  return {ngay, loai, hien:false, ...(loai === 'khach' ? {kieuKhach:kieuKhachHen(ngay)} : {})};
}
let henNho = {}, henChu = null;
function docHen() {
  try {
    const chu = localStorage.getItem(KHOA_HEN);
    if (chu !== henChu) {
      const v = JSON.parse(chu);
      henNho = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
      henChu = chu;
    }
  } catch { /* giữ bản trong bộ nhớ nếu máy chặn lưu */ }
  return henNho;
}
function ghiHen(v) {
  henNho = v; henChu = JSON.stringify(v);
  try { localStorage.setItem(KHOA_HEN, henChu); } catch { /* không ngăn người chơi */ }
}
function henHomNay() { const h = docHen().hom; return h?.ngay === new Date().toDateString() ? h : null; }
function henKhachHiem(h, kieu = h.kieuKhach || 'bacSi') {
  h.kieuKhach = KHACH_HEN.includes(kieu) ? kieu : 'bacSi';
  h.khach = true;
  // Thêm đúng một lượt, kể cả đã hết lượt; không đuổi người đang ở hay tự dọn phòng.
  const p = st.phong.slice(0, 6).find(p => p.mo && !p.khach);
  if (p) p.luot = Math.max(1, p.luot);
}
function donHenNgay() {
  const v = docHen(), hom = new Date().toDateString();
  if (v.hom?.ngay !== hom) {
    const cu = v.mai;
    let tienQua = 0;
    v.hom = { ngay: hom, loai: null, dung: {}, khach: false, choDoc: false };
    if (cu?.ngay === hom && cu.hien && HEN_MAI.some(h => h.ma === cu.loai)) {
      const h = v.hom;
      if (cu.loai === 'khach') h.kieuKhach = KHACH_HEN.includes(cu.kieuKhach) ? cu.kieuKhach : 'bacSi';
      const mau = mauHen(cu);
      h.loai = mau.ma; h.choDoc = true; h.loi = mau.den;
      if (h.loai === 'khach') henKhachHiem(h);
      if (h.loai === 'qua') {
        const qua = QUA_NGAY_TREO.find(i => !st.quaTrangTri.includes(TREO[i].qua));
        if (qua != null) { st.quaTrangTri.push(TREO[qua].qua); h.loi += ` Bạn nhận được ${TREO[qua].ten}, chọn treo trong Trang trí nhé.`; }
        else { tienQua = 100; h.loi += ' Bạn đã đủ bộ, cô gửi 100.000đ thay quà nha.'; }
      }
      ghi('hen_mai_den', { loai: h.loai });
    }
    // Không giữ hẹn quá hạn; mỗi ngày chỉ có một hẹn cho ngày kế tiếp.
    v.mai = taoHenMai(ngayLech(1));
    ghiHen(v);
    if (tienQua) doiTien(tienQua, '+100.000đ quà cô Năm'); else luu();
  }
  return v.hom.choDoc ? { ...v.hom } : null;
}
function hienHenMai() {
  const v = docHen(), ngay = ngayLech(1);
  if (v.mai?.ngay !== ngay) { v.mai = taoHenMai(ngay); }
  const mau = mauHen(v.mai) || henTheoNgay(ngay);
  if (!v.mai.hien) { v.mai.hien = true; ghiHen(v); ghi('hen_mai_hien', { loai: mau.ma }); }
  return `Ngày mai: ${mau.loi}`;
}
function moTheHen(hen, qua7 = false) {
  if (hen && (!henHomNay()?.choDoc || hen.ngay !== new Date().toDateString())) { tiepHang(); return; }
  // Tạo lời hẹn trước khi đọc mẫu để thẻ ngày mai dùng đúng khách đã lưu.
  const loiMai = !hen && !qua7 ? hienHenMai() : null;
  const mau = mauHen(qua7 ? {loai:'khach',kieuKhach:henHomNay()?.kieuKhach} : hen || docHen().mai);
  $('#nhoIcon').innerHTML = bieuTuong(mau.icon);
  $('#nhoTen').textContent = qua7 ? 'Khách ghé mừng ngày 7' : hen ? 'Như đã hẹn hôm qua' : 'Ngày mai ở dãy trọ';
  const kieu = (qua7 ? henHomNay()?.kieuKhach : hen?.kieuKhach) || 'bacSi', [ten, dang] = KIEU[kieu].nguoi[0];
  $('#nhoLoi').textContent = qua7 ? `${ten} ghé mừng bạn đủ 7 ngày! Khi có phòng trọ trống, dọn sạch để ${ten} hỏi thuê nhé.` : hen ? hen.loi : loiMai;
  $('#nhoAnh').hidden = mau.ma !== 'khach' || (!hen && !qua7);
  $('#nhoAnh').innerHTML = $('#nhoAnh').hidden ? '' : `<svg viewBox="-55 -130 110 136">${veKhach({ kieu, ten, dang }, true)}</svg>`;
  $('#nhoQC').hidden = true;
  $('#nhoNut').textContent = 'Đóng';
  $('#nhoNut').onclick = () => {
    if (hen && henHomNay()?.ngay === hen.ngay) { henHomNay().choDoc = false; ghiHen(docHen()); }
    $('#manNho').classList.remove('hien'); tiepHang();
  };
  $('#manNho').classList.add('hien');
}
function thuongHen(loai, tien, tran = 1) {
  const h = henHomNay();
  if (h?.loai !== loai || (h.dung[loai] || 0) >= tran) return;
  h.dung[loai] = (h.dung[loai] || 0) + 1; ghiHen(docHen());
  doiTien(tien, `+${dong(tien)} như đã hẹn`);
}

// ── Quà mỗi ngày: vào game ngày liên tiếp thì quà to dần ───────────────────
let quaDaNhan = null;
function quaNgay() {
  donHenNgay();
  let v = {};
  try { v = JSON.parse(localStorage.getItem(KHOA_NGAY)) || {}; } catch { /* máy chặn lưu thì thôi */ }
  const hom = new Date().toDateString(), qua = ngayLech(-1);
  if (v.ngay === hom || quaDaNhan === hom) return tiepHang();
  const chuoi = v.ngay === qua ? (v.chuoi || 0) + 1 : 1;
  const tien = n => 200 + 100 * Math.min(n - 1, 5);
  $('#quaChuoi').innerHTML = [1, 2, 3, 4, 5, 6, 7].map(i => `<span class="${i < chuoi ? 'co' : ''} ${i === Math.min(chuoi, 7) ? 'hom-nay' : ''}" aria-label="Ngày ${i}${i === 3 ? ': quà trang trí' : i === 7 ? ': khách hiếm' : ': tiền'}${i < chuoi ? ', đã nhận' : ''}"><b>${i < chuoi ? '✓' : i === 3 ? bieuTuong('qua') : i === 7 ? bieuTuong('sao') : bieuTuong('tien')}</b><small>${i}</small></span>`).join('');
  const quaChuoi = chuoi === 3 ? QUA_CHUOI_TREO.find(i => !st.quaTrangTri.includes(TREO[i].qua)) : null;
  const khachQua7 = chuoi === 7 ? mauHen({loai:'khach', kieuKhach:henHomNay()?.khach ? henHomNay().kieuKhach || 'bacSi' : kieuKhachHen(hom)}) : null;
  $('#quaNgaySo').textContent = chuoi; $('#quaThang').textContent = 'Tháng ' + (new Date().getMonth()+1); $('#quaBoc').innerHTML = bieuTuong(chuoi === 3 || chuoi === 7 ? 'qua' : 'thu'); $('#quaBoc').classList.toggle('goi-kraft', chuoi === 3 || chuoi === 7);
  $('#quaLoi').textContent = `Ngày thứ ${chuoi} liên tiếp: ${dong(tien(chuoi))}`
    + (chuoi === 3 ? `\n ${quaChuoi != null ? TREO[quaChuoi].ten + ' · chỉ có ở quà ngày 3' : 'Bạn đã sưu tầm đủ quà trang trí ngày 3'}` : '')
    + (chuoi === 7 ? `\n${khachQua7.tenKhach} ghé hỏi phòng + huy hiệu Ngày nào cũng ghé` : '')
    + `\nMai quay lại nhận ${dong(tien(chuoi + 1))}`;
  $('#nutNhan').onclick = () => {
    if (quaDaNhan === hom) return;
    try { if (JSON.parse(localStorage.getItem(KHOA_NGAY))?.ngay === hom) return; } catch { /* dùng chốt trong bộ nhớ */ }
    if (hom !== new Date().toDateString()) { $('#manQua').classList.remove('hien'); xepHang(quaNgay); return; }
    quaDaNhan = hom;
    try { localStorage.setItem(KHOA_NGAY, JSON.stringify({ ngay: hom, chuoi })); } catch { /* như trên */ }
    $('#manQua').classList.remove('hien');
    st.ttDem.qua = Math.max(st.ttDem.qua || 0, chuoi);
    if (quaChuoi != null && !st.quaTrangTri.includes(TREO[quaChuoi].qua)) st.quaTrangTri.push(TREO[quaChuoi].qua);
    if (chuoi === 7) { const h = henHomNay(); henKhachHiem(h, h.khach ? h.kieuKhach || 'bacSi' : kieuKhachHen(hom)); ghiHen(docHen()); }
    ghi('qua_ngay', { chuoi });
    doiTien(tien(chuoi), `+${dong(tien(chuoi))} quà`); veHet();
    loa(hienHenMai(), 6000);
    if (chuoi === 7) xepHang(() => moTheHen(null, true));
    tiepHang();
  };
  $('#manQua').classList.add('hien');
}

// ── Hướng dẫn 1 phút đầu: bong bóng chỉ đường theo từng bước ────────────────
// Chạy sau chuyện mở đầu của ván mới. Bước nào tự suy ra từ trạng thái ván:
// còn rác → dọn; khách chưa ưng → kéo đồ; ưng rồi → bấm Cho thuê; thuê xong → hết tháng.
let hdXong = true, hdHen = null;
let hdRacXong = false, hdRacHen = null;
function anHuongDanRac() {
  hdRacXong = true;
  clearTimeout(hdRacHen); hdRacHen = null;
  huongDan();
}
try { hdXong = localStorage.getItem(KHOA_HD) === 'xong'; } catch { /* máy chặn lưu: coi như đã xong */ }
function xongHuongDan() {
  if (hdXong) return;
  hdXong = true;
  try { localStorage.setItem(KHOA_HD, 'xong'); } catch { /* bỏ qua */ }
  $('#hd').classList.remove('hien');
  ghi('xong_huong_dan');
}
function huongDan() {
  const b = $('#hd');
  if (hdXong || !st || st.dem || document.querySelector('.phu.hien')) { b.classList.remove('hien'); return; }
  const k = st.khach;
  let dich, chu, tay = false;
  if (!k && st.rac.length) {
    if (hdRacXong) { b.classList.remove('hien'); return; }
    dich = $('#phongKhung'); chu = ' Chạm hoặc vuốt vào rác để dọn phòng';
    if (!hdRacHen) hdRacHen = setTimeout(anHuongDanRac, 6000);
  }
  else if (k && !k.o && !ungY()) {
    dich = document.querySelector('#ke .the.can-mua') || $('#ke');
    chu = 'Kéo món có nhãn «Khách cần» thả vào phòng'; tay = !!document.querySelector('#ke .the.can-mua');
  }
  else if (ungY()) { dich = $('#nutChinh'); chu = 'Khách ưng rồi! Bấm «Cho thuê» để nhận tiền '; }
  else if (k?.o) {
    // Đã tự dọn, bày đồ và nhận tiền: không bắt chờ thêm một bước đọc.
    xongHuongDan(); return;
  }
  else { b.classList.remove('hien'); return; }
  const g = $('#game').getBoundingClientRect(), r = dich.getBoundingClientRect();
  b.querySelector('.hd-chu').textContent = chu;
  b.classList.add('hien');
  // Hướng dẫn dọn rác nằm ngay trên khung phòng, chừa mũi chỉ xuống.
  const donRac = dich.id === 'phongKhung';
  const phongThap = donRac && r.height < 220;
  b.style.fontSize = phongThap ? '13px' : '';
  const w = Math.min(phongThap ? 240 : 300, g.width - 24);
  b.style.width = w + 'px';
  const x = Math.max(12, Math.min(g.width - w - 12, r.left - g.left + r.width / 2 - w / 2));
  const y = r.top - g.top - b.offsetHeight - 14;
  b.style.left = x + 'px'; b.style.top = Math.max(8, y) + 'px';
  b.style.setProperty('--mui', (r.left - g.left + r.width / 2 - x) + 'px');
  b.classList.add('duoi');
  const t = $('#hdTay');
  t.hidden = !tay;
  if (tay) {
    const p = $('#phongKhung').getBoundingClientRect();
    t.style.setProperty('--x0', (r.left - g.left + r.width / 2) + 'px'); t.style.setProperty('--y0', (r.top - g.top + r.height / 2) + 'px');
    t.style.setProperty('--x1', (p.left - g.left + p.width / 2) + 'px'); t.style.setProperty('--y1', (p.top - g.top + p.height * .6) + 'px');
  }
}
addEventListener('resize', () => huongDan());
$('#ke').addEventListener('scroll', () => huongDan(), { passive: true });

// ── Khoe phòng: chụp căn phòng thành ảnh dọc có tên game, để người chơi chia sẻ ──
// Ảnh = chính hình SVG của phòng + toàn bộ CSS của trang (để nét vẽ, màu giữ nguyên),
// vẽ lên canvas 1080×1350 kèm khung chữ. Trong app gửi sang để app mở bảng chia sẻ.
async function khoePhong() {
  const p = st.phong[st.o], k = st.khach;
  const sv = $('#phong').cloneNode(true);
  const css = [...document.querySelectorAll('style')].map(x => x.textContent).join('\n');
  sv.insertAdjacentHTML('afterbegin', `<style>${css}</style>`);
  const vb = $('#phong').viewBox.baseVal, ti = vb.height / vb.width;
  sv.setAttribute('width', 1000); sv.setAttribute('height', Math.round(1000 * ti));
  const hinh = new Image();
  hinh.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(sv));
  try { await hinh.decode(); } catch { loa('Chưa chụp được, thử lại nhé'); return; }
  try { await document.fonts.ready; } catch { /* phông chưa nạp thì dùng phông máy */ }

  const W = 1080, H = 1350, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const [nen] = MAU_TUONG[(p.son ?? st.o) % MAU_TUONG.length];
  g.fillStyle = '#E4EEE6'; g.fillRect(0, 0, W, H);
  g.fillStyle = nen; g.fillRect(40, 40, W - 80, H - 80);
  g.strokeStyle = MUC; g.lineWidth = 8; g.strokeRect(40, 40, W - 80, H - 80);
  g.fillStyle = MUC; g.textAlign = 'center';
  g.font = "800 64px 'Be Vietnam Pro', sans-serif";
  g.fillText(p.loai === 'nha' ? 'Căn hộ của mình ' : laQuan(p) ? `${tenQuan(p)} của mình` : k?.o ? `Phòng của ${k.ten} ` : `Phòng ${st.o + 1} nhà mình `, W / 2, 150);
  g.font = "34px 'Pangolin', cursive";
  g.fillText(`Tháng ${thangSo(st.thang)} · Dãy trọ ${veSao(saoDay())}`, W / 2, 210);
  g.font = "600 26px 'Be Vietnam Pro', sans-serif";
  g.fillText(danhHieu(), W / 2, 240);
  const h = Math.min(900, 1000 * ti);
  g.drawImage(hinh, (W - h / ti) / 2, 250, h / ti, h);
  g.font = "800 46px 'Be Vietnam Pro', sans-serif";
  g.fillText('Dãy Trọ Của Tôi', W / 2, H - 150);
  g.font = "30px 'Pangolin', cursive";
  g.fillText('Bạn bày phòng đẹp hơn không? · Warm Jar Games', W / 2, H - 100);
  const url = c.toDataURL('image/png');
  ghi('khoe_phong');

  if (TRONG_APP) { guiApp({ loai: 'khoe', anh: url.split(',')[1] }); return; }
  try {
    const tep = new File([await (await fetch(url)).blob()], 'day-tro-cua-toi.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [tep] })) { await navigator.share({ files: [tep], title: 'Dãy Trọ Của Tôi' }); return; }
  } catch { /* người chơi huỷ chia sẻ, hoặc trình duyệt không cho: tải về */ }
  const a = document.createElement('a');
  a.href = url; a.download = 'day-tro-cua-toi.png'; a.click();
  loa('Đã lưu ảnh phòng ');
}

// ── Mặt bằng: thuê chỗ của người khác để mở tiệm, hoặc cho thuê lại làm trọ ─
function moMatBang() {
  const p = st.phong[MB];
  if (p.mo) { chuyenPhong(MB, true); return; }
  if (soMo() < 2) { loa('Mở thêm phòng 2 rồi mới thuê được mặt bằng'); return; }
  const von = loai => COC_MB + THUE_MB + (loai === 'traSua' ? DIEN_TRA : 0)
    + (loai === 'tiem' ? DO.loNuong.gia + DO.tuKinh.gia : loai === 'traSua' ? DO.quayPha.gia + DO.tuTopping.gia : 800);
  const thue = (loai, daHoi = false) => {
    if (p.mo) return;
    if (st.tien < von(loai)) { loa(`Để dành ${dong(von(loai))} gồm cọc, đồ chính và chi phí tháng đầu`); return; }
    if (!daHoi) {
      const phiThang = THUE_MB + (loai === 'traSua' ? DIEN_TRA : 0);
      taiHoa({ma:'xemPhiMatBang',icon:'so',ten:'Đọc kỹ trước khi nhận mặt bằng',
        loi:`Trừ cọc ${dong(COC_MB)}, bạn còn ${dong(st.tien-COC_MB)}.\nMỗi tháng phải trả ${dong(phiThang)}, kể cả chưa ${loai?'bán được hàng':'có khách thuê'}. Hai tháng chưa có thu sẽ tốn ${dong(phiThang*2)} nữa.\n${loai?'Quán cần đủ cặp đồ chính mới có doanh thu.':'Mặt bằng chưa có người ở. Bạn cần dọn phòng, mua đủ đồ và tìm khách.'}\nĐây là tiền thuê cố định, không phải giá mua mặt bằng.`,
        a:['Giữ tiền, chưa thuê',()=>{}],b:['Tôi vẫn thuê',()=>thue(loai,true)]});
      return;
    }
    p.mo = true;
    if (loai) Object.assign(p, { loai, san: 1, rem: 2, ...(loai === 'traSua' ? { son: 1 } : {}) }); else { p.luot = luotThang(); p.rac = taoRac(4, p); }
    doiTien(-COC_MB, `−${dong(COC_MB)} tiền cọc`);
    ghi('mo_mat_bang', { loai: loai || 'tro' });
    if (loai === 'traSua') ghi('tra_sua');
    chuyenPhong(MB, true);
    tieng([[523, 0, .2], [659, .12, .2], [784, .24, .2], [1047, .36, .5]], 'triangle', .2);
    loa(loai === 'traSua' ? 'Kéo quầy pha chế + tủ topping vào là bắt đầu bán!' : loai ? 'Kéo lò nướng + tủ kính vào là bắt đầu bán!' : 'Dọn dẹp rồi đón khách như phòng trọ');
  };
  taiHoa({
    ma: 'moMatBang', icon: 'cuaHang', ten: 'Thuê mặt bằng',
    loi: `Mặt bằng mặt tiền, rộng 6×6.\nCọc ${dong(COC_MB)}, thuê ${dong(THUE_MB)}/tháng.\nĐể dành cả tiền mua đồ chính và một tháng vận hành rồi hãy mở nha. Chỉ trừ tiền cọc lúc mở.\nBánh cần ${dong(von('tiem'))}; trà sữa cần ${dong(von('traSua'))}; cho thuê lại cần ${dong(von(null))}.\nChọn một lần, chưa đổi loại quán được.`,
    a: [' Mở tiệm bánh', () => thue('tiem'), von('tiem')],
    c: [' Cho thuê lại làm trọ', () => thue(null), von(null)],
    d: [' Mở quán trà sữa', () => thue('traSua'), von('traSua')],
    b: ['Để sau', () => {}],
  });
}
// Phải có đủ cặp đồ chính của quán; trang trí thêm khách; nhân viên bán gấp 1,6.
function doanhThu(p, chac) {
  const co = x => p.dat.some(v => v.k === x);
  const can = p.loai === 'traSua' ? ['quayPha', 'tuTopping'] : ['loNuong', 'tuKinh'];
  if (!can.every(co)) return 0;
  const trangTri = SAN[p.san || 0].thue + REM[p.rem || 0].thue + TREO[p.treo || 0].thue + DEN[p.den || 0].thue;
  const goc = p.dat.reduce((s, v) => s + (DO[v.k].ban || DO[v.k].thue / 2), 0) + trangTri / 2;
  return Math.round(goc * (p.nv ? 1.6 : 1) * cauHinh('he_so_doanh_thu', 1) * (chac ? 1 : .85 + Math.random() * .3) / 10) * 10;
}
const laiTiem = (p, chac) => doanhThu(p, chac) - THUE_MB - (p.loai === 'traSua' ? DIEN_TRA : 0) - (p.nv ? LUONG_NV : 0);
function ketMatBang() {
  const p = st.phong[MB];
  if (!p.mo) return null;
  if (!laQuan(p)) return { tien: -THUE_MB, chu: `−${dong(THUE_MB)} thuê mặt bằng` };
  let lai = laiTiem(p);
  if (doanhThu(p, true) && Math.random() < .3) {
    const [them, cau] = bat(p.loai === 'traSua' ? [[500, 'Có đơn trà sữa văn phòng +500k'], [-300, 'Trân châu nấu hỏng −300k'], [400, 'Reviewer ghé quán, khách kéo tới +400k']] : [[500, 'Có đơn bánh sinh nhật +500k'], [-300, 'Mẻ bánh bị cháy −300k'], [400, 'Reviewer ghé quán, khách kéo tới +400k']]);
    lai += them;
    setTimeout(() => loa(`${tenQuan(p)}: ${cau}`), 4200);
  }
  if (p.loai === 'tiem') ghi('tiem_banh', { lai });
  return { tien: lai, chu: `${lai >= 0 ? '+' : '−'}${dong(Math.abs(lai))} ${tenQuan(p)}` };
}
function doiNhanVien() {
  const p = st.phong[MB];
  if (!p.mo || !laQuan(p)) return;
  p.nv = !p.nv;
  loa(p.nv ? 'Đã thuê nhân viên · bán gấp 1,6' : 'Nhân viên nghỉ rồi');
  cop(); veHet();
}

// Tường tiệm: ốp gỗ chân tường + đèn thả trần (vẽ trong mặt phẳng tường, u dọc tường).
const TAP_DE = `<path class="n" fill="#FFFDF8" d="M-11,-74 L11,-74 L13,-38 L-13,-38 Z"/><path class="m" d="M-6,-60 L6,-60"/>`
  + `<path class="n" fill="#FFFDF8" d="M-15,-111 Q-20,-128 -7,-127 Q0,-138 7,-127 Q20,-128 15,-111 Z"/>`;
const tuongTiem = den => `<rect x="0" y="-72" width="${NT}" height="72" fill="${OAK}" opacity=".45"/><path class="m" d="M0,-72 L${NT},-72"/>`
  + den.map(u => `<path class="m" d="M${u},-300 L${u},-258"/><circle cx="${u}" cy="-244" r="20" fill="${VANG_MAI}" opacity=".28"/>`
    + `<path class="n" fill="${DAT}" d="M${u - 16},-258 L${u + 16},-258 L${u + 10},-242 L${u - 10},-242 Z"/>`).join('');
const menuTiem = () => `<rect class="n" x="372" y="-250" width="150" height="112" rx="6" fill="#33403A"/>`
  + `<text x="447" y="-224" text-anchor="middle" font-size="18" font-weight="800" fill="#FFFDF8" font-family="Be Vietnam Pro, sans-serif">MENU</text>`
  + ['Bánh kem · 35k', 'Su kem · 10k', 'Cà phê · 20k'].map((t, i) => `<text x="447" y="${-200 + i * 20}" text-anchor="middle" font-size="12" font-weight="600" fill="#FFFDF8" font-family="Be Vietnam Pro, sans-serif">${t}</text>`).join('');
const tuongTra = () => `<rect x="0" y="-76" width="${NT}" height="76" fill="${XANH}" opacity=".35"/><path class="m" d="M0,-76 L${NT},-76"/>`
  + [70, 470, 620].filter(x => x < NT).map(x => `<circle class="n" cx="${x}" cy="-42" r="12" fill="${KEM}"/><circle cx="${x + 18}" cy="-26" r="6" fill="${DAT}"/>`).join('');
const menuTra = () => `<rect class="n" x="360" y="-254" width="270" height="112" rx="6" fill="${XANH}"/>`
  + `<text x="495" y="-228" text-anchor="middle" font-size="18" font-weight="800" fill="${KEM}" font-family="Be Vietnam Pro, sans-serif">MENU</text>`
  + ['Trà sữa trân châu · 25k', 'Trà đào · 20k', 'Sữa tươi đường đen · 30k'].map((t, i) => `<text x="495" y="${-202 + i * 20}" text-anchor="middle" font-size="14" font-weight="600" fill="${KEM}" font-family="Be Vietnam Pro, sans-serif">${t}</text>`).join('');

// ── Căn hộ riêng: đích lớn của nghề chủ trọ ─────────────────────────────────
const amCung = p => p.dat.reduce((s, v) => s + DO[v.k].thue, 0) + SAN[p.san || 0].thue + REM[p.rem || 0].thue + TREO[p.treo || 0].thue + DEN[p.den || 0].thue;
function muaNha() {
  if (st.tien < GIA_NHA) { loa(`Để dành đủ ${dong(GIA_NHA)} là mua được căn hộ riêng!`); return; }
  taiHoa({
    ma: 'muaNha', icon: 'nha', ten: 'Mua căn hộ riêng',
    loi: `Một căn hộ nhỏ 6×6 của riêng bạn, giá ${dong(GIA_NHA)}.\nKhông cho ai thuê — chỉ để bạn bày biện, nghỉ ngơi.`,
    a: ['Mua luôn!', () => {
      const p = st.phong[NHA], truoc = saoDay();
      p.mo = true;
      doiTien(-GIA_NHA, `−${dong(GIA_NHA)} căn hộ`);
      st.uyTin = (st.uyTin || 0) + 3;
      ghi('mua_nha');
      chuyenPhong(NHA, true);
      phaoHoa(); setTimeout(phaoHoa, 900);
      loa('Căn hộ đầu tiên của bạn! Bày biện thôi ');
      if (saoDay() > truoc) xepHang(() => lenSao(saoDay()));
    }],
    b: ['Để dành thêm', () => {}],
  });
}

// ── Cửa hàng: gói mua một lần, dùng mãi (chỉ mua được trong app) ─────────────
const GOI_INFO = {
  goi_tet: { ten: ' Gói Tết', mo: 'Chậu mai vàng, bánh chưng bày được quanh năm · câu đối đỏ · đèn lồng đỏ', gia: '25.000đ' },
  goi_noel: { ten: ' Gói Noel Xóm Trọ', mo: 'Mở khóa cây thông mini · hộp quà đặt trên sàn, bàn hoặc kệ · đèn dây Noel · vòng nguyệt quế Noel, dùng quanh năm', gia: '25.000đ' },
  khong_quang_cao: { ten: ' Gói không quảng cáo', mo: 'Bấm nút  là nhận thưởng ngay, khỏi xem quảng cáo', gia: '49.000đ' },
  meo_cung: { ten: ' Mèo cưng', mo: 'Một bé mèo cam đi lại, nằm ngủ trong mọi phòng · chạm vào là «meo»', gia: '19.000đ' },
  khoi_nghiep: { ten: ' Gói khởi nghiệp', mo: '+5.000.000đ cho mỗi ván mới · biển neon «Dãy Trọ» độc quyền', gia: '15.000đ' },
};
// Gói khởi nghiệp: mỗi ván nhận 5 triệu một lần.
function nhanGoi() {
  if (!st || !coGoi('khoi_nghiep') || st.knNhan) return;
  st.knNhan = true;
  doiTien(5000, '+5.000.000đ khởi nghiệp');
}
function moCuaHang() {
  $('#chNoi').innerHTML = Object.entries(GOI_INFO).map(([id, g]) => {
    const co = coGoi(id);
    return `<div class="nv ${co ? 'da' : ''}">${hinhGoi(id)}<div class="nv-chu"><b>${g.ten}</b><span>${g.mo}</span></div>`
      + (co ? '<span class="nv-dau">✓</span>' : `<button class="nut nv-nut" data-goi="${id}" ${TRONG_APP ? '' : 'disabled'}>${TRONG_APP ? GIA_GOI[id] || g.gia : 'Mua trong app'}</button>`) + '</div>';
  }).join('');
  if (!$('#manCH').classList.contains('hien')) ghi('mo_bang', { bang: 'cua_hang' });
  $('#manCH').classList.add('hien');
}
// Tem hàng lấy đúng nét đồ trong phòng, chỉ thu nhỏ hình, không tạo đồ hay rút hạt ngẫu nhiên.
function hinhGoi(id) {
  const doVat = (ve, x, y, tiLe) => `<g transform="translate(${x},${y}) scale(${tiLe})">${ve()}</g>`;
  const hinh = {
    goi_tet: () => doVat(caiMai, 22, 52, .21) + doVat(banhChung, 43, 53, .17),
    goi_noel: () => doVat(cayThongMini, 30, 54, .25),
    khong_quang_cao: () => bieuTuong('tivi').replace('<svg ', '<svg x="6" y="6" width="48" height="48" ') + '<path d="M9 52Q27 28 51 8" fill="none"/>',
    meo_cung: () => doVat(() => veMeo(false), 29, 55, 1),
    khoi_nghiep: () => doVat(TREO.find(t => t.goi === 'khoi_nghiep').ve, -74, 105, .385),
  };
  return `<svg class="tem-goi" data-hinh-goi="${id}" viewBox="0 0 60 60" fill="none" stroke="${MUC}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${hinh[id]()}</svg>`;
}
// Đang có một bảng mở thì bỏ qua bấm nút khác ở đầu màn hình (tránh hai bảng đè nhau khi bấm nhanh).
$('.hang-nut').addEventListener('click', e => { if (document.querySelector('.phu.hien')) e.stopImmediatePropagation(); }, true);
$('#nutCH').addEventListener('click', moCuaHang);
$('#chNoi').addEventListener('click', e => {
  const b = e.target.closest('[data-goi]');
  if (!b || b.disabled) return;
  ghi('bam_mua', { goi: b.dataset.goi });
  guiApp({ loai: 'mua', sp: b.dataset.goi });
  loa('Đang mở Google Play…');
});
$('#chXong').addEventListener('click', () => { $('#manCH').classList.remove('hien'); tiepHang(); });

// ── Mèo cưng (gói mua) ──────────────────────────────────────────────────────
function veMeo(ngu) {
  if (ngu) return `<path class="n" fill="${OAK}" d="M-20,-2 Q-22,-20 0,-20 Q20,-20 20,-4 Q14,4 -14,2 Z"/>`
    + `<circle class="n" cx="-15" cy="-10" r="9" fill="${OAK}"/><path class="n" fill="${OAK}" d="M-22,-14 L-22,-24 L-15,-18 Z M-11,-18 L-6,-25 L-7,-13 Z"/>`
    + `<path class="m" d="M-19,-10 Q-17,-8 -15,-10 M-12,-10 Q-10,-8 -8,-10"/><path class="n" fill="none" d="M18,-4 Q26,4 12,6"/>`
    + `<path class="m" d="M-2,-19 Q0,-14 -3,-10 M6,-18 Q8,-13 5,-9" stroke="${DAT}"/>`
    + `<text x="4" y="-30" font-size="12" font-weight="800" fill="${MUC}" font-family="Be Vietnam Pro, sans-serif">z z</text>`;
  return `<path class="n" fill="none" d="M10,-4 Q26,-6 22,-24"/>`
    + `<ellipse class="n" cx="0" cy="-12" rx="13" ry="12" fill="${OAK}"/><path class="m" d="M-4,-22 Q-1,-16 -4,-10 M4,-22 Q7,-16 4,-10" stroke="${DAT}"/>`
    + `<circle class="n" cx="-6" cy="-30" r="10" fill="${OAK}"/><path class="n" fill="${OAK}" d="M-15,-34 L-14,-45 L-7,-38 Z M-3,-38 L3,-45 L2,-33 Z"/>`
    + `<circle cx="-10" cy="-31" r="1.8" fill="${MUC}"/><circle cx="-2" cy="-31" r="1.8" fill="${MUC}"/><path class="m" d="M-8,-26 Q-6,-24 -4,-26"/>`
    + `<rect class="n" x="-9" y="-3" width="6" height="4" rx="2" fill="${OAK}"/><rect class="n" x="1" y="-3" width="6" height="4" rx="2" fill="${OAK}"/>`;
}
setInterval(() => { if (st && coGoi('meo_cung') && !keo && !document.querySelector('.phu.hien')) veLai(); }, 8000);
svg.addEventListener('pointerdown', e => {
  if (!e.target.closest('.meo')) return;
  loa('Meo~ ');
  tieng([[880, 0, .12, 660], [700, .12, .25, 520]], 'triangle', .14);
});

// ── Việc hôm nay: 3 việc nhỏ đổi mỗi ngày, làm đủ thì mở rương ──────────────
// Lưu riêng theo ngày thật (không theo ván), để mai mở game là có việc mới.
const VIEC = {
  lau:      { ten: () => 'Lau cửa sổ cho sáng phòng', so: [1, 1], thuong: 100 },
  sapXep:   { ten: () => 'Xếp lại vị trí 1 món đồ', so: [1, 1], thuong: 150 },
  docSo:    { ten: () => 'Ghé sổ khách, xem những người đã ở', so: [1, 1], thuong: 100 },
  rac:      { ten: n => `Dọn ${n} bãi rác`, so: [8, 14], thuong: 200 },
  mua:      { ten: n => `Mua ${n} món đồ`, so: [3, 5], thuong: 250 },
  thue:     { ten: n => `Cho thuê ${n} phòng`, so: [2, 3], thuong: 400 },
  macCa:    { ten: () => 'Mặc cả xong với 1 khách', so: [1, 1], thuong: 300 },
  sua:      { ten: n => `Sửa ${n} sự cố cho khách`, so: [1, 2], thuong: 300 },
  trangTri: { ten: n => `Trang trí phòng ${n} lần`, so: [1, 2], thuong: 250 },
  thang:    { ten: n => `Qua ${n} tháng`, so: [1, 2], thuong: 300 },
};
const RUONG = 1000;   // nhận đủ 3 việc: +1 triệu và +1 uy tín
function docViec(dieuChinh = true) {
  let v = null;
  try { v = JSON.parse(localStorage.getItem(KHOA_VIEC)); } catch { /* như dưới */ }
  const hom = new Date().toDateString();
  const phong = st.phong.filter(p => p.mo), rac = phong.reduce((s, p) => s + p.rac.length, 0);
  const xepDuoc = () => phong.some(p => p.dat.some(d => {
    const n = p.rong || 5;
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) {
      if (x === d.gx && y === d.gy) continue;
      const oMoi = o(d.k, x, y).map(c => c.split(',').map(Number));
      if (oMoi.every(([a, b]) => a >= 0 && b >= 0 && a < n && b < n)
        && !p.dat.some(m => m.id !== d.id && o(m.k, m.gx, m.gy).some(c => oMoi.some(t => t.join(',') === c)))
        && !p.rac.some(r => oMoi.some(c => c[0] === r.gx && c[1] === r.gy)) && !oMoi.some(c => p.giay?.join() === c.join())) return true;
    }
    return false;
  }));
  // Luôn có việc miễn phí ngay; ngày cũ giữ mọi tiến độ và thưởng đã nhận.
  const moiViec = loai => ({ loai, can: loai === 'rac' ? Math.max(1, Math.min(3, rac)) : 1, co: 0, nhan: false });
  const taoMoi = !(v?.ngay === hom && Array.isArray(v.ds));
  if (taoMoi) {
    // Hai nhóm ngày kề nhau không chung loại; xoay cặp trong nhóm để dùng
    // đủ 10 loại hiện có. Mỗi bộ có Lau hoặc Đọc sổ miễn phí ngay.
    const hat = hatNgay(hom), chan = hat % 2 === 0;
    const nhom = chan ? ['rac', 'mua', 'sua', 'thue'] : ['sapXep', 'trangTri', 'thang', 'macCa'];
    const dau = ((Math.floor(hat / 2) % nhom.length) + nhom.length) % nhom.length;
    const ds = [chan ? 'lau' : 'docSo', nhom[dau], nhom[(dau + 1) % nhom.length]];
    const truoc = v?.ngay === ngayLech(-1) && Array.isArray(v.ds) ? v.ds.map(x => x.loai) : [];
    const truoc2 = v?.ngay === ngayLech(-1) ? v.truoc || [] : [];
    v = { ngay: hom, ruong: false, truoc, truoc2, ds: ds.map(moiViec) };
  }
  const xong = () => {
    ghiViec(v);
    if (taoMoi) ghi('viec_ngay_tao', { bo: v.ds.map(x => x.loai).join('_') });
    return v;
  };
  const thay = (x, i) => {
    let ds = tronTheoHat(['lau', 'docSo', ...(rac ? ['rac'] : []), ...(xepDuoc() ? ['sapXep'] : []), 'thang'], hatNgay(hom) * 17 + i)
      .filter(l => !v.ds.some((d, j) => j !== i && d.loai === l));
    // Qua tháng chỉ là lối thoát cuối khi không còn việc miễn phí khác.
    if (ds.some(l => l !== 'thang')) ds = ds.filter(l => l !== 'thang');
    v.ds[i] = moiViec(ds.find(l => !v.truoc?.includes(l)) || ds[0]);
  };
  // Sửa cả mục tiêu 0 đã lưu trước khi xét "đã xong". Khi viec('rac') đang
  // ghi nhận bãi cuối, không thay việc hợp lệ trước khi cộng tiến độ.
  v.ds.forEach((x, i) => {
    if (x.loai === 'rac' && !x.nhan && (x.can <= 0
      || (rac === 0 && (taoMoi || dieuChinh) && x.co < x.can))) thay(x, i);
  });
  if (dieuChinh && !v.ruong && !v.ds.every(x => x.co >= x.can)) {
    v.ds.forEach((x, i) => {
      if (x.nhan || x.co >= x.can) return;
      if ((['mua', 'trangTri', 'sua'].includes(x.loai) && st.tien < (x.loai === 'mua' ? 50 : x.loai === 'sua' ? 80 : 150) * (x.can - x.co))
        || (x.loai === 'rac' && rac < x.can - x.co) || (x.loai === 'sapXep' && !xepDuoc())) thay(x, i);
    });
    if (!v.ds.some(x => x.co >= x.can || ['lau', 'docSo', 'thang'].includes(x.loai) || x.loai === 'rac' && rac >= x.can - x.co || x.loai === 'sapXep' && xepDuoc())) {
      const i = v.ds.findIndex(x => !x.nhan && x.co < x.can); if (i >= 0) thay(v.ds[i], i);
    }
  }
  if ((taoMoi || dieuChinh) && v.truoc2?.length === 3 && v.ds.every(x => !x.nhan && x.co === 0 && v.truoc2.includes(x.loai))) {
    const ds = tronTheoHat(['lau', 'docSo', ...(rac ? ['rac'] : []), ...(xepDuoc() ? ['sapXep'] : []), 'thang'], hatNgay(hom))
      .filter(l => !v.ds.some(x => x.loai === l));
    const loai = ds.find(l => l !== 'thang' && !v.truoc.includes(l)) || ds.find(l => l !== 'thang') || ds[0];
    if (loai) v.ds[2] = moiViec(loai);
  }
  return xong();
}
const ghiViec = v => { try { localStorage.setItem(KHOA_VIEC, JSON.stringify(v)); } catch { /* máy chặn lưu thì thôi */ } };
function viec(loai, n = 1) {
  const v = docViec(false);
  let xong = null;
  v.ds.forEach(x => {
    if (x.loai !== loai || x.co >= x.can) return;
    x.co = Math.min(x.can, x.co + n);
    if (x.co >= x.can) xong = x;
  });
  ghiViec(v);
  if (xong) {
    setTimeout(() => loa(` Xong việc: ${VIEC[xong.loai].ten(xong.can)} · bấm "Việc hôm nay" nhận thưởng`), 1400);
    tieng([[880, 0, .12], [1175, .1, .25]], 'triangle', .14);
    ghi('xong_viec', { loai });
  }
  veNutViec();
}
function veNutViec() {
  if (!daVaoGame) return;   // màn bìa chưa nạp ván thật, không đổi việc bằng phòng tạm
  // Vẽ chỉ đọc tiến độ; tạo việc/ghi sự kiện ở lúc vào game hoặc thao tác.
  let v = null;
  try { v = JSON.parse(localStorage.getItem(KHOA_VIEC)); } catch { /* chưa có việc */ }
  const ds = v?.ngay === new Date().toDateString() && Array.isArray(v.ds) ? v.ds : [];
  const xong = ds.filter(x => x.co >= x.can).length, choNhan = ds.some(x => x.co >= x.can && !x.nhan);
  const b = $('#nutViec');
  if ($('#phuDePhong')) b.innerHTML = bieuTuong('so') + `<span>Việc<br>${xong}/3</span>`;
  else b.textContent = ` Việc hôm nay (${xong}/3)`;
  b.setAttribute('aria-label', `Việc hôm nay (${xong}/3)`);
  b.classList.toggle('rung', choNhan || (xong === 3 && !v?.ruong));
}
function moViec() {
  const hen = donHenNgay();
  const v = docViec(), du = v.ds.every(x => x.nhan);
  $('#nvNoi').innerHTML = v.ds.map((x, i) => {
    const V = VIEC[x.loai], xong = x.co >= x.can;
    return `<div class="nv ${x.nhan ? 'da' : ''}"><div class="nv-chu"><b>${V.ten(x.can)}</b>`
      + `<div class="nv-thanh"><i style="width:${100 * x.co / x.can}%"></i></div><span>${x.co}/${x.can} · thưởng ${gon(V.thuong)}</span></div>`
      + (x.nhan ? '<span class="nv-dau">✓</span>' : x.loai === 'lau' && !xong ? '<button class="nut nv-nut" data-i="lau">Lau</button>' : `<button class="nut nv-nut" data-i="${i}" ${xong ? '' : 'disabled'}>Nhận</button>`) + '</div>';
  }).join('')
    + (henHomNay()?.loai === 'lau' && !henHomNay().dung.lau && !v.ds.some(x => x.loai === 'lau') ? '<div class="nv"><div class="nv-chu"><b>Linh nhờ lau cửa sổ</b><span>Thưởng thêm 100.000đ như đã hẹn</span></div><button class="nut nv-nut" data-i="lau">Lau</button></div>' : '')
    + `<div class="nv nv-ruong ${v.ruong ? 'da' : ''}"><div class="nv-chu"><b> Rương cuối ngày${henHomNay()?.loai === 'ruong' ? ' ×2 tiền' : ''}</b><span>Nhận đủ 3 việc: ${gon(RUONG * (henHomNay()?.loai === 'ruong' ? 2 : 1))} + 1 uy tín + món treo tường nhỏ</span></div>`
    + (v.ruong ? '<span class="nv-dau">✓</span>' : `<button class="nut nv-nut" data-i="r" ${du ? '' : 'disabled'}>Mở</button>`) + '</div>';
  const con = new Date(); con.setHours(24, 0, 0, 0);
  const phut = Math.ceil((con - Date.now()) / 6e4);
  $('#nvHen').textContent = `Việc mới sau ${Math.floor(phut / 60)} giờ ${phut % 60} phút`;
  $('#manNV').classList.add('hien');
  const henMai = hienHenMai();
  $('#nvHenMai').innerHTML = bieuTuong(mauHen(docHen().mai).icon) + henMai;
  if (hen) xepHang(() => moTheHen(hen));
}
$('#nutViec').addEventListener('click', moViec);
$('#nvNoi').addEventListener('click', e => {
  const b = e.target.closest('.nv-nut');
  if (!b || b.disabled) return;
  const v = docViec();
  if (b.dataset.i === 'lau') {
    st.phong[st.o].cuaSach = true; viec('lau'); thuongHen('lau', 100); cop(); veHet(); moViec(); return;
  }
  if (b.dataset.i === 'r') {
    if (v.ruong || !v.ds.every(x => x.nhan)) return;
    v.ruong = true; ghiViec(v);
    const saoTruoc = saoDay();
    st.uyTin = (st.uyTin || 0) + 1;
    const chuaCo = QUA_NGAY_TREO.filter(i => !st.quaTrangTri.includes(TREO[i].qua));
    const qua = chuaCo[0] ?? QUA_NGAY_TREO[new Date().getDay() % QUA_NGAY_TREO.length];
    if (!st.quaTrangTri.includes(TREO[qua].qua)) st.quaTrangTri.push(TREO[qua].qua);
    st.phong[st.o].treo = qua;
    doiTien(RUONG, `+${dong(RUONG)} rương`);
    thuongHen('ruong', RUONG);
    const henMai = hienHenMai();
    setTimeout(() => loa(` ${TREO[qua].ten} · đã treo trong phòng\n${henMai}`, 6000), 900);
    phaoHoa();
    ghi('mo_ruong');
    if (saoDay() > saoTruoc) xepHang(() => lenSao(saoDay()));
  } else {
    const x = v.ds[+b.dataset.i];
    if (!x || x.nhan || x.co < x.can) return;
    x.nhan = true; ghiViec(v);
    doiTien(VIEC[x.loai].thuong, `+${dong(VIEC[x.loai].thuong)} việc hôm nay`);
  }
  veHet(); moViec();
});
$('#nvXong').addEventListener('click', () => { $('#manNV').classList.remove('hien'); tiepHang(); });

// ── Tiền về khi vắng: khách gửi tiền điện nước trong lúc chủ trọ đi vắng ────
// Tính từ lần lưu cuối, tối đa theo cấu hình (mặc định 8 giờ), mỗi phòng có người ở theo cấu hình (mặc định 20k/giờ).
function tienVang() {
  let luc = 0;
  try { luc = +localStorage.getItem(KHOA_VANG) || 0; } catch { /* như trên */ }
  const tranGio = cauHinh('tien_vang_tran_gio', 8);
  const giaGio = cauHinh('tien_vang_gio', 20);
  const gio = Math.min(tranGio, (Date.now() - luc) / 36e5), o = dangO().length;
  if (!luc || gio < 1 || !o) return null;
  return { gio: Math.floor(gio), o, tien: Math.round(gio * o * giaGio / 10) * 10, tranGio };
}
function moVang(v) {
  const tranGio = v.tranGio || cauHinh('tien_vang_tran_gio', 8);
  $('#nhoIcon').innerHTML = bieuTuong('thu');
  $('#nhoAnh').hidden = true; $('#nhoAnh').innerHTML = '';
  $('#nhoTen').textContent = 'Trong lúc bạn vắng';
  $('#nhoLoi').textContent = `${v.gio} giờ qua, ${v.o} phòng có người ở gửi tiền điện nước:\n${dong(v.tien)}\n\n(Vắng càng lâu càng nhiều, tối đa ${tranGio} giờ)`;
  $('#nhoNut').textContent = 'Nhận tiền';
  $('#nhoNut').onclick = () => { $('#manNho').classList.remove('hien'); doiTien(v.tien, `+${dong(v.tien)} điện nước`); tiepHang(); };
  $('#nhoQC').hidden = !TRONG_APP;
  $('#nhoQC').onclick = () => xemQC('vang_x2', duoc => {
    if (!duoc) return;
    $('#manNho').classList.remove('hien'); doiTien(v.tien * 2, `+${dong(v.tien * 2)} điện nước`); tiepHang();
  });
  $('#manNho').classList.add('hien');
}

// Sổ chủ trọ sau 6 tháng.
function moSo() {
  $('#thu').textContent = `Từ tháng 10 tới Tết:\n`
    + `Tổng thu: ${dong(st.tong)}\n`
    + `Sao dãy trọ: ${veSao(saoDay())} (uy tín ${st.uyTin || 0})\n`
    + `Tháng đạt mục tiêu: ${st.sao}\n`
    + `Sổ khách: ${Object.keys(st.gap || {}).length}/${Object.keys(KIEU).length} kiểu\n`
    + `Phòng đã mở: ${soMo()}/6\n`
    + `${laQuan(st.phong[MB]) ? tenQuan(st.phong[MB]) + ': đang mở' : 'Quán: chưa có'} · Căn hộ riêng: ${st.phong[NHA]?.mo ? 'đã mua ' : 'chưa'}\n`
    + `Khách đã ở: ${st.soKhach} người\n`
    + `Bị bùng: ${st.daBung} lần\n`
    + `Còn trong túi: ${dong(st.tien)}\nCòn nợ bà: ${dong(st.vayBa?.no || 0)}`;
  $('#manThu').classList.add('hien');
}
$('#nutTiep').addEventListener('click', () => { $('#manThu').classList.remove('hien'); st.tiep = true; sangThang(); });
// ── Thành tích và danh hiệu: lưu theo ván, mỗi thưởng chỉ nhận một lần ──────
const THANH_TICH = [
  { id: 'thueDau', ten: 'Khách đầu tiên', mo: 'Cho thuê lần đầu', thuong: 100, dat: () => st.soKhach >= 1 },
  { id: 'khach10', ten: 'Khách ra khách vào', mo: 'Đón 10 khách thuê', thuong: 200, dat: () => st.soKhach >= 10 },
  { id: 'khach50', ten: 'Dãy trọ đông vui', mo: 'Đón 50 khách thuê', thuong: 500, dat: () => st.soKhach >= 50 },
  { id: 'yen3', ten: 'Thu tiền êm ru', mo: 'Thu tiền trọ 3 tháng liền không bị bùng', thuong: 300, dat: () => st.ttDem.yen >= 3 },
  { id: 'phong6', ten: 'Nguyên một dãy', mo: 'Mở đủ 6 phòng trọ', thuong: 500, dat: () => st.phong.slice(0, 6).every(p => p.mo) },
  { id: 'tiemBanh', ten: 'Thơm mùi bánh mới', mo: 'Mở tiệm bánh', thuong: 300, dat: () => st.phong[MB]?.mo && st.phong[MB].loai === 'tiem' },
  { id: 'traSua', ten: 'Ly trà sữa đầu tiên', mo: 'Mở quán trà sữa', thuong: 300, dat: () => st.phong[MB]?.mo && st.phong[MB].loai === 'traSua' },
  { id: 'canHo', ten: 'Nhà của mình', mo: 'Mua căn hộ riêng', thuong: 500, dat: () => st.phong[NHA]?.mo },
  { id: 'khach16', ten: 'Ai cũng từng ghé', mo: `Đón đủ ${Object.keys(KIEU).length} kiểu khách thuê`, thuong: 500, dat: () => Object.keys(KIEU).every(k => st.gap?.[k] > 0) },
  { id: 'sao5', ten: 'Tiếng lành đồn xa', mo: 'Dãy trọ đạt 5 sao uy tín', thuong: 500, dat: () => saoDay() >= 5 },
  { id: 'hoa3', ten: 'Chuyện gì cũng lo được', mo: 'Giải quyết 3 sự kiện bất ngờ', thuong: 200, dat: () => st.ttDem.hoa >= 3 },
  { id: 'mac5', ten: 'Giữ giá vẫn có khách', mo: 'Thắng mặc cả, giữ nguyên giá 5 lần', thuong: 300, dat: () => st.ttDem.mac >= 5 },
  { id: 'trangTri', ten: 'Phòng xinh có gu', mo: 'Sơn tường, treo rèm và đèn trong một phòng', thuong: 200, dat: () => st.phong.some(p => p.mo && p.son != null && p.rem > 0 && p.den > 0) },
  { id: 'quaTet', ten: 'Tết đầu tiên ở xóm', mo: 'Chơi hết tháng Tết', thuong: 200, dat: () => st.ttDem.tet || st.thang >= 5 },
  { id: 'quaNoel', ten: 'Noel xóm trọ', mo: 'Chơi hết tháng Noel', thuong: 150, dat: () => st.ttDem.noel || st.thang >= 3 },
  { id: 'qua7', ten: 'Ngày nào cũng ghé', mo: 'Nhận quà 7 ngày liên tiếp', thuong: 300, dat: () => st.ttDem.qua >= 7 },
  { id: 'phong2', ten: 'Có thêm hàng xóm', mo: 'Mở phòng trọ thứ hai', thuong: 150, dat: () => st.phong.slice(0, 6).filter(p => p.mo).length >= 2 },
  { id: 'thue3', ten: 'Xóm nhỏ đông người', mo: 'Có 3 phòng đang cho thuê cùng lúc', thuong: 200, dat: () => st.phong.filter(p => p.mo && !p.loai && p.khach?.o).length >= 3 },
  { id: 'laDau', ten: 'Lá thư dưới cửa', mo: 'Nhận lá thư đầu tiên từ khách', thuong: 100, dat: () => st.la?.length > 0 },
  { id: 'do10', ten: 'Khéo bày khéo sắp', mo: 'Bày 10 món đồ trong cả dãy', thuong: 200, dat: () => st.phong.reduce((so, p) => so + p.dat.length, 0) >= 10 },
  { id: 'thang12', ten: 'Một năm làm chủ trọ', mo: 'Chơi qua 12 tháng', thuong: 300, dat: () => st.thang >= 12 },
];
let hangTT = [], henTT = null;
function baoThanhTich() {
  if (!hangTT.length) { $('#ttBao').classList.remove('hien'); henTT = null; return; }
  $('#ttBao').textContent = hangTT.shift(); $('#ttBao').classList.add('hien');
  henTT = setTimeout(baoThanhTich, 2800);
}
function kiemThanhTich() {
  if (!st) return;
  if (!Array.isArray(st.tt)) st.tt = [];
  if (!st.ttDem || typeof st.ttDem !== 'object' || Array.isArray(st.ttDem)) st.ttDem = {};
  const moi = THANH_TICH.filter(t => !st.tt.includes(t.id) && t.dat());
  if (!moi.length) return;
  const capTruoc = capDanhHieu();
  moi.forEach(t => {
    st.tt.push(t.id);
    ghi('thanh_tich', { ma: t.id, so: soThanhTich() });
  });
  if (capDanhHieu() > capTruoc) ghi('danh_hieu', { cap: capDanhHieu() });
  hangTT.push(...moi.map(t => ` Mở khoá: ${t.ten} · +${gon(t.thuong)}`));
  doiTien(moi.reduce((so, t) => so + t.thuong, 0), ' Thưởng thành tích');
  if (!henTT) baoThanhTich();
}
const soThanhTich = () => THANH_TICH.filter(t => st.tt?.includes(t.id)).length;
const capDanhHieu = () => Math.min(4, Math.floor(soThanhTich() / 4));
const danhHieu = () => ['Chủ trọ tập sự', 'Chủ trọ có tâm', 'Chủ trọ có tiếng', 'Đại gia xóm trọ', 'Huyền thoại hẻm'][capDanhHieu()];
function moThanhTich() {
  $('#tt2Ten').textContent = ` Thành tích (${soThanhTich()}/${THANH_TICH.length})`;
  $('#tt2DanhHieu').textContent = danhHieu();
  $('#tt2Noi').innerHTML = THANH_TICH.map(t => {
    const co = st.tt.includes(t.id);
    return `<div class="nv ${co ? 'da' : ''}"><span class="hinh-dong">${bieuTuong(co ? 'bangKhen' : 'khoa')}</span><div class="nv-chu"><b>${t.ten}</b><span>${t.mo} · thưởng ${gon(t.thuong)}</span></div><span class="nv-dau">${co ? '✓' : '—'}</span></div>`;
  }).join('');
  if (!$('#manTT2').classList.contains('hien')) ghi('mo_bang', { bang: 'thanh_tich' });
  $('#manTT2').classList.add('hien');
}
$('#nutTT2').addEventListener('click', () => { $('#manCD').classList.remove('hien'); moThanhTich(); });
$('#tt2Xong').addEventListener('click', () => { $('#manTT2').classList.remove('hien'); tiepHang(); });
let trangThaiThongBao = { bat: true, coQuyen: false, coTheHoi: false }, choHoiThongBao = false;
function hienThongBaoNhac(m) {
  // Trang cũ có thể còn trong cache; không để phần nhắc mới chặn cả ván chơi.
  if (!TRONG_APP || !$('#nutThongBao') || !$('#manXinThongBao')) return;
  $('#nutThongBao').hidden = false; $('#nutThongBao').disabled = false;
  if (m.loi) {
    trangThaiThongBao.coTheHoi = false;
    $('#manXinThongBao').classList.remove('hien'); choHoiThongBao = false;
    loa('Chưa lưu được nhắc hẹn, thử lại sau nhé'); tiepHang(); return;
  }
  trangThaiThongBao = { bat: m.bat === true, coQuyen: m.coQuyen === true, coTheHoi: m.coTheHoi === true };
  $('#nutThongBao').setAttribute('aria-checked', String(trangThaiThongBao.bat));
  $('#nutThongBao span:last-child').textContent = 'Thông báo nhắc: ' + (!m.bat ? 'Tắt' : m.coQuyen ? 'Bật' : 'Chưa cho phép');
  if (!m.coTheHoi || choHoiThongBao) return;
  choHoiThongBao = true;
  xepHang(() => {
    if (!trangThaiThongBao.coTheHoi) { choHoiThongBao = false; tiepHang(); return; }
    $('#manXinThongBao').classList.add('hien');
    guiApp({loai:'thongBao',lenh:'hien'});
  });
}
function traLoiThongBao(dongY) {
  $('#manXinThongBao').classList.remove('hien'); choHoiThongBao = false;
  trangThaiThongBao.coTheHoi = false;
  guiApp({loai:'thongBao',lenh:dongY?'dongY':'deSau'}); tiepHang();
}
$('#dongYThongBao')?.addEventListener('click', () => traLoiThongBao(true));
$('#deSauThongBao')?.addEventListener('click', () => traLoiThongBao(false));
$('#nutThongBao')?.addEventListener('click', () => {
  if (!TRONG_APP) return;
  $('#nutThongBao').disabled = true;
  guiApp({loai:'thongBao',lenh:'bat',bat:!trangThaiThongBao.bat});
});
$('#nutCD').addEventListener('click', () => { nhanHinh($('#nutTT2'), 'bangKhen', `Thành tích (${soThanhTich()}/${THANH_TICH.length})`); $('#nutLaiTu').classList.remove('chac'); nhanHinh($('#nutLaiTu'), 'chiaKhoa', 'Chơi lại từ đầu'); if (!$('#manCD').classList.contains('hien')) ghi('mo_bang', { bang: 'cai_dat' }); $('#manCD').classList.add('hien'); });
$('#cdXong').addEventListener('click', () => { $('#manCD').classList.remove('hien'); tiepHang(); });
const LIEN_KET_CONG_DONG = {
  nhom: 'https://www.facebook.com/groups/xomtrowarmjar',
  gop_y: 'https://docs.google.com/forms/d/e/1FAIpQLSdC62QaR0W-OljWToWo2eZHqQ_9sweT-LpuaDbYS_QVjJJGiQ/viewform',
};
function moLienKetCongDong(dich) {
  const url = LIEN_KET_CONG_DONG[dich];
  if (!url) return;
  ghi('mo_lien_ket', { dich });
  if (TRONG_APP) guiApp({ loai: 'moLienKet', dich });
  else window.open(url, '_blank', 'noopener,noreferrer');
}
$('#nutCongDong').hidden = TRONG_APP;
$('#nutCongDong').addEventListener('click', () => moLienKetCongDong('nhom'));
$('#nutGopY').addEventListener('click', () => moLienKetCongDong('gop_y'));
// Chạm tiêu đề Cài đặt 7 lần liên tiếp để mở tuỳ chọn dành riêng cho máy thử app.
let soChamThu = 0, lucChamThu = 0;
$('#cdTen').addEventListener('click', () => {
  if (!TRONG_APP) return;
  const luc = Date.now();
  soChamThu = luc - lucChamThu < 1500 ? soChamThu + 1 : 1;
  lucChamThu = luc;
  if (soChamThu === 7) { soChamThu = 0; guiApp({ loai: 'thuNoiBo' }); }
});
// Chơi lại nằm trong Cài đặt và phải bấm 2 lần: bấm nhầm một lần không được mất cả ván.
$('#nutLaiTu').addEventListener('click', e => {
  const b = e.currentTarget;
  if (!b.classList.contains('chac')) { b.classList.add('chac'); nhanHinh(b, 'chiaKhoa', 'Mất hết ván hiện tại · bấm lần nữa để chơi lại'); return; }
  ghi('choi_lai', { thang: st.thang + 1 });
  $('#manCD').classList.remove('hien');
  anPopup(); boSuCo(); ['#manKhach', '#manGo', '#manDem', '#manHoa', '#manLa', '#manQua'].forEach(s => $(s).classList.remove('hien')); batDau(); });
$('#nutLai').addEventListener('click', () => {
  $('#manThu').classList.remove('hien');
  batDau();
});

// ── Nền tảng: tin từ app điện thoại ──────────────────────────────────────────
// back: đóng bảng đang mở (nếu đóng được), rồi báo lại để app biết có nên hỏi thoát.
// nen:  app ra nền / vào lại → tắt / bật tiếng.
// thuong: kết quả xem quảng cáo có thưởng (xemQC bên dưới).
let choQC = null;
// Quảng cáo có thưởng chỉ có trong app, người chơi tự bấm. 3 chỗ: thêm khách khi hết lượt,
// gấp đôi tiền thu ở màn tối cuối tháng, gấp đôi tiền khi vắng.
const coQcKhach = () => TRONG_APP && !st.dem && !st.phong[st.o].loai && st.phong[st.o].qcKhach !== st.thang;
function qcThemKhach() {
  xemQC('them_khach', duoc => {
    if (!duoc || st.khach) return;
    st.phong[st.o].qcKhach = st.thang; st.luot++;
    khachDen();
  });
}
function xemQC(cho, khiXong) {
  if (coGoi('khong_quang_cao')) { khiXong(true); return; }
  ghi('xem_qc', { cho });
  if (!TRONG_APP) { khiXong(false); return; }
  choQC = { cho, khiXong };
  guiApp({ loai: 'xemqc', cho });
}
window.tuApp = m => {
  if (m.loai === 'thongBao') { hienThongBaoNhac(m); return; }
  if (m.loai === 'thuNoiBo') {
    $('#cdThuNoiBo').hidden = !m.bat;
  } else if (m.loai === 'back') {
    const NUT = { manXinThongBao: '#deSauThongBao', manMucGan: '#mucGanXong', manThuaKe: '#nutThuaKe', manLa: '#nutDongLa', manTT: '#ttXong', manTT2: '#tt2Xong', manKhach: '#nutXem', manQua: '#nutNhan', manSK: '#skXong', manNV: '#nvXong', manNho: '#nhoNut', manCH: '#chXong', manCD: '#cdXong' };
    const mo = Object.keys(NUT).map(id => document.getElementById(id)).find(el => el?.classList.contains('hien'));
    const chuyenMo = $('#manHoa').classList.contains('hien') && CHUYEN_DAY_TRO.some(c => c.ma === hoaDang?.ma);
    if (chuyenMo) {
      hoaDang = null; hoaDangMa = null; $('#manHoa').classList.remove('hien'); tiepHang();
    } else if (mo?.id === 'manThuaKe' && thuVayDang) nhanThuBa(false);
    else if (mo) $(NUT[mo.id]).click();
    guiApp({ loai: 'backXong', daDong: chuyenMo || !!mo });
  } else if (m.loai === 'cuaHang') {
    // Gộp chứ không thay: mất mạng thì Play trả danh sách rỗng, không được làm mất gói đã mua.
    GOI = new Set([...GOI, ...(m.da || [])]); GIA_GOI = m.gia || {};
    try { localStorage.setItem(KHOA_GOI, JSON.stringify([...GOI])); } catch { /* bỏ qua */ }
    if (m.vuaMua) { loa(`Cảm ơn bạn! Đã mở ${GOI_INFO[m.vuaMua]?.ten || 'gói'}`); phaoHoa(); }
    nhanGoi();
    if (st) veHet();
    if ($('#manCH').classList.contains('hien')) moCuaHang();
  } else if (m.loai === 'muaXong') {
    if (m.kq === 'cho') loa('Đang chờ thanh toán xong…');
    else if (m.kq === 'loi') loa('Chưa mua được, thử lại sau nhé');
  } else if (m.loai === 'nen') {
    if (m.an && daVaoGame) luu(true);
    try { if (m.an) am?.suspend(); else am?.resume(); } catch { /* chưa có tiếng thì thôi */ }
  } else if (m.loai === 'thuong') {
    const c = choQC;
    choQC = null;
    if (m.chua) loa('Chưa có quảng cáo, thử lại sau ít phút nhé');
    if (c && c.cho === m.cho) c.khiXong(!!m.duoc);
  }
};

// ── Bắt đầu ────────────────────────────────────────────────────────────────
function batDau() {
  boSuCo();
  clearTimeout(hdHen); hdHen = null;
  clearTimeout(hdRacHen); hdRacHen = null; hdRacXong = false;
  try { localStorage.removeItem(KHOA_HD); } catch { /* vẫn hướng dẫn được khi không lưu */ }
  moi();
  daVaoGame = true;
  guiApp({ loai: 'nhomMoDau', nhom: st.nhomMoDau });
  ghi('bat_dau', { nhom_mo_dau: st.nhomMoDau });
  const hen = donHenNgay();
  docViec();
  hdXong = false; veHet(); veLich(); moThuaKe();
  if (!st.thuaKe) xongMoDau();
  setTimeout(() => { if (hen) xepHang(() => moTheHen(hen)); xepHang(quaNgay); }, 1200);
  setTimeout(nhanGoi, 2500);
}
function choiTiep(v) {
  st = ganPhong({ uyTin: 0, gap: {}, tt: [], ttDem: {}, chuyenLinh: null, quaTrangTri: [], thuaKe: null,
    nhomMoDau: null, moDauXong: true, chuyenDayTro: {}, ...v, suCo: null, dem: false });
  daVaoGame = true;
  ghi('choi_tiep');
  st.vayBa ||= { no: 0, lan: -6, cho: null };
  st.thangThueGan ??= st.thang;
  thuVayDang = false; lucThaoTac = Date.now(); nhacDauDa = '';
  if (st.phong.length < 8) st.phong.push(...phongDB());   // ván lưu từ trước khi có mặt bằng / căn hộ
  if (st.thangThueDau === undefined) st.thangThueDau = st.soKhach ? Math.max(0, st.thang - 1) : null;
  // Ván cũ giữ nguyên tiền; các mốc đã đi qua không phát thưởng lại khi tải.
  if (!Array.isArray(st.mocDat)) st.mocDat = MOC_GAN.filter(m => m.dat()).map(m => m.ma);
  // Bỏ món đồ không còn trong DO (bản cũ đổi tên / gỡ món) để ván cũ không crash lúc vẽ.
  st.phong.forEach(p => { if (Array.isArray(p.dat)) p.dat = p.dat.filter(v => DO[v.k] && (!v.tren || p.dat.some(m => m.id === v.tren && DO[m.k]))); });
  const vang = tienVang();   // tính trước veHet(), vì veHet() lưu lại giờ mới
  if (!hdXong && st.soKhach > 0) xongHuongDan();
  const hen = donHenNgay();
  docViec();
  tienHien = st.tien;
  veHet(); veLich();
  if (st.thuaKe?.buoc < MO_DAU_THUA_KE.length) moThuaKe();
  else if (st.thuaKe?.thuChoDoc) xepHang(moThuBa);
  if (st.khach && !st.khach.o) setTimeout(() => noi(cauHoi(st.khach), 4200), 500);
  else if (!st.khach && !st.rac.length) setTimeout(khachDen, treKhach(500));
  setTimeout(() => { if (hen) xepHang(() => moTheHen(hen)); if (vang) xepHang(() => moVang(vang)); xepHang(quaNgay); if (st.chuyenLinh?.choDoc) xepHang(moChuyenLinh); henChuyenDayTro(); }, 1200);
  setTimeout(nhanGoi, 2500);
}
$('#anhBia').innerHTML = `<svg viewBox="-330 -300 660 360">`
  + `<g transform="translate(-190,0) scale(.8)">${quatCay()}</g>`
  + `<g transform="translate(0,10)">${noiCom()}</g>`
  + `<g transform="translate(190,0) scale(.85)">${cayKhe()}</g></svg>`;
// Chỉ ghép vào game WEB trước khởi tạo; nguồn game và HTML app giữ nguyên.
(() => {
  'use strict';
  if (TRONG_APP) return;
  let dang = false, luc = 0, daDo = new Set(), chi = null;
  const moiCu = moi, batCu = batDau, tiepCu = choiTiep, donCu = don;
  const hdCu = huongDan, xongCu = xongHuongDan, thangCu = hetThang;
  const css = document.createElement('style');
  css.textContent = `
    #hd {animation:none}
    .hd-mon-web {outline:3px solid var(--do-lich);outline-offset:-3px;animation:hd-mon-web 1.4s ease-in-out infinite}
    @keyframes hd-mon-web {50%{outline-color:var(--vang);background:#FFF3D6}}
    #hdBoQuaWeb {display:block;margin:2px auto 0;padding:2px 8px;font-size:13px;min-height:44px;border:0;background:transparent;color:var(--muc);text-decoration:underline;pointer-events:auto}
    #hdOTrongWeb {fill:#9CAF8C55;stroke:var(--do-lich);stroke-width:5;stroke-dasharray:10 6;pointer-events:none}
    @media(prefers-reduced-motion:reduce){.hd-mon-web{animation:none}}
  `;
  document.head.appendChild(css);
  const bo = document.createElement('button');
  bo.id = 'hdBoQuaWeb'; bo.textContent = 'Bỏ qua hướng dẫn'; bo.hidden = true;
  $('#hd').appendChild(bo);
  const doBuoc = buoc => {
    if (!dang || daDo.has(buoc)) return;
    daDo.add(buoc);
    try { window.warmJarThongKe?.('hd_buoc', {buoc, giay:Math.max(0, Math.round((Date.now()-luc)/1000))}); } catch { /* Đo lỗi vẫn chơi được. */ }
  };
  function donChi() {
    document.querySelector('.hd-mon-web')?.classList.remove('hd-mon-web');
    $('#hdOTrongWeb')?.remove(); $('#hdTay').hidden = true; bo.hidden = true; chi = null;
    $('#hd').classList.remove('hien');
  }
  moi = function(...a) {
    const k = moiCu(...a);
    // Rút đúng sáu rác như cũ để giữ dòng ngẫu nhiên; một lần chạm dọn hai bãi.
    // Trọng số nằm trên từng rác, nên tải lại giữa chừng vẫn giữ đủ thưởng.
    if (dang) st.rac = st.rac.filter((_,i) => i%2 === 0).map(r => ({...r, webGop:2}));
    return k;
  };
  batDau = function(...a) {
    let daXong = hdXong;
    try { daXong = localStorage.getItem(KHOA_HD) === 'xong'; } catch {}
    dang = !daXong; luc = Date.now(); daDo = new Set(); donChi();
    const k = batCu(...a);
    if (daXong) { hdXong = true; try { localStorage.setItem(KHOA_HD,'xong'); } catch {} }
    huongDan(); return k;
  };
  choiTiep = function(...a) { dang = false; hdXong = true; donChi(); return tiepCu(...a); };
  don = function(id, e) {
    const r = st.rac.find(v => v.id === id);
    if (r?.webGop === 2 && st.o === 0 && st.thang === 0) {
      viec('rac'); thuongHen('rac',20,5);
    }
    const k = donCu(id,e); huongDan(); return k;
  };
  xongHuongDan = function(...a) { const k = xongCu(...a); dang = false; donChi(); return k; };
  bo.onclick = () => { if (dang && (st.khach || !st.rac.length)) xongHuongDan(); };
  hetThang = function(...a) {
    const k = thangCu(...a);
    if (dang && st.dem) { doBuoc('het_thang'); xongHuongDan(); }
    return k;
  };
  function goiY() {
    const ds = [...document.querySelectorAll('#ke .the.can-mua')]
      .filter(e => DO[e.dataset.k]?.gia <= st.tien)
      .sort((a,b) => DO[a.dataset.k].gia-DO[b.dataset.k].gia);
    for (const the of ds) for (let x=0;x<N;x++) for (let y=0;y<N;y++) {
      if (datDuoc(the.dataset.k,x,y)) return {the,k:the.dataset.k,x,y};
    }
    return null;
  }
  huongDan = function() {
    if (!dang) { if (hdXong) donChi(); else hdCu(); return; }
    donChi();
    if (!st || st.dem || hdXong || document.querySelector('.phu.hien')) return;
    const k = st.khach, b = $('#hd'); let dich, chu;
    if (!k && st.rac.length) { doBuoc('rac'); dich = $('#phongKhung'); chu = 'Chạm ba bãi rác để dọn'; }
    else if (k && !k.o && !ungY()) {
      doBuoc('keo_do'); chi = goiY();
      dich = chi?.the || $('#ke'); chu = chi ? 'Kéo món sáng vào ô viền đỏ' : 'Chọn món khách cần trong tiệm';
      if (chi) {
      dich.classList.add('hd-mon-web');
      // Đưa món rẻ nhất vào vùng nhìn thấy, không cuộn dọc cả màn chơi.
      const ke = $('#ke');
      if (dich.offsetLeft < ke.scrollLeft || dich.offsetLeft+dich.offsetWidth > ke.scrollLeft+ke.clientWidth)
        ke.scrollLeft = dich.offsetLeft-ke.offsetLeft;
      const [w,d] = coCua(chi.k), [x,y] = [chi.x,chi.y];
      const oTrong = document.createElementNS('http://www.w3.org/2000/svg','polygon');
      oTrong.id = 'hdOTrongWeb';
      oTrong.setAttribute('points',pts([[x,y],[x+w,y],[x+w,y+d],[x,y+d]].map(([a,c]) => P(a*T,c*T,0))));
      $('#sang').appendChild(oTrong);
      const p = svg.createSVGPoint(), [X,Y] = P((x+w/2)*T,(y+d/2)*T,0);
      p.x = X; p.y = Y;
      const q = p.matrixTransform(svg.getScreenCTM()), g = $('#game').getBoundingClientRect(), r = dich.getBoundingClientRect();
      const tay = $('#hdTay'); tay.hidden = false;
      tay.style.setProperty('--x0',(r.left+r.width/2-g.left)+'px');
      tay.style.setProperty('--y0',(r.top+r.height/2-g.top)+'px');
      tay.style.setProperty('--x1',(q.x-g.left)+'px'); tay.style.setProperty('--y1',(q.y-g.top)+'px');
      b.dataset.mon = chi.k; b.dataset.x = x; b.dataset.y = y;
      }
    } else if (ungY()) { doBuoc('cho_thue'); dich = $('#nutChinh'); chu = 'Bấm Cho thuê để nhận tiền'; }
    else if (k?.o) { dich = $('#nutChinh'); chu = 'Bấm Hết tháng để thu tiền trọ'; }
    else return;
    bo.hidden = !k && !!st.rac.length;
    b.querySelector('.hd-chu').textContent = chu;
    b.classList.add('hien','duoi'); b.style.width = Math.min(280,$('#game').clientWidth-24)+'px';
    const g = $('#game').getBoundingClientRect(), r = dich.getBoundingClientRect();
    const x = Math.max(12,Math.min(g.width-b.offsetWidth-12,r.left-g.left+r.width/2-b.offsetWidth/2));
    b.style.left = x+'px'; b.style.top = Math.max(8,r.top-g.top-b.offsetHeight-14)+'px';
    b.style.setProperty('--mui',(r.left-g.left+r.width/2-x)+'px');
  };
})();

// Chỉ ghép vào đầu ra web, trước docLuu(): đăng ký đồ/quà trước khi đọc ván.
function tienWeb35(k) {
  const n=Number(k)||0,tron=Math.round(Math.abs(n)>=1000?n/10:n*100)/100;
  return n===0?'0':(Math.abs(n)>=1000?tron.toLocaleString('vi-VN',{maximumFractionDigits:2})+'tr':n.toLocaleString('vi-VN',{maximumFractionDigits:2})+'k');
}
(() => {
  'use strict';
  if(TRONG_APP)return;
  const coD=true,coE=true;
  const dsTrum=[
    {ma:'coGiao',nghe:'Cô giáo về hưu',ten:'Cô Hạnh',kieu:'veHuu',loi:'“Cô cần đủ năm góc sinh hoạt, gọn gàng thì cô mới thuê nha.”',qua:'Thư cảm ơn của cô giáo'},
    {ma:'anhKien',nghe:'Kiến trúc sư',ten:'Anh Kiên',kieu:'kySu',loi:'“Anh soi kỹ lắm, đủ năm chỗ này mà vẫn vừa túi tiền nhé.”',qua:'Bản vẽ của anh Kiên'},
    {ma:'chiBau',nghe:'Mẹ bầu sắp sinh',ten:'Chị Ngọc',kieu:'voChong',loi:'“Chị sắp sinh rồi, cần năm góc này cho cả nhà.”',qua:'Lời chúc của chị Ngọc'},
    {ma:'sepNho',nghe:'Chủ shop online',ten:'Anh Phong',kieu:'banOnline',loi:'“Shop nhỏ mà việc nhiều, đủ năm góc thì anh chốt.”',qua:'Khung đơn hàng may mắn'},
    {ma:'voChongTre',nghe:'Vợ chồng trẻ',ten:'Tâm & Hạnh',kieu:'voChong',loi:'“Tụi em ở nhà cả ngày, năm góc này thiếu một cũng bất tiện.”',qua:'Tranh tổ ấm mới'},
    {ma:'cuGia',nghe:'Ông đi cùng con cháu',ten:'Ông Sáu',kieu:'veHuu',loi:'“Con cháu lựa giùm ông năm thứ này, vừa giá thì ông ở lâu.”',qua:'Thư tay của ông Sáu'},
  ];
  const cacMa=dsTrum.map(x=>x.ma),quaVang='web35-vang',quaPccc='web35-pccc';
  function du() {
    if(!st)return null;
    if(!st.web35||typeof st.web35!=='object'||Array.isArray(st.web35))st.web35={};
    const d=st.web35;
    if(!Array.isArray(d.trumDat))d.trumDat=[];
    if(!Array.isArray(d.trumGap))d.trumGap=[];
    if(!Array.isArray(d.moc))d.moc=[];
    if(!d.mua||typeof d.mua!=='object')d.mua={};
    if(!d.pccc||typeof d.pccc!=='object')d.pccc={tiep:3+Math.max(0,Math.ceil((st.thang-3)/6))*6};
    if(!Number.isInteger(d.trumTiep))d.trumTiep=0;
    if(d.luotKhachThang==null&&st.phong.some(p=>p.mo&&!p.loai&&p.luot<luotThang()))d.luotKhachThang=st.thang;
    return d;
  }
  const ghi35=(ten,thamSo)=>{try{window.warmJarThongKe?.(ten,thamSo);}catch{}};
  const themQua=(ten,ma,ve)=>TREO.push({ten,gia:0,thue:0,qua:ma,ve})-1;
  const vang=themQua('Bằng khen vàng · Chủ trọ của năm',quaVang,()=>TREO[BANG_LINH].ve().replaceAll(OAK,'#C58B24').replaceAll(KEM,'#FFF0B9').replace('BẰNG KHEN','CHỦ TRỌ CỦA NĂM').replace('font-size="13"','font-size="8"'));
  const quaTrum=dsTrum.map((x,i)=>themQua(x.qua,'web35-'+x.ma,()=>`<rect class="n" x="220" y="-224" width="100" height="90" rx="4" fill="${['#C58B24',OAK,DAT,XANH,OAK,'#C58B24'][i]}"/><rect x="228" y="-216" width="84" height="74" fill="${KEM}"/><path class="m" d="M240,-192h60m-60,12h60m-48,12h36"/><circle class="n" cx="270" cy="-153" r="7" fill="${DAT}"/>`));
  const giay=themQua('Giấy chứng nhận an toàn PCCC',quaPccc,()=>TREO[BANG_LINH].ve().replace('BẰNG KHEN','AN TOÀN PCCC').replaceAll(OAK,DAT));
  const tangQua=ma=>{if(!Array.isArray(st.quaTrangTri))st.quaTrangTri=[];if(st.quaTrangTri.includes(ma))return false;st.quaTrangTri.push(ma);return true;};
  if(coE)DO.binhChuaChay={ten:'Bình chữa cháy',gia:150,thue:0,nhom:'pccc',cau:'Có bình chữa cháy rồi, yên tâm hơn nha.',co:[1,1],ve:v=>`<g data-binh-pccc="${v?.lat?1:0}" transform="scale(${v?.lat?-1:1} 1)"><ellipse class="n" cx="0" cy="0" rx="19" ry="9" fill="${MUC}"/><path class="n" d="M-17,-57Q0,-68 17,-57V-5Q0,8 -17,-5Z" fill="#C8452D"/><ellipse class="n" cx="0" cy="-57" rx="17" ry="7" fill="#E67A55"/><rect class="n" x="-5" y="-76" width="10" height="18" fill="${OAK}"/><path class="m" d="M0,-73L18,-77M5,-70Q34,-73 28,-23"/><rect x="-11" y="-43" width="22" height="24" rx="2" fill="${KEM}"/><path class="m" d="M-5,-29h10m-5,-5v10"/></g>`};
  NHOM.pccc={ten:'có bình chữa cháy',icon:'canhBao'};
  const tienCu=tangDoCu;
  tangDoCu=function(k){if(k==='binhChuaChay'&&!du()?.pccc.daBao)return;const d=Object.getOwnPropertyDescriptor(DO,'binhChuaChay');try{if(!k&&d)Object.defineProperty(DO,'binhChuaChay',{...d,enumerable:false});return tienCu.apply(this,arguments);}finally{if(d)Object.defineProperty(DO,'binhChuaChay',d);}};

  // A: chuỗi viết tay/ván cũ cũng được đổi; vùng mua gói và chuyển khoản giữ đ.
  function doiChu(s){return s.replace(/([+−-]?\d[\d.,]*)\s*đ(?!\p{L})/gu,(_,v)=>tienWeb35(Number(v.replace('−','-').replaceAll('.','').replace(',','.'))/1000));}
  function tienTrongGame() {
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode())){if((n.parentElement?.closest('script,style,.web-bang,[data-goi-khoa]')||(n.parentElement?.closest('#manCH')&&!n.parentElement.closest('#chNoi .nv-chu span'))))continue;const s=doiChu(n.nodeValue);if(s!==n.nodeValue)n.nodeValue=s;}
    document.querySelectorAll('#chNoi [data-goi]').forEach(b=>{if(!b.previousElementSibling?.classList.contains('web35-tien-that')){const p=document.createElement('p');p.className='web35-tien-that';p.textContent='Thanh toán bằng tiền thật';b.before(p);}});
  }
  new MutationObserver(tienTrongGame).observe(document.body,{subtree:true,childList:true,characterData:true});

  // B: thêm lựa chọn vào đúng nhóm cũ; không đổi cửa xác suất 40%.
  const vui=chu=>{diuKhach();noi(chu||'“Cảm ơn anh chị nha!”');};
  const chuyenMoi=[
    ['doiChoDo','xin kê lại giường','“Cho em kê giường gần cửa sổ được không ạ?”','Cho kê lại',k=>{vui();k.con++;},'Giữ nguyên',()=>bucThem('“Dạ, phòng hơi bí…”')],
    ['phongToi','than phòng tối','“Em học mỏi mắt quá, anh chị giúp em cái đèn nha?”','Mua đèn · 120k',()=>{chi(120,'đèn cho khách');vui();},'Khách tự mua',()=>bucThem('“Em tưởng chủ trọ sẽ giúp…”')],
    ['nuoiCa','xin nuôi bể cá','“Em nuôi bể cá nhỏ thôi, em giữ sạch mà!”','Cho nuôi · thu 50k',k=>{doiTien(50);k.web35Ca={den:st.thang+1,ro:Math.random()<.3};},'Không cho',()=>noi('“Dạ, hơi tiếc ghê.”')],
    ['lauChung','rủ nấu lẩu chung','“Cả dãy nấu lẩu ngoài hành lang, anh chị góp vui nha?”','Góp 100k',()=>{chi(100,'bữa lẩu');st.uyTin=(st.uyTin||0)+1;},'Cấm vì sợ cháy',()=>loa('Cả dãy cất bếp, hẹn dịp khác')],
    ['ganKhoa','xin thay ổ khoá','“Em tự trả tiền, cho em thay ổ khoá riêng nha?”','Cho thay',()=>vui(),'Không cho',()=>bucThem('“Em vẫn thấy lo lo…”')],
    ['giuXe','xin gửi xe của bạn','“Bạn em ngủ lại, cho gửi xe một đêm nha?”','Thu 50k',()=>doiTien(50),'Từ chối',()=>noi('“Dạ, để em nhờ chỗ khác.”')],
    ['trongRau','xin trồng rau','“Cho em trồng ít rau ngoài sân nha, có rau em biếu!”','Cho trồng',k=>{k.web35Rau=st.thang+1;vui();},'Không cho',()=>loa('Khách cất chậu, không sao cả')],
    ['treoPoster','xin dán poster','“Em dán poster thần tượng thôi, lúc đi em gỡ sạch!”','Cho dán',()=>vui(),'Không cho',()=>bucThem('“Phòng em mà chẳng được dán…”')],
  ];
  const taoChuyen=(c,k)=>({ma:c[0],icon:c[0]==='lauChung'?'banh':'thu',ten:k.ten+' '+c[1],loi:c[2],a:[c[3],()=>{c[4](k);ghi35('web_sk_khach',{ma:c[0],chon:'a'});luu(true);}],b:[c[5],()=>{c[6](k);ghi35('web_sk_khach',{ma:c[0],chon:'b'});luu(true);}]});
  KHO_DO.push(...chuyenMoi.map(c=>k=>taoChuyen(c,k)));

  // C: thêm thành tích ở cuối; không đổi ID/chỉ số đồ treo trong ván cũ.
  if(coD)THANH_TICH.push({id:'trumWeb35',ten:'Trùm cũng phải chịu',mo:'Chinh phục đủ sáu khách khó tính',thuong:0,dat:()=>du()?.trumDat.filter(x=>cacMa.includes(x)).length===6});
  function tienDo(){const d=du();if(!d)return null;const a=THANH_TICH.filter(t=>st.tt?.includes(t.id)).length,b=Object.keys(KIEU).filter(k=>st.gap?.[k]>0).length;
    const mua=[!!(d.mua.trungThu||st.thang>=12),!!(st.ttDem?.noel||st.thang>=3),!!(st.ttDem?.tet||st.thang>=5)],nha=!!st.phong[NHA]?.mo;
    const raw=25*(a/THANH_TICH.length+b/Object.keys(KIEU).length+mua.filter(Boolean).length/3+Number(nha));return{raw,phanTram:raw===100?100:Math.floor(raw),a,b,mua,nha};}
  const css=document.createElement('style');css.textContent=`#nutMucGan{position:static;width:100%;min-height:44px;font:700 13px 'Be Vietnam Pro';text-align:left;padding:8px!important}#game .tren{grid-template-columns:52px minmax(0,1fr) 44px 68px}#game .tren>.muc-gan{display:contents}#game #nutMucGan{width:68px;height:44px;padding:2px!important;font-size:11px;line-height:1.2;display:flex;flex-direction:column;text-align:center}#nutMucGan span{white-space:nowrap}#nutMucGan>b{display:block!important;font-size:12px}#web35Dem{grid-column:1/-1;grid-row:3}#mucGanChu,#mucGanTien,#ngayThuaKe,.muc-gan>b{display:none!important}#web35Dem{font-size:12px;line-height:1.35;padding:2px 8px 5px}#web35TienDo p{margin:8px 0;font-size:14px;line-height:1.4}.web35-tien-that{font-size:12px;line-height:1.35;margin:6px 0!important}.web35-trum{border:3px solid #C58B24!important}.web35-trum #tenKhach:before{content:'Khách khó tính';display:block;color:#795018;font-size:14px;margin-bottom:8px}#web35Sau{display:grid;grid-template-columns:1fr 1fr;gap:8px}#web35Sau article{border:1px solid #9D8667;border-radius:7px;padding:8px;font-size:12px;line-height:1.4}#web35Sau b{display:block}#manMucGan .tam{max-height:90dvh;overflow:auto}#web35Trum{min-height:44px;width:100%;margin:8px 0}.web35-tien-that+.nut{white-space:normal;text-wrap:balance}.web-hop h2,.web-hop .nut,.web-muc-ung-ho button{text-wrap:balance}`;document.head.append(css);
  const dem=document.createElement('div');dem.id='web35Dem';dem.hidden=true;$('#nutMucGan').after(dem);
  const bang=document.createElement('div');bang.id='web35TienDo';$('#mucGanDayDu').after(bang);
  const trumNut=document.createElement('button');trumNut.id='web35Trum';trumNut.className='nut nhe';trumNut.textContent='Khách khó tính · xem 6 món quà';bang.after(trumNut);
  const sau=document.createElement('div');sau.id='web35Sau';sau.hidden=true;trumNut.after(sau);trumNut.onclick=()=>{sau.hidden=!sau.hidden;cap();};
  function hienBang(p){bang.innerHTML=`<p><b>Dãy trọ hoàn thành ${p.phanTram}%</b></p><p>Thành tích: ${p.a}/${THANH_TICH.length} · còn ${THANH_TICH.length-p.a}</p><p>Kiểu khách: ${p.b}/${Object.keys(KIEU).length} · còn ${Object.keys(KIEU).length-p.b} kiểu chưa gặp</p><p>Mùa lễ: ${p.mua.filter(Boolean).length}/3 · ${['Trung thu','Noel','Tết'].filter((_,i)=>!p.mua[i]).join(', ')||'đã qua đủ'}</p><p>Căn hộ: ${p.nha?'đã mua':'chưa mua'}</p>`;sau.innerHTML=dsTrum.map(x=>`<article><b>${x.ten}</b>${du().trumDat.includes(x.ma)?'Đã chinh phục':du().trumGap.includes(x.ma)?'Đã gặp · chưa chinh phục':'Chưa gặp'}<br>${x.qua}</article>`).join('');}
  let dangCap=false;
  function cap(){if(!st||dangCap)return;dangCap=true;try{const p=tienDo(),d=du();$('#nutMucGan').innerHTML='<span>Mục tiêu</span><b>'+p.phanTram+'%</b>';$('#nutMucGan').setAttribute('aria-label','Mục tiêu · Dãy trọ hoàn thành '+p.phanTram+'%');hienBang(p);let moi=false;for(const moc of [25,50,75,100])if(p.raw>=moc&&!d.moc.includes(moc)){d.moc.push(moc);ghi35('web_hoan_thanh',{moc});loa('Dãy trọ đã hoàn thành '+moc+'%!');moi=true;}if(p.raw>=100&&tangQua(quaVang)){loa('Nhận bằng khen vàng · Chủ trọ của năm');moi=true;}
    const pc=d.pccc,phong=st.phong.filter(p=>p.mo&&!p.mb&&!p.loai&&p.khach?.o),co=phong.filter(p=>p.dat.some(v=>v.k==='binhChuaChay')).length;dem.hidden=pc.han==null;if(!dem.hidden)dem.textContent='Kiểm tra PCCC: '+(pc.han>st.thang?'còn '+(pc.han-st.thang)+' tháng':'đến hạn tháng này')+' · '+co+'/'+phong.length+' phòng có bình';if(moi)luu(true);tienTrongGame();}finally{dangCap=false;}}
  const veCu=veHet;veHet=function(...a){const r=veCu(...a);cap();return r;};
  const thanhCu=veThanhTren;veThanhTren=function(...a){const r=thanhCu(...a);cap();return r;};
  const tiemCu=veTiem;veTiem=function(...a){const r=tiemCu(...a);if(!du()?.pccc.daBao)document.querySelector('.the[data-k="binhChuaChay"]')?.remove();return r;};
  $('#nutMucGan').addEventListener('click',cap);

  // D: chốt lượt đầu toàn dãy và vòng sáu tên nằm trong ván lưu.
  let dangTao=null;
  function taoTrum(c,k){const K=KIEU[k.kieu],nhom=[...new Set([...K.can,'ngu','nuoc','mat','ngoi','cay','cat','hoc','phoi'])].filter(n=>Object.values(DO).some(d=>d.nhom===n&&!d.goi&&!d.tiem&&!d.tra));k.can=nhom.slice(0,5);k.ten=c.ten;k.web35Trum=c.ma;k.daMac=true;
    const re=n=>Math.min(...Object.values(DO).filter(d=>d.nhom===n&&!d.goi&&!d.tiem&&!d.tra).map(d=>d.thue));const phong=st.phong[st.o],coDinh=giaPhong()-phong.dat.reduce((s,v)=>s+DO[v.k].thue,0);k.web35Re=coDinh+k.can.reduce((s,n)=>s+re(n),0);k.tran=k.web35Re+50+(cacMa.indexOf(c.ma)%2)*50;return k;}
  const taoCu=taoKhach;taoKhach=function(...a){if(!dangTao)return taoCu(...a);const c=dangTao,k=taoCu(KIEU[c.kieu]?c.kieu:'veHuu');return taoTrum(c,k);};
  const denCu=khachDen;khachDen=function(...a){if(!st||!coD)return denCu(...a);const d=du(),p=st.phong[st.o],duoc=p.mo&&!document.querySelector('.phu.hien')&&!st.dem&&st.luot>0&&!st.khach&&!st.rac.length&&!p.loai&&!p.mb;
    if(duoc&&st.thang>=5&&d.luotKhachThang!==st.thang){dangTao=dsTrum[d.trumTiep%6];}
    try{const r=denCu(...a);if(duoc&&st.khach){d.luotKhachThang=st.thang;if(st.khach.web35Trum){d.trumTiep=(d.trumTiep+1)%6;if(!d.trumGap.includes(st.khach.web35Trum))d.trumGap.push(st.khach.web35Trum);$('#manKhach .tam').classList.add('web35-trum');$('#tenKhach').textContent=st.khach.ten+' · '+dsTrum.find(x=>x.ma===st.khach.web35Trum).nghe;}else $('#manKhach .tam').classList.remove('web35-trum');luu(true);}return r;}finally{dangTao=null;}};
  const hoiCu=cauHoi;
  // cauHoi là const của game nguồn; đầu ra web gọi hàm này qua một nhánh !TRONG_APP.
  function hoiTrum(k){return dsTrum.find(x=>x.ma===k.web35Trum).loi.replace(/[“”]/g,'')+' Cần '+k.can.map(n=>NHOM[n].ten).join(', ')+' · tối đa '+tienWeb35(k.tran)+'.';}
  const khacCu=khachKhac;khachKhac=function(...a){const k=st.khach;if(k?.web35Trum&&!k.o&&!k.di)ghi35('web_khach_trum',{ma:k.web35Trum,kq:'bo_qua'});return khacCu(...a);};
  // Trùm mới ở một tháng; lưu hạn riêng để sự kiện không kéo dài thêm. Ván cũ thiếu hạn giữ nguyên.
  const thueCu=choThueThat;choThueThat=function(...a){const k=st.khach,chua=k&&!k.o,r=thueCu(...a);if(chua&&k.o&&k.web35Trum){k.con=0;k.web35TraPhong=st.thang+1;const d=du();ghi35('web_khach_trum',{ma:k.web35Trum,kq:'thue'});if(!d.trumDat.includes(k.web35Trum)){d.trumDat.push(k.web35Trum);st.uyTin=(st.uyTin||0)+1;tangQua('web35-'+k.web35Trum);doiTien(50,'Tiền cảm ơn khách khó tính');kiemThanhTich();luu(true);cap();}veHet();}return r;};

  // E: báo riêng trước cửa40%, xét hạn đúng một lần khi kết thúc tháng.
  const skCu=suKienThang;suKienThang=function(...a){if(!coE)return skCu(...a);const pc=du().pccc;if(st.thang>=pc.tiep){pc.daBao=true;pc.han=st.thang+2;pc.tiep=st.thang+6;st.skThang=st.thang;luu(true);xepHang(()=>taiHoa({ma:'web35BaoPccc',icon:'canhBao',ten:'Phường báo kiểm tra phòng cháy',loi:'Phường báo: 2 tháng nữa kiểm tra phòng cháy chữa cháy. Phòng nào đang cho thuê cũng phải có bình chữa cháy.',a:['Biết rồi',()=>{veTiem();cap();}]}));veTiem();cap();return;}return skCu(...a);};
  function kiemPccc(){if(!coE)return null;const pc=du().pccc;if(pc.han==null||st.thang<pc.han)return null;const phong=st.phong.map((p,i)=>({p,i})).filter(({p})=>p.mo&&!p.mb&&!p.loai&&p.khach?.o),thieu=phong.filter(({p})=>!p.dat.some(v=>v.k==='binhChuaChay'));pc.han=null;const n=thieu.length;let phat=0;
    if(n){phat=Math.min(1000,n*200,Math.max(0,st.tien));chi(phat,'phạt thiếu bình chữa cháy');for(const {p} of thieu){p.khach.buc=(p.khach.buc||0)+1;if(p.khach.buc>=2)p.khach.con=0;}}
    else if(phong.length){st.uyTin=(st.uyTin||0)+1;tangQua(quaPccc);}
    ghi35('web_pccc',{kq:n?'thieu':'dat',thieu:n});luu(true);cap();return{thieu:n,phong:phong.length,phat};}
  const hetCu=hetThang;hetThang=function(...a){const truoc=st.dem,r=hetCu(...a);if(!truoc&&st.dem){const d=du();if(thangSo(st.thang)===9)d.mua.trungThu=true;const pc=kiemPccc();if(pc)loa(pc.thieu?'PCCC: thiếu '+pc.thieu+' phòng · phạt '+tienWeb35(pc.phat):pc.phong?'PCCC đạt · nhận giấy chứng nhận':'PCCC: chưa có phòng cho thuê · không thưởng');cap();}return r;};
  const sangCu=sangThang;sangThang=function(...a){const thang=st.thang+1;for(const k of dangO()){if(k.web35Trum&&Number.isInteger(k.web35TraPhong)&&thang>=k.web35TraPhong)k.con=0;if(k.web35Rau!=null&&k.web35Rau<=thang){delete k.web35Rau;doiTien(50,'Khách biếu rau');}if(k.web35Ca?.den<=thang){const ro=k.web35Ca.ro;delete k.web35Ca;if(ro)chi(100,'bể cá rò nước');}}return sangCu(...a);};
  window.Web35={tien:tienWeb35,doiChu,du,tienDo,cap,dsTrum,taoTrum,taoChuyen:(ma,k=st.khach)=>taoChuyen(chuyenMoi.find(c=>c[0]===ma),k),chuyen:chuyenMoi.map(c=>c[0]),vang,giay,quaTrum,hoiTrum,kiemPccc};
})();

const cu = docLuu();
if (cu) {
  $('#nutMo').textContent = 'Chơi tiếp';
  const tomTat = $('#tomTatVan');
  if (tomTat) {
    const phong = Array.isArray(cu.phong) ? cu.phong.filter(p => p.mo && !p.loai).length : 0;
    tomTat.textContent = `Ván của bạn: ${phong} phòng trọ · ${dong(Number.isFinite(cu.tien) ? cu.tien : 0)}`;
    tomTat.hidden = false;
  }
  $('#nutMoi').hidden = false;
}
$('#nutMo').addEventListener('click', () => { $('#moDau').classList.remove('hien'); cu ? choiTiep(cu) : batDau(); });
$('#nutMoi').addEventListener('click', () => { $('#moDau').classList.remove('hien'); batDau(); });
moi(); veLai(); veThanhTren(); veTiem(); veLich();

// Một lần cho mỗi lần tải trang, sau khi màn đầu đã có cơ hội được vẽ.
requestAnimationFrame(() => {
  const ms = Math.max(0, Math.round(performance.now()));
  if (TRONG_APP) ghi('man_dau_hien', { ms_tai: ms });
});
