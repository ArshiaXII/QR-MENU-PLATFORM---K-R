import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryEditForm = ({ categoryToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', // Default language
    name_en: '',
    name_tr: '',
    description: '', // Default language
    description_en: '',
    description_tr: '',
    image_path: null, // Existing image path
  });
  const [imageFile, setImageFile] = useState(null); // New image file state
  const [imagePreview, setImagePreview] = useState(null); // Image preview state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        name_en: categoryToEdit.name_en || '',
        name_tr: categoryToEdit.name_tr || '',
        description: categoryToEdit.description || '',
        description_en: categoryToEdit.description_en || '',
        description_tr: categoryToEdit.description_tr || '',
        image_path: categoryToEdit.image_path || null, // Load existing image path
      });
      // Set initial preview from existing image path
      if (categoryToEdit.image_path) {
        setImagePreview(`${api.defaults.baseURL.replace('/api', '')}${categoryToEdit.image_path}`);
      } else {
        setImagePreview(null);
      }
    }
  }, [categoryToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the file object
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // Clear preview if file selection is cancelled, revert to original if editing
      setImageFile(null);
      setImagePreview(categoryToEdit?.image_path ? `${api.defaults.baseURL.replace('/api', '')}${categoryToEdit.image_path}` : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.name.trim()) { // Still validate default name
      setError('Default category name cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
        let uploadedImagePath = formData.image_path; // Keep existing path unless new file uploaded

        // --- Image Upload Logic ---
        if (imageFile) {
            console.log("Uploading new category image...");
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile); // Field name must match multer config ('image')

            try {
                const uploadRes = await api.post('/image/upload', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data?.imageData?.path) {
                    uploadedImagePath = uploadRes.data.imageData.path; // Use the returned path
                    console.log("Category image uploaded, path:", uploadedImagePath);
                } else {
                    throw new Error("Image upload failed or did not return a valid path.");
                }
            } catch (uploadError) {
                 console.error("Error during category image upload request:", uploadError);
                 setError(uploadError.response?.data?.message || 'Image upload failed.');
                 setIsLoading(false); 
                 return; 
            }
        }
        // --- End Image Upload Logic ---

        const payload = {
            name: formData.name.trim(),
            name_en: formData.name_en.trim() || null,
            name_tr: formData.name_tr.trim() || null,
            description: formData.description.trim() || null,
            description_en: formData.description_en.trim() || null,
            description_tr: formData.description_tr.trim() || null,
            image_path: uploadedImagePath, // Include the image path in the payload
        };

        // Use PUT request to update the category
        const response = await api.put(`/categories/${categoryToEdit.id}`, payload);
        onSave(response.data.category); // Pass the updated category back

    } catch (err) {
      console.error("Error updating category:", err);
      setError(err.response?.data?.message || 'Failed to update category.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!categoryToEdit) return null; 

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40 flex justify-center items-center p-4">
      <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Edit Category
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
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
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

          <hr className="my-4"/>
           <div>
            <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700">Category Image</label>
            {imagePreview && (
              <div className="mt-2 mb-2">
                <img src={imagePreview} alt="Preview" className="h-24 w-auto object-contain rounded border p-1" />
              </div>
            )}
            <input type="file" name="categoryImage" id="categoryImage" accept="image/png, image/jpeg" onChange={handleFileChange}
                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>


          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditForm;
