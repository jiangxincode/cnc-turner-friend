// src/modules/arc-junction/index.js
import Router from '../../router.js';
import { renderListPage } from '../../components/list-page.js';
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

// 渲染圆弧接点入口页面
function renderArcIndex() {
  renderListPage(app, {
    title: '圆弧接点',
    grouped: true,
    items: [
      { name: '球头接点', route: '#/arc/qt', group: '分类' },
      { name: '外形接点', route: '#/arc/wy', group: '分类' },
      { name: '内形接点', route: '#/arc/nk', group: '分类' },
    ],
  });
}

// 渲染球头接点列表
function renderQtList() {
  renderListPage(app, {
    title: '球头接点',
    items: qtPagesWithCalc.map(p => ({ name: p.title, route: `#/arc/qt/${p.id.replace('qt', '')}` })),
  });
}

// 渲染外形接点列表
function renderWyList() {
  renderListPage(app, {
    title: '外形接点',
    items: wyPagesWithCalc.map(p => ({ name: p.title, route: `#/arc/wy/${p.id.replace('wy', '')}` })),
  });
}

// 渲染内形接点列表
function renderNkList() {
  renderListPage(app, {
    title: '内形接点',
    items: nkPagesWithCalc.map(p => ({ name: p.title, route: `#/arc/nk/${p.id.replace('nk', '')}` })),
  });
}

// 注册路由
export function registerRoutes(router) {
  router.register('#/arc', () => renderArcIndex());
  router.register('#/arc/qt', () => renderQtList());
  router.register('#/arc/wy', () => renderWyList());
  router.register('#/arc/nk', () => renderNkList());

  // 球头接点子页面
  router.register('#/arc/qt/:id', ({ id }) => {
    const page = qtPagesWithCalc.find(p => p.id === `qt${id}`);
    if (page) renderCalcPage(app, page);
    else Router.navigate('#/arc/qt');
  });

  // 外形接点子页面
  router.register('#/arc/wy/:id', ({ id }) => {
    const page = wyPagesWithCalc.find(p => p.id === `wy${id}`);
    if (page) renderCalcPage(app, page);
    else Router.navigate('#/arc/wy');
  });

  // 内形接点子页面
  router.register('#/arc/nk/:id', ({ id }) => {
    const page = nkPagesWithCalc.find(p => p.id === `nk${id}`);
    if (page) renderCalcPage(app, page);
    else Router.navigate('#/arc/nk');
  });
}
