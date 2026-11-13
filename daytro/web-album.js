// #79.4a Album bộ sưu tập (chỉ web). Bật bằng cau-hinh-web.json "album": true (mặc định tắt, dành cho sau Tết).
// Liệt kê các gói trang trí: đã có / chưa có, tiến độ "n/N bộ"; đủ bộ thì hiện danh hiệu "Nhà sưu tầm" trong album.
// Không bán gì mới ở đây: bấm gói chưa có thì mở đúng thẻ mua sẵn có.
(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.DayTroWeb)return;
  const W=window.DayTroWeb;let bat=false;
  fetch('cau-hinh-web.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(c=>{bat=c?.album===true;},()=>{});
  const co=id=>{try{return typeof coGoi==='function'&&coGoi(id);}catch{return false;}};
  function tienDo(){const ds=W.GOI_TRANG_TRI.map(g=>({id:g.id,ten:g.nhan,co:co(g.id)}));return {ds,co:ds.filter(x=>x.co).length,tong:ds.length};}
  function mo(){
    const u=W.uiMua;if(!u)return;const k=tienDo(),h=u.bang('Album bộ sưu tập');h.parentNode.id='albumWeb';
    u.chu(h,'Đã sưu tầm '+k.co+'/'+k.tong+' bộ.'+(k.co===k.tong?' Danh hiệu: Nhà sưu tầm của xóm!':''));
    const luoi=document.createElement('div');luoi.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0';h.append(luoi);
    for(const x of k.ds){
      const o=document.createElement('button');o.type='button';o.dataset.albumGoi=x.id;o.className='lai';
      o.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;border:1px solid #b99b80;border-radius:12px;padding:8px;margin:0;text-decoration:none;min-height:120px;'+(x.co?'':'opacity:.55;filter:grayscale(1)');
      o.innerHTML=(W.hinhGoiTrangTri?.(x.id)||'')+'<b style="font-size:13px"></b><span style="font-size:12px"></span>';
      o.querySelector('b').textContent=x.ten;o.querySelector('span').textContent=x.co?'Đã có':'Chưa có';
      o.querySelector('svg')?.setAttribute('style','width:64px;height:64px');
      o.onclick=()=>{if(!x.co){h.parentNode.remove();W.moGoi?.(x.id);}};luoi.append(o);
    }
    u.dongNut(h);u.doWeb('web_album_mo',{co:k.co,tong:k.tong});
  }
  // Nút "Album" ở đầu Cửa hàng khi bật.
  (W.themVaoManMua||=[]).push((noi,{dayDu})=>{
    if(!bat||!dayDu||noi.querySelector('[data-album]'))return;
    const k=tienDo(),b=document.createElement('button');b.type='button';b.className='nut';b.dataset.album='';
    b.textContent='Album bộ sưu tập · '+k.co+'/'+k.tong+' bộ';b.onclick=mo;noi.prepend(b);
  });
  window.AlbumWeb={mo,tienDo,batThu:v=>{bat=!!v;}};
})();
