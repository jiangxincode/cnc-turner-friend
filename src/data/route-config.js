// 路由配置数据
// 从原应用 app-config-service.js 的 __uniRoutes 提取并适配
// showReset: 是否显示"恢复"按钮（对应原应用 navigationBarButtons 中有"恢复"按钮的页面）

export const ROUTE_CONFIG = [
  // 首页
  { path: '#/', title: '数控车工之友', showReset: false, module: 'home' },

  // 圆弧接点
  { path: '#/arc', title: '圆弧接点', showReset: false, module: 'arc-junction' },
  { path: '#/arc/qt', title: '球头接点', showReset: false, module: 'arc-junction' },
  { path: '#/arc/wy', title: '外形接点', showReset: false, module: 'arc-junction' },
  { path: '#/arc/nk', title: '内孔接点', showReset: false, module: 'arc-junction' },
  ...Array.from({ length: 12 }, (_, i) => ({ path: `#/arc/qt/${i + 1}`, title: `球头接点${i + 1}`, showReset: true, module: 'arc-junction' })),
  ...Array.from({ length: 36 }, (_, i) => ({ path: `#/arc/wy/${i + 1}`, title: `外形接点${i + 1}`, showReset: true, module: 'arc-junction' })),
  ...Array.from({ length: 21 }, (_, i) => ({ path: `#/arc/nk/${i + 1}`, title: `内孔接点${i + 1}`, showReset: true, module: 'arc-junction' })),

  // 螺纹
  { path: '#/thread', title: '各种螺纹', showReset: false, module: 'thread' },

  // 宏程序
  { path: '#/macro', title: '宏程序', showReset: false, module: 'macro' },

  // 角度计算
  { path: '#/angle', title: '角度计算', showReset: false, module: 'angle' },
  { path: '#/angle/JiaoDuJiSuan', title: '角度计算', showReset: true, module: 'angle' },
  { path: '#/angle/moshizhui', title: '莫氏锥查询', showReset: false, module: 'angle' },

  // 公差等级
  { path: '#/tolerance', title: '公差等级', showReset: false, module: 'tolerance' },

  // 对角计算
  { path: '#/diagonal', title: '对角计算', showReset: false, module: 'diagonal' },

  // 材料重量
  { path: '#/material', title: '材料重量', showReset: false, module: 'material' },

  // 常用代码
  { path: '#/gcode', title: '常用代码', showReset: false, module: 'gcode' },
  { path: '#/gcode/Gdaima', title: '常用代码', showReset: false, module: 'gcode' },
  { path: '#/gcode/Mdaima', title: '常用代码', showReset: false, module: 'gcode' },
  { path: '#/gcode/Hdaima', title: '常用代码', showReset: false, module: 'gcode' },
  { path: '#/gcode/index', title: '常用代码', showReset: false, module: 'gcode' },
  { path: '#/gcode/buchang', title: '对刀说明', showReset: false, module: 'gcode' },

  // 螺纹对照表
  { path: '#/thread-table', title: '螺纹对照表', showReset: false, module: 'thread-table' },

  // 三角函数表
  { path: '#/trig-table', title: '三角函数表', showReset: false, module: 'trig-table' },

  // 其他计算
  { path: '#/other', title: '其他计算', showReset: false, module: 'other' },

  // 工艺品
  { path: '#/craft', title: '工艺品', showReset: false, module: 'craft' },

  // 各种槽
  { path: '#/groove', title: '各种槽', showReset: false, module: 'groove' },
  { path: '#/groove/wyc', title: '外圆槽', showReset: false, module: 'groove' },
  { path: '#/groove/nkc', title: '内孔槽', showReset: false, module: 'groove' },
  { path: '#/groove/dmc', title: '端面槽', showReset: false, module: 'groove' },

  // 解三角形
  { path: '#/triangle', title: '解三角形', showReset: false, module: 'triangle' },

  // 宏转G模拟
  { path: '#/macro-sim', title: '宏转G模拟', showReset: false, module: 'macro-sim' },

  // 实验室
  { path: '#/lab', title: '实验室', showReset: false, module: 'lab' },
];

/**
 * 根据路由路径获取配置
 * @param {string} path
 * @returns {Object|null}
 */
export function getRouteConfig(path) {
  return ROUTE_CONFIG.find(r => r.path === path) || null;
}
