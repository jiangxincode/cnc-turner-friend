// 工艺品宏程序配置数据
const codeOutput = [{ id: 'code', label: '宏程序代码' }];

export const craftTypes = [
  {
    id: 'xinxing',
    title: '心形',
    diagram: 'static/gongyi/xx.png',
    inputs: [
      { id: 'R',  label: '半径R(mm)',  type: 'number', default: 30 },
      { id: 'F',  label: '进给速度',   type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'WuJiaoXing',
    title: '五角星',
    diagram: 'static/gongyi/wjx.png',
    inputs: [
      { id: 'R',  label: '外径R(mm)',  type: 'number', default: 30 },
      { id: 'r',  label: '内径r(mm)',  type: 'number', default: 12 },
      { id: 'F',  label: '进给速度',   type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'DuoBianXing',
    title: '多边形',
    diagram: 'static/gongyi/dbx.png',
    inputs: [
      { id: 'n',  label: '边数',       type: 'number', default: 6 },
      { id: 'R',  label: '外径R(mm)',  type: 'number', default: 30 },
      { id: 'F',  label: '进给速度',   type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'zidan1',
    title: '子弹1',
    diagram: 'static/gongyi/zidan.png',
    inputs: [
      { id: 'D',  label: '直径D(mm)',  type: 'number', default: 20 },
      { id: 'L',  label: '长度L(mm)',  type: 'number', default: 50 },
      { id: 'R',  label: '头部R(mm)',  type: 'number', default: 10 },
      { id: 'F',  label: '进给速度',   type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'ZiDan2',
    title: '子弹2',
    diagram: 'static/gongyi/zidan2.png',
    inputs: [
      { id: 'D',  label: '直径D(mm)',  type: 'number', default: 20 },
      { id: 'L',  label: '长度L(mm)',  type: 'number', default: 60 },
      { id: 'R',  label: '头部R(mm)',  type: 'number', default: 12 },
      { id: 'F',  label: '进给速度',   type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'HuLu1',
    title: '葫芦1',
    diagram: 'static/gongyi/hulu1.png',
    inputs: [
      { id: 'D1', label: '上球径D1(mm)', type: 'number', default: 30 },
      { id: 'D2', label: '下球径D2(mm)', type: 'number', default: 40 },
      { id: 'd',  label: '腰径d(mm)',    type: 'number', default: 15 },
      { id: 'F',  label: '进给速度',     type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'HuLu2',
    title: '葫芦2',
    diagram: 'static/gongyi/hulu2.png',
    inputs: [
      { id: 'D1', label: '上球径D1(mm)', type: 'number', default: 30 },
      { id: 'D2', label: '下球径D2(mm)', type: 'number', default: 40 },
      { id: 'd',  label: '腰径d(mm)',    type: 'number', default: 15 },
      { id: 'L',  label: '总长L(mm)',    type: 'number', default: 80 },
      { id: 'F',  label: '进给速度',     type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'tuoluo',
    title: '陀螺',
    diagram: 'static/gongyi/tuoluo1.png',
    inputs: [
      { id: 'D',  label: '最大径D(mm)', type: 'number', default: 40 },
      { id: 'L',  label: '总长L(mm)',   type: 'number', default: 60 },
      { id: 'F',  label: '进给速度',    type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'JiuBei',
    title: '酒杯',
    diagram: 'static/gongyi/jiubei.png',
    inputs: [
      { id: 'D',  label: '杯口径D(mm)', type: 'number', default: 60 },
      { id: 'D2', label: '杯底径D2(mm)', type: 'number', default: 20 },
      { id: 'L',  label: '杯高L(mm)',   type: 'number', default: 80 },
      { id: 'F',  label: '进给速度',    type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
  {
    id: 'JiangBei',
    title: '奖杯',
    diagram: 'static/gongyi/jb.png',
    inputs: [
      { id: 'D',  label: '杯口径D(mm)', type: 'number', default: 80 },
      { id: 'D2', label: '底座径D2(mm)', type: 'number', default: 60 },
      { id: 'L',  label: '总高L(mm)',   type: 'number', default: 120 },
      { id: 'F',  label: '进给速度',    type: 'number', default: 100 },
    ],
    outputs: codeOutput,
  },
];
