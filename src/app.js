import Router from './router.js';
import { renderHomePage } from './pages/home.js';

// 导入所有功能模块
import { registerRoutes as registerArcRoutes } from './modules/arc-junction/index.js';
import { registerRoutes as registerThreadRoutes } from './modules/thread/index.js';
import { registerRoutes as registerMacroRoutes } from './modules/macro/index.js';
import { registerRoutes as registerAngleRoutes } from './modules/angle/index.js';
import { registerRoutes as registerToleranceRoutes } from './modules/tolerance/index.js';
import { registerRoutes as registerDiagonalRoutes } from './modules/diagonal/index.js';
import { registerRoutes as registerMaterialRoutes } from './modules/material/index.js';
import { registerRoutes as registerGcodeRoutes } from './modules/gcode/index.js';
import { registerRoutes as registerThreadTableRoutes } from './modules/thread-table/index.js';
import { registerRoutes as registerTrigTableRoutes } from './modules/trig-table/index.js';
import { registerRoutes as registerOtherRoutes } from './modules/other/index.js';
import { registerRoutes as registerCraftRoutes } from './modules/craft/index.js';
import { registerRoutes as registerGrooveRoutes } from './modules/groove/index.js';
import { registerRoutes as registerTriangleRoutes } from './modules/triangle/index.js';
import { registerRoutes as registerMacroSimRoutes } from './modules/macro-sim/index.js';
import { registerRoutes as registerLabRoutes } from './modules/lab/index.js';

const app = document.getElementById('app');

// 注册首页路由
Router.register('#/', () => renderHomePage(app));

// 注册所有功能模块路由
registerArcRoutes(Router);
registerThreadRoutes(Router);
registerMacroRoutes(Router);
registerAngleRoutes(Router);
registerToleranceRoutes(Router);
registerDiagonalRoutes(Router);
registerMaterialRoutes(Router);
registerGcodeRoutes(Router);
registerThreadTableRoutes(Router);
registerTrigTableRoutes(Router);
registerOtherRoutes(Router);
registerCraftRoutes(Router);
registerGrooveRoutes(Router);
registerTriangleRoutes(Router);
registerMacroSimRoutes(Router);
registerLabRoutes(Router);

// 全局错误处理
window.addEventListener('error', (e) => {
  console.error('全局错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('未处理的Promise错误:', e.reason);
});

// 启动应用
Router.init();
