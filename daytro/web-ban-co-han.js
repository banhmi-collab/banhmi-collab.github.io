// #65 A: món "Câu đối mua sớm" tặng người mua Gói Tết/Combo/Trọn bộ trước muaSom.den (cau-hinh-web.json).
// Chỉ web. Chỉ thêm ở cuối TREO (file nạp sau cùng): chỉ số món cũ trong ván lưu giữ nguyên.
(() => {
  'use strict';
  if(window.ReactNativeWebView||typeof TREO==='undefined')return;
  TREO.push({ten:'Câu đối mua sớm',gia:0,thue:60,goi:'tet_mua_som',ve:()=>[214,326].map(x=>`<rect class="n" x="${x-15}" y="-240" width="30" height="122" rx="3" fill="${DAT}" stroke="${VANG_MAI}" stroke-width="4"/>`
    +[0,1,2].map(j=>`<circle cx="${x}" cy="${-214+j*36}" r="8" fill="${VANG_MAI}"/>`).join('')).join('')
    +`<circle cx="270" cy="-198" r="26" fill="${DAT}" stroke="${VANG_MAI}" stroke-width="4"/>`
    +`<text x="270" y="-191" text-anchor="middle" font-size="20" font-weight="800" fill="${VANG_MAI}" font-family="Be Vietnam Pro, sans-serif">Lộc</text>`
    +`<text x="270" y="-150" text-anchor="middle" font-size="12" font-weight="700" fill="${DAT}" font-family="Be Vietnam Pro, sans-serif">Tết 2027</text>`});
})();
