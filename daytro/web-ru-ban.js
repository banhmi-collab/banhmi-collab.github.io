// Đợt 2 việc 1 (chỉ web): rủ bạn để mở thêm tháng.
// Người rủ gửi link có mã 6 ký tự. Bạn mới (máy chưa có ván) chơi hết tháng 1 thì báo máy chủ;
// người rủ được +1 tháng chơi, tối đa 1 tháng mỗi ngày (máy chủ giữ luật). Bạn mới nhận 1 món treo tường.
// Không gửi chữ người chơi gõ: chỉ mã máy (máy chủ băm) và mã rủ.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const W=window.DayTroWeb;if(!W?.goiMayChu||!W?.maMay)return;
  const K_BOI='day-tro-ru-boi',K_THUONG='day-tro-ru-thuong',K_MA='day-tro-ru-ma',K_DA_RU='day-tro-ru-da-gui',K_VAN='day-tro-cua-toi-v2';
  const MA=/^[A-HJ-NP-Z2-9]{6}$/;
  const doc=(k,mac=null)=>{try{return JSON.parse(localStorage.getItem(k))??mac;}catch{return mac;}};
  const ghi=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
  const doWeb=(ten,p={})=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const daVao=()=>!!st&&typeof daVaoGame!=='undefined'&&daVaoGame;
  const dayDu=()=>!!doc('day-tro-web-day-du');
  let batRu=true;fetch('cau-hinh-web.json',{cache:'no-cache'}).then(r=>r.json()).then(j=>{batRu=j?.ruBan!==false;}).catch(()=>{});
  const bat=()=>batRu;

  // Quà cho bạn mới: chỉ thêm ở cuối TREO để chỉ số món cũ giữ nguyên.
  TREO.push({ten:'Khung ảnh bạn thân',gia:0,thue:30,qua:'ru_ban_nhan',ve:()=>`<rect class="n" x="214" y="-220" width="112" height="86" rx="8" fill="#F2C94C"/><rect x="224" y="-210" width="92" height="66" rx="4" fill="#FFF5DC"/>`
    +`<path fill="#E88FA3" d="M270,-160 C250,-174 244,-190 256,-196 C263,-200 269,-195 270,-190 C271,-195 277,-200 284,-196 C296,-190 290,-174 270,-160 Z"/>`});

  // 1. Mở link rủ: chỉ máy chưa có ván mới được tính là bạn mới.
  function nhanLink(href=location.href){
    try{
      const u=new URL(href),ma=(u.searchParams.get('ru')||'').toUpperCase();
      if(!MA.test(ma))return false;
      let moi=false;
      if(!localStorage.getItem(K_VAN)&&!doc(K_BOI)&&doc(K_MA)!==ma){ghi(K_BOI,{ma,xong:false});doWeb('web_ru_mo');moi=true;}
      u.searchParams.delete('ru');if(href===location.href)history.replaceState(null,'',u.pathname+u.search+u.hash);
      return moi;
    }catch{return false;}
  }
  nhanLink();

  // 2. Bạn mới hết tháng 1: báo máy chủ (thử lại ở tháng sau nếu mất mạng).
  let dangBao=false;
  async function baoXong(){
    const b=doc(K_BOI);if(!b||b.xong||dangBao||!daVao()||!(st.thang>=1))return;
    dangBao=true;
    try{
      await W.goiMayChu('/api/ru/xong',{maMay:await W.maMay(),ma:b.ma});
      ghi(K_BOI,{...b,xong:true});doWeb('web_ru_xong');
      st.quaTrangTri ||= [];
      if(!st.quaTrangTri.includes('ru_ban_nhan')){st.quaTrangTri.push('ru_ban_nhan');luu();}
      loa('Bạn vừa giúp người rủ mở thêm 1 tháng 🎉 · Quà "Khung ảnh bạn thân" ở Trang trí → Treo tường',4200);
    }catch(e){
      // Máy chủ trả lời chắc chắn (đã tính, tự rủ, không phải bạn mới, mã sai) thì thôi không báo lại.
      if(!e.ketNoi&&e.status&&e.status<500)ghi(K_BOI,{...b,xong:true});
    }finally{dangBao=false;}
  }
  const sangCu=sangThang;
  sangThang=function(...a){const r=sangCu(...a);void baoXong();return r;};

  // 3. Người rủ nhận tháng thưởng (máy chủ cho tối đa 1 tháng/ngày).
  let conCho=0;
  async function kiemThuong(im=false){
    if(!doc(K_MA))return 0;
    try{
      const k=await W.goiMayChu('/api/ru/nhan',{maMay:await W.maMay()});
      conCho=k.conCho||0;
      if(k.thang===1){
        ghi(K_THUONG,(Number(doc(K_THUONG))||0)+1);doWeb('web_ru_nhan');
        loa('Một người bạn đã vào chơi · bạn được thêm 1 tháng hôm nay 🎉',4200);
        return 1;
      }
      if(!im&&k.daNhanHomNay)return -1;
    }catch{}
    return 0;
  }
  function dungThuong(){
    const n=Number(doc(K_THUONG))||0;if(n<1)return false;
    ghi(K_THUONG,n-1);loa('Dùng 1 tháng bạn bè tặng');return true;
  }

  // 4. Gửi link rủ.
  async function layMa(){
    const cu=doc(K_MA);if(typeof cu==='string'&&MA.test(cu))return cu;
    const k=await W.goiMayChu('/api/ru/ma',{maMay:await W.maMay()});
    if(!MA.test(k?.ma||''))throw Error('ma');ghi(K_MA,k.ma);return k.ma;
  }
  function taoLink(ma){
    const u=new URL(window.MoiBanWeb?.taoLink?.()||'https://banhmi-collab.github.io/daytro/');
    u.searchParams.set('utm_source','ru_ban');u.searchParams.set('ru',ma);return u.href;
  }
  async function guiLoiRu(bao){
    try{
      const ma=await layMa(),url=taoLink(ma);
      const du={title:'Dãy Trọ Của Tôi',text:'Mình đang làm chủ dãy trọ, vào chơi chung nha! Bạn chơi xong tháng đầu là cả hai cùng có quà 🎁',url};
      let cach='share';
      if(navigator.share)await navigator.share(du);
      else {await navigator.clipboard.writeText(du.text+' '+url);cach='chep';}
      ghi(K_DA_RU,Date.now());doWeb('web_ru_bam',{cach});
      if(bao)bao.textContent=cach==='chep'?'Đã chép lời mời · dán gửi cho bạn nhé. Bạn chơi xong tháng 1 là bạn được thêm 1 tháng.':'Đã gửi · khi bạn chơi xong tháng 1, quay lại đây bấm "Bạn vào chưa?" nhé.';
    }catch(e){if(e?.name!=='AbortError'&&bao)bao.textContent='Chưa kết nối được · thử lại sau nhé';}
  }

  // 5. Thêm vào bảng "Hôm nay dãy trọ nghỉ rồi".
  function chenVaoBang(noi){
    if(noi.querySelector('.ru-ban'))return;
    const nutMai=[...noi.querySelectorAll('button')].find(b=>b.textContent.trim()==='Mai chơi tiếp');
    const h=nutMai?.parentNode;if(!h)return;
    const yen=document.createElement('p');yen.className='ru-ban-yen';yen.textContent='Không phải lỗi đâu — ván của bạn được giữ nguyên.';
    h.querySelector('p')?.before(yen);
    if(!bat()||dayDu())return;
    const khoi=document.createElement('div');khoi.className='ru-ban';
    khoi.style.cssText='border:2px dashed currentColor;border-radius:12px;padding:10px;margin:10px 0;text-align:center';
    const tieu=document.createElement('p');tieu.style.fontWeight='800';tieu.textContent='Rủ 1 bạn · mở thêm 1 tháng ngay';
    const giai=document.createElement('p');giai.className='web-ghichu';giai.textContent='Bạn mới chơi xong tháng 1 là bạn được thêm 1 tháng (mỗi ngày 1 lần). Bạn của bạn cũng có quà.';
    const bao=document.createElement('p');bao.className='web-ghichu';bao.setAttribute('role','status');
    const gui=document.createElement('button');gui.className='nut';gui.textContent='Gửi lời rủ cho bạn';gui.style.minHeight='48px';gui.onclick=async()=>{await guiLoiRu(bao);if(doc(K_DA_RU))kiem.hidden=false;};
    const kiem=document.createElement('button');kiem.className='lai';kiem.textContent='Bạn vào chưa?';kiem.style.minHeight='44px';
    const choiTiep=()=>{nutMai.click();setTimeout(()=>hetThang(),0);};
    kiem.onclick=async()=>{
      kiem.disabled=true;bao.textContent='Đang xem…';
      const k=await kiemThuong();kiem.disabled=false;
      if(k===1||(Number(doc(K_THUONG))||0)>0){choiTiep();return;}
      bao.textContent=k===-1?(conCho?`Hôm nay đã nhận rồi · mai nhận tiếp (${conCho} bạn đang chờ).`:'Hôm nay đã nhận rồi · mai rủ tiếp nhé.'):doc(K_MA)?'Chưa có bạn nào chơi xong tháng 1 · đợi bạn một chút nhé.':'Bạn chưa gửi lời rủ nào.';
    };
    if(!doc(K_DA_RU))kiem.hidden=true;khoi.append(tieu,giai,gui,kiem,bao);
    // Ngay dưới nút 19k (lựa chọn chính), trên combo: dễ thấy mà không che nút mua.
    const nut19=[...h.querySelectorAll('button')].find(b=>b.textContent.startsWith('Mở bản đầy đủ'));
    (nut19?nut19.after(khoi):nutMai.before(khoi));
    // Còn tháng thưởng từ trước thì cho chơi tiếp luôn.
    if((Number(doc(K_THUONG))||0)>0){const n=document.createElement('button');n.className='nut';n.textContent='Dùng tháng bạn bè tặng';n.onclick=choiTiep;khoi.prepend(n);}
  }
  new MutationObserver(()=>{const n=document.getElementById('hetLuotNgay');if(n)chenVaoBang(n);}).observe(document.body,{childList:true,subtree:true});

  // Khi mở game: người đã gửi lời rủ thì xem có bạn nào vào chưa (im lặng nếu chưa).
  const hen=setInterval(()=>{if(!daVao())return;clearInterval(hen);void baoXong();if(doc(K_DA_RU))void kiemThuong(true);},1500);

  window.RuBanWeb={nhanLink,dungThuong,guiLoiRu,kiemThuong,baoXong,taoLink};
})();
