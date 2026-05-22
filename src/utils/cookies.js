// Custom Cookie Manager for Session Hijacking Lab
// This wrapper manages document.cookie and supports a mock HttpOnly jar for educational simulation.

(function() {
  const listeners = new Set();

  window.subscribeToCookies = function(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  function notifyListeners() {
    listeners.forEach(l => {
      try { l(); } catch (e) { console.error(e); }
    });
    // Trigger a standard window event for global synchronization
    window.dispatchEvent(new Event('cookies_changed'));
  }

  // Shim for document.cookie if not supported (e.g. running under file:// protocol)
  let useCookieShim = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
  if (!useCookieShim && typeof document !== 'undefined') {
    try {
      document.cookie = "canvas_cookie_test=1";
      if (document.cookie.indexOf("canvas_cookie_test=1") === -1) {
        useCookieShim = true;
      }
      document.cookie = "canvas_cookie_test=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {
      useCookieShim = true;
    }
  }

  if (useCookieShim) {
    const MOCK_NORMAL_COOKIES_KEY = 'canvas_mock_normal_cookies';
    
    function getMockCookies() {
      try {
        const val = localStorage.getItem(MOCK_NORMAL_COOKIES_KEY);
        return val ? JSON.parse(val) : {};
      } catch {
        return {};
      }
    }

    function setMockCookies(cookies) {
      try {
        localStorage.setItem(MOCK_NORMAL_COOKIES_KEY, JSON.stringify(cookies));
      } catch (e) {
        console.error("Failed to save mock cookies to localStorage:", e);
      }
    }

    const cookieDescriptor = {
      configurable: true,
      enumerable: true,
      get() {
        const cookies = getMockCookies();
        return Object.entries(cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
      },
      set(val) {
        if (typeof val !== 'string' || !val) return;
        const parts = val.split(';');
        const mainPart = parts[0].trim();
        const eqIdx = mainPart.indexOf('=');
        if (eqIdx === -1) return;
        
        const name = mainPart.substring(0, eqIdx).trim();
        const value = mainPart.substring(eqIdx + 1).trim();
        
        const cookies = getMockCookies();
        const lowerVal = val.toLowerCase();
        
        if (lowerVal.includes('max-age=0') || lowerVal.includes('1970')) {
          delete cookies[name];
        } else {
          cookies[name] = value;
        }
        
        setMockCookies(cookies);
        notifyListeners();
      }
    };

    try {
      Object.defineProperty(document, 'cookie', cookieDescriptor);
    } catch (e) {
      try {
        Object.defineProperty(Document.prototype, 'cookie', cookieDescriptor);
      } catch (err) {
        console.warn("Failed to shim document.cookie:", err);
      }
    }
  }

  const HTTP_ONLY_KEY = 'canvas_http_only_cookies';

  function getHttpOnlyCookies() {
    try {
      const data = localStorage.getItem(HTTP_ONLY_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function setHttpOnlyCookie(name, value) {
    const cookies = getHttpOnlyCookies();
    cookies[name] = value;
    localStorage.setItem(HTTP_ONLY_KEY, JSON.stringify(cookies));
  }

  function deleteHttpOnlyCookie(name) {
    const cookies = getHttpOnlyCookies();
    delete cookies[name];
    localStorage.setItem(HTTP_ONLY_KEY, JSON.stringify(cookies));
  }

  window.cookieManager = {
    // Sets a cookie (real document.cookie or mock HttpOnly)
    set(name, value, options = {}) {
      const { maxAge, path = '/', httpOnly = false } = options;

      if (httpOnly) {
        setHttpOnlyCookie(name, value);
        document.cookie = `${name}=; path=${path}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      } else {
        deleteHttpOnlyCookie(name);
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`;
        if (maxAge !== undefined) {
          cookieString += `; max-age=${maxAge}`;
        }
        document.cookie = cookieString;
      }

      notifyListeners();
    },

    // Gets a cookie value (JavaScript view)
    get(name) {
      const httpOnlyCookies = getHttpOnlyCookies();
      if (httpOnlyCookies[name]) {
        return null;
      }

      const nameEQ = encodeURIComponent(name) + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    },

    // Deletes a cookie
    delete(name, path = '/') {
      deleteHttpOnlyCookie(name);
      document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      notifyListeners();
    },

    // Returns all cookies, categorized for our Lab HUD
    getAllForHUD() {
      const list = [];

      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        const parts = ca[i].split('=');
        const name = parts[0].trim();
        if (name) {
          const val = parts.slice(1).join('=');
          list.push({
            name: decodeURIComponent(name),
            value: decodeURIComponent(val),
            isHttpOnly: false
          });
        }
      }

      const httpOnlyCookies = getHttpOnlyCookies();
      Object.entries(httpOnlyCookies).forEach(([name, value]) => {
        list.push({
          name,
          value,
          isHttpOnly: true
        });
      });

      return list;
    },

    // Retrieves the true cookie value sent to the "server" (includes HttpOnly cookies)
    getServerCookie(name) {
      const httpOnlyCookies = getHttpOnlyCookies();
      if (httpOnlyCookies[name]) {
        return httpOnlyCookies[name];
      }
      return this.get(name);
    }
  };

  // Background interval to detect manual F12 modifications to document.cookie or localStorage HttpOnly cookies
  let lastCookieString = document.cookie;
  let lastHttpOnlyString = localStorage.getItem(HTTP_ONLY_KEY);
  setInterval(() => {
    const currentCookie = document.cookie;
    const currentHttpOnly = localStorage.getItem(HTTP_ONLY_KEY);
    if (currentCookie !== lastCookieString || currentHttpOnly !== lastHttpOnlyString) {
      lastCookieString = currentCookie;
      lastHttpOnlyString = currentHttpOnly;
      notifyListeners();
    }
  }, 500);
})();
