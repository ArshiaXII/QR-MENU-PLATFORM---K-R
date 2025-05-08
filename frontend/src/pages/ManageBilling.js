import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ManageBilling = () => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get('/subscription/status');
        setSubscription(response.data);
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        setError(err.response?.data?.message || 'Failed to load subscription details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptionStatus();
  }, []);

  const handleManageSubscription = async () => {
    // In a real app, this would likely call a backend endpoint 
    // that generates a Stripe Customer Portal session URL and redirects the user.
    alert("Mock Action: Redirecting to subscription management portal...");
    // Example: 
    // try {
    //   const response = await api.post('/subscription/manage');
    //   if (response.data.portalUrl) {
    //     window.location.href = response.data.portalUrl; 
    //   }
    // } catch (err) { ... }
  };

  const handleChoosePlan = (planIdentifier, planName) => {
     // In a real app, this would call the backend to create a checkout session
     alert(`Mock Action: Starting checkout process for ${planName}...`);
     // Example:
     // try {
     //   const response = await api.post('/subscription/create-checkout-session', { planIdentifier, planName });
     //   // Redirect to Stripe Checkout or use Stripe.js with session ID
     // } catch (err) { ... }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading billing information...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Billing & Subscription</h2>

      {subscription ? (
        <div className="space-y-4 mb-8 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700">Current Plan</h3>
          <p>
            <span className="font-semibold">Plan:</span> 
            <span className="ml-2 capitalize font-medium text-indigo-700">{subscription.planName || 'N/A'}</span>
          </p>
          <p>
            <span className="font-semibold">Status:</span> 
            <span className={`ml-2 capitalize px-2 py-0.5 rounded-full text-xs font-medium ${
              subscription.status === 'active' || subscription.status === 'trial' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {subscription.status || 'Unknown'}
            </span>
          </p>
          {subscription.currentPeriodEnd && (
            <p>
              <span className="font-semibold">{subscription.status === 'trial' ? 'Trial Ends:' : 'Renews On:'}</span> 
              <span className="ml-2">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </p>
          )}
           {/* Mock Manage Button */}
           <button 
             onClick={handleManageSubscription}
             className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
           >
             Manage Subscription (Mock)
           </button>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No active subscription found.</p>
      )}

      {/* Mock Plan Selection */}
      <div className="space-y-4">
         <h3 className="text-lg font-medium text-gray-700">Choose a Plan</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Plan */}
            <div className="border p-4 rounded-md flex flex-col">
                <h4 className="font-semibold text-lg">Basic</h4>
                <p className="text-gray-500 text-sm mb-3">Up to 3 templates, standard QR code.</p>
                <p className="text-2xl font-bold mb-4">$5 <span className="text-sm font-normal">/ month</span></p>
                <button 
                    onClick={() => handleChoosePlan('basic_monthly', 'Basic')}
                    className="mt-auto w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium py-2 px-4 rounded"
                >
                    Choose Basic (Mock)
                </button>
            </div>
             {/* Premium Plan */}
             <div className="border p-4 rounded-md flex flex-col border-indigo-500 ring-2 ring-indigo-500">
                <h4 className="font-semibold text-lg">Premium</h4>
                <p className="text-gray-500 text-sm mb-3">Unlimited templates, custom QR codes, analytics.</p>
                <p className="text-2xl font-bold mb-4">$15 <span className="text-sm font-normal">/ month</span></p>
                 <button 
                    onClick={() => handleChoosePlan('premium_monthly', 'Premium')}
                    className="mt-auto w-full bg-indigo-600 text-white hover:bg-indigo-700 font-medium py-2 px-4 rounded"
                >
                    Choose Premium (Mock)
                </button>
            </div>
         </div>
      </div>
       <p className="mt-8 text-sm text-gray-500">
        Note: Subscription management is currently mocked. Clicking buttons will not process payments.
      </p>
    </div>
  );
};

export default ManageBilling;
