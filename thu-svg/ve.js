// Vẽ đồ phòng trọ bằng code — game 3.
//
// Mọi món dùng chung một phép chiếu, một bộ 5 màu, một độ dày nét, nên món thứ
// 50 vẫn cùng kiểu với món thứ 1. Đây là lý do thử vẽ bằng code thay vì Gemini.
//
// Chiếu isometric: x chạy xuống phải, y chạy xuống trái, z lên trên.
// Mặt "trước" của đồ là mặt x lớn nhất (quay sang phải), mặt hông là y lớn nhất.

const C = Math.cos(Math.PI / 6), S = 0.5, R2 = Math.SQRT2;

// Chỉ 5 màu này. Thêm màu thứ sáu là cả bộ lệch nhau.
const OAK = '#D9B27C', KEM = '#F2E8D5', XAM = '#ABA49B', DAT = '#C97B5A', XANH = '#9CAF8C';
const NEN = '#FFFFFF';

const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];
const f = v => v.toFixed(1);
const pts = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
const poly = (ws, fill) => `<polygon class="n" points="${pts(ws.map(w => P(...w)))}" fill="${fill}"/>`;
const elip = (x, y, rx, ry, fill, cls = 'n') => `<ellipse class="${cls}" cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"/>`;

// ── Khối cơ bản ────────────────────────────────────────────────────────────

function hop(x, y, z, w, d, h, fill) {
  return poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], fill)
       + poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], fill)
       + poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], fill);
}

// Trụ đứng, cho phép đáy và đỉnh khác bán kính (chậu, chân quạt).
function tru(z0, z1, r0, r1, fill) {
  const [bx, by] = P(0, 0, z0), [tx, ty] = P(0, 0, z1);
  const a0 = r0 * R2 * C, b0 = r0 * R2 * S, a1 = r1 * R2 * C, b1 = r1 * R2 * S;
  return `<path class="n" fill="${fill}" d="M${f(bx - a0)},${f(by)} A${f(a0)} ${f(b0)} 0 0 0 ${f(bx + a0)},${f(by)} L${f(tx + a1)},${f(ty)} L${f(tx - a1)},${f(ty)} Z"/>`
       + elip(tx, ty, a1, b1, fill);
}

function vom(z, r, cao, fill) {
  const [x, y] = P(0, 0, z), a = r * R2 * C, b = r * R2 * S;
  return `<path class="n" fill="${fill}" d="M${f(x - a)},${f(y)} A${f(a)} ${f(cao)} 0 0 1 ${f(x + a)},${f(y)} A${f(a)} ${f(b)} 0 0 1 ${f(x - a)},${f(y)} Z"/>`;
}

// Chiếc lá nhọn hai đầu, gốc nằm ở (x, y), mọc theo góc `deg`.
function la(x, y, deg, dai, rong) {
  return `<path class="la" fill="${XANH}" transform="translate(${f(x)},${f(y)}) rotate(${f(deg)})" `
       + `d="M0,0 C${f(dai * .3)},${f(-rong)} ${f(dai * .7)},${f(-rong)} ${f(dai)},0 C${f(dai * .7)},${f(rong)} ${f(dai * .3)},${f(rong)} 0,0 Z"/>`;
}

// Cành có viền: vẽ nét nâu dày trước, nét gỗ mỏng đè lên.
function canh(d, day) {
  return `<path d="${d}" fill="none" stroke="#6B4631" stroke-width="${day + 6.4}" stroke-linecap="round"/>`
       + `<path d="${d}" fill="none" stroke="${OAK}" stroke-width="${day}" stroke-linecap="round"/>`;
}

// ── Từng món ───────────────────────────────────────────────────────────────

function noiCom() {
  const [, yGiua] = P(0, 0, 70), a = 64 * R2 * C;
  const [, yVom] = P(0, 0, 88);
  return tru(0, 8, 58, 58, XAM)
    + tru(8, 80, 64, 64, KEM)
    + `<rect class="n" x="${f(-a - 12)}" y="${f(yGiua - 8)}" width="18" height="12" rx="5" fill="${XAM}"/>`
    + `<rect class="n" x="${f(a - 6)}" y="${f(yGiua - 8)}" width="18" height="12" rx="5" fill="${XAM}"/>`
    + tru(80, 88, 67, 67, XAM)
    + vom(88, 62, 30, KEM)
    + elip(0, yVom - 30, 13, 7, XAM)
    + `<rect class="n" x="-24" y="-12" width="48" height="30" rx="7" fill="${XAM}"/>`
    + elip(-9, 3, 5, 5, DAT)
    + `<rect class="n" x="2" y="-2" width="14" height="10" rx="3" fill="${KEM}"/>`;
}

function gheNhua() {
  const B = 52, T = 40, H = 66;
  const phai = [[B, -B, 0], [B, B, 0], [T, T, H], [T, -T, H]];
  const hong = [[-B, B, 0], [B, B, 0], [T, T, H], [-T, T, H]];
  // Điểm trên một mặt hình thang, u chạy ngang, v chạy lên.
  const tren = (m, u, v) => {
    const lo = m[0].map((c, i) => c + (m[1][i] - c) * u);
    const hi = m[3].map((c, i) => c + (m[2][i] - c) * u);
    return lo.map((c, i) => c + (hi[i] - c) * v);
  };
  const lo = m => {
    const d = [];
    for (let v = 0; v <= 0.42; v += 0.06) d.push(tren(m, 0.24, v));
    for (let k = 0; k <= 16; k++) d.push(tren(m, 0.24 + 0.52 * k / 16, 0.42 + 0.2 * Math.sin(Math.PI * k / 16)));
    for (let v = 0.42; v >= 0; v -= 0.06) d.push(tren(m, 0.76, v));
    return poly(d, NEN);
  };
  const [lx, ly] = P(0, 0, H + 10);
  return poly(hong, DAT) + lo(hong) + poly(phai, DAT) + lo(phai)
    + hop(-47, -47, H, 94, 94, 10, DAT)
    + elip(lx, ly, 26, 10, NEN);
}

function quatCay() {
  const [, yDau] = P(0, 0, 188), R = 52;
  const canhQuat = 'M0,-12 C20,-18 27,-38 8,-46 C-7,-49 -15,-27 0,-12 Z';
  const g = 'vector-effect="non-scaling-stroke"';
  return tru(0, 10, 50, 46, XAM)
    + elip(-22, 12, 7, 4, KEM) + elip(-6, 17, 7, 4, KEM)
    + tru(10, 150, 7, 7, XAM)
    + `<rect class="n" x="-11" y="${f(yDau)}" width="22" height="${f(-150 - yDau + 10)}" rx="6" fill="${XAM}"/>`
    + `<g transform="translate(0,${f(yDau)}) scale(${f(R2 * C)},1)">`
    + `<circle class="n" ${g} r="${R}" fill="${KEM}"/>`
    + [0, 120, 240].map(d => `<path class="n" ${g} d="${canhQuat}" fill="${XANH}" transform="rotate(${d})"/>`).join('')
    + `<circle class="m" ${g} r="${R - 12}"/>`
    + `<circle class="n" ${g} r="13" fill="${XAM}"/>`
    + `</g>`;
}

// Lá khế là lá kép: một sống lá, hai bên mọc lá chét đối nhau, lá ở ngọn to dần.
function laKhe(x, y, huong, dai) {
  const r = huong * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r);
  let s = `<path class="m" d="M${f(x)},${f(y)} L${f(x + dx * dai)},${f(y + dy * dai)}"/>`;
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, px = x + dx * dai * t, py = y + dy * dai * t, co = 8 + k * 1.6;
    s += la(px, py, huong - 58, co * 1.9, co * 0.75) + la(px, py, huong + 58, co * 1.9, co * 0.75);
  }
  return s + la(x + dx * dai, y + dy * dai, huong, 22, 8);
}

// Trái khế nhìn nghiêng: đầu cuống bằng, đuôi nhọn, thấy được 3 múi.
function traKhe(x, y) {
  const d = (a, b) => `${f(x + a)},${f(y + b)}`;
  // Dáng thon dài, hai mép hơi lượn sóng (là cạnh của múi), chỉ một sống ở giữa.
  // Nhiều đường sống quá là thành trái ca cao.
  return `<path class="m" d="M${d(0, -8)} L${d(0, 1)}"/>`
    + `<path class="n" fill="${OAK}" d="M${d(-5, 1)} C${d(-9, 6)} ${d(-6, 11)} ${d(-8, 17)} C${d(-9, 24)} ${d(-4, 30)} ${d(0, 36)} C${d(4, 30)} ${d(9, 24)} ${d(8, 17)} C${d(6, 11)} ${d(9, 6)} ${d(5, 1)} Q${d(0, -1)} ${d(-5, 1)} Z"/>`
    + `<path class="m" d="M${d(0, 2)} L${d(0, 33)}"/>`;
}

// Lát khế cắt ngang, dựng quay mặt ra người xem. Hình ngôi sao là thứ duy
// nhất khiến trái khế nhận ra được; nhìn nghiêng thì trái nào cũng như nhau.
function latKhe(x, y, R, xoay) {
  // Ngôi sao bo tròn: đi từ khe này sang khe kia, lấy đầu cánh làm điểm uốn.
  // Góc nhọn thì thành sao biển, bo đều thì thành ngũ giác; phải ở giữa.
  const sao = (ngoai, trong) => {
    const diem = (r, doDo) => { const g = (doDo - 90) * Math.PI / 180; return `${f(Math.cos(g) * r)},${f(Math.sin(g) * r)}`; };
    let d = `M${diem(trong, 36)}`;
    for (let i = 1; i <= 5; i++) d += ` Q${diem(ngoai * 1.2, i * 72)} ${diem(trong, i * 72 + 36)}`;
    return d + ' Z';
  };
  const tia = [0, 1, 2, 3, 4].map(i => {
    const g = (i * 72 - 90) * Math.PI / 180;
    return `<path class="m" d="M0,0 L${f(Math.cos(g) * R * .42)},${f(Math.sin(g) * R * .42)}"/>`;
  }).join('');
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${xoay})">`
    + `<path class="n" d="${sao(R, R * .5)}" fill="${OAK}"/>`
    + `<path class="m" d="${sao(R * .68, R * .36)}" fill="${KEM}"/>`
    + tia
    + `</g>`;
}

function cayKhe() {
  const [, yDat] = P(0, 0, 60);
  // Ba nhánh chính: trái, phải, ngọn. Tọa độ là đầu nhánh.
  const A = [-40, -150], B = [32, -158], N = [-4, -178];
  const than = canh(`M0,${f(yDat)} C3,${f(yDat - 25)} -4,-95 0,-118`, 9)
    + canh(`M0,-108 Q-18,-116 ${A[0]},${A[1]}`, 5)
    + canh(`M0,-116 Q18,-126 ${B[0]},${B[1]}`, 5)
    + canh(`M0,-116 Q-2,-150 ${N[0]},${N[1]}`, 5);
  // Lá kép [gốc x, gốc y, hướng (độ, 0 = sang phải, 90 = xuống), dài].
  // Xếp từ sau ra trước: lá ngọn và lá chĩa lên vẽ trước, lá rủ xuống vẽ sau cùng.
  const la = [
    // Lấp giữa tán, không thì tán thủng một lỗ, trông như vòng hoa.
    [-6, -140, -100, 40], [6, -142, -75, 40], [0, -128, -115, 34], [4, -130, -60, 34],
    [...N, -95, 44], [...N, -140, 42], [...N, -45, 42],
    [...A, -155, 50], [...B, -25, 50],
    [...A, -120, 42], [...B, -65, 42],
    [...A, 175, 52], [...B, 8, 52],
    [-20, -128, 150, 42], [16, -138, 32, 42],
    [...A, 145, 44], [...B, 40, 44],
  ];
  return tru(0, 52, 30, 38, DAT)
    + tru(52, 60, 43, 43, DAT)
    + elip(0, yDat, 38 * R2 * C, 38 * R2 * S, XAM)
    + than
    + la.map(([x, y, h, d]) => laKhe(x, y, h, d)).join('')
    + traKhe(-50, -130) + traKhe(-34, -124) + traKhe(40, -136) + traKhe(56, -126)
    + latKhe(64, -12, 30, 10);
}

// Đồ phơi treo trong mặt phẳng y = 0. Ma trận này đưa hình vẽ phẳng (x sang
// phải, y xuống) vào đúng mặt phẳng đó của phép chiếu.
const MAT_PHANG = `matrix(${f(C)},${f(S)},0,1,0,0)`;

function dayPhoi() {
  const X = 95, H = 170, yDay = -(H - 8), vong = 8, CO = 1.3;
  const yTai = x => yDay + vong * (1 - (x / X) ** 2);
  const coc = x => hop(x - 20, -3.5, 0, 40, 7, 7, OAK) + hop(x - 3.5, -20, 0, 7, 40, 7, OAK)
                 + hop(x - 4, -4, 7, 8, 8, H - 7, OAK);
  // Mỗi món đồ vẽ quanh gốc (0, 0) = điểm treo trên dây, rồi phóng to CO lần.
  const treo = (x, ruot) => `<g transform="translate(${f(x)},${f(yTai(x))}) scale(${CO})">${ruot}</g>`;
  const kep = x => `<rect class="k" x="${f(x - 3)}" y="-6" width="6" height="11" rx="1.5" fill="${OAK}"/>`;
  const ao = `<path class="k" fill="${KEM}" d="M-10,0 L-23,5 L-29,18 L-19,23 L-16,15 L-16,46 L16,46 L16,15 L19,23 L29,18 L23,5 L10,0 Q0,7 -10,0 Z"/>`
           + kep(-17) + kep(17);
  const quan = `<path class="k" fill="${XANH}" d="M-17,0 L17,0 L19,35 L3,35 L0,14 L-3,35 L-19,35 Z"/>`
             + `<path class="k" fill="none" d="M-17.4,6 L17.4,6"/>`
             + kep(-12) + kep(12);
  const khan = `<rect class="k" x="-13" y="0" width="26" height="48" rx="2" fill="${DAT}"/>`
             + `<path class="k" fill="none" d="M-13,38 L13,38"/>`
             + kep(0);
  return coc(-X)
    + `<g transform="${MAT_PHANG}">`
    + `<path class="k" fill="none" d="M${-X},${yDay} Q0,${yDay + vong * 2} ${X},${yDay}"/>`
    + treo(-52, ao) + treo(8, quan) + treo(60, khan)
    + `</g>`
    + coc(X);
}

// ── Đồ vải: khối mềm ───────────────────────────────────────────────────────

// Khối có cạnh cong, dùng cho chăn, gối, nệm. Mỗi cạnh mặt trên là một đường
// cong đẩy ra ngoài `phong` px (số âm thì lõm vào, góc nhọn ra như góc gối).
//
// ⚠️ Mặt hông phải đi đúng theo đường cong của mép trên và mép dưới. Tô bằng
// đa giác thẳng là phần màu tràn ra ngoài viền (đã vấp 24/09).
function khoiMem(x, y, z, w, d, h, fill, phong) {
  const goc = zz => [P(x, y, zz), P(x + w, y, zz), P(x + w, y + d, zz), P(x, y + d, zz)];
  const t = goc(z + h), b = goc(z);
  const diem = p => `${f(p[0])},${f(p[1])}`;
  // Điểm uốn của cạnh i → i+1.
  const uon = (c, i) => {
    const tx = c.reduce((s, p) => s + p[0], 0) / 4, ty = c.reduce((s, p) => s + p[1], 0) / 4;
    const a = c[i], e = c[(i + 1) % 4], mx = (a[0] + e[0]) / 2, my = (a[1] + e[1]) / 2;
    const dx = mx - tx, dy = my - ty, l = Math.hypot(dx, dy);
    return [mx + dx / l * phong, my + dy / l * phong];
  };
  const vien = c => `M${diem(c[0])}` + [0, 1, 2, 3].map(i => ` Q${diem(uon(c, i))} ${diem(c[(i + 1) % 4])}`).join('') + ' Z';
  // Hông = mép trên phía trước (góc 1 → 2 → 3), xuống, mép dưới phía trước đi ngược lại.
  const hong = `M${diem(t[1])} Q${diem(uon(t, 1))} ${diem(t[2])} Q${diem(uon(t, 2))} ${diem(t[3])}`
             + ` L${diem(b[3])} Q${diem(uon(b, 2))} ${diem(b[2])} Q${diem(uon(b, 1))} ${diem(b[1])} Z`;
  return `<path class="n" d="${hong}" fill="${fill}"/>`
    + `<path class="n" d="M${diem(t[2])} L${diem(b[2])}"/>`
    + `<path class="n" d="${vien(t)}" fill="${fill}"/>`;
}

function chanGoi() {
  // Nếp gấp chạy ngang cả hai mặt hông: chăn gấp mấy lần thì mấy đường.
  // Không có nếp là thành cục bánh kem.
  const nep = (x, y, z, w, d, h, muc) => muc.map(v => {
    const zz = z + h * v, a = P(x + w, y, zz), b = P(x + w, y + d, zz), c = P(x, y + d, zz);
    return `<path class="m" d="M${f(a[0])},${f(a[1] + 1)} Q${f((a[0] + b[0]) / 2)},${f((a[1] + b[1]) / 2 + 2)} ${f(b[0])},${f(b[1])}`
         + ` Q${f((b[0] + c[0]) / 2)},${f((b[1] + c[1]) / 2 + 2)} ${f(c[0])},${f(c[1] + 1)}"/>`;
  }).join('');
  // Hai tấm chăn cùng cỡ, chồng lệch nhau một chút như gấp tay.
  // Gối để cạnh lõm vào, bốn góc nhọn ra. Cạnh phồng ra là thành cục xà phòng.
  return khoiMem(-52, -40, 0, 104, 80, 22, DAT, 4) + nep(-52, -40, 0, 104, 80, 22, [0.36, 0.68])
    + khoiMem(-48, -42, 22, 100, 78, 20, XANH, 4) + nep(-48, -42, 22, 100, 78, 20, [0.5])
    + khoiMem(-36, -28, 42, 72, 50, 13, KEM, -7);
}

function man() {
  const W = 124, D = 84, H = 74, x = -W / 2, y = -D / 2, vong = 6;
  // Chiếu trải dưới, rộng hơn màn một chút.
  const chieu = hop(x - 10, y - 10, 0, W + 20, D + 20, 3, OAK)
    + [0.25, 0.5, 0.75].map(u => {
        const a = P(x - 10 + (W + 20) * u, y - 10, 3), b = P(x - 10 + (W + 20) * u, y + D + 10, 3);
        return `<path class="m" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`;
      }).join('');
  // Một mặt vải: mép trên võng xuống giữa, có vài nếp rủ dọc.
  const mat = (g0, g1, soNep) => {
    const [a, b, c, d] = [P(...g0, 3), P(...g1, 3), P(...g1, H), P(...g0, H)];
    const mx = (c[0] + d[0]) / 2, my = (c[1] + d[1]) / 2 + vong * 2;
    let s = `<path class="n" fill="${KEM}" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])} L${f(c[0])},${f(c[1])} Q${f(mx)},${f(my)} ${f(d[0])},${f(d[1])} Z"/>`;
    for (let k = 1; k <= soNep; k++) {
      const u = k / (soNep + 1);
      const tx = d[0] + (c[0] - d[0]) * u, ty = d[1] + (c[1] - d[1]) * u + vong * 4 * u * (1 - u) * 2;
      const bx = a[0] + (b[0] - a[0]) * u, by = a[1] + (b[1] - a[1]) * u;
      s += `<path class="m" d="M${f(tx)},${f(ty + 4)} Q${f((tx + bx) / 2 + 3)},${f((ty + by) / 2)} ${f(bx)},${f(by - 2)}"/>`;
    }
    return s;
  };
  const noc = g => {
    const [px, py] = P(...g, H);
    return `<path class="m" d="M${f(px)},${f(py)} L${f(px)},${f(py - 30)}"/>`
         + `<circle class="m" cx="${f(px)}" cy="${f(py - 33)}" r="3"/>`;
  };
  // Nóc màn: bốn góc bị dây kéo lên, giữa mỗi cạnh võng xuống. Điểm uốn đặt
  // thẳng bên dưới trung điểm cạnh, đúng bằng độ võng của mép trên các mặt vải,
  // để hai đường trùng khít nhau.
  const tren = [P(x, y, H), P(x + W, y, H), P(x + W, y + D, H), P(x, y + D, H)];
  const dinh = `<path class="n" fill="${KEM}" d="M${f(tren[0][0])},${f(tren[0][1])}${tren.map((p, i) => {
      const e = tren[(i + 1) % 4];
      return ` Q${f((p[0] + e[0]) / 2)},${f((p[1] + e[1]) / 2 + vong * 2)} ${f(e[0])},${f(e[1])}`;
    }).join('')} Z"/>`;
  // Đã thử thêm nếp chéo trên nóc cho ra vẻ trũng: trông thành phong bì thư. Bỏ.
  return chieu + noc([x, y]) + noc([x + W, y]) + dinh
    + mat([x, y + D], [x + W, y + D], 3) + mat([x + W, y], [x + W, y + D], 2)
    + noc([x, y + D]) + noc([x + W, y + D]);
}

// Lá lưỡi hổ: lá kiếm mọc thẳng, viền vàng, giữa xanh có vằn ngang.
let _laHo = 0;
function laHo(bx, by, rong, cao, nghieng) {
  const id = 'lh' + (_laHo++);
  const hinh = (w, h) => `M${f(bx - w / 2)},${f(by)} Q${f(bx - w * .75 + nghieng * .3)},${f(by - h * .55)} ${f(bx + nghieng)},${f(by - h)} Q${f(bx + w * .75 + nghieng * .3)},${f(by - h * .55)} ${f(bx + w / 2)},${f(by)} Z`;
  const trong = hinh(rong * .62, cao * .93);
  let van = '';
  for (let k = 1; k <= 4; k++) {
    const yy = by - cao * k / 5.2, xx = bx + nghieng * k / 5.2;
    van += `<path class="m" d="M${f(xx - rong)},${f(yy + 3)} Q${f(xx - rong * .3)},${f(yy - 4)} ${f(xx)},${f(yy + 1)} T${f(xx + rong)},${f(yy - 2)}"/>`;
  }
  return `<path class="n" d="${hinh(rong, cao)}" fill="${OAK}"/>`
    + `<clipPath id="${id}"><path d="${trong}"/></clipPath>`
    + `<path d="${trong}" fill="${XANH}"/>`
    + `<g clip-path="url(#${id})">${van}</g>`;
}

function luoiHo() {
  const [, yDat] = P(0, 0, 58);
  const dat = poly([[-30, -30, 58], [30, -30, 58], [30, 30, 58], [-30, 30, 58]], XAM);
  // [gốc x, rộng, cao, nghiêng]. Lá sau cao hơn, vẽ trước.
  const la = [[-8, 26, 150, -10], [12, 24, 136, 14], [-24, 24, 110, -26], [26, 22, 104, 24], [2, 28, 124, 2], [-12, 22, 84, -18], [16, 22, 80, 16]];
  return hop(-34, -34, 0, 68, 68, 58, DAT) + dat
    + la.map(([x, r, c, n]) => laHo(x, yDat + 6, r, c, n)).join('');
}

// ── Đợt 4 ──────────────────────────────────────────────────────────────────

// Điểm (u, v) trên một mặt 4 góc [dưới-trái, dưới-phải, trên-phải, trên-trái].
const trenMat = (m, u, v) => {
  const lo = m[0].map((c, i) => c + (m[1][i] - c) * u);
  const hi = m[3].map((c, i) => c + (m[2][i] - c) * u);
  return P(...lo.map((c, i) => c + (hi[i] - c) * v));
};

function tuVai() {
  const W = 48, D = 96, H = 168, x = -W / 2, y = -D / 2, z = 8;
  // Mặt trước là mặt quay sang phải (x lớn nhất), rộng bằng D.
  const truoc = [[x + W, y, z], [x + W, y + D, z], [x + W, y + D, z + H], [x + W, y, z + H]];
  const duong = diem => 'M' + diem.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
  // Khóa kéo hình vòm: lên theo mép trái, vòng qua đầu, xuống mép phải.
  const vom = [];
  for (let v = 0.04; v <= 0.74; v += 0.05) vom.push(trenMat(truoc, 0.14, v));
  for (let k = 0; k <= 20; k++) {
    const g = Math.PI * k / 20;
    vom.push(trenMat(truoc, 0.5 - 0.36 * Math.cos(g), 0.74 + 0.14 * Math.sin(g)));
  }
  for (let v = 0.74; v >= 0.04; v -= 0.05) vom.push(trenMat(truoc, 0.86, v));
  const [kx, ky] = trenMat(truoc, 0.86, 0.3);
  const chan = (cx, cy) => hop(cx - 3, cy - 3, 0, 6, 6, z, XAM);
  const may = trenMat(truoc, 0, 0.94), may2 = trenMat(truoc, 1, 0.94);
  // Hoa in trên vải: tủ vải phòng trọ gần như luôn có hoa văn. Không có là
  // trông thành tủ sắt sơn xanh.
  const hong = [[x, y + D, z], [x + W, y + D, z], [x + W, y + D, z + H], [x, y + D, z + H]];
  const hoa = ([hx, hy], co) => [0, 72, 144, 216, 288].map(g => {
      const r = g * Math.PI / 180;
      return elip(hx + Math.cos(r) * co, hy + Math.sin(r) * co, co * .75, co * .75, KEM, 'tron');
    }).join('') + elip(hx, hy, co * .6, co * .6, OAK, 'tron');
  const rai = (m, cho) => cho.map(([u, v]) => hoa(trenMat(m, u, v), 4.2)).join(''); // hoa không viền: viền nâu trên hình nhỏ cỡ này là thành đinh tán
  const hoaVan = rai(truoc, [[.3, .2], [.7, .38], [.35, .56], [.66, .72], [.5, .87], [.08, .45], [.92, .12]])
               + rai(hong, [[.3, .15], [.7, .33], [.3, .52], [.7, .7], [.35, .88]]);
  return chan(x + 3, y + D - 3) + chan(x + W - 3, y + 3) + chan(x + W - 3, y + D - 3)
    + khoiMem(x, y, z, W, D, H, XANH, 3.5) // vải căng trên khung: cạnh hơi phồng, không sắc như tủ sắt
    + hoaVan
    + `<path class="m" d="M${f(may[0])},${f(may[1])} L${f(may2[0])},${f(may2[1])}"/>`
    + `<path class="m" d="${duong(vom)}"/>`
    + `<path d="${duong(vom)}" fill="none" stroke="#6B4631" stroke-width="3.4" stroke-dasharray="1.2 3.2" stroke-linecap="round"/>`
    + `<rect class="n" x="${f(kx - 3)}" y="${f(ky - 2)}" width="6" height="11" rx="2" fill="${XAM}"/>`;
}

function binhNuoc() {
  // Cây nước để bàn, bình 20 lít úp ngược lên trên.
  const chan = hop(-30, -30, 0, 60, 60, 72, KEM);
  const [vx, vy] = P(30, 0, 44);
  const voi = `<rect class="n" x="${f(vx - 6)}" y="${f(vy - 4)}" width="12" height="16" rx="3" fill="${XAM}"/>`
            + elip(vx, vy - 5, 7, 5, DAT);
  // Gân ngang trên thân bình: chỉ vẽ nửa trước của vòng.
  const gan = z => {
    const [gx, gy] = P(0, 0, z), a = 32 * R2 * C, b = 32 * R2 * S;
    return `<path class="m" d="M${f(gx - a)},${f(gy)} A${f(a)} ${f(b)} 0 0 0 ${f(gx + a)},${f(gy)}"/>`;
  };
  return chan + voi
    + tru(72, 80, 11, 11, XAM)
    + tru(80, 96, 12, 32, XANH)
    + tru(96, 162, 32, 32, XANH)
    + gan(118) + gan(140)
    + tru(162, 166, 30, 30, XANH);
}

function senDa() {
  const [, yDat] = P(0, 0, 52);
  // Lá mọng: gốc ở tâm bông, ngọn chĩa ra theo góc g (trong mặt phẳng ngang),
  // hơi ngóc lên `ngoc`. Chiếu về màn hình rồi vẽ như một giọt nước.
  const laSen = (g, dai, rong, ngoc, z) => {
    const r = g * Math.PI / 180, [ox, oy] = P(0, 0, z);
    const [tx, ty] = P(Math.cos(r) * dai, Math.sin(r) * dai, z + ngoc);
    const goc = Math.atan2(ty - oy, tx - ox) * 180 / Math.PI, l = Math.hypot(tx - ox, ty - oy);
    return la(ox, oy, goc, l, rong) + `<path class="m" transform="translate(${f(ox)},${f(oy)}) rotate(${f(goc)})" d="M${f(l * .35)},0 L${f(l * .8)},0"/>`;
  };
  // Vòng lá, xếp từ sau ra trước: lá nào có (cos + sin) nhỏ là nằm phía sau.
  const vong = (so, dai, rong, ngoc, z, lech) => Array.from({ length: so }, (_, i) => lech + i * 360 / so)
    .sort((a, b) => (Math.cos(a * Math.PI / 180) + Math.sin(a * Math.PI / 180)) - (Math.cos(b * Math.PI / 180) + Math.sin(b * Math.PI / 180)))
    .map(g => laSen(g, dai, rong, ngoc, z)).join('');
  return tru(0, 52, 34, 42, DAT)
    + elip(0, yDat, 42 * R2 * C, 42 * R2 * S, XAM)
    + vong(10, 64, 15, 8, 54, 0)
    + vong(8, 44, 13, 22, 60, 20)
    + vong(5, 26, 10, 30, 66, 8);
}

// ── Đồ cho khách khó tính (giai đoạn 1) ────────────────────────────────────

// Gác lửng gỗ trên 4 cột, thang bắc phía trước. Chiếm 2×2 ô.
function gac() {
  const A = 100, Z = 150, DAY = 14, top = Z + DAY;
  const cot = (x, y) => hop(x - 6, y - 6, 0, 12, 12, Z, OAK);
  const van = [-60, -20, 20, 60].map(y => {
    const a = P(-A, y, top), b = P(A, y, top);
    return `<path class="m" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`;
  }).join('');
  // Thang: hai thanh dọc từ sàn lên mép gác, bậc cách đều.
  const thanh = y => { const a = P(A + 30, y, 0), b = P(A, y, top); return canh(`M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}`, 5); };
  let bac = '';
  for (let u = .18; u < 1; u += .2) {
    const a = P(A + 30 * (1 - u), -24, top * u), b = P(A + 30 * (1 - u), 24, top * u);
    bac += canh(`M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}`, 4);
  }
  return cot(-A + 6, -A + 6) + cot(A - 6, -A + 6) + cot(-A + 6, A - 6) + cot(A - 6, A - 6)
    + hop(-A, -A, Z, 2 * A, 2 * A, DAY, OAK) + van
    + khoiMem(-90, -90, top, 120, 84, 12, XANH, 3)
    + khoiMem(-84, -80, top + 12, 40, 64, 10, KEM, -5)
    + thanh(-24) + bac + thanh(24);
}

// WC riêng: buồng gạch men, cửa nhựa, biển "WC".
function wc() {
  const W = 100, H = 200, x = -W / 2, y = -W / 2;
  const truoc = [[x + W, y, 0], [x + W, y + W, 0], [x + W, y + W, H], [x + W, y, H]];
  const hong = [[x, y + W, 0], [x + W, y + W, 0], [x + W, y + W, H], [x, y + W, H]];
  const net = (m, u0, v0, u1, v1) => {
    const a = trenMat(m, u0, v0), b = trenMat(m, u1, v1);
    return `<path class="m" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`;
  };
  let gach = '';
  for (let v = .2; v < 1; v += .2) gach += net(hong, 0, v, 1, v);
  for (let u = .25; u < 1; u += .25) gach += net(hong, u, 0, u, 1);
  const cua = [trenMat(truoc, .16, 0), trenMat(truoc, .84, 0), trenMat(truoc, .84, .84), trenMat(truoc, .16, .84)];
  let khe = '';
  for (let v = .66; v < .8; v += .04) khe += net(truoc, .28, v, .72, v);
  const [kx, ky] = trenMat(truoc, .76, .42), [bx, by] = trenMat(truoc, .5, .92);
  return hop(x, y, 0, W, W, H, KEM) + gach
    + `<polygon class="n" points="${pts(cua)}" fill="${XANH}"/>` + khe
    + elip(kx, ky, 4, 4, XAM)
    + `<g transform="translate(${f(bx)},${f(by)}) matrix(${f(C)},${f(-S)},0,1,0,0)">`
    + `<rect class="n" x="-17" y="-8" width="34" height="16" rx="3" fill="${NEN}"/>`
    + `<text x="0" y="5" text-anchor="middle" font-size="12" font-weight="800" fill="#6B4631" font-family="Be Vietnam Pro, sans-serif">WC</text></g>`;
}

// Ổ mèo: nệm tròn, con mèo vàng cuộn tròn ngủ, chén cơm phía trước.
function oMeo() {
  const [cx, cy] = P(0, 0, 14), [bx, by] = P(56, 34, 0);
  return tru(0, 14, 46, 50, DAT) + elip(cx, cy, 40 * R2 * C, 40 * R2 * S, KEM)
    + `<g transform="translate(${f(cx)},${f(cy + 4)})">`
    + `<path class="n" fill="${OAK}" d="M-34,-4 Q-36,-28 -6,-30 Q24,-31 30,-10 Q32,2 0,4 Q-30,6 -34,-4 Z"/>`
    + `<path class="n" fill="${OAK}" d="M-30,0 Q-8,12 22,4 Q26,1 23,-2 Q-6,5 -28,-7 Z"/>`
    + `<path class="m" d="M-16,-28 Q-13,-19 -17,-11 M-3,-30 Q0,-21 -4,-13"/>`
    + `<path class="n" fill="${OAK}" d="M12,-29 L13,-44 L22,-33 Z M24,-33 L34,-42 L34,-26 Z"/>`
    + `<circle class="n" cx="23" cy="-20" r="13" fill="${OAK}"/>`
    + `<path class="m" d="M16,-20 Q18,-18 20,-20 M26,-20 Q28,-18 30,-20"/>`
    + `</g>`
    + `<g transform="translate(${f(bx)},${f(by)})">${tru(0, 10, 13, 16, XAM)}</g>`;
}

// Chỗ để xe trong phòng: tấm cao su lót sàn, sơn chữ P, nón bảo hiểm để sẵn.
function choXe() {
  const W = 220, D = 100, san = `matrix(${f(C)},${f(S)},${f(-C)},${f(S)},0,0)`;
  const [nx, ny] = P(70, 10, 3);
  return hop(-W / 2, -D / 2, 0, W, D, 3, XAM)
    + `<g transform="translate(0,-3) ${san}">`
    + `<rect class="m" x="-98" y="-40" width="196" height="80" rx="6" stroke-dasharray="10 8"/>`
    + `<text x="-20" y="24" text-anchor="middle" font-size="66" font-weight="800" fill="${KEM}" stroke="#6B4631" stroke-width="1.5" font-family="Be Vietnam Pro, sans-serif">P</text></g>`
    + `<g transform="translate(${f(nx)},${f(ny)})">${vom(0, 20, 26, DAT)}</g>`;
}

// ── Đồ Tết ─────────────────────────────────────────────────────────────────
// Màu vàng dùng cho đồ lễ Tết và Noel, giữ chung bảng màu của game.
const VANG_MAI = '#F2C94C';
function hoaMai(x, y, r = 5) {
  return [0, 72, 144, 216, 288].map(g => {
    const a = g * Math.PI / 180;
    return `<circle class="la" cx="${f(x + Math.cos(a) * r)}" cy="${f(y + Math.sin(a) * r)}" r="${f(r * .8)}" fill="${VANG_MAI}"/>`;
  }).join('') + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .45)}" fill="${DAT}"/>`;
}

// Chậu mai vàng, có treo hai bao lì xì.
function caiMai() {
  const [, y] = P(0, 0, 44);
  const n = (d, day) => canh(d.replace(/Y(-?\d+)/g, (_, v) => f(y + +v)), day);
  const hoa = [[-52, -122], [-40, -104], [-24, -92], [-10, -112], [20, -162], [10, -134], [2, -150], [26, -120],
               [44, -108], [60, -142], [52, -126], [-36, -130], [16, -96], [-58, -106], [36, -150]];
  const lixi = (x, yy) => `<path class="m" d="M${x},${f(y + yy - 14)} L${x},${f(y + yy)}"/>`
    + `<rect class="n" x="${x - 7}" y="${f(y + yy)}" width="14" height="20" rx="2" fill="${DAT}"/>`
    + `<rect x="${x - 3}" y="${f(y + yy + 6)}" width="6" height="6" rx="1" fill="${VANG_MAI}"/>`;
  return tru(0, 44, 36, 44, DAT) + elip(0, y, 44 * R2 * C * .9, 44 * R2 * S * .9, XAM)
    + n('M0,Y0 L-4,Y-40 L-30,Y-90 L-52,Y-120', 7) + n('M-4,Y-40 L14,Y-86 L8,Y-130 L20,Y-160', 6)
    + n('M14,Y-86 L46,Y-110 L60,Y-140', 5) + n('M-30,Y-90 L-10,Y-112', 4) + n('M8,Y-130 L36,Y-150', 4)
    + hoa.map(([x, v]) => hoaMai(x, y + v, 5.5)).join('')
    + lixi(-30, -86) + lixi(46, -106);
}

// Hai đòn bánh chưng lá dong, buộc lạt, dán tem đỏ.
function banhChung() {
  const mot = (x, y, z, a) => hop(x - a, y - a, z, 2 * a, 2 * a, 26, XANH)
    + poly([[x - 5, y - a, z + 26], [x + 5, y - a, z + 26], [x + 5, y + a, z + 26], [x - 5, y + a, z + 26]], KEM)
    + poly([[x - a, y - 5, z + 26], [x + a, y - 5, z + 26], [x + a, y + 5, z + 26], [x - a, y + 5, z + 26]], KEM)
    + poly([[x + a, y - 5, z], [x + a, y + 5, z], [x + a, y + 5, z + 26], [x + a, y - 5, z + 26]], KEM)
    + poly([[x - 5, y + a, z], [x + 5, y + a, z], [x + 5, y + a, z + 26], [x - 5, y + a, z + 26]], KEM);
  return mot(0, 0, 0, 40) + mot(2, -2, 26, 34)
    + poly([[12, 12, 52], [28, 12, 52], [28, 28, 52], [12, 28, 52]], DAT);
}

// ── Gói Noel Xóm Trọ ───────────────────────────────────────────────────────
// Cây thông mini: ba tầng tán khối, chậu gỗ có một nét vân.
function cayThongMini() {
  const tan = (z, r, cao) => poly([[r, -r, z], [r, r, z], [0, 0, z + cao]], XANH)
    + poly([[r, r, z], [-r, r, z], [0, 0, z + cao]], XANH);
  return tru(0, 26, 20, 26, OAK)
    + `<path class="m" d="M-12,-12 Q0,-5 12,-12"/>`
    + tru(26, 52, 6, 6, OAK)
    + tan(44, 44, 60) + tan(78, 34, 60) + tan(112, 24, 55)
    + [[30, 6, 63], [-8, 28, 66], [22, 3, 99], [-4, 18, 127]].map(([x, y, z], i) => {
      const [a, b] = P(x, y, z);
      return elip(a, b, 4, 4, i % 2 ? VANG_MAI : DAT);
    }).join('')
    + `<path class="n" fill="${VANG_MAI}" d="M0,-183 L4,-175 L13,-174 L6,-168 L8,-159 L0,-163 L-8,-159 L-6,-168 L-13,-174 L-4,-175 Z"/>`;
}

// Hộp quà giấy đỏ, ruy băng vàng chạy qua nắp và hai mặt hộp.
function hopQuaNoel() {
  return hop(-25, -25, 0, 50, 50, 36, DAT) + hop(-27, -27, 36, 54, 54, 6, DAT)
    + poly([[-5, -27, 42], [5, -27, 42], [5, 27, 42], [-5, 27, 42]], VANG_MAI)
    + poly([[-27, -5, 42], [27, -5, 42], [27, 5, 42], [-27, 5, 42]], VANG_MAI)
    + poly([[27, -5, 36], [27, 5, 36], [27, 5, 42], [27, -5, 42]], VANG_MAI)
    + poly([[-5, 27, 36], [5, 27, 36], [5, 27, 42], [-5, 27, 42]], VANG_MAI)
    + poly([[25, -5, 0], [25, 5, 0], [25, 5, 36], [25, -5, 36]], VANG_MAI)
    + poly([[-5, 25, 0], [5, 25, 0], [5, 25, 36], [-5, 25, 36]], VANG_MAI)
    + `<path class="n" fill="${VANG_MAI}" d="M0,-42 C-28,-43 -24,-65 -10,-57 Z M0,-42 C28,-43 24,-65 10,-57 Z"/>`
    + elip(0, -44, 5, 4, VANG_MAI);
}

// Đèn treo phẳng trên tường: bóng đỏ, vàng, xanh có đui nâu.
function dayDenNoel(dai = 600) {
  const nua = dai / 2;
  let s = `<path class="m" d="M10,-286 Q${f(nua / 2)},-254 ${f(nua)},-286 Q${f(nua * 1.5)},-254 ${f(dai - 10)},-286"/>`;
  for (let i = 0; i < 17; i++) {
    const x = 20 + i * (dai - 40) / 16, u = x < nua ? (x - 10) / (nua - 10) : (x - nua) / (nua - 10);
    const y = -286 + 64 * u * (1 - u);
    s += `<path class="m" d="M${f(x)},${f(y)} v8"/>`
      + `<rect class="n" x="${f(x - 3)}" y="${f(y + 6)}" width="6" height="5" rx="1" fill="${OAK}"/>`
      + elip(x, y + 16, 5, 7, [DAT, VANG_MAI, XANH][i % 3]);
  }
  return s;
}

// Vòng treo tường: lá xanh có gân, quả đỏ và nơ đỏ đất.
function vongNguyetQueNoel() {
  return `<circle class="n" r="38" fill="none" stroke="${XANH}" stroke-width="16"/>`
    + Array.from({ length: 12 }, (_, i) => {
      const a = i * Math.PI / 6, x = Math.cos(a) * 38, y = Math.sin(a) * 38;
      return `<g transform="translate(${f(x)},${f(y)}) rotate(${i * 30 + 90})">`
        + la(-12, 0, -20, 26, 7) + '<path class="m" d="M-10,0 L10,-7"/></g>';
    }).join('')
    + [-150, -30, 90].map(g => {
      const a = g * Math.PI / 180;
      return elip(Math.cos(a) * 37, Math.sin(a) * 37, 5, 5, DAT);
    }).join('')
    + `<path class="n" fill="${DAT}" d="M0,-36 Q-25,-55 -23,-31 Q-12,-24 0,-36 Q12,-24 23,-31 Q25,-55 0,-36 Z M-4,-34 L-15,-14 L-5,-17 L0,-29 L5,-17 L15,-14 L4,-34 Z"/>`
    + elip(0, -36, 5, 5, DAT);
}

// Cục phát wifi: hộp nhỏ, hai râu ăng-ten, ba đèn xanh ở mặt trước.
function cucWifi() {
  const [ax, ay] = P(-14, -12, 16), [bx, by] = P(14, -12, 16);
  const rau = (x, y) => canh(`M${f(x)},${f(y)} L${f(x - 4)},${f(y - 46)}`, 4);
  const den = [-12, -3, 6].map(v => { const [x, y] = P(22, v, 9); return elip(x, y, 2.6, 2.6, XANH, 'tron'); }).join('');
  return rau(ax, ay) + rau(bx, by) + hop(-22, -16, 0, 44, 32, 16, KEM) + den;
}

// ── Đợt 2: 15 món cho phòng xịn hơn ────────────────────────────────────────
// Mặt trước của khối (x lớn nhất) — dùng chung cho các món có chi tiết ở mặt trước.
const matTruoc = (x, y, z, W, D, H) => [[x + W, y, z], [x + W, y + D, z], [x + W, y + D, z + H], [x + W, y, z + H]];
const duong2 = (a, b, cls = 'm') => `<path class="${cls}" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`;
const vongTrenMat = (m, cu, cv, ru, rv, fill) => {
  const d = [];
  for (let k = 0; k < 24; k++) { const g = k / 24 * 2 * Math.PI; d.push(trenMat(m, cu + ru * Math.cos(g), cv + rv * Math.sin(g))); }
  return `<polygon class="n" points="${pts(d)}" fill="${fill}"/>`;
};

// Máy lạnh đứng: thân cao, khe gió, màn hình nhỏ.
function mayLanh() {
  const m = matTruoc(-22, -26, 0, 44, 52, 150);
  let khe = '';
  for (let v = .55; v < .9; v += .06) khe += duong2(trenMat(m, .15, v), trenMat(m, .85, v));
  const man = [trenMat(m, .25, .3), trenMat(m, .75, .3), trenMat(m, .75, .42), trenMat(m, .25, .42)];
  return hop(-22, -26, 0, 44, 52, 150, KEM) + khe + `<polygon class="n" points="${pts(man)}" fill="${XANH}"/>`;
}

// Tủ lạnh hai cánh: ngăn đá trên, tay nắm, nam châm dán tủ.
function tuLanh() {
  const m = matTruoc(-28, -30, 0, 56, 60, 172);
  const tay = (v0, v1) => { const a = trenMat(m, .12, v0), b = trenMat(m, .12, v1); return canh(`M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}`, 3); };
  const [nx, ny] = trenMat(m, .6, .82);
  return hop(-28, -30, 0, 56, 60, 172, KEM) + duong2(trenMat(m, 0, .66), trenMat(m, 1, .66), 'n')
    + tay(.72, .9) + tay(.3, .56) + elip(nx, ny, 5, 5, DAT);
}

// Bếp ga đôi đặt trên kệ gỗ.
function bepGa() {
  const hoa = [-16, 16].map(yy => { const [x, y] = P(0, yy, 68); return elip(x, y, 14, 7, KEM) + elip(x, y, 6, 3, DAT, 'tron'); }).join('');
  const num = [-12, 12].map(yy => { const [x, y] = P(38, yy, 63); return elip(x, y, 3, 3, KEM); }).join('');
  return hop(-48, -32, 0, 96, 64, 58, OAK) + hop(-38, -26, 58, 76, 52, 10, XAM) + hoa + num;
}

// Nồi chiên không dầu: khối vuông bo, cửa sổ nhìn vào, tay kéo.
function noiChien() {
  const m = matTruoc(-24, -24, 0, 48, 48, 66);
  const cua = [trenMat(m, .18, .12), trenMat(m, .82, .12), trenMat(m, .82, .55), trenMat(m, .18, .55)];
  const [hx, hy] = trenMat(m, .5, .3), [mx, my] = trenMat(m, .5, .8);
  return hop(-24, -24, 0, 48, 48, 66, XAM) + `<polygon class="n" points="${pts(cua)}" fill="${KEM}"/>`
    + `<rect class="n" x="${f(hx - 10)}" y="${f(hy - 3)}" width="20" height="6" rx="3" fill="${OAK}"/>` + elip(mx, my, 5, 3, DAT);
}

// Bàn học: bốn chân, chồng sách, đèn bàn.
function banHoc() {
  const chan = (x, y) => hop(x - 3, y - 3, 0, 6, 6, 70, OAK);
  const [lx, ly] = P(20, -18, 77);
  const den = `<g transform="translate(${f(lx)},${f(ly)})">${tru(0, 4, 8, 8, XAM)}</g>`
    + canh(`M${f(lx)},${f(ly - 4)} L${f(lx + 10)},${f(ly - 44)} L${f(lx + 26)},${f(ly - 40)}`, 3)
    + `<path class="n" fill="${KEM}" d="M${f(lx + 18)},${f(ly - 47)} L${f(lx + 36)},${f(ly - 44)} L${f(lx + 30)},${f(ly - 30)} L${f(lx + 20)},${f(ly - 32)} Z"/>`;
  return chan(-44, -26) + chan(44, -26) + chan(-44, 26) + hop(-50, -32, 70, 100, 64, 7, OAK)
    + hop(-40, -20, 77, 26, 34, 8, DAT) + hop(-38, -18, 85, 22, 30, 7, XANH) + den + chan(44, 26);
}

// Kệ sách ba tầng, gáy sách nhiều màu.
function keSach() {
  const m = matTruoc(-16, -46, 0, 32, 92, 150);
  const mau = [DAT, XANH, KEM, XAM];
  let s = hop(-16, -46, 0, 32, 92, 150, OAK);
  [.06, .38, .7].forEach((v0, r) => {
    s += duong2(trenMat(m, 0, v0 - .02), trenMat(m, 1, v0 - .02), 'n');
    for (let u = .05, k = 0; u < .88; k++) {
      const w = .07 + ((k * 37 + r * 11) % 5) * .012, h = .17 + ((k * 13 + r * 7) % 4) * .02;
      const q = [trenMat(m, u, v0), trenMat(m, u + w, v0), trenMat(m, u + w, v0 + h), trenMat(m, u, v0 + h)];
      s += `<polygon class="n" points="${pts(q)}" fill="${mau[(k + r) % 4]}"/>`;
      u += w + .015;
    }
  });
  return s;
}

// Tủ đầu giường có đèn ngủ chụp vải.
function denNgu() {
  const m = matTruoc(-22, -22, 0, 44, 44, 46);
  const [kx, ky] = trenMat(m, .5, .6);
  return hop(-22, -22, 0, 44, 44, 46, OAK) + duong2(trenMat(m, 0, .45), trenMat(m, 1, .45)) + elip(kx, ky, 3, 3, KEM)
    + tru(46, 52, 10, 10, XAM) + tru(52, 80, 3, 3, XAM) + tru(80, 108, 22, 12, KEM);
}

// Giường sắt đơn: đầu giường, nệm, gối, chăn gấp. Chiếm 2×1 ô.
function giuong() {
  return hop(-112, -50, 0, 10, 100, 82, XAM) + hop(-102, -50, 0, 210, 100, 28, XAM)
    + khoiMem(-98, -46, 28, 202, 92, 16, KEM, 3) + khoiMem(-92, -36, 44, 40, 72, 11, KEM, -5)
    + khoiMem(-8, -47, 44, 106, 94, 9, XANH, 3);
}

// Máy giặt cửa trước: cửa tròn, bảng nút.
function mayGiat() {
  const m = matTruoc(-30, -30, 0, 60, 60, 88);
  const [nx, ny] = trenMat(m, .8, .9);
  return hop(-30, -30, 0, 60, 60, 88, KEM) + vongTrenMat(m, .5, .42, .3, .3, XAM) + vongTrenMat(m, .5, .42, .19, .19, '#CDE3EC')
    + duong2(trenMat(m, 0, .8), trenMat(m, 1, .8)) + elip(nx, ny, 4, 4, DAT);
}

// Gương đứng khung gỗ.
function guong() {
  const m = matTruoc(-5, -26, 6, 10, 52, 150);
  const kinh = [trenMat(m, .12, .08), trenMat(m, .88, .08), trenMat(m, .88, .94), trenMat(m, .12, .94)];
  const a = trenMat(m, .3, .62), b = trenMat(m, .55, .84);
  return hop(-22, -22, 0, 44, 6, 6, OAK) + hop(-22, 16, 0, 44, 6, 6, OAK) + hop(-5, -26, 6, 10, 52, 150, OAK)
    + `<polygon class="n" points="${pts(kinh)}" fill="#CDE3EC"/>`
    + `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
}

// Sofa hai chỗ: lưng tựa, hai tay vịn, đệm, gối ôm. Chiếm 2×1 ô.
function sofa() {
  return hop(-100, -42, 0, 200, 84, 34, DAT) + hop(-100, -42, 34, 26, 84, 46, DAT) + hop(-74, -42, 34, 170, 14, 20, DAT)
    + khoiMem(-72, -26, 34, 164, 52, 12, KEM, 3) + khoiMem(-70, -20, 46, 16, 40, 24, XANH, -4)
    + hop(-74, 28, 34, 170, 14, 20, DAT);
}

// Bàn trà thấp, ấm trà và chén.
function banTra() {
  const chan = (x, y) => hop(x - 3, y - 3, 0, 6, 6, 28, OAK);
  const [ax, ay] = P(-8, -8, 34), [cx, cy] = P(16, 14, 34);
  return chan(-30, -30) + chan(30, -30) + chan(-30, 30) + chan(30, 30) + hop(-36, -36, 28, 72, 72, 6, OAK)
    + `<g transform="translate(${f(ax)},${f(ay)})">${tru(0, 16, 12, 10, KEM)}${vom(16, 10, 8, KEM)}</g>`
    + `<g transform="translate(${f(cx)},${f(cy)})">${tru(0, 8, 6, 7, KEM)}</g>`;
}

// Chậu xương rồng có một bông hoa trên đỉnh.
function xuongRong() {
  const [x, y] = P(0, 0, 34);
  const N2 = v => f(v);
  const than = `<path class="n" fill="${XANH}" d="M${N2(x - 12)},${N2(y)} L${N2(x - 12)},${N2(y - 60)} Q${N2(x - 12)},${N2(y - 76)} ${N2(x)},${N2(y - 76)} Q${N2(x + 12)},${N2(y - 76)} ${N2(x + 12)},${N2(y - 60)} L${N2(x + 12)},${N2(y)} Z"/>`;
  const tay = (s, cao) => `<path class="n" fill="${XANH}" d="M${N2(x + s * 12)},${N2(y - cao)} L${N2(x + s * 26)},${N2(y - cao)} Q${N2(x + s * 32)},${N2(y - cao)} ${N2(x + s * 32)},${N2(y - cao - 8)} L${N2(x + s * 32)},${N2(y - cao - 22)} Q${N2(x + s * 32)},${N2(y - cao - 28)} ${N2(x + s * 26)},${N2(y - cao - 28)} Q${N2(x + s * 20)},${N2(y - cao - 28)} ${N2(x + s * 20)},${N2(y - cao - 22)} L${N2(x + s * 20)},${N2(y - cao - 10)} L${N2(x + s * 12)},${N2(y - cao - 10)} Z"/>`;
  const gai = [[-6, 20], [6, 34], [-4, 50], [5, 62]].map(([dx, dy]) => `<path class="m" d="M${N2(x + dx - 3)},${N2(y - dy)} L${N2(x + dx + 3)},${N2(y - dy - 3)}"/>`).join('');
  return tru(0, 34, 22, 26, DAT) + elip(x, y, 22 * R2 * C * .9, 22 * R2 * S * .9, XAM)
    + tay(-1, 24) + than + tay(1, 40) + gai + elip(x, y - 78, 6, 5, DAT);
}

// Thảm trải sàn sọc. Chiếm 2×1 ô, nằm phẳng.
function thamLot() {
  let s = hop(-104, -46, 0, 208, 92, 3, DAT);
  [-24, 0, 24].forEach(yy => { s += poly([[-96, yy - 4, 3], [96, yy - 4, 3], [96, yy + 4, 3], [-96, yy + 4, 3]], KEM); });
  return s + poly([[-104, -46, 3], [-96, -46, 3], [-96, 46, 3], [-104, 46, 3]], OAK) + poly([[96, -46, 3], [104, -46, 3], [104, 46, 3], [96, 46, 3]], OAK);
}

// Loa gỗ (loaGo — tên "loa" đã là hàm thông báo trong game): hai vành loa ở mặt trước.
function loaGo() {
  const m = matTruoc(-18, -18, 0, 36, 36, 78);
  return hop(-18, -18, 0, 36, 36, 78, OAK) + vongTrenMat(m, .5, .32, .3, .2, XAM) + vongTrenMat(m, .5, .32, .12, .08, KEM)
    + vongTrenMat(m, .5, .74, .18, .12, XAM);
}

// ── Đồ tiệm bánh (mặt bằng thuê) ────────────────────────────────────────────
const dich = (x, y, z, s) => { const [a, b] = P(x, y, z); return `<g transform="translate(${f(a)},${f(b)})">${s}</g>`; };

// Lò nướng đặt trên tủ sắt, cửa kính hắt lửa cam.
function loNuong() {
  return hop(-32, -30, 0, 64, 60, 66, XAM) + hop(-30, -28, 66, 60, 56, 60, KEM)
    + poly([[30, -20, 76], [30, 18, 76], [30, 18, 112], [30, -20, 112]], '#3A4668')
    + poly([[30, -14, 80], [30, 12, 80], [30, 12, 94], [30, -14, 94]], DAT)
    + poly([[30, -24, 116], [30, 22, 116], [30, 22, 122], [30, -24, 122]], OAK)
    + dich(30, 24, 100, elip(0, 0, 4, 4, DAT)) + dich(30, 24, 86, elip(0, 0, 4, 4, OAK));
}

// Tủ kính bày bánh: chân gỗ, hộc kính, trong có ba chiếc bánh kem.
function tuKinh() {
  const banh = (y, mau) => dich(0, y, 58, tru(0, 12, 12, 12, KEM) + tru(12, 16, 12, 12, mau));
  return hop(-30, -46, 0, 60, 92, 52, OAK)
    + banh(-26, DAT) + banh(0, XANH) + banh(26, '#E88FA3')
    + `<g opacity=".55">${hop(-30, -46, 52, 60, 92, 44, '#DCEFF2')}</g>`
    + hop(-32, -48, 96, 64, 96, 5, OAK);
}

// Quầy thu ngân: bệ gỗ, mặt kem, máy tính tiền trên cùng.
function quayThu() {
  return hop(-26, -40, 0, 52, 80, 82, OAK) + hop(-28, -42, 82, 56, 84, 6, KEM)
    + poly([[26, -30, 20], [26, 30, 20], [26, 30, 64], [26, -30, 64]], DAT)
    + hop(-12, -16, 88, 24, 30, 16, XAM) + hop(-10, -12, 104, 12, 22, 12, KEM);
}

// Bàn quán tròn với hai ghế đẩu (chiếm hai ô).
function banQuan() {
  const ghe = x => dich(x, 0, 0, tru(0, 40, 5, 5, XAM) + tru(40, 46, 18, 18, DAT));
  return ghe(-62) + dich(0, 0, 0, tru(0, 64, 6, 6, XAM) + tru(64, 70, 42, 42, KEM))
    + dich(8, -6, 70, tru(0, 10, 9, 9, '#E88FA3')) + ghe(62);
}

// Kệ bánh mì: khung gỗ mở mặt trước, bốn tầng ổ bánh vàng.
function keBanhMi() {
  const BANH = '#E5B36E';
  let s = hop(-24, -46, 0, 8, 92, 132, OAK);
  [0, 44, 88].forEach(z => {
    s += hop(-24, -46, z, 48, 92, 5, OAK);
    [-28, 0, 28].forEach((y, i) => {
      const [x0, y0] = P(4, y, z + 13);
      s += `<ellipse class="n" cx="${f(x0)}" cy="${f(y0)}" rx="${i === 1 ? 13 : 11}" ry="8" fill="${BANH}"/>`
        + `<path class="m" d="M${f(x0 - 5)},${f(y0 - 4)} L${f(x0 - 2)},${f(y0 + 3)} M${f(x0 + 2)},${f(y0 - 4)} L${f(x0 + 5)},${f(y0 + 3)}"/>`;
    });
  });
  return s + hop(-24, -46, 132, 48, 92, 5, OAK) + hop(-24, 40, 0, 48, 6, 132, OAK);
}

// Máy pha cà phê trên quầy nhỏ, hai ly sứ bên cạnh.
function mayCaPhe() {
  const ly = (y) => { const [a, b] = P(18, y, 70); return `<g transform="translate(${f(a)},${f(b)})">${tru(0, 12, 7, 8, KEM)}</g>`; };
  return hop(-28, -42, 0, 56, 84, 70, KEM)
    + poly([[28, -34, 14], [28, 34, 14], [28, 34, 56], [28, -34, 56]], OAK)
    + hop(-20, -30, 70, 30, 44, 44, XAM) + hop(-22, -32, 114, 34, 48, 5, OAK)
    + (() => { const [a, b] = P(10, -8, 96); return `<circle class="n" cx="${f(a)}" cy="${f(b)}" r="6" fill="${DAT}"/>`; })()
    + (() => { const [a, b] = P(10, 12, 96); return `<circle class="n" cx="${f(a)}" cy="${f(b)}" r="6" fill="${DAT}"/>`; })()
    + ly(22) + ly(34);
}

// ── Đồ quán trà sữa: gỗ, kính và kim loại cùng bảng màu của tiệm bánh ───────
function lyTra() {
  return tru(0, 24, 10, 13, KEM)
    + dich(0, 0, 5, elip(0, 0, 8, 4, DAT))
    + tru(24, 27, 14, 14, XAM)
    + hop(-2, -2, 27, 4, 4, 22, XANH);
}

// Quầy gỗ có đường ghép ván, bình lắc và ly trà trên mặt đá.
function quayPha() {
  return hop(-105, -44, 0, 210, 88, 90, OAK) + hop(-108, -47, 90, 216, 94, 6, KEM)
    + [30, 60].map(z => poly([[105, -36, z], [105, 36, z], [105, 36, z + 2], [105, -36, z + 2]], DAT)).join('')
    + dich(-48, 0, 96, tru(0, 30, 14, 14, XAM) + vom(30, 14, 10, XAM))
    + dich(20, -12, 96, lyTra()) + dich(60, 18, 96, lyTra());
}

// Tủ kính bày ba hũ: trân châu tròn và thạch cắt khối.
function tuTopping() {
  const hu = (y, thach) => dich(0, y, 68,
    tru(0, 26, 14, 14, KEM)
    + (thach ? hop(-9, -7, 26, 8, 8, 5, XANH) + hop(1, 0, 26, 8, 8, 5, DAT)
      : [-7, 0, 7].map(x => dich(x, 0, 27, elip(0, 0, 4, 3, DAT))).join(''))
    + tru(32, 35, 16, 16, XAM));
  return hop(-30, -46, 0, 60, 92, 62, XANH) + hop(-32, -48, 62, 64, 96, 6, KEM)
    + hu(-28, false) + hu(0, true) + hu(28, false)
    + `<g opacity=".35">${hop(-30, -46, 68, 60, 92, 40, KEM)}</g>`
    + hop(-32, -48, 108, 64, 96, 4, OAK);
}

// Máy dán nắp có cuộn màng tròn và tay ép, đặt trên bệ kim loại.
function mayDanNap() {
  return hop(-32, -34, 0, 64, 68, 62, XAM) + hop(-26, -28, 62, 12, 56, 66, XANH)
    + hop(-26, -28, 122, 52, 56, 10, XANH)
    + dich(-18, -18, 147, tru(0, 10, 22, 22, KEM) + tru(10, 13, 8, 8, OAK))
    + dich(12, 12, 62, lyTra())
    + hop(6, 0, 100, 8, 24, 14, XAM) + hop(10, 8, 132, 6, 6, 22, DAT);
}

// Bàn cao và hai ghế đẩu, chân có thanh giằng kim loại.
function banGheCao() {
  const ghe = x => dich(x, 0, 0, tru(0, 64, 6, 6, XAM) + tru(64, 70, 18, 18, XANH)
    + hop(-14, -3, 25, 28, 6, 4, XAM));
  return ghe(-66) + tru(0, 96, 7, 7, XAM) + tru(96, 102, 42, 42, OAK)
    + dich(5, -8, 102, lyTra()) + ghe(66);
}

// Bảng đèn dựng trên sàn, viền sáng và ba dòng giá trên mặt bảng.
function bangMenuDen() {
  return hop(-28, -28, 0, 56, 56, 6, XAM) + hop(-4, -4, 6, 8, 8, 70, XAM)
    + hop(-26, -8, 76, 52, 16, 100, OAK)
    + poly([[26, -6, 82], [26, 6, 82], [26, 6, 170], [26, -6, 170]], KEM)
    + poly([[-24, 8, 82], [24, 8, 82], [24, 8, 170], [-24, 8, 170]], XANH)
    + [106, 128, 150].map(z => poly([[-17, 8, z], [17, 8, z], [17, 8, z + 4], [-17, 8, z + 4]], KEM)).join('');
}

const MON = [
  ['Nồi cơm điện', noiCom],
  ['Ghế nhựa', gheNhua],
  ['Quạt cây', quatCay],
  ['Cây khế', cayKhe],
  ['Dây phơi đồ', dayPhoi],
  ['Chăn gối xếp', chanGoi],
  ['Màn (mùng)', man],
  ['Lưỡi hổ', luoiHo],
  ['Tủ quần áo vải', tuVai],
  ['Bình nước lọc', binhNuoc],
  ['Sen đá', senDa],
  ['Gác gỗ', gac],
  ['WC riêng', wc],
  ['Ổ mèo', oMeo],
  ['Chỗ để xe', choXe],
  ['Chậu mai vàng', caiMai],
  ['Bánh chưng', banhChung],
  ['Cây thông mini', cayThongMini], ['Hộp quà Noel', hopQuaNoel],
  ['Cục wifi', cucWifi],
  ['Máy lạnh', mayLanh], ['Tủ lạnh', tuLanh], ['Bếp ga', bepGa], ['Nồi chiên không dầu', noiChien],
  ['Bàn học', banHoc], ['Kệ sách', keSach], ['Đèn ngủ', denNgu], ['Giường sắt', giuong],
  ['Máy giặt', mayGiat], ['Gương đứng', guong], ['Sofa', sofa], ['Bàn trà', banTra],
  ['Xương rồng', xuongRong], ['Thảm', thamLot], ['Loa gỗ', loaGo],
  ['Lò nướng bánh', loNuong], ['Tủ kính bánh', tuKinh], ['Quầy thu ngân', quayThu], ['Bàn quán', banQuan], ['Kệ bánh mì', keBanhMi], ['Máy pha cà phê', mayCaPhe],
  ['Quầy pha chế', quayPha], ['Tủ topping', tuTopping], ['Máy dán nắp ly', mayDanNap], ['Bàn ghế cao', banGheCao], ['Bảng menu đèn', bangMenuDen],
];
