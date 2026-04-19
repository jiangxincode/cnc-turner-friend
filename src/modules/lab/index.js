import { renderNavBar } from '../../components/nav-bar.js';
import { renderCalcPage } from '../../components/calc-page.js';
import { renderListPage } from '../../components/list-page.js';
import CalcUtils from '../../utils/calc-utils.js';

const app = document.getElementById('app');

// 实验室功能列表
const labFeatures = [
  {
    id: 'speed-calc',
    title: '切削速度计算',
    inputs: [
      { id: 'vc', label: '线速度(m/min)', type: 'number', default: 120 },
      { id: 'D',  label: '直径(mm)',      type: 'number', default: 50 },
    ],
    outputs: [
      { id: 'n', label: '转速(r/min)' },
    ],
    calculate({ vc, D }) {
      vc = Number(vc); D = Number(D);
      if (isNaN(vc) || vc <= 0) throw new Error('线速度必须为正数');
      if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
      const n = CalcUtils.roundTo(vc * 1000 / (Math.PI * D), 1);
      return { n: n.toFixed(1) };
    },
  },
  {
    id: 'feed-calc',
    title: '进给量换算',
    inputs: [
      { id: 'fn', label: '每转进给(mm/r)', type: 'number', default: 0.2 },
      { id: 'n',  label: '转速(r/min)',    type: 'number', default: 1000 },
    ],
    outputs: [
      { id: 'fm', label: '每分进给(mm/min)' },
    ],
    calculate({ fn, n }) {
      fn = Number(fn); n = Number(n);
      if (isNaN(fn) || fn <= 0) throw new Error('每转进给必须为正数');
      if (isNaN(n) || n <= 0) throw new Error('转速必须为正数');
      const fm = CalcUtils.roundTo(fn * n, 2);
      return { fm: fm.toFixed(2) };
    },
  },
  {
    id: 'taper-calc',
    title: '锥度计算',
    inputs: [
      { id: 'D1', label: '大端直径(mm)', type: 'number', default: 30 },
      { id: 'D2', label: '小端直径(mm)', type: 'number', default: 20 },
      { id: 'L',  label: '锥长(mm)',     type: 'number', default: 50 },
    ],
    outputs: [
      { id: 'taper',     label: '锥度(1:x)' },
      { id: 'halfAngle', label: '半角(°)' },
      { id: 'fullAngle', label: '全角(°)' },
    ],
    calculate({ D1, D2, L }) {
      D1 = Number(D1); D2 = Number(D2); L = Number(L);
      if (isNaN(D1) || isNaN(D2) || isNaN(L)) throw new Error('请输入有效数值');
      if (L <= 0) throw new Error('锥长必须为正数');
      if (D1 <= D2) throw new Error('大端直径必须大于小端直径');
      const tanAlpha = (D1 - D2) / (2 * L);
      const halfAngle = CalcUtils.roundTo(CalcUtils.atanDeg(tanAlpha), 4);
      const fullAngle = CalcUtils.roundTo(halfAngle * 2, 4);
      const taperX = CalcUtils.roundTo(1 / tanAlpha, 3);
      return {
        taper: `1:${taperX}`,
        halfAngle: halfAngle.toFixed(4),
        fullAngle: fullAngle.toFixed(4),
      };
    },
  },
  {
    id: 'circle-calc',
    title: '圆周计算',
    inputs: [
      { id: 'D', label: '直径(mm)', type: 'number', default: 50 },
    ],
    outputs: [
      { id: 'circumference', label: '周长(mm)' },
      { id: 'area',          label: '面积(mm²)' },
    ],
    calculate({ D }) {
      D = Number(D);
      if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
      const circumference = CalcUtils.roundTo(Math.PI * D, 4);
      const area = CalcUtils.roundTo(Math.PI * (D / 2) ** 2, 4);
      return {
        circumference: circumference.toFixed(4),
        area: area.toFixed(4),
      };
    },
  },
];

function renderLabIndex() {
  renderListPage(app, {
    title: '实验室',
    items: labFeatures.map(f => ({ name: f.title, route: `#/lab/${f.id}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/lab', () => renderLabIndex());
  labFeatures.forEach(feature => {
    router.register(`#/lab/${feature.id}`, () => renderCalcPage(app, {
      title: feature.title,
      inputs: feature.inputs,
      outputs: feature.outputs,
      calculate: feature.calculate,
    }));
  });
}
