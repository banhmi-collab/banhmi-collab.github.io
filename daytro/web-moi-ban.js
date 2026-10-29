// Chỉ web; hash chỉ chứa hình học, không mang ván lưu hoặc chữ người chơi nhập.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const GOC='https://banhmi-collab.github.io/daytro/?utm_source=khoe_phong';
  const doWeb=(ten,p)=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const maHoa=v=>btoa(unescape(encodeURIComponent(JSON.stringify(v)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  const giaiMa=s=>JSON.parse(decodeURIComponent(escape(atob(s.replaceAll('-','+').replaceAll('_','/')))));
  function taoLink(){
    const p=st.phong[st.o],ds=p.dat.map(v=>[v.k,v.gx,v.gy,v.lat?1:0,v.huong||0,v.id,v.tren||0,...(v.co||[])]);
    const g=p.web42GocHoc||{};
    const v=[1,st.o,p.rong||5,p.son||0,p.san||0,p.rem||0,p.treo||0,p.den||0,ds,p.loai||'',[['','cua_so','sat_tuong'].indexOf(g.viTri||''),['','cay','tranh'].indexOf(g.trangTri||'')]];
    // Ưu tiên giữ đồ lớn và món đỡ; bỏ kèm món đặt trên khi bỏ món đỡ.
    let url=GOC+'#phong='+maHoa(v);
    while(url.length>1500&&ds.length){
      const n=ds.reduce((a,b)=>{const co=x=>DO[x[0]].co[0]*DO[x[0]].co[1];return co(b)<co(a)?b:a;});
      const bo=new Set([n[5]]);for(const x of ds)if(bo.has(x[6]))bo.add(x[5]);
      v[8]=v[8].filter(x=>!bo.has(x[5]));ds.splice(0,ds.length,...v[8]);url=GOC+'#phong='+maHoa(v);
    }
    return url;
  }
  function docLink(hash){
    try{
      if(!hash.startsWith('#phong=')||hash.length>1500)return null;
      const v=giaiMa(hash.slice(7));
      if(!Array.isArray(v)||v.length!==11||v[0]!==1||!['','nha','tiem','traSua'].includes(v[9]))return null;
      const nguyen=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
      if(!Array.isArray(v[10])||v[10].length!==2||!v[10].every(x=>nguyen(x,0,2)))return null;
      if(!nguyen(v[1],0,7)||!nguyen(v[2],5,7)||!nguyen(v[3],0,MAU_TUONG.length-1)||!nguyen(v[4],0,SAN.length-1)||!nguyen(v[5],0,REM.length-1)||!nguyen(v[6],0,TREO.length-1)||!nguyen(v[7],0,DEN.length-1)||!Array.isArray(v[8])||v[8].length>80)return null;
      const ids=new Set(),dat=[];
      for(const x of v[8]){
        if(!Array.isArray(x)||![7,9].includes(x.length)||!Object.hasOwn(DO,x[0])||!nguyen(x[1],0,v[2]-1)||!nguyen(x[2],0,v[2]-1)||!nguyen(x[3],0,1)||!nguyen(x[4],0,3)||!nguyen(x[5],1,1e7)||!nguyen(x[6],0,1e7)||ids.has(x[5]))return null;
        if(x.length===9&&(!nguyen(x[7],1,7)||!nguyen(x[8],1,7)))return null;
        ids.add(x[5]);dat.push({k:x[0],gx:x[1],gy:x[2],lat:!!x[3],huong:x[4],id:x[5],...(x[6]?{tren:x[6]}:{}),...(x.length===9?{co:x.slice(7)}:{})});
      }
      for(const x of dat){
        const daGap=new Set([x.id]);let cha=x.tren;
        while(cha){if(!ids.has(cha)||daGap.has(cha))return null;daGap.add(cha);cha=dat.find(d=>d.id===cha).tren;}
      }
      return {o:v[1],rong:v[2],son:v[3],san:v[4],rem:v[5],treo:v[6],den:v[7],dat,loai:v[9],web42GocHoc:{viTri:['','cua_so','sat_tuong'][v[10][0]],trangTri:['','cay','tranh'][v[10][1]]}};
    }catch{return null;}
  }
  // Chỉ thêm ở cuối TREO: chỉ số cũ và quyền quà cũ giữ nguyên.
  for(const [ben,ten,mau] of [['gui','Khung ảnh người rủ bạn','#E88FA3'],['nhan','Quà từ bạn bè','#8DBB9D']]){
    TREO.push({ten,gia:0,thue:0,qua:'web46_'+ben,ve:()=>`<rect class="n" x="212" y="-218" width="116" height="84" fill="${mau}"/><rect x="222" y="-208" width="96" height="64" fill="#FFF5DC"/><circle cx="252" cy="-188" r="12" fill="${mau}"/><circle cx="288" cy="-188" r="12" fill="${mau}"/><path d="M236,-154 Q252,-180 268,-154 M272,-154 Q288,-180 304,-154" stroke="${mau}" fill="none" stroke-width="6"/>`});
  }
  let choNhan=false;
  function nhanQua(ben){
    if(!st||!Array.isArray(st.quaTrangTri))return;
    const ma='web46_'+ben;if(st.quaTrangTri.includes(ma))return;
    st.quaTrangTri.push(ma);luu();doWeb('web_moi_qua',{ben});
    loa('Đã nhận quà bạn bè · chọn trong Trang trí → Treo tường');
  }
  const luuCu=luu;
  luu=function(...a){
    if(st&&choNhan){st.web46Moi=true;choNhan=false;}
    if(st?.web46Moi&&st.soKhach>0&&!st.quaTrangTri?.includes('web46_nhan')){
      st.quaTrangTri ||= [];st.quaTrangTri.push('web46_nhan');doWeb('web_moi_qua',{ben:'nhan'});
      loa('Quà từ bạn bè · chọn trong Trang trí → Treo tường');
    }
    return luuCu(...a);
  };
  function moPhong(p){
    const cuSt=st,cuN=N,cuNT=NT,phong=document.getElementById('phong'),cuHTML=phong.innerHTML,cuVB=phong.getAttribute('viewBox');
    let anh;
    try{
      const ph={...p,mo:true,rac:[],khach:null};
      st=ganPhong({phong:[ph],o:0,dem:false,chon:null,suCo:null});veLai();anh=phong.cloneNode(true);anh.removeAttribute('id');
      anh.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    }finally{st=cuSt;N=cuN;NT=cuNT;phong.innerHTML=cuHTML;phong.setAttribute('viewBox',cuVB);}
    const man=document.getElementById('moDau'),noi=document.createElement('div');noi.id='web46-phong';
    const chu=document.createElement('p');chu.textContent='Bạn của bạn đã xếp phòng này';
    const ten=document.createElement('p');ten.textContent=p.o<6?'Phòng '+(p.o+1):p.o===6?'Mặt bằng':'Căn hộ';
    anh.style.cssText='width:100%;height: min(44vh,360px);pointer-events:none';anh.setAttribute('aria-label','Căn phòng của bạn');
    noi.append(chu,ten,anh);man.querySelector('.hop, .mo-hop')?.prepend(noi);
    if(!noi.isConnected)man.prepend(noi);
    const nut=document.getElementById('nutMo');nut.textContent='Xây phòng của bạn';
    nut.addEventListener('click',()=>{choNhan=true;noi.remove();},{capture:true,once:true});
  }
  const hash=location.hash;
  if(hash.startsWith('#phong=')||new URLSearchParams(location.search).get('utm_source')==='khoe_phong'){
    const p=docLink(hash);let hopLe=false;
    if(p){try{moPhong(p);hopLe=true;}catch{/* Hình cũ không còn hỗ trợ: giữ màn đầu thường. */}}
    doWeb('web_moi_mo',{hop_le:hopLe?1:0});
    try{history.replaceState(null,'',location.pathname+location.search);}catch{}
  }
  window.MoiBanWeb={taoLink,docLink,nhanQua};
})();
