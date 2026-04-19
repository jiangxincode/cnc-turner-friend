import { renderCalcPage } from '../../components/calc-page.js';
import { renderListPage } from '../../components/list-page.js';
import CalcUtils from '../../utils/calc-utils.js';

const app = document.getElementById('app');

// 材料密度（g/cm³）
const DENSITY = {
  '钢':    7.85,
  '铝':    2.70,
  '铜':    8.90,
  '不锈钢': 7.93,
  '铸铁':  7.20,
  '黄铜':  8.50,
};

const materialOptions = Object.keys(DENSITY).map(k => ({ value: k, label: k }));

// 材料类型配置
const materialTypes = [
  {
    id: 'yuangang',
    title: '圆棒',
    diagram: 'static/CaiLiaoZhongLiang/yb.png',
    inputs: [
      { id: 'D', label: '直径(mm)', type: 'number', default: 20 },
      { id: 'L', label: '长度(mm)', type: 'number', default: 1000 },
      { id: 'mat', label: '材料', type: 'select', default: '钢', options: materialOptions },
    ],
    outputs: [{ id: 'weight', label: '重量(kg)' }],
    calculate({ D, L, mat }) {
      D = Number(D); L = Number(L);
      if (isNaN(D) || D <= 0) throw new Error('直径必须为正数');
      if (isNaN(L) || L <= 0) throw new Error('长度必须为正数');
      const rho = DENSITY[mat] || 7.85;
      // 截面积 = π*(D/2)² mm²，体积 = 截面积*L mm³，重量 = 体积*rho/1e6 kg
      const area = Math.PI * (D / 2) ** 2;
      const weight = CalcUtils.roundTo(area * L * rho / 1e6, 4);
      return { weight: weight.toFixed(4) };
    },
  },
  {
    id: 'fangang',
    title: '方钢',
    diagram: 'static/CaiLiaoZhongLiang/fg.png',
    inputs: [
      { id: 'a', label: '边长(mm)', type: 'number', default: 20 },
      { id: 'L', label: '长度(mm)', type: 'number', default: 1000 },
      { id: 'mat', label: '材料', type: 'select', default: '钢', options: materialOptions },
    ],
    outputs: [{ id: 'weight', label: '重量(kg)' }],
    calculate({ a, L, mat }) {
      a = Number(a); L = Number(L);
      if (isNaN(a) || a <= 0) throw new Error('边长必须为正数');
      if (isNaN(L) || L <= 0) throw new Error('长度必须为正数');
      const rho = DENSITY[mat] || 7.85;
      const weight = CalcUtils.roundTo(a * a * L * rho / 1e6, 4);
      return { weight: weight.toFixed(4) };
    },
  },
  {
    id: 'liufang',
    title: '六方钢',
    diagram: 'static/CaiLiaoZhongLiang/lf.png',
    inputs: [
      { id: 's', label: '对边距离(mm)', type: 'number', default: 20 },
      { id: 'L', label: '长度(mm)',     type: 'number', default: 1000 },
      { id: 'mat', label: '材料', type: 'select', default: '钢', options: materialOptions },
    ],
    outputs: [{ id: 'weight', label: '重量(kg)' }],
    calculate({ s, L, mat }) {
      s = Number(s); L = Number(L);
      if (isNaN(s) || s <= 0) throw new Error('对边距离必须为正数');
      if (isNaN(L) || L <= 0) throw new Error('长度必须为正数');
      const rho = DENSITY[mat] || 7.85;
      // 六方截面积 = (3*sqrt(3)/2) * (s/sqrt(3))² = sqrt(3)/2 * s²
      const area = Math.sqrt(3) / 2 * s * s;
      const weight = CalcUtils.roundTo(area * L * rho / 1e6, 4);
      return { weight: weight.toFixed(4) };
    },
  },
  {
    id: 'fanglv',
    title: '方铝',
    diagram: 'static/CaiLiaoZhongLiang/fl.png',
    inputs: [
      { id: 'a', label: '边长(mm)', type: 'number', default: 20 },
      { id: 'L', label: '长度(mm)', type: 'number', default: 1000 },
    ],
    outputs: [{ id: 'weight', label: '重量(kg)' }],
    calculate({ a, L }) {
      a = Number(a); L = Number(L);
      if (isNaN(a) || a <= 0) throw new Error('边长必须为正数');
      if (isNaN(L) || L <= 0) throw new Error('长度必须为正数');
      const weight = CalcUtils.roundTo(a * a * L * 2.70 / 1e6, 4);
      return { weight: weight.toFixed(4) };
    },
  },
  {
    id: 'guanlv',
    title: '管铝',
    diagram: 'static/CaiLiaoZhongLiang/gl.png',
    inputs: [
      { id: 'D',  label: '外径(mm)', type: 'number', default: 30 },
      { id: 'd',  label: '内径(mm)', type: 'number', default: 25 },
      { id: 'L',  label: '长度(mm)', type: 'number', default: 1000 },
    ],
    outputs: [{ id: 'weight', label: '重量(kg)' }],
    calculate({ D, d, L }) {
      D = Number(D); d = Number(d); L = Number(L);
      if (isNaN(D) || D <= 0) throw new Error('外径必须为正数');
      if (isNaN(d) || d <= 0) throw new Error('内径必须为正数');
      if (d >= D) throw new Error('内径必须小于外径');
      if (isNaN(L) || L <= 0) throw new Error('长度必须为正数');
      const area = Math.PI * ((D / 2) ** 2 - (d / 2) ** 2);
      const weight = CalcUtils.roundTo(area * L * 2.70 / 1e6, 4);
      return { weight: weight.toFixed(4) };
    },
  },
  {
    id: 'gongzigang',
    title: '工字钢',
    diagram: 'static/CaiLiaoZhongLiang/gzg.png',
    inputs: [
      { id: 'H',  label: '高度(mm)',   type: 'number', default: 100 },
      { id: 'B',  label: '翼缘宽(mm)', type: 'number', default: 68 },
      { id: 't1', label: '腹板厚(mm)', type: 'number', default: 4.5 },
      { id: 't2', label: '翼缘厚(mm)', type: 'number', default: 7.6 },
      { id: 'L',  label: '长度(mm)',   type: 'number', default: 1000 },
      { id: 'mat', label: '材料', type: 'select', default: '钢', options: materialOptions },
    ],
    outputs: [{ id: 'weight', label: '重量(kg)' }],
    calculate({ H, B, t1, t2, L, mat }) {
      H = Number(H); B = Number(B); t1 = Number(t1); t2 = Number(t2); L = Number(L);
      if ([H, B, t1, t2, L].some(v => isNaN(v) || v <= 0)) throw new Error('请输入有效正数');
      const rho = DENSITY[mat] || 7.85;
      // 截面积 = 2*B*t2 + (H-2*t2)*t1
      const area = 2 * B * t2 + (H - 2 * t2) * t1;
      const weight = CalcUtils.roundTo(area * L * rho / 1e6, 4);
      return { weight: weight.toFixed(4) };
    },
  },
];

function renderMaterialIndex() {
  renderListPage(app, {
    title: '材料重量',
    items: materialTypes.map(t => ({ name: t.title, route: `#/material/${t.id}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/material', () => renderMaterialIndex());
  materialTypes.forEach(page => {
    router.register(`#/material/${page.id}`, () => renderCalcPage(app, page));
  });
}
