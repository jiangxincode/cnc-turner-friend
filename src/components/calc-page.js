import { renderNavBar } from './nav-bar.js';

/**
 * 渲染通用计算页面
 * @param {HTMLElement} container - 页面容器（通常是 #app）
 * @param {Object} config - 页面配置
 * @param {string} config.title - 页面标题
 * @param {string} [config.diagram] - 示意图路径（可选）
 * @param {Array} config.inputs - 输入字段定义
 * @param {Array} config.outputs - 输出字段定义
 * @param {Function} config.calculate - 计算函数，接收 inputs 对象，返回 outputs 对象
 */
export function renderCalcPage(container, config) {
  const { title = '', diagram, inputs = [], outputs = [], calculate } = config;

  // 清空容器
  container.innerHTML = '';

  // 重置所有输入为默认值的函数
  function resetInputs() {
    inputs.forEach(field => {
      const el = container.querySelector(`[data-id="${field.id}"]`);
      if (!el) return;
      if (field.type === 'select') {
        el.value = field.default ?? (field.options?.[0]?.value ?? '');
      } else {
        el.value = field.default ?? '';
      }
    });
    // 清空结果区域
    const resultArea = container.querySelector('.result-area');
    if (resultArea) resultArea.innerHTML = '';
  }

  // 渲染导航栏
  renderNavBar(container, {
    title,
    showBack: true,
    showReset: true,
    onReset: resetInputs,
  });

  // 创建页面内容区域
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';

  // 示意图区域
  if (diagram) {
    const diagramArea = document.createElement('div');
    diagramArea.className = 'diagram-area';

    const img = document.createElement('img');
    img.src = diagram;
    img.alt = title;
    img.onerror = () => {
      diagramArea.innerHTML = '<span style="color:#999;font-size:13px;">图片加载失败</span>';
    };

    diagramArea.appendChild(img);
    pageContent.appendChild(diagramArea);
  }

  // 输入表单
  const form = document.createElement('div');
  form.className = 'calc-form';

  inputs.forEach(field => {
    const row = document.createElement('div');
    row.className = 'form-row';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = field.label;

    const inputWrap = document.createElement('div');
    inputWrap.className = 'form-input-wrap';

    let inputEl;
    if (field.type === 'select') {
      inputEl = document.createElement('select');
      inputEl.className = 'form-input';
      (field.options || []).forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value == field.default) option.selected = true;
        inputEl.appendChild(option);
      });
    } else {
      // 默认 number 类型
      inputEl = document.createElement('input');
      inputEl.type = 'number';
      inputEl.className = 'form-input';
      if (field.default !== undefined && field.default !== null) {
        inputEl.value = field.default;
      }
      if (field.placeholder) {
        inputEl.placeholder = field.placeholder;
      }
    }

    inputEl.dataset.id = field.id;
    inputWrap.appendChild(inputEl);

    // 单位显示
    if (field.unit) {
      const unitSpan = document.createElement('span');
      unitSpan.className = 'form-unit';
      unitSpan.textContent = field.unit;
      unitSpan.style.cssText = 'margin-left:4px;font-size:13px;color:#666;';
      inputWrap.appendChild(unitSpan);
    }

    row.appendChild(label);
    row.appendChild(inputWrap);
    form.appendChild(row);
  });

  pageContent.appendChild(form);

  // 计算按钮
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:12px 16px;';

  const calcBtn = document.createElement('button');
  calcBtn.className = 'btn-primary';
  calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => handleCalculate());

  btnWrap.appendChild(calcBtn);
  pageContent.appendChild(btnWrap);

  // 结果区域
  const resultArea = document.createElement('div');
  resultArea.className = 'result-area';
  resultArea.style.display = 'none';
  pageContent.appendChild(resultArea);

  container.appendChild(pageContent);

  // 计算处理函数
  function handleCalculate() {
    // 收集输入值
    const inputValues = {};
    inputs.forEach(field => {
      const el = container.querySelector(`[data-id="${field.id}"]`);
      if (!el) return;
      if (field.type === 'select') {
        inputValues[field.id] = el.value;
      } else {
        const val = el.value.trim();
        inputValues[field.id] = val === '' ? NaN : parseFloat(val);
      }
    });

    // 调用计算函数
    let results;
    try {
      results = calculate ? calculate(inputValues) : null;
    } catch (e) {
      showError(resultArea, e.message || '计算出错，请检查输入');
      return;
    }

    if (!results) {
      showError(resultArea, '计算失败，请检查输入');
      return;
    }

    // 渲染结果
    resultArea.style.display = 'block';
    resultArea.innerHTML = '';

    outputs.forEach(output => {
      const val = results[output.id];
      const row = document.createElement('div');
      row.className = 'result-row';

      const labelEl = document.createElement('span');
      labelEl.className = 'result-label';
      labelEl.textContent = output.label;

      const valueEl = document.createElement('span');
      valueEl.className = 'result-value';
      valueEl.textContent = val !== undefined && val !== null ? val : '-';

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      resultArea.appendChild(row);
    });
  }
}

/**
 * 在结果区域显示错误提示
 */
function showError(resultArea, message) {
  resultArea.style.display = 'block';
  resultArea.innerHTML = `<div class="error-tip">${message}</div>`;
}
