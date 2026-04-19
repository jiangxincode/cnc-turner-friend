// Hash 路由器，支持参数化路径匹配
const Router = {
  routes: new Map(),

  register(pattern, handler) {
    this.routes.set(pattern, handler);
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  back() {
    window.history.back();
  },

  getCurrentRoute() {
    const hash = window.location.hash || '#/';
    const matched = this._match(hash);
    return matched ? { path: hash, params: matched.params } : { path: hash, params: {} };
  },

  // 将路由 pattern 转为正则，提取参数名
  // 例如 '#/arc/qt/:id' => /^#\/arc\/qt\/([^/]+)$/
  _patternToRegex(pattern) {
    const paramNames = [];
    let regexStr = '';
    // 逐字符处理，遇到 :param 提取为捕获组，其余字符转义
    let i = 0;
    while (i < pattern.length) {
      const ch = pattern[i];
      if (ch === ':') {
        // 读取参数名
        let name = '';
        i++;
        while (i < pattern.length && /[a-zA-Z0-9_]/.test(pattern[i])) {
          name += pattern[i];
          i++;
        }
        paramNames.push(name);
        regexStr += '([^/]+)';
      } else {
        // 转义正则特殊字符
        if ('/^$.*+?()[]{}|\\'.indexOf(ch) !== -1) {
          regexStr += '\\' + ch;
        } else {
          regexStr += ch;
        }
        i++;
      }
    }
    return { regex: new RegExp('^' + regexStr + '$'), paramNames };
  },

  _match(hash) {
    const normalizedHash = (hash === '#/' || hash === '') ? '#/' : hash.replace(/\/$/, '');
    for (const [pattern, handler] of this.routes) {
      const { regex, paramNames } = this._patternToRegex(pattern);
      const match = normalizedHash.match(regex);
      if (match) {
        const params = {};
        paramNames.forEach((name, idx) => { params[name] = match[idx + 1]; });
        return { handler, params };
      }
    }
    return null;
  },

  _dispatch(hash) {
    const h = hash || '#/';
    const matched = this._match(h);
    if (matched) {
      matched.handler(matched.params);
    } else {
      window.location.hash = '#/';
    }
  },

  init() {
    window.addEventListener('hashchange', () => this._dispatch(window.location.hash));
    this._dispatch(window.location.hash || '#/');
  }
};

export default Router;
