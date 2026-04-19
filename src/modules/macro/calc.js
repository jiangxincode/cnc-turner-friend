// src/modules/macro/calc.js

/**
 * 钻深孔宏程序
 * 使用 G83 啄钻循环或自定义宏程序
 */
export function genZuanKong({ D, L, step, F }) {
  D = Number(D); L = Number(L); step = Number(step); F = Number(F);
  if (isNaN(D) || D <= 0) throw new Error('孔径必须为正数');
  if (isNaN(L) || L <= 0) throw new Error('孔深必须为正数');
  if (isNaN(step) || step <= 0) throw new Error('每次进刀量必须为正数');

  const lines = [
    `( 钻深孔 D=${D} L=${L} step=${step} F=${F} )`,
    `#1=0 ( 当前深度 )`,
    `#2=${step} ( 每次进刀量 )`,
    `#3=${L} ( 总深度 )`,
    `G0 Z2.`,
    `WHILE[#1 LT #3] DO1`,
    `  #1=#1+#2`,
    `  IF[#1 GT #3] THEN #1=#3`,
    `  G1 Z-#1 F${F}`,
    `  G0 Z2.`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

/**
 * 车网纹宏程序
 */
export function genWangWen({ D, L, P, depth }) {
  D = Number(D); L = Number(L); P = Number(P); depth = Number(depth);
  if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
  if (isNaN(L) || L <= 0) throw new Error('长度必须为正数');
  if (isNaN(P) || P <= 0) throw new Error('螺距必须为正数');

  const lines = [
    `( 车网纹 D=${D} L=${L} P=${P} depth=${depth} )`,
    `#1=0 ( 角度偏移 )`,
    `#2=180 ( 网纹角度 )`,
    `WHILE[#1 LT #2] DO1`,
    `  G32 Z-${L} F${P} Q#1`,
    `  G0 X${D + 2}`,
    `  G0 Z2.`,
    `  G0 X${D - depth * 2}`,
    `  #1=#1+180`,
    `END1`,
    `G0 X${D + 5}`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

/**
 * 油槽宏程序
 */
export function genYouCao({ D, L, P, depth, num }) {
  D = Number(D); L = Number(L); P = Number(P); depth = Number(depth); num = Number(num);
  if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');

  const angleStep = 360 / num;
  const lines = [
    `( 油槽 D=${D} L=${L} P=${P} depth=${depth} num=${num} )`,
    `#1=0 ( 槽序号 )`,
    `WHILE[#1 LT ${num}] DO1`,
    `  #2=#1*${angleStep} ( 起始角度 )`,
    `  G0 X${D - depth * 2}`,
    `  G32 Z-${L} F${P} Q#2`,
    `  G0 X${D + 2}`,
    `  G0 Z2.`,
    `  #1=#1+1`,
    `END1`,
    `G0 X${D + 5}`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

/**
 * 去半扣宏程序
 */
export function genQuBanKou({ D, P, L }) {
  D = Number(D); P = Number(P); L = Number(L);
  if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
  if (isNaN(P) || P <= 0) throw new Error('螺距必须为正数');

  const lines = [
    `( 去半扣 D=${D} P=${P} L=${L} )`,
    `#1=0 ( 角度偏移 )`,
    `#2=180 ( 半扣角度 )`,
    `G0 X${D + 2} Z2.`,
    `G32 Z-${L} F${P} Q0`,
    `G0 X${D + 5}`,
    `G0 Z2.`,
    `G0 X${D + 2}`,
    `G32 Z-${L} F${P} Q${180 * 1000}`,
    `G0 X${D + 5}`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

/**
 * 斜进刀车锥宏程序
 */
export function genXeiJinDao({ D1, D2, L, F }) {
  D1 = Number(D1); D2 = Number(D2); L = Number(L); F = Number(F);
  if (isNaN(D1) || D1 <= 0) throw new Error('大径必须为正数');
  if (isNaN(D2) || D2 <= 0) throw new Error('小径必须为正数');

  const taper = (D1 - D2) / (2 * L);
  const lines = [
    `( 斜进刀车锥 D1=${D1} D2=${D2} L=${L} F=${F} )`,
    `#1=${D1} ( 当前直径 )`,
    `#2=${D2} ( 目标直径 )`,
    `#3=0.2 ( 每次进刀量 )`,
    `G0 X#1 Z2.`,
    `WHILE[#1 GT #2] DO1`,
    `  #1=#1-#3`,
    `  IF[#1 LT #2] THEN #1=#2`,
    `  #4=#1/2`,
    `  #5=[${D1}/2-#4]/${taper.toFixed(6)}`,
    `  G0 X#1 Z2.`,
    `  G1 Z-#5 F${F}`,
    `  G0 X${D1 + 2}`,
    `  G0 Z2.`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

/**
 * 椭圆宏程序
 */
export function genTuoYuan({ A, B, F }) {
  A = Number(A); B = Number(B); F = Number(F);
  if (isNaN(A) || A <= 0) throw new Error('长半轴必须为正数');
  if (isNaN(B) || B <= 0) throw new Error('短半轴必须为正数');

  const lines = [
    `( 椭圆 A=${A} B=${B} F=${F} )`,
    `#1=0 ( 角度 )`,
    `#2=360 ( 终止角度 )`,
    `#3=1 ( 角度步长 )`,
    `WHILE[#1 LE #2] DO1`,
    `  #4=${B}*SIN[#1] ( X坐标半径 )`,
    `  #5=${A}*COS[#1] ( Z坐标 )`,
    `  G1 X[#4*2] Z#5 F${F}`,
    `  #1=#1+#3`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

/**
 * 根据宏程序类型ID生成代码
 */
export function genMacro(typeId, inputs) {
  switch (typeId) {
    case 'ZuanKong':  return genZuanKong(inputs);
    case 'WangWen':   return genWangWen(inputs);
    case 'WangWenJ':  return genWangWen(inputs);
    case 'YouCao':    return genYouCao(inputs);
    case 'QuBanKou':  return genQuBanKou(inputs);
    case 'XeiJinDao': return genXeiJinDao(inputs);
    case 'TuoYuan':   return genTuoYuan(inputs);
    default: throw new Error(`未知宏程序类型: ${typeId}`);
  }
}
