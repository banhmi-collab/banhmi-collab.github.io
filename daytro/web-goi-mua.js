// #73 chỉ web; nạp SAU web-xom-tro.js. Tuyệt đối chỉ nối cuối TREO.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const W=window.DayTroWeb,goi='phong_sv';
  const net=(d,m=OAK)=>`<path class="n" d="${d}" fill="${m}"/>`;
  function nem(){
    return hop(-78,-100,0,156,200,16,KEM)+hop(-76,-96,16,152,138,6,XANH)
      +hop(-63,54,17,126,38,12,KEM)+[-56,-20,16,52].map(x=>poly([[x,-94,23],[x+5,-94,23],[x+5,40,23],[x,40,23]],OAK)).join('');
  }
  function quat(){
    return tru(0,8,33,33,XANH)+tru(8,108,6,5,XAM)
      +`<g transform="translate(0,-156)"><circle class="n" r="45" fill="${KEM}"/>`
      +[0,120,240].map(a=>`<path class="n" fill="${XANH}" transform="rotate(${a})" d="M0 0 Q-30 -6 -20 -30 Q12 -46 8 -10 Z"/>`).join('')
      +`<circle class="n" r="7" fill="${OAK}"/><circle class="n" r="37" fill="none"/><path class="n" fill="none" d="M-43 0 H43 M0 -43 V43"/></g>`;
  }
  function moc(){
    return hop(-55,-23,0,110,46,7,OAK)+hop(-48,-7,7,7,14,145,OAK)+hop(41,-7,7,7,14,145,OAK)
      +hop(-48,-7,150,96,14,7,OAK)+net('M-18 -144 Q-18 -156 -10 -149 L-10 -140 L-31 -125 L11 -125 Z','none')
      +net('M-19 -127 L-32 -117 L-27 -98 L-18 -104 L-18 -65 L9 -65 L9 -104 L18 -98 L23 -117 L10 -127 L0 -117 Z',DAT);
  }
  function ke(){
    let s=hop(-48,-22,0,8,44,148,OAK)+hop(40,-22,0,8,44,148,OAK);
    for(const z of [8,66,126])s+=hop(-40,-22,z,80,44,7,OAK);
    for(const [x,h,m] of [[-32,42,XANH],[-13,47,DAT],[8,36,KEM],[24,43,XAM]])s+=hop(x,-12,73,12,26,h,m);
    return s+hop(-27,-10,15,49,28,29,KEM);
  }
  function den(){return hop(-17,-14,0,34,28,9,XAM)+net('M-5 -8 L-5 -65 L22 -91','none')+net('M11 -92 L31 -103 L49 -77 L21 -61 Z',XANH)+net('M-13 -8 H13','none');}
  function binh(){return tru(0,12,23,23,XANH)+tru(12,78,21,21,KEM)+tru(78,92,11,11,XANH)+net('M-8 -69 H8 M-8 -49 H8 M-8 -29 H8','none')+hop(19,-5,22,16,10,9,XAM);}
  const mon={
    svNem:{ten:'Nệm sàn kẻ sọc',co:[2,2],gia:350,thue:100,nhom:'ngu',ve:nem},
    svQuat:{ten:'Quạt cây xanh',co:[1,1],gia:180,thue:50,nhom:'mat',ve:quat},
    svMoc:{ten:'Móc treo đồ gỗ',co:[1,1],gia:120,thue:50,nhom:'cat',ve:moc},
    svKe:{ten:'Kệ sách gỗ thông',co:[1,1],gia:280,thue:100,nhom:'hoc',ve:ke},
    svDen:{ten:'Đèn bàn kẹp',co:[1,1],gia:100,thue:50,nhom:'hoc',ve:()=>'<g transform="scale(1.4)">'+den()+'</g>'},
    svBinh:{ten:'Bình nước lọc',co:[1,1],gia:100,thue:50,nhom:'nuoc',ve:binh}
  };
  for(const [k,d] of Object.entries(mon))DO[k]={...d,goi,cau:'Góc phòng nhỏ, có món này thấy thân quen ghê.'};
  NHO.add('svDen');NHO.add('svBinh');MAT.svKe=133;
  const dauTreo=TREO.length;
  TREO.push({ten:'Khăn vải hoa treo tường',goi,gia:150,thue:50,ve:()=>`<path class="n" fill="${KEM}" d="M204 -258 H336 V-120 H204 Z"/>`
    +[220,246,272,298,324].flatMap(x=>[-234,-190,-148].map(y=>`<g transform="translate(${x},${y})"><circle r="5" fill="${DAT}"/><path d="M0 -9 V9 M-9 0 H9" stroke="${XANH}" stroke-width="3"/></g>`)).join('')
    +`<path class="n" d="M196 -264 H344" fill="none"/>`});
  TREO.push({ten:'Bảng ghim lịch học',goi,gia:120,thue:50,ve:()=>`<rect class="n" x="210" y="-250" width="120" height="92" fill="${OAK}"/><rect class="n" x="222" y="-240" width="94" height="68" fill="${KEM}"/>`
    +[0,1,2].map(i=>`<path class="n" fill="none" d="M232 ${-223+i*18} H306"/>`).join('')
    +`<path class="n" d="M252 -231 V-177 M278 -231 V-177" fill="none"/><circle cx="268" cy="-239" r="4" fill="${DAT}"/>`});
  GOI_INFO[goi]={ten:'Phòng sinh viên năm nhất',mo:'8 món: nệm sàn, quạt cây, móc treo đồ, kệ sách gỗ thông, đèn bàn kẹp, khăn vải hoa treo tường, bình nước lọc, bảng ghim lịch học. Mua một lần dùng mãi; đồ vẫn dùng tiền trong game để bày.',gia:'19.000đ'};
  const hinhCu=hinhGoi;
  hinhGoi=function(id){return id===goi?`<svg class="tem-goi" data-hinh-goi="phong_sv" viewBox="-180 -160 360 320" aria-hidden="true">${nem()}</svg>`:hinhCu(id);};
  W.phongSinhVien=Object.freeze({mon:Object.keys(mon),dauTreo,soTreo:2});
})();
