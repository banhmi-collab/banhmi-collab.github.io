// Chỉ web. "Thư của Linh": mỗi ngày ghé game mở thêm một chương, 7 chương; bỏ ngày không mất tiến độ.
// Lưu trong ván (st.webThuLinh) để link mang ván chở theo; không đụng quà ngày hay A/B.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const THUONG=150,THUONG_CUOI=500;
  const CHUONG=[
    {thu:'Chủ trọ ơi, em là Linh, mới lên thành phố học năm nhất. Phòng nhỏ mà ấm ghê. Em dán mấy tấm ảnh nhà lên tường được không ạ?',dap:'Dán đi em, phòng là nhà mà.'},
    {thu:'Hôm nay em học về muộn, cả dãy tắt đèn hết. Cảm ơn chủ trọ để đèn hành lang nha, em đỡ sợ hẳn.',dap:'Về muộn cứ nhắn, để đèn cho.'},
    {thu:'Em nấu thử nồi canh chua theo cách mẹ dạy mà mặn quá 😭 Chủ trọ nếm giúp em một chén không?',dap:'Mặn thì thêm nước, để đó qua liền.'},
    {thu:'Mai em thi giữa kỳ môn đầu tiên. Tim đập thình thịch luôn. Chủ trọ có bí kíp gì không ạ?',dap:'Ngủ sớm, ăn sáng, làm câu dễ trước.'},
    {thu:'Em qua môn rồi!!! 8 điểm luôn. Người đầu tiên em báo là mẹ, người thứ hai là chủ trọ đó.',dap:'Giỏi quá! Tối nay xóm ăn mừng.'},
    {thu:'Cuối tuần mẹ em lên thăm. Mẹ cứ hỏi phòng có chật không, em nói phòng đẹp nhất dãy luôn.',dap:'Nhớ dẫn mẹ qua chào nha.'},
    {thu:'Mẹ em gửi chủ trọ hũ dưa món nhà làm, kèm lời nhắn: "Cảm ơn đã giữ cho con bé một chỗ để về." Em cũng cảm ơn nhiều lắm.',dap:'Cảm ơn hai mẹ con. Phòng này luôn chờ em.'}
  ];
  const ngay=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  // Trả số chương (1–7) được mở hôm nay, hoặc 0 khi chưa tới lượt.
  function chuongMoi(tt,homNay){
    const c=Number.isInteger(tt?.c)&&tt.c>=0&&tt.c<=CHUONG.length?tt.c:0;
    if(c>=CHUONG.length)return 0;
    return c===0||tt?.ngay!==homNay?c+1:0;
  }
  function ghi(so){
    try{
      if(location.hostname==='banhmi-collab.github.io'){
        if(window['ga-disable-G-8TG4SYPDPV'])return;
        window.gtag?.('event','web_thu_linh',{send_to:'G-8TG4SYPDPV',nen_tang:'web',game:'daytro',chuong:so});
      }else window.__thuLinhSk?.push(so);
    }catch{ /* Thống kê lỗi vẫn đọc thư được. */ }
  }
  const duocMo=()=>typeof st!=='undefined'&&st&&typeof daVaoGame!=='undefined'&&daVaoGame
    &&(typeof hdXong==='undefined'||hdXong)&&st.thang>=2
    &&!document.querySelector('.phu.hien,.web-bang,#pwaGoiY,#thuLinh');
  let daHienPhien=false;
  function kiem(){
    if(daHienPhien||!duocMo())return false;
    const homNay=ngay(),so=chuongMoi(st.webThuLinh,homNay);
    if(!so)return false;
    daHienPhien=true;hien(so,homNay);return true;
  }
  function hien(so,homNay){
    const ch=CHUONG[so-1],cuoi=so===CHUONG.length;
    const lop=document.createElement('div');lop.id='thuLinh';lop.className='phu toi hien';
    lop.setAttribute('role','dialog');lop.setAttribute('aria-modal','true');lop.setAttribute('aria-labelledby','thuLinhTieuDe');
    const hop=document.createElement('div');hop.className='tam';lop.append(hop);
    const h=document.createElement('h2');h.id='thuLinhTieuDe';h.textContent='Linh nhắn · '+so+'/'+CHUONG.length;hop.append(h);
    const thu=document.createElement('p');thu.textContent=ch.thu;thu.style.cssText='background:#fff8ee;border-radius:12px;padding:10px 12px;text-align:left;line-height:1.5';hop.append(thu);
    const nut=document.createElement('button');nut.className='nut';nut.type='button';nut.textContent='Trả lời: '+ch.dap;hop.append(nut);
    const sau=document.createElement('p');sau.style.cssText='font-size:13px;opacity:.8';
    sau.textContent=cuoi?'Chương cuối · quà '+dong(THUONG_CUOI)+' + huy hiệu "Chỗ để về"':'Quà '+dong(THUONG)+' · mai Linh nhắn tiếp';hop.append(sau);
    nut.onclick=()=>{
      if(lop.dataset.xong)return;lop.dataset.xong='1';
      // Ghi tiến độ trước khi cộng tiền: nếu có lỗi giữa chừng cũng không nhận lại lần hai.
      st.webThuLinh={c:so,ngay:homNay,...(cuoi?{huyHieu:1}:{})};
      ghi(so);
      lop.remove();
      doiTien(cuoi?THUONG_CUOI:THUONG,'+'+dong(cuoi?THUONG_CUOI:THUONG)+' Linh gửi');
      veHet();
      if(typeof loa==='function')loa(cuoi?'Huy hiệu mới: Chỗ để về':'Mai ghé lại đọc thư Linh nha',3200);
      if(typeof tiepHang==='function')tiepHang();
    };
    document.body.append(lop);nut.focus();
  }
  setInterval(kiem,2000);
  window.ThuLinhWeb={kiem,chuongMoi,ngay,soChuong:CHUONG.length,THUONG,THUONG_CUOI};
})();
