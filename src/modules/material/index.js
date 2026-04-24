import { renderNavBar } from '../../components/nav-bar.js';
import CalcUtils from '../../utils/calc-utils.js';

const app = document.getElementById('app');

// 材料列表：{ label, density }
const MATERIALS = [
  { label: '45#或Q235或A3',       density: 7.85 },
  { label: '304或304L或201或202', density: 7.93 },
  { label: '316或316L',           density: 7.98 },
  { label: '410或420或430',       density: 7.75 },
  { label: '1Cr18Ni9Ti',          density: 7.93 },
  { label: '2A12',                density: 2.78 },
  { label: '5A06',                density: 2.75 },
  { label: '6061',                density: 2.70 },
  { label: '2A14',                density: 2.78 },
  { label: '7075',                density: 2.80 },
  { label: 'LY12',                density: 2.78 },
  { label: '钛合金TC4',           density: 4.51 },
  { label: '钛合金TA2',           density: 4.51 },
  { label: '镁合金AZ31',          density: 1.79 },
  { label: '镁合金AZ91D',         density: 1.81 },
  { label: '紫铜',                density: 8.90 },
  { label: '黄铜59或62',          density: 8.50 },
  { label: 'QA19-2Y',             density: 8.20 },
  { label: '铸钢',                density: 7.80 },
  { label: '不锈钢',              density: 7.75 },
  { label: '高速钢',              density: 8.50 },
  { label: '纯铜',                density: 8.90 },
  { label: '锡青铜',              density: 8.80 },
  { label: '铝板',                density: 2.73 },
  { label: '锻铝',                density: 2.70 },
  { label: '铸铝',                density: 2.60 },
  { label: '工业镍',              density: 8.90 },
  { label: '聚四氟乙烯',          density: 2.10 },
  { label: '尼龙1010',            density: 1.04 },
  { label: '有机玻璃',            density: 1.18 },
  { label: '其他材料',            density: null },
];

// 形状列表
const SHAPES = [
  { value: 'bar',    label: '棒料',  img: 'static/CaiLiaoZhongLiang/yb.png' },
  { value: 'tube',   label: '管料',  img: 'static/CaiLiaoZhongLiang/gl.png' },
  { value: 'square', label: '方料',  img: 'static/CaiLiaoZhongLiang/fg.png' },
  { value: 'hex',    label: '六方',  img: 'static/CaiLiaoZhongLiang/lf.png' },
  { value: 'ibeam',  label: '工字钢', img: 'static/CaiLiaoZhongLiang/gzg.png' },
  { value: 'sqtube', label: '方管',  img: 'static/CaiLiaoZhongLiang/fl.png' },
];

// 长度单位
const LENGTH_UNITS = [
  { value: 'mm', label: 'MM 毫米', factor: 1 },
  { value: 'cm', label: 'CM 厘米', factor: 10 },
  { value: 'm',  label: 'M 米',    factor: 1000 },
];

// 价格单位
const PRICE_UNITS = [
  { value: 'kg',  label: '元/公斤' },
  { value: 'ton', label: '元/吨' },
];

// 工字钢标准数据：{ model, H, B, t1(腹板厚), t2(翼缘厚), kgpm(kg/m) }
// 数据来源：GB/T 706 热轧工字钢
const IBEAM_DATA = [
  { model: '10#',   H: 100, B: 68,  t1: 4.5, t2: 7.6,  kgpm: 11.261 },
  { model: '12#',   H: 120, B: 74,  t1: 5.0, t2: 8.4,  kgpm: 13.987 },
  { model: '14#',   H: 140, B: 80,  t1: 5.5, t2: 9.1,  kgpm: 16.890 },
  { model: '16#',   H: 160, B: 88,  t1: 6.0, t2: 9.9,  kgpm: 20.513 },
  { model: '18#',   H: 180, B: 94,  t1: 6.5, t2: 10.7, kgpm: 24.143 },
  { model: '20#A',  H: 200, B: 100, t1: 7.0, t2: 11.4, kgpm: 27.929 },
  { model: '20#B',  H: 200, B: 102, t1: 9.0, t2: 11.4, kgpm: 31.069 },
  { model: '22#A',  H: 220, B: 110, t1: 7.5, t2: 12.3, kgpm: 33.070 },
  { model: '22#B',  H: 220, B: 112, t1: 9.5, t2: 12.3, kgpm: 36.524 },
  { model: '25#A',  H: 250, B: 116, t1: 8.0, t2: 13.0, kgpm: 38.105 },
  { model: '25#B',  H: 250, B: 118, t1: 10.0,t2: 13.0, kgpm: 42.030 },
  { model: '28#A',  H: 280, B: 122, t1: 8.5, t2: 13.7, kgpm: 43.492 },
  { model: '28#B',  H: 280, B: 124, t1: 10.5,t2: 13.7, kgpm: 47.888 },
  { model: '30#A',  H: 300, B: 126, t1: 9.0, t2: 14.4, kgpm: 48.084 },
  { model: '30#B',  H: 300, B: 128, t1: 11.0,t2: 14.4, kgpm: 52.794 },
  { model: '30#C',  H: 300, B: 130, t1: 13.0,t2: 14.4, kgpm: 57.504 },
  { model: '32#A',  H: 320, B: 130, t1: 9.5, t2: 15.0, kgpm: 52.717 },
  { model: '32#B',  H: 320, B: 132, t1: 11.5,t2: 15.0, kgpm: 57.741 },
  { model: '32#C',  H: 320, B: 134, t1: 13.5,t2: 15.0, kgpm: 62.765 },
  { model: '36#A',  H: 360, B: 136, t1: 10.0,t2: 15.8, kgpm: 59.901 },
  { model: '36#B',  H: 360, B: 138, t1: 12.0,t2: 15.8, kgpm: 65.689 },
  { model: '36#C',  H: 360, B: 140, t1: 14.0,t2: 15.8, kgpm: 71.477 },
  { model: '40#A',  H: 400, B: 142, t1: 10.5,t2: 16.5, kgpm: 67.598 },
  { model: '40#B',  H: 400, B: 144, t1: 12.5,t2: 16.5, kgpm: 73.878 },
  { model: '40#C',  H: 400, B: 146, t1: 14.5,t2: 16.5, kgpm: 80.158 },
  { model: '45#A',  H: 450, B: 150, t1: 11.5,t2: 18.0, kgpm: 80.420 },
  { model: '45#B',  H: 450, B: 152, t1: 13.5,t2: 18.0, kgpm: 87.485 },
  { model: '45#C',  H: 450, B: 154, t1: 15.5,t2: 18.0, kgpm: 94.550 },
  { model: '56#A',  H: 560, B: 166, t1: 12.5,t2: 20.5, kgpm: 106.316 },
  { model: '56#B',  H: 560, B: 168, t1: 14.5,t2: 20.5, kgpm: 115.108 },
  { model: '56#C',  H: 560, B: 170, t1: 16.5,t2: 20.5, kgpm: 123.900 },
  { model: '63#A',  H: 630, B: 176, t1: 13.0,t2: 22.0, kgpm: 121.407 },
  { model: '63#B',  H: 630, B: 178, t1: 15.0,t2: 22.0, kgpm: 131.298 },
  { model: '63#C',  H: 630, B: 180, t1: 17.0,t2: 22.0, kgpm: 141.189 },
];

// 各形状输入字段定义（工字钢单独处理）
const SHAPE_FIELDS = {
  bar:    [{ id: 'D',  label: '直径' }],
  tube:   [{ id: 'D',  label: '直径' }, { id: 'd', label: '孔直径' }],
  square: [{ id: 'W',  label: '宽度' }, { id: 'H', label: '高度' }],
  hex:    [{ id: 'dj', label: '对角', hint: '对角 对边任填一项' }, { id: 'db', label: '对边' }],
  sqtube: [{ id: 'H',  label: '高度' }, { id: 'W', label: '宽度' }, { id: 't', label: '壁厚' }],
};

// 截面积计算（单位 mm）
function calcArea(shape, vals) {
  switch (shape) {
    case 'bar':
      return Math.PI * (vals.D / 2) ** 2;
    case 'tube':
      return Math.PI * ((vals.D / 2) ** 2 - (vals.d / 2) ** 2);
    case 'square':
      return vals.W * vals.H;
    case 'hex': {
      // 经过计算前的补充，dj 始终有效（对角为准）
      // 正六边形面积 = 3*sqrt(3)/2 * (dj/2)²
      const side = vals.dj / 2;
      return (3 * Math.sqrt(3) / 2) * side * side;
    }
    case 'sqtube':
      return vals.H * vals.W - (vals.H - 2 * vals.t) * (vals.W - 2 * vals.t);
    default:
      return 0;
  }
}

function renderMaterialPage() {
  app.innerHTML = '';
  renderNavBar(app, { title: '材料重量计算', showBack: true, showReset: false });

  const page = document.createElement('div');
  page.className = 'page-content mat-page';
  app.appendChild(page);

  // ── 顶部：材料 + 密度（工字钢时隐藏材料行） ──
  const topRow = document.createElement('div');
  topRow.className = 'mat-top-row';

  const matLabel = document.createElement('span');
  matLabel.className = 'mat-field-label';
  matLabel.textContent = '材料：';

  const matSelect = document.createElement('select');
  matSelect.className = 'mat-select';
  MATERIALS.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m.label;
    matSelect.appendChild(opt);
  });

  const densityLabel = document.createElement('span');
  densityLabel.className = 'mat-density-label';
  densityLabel.textContent = `密度:${MATERIALS[0].density}`;

  const cdWrap = document.createElement('span');
  cdWrap.className = 'mat-density-label';
  cdWrap.style.display = 'none';
  const cdPrefix = document.createElement('span');
  cdPrefix.textContent = '密度:';
  const cdInput = document.createElement('input');
  cdInput.type = 'number';
  cdInput.className = 'mat-density-input';
  cdInput.value = '7.85';
  cdInput.step = '0.01';
  cdWrap.appendChild(cdPrefix);
  cdWrap.appendChild(cdInput);

  topRow.appendChild(matLabel);
  topRow.appendChild(matSelect);
  topRow.appendChild(densityLabel);
  topRow.appendChild(cdWrap);
  page.appendChild(topRow);

  // ── 形状选择行 ──
  const shapeRow = document.createElement('div');
  shapeRow.className = 'mat-shape-row';
  const shapeLabel = document.createElement('span');
  shapeLabel.className = 'mat-field-label';
  shapeLabel.textContent = '形状：';
  const shapeSelect = document.createElement('select');
  shapeSelect.className = 'mat-select';
  SHAPES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.value;
    opt.textContent = s.label;
    shapeSelect.appendChild(opt);
  });
  shapeRow.appendChild(shapeLabel);
  shapeRow.appendChild(shapeSelect);
  page.appendChild(shapeRow);

  // ── 示意图 ──
  const diagramWrap = document.createElement('div');
  diagramWrap.className = 'mat-diagram';
  const diagramImg = document.createElement('img');
  diagramImg.src = SHAPES[0].img;
  diagramImg.alt = '';
  diagramWrap.appendChild(diagramImg);
  page.appendChild(diagramWrap);

  // ── 动态字段区域 ──
  const fieldsWrap = document.createElement('div');
  fieldsWrap.className = 'mat-fields';
  page.appendChild(fieldsWrap);

  // ── 长度行（工字钢时也显示） ──
  const lenRow = document.createElement('div');
  lenRow.className = 'mat-input-row';
  const lenLabel = document.createElement('span');
  lenLabel.className = 'mat-input-label';
  lenLabel.textContent = '长度';
  const lenInput = document.createElement('input');
  lenInput.type = 'number';
  lenInput.className = 'mat-num-input';
  lenInput.value = '10';
  const lenUnitSel = document.createElement('select');
  lenUnitSel.className = 'mat-unit-select';
  LENGTH_UNITS.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.value;
    opt.textContent = u.label;
    if (u.value === 'm') opt.selected = true;
    lenUnitSel.appendChild(opt);
  });
  lenRow.appendChild(lenLabel);
  lenRow.appendChild(lenInput);
  lenRow.appendChild(lenUnitSel);
  page.appendChild(lenRow);

  // ── 价格/重量行 ──
  const priceRow = document.createElement('div');
  priceRow.className = 'mat-input-row';
  const priceLabel = document.createElement('span');
  priceLabel.className = 'mat-input-label';
  priceLabel.textContent = '价格/重量';
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.className = 'mat-num-input';
  priceInput.value = '10';
  const priceUnitSel = document.createElement('select');
  priceUnitSel.className = 'mat-unit-select';
  PRICE_UNITS.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.value;
    opt.textContent = u.label;
    priceUnitSel.appendChild(opt);
  });
  priceRow.appendChild(priceLabel);
  priceRow.appendChild(priceInput);
  priceRow.appendChild(priceUnitSel);
  page.appendChild(priceRow);

  // ── 查看按钮 ──
  const btnWrap = document.createElement('div');
  btnWrap.className = 'mat-btn-wrap';
  const calcBtn = document.createElement('button');
  calcBtn.className = 'mat-calc-btn';
  calcBtn.textContent = '查看';
  btnWrap.appendChild(calcBtn);
  page.appendChild(btnWrap);

  // ── 结果区域 ──
  const resultArea = document.createElement('div');
  resultArea.className = 'mat-result';
  resultArea.style.display = 'none';
  page.appendChild(resultArea);

  // ── 渲染普通形状字段 ──
  function renderFields(shape) {
    fieldsWrap.innerHTML = '';
    if (shape === 'ibeam') {
      renderIbeamFields();
      return;
    }
    const fields = SHAPE_FIELDS[shape] || [];
    // 六方提示
    if (shape === 'hex') {
      const hint = document.createElement('div');
      hint.className = 'mat-hint';
      hint.textContent = '对角 对边任填一项';
      fieldsWrap.appendChild(hint);
    }
    fields.forEach(f => {
      const row = document.createElement('div');
      row.className = 'mat-input-row';
      const lbl = document.createElement('span');
      lbl.className = 'mat-input-label';
      lbl.textContent = f.label;
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.className = 'mat-num-input';
      inp.dataset.field = f.id;
      inp.value = getDefaultVal(f.id);
      const unitSel = document.createElement('select');
      unitSel.className = 'mat-unit-select';
      LENGTH_UNITS.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.value;
        opt.textContent = u.label;
        unitSel.appendChild(opt);
      });
      row.appendChild(lbl);
      row.appendChild(inp);
      row.appendChild(unitSel);
      fieldsWrap.appendChild(row);
    });
  }

  // ── 渲染工字钢字段（型号下拉 + 规格信息） ──
  function renderIbeamFields() {
    // 型号选择行
    const modelRow = document.createElement('div');
    modelRow.className = 'mat-input-row';
    const modelLbl = document.createElement('span');
    modelLbl.className = 'mat-input-label';
    modelLbl.textContent = '型号';
    const modelSel = document.createElement('select');
    modelSel.className = 'mat-unit-select';
    modelSel.dataset.field = 'ibeam_model';
    IBEAM_DATA.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = d.model;
      modelSel.appendChild(opt);
    });
    modelRow.appendChild(modelLbl);
    modelRow.appendChild(modelSel);
    fieldsWrap.appendChild(modelRow);

    // 规格信息显示
    const specInfo = document.createElement('div');
    specInfo.className = 'mat-ibeam-spec';
    fieldsWrap.appendChild(specInfo);

    function updateSpec() {
      const d = IBEAM_DATA[parseInt(modelSel.value)];
      specInfo.innerHTML = `规格${d.H}*${d.B}*${d.t1}<br>重量${d.kgpm}千克/m`;
    }
    updateSpec();
    modelSel.addEventListener('change', updateSpec);
  }

  function getDefaultVal(id) {
    const defaults = { D: 40, d: 10, W: 40, H: 10, a: 40, dj: 40, db: 0, t: 3 };
    return defaults[id] ?? 20;
  }

  // ── 事件：材料切换 ──
  matSelect.addEventListener('change', () => {
    const mat = MATERIALS[matSelect.value];
    if (mat.density !== null) {
      densityLabel.textContent = `密度:${mat.density}`;
      densityLabel.style.display = '';
      cdWrap.style.display = 'none';
    } else {
      densityLabel.style.display = 'none';
      cdWrap.style.display = '';
    }
    resultArea.style.display = 'none';
  });

  // ── 事件：形状切换 ──
  shapeSelect.addEventListener('change', () => {
    const shape = shapeSelect.value;
    diagramImg.src = SHAPES.find(s => s.value === shape)?.img || '';
    // 工字钢隐藏材料行
    topRow.style.display = shape === 'ibeam' ? 'none' : '';
    renderFields(shape);
    resultArea.style.display = 'none';
  });

  // ── 计算 ──
  calcBtn.addEventListener('click', () => {
    const shape = shapeSelect.value;
    resultArea.style.display = 'none';

    // 长度（转mm）
    const lenUnit = LENGTH_UNITS.find(u => u.value === lenUnitSel.value);
    const lenMm = parseFloat(lenInput.value) * (lenUnit?.factor || 1);
    if (isNaN(lenMm) || lenMm <= 0) {
      showResult(resultArea, null, '请输入有效长度');
      return;
    }

    // 价格
    const priceVal = parseFloat(priceInput.value);

    // 工字钢：直接用每米重量
    if (shape === 'ibeam') {
      const modelSel = fieldsWrap.querySelector('[data-field="ibeam_model"]');
      const d = IBEAM_DATA[parseInt(modelSel.value)];
      const lenM = lenMm / 1000;
      const weightKg = CalcUtils.roundTo(d.kgpm * lenM, 5);
      let totalPrice = null;
      if (!isNaN(priceVal) && priceVal > 0) {
        const pricePerKg = priceUnitSel.value === 'ton' ? priceVal / 1000 : priceVal;
        totalPrice = CalcUtils.roundTo(weightKg * pricePerKg, 4);
      }
      showResult(resultArea, { weightKg, totalPrice }, null);
      return;
    }

    // 获取密度
    const matIdx = parseInt(matSelect.value);
    const mat = MATERIALS[matIdx];
    let rho;
    if (mat.density !== null) {
      rho = mat.density;
    } else {
      rho = parseFloat(cdInput.value);
      if (isNaN(rho) || rho <= 0) {
        showResult(resultArea, null, '请输入有效密度');
        return;
      }
    }

    // 收集形状参数（转mm）
    const vals = {};
    const fieldEls = fieldsWrap.querySelectorAll('[data-field]');
    fieldEls.forEach(el => {
      const unitSel = el.nextElementSibling;
      const unit = LENGTH_UNITS.find(u => u.value === unitSel?.value);
      vals[el.dataset.field] = parseFloat(el.value) * (unit?.factor || 1);
    });

    // 六方：至少填一项，并互相补充
    if (shape === 'hex') {
      const djOk = vals.dj > 0 && !isNaN(vals.dj);
      const dbOk = vals.db > 0 && !isNaN(vals.db);
      if (!djOk && !dbOk) {
        showResult(resultArea, null, '对角或对边至少填一项');
        return;
      }
      // 都填了以对角为准，重新算对边；只填对边则算对角
      if (djOk) {
        // 对角 dj → 对边 db = dj * sqrt(3)/2
        vals.db = CalcUtils.roundTo(vals.dj * Math.sqrt(3) / 2, 4);
        const dbEl = fieldsWrap.querySelector('[data-field="db"]');
        if (dbEl) dbEl.value = vals.db;
      } else {
        // 对边 db → 对角 dj = db * 2/sqrt(3)
        vals.dj = CalcUtils.roundTo(vals.db * 2 / Math.sqrt(3), 4);
        const djEl = fieldsWrap.querySelector('[data-field="dj"]');
        if (djEl) djEl.value = vals.dj;
      }
    } else {
      // 其他形状检查所有字段
      const invalid = Object.values(vals).some(v => isNaN(v) || v <= 0);
      if (invalid) {
        showResult(resultArea, null, '请输入有效的尺寸参数');
        return;
      }
    }

    if (shape === 'tube' && vals.d >= vals.D) {
      showResult(resultArea, null, '孔直径必须小于直径');
      return;
    }
    if (shape === 'sqtube' && (vals.t * 2 >= vals.H || vals.t * 2 >= vals.W)) {
      showResult(resultArea, null, '壁厚过大');
      return;
    }

    const area = calcArea(shape, vals);
    const volumeCm3 = area * lenMm / 1000;
    const weightKg = CalcUtils.roundTo(volumeCm3 * rho / 1000, 5);

    let totalPrice = null;
    if (!isNaN(priceVal) && priceVal > 0) {
      const pricePerKg = priceUnitSel.value === 'ton' ? priceVal / 1000 : priceVal;
      totalPrice = CalcUtils.roundTo(weightKg * pricePerKg, 4);
    }

    showResult(resultArea, { weightKg, totalPrice }, null);
  });

  // 初始渲染
  renderFields('bar');
}

// 格式化数字：保留 n 位小数，末尾零去掉
function fmt(num, n) {
  return Number(num.toFixed(n)).toString();
}

function showResult(area, data, err) {
  area.style.display = 'block';
  area.innerHTML = '';
  if (err) {
    area.innerHTML = `<div class="mat-result-err">${err}</div>`;
    return;
  }
  const rows = [{ label: '重量', value: `${fmt(data.weightKg, 5)} kg` }];
  if (data.totalPrice !== null) rows.push({ label: '价格', value: `${fmt(data.totalPrice, 4)} 元` });
  rows.forEach(r => {
    const row = document.createElement('div');
    row.className = 'mat-result-row';
    row.innerHTML = `<span class="mat-result-label">${r.label}</span><span class="mat-result-value">${r.value}</span>`;
    area.appendChild(row);
  });
}

export function registerRoutes(router) {
  router.register('#/material', () => renderMaterialPage());
}
