const FormUtils = {
  // 获取数值，处理空值/非数字
  getNumericValue(inputId) {
    const el = document.getElementById(inputId) || document.querySelector(`[data-id="${inputId}"]`);
    if (!el) return NaN;
    const val = el.value.trim();
    if (val === '') return NaN;
    return parseFloat(val);
  },
  
  // 批量验证输入（fields 为 [{id, label}] 数组）
  // 返回 { valid: boolean, errors: string[] }
  validateInputs(fields) {
    const errors = [];
    fields.forEach(field => {
      const val = FormUtils.getNumericValue(field.id);
      if (isNaN(val)) {
        errors.push(`请输入有效的${field.label}`);
      }
    });
    return { valid: errors.length === 0, errors };
  },
  
  // 重置表单（fields 为 [{id, default}] 数组）
  resetForm(fields) {
    fields.forEach(field => {
      const el = document.querySelector(`[data-id="${field.id}"]`);
      if (el) el.value = field.default ?? '';
    });
  },
  
  // 显示错误提示（在 container 内）
  showError(container, message) {
    let errEl = container.querySelector('.error-tip');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'error-tip';
      container.appendChild(errEl);
    }
    errEl.textContent = message;
  },
  
  // 格式化数值显示（保留 decimals 位小数）
  formatNumber(value, decimals = 4) {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return '-';
    }
    return value.toFixed(decimals);
  },
  
  // 检查值是否为非法输入
  isInvalidInput(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return true;
      const num = parseFloat(trimmed);
      return isNaN(num) || !isFinite(num);
    }
    return isNaN(value) || !isFinite(value);
  }
};

export default FormUtils;
