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
// qt3：球头+锥面  输入：大径、小径、角度、角度长、圆弧长、R（任填三项，圆弧长/R至少填一项）
export function calcQt3({ large, small, angle, angleLen, arcLen, R, Ra, tip, juedui, _onCalcValues }) {
  const D  = large    !== '' && large    !== undefined ? Number(large)    : NaN;
  const d  = small    !== '' && small    !== undefined ? Number(small)    : NaN;
  const a  = angle    !== '' && angle    !== undefined ? Number(angle)    : NaN;
  const aL = angleLen !== '' && angleLen !== undefined ? Number(angleLen) : NaN;
  const cL = arcLen   !== '' && arcLen   !== undefined ? Number(arcLen)   : NaN;
  const r  = R        !== '' && R        !== undefined ? Number(R)        : NaN;

  const isAbs = juedui !== 'false';
  const hasRa = Ra !== null && Ra !== undefined && Ra !== '' && !isNaN(Number(Ra)) && Number(Ra) > 0;
  const hasTip = tip !== null && tip !== undefined && tip !== '' && !isNaN(Number(tip)) && Number(tip) > 0;
  const raVal = hasRa ? Number(Ra) : 0;
  const tipVal = hasTip ? Number(tip) : 0;

  // 核心关系：
  // 小径 = 大径 - 2 * 角度长 * tan(角度/2)
  // 圆弧长 = R - sqrt(R² - (小径/2)²)
  let calcD = D, calcD2 = d, calcA = a, calcAL = aL, calcCL = cL, calcR = r;

  // 如果有角度和角度长和大径，可以算小径
  if (!isNaN(calcD) && !isNaN(calcA) && !isNaN(calcAL) && isNaN(calcD2)) {
    const halfAngle = calcA / 2 * Math.PI / 180;
    calcD2 = calcD - 2 * calcAL * Math.tan(halfAngle);
  }
  // 如果有角度和角度长和小径，可以算大径
  if (isNaN(calcD) && !isNaN(calcA) && !isNaN(calcAL) && !isNaN(calcD2)) {
    const halfAngle = calcA / 2 * Math.PI / 180;
    calcD = calcD2 + 2 * calcAL * Math.tan(halfAngle);
  }
  // 如果有大径和小径和角度，可以算角度长
  if (!isNaN(calcD) && !isNaN(calcD2) && !isNaN(calcA) && isNaN(calcAL)) {
    const halfAngle = calcA / 2 * Math.PI / 180;
    calcAL = (calcD - calcD2) / (2 * Math.tan(halfAngle));
  }
  // 如果有大径和小径和角度长，可以算角度
  if (!isNaN(calcD) && !isNaN(calcD2) && isNaN(calcA) && !isNaN(calcAL)) {
    const halfDiff = (calcD - calcD2) / 2;
    calcA = 2 * Math.atan(halfDiff / calcAL) * 180 / Math.PI;
  }

  // 如果有R和小径，可以算圆弧长
  if (!isNaN(calcR) && !isNaN(calcD2) && isNaN(calcCL)) {
    const half = calcD2 / 2;
    if (half > calcR) throw new Error('小径/2 不能大于 R');
    calcCL = calcR - Math.sqrt(calcR * calcR - half * half);
  }
  // 如果有圆弧长和小径，可以算R
  if (isNaN(calcR) && !isNaN(calcD2) && !isNaN(calcCL)) {
    const half = calcD2 / 2;
    // R - sqrt(R²-h²) = cL → R = (h² + cL²) / (2*cL)
    calcR = (half * half + calcCL * calcCL) / (2 * calcCL);
  }

  // 验证
  if (isNaN(calcD) || calcD <= 0) throw new Error('无法计算大径，请检查输入');
  if (isNaN(calcD2) || calcD2 <= 0) throw new Error('无法计算小径，请检查输入');
  if (isNaN(calcR) || calcR <= 0) throw new Error('无法计算R，请检查输入');
  if (isNaN(calcCL) || calcCL <= 0) throw new Error('无法计算圆弧长，请检查输入');
  if (isNaN(calcAL)) calcAL = 0;

  // 回传计算出的值
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ large: calcD, small: calcD2, angle: calcA, angleLen: calcAL, arcLen: calcCL, R: calcR });
  }

  const lines = [];
  lines.push(`( 球头接点3  大径=${calcD}  角度=${calcA}°  R=${calcR} )`);
  lines.push('G0 X0');
  lines.push('G1 Z0 F0.1');

  // 圆弧段：从(0,0)到(小径, -圆弧长)
  if (isAbs) {
    lines.push(`G03 X${fmt(calcD2)} Z${fmt(-calcCL)} R${fmt(calcR)}`);
  } else {
    lines.push(`G03 U${fmt(calcD2)} W${fmt(-calcCL)} R${fmt(calcR)}`);
  }

  // 锥面直线段：从(小径, -圆弧长)到(大径, -(圆弧长+角度长))
  if (calcAL > 0) {
    const endZ = -(calcCL + calcAL);
    if (isAbs) {
      lines.push(`G1 X${fmt(calcD)} Z${fmt(endZ)}`);
    } else {
      lines.push(`G1 U${fmt(calcD - calcD2)} W${fmt(-calcAL)}`);
    }
  }

  return lines.join('\n');
}

// qt4：球头接点4  输入：直径D、R，可选长度（计算回填）、Ra、刀尖补偿、坐标系
// 计算逻辑：L = R + sqrt(R² - (D/2)²)
// 输出两段G03圆弧：从顶部到赤道，从赤道到底部
export function calcQt4({ large, R, long, Ra, tip, juedui, _onCalcValues }) {
  const D = large !== '' && large !== undefined ? Number(large) : NaN;
  const r = R     !== '' && R     !== undefined ? Number(R)     : NaN;

  if (isNaN(r) || r <= 0) throw new Error('R必须为正数');
  if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
  if (D / 2 > r) throw new Error('直径/2 不能大于 R');

  const isAbs = juedui !== 'false';
  const hasRa = Ra !== null && Ra !== undefined && Ra !== '' && !isNaN(Number(Ra)) && Number(Ra) > 0;
  const hasTip = tip !== null && tip !== undefined && tip !== '' && !isNaN(Number(tip)) && Number(tip) > 0;
  const raVal = hasRa ? Number(Ra) : 0;
  const tipVal = hasTip ? Number(tip) : 0;

  // L = R + sqrt(R² - (D/2)²)
  const halfD = D / 2;
  const calcL = r + Math.sqrt(r * r - halfD * halfD);

  // 回填长度
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ long: calcL });
  }

  // 赤道点：X = 2R（直径值），Z = -R
  const eqX = 2 * r;
  const eqZ = -r;
  // 底部终点：X = D, Z = -L
  const endX = D;
  const endZ = -calcL;

  const lines = [];
  lines.push(`( 球头接点4  直径=${D}  R=${r} )`);
  lines.push('G0 X0');
  lines.push('G1 Z0 F0.1');

  if (isAbs) {
    lines.push(`G03 X${fmt(eqX)} Z${fmt(eqZ)} R${fmt(r)}`);
    lines.push(`G03 X${fmt(endX)} Z${fmt(endZ)} R${fmt(r)}`);
  } else {
    lines.push(`G03 U${fmt(eqX)} W${fmt(eqZ)} R${fmt(r)}`);
    lines.push(`G03 U${fmt(endX - eqX)} W${fmt(endZ - eqZ)} R${fmt(r)}`);
  }

  return lines.join('\n');
}

// qt5：球头+Ra过渡+锥面  输入：大径(直径)、角度(全锥角)、长度1、R、Ra
// 可选输入：小径、长度2、刀尖补偿、坐标系
// 几何模型：大R圆弧 → Ra过渡圆弧 → 锥面直线
export function calcQt5({ large, small, angle, long1, long2, R, Ra, tip, juedui, _onCalcValues }) {
  const D  = large !== '' && large !== undefined ? Number(large) : NaN;
  const a  = angle !== '' && angle !== undefined ? Number(angle) : NaN;
  const L1 = long1 !== '' && long1 !== undefined ? Number(long1) : NaN;
  const r  = R     !== '' && R     !== undefined ? Number(R)     : NaN;
  const ra = Ra    !== '' && Ra    !== undefined ? Number(Ra)    : NaN;

  if (isNaN(D) || D <= 0) throw new Error('大径必须为正数');
  if (isNaN(a) || a <= 0) throw new Error('角度必须为正数');
  if (isNaN(L1) || L1 <= 0) throw new Error('长度1必须为正数');
  if (isNaN(r) || r <= 0) throw new Error('R必须为正数');
  if (isNaN(ra) || ra <= 0) throw new Error('Ra必须为正数');

  const isAbs = juedui !== 'false';
  const hasTip = tip !== null && tip !== undefined && tip !== '' && !isNaN(Number(tip)) && Number(tip) > 0;
  const tipVal = hasTip ? Number(tip) : 0;

  // 半锥角（弧度）
  const halfA = a / 2 * Math.PI / 180;
  const sinA = Math.sin(halfA);
  const cosA = Math.cos(halfA);
  const tanA = Math.tan(halfA);

  // ---- Ra 圆心求解 ----
  // 大R圆弧圆心 O = (0, -R)
  // 锥面直线过终点 (D/2, -L1)，方向 (sinA, -cosA)
  // k = D/2 + (R - L1)*tan(α/2) + Ra/cos(α/2)
  const k = D / 2 + (r - L1) * tanA + ra / cosA;

  // 外切方程代入得二次方程：u²/cos²(α/2) - 2k*tan(α/2)*u + k² - (R+Ra)² = 0
  // 判别式：disc = (R+Ra)²/cos²(α/2) - k²
  const sumR = r + ra;
  const disc = sumR * sumR / (cosA * cosA) - k * k;
  if (disc < 0) throw new Error('无解：判别式小于0，请检查输入参数');

  // u = cos²(α/2) * (k*tan(α/2) - sqrt(disc))  取较小解
  const u = cosA * cosA * (k * tanA - Math.sqrt(disc));
  const Cz = u - r;
  const Cx = k - u * tanA;

  // ---- 切点（大R圆弧上）----
  // 方向 = (Cx, Cz+R)，归一化后乘以 R
  const dist = Math.sqrt(Cx * Cx + (Cz + r) * (Cz + r));
  const Tx = r * Cx / dist;
  const Tz = -r + r * (Cz + r) / dist;
  const tangentDia = 2 * Tx; // 切点直径值

  // ---- Ra 终点（锥面直线上的垂足）----
  // v = (Cx - D/2, Cz + L1)
  // t = v · (sinA, -cosA)
  const vx = Cx - D / 2;
  const vz = Cz + L1;
  const t = vx * sinA + vz * (-cosA);
  const Fx = D / 2 + t * sinA;
  const Fz = -L1 + t * (-cosA);
  const raEndDia = 2 * Fx; // Ra终点直径值

  // 小径 = Ra终点直径值
  const calcSmall = raEndDia;

  // 回传计算出的值
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ small: calcSmall, N: 2 * (Cx - ra), M: Math.abs(Cz) });
  }

  // ---- 赤道点 ----
  const eqX = 2 * r;  // 赤道直径值
  const eqZ = -r;

  // ---- G代码生成 ----
  const lines = [];
  lines.push(`( 球头接点5  大径=${D}  角度=${a}°  长度=${L1}  R=${r}  Ra=${ra} )`);
  lines.push('G0 X0');
  lines.push('G1 Z0 F0.1');

  if (isAbs) {
    // 绝对坐标 X/Z
    lines.push(`G03 X${fmt(eqX)} Z${fmt(eqZ)} R${fmt(r)}`);
    lines.push(`G03 X${fmt(tangentDia)} Z${fmt(Tz)} R${fmt(r)}`);
    lines.push(`G02 X${fmt(raEndDia)} Z${fmt(Fz)} R${fmt(ra)}`);
    lines.push(`G1 X${fmt(D)} Z${fmt(-L1)}`);
  } else {
    // 相对坐标 U/W，计算增量
    let curX = 0, curZ = 0;

    // 大R圆弧到赤道
    lines.push(`G03 U${fmt(eqX - curX)} W${fmt(eqZ - curZ)} R${fmt(r)}`);
    curX = eqX; curZ = eqZ;

    // 大R圆弧继续到切点
    lines.push(`G03 U${fmt(tangentDia - curX)} W${fmt(Tz - curZ)} R${fmt(r)}`);
    curX = tangentDia; curZ = Tz;

    // Ra过渡圆弧（顺时针 G02）
    lines.push(`G02 U${fmt(raEndDia - curX)} W${fmt(Fz - curZ)} R${fmt(ra)}`);
    curX = raEndDia; curZ = Fz;

    // 锥面直线到终点
    lines.push(`G1 U${fmt(D - curX)} W${fmt(-L1 - curZ)}`);
  }

  return lines.join('\n');
}

// qt6：葫芦形球头  输入：大径、小径、角度(全锥角)、长度1、长度2、r(过渡圆弧)、R
// 几何模型：起点(D_start,0) → 大R圆弧到赤道 → 大R圆弧到切点 → r过渡到最小径 → r过渡到直线切点 → 锥面直线到终点
// Oz = |L1 - L2 - sqrt(R² - (小径/2)²)|
// D_start = 2*sqrt(R² - Oz²)
// 大R圆弧圆心 = (0, -Oz)
export function calcQt6({ large, small, angle, long1, long2, rr, R, zStart, tip, juedui, _onCalcValues }) {
  const D_large = large !== '' && large !== undefined ? Number(large) : NaN;
  const d_small = small !== '' && small !== undefined ? Number(small) : NaN;
  const a       = angle !== '' && angle !== undefined ? Number(angle) : NaN;
  const L1      = long1 !== '' && long1 !== undefined ? Number(long1) : NaN;
  const L2      = long2 !== '' && long2 !== undefined ? Number(long2) : NaN;
  const r       = rr    !== '' && rr    !== undefined ? Number(rr)    : NaN;
  const Rv      = R     !== '' && R     !== undefined ? Number(R)     : NaN;
  const z0      = zStart !== '' && zStart !== undefined ? Number(zStart) : 0;

  if (isNaN(D_large) || D_large <= 0) throw new Error('大径必须为正数');
  if (isNaN(d_small) || d_small <= 0) throw new Error('小径必须为正数');
  if (isNaN(a) || a <= 0) throw new Error('角度必须为正数');
  if (isNaN(L1) || L1 <= 0) throw new Error('长度1必须为正数');
  if (isNaN(L2) || L2 <= 0) throw new Error('长度2必须为正数');
  if (isNaN(r) || r <= 0) throw new Error('r必须为正数');
  if (isNaN(Rv) || Rv <= 0) throw new Error('R必须为正数');

  const isAbs = juedui !== 'false';
  const halfA = a / 2 * Math.PI / 180;
  const sinA = Math.sin(halfA), cosA = Math.cos(halfA), tanA = Math.tan(halfA);

  // 大R圆弧圆心Z偏移
  const sqrtVal = Math.sqrt(Rv * Rv - (d_small / 2) * (d_small / 2));
  const Oz = Math.abs(L1 - L2 - sqrtVal);

  // 起点直径
  const startHalf = Math.sqrt(Rv * Rv - Oz * Oz);
  const D_start = 2 * startHalf;

  // 大R圆弧圆心 O = (0, -Oz)
  // 赤道点 (Rv, -Oz)，直径 = 2*Rv

  // r过渡圆弧圆心求解（和qt5相同的方法，但圆心偏移为Oz而非R）
  const k = D_large / 2 + (Oz - L1) * tanA + r / cosA;
  const sumR = Rv + r;
  const disc = sumR * sumR / (cosA * cosA) - k * k;
  if (disc < 0) throw new Error('无解：判别式小于0，请检查输入参数');

  const u = cosA * cosA * (k * tanA - Math.sqrt(disc));
  const Cz = u - Oz;
  const Cx = k - u * tanA;

  // 切点（大R圆弧上）
  const dx = Cx, dz = Cz + Oz;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const Tx = Rv * dx / dist;
  const Tz = -Oz + Rv * dz / dist;

  // r过渡最小X点（实际小径）
  const actualSmall = 2 * (Cx - r);
  const minXz = Cz; // 最小X点Z = r圆心Z

  // r终点（直线上的垂足）
  const vx = Cx - D_large / 2, vz = Cz + L1;
  const t2 = vx * sinA + vz * (-cosA);
  const Fx = D_large / 2 + t2 * sinA;
  const Fz = -L1 + t2 * (-cosA);

  // 回传计算值
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ D: D_start, actualSmall, Oz });
  }

  // G代码生成
  const lines = [];
  lines.push(`( 球头接点6  大径=${D_large}  小径=${d_small}  R=${Rv} )`);

  if (isAbs) {
    lines.push(`G0 X${fmt(D_start)}`);
    lines.push(`G1 Z${fmt(z0)}`);
    lines.push(`G03 X${fmt(2 * Rv)} Z${fmt(z0 - Oz)} R${fmt(Rv)}`);
    lines.push(`X${fmt(2 * Tx)} Z${fmt(z0 + Tz)} R${fmt(Rv)}`);
    lines.push(`G02 X${fmt(actualSmall)} Z${fmt(z0 + minXz)} R${fmt(r)}`);
    lines.push(`X${fmt(2 * Fx)} Z${fmt(z0 + Fz)} R${fmt(r)}`);
    lines.push(`G1 X${fmt(D_large)} Z${fmt(z0 - L1)}`);
  } else {
    let curX = D_start, curZ = z0;
    lines.push(`G0 X${fmt(D_start)}`);
    lines.push(`G1 Z${fmt(z0)}`);

    const eqX = 2 * Rv, eqZ = z0 - Oz;
    lines.push(`G03 U${fmt(eqX - curX)} W${fmt(eqZ - curZ)} R${fmt(Rv)}`);
    curX = eqX; curZ = eqZ;

    const tpX = 2 * Tx, tpZ = z0 + Tz;
    lines.push(`U${fmt(tpX - curX)} W${fmt(tpZ - curZ)} R${fmt(Rv)}`);
    curX = tpX; curZ = tpZ;

    const msX = actualSmall, msZ = z0 + minXz;
    lines.push(`G02 U${fmt(msX - curX)} W${fmt(msZ - curZ)} R${fmt(r)}`);
    curX = msX; curZ = msZ;

    const feX = 2 * Fx, feZ = z0 + Fz;
    lines.push(`U${fmt(feX - curX)} W${fmt(feZ - curZ)} R${fmt(r)}`);
    curX = feX; curZ = feZ;

    lines.push(`G1 U${fmt(D_large - curX)} W${fmt(z0 - L1 - curZ)}`);
  }

  return lines.join('\n');
}

// qt7：球头+锥面  输入：大径、角度（全锥角）、Ra、可选长度（计算回填）、Rb、刀尖补偿、坐标系
// Ra圆弧圆心在(0, -Ra)，切点 Tx = Ra*cos(angle/2), Tz = Ra*(sin(angle/2)-1)
// 直线从切点到(D/2, -L)，L = |Tz| + (D/2 - Tx) * cos(angle/2) / sin(angle/2)
export function calcQt7({ large, angle, long, Ra, Rb, tip, juedui, _onCalcValues }) {
  const D  = large !== '' && large !== undefined ? Number(large) : NaN;
  const a  = angle !== '' && angle !== undefined ? Number(angle) : NaN;
  const r  = Ra    !== '' && Ra    !== undefined ? Number(Ra)    : NaN;

  if (isNaN(r) || r <= 0) throw new Error('Ra必须为正数');
  if (isNaN(a) || a <= 0 || a >= 180) throw new Error('角度必须在0~180之间');
  if (isNaN(D) || D <= 0) throw new Error('大径必须为正数');

  const isAbs = juedui !== 'false';
  const hasRb = Rb !== null && Rb !== undefined && Rb !== '' && !isNaN(Number(Rb)) && Number(Rb) > 0;
  const hasTip = tip !== null && tip !== undefined && tip !== '' && !isNaN(Number(tip)) && Number(tip) > 0;
  const rbVal = hasRb ? Number(Rb) : 0;
  const tipVal = hasTip ? Number(tip) : 0;

  // 半锥角（弧度）
  const halfA = (a / 2) * Math.PI / 180;
  const sinA = Math.sin(halfA);
  const cosA = Math.cos(halfA);

  // Ra圆弧切点（半径坐标）
  const Tx = r * cosA;
  const Tz = r * (sinA - 1); // 负值

  // 长度 L = |Tz| + (D/2 - Tx) * cos(halfA) / sin(halfA)
  const calcL = Math.abs(Tz) + (D / 2 - Tx) * cosA / sinA;

  if (calcL <= 0) throw new Error('计算长度无效，请检查参数');

  // 回填大径和长度
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ large: D, long: calcL });
  }

  const lines = [];
  lines.push(`( 球头接点7  大径=${D}  角度=${a}°  Ra=${r} )`);
  lines.push('G0 X0');
  lines.push('G1 Z0 F0.1');

  // 圆弧段：从(0,0)到切点(2*Tx, Tz)
  const arcEndX = 2 * Tx;  // 直径值
  const arcEndZ = Tz;

  if (isAbs) {
    lines.push(`G03 X${fmt(arcEndX)} Z${fmt(arcEndZ)} R${fmt(r)}`);
    lines.push(`G1 X${fmt(D)} Z${fmt(-calcL)}`);
  } else {
    lines.push(`G03 U${fmt(arcEndX)} W${fmt(arcEndZ)} R${fmt(r)}`);
    lines.push(`G1 U${fmt(D - arcEndX)} W${fmt(-calcL - arcEndZ)}`);
  }

  return lines.join('\n');
}

// qt8：内切两圆弧  输入：大径D、R（大圆弧）、r（小圆弧）、可选长度（计算回填）、刀尖补偿、坐标系
// sinθ = (R - D/2) / (R - r), cosθ = sqrt(1 - sinθ²)
// L = r + (R-r)*cosθ
// 切点 Tx = r*sinθ, Tz = -r + r*cosθ
// 输出两段G03：小R圆弧 + 大R圆弧
export function calcQt8({ large, long, R, r, tip, juedui, _onCalcValues }) {
  const D    = large !== '' && large !== undefined ? Number(large) : NaN;
  const bigR = R     !== '' && R     !== undefined ? Number(R)     : NaN;
  const smR  = r     !== '' && r     !== undefined ? Number(r)     : NaN;

  if (isNaN(bigR) || bigR <= 0) throw new Error('R必须为正数');
  if (isNaN(smR) || smR <= 0) throw new Error('小R必须为正数');
  if (isNaN(D) || D <= 0) throw new Error('大径必须为正数');
  if (bigR <= smR) throw new Error('R必须大于小R');
  if (D / 2 >= bigR) throw new Error('大径/2 必须小于 R');

  const isAbs = juedui !== 'false';
  const hasTip = tip !== null && tip !== undefined && tip !== '' && !isNaN(Number(tip)) && Number(tip) > 0;
  const tipVal = hasTip ? Number(tip) : 0;

  // sinθ = (R - D/2) / (R - r)
  const sinTheta = (bigR - D / 2) / (bigR - smR);
  if (Math.abs(sinTheta) > 1) throw new Error('参数不合法，无法计算角度');
  const cosTheta = Math.sqrt(1 - sinTheta * sinTheta);

  // L = r + (R - r) * cosθ
  const calcL = smR + (bigR - smR) * cosTheta;

  // 回填长度
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ long: calcL });
  }

  // 切点（半径坐标）
  const TxR = smR * sinTheta;       // 半径值
  const TxD = 2 * TxR;              // 直径值
  const TzVal = -smR + smR * cosTheta; // Z坐标

  // 终点
  const endX = D;
  const endZ = -calcL;

  const lines = [];
  lines.push(`( 球头接点8  大径=${D}  R=${bigR}  小R=${smR} )`);
  lines.push('G0 X0');
  lines.push('G1 Z0 F0.1');

  if (isAbs) {
    lines.push(`G03 X${fmt(TxD)} Z${fmt(TzVal)} R${fmt(smR)}`);
    lines.push(`G03 X${fmt(endX)} Z${fmt(endZ)} R${fmt(bigR)}`);
  } else {
    lines.push(`G03 U${fmt(TxD)} W${fmt(TzVal)} R${fmt(smR)}`);
    lines.push(`G03 U${fmt(endX - TxD)} W${fmt(endZ - TzVal)} R${fmt(bigR)}`);
  }

  return lines.join('\n');
}

// qt9：球头+小R过渡  输入：大径、R、小R(Ra)
// 几何：大R圆弧从(0,0)到切点，小R过渡圆弧(G02)从切点到终点
// 大R圆心(0,-R)，小R圆心在大R圆心到切点方向延伸R+Ra处
// 终点在小R圆弧最低点（切线水平）
// 长度 = R - sqrt(R² - (D/2)²)
// cosθ = 1 - 长度/(R+Ra)
export function calcQt9({ large, R, Ra, long, tip, juedui, _onCalcValues }) {
  const D  = large !== '' && large !== undefined ? Number(large) : NaN;
  const Rv = R     !== '' && R     !== undefined ? Number(R)     : NaN;
  const ra = Ra    !== '' && Ra    !== undefined ? Number(Ra)    : NaN;

  if (isNaN(Rv) || Rv <= 0) throw new Error('R必须为正数');
  if (isNaN(ra) || ra <= 0) throw new Error('小R必须为正数');
  if (isNaN(D) || D <= 0) throw new Error('大径必须为正数');
  if (D / 2 > Rv) throw new Error('大径/2 不能大于 R');

  const isAbs = juedui !== 'false';

  // 长度 = R - sqrt(R² - (D/2)²)
  const calcL = Rv - Math.sqrt(Rv * Rv - (D / 2) * (D / 2));

  // cosθ, sinθ
  const cosTheta = 1 - calcL / (Rv + ra);
  const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

  // 切点（大R圆弧上）
  const Tx = Rv * sinTheta;
  const Tz = -Rv + Rv * cosTheta;

  // 小R圆心
  const Cx = (Rv + ra) * sinTheta;
  const Cz = -Rv + (Rv + ra) * cosTheta;

  // 终点（小R圆弧最低点）
  const endX = Cx;
  const endZ = Cz - ra;

  // 回填长度
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ long: calcL });
  }

  const lines = [];
  lines.push(`( 球头接点9  大径=${D}  R=${Rv}  小R=${ra} )`);
  lines.push('G0 X0');
  lines.push('G1 Z0');

  if (isAbs) {
    lines.push(`G3 X${fmt(2 * Tx)} Z${fmt(Tz)} R${fmt(Rv)}`);
    lines.push(`G2 X${fmt(2 * endX)} Z${fmt(endZ)} R${fmt(ra)}`);
  } else {
    lines.push(`G3 U${fmt(2 * Tx)} W${fmt(Tz)} R${fmt(Rv)}`);
    lines.push(`G2 U${fmt(2 * (endX - Tx))} W${fmt(endZ - Tz)} R${fmt(ra)}`);
  }

  return lines.join('\n');
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

// qt11：球头+锥面  输入：大径、小径、长度、R
// 几何：大R圆弧从(0,0)到赤道(大径/2,-R)再到切点，然后直线到(小径/2,-长度)
// 切点处大R圆弧切线=直线方向
// 角度=全锥角=2*atan((切点X-小径/2)/(长度+切点Z))
export function calcQt11({ large, small, angle, long, R, Ra, tip, juedui, _onCalcValues }) {
  const D  = large !== '' && large !== undefined ? Number(large) : NaN;
  const d  = small !== '' && small !== undefined ? Number(small) : NaN;
  const L  = long  !== '' && long  !== undefined ? Number(long)  : NaN;
  const Rv = R     !== '' && R     !== undefined ? Number(R)     : NaN;

  if (isNaN(Rv) || Rv <= 0) throw new Error('R必须为正数');
  if (isNaN(D) || D <= 0) throw new Error('大径必须为正数');
  if (isNaN(d) || d <= 0) throw new Error('小径必须为正数');
  if (isNaN(L) || L <= 0) throw new Error('长度必须为正数');
  if (D / 2 > Rv) throw new Error('大径/2 不能大于 R');

  const isAbs = juedui !== 'false';

  // 数值求解切点：大R圆弧上切线方向=直线方向
  // 设 u = Tz+R（切点相对圆心的Z偏移）
  // Tx^2+u^2=R^2, Tx=sqrt(R^2-u^2)
  // 切线方向 ∝ (-u, Tx)
  // 直线方向 ∝ (d/2-Tx, -L-Tz) = (d/2-Tx, -L+R-u)
  // 平行条件：-u*(-L+R-u) = Tx*(d/2-Tx)
  // u*(L-R+u) = Tx*(d/2-Tx)
  let bestErr = Infinity, bestU = 0;
  for (let u = -Rv; u < 0; u += 0.0001) {
    const Tx2 = Rv * Rv - u * u;
    if (Tx2 < 0) continue;
    const Tx = Math.sqrt(Tx2);
    const lhs = u * (L - Rv + u);
    const rhs = Tx * (d / 2 - Tx);
    const err = Math.abs(lhs - rhs);
    if (err < bestErr) { bestErr = err; bestU = u; }
  }

  const Tx = Math.sqrt(Rv * Rv - bestU * bestU);
  const Tz = bestU - Rv;

  // 角度 = 2*atan((Tx-d/2)/(L+Tz))
  const calcAngle = 2 * Math.atan((Tx - d / 2) / (L + Tz)) * 180 / Math.PI;

  // 回填角度和大径
  if (typeof _onCalcValues === 'function') {
    _onCalcValues({ angle: calcAngle, large: D });
  }

  const lines = [];
  lines.push(`( 球头接点11  大径=${D}  小径=${d}  长度=${L}  R=${Rv} )`);

  if (isAbs) {
    lines.push('G0 X-0');
    lines.push('G1 Z0 F0.05');
    lines.push(`G3 X${fmt(D)} Z${fmt(-Rv)} R${fmt(Rv)}`);
    lines.push(`X${fmt(2 * Tx)} Z${fmt(Tz)} R${fmt(Rv)}`);
    lines.push(`G1 X${fmt(d)} Z${fmt(-L)}`);
  } else {
    let curX = 0, curZ = 0;
    lines.push('G0 X-0');
    lines.push('G1 Z0 F0.05');
    lines.push(`G3 U${fmt(D)} W${fmt(-Rv)} R${fmt(Rv)}`);
    curX = D; curZ = -Rv;
    lines.push(`U${fmt(2 * Tx - curX)} W${fmt(Tz - curZ)} R${fmt(Rv)}`);
    curX = 2 * Tx; curZ = Tz;
    lines.push(`G1 U${fmt(d - curX)} W${fmt(-L - curZ)}`);
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
