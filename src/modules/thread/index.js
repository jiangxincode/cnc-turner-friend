import Router from '../../router.js';
import { renderListPage } from '../../components/list-page.js';
import { renderCalcPage } from '../../components/calc-page.js';
import { threadTypes } from '../../data/thread-data.js';
import { calcThread } from './calc.js';

const app = document.getElementById('app');

// 为每个螺纹类型添加计算函数
const threadPagesWithCalc = threadTypes.map(t => ({
  ...t,
  calculate: (inputs) => calcThread(t.id, inputs),
}));

function renderThreadIndex() {
  renderListPage(app, {
    title: '各种螺纹',
    items: threadPagesWithCalc.map(t => ({ name: t.title, route: `#/thread/${t.id}` })),
  });
}

export function registerRoutes(router) {
  router.register('#/thread', () => renderThreadIndex());

  threadPagesWithCalc.forEach(page => {
    router.register(`#/thread/${page.id}`, () => renderCalcPage(app, page));
  });
}
