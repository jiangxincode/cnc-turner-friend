// src/data/arc-junction-data.js

// 通用输入字段
const commonInputs = [
  { id: 'R', label: '圆弧R', type: 'number', default: 10, placeholder: '圆弧半径' },
  { id: 'D', label: '直径D', type: 'number', default: 20, placeholder: '工件直径' },
  { id: 'Z', label: 'Z坐标', type: 'number', default: 0, placeholder: 'Z轴位置' },
  { id: 'A', label: '角度A', type: 'number', default: 0, placeholder: '角度（度）' },
];

// 通用输出字段
const commonOutputs = [
  { id: 'X', label: 'X坐标' },
  { id: 'Z_out', label: 'Z坐标' },
  { id: 'angle', label: '角度' },
];

// 生成球头接点配置（qt1-qt12）
export const qtPages = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  // 特殊图片处理
  const specialDiagrams = {
    3: 'static/yhjd/qt3.png',
    12: 'static/yhjd/qt12.png',
  };
  return {
    id: `qt${n}`,
    title: `球头接点${n}`,
    diagram: specialDiagrams[n] || `static/yhjd/yh${n}.png`,
    inputs: commonInputs,
    outputs: commonOutputs,
  };
});

// 生成外形接点配置（wy1-wy36）
export const wyPages = Array.from({ length: 36 }, (_, i) => {
  const n = i + 1;
  // wy30-wy36 使用专属图片，其余使用 yh 系列
  const specialDiagrams = {
    30: 'static/yhjd/wy30.png',
    31: 'static/yhjd/wy31.png',
    32: 'static/yhjd/wy32.png',
    33: 'static/yhjd/wy33.png',
    34: 'static/yhjd/wy34.png',
    35: 'static/yhjd/wy35.png',
    36: 'static/yhjd/wy36.png',
  };
  return {
    id: `wy${n}`,
    title: `外形接点${n}`,
    diagram: specialDiagrams[n] || `static/yhjd/yh${n}.png`,
    inputs: commonInputs,
    outputs: commonOutputs,
  };
});

// 生成内形接点配置（nk1-nk16, nk18-nk21，跳过nk17）
const nkNums = [...Array.from({ length: 16 }, (_, i) => i + 1), 18, 19, 20, 21];
export const nkPages = nkNums.map(n => {
  const specialDiagrams = {
    12: 'static/yhjd/nk12.png',
    18: 'static/yhjd/nk18.png',
    19: 'static/yhjd/nk19.png',
    20: 'static/yhjd/nk20.png',
    21: 'static/yhjd/nk21.png',
  };
  return {
    id: `nk${n}`,
    title: `内形接点${n}`,
    diagram: specialDiagrams[n] || `static/yhjd/yh${n}.png`,
    inputs: commonInputs,
    outputs: commonOutputs,
  };
});
