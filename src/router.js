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

  _patternToRegex(pattern) {
    const paramNames = [];
    // 先转义所有正则特殊字符，再把 \: 开头的参数替换为捕获组
    const escaped = pattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regexStr = escaped.replace(/\\:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    return { regex: new RegExp('^' + regexStr + '$'), paramNames };
  },

  _match(hash) {
    const normalizedHash = hash === '#/' ? hash : hash.replace(/\/$/, '');
    for (const [pattern, handler] of this.routes) {
      const { regex, paramNames } = this._patternToRegex(pattern);
      const match = normalizedHash.match(regex);
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
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
