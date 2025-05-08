import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Define steps
const STEPS = {
  WELCOME: 1,
  RESTAURANT_DETAILS: 2,
  // LOGO_UPLOAD: 3, // Combine with details for simplicity?
  // FIRST_ITEMS: 4, // Can be skipped, user can do this later
  // TEMPLATE_CHOICE: 5, // Can be skipped, default is fine
  FINISH: 3, 
};

const OnboardingWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth(); // Need login to potentially refresh user data after profile save

  // State for Restaurant Details step
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    currency_code: 'USD',
    // logo_path will be handled separately if we add upload here
  });

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleRestaurantDetailsChange = (e) => {
    setRestaurantData({ ...restaurantData, [e.target.name]: e.target.value });
  };

  const handleSaveRestaurantDetails = async () => {
    setIsLoading(true);
    setError('');
    if (!restaurantData.name.trim()) {
      setError('Restaurant name is required.');
      setIsLoading(false);
      return;
    }

    try {
      // Use the same upsert endpoint as RestaurantSettings
      // This will also mark onboarding as complete on the backend
      const response = await api.put('/restaurants/me', {
        name: restaurantData.name,
        description: restaurantData.description,
        currency_code: restaurantData.currency_code,
        // Not handling logo here for simplicity, user can add in settings
      });

      if (response.status === 200 && response.data.restaurant) {
         console.log("Onboarding: Restaurant details saved.");
         // Optionally: Refresh user context if needed, though profile save marks complete
         // await login(user.email, /* need password? */); // Re-login might be complex
         handleNext(); // Move to finish step
      } else {
        throw new Error('Failed to save restaurant details');
      }
    } catch (err) {
      console.error("Error saving restaurant details during onboarding:", err);
      setError(err.response?.data?.message || 'Failed to save details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Call the onComplete prop which should likely reload or redirect
    if (onComplete) {
      onComplete(); 
    } else {
        // Fallback: reload the page if no handler provided
        window.location.reload(); 
    }
  };


  // --- Render Steps ---

  const renderWelcomeStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to QR Menu!</h2>
      <p className="text-gray-600 mb-8">Let's get your restaurant set up quickly.</p>
      <button 
        onClick={handleNext}
        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Get Started
      </button>
    </div>
  );

  const renderRestaurantDetailsStep = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Tell us about your restaurant</h2>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); handleSaveRestaurantDetails(); }} className="space-y-4">
         <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Restaurant Name *</label>
            <input type="text" name="name" id="name" value={restaurantData.name} onChange={handleRestaurantDetailsChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description (Optional)</label>
            <textarea name="description" id="description" value={restaurantData.description} onChange={handleRestaurantDetailsChange} rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
           <div>
            <label htmlFor="currency_code" className="block text-sm font-medium text-gray-700">Default Currency</label>
            <select id="currency_code" name="currency_code" value={restaurantData.currency_code} onChange={handleRestaurantDetailsChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="TRY">TRY (₺)</option>
                <option value="RUB">RUB (₽)</option>
            </select>
            </div>
            {/* TODO: Add Logo Upload Step later if desired */}
         <div className="pt-4 flex justify-end">
             <button type="submit" disabled={isLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Next'}
            </button>
         </div>
      </form>
    </div>
  );

   const renderFinishStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Complete!</h2>
      <p className="text-gray-600 mb-8">Your basic restaurant profile is saved. You can now start adding menu items and customizing your templates.</p>
      <button 
        onClick={handleFinish}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Go to Dashboard
      </button>
    </div>
  );


  return (
     <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
            {/* Progress Indicator (Optional) */}
            {/* <div className="mb-6">Progress... {currentStep} / {Object.keys(STEPS).length}</div> */}

            {currentStep === STEPS.WELCOME && renderWelcomeStep()}
            {currentStep === STEPS.RESTAURANT_DETAILS && renderRestaurantDetailsStep()}
            {currentStep === STEPS.FINISH && renderFinishStep()}
            
        </div>
     </div>
  );
};

export default OnboardingWizard;
