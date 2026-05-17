import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DevSecOps from './pages/DevSecOps.jsx';
import Login from './pages/Login.jsx';
import Logs from './pages/Logs.jsx';
import Modules from './pages/Modules.jsx';
import Security from './pages/Security.jsx';
import { useAuth } from './context/AuthContext.jsx';

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/security" element={<Security />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/devsecops" element={<DevSecOps />} />
      </Route>
    </Routes>
  );
}
