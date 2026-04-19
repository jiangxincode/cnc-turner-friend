// 各种槽计算配置数据
import CalcUtils from '../utils/calc-utils.js';

// 通用输出字段
const coordOutputs = [
  { id: 'X_start', label: '起点X坐标' },
  { id: 'Z_start', label: '起点Z坐标' },
  { id: 'X_end',   label: '终点X坐标' },
  { id: 'Z_end',   label: '终点Z坐标' },
  { id: 'depth',   label: '槽深' },
];

// 外圆槽（wyc1-wyc3）
export const wycPages = [
  {
    id: 'wyc1',
    title: '外圆槽1（矩形槽）',
    diagram: 'static/cao/wyc1.svg',
    inputs: [
      { id: 'D',  label: '外径D(mm)',  type: 'number', default: 50 },
      { id: 'W',  label: '槽宽W(mm)',  type: 'number', default: 5 },
      { id: 'dep', label: '槽深(mm)', type: 'number', default: 3 },
      { id: 'Z',  label: 'Z位置(mm)', type: 'number', default: -20 },
    ],
    outputs: coordOutputs,
    calculate({ D, W, dep, Z }) {
      D = Number(D); W = Number(W); dep = Number(dep); Z = Number(Z);
      if ([D, W, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D, 4);
      const Z_start = CalcUtils.roundTo(Z, 4);
      const X_end = CalcUtils.roundTo(D - dep * 2, 4);
      const Z_end = CalcUtils.roundTo(Z - W, 4);
      return {
        X_start: X_start.toFixed(4),
        Z_start: Z_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_end: Z_end.toFixed(4),
        depth: dep.toFixed(4),
      };
    },
  },
  {
    id: 'wyc2',
    title: '外圆槽2（V形槽）',
    diagram: 'static/cao/wyc2.svg',
    inputs: [
      { id: 'D',   label: '外径D(mm)',  type: 'number', default: 50 },
      { id: 'W',   label: '槽口宽W(mm)', type: 'number', default: 8 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 4 },
      { id: 'Z',   label: 'Z位置(mm)', type: 'number', default: -20 },
    ],
    outputs: coordOutputs,
    calculate({ D, W, dep, Z }) {
      D = Number(D); W = Number(W); dep = Number(dep); Z = Number(Z);
      if ([D, W, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D, 4);
      const Z_start = CalcUtils.roundTo(Z, 4);
      const X_end = CalcUtils.roundTo(D - dep * 2, 4);
      const Z_end = CalcUtils.roundTo(Z - W / 2, 4);
      return {
        X_start: X_start.toFixed(4),
        Z_start: Z_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_end: Z_end.toFixed(4),
        depth: dep.toFixed(4),
      };
    },
  },
  {
    id: 'wyc3',
    title: '外圆槽3（圆弧槽）',
    diagram: 'static/cao/wyc3.svg',
    inputs: [
      { id: 'D',  label: '外径D(mm)',  type: 'number', default: 50 },
      { id: 'R',  label: '圆弧R(mm)',  type: 'number', default: 5 },
      { id: 'Z',  label: 'Z位置(mm)', type: 'number', default: -20 },
    ],
    outputs: [
      { id: 'X_center', label: '圆心X坐标' },
      { id: 'Z_center', label: '圆心Z坐标' },
      { id: 'X_start',  label: '起点X坐标' },
      { id: 'depth',    label: '槽深' },
    ],
    calculate({ D, R, Z }) {
      D = Number(D); R = Number(R); Z = Number(Z);
      if ([D, R].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_center = CalcUtils.roundTo(D, 4);
      const Z_center = CalcUtils.roundTo(Z, 4);
      const X_start = CalcUtils.roundTo(D - R * 2, 4);
      return {
        X_center: X_center.toFixed(4),
        Z_center: Z_center.toFixed(4),
        X_start: X_start.toFixed(4),
        depth: R.toFixed(4),
      };
    },
  },
];

// 内孔槽（nkc1-nkc2）
export const nkcPages = [
  {
    id: 'nkc1',
    title: '内孔槽1（矩形槽）',
    diagram: 'static/cao/nkc1.svg',
    inputs: [
      { id: 'D',   label: '内径D(mm)',  type: 'number', default: 30 },
      { id: 'W',   label: '槽宽W(mm)',  type: 'number', default: 5 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 2 },
      { id: 'Z',   label: 'Z位置(mm)', type: 'number', default: -15 },
    ],
    outputs: coordOutputs,
    calculate({ D, W, dep, Z }) {
      D = Number(D); W = Number(W); dep = Number(dep); Z = Number(Z);
      if ([D, W, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D, 4);
      const Z_start = CalcUtils.roundTo(Z, 4);
      const X_end = CalcUtils.roundTo(D + dep * 2, 4);
      const Z_end = CalcUtils.roundTo(Z - W, 4);
      return {
        X_start: X_start.toFixed(4),
        Z_start: Z_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_end: Z_end.toFixed(4),
        depth: dep.toFixed(4),
      };
    },
  },
  {
    id: 'nkc2',
    title: '内孔槽2（V形槽）',
    diagram: 'static/cao/nkc2.svg',
    inputs: [
      { id: 'D',   label: '内径D(mm)',  type: 'number', default: 30 },
      { id: 'W',   label: '槽口宽W(mm)', type: 'number', default: 8 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 3 },
      { id: 'Z',   label: 'Z位置(mm)', type: 'number', default: -15 },
    ],
    outputs: coordOutputs,
    calculate({ D, W, dep, Z }) {
      D = Number(D); W = Number(W); dep = Number(dep); Z = Number(Z);
      if ([D, W, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D, 4);
      const Z_start = CalcUtils.roundTo(Z, 4);
      const X_end = CalcUtils.roundTo(D + dep * 2, 4);
      const Z_end = CalcUtils.roundTo(Z - W / 2, 4);
      return {
        X_start: X_start.toFixed(4),
        Z_start: Z_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_end: Z_end.toFixed(4),
        depth: dep.toFixed(4),
      };
    },
  },
];

// 端面槽（dmc1-dmc6）
export const dmcPages = [
  {
    id: 'dmc1',
    title: '端面槽1（矩形槽）',
    diagram: 'static/cao/dmc1.svg',
    inputs: [
      { id: 'D',   label: '中径D(mm)',  type: 'number', default: 50 },
      { id: 'W',   label: '槽宽W(mm)',  type: 'number', default: 5 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 3 },
    ],
    outputs: [
      { id: 'X_start', label: '起点X坐标' },
      { id: 'X_end',   label: '终点X坐标' },
      { id: 'Z_depth', label: 'Z深度' },
    ],
    calculate({ D, W, dep }) {
      D = Number(D); W = Number(W); dep = Number(dep);
      if ([D, W, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D - W, 4);
      const X_end = CalcUtils.roundTo(D + W, 4);
      const Z_depth = CalcUtils.roundTo(-dep, 4);
      return {
        X_start: X_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_depth: Z_depth.toFixed(4),
      };
    },
  },
  {
    id: 'dmc2',
    title: '端面槽2（斜面槽）',
    diagram: 'static/cao/dmc2.svg',
    inputs: [
      { id: 'D',   label: '中径D(mm)',  type: 'number', default: 50 },
      { id: 'W',   label: '槽宽W(mm)',  type: 'number', default: 8 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 4 },
      { id: 'A',   label: '斜角A(°)',  type: 'number', default: 45 },
    ],
    outputs: [
      { id: 'X_start', label: '起点X坐标' },
      { id: 'X_end',   label: '终点X坐标' },
      { id: 'Z_depth', label: 'Z深度' },
    ],
    calculate({ D, W, dep, A }) {
      D = Number(D); W = Number(W); dep = Number(dep); A = Number(A);
      if ([D, W, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D - W / 2, 4);
      const X_end = CalcUtils.roundTo(D + W / 2, 4);
      const Z_depth = CalcUtils.roundTo(-dep, 4);
      return {
        X_start: X_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_depth: Z_depth.toFixed(4),
      };
    },
  },
  {
    id: 'dmc3',
    title: '端面槽3（T形槽）',
    diagram: 'static/cao/dmc3.svg',
    inputs: [
      { id: 'D',   label: '中径D(mm)',  type: 'number', default: 50 },
      { id: 'W1',  label: '口宽W1(mm)', type: 'number', default: 5 },
      { id: 'W2',  label: '底宽W2(mm)', type: 'number', default: 10 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 6 },
    ],
    outputs: [
      { id: 'X_start', label: '起点X坐标' },
      { id: 'X_end',   label: '终点X坐标' },
      { id: 'Z_depth', label: 'Z深度' },
    ],
    calculate({ D, W1, W2, dep }) {
      D = Number(D); W1 = Number(W1); W2 = Number(W2); dep = Number(dep);
      if ([D, W1, W2, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D - W2 / 2, 4);
      const X_end = CalcUtils.roundTo(D + W2 / 2, 4);
      const Z_depth = CalcUtils.roundTo(-dep, 4);
      return {
        X_start: X_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_depth: Z_depth.toFixed(4),
      };
    },
  },
  {
    id: 'dmc4',
    title: '端面槽4（圆弧槽）',
    diagram: 'static/cao/dmc4.svg',
    inputs: [
      { id: 'D',   label: '中径D(mm)',  type: 'number', default: 50 },
      { id: 'R',   label: '圆弧R(mm)',  type: 'number', default: 5 },
    ],
    outputs: [
      { id: 'X_center', label: '圆心X坐标' },
      { id: 'Z_center', label: '圆心Z坐标' },
      { id: 'depth',    label: '槽深' },
    ],
    calculate({ D, R }) {
      D = Number(D); R = Number(R);
      if ([D, R].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      return {
        X_center: D.toFixed(4),
        Z_center: '0.0000',
        depth: R.toFixed(4),
      };
    },
  },
  {
    id: 'dmc5',
    title: '端面槽5（双圆弧槽）',
    diagram: 'static/cao/dmc5.svg',
    inputs: [
      { id: 'D',   label: '中径D(mm)',  type: 'number', default: 55 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 6 },
      { id: 'R',   label: '圆弧R(mm)',  type: 'number', default: 7 },
    ],
    outputs: [
      { id: 'X_start', label: '起点X坐标' },
      { id: 'X_end',   label: '终点X坐标' },
      { id: 'Z_depth', label: 'Z深度' },
    ],
    calculate({ D, dep, R }) {
      D = Number(D); dep = Number(dep); R = Number(R);
      if ([D, dep, R].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(D - R * 2, 4);
      const X_end = CalcUtils.roundTo(D + R * 2, 4);
      const Z_depth = CalcUtils.roundTo(-dep, 4);
      return {
        X_start: X_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_depth: Z_depth.toFixed(4),
      };
    },
  },
  {
    id: 'dmc6',
    title: '端面槽6（复合槽）',
    diagram: 'static/cao/dmc6.svg',
    inputs: [
      { id: 'D',   label: '大径D(mm)',  type: 'number', default: 87 },
      { id: 'd',   label: '小径d(mm)',  type: 'number', default: 30 },
      { id: 'dep', label: '槽深(mm)',   type: 'number', default: 18 },
      { id: 'A',   label: '角度A(°)',  type: 'number', default: 33 },
    ],
    outputs: [
      { id: 'X_start', label: '起点X坐标' },
      { id: 'X_end',   label: '终点X坐标' },
      { id: 'Z_depth', label: 'Z深度' },
    ],
    calculate({ D, d, dep, A }) {
      D = Number(D); d = Number(d); dep = Number(dep); A = Number(A);
      if ([D, d, dep].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const X_start = CalcUtils.roundTo(d, 4);
      const X_end = CalcUtils.roundTo(D, 4);
      const Z_depth = CalcUtils.roundTo(-dep, 4);
      return {
        X_start: X_start.toFixed(4),
        X_end: X_end.toFixed(4),
        Z_depth: Z_depth.toFixed(4),
      };
    },
  },
];
