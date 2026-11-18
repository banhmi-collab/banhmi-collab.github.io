// Chỉ web (15/11): mở game không hiện quá 2 bảng liền nhau.
// Quà/tiền (tiền vắng, quà ngày, lời hẹn) vẫn hiện trước như cũ; thư và tin nhắn (thư hàng xóm,
// chuyện dãy trọ, chuyện Linh, "Linh nhắn") được dời: 8 giây đầu không hiện thư; đã có 2 bảng
// thì thư tiếp theo chờ 60 giây sau khi bảng trước đóng. Không mất thư, chỉ tới chậm hơn.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  if(typeof taiHoa!=='function'||typeof xepHang!=='function'||typeof tiepHang!=='function')return;
  const TOI_DA=2,DAU=8e3,GIAN=60e3;
  const CHON='.phu.hien,.web-bang,#coGiMoi,#chuTroThe,#thuLinh';
  const gio=()=>Date.now();
  let vaoLuc=0,dem=0,dongLuc=0,khoaTruoc='';
  const cho=[];   // [{ma, chay}] thư đang chờ, không trùng mã
  const daVao=()=>typeof st!=='undefined'&&!!st&&typeof daVaoGame!=='undefined'&&daVaoGame;
  function khoaBang(){
    return [...document.querySelectorAll(CHON)].map(e=>(e.id||e.className)+':'+((e.querySelector('h2,h3,#hoaTen,#nhoTen')||{}).textContent||'')).join('|');
  }
  // Đếm bảng mới hiện (đổi bảng hay đổi tiêu đề đều tính là bảng mới).
  function theoDoi(){
    if(!daVao()){vaoLuc=0;dem=0;dongLuc=0;khoaTruoc='';cho.length=0;return;}
    if(!vaoLuc)vaoLuc=gio();
    const k=khoaBang();
    if(k&&k!==khoaTruoc)dem++;
    if(!k&&khoaTruoc)dongLuc=gio();
    khoaTruoc=k;
  }
  // 18/11: người chơi TỰ bấm Hộp thư để đọc thư Linh thì mở ngay, không hoãn (trước đây bị hoãn khi đã
  // có 2 bảng lúc mở game → "bấm Hộp thư không được", chuyện Linh kẹt — lỗi #53 quay lại). Chỉ áp khi bấm nút Hộp thư.
  let chamHopLuc=0;
  const ghiCham=ev=>{if(ev.target?.closest?.('#nutHop'))chamHopLuc=gio();};
  document.addEventListener('pointerdown',ghiCham,true);document.addEventListener('click',ghiCham,true);
  function choPhep(){
    if(!daVao()||window.ItBangWeb?.boQua)return true;   // boQua: chỉ bài kiểm riêng của thư Linh/thư xóm dùng
    if(gio()-chamHopLuc<1500)return true;
    if(document.querySelector(CHON))return false;
    const t=gio();
    if(t-(vaoLuc||t)<DAU)return false;
    return dem<TOI_DA||t-dongLuc>=GIAN;
  }
  function hoan(ma,chay){
    const i=cho.findIndex(c=>c.ma===ma);
    if(i>=0)cho[i].chay=chay;else cho.push({ma,chay});
  }
  function nhaThu(){
    theoDoi();
    if(!cho.length||!choPhep())return;
    if(typeof hang!=='undefined'&&hang.length)return;   // để quà/tiền đang xếp hàng đi trước
    const c=cho.shift();xepHang(c.chay);
  }
  const laThu=l=>!!l&&typeof l==='object'&&l.icon==='thu';
  const taiHoaGoc=taiHoa;
  taiHoa=function(l,...a){
    if(laThu(l)&&!choPhep()){hoan('hoa:'+(l.ma||l.ten),()=>taiHoaGoc(l,...a));tiepHang();return;}
    return taiHoaGoc(l,...a);
  };
  if(typeof moChuyenLinh==='function'){
    const linhGoc=moChuyenLinh;
    moChuyenLinh=function(...a){
      if(!choPhep()){hoan('chuyenLinh',()=>moChuyenLinh(...a));tiepHang();return;}
      return linhGoc(...a);
    };
  }
  // Bảng đổi ngay trong một lần bấm (đóng bảng này mở bảng kia) vẫn phải đếm: theo dõi thay đổi tức thì.
  if(typeof MutationObserver==='function')new MutationObserver(theoDoi).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(theoDoi,500);
  setInterval(nhaThu,1000);
  // Vào ván khác (tải ván/chơi mới) thì đếm lại từ đầu.
  let stTruoc=null;
  setInterval(()=>{if(typeof st!=='undefined'&&st&&st!==stTruoc){if(stTruoc)datLai();stTruoc=st;}},500);
  function datLai(){vaoLuc=daVao()?gio():0;dem=0;dongLuc=0;khoaTruoc=khoaBang();cho.length=0;}
  window.ItBangWeb={choPhep,datLai,dem:()=>dem,cho:()=>cho.map(c=>c.ma),TOI_DA,DAU,GIAN};
})();
