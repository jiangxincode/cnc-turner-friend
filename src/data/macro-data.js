// src/data/macro-data.js

const codeOutput = [{ id: 'code', label: '宏程序代码' }];

export const macroTypes = [
  {
    id: 'ZuanKong',
    title: '钻深孔',
    diagram: 'static/hong/hzk.png',
    inputs: [
      { id: 'D', label: '孔径', type: 'number', default: 10 },
      { id: 'L', label: '孔深', type: 'number', default: 50 },
      { id: 'step', label: '每次进刀', type: 'number', default: 5 },
      { id: 'F', label: '进给速度', type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'WangWen',
    title: '车网纹',
    diagram: 'static/hong/ww.png',
    inputs: [
      { id: 'D', label: '直径', type: 'number', default: 30 },
      { id: 'L', label: '长度', type: 'number', default: 50 },
      { id: 'P', label: '螺距', type: 'number', default: 2 },
      { id: 'depth', label: '深度', type: 'number', default: 0.5 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'WangWenJ',
    title: '车网纹(旧)',
    diagram: 'static/hong/ww.png',
    inputs: [
      { id: 'D', label: '直径', type: 'number', default: 30 },
      { id: 'L', label: '长度', type: 'number', default: 50 },
      { id: 'P', label: '螺距', type: 'number', default: 2 },
      { id: 'depth', label: '深度', type: 'number', default: 0.5 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'YouCao',
    title: '油槽',
    diagram: 'static/hong/yc.png',
    inputs: [
      { id: 'D', label: '直径', type: 'number', default: 30 },
      { id: 'L', label: '长度', type: 'number', default: 50 },
      { id: 'P', label: '螺距', type: 'number', default: 5 },
      { id: 'depth', label: '深度', type: 'number', default: 1 },
      { id: 'num', label: '槽数', type: 'number', default: 1 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'QuBanKou',
    title: '去半扣',
    // 目录中只有大写 QBK.png，无 qbk.png，使用 hzk.png 作为占位
    diagram: 'static/hong/hzk.png',
    inputs: [
      { id: 'D', label: '直径', type: 'number', default: 20 },
      { id: 'P', label: '螺距', type: 'number', default: 2.5 },
      { id: 'L', label: '螺纹长度', type: 'number', default: 30 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'XeiJinDao',
    title: '斜进刀车锥',
    // 目录中无 xjd.png，使用 hzk.png 作为占位
    diagram: 'static/hong/hzk.png',
    inputs: [
      { id: 'D1', label: '大径', type: 'number', default: 30 },
      { id: 'D2', label: '小径', type: 'number', default: 20 },
      { id: 'L', label: '长度', type: 'number', default: 50 },
      { id: 'F', label: '进给速度', type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'TuoYuan',
    title: '椭圆',
    diagram: 'static/hong/ty.png',
    inputs: [
      { id: 'A', label: '长半轴', type: 'number', default: 30 },
      { id: 'B', label: '短半轴', type: 'number', default: 20 },
      { id: 'F', label: '进给速度', type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
];
