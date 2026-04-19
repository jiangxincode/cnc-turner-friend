/**
 * 圆弧接点计算测试
 * 期望值来自原应用（车工计算 v5.9.7）的实际输出
 * 防止修改某个接点计算时意外影响其他接点
 */
import { describe, it, expect } from 'vitest';
import {
  calcQt1, calcQt2, calcQt3, calcQt4, calcQt5, calcQt6,
  calcQt7, calcQt8, calcQt9, calcQt10, calcQt11, calcQt12,
  calcGenericArc, calcArcPage,
} from '../src/modules/arc-junction/calc.js';

// ─── 辅助函数 ────────────────────────────────────────────────

/** 提取输出中的所有 G 代码行（去掉注释行） */
function gLines(output) {
  return output.split('\n').filter(l => !l.startsWith('('));
}

/** 从 G 代码行中提取 X/Z 数值 */
function parseXZ(line) {
  const x = line.match(/[XU]([-\d.]+)/);
  const z = line.match(/[ZW]([-\d.]+)/);
  return {
    x: x ? parseFloat(x[1]) : null,
    z: z ? parseFloat(z[1]) : null,
  };
}

// ─── qt1：外凸球头 ────────────────────────────────────────────

describe('qt1 球头接点1', () => {
  it('绝对坐标，无Ra，大径=50 R=80', () => {
    const out = calcQt1({ large: 50, R: 80, Ra: null, tip: null, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('G0 X0');
    expect(lines[1]).toBe('G1 Z0 F0.1');
    // Z = -(80 - sqrt(80²-25²)) = -(80-77.993) = -4.007
    expect(lines[2]).toBe('G03 X50 Z-4.007 R80');
  });

  it('绝对坐标，Ra=2，大径=50 R=80', () => {
    const out = calcQt1({ large: 50, R: 80, Ra: 2, tip: null, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(4);
    expect(lines[2]).toBe('G03 X47.179 Z-3.557 R80');
    expect(lines[3]).toBe('G03 X50 Z-5.468 R2');
  });

  it('相对坐标，Ra=2，大径=50 R=80', () => {
    const out = calcQt1({ large: 50, R: 80, Ra: 2, tip: null, juedui: 'false' });
    const lines = gLines(out);
    expect(lines).toHaveLength(4);
    // 第一段：从(0,0)到(47.179,-3.557)，增量相同
    expect(lines[2]).toBe('G03 U47.179 W-3.557 R80');
    // 第二段：从(47.179,-3.557)到(50,-5.468)，增量=(2.821,-1.911)
    expect(lines[3]).toBe('G03 U2.821 W-1.911 R2');
  });

  it('相对坐标，无Ra，大径=50 R=80', () => {
    const out = calcQt1({ large: 50, R: 80, Ra: null, tip: null, juedui: 'false' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    // 从(0,0)出发，增量=绝对值
    expect(lines[2]).toBe('G03 U50 W-4.007 R80');
  });

  it('大径/2 > R 时抛出错误', () => {
    expect(() => calcQt1({ large: 200, R: 80, Ra: null, tip: null, juedui: 'true' }))
      .toThrow('大径/2 不能大于 R');
  });

  it('大径为0时抛出错误', () => {
    expect(() => calcQt1({ large: 0, R: 80, Ra: null, tip: null, juedui: 'true' }))
      .toThrow('大径必须为正数');
  });
});

// ─── qt2：球头+过渡 ───────────────────────────────────────────

describe('qt2 球头接点2', () => {
  it('绝对坐标，大径=50 R=30 长度=8.417', () => {
    const out = calcQt2({ large: 50, R: 30, small: '', long: 8.417, juedui: 'true' });
    const lines = gLines(out);
    // Z = -(30 - sqrt(30²-25²)) = -(30-sqrt(275)) = -(30-16.583) = -13.417
    const { z } = parseXZ(lines[2]);
    expect(z).toBeCloseTo(-13.417, 2);
    // 有长度，追加直线段
    expect(lines).toHaveLength(4);
    const { z: z2 } = parseXZ(lines[3]);
    expect(z2).toBeCloseTo(-13.417 - 8.417, 2);
  });

  it('无长度时只有3行', () => {
    const out = calcQt2({ large: 50, R: 30, small: '', long: '', juedui: 'true' });
    expect(gLines(out)).toHaveLength(3);
  });
});

// ─── qt3：球头+锥面 ───────────────────────────────────────────

describe('qt3 球头接点3', () => {
  it('绝对坐标，大径=8 角度=30 R=8', () => {
    const out = calcQt3({ large: 8, angle: 30, R: 8, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    // Z = -(8 - sqrt(8²-4²)) = -(8-sqrt(48)) = -(8-6.928) = -1.072
    const { x, z } = parseXZ(lines[2]);
    expect(x).toBe(8);
    expect(z).toBeCloseTo(-1.072, 2);
    expect(lines[2]).toContain('R8');
  });
});

// ─── qt4：球头+直线 ───────────────────────────────────────────

describe('qt4 球头接点4', () => {
  it('绝对坐标，大径=8 R=10 长度=5', () => {
    const out = calcQt4({ large: 8, R: 10, long: 5, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(4);
    // Z = -(10 - sqrt(100-16)) = -(10-sqrt(84)) = -(10-9.165) = -0.835
    const { z } = parseXZ(lines[2]);
    expect(z).toBeCloseTo(-0.835, 2);
    // 直线段 Z = -0.835 - 5 = -5.835
    const { z: z2 } = parseXZ(lines[3]);
    expect(z2).toBeCloseTo(-5.835, 2);
  });

  it('无长度时只有3行', () => {
    const out = calcQt4({ large: 8, R: 10, long: '', juedui: 'true' });
    expect(gLines(out)).toHaveLength(3);
  });
});

// ─── qt5：复合球头 ────────────────────────────────────────────

describe('qt5 球头接点5', () => {
  it('绝对坐标，大径=19.874 R=13', () => {
    const out = calcQt5({ large: 19.874, R: 13, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    const { x, z } = parseXZ(lines[2]);
    expect(x).toBeCloseTo(19.874, 2);
    // Z = -(13 - sqrt(13²-(19.874/2)²)) = -(13-sqrt(169-98.745)) = -(13-sqrt(70.255))
    const expectedZ = -(13 - Math.sqrt(13 * 13 - (19.874 / 2) ** 2));
    expect(z).toBeCloseTo(expectedZ, 2);
  });
});

// ─── qt6：球头+锥+圆柱 ───────────────────────────────────────

describe('qt6 球头接点6', () => {
  it('绝对坐标，大径=47.633 小径=30 R=25', () => {
    const out = calcQt6({ large: 47.633, small: 30, R: 25, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(4);
    const { x } = parseXZ(lines[2]);
    expect(x).toBeCloseTo(47.633, 2);
    // 追加直线到小径
    const { x: x2 } = parseXZ(lines[3]);
    expect(x2).toBe(30);
  });

  it('无小径时只有3行', () => {
    const out = calcQt6({ large: 47.633, small: 0, R: 25, juedui: 'true' });
    expect(gLines(out)).toHaveLength(3);
  });
});

// ─── qt7：球头+角度 ───────────────────────────────────────────

describe('qt7 球头接点7', () => {
  it('绝对坐标，大径=50 角度=84.8 Ra=10', () => {
    // Ra=10 时大径/2=25 > Ra=10，改用合法参数：大径=16 Ra=10
    const out = calcQt7({ large: 16, angle: 84.8, Ra: 10, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    const { x } = parseXZ(lines[2]);
    expect(x).toBe(16);
    expect(lines[2]).toContain('R10');
  });
});

// ─── qt8：内凹球头 ────────────────────────────────────────────

describe('qt8 球头接点8', () => {
  it('绝对坐标，大径=24.7 r=3 R=75', () => {
    const out = calcQt8({ large: 24.7, r: 3, R: 75, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    const { x, z } = parseXZ(lines[2]);
    expect(x).toBeCloseTo(24.7, 2);
    // Z = -(75 - sqrt(75²-(24.7/2)²))
    const expectedZ = -(75 - Math.sqrt(75 * 75 - (24.7 / 2) ** 2));
    expect(z).toBeCloseTo(expectedZ, 2);
    expect(lines[2]).toContain('R75');
  });
});

// ─── qt9：球头+Ra过渡 ─────────────────────────────────────────

describe('qt9 球头接点9', () => {
  it('绝对坐标，大径=40 R=24.5 Ra=2.5', () => {
    const out = calcQt9({ large: 40, R: 24.5, Ra: 2.5, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    expect(lines[2]).toContain('X40');
    expect(lines[2]).toContain('R24.5');
  });

  it('相对坐标，大径=40 R=24.5', () => {
    const out = calcQt9({ large: 40, R: 24.5, Ra: 2.5, juedui: 'false' });
    const lines = gLines(out);
    expect(lines[2]).toContain('U40');
    expect(lines[2]).toContain('W');
  });
});

// ─── qt10：复合球头 ───────────────────────────────────────────

describe('qt10 球头接点10', () => {
  it('绝对坐标，大径=107.564 小径=68 R=55', () => {
    const out = calcQt10({ large: 107.564, small: 68, R: 55, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    const { x } = parseXZ(lines[2]);
    expect(x).toBeCloseTo(107.564, 2);
    expect(lines[2]).toContain('R55');
  });
});

// ─── qt11：球头+直线+球头 ─────────────────────────────────────

describe('qt11 球头接点11', () => {
  it('绝对坐标，大径=120 小径=70 长度=127 R=60', () => {
    const out = calcQt11({ large: 120, small: 70, long: 127, R: 60, juedui: 'true' });
    const lines = gLines(out);
    // G03(大径) + G1(直线) + G02(小径)
    expect(lines).toHaveLength(5);
    expect(lines[2]).toContain('G03');
    expect(lines[3]).toContain('G1');
    expect(lines[4]).toContain('G02');
  });

  it('相对坐标，大径=120 小径=70 长度=127 R=60', () => {
    const out = calcQt11({ large: 120, small: 70, long: 127, R: 60, juedui: 'false' });
    const lines = gLines(out);
    expect(lines[2]).toContain('U120');
    expect(lines[3]).toContain('W-127');
  });
});

// ─── qt12：球头+SR ────────────────────────────────────────────

describe('qt12 球头接点12', () => {
  it('绝对坐标，大径=30 长度=41 SR=25', () => {
    const out = calcQt12({ large: 30, long: 41, SR: 25, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(4);
    const { x } = parseXZ(lines[2]);
    expect(x).toBe(30);
    expect(lines[2]).toContain('R25');
    // 直线段
    const { z: z2 } = parseXZ(lines[3]);
    const Z = -(25 - Math.sqrt(25 * 25 - 15 * 15));
    expect(z2).toBeCloseTo(Z - 41, 2);
  });

  it('无长度时只有3行', () => {
    const out = calcQt12({ large: 30, long: 0, SR: 25, juedui: 'true' });
    expect(gLines(out)).toHaveLength(3);
  });
});

// ─── 通用圆弧接点 ─────────────────────────────────────────────

describe('calcGenericArc 通用圆弧', () => {
  it('绝对坐标，大径=30 R=20', () => {
    // 大径/2=15 < R=20，合法
    const out = calcGenericArc({ large: 30, R: 20, juedui: 'true' });
    const lines = gLines(out);
    expect(lines).toHaveLength(3);
    expect(lines[2]).toContain('X30');
    expect(lines[2]).toContain('R20');
  });

  it('相对坐标，大径=30 R=20', () => {
    const out = calcGenericArc({ large: 30, R: 20, juedui: 'false' });
    const lines = gLines(out);
    expect(lines[2]).toContain('U30');
    expect(lines[2]).toContain('W');
  });
});

// ─── calcArcPage 分发函数 ─────────────────────────────────────

describe('calcArcPage 路由分发', () => {
  it('qt1 路由到 calcQt1', () => {
    const out = calcArcPage('qt1', { large: 50, R: 80, Ra: null, tip: null, juedui: 'true' });
    expect(out).toContain('G03 X50 Z-4.007 R80');
  });

  it('qt2 路由到 calcQt2', () => {
    const out = calcArcPage('qt2', { large: 50, R: 30, small: '', long: '', juedui: 'true' });
    expect(out).toContain('G03');
    expect(out).toContain('R30');
  });

  it('wy1 路由到 calcGenericArc', () => {
    // 大径/2=15 < R=20，合法
    const out = calcArcPage('wy1', { large: 30, R: 20, juedui: 'true' });
    expect(out).toContain('G03 X30');
  });

  it('nk1 路由到 calcGenericArc', () => {
    const out = calcArcPage('nk1', { large: 30, R: 15, juedui: 'true' });
    expect(out).toContain('G03 X30');
  });
});

// ─── 数学正确性验证 ───────────────────────────────────────────

describe('ballZ 几何公式验证', () => {
  it('qt1 Z值精确匹配：大径=50 R=80', () => {
    const out = calcQt1({ large: 50, R: 80, Ra: null, tip: null, juedui: 'true' });
    const { z } = parseXZ(gLines(out)[2]);
    // Z = -(80 - sqrt(80²-25²)) = -(80-77.9929) = -4.0071
    expect(z).toBeCloseTo(-(80 - Math.sqrt(80 * 80 - 25 * 25)), 3);
  });

  it('qt1 Ra切点X值精确匹配：大径=50 R=80 Ra=2', () => {
    const out = calcQt1({ large: 50, R: 80, Ra: 2, tip: null, juedui: 'true' });
    const lines = gLines(out);
    const { x } = parseXZ(lines[2]);
    // tx = R * r2 / dist = 80 * 23 / 78 = 23.5897...，直径 = 47.179
    expect(x).toBeCloseTo(2 * 80 * 23 / 78, 2);
  });

  it('qt1 Ra终点Z值精确匹配：大径=50 R=80 Ra=2', () => {
    const out = calcQt1({ large: 50, R: 80, Ra: 2, tip: null, juedui: 'true' });
    const lines = gLines(out);
    const { z } = parseXZ(lines[3]);
    // Zc = -80 + sqrt(78²-23²) = -80 + 74.532 = -5.468
    expect(z).toBeCloseTo(-80 + Math.sqrt(78 * 78 - 23 * 23), 3);
  });
});
