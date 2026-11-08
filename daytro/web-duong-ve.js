// #77 chỉ web: mở đường quay về và nối tuần đầu. Không thêm thưởng, không đổi hẹn, không xin quyền thông báo.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  // A/B #77 (9/11/2026): người mới bốc ngẫu nhiên 50/50 co/khong; người chơi cũ = cu, giữ bản cũ. App luôn co.
  // Người cũ: đã nhận quà ngày từ trước hôm nay hoặc ván đã tới tháng 3. Nhóm ghi vào GA4 (user property nhom_77).
  const KHOA77='day-tro-ab-77';
  const nhom77=(()=>{
    if(window.ReactNativeWebView)return 'co';
    let n=null;try{n=localStorage.getItem(KHOA77);}catch{}
    if(['co','khong','cu'].includes(n))return n;
    let cu=false;
    try{const q=JSON.parse(localStorage.getItem('day-tro-ngay'))||{};if(q.ngay&&q.ngay!==new Date().toDateString())cu=true;}catch{}
    try{const v=JSON.parse(localStorage.getItem('day-tro-cua-toi-v2'))||{};if((v.thang||0)>=3)cu=true;}catch{}
    // Bốc bằng crypto, không dùng Math.random để khỏi làm lệch chuỗi ngẫu nhiên của game.
    let r=0.5;try{const b=new Uint8Array(1);crypto.getRandomValues(b);r=b[0]/256;}catch{r=Math.random();}
    n=cu?'cu':(r<0.5?'co':'khong');
    try{localStorage.setItem(KHOA77,n);}catch{}
    return n;
  })();
  window.Web77={nhom:nhom77};
  try{window.gtag?.('set','user_properties',{nhom_77:nhom77});}catch{}
  if(nhom77!=='co')return;
  const M=window.MangVanWeb,P=window.PwaWeb;
  const ghi=(ten,p)=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const docNgay=()=>{try{return JSON.parse(localStorage.getItem('day-tro-ngay'))||{};}catch{return {};}};
  const hom=()=>new Date().toDateString();
  const homQua=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toDateString();};
  const the=(cha,lop,chu)=>{const n=document.createElement(cha);n.className=lop;n.textContent=chu;return n;};

  // Chọn đúng một đường về theo nơi đang mở. Không có đường nào phù hợp thì vẫn gửi được link.
  function loaiDuong(){
    if(P?.daCai?.())return null;
    if(M?.trongApp)return 'mo_chrome';
    if(P?.ios)return P.safari?'ios_safari':'mo_safari';
    if(P?.coTheMoi?.())return 'bieu_tuong';
    return 'gui_link';
  }
  function dungKhoi(noi,h){
    const loai=loaiDuong();if(!loai)return null;
    const bam=(loaiBam,kq)=>ghi('web_duong_ve_bam',{noi,loai:loaiBam,kq});
    // Bảng đã có nhắc "mở bằng Chrome/Safari" của trong-app thì dùng luôn, không vẽ thêm nút trùng.
    if(loai==='mo_chrome'&&h.querySelector('.web-nhac .web47-nut')){
      ghi('web_duong_ve_hien',{noi,loai});
      h.querySelectorAll('.web-nhac .web47-nut').forEach(b=>b.addEventListener('click',()=>bam('mo_chrome','bam')));
      return null;
    }
    const k=document.createElement('section');k.className='web77-duong-ve';k.dataset.noi=noi;k.dataset.loai=loai;
    k.append(the('b','','Mai ghé lại trong một chạm'));
    const bao=the('p','web77-bao','');bao.setAttribute('role','status');
    const hang=the('div','web77-hang','');
    if(loai==='bieu_tuong'){
      const b=the('button','web77-nut chinh','Thêm vào màn hình');b.type='button';hang.append(b);
      b.onclick=async()=>{b.disabled=true;const kq=await P.moi();bam('bieu_tuong',kq);bao.textContent=kq==='ok'?'Đã thêm rồi nha!':kq==='huy'?'Lúc nào cần thì bấm lại nhé.':'Máy này chưa thêm được. Bạn gửi link cho mình nhé.';b.disabled=false;if(kq==='ok')b.hidden=true;};
    }else if(loai==='ios_safari'){
      k.append(the('p','','Bấm nút Chia sẻ của Safari (ô vuông có mũi tên lên), rồi chọn “Thêm vào MH chính”.'));
    }else if(loai==='mo_safari'){
      k.append(the('p','','iPhone chỉ thêm biểu tượng được từ Safari. Bấm gửi link, rồi mở link đó bằng Safari nha.'));
    }else if(loai==='mo_chrome'){
      k.append(the('p','','Chơi trong ứng dụng này dễ mất ván. Mở trình duyệt để giữ ván nha.'));
      const nhom=document.createElement('div');nhom.className='web47-nhom web77-nhom';k.append(nhom);
      if(/Android/i.test(navigator.userAgent)){const b=M.ganNut(nhom,{chrome:true,bao});b.addEventListener('click',()=>bam('mo_chrome','bam'));}
    }
    if(M&&loai!=='mo_chrome'||M&&!/Android/i.test(navigator.userAgent)){
      const g=the('button','web77-nut','Gửi link ván');g.type='button';hang.append(g);
      g.onclick=async()=>{
        g.disabled=true;let kq='loi';
        try{
          const url=await M.taoLink();
          if(navigator.share){await navigator.share({title:'Dãy Trọ của mình',url});kq='ok';bao.textContent='Đã mở khay gửi link. Mai bấm link đó để chơi tiếp.';}
          else{await navigator.clipboard.writeText(url);kq='ok';bao.textContent='Đã sao chép link ván. Gửi vào Zalo cho chính mình để mai mở lại nha.';}
        }catch(e){kq=e?.name==='AbortError'?'huy':'loi';if(kq==='loi')bao.textContent='Chưa tạo được link, ván vẫn được giữ ở đây.';}
        bam('gui_link',kq);g.disabled=false;
      };
    }
    if(hang.children.length)k.append(hang);
    k.append(bao);ghi('web_duong_ve_hien',{noi,loai});
    return k;
  }

  // Chỉ đọc hẹn đã có: không gọi hienHenMai nên không đổi hẹn, không tăng hen_mai_hien.
  const henMaiChu=()=>{try{const m=docHen().mai;const l=m&&mauHen(m)?.loi;return l?'Ngày mai: '+l:'';}catch{return '';}};
  const ngayDaNhan=()=>{const v=docNgay();return v.ngay===hom()&&Number.isInteger(v.chuoi)?v.chuoi:0;};
  let daGhiTuan='';
  const ghiTuan=x=>{const khoa=hom()+x;if(daGhiTuan!==khoa){daGhiTuan=khoa;ghi('web_tuan_dau_hien',{ngay:x});}};

  function moBangNghi(h){
    if(h.querySelector('.web77-tuan'))return;
    const p=h.querySelectorAll(':scope>p');const moc=p[1]||p[0];if(!moc)return;
    const x=ngayDaNhan(),hen=henMaiChu();let sau=moc;
    if(x>=1&&x<=7||hen){const dong=the('p','web77-tuan',[x>=1&&x<=7?'Ngày '+x+'/7':'',hen].filter(Boolean).join(' · '));sau.after(dong);sau=dong;if(x>=1&&x<=7)ghiTuan(x);}
    const k=dungKhoi('nghi',h);if(k)sau.after(k);
  }
  function moBangMua(h){
    if(h.querySelector('.web77-duong-ve'))return;
    const p=h.querySelector(':scope>p');const k=p&&dungKhoi('mua',h);if(k)p.after(k);
  }
  function xemBang(n){
    const h=n.classList?.contains('web-bang')?n.querySelector('.web-hop'):null;if(!h)return;
    if(n.id==='hetLuotNgay')moBangNghi(h);
    else if(h.querySelector('h2')?.textContent==='Đã nhận, cảm ơn bạn!')moBangMua(h);
  }
  new MutationObserver(ds=>{for(const d of ds)for(const n of d.addedNodes)if(n.nodeType===1)xemBang(n);}).observe(document.body,{childList:true});

  // Quà ngày: chỉ ghép tiến độ từ dữ liệu có sẵn, phần thưởng vẫn do game tính.
  const manQua=document.getElementById('manQua'),manNV=document.getElementById('manNV');
  let chuoiTruoc=null;
  new MutationObserver(()=>{
    document.getElementById('web77TuanQua')?.remove();
    if(!manQua.classList.contains('hien'))return;
    const x=Number(document.getElementById('quaNgaySo')?.textContent);
    if(!(x>=1&&x<=7))return;
    const v=docNgay();chuoiTruoc=v.ngay&&v.ngay!==homQua()&&v.ngay!==hom()?v.chuoi:0;
    const dong=the('p','web77-tuan','');dong.id='web77TuanQua';
    dong.textContent=(x===1&&chuoiTruoc>=2?'Bắt đầu lại từ ngày 1 nha. ':'')+'Tuần đầu ở xóm · ngày '+x+'/7'+(x<3?' · Ngày 3: quà treo tường':'')+(x<7?' · Ngày 7: khách ghé + huy hiệu':'');
    document.getElementById('quaLoi').before(dong);ghiTuan(x);
  }).observe(manQua,{attributes:true,attributeFilter:['class']});
  if(manNV)new MutationObserver(()=>{
    document.getElementById('web77TuanViec')?.remove();
    if(!manNV.classList.contains('hien'))return;
    const x=ngayDaNhan();if(!(x>=1&&x<=7))return;
    const dong=the('p','web77-tuan','Tuần đầu ở xóm · ngày '+x+'/7');dong.id='web77TuanViec';
    document.getElementById('nvHenMai')?.before(dong);ghiTuan(x);
  }).observe(manNV,{attributes:true,attributeFilter:['class']});

  const css=document.createElement('style');
  css.textContent=`.web77-duong-ve{margin:8px 0;padding:10px;background:#fff8ec;border:1px solid #bc8c45;border-radius:8px;font-size:13px;line-height:1.4;text-align:left}.web77-duong-ve p{margin:4px 0}.web77-duong-ve .web77-bao:empty{display:none}.web77-hang{display:flex;gap:6px;margin-top:6px}.web77-nut{flex:1;min-width:0;min-height:44px;padding:4px 6px;background:#fff;border:1.5px solid #bc8c45;border-radius:8px;color:#4a2f20;font:inherit;font-weight:600;cursor:pointer}.web77-nut.chinh{border-color:#6b4530;font-weight:700}.web77-nut[hidden]{display:none}.web77-nhom{display:flex;gap:4px;margin-top:6px}.web77-nhom .web47-nut{flex:1}.web77-tuan{margin:6px 0;font-size:13px;line-height:1.4;font-weight:600;color:#6b4530;text-align:left}`;
  document.head.append(css);
})();
