// src/modules/gcode/index.js
import { renderNavBar } from '../../components/nav-bar.js';
import Router from '../../router.js';
import { G_CODES } from '../../data/gcode-data.js';

const app = document.getElementById('app');

// ─── M代码数据 ────────────────────────────────────────────────────────────────
const M_CODES = [
  { title: 'M00(暂停)', content: `M00 暂停
格式 M00
暂停当前程序，按启动继续运行` },
  { title: 'M01(选择停)', content: `M01 选择停
格式 M01
暂停当前程序，按启动继续运行（当操作面板上<选择停>灯亮时此代码有效）` },
  { title: 'M02(程序结束)', content: `M02 程序结束
格式 M02或M2
在自动方式下，执行M02代码，当前程序段的其它代码执行完成后，自动运行结束，光标停留在M02代码所在的程序段，不返回程序开头。若要再次执行程序，必须让光标返回程序开头。` },
  { title: 'M03(主轴正转)', content: `M03 主轴正转
格式 M03
主轴正转（转速有效时启动）
例：M03 S500
主轴正转 每分钟500转` },
  { title: 'M04(主轴反转)', content: `M04 主轴反转
格式 M04
主轴反转（转速有效时启动）
例：M04 S500
主轴反转 每分钟500转` },
  { title: 'M05(主轴停止)', content: `M05 主轴停止
格式 M05
主轴停止转动` },
  { title: 'M08(冷却液开)', content: `M08 打开冷却液
格式 M08
打开冷却液` },
  { title: 'M09(冷却液关)', content: `M09 关闭冷却液
格式 M09
关闭冷却液` },
  { title: 'M30(程序结束)', content: `M30 程序停止
格式 M30
停止程序 并跳转到程序第一行` },
  { title: 'M40(空档位)', content: `M40 空挡
格式 M40
主轴进入空挡` },
  { title: 'M41(高档位 劲小转速高)', content: `M41 M43 高挡位
格式 M41
档位处于高档位，可提升转速` },
  { title: 'M42(低档位 劲大转速低)', content: `M42 M44 低档位
格式 M42
档位处于低档位，用于低转速 大进刀量` },
  { title: 'M98(调用子程序)', content: `M98 跳转到子程序
格式 M98 Pxxx xxxx
例 M98 P20003
调用0003程序2次，程序号必须为4位数。调用次数最多999.
调用1次子程序时可省略只填写子程序号` },
  { title: 'M99(返回主程序或返回第一行)', content: `M99 返回主程序 或者 跳转到程序开头
格式 M99
如果只有一个程序，走到M99代码时会跳转到程序开头继续运行
如果在子程序里面，走到M99代码时会跳转到主程序，继续执行主程序下一步` },
  { title: 'M9000～M9999 宏程序调用', content: `调用与代码值对应的宏程序（O9000～O9999）
宏程序：O9000～O9999程序是为机床厂家预留的专用程序空间，用于机床厂家编辑实现专用功能的子程序，称为宏程序。
编辑O9000～O9999程序需具备2级（机床厂级）操作权限，操作权限为3～5级的用户没有修改、运行宏程序的操作权限，只能用宏程序调用代码调用执行。
M9000～M9999代码在MDI下运行无效。` },
  { title: '卡盘夹紧', content: `卡盘加紧
M68 M12
每个系统代码不一样请自行尝试` },
  { title: '卡盘松开', content: `卡盘松开
M69 M11 M13
每个系统代码不一样请自行尝试` },
  { title: '尾座前进', content: `尾座前进
M78 M10
每个系统代码不一样请自行尝试` },
  { title: '尾座后退', content: `尾座后退
每个系统代码不一样请自行尝试` },
  { title: '润滑开', content: `润滑开
M32` },
  { title: '润滑关', content: `润滑关
M33` },
];

// ─── 宏代码数据 ───────────────────────────────────────────────────────────────
const MACRO_CODES = [
  { title: '# 或 H01', content: `变量的意思
例如:
#1=8
#2=3
G0 X#1 Z#2
运行后坐标就是X8 Z3

#1~#33 局部变量
局部变量只能用在宏程序中存储数据，例如，运算结果。当断电时，局部变量被初始化为空。调用宏程序时，自变量对局部变量赋值

#100~#199和#500~#999：公共变量
公共变量在不同的宏程序中的意义相同。当断电时，变量#100~#199 被初始化为空，变量#500~#999 的数值被保存，即使断电也不丢失

1000~ 系统变量` },
  { title: 'EQ 或 == 或 H81', content: '等于的意思(=)' },
  { title: 'NE 或 <> 或 H82', content: '不等于的意思(≠)' },
  { title: 'GT 或 > 或 H83', content: '大于(>)' },
  { title: 'GE 或 >= 或 H85', content: '大于等于(≥)' },
  { title: 'LT 或 < 或 H84', content: '小于(<)' },
  { title: 'LE 或 <= 或 H86', content: '小于等于(≤)' },
  { title: '+', content: '加法' },
  { title: '-', content: '减法' },
  { title: '*', content: '乘法' },
  { title: '/', content: '除法' },
  { title: 'OR', content: '或者的意思' },
  { title: 'AND', content: '与的意思' },
  { title: 'XOR', content: '异或的意思' },
  { title: 'SQRT', content: '平方根的意思' },
  { title: 'ABS', content: '绝对值的意思' },
  { title: 'ROUND', content: '舍入的意思' },
  { title: 'FUP', content: '上取整的意思' },
  { title: 'FIX', content: '下取整的意思' },
  { title: 'LN', content: '自然对数的意思' },
  { title: 'EXP', content: '指数函数的意思' },
  { title: 'SIN', content: '正弦的意思' },
  { title: 'ASIN', content: '反正弦的意思' },
  { title: 'TAN', content: '正切的意思' },
  { title: 'ATAN', content: '反正切的意思' },
  { title: 'COS', content: '余弦的意思' },
  { title: 'ACOS', content: '反余弦的意思' },
  { title: 'GOTO', content: `转移
转移到顺序号为 n 的程序段。当指定 1 到 99999 以外的顺序号时报警，可用表达式指定顺序号。
格式：GOTOn；n：顺序号(1~99999)` },
  { title: 'IF', content: `如果
GOTO 格式：IF[条件表达式]GOTOn；
如果指定的条件表达式成立时，转移到顺序号为n的程序段；如果指定的条件表达式不成立，则顺序执行下个程序段。` },
  { title: 'WHILE', content: `循环
在 WHILE 后指定一个条件表达式，当指定条件成立时，执行从 DO 到 END 之间的程序段；否则，跳转到 END 后的程序段。` },
];

// ─── 对刀说明数据 ─────────────────────────────────────────────────────────────
const DUIDAO_TEXT = `方式3和方式2---(正常对刀):
碰到端面输入Z0 碰到X输入实际尺寸

方式8和方式6---(中心对刀):
碰到端面输入Z刀尖圆弧半径 也就是刀尖宽度/2
碰到X输入实际尺寸
例如:
外圆直径30 刀尖R1.5 直径是3
碰到直径就输入刀补X30 碰到端面输入Z1.5
内孔也同样这就是中心对刀

方式0---(圆心对刀):
碰到端面输入Z刀尖圆弧半径 也就是刀尖宽度/2
外圆碰到X输入实际尺寸+刀尖圆弧*2
内孔碰到X输入实际尺寸-刀尖圆弧*2
例如:
外圆直径30 刀尖R1.5 直径是3
碰到直径就输入刀补X33 碰到端面输入Z1.5
内孔直径30 刀尖R1.5 直径是3
碰到内孔就输入刀补X27 碰到端面输入Z1.5

方式7---
Z正常对刀碰到端面输入Z0 X尺寸用圆心对刀`;

// ─── 渲染入口页 ───────────────────────────────────────────────────────────────
function renderGcodeIndex() {
  app.innerHTML = '';
  renderNavBar(app, { title: '常用代码', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.cssText = 'display:flex;flex-direction:row;gap:16px;padding:60px 24px 24px;justify-content:center;';

  const btnStyle = 'flex:1;max-width:160px;padding:18px 0;font-size:17px;font-weight:bold;' +
    'background:#00a896;color:#fff;border:none;border-radius:10px;cursor:pointer;';

  const btnCode = document.createElement('button');
  btnCode.textContent = '常用代码';
  btnCode.style.cssText = btnStyle;
  btnCode.addEventListener('click', () => Router.navigate('#/gcode/Gdaima'));

  const btnDuidao = document.createElement('button');
  btnDuidao.textContent = '对刀说明';
  btnDuidao.style.cssText = btnStyle;
  btnDuidao.addEventListener('click', () => Router.navigate('#/gcode/buchang'));

  content.appendChild(btnCode);
  content.appendChild(btnDuidao);
  app.appendChild(content);
}

// ─── 渲染手风琴列表（G/M/宏代码共用） ────────────────────────────────────────
function renderAccordionPage(title, items) {
  app.innerHTML = '';
  renderNavBar(app, { title: '常用代码', showBack: true, showReset: false });

  // 顶部切换栏
  const tabs = document.createElement('div');
  tabs.style.cssText = 'position:fixed;top:44px;left:0;right:0;z-index:99;background:#fff;' +
    'display:flex;align-items:center;justify-content:center;gap:24px;padding:8px 16px;' +
    'border-bottom:1px solid #eee;';

  const tabDefs = [
    { label: 'G代码', route: '#/gcode/Gdaima' },
    { label: 'M代码', route: '#/gcode/Mdaima' },
    { label: '宏代码', route: '#/gcode/Hdaima' },
  ];

  tabDefs.forEach(tab => {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;font-size:15px;';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'codeTab';
    radio.style.cssText = 'width:18px;height:18px;accent-color:#00a896;cursor:pointer;';
    if (tab.route === window.location.hash) radio.checked = true;

    radio.addEventListener('change', () => {
      if (radio.checked) Router.navigate(tab.route);
    });

    wrap.appendChild(radio);
    wrap.appendChild(document.createTextNode(tab.label));
    tabs.appendChild(wrap);
  });

  app.appendChild(tabs);

  // 列表内容
  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.paddingTop = '92px';

  items.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'border-bottom:1px solid #eee;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;' +
      'padding:13px 16px;cursor:pointer;font-size:14px;color:#222;';
    header.innerHTML = `<span style="flex:1;">${item.title}</span>` +
      `<span class="accordion-arrow" style="color:#999;font-size:18px;transition:transform 0.2s;">∨</span>`;

    const body = document.createElement('div');
    body.style.cssText = 'display:none;padding:10px 16px 14px;font-size:13px;line-height:1.9;' +
      'color:#555;white-space:pre-line;background:#f9f9f9;';
    body.textContent = item.content;

    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      header.querySelector('.accordion-arrow').style.transform = isOpen ? '' : 'rotate(180deg)';
    });

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    content.appendChild(wrapper);
  });

  app.appendChild(content);
}

// ─── 渲染对刀说明页 ───────────────────────────────────────────────────────────
function renderBuchang() {
  app.innerHTML = '';
  renderNavBar(app, { title: '对刀说明', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.paddingTop = '52px';

  // 对刀图示
  const imgWrap = document.createElement('div');
  imgWrap.style.cssText = 'text-align:center;padding:12px 8px 4px;';
  const img = document.createElement('img');
  img.src = 'static/hong/duidao.png';
  img.alt = '对刀说明图';
  img.style.cssText = 'max-width:100%;border-radius:6px;';
  imgWrap.appendChild(img);
  content.appendChild(imgWrap);

  // 说明文字
  const textBox = document.createElement('div');
  textBox.style.cssText = 'padding:16px;font-size:14px;line-height:2;color:#333;white-space:pre-line;';
  textBox.textContent = DUIDAO_TEXT;
  content.appendChild(textBox);

  app.appendChild(content);
}

// ─── 路由注册 ─────────────────────────────────────────────────────────────────
export function registerRoutes(router) {
  router.register('#/gcode',         () => renderGcodeIndex());
  router.register('#/gcode/Gdaima',  () => renderAccordionPage('G代码', G_CODES));
  router.register('#/gcode/Mdaima',  () => renderAccordionPage('M代码', M_CODES));
  router.register('#/gcode/Hdaima',  () => renderAccordionPage('宏代码', MACRO_CODES));
  // 兼容旧路由
  router.register('#/gcode/index',   () => renderAccordionPage('G代码', G_CODES));
  router.register('#/gcode/buchang', () => renderBuchang());
}
