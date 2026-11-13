// Phần riêng của website; không được nhúng vào HTML app.
(function (goc) {
  const GIA = Object.freeze({web_day_du:19000, goi_tet:25000, goi_noel:25000, meo_cung:19000, khoi_nghiep:15000, combo_tet:39000, tron_bo:69000, nang_tron_bo:50000, phong_sv:19000, tang_lau:25000, the_cham:19000, li_xi:19000});
  // Một danh mục cho thẻ gói, Tiệm và lọc thống kê. Giá máy chủ vẫn giữ riêng.
  const GOI_TRANG_TRI=Object.freeze([
    {id:'goi_tet',nhan:'Gói Tết',tenMon:'Câu đối đỏ',treo:true},
    {id:'goi_noel',nhan:'Gói Noel',mon:'cayThongMini'},
    {id:'meo_cung',nhan:'Mèo cưng',meo:true},
    {id:'khoi_nghiep',nhan:'Khởi nghiệp',tenMon:'Biển neon Dãy Trọ',treo:true},
    {id:'phong_sv',nhan:'Phòng sinh viên năm nhất',mon:'svNem',mua:true,den:'2026-12-31T23:59:59+07:00',han:'31/12/2026',anh:'pwa/phong-sv-truoc-sau.png'},
    {id:'tang_lau',nhan:'Tầng lầu & sân thượng',mon:'ltChau',mua:true,anh:'pwa/tang-lau.png',alt:'Sân thượng có bồn nước, chậu cây, giàn hoa giấy, dù che và bàn ghế'}
  ].map(Object.freeze));
  const GOI_TRON_BO=Object.freeze(GOI_TRANG_TRI.filter(g=>!g.mua).map(g=>g.id));
  const CHU = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function taoMa(n = 8) {
    const a = crypto.getRandomValues(new Uint8Array(n));
    return Array.from(a, x => CHU[x % CHU.length]).join('');
  }
  function crc16(chu) {
    let c = 0xffff;
    for (const b of new TextEncoder().encode(chu)) {
      c ^= b << 8;
      for (let i=0;i<8;i++) c = (c & 0x8000) ? (c << 1) ^ 0x1021 : c << 1;
      c &= 0xffff;
    }
    return c.toString(16).toUpperCase().padStart(4,'0');
  }
  function truong(id, chu) {
    chu = String(chu);
    if (!/^[\x20-\x7e]*$/.test(chu) || chu.length > 99) throw Error('Trường QR không hợp lệ');
    return id + String(chu.length).padStart(2,'0') + chu;
  }
  function nganHangDung(n) {
    return !!n && /^\d{6}$/.test(n.bin) && /^[A-Za-z0-9]{1,19}$/.test(n.soTk) && typeof n.ten === 'string' && n.ten.trim().length > 0;
  }
  function vietQR(n, tien, noiDung) {
    if (!nganHangDung(n) || !/^[A-Z0-9 ]{1,25}$/.test(noiDung) || (tien != null && (!Number.isSafeInteger(tien) || tien <= 0))) throw Error('Thông tin QR chưa đủ');
    const nhan = truong('00','A000000727') + truong('01',truong('00',n.bin)+truong('01',n.soTk)) + truong('02','QRIBFTTA');
    const chu = truong('00','01') + truong('01',tien == null ? '11':'12') + truong('38',nhan) + truong('53','704') + (tien == null ? '':truong('54',tien)) + truong('58','VN') + truong('62',truong('08',noiDung)) + '6304';
    return chu + crc16(chu);
  }
  async function bamMa(ma) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ma.trim().toUpperCase()));
    return Array.from(new Uint8Array(b), x=>x.toString(16).padStart(2,'0')).join('');
  }
  const api = {GIA, GOI_TRANG_TRI, GOI_TRON_BO, CHU, taoMa, crc16, vietQR, nganHangDung, bamMa};
  if (typeof module !== 'undefined') module.exports = api;
  else goc.DayTroWeb = api;
})(globalThis);
