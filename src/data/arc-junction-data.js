// 圆弧接点页面配置数据
// 输入字段根据原应用 data() 定义提取

const coordTypeOptions = [
  { value: 'true',  label: '绝对坐标' },
  { value: 'false', label: '相对坐标' },
];

// 坐标系字段统一配置（单选框样式）
export const coordField = { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions };

// ── 球头接点 qt1-qt12 ──────────────────────────────────────────

export const qtPages = [
  {
    id: 'qt1',
    title: '球头接点1',
    diagram: 'static/yhjd/yh1.png',
    tip: '大径 R 必填',
    inputs: [
      { id: 'large',  label: '大径',    type: 'number',   default: 50 },
      { id: 'R',      label: 'R',       type: 'number',   default: 80 },
      { id: 'Ra',     label: 'Ra',      type: 'optional', default: 2 },
      { id: 'tip',    label: '刀尖补偿', type: 'optional', default: 0.4 },
      { id: 'juedui', label: '坐标系',  type: 'radio',    default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt2',
    title: '球头接点2',
    diagram: 'static/yhjd/yh2.png',
    tip: '任填三项',
    inputs: [
      {
        id: 'mode',
        label: '模式',
        type: 'radio',
        default: 'ball',
        options: [
          { value: 'ball',  label: '球' },
          { value: 'arc1',  label: '弧1' },
          { value: 'arc2',  label: '弧2' },
          { value: 'arc3',  label: '弧3' },
        ],
      },
      { id: 'large',   label: '大径',    type: 'number',   default: 50 },
      { id: 'small',   label: '小径',    type: 'number',   default: 33.166 },
      { id: 'R',       label: 'R',       type: 'number',   default: 30 },
      { id: 'long',    label: '长度',    type: 'number',   default: 8.417 },
      { id: 'zStart',  label: 'z起点',   type: 'number',   default: 0 },
      // Ra 显示条件：球、弧1、弧3
      { id: 'Ra',      label: 'Ra',      type: 'optional', default: '' },
      // Rb 显示条件：球、弧2、弧3
      { id: 'Rb',      label: 'Rb',      type: 'optional', default: '' },
      { id: 'tip',     label: '刀尖补偿', type: 'optional', default: 0.4 },
      { id: 'buchang', label: '刀尖补偿', type: 'checkbox', default: false },
      { id: 'juedui',  label: '坐标系',  type: 'radio',    default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt3',
    title: '球头接点3',
    diagram: 'static/yhjd/qt3.png',
    tip: '大径 R 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 8 },
      { id: 'angle', label: '角度',   type: 'number', default: 30 },
      { id: 'R',     label: 'R',      type: 'number', default: 8 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt4',
    title: '球头接点4',
    diagram: 'static/yhjd/yh4.png',
    tip: '大径 R 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 8 },
      { id: 'R',     label: 'R',      type: 'number', default: 10 },
      { id: 'long',  label: '长度',   type: 'number', default: '' },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt5',
    title: '球头接点5',
    diagram: 'static/yhjd/yh5.png',
    tip: '大径 R 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 19.874 },
      { id: 'small', label: '小径',   type: 'number', default: '' },
      { id: 'long1', label: '长度1',  type: 'number', default: 53 },
      { id: 'long2', label: '长度2',  type: 'number', default: 25 },
      { id: 'angle', label: '角度',   type: 'number', default: 20 },
      { id: 'R',     label: 'R',      type: 'number', default: 13 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt6',
    title: '球头接点6',
    diagram: 'static/yhjd/yh6.png',
    tip: '大径 R 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 47.633 },
      { id: 'small', label: '小径',   type: 'number', default: 30 },
      { id: 'R',     label: 'R',      type: 'number', default: 25 },
      { id: 'long1', label: '长度1',  type: 'number', default: 91 },
      { id: 'long2', label: '长度2',  type: 'number', default: 50 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt7',
    title: '球头接点7',
    diagram: 'static/yhjd/yh7.png',
    tip: '大径 角度 Ra 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 50 },
      { id: 'angle', label: '角度',   type: 'number', default: 84.8 },
      { id: 'Ra',    label: 'Ra',     type: 'number', default: 10 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt8',
    title: '球头接点8',
    diagram: 'static/yhjd/yh8.png',
    tip: '大径 r R 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 24.7 },
      { id: 'r',     label: 'r',      type: 'number', default: 3 },
      { id: 'R',     label: 'R',      type: 'number', default: 75 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt9',
    title: '球头接点9',
    diagram: 'static/yhjd/yh9.png',
    tip: '大径 R Ra 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 40 },
      { id: 'R',     label: 'R',      type: 'number', default: 24.5 },
      { id: 'Ra',    label: 'Ra',     type: 'number', default: 2.5 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt10',
    title: '球头接点10',
    diagram: 'static/yhjd/yh10.png',
    tip: '大径 小径 R 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 107.564 },
      { id: 'small', label: '小径',   type: 'number', default: 68 },
      { id: 'R',     label: 'R',      type: 'number', default: 55 },
      { id: 'Ra',    label: 'Ra',     type: 'number', default: 3 },
      { id: 'Rb',    label: 'Rb',     type: 'number', default: 11.228 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt11',
    title: '球头接点11',
    diagram: 'static/yhjd/yh11.png',
    tip: '大径 小径 长度 R 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 120 },
      { id: 'small', label: '小径',   type: 'number', default: 70 },
      { id: 'long',  label: '长度',   type: 'number', default: 127 },
      { id: 'R',     label: 'R',      type: 'number', default: 60 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
  {
    id: 'qt12',
    title: '球头接点12',
    diagram: 'static/yhjd/qt12.png',
    tip: '大径 长度 SR 必填',
    inputs: [
      { id: 'large', label: '大径',   type: 'number', default: 30 },
      { id: 'long',  label: '长度',   type: 'number', default: 41 },
      { id: 'SR',    label: 'SR',     type: 'number', default: 25 },
      { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
    ],
  },
];

// ── 外形接点 wy1-wy36（通用输入）──────────────────────────────

const wyInputs = [
  { id: 'large', label: '大径',   type: 'number', default: 50 },
  { id: 'R',     label: 'R',      type: 'number', default: 20 },
  { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
];

const wyDiagrams = {
  1:'yh8', 2:'yh16', 3:'yh9', 4:'yh10', 5:'yh13',
  6:'yh49', 7:'yh11', 8:'yh14', 9:'yh41', 10:'yh15',
  11:'yh26', 12:'yh27', 13:'yh28', 14:'yh29', 15:'yh30',
  16:'yh31', 17:'yh32', 18:'yh33', 19:'yh53', 20:'yh45',
  21:'yh34', 22:'yh40', 23:'yh35', 24:'yh46', 25:'yh50',
  26:'yh51', 27:'yh37', 28:'yh47', 29:'yh38',
  30:'wy30', 31:'wy31', 32:'wy32', 33:'wy33', 34:'wy34', 35:'wy35', 36:'wy36',
};

export const wyPages = Array.from({ length: 36 }, (_, i) => {
  const n = i + 1;
  return {
    id: `wy${n}`,
    title: `外形接点${n}`,
    diagram: `static/yhjd/${wyDiagrams[n]}.png`,
    tip: '大径 R 必填',
    inputs: wyInputs,
  };
});

// ── 内孔接点 nk1-nk21（通用输入）──────────────────────────────

const nkInputs = [
  { id: 'large', label: '内径',   type: 'number', default: 30 },
  { id: 'R',     label: 'R',      type: 'number', default: 15 },
  { id: 'juedui', label: '坐标系', type: 'radio', default: 'true', options: coordTypeOptions },
];

const nkDiagrams = [
  'yh17','yh18','yh20','yh19','yh21','yh44','yh22','yh23',
  'yh24','yh48','yh25','nk12','yh54','yh43','yh36','yh42',
  'yh38','nk18','nk19','nk20','nk21',
];

export const nkPages = Array.from({ length: 21 }, (_, i) => ({
  id: `nk${i + 1}`,
  title: `内孔接点${i + 1}`,
  diagram: `static/yhjd/${nkDiagrams[i]}.png`,
  tip: '内径 R 必填',
  inputs: nkInputs,
}));
