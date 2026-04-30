import { renderCalcPage } from '../../components/calc-page.js';
import { renderListPage } from '../../components/list-page.js';
import { renderNavBar } from '../../components/nav-bar.js';
import { otherTypes } from '../../data/other-data.js';

const app = document.getElementById('app');

function renderOtherIndex() {
  renderListPage(app, {
    title: '其他计算',
    items: otherTypes.map(t => ({ name: t.title, route: `#/other/${t.id}` })),
  });
}

/**
 * 恒线速计算 - 自定义页面
 */
function renderHengXianSu() {
  app.innerHTML = '';
  function resetInputs() {
    const nInput = app.querySelector('[data-id="n"]');
    const dInput = app.querySelector('[data-id="D"]');
    const vcInput = app.querySelector('[data-id="vc"]');
    if (nInput) nInput.value = '';
    if (dInput) dInput.value = '';
    if (vcInput) vcInput.value = '';
  }
  renderNavBar(app, { title: '横线速计算', showBack: true, showReset: true, onReset: resetInputs });
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';
  const form = document.createElement('div');
  form.className = 'calc-form';
  // 第一行：转速 + 直径
  const row1 = document.createElement('div');
  row1.className = 'form-row';
  row1.style.cssText = 'display:flex;align-items:center;gap:12px;';
  const labelN = document.createElement('label');
  labelN.className = 'form-label'; labelN.textContent = '转速'; labelN.style.minWidth = '40px';
  const inputN = document.createElement('input');
  inputN.type = 'number'; inputN.className = 'form-input'; inputN.dataset.id = 'n'; inputN.value = '888'; inputN.style.flex = '1';
  const labelD = document.createElement('label');
  labelD.className = 'form-label'; labelD.textContent = '直径'; labelD.style.minWidth = '40px';
  const inputD = document.createElement('input');
  inputD.type = 'number'; inputD.className = 'form-input'; inputD.dataset.id = 'D'; inputD.value = '50'; inputD.style.flex = '1';
  row1.appendChild(labelN); row1.appendChild(inputN); row1.appendChild(labelD); row1.appendChild(inputD);
  form.appendChild(row1);
  // 第二行：线速
  const row2 = document.createElement('div');
  row2.className = 'form-row';
  row2.style.cssText = 'display:flex;align-items:center;gap:12px;';
  const labelVc = document.createElement('label');
  labelVc.className = 'form-label'; labelVc.textContent = '线速'; labelVc.style.minWidth = '40px';
  const inputVc = document.createElement('input');
  inputVc.type = 'number'; inputVc.className = 'form-input'; inputVc.dataset.id = 'vc'; inputVc.style.flex = '1';
  row2.appendChild(labelVc); row2.appendChild(inputVc);
  form.appendChild(row2);
  pageContent.appendChild(form);
  // 计算按钮
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:12px 16px;text-align:center;';
  const calcBtn = document.createElement('button');
  calcBtn.className = 'btn-primary'; calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => {
    const nVal = inputN.value.trim(), dVal = inputD.value.trim(), vcVal = inputVc.value.trim();
    const n = nVal === '' ? NaN : parseFloat(nVal);
    const D = dVal === '' ? NaN : parseFloat(dVal);
    const vc = vcVal === '' ? NaN : parseFloat(vcVal);
    const hasN = !isNaN(n) && nVal !== '', hasD = !isNaN(D) && dVal !== '', hasVc = !isNaN(vc) && vcVal !== '';
    if ((hasN ? 1 : 0) + (hasD ? 1 : 0) + (hasVc ? 1 : 0) < 2) { alert('请至少填写两项'); return; }
    if (!hasVc && hasN && hasD) { inputVc.value = Math.ceil(Math.PI * D * n / 1000); }
    else if (!hasN && hasD && hasVc) { inputN.value = Math.ceil(vc * 1000 / (Math.PI * D)); }
    else if (!hasD && hasN && hasVc) { inputD.value = Math.ceil(vc * 1000 / (Math.PI * n)); }
    else { inputVc.value = Math.ceil(Math.PI * D * n / 1000); }
  });
  btnWrap.appendChild(calcBtn); pageContent.appendChild(btnWrap);
  const tipBar = document.createElement('div');
  tipBar.style.cssText = 'background:magenta;color:#fff;text-align:center;padding:8px 0;font-size:15px;font-weight:bold;';
  tipBar.textContent = '三项任填两项可计算另一项';
  pageContent.appendChild(tipBar);
  const warning = document.createElement('div');
  warning.style.cssText = 'color:red;font-size:24px;font-weight:bold;text-align:center;padding:24px 16px;';
  warning.textContent = '注意车床极限转速！！！';
  pageContent.appendChild(warning);
  app.appendChild(pageContent);
}

/**
 * 螺纹测量 - 自定义页面
 * 支持三针测量和单针测量两种模式
 * 三针公式：d2 = M - dp*(1 + 1/sin(α/2)) + P/(2*tan(α/2))
 * 单针公式：d2 = 2*M - D - dp*(1 + 1/sin(α/2)) + P/(2*tan(α/2))
 */
function renderLuoWenCeLiang() {
  app.innerHTML = '';
  let mode = 'sanzhen'; // 'sanzhen' | 'danzhen'

  function render() {
    app.innerHTML = '';
    renderNavBar(app, { title: '螺纹测量', showBack: true, showReset: true, onReset: () => render() });

    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';

    // 示意图
    const diagramArea = document.createElement('div');
    diagramArea.className = 'diagram-area';
    const img = document.createElement('img');
    img.src = mode === 'sanzhen' ? 'static/thread/SZluowenceliang.png' : 'static/thread/DZluowenceliang.png';
    img.alt = '螺纹测量';
    img.onerror = () => { diagramArea.innerHTML = '<span style="color:#999;font-size:13px;">图片加载失败</span>'; };
    diagramArea.appendChild(img);
    pageContent.appendChild(diagramArea);

    // 模式切换
    const modeRow = document.createElement('div');
    modeRow.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:20px;padding:10px 0;';
    const labelSZ = document.createElement('label');
    labelSZ.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:15px;';
    const radioSZ = document.createElement('input');
    radioSZ.type = 'radio'; radioSZ.name = 'lwmode'; radioSZ.value = 'sanzhen';
    radioSZ.checked = mode === 'sanzhen';
    radioSZ.addEventListener('change', () => { mode = 'sanzhen'; render(); });
    labelSZ.appendChild(radioSZ);
    labelSZ.appendChild(document.createTextNode('三针测量'));
    const labelDZ = document.createElement('label');
    labelDZ.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:15px;';
    const radioDZ = document.createElement('input');
    radioDZ.type = 'radio'; radioDZ.name = 'lwmode'; radioDZ.value = 'danzhen';
    radioDZ.checked = mode === 'danzhen';
    radioDZ.addEventListener('change', () => { mode = 'danzhen'; render(); });
    labelDZ.appendChild(radioDZ);
    labelDZ.appendChild(document.createTextNode('单针测量'));
    modeRow.appendChild(labelSZ);
    modeRow.appendChild(labelDZ);
    pageContent.appendChild(modeRow);

    // 表单
    const form = document.createElement('div');
    form.className = 'calc-form';

    function makeInputRow(items) {
      const row = document.createElement('div');
      row.className = 'form-row';
      row.style.cssText = 'display:flex;align-items:center;gap:8px;';
      items.forEach(item => {
        const lbl = document.createElement('label');
        lbl.className = 'form-label'; lbl.textContent = item.label; lbl.style.minWidth = '36px';
        const inp = document.createElement('input');
        inp.type = 'number'; inp.className = 'form-input'; inp.dataset.id = item.id;
        if (item.value !== undefined) inp.value = item.value;
        inp.style.flex = '1';
        row.appendChild(lbl); row.appendChild(inp);
      });
      return row;
    }

    if (mode === 'sanzhen') {
      form.appendChild(makeInputRow([
        { id: 'P', label: '螺距', value: '1.5' },
        { id: 'alpha', label: '角度', value: '60' },
        { id: 'dp', label: '量针直径', value: '0.866' },
      ]));
    } else {
      form.appendChild(makeInputRow([
        { id: 'D', label: '直径', value: '24' },
        { id: 'P', label: '螺距', value: '1.5' },
        { id: 'alpha', label: '角度', value: '60' },
      ]));
      // 量针直径单独一行
      const dpRow = document.createElement('div');
      dpRow.className = 'form-row';
      dpRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
      const dpLabel = document.createElement('span');
      dpLabel.style.cssText = 'font-size:15px;font-weight:bold;';
      dpLabel.textContent = '量针直径';
      const dpVal = document.createElement('span');
      dpVal.style.cssText = 'font-size:15px;margin-left:8px;';
      dpVal.textContent = '0.866';
      dpVal.dataset.id = 'dp-display';
      dpRow.appendChild(dpLabel); dpRow.appendChild(dpVal);
      form.appendChild(dpRow);
    }
    pageContent.appendChild(form);

    // 提示文字
    const P0 = 1.5, alpha0 = 60;
    const halfRad0 = (alpha0 / 2) * Math.PI / 180;
    const dpBest = (P0 / 2) / Math.cos(halfRad0);
    const dpMin = dpBest * 0.875;
    const dpMax = dpBest * 1.75;
    const tipArea = document.createElement('div');
    tipArea.style.cssText = 'padding:4px 16px;font-size:12px;';
    tipArea.innerHTML = `
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#00aaff;">↑上面必须全部填写↑</span>
        <span>量针直径推荐${dpMax.toFixed(3)}~${dpMin.toFixed(3)}mm</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#00aaff;">↓下面任填一项↓</span>
        <span>建议量针直径为${dpBest.toFixed(3)}mm</span>
      </div>
    `;
    pageContent.appendChild(tipArea);

    // 实测M值 + 实际中径
    const bottomForm = document.createElement('div');
    bottomForm.className = 'calc-form';
    bottomForm.style.cssText = 'padding:8px 16px;';
    const bottomRow = document.createElement('div');
    bottomRow.className = 'form-row';
    bottomRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
    const lblM = document.createElement('label');
    lblM.style.cssText = 'font-size:15px;font-weight:bold;min-width:70px;';
    lblM.textContent = '实测M值';
    const inputM = document.createElement('input');
    inputM.type = 'number'; inputM.className = 'form-input'; inputM.dataset.id = 'M';
    inputM.value = '24.325'; inputM.style.flex = '1';
    const lblD2 = document.createElement('label');
    lblD2.style.cssText = 'font-size:15px;font-weight:bold;min-width:70px;';
    lblD2.textContent = '实际中径';
    const inputD2 = document.createElement('input');
    inputD2.type = 'number'; inputD2.className = 'form-input'; inputD2.dataset.id = 'd2';
    inputD2.style.flex = '1';
    bottomRow.appendChild(lblM); bottomRow.appendChild(inputM);
    bottomRow.appendChild(lblD2); bottomRow.appendChild(inputD2);
    bottomForm.appendChild(bottomRow);
    pageContent.appendChild(bottomForm);

    // 计算按钮
    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'padding:12px 16px;text-align:center;';
    const calcBtn = document.createElement('button');
    calcBtn.className = 'btn-primary'; calcBtn.textContent = '计算';
    calcBtn.addEventListener('click', () => {
      const P = parseFloat(form.querySelector('[data-id="P"]')?.value);
      const alpha = parseFloat(form.querySelector('[data-id="alpha"]')?.value);
      const M = parseFloat(inputM.value);
      const halfAlphaRad = (alpha / 2) * Math.PI / 180;
      const sinHalf = Math.sin(halfAlphaRad);
      const cosHalf = Math.cos(halfAlphaRad);
      const tanHalf = Math.tan(halfAlphaRad);

      if (mode === 'sanzhen') {
        const dp = parseFloat(form.querySelector('[data-id="dp"]')?.value);
        if (isNaN(P) || isNaN(alpha) || isNaN(dp)) { alert('请填写螺距、角度和量针直径'); return; }
        if (isNaN(M)) { alert('请填写实测M值'); return; }
        // d2 = M - dp*(1 + 1/sin(α/2)) + P/(2*tan(α/2))
        const d2 = M - dp * (1 + 1 / sinHalf) + P / (2 * tanHalf);
        inputD2.value = (Math.round(d2 * 1000) / 1000).toFixed(3);
      } else {
        const D = parseFloat(form.querySelector('[data-id="D"]')?.value);
        const dpDisplay = pageContent.querySelector('[data-id="dp-display"]');
        const dp = parseFloat(dpDisplay?.textContent || '0.866');
        if (isNaN(D) || isNaN(P) || isNaN(alpha) || isNaN(dp)) { alert('请填写直径、螺距和角度'); return; }
        if (isNaN(M)) { alert('请填写实测M值'); return; }
        // d2 = 2*M - D - dp*(1 + 1/sin(α/2)) + P/(2*tan(α/2))
        const d2 = 2 * M - D - dp * (1 + 1 / sinHalf) + P / (2 * tanHalf);
        inputD2.value = (Math.round(d2 * 1000) / 1000).toFixed(3);
      }
    });
    btnWrap.appendChild(calcBtn);
    pageContent.appendChild(btnWrap);
    app.appendChild(pageContent);
  }

  render();
}

/**
 * 光洁度计算 - 自定义页面
 * 三项（走刀速度f、刀尖圆弧R、粗糙度Ra）任填两项可计算另一项
 * 公式：Ra(μm) = f² * 1000 / (8 * R)  (f单位mm/r, R单位mm)
 */
function renderGuangJieDu() {
  app.innerHTML = '';
  function resetInputs() {
    const fInput = app.querySelector('[data-id="f"]');
    const rInput = app.querySelector('[data-id="R"]');
    const raInput = app.querySelector('[data-id="Ra"]');
    if (fInput) fInput.value = '';
    if (rInput) rInput.value = '';
    if (raInput) raInput.value = '';
  }
  renderNavBar(app, { title: '光洁度计算', showBack: true, showReset: true, onReset: resetInputs });
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';
  const form = document.createElement('div');
  form.className = 'calc-form';
  // 第一行：走刀速度 + 刀尖圆弧
  const row1 = document.createElement('div');
  row1.className = 'form-row';
  row1.style.cssText = 'display:flex;align-items:center;gap:12px;';
  const labelF = document.createElement('label');
  labelF.className = 'form-label'; labelF.textContent = '走刀速度'; labelF.style.minWidth = '60px';
  const inputF = document.createElement('input');
  inputF.type = 'number'; inputF.className = 'form-input'; inputF.dataset.id = 'f'; inputF.value = '0.2'; inputF.style.flex = '1';
  const labelR = document.createElement('label');
  labelR.className = 'form-label'; labelR.textContent = '刀尖圆弧'; labelR.style.minWidth = '60px';
  const inputR = document.createElement('input');
  inputR.type = 'number'; inputR.className = 'form-input'; inputR.dataset.id = 'R'; inputR.value = '0.8'; inputR.style.flex = '1';
  row1.appendChild(labelF); row1.appendChild(inputF); row1.appendChild(labelR); row1.appendChild(inputR);
  form.appendChild(row1);
  // 第二行：粗糙度
  const row2 = document.createElement('div');
  row2.className = 'form-row';
  row2.style.cssText = 'display:flex;align-items:center;gap:12px;';
  const labelRa = document.createElement('label');
  labelRa.className = 'form-label'; labelRa.textContent = '粗糙度'; labelRa.style.minWidth = '60px';
  const inputRa = document.createElement('input');
  inputRa.type = 'number'; inputRa.className = 'form-input'; inputRa.dataset.id = 'Ra'; inputRa.style.flex = '1';
  row2.appendChild(labelRa); row2.appendChild(inputRa);
  form.appendChild(row2);
  pageContent.appendChild(form);
  // 计算按钮
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:12px 16px;text-align:center;';
  const calcBtn = document.createElement('button');
  calcBtn.className = 'btn-primary'; calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => {
    const fVal = inputF.value.trim(), rVal = inputR.value.trim(), raVal = inputRa.value.trim();
    const f = fVal === '' ? NaN : parseFloat(fVal);
    const R = rVal === '' ? NaN : parseFloat(rVal);
    const Ra = raVal === '' ? NaN : parseFloat(raVal);
    const hasF = !isNaN(f) && fVal !== '', hasR = !isNaN(R) && rVal !== '', hasRa = !isNaN(Ra) && raVal !== '';
    if ((hasF ? 1 : 0) + (hasR ? 1 : 0) + (hasRa ? 1 : 0) < 2) { alert('请至少填写两项'); return; }
    // Ra = f² * 1000 / (8 * R)
    if (!hasRa && hasF && hasR) {
      const result = Math.ceil(f * f * 1000 / (8 * R) * 10) / 10;
      inputRa.value = result;
    } else if (!hasF && hasR && hasRa) {
      // f = sqrt(Ra * 8 * R / 1000)
      const result = Math.sqrt(Ra * 8 * R / 1000);
      inputF.value = Math.round(result * 10000) / 10000;
    } else if (!hasR && hasF && hasRa) {
      // R = f² * 1000 / (8 * Ra)
      const result = f * f * 1000 / (8 * Ra);
      inputR.value = Math.round(result * 10000) / 10000;
    } else {
      const result = Math.ceil(f * f * 1000 / (8 * R) * 10) / 10;
      inputRa.value = result;
    }
  });
  btnWrap.appendChild(calcBtn); pageContent.appendChild(btnWrap);
  // 提示条
  const tipBar = document.createElement('div');
  tipBar.style.cssText = 'background:magenta;color:#fff;text-align:center;padding:8px 0;font-size:15px;font-weight:bold;';
  tipBar.textContent = '三项任填两项可计算另一项';
  pageContent.appendChild(tipBar);
  // 警告文字
  const warning = document.createElement('div');
  warning.style.cssText = 'color:red;font-size:20px;font-weight:bold;text-align:center;padding:24px 16px;line-height:1.6;';
  warning.textContent = '此计算只是理论 用作参考,各方面都有原因 材料 刀具 具体看实际操作';
  pageContent.appendChild(warning);
  app.appendChild(pageContent);
}

/**
 * 圆等分 - 自定义页面
 * 输入：大圆直径、等分孔数、起始角度、等分孔直径、圆心XY坐标
 * 输出：孔距、孔边距、各孔坐标，带Canvas示意图
 */
function renderYuanDengFen() {
  app.innerHTML = '';
  renderNavBar(app, { title: '圆等分', showBack: true, showReset: true, onReset: () => renderYuanDengFen() });
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';

  // Canvas 示意图
  const canvasWrap = document.createElement('div');
  canvasWrap.style.cssText = 'padding:8px 16px;position:relative;';
  const canvas = document.createElement('canvas');
  canvas.width = 360; canvas.height = 300;
  canvas.style.cssText = 'width:100%;max-width:360px;display:block;margin:0 auto;';
  canvasWrap.appendChild(canvas);
  pageContent.appendChild(canvasWrap);

  // 表单
  const form = document.createElement('div');
  form.className = 'calc-form';
  function makeRow(items) {
    const row = document.createElement('div');
    row.className = 'form-row';
    row.style.cssText = 'display:flex;align-items:center;gap:8px;';
    items.forEach(item => {
      const lbl = document.createElement('label');
      lbl.className = 'form-label'; lbl.textContent = item.label; lbl.style.minWidth = '70px';
      const inp = document.createElement('input');
      inp.type = 'number'; inp.className = 'form-input'; inp.dataset.id = item.id;
      if (item.value !== undefined) inp.value = item.value;
      inp.style.flex = '1';
      row.appendChild(lbl); row.appendChild(inp);
    });
    return row;
  }
  form.appendChild(makeRow([{ id: 'D', label: '大圆直径', value: '180' }, { id: 'n', label: '等分孔数', value: '3' }]));
  form.appendChild(makeRow([{ id: 'startAngle', label: '起始角度', value: '0' }, { id: 'holeDia', label: '等分孔直径', value: '5' }]));
  form.appendChild(makeRow([{ id: 'cx', label: '圆心X坐标', value: '0' }, { id: 'cy', label: '圆心Y坐标', value: '0' }]));
  pageContent.appendChild(form);

  // 按钮行：复制 + 计算
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;justify-content:center;gap:20px;padding:12px 16px;';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-primary';
  copyBtn.style.cssText = 'background:#dfe0e2;color:#333;';
  copyBtn.textContent = '复制';
  copyBtn.addEventListener('click', () => {
    const text = resultArea.textContent;
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('已复制')).catch(() => {});
    }
  });
  const calcBtn = document.createElement('button');
  calcBtn.className = 'btn-primary'; calcBtn.textContent = '计算';
  btnRow.appendChild(copyBtn); btnRow.appendChild(calcBtn);
  pageContent.appendChild(btnRow);

  // 结果区域
  const resultArea = document.createElement('div');
  resultArea.style.cssText = 'padding:8px 16px;font-size:15px;line-height:1.8;min-height:100px;white-space:pre-wrap;';
  pageContent.appendChild(resultArea);

  // 绘制示意图
  function drawDiagram(D, n, startAngle, holeDia, cx, cy) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const centerX = w / 2, centerY = h / 2 - 10;
    const R = Math.min(w, h) * 0.35;
    const holeR = Math.max(R * (holeDia / D), 4);

    // 画大圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke();

    // 画等分点
    for (let i = 0; i < n; i++) {
      const angleDeg = startAngle + i * (360 / n);
      const angleRad = angleDeg * Math.PI / 180;
      const px = centerX + R * Math.cos(angleRad);
      const py = centerY - R * Math.sin(angleRad);
      ctx.beginPath();
      ctx.arc(px, py, holeR, 0, Math.PI * 2);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'red'; ctx.font = 'bold 14px sans-serif';
      const numX = px + (holeR + 6) * Math.cos(angleRad);
      const numY = py - (holeR + 6) * Math.sin(angleRad);
      ctx.fillText(String(i + 1), numX - 4, numY + 5);
    }

    // XY坐标轴（左下角）
    const axisX = 20, axisY = h - 15;
    ctx.strokeStyle = 'red'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(axisX, axisY); ctx.lineTo(axisX + 30, axisY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(axisX, axisY); ctx.lineTo(axisX, axisY - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(axisX + 30, axisY); ctx.lineTo(axisX + 25, axisY - 3); ctx.lineTo(axisX + 25, axisY + 3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(axisX, axisY - 30); ctx.lineTo(axisX - 3, axisY - 25); ctx.lineTo(axisX + 3, axisY - 25); ctx.fill();
    ctx.fillStyle = 'red'; ctx.font = '12px sans-serif';
    ctx.fillText('X', axisX + 32, axisY + 4);
    ctx.fillText('Y', axisX - 4, axisY - 34);
  }

  drawDiagram(180, 3, 0, 5, 0, 0);

  calcBtn.addEventListener('click', () => {
    const D = parseFloat(form.querySelector('[data-id="D"]').value);
    const n = parseInt(form.querySelector('[data-id="n"]').value);
    const startAngle = parseFloat(form.querySelector('[data-id="startAngle"]').value) || 0;
    const holeDia = parseFloat(form.querySelector('[data-id="holeDia"]').value) || 0;
    const cx = parseFloat(form.querySelector('[data-id="cx"]').value) || 0;
    const cy = parseFloat(form.querySelector('[data-id="cy"]').value) || 0;

    if (isNaN(D) || D <= 0) { alert('大圆直径必须为正数'); return; }
    if (isNaN(n) || n < 2) { alert('等分孔数必须≥2'); return; }

    const R = D / 2;
    const angleDeg = 360 / n;
    const chord = Math.round(2 * R * Math.sin(angleDeg / 2 * Math.PI / 180) * 1000) / 1000;
    const edgeDist = Math.round((chord - holeDia) * 1000) / 1000;

    const lines = [];
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleDeg;
      const rad = a * Math.PI / 180;
      let x = R * Math.cos(rad) + cx;
      let y = R * Math.sin(rad) + cy;
      x = Math.round(x * 1000) / 1000;
      y = Math.round(y * 1000) / 1000;
      lines.push(`${i + 1}.X${x} Y${y}`);
    }

    let text = '';
    if (holeDia > 0) {
      text += `孔距:${chord}\n孔边距:${edgeDist}\n`;
    }
    text += '孔坐标:\n' + lines.join('\n');
    resultArea.textContent = text;
    drawDiagram(D, n, startAngle, holeDia, cx, cy);
  });

  app.appendChild(pageContent);
}

/**
 * 中心孔样式 - 自定义页面
 * 四种类型(A/B/C/R)切换，每种有不同图片和数据表格
 */
function renderZhongXinKong() {
  app.innerHTML = '';
  let currentType = 'A';

  const typeData = {
    A: {
      img: 'static/qita/Axing.png',
      cols: ['d', 'D', 'L2', 't'],
      rows: [
        ['(0.5)', '1.06', '0.48', '0.5'],
        ['(0.63)', '1.32', '0.60', '0.6'],
        ['(0.8)', '1.7', '0.78', '0.7'],
        ['1', '2.12', '0.97', '0.9'],
        ['(1.25)', '2.65', '1.21', '1.1'],
        ['1.6', '3.35', '1.52', '1.4'],
        ['2', '4.25', '1.95', '1.8'],
        ['2.5', '5.3', '2.42', '2.2'],
        ['3.15', '6.7', '3.07', '2.8'],
        ['4', '8.5', '3.9', '3.5'],
        ['(5)', '10.6', '4.85', '4.4'],
        ['6.3', '13.2', '5.98', '5.5'],
        ['(8)', '17', '7.79', '7.0'],
        ['10', '21.2', '9.7', '8.7'],
      ],
    },
    B: {
      img: 'static/qita/Bxing.png',
      cols: ['d', 'D1', 'D2', 'L2', 't'],
      rows: [
        ['1', '2.12', '3.15', '1.27', '0.9'],
        ['(1.25)', '2.65', '4', '1.6', '1.1'],
        ['1.6', '3.35', '5', '1.99', '1.4'],
        ['2', '4.25', '6.3', '2.54', '1.8'],
        ['2.5', '5.3', '8', '3.2', '2.2'],
        ['3.15', '6.7', '10', '4.03', '2.8'],
        ['4', '8.5', '12.5', '5.05', '3.5'],
        ['(5)', '10.6', '16', '6.41', '4.4'],
        ['6.3', '13.2', '18', '7.36', '5.5'],
        ['(8)', '17', '22.4', '9.36', '7'],
        ['10', '21.2', '28', '11.66', '8.7'],
      ],
    },
    C: {
      img: 'static/qita/Cxing.png',
      cols: ['d', 'D1', 'D2', 'D3', 'L', 'L1'],
      rows: [
        ['M3', '3.2', '5.3', '5.8', '2.6', '1.8'],
        ['M4', '4.3', '6.7', '7.4', '3.2', '2.1'],
        ['M5', '5.3', '8.1', '8.8', '4', '2.4'],
        ['M6', '6.4', '9.6', '10.5', '5', '2.8'],
        ['M8', '8.4', '12.2', '13.2', '6', '3.3'],
        ['M10', '10.5', '14.9', '16.3', '7.5', '3.8'],
        ['M12', '13', '18.1', '19.8', '9.5', '4.4'],
        ['M16', '17', '23', '25.3', '12', '5.2'],
        ['M20', '21', '28.4', '31.3', '15', '6.4'],
        ['M24', '26', '34.2', '38', '18', '8'],
      ],
    },
    R: {
      img: 'static/qita/Rxing.png',
      cols: ['d', 'D', 'L min', 'r max', 'r min'],
      rows: [
        ['1', '2.12', '2.3', '3.15', '2.5'],
        ['(1.25)', '2.65', '2.8', '4', '3.15'],
        ['1.6', '3.35', '3.5', '5', '4'],
        ['2', '4.25', '4.4', '6.3', '5'],
        ['2.5', '5.3', '5.5', '8', '6.3'],
        ['3.15', '6.7', '7', '10', '8'],
        ['4', '8.5', '8.9', '12.5', '10'],
        ['(5)', '10.6', '11.2', '16', '12.5'],
        ['6.3', '13.2', '14', '20', '16'],
        ['(8)', '17', '17.9', '25', '20'],
        ['10', '21.2', '22.5', '31.5', '25'],
      ],
    },
  };

  function render() {
    app.innerHTML = '';
    renderNavBar(app, { title: '中心孔样式', showBack: true });
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';

    // 示意图
    const diagramArea = document.createElement('div');
    diagramArea.className = 'diagram-area';
    const img = document.createElement('img');
    img.src = typeData[currentType].img;
    img.alt = currentType + '形中心孔';
    img.onerror = () => { diagramArea.innerHTML = '<span style="color:#999;font-size:13px;">图片加载失败</span>'; };
    diagramArea.appendChild(img);
    pageContent.appendChild(diagramArea);

    // 类型切换
    const modeRow = document.createElement('div');
    modeRow.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:16px;padding:10px 0;';
    ['A', 'B', 'C', 'R'].forEach(t => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:15px;';
      const radio = document.createElement('input');
      radio.type = 'radio'; radio.name = 'zhongxinkong'; radio.value = t;
      radio.checked = currentType === t;
      radio.addEventListener('change', () => { currentType = t; render(); });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(t + '形'));
      modeRow.appendChild(label);
    });
    pageContent.appendChild(modeRow);

    // 数据表格
    const data = typeData[currentType];
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:14px;text-align:center;';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    data.cols.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      th.style.cssText = 'border:1px solid #ccc;padding:6px 4px;background:#f5f5f5;font-weight:bold;';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    data.rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        td.style.cssText = 'border:1px solid #ccc;padding:6px 4px;';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    pageContent.appendChild(table);

    // 注释
    const notes = document.createElement('div');
    notes.style.cssText = 'padding:12px 16px;font-size:13px;line-height:1.8;color:#333;';
    notes.innerHTML = '注:<br>1.尺寸L1取决于中心钻的长度L1，即使中心钻重磨后使用，此值也不应小于t值。<br>2.表中同时列出D和L2尺寸，制造厂可以任选其中一个尺寸。<br>3.括号内的尺寸尽量不采用';
    pageContent.appendChild(notes);

    app.appendChild(pageContent);
  }

  render();
}

/**
 * G98 G99转换 - 自定义页面
 * 转速必填，G99 F和G98 F任填一项计算另一项
 * 公式：G98 F = G99 F × 转速
 */
function renderG98zhuanG99() {
  app.innerHTML = '';
  renderNavBar(app, { title: 'G98 G99转换', showBack: true, showReset: true, onReset: () => renderG98zhuanG99() });
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';

  // 蓝色背景区域（上方留白）
  const spacer = document.createElement('div');
  spacer.style.cssText = 'height:200px;background:#fff;';
  pageContent.appendChild(spacer);

  // 蓝色卡片
  const card = document.createElement('div');
  card.style.cssText = 'background:#5ba0e6;padding:16px 20px 24px;';

  // 白色内容区
  const inner = document.createElement('div');
  inner.style.cssText = 'background:rgba(255,255,255,0.15);border-radius:8px;padding:16px;';

  // 提示
  const tip = document.createElement('div');
  tip.style.cssText = 'font-size:15px;color:#fff;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.4);margin-bottom:12px;';
  tip.textContent = '转速必填 其他任填一项';
  inner.appendChild(tip);

  // 转速行
  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px;';
  const lblS = document.createElement('span');
  lblS.style.cssText = 'font-size:16px;color:#fff;font-weight:bold;';
  lblS.textContent = '转速';
  const inputS = document.createElement('input');
  inputS.type = 'number'; inputS.value = '800';
  inputS.style.cssText = 'width:100px;padding:6px 10px;border:none;border-radius:4px;font-size:16px;text-align:center;';
  row1.appendChild(lblS); row1.appendChild(inputS);
  inner.appendChild(row1);

  // G99 F + G98 F 行
  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:16px;';
  const lblG99 = document.createElement('span');
  lblG99.style.cssText = 'font-size:16px;color:#fff;font-weight:bold;';
  lblG99.textContent = 'G99 F';
  const inputG99 = document.createElement('input');
  inputG99.type = 'number'; inputG99.value = '0.15';
  inputG99.style.cssText = 'width:80px;padding:6px 10px;border:none;border-radius:4px;font-size:16px;text-align:center;';
  const lblG98 = document.createElement('span');
  lblG98.style.cssText = 'font-size:16px;color:#fff;font-weight:bold;margin-left:10px;';
  lblG98.textContent = 'G98 F';
  const inputG98 = document.createElement('input');
  inputG98.type = 'number';
  inputG98.style.cssText = 'width:80px;padding:6px 10px;border:none;border-radius:4px;font-size:16px;text-align:center;';
  row2.appendChild(lblG99); row2.appendChild(inputG99);
  row2.appendChild(lblG98); row2.appendChild(inputG98);
  inner.appendChild(row2);

  // 计算按钮
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'text-align:center;';
  const calcBtn = document.createElement('button');
  calcBtn.style.cssText = 'background:#2db87d;color:#fff;border:none;border-radius:20px;padding:8px 40px;font-size:16px;cursor:pointer;';
  calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => {
    const S = parseFloat(inputS.value);
    const g99Val = inputG99.value.trim();
    const g98Val = inputG98.value.trim();
    const g99 = g99Val === '' ? NaN : parseFloat(g99Val);
    const g98 = g98Val === '' ? NaN : parseFloat(g98Val);
    const hasG99 = !isNaN(g99) && g99Val !== '';
    const hasG98 = !isNaN(g98) && g98Val !== '';

    if (isNaN(S) || S <= 0) { alert('请填写转速'); return; }
    if (!hasG99 && !hasG98) { alert('请填写G99 F或G98 F其中一项'); return; }

    if (hasG99 && !hasG98) {
      inputG98.value = Math.round(g99 * S * 10000) / 10000;
    } else if (hasG98 && !hasG99) {
      inputG99.value = Math.round(g98 / S * 10000) / 10000;
    } else {
      inputG98.value = Math.round(g99 * S * 10000) / 10000;
    }
  });
  btnWrap.appendChild(calcBtn);
  inner.appendChild(btnWrap);

  card.appendChild(inner);
  pageContent.appendChild(card);
  app.appendChild(pageContent);
}

export function registerRoutes(router) {
  router.register('#/other', () => renderOtherIndex());
  otherTypes.forEach(page => {
    if (page.id === 'HengXianSu') {
      router.register(`#/other/${page.id}`, () => renderHengXianSu());
    } else if (page.id === 'LuoWenCeLiang') {
      router.register(`#/other/${page.id}`, () => renderLuoWenCeLiang());
    } else if (page.id === 'GuangJieDu') {
      router.register(`#/other/${page.id}`, () => renderGuangJieDu());
    } else if (page.id === 'YuanDengFen') {
      router.register(`#/other/${page.id}`, () => renderYuanDengFen());
    } else if (page.id === 'ZhongXinKong') {
      router.register(`#/other/${page.id}`, () => renderZhongXinKong());
    } else if (page.id === 'G98zhuanG99') {
      router.register(`#/other/${page.id}`, () => renderG98zhuanG99());
    } else {
      router.register(`#/other/${page.id}`, () => renderCalcPage(app, page));
    }
  });
}
