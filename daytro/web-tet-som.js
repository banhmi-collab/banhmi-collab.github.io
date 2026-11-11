// Đợt 2 (việc thêm 10/11): nhắc mua sớm gói Tết khi mở game, mỗi ngày tối đa 1 lần,
// chỉ khi còn hạn mua sớm (cau-hinh-web.json → muaSom) và người chơi chưa có Gói Tết. Áp cho cả hai nhóm A/B #77.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const W=window.DayTroWeb;if(!W?.muaSomCon||!W?.moGoi)return;
  const K_NGAY='day-tro-tet-som-ngay';
  const doWeb=(ten,p={})=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const daVao=()=>typeof st!=='undefined'&&!!st&&typeof daVaoGame!=='undefined'&&daVaoGame;
  const homNay=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
  const dayDu=()=>{try{return !!JSON.parse(localStorage.getItem('day-tro-web-day-du'));}catch{return false;}};
  const coTet=()=>typeof coGoi==='function'&&coGoi('goi_tet');
  function nenHien(){
    try{if(Number(localStorage.getItem(K_NGAY))===homNay())return false;}catch{return false;}
    return W.muaSomCon('goi_tet')&&!coTet();
  }
  function hien(){
    if(!nenHien())return false;
    try{localStorage.setItem(K_NGAY,String(homNay()));}catch{}
    const goi=dayDu()?'goi_tet':'combo_tet';
    const nen=document.createElement('section');nen.id='tetSom';nen.setAttribute('aria-label','Mua sớm gói Tết');
    nen.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:1000;background:#FFF5DC;color:#483C32;border:2px solid #C0392B;border-radius:14px;padding:12px 14px;box-shadow:0 4px 20px #0003;max-width:480px;margin:0 auto';
    const t=document.createElement('p');t.style.cssText='font-weight:800;margin:0 0 6px';t.textContent='🧧 Tết sắp về dãy trọ';
    const c=document.createElement('p');c.style.margin='2px 0';c.textContent='Mua gói Tết trước 30/11 được tặng thêm Câu đối mua sớm.';
    const hang=document.createElement('div');hang.style.cssText='display:flex;gap:8px;margin-top:10px';
    const xem=document.createElement('button');xem.className='nut';xem.style.cssText='flex:2;min-height:44px';xem.textContent='Xem gói Tết';
    xem.onclick=()=>{nen.remove();doWeb('web_tet_som_bam');W.moGoi(goi);};
    const sau=document.createElement('button');sau.className='lai';sau.style.cssText='flex:1;min-height:44px';sau.textContent='Để sau';sau.onclick=()=>nen.remove();
    hang.append(xem,sau);nen.append(t,c,hang);document.body.append(nen);doWeb('web_tet_som_hien');
    return true;
  }
  // Mở game xong thì đợi thẻ "Có gì mới"/bảng khác đóng rồi mới hiện, không chồng thẻ.
  let lan=0;
  const hen=setInterval(()=>{
    if(!daVao())return;
    if(document.querySelector('#coGiMoi,#chuTroThe,.phu.hien,.web-bang')&&++lan<60)return;
    clearInterval(hen);setTimeout(hien,1500);
  },2000);
  window.TetSomWeb={hien,nenHien};
})();
