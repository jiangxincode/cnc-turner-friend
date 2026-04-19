// src/modules/trig-table/index.js
import { renderNavBar } from '../../components/nav-bar.js';

const app = document.getElementById('app');

function renderTrigTable() {
  app.innerHTML = '';
  renderNavBar(app, { title: '三角函数表', showBack: true, showReset: false });
  
  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.cssText = 'padding-top:44px;overflow-x:auto;';
  
  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;font-size:12px;';
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr style="background:#2c3e50;color:#fff;position:sticky;top:44px;">
      <th style="padding:8px 4px;text-align:center;">角度°</th>
      <th style="padding:8px 4px;text-align:center;">sin</th>
      <th style="padding:8px 4px;text-align:center;">cos</th>
      <th style="padding:8px 4px;text-align:center;">tan</th>
    </tr>
  `;
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  for (let deg = 0; deg <= 90; deg++) {
    const rad = deg * Math.PI / 180;
    const sinVal = Math.sin(rad);
    const cosVal = Math.cos(rad);
    const tanVal = deg === 90 ? '∞' : Math.tan(rad).toFixed(6);
    
    const tr = document.createElement('tr');
    tr.style.background = deg % 2 === 0 ? '#fff' : '#f9f9f9';
    tr.innerHTML = `
      <td style="padding:5px 4px;text-align:center;border-bottom:1px solid #eee;font-weight:bold;">${deg}°</td>
      <td style="padding:5px 4px;text-align:center;border-bottom:1px solid #eee;">${sinVal.toFixed(6)}</td>
      <td style="padding:5px 4px;text-align:center;border-bottom:1px solid #eee;">${cosVal.toFixed(6)}</td>
      <td style="padding:5px 4px;text-align:center;border-bottom:1px solid #eee;">${tanVal}</td>
    `;
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  content.appendChild(table);
  app.appendChild(content);
}

export function registerRoutes(router) {
  router.register('#/trig-table', () => renderTrigTable());
}
