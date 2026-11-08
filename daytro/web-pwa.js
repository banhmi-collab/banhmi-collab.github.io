(() => {
  'use strict';
  if(window.ReactNativeWebView||window.MangVanWeb?.trongApp)return;
  const KHOA='day-tro-pwa-goi-y',tuan=7*86400000;
  const daCai=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const safari=ios&&/Safari/.test(navigator.userAgent)&&!/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
  let loiMoi=null,daHien=false;
  const doWeb=ten=>{try{window.warmJarThongKe?.(ten);}catch{}};
  const luu=giaTri=>{try{localStorage.setItem(KHOA,JSON.stringify(giaTri));}catch{}};
  function doc(){try{return JSON.parse(localStorage.getItem(KHOA))||{};}catch{return {};}}
  // Hẹn thật đi qua hienHenMai; chờ người chơi đọc/đóng bảng rồi mới mời.
  // Người chưa thấy hẹn vẫn có đường mời cũ ngay lần đầu đủ điều kiện.
  let daThayHen=false,choKiem=false;
  function henKiem(){
    if(!daThayHen||daHien||choKiem)return;
    choKiem=true;
    queueMicrotask(()=>{choKiem=false;goiY();});
  }
  window.addEventListener('daytro:hen-hien',()=>{daThayHen=true;henKiem();});
  new MutationObserver(henKiem).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  function dong(daNhan=false){document.getElementById('pwaGoiY')?.remove();luu(daNhan?{daNhan:true}:{lanSau:Date.now()+tuan});}
  function duDieuKien(){
    const thu=['127.0.0.1','localhost'].includes(location.hostname)&&window.__thuLop42;
    if(thu&&thu.gon===false){let dayDu=false;try{dayDu=!!localStorage.getItem('day-tro-web-day-du');}catch{}return (typeof st!=='undefined'&&st?.thang>1)||dayDu;}
    return typeof st!=='undefined'&&st?.thang>=1;
  }
  function goiY(){
    const sauHen=daThayHen;
    const cu=doc();
    if(daHien||daCai()||cu.daNhan||cu.lanSau>Date.now()||!duDieuKien()||(!safari&&!loiMoi)||document.querySelector('.phu.hien,.web-bang,#loa.hen-web-71.hien'))return;
    daHien=true;doWeb('web_pwa_goi_y');if(sauHen)doWeb('web_pwa_goi_y_hen');
    const lop=document.createElement('div');lop.id='pwaGoiY';lop.className='phu toi hien';lop.setAttribute('role','dialog');lop.setAttribute('aria-modal','true');lop.setAttribute('aria-labelledby','pwaTieuDe');
    const hop=document.createElement('div');hop.className='tam';lop.append(hop);
    const h=document.createElement('h2');h.id='pwaTieuDe';h.textContent='Ghé dãy trọ dễ hơn';hop.append(h);
    const chu=document.createElement('p');chu.textContent=sauHen?'Thêm biểu tượng để mai mở lại trong một chạm.':'Thêm Dãy Trọ vào màn hình để lần sau mở nhanh như một ứng dụng nhé.';hop.append(chu);
    if(safari){
      const buoc=document.createElement('div');buoc.innerHTML='<p>'+bieuTuong('khoe')+'<b>1.</b> Bấm Chia sẻ trong Safari (ô vuông có mũi tên lên).</p><p>'+bieuTuong('nha')+'<b>2.</b> Chọn “Thêm vào MH chính”, rồi bấm Thêm.</p>';
      // Icon sẵn có vẫn có nét vẽ tay; icon Chia sẻ dùng đúng hình ô vuông/mũi tên.
      buoc.querySelector('svg').innerHTML='<path d="M12 22v18h24V22M24 30V6m-8 8 8-8 8 8"/>';
      hop.append(buoc);
    }
    const nut=document.createElement('button');nut.className='nut';nut.textContent=safari?'Mình đã hiểu':'Thêm Dãy Trọ vào màn hình';
    nut.onclick=async()=>{
      if(safari){dong(true);return;}
      const moi=loiMoi;loiMoi=null;if(!moi){dong();return;}
      try{await moi.prompt();const k=await moi.userChoice;dong(k.outcome==='accepted');}catch{dong();}
    };hop.append(nut);
    const sau=document.createElement('button');sau.className='lai';sau.textContent='Để sau';sau.onclick=()=>dong();hop.append(sau);
    document.body.append(lop);nut.focus();
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();loiMoi=e;goiY();});
  window.addEventListener('appinstalled',()=>{dong(true);doWeb('web_pwa_cai');doWeb('web_pwa_da_cai');});
  if(daCai()){
    luu({daNhan:true});
    if(new URLSearchParams(location.search).get('utm_source')==='pwa')doWeb('web_pwa_cai');
  }
  // #77 dùng lại đúng lời mời trình duyệt đã giữ; không mở thêm cửa sổ chặn.
  window.PwaWeb=Object.freeze({daCai,ios,safari,coTheMoi:()=>!!loiMoi,async moi(){
    const m=loiMoi;if(!m)return 'khong';loiMoi=null;
    try{await m.prompt();const k=await m.userChoice;const dat=k.outcome==='accepted';luu(dat?{daNhan:true}:{lanSau:Date.now()+tuan});return dat?'ok':'huy';}catch{return 'loi';}
  }});
  setInterval(goiY,1500);
  if('serviceWorker' in navigator)window.addEventListener('load',()=>{void navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});});
})();
