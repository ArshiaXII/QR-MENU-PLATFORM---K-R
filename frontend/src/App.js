import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext'; 

// Layout
import DashboardLayout from './components/Layout/DashboardLayout'; 
import ProtectedRouteWrapper from './components/ProtectedRouteWrapper'; // Import the wrapper

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardOverview from './pages/DashboardOverview';
import ManageMenu from './pages/ManageMenu';
import ManageTemplates from './pages/ManageTemplates';
import ManageQrCode from './pages/ManageQrCode';
import ViewAnalytics from './pages/ViewAnalytics';
import ManageBilling from './pages/ManageBilling';
import RestaurantSettings from './pages/RestaurantSettings';
import PublicMenu from './components/PublicMenu';

// Protected Route using AuthContext (for basic auth check)
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth(); 

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// Helper component for root redirect logic
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  return isAuthenticated ? (
    <Navigate to="/dashboard/overview" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/menu/:restaurantSlug" element={<PublicMenu />} /> 

          {/* Protected Dashboard Routes - Use the Wrapper */}
          <Route element={<ProtectedRoute />}> {/* Basic auth check */}
            <Route element={<ProtectedRouteWrapper />}> {/* Onboarding/profile check */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="overview" replace />} /> 
                <Route path="overview" element={<DashboardOverview />} />
                <Route path="menu" element={<ManageMenu />} />
                <Route path="templates" element={<ManageTemplates />} />
                <Route path="qrcode" element={<ManageQrCode />} />
                <Route path="analytics" element={<ViewAnalytics />} />
                <Route path="billing" element={<ManageBilling />} />
                <Route path="settings" element={<RestaurantSettings />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="/" element={<RootRedirect />} />
          {/* Optional: 404 Not Found Route */}
          {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
