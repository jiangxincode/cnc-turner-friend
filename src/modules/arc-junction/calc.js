// src/modules/arc-junction/calc.js
import CalcUtils from '../../utils/calc-utils.js';

/**
 * 通用圆弧接点计算
 * 基于圆弧几何关系计算接点坐标
 * @param {Object} inputs - { R, D, Z, A }
 * @returns {Object} - { X, Z_out, angle }
 */
export function calcArcJunction(inputs) {
  const R = Number(inputs.R);
  const D = Number(inputs.D);
  const Z = Number(inputs.Z);
  const A = Number(inputs.A);

  // 验证输入
  if (isNaN(R) || R <= 0) throw new Error('圆弧半径R必须为正数');
  if (isNaN(D) || D <= 0) throw new Error('直径D必须为正数');

  const r = D / 2; // 半径

  let X, Z_out, angle;

  if (!isNaN(A) && A !== 0) {
    // 有角度参数时，按角度计算
    X = CalcUtils.roundTo(2 * R * CalcUtils.sinDeg(A), 4);
    Z_out = CalcUtils.roundTo(R - R * CalcUtils.cosDeg(A) + (isNaN(Z) ? 0 : Z), 4);
    angle = CalcUtils.roundTo(A, 4);
  } else if (!isNaN(Z) && Z !== 0) {
    // 有Z坐标时，计算对应的X坐标
    if (Math.abs(Z) > R) throw new Error('Z坐标超出圆弧范围');
    X = CalcUtils.roundTo(2 * Math.sqrt(R * R - Z * Z), 4);
    Z_out = CalcUtils.roundTo(Z, 4);
    angle = CalcUtils.roundTo(CalcUtils.radToDeg(Math.asin(Math.abs(Z) / R)), 4);
  } else {
    // 默认计算：使用直径D对应的半径
    if (r > R) throw new Error('直径超出圆弧范围');
    Z_out = CalcUtils.roundTo(Math.sqrt(R * R - r * r), 4);
    X = CalcUtils.roundTo(D, 4);
    angle = CalcUtils.roundTo(CalcUtils.radToDeg(Math.asin(r / R)), 4);
  }

  return {
    X: CalcUtils.roundTo(X, 4).toFixed(4),
    Z_out: CalcUtils.roundTo(Z_out, 4).toFixed(4),
    angle: CalcUtils.roundTo(angle, 4).toFixed(4),
  };
}
