// Chỉ ghép vào web. Ảnh app và cầu nối chia sẻ của app giữ nguyên.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const DIA_CHI='https://banhmi-collab.github.io/daytro/?utm_source=khoe_phong';
  const doWeb=(ten,thamSo={})=>{try{window.warmJarThongKe?.(ten,thamSo);}catch{}};
  async function taoAnh(){
    const p=st.phong[st.o],k=st.khach,sv=document.getElementById('phong').cloneNode(true);
    sv.insertAdjacentHTML('afterbegin','<style>'+[...document.querySelectorAll('style')].map(x=>x.textContent).join('\n')+'</style>');
    const vb=document.getElementById('phong').viewBox.baseVal,ti=vb.height/vb.width;
    sv.setAttribute('width',1000);sv.setAttribute('height',Math.round(1000*ti));
    const hinh=new Image();hinh.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(sv));await hinh.decode();await document.fonts.ready;
    const c=document.createElement('canvas');c.width=1080;c.height=1610;const g=c.getContext('2d');
    const [nen]=MAU_TUONG[(p.son??st.o)%MAU_TUONG.length];
    g.fillStyle='#E4EEE6';g.fillRect(0,0,1080,1610);g.fillStyle=nen;g.fillRect(40,40,1000,1270);
    g.strokeStyle=MUC;g.lineWidth=8;g.strokeRect(40,40,1000,1270);g.fillStyle=MUC;g.textAlign='center';
    g.font="800 64px 'Be Vietnam Pro', sans-serif";
    g.fillText(p.loai==='nha'?'Căn hộ của mình':laQuan(p)?`${tenQuan(p)} của mình`:k?.o?`Phòng của ${k.ten}`:`Phòng ${st.o+1} nhà mình`,540,150,960);
    g.font="34px 'Pangolin', cursive";g.fillText(`Tháng ${thangSo(st.thang)} · Dãy trọ ${veSao(saoDay())}`,540,210);
    g.font="600 26px 'Be Vietnam Pro', sans-serif";g.fillText(danhHieu(),540,240);
    const h=Math.min(900,1000*ti);g.drawImage(hinh,(1080-h/ti)/2,250,h/ti,h);
    g.font="800 46px 'Be Vietnam Pro', sans-serif";g.fillText('Dãy Trọ Của Tôi',540,1200);
    g.font="30px 'Pangolin', cursive";g.fillText('Bạn bày phòng đẹp hơn không? · Warm Jar Games',540,1250);
    // Dải riêng bên dưới ảnh gốc, không phủ lên phòng; chừa vùng trắng quanh QR.
    const q=document.createElement('div');new QRCode(q,{text:DIA_CHI,width:200,height:200,correctLevel:QRCode.CorrectLevel.M});
    const qr=q.querySelector('canvas');if(!qr)throw Error('Chưa tạo được QR');
    g.fillStyle='#fff';g.fillRect(50,1350,240,240);g.imageSmoothingEnabled=false;g.drawImage(qr,70,1370,200,200);
    g.fillStyle=MUC;g.textAlign='left';g.font="800 38px 'Be Vietnam Pro', sans-serif";g.fillText('Chơi miễn phí:',330,1425);
    g.font="600 31px 'Be Vietnam Pro', sans-serif";g.fillText('banhmi-collab.github.io/daytro',330,1480,700);
    g.font="28px 'Be Vietnam Pro', sans-serif";g.fillText('Quét mã để ghé dãy trọ của bà',330,1530,700);
    return c;
  }
  khoePhong=async function(){
    try{
      const c=await taoAnh();ghi('khoe_phong');
      const blob=await new Promise(xong=>c.toBlob(xong,'image/png'));if(!blob)throw Error('Chưa tạo được ảnh');
      const tep=new File([blob],'day-tro-cua-toi.png',{type:'image/png'});
      const chiaSe={files:[tep],title:'Dãy Trọ Của Tôi',text:'Bạn bày phòng đẹp hơn không? Chơi miễn phí Dãy Trọ Của Tôi nhé!',url:DIA_CHI};
      if(navigator.canShare?.(chiaSe)){
        try{await navigator.share(chiaSe);doWeb('web_khoe_chia_se',{cach:'share'});return;}
        catch(e){if(e.name==='AbortError')return;}
      }
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=tep.name;a.click();
      setTimeout(()=>URL.revokeObjectURL(url),60000);doWeb('web_khoe_chia_se',{cach:'tai_ve'});loa('Đã lưu ảnh phòng');
    }catch{loa('Chưa chụp được, thử lại nhé');}
  };
  window.KhoeWeb={taoAnh,diaChi:DIA_CHI};
})();
