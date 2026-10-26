// Quy tắc ngày thật riêng cho web; không dùng bộ ngẫu nhiên của kinh tế game.
((g) => {
  const ngay = (d = new Date()) => d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  function nhom(cu, coVan, hat) { return ['A','B'].includes(cu) ? cu : coVan ? 'A' : hat < .5 ? 'A' : 'B'; }
  function nhomBat(chon, cheDo) { return cheDo === 'B_cho_tat_ca' ? 'B' : cheDo === 'chay' ? chon : 'A'; }
  function luot(cu, hom, dung = false) {
    const moc = Math.max(Number(cu?.moc)||0, hom), daDung=Number(cu?.daDung)||0;
    const con = hom >= moc && daDung < moc;
    return {con, luu:{moc, daDung:dung && con ? moc : daDung}};
  }
  function tuan(d = new Date()) { const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-(x.getDay()+6)%7);return ngay(x); }
  const mau=[
    {ma:'don_sach',ten:'Dọn 6 chỗ bụi trong tuần',loai:'rac',can:6},
    {ma:'xep_gon',ten:'Dời đồ 4 lần để bày phòng',loai:'sapXep',can:4},
    {ma:'doc_so',ten:'Xem sổ thu 3 lần',loai:'docSo',can:3},
    {ma:'lau_cua',ten:'Lau cửa sổ 2 lần',loai:'lau',can:2},
    {ma:'khoe_phong',ten:'Chia sẻ hoặc tải ảnh phòng 1 lần',loai:'khoe',can:1},
    {ma:'sam_do',ten:'Sắm 3 món đồ cho dãy trọ',loai:'mua',can:3},
    {ma:'trang_tri',ten:'Trang trí phòng 2 lần',loai:'trangTri',can:2},
    {ma:'sua_do',ten:'Sửa 2 sự cố cho khách',loai:'sua',can:2},
    {ma:'don_khach',ten:'Cho khách thuê phòng 3 lần',loai:'thue',can:3},
    {ma:'qua_thang',ten:'Chăm dãy trọ qua 3 tháng',loai:'thang',can:3},
    {ma:'mac_ca',ten:'Chốt thuê sau mặc cả 2 lần',loai:'macCa',can:2},
    {ma:'ba_phong',ten:'Có khách ở đủ 3 phòng',loai:'phong',can:3},
    {ma:'sau_phong',ten:'Có khách ở đủ 6 phòng',loai:'phong',can:6},
    {ma:'tiem_banh',ten:'Mở tiệm bánh',loai:'tiem',can:1},
    {ma:'tra_sua',ten:'Mở quán trà sữa',loai:'traSua',can:1}
  ];
  function capTuan(cu, moc, suKien={}, hienCo={}){
    const h=cu&&Number.isInteger(cu.tuan)?cu:{};
    const moi=!h.tuan||moc>h.tuan;
    const du={tuan:moi?moc:h.tuan,dem:moi?{}:{...h.dem},huyHieu:Array.isArray(h.huyHieu)?h.huyHieu.slice():[]};
    const i=du.tuan%5,ds=[mau[i],mau[5+(i+2)%5],mau[10+(i+4)%5]];
    const loai=suKien.loai,n=Number(suKien.n??1);
    if(ds.some(x=>x.loai===loai)&&Number.isFinite(n)&&n>0)du.dem[loai]=Math.min(100,(Number(du.dem[loai])||0)+n);
    const moiNhan=[];
    for(const m of ds){
      const tienDo=['phong','tiem','traSua'].includes(m.loai)?Number(hienCo[m.loai])||0:Number(du.dem[m.loai])||0;
      if(tienDo>=m.can&&!du.huyHieu.some(x=>x.tuan===du.tuan&&x.ma===m.ma)){
        const h={tuan:du.tuan,ma:m.ma};du.huyHieu.push(h);moiNhan.push(m.ma);
      }
    }
    return {du,ds:ds.map(m=>({...m,co:du.huyHieu.some(x=>x.tuan===du.tuan&&x.ma===m.ma)?m.can:Math.min(m.can,['phong','tiem','traSua'].includes(m.loai)?Number(hienCo[m.loai])||0:Number(du.dem[m.loai])||0)})),moiNhan};
  }
  const loi={ngay,nhom,nhomBat,luot,tuan,mau,capTuan};
  if(typeof module !== 'undefined' && module.exports)module.exports=loi;
  else g.DotWeb=loi;
})(globalThis);
