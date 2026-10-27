// Hai dấu bên dưới được công cụ đóng gói thay bằng băm nội dung và danh sách tệp.
const PHIEN='3cb94696163bbccc';
const TEP=["./","./ban-choi-thu.js","./dieu-khoan.html","./font/BeVietnamPro-400.woff2","./font/BeVietnamPro-600.woff2","./font/BeVietnamPro-800.woff2","./font/Mali-Regular.woff2","./font/Mali-SemiBold.woff2","./game.js","./icon.js","./index.html","./manifest.webmanifest","./nhac-nen.js","./pwa/chia-se-1200x630.png","./pwa/icon-192.png","./pwa/icon-512.png","./pwa/maskable-512.png","./thong-ke-web.js","./vendor/qrcode-1.0.0.min.js","./web-dot-3-loi.js","./web-ghe-tua.js","./web-goi.js","./web-huong-dan.js","./web-keo-muot.js","./web-khoe.js","./web-lat-do.js","./web-loi.js","./web-moi-thu-kin.js","./web-mua-le.js","./web-pwa.js","./web-thu-thach.js","../thu-svg/ve.js"];
const KHO='daytro-'+PHIEN;
const boQua=u=>u.origin!==self.location.origin||u.pathname.includes('/api/')||/\/(?:cau-hinh-web|ngan-hang|ma-web)\.json$/.test(u.pathname);
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(KHO);await c.addAll(TEP);await self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('daytro-')&&k!==KHO)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);if(r.method!=='GET'||boQua(u))return;
  // Phạm vi trang và hình phòng dùng chung là hai vị trí duy nhất được cache.
  if(!u.pathname.startsWith('/daytro/')&&u.pathname!=='/thu-svg/ve.js')return;
  const dong=/\.(?:ttf|woff2?|png|svg|webp|jpg|ico)$/.test(u.pathname);
  e.respondWith((async()=>{
    const c=await caches.open(KHO),k=r.mode==='navigate'?new URL('./',self.location.href).href:u.origin+u.pathname;
    if(dong){const cu=await c.match(k);if(cu)return cu;}
    // Request điều hướng không nhận RequestInit mới; dùng URL để vẫn ép tải mới.
    try{const moi=await fetch(r.mode==='navigate'?r.url:r,{cache:'no-store'});if(moi.ok){await c.put(k,moi.clone());return moi;}const cu=await c.match(k);return cu||moi;}
    catch{const cu=await c.match(k);if(cu)return cu;throw Error('Chưa có bản lưu khi mất mạng');}
  })());
});
