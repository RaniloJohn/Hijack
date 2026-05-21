import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  if (path === '/login') {
    return <Login />;
  }

  return <Home />;
}
