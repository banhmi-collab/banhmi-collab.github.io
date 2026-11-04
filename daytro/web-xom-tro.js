// #67 Xóm trọ (chỉ web): người chơi tự đăng phòng lên Xóm, xem phòng nhà khác, thả tim / tặng hoa / tặng cây.
// Máy chủ chỉ nhận hình học #phong= (link khoe #46) + mã máy; không chữ người chơi gõ, nên không cần duyệt.
// Thảo vẫn chọn thêm phòng nổi bật trong cau-hinh-web.json → xomTro: [{ten, link}].
(() => {
  'use strict';
  if(window.ReactNativeWebView||!window.MoiBanWeb)return;
  const W=window.DayTroWeb,K_DANG='day-tro-xom-da-dang';
  const doWeb=(ten,p={})=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const QUA={tim:'❤️',hoa:'🌸',cay:'🪴'};
  // Quà Xóm để trang trí. Chỉ thêm ở cuối TREO (file nạp sau cùng): chỉ số món cũ trong ván lưu giữ nguyên.
  TREO.push({ten:'Bó hoa hàng xóm',gia:0,thue:40,qua:'xom_hoa',ve:()=>`<rect class="n" x="228" y="-210" width="84" height="70" rx="6" fill="#FFF5DC"/>`
    +[[250,-188,'#E88FA3'],[270,-196,'#F2C94C'],[290,-188,'#E88FA3'],[260,-174,'#F2A3B8'],[280,-174,'#F2C94C']].map(([x,y,m])=>`<circle cx="${x}" cy="${y}" r="9" fill="${m}"/>`).join('')
    +`<path class="n" fill="#8DBB9D" d="M262,-164 L270,-146 L278,-164 Z"/>`});
  TREO.push({ten:'Kệ cây hàng xóm',gia:0,thue:40,qua:'xom_cay',ve:()=>`<rect class="n" x="214" y="-160" width="112" height="10" rx="2" fill="#B98A5E"/>`
    +[240,300].map(x=>`<path class="n" fill="#C97B5A" d="M${x-12},-182 L${x+12},-182 L${x+9},-160 L${x-9},-160 Z"/><path class="n" fill="#8DBB9D" d="M${x},-182 Q${x-20},-212 ${x-6},-220 Q${x},-200 ${x},-182 Q${x+6},-216 ${x+18},-210 Q${x+12},-192 ${x},-182 Z"/>`).join('')});
  TREO.push({ten:'Khung ảnh hàng xóm',gia:0,thue:30,qua:'xom_ghe',ve:()=>`<rect class="n" x="216" y="-220" width="108" height="80" fill="#8DBB9D"/><rect x="226" y="-210" width="88" height="60" fill="#FFF5DC"/>`
    +`<path fill="#C97B5A" d="M236,-160 L256,-186 L272,-170 L288,-192 L304,-160 Z"/><circle cx="296" cy="-198" r="7" fill="#F2C94C"/>`});
  // Trả tên món vừa nhận (chưa có thì null); có chu thì tự báo.
  function nhanQua(ma,chu){
    // Màn đầu st chỉ là ván trống tạm: lưu lúc đó sẽ ghi đè ván thật.
    if(!daVao())return null;st.quaTrangTri ||= [];if(st.quaTrangTri.includes(ma))return null;
    st.quaTrangTri.push(ma);luu();if(chu)loa(chu+' · chọn trong Trang trí → Treo tường');
    return TREO.find(t=>t.qua===ma)?.ten||null;
  }
  const daVao=()=>!!st&&typeof daVaoGame!=='undefined'&&daVaoGame;
  let chon=[],tuMayChu=[];
  // Vẽ phòng nhà khác vào ảnh SVG rồi trả lại đúng ván đang chơi (cùng cách màn mời bạn #46).
  function anhPhong(p){
    const cuSt=st,cuN=N,cuNT=NT,phong=document.getElementById('phong'),cuHTML=phong.innerHTML,cuVB=phong.getAttribute('viewBox');
    try{
      st=ganPhong({phong:[{...p,mo:true,rac:[],khach:null}],o:0,dem:false,chon:null,suCo:null});veLai();
      const anh=phong.cloneNode(true);anh.removeAttribute('id');anh.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));return anh;
    }finally{st=cuSt;N=cuN;NT=cuNT;phong.innerHTML=cuHTML;phong.setAttribute('viewBox',cuVB);}
  }
  const docLink=l=>{l=String(l||'');const i=l.indexOf('#phong=');return i>=0?window.MoiBanWeb.docLink(l.slice(i)):null;};
  const css=document.createElement('style');
  css.textContent='#xomTro{position:fixed;inset:0;z-index:1001;background:rgba(40,30,20,.55);display:flex;align-items:flex-end;justify-content:center}#xomTro .hop{background:#fff8ec;color:#483c32;width:min(520px,100%);max-height:88vh;overflow:auto;border-radius:16px 16px 0 0;padding:14px 14px 18px}#xomTro h2{margin:0 0 4px;font-size:20px}#xomTro .luoi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0}#xomTro figure{margin:0;background:#f3e6cf;border-radius:12px;padding:6px}#xomTro figure svg{width:100%;height:120px;cursor:pointer}#xomTro figcaption{font-size:14px;text-align:center;overflow-wrap:anywhere}#xomTro .tang{display:flex;gap:4px;justify-content:center;margin-top:4px}#xomTro .tang button{min-width:40px;min-height:40px;border-radius:10px;border:1px solid #c9a97f;background:#fff;font-size:18px}#xomTro .tang button:disabled{opacity:.45}#xomTro .to svg{width:100%;height:min(52vh,420px)}#xomTro .hop>button{min-height:44px}#xomTro .dang{width:100%;margin:6px 0}';
  document.head.append(css);
  function dong(){document.getElementById('xomTro')?.remove();}
  async function taiMayChu(){
    try{const d=await W.goiMayChu('/api/xom');tuMayChu=(Array.isArray(d?.phong)?d.phong:[]).slice(0,30).map(x=>({id:Number.isSafeInteger(x.id)?x.id:null,ten:'Phòng số '+x.id,tim:Number(x.tim)||0,p:docLink(x.phong)})).filter(x=>x.id&&x.p);}
    catch{/* Không tải được thì vẫn có phòng Thảo chọn. */}
  }
  async function tang(x,loai,nut,the){
    nut.disabled=true;
    try{
      const k=await W.goiMayChu('/api/xom/tang',{maMay:await W.maMay(),id:x.id,loai});
      doWeb('web_xom_tang');x.tim++;the.querySelector('[data-tim]').textContent='❤️ '+x.tim;
      the.querySelectorAll('.tang button').forEach(b=>b.disabled=true);
      const moi=nhanQua('xom_ghe');
      loa((loai==='tim'?'Đã thả tim cho phòng số '+x.id:'Đã tặng '+QUA[loai]+' · hôm nay còn '+k.conLuot+' lượt tặng quà')+(moi?' · bạn nhận '+moi+' (Trang trí → Treo tường)':''),moi?5000:2600);
    }catch(e){
      nut.disabled=false;
      loa(e.ma==='da_ghe_hom_nay'?'Hôm nay bạn đã ghé phòng này rồi, mai quay lại nha':e.ma==='het_luot'?'Hôm nay hết 3 lượt tặng quà, vẫn thả tim được nha':e.ma==='phong_minh'?'Đây là phòng của bạn đó':'Chưa gửi được, thử lại sau nhé');
      if(['da_ghe_hom_nay','phong_minh'].includes(e.ma))the.querySelectorAll('.tang button').forEach(b=>b.disabled=true);
    }
  }
  async function dangPhong(nut){
    nut.disabled=true;
    try{
      const link=window.MoiBanWeb.taoLink(),i=link.indexOf('#phong=');
      const k=await W.goiMayChu('/api/xom/dang',{maMay:await W.maMay(),phong:link.slice(i)});
      try{localStorage.setItem(K_DANG,'1');}catch{}
      doWeb('web_xom_dang');nut.textContent='Đã đăng phòng số '+k.id+' · hàng xóm ghé là bạn có quà';
    }catch{nut.disabled=false;loa('Chưa đăng được, thử lại sau nhé');}
  }
  async function moXom(){
    dong();doWeb('web_xom_mo');
    const nen=document.createElement('div');nen.id='xomTro';nen.setAttribute('role','dialog');nen.setAttribute('aria-label','Xóm trọ');
    const hop=document.createElement('div');hop.className='hop';nen.append(hop);
    nen.addEventListener('click',e=>{if(e.target===nen)dong();});
    const p=document.createElement('p');p.textContent='Đang gọi hàng xóm…';hop.append(p);document.body.append(nen);
    await taiMayChu();if(!nen.isConnected)return;
    const veDanhSach=()=>{
      hop.replaceChildren();
      const h=document.createElement('h2');h.textContent='Xóm trọ';
      const g=document.createElement('p');g.textContent='Ghé phòng hàng xóm: thả tim, tặng hoa hoặc cây. Mỗi ngày tặng được 3 món.';
      const dang=document.createElement('button');dang.className='nut dang';dang.dataset.xomDang='';
      dang.textContent=(()=>{try{return localStorage.getItem(K_DANG)==='1';}catch{return false;}})()?'Cập nhật phòng của mình trên Xóm':'Đăng phòng của mình lên Xóm';
      dang.onclick=()=>dangPhong(dang);
      const luoi=document.createElement('div');luoi.className='luoi';
      for(const x of [...chon,...tuMayChu]){
        const f=document.createElement('figure');f.dataset.xomPhong=x.id||'chon';
        try{f.append(anhPhong(x.p));}catch{continue;}
        const c=document.createElement('figcaption');c.textContent=x.ten;f.append(c);
        const xem=()=>{doWeb('web_xom_xem');hop.replaceChildren();const t=document.createElement('h2');t.textContent=x.ten;const to=document.createElement('div');to.className='to';to.append(anhPhong(x.p));
          const lai=document.createElement('button');lai.textContent='← Các phòng khác';lai.onclick=veDanhSach;hop.append(t,to,lai);};
        f.querySelector('svg').addEventListener('click',xem);
        if(x.id){
          const tim=document.createElement('div');tim.dataset.tim='';tim.textContent='❤️ '+x.tim;tim.style.cssText='font-size:13px;text-align:center';f.append(tim);
          const hang=document.createElement('div');hang.className='tang';
          for(const loai of ['tim','hoa','cay']){const b=document.createElement('button');b.textContent=QUA[loai];b.dataset.tang=loai;b.setAttribute('aria-label',loai==='tim'?'Thả tim':loai==='hoa'?'Tặng hoa':'Tặng cây');b.onclick=()=>tang(x,loai,b,f);hang.append(b);}
          f.append(hang);
        }
        luoi.append(f);
      }
      if(!luoi.childElementCount){const t=document.createElement('p');t.textContent='Xóm còn vắng, bạn đăng phòng đầu tiên nhé!';luoi.append(t);}
      const nhom=document.createElement('a');nhom.textContent='Khoe thêm trong nhóm Xóm Trọ Warm Jar';nhom.href='https://www.facebook.com/groups/xomtrowarmjar';nhom.target='_blank';nhom.rel='noopener noreferrer';
      const dongNut=document.createElement('button');dongNut.className='nut';dongNut.textContent='Về dãy trọ của mình';dongNut.style.width='100%';dongNut.onclick=dong;
      hop.append(h,g,dang,luoi,nhom,dongNut);
    };
    veDanhSach();
  }
  // Chủ phòng: có ai ghé thì báo và tặng món trang trí tương ứng.
  async function xemQua(){
    if(!daVao())return;
    try{if(localStorage.getItem(K_DANG)!=='1')return;}catch{return;}
    try{
      const k=await W.goiMayChu('/api/xom/cua-toi',{maMay:await W.maMay()});if(!k?.coPhong)return;
      // Một câu báo duy nhất (loa chỉ hiện câu cuối).
      const moi=[['tim',k.moiTim],['hoa',k.moiHoa],['cay',k.moiCay]].filter(([,n])=>n>0);
      const quaMoi=[k.hoa>0&&nhanQua('xom_hoa'),k.cay>0&&nhanQua('xom_cay')].filter(Boolean);
      if(moi.length||quaMoi.length)loa((moi.length?'Hàng xóm ghé thăm phòng bạn: '+moi.map(([l,n])=>QUA[l]+' '+n).join(' · '):'Quà từ hàng xóm')+(quaMoi.length?' · nhận '+quaMoi.join(', ')+' (Trang trí → Treo tường)':''),5000);
    }catch{/* Lần sau mở game báo tiếp. */}
  }
  // Thêm nút Xóm cạnh nút khoe phòng mỗi lần vẽ lại dãy phòng.
  const veDayCu=veDay;
  veDay=function(...a){
    const kq=veDayCu(...a);
    if(!document.querySelector('#dayPhong [data-xom]'))document.querySelector('#dayPhong [data-khoe]')?.insertAdjacentHTML('afterend','<button class="tab" data-xom="1" aria-label="Xóm trọ">🏘️ Xóm</button>');
    return kq;
  };
  document.getElementById('dayPhong')?.addEventListener('click',e=>{if(e.target.closest('[data-xom]')){e.stopImmediatePropagation();if(!st?.dem)moXom();}},true);
  if(st)veDay();
  fetch('cau-hinh-web.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(c=>{
    chon=(Array.isArray(c?.xomTro)?c.xomTro:[]).slice(0,12).map(x=>({id:null,ten:String(x?.ten||'Phòng nổi bật').slice(0,40),p:docLink(x?.link)})).filter(x=>x.p);
  },()=>{});
  // Chỉ hỏi máy chủ khi đã vào ván và xong hướng dẫn: máy chủ đánh dấu "đã xem" ngay khi trả lời,
  // hỏi sớm ở màn đầu (st là ván tạm) thì mất lời báo, quà và có thể ghi đè ván thật. Hỏi lại mỗi 10 phút khi đang chơi.
  let lanHoi=-Infinity;
  const coTheHoi=()=>daVao()&&(typeof hdXong==='undefined'||hdXong);
  setInterval(()=>{if(coTheHoi()&&Date.now()-lanHoi>=600000){lanHoi=Date.now();xemQua();}},2000);
  window.XomTroWeb={moXom,xemQua,soPhong:()=>chon.length+tuMayChu.length};
})();
