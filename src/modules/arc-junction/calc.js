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

// qt2：球头+过渡  输入：大径、R（小径/长度可选）
export function calcQt2({ large, R, small, long }) {
  large = Number(large); R = Number(R);
  if (isNaN(large) || large <= 0) throw new Error('大径必须为正数');
  if (isNaN(R) || R <= 0) throw new Error('R必须为正数');
  const Z = fmt(ballZ(R, large));
  const lines = [
    `( 球头接点2  大径=${large}  R=${R} )`,
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

  if (prefix === 'qt') {
    switch (n) {
      case 1:  return calcQt1(inputs);
      case 2:  return calcQt2(inputs);
      case 3:  return calcQt3(inputs);
      case 4:  return calcQt4(inputs);
      case 5:  return calcQt5(inputs);
      case 6:  return calcQt6(inputs);
      case 7:  return calcQt7(inputs);
      case 8:  return calcQt8(inputs);
      case 9:  return calcQt9(inputs);
      case 10: return calcQt10(inputs);
      case 11: return calcQt11(inputs);
      case 12: return calcQt12(inputs);
    }
  }
  return calcGenericArc(inputs);
}
