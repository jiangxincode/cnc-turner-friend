import Router from '../../router.js';
import { renderNavBar } from '../../components/nav-bar.js';
import { qtPages, wyPages, nkPages } from '../../data/arc-junction-data.js';
import { calcArcPage, calcQt2 } from './calc.js';

const app = document.getElementById('app');

/**
 * 渲染圆弧接点计算页面
 * 输出为坐标序列文本（textarea），与原应用一致
 */
function renderArcCalcPage(page) {
  const { id, title, diagram, tip, inputs } = page;

  app.innerHTML = '';

  let resetFn;

  renderNavBar(app, {
    title,
    showBack: true,
    showReset: true,
    onReset: () => resetFn && resetFn(),
  });

  const content = document.createElement('div');
  content.className = 'page-content';

  // 示意图
  if (diagram) {
    const diagArea = document.createElement('div');
    diagArea.className = 'diagram-area';
    const img = document.createElement('img');
    img.src = diagram;
    img.alt = title;
    img.onerror = () => { diagArea.innerHTML = '<span style="color:#999;font-size:13px;">图片加载失败</span>'; };
    diagArea.appendChild(img);
    content.appendChild(diagArea);
  }

  // 提示文字
  if (tip) {
    const tipEl = document.createElement('div');
    tipEl.style.cssText = 'padding:4px 16px;font-size:12px;color:#e67e22;';
    tipEl.textContent = tip;
    content.appendChild(tipEl);
  }

  // 输入表单
  const form = document.createElement('div');
  inputs.forEach(field => {
    const row = document.createElement('div');
    row.className = 'form-row';

    if (field.type === 'optional') {
      // 可选输入：复选框 + 输入框（勾选后才启用）
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.cssText = 'width:18px;height:18px;margin-right:8px;cursor:pointer;flex-shrink:0;';
      checkbox.dataset.id = field.id + '_enabled';

      const labelEl = document.createElement('label');
      labelEl.style.cssText = 'display:flex;align-items:center;flex:1;cursor:pointer;';
      labelEl.textContent = field.label;

      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'form-input';
      input.value = field.default;
      input.dataset.id = field.id;
      input.disabled = true;
      input.style.cssText = 'width:80px;margin-left:8px;opacity:0.4;';

      checkbox.addEventListener('change', () => {
        input.disabled = !checkbox.checked;
        input.style.opacity = checkbox.checked ? '1' : '0.4';
      });

      row.style.cssText = 'display:flex;align-items:center;padding:8px 16px;border-bottom:1px solid #eee;';
      row.appendChild(checkbox);
      row.appendChild(labelEl);
      row.appendChild(input);
    } else {
      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = field.label;

      const wrap = document.createElement('div');
      wrap.className = 'form-input-wrap';

      let el;
      if (field.type === 'select') {
        el = document.createElement('select');
        el.className = 'form-input';
        (field.options || []).forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          if (opt.value === String(field.default)) o.selected = true;
          el.appendChild(o);
        });
      } else if (field.type === 'radio') {
        // 单选框组（如绝对坐标/相对坐标）
        el = document.createElement('div');
        el.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;padding:4px 0;';
        el.dataset.id = field.id;
        const radioName = `radio_${field.id}_${id}`;
        (field.options || []).forEach(opt => {
          const lbl = document.createElement('label');
          lbl.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;font-size:14px;';
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = radioName;
          radio.value = opt.value;
          radio.checked = opt.value === String(field.default);
          radio.dataset.id = field.id;
          radio.style.cssText = 'width:16px;height:16px;cursor:pointer;';
          lbl.appendChild(radio);
          lbl.appendChild(document.createTextNode(opt.label));
          el.appendChild(lbl);
        });
        // 隐藏 label 列，让单选框居中显示
        label.style.display = 'none';
        wrap.style.cssText = 'flex:1;';
      } else {
        el = document.createElement('input');
        el.type = 'number';
        el.className = 'form-input';
        if (field.default !== '' && field.default !== undefined) el.value = field.default;
        if (field.placeholder) el.placeholder = field.placeholder;
      }
      el.dataset.id = field.id;
      wrap.appendChild(el);
      row.appendChild(label);
      row.appendChild(wrap);
    }

    form.appendChild(row);
  });
  content.appendChild(form);

  // 按钮区域
  const btnArea = document.createElement('div');
  btnArea.style.cssText = 'display:flex;gap:8px;padding:12px 16px;';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-primary';
  copyBtn.style.cssText = 'flex:1;background:#95a5a6;';
  copyBtn.textContent = '复制';
  copyBtn.addEventListener('click', () => {
    if (output.value) {
      navigator.clipboard.writeText(output.value).catch(() => {
        output.select();
        document.execCommand('copy');
      });
    }
  });

  const calcBtn = document.createElement('button');
  calcBtn.className = 'btn-primary';
  calcBtn.style.flex = '2';
  calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => calculate());

  btnArea.appendChild(copyBtn);
  btnArea.appendChild(calcBtn);
  content.appendChild(btnArea);

  // 坐标输出区域
  const outputWrap = document.createElement('div');
  outputWrap.style.cssText = 'padding:0 16px 16px;';
  const output = document.createElement('textarea');
  output.style.cssText = 'width:100%;height:220px;font-family:monospace;font-size:12px;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;box-sizing:border-box;';
  output.placeholder = '点击"计算"按钮生成坐标序列...';
  output.readOnly = true;
  outputWrap.appendChild(output);
  content.appendChild(outputWrap);

  app.appendChild(content);

  // 重置函数
  resetFn = () => {
    inputs.forEach(field => {
      if (field.type === 'optional') {
        const cb = app.querySelector(`[data-id="${field.id}_enabled"]`);
        const el = app.querySelector(`[data-id="${field.id}"]`);
        if (cb) cb.checked = false;
        if (el) {
          el.value = field.default;
          el.disabled = true;
          el.style.opacity = '0.4';
        }
      } else {
        const el = app.querySelector(`[data-id="${field.id}"]`);
        if (!el) return;
        if (field.type === 'select') {
          el.value = String(field.default);
        } else if (field.type === 'radio') {
          const radioName = `radio_${field.id}_${id}`;
          const defaultRadio = app.querySelector(`input[name="${radioName}"][value="${field.default}"]`);
          if (defaultRadio) defaultRadio.checked = true;
        } else {
          el.value = field.default !== '' ? field.default : '';
        }
      }
    });
    output.value = '';
  };

  // 计算函数
  function calculate() {
    const inputValues = {};
    inputs.forEach(field => {
      if (field.type === 'optional') {
        const cb = app.querySelector(`[data-id="${field.id}_enabled"]`);
        const el = app.querySelector(`[data-id="${field.id}"]`);
        inputValues[field.id] = (cb && cb.checked && el) ? parseFloat(el.value) : null;
      } else {
        const el = app.querySelector(`[data-id="${field.id}"]`);
        if (!el) return;
        if (field.type === 'select') {
          inputValues[field.id] = el.value;
        } else if (field.type === 'radio') {
          const radioName = `radio_${field.id}_${id}`;
          const checked = app.querySelector(`input[name="${radioName}"]:checked`);
          inputValues[field.id] = checked ? checked.value : String(field.default);
        } else {
          const v = el.value.trim();
          inputValues[field.id] = v === '' ? '' : parseFloat(v);
        }
      }
    });

    try {
      const result = calcArcPage(id, inputValues);
      output.value = result;
    } catch (e) {
      output.value = `错误: ${e.message}`;
    }
  }
}

/**
 * 球头接点2 专用渲染（4种模式：球/弧1/弧2/弧3，任填三项）
 */
function renderQt2Page() {
  const page = qtPages[1]; // qt2
  app.innerHTML = '';

  let currentMode = 'ball'; // 当前模式
  let output;

  renderNavBar(app, {
    title: page.title,
    showBack: true,
    showReset: true,
    onReset: () => resetAll(),
  });

  const content = document.createElement('div');
  content.className = 'page-content';

  // 示意图
  const diagArea = document.createElement('div');
  diagArea.className = 'diagram-area';
  const img = document.createElement('img');
  const diagramMap = {
    ball: 'static/yhjd/yh2.png',
    arc1: 'static/yhjd/yh2_1.png',
    arc2: 'static/yhjd/yh2_2.png',
    arc3: 'static/yhjd/yh2_3.png',
  };
  img.src = diagramMap.ball;
  img.alt = page.title;
  img.onerror = () => { diagArea.innerHTML = '<span style="color:#999;font-size:13px;">图片加载失败</span>'; };
  diagArea.appendChild(img);
  content.appendChild(diagArea);

  // 模式选择（单选：球 弧1 弧2 弧3）
  const modeRow = document.createElement('div');
  modeRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:16px;padding:10px 16px;border-bottom:1px solid #eee;';
  const modes = [
    { value: 'ball', label: '球' },
    { value: 'arc1', label: '弧1' },
    { value: 'arc2', label: '弧2' },
    { value: 'arc3', label: '弧3' },
  ];
  modes.forEach(m => {
    const lbl = document.createElement('label');
    lbl.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;font-size:14px;';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'qt2mode';
    radio.value = m.value;
    radio.checked = m.value === 'ball';
    radio.style.cssText = 'width:16px;height:16px;cursor:pointer;';
    radio.addEventListener('change', () => {
      currentMode = m.value;
      img.src = diagramMap[m.value];
      updateTip();
      updateRaRbVisibility();
    });
    lbl.appendChild(radio);
    lbl.appendChild(document.createTextNode(m.label));
    modeRow.appendChild(lbl);
  });
  content.appendChild(modeRow);

  // 提示文字
  const tipEl = document.createElement('div');
  tipEl.style.cssText = 'padding:4px 16px;font-size:12px;color:#e67e22;';
  tipEl.textContent = '任填三项';
  content.appendChild(tipEl);

  function updateTip() {
    tipEl.textContent = currentMode === 'arc3' ? '弧3必须全部填写' : '任填三项';
  }

  // 输入表单
  const form = document.createElement('div');

  // 大径、小径、R、长度（任填三项，长度可手动填也可由计算得出）
  const mainFields = [
    { id: 'large', label: '大径', default: 50     },
    { id: 'small', label: '小径', default: 33.166 },
    { id: 'R',     label: 'R',    default: 30     },
    { id: 'long',  label: '长度', default: ''     },
  ];

  // 两列布局（大径/小径 一行，R/长度 一行）
  for (let i = 0; i < mainFields.length; i += 2) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;border-bottom:1px solid #eee;';
    [mainFields[i], mainFields[i + 1]].forEach(f => {
      const cell = document.createElement('div');
      cell.style.cssText = 'flex:1;display:flex;align-items:center;padding:8px 12px;gap:8px;';
      const lbl = document.createElement('span');
      lbl.style.cssText = 'font-size:14px;color:#333;white-space:nowrap;min-width:28px;';
      lbl.textContent = f.label;
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.className = 'form-input';
      if (f.default !== '') inp.value = f.default;
      inp.dataset.id = f.id;
      inp.style.cssText = 'flex:1;min-width:0;';
      cell.appendChild(lbl);
      cell.appendChild(inp);
      row.appendChild(cell);
    });
    form.appendChild(row);
  }

  // z起点
  const zRow = document.createElement('div');
  zRow.style.cssText = 'display:flex;align-items:center;padding:8px 12px;gap:8px;border-bottom:1px solid #eee;';
  const zLbl = document.createElement('span');
  zLbl.style.cssText = 'font-size:14px;color:#333;min-width:40px;';
  zLbl.textContent = 'z起点';
  const zInp = document.createElement('input');
  zInp.type = 'number';
  zInp.className = 'form-input';
  zInp.value = 0;
  zInp.dataset.id = 'zStart';
  zInp.style.cssText = 'width:100px;';
  zRow.appendChild(zLbl);
  zRow.appendChild(zInp);
  form.appendChild(zRow);

  // Ra 行（球/弧1/弧3 显示）
  const raRow = document.createElement('div');
  raRow.style.cssText = 'display:flex;align-items:center;padding:8px 12px;gap:8px;border-bottom:1px solid #eee;';
  const raCb = document.createElement('input');
  raCb.type = 'checkbox';
  raCb.style.cssText = 'width:18px;height:18px;cursor:pointer;';
  raCb.dataset.id = 'Ra_enabled';
  const raLbl = document.createElement('span');
  raLbl.style.cssText = 'font-size:14px;color:#333;min-width:28px;';
  raLbl.textContent = 'Ra';
  const raInp = document.createElement('input');
  raInp.type = 'number';
  raInp.className = 'form-input';
  raInp.value = '';
  raInp.dataset.id = 'Ra';
  raInp.disabled = true;
  raInp.style.cssText = 'width:100px;opacity:0.4;';
  raCb.addEventListener('change', () => {
    raInp.disabled = !raCb.checked;
    raInp.style.opacity = raCb.checked ? '1' : '0.4';
    if (raCb.checked && raInp.value === '') raInp.value = 2;
  });
  raRow.appendChild(raCb);
  raRow.appendChild(raLbl);
  raRow.appendChild(raInp);
  form.appendChild(raRow);

  // Rb 行（球/弧2/弧3 显示）
  const rbRow = document.createElement('div');
  rbRow.style.cssText = 'display:flex;align-items:center;padding:8px 12px;gap:8px;border-bottom:1px solid #eee;';
  const rbCb = document.createElement('input');
  rbCb.type = 'checkbox';
  rbCb.style.cssText = 'width:18px;height:18px;cursor:pointer;';
  rbCb.dataset.id = 'Rb_enabled';
  const rbLbl = document.createElement('span');
  rbLbl.style.cssText = 'font-size:14px;color:#333;min-width:28px;';
  rbLbl.textContent = 'Rb';
  const rbInp = document.createElement('input');
  rbInp.type = 'number';
  rbInp.className = 'form-input';
  rbInp.value = '';
  rbInp.dataset.id = 'Rb';
  rbInp.disabled = true;
  rbInp.style.cssText = 'width:100px;opacity:0.4;';
  rbCb.addEventListener('change', () => {
    rbInp.disabled = !rbCb.checked;
    rbInp.style.opacity = rbCb.checked ? '1' : '0.4';
    if (rbCb.checked && rbInp.value === '') rbInp.value = 2;
  });
  rbRow.appendChild(rbCb);
  rbRow.appendChild(rbLbl);
  rbRow.appendChild(rbInp);
  form.appendChild(rbRow);

  // 刀尖补偿
  const tipRow = document.createElement('div');
  tipRow.style.cssText = 'display:flex;align-items:center;padding:8px 12px;gap:8px;border-bottom:1px solid #eee;';
  const tipCb = document.createElement('input');
  tipCb.type = 'checkbox';
  tipCb.style.cssText = 'width:18px;height:18px;cursor:pointer;';
  tipCb.dataset.id = 'buchang';
  const tipLbl = document.createElement('span');
  tipLbl.style.cssText = 'font-size:14px;color:#333;';
  tipLbl.textContent = '刀尖补偿';
  const tipInp = document.createElement('input');
  tipInp.type = 'number';
  tipInp.className = 'form-input';
  tipInp.value = 0.4;
  tipInp.dataset.id = 'tip';
  tipInp.disabled = true;
  tipInp.style.cssText = 'width:80px;opacity:0.4;margin-left:8px;';
  tipCb.addEventListener('change', () => {
    tipInp.disabled = !tipCb.checked;
    tipInp.style.opacity = tipCb.checked ? '1' : '0.4';
    if (tipCb.checked && tipInp.value === '') tipInp.value = 0.4;
  });
  tipRow.appendChild(tipCb);
  tipRow.appendChild(tipLbl);
  tipRow.appendChild(tipInp);
  form.appendChild(tipRow);

  // 坐标系选择
  const coordRow = document.createElement('div');
  coordRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;padding:10px 16px;border-bottom:1px solid #eee;';
  ['绝对坐标', '相对坐标'].forEach((label, i) => {
    const lbl = document.createElement('label');
    lbl.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;font-size:14px;';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'qt2coord';
    radio.value = i === 0 ? 'true' : 'false';
    radio.checked = i === 0;
    radio.dataset.id = 'juedui';
    radio.style.cssText = 'width:16px;height:16px;cursor:pointer;';
    lbl.appendChild(radio);
    lbl.appendChild(document.createTextNode(label));
    coordRow.appendChild(lbl);
  });
  form.appendChild(coordRow);

  content.appendChild(form);

  // 按钮区域
  const btnArea = document.createElement('div');
  btnArea.style.cssText = 'display:flex;gap:8px;padding:12px 16px;';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-primary';
  copyBtn.style.cssText = 'flex:1;background:#95a5a6;';
  copyBtn.textContent = '复制';
  copyBtn.addEventListener('click', () => {
    if (output && output.value) {
      navigator.clipboard.writeText(output.value).catch(() => {
        output.select();
        document.execCommand('copy');
      });
    }
  });
  const calcBtn = document.createElement('button');
  calcBtn.className = 'btn-primary';
  calcBtn.style.flex = '2';
  calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => calculate());
  btnArea.appendChild(copyBtn);
  btnArea.appendChild(calcBtn);
  content.appendChild(btnArea);

  // 输出区域
  const outputWrap = document.createElement('div');
  outputWrap.style.cssText = 'padding:0 16px 16px;';
  output = document.createElement('textarea');
  output.style.cssText = 'width:100%;height:120px;font-family:monospace;font-size:13px;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;box-sizing:border-box;';
  output.placeholder = '点击"计算"按钮生成坐标序列...';
  output.readOnly = true;
  outputWrap.appendChild(output);
  content.appendChild(outputWrap);

  app.appendChild(content);

  // 根据模式更新Ra/Rb可见性
  function updateRaRbVisibility() {
    // Ra：球/弧1/弧3 显示
    const showRa = currentMode === 'ball' || currentMode === 'arc1' || currentMode === 'arc3';
    raRow.style.display = showRa ? '' : 'none';
    // Rb：球/弧2/弧3 显示
    const showRb = currentMode === 'ball' || currentMode === 'arc2' || currentMode === 'arc3';
    rbRow.style.display = showRb ? '' : 'none';
  }
  updateRaRbVisibility();

  // 重置
  function resetAll() {
    // 重置模式为球
    currentMode = 'ball';
    app.querySelector('input[name="qt2mode"][value="ball"]').checked = true;
    img.src = diagramMap.ball;
    updateTip();
    updateRaRbVisibility();
    // 重置输入
    app.querySelector('[data-id="large"]').value = 50;
    app.querySelector('[data-id="small"]').value = 33.166;
    app.querySelector('[data-id="R"]').value = 30;
    app.querySelector('[data-id="long"]').value = '';
    app.querySelector('[data-id="zStart"]').value = 0;
    raCb.checked = false; raInp.value = ''; raInp.disabled = true; raInp.style.opacity = '0.4';
    rbCb.checked = false; rbInp.value = ''; rbInp.disabled = true; rbInp.style.opacity = '0.4';
    tipCb.checked = false; tipInp.value = 0.4; tipInp.disabled = true; tipInp.style.opacity = '0.4';
    app.querySelector('input[name="qt2coord"][value="true"]').checked = true;
    if (output) output.value = '';
  }

  // 计算
  function calculate() {
    const getVal = id => {
      const el = app.querySelector(`[data-id="${id}"]`);
      if (!el) return '';
      return el.value.trim();
    };

    const juedui = app.querySelector('input[name="qt2coord"]:checked')?.value ?? 'true';
    const buchang = tipCb.checked;
    const Ra = raCb.checked ? getVal('Ra') : '';
    const Rb = rbCb.checked ? getVal('Rb') : '';

    const largeVal = getVal('large');
    const smallVal = getVal('small');
    const rVal     = getVal('R');
    const longVal  = getVal('long');

    // 如果4个都填了（非弧3模式），忽略长度，用大径/小径/R计算长度
    const allFilled = largeVal !== '' && smallVal !== '' && rVal !== '' && longVal !== '';
    const longToUse = (allFilled && currentMode !== 'arc3') ? '' : longVal;

    const longEl = app.querySelector('[data-id="long"]');

    try {
      const result = calcQt2({
        large: largeVal,
        small: smallVal,
        R: rVal,
        long: longToUse,
        zStart: getVal('zStart'),
        Ra,
        Rb,
        tip: getVal('tip'),
        buchang,
        juedui,
        mode: currentMode,
        _onCalcL: (calcL) => {
          // 将计算出的长度回填到输入框
          if (longEl) longEl.value = parseFloat(calcL.toFixed(3));
        },
      });
      output.value = result;
    } catch (e) {
      output.value = `错误: ${e.message}`;
    }
  }
}

/**
 * 渲染圆弧接点入口页面（分组网格）
 */
function renderArcIndex() {
  app.innerHTML = '';
  renderNavBar(app, { title: '圆弧接点', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.cssText = 'background:#000;';

  const groups = [
    { label: '球头接点', pages: qtPages, routePrefix: '#/arc/qt/' },
    { label: '外形接点', pages: wyPages, routePrefix: '#/arc/wy/' },
    { label: '内孔接点', pages: nkPages, routePrefix: '#/arc/nk/' },
  ];

  groups.forEach(({ label, pages, routePrefix }) => {
    const groupTitle = document.createElement('div');
    groupTitle.className = 'group-title';
    groupTitle.style.cssText = 'color:#333;background:#fff;text-align:center;';
    groupTitle.textContent = label;
    content.appendChild(groupTitle);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;';

    pages.forEach((page, idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:2px;cursor:pointer;';

      const img = document.createElement('img');
      img.src = page.diagram;
      img.alt = page.title;
      img.style.cssText = 'width:100%;aspect-ratio:1;object-fit:contain;';
      img.onerror = () => { img.style.visibility = 'hidden'; };

      const lbl = document.createElement('span');
      lbl.textContent = page.title;
      lbl.style.cssText = 'font-size:12px;color:#fff;margin-top:2px;text-align:center;';

      item.appendChild(img);
      item.appendChild(lbl);
      item.addEventListener('click', () => Router.navigate(`${routePrefix}${idx + 1}`));
      grid.appendChild(item);
    });

    content.appendChild(grid);
  });

  app.appendChild(content);
}

export function registerRoutes(router) {
  router.register('#/arc', () => renderArcIndex());

  router.register('#/arc/qt/:id', ({ id }) => {
    const idx = parseInt(id) - 1;
    if (idx === 1) {
      // qt2 使用专用渲染
      renderQt2Page();
      return;
    }
    const page = qtPages[idx];
    if (page) renderArcCalcPage(page);
    else Router.navigate('#/arc');
  });

  router.register('#/arc/wy/:id', ({ id }) => {
    const idx = parseInt(id) - 1;
    const page = wyPages[idx];
    if (page) renderArcCalcPage(page);
    else Router.navigate('#/arc');
  });

  router.register('#/arc/nk/:id', ({ id }) => {
    const idx = parseInt(id) - 1;
    const page = nkPages[idx];
    if (page) renderArcCalcPage(page);
    else Router.navigate('#/arc');
  });
}
