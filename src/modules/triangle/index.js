import { renderNavBar } from '../../components/nav-bar.js';
import CalcUtils from '../../utils/calc-utils.js';

const app = document.getElementById('app');

function renderTrianglePage() {
  app.innerHTML = '';
  renderNavBar(app, { title: '解三角形', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.padding = '44px 16px 16px';

  // 三角形类型选择
  const typeRow = document.createElement('div');
  typeRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;align-items:center;';
  const typeLabel = document.createElement('span');
  typeLabel.textContent = '三角形类型：';
  typeLabel.style.cssText = 'font-size:14px;color:#333;white-space:nowrap;';
  const typeSelect = document.createElement('select');
  typeSelect.className = 'form-input';
  typeSelect.style.flex = '1';
  [
    { value: 'right', label: '直角三角形（B=90°）' },
    { value: 'general', label: '任意三角形' },
  ].forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    typeSelect.appendChild(o);
  });
  typeRow.appendChild(typeLabel);
  typeRow.appendChild(typeSelect);
  content.appendChild(typeRow);

  // 提示文字
  const tip = document.createElement('div');
  tip.style.cssText = 'font-size:12px;color:#888;margin-bottom:12px;padding:8px;background:#f9f9f9;border-radius:4px;';
  tip.textContent = '直角三角形：任填一个角度和一条边，或任填两条边即可计算';
  content.appendChild(tip);

  // 输入字段
  const fields = [
    { id: 'A', label: 'A角(°)' },
    { id: 'a', label: 'a边(mm)' },
    { id: 'B', label: 'B角(°)' },
    { id: 'b', label: 'b边(mm)' },
    { id: 'C', label: 'C角(°)' },
    { id: 'c', label: 'c边(mm)' },
  ];

  const form = document.createElement('div');
  fields.forEach(field => {
    const row = document.createElement('div');
    row.className = 'form-row';
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = field.label;
    const wrap = document.createElement('div');
    wrap.className = 'form-input-wrap';
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-input';
    input.dataset.id = field.id;
    input.placeholder = '可选';
    // B角在直角三角形时固定为90
    if (field.id === 'B') {
      input.value = '90';
      input.style.color = '#aaa';
    }
    wrap.appendChild(input);
    row.appendChild(label);
    row.appendChild(wrap);
    form.appendChild(row);
  });
  content.appendChild(form);

  // 类型切换时更新B角
  typeSelect.addEventListener('change', () => {
    const bInput = app.querySelector('[data-id="B"]');
    if (typeSelect.value === 'right') {
      bInput.value = '90';
      bInput.readOnly = true;
      bInput.style.color = '#aaa';
      tip.textContent = '直角三角形：任填一个角度和一条边，或任填两条边即可计算';
    } else {
      bInput.value = '';
      bInput.readOnly = false;
      bInput.style.color = '';
      tip.textContent = '任意三角形：填写三条边，或填写一个角度和两条边，或填写两个角度和一条边';
    }
  });

  // 按钮区域
  const btnArea = document.createElement('div');
  btnArea.style.cssText = 'display:flex;gap:8px;padding:12px 0;';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn-primary';
  clearBtn.style.cssText = 'flex:1;background:#95a5a6;';
  clearBtn.textContent = '清空';
  clearBtn.addEventListener('click', () => {
    fields.forEach(f => {
      const el = app.querySelector(`[data-id="${f.id}"]`);
      if (el) {
        if (f.id === 'B' && typeSelect.value === 'right') {
          el.value = '90';
        } else {
          el.value = '';
        }
      }
    });
    resultArea.style.display = 'none';
  });

  const calcBtn = document.createElement('button');
  calcBtn.className = 'btn-primary';
  calcBtn.style.flex = '2';
  calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => calculate());

  btnArea.appendChild(clearBtn);
  btnArea.appendChild(calcBtn);
  content.appendChild(btnArea);

  // 结果区域
  const resultArea = document.createElement('div');
  resultArea.className = 'result-area';
  resultArea.style.display = 'none';
  content.appendChild(resultArea);

  app.appendChild(content);

  function getVal(id) {
    const el = app.querySelector(`[data-id="${id}"]`);
    if (!el || el.value.trim() === '') return null;
    const v = parseFloat(el.value);
    return isNaN(v) ? null : v;
  }

  function calculate() {
    const isRight = typeSelect.value === 'right';
    let A = getVal('A'), a = getVal('a');
    let B = isRight ? 90 : getVal('B');
    let b = getVal('b');
    let C = getVal('C'), c = getVal('c');

    try {
      let result;
      if (isRight) {
        result = solveRightTriangle(A, a, b, c, C);
      } else {
        result = solveGeneralTriangle(A, a, B, b, C, c);
      }

      resultArea.style.display = 'block';
      resultArea.innerHTML = `
        <div class="result-row"><span class="result-label">A角</span><span class="result-value">${result.A !== null ? result.A.toFixed(4) + '°' : '-'}</span></div>
        <div class="result-row"><span class="result-label">a边</span><span class="result-value">${result.a !== null ? result.a.toFixed(4) : '-'}</span></div>
        <div class="result-row"><span class="result-label">B角</span><span class="result-value">${result.B !== null ? result.B.toFixed(4) + '°' : '-'}</span></div>
        <div class="result-row"><span class="result-label">b边</span><span class="result-value">${result.b !== null ? result.b.toFixed(4) : '-'}</span></div>
        <div class="result-row"><span class="result-label">C角</span><span class="result-value">${result.C !== null ? result.C.toFixed(4) + '°' : '-'}</span></div>
        <div class="result-row"><span class="result-label">c边</span><span class="result-value">${result.c !== null ? result.c.toFixed(4) : '-'}</span></div>
      `;
    } catch (e) {
      resultArea.style.display = 'block';
      resultArea.innerHTML = `<div class="error-tip">${e.message}</div>`;
    }
  }
}

/**
 * 解直角三角形（B=90°）
 * a对A角，b对B角（斜边），c对C角
 */
function solveRightTriangle(A, a, b, c, C) {
  // B = 90°，A + C = 90°
  let result = { A, a, B: 90, b, C, c };

  // 补全角度
  if (result.A !== null && result.C === null) result.C = 90 - result.A;
  if (result.C !== null && result.A === null) result.A = 90 - result.C;

  // 用已知边和角计算
  if (result.b !== null && result.A !== null) {
    result.a = CalcUtils.roundTo(result.b * CalcUtils.sinDeg(result.A), 4);
    result.c = CalcUtils.roundTo(result.b * CalcUtils.cosDeg(result.A), 4);
  } else if (result.a !== null && result.A !== null) {
    result.b = CalcUtils.roundTo(result.a / CalcUtils.sinDeg(result.A), 4);
    result.c = CalcUtils.roundTo(result.a * CalcUtils.cosDeg(result.A) / CalcUtils.sinDeg(result.A), 4);
  } else if (result.a !== null && result.c !== null) {
    result.b = CalcUtils.roundTo(Math.sqrt(result.a ** 2 + result.c ** 2), 4);
    result.A = CalcUtils.roundTo(CalcUtils.atan2Deg(result.a, result.c), 4);
    result.C = 90 - result.A;
  } else if (result.a !== null && result.b !== null) {
    result.A = CalcUtils.roundTo(CalcUtils.asinDeg(result.a / result.b), 4);
    result.C = 90 - result.A;
    result.c = CalcUtils.roundTo(Math.sqrt(result.b ** 2 - result.a ** 2), 4);
  } else if (result.c !== null && result.b !== null) {
    result.C = CalcUtils.roundTo(CalcUtils.asinDeg(result.c / result.b), 4);
    result.A = 90 - result.C;
    result.a = CalcUtils.roundTo(Math.sqrt(result.b ** 2 - result.c ** 2), 4);
  } else {
    throw new Error('条件不足，无法求解。请至少输入两个已知量。');
  }

  return result;
}

/**
 * 解任意三角形（正弦定理、余弦定理）
 */
function solveGeneralTriangle(A, a, B, b, C, c) {
  let result = { A, a, B, b, C, c };

  // 补全角度
  const knownAngles = [result.A, result.B, result.C].filter(v => v !== null);
  if (knownAngles.length === 2) {
    if (result.A === null) result.A = 180 - result.B - result.C;
    else if (result.B === null) result.B = 180 - result.A - result.C;
    else if (result.C === null) result.C = 180 - result.A - result.B;
  }

  // SSS：三边已知
  if (result.a !== null && result.b !== null && result.c !== null) {
    const cosA = (result.b ** 2 + result.c ** 2 - result.a ** 2) / (2 * result.b * result.c);
    if (Math.abs(cosA) > 1) throw new Error('三边不能构成三角形');
    result.A = CalcUtils.roundTo(CalcUtils.acosDeg(cosA), 4);
    const cosB = (result.a ** 2 + result.c ** 2 - result.b ** 2) / (2 * result.a * result.c);
    result.B = CalcUtils.roundTo(CalcUtils.acosDeg(cosB), 4);
    result.C = CalcUtils.roundTo(180 - result.A - result.B, 4);
    return result;
  }

  // 用正弦定理补全
  const pairs = [
    [result.A, result.a],
    [result.B, result.b],
    [result.C, result.c],
  ];
  const knownPair = pairs.find(([ang, side]) => ang !== null && side !== null);

  if (knownPair) {
    const [knownAng, knownSide] = knownPair;
    const k = knownSide / CalcUtils.sinDeg(knownAng); // 正弦定理比值

    pairs.forEach(([ang, side], i) => {
      if (ang !== null && side === null) {
        result[['a', 'b', 'c'][i]] = CalcUtils.roundTo(k * CalcUtils.sinDeg(ang), 4);
      } else if (ang === null && side !== null) {
        const sinVal = side / k;
        if (Math.abs(sinVal) > 1) throw new Error('参数不合法，无法构成三角形');
        result[['A', 'B', 'C'][i]] = CalcUtils.roundTo(CalcUtils.asinDeg(sinVal), 4);
      }
    });

    // 再次补全角度
    const angles = [result.A, result.B, result.C];
    const nullIdx = angles.findIndex(v => v === null);
    if (nullIdx !== -1) {
      const sum = angles.filter(v => v !== null).reduce((s, v) => s + v, 0);
      result[['A', 'B', 'C'][nullIdx]] = CalcUtils.roundTo(180 - sum, 4);
    }

    // 补全边
    pairs.forEach(([ang, side], i) => {
      if (result[['a', 'b', 'c'][i]] === null && result[['A', 'B', 'C'][i]] !== null) {
        result[['a', 'b', 'c'][i]] = CalcUtils.roundTo(k * CalcUtils.sinDeg(result[['A', 'B', 'C'][i]]), 4);
      }
    });

    return result;
  }

  throw new Error('条件不足，无法唯一确定三角形。请至少输入三个已知量（包含一条边）。');
}

export function registerRoutes(router) {
  router.register('#/triangle', () => renderTrianglePage());
}
