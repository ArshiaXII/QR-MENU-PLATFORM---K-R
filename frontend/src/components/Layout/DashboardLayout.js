import React from 'react';
import { Outlet, Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

// import Sidebar from './Sidebar'; // To be created
// import Topbar from './Topbar'; // To be created

const DashboardLayout = () => {
  const { logout, user } = useAuth(); // Get logout function and user info

  const handleLogout = () => {
    logout();
    // No need to navigate here, ProtectedRoute and interceptor handle redirection
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Placeholder for Sidebar */}
      {/* <Sidebar /> */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-in-out z-30">
        <div className="p-4 font-bold text-lg">QR Menu Dashboard</div>
        {/* Sidebar content goes here */}
        <nav className="mt-10 flex-1"> {/* Added flex-1 to push logout down */}
          {/* Use Link component for SPA navigation */}
          <Link to="/dashboard/overview" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Overview</Link>
          <Link to="/dashboard/menu" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Menu</Link>
          <Link to="/dashboard/templates" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Templates</Link>
          <Link to="/dashboard/qrcode" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">QR Code</Link>
          <Link to="/dashboard/analytics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Analytics</Link>
          <Link to="/dashboard/billing" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Billing</Link>
          <Link to="/dashboard/settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Settings</Link>
        </nav>
         {/* Logout Button at the bottom of sidebar */}
         <div className="p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Logout
            </button>
          </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64"> {/* Adjust margin-left to match sidebar width */}
        {/* Placeholder for Topbar */}
        {/* <Topbar /> */}
        <header className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-700">Page Title</h1> {/* Dynamic title later */}
            {/* Display user email or placeholder */}
            <div className="text-sm text-gray-600">
              {user ? user.email : 'User'}
              {/* Add dropdown/link for user settings later */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {/* Outlet renders the matched nested route component */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
