// src/modules/thread-table/index.js
import { renderNavBar } from '../../components/nav-bar.js';

const app = document.getElementById('app');

// 数据结构：
// metric: 公制公称直径, coarse: 公制粗牙螺距, fine: 公制细牙螺距
// usNom: 美制公称直径, usIn: 英寸, usMm: 毫米, unc: 粗牙UNC, unf: 细牙UNF
const TABLE_DATA = [
  { metric: 'M1',    coarse: '0.25', fine: '0.2',  usNom: '0#',      usIn: '0.06',   usMm: '1.524',  unc: '–',   unf: '80'  },
  { metric: 'M1.2',  coarse: '0.25', fine: '0.2',  usNom: '1#',      usIn: '0.073',  usMm: '1.854',  unc: '64',  unf: '72'  },
  { metric: 'M1.6',  coarse: '0.35', fine: '0.2',  usNom: '2#',      usIn: '0.086',  usMm: '2.184',  unc: '56',  unf: '64'  },
  { metric: 'M2',    coarse: '0.4',  fine: '0.25', usNom: '3#',      usIn: '0.099',  usMm: '2.515',  unc: '48',  unf: '56'  },
  { metric: 'M2.5',  coarse: '0.45', fine: '0.35', usNom: '4#',      usIn: '0.112',  usMm: '2.845',  unc: '40',  unf: '48'  },
  { metric: 'M3',    coarse: '0.5',  fine: '0.35', usNom: '5#',      usIn: '0.125',  usMm: '3.175',  unc: '40',  unf: '44'  },
  { metric: 'M4',    coarse: '0.7',  fine: '0.5',  usNom: '6#',      usIn: '0.138',  usMm: '3.505',  unc: '32',  unf: '40'  },
  { metric: 'M5',    coarse: '0.8',  fine: '0.5',  usNom: '8#',      usIn: '0.164',  usMm: '4.166',  unc: '32',  unf: '36'  },
  { metric: 'M6',    coarse: '1',    fine: '0.75', usNom: '10#',     usIn: '0.19',   usMm: '4.826',  unc: '24',  unf: '32'  },
  { metric: 'M8',    coarse: '1.25', fine: '1',    usNom: '12#',     usIn: '0.216',  usMm: '5.486',  unc: '24',  unf: '28'  },
  { metric: 'M10',   coarse: '1.5',  fine: '1.25', usNom: '1/4″',   usIn: '0.25',   usMm: '6.35',   unc: '20',  unf: '28'  },
  { metric: 'M12',   coarse: '1.75', fine: '1.25', usNom: '5/16″',  usIn: '0.3125', usMm: '7.938',  unc: '18',  unf: '24'  },
  { metric: 'M14',   coarse: '2',    fine: '1.5',  usNom: '3/8″',   usIn: '0.375',  usMm: '9.525',  unc: '16',  unf: '24'  },
  { metric: 'M16',   coarse: '2',    fine: '1.5',  usNom: '7/16″',  usIn: '0.4375', usMm: '11.113', unc: '14',  unf: '20'  },
  { metric: 'M18',   coarse: '2.5',  fine: '1.5',  usNom: '1/2″',   usIn: '0.5',    usMm: '12.7',   unc: '13',  unf: '20'  },
  { metric: 'M20',   coarse: '2.5',  fine: '1.5',  usNom: '9/16″',  usIn: '0.5625', usMm: '14.288', unc: '12',  unf: '18'  },
  { metric: 'M22',   coarse: '2.5',  fine: '1.5',  usNom: '5/8″',   usIn: '0.625',  usMm: '15.875', unc: '11',  unf: '18'  },
  { metric: 'M24',   coarse: '3',    fine: '2',    usNom: '3/4″',   usIn: '0.75',   usMm: '19.05',  unc: '10',  unf: '16'  },
  { metric: 'M27',   coarse: '3',    fine: '2',    usNom: '7/8″',   usIn: '0.875',  usMm: '22.225', unc: '9',   unf: '14'  },
  { metric: 'M30',   coarse: '3.5',  fine: '2',    usNom: '1″',     usIn: '1',      usMm: '25.4',   unc: '8',   unf: '12'  },
  { metric: '(M33)', coarse: '3.5',  fine: '2',    usNom: '1-1/8″', usIn: '1.125',  usMm: '28.575', unc: '7',   unf: '12'  },
  { metric: 'M36',   coarse: '4',    fine: '3',    usNom: '1-1/4″', usIn: '1.25',   usMm: '31.75',  unc: '7',   unf: '12'  },
  { metric: '(M39)', coarse: '4',    fine: '3',    usNom: '1-3/8″', usIn: '1.375',  usMm: '34.925', unc: '6',   unf: '12'  },
  { metric: 'M42',   coarse: '4.5',  fine: '3',    usNom: '1-1/2″', usIn: '1.5',    usMm: '38.1',   unc: '6',   unf: '12'  },
  { metric: '(M45)', coarse: '4.5',  fine: '3',    usNom: '1-3/4″', usIn: '1.75',   usMm: '44.45',  unc: '5',   unf: '–'   },
  { metric: 'M48',   coarse: '5',    fine: '3',    usNom: '2″',     usIn: '2',      usMm: '50.8',   unc: '4.5', unf: '–'   },
];

function renderThreadTable() {
  app.innerHTML = '';
  renderNavBar(app, { title: '螺纹对照表', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.cssText = 'padding-top:44px;overflow-x:auto;-webkit-overflow-scrolling:touch;';

  const table = document.createElement('table');
  table.className = 'thread-cmp-table';

  // ── 表头（3行） ──
  table.innerHTML = `
    <thead>
      <tr>
        <th colspan="3" class="tct-group-left">公制螺纹牙距表</th>
        <th colspan="5" class="tct-group-right">美制 统一标准螺纹牙数表</th>
      </tr>
      <tr>
        <th class="tct-sub tct-red">公称直径</th>
        <th colspan="2" class="tct-sub">牙距 mm</th>
        <th class="tct-sub tct-red">公称直径</th>
        <th colspan="2" class="tct-sub">直径尺寸</th>
        <th colspan="2" class="tct-sub">牙距＝每英寸牙数</th>
      </tr>
      <tr>
        <th class="tct-sub">毫米</th>
        <th class="tct-sub">粗牙</th>
        <th class="tct-sub">细牙</th>
        <th class="tct-sub">号<1/4"</th>
        <th class="tct-sub">英寸<br>in</th>
        <th class="tct-sub">毫米<br>mm</th>
        <th class="tct-sub">粗牙<br>UNC</th>
        <th class="tct-sub">细牙 UNF</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');
  TABLE_DATA.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.className = i % 2 === 0 ? '' : 'tct-alt';
    tr.innerHTML = `
      <td class="tct-metric">${row.metric}</td>
      <td>${row.coarse}</td>
      <td>${row.fine}</td>
      <td class="tct-usnom">${row.usNom}</td>
      <td>${row.usIn}</td>
      <td>${row.usMm}</td>
      <td>${row.unc}</td>
      <td>${row.unf}</td>
    `;
    tbody.appendChild(tr);
  });

  content.appendChild(table);
  app.appendChild(content);
}

export function registerRoutes(router) {
  router.register('#/thread-table', () => renderThreadTable());
}
