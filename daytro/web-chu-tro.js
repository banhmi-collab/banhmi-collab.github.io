// Đợt 2 việc 2 (chỉ web): hết tháng 3, game xếp người chơi vào 1 trong 6 kiểu chủ trọ
// theo cách chơi, làm ảnh dọc để đăng story. Không chữ người chơi gõ; GA4 chỉ nhận mã kiểu.
// Tên và câu mô tả chờ Thảo duyệt (sửa trong KIEU bên dưới).
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const K_DA='day-tro-chu-tro-da-xem',MUC='#483C32';
  const doWeb=(ten,p={})=>{try{window.warmJarThongKe?.(ten,p);}catch{}};
  const KIEU={
    but:{ten:'Chủ trọ hiền như Bụt',cau:'Khách thương, khách nể, ở lì không chịu đi.',bieu:'😇'},
    decor:{ten:'Chủ trọ mê decor',cau:'Phòng nào cũng xinh như quán cà phê.',bieu:'🪴'},
    giau:{ten:'Chủ trọ giàu ngầm',cau:'Ngoài mặt bình thường, trong két dày cộp.',bieu:'💰'},
    mo_rong:{ten:'Chủ trọ mở rộng thần tốc',cau:'Mới 3 tháng mà phòng mở liên tục.',bieu:'🏗️'},
    tiet_kiem:{ten:'Chủ trọ tiết kiệm có tâm',cau:'Chi ít mà khách vẫn vui.',bieu:'🧮'},
    tay_mo:{ten:'Chủ trọ tay mơ đáng yêu',cau:'Vừa làm vừa học, lâu lâu xin bà phụ tiền.',bieu:'🐣'},
  };
  // Thứ tự xét: nét nổi bật nhất trước. Ngưỡng theo tiền trong game (đơn vị nghìn đồng).
  function xepKieu(s){
    const mo=(s.phong||[]).filter(p=>p.mo&&!p.loai&&!p.mb);
    const doTB=mo.length?mo.reduce((a,p)=>a+(p.dat?.length||0),0)/mo.length:0;
    const tien=Number(s.tien)||0,uy=Number(s.uyTin)||0;
    if(doTB>=9)return 'decor';
    if(mo.length>=3)return 'mo_rong';
    if(tien>=8000)return 'giau';
    if(uy>=3)return 'but';
    if(s.vayBa||tien<1500)return 'tay_mo';
    return 'tiet_kiem';
  }
  const daXem=()=>{try{return !!localStorage.getItem(K_DA);}catch{return true;}};
  const link=()=>{const u=new URL('https://banhmi-collab.github.io/daytro/');u.searchParams.set('utm_source','the_chu_tro');return u.href;};

  async function taoAnh(ma){
    const k=KIEU[ma],c=document.createElement('canvas');c.width=1080;c.height=1920;const g=c.getContext('2d');
    await document.fonts?.ready;
    g.fillStyle='#FFF5DC';g.fillRect(0,0,1080,1920);g.fillStyle=MUC;g.textAlign='center';
    g.font="600 40px 'Be Vietnam Pro', sans-serif";g.fillText('Sau 3 tháng làm chủ dãy trọ, mình là…',540,110,1000);
    g.font="800 78px 'Be Vietnam Pro', sans-serif";g.fillText(k.ten,540,215,1000);
    g.font="34px 'Pangolin', cursive";g.fillText(k.cau,540,280,1000);
    let phong=null;try{phong=await window.KhoeWeb?.taoAnh?.();}catch{}
    if(phong){const w=960,h=w*phong.height/phong.width;g.drawImage(phong,60,320,w,Math.min(h,1440));}
    g.fillStyle=MUC;g.font="800 46px 'Be Vietnam Pro', sans-serif";g.fillText('Bạn là kiểu nào? Thử xem 👉',540,1835,1000);
    return c;
  }

  async function moThe(ma){
    const k=KIEU[ma];if(!k)return;
    try{localStorage.setItem(K_DA,ma);}catch{}
    doWeb('web_chu_tro_hien',{kieu:ma});
    document.getElementById('chuTroThe')?.remove();
    const nen=document.createElement('section');nen.id='chuTroThe';nen.setAttribute('role','dialog');nen.setAttribute('aria-label','Bạn là chủ trọ kiểu gì');
    nen.style.cssText='position:fixed;inset:0;z-index:1001;background:#0007;display:flex;align-items:center;justify-content:center;padding:16px';
    const hop=document.createElement('div');hop.style.cssText=`background:#FFF5DC;color:${MUC};border:2px solid;border-radius:16px;padding:18px;max-width:420px;width:100%;text-align:center;max-height:92vh;overflow:auto`;
    const t1=document.createElement('p');t1.textContent='Sau 3 tháng, bạn là…';
    const t2=document.createElement('p');t2.style.cssText='font-size:26px;font-weight:800;margin:6px 0';t2.textContent=k.bieu+' '+k.ten;
    const t3=document.createElement('p');t3.textContent=k.cau;
    const bao=document.createElement('p');bao.className='web-ghichu';bao.setAttribute('role','status');
    const chia=document.createElement('button');chia.className='nut';chia.textContent='Đăng story khoe bạn bè';chia.style.cssText='min-height:48px;width:100%;margin-top:12px';
    const dong=document.createElement('button');dong.className='lai';dong.textContent='Để sau';dong.style.cssText='min-height:44px;width:100%;margin-top:8px';
    dong.onclick=()=>nen.remove();
    chia.onclick=async()=>{
      chia.disabled=true;bao.textContent='Đang làm ảnh…';
      try{
        const c=await taoAnh(ma),blob=await new Promise(x=>c.toBlob(x,'image/png'));if(!blob)throw Error('anh');
        const tep=new File([blob],'chu-tro-kieu-gi.png',{type:'image/png'});
        const du={title:'Dãy Trọ Của Tôi',text:`Mình là "${k.ten}" ${k.bieu} Bạn là chủ trọ kiểu nào? Thử xem 👉`,url:link()};
        if(navigator.share&&navigator.canShare?.({files:[tep]})){await navigator.share({...du,files:[tep]});bao.textContent='';}
        else{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=tep.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);bao.textContent='Đã lưu ảnh · mở Facebook/TikTok đăng story nhé';}
        doWeb('web_chu_tro_chia_se',{kieu:ma});
      }catch(e){if(e?.name!=='AbortError')bao.textContent='Chưa làm được ảnh · thử lại nhé';}
      chia.disabled=false;
    };
    hop.append(t1,t2,t3,chia,dong,bao);nen.append(hop);document.body.append(nen);
  }

  // Đợi các bảng đầu tháng đóng hết rồi mới mở, tránh chồng bảng; hết lượt chờ thì để tháng sau.
  function choMo(con){
    setTimeout(()=>{
      if(daXem()||document.getElementById('chuTroThe'))return;
      if(document.querySelector('.phu.hien,.web-bang,#hetLuotNgay')){if(con>0)choMo(con-1);return;}
      moThe(xepKieu(st));
    },2500);
  }
  const sangCu=sangThang;
  sangThang=function(...a){
    const r=sangCu(...a);
    // Đợi bảng đầu tháng hiện xong rồi mới mở thẻ, tránh chồng bảng.
    if(st?.thang>=3&&!daXem())choMo(40);
    return r;
  };
  window.ChuTroWeb={xepKieu,moThe,taoAnh,KIEU};
})();
