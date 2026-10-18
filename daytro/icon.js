// Đồ vật của chủ trọ: một nét nâu, màu phẳng; không phụ thuộc emoji của máy.
const NET_ICON = {
 bangKhen:'<path fill="#F2E8D5" d="m7 7 34 1-1 32-33 1Z"/><path d="m12 13 22 1M12 20h12m-12 6h10"/><circle fill="#D9B27C" cx="31" cy="29" r="6"/><path fill="#C97B5A" d="m27 34-2 10 6-4 6 3-2-10"/>',
 dayTro:'<path fill="#F2E8D5" d="M4 17 12 9l8 8 8-8 16 8v24H4Z"/><path d="M17 18v23m13-23v23M8 41V27h5v14m8 0V27h5v14m8 0V27h6v14M5 19h38"/>',
 gopY:'<path fill="#F2E8D5" d="m5 18 32-2 2 25-32 1Z"/><path d="m6 19 16 12 15-14M8 40l10-12"/><path fill="#D9B27C" d="m24 27 15-22 5 4-15 22-7 4Z"/><path d="m36 9 5 4"/>',
 chiaKhoa:'<circle fill="#D9B27C" cx="16" cy="16" r="11"/><circle fill="#FFFDF8" cx="14" cy="14" r="3"/><path fill="#D9B27C" d="m23 23 19 16-4 5-5-4-3 2-5-5 2-3-10-10Z"/>',
 khoa:'<path fill="#F2E8D5" d="M11 22h27v21H11Z"/><path d="M17 22V13c0-12 16-12 16 0v9m-8 8v6"/>',
 tivi:'<path fill="#9CAF8C" d="m5 12 36-1 2 27-36 1Z"/><path fill="#F2E8D5" d="m10 17 23-1 1 17-23 1Z"/><path d="m15 5 9 7 9-9M16 40l-3 4m21-4 4 3m0-22v5"/>',
 qua:'<path fill="#D9B27C" d="M7 17 39 15 41 40 9 42Z"/><path d="m23 16 2 25M8 27l32-2M24 16C7 16 14 3 24 16c9-16 18-3 0 0Z"/><path fill="#FFFDF8" d="m29 31 10-1 1 7-10 1Z"/>',
 thu:'<path fill="#F2E8D5" d="m5 12 37-2 2 28-37 2Z"/><path d="m6 13 19 14 16-16M8 37l12-15m10-1 12 14"/>',
 lich:'<path fill="#FFFDF8" d="M9 9h31v32l-5-2-4 2-5-2-5 2-5-2-7 2Z"/><path fill="#C8452D" d="M9 9h31v10H9Z"/><path d="M16 5v9M33 5v9M19 26l5-3v12m-5 0h10"/>',
 so:'<path fill="#FFFDF8" d="M11 6h28v36H11Z"/><path d="M17 7v34M7 12h7M7 22h7M7 33h7m7-17h12M21 24h12M21 32h9"/>',
 nha:'<path fill="#F2E8D5" d="m7 21 17-15 18 14-3 1v20H10V21Z"/><path d="M20 40V27h9v13M15 19h5"/>',
 bacSi:'<path fill="#FFFDF8" d="M9 13h30v27H9Z"/><path d="M18 13V7h12v6m-6 8v12m-6-6h12"/>',
 sua:'<path fill="#D9B27C" d="M31 5a10 10 0 0 0-9 14L7 34a5 5 0 0 0 7 7l15-16A10 10 0 0 0 42 12l-8 7-6-6Z"/>',
 den:'<path fill="#F2E8D5" d="M18 32c0-8-7-9-7-17a13 13 0 0 1 26 0c0 8-7 9-7 17Z"/><path d="M18 33h12M19 38h10M21 43h6m-4-12V20l-5-4m5 4 6-4"/>',
 nuoc:'<path fill="#9CAF8C" d="M24 5C18 16 9 24 12 34c5 15 28 8 24-5C34 22 29 14 24 5Z"/><path d="M17 28q-1 6 5 8"/>',
 chuot:'<circle fill="#ABA49B" cx="16" cy="12" r="7"/><circle fill="#ABA49B" cx="32" cy="12" r="7"/><path fill="#F2E8D5" d="M10 21q14-17 28 0L24 42Z"/><path d="M17 23h1m12 0h1m-9 10h4M4 29l13 2m14 0 13-2"/>',
 wifi:'<path d="M5 16q19-17 38 0M11 23q13-12 26 0M18 30q6-5 12 0"/><circle fill="#9CAF8C" cx="24" cy="37" r="3"/>',
 canhBao:'<path fill="#F2E8D5" d="M24 6 44 41H4Z"/><path d="M24 18v12m0 5v1"/>',
 tien:'<path fill="#D9B27C" d="m5 13 36-2 2 26-36 2Z"/><circle fill="#FFFDF8" cx="24" cy="25" r="8"/><path d="M24 20v10m-4-7h8M11 21v8m26-10v8"/>',
 sao:'<path fill="#D9B27C" d="m24 5 6 13 14 2-10 10 2 14-12-7-12 7 2-14L4 20l14-2Z"/>',
 meo:'<path fill="#D9B27C" d="m9 21 1-15 11 8h7L39 6l1 15q9 22-15 22Q2 42 9 21Z"/><path d="M16 25h1m15 0h1m-12 7h7m-3 0v4M5 29l10 2m19 0 10-2"/>',
 cuaHang:'<path fill="#F2E8D5" d="M9 21h30v20H9Z"/><path fill="#9CAF8C" d="M6 21 11 7h26l5 14Z"/><path d="M20 41V28h12v13M17 8l-2 13M30 8l2 13"/>',
 cay:'<path fill="#9CAF8C" d="m24 4-12 14h5L8 30h32L31 18h5Z"/><path fill="#D9B27C" d="M21 30h6v12h-6Z"/>',
 banh:'<path fill="#D9B27C" d="M10 23h28l-3 18H13Z"/><path fill="#FFFDF8" d="M10 23c-7-7 0-15 7-12 2-10 17-9 17 1 10-2 13 12 4 11Z"/>',
 tra:'<path fill="#FFFDF8" d="M12 16h25l-4 26H16Z"/><path d="m25 16 6-12h8M11 16h27M16 26h17m-9 9v1"/>',
 trangTri:'<path fill="#F2E8D5" d="M6 8h36v33H6Z"/><path fill="#9CAF8C" d="m11 35 9-13 8 9 5-7 5 11Z"/><circle fill="#D9B27C" cx="30" cy="17" r="4"/>',
 mayAnh:'<path fill="#ABA49B" d="M6 15h10l4-7h10l4 7h9v25H6Z"/><circle fill="#FFFDF8" cx="25" cy="27" r="9"/>',
 caiDat:'<path fill="#F2E8D5" d="m19 5 10 0 2 7 7 2 5 9-5 6-1 8-9 5-6-5-8-1-5-9 4-6-1-8 7-3Z"/><circle fill="#FFFDF8" cx="25" cy="24" r="7"/>',
 chuong:'<path fill="#D9B27C" d="M9 34c6-4 3-16 7-20 6-7 16-4 18 2 3 6-1 13 6 18Z"/><path d="M21 7h5m-7 32q5 6 10 0"/>',
 tay:'<path fill="#F2E8D5" d="M16 27V9q3-6 6 0v15-5q3-5 6 0v5-3q3-5 6 0v5-2q4-4 7 1v10l-9 10H19L7 30q-2-8 5-5l4 4Z"/>',
 vui:'<circle fill="#F2E8D5" cx="24" cy="24" r="18"/><path d="M16 19h1m14 0h1M15 28q9 12 18 0"/>',
};
function bieuTuong(ten) {
 return `<svg class="icon-ve" data-bieu-tuong="${ten}" viewBox="0 0 48 48" fill="none" stroke="#6B4631" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NET_ICON[ten] || NET_ICON.thu}${ten==='qua'?'<path fill="#FFFDF8" d="m25 28 21-2 1 14-21 2Z"/><text x="28" y="36" font-family="Mali" font-size="8" stroke="none" fill="#6B4631">quà</text>':''}</svg>`;
}
document.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=bieuTuong(e.dataset.icon));
// Chỉ dựng phần nhãn; không đụng người nghe bấm, thuộc tính hay trạng thái nút.
function nhanHinh(e, ten, chu) {
 e.innerHTML = bieuTuong(ten);
 const nhan = document.createElement('span'); nhan.textContent = chu; e.append(nhan);
}
