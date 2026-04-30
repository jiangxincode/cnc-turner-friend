import { describe, it, expect } from 'vitest';
import {
  calcQt1, calcQt2, calcQt3, calcQt4, calcQt5,
  calcQt6, calcQt7, calcQt8, calcQt9, calcQt10,
  calcQt11, calcQt12, calcGenericArc, calcArcPage,
} from '../src/modules/arc-junction/calc.js';

/**
 * 圆弧接点计算回归测试
 *
 * 目的：防止修改某个接点的计算逻辑时影响其他接点的结果。
 * 每个接点使用固定输入参数，验证输出的 G 代码完全匹配预期。
 *
 * 注意：calcArcPage 会过滤掉括号注释行，直接调用 calcQtX 则保留。
 * 测试中同时覆盖两种调用方式。
 */

// ─── 辅助函数 ───────────────────────────────────────────────────

/** 去掉括号注释行（模拟 calcArcPage 的过滤逻辑） */
function stripComment(text) {
  return text.split('\n').filter(l => !/^\s*\(.*\)\s*$/.test(l)).join('\n');
}

// ─── 球头接点1 ──────────────────────────────────────────────────

describe('球头接点1 (qt1)', () => {
  it('绝对坐标：大径=50 R=80', () => {
    const result = calcArcPage('qt1', { large: 50, R: 80, Ra: null, tip: null, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X50 Z-4.007 R80'
    );
  });

  it('相对坐标：大径=50 R=80', () => {
    const result = calcArcPage('qt1', { large: 50, R: 80, Ra: null, tip: null, juedui: 'false' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 U50 W-4.007 R80'
    );
  });

  it('带 Ra 过渡圆弧：大径=50 R=80 Ra=2', () => {
    const result = calcArcPage('qt1', { large: 50, R: 80, Ra: 2, tip: null, juedui: 'true' });
    const lines = result.split('\n');
    expect(lines.length).toBe(4); // G0 + G1 + G03(主弧) + G03(Ra弧)
    expect(lines[0]).toBe('G0 X0');
    expect(lines[1]).toBe('G1 Z0 F0.1');
    expect(lines[2]).toMatch(/^G03 X[\d.]+ Z-[\d.]+ R80$/);
    expect(lines[3]).toMatch(/^G03 X[\d.]+ Z-[\d.]+ R2$/);
  });

  it('带刀尖补偿：大径=50 R=80 tip=0.4', () => {
    const result = calcArcPage('qt1', { large: 50, R: 80, Ra: null, tip: 0.4, juedui: 'true' });
    // 刀尖补偿：endX = 50 - 0.4*2 = 49.2, endZ = Z + 0.4
    expect(result).toMatch(/G03 X49\.2 Z-3\.607 R80/);
  });
});

// ─── 球头接点2 ──────────────────────────────────────────────────

describe('球头接点2 (qt2)', () => {
  const base = { large: 50, small: 33.166, R: 30, long: '', zStart: 0, Ra: '', Rb: '', tip: '', buchang: false, juedui: 'true' };

  it('球模式 绝对坐标', () => {
    const result = calcQt2({ ...base, mode: 'ball' });
    expect(result).toBe(
      'G0 X33.166\nG1 Z0 F0.1\nG03 X50 Z-8.417 R30'
    );
  });

  it('球模式 相对坐标', () => {
    const result = calcQt2({ ...base, mode: 'ball', juedui: 'false' });
    expect(result).toBe(
      'G0 X33.166\nG1 Z0 F0.1\nG03 U16.834 W-8.417 R30'
    );
  });

  it('弧1模式 绝对坐标', () => {
    const result = calcQt2({ ...base, mode: 'arc1' });
    expect(result).toBe(
      'G0 X33.166\nG1 Z0 F0.1\nG03 X50 Z-20.837 R30'
    );
  });

  it('弧2模式 绝对坐标', () => {
    const result = calcQt2({ ...base, mode: 'arc2' });
    expect(result).toBe(
      'G0 X33.166\nG1 Z0 F0.1\nG03 X50 Z-1.205 R30'
    );
  });

  it('弧3模式 绝对坐标（大径=50 小径=33.166 长度=10）', () => {
    const result = calcQt2({ ...base, mode: 'arc3', long: 10 });
    expect(result).toBe(
      'G0 X33.166\nG1 Z0 F0.1\nG03 X50 Z-10 R30'
    );
  });

  it('带 zStart 偏移', () => {
    const result = calcQt2({ ...base, mode: 'ball', zStart: -5 });
    expect(result).toBe(
      'G0 X33.166\nG1 Z-5 F0.1\nG03 X50 Z-13.417 R30'
    );
  });
});

// ─── 球头接点3 ──────────────────────────────────────────────────

describe('球头接点3 (qt3)', () => {
  it('绝对坐标：大径=8 角度=30 角度长=0.6 R=8', () => {
    const result = calcArcPage('qt3', { large: 8, small: '', angle: 30, angleLen: 0.6, arcLen: '', R: 8, Ra: null, tip: null, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X7.678 Z-0.981 R8\nG1 X8 Z-1.581'
    );
  });

  it('相对坐标：大径=8 角度=30 角度长=0.6 R=8', () => {
    const result = calcArcPage('qt3', { large: 8, small: '', angle: 30, angleLen: 0.6, arcLen: '', R: 8, Ra: null, tip: null, juedui: 'false' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 U7.678 W-0.981 R8\nG1 U0.322 W-0.6'
    );
  });
});

// ─── 球头接点4 ──────────────────────────────────────────────────

describe('球头接点4 (qt4)', () => {
  it('大径=8 R=10 绝对坐标', () => {
    const result = calcArcPage('qt4', { large: 8, R: 10, long: '', Ra: null, tip: null, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X20 Z-10 R10\nG03 X8 Z-19.165 R10'
    );
  });

  it('相对坐标：大径=8 R=10', () => {
    const result = calcArcPage('qt4', { large: 8, R: 10, long: '', Ra: null, tip: null, juedui: 'false' });
    expect(result).toContain('G03');
    expect(result).toContain('R10');
  });
});

// ─── 球头接点5 ──────────────────────────────────────────────────

describe('球头接点5 (qt5)', () => {
  it('绝对坐标：直径=19.874 角度=20 长度1=53 R=13 Ra=3', () => {
    const result = calcArcPage('qt5', { large: 19.874, small: '', angle: 20, long1: 53, long2: '', R: 13, Ra: 3, tip: null, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X26 Z-13 R13\nG03 X13.549 Z-24.095 R13\nG02 X10.767 Z-27.177 R3\nG1 X19.874 Z-53'
    );
  });

  it('绝对坐标：直径=19.874 角度=20 长度1=80 R=13 Ra=3', () => {
    const result = calcArcPage('qt5', { large: 19.874, small: '', angle: 20, long1: 80, long2: '', R: 13, Ra: 3, tip: null, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X26 Z-13 R13\nG03 X6.346 Z-25.607 R13\nG02 X1.902 Z-29.037 R3\nG1 X19.874 Z-80'
    );
  });
});

// ─── 球头接点6 ──────────────────────────────────────────────────

describe('球头接点6 (qt6)', () => {
  it('绝对坐标：大径=47.633 小径=30 角度=20 长度1=60 长度2=50 r=5 R=25', () => {
    const result = calcArcPage('qt6', { large: 47.633, small: 30, angle: 20, long1: 60, long2: 50, rr: 5, R: 25, zStart: 0, juedui: 'true' });
    expect(result).toBe(
      'G0 X45.826\nG1 Z0\nG03 X50 Z-10 R25\nX38.983 Z-25.655 R25\nG02 X36.78 Z-28.786 R5\nX36.931 Z-29.654 R5\nG1 X47.633 Z-60'
    );
  });

  it('绝对坐标：大径=47.633 小径=30 角度=20 长度1=91 长度2=50 r=5 R=25', () => {
    const result = calcArcPage('qt6', { large: 47.633, small: 30, angle: 20, long1: 91, long2: 50, rr: 5, R: 25, zStart: 0, juedui: 'true' });
    expect(result).toBe(
      'G0 X27.129\nG1 Z0\nG03 X50 Z-21 R25\nX34.042 Z-39.311 R25\nG02 X30.85 Z-42.973 R5\nX31.002 Z-43.841 R5\nG1 X47.633 Z-91'
    );
  });
});

// ─── 球头接点7 ──────────────────────────────────────────────────

describe('球头接点7 (qt7)', () => {
  it('大径=50 角度=84.8 Ra=10 绝对坐标', () => {
    const result = calcArcPage('qt7', { large: 50, angle: 84.8, Ra: 10, long: '', juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X14.769 Z-3.257 R10\nG1 X50 Z-22.548'
    );
  });

  it('大径=10 角度=84.8 Ra=10 绝对坐标', () => {
    const result = calcArcPage('qt7', { large: 10, angle: 84.8, Ra: 10, long: '', juedui: 'true' });
    const lines = result.split('\n');
    expect(lines[0]).toBe('G0 X0');
    expect(lines[1]).toBe('G1 Z0 F0.1');
    expect(lines[2]).toMatch(/^G03 X[\d.]+ Z-[\d.]+ R10$/);
    expect(lines[3]).toMatch(/^G1 X10 Z-[\d.]+$/);
  });
});

// ─── 球头接点8 ──────────────────────────────────────────────────

describe('球头接点8 (qt8)', () => {
  it('大径=24.7 小R=3 R=75 绝对坐标', () => {
    const result = calcArcPage('qt8', { large: 24.7, r: 3, R: 75, long: '', juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X5.221 Z-1.522 R3\nG03 X24.7 Z-38.482 R75'
    );
  });

  it('相对坐标：大径=24.7 小R=3 R=75', () => {
    const result = calcArcPage('qt8', { large: 24.7, r: 3, R: 75, long: '', juedui: 'false' });
    expect(result).toContain('G03');
    expect(result).toContain('R3');
    expect(result).toContain('R75');
  });
});

// ─── 球头接点9 ──────────────────────────────────────────────────

describe('球头接点9 (qt9)', () => {
  it('绝对坐标：大径=40 R=24.5 小R=2.5', () => {
    const result = calcArcPage('qt9', { large: 40, R: 24.5, Ra: 2.5, long: '', juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0\nG3 X38.573 Z-9.391 R24.5\nG2 X42.509 Z-10.349 R2.5'
    );
  });

  it('相对坐标：大径=40 R=24.5 小R=2.5', () => {
    const result = calcArcPage('qt9', { large: 40, R: 24.5, Ra: 2.5, long: '', juedui: 'false' });
    expect(result).toContain('G3');
    expect(result).toContain('G2');
    expect(result).toContain('R24.5');
    expect(result).toContain('R2.5');
  });
});

// ─── 球头接点10 ─────────────────────────────────────────────────

describe('球头接点10 (qt10)', () => {
  it('绝对坐标：大径=107.564 小径=68 R=55', () => {
    const result = calcArcPage('qt10', { large: 107.564, small: 68, R: 55, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X107.564 Z-43.489 R55'
    );
  });

  it('相对坐标：大径=107.564 小径=68 R=55', () => {
    const result = calcArcPage('qt10', { large: 107.564, small: 68, R: 55, juedui: 'false' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 U107.564 W-43.489 R55'
    );
  });
});

// ─── 球头接点11 ─────────────────────────────────────────────────

describe('球头接点11 (qt11)', () => {
  it('绝对坐标：大径=120 小径=70 长度=127 R=60', () => {
    const result = calcArcPage('qt11', { large: 120, small: 70, angle: '', long: 127, R: 60, Ra: null, tip: null, juedui: 'true' });
    expect(result).toBe(
      'G0 X-0\nG1 Z0 F0.05\nG3 X120 Z-60 R60\nX108.797 Z-85.314 R60\nG1 X70 Z-127'
    );
  });
});

// ─── 球头接点12 ─────────────────────────────────────────────────

describe('球头接点12 (qt12)', () => {
  it('绝对坐标：大径=30 长度=41 SR=25', () => {
    const result = calcArcPage('qt12', { large: 30, long: 41, SR: 25, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X30 Z-5 R25\nG1 X30 Z-46'
    );
  });

  it('相对坐标：大径=30 长度=41 SR=25', () => {
    const result = calcArcPage('qt12', { large: 30, long: 41, SR: 25, juedui: 'false' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 U30 W-5 R25\nG1 X0 W-41'
    );
  });
});

// ─── 外形接点（通用） ───────────────────────────────────────────

describe('外形接点 (wy)', () => {
  it('绝对坐标：大径=30 R=20', () => {
    const result = calcArcPage('wy1', { large: 30, R: 20, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X30 Z-6.771 R20'
    );
  });

  it('相对坐标：大径=30 R=20', () => {
    const result = calcArcPage('wy1', { large: 30, R: 20, juedui: 'false' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 U30 W-6.771 R20'
    );
  });

  it('大径/2 > R 时应报错', () => {
    expect(() => calcArcPage('wy1', { large: 50, R: 20, juedui: 'true' }))
      .toThrow('大径/2 不能大于 R');
  });
});

// ─── 内孔接点（通用） ───────────────────────────────────────────

describe('内孔接点 (nk)', () => {
  it('绝对坐标：内径=30 R=15', () => {
    const result = calcArcPage('nk1', { large: 30, R: 15, juedui: 'true' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 X30 Z-15 R15'
    );
  });

  it('相对坐标：内径=30 R=15', () => {
    const result = calcArcPage('nk1', { large: 30, R: 15, juedui: 'false' });
    expect(result).toBe(
      'G0 X0\nG1 Z0 F0.1\nG03 U30 W-15 R15'
    );
  });
});

// ─── calcArcPage 括号过滤 ───────────────────────────────────────

describe('calcArcPage 括号注释过滤', () => {
  it('输出不包含括号注释行', () => {
    const result = calcArcPage('qt3', { large: 8, small: '', angle: 30, angleLen: 0.6, arcLen: '', R: 8, Ra: null, tip: null, juedui: 'true' });
    const hasComment = result.split('\n').some(l => /^\s*\(.*\)\s*$/.test(l));
    expect(hasComment).toBe(false);
  });

  it('直接调用 calcQt3 仍包含括号注释行', () => {
    const result = calcQt3({ large: 8, small: '', angle: 30, angleLen: 0.6, arcLen: '', R: 8, Ra: null, tip: null, juedui: 'true' });
    const hasComment = result.split('\n').some(l => /^\s*\(.*\)\s*$/.test(l));
    expect(hasComment).toBe(true);
  });
});

// ─── 错误参数校验 ───────────────────────────────────────────────

describe('参数校验', () => {
  it('qt1 大径为0应报错', () => {
    expect(() => calcArcPage('qt1', { large: 0, R: 80, Ra: null, tip: null, juedui: 'true' }))
      .toThrow();
  });

  it('qt1 R为负数应报错', () => {
    expect(() => calcArcPage('qt1', { large: 50, R: -1, Ra: null, tip: null, juedui: 'true' }))
      .toThrow();
  });

  it('qt2 R未填应报错', () => {
    expect(() => calcQt2({ large: 50, small: 33, R: '', long: '', zStart: 0, Ra: '', Rb: '', tip: '', buchang: false, juedui: 'true', mode: 'ball' }))
      .toThrow('R必须填写且为正数');
  });

  it('qt12 SR为0应报错', () => {
    expect(() => calcArcPage('qt12', { large: 30, long: 41, SR: 0, juedui: 'true' }))
      .toThrow();
  });
});
