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
})();
