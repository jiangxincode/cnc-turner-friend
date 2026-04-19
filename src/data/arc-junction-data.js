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

// 球头接点图片映射（编号→图片文件名）
const qtDiagrams = {
  1:  'yh1',
  2:  'yh2',
  3:  'qt3',
  4:  'yh4',
  5:  'yh5',
  6:  'yh6',
  7:  'yh7',
  8:  'yh12',
  9:  'yh39',
  10: 'yh52',
  11: 'yh55',
  12: 'qt12',
};

// 生成球头接点配置（qt1-qt12）
export const qtPages = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return {
    id: `qt${n}`,
    title: `球头接点${n}`,
    diagram: `static/yhjd/${qtDiagrams[n]}.png`,
    inputs: commonInputs,
    outputs: commonOutputs,
  };
});

// 外形接点图片映射
const wyDiagrams = {
  1:  'yh8',   2:  'yh16',  3:  'yh9',   4:  'yh10',  5:  'yh13',
  6:  'yh49',  7:  'yh11',  8:  'yh14',  9:  'yh41',  10: 'yh15',
  11: 'yh26',  12: 'yh27',  13: 'yh28',  14: 'yh29',  15: 'yh30',
  16: 'yh31',  17: 'yh32',  18: 'yh33',  19: 'yh53',  20: 'yh45',
  21: 'yh34',  22: 'yh40',  23: 'yh35',  24: 'yh46',  25: 'yh50',
  26: 'yh51',  27: 'yh37',  28: 'yh47',  29: 'yh38',  30: 'wy30',
  31: 'wy31',  32: 'wy32',  33: 'wy33',  34: 'wy34',  35: 'wy35',
  36: 'wy36',
};

// 生成外形接点配置（wy1-wy36）
export const wyPages = Array.from({ length: 36 }, (_, i) => {
  const n = i + 1;
  return {
    id: `wy${n}`,
    title: `外形接点${n}`,
    diagram: `static/yhjd/${wyDiagrams[n]}.png`,
    inputs: commonInputs,
    outputs: commonOutputs,
  };
});

// 内孔接点图片映射（按显示顺序1-21，对应nkNums数组）
// nkNums: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]
const nkDiagrams = [
  'yh17', 'yh18', 'yh20', 'yh19', 'yh21', 'yh44', 'yh22', 'yh23',
  'yh24', 'yh48', 'yh25', 'nk12', 'yh54', 'yh43', 'yh36', 'yh42',
  'yh38', 'nk18', 'nk19', 'nk20', 'nk21',
];

// 生成内孔接点配置（nk1-nk21，共21个）
const nkNums = Array.from({ length: 21 }, (_, i) => i + 1);
export const nkPages = nkNums.map((n, i) => ({
  id: `nk${n}`,
  title: `内孔接点${i + 1}`,
  diagram: `static/yhjd/${nkDiagrams[i]}.png`,
  inputs: commonInputs,
  outputs: commonOutputs,
}));
