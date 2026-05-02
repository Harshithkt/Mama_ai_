import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingChatbot from '../components/FloatingChatbot';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import SymptomChecker from '../pages/SymptomChecker';
import EyelidScan from '../pages/EyelidScan';
import MealScanner from '../pages/MealScanner';
import KickCounter from '../pages/KickCounter';
import Reports from '../pages/Reports';
import AshaDashboard from '../pages/AshaDashboard';
import Emergency from '../pages/Emergency';
import BabyGrowth from '../pages/BabyGrowth';
import MoodCheckin from '../pages/MoodCheckin';
import NutritionRings from '../pages/NutritionRings';
import ProtectedRoute from './ProtectedRoute';

const Layout = () => {
  const location = useLocation();
  const noSidebarRoutes = ['/', '/login'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text-1)' }}>
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {showSidebar && <Navbar />}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      {showSidebar && <FloatingChatbot />}
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="symptoms" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
        <Route path="eyelid" element={<ProtectedRoute><EyelidScan /></ProtectedRoute>} />
        <Route path="meal" element={<ProtectedRoute><MealScanner /></ProtectedRoute>} />
        <Route path="kicks" element={<ProtectedRoute><KickCounter /></ProtectedRoute>} />
        <Route path="reports"     element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="asha"        element={<ProtectedRoute><AshaDashboard /></ProtectedRoute>} />
        <Route path="emergency"   element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="baby-growth" element={<ProtectedRoute><BabyGrowth /></ProtectedRoute>} />
        <Route path="mood"        element={<ProtectedRoute><MoodCheckin /></ProtectedRoute>} />
        <Route path="nutrition"   element={<ProtectedRoute><NutritionRings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
