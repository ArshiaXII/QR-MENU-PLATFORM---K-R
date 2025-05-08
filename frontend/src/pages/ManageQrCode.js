import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling'; // Import the new library
import api from '../services/api';
import { Link } from 'react-router-dom';

const dotStyleOptions = ["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"];
const cornerSquareOptions = ["square", "extra-rounded", "dot"];
const cornerDotOptions = ["square", "dot"];

const ManageQrCode = () => {
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [publicMenuUrl, setPublicMenuUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [qrCodeInstance, setQrCodeInstance] = useState(null);
  const qrRef = useRef(null);

  const [qrOptions, setQrOptions] = useState({
    dotsOptions: {
      color: "#4267b2", // Default dot color
      type: "rounded" // Default dot type
    },
    backgroundOptions: {
      color: "#ffffff", // Default background color
    },
    cornersSquareOptions: {
      color: "#000000",
      type: "extra-rounded"
    },
    cornersDotOptions: {
      color: "#000000",
      type: "dot"
    },
    image: '', // Path to logo/image in center
    // imageOptions: {
    //   hideBackgroundDots: true,
    //   imageSize: 0.4,
    //   margin: 4
    // }
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');


  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get('/restaurants/me');
        if (response.data && response.data.restaurant) {
          const restaurant = response.data.restaurant;
          if (restaurant.slug) {
            setRestaurantSlug(restaurant.slug);
            const currentOrigin = window.location.origin;
            const url = `${currentOrigin}/menu/${restaurant.slug}`;
            setPublicMenuUrl(url);
            // Set initial logo for QR code if restaurant has one
            if (restaurant.logo_path) {
              const fullLogoUrl = `${api.defaults.baseURL.replace('/api', '')}${restaurant.logo_path.startsWith('/') ? restaurant.logo_path : `/${restaurant.logo_path}`}`;
              setQrOptions(prev => ({ ...prev, image: fullLogoUrl }));
              setLogoPreview(fullLogoUrl);
            }
          } else {
            setError('Restaurant slug not found. Please set up your restaurant in Settings.');
          }
        } else {
          setError('Restaurant profile not found. Please set up your restaurant in Settings.');
        }
      } catch (err) {
        console.error("Error fetching restaurant data:", err);
        setError('Failed to load restaurant data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurantData();
  }, []);

  useEffect(() => {
    if (!publicMenuUrl || !qrRef.current) return;

    const defaultQrOptions = {
        width: 280,
        height: 280,
        data: publicMenuUrl,
        margin: 10,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q"
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 6,
            crossOrigin: "anonymous", // Important for downloading with image from different origin
        },
        dotsOptions: {
            color: "#4267b2", // Default dot color
            type: "rounded"
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        cornersSquareOptions: {
            color: "#000000",
            type: "extra-rounded"
        },
        cornersDotOptions: {
            color: "#000000",
            type: "dot"
        }
    };
    
    const qrInstance = new QRCodeStyling({...defaultQrOptions, ...qrOptions});
    
    // Clear previous QR code before appending new one
    qrRef.current.innerHTML = ''; 
    qrInstance.append(qrRef.current);
    setQrCodeInstance(qrInstance);

  }, [publicMenuUrl, qrOptions]);

  const handleQrOptionChange = (optionType, value) => {
    setQrOptions(prev => ({
      ...prev,
      [optionType]: { ...prev[optionType], ...value }
    }));
  };
  
  const handleDotStyleChange = (e) => {
    handleQrOptionChange('dotsOptions', { type: e.target.value });
  };

  const handleCornerSquareChange = (e) => {
    handleQrOptionChange('cornersSquareOptions', { type: e.target.value });
  };
  
  const handleCornerDotChange = (e) => {
    handleQrOptionChange('cornersDotOptions', { type: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result); // Show local preview
        setQrOptions(prev => ({ ...prev, image: reader.result })); // Update QR with local preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (extension) => {
    if (qrCodeInstance) {
      qrCodeInstance.download({ name: `${restaurantSlug || 'qr-menu'}-code`, extension });
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading QR Code data...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Menu QR Code</h2>

      {publicMenuUrl ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center space-y-4">
            <div ref={qrRef} className="p-2 border rounded-lg inline-block bg-white shadow-sm">
              {/* QR Code will be appended here by the library */}
            </div>
            <p className="text-gray-600 text-center text-sm">
              Scan this QR code to view your public menu.
            </p>
            <Link
              to={`/menu/${restaurantSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Preview Public Menu
            </Link>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Customize QR Code</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dotColor" className="block text-sm font-medium text-gray-700">Dot Color</label>
                <input type="color" id="dotColor" value={qrOptions.dotsOptions.color} onChange={(e) => handleQrOptionChange('dotsOptions', { color: e.target.value })} className="mt-1 block w-full h-10"/>
              </div>
              <div>
                <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700">Background Color</label>
                <input type="color" id="bgColor" value={qrOptions.backgroundOptions.color} onChange={(e) => handleQrOptionChange('backgroundOptions', { color: e.target.value })} className="mt-1 block w-full h-10"/>
              </div>
            </div>

            <div>
              <label htmlFor="dotStyle" className="block text-sm font-medium text-gray-700">Dot Style</label>
              <select id="dotStyle" value={qrOptions.dotsOptions.type} onChange={handleDotStyleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {dotStyleOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
              </select>
            </div>
            
            {/* More customization options can be added here for corners etc. */}
            {/* Example for Corner Square Options */}
            {/* <div>
              <label htmlFor="cornerSquareType" className="block text-sm font-medium text-gray-700">Corner Square Style</label>
              <select id="cornerSquareType" value={qrOptions.cornersSquareOptions?.type || 'square'} onChange={handleCornerSquareChange} className="mt-1 block w-full ...">
                {cornerSquareOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div> */}


            <div>
              <label htmlFor="qrLogo" className="block text-sm font-medium text-gray-700">Logo in Center (Optional)</label>
              <input type="file" id="qrLogo" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
              {logoPreview && <img src={logoPreview} alt="Logo preview" className="mt-2 h-16 w-16 object-contain border p-1"/>}
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={() => handleDownload('png')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Download PNG</button>
              <button onClick={() => handleDownload('svg')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">Download SVG</button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">
          Could not generate QR code. Ensure your restaurant profile and slug are set up correctly in Settings.
        </p>
      )}
    </div>
  );
};

export default ManageQrCode;
