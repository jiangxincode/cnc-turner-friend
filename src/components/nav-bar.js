import Router from '../router.js';

/**
 * 渲染导航栏
 * @param {HTMLElement} container - 要插入导航栏的容器（通常是 #app）
 * @param {Object} options
 * @param {string} options.title - 页面标题
 * @param {boolean} [options.showBack=true] - 是否显示返回按钮
 * @param {boolean} [options.showReset=false] - 是否显示"恢复"按钮
 * @param {Function} [options.onReset] - 点击恢复按钮的回调
 */
export function renderNavBar(container, options = {}) {
  const { title = '', showBack = true, showReset = false, onReset } = options;

  // 移除已有导航栏
  const existing = container.querySelector('.nav-bar');
  if (existing) existing.remove();

  const nav = document.createElement('div');
  nav.className = 'nav-bar';

  // 左侧：返回按钮
  const leftBtn = document.createElement('button');
  leftBtn.className = 'nav-btn';
  if (showBack) {
    leftBtn.textContent = '‹ 返回';
    leftBtn.addEventListener('click', () => Router.back());
  }

  // 中间：标题
  const titleEl = document.createElement('span');
  titleEl.className = 'nav-title';
  titleEl.textContent = title;

  // 右侧：恢复按钮
  const rightBtn = document.createElement('button');
  rightBtn.className = 'nav-btn';
  if (showReset) {
    rightBtn.textContent = '恢复';
    rightBtn.addEventListener('click', () => onReset && onReset());
  }

  nav.appendChild(leftBtn);
  nav.appendChild(titleEl);
  nav.appendChild(rightBtn);

  // 插入到容器最前面
  container.insertBefore(nav, container.firstChild);

  return nav;
}
