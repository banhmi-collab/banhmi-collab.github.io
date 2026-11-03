// Chỉ web. #60: mỗi ngày thật có một lá thư mới của khách trọ, chuyện kéo dài nhiều ngày
// để người chơi có cớ ghé lại. Dùng hộp lựa chọn có sẵn (taiHoa), không đụng kinh tế ngoài quà cuối chuyện.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const TU_THANG=2; // st.thang tính từ 0: tháng 3 trong game, qua phần hướng dẫn rồi.
  const chon=(c,ma)=>c?.chon?.[ma];
  // Mỗi lá: loi(c) → chữ; a/b: [nhãn, kết quả (chữ), tiền +/− trong game]. Lá không có b chỉ có nút đọc xong.
  const XOM=[
    {ma:'vy',ten:'Vy',la:[
      {loi:()=>'Anh chị ơi, em là Vy, phòng mới vô hôm trước. Chiều qua đi xe buýt em làm rớt cái ví, trong đó có tiền trọ tháng này… Em đang xin làm thêm, anh chị cho em trễ vài bữa được không ạ?',
        a:['Cho Vy trả trễ','Vy cảm ơn rối rít: “Em hứa cuối tuần có tiền liền!”'],
        b:['Cho Vy mượn 200k xài tạm','Vy cầm tờ tiền mà mắt đỏ hoe: “Em ghi sổ đàng hoàng, trả anh chị đủ nha.”',-200]},
      {loi:c=>(chon(c,'vy1')==='b'?'Nhờ 200k anh chị cho mượn, em có tiền ăn mấy bữa rồi. ':'')+'Bữa nay em đi phát tờ rơi ngoài ngã tư, nắng muốn xỉu mà được trả tiền liền trong ngày nên em vui lắm. Tối về thấy đèn hành lang sáng, tự nhiên thấy giống nhà ghê.',
        a:['Mai ghé đọc tiếp']},
      {loi:()=>'Anh chị ơi!!! Chú bảo vệ trường gọi em, nói có người nhặt được cái ví đem gửi. Mai em lên lấy. Em không dám tin luôn á, chắc em gặp người tốt rồi.',
        a:['Mai ghé đọc tiếp']},
      {loi:()=>'Em lấy lại ví rồi, mất có cái thẻ xe buýt thôi. Em muốn làm gì đó cảm ơn dãy trọ mình, mà không biết làm gì…',
        a:['Rủ Vy làm bảng tin hành lang','Vy dán tờ giấy đầu tiên: “Ai nhặt được đồ thì ghi ở đây nha!”'],
        b:['Bảo Vy cứ lo học trước','Vy cười: “Dạ, mà em vẫn sẽ nghĩ ra cái gì đó á.”']},
      {loi:c=>'Em đóng đủ tiền trọ rồi nè'+(chon(c,'vy1')==='b'?', trả luôn 200k em mượn hôm trước':'')+'. Em có làm hộp bánh flan để trước cửa, '+(chon(c,'vy4')==='a'?'kèm tờ giấy trên bảng tin: “Cảm ơn cả dãy!”':'ăn cho vui nha')+'. Em ở đây lâu lâu luôn á.\n— Vy',
        a:[c=>'Nhận quà của Vy · +'+(chon(c,'vy1')==='b'?500:300)+'k','Vy nói lí nhí: “Hôm nào em làm thêm bánh nữa.”',c=>chon(c,'vy1')==='b'?500:300]},
    ]},
    {ma:'tuan',ten:'Tuấn',la:[
      {loi:()=>'Anh chị ơi, em là Tuấn chạy giao hàng. Tối qua anh chị có nghe tiếng meo meo không… Em thú thật, em lượm một con mèo con dưới mưa, đang giấu trong phòng. Em xin lỗi trước nha.',
        a:['Cho nuôi, miễn giữ phòng sạch','Tuấn mừng quýnh: “Em mua cát cho nó liền, không để mùi đâu!”'],
        b:['Nhờ Tuấn tìm nhà khác cho mèo','Tuấn gật đầu: “Dạ, em hỏi bạn bè coi ai nhận nuôi.”']},
      {loi:c=>chon(c,'tuan1')==='a'?'Con mèo tên Bánh Bao, em đặt vậy vì nó tròn quay. Sáng nay nó nằm ngay bậc cửa, ai đi ngang cũng xoa đầu một cái.':'Em hỏi mấy đứa bạn rồi, mà chưa ai nhận. Con mèo cứ ngồi chờ em trước cửa mỗi tối, nhìn thương lắm anh chị.',
        a:['Mai ghé đọc tiếp']},
      {loi:()=>'Hôm nay em giao tới 47 đơn, về tới nơi là sập luôn. Mở cửa ra thấy Bánh Bao kéo cái dép của em ra giữa phòng như đón em vậy. Mệt mà cười.',
        a:['Mai ghé đọc tiếp']},
      {loi:()=>'Anh chị ơi, Bánh Bao bị ho. Em đưa đi khám, bác sĩ nói cần thuốc với ở chỗ ấm. Phòng em gió lùa quá…',
        a:['Cho mượn cái mền dày','Tuấn ôm cái mền chạy về: “Em giặt sạch trả liền khi nó khỏe!”'],
        b:['Chỉ Tuấn chỗ khám mèo rẻ','Tuấn ghi lại địa chỉ: “Em cảm ơn, mai em đưa nó đi.”']},
      {loi:c=>'Bánh Bao hết ho rồi! Giờ nó đi tuần cả dãy, phòng nào mở cửa là ghé. '+(chon(c,'tuan1')==='a'?'Mấy phòng kia còn mua pate cho nó nữa.':'Cuối cùng cả dãy xin giữ nó lại, nó thành mèo của dãy trọ luôn.')+' Em gửi anh chị tiền công chuyển hàng giúp em mấy bữa nay nha.\n— Tuấn',
        a:['Nhận quà của Tuấn · +300k','Bánh Bao meo một tiếng như cảm ơn.',300]},
    ]},
    {ma:'baSau',ten:'Bà Sáu',la:[
      {loi:()=>'Chủ trọ ơi, bà là bà Sáu bán xôi đầu hẻm nè. Thằng cháu bà, thằng Bin, mới lên thành phố học lớp 10. Bà muốn gửi nó ở đây cho gần, con cho bà hỏi còn phòng không con?',
        a:['Giữ cho Bin phòng gần cửa sổ','Bà Sáu cười híp mắt: “Có nắng sớm là nó học giỏi liền à!”'],
        b:['Giữ cho Bin phòng yên tĩnh','Bà Sáu gật gù: “Ừ, yên yên cho nó tập trung.”']},
      {loi:()=>'Thằng Bin lần đầu xa nhà, tối qua nó gọi bà khóc nhè. Bà gửi mấy gói xôi để trong tủ chung, con thấy nó ủ rũ thì nhắc nó ăn giùm bà nha.',
        a:['Mai ghé đọc tiếp']},
      {loi:()=>'Bin nó khoe với bà, mấy anh chị phòng bên chỉ nó làm toán. Nó nói ở đây vui hơn nó tưởng. Bà nghe mà mừng.',
        a:['Mai ghé đọc tiếp']},
      {loi:()=>'Sắp thi học kỳ rồi, thằng Bin thức khuya quá. Bà lo nó đau. Con coi giùm bà nó nha.',
        a:['Nhắc Bin ngủ trước 12 giờ','Bin càm ràm mà vẫn tắt đèn đúng giờ.'],
        b:['Mua cho Bin đèn học đỡ mỏi mắt','Bin bật đèn mới, ngồi thẳng lưng hẳn ra.',-150]},
      {loi:c=>'Thằng Bin thi được 8 điểm Toán! Nó nói nhờ '+(chon(c,'baSau4')==='b'?'cây đèn học':'được ngủ đủ')+' với mấy anh chị chỉ bài. Bà gửi con mâm xôi gấc với chút tiền cảm ơn. Có gì cần cứ ra đầu hẻm kêu bà.\n— Bà Sáu',
        a:['Nhận quà của bà Sáu · +400k','Mâm xôi đỏ au, cả dãy chia nhau ăn.',400]},
    ]},
  ];
  const TONG=XOM.reduce((n,x)=>n+x.la.length,0);
  const homNay=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const du=()=>{const c=st.chuyenXom;return c&&typeof c==='object'&&Number.isInteger(c.so)?c:(st.chuyenXom={so:0,ngay:'',chon:{}});};
  const doWeb=(ten,p)=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const giaTri=(x,c)=>typeof x==='function'?x(c):x;
  function viTri(so){let i=so;for(const nv of XOM){if(i<nv.la.length)return {nv,doan:i};i-=nv.la.length;}return null;}
  let dangCho=null;
  function moLaHomNay(){
    const c=du(),v=viTri(c.so);if(!v)return;
    const {nv,doan}=v,la=nv.la[doan],ma=nv.ma+(doan+1),loi=la.loi(c);
    const xong=(k,lua)=>{
      const tien=giaTri(lua[2],c)||0;
      if(la.b)c.chon={...c.chon,[ma]:k};
      if(tien)doiTien(tien,tien>0?'Quà của '+nv.ten:lua[0]);
      c.so++;c.ngay=homNay();
      st.la=[...(st.la||[]),loi+(lua[1]?'\n→ '+lua[1]:'')];
      doWeb('web_chuyen_xom',{nv:nv.ma,doan:doan+1,chon:la.b?k:'doc'});
      luu(true);if(typeof veThanhTren==='function')veThanhTren();
      const tiep=viTri(c.so);
      if(lua[1])loa(lua[1],4200);
      setTimeout(()=>loa(tiep?'Mai có thư tiếp của '+tiep.nv.ten+' nha':'Hết chuyện xóm trọ rồi · chờ khách mới nha',3600),lua[1]?4300:0);
    };
    const nut=(lua,k)=>[giaTri(lua[0],c),()=>xong(k,lua),Math.max(0,-(giaTri(lua[2],c)||0))];
    taiHoa({ma:'xom_'+ma,icon:'thu',ten:'Thư của '+nv.ten+' · '+(doan+1)+'/'+nv.la.length,loi,
      a:nut(la.a,'a'),...(la.b?{b:nut(la.b,'b')}:{})});
  }
  function kiem(){
    // Hàng chờ có thể bị dọn (đổi ván, vào lại): không còn trong hàng thì xếp lại.
    if(dangCho&&typeof hang!=='undefined'&&!hang.includes(dangCho))dangCho=null;
    if(dangCho||typeof st==='undefined'||!st||typeof daVaoGame==='undefined'||!daVaoGame||st.dem||st.thang<TU_THANG)return;
    if(document.querySelector('.phu.hien,.web-bang'))return;
    const c=du();if(c.so>=TONG||c.ngay===homNay())return;
    dangCho=()=>{dangCho=null;const c2=du();if(c2.so>=TONG||c2.ngay===homNay()||st.dem){tiepHang();return;}moLaHomNay();};
    xepHang(dangCho);
  }
  window.ChuyenXomWeb={XOM,TONG,kiem,homNay,viTri};
  setInterval(kiem,2000);
})();
