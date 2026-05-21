import { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import { authenticateServerRequest } from './utils/db';
import { subscribeToCookies } from './utils/cookies';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isCheckingAuthRef = useRef(false);

  const checkAuth = () => {
    if (isCheckingAuthRef.current) return;
    isCheckingAuthRef.current = true;
    try {
      const auth = authenticateServerRequest();
      setIsAuthenticated(!!auth.user);
      setLoading(false);
    } finally {
      isCheckingAuthRef.current = false;
    }
  };

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for cookie changes
    const unsubscribeCookies = subscribeToCookies(() => {
      if (isCheckingAuthRef.current) return;
      checkAuth();
    });

    const onLocationChange = () => {
      setPath(window.location.pathname);
      checkAuth();
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('pushstate_navigate', onLocationChange);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('pushstate_navigate', onLocationChange);
      unsubscribeCookies();
    };
  }, []);

  // Update URL path and local state based on auth status
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && path !== '/login') {
      window.history.replaceState(null, '', '/login');
      setPath('/login');
    } else if (isAuthenticated && path === '/login') {
      window.history.replaceState(null, '', '/');
      setPath('/');
    }
  }, [isAuthenticated, path, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading Canvas...</p>
        </div>
      </div>
    );
  }

  if (path === '/login') {
    return <Login />;
  }

  return <Home />;
}
