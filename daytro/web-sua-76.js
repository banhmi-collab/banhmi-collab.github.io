// #76 chỉ web: giữ luật chơi, dữ liệu lưu và nguồn app nguyên vẹn.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const goCu=goCua;
  goCua=function(k){if(k==null){tiepHang();return;}return goCu.apply(this,arguments);};
  const deCu=deNghiBa;
  deNghiBa=function(...a){const de=deCu.apply(this,a);if(de&&de.tien===0&&st.tien>=0&&!st.rac.length&&(!st.khach||st.khach.o||vuaGia(st.khach)))return {...de,goiY:'Con thử dọn phòng trống rồi tìm khách mới nhé. Mở Sổ khách xem mọi người đang cần gì nha.'};return de;};

  // Các lớp web thêm mục Cài đặt khi tải cấu hình xong: đưa Đóng xuống cuối khi mở.
  const dong=document.getElementById('cdXong');
  const duaDongCuoi=()=>{if(dong.parentElement.lastElementChild!==dong)dong.parentElement.append(dong);};
  document.getElementById('nutCD').addEventListener('click',duaDongCuoi);
  new MutationObserver(duaDongCuoi).observe(dong.parentElement,{childList:true});duaDongCuoi();
  const game=document.getElementById('game');
  new MutationObserver(()=>{if(game.scrollTop&&game.querySelector(':scope>.phu.hien'))game.scrollTop=0;}).observe(game,{subtree:true,attributes:true,attributeFilter:['class']});

  // Chỉ gấp tiến độ; cảnh báo giữ ván và nút mở trình duyệt luôn ở ngoài.
  const thongBao=document.createElement('details');thongBao.id='web76ThongBao';
  thongBao.open=matchMedia('(min-width:600px) and (min-height:741px)').matches;
  const nhan=document.createElement('summary');thongBao.append(nhan);document.querySelector('.tren').append(thongBao);
  const gomDai=()=>{
    const ds=['web35Dem','web45Dai'].map(id=>document.getElementById(id)).filter(Boolean);
    for(const d of ds)if(d.parentElement!==thongBao)thongBao.append(d);
    const so=ds.filter(d=>!d.hidden).length,chu='Dãy trọ · '+so+' thông báo';
    if(nhan.textContent!==chu)nhan.textContent=chu;if(thongBao.hidden!==(so===0))thongBao.hidden=so===0;
    const moi=document.getElementById('web47-moi');
    if(moi&&!moi.dataset.gon76){
      moi.dataset.gon76='1';const p=moi.querySelector('p');
      p.title=p.textContent;p.textContent=({fb:'Facebook',zalo:'Zalo',tiktok:'TikTok',ig:'Instagram',messenger:'Messenger'}[window.MangVanWeb?.app]||'Trong app')+' dễ mất ván';
    }
  };
  new MutationObserver(gomDai).observe(document.querySelector('.tren'),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});gomDai();

  // Góc học nằm trong luồng, có thể thu gọn; kệ luôn có vùng chạm riêng.
  const viec=document.getElementById('web42ViecThang2');
  const gon=document.createElement('details');gon.id='web76GocHoc';gon.hidden=viec.hidden;
  const ten=document.createElement('summary');ten.textContent='Tháng 2 · Sắp góc học cho Linh';gon.append(ten,viec);
  document.querySelector('.tiem').before(gon);
  const hangNho=document.createElement('div');hangNho.id='web76HangNho';
  const xepHangNho=()=>{
    if(innerWidth<=599){if(hangNho.parentElement!==document.querySelector('.tren'))document.querySelector('.tren').append(hangNho);hangNho.append(thongBao,gon);}
    else{document.querySelector('.tren').append(thongBao);document.querySelector('.tiem').before(gon);hangNho.remove();}
  };
  xepHangNho();
  matchMedia('(max-width:599px)').addEventListener('change',()=>{if(innerWidth<=599)thongBao.open=false;xepHangNho();});
  const dongBo=()=>{gon.hidden=viec.hidden;ten.textContent=document.getElementById('web42ViecTen').textContent||'Tháng 2 · Sắp góc học cho Linh';};
  new MutationObserver(dongBo).observe(viec,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true});
  // Hết tháng có thể là nút chính hoặc nút phụ tùy khách: bọc đường chặn thật, không gắn theo nút.
  const hetCu=hetThang;
  hetThang=function(...a){
    const r=hetCu.apply(this,a);
    if(st?.thang===1&&!st.web42Thang2Xong&&!st.dem){dongBo();gon.open=true;gon.scrollIntoView({block:'nearest'});}
    return r;
  };

  // Chơi mới xoá ván đang lưu: chạm lần đầu chỉ hỏi lại, giống nút chơi lại trong Cài đặt.
  const nutMoi=document.getElementById('nutMoi'),chuMoi=nutMoi.textContent;
  let henMoi=null;
  nutMoi.addEventListener('click',e=>{
    clearTimeout(henMoi);
    if(nutMoi.classList.contains('chac76')){nutMoi.classList.remove('chac76');nutMoi.textContent=chuMoi;return;}
    e.stopImmediatePropagation();
    nutMoi.classList.add('chac76');nutMoi.textContent='Mất hết ván hiện tại · chạm lần nữa để chơi mới';
    henMoi=setTimeout(()=>{nutMoi.classList.remove('chac76');nutMoi.textContent=chuMoi;},5000);
  },true);

  const css=document.createElement('style');
  css.textContent=`
    #nutMoi.chac76{color:#C0392B;font-weight:800}
    /* index.html có hai @keyframes rung; bản sau của bàn tay hướng dẫn kéo nút Việc/Hộp thư lệch nửa kích thước. */
    @keyframes rungNut76{0%,70%,100%{transform:none}75%{transform:rotate(-6deg)}85%{transform:rotate(6deg)}}
    .lai.rung{animation-name:rungNut76}
    #game{overflow-y:auto;overflow-x:hidden}
    #game .tren{row-gap:4px;flex-shrink:0}
    #web35Dem{min-width:0;overflow-wrap:anywhere}
    #web76ThongBao{grid-column:1/-1;min-width:0;background:#FFF9EC;border:1px solid #a48d68;border-radius:8px;font-size:12px}
    #web76ThongBao summary{min-height:44px;padding:12px 8px;cursor:pointer}
    #web76ThongBao>div,#web76ThongBao>aside{margin:4px;width:auto}
    #web47-moi{padding:0 32px 0 6px;min-height:44px;font-size:12px;line-height:1.2;gap:4px}
    #web47-moi .web47-nhom{gap:4px}
    #web47-moi .web47-nhom .web47-nut{padding:4px 6px;font-size:12px;min-height:44px}
    #web47-moi .web47-dong{width:32px;min-height:44px}
    #phongKhung{min-height:312px;flex-shrink:0}
    #phongKhung #phong{top:48px;bottom:64px;right:56px;width:calc(100% - 56px);height:calc(100% - 112px)}
    #zoomPhong{right:6px;gap:8px}
    #zoomPhong .nut-tron{width:44px;height:44px;min-width:44px;min-height:44px}
    #zoomPhong .nut-tron::before{display:none}
    #popup{z-index:10}
    @media(prefers-reduced-motion:reduce){.hd-tay{left:var(--x1,0);top:var(--y1,0)}}
    #web76GocHoc{flex:none;background:#FFF9EC;border:1px solid #795039;border-radius:8px;margin:0 8px;font-size:13px}
    #web76GocHoc summary{min-height:44px;padding:10px;cursor:pointer}
    #web76GocHoc #web42ViecThang2{position:static;margin:0;border:0;box-shadow:none;width:auto}
    #game .tiem{flex-shrink:0}
    @media(max-width:599px){
      #web76HangNho{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:flex-start;gap:4px;min-width:0}
      #web76HangNho>details{flex:1;min-width:0;margin:0;font-size:12px}
      #web76HangNho>details[open]{flex-basis:100%;order:1}
      #web76HangNho summary{font-size:12px;padding:8px;line-height:1.2;min-height:44px;display:list-item}
      #phongKhung{min-height:292px}
      #phongKhung #phong{top:48px;bottom:44px;height:calc(100% - 92px)}
      #phongKhung .hanh-dong{bottom:0}
      #phongKhung .hanh-dong .nut{min-height:44px;height:44px;padding:6px 12px;font-size:14px}
    }
    @media(max-height:740px) and (max-width:599px){
      #game .tren{padding:4px 8px;gap:4px}
      #game .tiem{padding:16px 0 2px}
    }
  `;document.head.append(css);
})();
