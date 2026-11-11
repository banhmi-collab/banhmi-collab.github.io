// Đợt 2 việc 3–5 (chỉ web): báo cho người chơi cũ biết có cập nhật.
// 3. Thẻ "Có gì mới": nội dung do Thảo viết trong cau-hinh-web.json → moi:{ma, dong:[…], nut:{chu, lam}, cham:[…]}.
//    Mỗi mã hiện 1 lần; người chơi lần đầu không thấy (với họ cái gì cũng mới).
// 4. Chấm "Mới" trên nút trong moi.cham (bộ chọn CSS), 7 ngày hoặc tới khi bấm.
// 5. Trang để mở lâu: quay lại mà trang web đã có bản mới thì hiện dải "Chạm để tải lại" (không tự tải lại).
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const K_XEM='day-tro-moi-da-xem',K_CHAM='day-tro-moi-cham',K_VAN='day-tro-cua-toi-v2';
  const doWeb=(ten,p={})=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const doc=(k,mac=null)=>{try{return JSON.parse(localStorage.getItem(k))??mac;}catch{return mac;}};
  const ghi=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
  const daVao=()=>typeof st!=='undefined'&&!!st&&typeof daVaoGame!=='undefined'&&daVaoGame;
  let nguoiMoi=false;try{nguoiMoi=!localStorage.getItem(K_VAN);}catch{}
  const MA=/^[\w-]{1,40}$/;

  function lam(viec){
    if(viec==='ru_ban')return window.RuBanWeb?.guiLoiRu?.();
    if(typeof viec==='string'&&viec.startsWith('#'))document.querySelector(viec)?.click();
  }
  function theMoi(m){
    const nen=document.createElement('section');nen.id='coGiMoi';nen.setAttribute('aria-label','Có gì mới');
    nen.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:1000;background:#FFF5DC;color:#483C32;border:2px solid;border-radius:14px;padding:12px 14px;box-shadow:0 4px 20px #0003;max-width:480px;margin:0 auto';
    const t=document.createElement('p');t.style.cssText='font-weight:800;margin:0 0 6px';t.textContent='✨ Có gì mới';nen.append(t);
    for(const d of m.dong.slice(0,3)){const p=document.createElement('p');p.style.margin='2px 0';p.textContent=d;nen.append(p);}
    const hang=document.createElement('div');hang.style.cssText='display:flex;gap:8px;margin-top:10px';
    if(m.nut&&typeof m.nut.chu==='string'){
      const b=document.createElement('button');b.className='nut';b.style.cssText='flex:2;min-height:44px';b.textContent=m.nut.chu.slice(0,40);
      b.onclick=()=>{nen.remove();doWeb('web_moi_bam');lam(m.nut.lam);};hang.append(b);
    }
    const sau=document.createElement('button');sau.className='lai';sau.style.cssText='flex:1;min-height:44px';sau.textContent='Để sau';sau.onclick=()=>nen.remove();
    hang.append(sau);nen.append(hang);document.body.append(nen);doWeb('web_moi_hien');
  }
  function chamMoi(m){
    const ds=Array.isArray(m.cham)?m.cham.filter(x=>typeof x==='string').slice(0,5):[];if(!ds.length)return;
    const luu=doc(K_CHAM,{});if(luu.ma!==m.ma){luu.ma=m.ma;luu.tu=Date.now();luu.bam=[];ghi(K_CHAM,luu);}
    if(Date.now()-luu.tu>7*864e5)return;
    if(!document.getElementById('coGiMoiKieu')){const s=document.createElement('style');s.id='coGiMoiKieu';
      s.textContent='.moi-cham{position:relative}.moi-cham::after{content:"Mới";position:absolute;top:-8px;right:-8px;background:#D9534F;color:#fff;font-size:11px;font-weight:800;padding:1px 5px;border-radius:8px;pointer-events:none}';document.head.append(s);}
    const gan=()=>{for(const sel of ds){if(luu.bam.includes(sel))continue;let n;try{n=document.querySelector(sel);}catch{continue;}
      if(!n||n.classList.contains('moi-cham'))continue;n.classList.add('moi-cham');
      n.addEventListener('click',()=>{n.classList.remove('moi-cham');luu.bam.push(sel);ghi(K_CHAM,luu);},{once:true});}};
    gan();setInterval(gan,3000);
  }
  // Trả true nếu sẽ hiện thẻ.
  function xet(m,moi=nguoiMoi){
    if(moi){ghi(K_XEM,m.ma);return false;}
    chamMoi(m);
    if(doc(K_XEM)===m.ma||!m.dong.length)return false;
    ghi(K_XEM,m.ma);setTimeout(()=>theMoi(m),1200);return true;
  }
  fetch('cau-hinh-web.json',{cache:'no-cache'}).then(r=>r.json()).then(j=>{
    const m=j?.moi;if(!m||!MA.test(m.ma||'')||!Array.isArray(m.dong))return;
    m.dong=m.dong.filter(x=>typeof x==='string').map(x=>x.slice(0,120));
    const hen=setInterval(()=>{if(!daVao())return;clearInterval(hen);xet(m);},1500);
  }).catch(()=>{});

  // 5. Bản đang chạy = danh sách tệp kèm ?v=; so với trang mới nhất khi người chơi quay lại.
  const banCua=html=>[...html.matchAll(/src="([^"]+\?v=[0-9a-f]{6,})"/g)].map(x=>x[1]).sort().join('|');
  const banNay=[...document.querySelectorAll('script[src*="?v="]')].map(s=>s.getAttribute('src')).sort().join('|');
  let lanCuoi=Date.now(),daBao=false;
  async function kiemBan(){
    if(daBao||!banNay||document.hidden||Date.now()-lanCuoi<10*60e3)return;lanCuoi=Date.now();
    try{
      const r=await fetch(location.pathname,{cache:'no-store'});if(!r.ok)return;
      const moi=banCua(await r.text());if(!moi||moi===banNay)return;
      daBao=true;const d=document.createElement('button');d.id='coBanMoi';d.textContent='Có bản mới · Chạm để tải lại';
      d.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:1002;background:#483C32;color:#FFF5DC;border:0;border-radius:20px;padding:10px 18px;min-height:44px;font-weight:700;box-shadow:0 2px 10px #0004';
      // Đang kéo đồ thì chờ thả tay; ván lưu sẵn trong máy nên tải lại không mất.
      d.onclick=()=>{try{if(typeof luu==='function')luu();}catch{}location.reload();};document.body.append(d);
    }catch{}
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void kiemBan();});
  window.CoGiMoiWeb={xet,kiemBan,banCua,theMoi};
})();
