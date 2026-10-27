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
