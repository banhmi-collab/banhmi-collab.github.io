// Được nạp trước game.js trên web; hàm đăng ký chạy khi DO đã được tạo.
(() => {
  'use strict';
  if(window.ReactNativeWebView)return;
  // Cùng một mô hình; xoay MỌI điểm trước phép chiếu, không soi SVG.
  const huong=v=>Number.isInteger(v?.huong)&&v.huong>=0&&v.huong<4?v.huong:v?.lat===true?1:0;
  const xoay=(x,y,h)=>[[x,y],[-y,x],[-x,-y],[y,-x]][h];
  function veGheTua(v){
    const h=huong(v),quay=q=>[...xoay(q[0],q[1],h),q[2]],chieu=q=>P(...quay(q));
    const p=a=>a.map(f).join(',');
    const daGiac=ds=>poly(ds.map(quay),DAT);
    // Thanh chân tiết diện vuông, có thể nghiêng. Chỉ vẽ các mặt nhìn thấy.
    const thanh=(a,b,ten)=>{
      const vong=c=>[[-4,-4],[4,-4],[4,4],[-4,4]].map(([x,y])=>[c[0]+x,c[1]+y,c[2]]);
      const d=vong(a),t=vong(b),phap=[[0,-1],[1,0],[0,1],[-1,0]];
      return `<g data-ghe-tua="${ten}">`+phap.map(([x,y],i)=>{
        const [nx,ny]=xoay(x,y,h),j=(i+1)%4;
        return nx+ny>0?daGiac([d[i],d[j],t[j],t[i]]):'';
      }).join('')+daGiac(t)+'</g>';
    };
    const chan=[[-38,-32],[-38,32],[44,-32],[44,32]].map(([x,y],i)=>{
      const truoc=i>1,a=[truoc?54:-38,truoc?Math.sign(y)*39:y,0],b=[x,y,60];
      return {sau:quay(a)[0]+quay(a)[1],s:thanh(a,b,truoc?'chan-truoc':'chan-sau')};
    }).sort((a,b)=>a.sau-b.sau).map(v=>v.s).join('');
    // Hai chân sau nối liền thành thanh tựa; x âm là mép sau của mô hình.
    const m=[[-40,-35,66],[-40,35,66],[-52,35,138],[-52,-35,138]];
    const diem=(u,v)=>chieu(m[0].map((a,i)=>{const d=a+(m[1][i]-a)*u,t=m[3][i]+(m[2][i]-m[3][i])*u;return d+(t-d)*v;}));
    const lo=[[.18,.31],[.44,.57],[.70,.83]].map(([a,b])=>{
      const giua=(a+b)/2;
      return `M${p(diem(a,.24))} L${p(diem(a,.78))} Q${p(diem(giua,.88))} ${p(diem(b,.78))} L${p(diem(b,.24))} Q${p(diem(giua,.15))} ${p(diem(a,.24))} Z`;
    }).join(' ');
    const tua=thanh([-38,-32,60],[-50,-32,138],'thanh-tua')+thanh([-38,32,60],[-50,32,138],'thanh-tua')
      +`<path class="n" data-ghe-tua="lung" fill="${DAT}" fill-rule="evenodd" d="M${m.map(q=>p(chieu(q))).join(' L')} Z ${lo}"/>`;
    // Mặt 96×84, sâu hơn rộng 14,3%; mép trước uốn xuống, mép sau thẳng.
    const q=q=>p(chieu(q));
    const mat=`<g data-ghe-tua="mat-ngoi">`
      +daGiac([[-42,-42,55],[-42,42,55],[-42,42,64],[-42,-42,64]])
      +daGiac([[-42,42,55],[50,42,55],[48,42,64],[-42,42,64]])
      +daGiac([[-42,-42,55],[50,-42,55],[48,-42,64],[-42,-42,64]])
      +`<path class="n" fill="${DAT}" d="M${q([-42,-42,64])} L${q([-42,42,64])} L${q([48,42,64])} Q${q([54,42,64])} ${q([54,42,55])} L${q([54,-42,55])} Q${q([54,-42,64])} ${q([48,-42,64])} Z"/>`
      +`<path class="n" data-ghe-tua="mep-truoc" fill="${DAT}" d="M${q([48,-42,64])} Q${q([54,-42,64])} ${q([54,-42,55])} L${q([54,42,55])} Q${q([54,42,64])} ${q([48,42,64])} L${q([48,-42,64])} Z"/></g>`;
    return `<g data-ghe-huong="${h}">${chan}${h<2?tua+mat:mat+tua}</g>`;
  }
  window.gheTuaWeb={huong,xoay};
  window.themDoWeb=doGame=>{
    doGame.gheTua={ten:'Ghế tựa nhựa',nhom:'ngoi',co:[1,1],gia:120,thue:50,cau:'Có ghế tựa, ngồi lâu khỏi mỏi lưng.',ve:veGheTua};
  };
})();
