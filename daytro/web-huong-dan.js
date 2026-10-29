// Chỉ ghép vào game WEB trước khởi tạo; nguồn game và HTML app giữ nguyên.
(() => {
  'use strict';
  if (TRONG_APP) return;
  let dang = false, luc = 0, daDo = new Set(), chi = null;
  const moiCu = moi, batCu = batDau, tiepCu = choiTiep, donCu = don;
  const hdCu = huongDan, xongCu = xongHuongDan, thangCu = hetThang;
  const css = document.createElement('style');
  css.textContent = `
    #hd {animation:none}
    .hd-mon-web {outline:3px solid var(--do-lich);outline-offset:-3px;animation:hd-mon-web 1.4s ease-in-out infinite}
    @keyframes hd-mon-web {50%{outline-color:var(--vang);background:#FFF3D6}}
    #hdBoQuaWeb {display:block;margin:2px auto 0;padding:2px 8px;font-size:13px;min-height:44px;border:0;background:transparent;color:var(--muc);text-decoration:underline;pointer-events:auto}
    #hdOTrongWeb {fill:#9CAF8C55;stroke:var(--do-lich);stroke-width:5;stroke-dasharray:10 6;pointer-events:none}
    @media(prefers-reduced-motion:reduce){.hd-mon-web{animation:none}}
  `;
  document.head.appendChild(css);
  const bo = document.createElement('button');
  bo.id = 'hdBoQuaWeb'; bo.textContent = 'Bỏ qua hướng dẫn'; bo.hidden = true;
  $('#hd').appendChild(bo);
  const doBuoc = buoc => {
    if (!dang || daDo.has(buoc)) return;
    daDo.add(buoc);
    try { window.warmJarThongKe?.('hd_buoc', {buoc, giay:Math.max(0, Math.round((Date.now()-luc)/1000))}); } catch { /* Đo lỗi vẫn chơi được. */ }
  };
  function donChi() {
    document.querySelector('.hd-mon-web')?.classList.remove('hd-mon-web');
    $('#hdOTrongWeb')?.remove(); $('#hdTay').hidden = true; bo.hidden = true; chi = null;
    $('#hd').classList.remove('hien');
  }
  moi = function(...a) {
    const k = moiCu(...a);
    // Rút đúng sáu rác như cũ để giữ dòng ngẫu nhiên; một lần chạm dọn hai bãi.
    // Trọng số nằm trên từng rác, nên tải lại giữa chừng vẫn giữ đủ thưởng.
    if (dang) st.rac = st.rac.filter((_,i) => i%2 === 0).map(r => ({...r, webGop:2}));
    return k;
  };
  batDau = function(...a) {
    let daXong = hdXong;
    try { daXong = localStorage.getItem(KHOA_HD) === 'xong'; } catch {}
    dang = !daXong; luc = Date.now(); daDo = new Set(); donChi();
    const k = batCu(...a);
    if (daXong) { hdXong = true; try { localStorage.setItem(KHOA_HD,'xong'); } catch {} }
    huongDan(); return k;
  };
  choiTiep = function(...a) { dang = false; hdXong = true; donChi(); return tiepCu(...a); };
  don = function(id, e) {
    const r = st.rac.find(v => v.id === id);
    if (r?.webGop === 2 && st.o === 0 && st.thang === 0) {
      viec('rac'); thuongHen('rac',20,5);
    }
    const k = donCu(id,e); huongDan(); return k;
  };
  xongHuongDan = function(...a) { const k = xongCu(...a); dang = false; donChi(); return k; };
  bo.onclick = () => { if (dang && (st.khach || !st.rac.length)) xongHuongDan(); };
  hetThang = function(...a) {
    const k = thangCu(...a);
    if (dang && st.dem) { doBuoc('het_thang'); xongHuongDan(); }
    return k;
  };
  function goiY() {
    const ds = [...document.querySelectorAll('#ke .the.can-mua')]
      .filter(e => DO[e.dataset.k]?.gia <= st.tien)
      .sort((a,b) => DO[a.dataset.k].gia-DO[b.dataset.k].gia);
    for (const the of ds) for (let x=0;x<N;x++) for (let y=0;y<N;y++) {
      if (datDuoc(the.dataset.k,x,y)) return {the,k:the.dataset.k,x,y};
    }
    return null;
  }
  huongDan = function() {
    if (!dang) { if (hdXong) donChi(); else hdCu(); return; }
    donChi();
    if (!st || st.dem || hdXong || document.querySelector('.phu.hien')) return;
    const k = st.khach, b = $('#hd'); let dich, chu;
    if (!k && st.rac.length) { doBuoc('rac'); dich = $('#phongKhung'); chu = 'Chạm ba bãi rác để dọn'; }
    else if (k && !k.o && !ungY()) {
      doBuoc('keo_do'); chi = goiY();
      dich = chi?.the || $('#ke'); chu = chi ? 'Kéo món sáng vào ô viền đỏ' : 'Chọn món khách cần trong tiệm';
      if (chi) {
      dich.classList.add('hd-mon-web');
      // Đưa món rẻ nhất vào vùng nhìn thấy, không cuộn dọc cả màn chơi.
      const ke = $('#ke');
      if (dich.offsetLeft < ke.scrollLeft || dich.offsetLeft+dich.offsetWidth > ke.scrollLeft+ke.clientWidth)
        ke.scrollLeft = dich.offsetLeft-ke.offsetLeft;
      const [w,d] = coCua(chi.k), [x,y] = [chi.x,chi.y];
      const oTrong = document.createElementNS('http://www.w3.org/2000/svg','polygon');
      oTrong.id = 'hdOTrongWeb';
      oTrong.setAttribute('points',pts([[x,y],[x+w,y],[x+w,y+d],[x,y+d]].map(([a,c]) => P(a*T,c*T,0))));
      $('#sang').appendChild(oTrong);
      const p = svg.createSVGPoint(), [X,Y] = P((x+w/2)*T,(y+d/2)*T,0);
      p.x = X; p.y = Y;
      const q = p.matrixTransform(svg.getScreenCTM()), g = $('#game').getBoundingClientRect(), r = dich.getBoundingClientRect();
      const tay = $('#hdTay'); tay.hidden = false;
      tay.style.setProperty('--x0',(r.left+r.width/2-g.left)+'px');
      tay.style.setProperty('--y0',(r.top+r.height/2-g.top)+'px');
      tay.style.setProperty('--x1',(q.x-g.left)+'px'); tay.style.setProperty('--y1',(q.y-g.top)+'px');
      b.dataset.mon = chi.k; b.dataset.x = x; b.dataset.y = y;
      }
    } else if (ungY()) { doBuoc('cho_thue'); dich = $('#nutChinh'); chu = 'Bấm Cho thuê để nhận tiền'; }
    else if (k?.o) { dich = $('#nutChinh'); chu = 'Bấm Hết tháng để thu tiền trọ'; }
    else return;
    bo.hidden = !k && !!st.rac.length;
    b.querySelector('.hd-chu').textContent = chu;
    b.classList.add('hien','duoi'); b.style.width = Math.min(280,$('#game').clientWidth-24)+'px';
    const g = $('#game').getBoundingClientRect(), r = dich.getBoundingClientRect();
    const x = Math.max(12,Math.min(g.width-b.offsetWidth-12,r.left-g.left+r.width/2-b.offsetWidth/2));
    b.style.left = x+'px'; b.style.top = Math.max(8,r.top-g.top-b.offsetHeight-14)+'px';
    b.style.setProperty('--mui',(r.left-g.left+r.width/2-x)+'px');
  };
})();

// #42: chỉ bản web; không sửa luật tiền, nguồn chuyện của bà hay RNG của game.
(() => {
  'use strict';
  if (TRONG_APP) return;
  const phepThu42=['127.0.0.1','localhost'].includes(location.hostname)?window.__thuLop42:null;
  const coRac=!phepThu42||phepThu42.rac===true,coChu=!phepThu42||phepThu42.chu===true,coGon=!phepThu42||phepThu42.gon===true,coThang2=!phepThu42||phepThu42.thang2===true;
  if(!coRac&&!coChu&&!coGon&&!coThang2)return;
  const css = document.createElement('style');
  // Chừa hẳn một dải cho nút, thay vì để nút nổi lên các ô sàn.
  css.textContent = (coRac?'#phongKhung #phong{height:calc(100% - 76px)}#phongKhung .hanh-dong{bottom:12px;max-width:calc(100% - 24px)}#phongKhung .hanh-dong .nut{min-height:44px}':'')+(coGon?'#web42SoNho{font-size:14px;line-height:1.5;text-align:left}#web42SoNho li{margin:8px 0;white-space:pre-line}':'');
  document.head.append(css);
  const so = document.createElement('details'); so.id = 'web42SoNho';
  so.innerHTML = '<summary>Ghi chép dãy trọ</summary><ol></ol>';
  if(coGon)$('#manCD .tam').append(so);
  function ghiNho(chu) {
    if (!st || !chu) return;
    const ds = st.web42Ghi ||= [];
    ds.push(chu); if (ds.length > 30) ds.shift();
    so.querySelector('ol').replaceChildren(...ds.map(t => { const li=document.createElement('li'); li.textContent=t; return li; }));
    loa(chu.split('\n').filter(Boolean).slice(0,2).join(' · ')+' · xem lại trong Cài đặt', 6000);
    luu(true);
  }
  // Không thêm lượt rút ngẫu nhiên, không bớt rác/thưởng. Ván cũ giữ ID và loại.
  function donViTri(p) {
    if (!p?.rac) return;
    const n=p.rong||5,ban=new Set(p.dat.flatMap(v=>o(v.k,v.gx,v.gy))),da=new Set();
    if(p.giay)ban.add(p.giay.join());
    for(const r of p.rac){
      if(!Number.isInteger(r.gx)||!Number.isInteger(r.gy)||r.gx<0||r.gy<0||r.gx>=n||r.gy>=n||ban.has(r.gx+','+r.gy)||da.has(r.gx+','+r.gy)){
        const cho=[];for(let x=0;x<n;x++)for(let y=0;y<n;y++)if(!ban.has(x+','+y)&&!da.has(x+','+y))cho.push([x,y]);
        cho.sort((a,b)=>(Math.abs(a[0]-(r.gx||0))+Math.abs(a[1]-(r.gy||0)))-(Math.abs(b[0]-(r.gx||0))+Math.abs(b[1]-(r.gy||0))));
        if(cho.length)[r.gx,r.gy]=cho[0];
      }
      r.ox=Math.max(-15,Math.min(15,Number(r.ox)||0));r.oy=Math.max(-15,Math.min(15,Number(r.oy)||0));da.add(r.gx+','+r.gy);
    }
  }
  const racCu=taoRac;
  if(coRac)taoRac=function(n,p=st.phong[st.o]){const rac=racCu(n,p);donViTri({...p,rac});return rac;};
  const veCu=veLai;
  if(coRac||coThang2)veLai=function(...a){if(coRac&&st)donViTri(st.phong[st.o]);const r=veCu(...a);if(coThang2){veHinhGocHoc();henGocHoc();}return r;};
  const tiepCu=choiTiep;
  if(coRac)choiTiep=function(...a){const r=tiepCu(...a);if(st){st.phong.forEach(donViTri);luu(true);}return r;};

  // Dùng nghề của trùm sau khi nguồn game dựng dòng tên, kể cả ván cũ.
  function ngheTrum(){const k=st?.khach,c=window.Web35?.dsTrum.find(c=>c.ma===k?.web35Trum);if(!c)return;$('#tenKhach').textContent=c.ten+' · '+c.nghe;if(!k.o&&$('#phuDePhong'))$('#phuDePhong').textContent=c.ten+' · '+c.nghe;}
  const thanhCu=veThanhTren;if(coChu)veThanhTren=function(...a){const r=thanhCu(...a);ngheTrum();return r;};
  const khachCu=khachDen;if(coChu)khachDen=function(...a){const r=khachCu(...a);ngheTrum();return r;};

  let choQua=false;
  const quaCu=quaNgay;
  if(coGon)quaNgay=function(...a){if(st&&st.thang===0&&!st.soKhach){donHenNgay();choQua=true;return tiepHang();}choQua=false;return quaCu(...a);};
  const thueCu=choThueThat;if(coGon)choThueThat=function(...a){const r=thueCu(...a);if(choQua&&st.soKhach)setTimeout(()=>xepHang(quaNgay),0);return r;};

  // Hai lựa chọn thuần trang trí: không đi qua taiHoa/veHet, không chạm RNG,
  // hàng đợi sự kiện hay kiểm tra kinh tế. Người chơi vẫn thao tác phòng được.
  const viec=document.createElement('section');viec.id='web42ViecThang2';viec.hidden=true;viec.setAttribute('aria-labelledby','web42ViecTen');
  viec.innerHTML='<b id="web42ViecTen"></b><p id="web42ViecChu"></p><div id="web42ViTri"><button data-goc42="viTri" data-gia-tri="cua_so">Gần cửa sổ</button><button data-goc42="viTri" data-gia-tri="sat_tuong">Sát tường bên kia</button></div><div id="web42Mau" hidden><button data-goc42="trangTri" data-gia-tri="cay">Xanh lá dịu mắt</button><button data-goc42="trangTri" data-gia-tri="tranh">Vàng nắng ấm áp</button></div>';
  if(coThang2){$('#game').append(viec);const cssViec=document.createElement('style');cssViec.textContent='#web42ViecThang2{position:absolute;left:8px;right:8px;bottom:8px;z-index:8;padding:10px;background:#FFF9EC;border:2px solid #795039;border-radius:10px;box-shadow:0 3px 10px #0002;font:14px/1.4 "Be Vietnam Pro",sans-serif;color:#563D2C}#web42ViecThang2[hidden],#web42ViecThang2 [hidden]{display:none!important}#web42ViecThang2 p{margin:4px 0 8px}#web42ViecThang2>div{display:flex;gap:8px}#web42ViecThang2 button{flex:1;min-height:44px;padding:6px;border:1px solid #795039;border-radius:7px;background:#FFFDF7;color:inherit;font:inherit}';document.head.append(cssViec);}
  let choKetThang=null;
  function veHinhGocHoc(){
    $('#web42GocHoc')?.remove();const g=coThang2&&st?.phong[st.o]?.web42GocHoc;if(!g?.viTri)return;
    const [x,y]=P((g.viTri==='cua_so'?.5:N-1.5)*T,.5*T,90);$('#sang').insertAdjacentHTML('beforeend',`<g id="web42GocHoc" pointer-events="none" transform="translate(${x},${y})"><rect x="-20" y="-30" width="40" height="26" rx="3" fill="${g.trangTri==='cay'?'#9CAF8C':'#C58B24'}" stroke="#795039"/><path d="M-12,-22h24m-24,8h24" stroke="#FFF9EC"/></g>`);
  }
  function henGocHoc(){
    viec.hidden=!coThang2||!st||st.thang!==1||!!st.web42Thang2Xong;if(viec.hidden)return;
    const g=st.phong[0].web42GocHoc||{},ten=st.phong[0].khach?.ten||'Linh';
    $('#web42ViecTen').textContent='Tháng 2 · '+ten+' nhờ sắp góc học';
    $('#web42ViecChu').textContent=g.viTri?'Chọn màu bảng cho góc học nhé. Hai kiểu đều miễn phí, không tăng giá thuê.':'Chọn chỗ treo bảng cho góc học nhé. Không tốn tiền, không tăng giá thuê.';
    $('#web42ViTri').hidden=!!g.viTri;$('#web42Mau').hidden=!g.viTri;
  }
  viec.addEventListener('click',e=>{
    const b=e.target.closest('[data-goc42]');if(!b||!coThang2||st?.thang!==1||st.web42Thang2Xong)return;
    const g=st.phong[0].web42GocHoc||={},truong=b.dataset.goc42;
    if(truong==='viTri')g.viTri=b.dataset.giaTri;else if(g.viTri){g.trangTri=b.dataset.giaTri;st.web42Thang2Xong=true;}
    luu(true);veHinhGocHoc();henGocHoc();
    if(st.web42Thang2Xong){const cho=choKetThang;choKetThang=null;noi('“Góc học xinh rồi, cảm ơn anh chị nha!”');if(cho?.van===st&&!st.dem)hetThang(...cho.a);}
  });
  const hetCu=hetThang;if(coThang2)hetThang=function(...a){if(st?.thang===1&&!st.web42Thang2Xong){choKetThang={van:st,a};henGocHoc();return;}return hetCu(...a);};

  // Thư thường vẫn nằm trong Hộp thư; không chen thêm một lần phải đóng.
  const laCu=moLa;if(coGon)moLa=function(la){if(st?.thang<12){ghiNho('Lá thư dưới cửa\n'+la);return tiepHang();}return laCu(la);};
  // Chuyện của bà, thư Linh và mọi bảng có lựa chọn vẫn giữ nguyên.
  let dang=false;
  const nhacDa=new Set();
  function gonBang(){
    if(!coGon||dang||!st)return;dang=true;
    try{
      if($('#manNho').classList.contains('hien')&&$('#nhoTen').textContent==='Mình làm gì tiếp nhỉ?'){
        const ma=st.thang+':'+(st.rac.length?'rac':st.khach&&!st.khach.o?'do':'thang');
        const da=nhacDa.has(ma);nhacDa.add(ma);
        if(da||$('#hd').classList.contains('hien')){$('#manNho').classList.remove('hien');lucThaoTac=Date.now();tiepHang();}
      }
      if($('#manDem').classList.contains('hien')){ghiNho($('#demLoi').textContent);$('#nutSang').click();}
      if($('#manHoa').classList.contains('hien')&&$('#hoaB').hidden&&hoaDang?.ma!=='web35BaoPccc'){ghiNho($('#hoaTen').textContent+'\n'+$('#hoaLoi').textContent);$('#hoaA').click();}
    }finally{dang=false;}
  }
  const nhin=new MutationObserver(gonBang);if(coGon)for(const id of ['manNho','manDem','manHoa'])nhin.observe($('#'+id),{attributes:true,attributeFilter:['class']});
  window.Web42={donViTri,henGocHoc,gonBang,co:{rac:coRac,chu:coChu,gon:coGon,thang2:coThang2}};
})();
