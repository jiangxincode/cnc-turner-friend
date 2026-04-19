import { renderCalcPage } from '../../components/calc-page.js';
import { renderListPage } from '../../components/list-page.js';
import CalcUtils from '../../utils/calc-utils.js';

const app = document.getElementById('app');

// 莫氏锥数据
const MORSE_TAPER = [
  { num: 0, taper: '1:19.212', angle: "1°29'27\"", bigD: 9.045, smallD: 6.401 },
  { num: 1, taper: '1:20.047', angle: "1°25'43\"", bigD: 12.065, smallD: 9.371 },
  { num: 2, taper: '1:20.020', angle: "1°25'50\"", bigD: 17.780, smallD: 14.900 },
  { num: 3, taper: '1:19.922', angle: "1°26'16\"", bigD: 23.825, smallD: 19.050 },
  { num: 4, taper: '1:19.254', angle: "1°29'15\"", bigD: 31.267, smallD: 25.154 },
  { num: 5, taper: '1:19.002', angle: "1°30'26\"", bigD: 44.399, smallD: 36.547 },
  { num: 6, taper: '1:19.180', angle: "1°29'36\"", bigD: 63.348, smallD: 52.388 },
];

const angleCalcConfig = {
  title: '角度计算',
  diagram: 'static/yhjd/JiaoDuJiSuan.png',
  inputs: [
    { id: 'D1', label: '大端直径', type: 'number', default: 30 },
    { id: 'D2', label: '小端直径', type: 'number', default: 20 },
    { id: 'L',  label: '锥长',     type: 'number', default: 50 },
  ],
  outputs: [
    { id: 'angle',     label: '半角（度）' },
    { id: 'fullAngle', label: '全角（度）' },
    { id: 'taper',     label: '锥度比' },
    { id: 'dms',       label: '度分秒' },
  ],
  calculate({ D1, D2, L }) {
    D1 = Number(D1); D2 = Number(D2); L = Number(L);
    if (isNaN(D1) || isNaN(D2) || isNaN(L)) throw new Error('请输入有效数值');
    if (L <= 0) throw new Error('锥长必须为正数');
    if (D1 <= D2) throw new Error('大端直径必须大于小端直径');
    const tanAlpha = (D1 - D2) / (2 * L);
    const alpha = CalcUtils.atanDeg(tanAlpha);
    const fullAngle = alpha * 2;
    const taperRatio = `1:${CalcUtils.roundTo(1 / tanAlpha, 3)}`;
    const dmsObj = CalcUtils.decimalToDms(alpha);
    const dms = `${dmsObj.d}°${dmsObj.m}'${dmsObj.s}"`;
    return {
      angle: alpha.toFixed(4),
      fullAngle: fullAngle.toFixed(4),
      taper: taperRatio,
      dms,
    };
  },
};

const morseConfig = {
  title: '莫氏锥查询',
  diagram: 'static/yhjd/moshizhui.png',
  inputs: [
    {
      id: 'num',
      label: '莫氏锥号',
      type: 'select',
      default: '0',
      options: MORSE_TAPER.map(m => ({ value: String(m.num), label: `${m.num}号` })),
    },
  ],
  outputs: [
    { id: 'taper',  label: '锥度' },
    { id: 'angle',  label: '角度' },
    { id: 'bigD',   label: '大端直径(mm)' },
    { id: 'smallD', label: '小端直径(mm)' },
  ],
  calculate({ num }) {
    const data = MORSE_TAPER[Number(num)];
    if (!data) throw new Error('无效的莫氏锥号');
    return {
      taper: data.taper,
      angle: data.angle,
      bigD: data.bigD.toFixed(3),
      smallD: data.smallD.toFixed(3),
    };
  },
};

function renderAngleIndex() {
  renderListPage(app, {
    title: '角度计算',
    items: [
      { name: '角度计算',   route: '#/angle/JiaoDuJiSuan' },
      { name: '莫氏锥查询', route: '#/angle/moshizhui' },
    ],
  });
}

export function registerRoutes(router) {
  router.register('#/angle', () => renderAngleIndex());
  router.register('#/angle/JiaoDuJiSuan', () => renderCalcPage(app, angleCalcConfig));
  router.register('#/angle/moshizhui', () => renderCalcPage(app, morseConfig));
}
