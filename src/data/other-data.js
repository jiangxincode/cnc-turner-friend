// 其他计算模块配置数据
import CalcUtils from '../utils/calc-utils.js';

// 中心孔类型选项
const centerHoleOptions = [
  { value: 'A', label: 'A型' },
  { value: 'B', label: 'B型' },
  { value: 'C', label: 'C型' },
  { value: 'R', label: 'R型' },
];

export const otherTypes = [
  {
    id: 'GuangJieDu',
    title: '光洁度换算',
    diagram: null,
    inputs: [
      {
        id: 'ra',
        label: 'Ra值(μm)',
        type: 'select',
        default: '1.6',
        options: [
          { value: '0.012', label: 'Ra 0.012' },
          { value: '0.025', label: 'Ra 0.025' },
          { value: '0.05',  label: 'Ra 0.05'  },
          { value: '0.1',   label: 'Ra 0.1'   },
          { value: '0.2',   label: 'Ra 0.2'   },
          { value: '0.4',   label: 'Ra 0.4'   },
          { value: '0.8',   label: 'Ra 0.8'   },
          { value: '1.6',   label: 'Ra 1.6'   },
          { value: '3.2',   label: 'Ra 3.2'   },
          { value: '6.3',   label: 'Ra 6.3'   },
          { value: '12.5',  label: 'Ra 12.5'  },
          { value: '25',    label: 'Ra 25'     },
          { value: '50',    label: 'Ra 50'     },
          { value: '100',   label: 'Ra 100'    },
        ],
      },
    ],
    outputs: [
      { id: 'rz',    label: 'Rz值(μm)' },
      { id: 'grade', label: '光洁度等级' },
      { id: 'old',   label: '旧标准' },
    ],
    calculate({ ra }) {
      const raVal = parseFloat(ra);
      // Ra → Rz 近似关系：Rz ≈ 4*Ra（粗略）
      const rz = CalcUtils.roundTo(raVal * 4, 3);
      // 光洁度等级对照
      const gradeMap = {
        '100': '▽1', '50': '▽2', '25': '▽3', '12.5': '▽4',
        '6.3': '▽5', '3.2': '▽6', '1.6': '▽7', '0.8': '▽8',
        '0.4': '▽9', '0.2': '▽10', '0.1': '▽11', '0.05': '▽12',
        '0.025': '▽13', '0.012': '▽14',
      };
      const oldMap = {
        '100': 'N12', '50': 'N11', '25': 'N10', '12.5': 'N9',
        '6.3': 'N8', '3.2': 'N7', '1.6': 'N6', '0.8': 'N5',
        '0.4': 'N4', '0.2': 'N3', '0.1': 'N2', '0.05': 'N1',
        '0.025': 'N0', '0.012': 'N0',
      };
      return {
        rz: rz.toFixed(3),
        grade: gradeMap[ra] || '-',
        old: oldMap[ra] || '-',
      };
    },
  },
  {
    id: 'HengXianSu',
    title: '横线速计算',
    diagram: null,
    inputs: [
      { id: 'D', label: '直径(mm)',    type: 'number', default: 50 },
      { id: 'n', label: '转速(r/min)', type: 'number', default: 1000 },
    ],
    outputs: [
      { id: 'vc', label: '线速度(m/min)' },
      { id: 'vcs', label: '线速度(m/s)' },
    ],
    calculate({ D, n }) {
      D = Number(D); n = Number(n);
      if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
      if (isNaN(n) || n <= 0) throw new Error('转速必须为正数');
      const vc = CalcUtils.roundTo(Math.PI * D * n / 1000, 4);
      return {
        vc: vc.toFixed(4),
        vcs: CalcUtils.roundTo(vc / 60, 4).toFixed(4),
      };
    },
  },
  {
    id: 'LuoWenCeLiang',
    title: '螺纹测量(三针)',
    diagram: 'static/thread/lwcl.png',
    inputs: [
      { id: 'D',  label: '公称直径(mm)', type: 'number', default: 20 },
      { id: 'P',  label: '螺距(mm)',     type: 'number', default: 2.5 },
      { id: 'dp', label: '量针直径(mm)', type: 'number', default: 1.44 },
    ],
    outputs: [
      { id: 'M', label: '三针测量值M(mm)' },
      { id: 'dp_best', label: '最佳量针直径(mm)' },
    ],
    calculate({ D, P, dp }) {
      D = Number(D); P = Number(P); dp = Number(dp);
      if (isNaN(D) || D <= 0) throw new Error('公称直径必须为正数');
      if (isNaN(P) || P <= 0) throw new Error('螺距必须为正数');
      if (isNaN(dp) || dp <= 0) throw new Error('量针直径必须为正数');
      // 公制螺纹三针测量公式（60°牙型角）
      // M = d2 + 3*dp - 0.866*P
      // d2 = D - 0.6495*P（中径）
      const d2 = D - 0.6495 * P;
      const M = CalcUtils.roundTo(d2 + 3 * dp - 0.866 * P, 4);
      const dp_best = CalcUtils.roundTo(0.5774 * P, 4);
      return {
        M: M.toFixed(4),
        dp_best: dp_best.toFixed(4),
      };
    },
  },
  {
    id: 'LuoWenCeLiangJ',
    title: '螺纹测量(旧)',
    diagram: 'static/thread/lwcl.png',
    inputs: [
      { id: 'D',  label: '公称直径(mm)', type: 'number', default: 20 },
      { id: 'P',  label: '螺距(mm)',     type: 'number', default: 2.5 },
    ],
    outputs: [
      { id: 'dp_best', label: '最佳量针直径(mm)' },
      { id: 'M',       label: '三针测量值M(mm)' },
    ],
    calculate({ D, P }) {
      D = Number(D); P = Number(P);
      if (isNaN(D) || D <= 0) throw new Error('公称直径必须为正数');
      if (isNaN(P) || P <= 0) throw new Error('螺距必须为正数');
      const dp_best = CalcUtils.roundTo(0.5774 * P, 4);
      const d2 = D - 0.6495 * P;
      const M = CalcUtils.roundTo(d2 + 3 * dp_best - 0.866 * P, 4);
      return {
        dp_best: dp_best.toFixed(4),
        M: M.toFixed(4),
      };
    },
  },
  {
    id: 'YuanDengFen',
    title: '圆等分计算',
    diagram: null,
    inputs: [
      { id: 'D', label: '圆直径(mm)', type: 'number', default: 100 },
      { id: 'n', label: '等分数',     type: 'number', default: 6 },
    ],
    outputs: [
      { id: 'chord',  label: '弦长(mm)' },
      { id: 'angle',  label: '圆心角(°)' },
      { id: 'coords', label: '各点坐标' },
    ],
    calculate({ D, n }) {
      D = Number(D); n = Number(n);
      if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
      if (isNaN(n) || n < 2) throw new Error('等分数必须≥2');
      const R = D / 2;
      const angle = 360 / n;
      const chord = CalcUtils.roundTo(2 * R * CalcUtils.sinDeg(angle / 2), 4);
      const coords = Array.from({ length: n }, (_, i) => {
        const a = i * angle;
        const x = CalcUtils.roundTo(R * CalcUtils.cosDeg(a), 4);
        const y = CalcUtils.roundTo(R * CalcUtils.sinDeg(a), 4);
        return `P${i + 1}(${x},${y})`;
      }).join('  ');
      return {
        chord: chord.toFixed(4),
        angle: angle.toFixed(4),
        coords,
      };
    },
  },
  {
    id: 'ZhongXinKong',
    title: '中心孔查询',
    diagram: 'static/qita/Axing.png',
    inputs: [
      { id: 'type', label: '类型', type: 'select', default: 'A', options: centerHoleOptions },
      { id: 'D',    label: '轴径(mm)', type: 'number', default: 20 },
    ],
    outputs: [
      { id: 'd',  label: '中心孔直径d(mm)' },
      { id: 'D1', label: '锥孔直径D1(mm)' },
      { id: 'L',  label: '深度L(mm)' },
    ],
    calculate({ type, D }) {
      D = Number(D);
      if (isNaN(D) || D <= 0) throw new Error('轴径必须为正数');
      // 简化的中心孔参数（A型，60°）
      let d, D1, L;
      if (D <= 18) {
        d = 1.0; D1 = 2.12; L = 0.97;
      } else if (D <= 30) {
        d = 1.6; D1 = 3.35; L = 1.52;
      } else if (D <= 50) {
        d = 2.0; D1 = 4.25; L = 1.95;
      } else if (D <= 80) {
        d = 2.5; D1 = 5.30; L = 2.42;
      } else if (D <= 120) {
        d = 3.15; D1 = 6.70; L = 3.07;
      } else {
        d = 4.0; D1 = 8.50; L = 3.90;
      }
      return {
        d: d.toFixed(2),
        D1: D1.toFixed(2),
        L: L.toFixed(2),
      };
    },
  },
  {
    id: 'G98zhuanG99',
    title: 'G98/G99转换',
    diagram: null,
    inputs: [
      { id: 'mode', label: '转换方向', type: 'select', default: 'G98toG99', options: [
        { value: 'G98toG99', label: 'G98→G99（每分→每转）' },
        { value: 'G99toG98', label: 'G99→G98（每转→每分）' },
      ]},
      { id: 'F', label: '进给值', type: 'number', default: 100 },
      { id: 'S', label: '转速(r/min)', type: 'number', default: 1000 },
    ],
    outputs: [
      { id: 'result', label: '转换结果' },
    ],
    calculate({ mode, F, S }) {
      F = Number(F); S = Number(S);
      if (isNaN(F) || F <= 0) throw new Error('进给值必须为正数');
      if (isNaN(S) || S <= 0) throw new Error('转速必须为正数');
      let result;
      if (mode === 'G98toG99') {
        result = CalcUtils.roundTo(F / S, 4).toFixed(4) + ' mm/r';
      } else {
        result = CalcUtils.roundTo(F * S, 4).toFixed(4) + ' mm/min';
      }
      return { result };
    },
  },
];
