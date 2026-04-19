import Router from '../../router.js';
import { renderNavBar } from '../../components/nav-bar.js';
import { qtPages, wyPages, nkPages } from '../../data/arc-junction-data.js';
import { calcArcPage } from './calc.js';

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
 * 渲染圆弧接点入口页面（分组网格）
 */
function renderArcIndex() {
  app.innerHTML = '';
  renderNavBar(app, { title: '圆弧接点', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';

  const groups = [
    { label: '球头接点', pages: qtPages, routePrefix: '#/arc/qt/' },
    { label: '外形接点', pages: wyPages, routePrefix: '#/arc/wy/' },
    { label: '内孔接点', pages: nkPages, routePrefix: '#/arc/nk/' },
  ];

  groups.forEach(({ label, pages, routePrefix }) => {
    const groupTitle = document.createElement('div');
    groupTitle.className = 'group-title';
    groupTitle.textContent = label;
    content.appendChild(groupTitle);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px;';

    pages.forEach((page, idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:6px;cursor:pointer;border:1px solid #eee;border-radius:4px;background:#fff;';

      const img = document.createElement('img');
      img.src = page.diagram;
      img.alt = page.title;
      img.style.cssText = 'width:60px;height:60px;object-fit:contain;';
      img.onerror = () => { img.style.visibility = 'hidden'; };

      const lbl = document.createElement('span');
      lbl.textContent = page.title;
      lbl.style.cssText = 'font-size:11px;color:#333;margin-top:4px;text-align:center;';

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
