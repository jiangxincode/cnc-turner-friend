// src/modules/trig-table/index.js
import { renderNavBar } from '../../components/nav-bar.js';

const app = document.getElementById('app');

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }
function fmt(n) { return parseFloat(n.toFixed(4)); }

function calcFromDeg(deg) {
  const r = toRad(deg);
  return {
    deg,
    tan: deg === 90 || deg === -90 ? null : fmt(Math.tan(r)),
    sin: fmt(Math.sin(r)),
    cos: fmt(Math.cos(r)),
  };
}

function calcFromTan(tan) {
  const deg = fmt(toDeg(Math.atan(tan)));
  const r = toRad(deg);
  return { deg, tan: fmt(tan), sin: fmt(Math.sin(r)), cos: fmt(Math.cos(r)) };
}

function calcFromSin(sin) {
  if (sin < -1 || sin > 1) return null;
  const deg = fmt(toDeg(Math.asin(sin)));
  const r = toRad(deg);
  return { deg, tan: fmt(Math.tan(r)), sin: fmt(sin), cos: fmt(Math.cos(r)) };
}

function calcFromCos(cos) {
  if (cos < -1 || cos > 1) return null;
  const deg = fmt(toDeg(Math.acos(cos)));
  const r = toRad(deg);
  return { deg, tan: fmt(Math.tan(r)), sin: fmt(Math.sin(r)), cos: fmt(cos) };
}

function renderTrigTable() {
  app.innerHTML = '';
  renderNavBar(app, { title: '三角函数表', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'trig-page';

  // 四行输入
  const fields = [
    { key: 'deg', label: '角度' },
    { key: 'tan', label: '正切(TAN)' },
    { key: 'sin', label: '正弦(SIN)' },
    { key: 'cos', label: '余弦(COS)' },
  ];

  const inputs = {};

  fields.forEach(f => {
    const row = document.createElement('div');
    row.className = 'trig-row';

    const label = document.createElement('span');
    label.className = 'trig-label';
    label.textContent = f.label;

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'trig-input';
    input.placeholder = '';
    if (f.key === 'deg') input.value = '30';

    inputs[f.key] = input;
    row.appendChild(label);
    row.appendChild(input);
    content.appendChild(row);
  });

  // 提示文字
  const tip = document.createElement('div');
  tip.className = 'trig-tip';
  tip.textContent = '任填一项可以计算出其他数据';
  content.appendChild(tip);

  // 按钮行
  const btnRow = document.createElement('div');
  btnRow.className = 'trig-btn-row';

  const btnClear = document.createElement('button');
  btnClear.className = 'trig-btn';
  btnClear.textContent = '清空';

  const btnCalc = document.createElement('button');
  btnCalc.className = 'trig-btn';
  btnCalc.textContent = '查看';

  btnRow.appendChild(btnClear);
  btnRow.appendChild(btnCalc);
  content.appendChild(btnRow);

  app.appendChild(content);

  // 清空
  btnClear.addEventListener('click', () => {
    Object.values(inputs).forEach(inp => inp.value = '');
  });

  // 计算
  btnCalc.addEventListener('click', () => {
    const v = {};
    Object.entries(inputs).forEach(([k, inp]) => {
      const s = inp.value.trim();
      v[k] = s === '' ? null : parseFloat(s);
    });

    let result = null;
    if (v.deg !== null && !isNaN(v.deg))       result = calcFromDeg(v.deg);
    else if (v.tan !== null && !isNaN(v.tan))  result = calcFromTan(v.tan);
    else if (v.sin !== null && !isNaN(v.sin))  result = calcFromSin(v.sin);
    else if (v.cos !== null && !isNaN(v.cos))  result = calcFromCos(v.cos);

    if (!result) return;

    inputs.deg.value = result.deg ?? '';
    inputs.tan.value = result.tan !== null ? result.tan : '无穷大';
    inputs.sin.value = result.sin ?? '';
    inputs.cos.value = result.cos ?? '';
  });
}

export function registerRoutes(router) {
  router.register('#/trig-table', () => renderTrigTable());
}
