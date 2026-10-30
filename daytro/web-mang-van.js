// Chỉ web. Ván nằm trong fragment, không mang kho quyền mua hoặc mã máy.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const GOC='https://banhmi-collab.github.io/daytro/',KHOA_AN='day-tro-web-mang-van-an';
  const PHU=['day-tro-huong-dan','day-tro-ngay','day-tro-viec','day-tro-vang','day-tro-hen'];
  const TRUONG=('uyTin gap tt ttDem chuyenLinh quaTrangTri thuaKe nhomMoDau moDauXong chuyenDayTro thang tien o idKe dem chon phong thu sao tong soKhach daBung tiep suCo saoThang mocDat thangThueDau vayBa thangThueGan web35 la web42Ghi daHenQuayLai skThang skTruoc web42Thang2Xong nhacSuCoThang camera knNhan web46Moi daThuNo qcThang webSuKien webCuoiGame').split(' ');
  const CAM=/^(?:__proto__|constructor|prototype|goi|GOI|quyen|dayDu|maDon|don|maMay|email|gmail|token|userId|deviceId)$/i;
  const ua=navigator.userAgent;
  const app=/Messenger/i.test(ua)?'messenger':/FBAN|FBAV|FB_IAB/i.test(ua)?'fb':/Instagram/i.test(ua)?'ig':/Zalo/i.test(ua)?'zalo':/BytedanceWebview|musical_ly/i.test(ua)?'tiktok':/Line\//i.test(ua)?'khac_app':null;
  const trongApp=!!app&&!navigator.standalone&&!matchMedia('(display-mode: standalone)').matches;
  const android=/Android/i.test(ua);
  const lucMo=Date.now();
  const doWeb=(ten,p)=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const nguyen=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
  const vat=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  function loc(v,sau=0){
    if(sau>16)throw Error('Ván quá sâu');
    if(v===null||typeof v==='boolean')return v;
    if(typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=1e14)return v;
    if(typeof v==='string'&&v.length<=16000&&!/[<>]/.test(v))return v;
    if(Array.isArray(v)&&v.length<=2048)return v.map(x=>loc(x,sau+1));
    if(vat(v)&&Object.keys(v).length<=256)return Object.fromEntries(Object.entries(v).filter(([k])=>!CAM.test(k)).map(([k,x])=>[k,loc(x,sau+1)]));
    throw Error('Dữ liệu ván không hợp lệ');
  }
  // Nhóm A/B mỗi ngày (#23) đi theo ván để người chơi không bị chia lại nhóm khi đổi trình duyệt.
  const KHOA_AB='day-tro-ab-mn',KHOA_LUOT='day-tro-ab-luot';
  function abHopLe(ab){
    if(ab==null)return true;
    if(!vat(ab)||!['A','B'].includes(ab.mn))return false;
    return ab.luot==null||vat(ab.luot)&&Object.keys(ab.luot).every(k=>['moc','daDung'].includes(k))&&nguyen(ab.luot.moc??0,0,99991231)&&nguyen(ab.luot.daDung??0,0,99991231);
  }
  function docAb(){
    try{
      const mn=localStorage.getItem(KHOA_AB);if(!['A','B'].includes(mn))return null;
      let luot=null;try{luot=JSON.parse(localStorage.getItem(KHOA_LUOT));}catch{}
      const ab={mn,luot:vat(luot)?{moc:luot.moc,daDung:luot.daDung}:null};return abHopLe(ab)?ab:{mn,luot:null};
    }catch{return null;}
  }
  function goiVan(v,phu,ab=null){
    const van=loc(Object.fromEntries(TRUONG.filter(k=>Object.hasOwn(v,k)).map(k=>[k,v[k]])));
    const g={v:1,van,phu:Object.fromEntries(PHU.map(k=>{
      const v=phu[k]??null;
      return [k,v!==null&&![PHU[0],PHU[3]].includes(k)?JSON.stringify(loc(JSON.parse(v))):v];
    }))};
    if(ab&&abHopLe(ab))g.ab={mn:ab.mn,luot:ab.luot?{moc:ab.luot.moc??0,daDung:ab.luot.daDung??0}:null};
    return g;
  }
  function hopLe(g){
    if(!vat(g)||g.v!==1||!vat(g.van)||!vat(g.phu)||!abHopLe(g.ab))return false;
    const s=g.van;
    if(!nguyen(s.thang,0,100000)||!Number.isFinite(s.tien)||!nguyen(s.o,0,7)||!nguyen(s.idKe,1,1e9)||!Array.isArray(s.phong)||s.phong.length!==8||s.o>=s.phong.length)return false;
    if(!Array.isArray(s.tt)||s.tt.some(x=>!THANH_TICH.some(t=>t.id===x))||!vat(s.ttDem)||!vat(s.gap)||!Array.isArray(s.quaTrangTri))return false;
    if(s.la!=null&&(!Array.isArray(s.la)||s.la.some(x=>typeof x!=='string')))return false;
    if(s.mocDat!=null&&!Array.isArray(s.mocDat))return false;
    for(const k of ['uyTin','thu','sao','tong','soKhach','daBung','saoThang'])if(!Number.isFinite(s[k]))return false;
    for(const k of ['vayBa','thuaKe','chuyenLinh','chuyenDayTro','web35'])if(s[k]!=null&&!vat(s[k]))return false;
    // #44 tiến độ sự kiện mùa và #45 nâng cấp/khách hiếm: đi theo ván để không mất đồ đã mua.
    if(s.webSuKien!=null&&(!vat(s.webSuKien)||Object.values(s.webSuKien).some(d=>!vat(d)||d.nv!=null&&(!Array.isArray(d.nv)||d.nv.some(x=>typeof x!=='string')))))return false;
    if(s.webCuoiGame!=null){const c=s.webCuoiGame;if(!vat(c))return false;
      for(const k of ['nangCap','gap'])if(c[k]!=null&&(!Array.isArray(c[k])||c[k].some(x=>typeof x!=='string')))return false;
      const ds=window.CuoiGameWeb;if(ds&&(c.nangCap||[]).some(m=>!ds.nangCap.some(n=>n.ma===m))||ds&&(c.gap||[]).some(m=>!ds.khachHiem.some(n=>n.ma===m)))return false;}
    if(s.thuaKe&&!nguyen(s.thuaKe.buoc,0,20))return false;
    for(const p of s.phong){
      if(!vat(p)||typeof p.mo!=='boolean'||!Array.isArray(p.dat)||!Array.isArray(p.rac)||!nguyen(p.luot,0,20)||p.loai&&!['nha','tiem','traSua'].includes(p.loai))return false;
      if(p.rong!=null&&!nguyen(p.rong,5,7))return false;
      for(const [k,ds] of [['son',MAU_TUONG],['san',SAN],['rem',REM],['treo',TREO],['den',DEN]])if(p[k]!=null&&!nguyen(p[k],0,ds.length-1))return false;
      if(p.giay!=null&&(!Array.isArray(p.giay)||p.giay.length!==2||!p.giay.every(n=>nguyen(n,0,6))))return false;
      const ids=new Set();
      for(const d of p.dat){
        if(!vat(d)||!Object.hasOwn(DO,d.k)||!nguyen(d.id,1,1e9)||ids.has(d.id)||!nguyen(d.gx,0,6)||!nguyen(d.gy,0,6))return false;
        if(d.co!=null&&(!Array.isArray(d.co)||d.co.length!==2||!d.co.every(n=>nguyen(n,1,7))))return false;
        if(d.huong!=null&&!nguyen(d.huong,0,3))return false;
        ids.add(d.id);
      }
      for(const d of p.dat){let cha=d.tren;const gap=new Set([d.id]);while(cha){if(!ids.has(cha)||gap.has(cha))return false;gap.add(cha);cha=p.dat.find(x=>x.id===cha).tren;}}
      for(const r of p.rac)if(!vat(r)||!RAC.includes(r.loai)||!nguyen(r.id,1,1e9)||!nguyen(r.gx,0,6)||!nguyen(r.gy,0,6)||!Number.isFinite(r.ox)||!Number.isFinite(r.oy))return false;
      const k=p.khach;
      if(k!=null&&(!vat(k)||!Object.hasOwn(KIEU,k.kieu)||typeof k.ten!=='string'||!Array.isArray(k.can)||k.can.some(n=>!Object.hasOwn(NHOM,n))||!Number.isFinite(k.tran)))return false;
      if(k?.web35Trum&&!window.Web35?.dsTrum.some(x=>x.ma===k.web35Trum))return false;
      if(k?.web35TraPhong!=null&&!nguyen(k.web35TraPhong,0,100001))return false;
      if(k?.dang){
        const ds=Array.isArray(k.dang)?k.dang:[k.dang];if(ds.length>2)return false;
        for(const d of ds){if(!vat(d))return false;for(const [ten,v] of Object.entries(d)){
          if(['ao','quan','mauToc'].includes(ten)){if(typeof v!=='string'||!/^#[0-9a-f]{3,8}$/i.test(v))return false;}
          else if(ten==='toc'){if(!['ngan','dai'].includes(v))return false;}
          else if(!['kep','dai','non','kinh'].includes(ten)||typeof v!=='boolean')return false;
        }}
      }
    }
    for(const [k,v] of Object.entries(g.phu)){
      if(!PHU.includes(k)||v!==null&&typeof v!=='string')return false;
      if(v===null)continue;
      if(k===PHU[0]){if(v!=='xong')return false;}
      else if(k===PHU[3]){if(!/^\d{1,16}$/.test(v))return false;}
      else{let x;try{x=JSON.parse(v);}catch{return false;}if(!vat(x))return false;
        if(k===PHU[1]&&(typeof x.ngay!=='string'||!nguyen(x.chuoi,1,100000)))return false;
        if(k===PHU[2]&&(!Array.isArray(x.ds)||x.ds.length>3||x.ds.some(d=>!vat(d)||!Object.hasOwn(VIEC,d.loai)||!Number.isFinite(d.can)||!Number.isFinite(d.co))))return false;
        if(k===PHU[4])for(const h of [x.hom,x.mai].filter(Boolean)){
          if(!vat(h)||typeof h.ngay!=='string'||h.loai!=null&&!HEN_MAI.some(n=>n.ma===h.loai)||h.dung!=null&&!vat(h.dung)||h.kieuKhach!=null&&!Object.hasOwn(KIEU,h.kieuKhach))return false;
        }
      }
    }
    return true;
  }
  async function nen(g){
    const b=new Uint8Array(await new Response(new Blob([JSON.stringify(g)]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
    return btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  }
  async function docLink(hash){
    try{
      if(!/^#van=[A-Za-z0-9_-]+$/.test(hash)||hash.length>16000)return null;
      const b=Uint8Array.from(atob(hash.slice(5).replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
      const doc=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate')).getReader(),ds=[];let so=0;
      try{while(true){const {value,done}=await doc.read();if(done)break;so+=value.length;if(so>262144){await doc.cancel();return null;}ds.push(value);}}finally{doc.releaseLock();}
      const g=JSON.parse(await new Blob(ds).text());
      if(!hopLe(g))return null;
      const sach=goiVan(g.van,g.phu,g.ab);return hopLe(sach)?sach:null;
    }catch{return null;}
  }
  async function taoLink(){
    if(typeof st==='undefined'||!st?.phong)throw Error('Chưa có ván');
    // Cùng dạng bản lưu của luu(), không gửi bất kỳ kho quyền mua nào.
    const v={...(!daVaoGame&&docLuu()||st),suCo:null,dem:false,chon:null};
    const phu=Object.fromEntries(PHU.map(k=>[k,localStorage.getItem(k)]));
    const goi=goiVan(v,phu,docAb());if(!hopLe(goi))throw Error('Ván chưa sẵn sàng');
    const link=GOC+'#van='+await nen(goi);
    if(link.length>8000)throw Error('Dãy trọ này dài quá để mang bằng link. Ván vẫn được giữ ở đây.');
    return link;
  }
  const intent=link=>'intent://'+link.slice('https://'.length)+'#Intent;scheme=https;package=com.android.chrome;end';
  function chu(h,t){const p=document.createElement('p');p.textContent=t;h.append(p);return p;}
  function huongDan(h){
    if(h.querySelector('.web47-buoc'))return;
    const d=document.createElement('div');d.className='web47-buoc';
    d.innerHTML='<p><span aria-hidden="true">① <b>••• → ↗</b></span> Bấm •••, chọn “Mở trong Safari”.</p><p><span aria-hidden="true">② <b>▣ → 🧭</b></span> Nếu ván chưa sang: dán link vừa sao chép vào thanh địa chỉ Safari, rồi bấm Đi.</p>';
    h.append(d);
  }
  // Link tạo sẵn để bấm "Mở bằng Chrome" chuyển trang ngay trong cú chạm:
  // trình duyệt nhúng hay chặn intent nếu chuyển sau một lần chờ bất đồng bộ.
  let linkSan=null,dangTaoSan=false,baoChrome=null;
  function lamMoiLink(){
    if(dangTaoSan)return;dangTaoSan=true;
    taoLink().then(l=>{linkSan=l;},()=>{linkSan=null;}).finally(()=>{dangTaoSan=false;});
  }
  const api={diTrang:url=>{location.href=url;}};
  const CHUA_MO='Không mở được Chrome? Bấm sao chép rồi dán link vào Chrome.';
  function kiemChuaMo(){if(baoChrome&&document.visibilityState==='visible')baoChrome.textContent=CHUA_MO;}
  function ganNut(h,{chrome=false,bao=null,nhan=null}={}){
    const b=document.createElement('button');b.type='button';b.className='web47-nut';b.textContent=nhan||(chrome?'Mở bằng Chrome':'Sao chép link');h.append(b);
    if(!bao){bao=chu(h,'');bao.setAttribute('role','status');}
    if(chrome)lamMoiLink();
    let dang=false;
    b.onclick=async()=>{
      if(dang)return;
      if(chrome&&linkSan){
        api.diTrang(intent(linkSan));doWeb('web_mang_van_tao',{app,cach:'intent'});
        baoChrome=bao;setTimeout(kiemChuaMo,2000);lamMoiLink();return;
      }
      dang=true;b.disabled=true;
      try{
        const linkCho=taoLink();
        if(chrome){api.diTrang(intent(await linkCho));doWeb('web_mang_van_tao',{app,cach:'intent'});baoChrome=bao;setTimeout(kiemChuaMo,2000);}
        else{
          let link;
          try{
            // Safari cần lời gọi clipboard còn trong thao tác bấm.
            if(navigator.clipboard?.write&&window.ClipboardItem)await navigator.clipboard.write([new ClipboardItem({'text/plain':linkCho.then(s=>new Blob([s],{type:'text/plain'}))})]);
            else await navigator.clipboard.writeText(await linkCho);
          }catch{
            link=await linkCho;const o=document.createElement('textarea');o.value=link;o.readOnly=true;h.append(o);o.select();
            if(!document.execCommand('copy')){bao.textContent='Nhấn giữ ô bên dưới để sao chép, rồi dán vào Safari/Chrome.';if(!android)huongDan(h);return;}
            o.remove();
          }
          bao.textContent='Đã sao chép link mang ván';if(!android)huongDan(h);
          doWeb('web_mang_van_tao',{app,cach:'sao_chep'});
        }
      }catch(e){const loi=['Chưa có ván','Ván chưa sẵn sàng','Dãy trọ này dài quá để mang bằng link. Ván vẫn được giữ ở đây.'];bao.textContent=loi.includes(e.message)?e.message:'Chưa mang được ván, bạn thử lại nhé.';}
      finally{dang=false;b.disabled=false;}
    };
    return b;
  }
  function moi(){
    if(!trongApp||Date.now()-lucMo<300000||typeof st==='undefined'||!st||st.thang<1||!daVaoGame||document.getElementById('web47-moi')||document.querySelector('.phu.hien,.web-bang'))return;
    if(anDen>Date.now())return;
    try{if(Number(localStorage.getItem(KHOA_AN))>Date.now())return;}catch{}
    const d=document.createElement('aside');d.id='web47-moi';d.setAttribute('aria-label','Mang dãy trọ sang trình duyệt');
    chu(d,'Lưu dãy trọ để mai chơi tiếp');
    const dong=document.createElement('button');dong.type='button';dong.className='web47-dong';dong.textContent='×';dong.setAttribute('aria-label','Để sau 3 ngày');dong.onclick=()=>{anDen=Date.now()+3*86400000;try{localStorage.setItem(KHOA_AN,String(anDen));}catch{}daMoi=false;d.remove();};d.append(dong);
    const nhom=document.createElement('div');nhom.className='web47-nhom';d.append(nhom);
    const bao=chu(d,'');bao.setAttribute('role','status');
    // Android có cả hai nút: TikTok/Facebook có thể chặn mở Chrome, khi đó vẫn sao chép được.
    if(android)ganNut(nhom,{chrome:true,bao});
    ganNut(nhom,{bao,nhan:android?'Sao chép':null});
    document.querySelector('#game .tren').append(d);doWeb('web_mang_van_moi',{app});
  }
  let anDen=0,daMoi=false;
  const css=document.createElement('style');css.textContent=`#web47-moi{grid-column:1/-1;position:relative;background:#f8e4ba;border:1px solid #bc8c45;border-radius:10px;padding:8px 40px 8px 10px;font:12px/1.4 'Be Vietnam Pro',sans-serif;color:#3b2f25}#web47-moi p{margin:0 0 4px}#web47-moi p:empty{display:none}.web47-nut{min-height:44px;border:1px solid #96785f;border-radius:8px;background:#fff8ee;color:#543b24;padding:8px 12px;font:inherit;cursor:pointer}.web47-dong{position:absolute;right:0;top:0;width:40px;min-height:44px;border:0;background:transparent;font-size:24px;color:#543b24}.web47-buoc{font-size:12px;line-height:1.5}.web47-buoc p{display:flex;gap:8px;align-items:center}.web47-buoc span{display:block;flex:none;width:68px;background:#fff8ee;border:1px solid #bc8c45;border-radius:8px;padding:8px 4px;text-align:center}.web47-buoc b{display:block}#web47-moi textarea{width:100%;box-sizing:border-box}`;document.head.append(css);
  css.textContent+=`#web47-moi{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px}#web47-moi>p:first-child{grid-column:1;margin:0}#web47-moi>.web47-nhom{grid-column:2;grid-row:1;display:flex;gap:4px}#web47-moi .web47-nhom .web47-nut{padding:8px}#web47-moi>[role=status],#web47-moi>textarea{grid-column:1/-1}#web47-moi>.web47-buoc{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:50;background:#f8e4ba;border:1px solid #bc8c45;border-radius:10px;padding:10px;box-shadow:0 5px 12px #543b2420}`;
  setInterval(()=>{if(!daMoi){moi();daMoi=!!document.getElementById('web47-moi');}},1500);
  // Ván đổi liên tục khi chơi; làm mới link tạo sẵn khi đang có nút Chrome trên màn.
  setInterval(()=>{if(android&&document.querySelector('.web47-nut'))lamMoiLink();},10000);
  const hash=location.hash;let dangNhan=hash.startsWith('#van=');
  // Chặn vào ván trong lúc giải nén, tránh người bấm Chơi trước khi nhận xong.
  document.addEventListener('click',e=>{if(dangNhan&&e.target.closest?.('#nutMo,#nutMoi')){e.preventDefault();e.stopImmediatePropagation();}},true);
  async function nhan(){
    if(!dangNhan)return;
    try{history.replaceState(null,'',location.pathname+location.search);}catch{}
    try{
      const g=await docLink(hash);if(!g){doWeb('web_mang_van_nhan',{hop_le:0,ket_qua:'loi'});return;}
      const cu=docLuu();
      if(cu&&!window.confirm('Máy này đã có dãy trọ tháng '+(cu.thang+1)+'. Dùng ván mang sang (tháng '+(g.van.thang+1)+')?')){doWeb('web_mang_van_nhan',{hop_le:1,ket_qua:'giu_cu'});return;}
      const khoa=[KHOA,...PHU,KHOA_AB,KHOA_LUOT],truoc=khoa.map(k=>[k,localStorage.getItem(k)]);
      // Máy chưa có ván thì nhận luôn nhóm A/B của ván; máy đã có ván giữ nhóm của máy.
      const nhanAb=!cu&&g.ab;
      try{
        for(const k of PHU){const v=g.phu[k];v===null?localStorage.removeItem(k):localStorage.setItem(k,v);}
        if(nhanAb){localStorage.setItem(KHOA_AB,g.ab.mn);g.ab.luot?localStorage.setItem(KHOA_LUOT,JSON.stringify(g.ab.luot)):localStorage.removeItem(KHOA_LUOT);}
        localStorage.setItem(KHOA,JSON.stringify(g.van));
      }catch(e){for(const [k,v] of truoc){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch{}}throw e;}
      if(nhanAb)try{window.DayTroWeb?.datNhomMoiNgay?.(g.ab.mn);}catch{}
      document.getElementById('moDau').classList.remove('hien');choiTiep(g.van);
      loa('Đã mang dãy trọ sang đây');doWeb('web_mang_van_nhan',{hop_le:1,ket_qua:'nap'});
    }catch{doWeb('web_mang_van_nhan',{hop_le:0,ket_qua:'loi'});}
    finally{dangNhan=false;}
  }
  if(document.readyState==='complete')void nhan();else window.addEventListener('load',()=>void nhan(),{once:true});
  window.MangVanWeb={taoLink,docLink,nen,goiVan,hopLe,intent,ganNut,huongDan,moi,app,trongApp,kiemChuaMo,lamMoiLink,api,linkSan:()=>linkSan};
})();
