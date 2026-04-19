// src/modules/gcode/index.js
import { renderNavBar } from '../../components/nav-bar.js';
import { renderListPage } from '../../components/list-page.js';

const app = document.getElementById('app');

// G代码列表数据
const G_CODES = [
  { code: 'G00', desc: '快速定位' },
  { code: 'G01', desc: '直线插补' },
  { code: 'G02', desc: '顺时针圆弧插补' },
  { code: 'G03', desc: '逆时针圆弧插补' },
  { code: 'G04', desc: '暂停/延时' },
  { code: 'G20', desc: '英制输入' },
  { code: 'G21', desc: '公制输入' },
  { code: 'G28', desc: '返回参考点' },
  { code: 'G32', desc: '螺纹切削' },
  { code: 'G40', desc: '刀具半径补偿取消' },
  { code: 'G41', desc: '刀具半径左补偿' },
  { code: 'G42', desc: '刀具半径右补偿' },
  { code: 'G50', desc: '坐标系设定/主轴最高转速限制' },
  { code: 'G54', desc: '工件坐标系1' },
  { code: 'G70', desc: '精加工循环' },
  { code: 'G71', desc: '外圆粗车循环' },
  { code: 'G72', desc: '端面粗车循环' },
  { code: 'G73', desc: '仿形粗车循环' },
  { code: 'G74', desc: '端面深孔钻削循环' },
  { code: 'G75', desc: '外圆/内圆切槽循环' },
  { code: 'G76', desc: '螺纹切削复合循环' },
  { code: 'G90', desc: '外圆/内圆车削循环' },
  { code: 'G92', desc: '螺纹切削循环' },
  { code: 'G94', desc: '端面车削循环' },
  { code: 'G96', desc: '恒线速度控制' },
  { code: 'G97', desc: '恒转速控制' },
  { code: 'G98', desc: '每分钟进给' },
  { code: 'G99', desc: '每转进给' },
  { code: 'M00', desc: '程序停止' },
  { code: 'M01', desc: '选择停止' },
  { code: 'M02', desc: '程序结束' },
  { code: 'M03', desc: '主轴正转' },
  { code: 'M04', desc: '主轴反转' },
  { code: 'M05', desc: '主轴停止' },
  { code: 'M08', desc: '切削液开' },
  { code: 'M09', desc: '切削液关' },
  { code: 'M30', desc: '程序结束并返回' },
];

// 对刀说明数据
const DUIDAO_INFO = [
  { title: '试切对刀法', content: '1. 主轴正转，手动车削外圆一小段\n2. 保持X轴不动，沿Z轴退刀\n3. 测量外圆直径，输入到刀具补偿中\n4. 手动车削端面一刀\n5. 保持Z轴不动，沿X轴退刀\n6. 将Z轴坐标设为0' },
  { title: '机械对刀仪对刀', content: '使用对刀仪自动测量刀具长度补偿值，精度高，操作简便。' },
  { title: 'G50坐标系设定', content: 'G50 X[直径] Z[Z坐标]\n在当前刀具位置建立工件坐标系' },
];

function renderGcodeIndex() {
  renderListPage(app, {
    title: '常用代码',
    items: [
      { name: 'G/M代码列表', route: '#/gcode/Gdaima' },
      { name: '常用代码说明', route: '#/gcode/index' },
      { name: '对刀说明',     route: '#/gcode/buchang' },
    ],
  });
}

function renderGdaima() {
  app.innerHTML = '';
  renderNavBar(app, { title: 'G/M代码列表', showBack: true, showReset: false });
  const content = document.createElement('div');
  content.className = 'page-content';
  G_CODES.forEach(item => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<span style="font-weight:bold;min-width:50px;color:#2c3e50;">${item.code}</span><span style="flex:1;color:#555;">${item.desc}</span>`;
    content.appendChild(row);
  });
  app.appendChild(content);
}

function renderGcodeDetail() {
  app.innerHTML = '';
  renderNavBar(app, { title: '常用代码说明', showBack: true, showReset: false });
  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.padding = '44px 16px 16px';
  
  const sections = [
    { title: '插补指令', items: ['G00 快速定位', 'G01 直线插补 F进给', 'G02 顺圆弧 I/J/K或R', 'G03 逆圆弧 I/J/K或R'] },
    { title: '螺纹指令', items: ['G32 螺纹切削 F螺距', 'G92 螺纹循环', 'G76 螺纹复合循环'] },
    { title: '循环指令', items: ['G71 外圆粗车循环', 'G72 端面粗车循环', 'G73 仿形循环', 'G70 精车循环'] },
    { title: '辅助功能', items: ['M03 主轴正转 S转速', 'M04 主轴反转', 'M05 主轴停', 'M08 切削液开', 'M09 切削液关'] },
  ];
  
  sections.forEach(sec => {
    const title = document.createElement('div');
    title.className = 'group-title';
    title.textContent = sec.title;
    content.appendChild(title);
    sec.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'list-item';
      row.style.fontSize = '13px';
      row.textContent = item;
      content.appendChild(row);
    });
  });
  
  app.appendChild(content);
}

function renderBuchang() {
  app.innerHTML = '';
  renderNavBar(app, { title: '对刀说明', showBack: true, showReset: false });
  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.padding = '44px 16px 16px';
  
  DUIDAO_INFO.forEach(item => {
    const title = document.createElement('div');
    title.className = 'group-title';
    title.textContent = item.title;
    content.appendChild(title);
    const text = document.createElement('div');
    text.style.cssText = 'padding:12px 16px;font-size:13px;line-height:1.8;white-space:pre-line;color:#555;';
    text.textContent = item.content;
    content.appendChild(text);
  });
  
  app.appendChild(content);
}

export function registerRoutes(router) {
  router.register('#/gcode', () => renderGcodeIndex());
  router.register('#/gcode/Gdaima', () => renderGdaima());
  router.register('#/gcode/index', () => renderGcodeDetail());
  router.register('#/gcode/buchang', () => renderBuchang());
}
