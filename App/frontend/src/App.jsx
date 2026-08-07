import { useEffect } from 'react';
import AppLayout from './layouts/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DevSecOps from './pages/DevSecOps.jsx';
import Login from './pages/Login.jsx';
import Logs from './pages/Logs.jsx';
import Modules from './pages/Modules.jsx';
import Security from './pages/Security.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useNavigation } from './context/NavigationContext.jsx';

const pages = {
  '/': Dashboard,
  '/modules': Modules,
  '/security': Security,
  '/logs': Logs,
  '/devsecops': DevSecOps
};

export default function App() {
  const { isAuthenticated } = useAuth();
  const { path } = useNavigation();

  if (path === '/login') {
    return isAuthenticated ? <Redirect to="/" /> : <Login />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const Page = pages[path] || Dashboard;

  return (
    <>
      {!pages[path] && <Redirect to="/" />}
      <AppLayout page={<Page />} />
    </>
  );
}

function Redirect({ to }) {
  const { navigate } = useNavigation();

  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);

  return null;
}
