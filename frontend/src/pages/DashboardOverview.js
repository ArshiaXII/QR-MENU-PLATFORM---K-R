import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // For QR code preview

const DashboardOverview = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [publicMenuUrl, setPublicMenuUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats - will be mock data for now
  const [menuItemCount, setMenuItemCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  // const [qrScans, setQrScans] = useState(0); // From analytics later
  // const [menuViews, setMenuViews] = useState(0); // From analytics later

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch restaurant profile for name and slug
        const profileRes = await api.get('/restaurants/me');
        if (profileRes.data && profileRes.data.restaurant) {
          setRestaurant(profileRes.data.restaurant);
          if (profileRes.data.restaurant.slug) {
            const currentOrigin = window.location.origin;
            setPublicMenuUrl(`${currentOrigin}/menu/${profileRes.data.restaurant.slug}`);
          }

          // TODO: Fetch actual stats later
          // For now, simulate fetching categories and items to get counts
          if (profileRes.data.restaurant.menuId) {
            const menuId = profileRes.data.restaurant.menuId;
            const categoriesRes = await api.get('/categories'); // Assumes this fetches for the logged-in user's restaurant
            setCategoryCount(categoriesRes.data?.categories?.length || 0);

            const itemsRes = await api.get(`/menu/${menuId}/items`);
            setMenuItemCount(itemsRes.data?.items?.length || 0);
          }
        } else {
          setError('Please complete your restaurant profile in Settings.');
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4">Loading dashboard...</div>;
  }

  if (error && !restaurant) { // Show error prominently if no restaurant data at all
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Welcome, {restaurant?.name || 'Restaurant Owner'}!
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Menu Stats Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Menu Stats</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Total Categories: <span className="font-bold text-indigo-600">{categoryCount}</span></p>
            <p className="text-gray-600">Total Items: <span className="font-bold text-indigo-600">{menuItemCount}</span></p>
            {/* <p className="text-gray-600">QR Code Scans: <span className="font-bold text-indigo-600">{qrScans} (Mock)</span></p> */}
            {/* <p className="text-gray-600">Menu Views: <span className="font-bold text-indigo-600">{menuViews} (Mock)</span></p> */}
          </div>
          <Link to="/dashboard/menu" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
            Manage Menu &rarr;
          </Link>
        </div>

        {/* QR Code Preview Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Your QR Code</h3>
          {publicMenuUrl ? (
            <div className="p-2 border rounded-md inline-block bg-white mb-3">
              <QRCodeSVG value={publicMenuUrl} size={128} level="H" includeMargin={true} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-3">Set up restaurant slug in Settings to see QR code.</p>
          )}
          <Link to="/dashboard/qrcode" className="mt-auto inline-block text-indigo-600 hover:text-indigo-800 font-medium">
            Manage QR Code &rarr;
          </Link>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Subscription</h3>
          <p className="text-gray-600">Status: <span className="font-bold text-green-600">Active (Mock)</span></p>
          <p className="text-gray-600">Plan: <span className="font-bold">Premium (Mock)</span></p>
          <p className="text-sm text-gray-500 mt-2">Renews on: Jan 1, 2026 (Mock)</p>
          <Link to="/dashboard/billing" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
            Manage Billing &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Actions or other info can go here */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h3>
         Links to common tasks 
      </div> */}
    </div>
  );
};

export default DashboardOverview;
