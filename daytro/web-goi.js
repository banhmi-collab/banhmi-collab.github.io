// Chỉ giới thiệu gói trên web; không thay nguồn hay cầu nối app.
(function(){
  'use strict';
  if(window.ReactNativeWebView || !window.DayTroWeb?.moGoi)return;
  const giaGoiHienThi=id=>window.DayTroWeb.GIA[id].toLocaleString('vi-VN')+'đ';
  function monGoiKhoa() {
  const ds = [
    { goi:'goi_tet', nhan:'Gói Tết', ten:'Câu đối đỏ', ve:TREO.find(t => t.goi === 'goi_tet').ve },
    { goi:'goi_noel', nhan:'Gói Noel', ten:DO.cayThongMini.ten, ve:DO.cayThongMini.ve },
    { goi:'meo_cung', nhan:'Mèo cưng', ten:'Mèo cưng', ve:() => veMeo(false) },
    { goi:'khoi_nghiep', nhan:'Khởi nghiệp', ten:'Biển neon Dãy Trọ', ve:TREO.find(t => t.goi === 'khoi_nghiep').ve },
  ].filter(d => !coGoi(d.goi));
  const dau = ds.length ? st.thang % ds.length : 0;
  const xoay = [...ds.slice(dau), ...ds.slice(0,dau)];
  if (ganTet()) xoay.sort((a,b) => Number(b.goi === 'goi_tet') - Number(a.goi === 'goi_tet'));
  return xoay.slice(0,2);
}

  const css=document.createElement('style');
  css.textContent="  .goi-khoa {position:relative;border-style:dashed;cursor:pointer}\n  .goi-khoa .do-khoa {opacity:.4}\n  .goi-khoa .nhan-khoa {position:absolute;top:4px;right:4px;z-index:1}\n  .goi-khoa .nhan-khoa svg {width:20px;height:20px}\n  .goi-khoa .gia span {display:block}\n  .goi-khoa .gia {font-size:12px;line-height:1.2;white-space:normal;overflow-wrap:anywhere}\n  /* Màn thấp đang ẩn dòng tiền thuê: nhường 9px hình cho nhãn gói hai dòng. */\n  @media(max-height:799px) and (orientation:portrait){\n    .goi-khoa .do-khoa {height:61px}\n  }\n  @media(max-height:799px) and (orientation:portrait) and (max-width:360px){\n    .goi-khoa .do-khoa {height:35px}\n  }\n";
  document.head.append(css);
  const veCu=veTiem;
  veTiem=function(...a){
    const kq=veCu(...a);
    document.getElementById('ke').insertAdjacentHTML('beforeend',monGoiKhoa().map(d => `<div class="the goi-khoa" data-goi-khoa="${d.goi}" tabindex="0" role="button" aria-label="${d.ten} · mở khóa ${GOI_INFO[d.goi].ten.trim()} · ${giaGoiHienThi(d.goi)}">`
    + `<span class="nhan-khoa" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
    + `<svg class="do-khoa" viewBox="-150 -290 300 350" aria-hidden="true">${d.ve()}</svg><div class="ten">${d.ten}</div><div class="gia"><span>${d.nhan}</span><span>${giaGoiHienThi(d.goi)}</span></div></div>`).join(''));
    document.querySelectorAll('#ke .do-khoa').forEach(v=>{
      const b=v.getBBox(),canh=Math.max(b.width,b.height)+24;
      v.setAttribute('viewBox', [b.x+b.width/2-canh/2,b.y+b.height/2-canh/2,canh,canh].map(f).join(' '));
    });
    return kq;
  };
  // Chặn riêng thao tác kéo của thẻ khóa trước listener nguồn dùng chung.
  document.getElementById('ke').addEventListener('pointerdown',e=>{
    if(e.target.closest('[data-goi-khoa]'))e.stopImmediatePropagation();
  },true);
  function bamMonKhoa(e) {
  const the = e.target.closest('[data-goi-khoa]');
  if (!the || st.dem || document.querySelector('.phu.hien,.web-bang')) return;
  if (e.type === 'keydown' && !['Enter',' '].includes(e.key)) return;
  e.preventDefault();
  try { window.warmJarThongKe?.('goi_xem_khoa', { goi:the.dataset.goiKhoa }); } catch { /* Đo lỗi vẫn mua được. */ }
  window.DayTroWeb.moGoi(the.dataset.goiKhoa);
}
$('#ke').addEventListener('click', bamMonKhoa);
$('#ke').addEventListener('keydown', bamMonKhoa);

  veTiem();
  window.DayTroWeb.goiKhoaSanSang=true;
})();
