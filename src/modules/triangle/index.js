import { renderNavBar } from '../../components/nav-bar.js';
import CalcUtils from '../../utils/calc-utils.js';

const app = document.getElementById('app');
const DEG = Math.PI / 180;

/* ═══════════════════════════════════════════════════════════════════════════
   Canvas 绘制三角形
   布局: A(顶), B(左下), C(右下)
   边标注按截图: a=AB(左边), b=BC(底边), c=AC(斜边)
   计算逻辑内部也统一用这套约定:
     A角 对 a边(BC)? 不——按截图约定:
     A角在顶, 对面是BC=底边, 截图标底边为b
     所以: A角对b边, B角对c边, C角对a边 (截图约定)
   为避免混乱，UI输入/输出直接用 A角/a边/B角/b边/C角/c边
   绘图标注: 左边=a, 底边=b, 斜边=c (与截图一致)
   ═══════════════════════════════════════════════════════════════════════════ */

function drawTriangleDiagram(canvas, data) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 280;
  const cssH = canvas.clientHeight || 190;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);

  // 用于绘图的角度 (B角在左下)
  let Bd = data.B, Cd = data.C;
  let sideAB, sideBC;
  const hasFull = data.A != null && data.B != null && data.C != null &&
                  data.a != null && data.b != null && data.c != null;

  if (hasFull) {
    Bd = data.B; Cd = data.C;
    sideAB = data.c; // c边=AB(左边, 对C角)
    sideBC = data.a; // a边=BC(底边, 对A角)
  } else {
    // 默认示意
    Bd = data.isRight ? 90 : 70;
    Cd = data.isRight ? 50 : 60;
    const Ad = 180 - Bd - Cd;
    sideBC = 1; // 底边=a
    sideAB = sideBC * Math.sin(Cd * DEG) / Math.sin(Ad * DEG); // c=AB, 正弦定理
  }

  // B在原点, C在右(BC水平), A通过B角和AB确定
  const pBx = 0, pBy = 0;
  const pCx = sideBC, pCy = 0;
  const pAx = sideAB * Math.cos(Bd * DEG);
  const pAy = -sideAB * Math.sin(Bd * DEG);

  // 缩放
  const pad = 28;
  const allX = [pAx, pBx, pCx], allY = [pAy, pBy, pCy];
  const mnX = Math.min(...allX), mxX = Math.max(...allX);
  const mnY = Math.min(...allY), mxY = Math.max(...allY);
  const tw = mxX - mnX || 1, th = mxY - mnY || 1;
  const sc = Math.min((cssW - pad * 2) / tw, (cssH - pad * 2) / th);
  const ox = pad + ((cssW - pad * 2) - tw * sc) / 2 - mnX * sc;
  const oy = pad + ((cssH - pad * 2) - th * sc) / 2 - mnY * sc;

  const A = { x: ox + pAx * sc, y: oy + pAy * sc };
  const B = { x: ox + pBx * sc, y: oy + pBy * sc };
  const C = { x: ox + pCx * sc, y: oy + pCy * sc };
  const ct = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

  // 三角形
  ctx.beginPath();
  ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.closePath();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.stroke();

  // 直角标记
  if (Bd != null && Math.abs(Bd - 90) < 0.5) {
    const s = 10;
    const uA = uv(A.x - B.x, A.y - B.y, s);
    const uC = uv(C.x - B.x, C.y - B.y, s);
    ctx.beginPath();
    ctx.moveTo(B.x + uA.x, B.y + uA.y);
    ctx.lineTo(B.x + uA.x + uC.x, B.y + uA.y + uC.y);
    ctx.lineTo(B.x + uC.x, B.y + uC.y);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // 顶点
  ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#222';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lbl(ctx, A, ct, 'A', 16);
  lbl(ctx, B, ct, 'B', 16);
  lbl(ctx, C, ct, 'C', 16);

  // 边: 标准约定 a对A角=BC(底), b对B角=AC(斜), c对C角=AB(左)
  ctx.font = '13px sans-serif'; ctx.fillStyle = '#444';
  eLbl(ctx, B, C, ct, 'a', 14);  // BC = a (对A角)
  eLbl(ctx, A, C, ct, 'b', 14);  // AC = b (对B角)
  eLbl(ctx, A, B, ct, 'c', 14);  // AB = c (对C角)
}

function uv(dx, dy, len) { const d = Math.sqrt(dx*dx+dy*dy)||1; return {x:dx/d*len,y:dy/d*len}; }
function lbl(ctx,p,ct,t,o) { const dx=p.x-ct.x,dy=p.y-ct.y,d=Math.sqrt(dx*dx+dy*dy)||1; ctx.fillText(t,p.x+dx/d*o,p.y+dy/d*o); }
function eLbl(ctx,p1,p2,ct,t,o) { const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2,dx=mx-ct.x,dy=my-ct.y,d=Math.sqrt(dx*dx+dy*dy)||1; ctx.fillText(t,mx+dx/d*o,my+dy/d*o); }

/* ═══════════════════════════════════════════════════════════════════════════
   页面渲染
   ═══════════════════════════════════════════════════════════════════════════ */
function renderTrianglePage() {
  app.innerHTML = '';
  renderNavBar(app, { title: '解三角形', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.cssText = 'padding:52px 16px 16px;overflow-x:hidden;box-sizing:border-box;width:100%;';

  // ─── Canvas 示意图 ─────────────────────────────────────────────────────────
  const canvasWrap = document.createElement('div');
  canvasWrap.style.cssText = 'width:100%;max-width:320px;margin:0 auto;';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:190px;display:block;';
  canvasWrap.appendChild(canvas);
  content.appendChild(canvasWrap);

  // ─── 类型选择 ──────────────────────────────────────────────────────────────
  const typeRow = document.createElement('div');
  typeRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:32px;padding:12px 0;';
  let currentType = 'right';

  [{ v: 'right', l: '直角三角形' }, { v: 'general', l: '其他三角形' }].forEach(t => {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;font-size:15px;';
    const radio = document.createElement('input');
    radio.type = 'radio'; radio.name = 'triType'; radio.value = t.v;
    radio.style.cssText = 'width:20px;height:20px;accent-color:#00a896;cursor:pointer;';
    if (t.v === currentType) radio.checked = true;
    radio.addEventListener('change', () => { currentType = t.v; onTypeChange(); });
    wrap.appendChild(radio);
    wrap.appendChild(document.createTextNode(t.l));
    typeRow.appendChild(wrap);
  });
  content.appendChild(typeRow);

  // ─── 提示文字 ──────────────────────────────────────────────────────────────
  const tip = document.createElement('div');
  tip.style.cssText = 'text-align:center;font-size:13px;color:#666;line-height:1.8;padding:4px 0 12px;white-space:pre-line;';
  tip.textContent = '任填一项角度和一条边\n或者任填两条边即可计算其他尺寸';
  content.appendChild(tip);

  // ─── 输入表单 ──────────────────────────────────────────────────────────────
  const form = document.createElement('div');
  form.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px 16px;width:100%;box-sizing:border-box;overflow:hidden;';

  const fields = [
    { id: 'A', label: 'A角' }, { id: 'a', label: 'a边' },
    { id: 'B', label: 'B角' }, { id: 'b', label: 'b边' },
    { id: 'C', label: 'C角' }, { id: 'c', label: 'c边' },
  ];

  fields.forEach(f => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden;';
    const lab = document.createElement('span');
    lab.style.cssText = 'font-size:15px;color:#333;min-width:36px;';
    lab.textContent = f.label;
    const inp = document.createElement('input');
    inp.type = 'number'; inp.dataset.id = f.id;
    inp.style.cssText = 'flex:1;min-width:0;height:36px;border:1px solid #ddd;border-radius:4px;padding:0 8px;font-size:14px;outline:none;box-sizing:border-box;';
    if (f.id === 'B') { inp.value = '90'; inp.readOnly = true; inp.style.background = '#f5f5f5'; inp.style.color = '#999'; }
    row.appendChild(lab); row.appendChild(inp);
    form.appendChild(row);
  });
  content.appendChild(form);

  // ─── 按钮 ──────────────────────────────────────────────────────────────────
  const btnArea = document.createElement('div');
  btnArea.style.cssText = 'display:flex;gap:16px;padding:20px 0 0;';

  const clearBtn = document.createElement('button');
  clearBtn.style.cssText = 'flex:1;height:42px;font-size:15px;font-weight:bold;border:2px solid #00a896;background:#fff;color:#333;border-radius:8px;cursor:pointer;';
  clearBtn.textContent = '清空';
  clearBtn.addEventListener('click', () => {
    fields.forEach(f => {
      const el = app.querySelector(`[data-id="${f.id}"]`);
      if (f.id === 'B' && currentType === 'right') el.value = '90';
      else el.value = '';
    });
    resultArea.style.display = 'none';
    errorArea.style.display = 'none';
    redrawCanvas();
  });

  const calcBtn = document.createElement('button');
  calcBtn.style.cssText = 'flex:1;height:42px;font-size:15px;font-weight:bold;border:2px solid #00a896;background:#00a896;color:#fff;border-radius:8px;cursor:pointer;';
  calcBtn.textContent = '计算';
  calcBtn.addEventListener('click', () => calculate());

  btnArea.appendChild(clearBtn); btnArea.appendChild(calcBtn);
  content.appendChild(btnArea);

  // ─── 错误提示区域 ────────────────────────────────────────────────────────────
  const errorArea = document.createElement('div');
  errorArea.style.cssText = 'display:none;padding:12px;margin-top:12px;color:#e74c3c;font-size:13px;text-align:center;';
  content.appendChild(errorArea);

  app.appendChild(content);

  // 初始绘制
  requestAnimationFrame(() => redrawCanvas());

  // ─── 辅助函数 ──────────────────────────────────────────────────────────────
  function gv(id) {
    const el = app.querySelector(`[data-id="${id}"]`);
    if (!el || el.value.trim() === '') return null;
    const v = parseFloat(el.value); return isNaN(v) ? null : v;
  }

  function redrawCanvas() {
    drawTriangleDiagram(canvas, {
      A: gv('A'), B: currentType === 'right' ? 90 : gv('B'), C: gv('C'),
      a: gv('a'), b: gv('b'), c: gv('c'),
      isRight: currentType === 'right',
    });
  }

  function onTypeChange() {
    const bInp = app.querySelector('[data-id="B"]');
    if (currentType === 'right') {
      bInp.value = '90'; bInp.readOnly = true; bInp.style.background = '#f5f5f5'; bInp.style.color = '#999';
      tip.textContent = '任填一项角度和一条边\n或者任填两条边即可计算其他尺寸';
    } else {
      bInp.value = ''; bInp.readOnly = false; bInp.style.background = ''; bInp.style.color = '';
      tip.textContent = '填写三条边,或者填写一个角度和这个角度的两条边\n或者填写两个角度和两个角度中间的一条边才可计算';
    }
    redrawCanvas();
  }

  function calculate() {
    let A = gv('A'), a = gv('a');
    let B = currentType === 'right' ? 90 : gv('B');
    let b = gv('b'), C = gv('C'), c = gv('c');

    try {
      let r;
      if (currentType === 'right') r = solveRightTriangle(A, a, b, c, C);
      else r = solveGeneralTriangle(A, a, B, b, C, c);

      // 回填
      Object.entries(r).forEach(([id, val]) => {
        const el = app.querySelector(`[data-id="${id}"]`);
        if (el && val !== null) el.value = parseFloat(val.toFixed(4));
      });

      errorArea.style.display = 'none';

      // 用计算结果重绘三角形
      drawTriangleDiagram(canvas, {
        A: r.A, B: r.B, C: r.C, a: r.a, b: r.b, c: r.c,
        isRight: currentType === 'right',
      });
    } catch (e) {
      errorArea.style.display = 'block';
      errorArea.textContent = e.message;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   求解逻辑
   内部约定与UI一致: A/B/C角, a/b/c边
   但注意这里的对应关系需要和绘图一致:
   绘图中 B在左下角, 底边BC=b, 左边AB=a, 斜边AC=c
   正弦定理: a/sinA = b/sinB = c/sinC
   这个关系在任何约定下都成立，只要 a对A, b对B, c对C
   但截图的绘图标注: a=AB(左), b=BC(底), c=AC(斜)
   A对面=BC=b, B对面=AC=c, C对面=AB=a
   所以: a对C角, b对A角, c对B角 (截图约定)
   
   为了不改变用户输入习惯(A角/a边/B角/b边/C角/c边)，
   且保持正弦定理 a/sinA=b/sinB=c/sinC 成立，
   我们让计算逻辑保持标准约定: a对A角
   绘图时只是标注位置不同，不影响计算。
   ═══════════════════════════════════════════════════════════════════════════ */

function solveRightTriangle(A, a, b, c, C) {
  // B=90°, A+C=90°
  let r = { A, a, B: 90, b, C, c };

  if (r.A != null && r.C == null) r.C = 90 - r.A;
  if (r.C != null && r.A == null) r.A = 90 - r.C;

  if (r.b != null && r.A != null) {
    r.a = rd(r.b * CalcUtils.sinDeg(r.A));
    r.c = rd(r.b * CalcUtils.cosDeg(r.A));
  } else if (r.a != null && r.A != null) {
    r.b = rd(r.a / CalcUtils.sinDeg(r.A));
    r.c = rd(r.a / CalcUtils.tanDeg(r.A));
  } else if (r.c != null && r.A != null) {
    r.a = rd(r.c * CalcUtils.tanDeg(r.A));
    r.b = rd(r.c / CalcUtils.cosDeg(r.A));
  } else if (r.a != null && r.c != null) {
    r.b = rd(Math.sqrt(r.a ** 2 + r.c ** 2));
    r.A = rd(CalcUtils.atan2Deg(r.a, r.c));
    r.C = rd(90 - r.A);
  } else if (r.a != null && r.b != null) {
    r.A = rd(CalcUtils.asinDeg(r.a / r.b));
    r.C = rd(90 - r.A);
    r.c = rd(Math.sqrt(r.b ** 2 - r.a ** 2));
  } else if (r.c != null && r.b != null) {
    r.C = rd(CalcUtils.asinDeg(r.c / r.b));
    r.A = rd(90 - r.C);
    r.a = rd(Math.sqrt(r.b ** 2 - r.c ** 2));
  } else if (r.b != null && r.C != null) {
    r.c = rd(r.b * CalcUtils.sinDeg(r.C));
    r.a = rd(r.b * CalcUtils.cosDeg(r.C));
  } else if (r.c != null && r.C != null) {
    r.b = rd(r.c / CalcUtils.sinDeg(r.C));
    r.a = rd(r.c / CalcUtils.tanDeg(r.C));
  } else if (r.a != null && r.C != null) {
    r.c = rd(r.a * CalcUtils.tanDeg(r.C));
    r.b = rd(r.a / CalcUtils.cosDeg(r.C));
  } else {
    throw new Error('条件不足，请至少输入两个已知量。');
  }

  if (r.A != null && r.C == null) r.C = rd(90 - r.A);
  if (r.C != null && r.A == null) r.A = rd(90 - r.C);
  return r;
}

function solveGeneralTriangle(A, a, B, b, C, c) {
  let r = { A, a, B, b, C, c };

  // 补全第三个角
  const ka = [r.A, r.B, r.C].filter(v => v != null);
  if (ka.length === 2) {
    if (r.A == null) r.A = 180 - r.B - r.C;
    else if (r.B == null) r.B = 180 - r.A - r.C;
    else r.C = 180 - r.A - r.B;
  }

  // SSS
  if (r.a != null && r.b != null && r.c != null) {
    const cosA = (r.b**2 + r.c**2 - r.a**2) / (2*r.b*r.c);
    if (Math.abs(cosA) > 1) throw new Error('三边不能构成三角形');
    r.A = rd(CalcUtils.acosDeg(cosA));
    r.B = rd(CalcUtils.acosDeg((r.a**2+r.c**2-r.b**2)/(2*r.a*r.c)));
    r.C = rd(180 - r.A - r.B);
    return r;
  }

  // SAS
  if (r.A != null && r.b != null && r.c != null && r.a == null) {
    r.a = rd(Math.sqrt(r.b**2+r.c**2-2*r.b*r.c*CalcUtils.cosDeg(r.A)));
    return solveGeneralTriangle(r.A, r.a, r.B, r.b, r.C, r.c);
  }
  if (r.B != null && r.a != null && r.c != null && r.b == null) {
    r.b = rd(Math.sqrt(r.a**2+r.c**2-2*r.a*r.c*CalcUtils.cosDeg(r.B)));
    return solveGeneralTriangle(r.A, r.a, r.B, r.b, r.C, r.c);
  }
  if (r.C != null && r.a != null && r.b != null && r.c == null) {
    r.c = rd(Math.sqrt(r.a**2+r.b**2-2*r.a*r.b*CalcUtils.cosDeg(r.C)));
    return solveGeneralTriangle(r.A, r.a, r.B, r.b, r.C, r.c);
  }

  // 正弦定理
  const pairs = [[r.A,r.a],[r.B,r.b],[r.C,r.c]];
  const kp = pairs.find(([ang,side]) => ang != null && side != null);
  if (kp) {
    const k = kp[1] / CalcUtils.sinDeg(kp[0]);
    pairs.forEach(([ang,side],i) => {
      const sKey = ['a','b','c'][i], aKey = ['A','B','C'][i];
      if (ang != null && r[sKey] == null) r[sKey] = rd(k * CalcUtils.sinDeg(ang));
      else if (ang == null && side != null) {
        const sv = side / k;
        if (Math.abs(sv) > 1) throw new Error('参数不合法，无法构成三角形');
        r[aKey] = rd(CalcUtils.asinDeg(sv));
      }
    });
    // 补角
    const angs = [r.A, r.B, r.C];
    const ni = angs.findIndex(v => v == null);
    if (ni !== -1) r[['A','B','C'][ni]] = rd(180 - angs.filter(v=>v!=null).reduce((s,v)=>s+v,0));
    // 补边
    pairs.forEach((_,i) => {
      const sKey = ['a','b','c'][i], aKey = ['A','B','C'][i];
      if (r[sKey] == null && r[aKey] != null) r[sKey] = rd(k * CalcUtils.sinDeg(r[aKey]));
    });
    return r;
  }

  throw new Error('条件不足，无法唯一确定三角形。\n请填写三条边，或一个角度和两条边，或两个角度和一条边。');
}

function rd(v) { return CalcUtils.roundTo(v, 4); }

export function registerRoutes(router) {
  router.register('#/triangle', () => renderTrianglePage());
}
