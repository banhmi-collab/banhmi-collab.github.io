// #79.1 Vòng quay lộc miễn phí mỗi ngày (chỉ web). Không bán lượt, quà chỉ là tiền trong game.
// 1 lượt/ngày theo ngày trên máy; quay ngày liền nhau thì chuỗi +1, bỏ 1 ngày thì về 1.
// Ngày thứ 7, 14, 21… của chuỗi: ô lớn 500k + 1 huy hiệu "Chủ trọ chăm".
// Thẻ Chủ trọ chăm (#79.2) cho thêm 1 lượt/ngày qua VongQuayWeb.themLuot().
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const KHOA='day-tro-vong-quay';
  // Tiền trong game là nghìn đồng (50 = 50.000đ). Ô nhỏ hay ra hơn ô lớn.
  const O=[{k:50,w:22},{k:80,w:18},{k:100,w:18},{k:120,w:12},{k:150,w:12},{k:200,w:9},{k:250,w:5},{k:300,w:4}];
  const LON=500,MAU=['#F6D9A8','#FBEBD0','#F6D9A8','#FBEBD0','#F6D9A8','#FBEBD0','#F6D9A8','#FBEBD0'];
  const ngay=(d=new Date())=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  const homQua=(d=new Date())=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1);return ngay(x);};
  const doc=()=>{try{const v=JSON.parse(localStorage.getItem(KHOA));return v&&typeof v==='object'?v:{};}catch{return {};}};
  const ghi=v=>{try{localStorage.setItem(KHOA,JSON.stringify(v));return true;}catch{return false;}};
  const doWeb=(ten,p={})=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const daVao=()=>typeof st!=='undefined'&&!!st&&typeof daVaoGame!=='undefined'&&daVaoGame&&(typeof hdXong==='undefined'||hdXong);
  // Lượt còn hôm nay: 1 lượt miễn phí + lượt thêm (thẻ) của đúng hôm nay.
  function con(v=doc(),h=ngay()){const free=v.ngay===h?0:1;const them=v.themNgay===h?Math.max(0,(v.them||0)-(v.daDungThem||0)):0;return free+them;}
  function chuoiMoi(v,h=ngay()){return v.ngay===h?(v.chuoi||1):v.ngay===homQua()?(v.chuoi||0)+1:1;}
  // Chọn ô: số ngẫu nhiên r∈[0,1) do máy sinh; tách ra để bài kiểm truyền vào.
  function chonO(r){const tong=O.reduce((s,o)=>s+o.w,0);let x=r*tong;for(let i=0;i<O.length;i++){x-=O[i].w;if(x<0)return i;}return O.length-1;}
  // Quay: trả {o, k, chuoi, lon} hoặc null nếu hết lượt. Ghi trạng thái trước khi cộng tiền.
  function quay(r=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296){
    const v=doc(),h=ngay();if(con(v,h)<1)return null;
    const dungFree=v.ngay!==h;const chuoi=dungFree?chuoiMoi(v,h):(v.chuoi||1);
    const lon=dungFree&&chuoi%7===0;const o=lon?-1:chonO(r),k=lon?LON:O[o].k;
    const moi={...v,tong:(v.tong||0)+1};
    if(dungFree){moi.ngay=h;moi.chuoi=chuoi;if(lon)moi.huyHieu=(v.huyHieu||0)+1;}else{moi.daDungThem=(v.daDungThem||0)+1;}
    if(!ghi(moi))return null;
    return {o,k,chuoi,lon};
  }
  function themLuot(n=1){const v=doc(),h=ngay();if(v.themNgay!==h){v.themNgay=h;v.them=0;v.daDungThem=0;}v.them=(v.them||0)+n;ghi(v);capNut();}
  // ---- giao diện
  const css=document.createElement('style');
  css.textContent=`#vongQuay{position:fixed;inset:0;z-index:100000;background:#281e14b8;display:flex;align-items:center;justify-content:center;padding:16px;font:15px/1.45 'Be Vietnam Pro',sans-serif;color:#3b2f25}
#vongQuay .hop{width:100%;max-width:360px;background:#fff8ee;border-radius:18px;padding:18px;box-sizing:border-box;text-align:center}
#vongQuay h2{font:700 22px 'Mali',sans-serif;margin:0 0 4px}#vongQuay .mo-ta{margin:0 0 10px;font-size:13px}
#vongQuay .banh{position:relative;width:260px;max-width:100%;margin:6px auto}
#vongQuay .banh svg{display:block;width:100%;height:auto;transition:transform 3.2s cubic-bezier(.12,.7,.15,1)}
#vongQuay .kim{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:0;height:0;border:14px solid transparent;border-top:26px solid #b0472f;filter:drop-shadow(0 2px 0 #3b2f25)}
#vongQuay .chuoi{display:flex;justify-content:center;gap:5px;margin:8px 0}#vongQuay .chuoi i{width:26px;height:26px;border-radius:50%;border:2px solid #b99b80;font:700 11px/22px sans-serif;font-style:normal;color:#7a5a3e}#vongQuay .chuoi i.xong{background:#e9b949;border-color:#b0472f;color:#3b2f25}#vongQuay .chuoi i.lon{width:30px;height:30px;line-height:26px}
#vongQuay .nut{display:block;width:100%;min-height:48px;margin:10px 0 0;border:0;border-radius:12px;background:#6b4a32;color:#fff;font:700 16px 'Be Vietnam Pro',sans-serif;cursor:pointer}#vongQuay .nut:disabled{opacity:.55}
#vongQuay .lai{display:block;margin:8px auto 0;min-height:44px;padding:8px 16px;background:none;border:0;color:#7a4a25;text-decoration:underline;font:inherit;cursor:pointer}
#vongQuay .ket{font:700 18px 'Mali',sans-serif;margin:8px 0 0;min-height:26px}
[data-loc]{position:relative}[data-loc].co-luot::after{content:'';position:absolute;top:4px;right:6px;width:10px;height:10px;border-radius:50%;background:#D9534F;box-shadow:0 0 0 2px #fff8ee}
@media (prefers-reduced-motion:reduce){#vongQuay .banh svg{transition-duration:.6s}}`;
  document.head.append(css);
  function banh(){
    const n=O.length,R=120,c=130;let s=`<svg viewBox="0 0 260 260" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${R+6}" fill="#6b4a32"/>`;
    for(let i=0;i<n;i++){const a0=(i/n)*2*Math.PI-Math.PI/2-Math.PI/n,a1=a0+2*Math.PI/n;
      const p=a=>`${(c+R*Math.cos(a)).toFixed(1)} ${(c+R*Math.sin(a)).toFixed(1)}`;
      s+=`<path d="M${c} ${c} L${p(a0)} A${R} ${R} 0 0 1 ${p(a1)}Z" fill="${MAU[i]}" stroke="#b99b80" stroke-width="1.5"/>`;
      const am=a0+Math.PI/n,tx=c+R*.68*Math.cos(am),ty=c+R*.68*Math.sin(am);
      s+=`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="Be Vietnam Pro,sans-serif" font-weight="700" font-size="17" fill="#3b2f25" transform="rotate(${(am*180/Math.PI+90).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})">${O[i].k}k</text>`;}
    return s+`<circle cx="${c}" cy="${c}" r="26" fill="#b0472f" stroke="#fff8ee" stroke-width="4"/><text x="${c}" y="${c+1}" text-anchor="middle" dominant-baseline="middle" font-family="Mali,sans-serif" font-weight="700" font-size="15" fill="#fff">Lộc</text></svg>`;
  }
  function chuoiHtml(n){const trong=((n-1)%7+7)%7+1;let s='';for(let i=1;i<=7;i++)s+=`<i class="${i<=trong?'xong':''} ${i===7?'lon':''}">${i===7?'500':i}</i>`;return s;}
  let goc=0;
  function mo(){
    if(document.getElementById('vongQuay')||!daVao())return;
    const v=doc(),h=ngay(),c=con(v,h),chuoiDangCo=v.ngay===h||v.ngay===homQua()?(v.chuoi||0):0;
    const nen=document.createElement('div');nen.id='vongQuay';nen.setAttribute('role','dialog');nen.setAttribute('aria-label','Quay lộc hôm nay');
    nen.innerHTML=`<div class="hop"><h2>Quay lộc hôm nay</h2><p class="mo-ta">Miễn phí mỗi ngày 1 lượt · quay 7 ngày liền, ngày thứ 7 được 500k</p>
<div class="banh"><div class="kim"></div>${banh()}</div><div class="chuoi" aria-label="Chuỗi ngày">${chuoiHtml(Math.max(1,chuoiDangCo||1))}</div><p class="ket" role="status"></p>
<button type="button" class="nut" data-quay>${c>0?'Quay'+(c>1?' · còn '+c+' lượt':''):'Mai quay tiếp nhé'}</button><button type="button" class="lai" data-dong>Đóng</button></div>`;
    if(!chuoiDangCo)nen.querySelectorAll('.chuoi i').forEach(i=>i.classList.remove('xong'));
    document.body.append(nen);
    const nut=nen.querySelector('[data-quay]'),ket=nen.querySelector('.ket'),sv=nen.querySelector('svg');nut.disabled=c<1;
    const sapLon=c>0&&v.ngay!==h&&chuoiMoi(v,h)%7===0;if(sapLon)nut.textContent='Nhận lộc lớn 500k';
    nen.querySelector('[data-dong]').onclick=()=>{nen.remove();capNut();};
    nut.onclick=()=>{
      const kq=quay();if(!kq){nut.disabled=true;return;}
      nut.disabled=true;doWeb('web_quay',{o:kq.lon?'lon':String(O[kq.o].k),chuoi:kq.chuoi});
      const n=O.length;if(!kq.lon){goc=goc-goc%360+360*5+(360-kq.o*360/n);sv.style.transform=`rotate(${goc}deg)`;}
      nen.querySelector('.chuoi').innerHTML=chuoiHtml(kq.chuoi);
      const xong=()=>{
        if(!document.body.contains(nen))return;
        ket.textContent=kq.lon?`Chuỗi ${kq.chuoi} ngày! Lộc lớn +${kq.k}k`:`+${kq.k}k vào két`;
        doiTien(kq.k,kq.lon?'Lộc chuỗi 7 ngày':'Lộc hôm nay');
        const c2=con();nut.textContent=c2>0?'Quay tiếp · còn '+c2+' lượt':'Mai quay tiếp nhé';nut.disabled=c2<1;capNut();
      };
      const lau=kq.lon?300:matchMedia('(prefers-reduced-motion:reduce)').matches?650:3300;setTimeout(xong,lau);
    };
  }
  function capNut(){const b=document.querySelector('#dayPhong [data-loc]');if(b)b.classList.toggle('co-luot',daVao()&&con()>0);}
  const veDayCu=veDay;
  veDay=function(...a){
    const kq=veDayCu(...a);
    if(!document.querySelector('#dayPhong [data-loc]')){const sau=document.querySelector('#dayPhong [data-xom]')||document.querySelector('#dayPhong [data-khoe]');sau?.insertAdjacentHTML('afterend','<button class="tab" data-loc="1" aria-label="Quay lộc hôm nay">🧧 Lộc</button>');}
    capNut();return kq;
  };
  document.getElementById('dayPhong')?.addEventListener('click',e=>{if(e.target.closest('[data-loc]')){e.stopImmediatePropagation();if(!st?.dem)mo();}},true);
  if(typeof st!=='undefined'&&st)veDay();
  window.VongQuayWeb={mo,quay,con,chonO,themLuot,O,LON,KHOA};
})();
