import CalcUtils from '../../utils/calc-utils.js';

/**
 * 公制螺纹计算（60°牙型角）
 * 大径 = D
 * 中径 = D - 0.6495 * P
 * 小径（外螺纹）= D - 1.2269 * P
 * 小径（内螺纹）= D - 1.0825 * P
 * 牙深（外螺纹）= 0.6134 * P
 * 牙深（内螺纹）= 0.5413 * P
 */
export function calcMetric({ D, P, type }) {
  D = Number(D); P = Number(P);
  if (isNaN(D) || D <= 0) throw new Error('公称直径必须为正数');
  if (isNaN(P) || P <= 0) throw new Error('螺距必须为正数');

  const major = CalcUtils.roundTo(D, 4);
  const pitch_d = CalcUtils.roundTo(D - 0.6495 * P, 4);
  let minor, depth;
  if (type === '内') {
    minor = CalcUtils.roundTo(D - 1.0825 * P, 4);
    depth = CalcUtils.roundTo(0.5413 * P, 4);
  } else {
    minor = CalcUtils.roundTo(D - 1.2269 * P, 4);
    depth = CalcUtils.roundTo(0.6134 * P, 4);
  }
  return {
    major: major.toFixed(4),
    pitch_d: pitch_d.toFixed(4),
    minor: minor.toFixed(4),
    depth: depth.toFixed(4),
  };
}

/**
 * 英制螺纹计算（55°牙型角，Whitworth）
 * P = 25.4 / TPI（英寸转毫米）
 * 大径 = D * 25.4
 * 中径 = D * 25.4 - 0.6403 * P
 * 小径 = D * 25.4 - 1.2806 * P
 * 牙深 = 0.6403 * P
 */
export function calcInch({ D, TPI, type }) {
  D = Number(D); TPI = Number(TPI);
  if (isNaN(D) || D <= 0) throw new Error('公称直径必须为正数');
  if (isNaN(TPI) || TPI <= 0) throw new Error('每英寸牙数必须为正数');

  const Dmm = D * 25.4;
  const P = 25.4 / TPI;
  const major = CalcUtils.roundTo(Dmm, 4);
  const pitch_d = CalcUtils.roundTo(Dmm - 0.6403 * P, 4);
  const minor = CalcUtils.roundTo(Dmm - 1.2806 * P, 4);
  const depth = CalcUtils.roundTo(0.6403 * P, 4);
  return {
    major: major.toFixed(4),
    pitch_d: pitch_d.toFixed(4),
    minor: minor.toFixed(4),
    depth: depth.toFixed(4),
  };
}

/**
 * 美制螺纹计算（60°牙型角，UNC/UNF）
 * P = 25.4 / TPI
 * 大径 = D * 25.4
 * 中径 = D * 25.4 - 0.6495 * P
 * 小径 = D * 25.4 - 1.2990 * P
 * 牙深 = 0.6495 * P
 */
export function calcUS({ D, TPI, type }) {
  D = Number(D); TPI = Number(TPI);
  if (isNaN(D) || D <= 0) throw new Error('公称直径必须为正数');
  if (isNaN(TPI) || TPI <= 0) throw new Error('每英寸牙数必须为正数');

  const Dmm = D * 25.4;
  const P = 25.4 / TPI;
  const major = CalcUtils.roundTo(Dmm, 4);
  const pitch_d = CalcUtils.roundTo(Dmm - 0.6495 * P, 4);
  const minor = CalcUtils.roundTo(Dmm - 1.2990 * P, 4);
  const depth = CalcUtils.roundTo(0.6495 * P, 4);
  return {
    major: major.toFixed(4),
    pitch_d: pitch_d.toFixed(4),
    minor: minor.toFixed(4),
    depth: depth.toFixed(4),
  };
}

/**
 * T型螺纹计算（梯形螺纹，30°牙型角）
 * 中径 = D - 0.5 * P
 * 小径（外）= D - P
 * 小径（内）= D - P + 0.25
 * 牙深 = 0.5 * P
 */
export function calcTrapezoid({ D, P, type }) {
  D = Number(D); P = Number(P);
  if (isNaN(D) || D <= 0) throw new Error('公称直径必须为正数');
  if (isNaN(P) || P <= 0) throw new Error('螺距必须为正数');

  const major = CalcUtils.roundTo(D, 4);
  const pitch_d = CalcUtils.roundTo(D - 0.5 * P, 4);
  const minor = type === '内'
    ? CalcUtils.roundTo(D - P + 0.25, 4)
    : CalcUtils.roundTo(D - P, 4);
  const depth = CalcUtils.roundTo(0.5 * P, 4);
  return {
    major: major.toFixed(4),
    pitch_d: pitch_d.toFixed(4),
    minor: minor.toFixed(4),
    depth: depth.toFixed(4),
  };
}

/**
 * 根据螺纹类型ID选择计算函数
 */
export function calcThread(typeId, inputs) {
  const inchTypes = ['yingzhi', 'YzhiZ', 'MzhiZ', 'MeiZhiNPTF', 'meizhi', 'meizhiun', 'ShiYouZuanGan'];
  const trapTypes = ['Tluowen', 'TluowenXIN'];

  if (inchTypes.includes(typeId)) {
    return calcInch(inputs);
  } else if (trapTypes.includes(typeId)) {
    return calcTrapezoid(inputs);
  } else {
    return calcMetric(inputs);
  }
}
