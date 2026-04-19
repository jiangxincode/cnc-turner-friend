// src/modules/arc-junction/index.js
import Router from '../../router.js';
import { renderNavBar } from '../../components/nav-bar.js';
import { renderCalcPage } from '../../components/calc-page.js';
import { qtPages, wyPages, nkPages } from '../../data/arc-junction-data.js';
import { calcArcJunction } from './calc.js';

const app = document.getElementById('app');

// 为每个页面配置添加计算函数
function addCalcFn(pages) {
  return pages.map(p => ({ ...p, calculate: calcArcJunction }));
}

const qtPagesWithCalc = addCalcFn(qtPages);
const wyPagesWithCalc = addCalcFn(wyPages);
const nkPagesWithCalc = addCalcFn(nkPages);

/**
 * 渲染圆弧接点入口页面（带图片的分组网格，每行3列）
 */
function renderArcIndex() {
  app.innerHTML = '';
  renderNavBar(app, { title: '圆弧接点', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';

  const groups = [
    { label: '球头接点', pages: qtPagesWithCalc, prefix: 'qt' },
    { label: '外形接点', pages: wyPagesWithCalc, prefix: 'wy' },
    { label: '内孔接点', pages: nkPagesWithCalc, prefix: 'nk' },
  ];

  groups.forEach(({ label, pages, prefix }) => {
    // 分组标题
    const groupTitle = document.createElement('div');
    groupTitle.className = 'group-title';
    groupTitle.textContent = label;
    content.appendChild(groupTitle);

    // 网格容器
    const grid = document.createElement('div');
    grid.className = 'arc-grid';

    pages.forEach((page, idx) => {
      const item = document.createElement('div');
      item.className = 'arc-grid-item';

      const img = document.createElement('img');
      img.src = page.diagram;
      img.alt = page.title;
      img.onerror = () => { img.style.visibility = 'hidden'; };

      const label = document.createElement('span');
      label.textContent = page.title;

      item.appendChild(img);
      item.appendChild(label);

      // nk 用顺序索引，qt/wy 用原始编号
      const id = prefix === 'nk' ? idx + 1 : page.id.replace(prefix, '');
      item.addEventListener('click', () => Router.navigate(`#/arc/${prefix}/${id}`));

      grid.appendChild(item);
    });

    content.appendChild(grid);
  });

  app.appendChild(content);
}

// 注册路由
export function registerRoutes(router) {
  router.register('#/arc', () => renderArcIndex());

  // 球头接点子页面
  router.register('#/arc/qt/:id', ({ id }) => {
    const page = qtPagesWithCalc.find(p => p.id === `qt${id}`);
    if (page) renderCalcPage(app, page);
    else Router.navigate('#/arc');
  });

  // 外形接点子页面
  router.register('#/arc/wy/:id', ({ id }) => {
    const page = wyPagesWithCalc.find(p => p.id === `wy${id}`);
    if (page) renderCalcPage(app, page);
    else Router.navigate('#/arc');
  });

  // 内孔接点子页面（id 为显示序号 1-21）
  router.register('#/arc/nk/:id', ({ id }) => {
    const idx = parseInt(id) - 1;
    const page = nkPagesWithCalc[idx];
    if (page) renderCalcPage(app, page);
    else Router.navigate('#/arc');
  });
}
