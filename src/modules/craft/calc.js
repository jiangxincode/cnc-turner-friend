// 工艺品宏程序生成函数

function validate(val, name) {
  const v = Number(val);
  if (isNaN(v) || v <= 0) throw new Error(`${name}必须为正数`);
  return v;
}

export function genXinXing({ R, F }) {
  R = validate(R, '半径R'); F = validate(F, '进给速度');
  const lines = [
    `( 心形 R=${R} F=${F} )`,
    `#1=0`,
    `WHILE[#1 LE 360] DO1`,
    `  #2=${R}*[1-SIN[#1]]`,
    `  #3=${R}*COS[#1]`,
    `  G1 X[#2*2] Z#3 F${F}`,
    `  #1=#1+1`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genWuJiaoXing({ R, r, F }) {
  R = validate(R, '外径R'); r = validate(r, '内径r'); F = validate(F, '进给速度');
  const lines = [
    `( 五角星 R=${R} r=${r} F=${F} )`,
    `#1=90`,
    `#2=10`,
    `WHILE[#2 LE 5] DO1`,
    `  #3=R*COS[#1]`,
    `  #4=R*SIN[#1]`,
    `  G1 X[#4*2] Z#3 F${F}`,
    `  #1=#1+36`,
    `  #3=r*COS[#1]`,
    `  #4=r*SIN[#1]`,
    `  G1 X[#4*2] Z#3 F${F}`,
    `  #1=#1+36`,
    `  #2=#2+1`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genDuoBianXing({ n, R, F }) {
  n = validate(n, '边数'); R = validate(R, '外径R'); F = validate(F, '进给速度');
  const angleStep = 360 / n;
  const lines = [
    `( 多边形 n=${n} R=${R} F=${F} )`,
    `#1=0`,
    `#2=${n}`,
    `#3=0`,
    `WHILE[#3 LE #2] DO1`,
    `  #4=${R}*COS[#1]`,
    `  #5=${R}*SIN[#1]`,
    `  G1 X[#5*2] Z#4 F${F}`,
    `  #1=#1+${angleStep}`,
    `  #3=#3+1`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genZidan({ D, L, R, F }) {
  D = validate(D, '直径D'); L = validate(L, '长度L'); R = validate(R, '头部R'); F = validate(F, '进给速度');
  const lines = [
    `( 子弹 D=${D} L=${L} R=${R} F=${F} )`,
    `( 车圆柱段 )`,
    `G1 X${D} Z-${L - R} F${F}`,
    `( 车球头 )`,
    `#1=0`,
    `WHILE[#1 LE 90] DO1`,
    `  #2=${D}/2-${R}+${R}*COS[#1]`,
    `  #3=-[${L}-${R}]-${R}*SIN[#1]+${R}`,
    `  G1 X[#2*2] Z#3 F${F}`,
    `  #1=#1+1`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genHuLu({ D1, D2, d, F }) {
  D1 = validate(D1, '上球径D1'); D2 = validate(D2, '下球径D2'); d = validate(d, '腰径d'); F = validate(F, '进给速度');
  const lines = [
    `( 葫芦 D1=${D1} D2=${D2} d=${d} F=${F} )`,
    `( 上球 )`,
    `#1=0`,
    `WHILE[#1 LE 90] DO1`,
    `  #2=${D1}/2*SIN[#1]`,
    `  #3=${D1}/2*COS[#1]-${D1}/2`,
    `  G1 X[#2*2] Z#3 F${F}`,
    `  #1=#1+1`,
    `END1`,
    `( 腰部 )`,
    `G1 X${d} Z-${D1 / 2 + D2 / 2} F${F}`,
    `( 下球 )`,
    `#1=90`,
    `WHILE[#1 GE 0] DO1`,
    `  #2=${D2}/2*SIN[#1]`,
    `  #3=-${D1 / 2 + D2 / 2}-${D2}/2+${D2}/2*COS[#1]`,
    `  G1 X[#2*2] Z#3 F${F}`,
    `  #1=#1-1`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genTuoLuo({ D, L, F }) {
  D = validate(D, '最大径D'); L = validate(L, '总长L'); F = validate(F, '进给速度');
  const lines = [
    `( 陀螺 D=${D} L=${L} F=${F} )`,
    `#1=0`,
    `WHILE[#1 LE 180] DO1`,
    `  #2=${D}/2*SIN[#1]`,
    `  #3=${L}/2*COS[#1]-${L}/2`,
    `  G1 X[#2*2] Z#3 F${F}`,
    `  #1=#1+1`,
    `END1`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genJiuBei({ D, D2, L, F }) {
  D = validate(D, '杯口径D'); D2 = validate(D2, '杯底径D2'); L = validate(L, '杯高L'); F = validate(F, '进给速度');
  const lines = [
    `( 酒杯 D=${D} D2=${D2} L=${L} F=${F} )`,
    `G0 X${D2} Z2.`,
    `G1 X${D2} Z0 F${F}`,
    `G1 X${D} Z-${L} F${F}`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genJiangBei({ D, D2, L, F }) {
  D = validate(D, '杯口径D'); D2 = validate(D2, '底座径D2'); L = validate(L, '总高L'); F = validate(F, '进给速度');
  const lines = [
    `( 奖杯 D=${D} D2=${D2} L=${L} F=${F} )`,
    `G0 X${D} Z2.`,
    `G1 X${D} Z0 F${F}`,
    `G1 X${D * 0.6} Z-${L * 0.3} F${F}`,
    `G1 X${D * 0.3} Z-${L * 0.7} F${F}`,
    `G1 X${D2} Z-${L} F${F}`,
    `G0 Z50.`,
  ];
  return { code: lines.join('\n') };
}

export function genCraft(typeId, inputs) {
  switch (typeId) {
    case 'xinxing':    return genXinXing(inputs);
    case 'WuJiaoXing': return genWuJiaoXing(inputs);
    case 'DuoBianXing': return genDuoBianXing(inputs);
    case 'zidan1':     return genZidan(inputs);
    case 'ZiDan2':     return genZidan(inputs);
    case 'HuLu1':      return genHuLu(inputs);
    case 'HuLu2':      return genHuLu(inputs);
    case 'tuoluo':     return genTuoLuo(inputs);
    case 'JiuBei':     return genJiuBei(inputs);
    case 'JiangBei':   return genJiangBei(inputs);
    default: throw new Error(`未知工艺品类型: ${typeId}`);
  }
}
