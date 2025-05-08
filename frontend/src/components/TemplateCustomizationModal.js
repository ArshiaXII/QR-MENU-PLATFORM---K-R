import React, { useState, useEffect } from 'react';
import api from '../services/api';
// import { SketchPicker } from 'react-color'; // Will add later

const TemplateCustomizationModal = ({ templateToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', // Template name might also be editable
    background_color: '#FFFFFF',
    text_color: '#000000',
    accent_color: '#4A90E2',
    font_family: 'Arial, sans-serif',
    layout_type: 'grid',
    header_text: 'Restaurant Menu',
    // customization_settings will hold these values in the DB
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (templateToEdit) {
      setFormData({
        name: templateToEdit.name || 'Custom Template',
        background_color: templateToEdit.customization_settings?.background_color || templateToEdit.background_color || '#FFFFFF',
        text_color: templateToEdit.customization_settings?.text_color || templateToEdit.text_color || '#000000',
        accent_color: templateToEdit.customization_settings?.accent_color || templateToEdit.accent_color || '#4A90E2',
        font_family: templateToEdit.customization_settings?.font_family || templateToEdit.font_family || 'Arial, sans-serif',
        layout_type: templateToEdit.customization_settings?.layout_type || templateToEdit.layout_type || 'grid',
        header_text: templateToEdit.customization_settings?.header_text || templateToEdit.header_text || 'Restaurant Menu',
      });
    }
  }, [templateToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // TODO: Add handleColorChange for react-color pickers

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
      name: formData.name, // If name is editable
      // These will be saved into the customization_settings JSON field
      customization_settings: {
        background_color: formData.background_color,
        text_color: formData.text_color,
        accent_color: formData.accent_color,
        font_family: formData.font_family,
        layout_type: formData.layout_type,
        header_text: formData.header_text,
      }
      // Potentially update base template fields if needed, or only customization_settings
      // background_color: formData.background_color, // if directly updating base fields
      // text_color: formData.text_color,
      // accent_color: formData.accent_color,
      // font_family: formData.font_family,
      // layout_type: formData.layout_type,
      // header_text: formData.header_text,
    };

    try {
      // Use the existing template update endpoint. The model now handles customization_settings.
      const response = await api.put(`/templates/${templateToEdit.id}`, payload);
      onSave(response.data); // Pass the full updated template object back
    } catch (err) {
      console.error("Error saving template customization:", err);
      setError(err.response?.data?.message || 'Failed to save customization.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const availableFonts = [
    'Arial, sans-serif',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Georgia, serif',
    'Times New Roman, Times, serif',
    'Courier New, Courier, monospace',
    'Inter, sans-serif', // From a seeded template
    'Lora, serif',       // From a seeded template
    'Roboto, sans-serif'  // From a seeded template
  ];

  if (!templateToEdit) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Customize Template: {templateToEdit.name}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{error}</p>}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Template Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="background_color" className="block text-sm font-medium text-gray-700">Background Color</label>
              <input type="color" name="background_color" id="background_color" value={formData.background_color} onChange={handleChange}
                     className="mt-1 block w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm"/>
              {/* TODO: Replace with SketchPicker */}
            </div>
            <div>
              <label htmlFor="text_color" className="block text-sm font-medium text-gray-700">Text Color</label>
              <input type="color" name="text_color" id="text_color" value={formData.text_color} onChange={handleChange}
                     className="mt-1 block w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="accent_color" className="block text-sm font-medium text-gray-700">Accent Color</label>
              <input type="color" name="accent_color" id="accent_color" value={formData.accent_color} onChange={handleChange}
                     className="mt-1 block w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
                <label htmlFor="font_family" className="block text-sm font-medium text-gray-700">Font Family</label>
                <select name="font_family" id="font_family" value={formData.font_family} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {availableFonts.map(font => <option key={font} value={font}>{font.split(',')[0]}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label htmlFor="header_text" className="block text-sm font-medium text-gray-700">Header Text</label>
            <input type="text" name="header_text" id="header_text" value={formData.header_text} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Layout Type</label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input type="radio" name="layout_type" value="grid" checked={formData.layout_type === 'grid'} onChange={handleChange} className="form-radio h-4 w-4 text-indigo-600 border-gray-300"/>
                <span className="ml-2 text-gray-700">Grid</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="layout_type" value="list" checked={formData.layout_type === 'list'} onChange={handleChange} className="form-radio h-4 w-4 text-indigo-600 border-gray-300"/>
                <span className="ml-2 text-gray-700">List</span>
              </label>
            </div>
          </div>


          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out">
              {isLoading ? 'Saving...' : 'Save Customizations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateCustomizationModal;
