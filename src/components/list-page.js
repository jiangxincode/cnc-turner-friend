import { renderNavBar } from './nav-bar.js';
import Router from '../router.js';

/**
 * 渲染列表页面（支持普通列表和分组列表）
 * @param {HTMLElement} container - 页面容器（通常是 #app）
 * @param {Object} config - 页面配置
 * @param {string} config.title - 页面标题
 * @param {boolean} [config.showBack=true] - 是否显示返回按钮
 * @param {boolean} [config.grouped=false] - 是否分组显示
 * @param {Array} config.items - 列表项
 * @param {string} config.items[].name - 列表项名称
 * @param {string} config.items[].route - 点击导航的路由
 * @param {string} [config.items[].icon] - 可选图标路径
 * @param {string} [config.items[].group] - 分组名称（grouped=true 时使用）
 */
export function renderListPage(container, config) {
  const { title = '', showBack = true, grouped = false, items = [] } = config;

  // 清空容器
  container.innerHTML = '';

  // 渲染导航栏（showReset=false）
  renderNavBar(container, { title, showBack, showReset: false });

  // 创建页面内容区域
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';

  if (!grouped) {
    // 普通列表：直接渲染所有 items
    items.forEach(item => {
      pageContent.appendChild(createListItem(item));
    });
  } else {
    // 分组列表：按 item.group 分组
    const groups = [];
    const groupMap = new Map();

    items.forEach(item => {
      const groupName = item.group || '';
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, []);
        groups.push(groupName);
      }
      groupMap.get(groupName).push(item);
    });

    groups.forEach(groupName => {
      // 渲染分组标题
      const groupTitle = document.createElement('div');
      groupTitle.className = 'group-title';
      groupTitle.textContent = groupName;
      pageContent.appendChild(groupTitle);

      // 渲染该组的 items
      groupMap.get(groupName).forEach(item => {
        pageContent.appendChild(createListItem(item));
      });
    });
  }

  container.appendChild(pageContent);
}

/**
 * 创建单个列表项元素
 * @param {Object} item
 * @returns {HTMLElement}
 */
function createListItem(item) {
  const el = document.createElement('div');
  el.className = 'list-item';

  // 可选图标
  if (item.icon) {
    const img = document.createElement('img');
    img.src = item.icon;
    img.alt = item.name;
    img.style.cssText = 'width:32px;height:32px;object-fit:contain;margin-right:12px;';
    el.appendChild(img);
  }

  // 名称
  const nameEl = document.createElement('span');
  nameEl.textContent = item.name;
  nameEl.style.flex = '1';
  el.appendChild(nameEl);

  // 右箭头
  const arrow = document.createElement('span');
  arrow.textContent = '›';
  arrow.style.cssText = 'color:#ccc;font-size:18px;';
  el.appendChild(arrow);

  // 点击导航
  el.addEventListener('click', () => Router.navigate(item.route));

  return el;
}
