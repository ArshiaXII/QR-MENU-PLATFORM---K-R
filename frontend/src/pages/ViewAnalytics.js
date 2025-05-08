import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { Link } from 'react-router-dom'; // Import Link for upgrade button

const ViewAnalytics = () => {
  const { user } = useAuth(); // Get user context
  const [summary, setSummary] = useState({
    totalMenuVisits: 0,
    topViewedItems: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isFreePlan = user?.subscription?.plan_type === 'free'; // Check plan type

  useEffect(() => {
    // Don't fetch if on free plan
    if (isFreePlan) {
        setIsLoading(false);
        return; 
    }

    const fetchAnalyticsSummary = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get('/analytics/summary');
        if (response.data) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error("Error fetching analytics summary:", err);
        setError(err.response?.data?.message || 'Failed to load analytics data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsSummary();
  }, [isFreePlan]); // Add isFreePlan as dependency

  // Show upgrade prompt for free users
  if (isFreePlan) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Unlock Analytics</h2>
            <p className="text-gray-600 mb-6">
                View detailed menu visit counts and top item performance by upgrading your plan.
            </p>
            <Link 
                to="/dashboard/billing" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Upgrade Plan
            </Link>
        </div>
    );
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading analytics...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Menu Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Menu Visits</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {summary.totalMenuVisits !== null ? summary.totalMenuVisits : 'N/A'}
          </p>
        </div>
        {/* Placeholder for QR Code Scans - requires different tracking */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total QR Code Scans</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">0 <span className="text-sm font-normal text-gray-500">(Not Tracked Yet)</span></p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Top Viewed Items</h3>
        {summary.topViewedItems && summary.topViewedItems.length > 0 ? (
          <ul className="space-y-3">
            {summary.topViewedItems.map((item) => (
              <li key={item.id} className="p-3 bg-gray-50 rounded-md shadow-sm flex justify-between items-center">
                <span className="text-gray-700">{item.name || `Item ID: ${item.id}`}</span>
                <span className="font-semibold text-indigo-600">{item.viewCount} views</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No item view data available yet.</p>
        )}
      </div>
      
      {/* Placeholder for charts */}
      {/* <div className="mt-8 bg-gray-50 p-4 rounded-lg shadow md:col-span-2">
        <h3 className="text-lg font-medium text-gray-700">Views Over Time</h3>
        <p className="text-gray-500 mt-2">Chart placeholder - Analytics integration to be implemented.</p>
        <div className="mt-4 h-64 bg-gray-200 rounded flex items-center justify-center">
          <p className="text-gray-400">Chart Area</p>
        </div>
      </div> */}

      <p className="mt-8 text-sm text-gray-500">
        Note: This is a basic analytics overview. More detailed tracking and charts are planned.
      </p>
    </div>
  );
};

export default ViewAnalytics;
