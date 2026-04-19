import { renderListPage } from '../../components/list-page.js';
import { renderNavBar } from '../../components/nav-bar.js';
import { craftTypes } from '../../data/craft-data.js';
import { genCraft } from './calc.js';

const app = document.getElementById('app');

// 渲染工艺品宏程序页面（与宏程序模块类似，输出为代码文本区域）
function renderCraftPage(config) {
  const { title, diagram, inputs, id } = config;
  app.innerHTML = '';
  renderNavBar(app, {
    title,
    showBack: true,
    showReset: true,
    onReset: () => resetInputs(),
  });

  const content = document.createElement('div');
  content.className = 'page-content';

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

  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:12px 16px;';
  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.textContent = '生成宏程序';
  btn.addEventListener('click', () => calculate());
  btnWrap.appendChild(btn);
  content.appendChild(btnWrap);

  const codeArea = document.createElement('div');
  codeArea.style.cssText = 'padding:0 16px 16px;';
  const textarea = document.createElement('textarea');
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
      const result = genCraft(id, inputValues);
      textarea.value = result.code || '';
    } catch (e) {
      textarea.value = `错误: ${e.message}`;
    }
  }
}

function renderCraftIndex() {
  renderListPage(app, {
    title: '工艺品',
    items: craftTypes.map(t => ({ name: t.title, route: `#/craft/${t.id}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/craft', () => renderCraftIndex());
  craftTypes.forEach(page => {
    router.register(`#/craft/${page.id}`, () => renderCraftPage(page));
  });
}
