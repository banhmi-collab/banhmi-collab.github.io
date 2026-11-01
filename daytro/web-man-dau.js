// Chỉ web. #52: màn đầu của người chơi mới cho thấy ngay game trông thế nào (phòng trước → sau),
// cùng kiểu video TikTok đang kéo người vào. Người đã có ván giữ hình cũ để không đổi chỗ quen.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const goc=document.getElementById('anhBia'),moi=document.getElementById('nutMoi');
  if(!goc||!moi||!moi.hidden)return;
  const css=document.createElement('style');
  css.textContent=`#moDau .anh-bia.web-ts{position:relative;margin:12px auto 0;max-width:320px}#moDau .web-ts img{display:block;width:100%;height:auto;aspect-ratio:600/270;border-radius:12px;border:2px solid var(--muc,#5b4030)}#moDau .web-ts span{position:absolute;top:8px;padding:2px 10px;border-radius:999px;font:700 12px/1.6 'Be Vietnam Pro',sans-serif;letter-spacing:1px;color:#fff9ed}#moDau .web-ts .truoc{left:8px;background:#503a2c}#moDau .web-ts .sau{left:calc(50% + 8px);background:#4d6b4f}#moDau .web-ts p{margin:6px 0 0;font-size:13px}@media (max-height:580px){#moDau .anh-bia.web-ts{max-width:240px}}`;
  document.head.append(css);
  const img=new Image();img.src='pwa/truoc-sau.png';img.width=600;img.height=270;img.decoding='async';
  img.alt='Căn phòng trọ trước khi dọn: tối và trống; sau khi bày: có giường, bàn học, cây xanh';
  const cu=[...goc.childNodes];
  img.onerror=()=>{goc.classList.remove('web-ts');goc.setAttribute('aria-hidden','true');goc.replaceChildren(...cu);};
  const nhan=(lop,chu)=>{const s=document.createElement('span');s.className=lop;s.textContent=chu;s.setAttribute('aria-hidden','true');return s;};
  const p=document.createElement('p');p.textContent='Căn phòng của bạn, sau vài phút chơi';
  goc.classList.add('web-ts');goc.removeAttribute('aria-hidden');goc.replaceChildren(img,nhan('truoc','TRƯỚC'),nhan('sau','SAU'),p);
  window.ManDauWeb={doi:true};
})();
