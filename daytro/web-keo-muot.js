(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  const veCu=veBongMa,phongCu=veLai;
  let hen=0,cho=null,khoa='';
  veLai=function(...a){khoa='';return phongCu(...a);};
  veBongMa=function(...a){
    if(a[1]==null){cancelAnimationFrame(hen);hen=0;cho=null;khoa='';return veCu(...a);}
    cho=a;if(hen)return;
    hen=requestAnimationFrame(()=>{hen=0;const b=cho;cho=null;if(!b||!keo)return;
      const ma=[st.o,...b,st.dat.find(v=>v.id===b[3])?.lat===true].join(':');
      if(ma!==khoa){veCu(...b);khoa=ma;}
    });
  };
})();
