import Router from '../router.js';
import { renderNavBar } from '../components/nav-bar.js';

// 16 个功能模块配置
export const HOME_MODULES = [
  { name: '圆弧接点',   route: '#/arc',          icon: 'static/zhutu/1.png'  },
  { name: '各种螺纹',   route: '#/thread',        icon: 'static/zhutu/2.png'  },
  { name: '宏程序',     route: '#/macro',         icon: 'static/zhutu/3.png'  },
  { name: '角度计算',   route: '#/angle',         icon: 'static/zhutu/4.png'  },
  { name: '公差等级',   route: '#/tolerance',     icon: 'static/zhutu/5.png'  },
  { name: '对角计算',   route: '#/diagonal',      icon: 'static/zhutu/6.png'  },
  { name: '材料重量',   route: '#/material',      icon: 'static/zhutu/7.png'  },
  { name: '常用代码',   route: '#/gcode',         icon: 'static/zhutu/8.png'  },
  { name: '螺纹对照表', route: '#/thread-table',  icon: 'static/zhutu/9.png'  },
  { name: '三角函数表', route: '#/trig-table',    icon: 'static/zhutu/10.png' },
  { name: '其他计算',   route: '#/other',         icon: 'static/zhutu/11.png' },
  { name: '工艺品',     route: '#/craft',         icon: 'static/zhutu/12.png' },
  { name: '各种槽',     route: '#/groove',        icon: 'static/zhutu/13.png' },
  { name: '解三角形',   route: '#/triangle',      icon: 'static/zhutu/14.png' },
  { name: '宏转G模拟',  route: '#/macro-sim',     icon: 'static/zhutu/15.png' },
  { name: '实验室',     route: '#/lab',           icon: 'static/zhutu/16.png' },
];

/**
 * 渲染首页
 * @param {HTMLElement} container - #app 容器
 */
export function renderHomePage(container) {
  // 清空容器
  container.innerHTML = '';

  // 渲染导航栏（首页不显示返回和恢复按钮）
  renderNavBar(container, { title: '车工计算', showBack: false, showReset: false });

  // 页面内容区域
  const content = document.createElement('div');
  content.className = 'page-content';

  // 网格容器
  const grid = document.createElement('div');
  grid.className = 'home-grid';

  // 渲染每个模块入口
  HOME_MODULES.forEach(module => {
    const item = document.createElement('div');
    item.className = 'home-grid-item';

    const img = document.createElement('img');
    img.src = module.icon;
    img.alt = module.name;

    const label = document.createElement('span');
    label.textContent = module.name;

    item.appendChild(img);
    item.appendChild(label);

    item.addEventListener('click', () => Router.navigate(module.route));

    grid.appendChild(item);
  });

  content.appendChild(grid);
  container.appendChild(content);
}
