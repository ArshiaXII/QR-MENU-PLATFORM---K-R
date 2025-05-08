import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import API service
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import TemplateCustomizationModal from '../components/TemplateCustomizationModal'; // Import the modal

const ManageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [templateToCustomize, setTemplateToCustomize] = useState(null);
  const { user } = useAuth(); 
  const [restaurantSlug, setRestaurantSlug] = useState(null); // State for slug

  // Fetch templates, active template ID, and restaurant slug
  useEffect(() => {
    const fetchTemplateData = async () => {
      setIsLoading(true);
      setError('');
      console.log("[ManageTemplates] Fetching template data. Current user from useAuth():", user); 
      try {
        // Fetch restaurant profile first to get slug
        const profileRes = await api.get('/restaurants/me');
        if (profileRes.data?.restaurant?.slug) {
            setRestaurantSlug(profileRes.data.restaurant.slug);
            console.log("[ManageTemplates] Fetched restaurant slug:", profileRes.data.restaurant.slug);
        } else {
             console.warn("[ManageTemplates] Restaurant slug not found in profile response.");
             // Handle case where slug might be missing - maybe disable preview?
        }

        // Fetch available templates
        const availableTemplatesRes = await api.get('/templates/available');
        setTemplates(availableTemplatesRes.data || []);
        console.log("[ManageTemplates] Fetched available templates:", JSON.stringify(availableTemplatesRes.data, null, 2));

        // Fetch active template
        const activeTemplateRes = await api.get('/templates/active');
        if (activeTemplateRes.data && activeTemplateRes.data.id) {
          setActiveTemplateId(activeTemplateRes.data.id);
          console.log("[ManageTemplates] Fetched active template ID:", activeTemplateRes.data.id);
        } else {
          console.log("[ManageTemplates] No active template found for this user/restaurant.");
          setActiveTemplateId(null);
        }
      } catch (err) {
        console.error("[ManageTemplates] Error fetching template data:", err);
        setError(err.response?.data?.message || 'Failed to load templates. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplateData();
  }, [user]); // Re-fetch if user changes, as user.restaurant_id is key

  const handleSelectTemplate = async (templateId) => {
    console.log("[ManageTemplates] handleSelectTemplate called with templateId:", templateId);
    console.log("[ManageTemplates] current activeTemplateId:", activeTemplateId);

    // Find the selected template to check its restaurant_id
    const selectedTemplateObject = templates.find(t => t.id === templateId);
    if (selectedTemplateObject && selectedTemplateObject.restaurant_id && activeTemplateId === templateId) {
        console.log("[ManageTemplates] This user-specific template is already active. Doing nothing.");
        return;
    }
    // For global templates, we always proceed to allow copying and activation.

    try {
      console.log(`[ManageTemplates] Attempting to activate template ${templateId}...`);
      const response = await api.put(`/templates/${templateId}/activate`); 
      console.log("[ManageTemplates] Activation API response:", response);

      if (response.data && response.data.id) {
        // The backend now returns the (potentially new) user-specific template.
        // Its ID is the one that should be active.
        // The backend returns the activated template (which might be a new copy)
        const activatedTemplate = response.data; 
        setActiveTemplateId(activatedTemplate.id);

        // Refetch the list of available templates to ensure UI consistency
        // This will include the newly created user-specific copy if a global template was activated
        const availableTemplatesRes = await api.get('/templates/available');
        setTemplates(availableTemplatesRes.data || []);
        
        alert(`Template "${activatedTemplate.name}" activated successfully!`);
      } else {
         // Fallback, though backend should always return the activated template
         setActiveTemplateId(templateId); 
         alert(`Template activated successfully! (Response might be missing details)`);
      }
    } catch (err) {
      console.error("[ManageTemplates] Error activating template:", err);
      if (err.response) {
        console.error("[ManageTemplates] Error response data:", err.response.data);
        console.error("[ManageTemplates] Error response status:", err.response.status);
      }
      alert(`Failed to activate template: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const handlePreviewTemplate = (templateId) => {
    alert(`Preview functionality for template ${templateId} to be implemented.`);
  };

  const handleOpenCustomizeModal = (template) => {
    // Ensure user object and restaurant_id are available
    if (!user || user.restaurant_id === undefined) {
        console.error("[ManageTemplates] User or user.restaurant_id is not available for customize check.");
        alert("Cannot determine template ownership. Please ensure you are logged in and have a restaurant profile.");
        return;
    }
    // Only allow customizing templates that are explicitly owned by the user's restaurant
    if (template.restaurant_id && template.restaurant_id === user.restaurant_id) {
      setTemplateToCustomize(template);
      setShowCustomizeModal(true);
    } else {
      alert("Global templates are activated to create a customizable copy. You can customize your active template or other templates you've previously activated/created.");
    }
  };

  const handleCloseCustomizeModal = () => {
    setShowCustomizeModal(false);
    setTemplateToCustomize(null);
  };

  const handleSaveCustomization = (updatedTemplate) => {
    setTemplates(prevTemplates =>
      prevTemplates.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
    if (activeTemplateId === updatedTemplate.id) {
        setActiveTemplateId(updatedTemplate.id); 
    }
    handleCloseCustomizeModal();
    alert('Template customization saved!');
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading templates...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Templates</h2>
      <p className="text-gray-600 mb-6">
        Choose from available templates. Activating a global template creates a customizable copy for your restaurant.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length > 0 ? (
          templates.map((template) => {
            const isUserOwned = template.restaurant_id && user && template.restaurant_id === user.restaurant_id;
            const isActiveUserTemplate = activeTemplateId === template.id && isUserOwned;
            
            // console.log(`Template: ${template.name} (ID: ${template.id}), template.restaurant_id: ${template.restaurant_id}, user?.restaurant_id: ${user?.restaurant_id}, isUserOwned: ${isUserOwned}, isActiveUserTemplate: ${isActiveUserTemplate}`);

            return (
              <div
                key={template.id}
                className={`p-1 rounded-lg shadow border hover:shadow-xl transition-all duration-300 flex flex-col
                  ${isActiveUserTemplate ? 'border-indigo-600 border-2 bg-indigo-50' : 'border-gray-300 bg-white'}
                `}
              >
                <div 
                  className="h-48 mb-3 rounded-md flex flex-col items-center justify-center text-xs overflow-hidden p-2 relative"
                  style={{ 
                    backgroundColor: template.customization_settings?.background_color || template.background_color || '#FFF', 
                    color: template.customization_settings?.text_color || template.text_color || '#000',
                    fontFamily: template.customization_settings?.font_family || template.font_family || 'sans-serif'
                  }}
                >
                  <div className="w-full p-1 rounded-t-sm absolute top-0 left-0" style={{ backgroundColor: template.customization_settings?.accent_color || template.accent_color || '#CCC' }}>
                    <p className="text-xxs truncate" style={{color: (template.customization_settings?.text_color || template.text_color) === (template.customization_settings?.accent_color || template.accent_color) ? (template.customization_settings?.background_color || template.background_color || '#FFF') : (template.customization_settings?.text_color || template.text_color)}}>
                      {template.customization_settings?.header_text || template.header_text || 'Restaurant Name'}
                    </p>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-semibold text-sm">{template.name}</p>
                    <div className="mt-1 space-y-0.5">
                      <div className="h-1.5 w-12 rounded-full" style={{backgroundColor: template.customization_settings?.accent_color || template.accent_color || '#CCC'}}></div>
                      <div className="h-1 w-10 rounded-full" style={{backgroundColor: template.customization_settings?.text_color || template.text_color || '#000', opacity: 0.7}}></div>
                      <div className="h-1 w-12 rounded-full" style={{backgroundColor: template.customization_settings?.text_color || template.text_color || '#000', opacity: 0.5}}></div>
                    </div>
                  </div>
                   <div className="w-full p-1 rounded-b-sm absolute bottom-0 left-0 text-xxs text-center" style={{ backgroundColor: template.customization_settings?.accent_color || template.accent_color || '#CCC', color: (template.customization_settings?.text_color || template.text_color) === (template.customization_settings?.accent_color || template.accent_color) ? (template.customization_settings?.background_color || template.background_color || '#FFF') : (template.customization_settings?.text_color || template.text_color) }}>
                    Footer
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1 px-3">{template.name || `Template ${template.id}`}</h3>
                <p className="text-sm text-gray-500 mb-1 px-3">
                    Type: {template.restaurant_id ? 'Your Template' : 'Global Template'}
                </p>
                <p className="text-sm text-gray-500 mb-4 h-10 px-3">
                    Layout: {template.customization_settings?.layout_type || template.layout_type || 'N/A'}, 
                    Font: {(template.customization_settings?.font_family || template.font_family || 'Default').split(',')[0]}
                </p>
                <div className="flex space-x-2 mt-auto pt-3 px-3 pb-3">
                  <button
                    onClick={() => handlePreviewTemplate(template.id)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded transition duration-300 text-xs sm:text-sm"
                  >
                    Preview
                  </button>
                  {isUserOwned && (
                    <button
                      onClick={() => handleOpenCustomizeModal(template)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded transition duration-300 text-xs sm:text-sm"
                    >
                      Customize
                    </button>
                  )}
                  <button
                    onClick={() => handleSelectTemplate(template.id)}
                    // Disable activating global templates if user is free and already has a custom one
                    disabled={isActiveUserTemplate || (user?.subscription?.plan_type === 'free' && !isUserOwned && templates.some(t => t.restaurant_id === user?.restaurant_id))}
                    title={ (user?.subscription?.plan_type === 'free' && !isUserOwned && templates.some(t => t.restaurant_id === user?.restaurant_id)) ? "Free plan allows only one custom template. Upgrade to activate more." : (isActiveUserTemplate ? "This is your active template" : (isUserOwned ? "Select this template" : "Activate this template (creates a copy)")) }
                    className={`flex-1 font-bold py-2 px-4 rounded transition duration-300 text-sm ${
                      isActiveUserTemplate
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isActiveUserTemplate ? 'Active' : (template.restaurant_id ? 'Select' : 'Activate & Use')}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 italic col-span-full text-center py-8">
            No templates found.
          </p>
        )}
      </div>

      {showCustomizeModal && templateToCustomize && (
        <TemplateCustomizationModal
          templateToEdit={templateToCustomize}
          onSave={handleSaveCustomization}
          onCancel={handleCloseCustomizeModal}
         />
       )}

       {/* Live Preview Section */}
       {restaurantSlug ? (
         <div className="mt-12">
           <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Preview</h3>
           <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-lg" style={{ height: '600px' }}> {/* Adjust height as needed */}
             <iframe
               // Use a key that changes when the active template changes to force iframe reload
               key={activeTemplateId} 
               src={`/menu/${restaurantSlug}`} // Use relative path for iframe within the same app
               title="Public Menu Live Preview"
               className="w-full h-full border-0"
             ></iframe>
           </div>
         </div>
       ) : (
         <div className="mt-12 text-center text-gray-500">
           Set up your restaurant profile in Settings to enable live preview.
         </div>
       )}
    </div>
  );
};

export default ManageTemplates;
