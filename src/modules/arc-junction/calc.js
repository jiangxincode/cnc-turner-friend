/**
 * 圆弧接点计算模块
 * 输出格式与原应用一致：G0 X0 / G1 Z0 F0.1 / G03 X{大径} Z{Z终点} R{R}
 *
 * 坐标系：X 为直径值，Z 负方向为进刀方向
 * 球心在 Z=0，球面终点 Z = -(R - sqrt(R² - (D/2)²))
 */

function fmt(v) {
  return parseFloat(v.toFixed(3));
}

/**
 * 计算球面终点 Z 坐标
 * Z = -(R - sqrt(R² - r²))，r = 大径/2
 */
function ballZ(R, D) {
  const r = D / 2;
  if (r > R) throw new Error('大径/2 不能大于 R');
  return -(R - Math.sqrt(R * R - r * r));
}

/**
 * 生成标准球头 G03 代码（3行）
 * G0 X0
 * G1 Z0 F0.1
 * G03 X{D} Z{Z} R{R}
 */
function stdBallCode(D, R, label) {
  const Z = fmt(ballZ(R, D));
  return [
    `( ${label} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 X${fmt(D)} Z${Z} R${fmt(R)}`,
  ].join('\n');
}

// qt1：外凸球头  输入：大径、R，可选 Ra（过渡圆弧）、tip（刀尖补偿）
export function calcQt1({ large, R, Ra, tip, juedui }) {
  large = Number(large); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');

  const isAbs = juedui !== 'false';   // true = 绝对坐标，false = 相对坐标
  const hasRa = Ra !== null && !isNaN(Number(Ra)) && Number(Ra) > 0;
  const hasTip = tip !== null && !isNaN(Number(tip)) && Number(tip) > 0;
  const raVal = hasRa ? Number(Ra) : 0;
  const tipVal = hasTip ? Number(tip) : 0;

  // 坐标格式化：绝对用 X/Z，相对用 U/W
  const coord = (x, z, prevX, prevZ) => {
    if (isAbs) {
      return `X${fmt(x)} Z${fmt(z)}`;
    } else {
      return `U${fmt(x - prevX)} W${fmt(z - prevZ)}`;
    }
  };

  const lines = [`( 球头接点1  大径=${large}  R=${R} )`];
  lines.push('G0 X0');
  lines.push('G1 Z0 F0.1');

  // 当前位置（用于计算相对增量）
  let curX = 0, curZ = 0;

  if (hasRa) {
    // 两段圆弧
    // 大球圆心 O1 = (X_r=0, Z=-R)
    // 小圆弧圆心 O2 = (X_r = large/2 - Ra, Z = Zc)
    // |O1O2| = R - Ra
    const r2 = large / 2 - raVal;
    const dist = R - raVal;
    if (r2 < 0) throw new Error('Ra 过大，超出大径范围');
    const inner = dist * dist - r2 * r2;
    if (inner < 0) throw new Error('R 与 Ra 参数不合法');
    const Zc = -R + Math.sqrt(inner);

    // 切点（绝对坐标）
    const tx = R * r2 / dist;
    const tz = -R + R * (Zc + R) / dist;
    const txD = tx * 2;   // X 直径值

    // 小圆弧终点
    const endX = large;
    const endZ = Zc;

    lines.push(`G03 ${coord(txD, tz, curX, curZ)} R${fmt(R)}`);
    curX = txD; curZ = tz;
    lines.push(`G03 ${coord(endX, endZ, curX, curZ)} R${fmt(raVal)}`);
  } else {
    // 单段圆弧
    const Z = ballZ(R, large);
    const endX = hasTip ? large - tipVal * 2 : large;
    const endZ = hasTip ? Z + tipVal : Z;
    lines.push(`G03 ${coord(endX, endZ, curX, curZ)} R${fmt(R)}`);
  }

  return lines.join('\n');
}

/**
 * qt2：球头接点2 - 4种模式，各模式长度公式不同
 *
 * 球：  L = sqrt(R²-(d/2)²) - sqrt(R²-(D/2)²)
 * 弧1：L = sqrt(R²-(d/2+R-D/2)²)
 * 弧2：L = R - sqrt(R²-(D/2-d/2)²)
 * 弧3：全部必填
 *
 * Ra/Rb 过渡圆弧几何（以球模式为例）：
 *   主圆弧R圆心：(0, -a)，a = sqrt(R²-(d/2)²)
 *   Ra圆心：(x_ra, -Ra)，x_ra = sqrt((R-Ra)²-(a-Ra)²)
 *   起点：(x_ra, 0)，直径 = 2*x_ra
 *   Ra终点（主圆弧起点）：(0,-a) + R*(x_ra/(R-Ra), (a-Ra)/(R-Ra))
 *   Rb圆心：(D/2-Rb, z_rb)，z_rb = -a + sqrt((R-Rb)²-(D/2-Rb)²)
 *   主圆弧终点（Rb起点）：(0,-a) + R*(x_rb/(R-Rb), (z_rb+a)/(R-Rb))
 *   Rb终点：(D/2, z_rb)
 */
export function calcQt2({ large, small, R, long, zStart, Ra, Rb, tip, buchang, juedui, mode, _onCalcL }) {
  const D = large !== '' && large !== null && large !== undefined ? Number(large) : NaN;
  const d = small !== '' && small !== null && small !== undefined ? Number(small) : NaN;
  const r = R !== '' && R !== null && R !== undefined ? Number(R) : NaN;
  const L = long !== '' && long !== null && long !== undefined ? Number(long) : NaN;
  const z0 = zStart !== '' && zStart !== null && zStart !== undefined ? Number(zStart) : 0;
  const isAbs = juedui !== 'false';
  const hasTip = buchang === true || buchang === 'true';
  const tipVal = hasTip && tip !== '' && tip !== null ? Number(tip) : 0;
  const raVal = Ra !== '' && Ra !== null && Ra !== undefined ? Number(Ra) : NaN;
  const rbVal = Rb !== '' && Rb !== null && Rb !== undefined ? Number(Rb) : NaN;
  const hasRa = !isNaN(raVal) && raVal > 0;
  const hasRb = !isNaN(rbVal) && rbVal > 0;

  if (isNaN(r) || r <= 0) throw new Error('R必须填写且为正数');

  let calcD = D, calcD2 = d, calcL = L;

  if (mode === 'arc3') {
    if (isNaN(D) || isNaN(d) || isNaN(L)) throw new Error('弧3必须全部填写');

  } else if (mode === 'ball') {
    if (isNaN(L)) {
      if (isNaN(D) || isNaN(d)) throw new Error('请填写大径、小径、R');
      const a = r * r - (d / 2) * (d / 2);
      const b = r * r - (D / 2) * (D / 2);
      if (a < 0) throw new Error('R不足以覆盖小径');
      if (b < 0) throw new Error('R不足以覆盖大径');
      calcL = Math.sqrt(a) - Math.sqrt(b);
      if (calcL < 0) throw new Error('小径应小于大径');
    } else if (isNaN(D)) {
      if (isNaN(d)) throw new Error('请填写小径、R、长度');
      const a = r * r - (d / 2) * (d / 2);
      if (a < 0) throw new Error('R不足以覆盖小径');
      const val = Math.sqrt(a) - L;
      const b = r * r - val * val;
      if (b < 0) throw new Error('参数不合法');
      calcD = 2 * Math.sqrt(b);
    } else if (isNaN(d)) {
      const b = r * r - (D / 2) * (D / 2);
      if (b < 0) throw new Error('R不足以覆盖大径');
      const val = Math.sqrt(b) + L;
      const a = r * r - val * val;
      if (a < 0) throw new Error('参数不合法');
      calcD2 = 2 * Math.sqrt(a);
    }

  } else if (mode === 'arc1') {
    if (isNaN(L)) {
      if (isNaN(D) || isNaN(d)) throw new Error('请填写大径、小径、R');
      const val = d / 2 + r - D / 2;
      const inner = r * r - val * val;
      if (inner < 0) throw new Error('参数不合法：R不足以连接大径和小径');
      calcL = Math.sqrt(inner);
    } else if (isNaN(D)) {
      if (isNaN(d)) throw new Error('请填写小径、R、长度');
      const inner = r * r - L * L;
      if (inner < 0) throw new Error('长度超过R');
      calcD = 2 * (d / 2 + r - Math.sqrt(inner));
    } else if (isNaN(d)) {
      const inner = r * r - L * L;
      if (inner < 0) throw new Error('长度超过R');
      calcD2 = 2 * (D / 2 - r + Math.sqrt(inner));
    }

  } else if (mode === 'arc2') {
    if (isNaN(L)) {
      if (isNaN(D) || isNaN(d)) throw new Error('请填写大径、小径、R');
      const half = (D - d) / 2;
      const inner = r * r - half * half;
      if (inner < 0) throw new Error('R不足以连接大径和小径');
      calcL = r - Math.sqrt(inner);
    } else if (isNaN(D)) {
      if (isNaN(d)) throw new Error('请填写小径、R、长度');
      const inner = r * r - (r - L) * (r - L);
      if (inner < 0) throw new Error('参数不合法');
      calcD = d + 2 * Math.sqrt(inner);
    } else if (isNaN(d)) {
      const inner = r * r - (r - L) * (r - L);
      if (inner < 0) throw new Error('参数不合法');
      calcD2 = D - 2 * Math.sqrt(inner);
    }

  } else {
    throw new Error('未知模式');
  }

  if (isNaN(calcL) || calcL <= 0) throw new Error('长度计算结果无效');
  if (isNaN(calcD) || calcD <= 0) throw new Error('大径计算结果无效');
  if (isNaN(calcD2) || calcD2 <= 0) throw new Error('小径计算结果无效');

  if (typeof _onCalcL === 'function' && mode !== 'arc3') _onCalcL(calcL);

  // 各模式主圆弧圆心（半径坐标）：
  // 球：  (0,       -sqrt(R²-(d/2)²))
  // 弧1：(d/2+R,   0)
  // 弧2/弧3：(d/2, -R)
  const d2 = calcD2 / 2;
  const D2 = calcD  / 2;
  let xMain, zMain;
  if (mode === 'ball') {
    xMain = 0;
    zMain = -Math.sqrt(r * r - d2 * d2);
  } else if (mode === 'arc1') {
    xMain = d2 + r;
    zMain = 0;
  } else {
    xMain = d2;
    zMain = -r;
  }

  const lines = [];

  if (!hasRa && !hasRb) {
    // 无过渡圆弧：3行
    let startX = fmt(calcD2);
    let endX   = fmt(calcD);
    let endZ   = fmt(z0 - calcL);
    if (hasTip && tipVal > 0) {
      startX = fmt(calcD2 + tipVal * 2);
      endX   = fmt(calcD - tipVal * 2);
      endZ   = fmt(z0 - calcL + tipVal);
    }
    lines.push(`G0 X${startX}`);
    lines.push(`G1 Z${fmt(z0)} F0.1`);
    if (isAbs) {
      lines.push(`G03 X${endX} Z${endZ} R${fmt(r)}`);
    } else {
      lines.push(`G03 U${fmt(calcD - calcD2)} W${fmt(-calcL)} R${fmt(r)}`);
    }

  } else if (mode === 'arc1') {
    // 弧1：主圆弧圆心(d2+R, 0)
    // Ra圆心(x_ra, -Ra)，与主圆弧内切：(xMain-x_ra)²+Ra²=(R-Ra)²
    //   x_ra = xMain - sqrt((R-Ra)²-Ra²)
    // 起点X = x_ra（Ra圆弧与Z=0平面相切）
    let startX2 = d2;
    let raEndX2, raEndZ;
    let xM = xMain, zM = zMain; // 弧1+Ra时会修正圆心

    if (hasRa) {
      // 弧1+Ra时，主圆弧圆心：(D2-R, -L)
      // 推导：主圆弧过大径终点(D2,-L)，且(xM-D2)²+(zM+L)²=R²
      //       取zM=-L → xM=D2-R（使Ra圆弧在小径端面切入）
      xM = D2 - r;
      zM = -calcL;

      // Ra圆心X：从(xM-x_ra)²+(zM+Ra)²=(R-Ra)²，取x_ra=xM+sqrt(...)
      const inner_ra = (r-raVal)*(r-raVal) - (zM+raVal)*(zM+raVal);
      if (inner_ra < 0) throw new Error('Ra过大，无法与主圆弧相切');
      const x_ra = xM + Math.sqrt(inner_ra);
      startX2 = x_ra;

      const dx_ra = x_ra - xM, dz_ra = -raVal - zM;
      const dist_ra = Math.sqrt(dx_ra*dx_ra + dz_ra*dz_ra);
      raEndX2 = xM + r * dx_ra / dist_ra;
      raEndZ  = zM + r * dz_ra / dist_ra;
    }

    let rbStartX2, rbStartZ, rbEndZ;
    if (hasRb) {
      const x_rb = D2 - rbVal;
      const dx = x_rb - xM;
      const dz_sq = (r-rbVal)*(r-rbVal) - dx*dx;
      if (dz_sq < 0) throw new Error('Rb过大');
      const z_rb = zM + Math.sqrt(dz_sq);
      rbEndZ = z_rb;
      const dist = Math.sqrt(dx*dx + (z_rb-zM)*(z_rb-zM));
      rbStartX2 = xM + r * dx / dist;
      rbStartZ  = zM + r * (z_rb-zM) / dist;
    }

    lines.push(`G0 X${fmt(startX2 * 2)}`);
    lines.push(`G1 Z${fmt(z0)} F0.1`);
    if (hasRa) {
      if (isAbs) lines.push(`G03 X${fmt(raEndX2*2)} Z${fmt(z0+raEndZ)} R${fmt(raVal)}`);
      else        lines.push(`G03 U${fmt((raEndX2-startX2)*2)} W${fmt(raEndZ)} R${fmt(raVal)}`);
    }
    const mSX = hasRa ? raEndX2 : d2;
    const mSZ = hasRa ? raEndZ  : 0;
    const mEX = hasRb ? rbStartX2 : D2;
    const mEZ = hasRb ? rbStartZ  : -calcL;
    if (isAbs) lines.push(`G03 X${fmt(mEX*2)} Z${fmt(z0+mEZ)} R${fmt(r)}`);
    else        lines.push(`G03 U${fmt((mEX-mSX)*2)} W${fmt(mEZ-mSZ)} R${fmt(r)}`);
    if (hasRb) {
      if (isAbs) lines.push(`G03 X${fmt(calcD)} Z${fmt(z0+rbEndZ)} R${fmt(rbVal)}`);
      else        lines.push(`G03 U${fmt((D2-rbStartX2)*2)} W${fmt(rbEndZ-rbStartZ)} R${fmt(rbVal)}`);
    }

  } else {
    // 球/弧2/弧3：主圆弧圆心(xMain, zMain)
    // Ra圆心(x_ra, -Ra)，与主圆弧内切：
    //   (xMain-x_ra)²+(zMain+Ra)²=(R-Ra)²
    //   x_ra = sqrt((R-Ra)²-(zMain+Ra)²)
    // 起点X = x_ra（Ra圆弧与Z=0平面相切）
    let startX2 = d2;
    let raEndX2, raEndZ;
    if (hasRa) {
      const rMinusRa = r - raVal;
      const aMinusRa = Math.abs(zMain) - raVal;
      const inner = rMinusRa * rMinusRa - aMinusRa * aMinusRa;
      if (inner < 0) throw new Error('Ra过大，无法与主圆弧相切');
      const x_ra = Math.sqrt(inner);
      startX2 = x_ra;
      const dx = x_ra - xMain, dz = -raVal - zMain;
      const dist = Math.sqrt(dx*dx + dz*dz);
      raEndX2 = xMain + r * dx / dist;
      raEndZ  = zMain + r * dz / dist;
    }

    // Rb圆心(D2-Rb, z_rb)，与主圆弧内切：
    //   (xMain-(D2-Rb))²+(zMain-z_rb)²=(R-Rb)²
    //   z_rb = zMain + sqrt((R-Rb)²-(xMain-(D2-Rb))²)
    let rbStartX2, rbStartZ, rbEndZ;
    if (hasRb) {
      const x_rb = D2 - rbVal;
      const dx = x_rb - xMain;
      const dz_sq = (r-rbVal)*(r-rbVal) - dx*dx;
      if (dz_sq < 0) throw new Error('Rb过大，无法与主圆弧相切');
      const z_rb = zMain + Math.sqrt(dz_sq);
      rbEndZ = z_rb;
      const dist = Math.sqrt(dx*dx + (z_rb-zMain)*(z_rb-zMain));
      rbStartX2 = xMain + r * dx / dist;
      rbStartZ  = zMain + r * (z_rb-zMain) / dist;
    }

    const isArc3 = mode === 'arc3';
    lines.push(`G0 X${fmt((hasRa && !isArc3) ? startX2*2 : calcD2)}`);
    lines.push(`G1 Z${fmt(z0)} F0.1`);

    if (hasRa) {
      if (isArc3) {
        // 弧3的Ra：零位移圆弧（切线过渡）
        if (isAbs) lines.push(`G03 X${fmt(calcD2)} Z${fmt(z0)} R${fmt(raVal)}`);
        else        lines.push(`G03 U0 W0 R${fmt(raVal)}`);
      } else {
        if (isAbs) lines.push(`G03 X${fmt(raEndX2*2)} Z${fmt(z0+raEndZ)} R${fmt(raVal)}`);
        else        lines.push(`G03 U${fmt((raEndX2-startX2)*2)} W${fmt(raEndZ)} R${fmt(raVal)}`);
      }
    }

    const mSX = (hasRa && !isArc3) ? raEndX2 : d2;
    const mSZ = (hasRa && !isArc3) ? raEndZ  : 0;
    const mEX = hasRb ? rbStartX2 : D2;
    const mEZ = hasRb ? rbStartZ  : -calcL;
    if (isAbs) lines.push(`G03 X${fmt(mEX*2)} Z${fmt(z0+mEZ)} R${fmt(r)}`);
    else        lines.push(`G03 U${fmt((mEX-mSX)*2)} W${fmt(mEZ-mSZ)} R${fmt(r)}`);

    if (hasRb) {
      if (isAbs) lines.push(`G03 X${fmt(calcD)} Z${fmt(z0+rbEndZ)} R${fmt(rbVal)}`);
      else        lines.push(`G03 U${fmt((D2-rbStartX2)*2)} W${fmt(rbEndZ-rbStartZ)} R${fmt(rbVal)}`);
    }
  }

  return lines.join('\n');
}

// qt3：球头+锥面  输入：大径、角度、R
export function calcQt3({ large, angle, R }) {
  large = Number(large); R = Number(R); angle = Number(angle);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const Z = fmt(ballZ(R, large));
  return [
    `( 球头接点3  大径=${large}  角度=${angle}°  R=${R} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 X${fmt(large)} Z${Z} R${fmt(R)}`,
  ].join('\n');
}

// qt4：球头+直线  输入：大径、R、长度
export function calcQt4({ large, R, long }) {
  large = Number(large); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const Z = fmt(ballZ(R, large));
  const lines = [
    `( 球头接点4  大径=${large}  R=${R} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 X${fmt(large)} Z${Z} R${fmt(R)}`,
  ];
  const L = Number(long);
  if (!isNaN(L) && L > 0) {
    lines.push(`G1 X${fmt(large)} Z${fmt(Z - L)}`);
  }
  return lines.join('\n');
}

// qt5：复合球头  输入：大径、R
export function calcQt5({ large, R }) {
  large = Number(large); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  return stdBallCode(large, R, `球头接点5  大径=${large}  R=${R}`);
}

// qt6：球头+锥+圆柱  输入：大径、小径、R
export function calcQt6({ large, small, R }) {
  large = Number(large); small = Number(small); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const Z = fmt(ballZ(R, large));
  const lines = [
    `( 球头接点6  大径=${large}  小径=${small}  R=${R} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 X${fmt(large)} Z${Z} R${fmt(R)}`,
  ];
  if (!isNaN(small) && small > 0) {
    lines.push(`G1 X${fmt(small)} Z${fmt(Z)}`);
  }
  return lines.join('\n');
}

// qt7：球头+角度  输入：大径、角度、Ra
export function calcQt7({ large, angle, Ra }) {
  large = Number(large); Ra = Number(Ra); angle = Number(angle);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(Ra) || Ra <= 0) throw new Error('Ra必须为正数');
  const Z = fmt(ballZ(Ra, large));
  return [
    `( 球头接点7  大径=${large}  角度=${angle}°  Ra=${Ra} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 X${fmt(large)} Z${Z} R${fmt(Ra)}`,
  ].join('\n');
}

// qt8：内凹球头  输入：大径、r、R
export function calcQt8({ large, r, R }) {
  large = Number(large); r = Number(r); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const Z = fmt(ballZ(R, large));
  return [
    `( 球头接点8  大径=${large}  r=${r}  R=${R} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 X${fmt(large)} Z${Z} R${fmt(R)}`,
  ].join('\n');
}

// qt9：球头+Ra过渡  输入：大径、R、Ra
export function calcQt9({ large, R, Ra, juedui }) {
  large = Number(large); R = Number(R); Ra = Number(Ra);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const isAbs = juedui !== 'false';
  const Z = ballZ(R, large);
  const xStr = isAbs ? `X${fmt(large)}` : `U${fmt(large)}`;
  const zStr = isAbs ? `Z${fmt(Z)}` : `W${fmt(Z)}`;
  return [
    `( 球头接点9  大径=${large}  R=${R}  Ra=${Ra} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 ${xStr} ${zStr} R${fmt(R)}`,
  ].join('\n');
}

// qt10：复合球头  输入：大径、小径、R
export function calcQt10({ large, small, R, juedui }) {
  large = Number(large); small = Number(small); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const isAbs = juedui !== 'false';
  const Z = ballZ(R, large);
  const xStr = isAbs ? `X${fmt(large)}` : `U${fmt(large)}`;
  const zStr = isAbs ? `Z${fmt(Z)}` : `W${fmt(Z)}`;
  return [
    `( 球头接点10  大径=${large}  小径=${small}  R=${R} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 ${xStr} ${zStr} R${fmt(R)}`,
  ].join('\n');
}

// qt11：球头+直线+球头  输入：大径、小径、长度、R
export function calcQt11({ large, small, long, R, juedui }) {
  large = Number(large); small = Number(small); long = Number(long); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const isAbs = juedui !== 'false';
  const Z1 = ballZ(R, large);
  let curX = 0, curZ = 0;
  const lines = [
    `( 球头接点11  大径=${large}  小径=${small}  长度=${long}  R=${R} )`,
    'G0 X0',
    'G1 Z0 F0.1',
  ];
  const arc1X = isAbs ? `X${fmt(large)}` : `U${fmt(large - curX)}`;
  const arc1Z = isAbs ? `Z${fmt(Z1)}` : `W${fmt(Z1 - curZ)}`;
  lines.push(`G03 ${arc1X} ${arc1Z} R${fmt(R)}`);
  curX = large; curZ = Z1;
  if (!isNaN(long) && long > 0) {
    const nextZ = Z1 - long;
    const lZ = isAbs ? `Z${fmt(nextZ)}` : `W${fmt(-long)}`;
    lines.push(`G1 X${isAbs ? fmt(large) : '0'} ${lZ}`);
    curZ = nextZ;
  }
  if (!isNaN(small) && small > 0) {
    const Z2 = ballZ(R, small);
    const arc2X = isAbs ? `X${fmt(small)}` : `U${fmt(small - curX)}`;
    const arc2Z = isAbs ? `Z${fmt(curZ + Z2)}` : `W${fmt(Z2)}`;
    lines.push(`G02 ${arc2X} ${arc2Z} R${fmt(R)}`);
  }
  return lines.join('\n');
}

// qt12：球头+SR  输入：大径、长度、SR
export function calcQt12({ large, long, SR, juedui }) {
  large = Number(large); long = Number(long); SR = Number(SR);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(SR) || SR <= 0) throw new Error('SR必须为正数');
  const isAbs = juedui !== 'false';
  const Z = ballZ(SR, large);
  let curX = 0, curZ = 0;
  const lines = [
    `( 球头接点12  大径=${large}  长度=${long}  SR=${SR} )`,
    'G0 X0',
    'G1 Z0 F0.1',
  ];
  const xStr = isAbs ? `X${fmt(large)}` : `U${fmt(large)}`;
  const zStr = isAbs ? `Z${fmt(Z)}` : `W${fmt(Z)}`;
  lines.push(`G03 ${xStr} ${zStr} R${fmt(SR)}`);
  curX = large; curZ = Z;
  if (!isNaN(long) && long > 0) {
    const nextZ = Z - long;
    const lZ = isAbs ? `Z${fmt(nextZ)}` : `W${fmt(-long)}`;
    lines.push(`G1 X${isAbs ? fmt(large) : '0'} ${lZ}`);
  }
  return lines.join('\n');
}

// 通用外形/内孔接点
export function calcGenericArc({ large, R, juedui }) {
  large = Number(large); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const isAbs = juedui !== 'false';
  const Z = ballZ(R, large);
  const xStr = isAbs ? `X${fmt(large)}` : `U${fmt(large)}`;
  const zStr = isAbs ? `Z${fmt(Z)}` : `W${fmt(Z)}`;
  return [
    `( 圆弧接点  大径=${large}  R=${R} )`,
    'G0 X0',
    'G1 Z0 F0.1',
    `G03 ${xStr} ${zStr} R${fmt(R)}`,
  ].join('\n');
}

export function calcArcPage(id, inputs) {
  const prefix = id.replace(/\d+$/, '');
  const n = parseInt(id.replace(/\D/g, ''));

  let result;
  if (prefix === 'qt') {
    switch (n) {
      case 1:  result = calcQt1(inputs); break;
      case 2:  result = calcQt2({ ...inputs, mode: inputs.mode || 'ball' }); break;
      case 3:  result = calcQt3(inputs); break;
      case 4:  result = calcQt4(inputs); break;
      case 5:  result = calcQt5(inputs); break;
      case 6:  result = calcQt6(inputs); break;
      case 7:  result = calcQt7(inputs); break;
      case 8:  result = calcQt8(inputs); break;
      case 9:  result = calcQt9(inputs); break;
      case 10: result = calcQt10(inputs); break;
      case 11: result = calcQt11(inputs); break;
      case 12: result = calcQt12(inputs); break;
      default: result = calcGenericArc(inputs);
    }
  } else {
    result = calcGenericArc(inputs);
  }

  // 过滤掉括号注释行，如 ( 球头接点1  大径=50  R=80 )
  return result.split('\n').filter(line => !/^\s*\(.*\)\s*$/.test(line)).join('\n');
}
