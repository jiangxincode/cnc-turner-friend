// src/modules/macro/index.js
import Router from '../../router.js';
import { renderListPage } from '../../components/list-page.js';
import { renderNavBar } from '../../components/nav-bar.js';
import { macroTypes } from '../../data/macro-data.js';
import { genMacro } from './calc.js';

const app = document.getElementById('app');

/**
 * 渲染宏程序计算页面（特殊布局：输出为代码文本区域）
 */
function renderMacroPage(config) {
  const { title, diagram, inputs, id } = config;

  app.innerHTML = '';

  // 导航栏
  renderNavBar(app, {
    title,
    showBack: true,
    showReset: true,
    onReset: () => resetInputs(),
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
    img.onerror = () => {
      diagArea.innerHTML = '<span style="color:#999;font-size:13px;">图片加载失败</span>';
    };
    diagArea.appendChild(img);
    content.appendChild(diagArea);
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
    const wrap = document.createElement('div');
    wrap.className = 'form-input-wrap';
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-input';
    input.value = field.default ?? '';
    input.dataset.id = field.id;
    wrap.appendChild(input);
    row.appendChild(label);
    row.appendChild(wrap);
    form.appendChild(row);
  });
  content.appendChild(form);

  // 计算按钮
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:12px 16px;';
  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.textContent = '生成宏程序';
  btn.addEventListener('click', () => calculate());
  btnWrap.appendChild(btn);
  content.appendChild(btnWrap);

  // 代码输出区域
  const codeArea = document.createElement('div');
  codeArea.style.cssText = 'padding:0 16px 16px;';
  const textarea = document.createElement('textarea');
  textarea.id = 'macro-output';
  textarea.style.cssText = 'width:100%;height:200px;font-family:monospace;font-size:12px;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;box-sizing:border-box;';
  textarea.placeholder = '点击"生成宏程序"按钮生成代码...';
  textarea.readOnly = true;
  codeArea.appendChild(textarea);
  content.appendChild(codeArea);

  app.appendChild(content);

  function resetInputs() {
    inputs.forEach(field => {
      const el = app.querySelector(`[data-id="${field.id}"]`);
      if (el) el.value = field.default ?? '';
    });
    textarea.value = '';
  }

  function calculate() {
    const inputValues = {};
    inputs.forEach(field => {
      const el = app.querySelector(`[data-id="${field.id}"]`);
      inputValues[field.id] = el ? parseFloat(el.value) : NaN;
    });
    try {
      const result = genMacro(id, inputValues);
      textarea.value = result.code || '';
    } catch (e) {
      textarea.value = `错误: ${e.message}`;
    }
  }
}

function renderMacroIndex() {
  renderListPage(app, {
    title: '宏程序',
    items: macroTypes.map(t => ({ name: t.title, route: `#/macro/${t.id}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/macro', () => renderMacroIndex());
  macroTypes.forEach(page => {
    router.register(`#/macro/${page.id}`, () => renderMacroPage(page));
  });
}
