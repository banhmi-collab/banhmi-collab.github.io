// #74 chỉ web; nạp SAU web-goi-mua.js. Gói tang_lau 25k: tầng lầu cho dãy trọ.
// st.phong[8], [9] = P.7, P.8 trên lầu (cho thuê như phòng thường, mở bằng tiền trong game).
// st.phong[10] = sân thượng (loai 'nha' + thuong: chỉ bày đồ, không có khách), mở cùng P.7.
// Không có gói: ván chỉ thêm 3 phòng đóng, không thấy gì khác.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const W=window.DayTroWeb,goi='tang_lau',L7=8,L8=9,ST=10,GIA_LAU={8:15000,9:18000},THUONG=20,CAN_MON=3;
  const phongLau=()=>[phongMoi({lau:true}),phongMoi({lau:true}),phongMoi({loai:'nha',thuong:true,luot:0,rong:6})];
  // Ván nào cũng đủ 11 chỗ để chỉ số phòng cố định.
  function du(){if(st&&Array.isArray(st.phong)&&st.phong.length===8)st.phong.push(...phongLau());}
  const coLau=()=>coGoi(goi)&&!!st?.phong[5]?.mo;

  // ── 6 món sân thượng ────────────────────────────────────────────────────
  const HONG='#E07A9B',INOX='#D5D9DC';
  const mon={
    ltBon:{ten:'Bồn nước inox',nhom:'nuoc',gia:400,ve:()=>tru(0,24,30,30,XAM)+tru(24,150,44,44,INOX)+tru(150,166,30,18,INOX)+elip(0,-60,22,6,'#BFC4C8')},
    ltChau:{ten:'Chậu cây lớn',nhom:'cay',gia:300,ve:()=>tru(0,70,36,46,DAT)+elip(-30,-118,40,34,'#7F9A6E')+elip(28,-126,38,32,XANH)+elip(0,-156,44,36,XANH)},
    ltGhe:{ten:'Ghế xếp',nhom:'ngoi',gia:150,ve:()=>[[-28,-28],[22,-28],[-28,22],[22,22]].map(([x,y])=>hop(x,y,0,6,6,52,XAM)).join('')
      +hop(-30,-30,52,60,60,8,XANH)+hop(-30,-30,60,8,60,62,XANH)},
    ltBan:{ten:'Bàn trà mini',nhom:'ngoi',gia:200,ve:()=>tru(0,10,24,24,XAM)+tru(10,58,5,5,XAM)+tru(58,66,46,46,OAK)+tru(66,84,8,7,KEM)},
    ltDu:{ten:'Dù che nắng',nhom:'mat',gia:250,ve:()=>tru(0,14,26,26,XAM)+hop(-3,-3,14,6,6,190,XAM)+tru(196,246,92,4,DAT)},
    ltHoa:{ten:'Giàn hoa giấy',nhom:'cay',gia:350,ve:()=>hop(-48,-8,0,8,16,196,OAK)+hop(40,-8,0,8,16,196,OAK)+hop(-48,-8,196,96,16,8,OAK)
      +[[-40,-200],[-14,-214],[14,-206],[38,-196],[-30,-168],[4,-176],[30,-160],[-44,-132],[42,-128]].map(([x,y])=>elip(x,y,12,9,HONG)).join('')}
  };
  for(const [k,d] of Object.entries(mon))DO[k]={...d,co:[1,1],thue:50,goi,cau:'Lên sân thượng hóng gió, mê ghê.'};
  GOI_INFO[goi]={ten:'Tầng lầu & sân thượng',gia:'25.000đ',
    mo:'Xây thêm tầng lầu cho dãy trọ: 2 phòng trọ mới P.7, P.8 (mở bằng tiền trong game sau khi đủ 6 phòng) và sân thượng với 6 món riêng: bồn nước inox, chậu cây lớn, ghế xếp, bàn trà mini, dù che nắng, giàn hoa giấy. Bày từ 3 món trên sân thượng: mỗi phòng lầu có khách thêm 20k/tháng. Mua một lần dùng mãi.'};
  const nha=()=>`<g transform="scale(.62) translate(0,40)">${hop(-90,-90,0,180,180,120,KEM)+hop(-90,-90,120,180,180,110,OAK)
    +hop(-90,-90,230,180,12,26,KEM)+hop(-90,-78,230,12,168,26,KEM)+[-50,10].map(x=>hop(x,90,0,40,2,80,DAT)).join('')+[-50,10].map(x=>hop(x,90,140,40,2,60,XANH)).join('')}<g transform="translate(40,-262)">${tru(0,30,22,26,DAT)}${elip(0,-48,30,24,XANH)}</g></g>`;
  const hinhTT=W.hinhGoiTrangTri;if(hinhTT)W.hinhGoiTrangTri=id=>id===goi?`<svg class="tem-goi" viewBox="-180 -160 360 320" aria-hidden="true">${nha()}</svg>`:hinhTT(id);
  const hinhCu=hinhGoi;
  hinhGoi=function(id){return id===goi?`<svg class="tem-goi" data-hinh-goi="${goi}" viewBox="-180 -160 360 320" aria-hidden="true">${nha()}</svg>`:hinhCu(id);};

  // ── Thanh phòng: P.7, P.8, Sân thượng nằm sau P.6 ──────────────────────
  function tabPhong(i){
    const p=st.phong[i],k=p.khach,gap=st.suCo?.o===i;
    const dau=gap?bieuTuong('canhBao'):p.rac.length?bieuTuong('tay'):k&&!k.o?bieuTuong('chuong'):k?bieuTuong('vui'):'';
    return `<button class="tab ${i===st.o?'dang':''} ${gap?'gap':''}" data-p="${i}">P.${i-1}${dau?' '+dau:''}</button>`;
  }
  function themTab(){
    const tt=document.querySelector('#dayPhong [data-tt]');if(!tt||!st.phong[5]?.mo)return;
    let h='';
    if(!coGoi(goi))h=`<button class="tab khoa" data-lau-mua="1" aria-label="Xây tầng lầu, gói ${GOI_INFO[goi].gia}">＋ Lầu<span class="gia-phong">25k</span></button>`;
    else for(const i of [L7,L8]){
      if(st.phong[i].mo){h+=tabPhong(i);continue;}
      h+=`<button class="tab khoa" data-p="${i}" aria-label="Xây phòng ${i-1} trên lầu, ${dong(GIA_LAU[i])}">＋ P.${i-1}<span class="gia-phong">${gon(GIA_LAU[i])}</span></button>`;break;
    }
    if(coGoi(goi)&&st.phong[ST].mo)h+=`<button class="tab ${st.o===ST?'dang':''}" data-p="${ST}">Sân thượng</button>`;
    tt.insertAdjacentHTML('beforebegin',h);
  }
  const veDayCu=veDay;veDay=function(...a){du();const r=veDayCu(...a);themTab();return r;};
  document.getElementById('dayPhong').addEventListener('click',e=>{
    if(!e.target.closest('[data-lau-mua]'))return;
    e.stopImmediatePropagation();if(st.dem)return;
    ghi('web_lau_xem',{});moCuaHang();
    requestAnimationFrame(()=>document.querySelector(`#chNoi [data-goi-trang-tri="${goi}"]`)?.scrollIntoView({block:'center'}));
  },true);

  // ── Xây phòng lầu ──────────────────────────────────────────────────────
  function moLau(i,daHoi){
    du();if(!coLau()||st.phong[i].mo||(i===L8&&!st.phong[L7].mo))return;
    const gia=GIA_LAU[i];
    if(st.tien<gia){loa(`Cần ${dong(gia)} để xây phòng ${i-1} trên lầu`);return;}
    const duPhong=(soMo()+1)*250;
    if(!daHoi&&st.tien-gia<duPhong){
      taiHoa({ma:'hoiMoPhong',icon:'tien',ten:'Giữ một ít tiền phòng thân',
        loi:`Xây xong còn ${dong(st.tien-gia)}, chưa đủ chi phí tháng tới (khoảng ${dong(duPhong)} cho điện nước và sửa đồ). Vẫn xây?`,
        a:['Để dành thêm',()=>{}],b:['Vẫn xây',()=>moLau(i,true)]});
      return;
    }
    const p=st.phong[i],dauTien=!st.phong[ST].mo;
    p.mo=true;p.rac=taoRac(5,p);if(dauTien)st.phong[ST].mo=true;
    ghi('mo_phong',{phong:i-1});
    doiTien(-gia,`−${dong(gia)} xây phòng ${i-1}`);
    chuyenPhong(i,true);
    tieng([[523,0,.2],[659,.12,.2],[784,.24,.2],[1047,.36,.5]],'triangle',.2);
    loa(dauTien?'Lên lầu rồi! Có thêm sân thượng để bày biện':`Xây xong phòng ${i-1}! Dọn dẹp rồi đón khách`);
  }
  const moPhongCu=moPhong;moPhong=function(i,daHoi=false){return i===L7||i===L8?moLau(i,daHoi):moPhongCu(i,daHoi);};

  // ── Sân thượng: trời, lan can thấp, sàn xi măng ────────────────────────
  function veThuong(){
    const toi=st.dem,ti=toi?'#3A4668':'#CDE3EC',ti2=toi?'#34405F':'#BFD9E4';
    let s=poly([[0,0,0],[0,NT,0],[0,NT,HW],[0,0,HW]],ti)+poly([[0,0,0],[NT,0,0],[NT,0,HW],[0,0,HW]],ti2);
    s+=`<g transform="matrix(${f(-C)},${f(S)},0,1,0,0)">`+(toi?`<circle class="n" cx="460" cy="-230" r="18" fill="${KEM}"/>`
      :`<ellipse class="tron" cx="200" cy="-220" rx="40" ry="14" fill="#fff"/><ellipse class="tron" cx="234" cy="-232" rx="26" ry="14" fill="#fff"/><ellipse class="tron" cx="520" cy="-180" rx="34" ry="12" fill="#fff"/>`)+'</g>';
    s+=poly([[0,0,0],[NT,0,0],[NT,NT,0],[0,NT,0]],'#D8D2C6');
    for(let i=1;i<N*2;i++){const a=P(i*60,0,0),b=P(i*60,NT,0),c=P(0,i*60,0),d=P(NT,i*60,0);
      s+=`<path class="ron" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])} M${f(c[0])},${f(c[1])} L${f(d[0])},${f(d[1])}"/>`;}
    return s+hop(0,0,0,14,NT,84,KEM)+hop(14,0,0,NT-14,14,84,KEM);
  }
  // Sân thượng không có cửa sổ: bỏ vệt nắng chiếu xiên.
  const nangCu=anhSangPhong;anhSangPhong=function(...a){return st.phong[st.o]?.thuong?'':nangCu(...a);};
  const tuongCu=tuongVaSan;tuongVaSan=function(...a){return st.phong[st.o]?.thuong?veThuong():tuongCu(...a);};

  // ── Thưởng sân thượng cuối tháng ───────────────────────────────────────
  const soMonThuong=()=>st.phong[ST]?.dat.filter(v=>DO[v.k]?.goi===goi).length||0;
  function tienThuong(){
    if(!coGoi(goi)||!st.phong[ST]?.mo||soMonThuong()<CAN_MON)return 0;
    return [L7,L8].filter(i=>st.phong[i]?.mo&&st.phong[i].khach?.o).length*THUONG;
  }
  const sangCu=sangThang;sangThang=function(...a){const r=sangCu(...a);du();const t=tienThuong();if(t)doiTien(t,'Khách lầu thích sân thượng');return r;};
  const chuyenCu=chuyenPhong;chuyenPhong=function(i,...a){const r=chuyenCu(i,...a);
    if(i===ST&&soMonThuong()<CAN_MON)loa(`Bày ${CAN_MON} món: phòng lầu +20k/tháng`);return r;};

  W.tangLau=Object.freeze({goi,phong:[L7,L8],thuong:ST,gia:GIA_LAU,mon:Object.keys(mon),tienThuong,du});
})();
