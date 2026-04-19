import { renderCalcPage } from '../../components/calc-page.js';
import { renderListPage } from '../../components/list-page.js';
import { wycPages, nkcPages, dmcPages } from '../../data/groove-data.js';

const app = document.getElementById('app');

function renderGrooveIndex() {
  renderListPage(app, {
    title: '各种槽',
    grouped: true,
    items: [
      { name: '外圆槽', route: '#/groove/wyc', group: '分类' },
      { name: '内孔槽', route: '#/groove/nkc', group: '分类' },
      { name: '端面槽', route: '#/groove/dmc', group: '分类' },
    ],
  });
}

function renderWycList() {
  renderListPage(app, {
    title: '外圆槽',
    items: wycPages.map(p => ({ name: p.title, route: `#/groove/wyc/${p.id.replace('wyc', '')}` })),
  });
}

function renderNkcList() {
  renderListPage(app, {
    title: '内孔槽',
    items: nkcPages.map(p => ({ name: p.title, route: `#/groove/nkc/${p.id.replace('nkc', '')}` })),
  });
}

function renderDmcList() {
  renderListPage(app, {
    title: '端面槽',
    items: dmcPages.map(p => ({ name: p.title, route: `#/groove/dmc/${p.id.replace('dmc', '')}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/groove', () => renderGrooveIndex());
  router.register('#/groove/wyc', () => renderWycList());
  router.register('#/groove/nkc', () => renderNkcList());
  router.register('#/groove/dmc', () => renderDmcList());

  wycPages.forEach(page => {
    router.register(`#/groove/wyc/${page.id.replace('wyc', '')}`, () => renderCalcPage(app, page));
  });
  nkcPages.forEach(page => {
    router.register(`#/groove/nkc/${page.id.replace('nkc', '')}`, () => renderCalcPage(app, page));
  });
  dmcPages.forEach(page => {
    router.register(`#/groove/dmc/${page.id.replace('dmc', '')}`, () => renderCalcPage(app, page));
  });
}
