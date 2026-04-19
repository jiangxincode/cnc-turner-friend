import { renderNavBar } from '../../components/nav-bar.js';
import { TOLERANCE_DATA, IT_GRADES } from '../../data/tolerance-data.js';

const app = document.getElementById('app');

function renderTolerancePage() {
  app.innerHTML = '';
  renderNavBar(app, { title: '公差等级', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.padding = '44px 16px 16px';

  const img = document.createElement('img');
  img.src = 'static/gongcha/gcb.png';
  img.style.cssText = 'width:100%;max-height:200px;object-fit:contain;margin-bottom:12px;';
  img.onerror = () => { img.style.display = 'none'; };
  content.appendChild(img);

  const selectArea = document.createElement('div');
  selectArea.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;';

  const sizeSelect = document.createElement('select');
  sizeSelect.className = 'form-input';
  sizeSelect.style.flex = '1';
  TOLERANCE_DATA.forEach((row, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `${row.min}~${row.max}mm`;
    sizeSelect.appendChild(opt);
  });

  const gradeSelect = document.createElement('select');
  gradeSelect.className = 'form-input';
  gradeSelect.style.flex = '1';
  IT_GRADES.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    if (g === 'IT7') opt.selected = true;
    gradeSelect.appendChild(opt);
  });

  selectArea.appendChild(sizeSelect);
  selectArea.appendChild(gradeSelect);
  content.appendChild(selectArea);

  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.textContent = '查询';
  btn.style.marginBottom = '12px';
  content.appendChild(btn);

  const result = document.createElement('div');
  result.className = 'result-area';
  result.style.display = 'none';
  content.appendChild(result);

  btn.addEventListener('click', () => {
    const rowIdx = Number(sizeSelect.value);
    const grade = gradeSelect.value;
    const row = TOLERANCE_DATA[rowIdx];
    const val = row[grade];
    result.style.display = 'block';
    result.innerHTML = `
      <div class="result-row"><span class="result-label">基本尺寸范围</span><span class="result-value">${row.min}~${row.max} mm</span></div>
      <div class="result-row"><span class="result-label">公差等级</span><span class="result-value">${grade}</span></div>
      <div class="result-row"><span class="result-label">公差值</span><span class="result-value">${val} μm</span></div>
    `;
  });

  app.appendChild(content);
}

export function registerRoutes(router) {
  router.register('#/tolerance', () => renderTolerancePage());
}
