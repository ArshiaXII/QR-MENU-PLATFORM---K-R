import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import OnboardingWizard from './OnboardingWizard'; // Import the wizard

const ProtectedRouteWrapper = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [restaurantProfile, setRestaurantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // New state to trigger refresh

  // Define fetchProfile once, in the component scope
  const fetchProfile = async () => {
    if (!user || authLoading) {
      // If auth is still loading or no user, don't attempt to fetch profile yet.
      // For the case where user becomes available, useEffect will trigger it.
      if (!authLoading && !user) { 
        setProfileLoading(false); // Not loading profile if no user
      }
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      console.log("[ProtectedRouteWrapper] Fetching restaurant profile...");
      const response = await api.get('/restaurants/me');
      console.log("[ProtectedRouteWrapper] Profile response:", response.data);
      setRestaurantProfile(response.data.restaurant);
    } catch (error) {
      console.error("[ProtectedRouteWrapper] Error fetching restaurant profile:", error);
      if (error.response?.status !== 401) {
        setProfileError("Could not load restaurant data.");
      }
      // If 401, api interceptor should handle logout/redirect
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    console.log("[ProtectedRouteWrapper] useEffect triggered. User:", user, "AuthLoading:", authLoading, "RefreshTrigger:", refreshTrigger);
    fetchProfile(); // Call the single fetchProfile on initial load or when user/authLoading/refreshTrigger changes
  }, [user, authLoading, refreshTrigger]); // Add refreshTrigger to dependencies

  const handleOnboardingComplete = () => { 
    // Onboarding is complete, trigger a profile refresh by updating the refreshTrigger state
    console.log("[ProtectedRouteWrapper] Onboarding complete, triggering profile refresh...");
    setRefreshTrigger(prev => prev + 1); 
    // The useEffect will now run again due to refreshTrigger changing, and fetch the updated profile.
  };

  // Add console log before conditions
  console.log(
    "[ProtectedRouteWrapper] Evaluating conditions. AuthLoading:", authLoading, 
    "ProfileLoading:", profileLoading, 
    "User:", !!user, 
    "Profile:", restaurantProfile ? { ...restaurantProfile, data: 'hidden' } : null, // Avoid logging large data object
    "OnboardingCompleted:", restaurantProfile?.onboarding_completed
  );

  if (authLoading || profileLoading) {
    return <div className="flex justify-center items-center h-screen">Loading User Data...</div>; // Or a better spinner
  }

  // If authenticated but profile fetch failed (and wasn't a 401 handled by interceptor)
  if (profileError) {
     return <div className="p-4 text-red-600">Error: {profileError}</div>; 
  }

  // If user exists but restaurant profile doesn't OR onboarding isn't complete
  if (user && (!restaurantProfile || !restaurantProfile.onboarding_completed)) {
    console.log("[ProtectedRouteWrapper] Condition MET: Show Onboarding Wizard. Profile onboarding_completed:", restaurantProfile?.onboarding_completed);
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // If user exists and onboarding is complete, render the main dashboard layout
  if (user && restaurantProfile && restaurantProfile.onboarding_completed) {
    console.log("[ProtectedRouteWrapper] Condition MET: Show Outlet. Profile onboarding_completed:", restaurantProfile.onboarding_completed);
    return <Outlet />; // Renders the nested routes (DashboardLayout etc.)
  }

  // Fallback - should ideally be handled by ProtectedRoute logic in App.js if user is null
  console.warn("[ProtectedRouteWrapper] Fallback: User not authenticated or unexpected state. User:", !!user, "Profile:", !!restaurantProfile, "OnboardingCompleted:", restaurantProfile?.onboarding_completed);
  return <Navigate to="/login" replace />; 
};

export default ProtectedRouteWrapper;
