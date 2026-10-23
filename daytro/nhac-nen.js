// Nhạc tự soạn: mọi tiếng đều tổng hợp tại máy, không tải mẫu âm thanh.
(() => {
  'use strict';
  if (window.NhacNen) return;
  const BAN = {
    // A/C chỉ được nạp từ trang nghe thử, không nằm trong gói web.
    ...(document.currentScript?.dataset.ngheThu==='1'?window.NHAC_NEN_THU:{}),
    B: {ten:'Sáng cà phê', bpm:78, goc:5, nen:.012, trong:true, hat:529},
  };
  const HOP = [[48,55,59,64],[45,52,55,60],[50,57,60,65],[43,53,57,59]];
  const THANG = [60,62,64,67,69,72,74,76];
  // 48 ô nhịp: 148–165 giây; câu đáp, đảo hợp âm và khoảng nghỉ thay đổi theo đoạn.
  function soan(ma) {
    const ban=BAN[ma]; let hat=ban.hat, bac=2;
    const ngauNhien=()=>((hat=(Math.imul(hat,1664525)+1013904223)>>>0)/4294967296);
    const not=[];
    const them=(phach,kieu,cao,dai,to)=>not.push({phach,kieu,cao:cao+ban.goc,dai,to});
    for(let o=0;o<48;o++) {
      const doan=Math.floor(o/8), hop=HOP[Math.floor(o/2)%4], p=o*4;
      hop.forEach((cao,i)=>them(p+i*.045,'dan',cao+(doan%3===1&&i===0?12:0),3.7,.035));
      if(ma!=='C')them(p,'tram',hop[0]-12,2.8,.045);
      for(let n=0;n<4;n++) {
        if(ngauNhien()<(ma==='C'?.33:.65) && !(o%8===7&&n>1)) {
          bac=Math.max(0,Math.min(7,bac+(ngauNhien()<.5?-1:1)));
          them(p+n+(n%2?.12:0),'dan',THANG[bac]+(doan===4?12:0),ma==='C'?2.1:.95,.048);
        }
      }
      if(ban.trong) {
        them(p,'kick',36,.35,.075); if(o%4!==3)them(p+2,'kick',36,.3,.055);
        if(o%2===0)them(p+1.12,'hat',0,.065,.018);
        if(ma==='B')them(p+3.12,'hat',0,.05,.014);
      }
      if(ma==='B'&&o%8===3) {them(p+1,'chim',90,.19,.014);them(p+1.35,'chim',94,.23,.012);}
    }
    return not.sort((a,b)=>a.phach-b.phach);
  }
  function taoMay() {
    let am, tong, loc, dem, nen, hen=null, ma='B', banNhac=soan(ma), viTri=0, vong=0, moc=0;
    let muon=false, amLuong=.35, loi='', luot=0, dangMo=0;
    const nut=new Set();
    function don() {for(const n of nut){try{n.stop();}catch{} n.disconnect();}nut.clear();}
    function nguon(n,g,t,dai) {
      nut.add(n); n.connect(g).connect(loc); n.onended=()=>{nut.delete(n);n.disconnect();g.disconnect();};
      n.start(t);n.stop(t+dai);
    }
    function phatNot(n,t) {
      const dai=n.dai*60/BAN[ma].bpm,g=am.createGain();
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(n.to,t+.018);
      g.gain.exponentialRampToValueAtTime(.0001,t+dai);
      if(n.kieu==='hat') {const s=am.createBufferSource();s.buffer=dem;nguon(s,g,t,dai);return;}
      const s=am.createOscillator(),hz=440*2**((n.cao-69)/12);
      s.type=n.kieu==='dan'?'triangle':'sine';s.frequency.setValueAtTime(hz,t);
      if(n.kieu==='kick')s.frequency.exponentialRampToValueAtTime(38,t+dai);
      else if(n.kieu==='chim')s.frequency.exponentialRampToValueAtTime(hz*1.5,t+dai*.7);
      else s.detune.setValueAtTime(Math.sin(n.phach*.7)*3,t);
      nguon(s,g,t,dai+.02);
    }
    function lapLich() {
      if(!muon||document.hidden||am.state!=='running')return;
      const phach=60/BAN[ma].bpm;
      // Chỉ lên lịch trước 1,25 giây, không đuổi theo thời gian đã lỡ.
      if(moc+(vong*192+banNhac[viTri].phach)*phach<am.currentTime-.1) {
        moc=am.currentTime+.05;viTri=0;vong=0;
      }
      while(moc+(vong*192+banNhac[viTri].phach)*phach<am.currentTime+1.25) {
        phatNot(banNhac[viTri],moc+(vong*192+banNhac[viTri].phach)*phach);
        if(++viTri===banNhac.length){viTri=0;vong++;}
      }
    }
    function tao() {
      if(am)return;
      const Kieu=window.AudioContext||window.webkitAudioContext;
      if(!Kieu)throw Error('Trình duyệt chưa hỗ trợ nhạc nền.');
      am=new Kieu();tong=am.createGain();tong.gain.value=amLuong;
      loc=am.createBiquadFilter();loc.type='lowpass';loc.frequency.value=2400;
      loc.connect(tong).connect(am.destination);
      dem=am.createBuffer(1,am.sampleRate*4,am.sampleRate);
      const duLieu=dem.getChannelData(0);let hat=125;
      for(let i=0;i<duLieu.length;i++){hat=(Math.imul(hat,1664525)+1013904223)>>>0;duLieu[i]=hat/2147483648-1;}
    }
    function tamDung() {
      luot++; if(hen!==null)clearInterval(hen);hen=null;
      don();if(nen){nen.stop();nen.disconnect();nen=null;}
      if(am&&am.state!=='closed')void am.suspend().catch(()=>{});
    }
    async function tiep() {
      if(!muon||document.hidden)return false;
      const lan=++luot;
      dangMo=lan;
      try {
        tao();await am.resume();
        if(lan!==luot||!muon||document.hidden)return false;
        if(hen!==null)return true;
        moc=am.currentTime+.06;viTri=0;vong=0;
        nen=am.createBufferSource();nen.buffer=dem;nen.loop=true;
        const g=am.createGain(),f=am.createBiquadFilter();
        f.type='lowpass';f.frequency.value=ma==='A'?1100:220;g.gain.value=BAN[ma].nen;
        nen.connect(f).connect(g).connect(tong);
        nen.onended=()=>{f.disconnect();g.disconnect();};nen.start();
        tong.gain.setValueAtTime(0,am.currentTime);tong.gain.linearRampToValueAtTime(amLuong,am.currentTime+.4);
        lapLich();hen=setInterval(lapLich,250);loi='';return true;
      } catch(e){loi=e.message;tamDung();return false;}
      finally{if(dangMo===lan)dangMo=0;}
    }
    const may={
      async phat(chon='B'){if(!BAN[chon])return false;if(ma!==chon){tamDung();ma=chon;banNhac=soan(ma);}muon=true;return tiep();},
      dung(){muon=false;tamDung();},
      amLuong(giaTri){if(!Number.isFinite(giaTri))return;amLuong=Math.max(0,Math.min(1,giaTri));if(tong)tong.gain.setTargetAtTime(amLuong,am.currentTime,.05);},
      trangThai(){return {ma,muon,dangPhat:hen!==null&&am?.state==='running',am:am?.state||'chua-tao',soNut:nut.size,loi};}
    };
    document.addEventListener('visibilitychange',()=>{if(document.hidden)tamDung();else void tiep();});
    window.addEventListener('pagehide',tamDung);
    window.addEventListener('pageshow',()=>{void tiep();});
    // Safari có thể cần thêm một thao tác sau khi hệ điều hành ngắt âm thanh.
    document.addEventListener('click',()=>{if(muon&&!dangMo&&am?.state!=='running')void tiep();});
    return may;
  }
  window.NhacNen={BAN,soan,taoMay};
  if(document.currentScript?.dataset.ngheThu==='1'||window.ReactNativeWebView)return;
  const khung=document.querySelector('#manCD .tam');if(!khung)return;
  const may=taoMay();window.nhacNen=may;
  let bat=true,daCham=false;
  try{bat=localStorage.getItem('day-tro-nhac')!=='tat';}catch{}
  const nut=document.createElement('button');nut.id='nutNhacNen';nut.className='lai';nut.type='button';nut.setAttribute('role','switch');
  const nhan=document.createElement('span');
  if(typeof bieuTuong==='function')nut.innerHTML=bieuTuong('chuong');nut.append(nhan);
  khung.insertBefore(nut,document.getElementById('nutTT2'));
  function ve(){nhan.textContent='Nhạc nền: '+(bat?'Bật':'Tắt');nut.setAttribute('aria-checked',String(bat));}
  function nhacIphone(){
    if(!(/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)))return;
    try{if(localStorage.getItem('day-tro-nhac-nhac-ios'))return;localStorage.setItem('day-tro-nhac-nhac-ios','1');}catch{}
    const goi=document.createElement('p');goi.textContent='Bật tiếng điện thoại để nghe nhạc nhé';goi.setAttribute('role','status');
    goi.style.cssText='position:fixed;bottom:20px;left:16px;right:16px;z-index:9999;padding:12px;background:#fff8e9;color:#6b4631;border:1px solid #d9b27c;border-radius:12px;text-align:center;pointer-events:none';
    document.body.append(goi);setTimeout(()=>goi.remove(),6500);
  }
  nut.addEventListener('click',()=>{bat=!bat;daCham=true;try{localStorage.setItem('day-tro-nhac',bat?'bat':'tat');}catch{}ve();if(bat){void may.phat();nhacIphone();}else may.dung();});
  function cham(e){if(!e.isTrusted||e.target.closest?.('#nutNhacNen')||daCham)return;if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;daCham=true;if(bat){void may.phat();nhacIphone();}}
  // click được tính là kích hoạt cả khi chạm; pointerdown trên màn cảm ứng có thể chưa được phép phát.
  document.addEventListener('click',cham);document.addEventListener('keydown',cham);ve();
})();
