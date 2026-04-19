const CalcUtils = {
  degToRad(degrees) { return degrees * Math.PI / 180; },
  radToDeg(radians) { return radians * 180 / Math.PI; },
  roundTo(value, decimals = 4) { return Math.round(value * 10**decimals) / 10**decimals; },
  
  // 度分秒转十进制度
  dmsToDecimal(d, m, s) { return d + m/60 + s/3600; },
  
  // 十进制度转度分秒，返回 { d, m, s }
  decimalToDms(decimal) {
    const d = Math.floor(decimal);
    const mTotal = (decimal - d) * 60;
    const m = Math.floor(mTotal);
    const s = (mTotal - m) * 60;
    return { d, m, s: CalcUtils.roundTo(s, 2) };
  },
  
  // 角度制三角函数
  sinDeg(degrees) { return Math.sin(CalcUtils.degToRad(degrees)); },
  cosDeg(degrees) { return Math.cos(CalcUtils.degToRad(degrees)); },
  tanDeg(degrees) { return Math.tan(CalcUtils.degToRad(degrees)); },
  atan2Deg(y, x) { return CalcUtils.radToDeg(Math.atan2(y, x)); },
  atanDeg(x) { return CalcUtils.radToDeg(Math.atan(x)); },
  asinDeg(x) { return CalcUtils.radToDeg(Math.asin(x)); },
  acosDeg(x) { return CalcUtils.radToDeg(Math.acos(x)); },
};

export default CalcUtils;
