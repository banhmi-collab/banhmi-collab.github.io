// Nạp sớm trong HTML web để đo cả lúc rời đi trước khi game sẵn sàng.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const khoa='daytro-tai-xong',daCo=()=>{try{return sessionStorage.getItem(khoa)==='1';}catch{return false;}};
  let xong=daCo();
  function ghi(boDi){
    if(xong||daCo())return;xong=true;
    const s=Math.round(performance.now()/1000),giay=s<=1?'0_1':s<=3?'1_3':s<=6?'3_6':s<=10?'6_10':'tren_10';
    try{sessionStorage.setItem(khoa,'1');}catch{ /* Vẫn đo được trong trang hiện tại. */ }
    window.dayTroTaiXong={giay,bo_di:boDi};
    window.dispatchEvent(new Event('daytro:tai-xong'));
    dung();
  }
  function sanSang(){const b=document.getElementById('nutMo');if(b&&!b.disabled&&!b.hasAttribute('aria-busy'))ghi(0);}
  function roiTrang(){sanSang();if(!xong)ghi(1);}
  function anTrang(){if(document.visibilityState==='hidden')roiTrang();}
  const theoDoi=new MutationObserver(sanSang);
  function dung(){theoDoi.disconnect();window.removeEventListener('pagehide',roiTrang);document.removeEventListener('visibilitychange',anTrang);}
  if(xong)return;
  theoDoi.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','aria-busy']});
  window.addEventListener('pagehide',roiTrang);document.addEventListener('visibilitychange',anTrang);
  sanSang();
})();
