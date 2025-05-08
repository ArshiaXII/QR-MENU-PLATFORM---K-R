import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import the api service
import { useAuth } from '../contexts/AuthContext'; // To potentially update user context if needed
import { Link } from 'react-router-dom'; // Import Link

const RestaurantSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_path: null,
    currency_code: 'USD',
    allow_remove_branding: false, 
    custom_footer_text: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth(); 

  // Fetch restaurant profile on mount
  useEffect(() => {
    const fetchRestaurantProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get('/restaurants/me');
      if (response.data && response.data.restaurant) {
          const { name, description, logo_path, currency_code, allow_remove_branding, custom_footer_text } = response.data.restaurant; 
          setFormData({ 
            name: name || '',
            description: description || '',
            logo_path: logo_path || null, 
            currency_code: currency_code || 'USD', 
            allow_remove_branding: !!allow_remove_branding, 
            custom_footer_text: custom_footer_text || '',
          });
          setLogoPreview(logo_path ? `${api.defaults.baseURL.replace('/api', '')}${logo_path}` : null); 
        } else {
          console.log("No existing restaurant profile found.");
        }
      } catch (err) {
        console.error("Error fetching restaurant profile:", err);
        setError('Failed to load restaurant settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) { 
        fetchRestaurantProfile();
    } else {
        setIsLoading(false); 
    }
  }, [user]); 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      console.log("Logo file selected:", file.name);
    } else {
        setLogoFile(null);
        setLogoPreview(formData.logo_path ? `${api.defaults.baseURL.replace('/api', '')}${formData.logo_path}` : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
        let uploadedLogoPath = formData.logo_path; 

        if (logoFile) {
            console.log("Uploading new logo...");
            const imageFormData = new FormData();
            imageFormData.append('image', logoFile); 

            try {
                const uploadRes = await api.post('/image/upload', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data?.imageData?.path) {
                    uploadedLogoPath = uploadRes.data.imageData.path;
                    console.log("Logo uploaded, path:", uploadedLogoPath);
                } else {
                    throw new Error("Logo upload failed or did not return path.");
                }
            } catch (uploadError) {
                console.error("Error during logo upload:", uploadError);
                setError(uploadError.response?.data?.message || 'Logo upload failed.');
                setIsLoading(false);
                return;
            }
        }

        const updateData = {
            name: formData.name,
            description: formData.description,
            logo_path: uploadedLogoPath, 
            currency_code: formData.currency_code, 
            allow_remove_branding: formData.allow_remove_branding, 
            custom_footer_text: formData.custom_footer_text, 
        };

        console.log("Updating restaurant profile with data:", updateData);

        const response = await api.put('/restaurants/me', updateData);

        if (response.status === 200 && response.data.restaurant) {
            setSuccess('Settings saved successfully!');
            const { name, description, logo_path, currency_code, allow_remove_branding, custom_footer_text } = response.data.restaurant; 
            setFormData({
                name: name || '',
                description: description || '',
                logo_path: logo_path || null,
                currency_code: currency_code || 'USD', 
                allow_remove_branding: !!allow_remove_branding,
                custom_footer_text: custom_footer_text || '',
            });
            setLogoFile(null); 
            setLogoPreview(logo_path ? `${api.defaults.baseURL.replace('/api', '')}${logo_path}` : null); 
        } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      console.error("Error saving restaurant settings:", err);
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading && !formData.name) { 
    return <div className="text-center p-4">Loading settings...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Restaurant Settings</h2>
      <p className="text-gray-600 mb-6">
        Update your restaurant's details and logo.
      </p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6 max-w-2xl mx-0">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Restaurant Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            id="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Currency Selector */}
        <div>
          <label htmlFor="currency_code" className="block text-sm font-medium text-gray-700">Menu Currency</label>
          <select
            id="currency_code"
            name="currency_code"
            value={formData.currency_code}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="TRY">TRY (₺)</option>
            <option value="RUB">RUB (₽)</option>
          </select>
        </div>

        <div>
          <label htmlFor="restaurantLogo" className="block text-sm font-medium text-gray-700">Restaurant Logo</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover"/>
              ) : (
                'No Logo'
              )}
            </div>
            <input
              type="file"
              name="restaurantLogo"
              id="restaurantLogo"
              accept="image/png, image/jpeg"
              onChange={handleLogoChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Upload a new logo (PNG, JPG). Save settings after selecting a new file.</p>
        </div>

        {/* Branding Options */}
        <hr className="my-6"/>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Branding & Footer</h3>
        
        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input
                    id="allow_remove_branding"
                    name="allow_remove_branding"
                    type="checkbox"
                    checked={formData.allow_remove_branding}
                    onChange={handleChange} 
                    disabled={user?.subscription?.plan_type === 'free'} 
                    className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${user?.subscription?.plan_type === 'free' ? 'cursor-not-allowed opacity-50' : ''}`}
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="allow_remove_branding" className={`font-medium ${user?.subscription?.plan_type === 'free' ? 'text-gray-400' : 'text-gray-700'}`}>Remove "Powered by" Branding</label>
                <p className={`text-gray-500 ${user?.subscription?.plan_type === 'free' ? 'text-gray-400' : ''}`}>
                    {user?.subscription?.plan_type === 'free' 
                        ? 'Upgrade to a premium plan to remove branding.' 
                        : 'Allow hiding the default footer branding.'}
                </p>
                 {user?.subscription?.plan_type === 'free' && (
                    <Link to="/dashboard/billing" className="text-xs text-indigo-600 hover:text-indigo-800">Upgrade Plan</Link>
                 )}
            </div>
        </div>

         <div>
          <label htmlFor="custom_footer_text" className="block text-sm font-medium text-gray-700">Custom Footer Text</label>
          <textarea
            name="custom_footer_text"
            id="custom_footer_text"
            rows="2"
            value={formData.custom_footer_text}
            onChange={handleChange}
            placeholder="e.g., Copyright My Restaurant | Address | Phone Number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
           <p className="text-xs text-gray-500 mt-1">Add custom text to the public menu footer.</p>
        </div>


        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantSettings;
