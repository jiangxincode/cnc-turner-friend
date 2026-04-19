import { renderCalcPage } from '../../components/calc-page.js';
import { renderListPage } from '../../components/list-page.js';
import CalcUtils from '../../utils/calc-utils.js';

const app = document.getElementById('app');

// 对角计算类型
const diagonalTypes = [
  {
    id: 'sifang',
    title: '四方对角',
    diagram: 'static/duijiao/sifang.svg',
    n: 4,
    inputs: [{ id: 's', label: '对边距离(mm)', type: 'number', default: 20 }],
    outputs: [{ id: 'd', label: '对角距离(mm)' }],
    calculate({ s }) {
      s = Number(s);
      if (isNaN(s) || s <= 0) throw new Error('对边距离必须为正数');
      // 四方：d = s * sqrt(2)
      const d = CalcUtils.roundTo(s * Math.sqrt(2), 4);
      return { d: d.toFixed(4) };
    },
  },
  {
    id: 'sifangR',
    title: '四方对角(R角)',
    diagram: 'static/duijiao/sifangR.svg',
    n: 4,
    inputs: [
      { id: 's', label: '对边距离(mm)', type: 'number', default: 20 },
      { id: 'R', label: '圆角R(mm)',    type: 'number', default: 2 },
    ],
    outputs: [{ id: 'd', label: '对角距离(mm)' }],
    calculate({ s, R }) {
      s = Number(s); R = Number(R);
      if (isNaN(s) || s <= 0) throw new Error('对边距离必须为正数');
      const d = CalcUtils.roundTo(s * Math.sqrt(2), 4);
      return { d: d.toFixed(4) };
    },
  },
  {
    id: 'sifangC',
    title: '四方对角(C角)',
    diagram: 'static/duijiao/sifangC.svg',
    n: 4,
    inputs: [
      { id: 's', label: '对边距离(mm)', type: 'number', default: 20 },
      { id: 'C', label: '倒角C(mm)',    type: 'number', default: 2 },
    ],
    outputs: [{ id: 'd', label: '对角距离(mm)' }],
    calculate({ s, C }) {
      s = Number(s); C = Number(C);
      if (isNaN(s) || s <= 0) throw new Error('对边距离必须为正数');
      const d = CalcUtils.roundTo(s * Math.sqrt(2), 4);
      return { d: d.toFixed(4) };
    },
  },
  {
    id: 'liufang',
    title: '六方对角',
    diagram: 'static/duijiao/liufang.svg',
    n: 6,
    inputs: [{ id: 's', label: '对边距离(mm)', type: 'number', default: 20 }],
    outputs: [
      { id: 'd', label: '对角距离(mm)' },
      { id: 'side', label: '边长(mm)' },
    ],
    calculate({ s }) {
      s = Number(s);
      if (isNaN(s) || s <= 0) throw new Error('对边距离必须为正数');
      // 六方：d = s / cos(π/6) = s * 2/sqrt(3)
      const d = CalcUtils.roundTo(s / CalcUtils.cosDeg(30), 4);
      const side = CalcUtils.roundTo(s / Math.sqrt(3), 4);
      return { d: d.toFixed(4), side: side.toFixed(4) };
    },
  },
  {
    id: 'liufangR',
    title: '六方对角(R角)',
    diagram: 'static/duijiao/liufangR.svg',
    n: 6,
    inputs: [
      { id: 's', label: '对边距离(mm)', type: 'number', default: 20 },
      { id: 'R', label: '圆角R(mm)',    type: 'number', default: 2 },
    ],
    outputs: [{ id: 'd', label: '对角距离(mm)' }],
    calculate({ s, R }) {
      s = Number(s);
      if (isNaN(s) || s <= 0) throw new Error('对边距离必须为正数');
      const d = CalcUtils.roundTo(s / CalcUtils.cosDeg(30), 4);
      return { d: d.toFixed(4) };
    },
  },
  {
    id: 'duofang',
    title: '多边形对角',
    diagram: 'static/duijiao/duofang.svg',
    inputs: [
      { id: 'n', label: '边数',         type: 'number', default: 8 },
      { id: 's', label: '对边距离(mm)', type: 'number', default: 20 },
    ],
    outputs: [
      { id: 'd', label: '对角距离(mm)' },
      { id: 'side', label: '边长(mm)' },
    ],
    calculate({ n, s }) {
      n = Number(n); s = Number(s);
      if (isNaN(n) || n < 3) throw new Error('边数必须≥3');
      if (isNaN(s) || s <= 0) throw new Error('对边距离必须为正数');
      // d = s / cos(π/n)
      const d = CalcUtils.roundTo(s / CalcUtils.cosDeg(180 / n), 4);
      const side = CalcUtils.roundTo(d * CalcUtils.sinDeg(180 / n), 4);
      return { d: d.toFixed(4), side: side.toFixed(4) };
    },
  },
];

function renderDiagonalIndex() {
  renderListPage(app, {
    title: '对角计算',
    items: diagonalTypes.map(t => ({ name: t.title, route: `#/diagonal/${t.id}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/diagonal', () => renderDiagonalIndex());
  diagonalTypes.forEach(page => {
    router.register(`#/diagonal/${page.id}`, () => renderCalcPage(app, page));
  });
}
