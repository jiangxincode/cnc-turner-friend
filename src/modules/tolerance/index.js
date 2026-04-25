import { renderNavBar } from '../../components/nav-bar.js';
import { IT_GRADES, SHAFT_BANDS, HOLE_BANDS, getShaftBaseDev, getHoleBaseDev, getITValue } from '../../data/tolerance-data.js';

const app = document.getElementById('app');

// 格式化偏差值（μm -> mm，保留3位小数，去掉末尾0）
function fmtDev(um) {
  if (um === null || um === undefined) return null;
  return parseFloat((um / 1000).toFixed(3));
}

// 计算公差结果
function calcTolerance(isShaft, band, grade, diameter) {
  const itVal = getITValue(diameter, grade); // μm
  if (itVal === null || itVal === undefined) return null;

  if (isShaft) {
    if (band === 'js') {
      return { upper: fmtDev(itVal / 2), lower: fmtDev(-itVal / 2), it: fmtDev(itVal), isSymmetric: true };
    }
    // a~h: 基本偏差为 es（上偏差），ei = es - IT
    // j~zc: 基本偏差为 ei（下偏差），es = ei + IT
    const baseDev = getShaftBaseDev(band, diameter, grade);
    if (baseDev === null) return null;
    const isUpperBase = 'abcdefgh'.includes(band[0]); // a~h 基本偏差是 es
    let es, ei;
    if (isUpperBase) {
      es = baseDev;       // es 是基本偏差
      ei = es - itVal;
    } else {
      ei = baseDev;       // ei 是基本偏差
      es = ei + itVal;
    }
    return { upper: fmtDev(es), lower: fmtDev(ei), it: fmtDev(itVal), isSymmetric: false };
  } else {
    if (band === 'JS') {
      return { upper: fmtDev(itVal / 2), lower: fmtDev(-itVal / 2), it: fmtDev(itVal), isSymmetric: true };
    }
    // A~H: 基本偏差为 EI（下偏差），ES = EI + IT
    // J~ZC: 基本偏差为 ES（上偏差），EI = ES - IT
    const baseDev = getHoleBaseDev(band, diameter, grade);
    if (baseDev === null) return null;
    const isLowerBase = 'ABCDEFGH'.includes(band[0]); // A~H 基本偏差是 EI
    let ES, EI;
    if (isLowerBase) {
      EI = baseDev;       // EI 是基本偏差
      ES = EI + itVal;
    } else {
      ES = baseDev;       // ES 是基本偏差
      EI = ES - itVal;
    }
    return { upper: fmtDev(ES), lower: fmtDev(EI), it: fmtDev(itVal), isSymmetric: false };
  }
}

// 格式化偏差显示（带符号）
function fmtSign(val) {
  if (val === null || val === undefined) return '—';
  if (val > 0) return '+' + val;
  return String(val);
}

function renderTolerancePage() {
  app.innerHTML = '';
  renderNavBar(app, { title: '公差等级', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.cssText = 'padding:44px 0 16px;';

  // ── 轴/孔 单选 ──
  const radioWrap = document.createElement('div');
  radioWrap.style.cssText = 'display:flex;gap:32px;justify-content:center;padding:16px 0 8px;';

  let isShaft = true;

  function makeRadio(label, checked) {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:15px;cursor:pointer;';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'type';
    input.style.cssText = 'width:18px;height:18px;accent-color:#1abc9c;cursor:pointer;';
    input.checked = checked;
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(label));
    return { wrap, input };
  }

  const { wrap: shaftWrap, input: shaftRadio } = makeRadio('轴', true);
  const { wrap: holeWrap, input: holeRadio } = makeRadio('孔', false);
  radioWrap.appendChild(shaftWrap);
  radioWrap.appendChild(holeWrap);
  content.appendChild(radioWrap);

  // ── 公称直径 ──
  const diamRow = document.createElement('div');
  diamRow.style.cssText = 'display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid #eee;';
  const diamLabel = document.createElement('span');
  diamLabel.textContent = '公称直径:';
  diamLabel.style.cssText = 'min-width:80px;font-size:14px;color:#333;';
  const diamInput = document.createElement('input');
  diamInput.type = 'number';
  diamInput.className = 'form-input';
  diamInput.value = '30';
  diamInput.min = '1';
  diamInput.max = '500';
  diamInput.style.cssText = 'flex:1;text-align:right;';
  diamRow.appendChild(diamLabel);
  diamRow.appendChild(diamInput);
  content.appendChild(diamRow);

  // ── 公差带 ──
  const bandRow = document.createElement('div');
  bandRow.style.cssText = 'display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid #eee;';
  const bandLabel = document.createElement('span');
  bandLabel.textContent = '公差带:';
  bandLabel.style.cssText = 'min-width:80px;font-size:14px;color:#333;';
  const bandSelect = document.createElement('select');
  bandSelect.className = 'form-input';
  bandSelect.style.cssText = 'flex:1;';
  bandRow.appendChild(bandLabel);
  bandRow.appendChild(bandSelect);
  content.appendChild(bandRow);

  // ── 公差等级 ──
  const gradeRow = document.createElement('div');
  gradeRow.style.cssText = 'display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid #eee;';
  const gradeLabel = document.createElement('span');
  gradeLabel.textContent = '公差等级:';
  gradeLabel.style.cssText = 'min-width:80px;font-size:14px;color:#333;';
  const gradeSelect = document.createElement('select');
  gradeSelect.className = 'form-input';
  gradeSelect.style.cssText = 'flex:1;';
  IT_GRADES.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    if (g === 'IT7') opt.selected = true;
    gradeSelect.appendChild(opt);
  });
  gradeRow.appendChild(gradeLabel);
  gradeRow.appendChild(gradeSelect);
  content.appendChild(gradeRow);

  // ── 结果展示 + 查看按钮 ──
  const actionRow = document.createElement('div');
  actionRow.style.cssText = 'display:flex;align-items:center;padding:16px;gap:16px;';

  const resultDisplay = document.createElement('div');
  resultDisplay.style.cssText = 'flex:1;font-size:28px;font-weight:bold;color:#333;line-height:1.2;';
  resultDisplay.textContent = '—';

  const viewBtn = document.createElement('button');
  viewBtn.textContent = '查看';
  viewBtn.style.cssText = 'background:#1abc9c;color:#fff;border:none;border-radius:6px;padding:12px 28px;font-size:16px;cursor:pointer;white-space:nowrap;';
  viewBtn.addEventListener('touchstart', () => { viewBtn.style.opacity = '0.85'; }, { passive: true });
  viewBtn.addEventListener('touchend', () => { viewBtn.style.opacity = '1'; }, { passive: true });

  actionRow.appendChild(resultDisplay);
  actionRow.appendChild(viewBtn);
  content.appendChild(actionRow);

  // ── 计算结果详情 ──
  const detailArea = document.createElement('div');
  detailArea.style.cssText = 'padding:0 16px 8px;font-size:14px;color:#333;line-height:1.8;display:none;';
  content.appendChild(detailArea);

  // ── GB/T 1804-2000 参考表 ──
  const tableWrap = document.createElement('div');
  tableWrap.style.cssText = 'margin-top:8px;overflow-x:auto;';
  tableWrap.innerHTML = buildRefTable();
  content.appendChild(tableWrap);

  app.appendChild(content);

  // ── 填充公差带选项 ──
  function fillBandOptions() {
    bandSelect.innerHTML = '';
    const bands = isShaft ? SHAFT_BANDS : HOLE_BANDS;
    bands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      bandSelect.appendChild(opt);
    });
  }
  fillBandOptions();

  // ── 事件 ──
  shaftRadio.addEventListener('change', () => {
    if (shaftRadio.checked) { isShaft = true; fillBandOptions(); resetResult(); }
  });
  holeRadio.addEventListener('change', () => {
    if (holeRadio.checked) { isShaft = false; fillBandOptions(); resetResult(); }
  });
  diamInput.addEventListener('input', resetResult);
  bandSelect.addEventListener('change', resetResult);
  gradeSelect.addEventListener('change', resetResult);

  function resetResult() {
    resultDisplay.innerHTML = '<span style="font-size:28px;font-weight:bold;">' + (diamInput.value || '—') + '</span>';
    detailArea.style.display = 'none';
    detailArea.innerHTML = '';
  }

  viewBtn.addEventListener('click', () => {
    const d = parseFloat(diamInput.value);
    if (!d || d <= 0 || d > 500) {
      resultDisplay.textContent = '输入有误';
      detailArea.style.display = 'none';
      return;
    }
    const band = bandSelect.value;
    const grade = gradeSelect.value;
    const res = calcTolerance(isShaft, band, grade, d);

    if (!res) {
      resultDisplay.textContent = '无数据';
      detailArea.style.display = 'none';
      return;
    }

    const { upper, lower, it, isSymmetric } = res;
    if (isSymmetric) {
      resultDisplay.innerHTML = `<span style="font-size:28px;font-weight:bold;">${d}</span><sup style="font-size:14px;vertical-align:super;">±${it / 2}</sup>`;
    } else {
      resultDisplay.innerHTML = `
        <span style="font-size:28px;font-weight:bold;">${d}</span>
        <span style="display:inline-flex;flex-direction:column;font-size:13px;font-weight:normal;vertical-align:middle;margin-left:2px;line-height:1.3;">
          <span>${fmtSign(upper)}</span>
          <span>${fmtSign(lower)}</span>
        </span>`;
    }
    const maxSize = parseFloat((d + (upper || 0)).toFixed(3));
    const minSize = parseFloat((d + (lower || 0)).toFixed(3));
    const gradeNum = grade.replace('IT', '');
    detailArea.style.display = 'block';
    detailArea.innerHTML = `
      <div>${d}${band}${gradeNum}</div>
      <div>公差=${it}</div>
      <div>最大尺寸=${maxSize}</div>
      <div>最小尺寸=${minSize}</div>`;
  });
}

// 构建 GB/T 1804-2000 参考表格 HTML
function buildRefTable() {
  return `
<div style="font-size:12px;padding:0 8px;">
  <div style="text-align:center;font-size:12px;color:#555;margin-bottom:4px;">GB/T 1804-2000</div>

  <table style="width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed;">
    <caption style="font-size:11px;font-weight:bold;padding:4px 0;text-align:center;">表1 线性尺寸的极限偏差数值 <span style="float:right;font-size:10px;">mm</span></caption>
    <colgroup>
      <col style="width:10%;">
      <col><col><col><col><col><col><col><col>
    </colgroup>
    <thead>
      <tr>
        <th rowspan="2" style="border:1px solid #ccc;padding:3px 2px;background:#f0f0f0;word-break:keep-all;">公差等级</th>
        <th colspan="8" style="border:1px solid #ccc;padding:3px 2px;background:#f0f0f0;text-align:center;">基本尺寸分段</th>
      </tr>
      <tr>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">0.5~3</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">&gt;3~6</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">&gt;6~30</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">&gt;30~120</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">&gt;120~400</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">&gt;400~1000</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">&gt;1000~2000</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;word-break:break-all;">&gt;2000~4000</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">精密f</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.05</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.05</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.15</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.3</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">—</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">中等m</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.3</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.8</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1.2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">粗糙c</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.3</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.8</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1.2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±3</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±4</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">最粗v</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">—</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±4</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±6</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±8</td></tr>
    </tbody>
  </table>

  <table style="width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed;margin-top:10px;">
    <caption style="font-size:11px;font-weight:bold;padding:4px 0;text-align:center;">表2 倒圆半径和倒角高度尺寸的极限偏差数值</caption>
    <thead>
      <tr>
        <th rowspan="2" style="border:1px solid #ccc;padding:3px 2px;background:#f0f0f0;width:18%;">公差等级</th>
        <th colspan="4" style="border:1px solid #ccc;padding:3px 2px;background:#f0f0f0;text-align:center;">基本尺寸分段</th>
      </tr>
      <tr>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">0.5~3</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">&gt;3~6</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">&gt;6~30</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">&gt;30</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">精密f</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">中等m</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.5</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">粗糙c</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.4</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±4</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">最粗v</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±0.4</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±4</td></tr>
    </tbody>
  </table>
  <div style="font-size:10px;color:#666;padding:4px 0 8px;">注：倒圆半径和倒角高度的含义参见GB/T 6403.4</div>

  <table style="width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed;margin-top:4px;">
    <caption style="font-size:11px;font-weight:bold;padding:4px 0;text-align:center;">表3 角度尺寸的极限偏差数值</caption>
    <thead>
      <tr>
        <th rowspan="2" style="border:1px solid #ccc;padding:3px 2px;background:#f0f0f0;width:18%;">公差等级</th>
        <th colspan="5" style="border:1px solid #ccc;padding:3px 2px;background:#f0f0f0;text-align:center;">长度分段</th>
      </tr>
      <tr>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">~10</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">&gt;10~50</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">&gt;50~120</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">&gt;120~400</th>
        <th style="border:1px solid #ccc;padding:2px 1px;background:#f5f5f5;font-size:9px;">&gt;400</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">精密f</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1°</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±30′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±20′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±10′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±5′</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">中等m</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1°</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±30′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±20′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±10′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±5′</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">粗糙c</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1°30′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1°</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±30′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±15′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±10′</td></tr>
      <tr><td style="border:1px solid #ccc;padding:2px 3px;background:#f5f5f5;">最粗v</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±3°</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±2°</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±1°</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±30′</td><td style="border:1px solid #ccc;padding:2px 1px;text-align:center;">±20′</td></tr>
    </tbody>
  </table>
</div>`;
}

export function registerRoutes(router) {
  router.register('#/tolerance', () => renderTolerancePage());
}
