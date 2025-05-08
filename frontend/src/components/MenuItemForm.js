import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MenuItemForm = ({ itemToEdit, menuId, categoryId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', // Default language
    description: '', // Default language
    price: '',
    category_id: categoryId || '',
    image_path: null,
    is_available: true, // Default to true for new items
    name_en: '',
    description_en: '',
    name_tr: '',
    description_tr: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || '',
        description: itemToEdit.description || '',
        price: itemToEdit.price || '',
        category_id: itemToEdit.category_id || categoryId || '',
        image_path: itemToEdit.image_path || null,
        is_available: itemToEdit.is_available !== undefined ? itemToEdit.is_available : true,
        name_en: itemToEdit.name_en || '',
        description_en: itemToEdit.description_en || '',
        name_tr: itemToEdit.name_tr || '',
        description_tr: itemToEdit.description_tr || '',
      });
      if (itemToEdit.image_path) {
        setImagePreview(`${api.defaults.baseURL.replace('/api', '')}${itemToEdit.image_path}`);
      } else {
        setImagePreview(null);
      }
    } else {
      // Reset form for adding new item
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: categoryId || '',
        image_path: null,
        is_available: true, // Default for new items
        name_en: '',
        description_en: '',
        name_tr: '',
        description_tr: '',
      });
      setImagePreview(null);
    }
  }, [itemToEdit, categoryId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(itemToEdit?.image_path ? `${api.defaults.baseURL.replace('/api', '')}${itemToEdit.image_path}` : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!menuId) {
        setError("Menu ID is missing. Cannot save item.");
        setIsLoading(false);
        return;
    }
    if (!formData.name.trim()) {
        setError("Default item name is required.");
        setIsLoading(false);
        return;
    }

    try {
        let uploadedImagePath = formData.image_path;

        if (imageFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);
            try {
                const uploadRes = await api.post('/image/upload', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data?.imageData?.path) {
                    uploadedImagePath = uploadRes.data.imageData.path;
                } else {
                    throw new Error("Image upload failed or did not return a valid path.");
                }
            } catch (uploadError) {
                 setError(uploadError.response?.data?.message || 'Image upload failed.');
                 setIsLoading(false);
                 return;
            }
        }

        const itemData = {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price: parseFloat(formData.price) || 0,
            category_id: formData.category_id || null,
            image_path: uploadedImagePath,
            is_available: formData.is_available,
            name_en: formData.name_en.trim() || null,
            description_en: formData.description_en.trim() || null,
            name_tr: formData.name_tr.trim() || null,
            description_tr: formData.description_tr.trim() || null,
        };

        if (itemToEdit) {
            const response = await api.put(`/menu/${menuId}/items/${itemToEdit.id}`, itemData);
            onSave(response.data.item);
        } else {
            const response = await api.post(`/menu/${menuId}/items`, itemData);
            onSave(response.data.item);
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to save item. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40 flex justify-center items-center p-4">
      <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          {itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{error}</p>}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Default Name (e.g., English)</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Default Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
           <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required step="0.01" min="0"
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>

          <hr className="my-4"/>
          <p className="text-sm text-gray-500 mb-2">Translations (Optional)</p>
          
          <div>
            <label htmlFor="name_en" className="block text-sm font-medium text-gray-700">Name (English)</label>
            <input type="text" name="name_en" id="name_en" value={formData.name_en} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="description_en" className="block text-sm font-medium text-gray-700">Description (English)</label>
            <textarea name="description_en" id="description_en" value={formData.description_en} onChange={handleChange} rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>

          <div>
            <label htmlFor="name_tr" className="block text-sm font-medium text-gray-700">Name (Turkish - Türkçe)</label>
            <input type="text" name="name_tr" id="name_tr" value={formData.name_tr} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="description_tr" className="block text-sm font-medium text-gray-700">Description (Turkish - Türkçe)</label>
            <textarea name="description_tr" id="description_tr" value={formData.description_tr} onChange={handleChange} rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
          
          {/* TODO: Add Category Select Dropdown */}

          <div>
            <label htmlFor="itemImage" className="block text-sm font-medium text-gray-700">Image</label>
            {imagePreview && (
              <div className="mt-2 mb-2">
                <img src={imagePreview} alt="Preview" className="h-24 w-auto object-contain rounded" />
              </div>
            )}
            <input type="file" name="itemImage" id="itemImage" accept="image/png, image/jpeg" onChange={handleFileChange}
                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              id="is_available"
              name="is_available"
              type="checkbox"
              checked={formData.is_available}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
              Item is Available
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out">
              {isLoading ? 'Saving...' : (itemToEdit ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;
