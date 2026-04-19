import { renderCalcPage } from '../../components/calc-page.js';
import { renderListPage } from '../../components/list-page.js';
import { otherTypes } from '../../data/other-data.js';

const app = document.getElementById('app');

function renderOtherIndex() {
  renderListPage(app, {
    title: '其他计算',
    items: otherTypes.map(t => ({ name: t.title, route: `#/other/${t.id}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/other', () => renderOtherIndex());
  otherTypes.forEach(page => {
    router.register(`#/other/${page.id}`, () => renderCalcPage(app, page));
  });
}
