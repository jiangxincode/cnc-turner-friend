import { renderNavBar } from '../../components/nav-bar.js';

const app = document.getElementById('app');

/**
 * 简单的宏程序解析器
 * 支持：变量赋值(#n=expr)、WHILE/DO/END循环、IF/THEN条件、G/M代码输出
 */
function parseMacro(code) {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('('));
  const vars = {};
  const output = [];
  let i = 0;
  const MAX_LINES = 5000; // 防止无限循环
  let lineCount = 0;

  function evalExpr(expr) {
    // 替换变量引用 #n
    let e = expr.replace(/#(\d+)/g, (_, n) => {
      const v = vars[n];
      return v !== undefined ? v : 0;
    });
    // 替换数学函数
    e = e.replace(/SIN\[([^\]]+)\]/gi, (_, x) => Math.sin(parseFloat(x) * Math.PI / 180));
    e = e.replace(/COS\[([^\]]+)\]/gi, (_, x) => Math.cos(parseFloat(x) * Math.PI / 180));
    e = e.replace(/TAN\[([^\]]+)\]/gi, (_, x) => Math.tan(parseFloat(x) * Math.PI / 180));
    e = e.replace(/SQRT\[([^\]]+)\]/gi, (_, x) => Math.sqrt(parseFloat(x)));
    e = e.replace(/ABS\[([^\]]+)\]/gi, (_, x) => Math.abs(parseFloat(x)));
    // 替换方括号为圆括号
    e = e.replace(/\[/g, '(').replace(/\]/g, ')');
    try {
      return parseFloat(eval(e));
    } catch {
      return 0;
    }
  }

  function evalCond(cond) {
    let c = cond.replace(/#(\d+)/g, (_, n) => vars[n] !== undefined ? vars[n] : 0);
    c = c.replace(/\[/g, '(').replace(/\]/g, ')');
    c = c.replace(/\bLT\b/gi, '<').replace(/\bGT\b/gi, '>').replace(/\bLE\b/gi, '<=').replace(/\bGE\b/gi, '>=').replace(/\bEQ\b/gi, '==').replace(/\bNE\b/gi, '!=');
    try {
      return !!eval(c);
    } catch {
      return false;
    }
  }

  function processLines(lines, start, end) {
    let idx = start;
    while (idx < end && lineCount < MAX_LINES) {
      lineCount++;
      const line = lines[idx];

      // 变量赋值 #n = expr
      const assignMatch = line.match(/^#(\d+)\s*=\s*(.+)$/i);
      if (assignMatch) {
        vars[assignMatch[1]] = evalExpr(assignMatch[2]);
        idx++;
        continue;
      }

      // IF[cond] THEN #n=expr
      const ifThenMatch = line.match(/^IF\[(.+)\]\s*THEN\s*#(\d+)\s*=\s*(.+)$/i);
      if (ifThenMatch) {
        if (evalCond(ifThenMatch[1])) {
          vars[ifThenMatch[2]] = evalExpr(ifThenMatch[3]);
        }
        idx++;
        continue;
      }

      // WHILE[cond] DO1
      const whileMatch = line.match(/^WHILE\[(.+)\]\s*DO(\d+)$/i);
      if (whileMatch) {
        const doNum = whileMatch[2];
        // 找到对应的 END
        let endIdx = idx + 1;
        let depth = 1;
        while (endIdx < end && depth > 0) {
          if (lines[endIdx].match(new RegExp(`^WHILE.*DO${doNum}$`, 'i'))) depth++;
          if (lines[endIdx].match(new RegExp(`^END${doNum}$`, 'i'))) depth--;
          if (depth > 0) endIdx++;
        }
        // 执行循环体
        let loopCount = 0;
        while (evalCond(whileMatch[1]) && loopCount < 1000 && lineCount < MAX_LINES) {
          processLines(lines, idx + 1, endIdx);
          loopCount++;
        }
        idx = endIdx + 1;
        continue;
      }

      // END1/END2 等
      if (line.match(/^END\d+$/i)) {
        idx++;
        continue;
      }

      // G/M代码行：替换变量后输出
      if (line.match(/^[GMTFSNXZIJKRPQHD]/i)) {
        let gLine = line.replace(/#(\d+)/g, (_, n) => {
          const v = vars[n];
          return v !== undefined ? parseFloat(v.toFixed(4)) : 0;
        });
        output.push(gLine);
      }

      idx++;
    }
  }

  try {
    processLines(lines, 0, lines.length);
    if (lineCount >= MAX_LINES) {
      output.push('( 警告：已达到最大行数限制，可能存在无限循环 )');
    }
  } catch (e) {
    output.push(`( 解析错误: ${e.message} )`);
  }

  return output.join('\n');
}

function renderMacroSimPage() {
  app.innerHTML = '';
  renderNavBar(app, { title: '宏转G模拟', showBack: true, showReset: false });

  const content = document.createElement('div');
  content.className = 'page-content';
  content.style.padding = '44px 16px 16px';

  // 说明
  const tip = document.createElement('div');
  tip.style.cssText = 'font-size:12px;color:#888;margin-bottom:8px;padding:8px;background:#f9f9f9;border-radius:4px;';
  tip.textContent = '支持：变量赋值(#n=)、WHILE/DO/END循环、IF/THEN条件、G/M代码。不支持G71/G75等循环指令。';
  content.appendChild(tip);

  // 输入区域
  const inputLabel = document.createElement('div');
  inputLabel.style.cssText = 'font-size:13px;color:#333;margin-bottom:4px;font-weight:bold;';
  inputLabel.textContent = '宏程序输入：';
  content.appendChild(inputLabel);

  const inputArea = document.createElement('textarea');
  inputArea.style.cssText = 'width:100%;height:180px;font-family:monospace;font-size:12px;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;box-sizing:border-box;margin-bottom:8px;';
  inputArea.placeholder = '在此输入宏程序代码...\n例如：\n#1=0\nWHILE[#1 LT 10] DO1\n  G1 X#1 Z-#1 F100\n  #1=#1+1\nEND1';
  content.appendChild(inputArea);

  // 按钮区域
  const btnArea = document.createElement('div');
  btnArea.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';

  const convertBtn = document.createElement('button');
  convertBtn.className = 'btn-primary';
  convertBtn.style.flex = '2';
  convertBtn.textContent = '转换为G代码';
  convertBtn.addEventListener('click', () => {
    const code = inputArea.value.trim();
    if (!code) {
      outputArea.value = '请先输入宏程序代码';
      return;
    }
    try {
      const result = parseMacro(code);
      outputArea.value = result || '( 无输出 )';
    } catch (e) {
      outputArea.value = `错误: ${e.message}`;
    }
  });

  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn-primary';
  clearBtn.style.cssText = 'flex:1;background:#95a5a6;';
  clearBtn.textContent = '清空';
  clearBtn.addEventListener('click', () => {
    inputArea.value = '';
    outputArea.value = '';
  });

  btnArea.appendChild(convertBtn);
  btnArea.appendChild(clearBtn);
  content.appendChild(btnArea);

  // 输出区域
  const outputLabel = document.createElement('div');
  outputLabel.style.cssText = 'font-size:13px;color:#333;margin-bottom:4px;font-weight:bold;';
  outputLabel.textContent = 'G代码输出：';
  content.appendChild(outputLabel);

  const outputArea = document.createElement('textarea');
  outputArea.style.cssText = 'width:100%;height:200px;font-family:monospace;font-size:12px;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;box-sizing:border-box;';
  outputArea.placeholder = '转换结果将显示在这里...';
  outputArea.readOnly = true;
  content.appendChild(outputArea);

  app.appendChild(content);
}

export function registerRoutes(router) {
  router.register('#/macro-sim', () => renderMacroSimPage());
}
