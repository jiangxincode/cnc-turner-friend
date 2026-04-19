// src/modules/thread-table/index.js
import { renderNavBar } from '../../components/nav-bar.js';

const app = document.getElementById('app');

// 螺纹对照表数据（公制 vs 英制 vs 美制）
const THREAD_TABLE = [
  { metric: 'M1',    pitch: '0.25', inch: '-',      tpi: '-',   us: '-',      usTpi: '-'  },
  { metric: 'M1.2',  pitch: '0.25', inch: '-',      tpi: '-',   us: '-',      usTpi: '-'  },
  { metric: 'M1.6',  pitch: '0.35', inch: '1/16"',  tpi: '60',  us: '-',      usTpi: '-'  },
  { metric: 'M2',    pitch: '0.4',  inch: '5/64"',  tpi: '56',  us: '#2',     usTpi: '56' },
  { metric: 'M2.5',  pitch: '0.45', inch: '3/32"',  tpi: '48',  us: '#4',     usTpi: '40' },
  { metric: 'M3',    pitch: '0.5',  inch: '1/8"',   tpi: '40',  us: '#6',     usTpi: '32' },
  { metric: 'M4',    pitch: '0.7',  inch: '5/32"',  tpi: '32',  us: '#8',     usTpi: '32' },
  { metric: 'M5',    pitch: '0.8',  inch: '3/16"',  tpi: '24',  us: '#10',    usTpi: '24' },
  { metric: 'M6',    pitch: '1.0',  inch: '1/4"',   tpi: '20',  us: '1/4"',   usTpi: '20' },
  { metric: 'M8',    pitch: '1.25', inch: '5/16"',  tpi: '18',  us: '5/16"',  usTpi: '18' },
  { metric: 'M10',   pitch: '1.5',  inch: '3/8"',   tpi: '16',  us: '3/8"',   usTpi: '16' },
  { metric: 'M12',   pitch: '1.75', inch: '1/2"',   tpi: '12',  us: '1/2"',   usTpi: '13' },
  { metric: 'M14',   pitch: '2.0',  inch: '9/16"',  tpi: '12',  us: '9/16"',  usTpi: '12' },
  { metric: 'M16',   pitch: '2.0',  inch: '5/8"',   tpi: '11',  us: '5/8"',   usTpi: '11' },
  { metric: 'M18',   pitch: '2.5',  inch: '3/4"',   tpi: '10',  us: '3/4"',   usTpi: '10' },
  { metric: 'M20',   pitch: '2.5',  inch: '3/4"',   tpi: '10',  us: '3/4"',   usTpi: '10' },
  { metric: 'M22',   pitch: '2.5',  inch: '7/8"',   tpi: '9',   us: '7/8"',   usTpi: '9'  },
  { metric: 'M24',   pitch: '3.0',  inch: '1"',     tpi: '8',   us: '1"',     usTpi: '8'  },
  { metric: 'M27',   pitch: '3.0',  inch: '1-1/8"', tpi: '7',   us: '1-1/8"', usTpi: '7'  },
  { metric: 'M30',   pitch: '3.5',  inch: '1-1/4"', tpi: '7',   us: '1-1/4"', usTpi: '7'  },
  { metric: 'M33',   pitch: '3.5',  inch: '1-3/8"', tpi: '6',   us: '1-3/8"', usTpi: '6'  },
  { metric: 'M36',   pitch: '4.0',  inch: '1-1/2"', tpi: '6',   us: '1-1/2"', usTpi: '6'  },
];

function renderThreadTable() {
  app.innerHTML = '';
  renderNavBar(app, { title: '螺纹对照表', showBack: true, showReset: false });
  
  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.cssText = 'padding-top:44px;overflow-x:auto;';
  
  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;font-size:12px;';
  
  // 表头
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr style="background:#2c3e50;color:#fff;">
      <th style="padding:8px 4px;text-align:center;">公制</th>
      <th style="padding:8px 4px;text-align:center;">螺距</th>
      <th style="padding:8px 4px;text-align:center;">英制</th>
      <th style="padding:8px 4px;text-align:center;">TPI</th>
      <th style="padding:8px 4px;text-align:center;">美制</th>
      <th style="padding:8px 4px;text-align:center;">TPI</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // 表体
  const tbody = document.createElement('tbody');
  THREAD_TABLE.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.style.background = i % 2 === 0 ? '#fff' : '#f9f9f9';
    tr.innerHTML = `
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #eee;">${row.metric}</td>
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #eee;">${row.pitch}</td>
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #eee;">${row.inch}</td>
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #eee;">${row.tpi}</td>
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #eee;">${row.us}</td>
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #eee;">${row.usTpi}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  content.appendChild(table);
  app.appendChild(content);
}

export function registerRoutes(router) {
  router.register('#/thread-table', () => renderThreadTable());
}
