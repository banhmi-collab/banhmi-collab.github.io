// Dữ liệu mùa lễ dùng chung cho muaLe và nội dung sự kiện. Chỉ ghép vào web.
(() => {
  'use strict';
  const ds=[
    {ma:'tri_an_2026',ten:'Tri ân thầy cô 20/11',nhan:'20/11',tienToQua:'web44',mua:'triAn',ky:'tri_an_2026',goi:null,batDau:'2026-11-15T00:00:00+07:00',ketThuc:'2026-11-24T00:00:00+07:00',
      khach:[{ma:'coMai',ten:'Cô Mai',nghe:'Cô giáo trẻ mới về trường',loi:'Cô mới nhận lớp, cần chỗ yên tĩnh để soạn bài.'}],
      do:[{ma:'hoaTriAn',ten:'Bó hoa 20/11',gia:80},{ma:'bangTriAn',ten:'Bảng đen nhỏ',gia:120},{ma:'keTriAn',ten:'Kệ sách gỗ kỷ niệm',gia:180}],
      nv:[{ma:'thue',loai:'thue',ten:'Cho cô giáo thuê',qua:'Lời nhắn của cô Mai'},{ma:'hoa',loai:'bay',do:'hoaTriAn',ten:'Bày một bó hoa 20/11',qua:'Tấm ảnh lớp học'},{ma:'sao',loai:'sao',can:3,ten:'Đưa dãy trọ lên 3 sao',qua:'Trang vở đầu năm'}],qua:'Thiệp cảm ơn'},
    {ma:'noel',ten:'Noel xóm trọ',mua:'noel',goi:'goi_noel',hangNam:true,batDau:'12-01',ketThuc:'12-27',khach:[],do:[],nv:[]},
    {ma:'tet_2027',ten:'Tết xóm trọ',mua:'tet',ky:'tet-2027',goi:'goi_tet',batDau:'2027-01-22T00:00:00+07:00',ketThuc:'2027-02-16T00:00:00+07:00',khach:[],do:[],nv:[]},
  ];
  // ketThuc là mốc loại trừ: giữ trọn ngày cuối, không hụt giây cuối ngày.
  function muaLe(d=new Date()){
    const nam=new Date(+d+7*3600000).getUTCFullYear();
    for(const s of ds){const a=s.hangNam?`${nam}-${s.batDau}T00:00:00+07:00`:s.batDau,b=s.hangNam?`${nam}-${s.ketThuc}T00:00:00+07:00`:s.ketThuc;
      if(+d>=Date.parse(a)&&+d<Date.parse(b))return {...s,batDau:a,ketThuc:b,ky:s.ky||s.ma+'-'+nam};}
    return null;
  }
  function ngayThu(host,query,that=Date.now()){
    const n=new URLSearchParams(query).get('ngay');
    return ['localhost','127.0.0.1','[::1]'].includes(host)&&/^\d{4}-\d{2}-\d{2}$/.test(n||'')&&Number.isFinite(Date.parse(n+'T12:00:00+07:00'))?Date.parse(n+'T12:00:00+07:00'):that;
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={ds,muaLe,ngayThu};return;}
  if(window.ReactNativeWebView||window.SuKienWeb)return;
  const luc=()=>ngayThu(location.hostname,location.search),hienTai=()=>muaLe(new Date(luc())),noiDung=ds.filter(s=>s.nv.length);
  // Luôn giữ cấu hình mùa cũ trong ds; chỉ nối mùa mới ở cuối để giữ chỉ số đồ treo.
  let tri=noiDung[0];
  function chonMua(){const s=hienTai();if(s?.nv.length)tri=s;return s;}
  const quaMa=(ma,s=tri)=>(s.tienToQua||'web44-'+s.ma)+'-'+ma;
  const ghi=(ten,p)=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  function du(){if(!st)return null;if(!st.webSuKien||typeof st.webSuKien!=='object'||Array.isArray(st.webSuKien))st.webSuKien={};let d=st.webSuKien[tri.ma];if(!d||typeof d!=='object'||Array.isArray(d))d=st.webSuKien[tri.ma]={};if(!Array.isArray(d.nv))d.nv=[];return d;}
  const hinhQua=()=>'<rect class="n" x="220" y="-224" width="100" height="90" rx="4" fill="#997455"/><rect x="228" y="-216" width="84" height="74" fill="#fff1d2"/><path d="M242 -192h56m-56 12h56m-45 12h34" stroke="#75583d" fill="none"/><text x="270" y="-148" text-anchor="middle" font-size="10" fill="#75583d">20/11</text>';
  for(const s of noiDung)for(const n of [...s.nv,{ma:'xong',qua:s.qua}])TREO.push({ten:n.qua,gia:0,thue:0,qua:quaMa(n.ma,s),ve:()=>hinhQua().replace('20/11',s.nhan||s.ma)});
  const hinh=[()=>'<path class="n" d="M-26 -42L0 -8 26 -42 0 -29Z" fill="#eac788"/><path d="M-13 -43L0 -12 14 -43" stroke="#6d8856" fill="none"/><g fill="#bb655a" stroke="#694b37"><circle cx="-15" cy="-48" r="12"/><circle cx="4" cy="-56" r="13"/><circle cx="19" cy="-44" r="10"/></g>',
    ()=>'<path d="M-30 -10L-40 20M30 -10L40 20" stroke="#92663f" stroke-width="5"/><rect class="n" x="-47" y="-74" width="94" height="64" rx="3" fill="#936a43"/><rect x="-40" y="-67" width="80" height="50" fill="#435e50"/><path d="M-28 -49h43m-43 12h56" stroke="#f8efda" fill="none"/>',
    ()=>'<rect class="n" x="-38" y="-98" width="76" height="100" fill="#b18a5e"/><path d="M-31 -89h62v35h-62zm0 44h62v35h-62z" fill="#75543a"/><path d="M-24 -85v27m14 -27v27m14 -27v27m14 -27v27m-42 18v25m14 -25v25m14 -25v25m14 -25v25" stroke="#e4c798" stroke-width="9"/>'];
  // Đăng ký trước docLuu để bộ lọc ván cũ không làm mất đồ sau khi hết mùa.
  for(const s of noiDung)for(const [i,d] of s.do.entries())DO[d.ma]={ten:d.ten,gia:d.gia,thue:0,nhom:'kyNiemMua',co:[1,1],webSuKien:s.ma,cau:'Một góc nhỏ để nhớ mùa lễ.',ve:hinh[d.hinh??i%hinh.length]};
  function tangQua(ma){if(!Array.isArray(st.quaTrangTri))st.quaTrangTri=[];if(!st.quaTrangTri.includes(ma))st.quaTrangTri.push(ma);}
  const css=document.createElement('style');css.textContent=`#web44Dai{display:block;width:100%;grid-column:1/-1;border:1px solid #a38a60;border-radius:8px;background:#fff0d2;color:#503520;padding:3px 10px;text-align:left;pointer-events:none;font:11px/1.3 'Be Vietnam Pro',sans-serif}#web44Dai[hidden]{display:none}#web44NV article{border-bottom:1px solid #d6c6aa;padding:9px 0;font-size:14px}#ke .su-kien-mua{font-size:11px;color:#75502a;white-space:normal}#phongKhung[data-nhan-mua]:after{content:attr(data-nhan-mua);position:absolute;top:27%;right:6%;padding:4px 8px;background:#f3dfae;color:#77573e;border:1px solid #a38a60;border-radius:4px;pointer-events:none;font:12px Mali}`;document.head.append(css);
  const dai=document.createElement('div');dai.id='web44Dai';dai.hidden=true;document.querySelector('.tren').append(dai);dai.setAttribute('aria-label','Sự kiện mùa · xem trong Mục tiêu');
  const bang=document.createElement('section');bang.id='web44NV';document.getElementById('mucGanDayDu').after(bang);
  // Đồ kỷ niệm có kệ riêng để người mới vẫn thấy món khách đang cần trước.
  let dangDoMua=false;
  const tab=document.createElement('div');tab.id='web44Ke';tab.style.cssText='display:flex;gap:8px;padding:0 12px';tab.hidden=true;
  for(const [chu,chon] of [['Đồ phòng',false],['Đồ 20/11',true]]){const b=document.createElement('button');b.className='nut nhe';b.style.cssText='min-height:44px;flex:1;font-size:12px;line-height:1.2;white-space:nowrap';b.textContent=chu;b.onclick=()=>{dangDoMua=chon;veTiem();};b.dataset.mua=String(chon);tab.append(b);}document.getElementById('ke').before(tab);
  const khoa='day-tro-sk-mua-da-hien';let daHien=[];try{const a=JSON.parse(localStorage.getItem(khoa));if(Array.isArray(a))daHien=a;}catch{}
  const soNgay=s=>Math.max(1,Math.ceil((Date.parse(s.ketThuc)-luc())/86400000));
  let dangCap=false,maKe='',nvVe='';
  function cap(){if(!st||!daVaoGame||dangCap)return;dangCap=true;try{const s=chonMua(),d=du(),bat=!!s?.nv.length;dai.hidden=!bat;const khung=document.getElementById('phongKhung');if(bat)khung.setAttribute('data-nhan-mua',s.nhan||s.ten);else khung.removeAttribute('data-nhan-mua');let sua=false;
    if((s?.ma||'')!==maKe){maKe=s?.ma||'';veTiem();}
    if(s&&!daHien.includes(s.ky)&&!document.querySelector('.phu.hien,.web-bang')){daHien.push(s.ky);try{localStorage.setItem(khoa,JSON.stringify(daHien));}catch{}ghi('web_sk_mua_hien',{ma:s.ma});}
    if(!bat){if(nvVe){bang.replaceChildren();nvVe='';}return;}
    const dat=n=>n.loai==='thue'?!!d.thue:n.loai==='bay'?st.phong.some(p=>p.dat.some(v=>v.k===n.do)):n.loai==='sao'?saoDay()>=n.can:false;
    for(const n of s.nv)if(dat(n)&&!d.nv.includes(n.ma)){d.nv.push(n.ma);tangQua(quaMa(n.ma));ghi('web_sk_mua_nv',{ma:s.ma,nv:n.ma});sua=true;}
    if(s.nv.every(n=>d.nv.includes(n.ma))&&!d.xong){d.xong=true;tangQua(quaMa('xong'));ghi('web_sk_mua_xong',{ma:s.ma});sua=true;}
    const chu=s.ten+' · còn '+soNgay(s)+' ngày · '+d.nv.length+'/'+s.nv.length+' việc';if(dai.textContent!==chu)dai.textContent=chu;
    const khoaNV=s.ma+':'+chu+':'+d.nv.join(',');if(khoaNV===nvVe){if(sua)luu(true);return;}nvVe=khoaNV;bang.replaceChildren();const t=document.createElement('h3');t.textContent=s.ten;bang.append(t);
    for(const n of s.nv){const p=document.createElement('article');p.textContent=n.ten+' · '+(d.nv.includes(n.ma)?'Đã nhận: ':'Quà: ')+n.qua;bang.append(p);}const p=document.createElement('p');p.textContent=d.xong?'Đã nhận '+s.qua+'. Giữ lại để trang trí nhé.':'Xong '+s.nv.length+' việc nhận '+s.qua+'. Hết sự kiện, việc dở đóng; đồ và quà đã có vẫn giữ.';bang.append(p);if(sua)luu(true);
  }finally{dangCap=false;}}
  const tiemCu=veTiem;veTiem=function(...a){const r=tiemCu(...a),s=chonMua(),bat=!!s?.nv.length;tab.hidden=!bat;tab.style.display=bat?'flex':'none';document.querySelector('.ten-tiem').hidden=bat;
    if(!bat)dangDoMua=false;
    for(const b of tab.children)b.setAttribute('aria-pressed',String(b.dataset.mua===String(dangDoMua)));
    tab.children[1].textContent=bat?(s.nhan||s.ten)+' · '+soNgay(s)+' ngày':'Đồ sự kiện';
    for(const the of document.querySelectorAll('#ke .the')){const d=DO[the.dataset.k];if(d?.webSuKien){if(!bat||!dangDoMua||d.webSuKien!==s.ma)the.remove();else{const n=document.createElement('div');n.className='su-kien-mua';n.textContent='Sự kiện · còn '+soNgay(s)+' ngày';the.append(n);}}else if(bat&&dangDoMua)the.remove();}return r;};
  // Quà cũ của bà vẫn rút từ kho cũ; đồ theo mùa do người chơi tự chọn mua.
  const doCu=tangDoCu;tangDoCu=function(k){const cac=noiDung.flatMap(s=>s.do).map(d=>[d.ma,Object.getOwnPropertyDescriptor(DO,d.ma)]);try{if(!k)for(const [ma,d] of cac)Object.defineProperty(DO,ma,{...d,enumerable:false});return doCu.apply(this,arguments);}finally{for(const [ma,d] of cac)Object.defineProperty(DO,ma,d);}};
  const muaCu=mua;mua=function(k,...a){if(DO[k]?.webSuKien&&hienTai()?.ma!==DO[k].webSuKien)return loa('Món này đã hết mùa bán. Đồ đã có vẫn giữ nhé.');return muaCu(k,...a);};
  let dangKhach=false;
  const taoCu=taoKhach;taoKhach=function(...a){const k=taoCu(...a);if(dangKhach&&!k.chuyen&&!k.web35Trum){const c=tri.khach[(du().soGap||0)%tri.khach.length];k.ten=c.ten;k.dang={...KIEU[c.kieuVe||'coGiao'].nguoi[0][1]};k.webSuKien=tri.ma;k.webKhachMua=c.ma;}return k;};
  const denCu=khachDen;khachDen=function(...a){const s=chonMua(),d=du(),p=st?.phong[st.o],truoc=st?.khach;dangKhach=!!s?.khach.length&&!!st?.chuyenLinh&&d.khThang!==st.thang&&p?.mo&&!p.loai&&!p.mb&&!st.dem&&!st.khach&&!st.rac.length&&st.luot>0&&!document.querySelector('.phu.hien');
    try{const r=denCu(...a);if(st.khach!==truoc&&st.khach?.webSuKien===tri.ma&&!st.khach.o){d.khThang=st.thang;d.soGap=(d.soGap||0)+1;const c=khachMua(st.khach);document.getElementById('tenKhach').textContent=c.ten+' · '+c.nghe;luu(true);}return r;}finally{dangKhach=false;}};
  function khachMua(k){return ds.find(s=>s.ma===k.webSuKien)?.khach.find(c=>c.ma===k.webKhachMua);}
  function hoi(k){return (khachMua(k)?.loi||'Khách ghé xóm trọ.')+' Cần '+k.can.map(n=>NHOM[n].ten).join(', ')+' · tối đa '+dong(k.tran)+'.';}
  const thanhCu=veThanhTren;veThanhTren=function(...a){const r=thanhCu(...a),k=st?.khach,c=k&&khachMua(k);if(c&&!k.o)document.getElementById('phuDePhong').textContent=c.ten+' · '+c.nghe;return r;};
  const thueCu=choThueThat;choThueThat=function(...a){const k=st.khach,chua=k&&!k.o,r=thueCu(...a);if(chua&&k.o&&k.webSuKien===tri.ma&&hienTai()?.ma===tri.ma){du().thue=true;cap();noi(khachMua(k)?.chot||'Phòng vừa vặn quá, cảm ơn chủ trọ nha.',3000);luu(true);}return r;};
  const veCu=veHet;veHet=function(...a){const r=veCu(...a);cap();return r;};
  // Ghi thêm mã quà đang treo: mùa sau nối thêm quà không làm đổi đồ đã treo.
  // Ván cũ chỉ có chỉ số vẫn đọc nguyên; không đổi khóa lưu hay danh sách quà sở hữu.
  const luuCu=luu;luu=function(...a){if(st)for(const p of st.phong){const ma=TREO[p.treo||0]?.qua;if(ma)p.webQuaTreo=ma;else if(p.webQuaTreo!=null)p.webQuaTreo=null;}return luuCu(...a);};
  const docCu=docLuu;docLuu=function(...a){const v=docCu(...a);if(v)for(const p of v.phong){if(typeof p.webQuaTreo!=='string')continue;const i=TREO.findIndex(t=>t.qua===p.webQuaTreo);p.treo=i>=0?i:0;}return v;};
  window.SuKienWeb={ds,muaLe,ngayThu,hienTai,du,cap,hoi};setInterval(cap,1500);
})();
