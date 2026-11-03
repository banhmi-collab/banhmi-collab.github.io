// Chỉ web. Phóng to/thu nhỏ và kéo căn phòng: chỉ đổi viewBox của #phong, toạ độ game
// (kéo đồ, dọn rác, đặt đồ) đi qua getScreenCTM nên vẫn đúng. Hai ngón chụm/kéo, con lăn chuột,
// nút +/−; khi đã phóng to, một ngón kéo trên chỗ trống để dịch phòng.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const svg=document.getElementById('phong'),khung=document.getElementById('phongKhung');
  if(!svg||!khung)return;
  const MAX=3,datThat=svg.setAttribute.bind(svg),docThat=svg.getAttribute.bind(svg);
  const so=v=>String(v||'').trim().split(/[\s,]+/).map(Number);
  let goc=docThat('viewBox')?so(docThat('viewBox')):null,z=1,dx=0,dy=0,phongDangXem=null;
  const tron=n=>Math.round(n*100)/100;
  function apDung(){
    if(!goc||goc.length!==4||goc.some(n=>!Number.isFinite(n)))return;
    const [x,y,w,h]=goc;
    if(z<=1.001){z=1;dx=dy=0;datThat('viewBox',goc.join(' '));capNut();return;}
    const w2=w/z,h2=h/z,mx=(w-w2)/2,my=(h-h2)/2;
    dx=Math.max(-mx,Math.min(mx,dx));dy=Math.max(-my,Math.min(my,dy));
    datThat('viewBox',[x+mx+dx,y+my+dy,w2,h2].map(tron).join(' '));capNut();
  }
  // Game và các lớp web vẫn đọc/ghi viewBox "gốc"; lớp này tự áp mức phóng lên trên.
  svg.setAttribute=function(ten,giaTri){
    if(String(ten).toLowerCase()!=='viewbox')return datThat(ten,giaTri);
    const o=typeof st!=='undefined'?st?.o:null;
    if(o!==phongDangXem){phongDangXem=o;z=1;dx=dy=0;}
    goc=so(giaTri);apDung();
  };
  svg.getAttribute=function(ten){return String(ten).toLowerCase()==='viewbox'&&goc?goc.join(' '):docThat(ten);};
  const diem=(x,y)=>{const p=svg.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(svg.getScreenCTM().inverse());};
  function phongTai(moi,x,y){
    if(!goc)return;
    const truoc=diem(x,y);z=Math.max(1,Math.min(MAX,moi));apDung();
    if(z===1)return;const sau=diem(x,y);dx+=truoc.x-sau.x;dy+=truoc.y-sau.y;apDung();
  }
  function dichPx(px,py){const a=svg.getScreenCTM()?.a;if(!a||z===1)return;dx-=px/a;dy-=py/a;apDung();}
  const giua=()=>{const r=svg.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];};
  // Chụp ảnh phòng (khoe phòng, ảnh trên nút mua) luôn lấy cả căn phòng, không lấy khung đang phóng.
  function tamTat(fn){if(z===1||!goc)return fn();datThat('viewBox',goc.join(' '));try{return fn();}finally{apDung();}}
  window.PhongZoom={tamTat,muc:()=>z,dat:m=>{const [x,y]=giua();phongTai(m,x,y);}};
  if(typeof khoePhong==='function'){const cu=khoePhong;khoePhong=function(...a){return tamTat(()=>cu.apply(this,a));};}

  const css=document.createElement('style');
  css.textContent='#zoomPhong{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:3}'
    +'#zoomPhong .nut-tron{width:40px;height:40px;min-width:40px;min-height:40px;font:700 20px/1 "Be Vietnam Pro",sans-serif;display:grid;place-items:center;padding:0;border-radius:50%}'
    +'#zoomPhong .nut-tron:disabled{opacity:.35}#zoomPhong [data-zoom="lai"]{font-size:13px}';
  document.head.append(css);
  const hop=document.createElement('div');hop.id='zoomPhong';hop.setAttribute('role','group');hop.setAttribute('aria-label','Phóng to thu nhỏ phòng');
  const nut=(ma,chu,nhan,fn)=>{const b=document.createElement('button');b.type='button';b.className='nut-tron';b.dataset.zoom=ma;b.textContent=chu;b.setAttribute('aria-label',nhan);b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',fn);hop.append(b);return b;};
  const nutTo=nut('to','+','Phóng to phòng',()=>{const [x,y]=giua();phongTai(z*1.4,x,y);});
  const nutNho=nut('nho','−','Thu nhỏ phòng',()=>{const [x,y]=giua();phongTai(z/1.4,x,y);});
  const nutLai=nut('lai','1:1','Xem cả phòng',()=>{z=1;apDung();});
  khung.append(hop);
  function capNut(){nutTo.disabled=z>=MAX-.01;nutNho.disabled=z<=1;nutLai.hidden=z<=1;khung.classList.toggle('dang-phong',z>1);}
  capNut();

  // Con lăn chuột / chụm trên touchpad.
  svg.addEventListener('wheel',e=>{e.preventDefault();phongTai(z*Math.exp(-e.deltaY*.0015),e.clientX,e.clientY);},{passive:false});
  // Hai ngón: chụm để phóng, dời để kéo. Một ngón trên chỗ trống khi đang phóng: kéo phòng.
  const tay=new Map();let chum=null,keoNen=null;
  svg.addEventListener('pointerdown',e=>{
    tay.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(tay.size===2){
      try{if(typeof keo!=='undefined'&&keo){keo=null;veBongMa();}}catch{ /* Không huỷ được kéo đồ thì vẫn chụm. */ }
      document.querySelectorAll('#phong .vat[opacity]').forEach(g=>g.removeAttribute('opacity'));
      const [a,b]=[...tay.values()];chum={d:Math.hypot(a.x-b.x,a.y-b.y)||1,z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};keoNen=null;
      e.stopImmediatePropagation();return;
    }
    if(z>1&&tay.size===1&&!e.target.closest('.vat,.rac,.meo')&&!(typeof st!=='undefined'&&st?.chon))keoNen={x:e.clientX,y:e.clientY};
  },true);
  addEventListener('pointermove',e=>{
    if(!tay.has(e.pointerId))return;
    tay.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(chum&&tay.size>=2){
      const [a,b]=[...tay.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      phongTai(chum.z*Math.hypot(a.x-b.x,a.y-b.y)/chum.d,mx,my);dichPx(mx-chum.mx,my-chum.my);chum.mx=mx;chum.my=my;
      e.preventDefault();e.stopImmediatePropagation();return;
    }
    if(keoNen){dichPx(e.clientX-keoNen.x,e.clientY-keoNen.y);keoNen={x:e.clientX,y:e.clientY};e.preventDefault();}
  },{capture:true,passive:false});
  const tha=e=>{tay.delete(e.pointerId);if(tay.size<2)chum=null;if(!tay.size)keoNen=null;};
  addEventListener('pointerup',tha,true);addEventListener('pointercancel',tha,true);
})();
