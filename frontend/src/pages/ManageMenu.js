import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import API service
import MenuItemForm from '../components/MenuItemForm';
import CategoryEditForm from '../components/CategoryEditForm'; // Import category edit form

const ManageMenu = () => {
  const [categories, setCategories] = useState([]); // Will hold categories with their items nested
  const [uncategorizedItems, setUncategorizedItems] = useState([]);
  const [menuId, setMenuId] = useState(null); // Store the primary menu ID
  const [restaurantId, setRestaurantId] = useState(null); // Store restaurant ID
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState(''); // State for new category input
  const [isAddingCategory, setIsAddingCategory] = useState(false); // State for add category loading
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [targetCategoryId, setTargetCategoryId] = useState(null);
  const [showCategoryEditForm, setShowCategoryEditForm] = useState(false); // State for category edit modal
  const [editingCategory, setEditingCategory] = useState(null); // State for category being edited

  // Fetch initial data (restaurant profile -> menu -> categories/items)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // 1. Fetch restaurant profile to get restaurantId and menuId
        console.log("Fetching restaurant profile...");
        const profileRes = await api.get('/restaurants/me');
        console.log("Profile response:", profileRes.data);

        if (!profileRes.data.restaurant) {
          setError("Please create your restaurant profile in Settings first.");
          setIsLoading(false);
          return;
        }
        const currentRestaurantId = profileRes.data.restaurant.id;
        const currentMenuId = profileRes.data.restaurant.menuId; // Assumes controller returns this
        setRestaurantId(currentRestaurantId);
        console.log(`Restaurant ID: ${currentRestaurantId}, Menu ID: ${currentMenuId}`);

        if (!currentMenuId) {
             console.log("No primary menu found, fetching categories directly.");
             const categoriesRes = await api.get('/categories'); 
             console.log("Categories response (no menu):", categoriesRes.data);
             setCategories(categoriesRes.data.categories || []);
             setUncategorizedItems([]); 
             setMenuId(null);
        } else {
            setMenuId(currentMenuId);
            console.log(`Fetching categories and items for restaurant ID: ${currentRestaurantId} and menu ID: ${currentMenuId}`);

            const categoriesRes = await api.get('/categories');
            console.log("Categories response:", categoriesRes.data);
            const fetchedCategories = categoriesRes.data.categories || [];

            let fetchedItems = [];
            try {
                const itemsRes = await api.get(`/menu/${currentMenuId}/items`); 
                console.log("Items response:", itemsRes.data);
                fetchedItems = itemsRes.data.items || []; 
            } catch (itemsError) {
                 console.error(`Error fetching items for menu ${currentMenuId}:`, itemsError);
            }

            const categoriesWithItems = fetchedCategories.map(category => ({
                ...category,
                items: fetchedItems.filter(item => item.category_id === category.id)
            }));
            const uncategorized = fetchedItems.filter(item => item.category_id === null);

            setCategories(categoriesWithItems);
            setUncategorizedItems(uncategorized);
        }

      } catch (err) {
        console.error("Error fetching menu data:", err);
        setError(err.response?.data?.message || 'Failed to load menu data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); 

  const handleAddCategory = async (e) => {
    e.preventDefault(); 
    if (!newCategoryName.trim()) {
      alert("Please enter a category name.");
      return;
    }
    setIsAddingCategory(true);
    setError(''); 

    try {
      console.log(`Adding category: ${newCategoryName}`);
      // For now, image_path will be null when adding category directly here.
      // It can be added/updated via the Edit Category form.
      const response = await api.post('/categories', { name: newCategoryName, image_path: null });
      if (response.data && response.data.category) {
        setCategories(prev => [...prev, response.data.category].sort((a, b) => {
            const nameA = a?.name || ""; 
            const nameB = b?.name || ""; 
            return nameA.localeCompare(nameB);
          }));
        setNewCategoryName(''); 
        alert('Category added successfully.');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err.response?.data?.message || 'Failed to add category.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleOpenEditCategoryForm = (category) => {
    setEditingCategory(category);
    setShowCategoryEditForm(true);
  };

  const handleCloseCategoryEditForm = () => {
    setShowCategoryEditForm(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = (updatedCategory) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
          .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
    );
    handleCloseCategoryEditForm();
    alert('Category updated successfully.');
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All items within it will become uncategorized.')) {
      return;
    }
    try {
      console.log(`Deleting category ${id}...`);
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      alert('Category deleted successfully.');
    } catch (err) {
      console.error("Error deleting category:", err);
      alert(`Failed to delete category: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const handleOpenAddItemForm = (categoryId) => {
    setEditingItem(null); 
    setTargetCategoryId(categoryId); 
    setShowItemForm(true);
  };

  const handleOpenEditItemForm = (item, categoryId) => {
    setEditingItem(item); 
    setTargetCategoryId(categoryId || item.category_id || null); 
    setShowItemForm(true);
  };

  const handleCloseItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setTargetCategoryId(null);
  };

  const handleSaveItem = (savedItem) => {
     console.log("Item saved:", savedItem);
    if (editingItem) { 
        setCategories(prevCategories =>
            prevCategories.map(cat => {
                if (cat.id === (savedItem.category_id || targetCategoryId)) { 
                    let newItems = (cat.items || []).map(item =>
                        item.id === savedItem.id ? savedItem : item
                    );
                    if (!cat.items?.some(item => item.id === savedItem.id)) {
                        newItems.push(savedItem);
                    }
                    return { ...cat, items: newItems.sort((a, b) => (a?.name || "").localeCompare(b?.name || "")) };
                } else if (cat.id === editingItem.category_id && cat.id !== savedItem.category_id) { 
                    return { ...cat, items: (cat.items || []).filter(item => item.id !== savedItem.id) };
                }
                return cat;
            })
        );
    } else { 
        setCategories(prevCategories =>
            prevCategories.map(cat => {
                if (cat.id === (savedItem.category_id || targetCategoryId)) {
                    return {
                        ...cat,
                        items: [...(cat.items || []), savedItem].sort((a, b) => (a?.name || "").localeCompare(b?.name || "")),
                    };
                }
                return cat;
            })
        );
    }
     handleCloseItemForm();
  };

  const handleDeleteItem = async (itemId) => {
     if (!window.confirm('Are you sure you want to delete this menu item?')) return;
     if (!menuId) {
         alert("Cannot delete item: Menu ID is missing.");
         return;
     }
    try {
      console.log(`Deleting menu item ${itemId} from menu ${menuId}...`);
      await api.delete(`/menu/${menuId}/items/${itemId}`);
      setCategories(prevCategories => prevCategories.map(cat => ({
          ...cat,
          items: (cat.items || []).filter(item => item.id !== itemId)
      })));
      setUncategorizedItems(prevItems => prevItems.filter(item => item.id !== itemId));
      alert('Menu item deleted successfully.');
    } catch (err) {
       console.error("Error deleting menu item:", err);
       alert(`Failed to delete menu item: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading menu...</div>;
  }
  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>;
  }
   if (!restaurantId) {
     return <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
       Could not load restaurant information. Ensure you are logged in and have a profile.
     </div>;
   }

  return (
    <div>
       {showItemForm && (
         <MenuItemForm
           menuId={menuId}
           categoryId={targetCategoryId}
           itemToEdit={editingItem}
           onSave={handleSaveItem}
           onCancel={handleCloseItemForm}
         />
       )}
       {showCategoryEditForm && (
         <CategoryEditForm
           categoryToEdit={editingCategory}
           onSave={handleSaveCategory}
           onCancel={handleCloseCategoryEditForm}
         />
       )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Menu</h2>
      </div>
       <form onSubmit={handleAddCategory} className="mb-8 bg-white p-4 rounded-lg shadow-md flex items-center space-x-3 max-w-md">
         <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name..." required
           className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
         <button type="submit" disabled={isAddingCategory}
           className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50">
           {isAddingCategory ? 'Adding...' : 'Add Category'}
         </button>
       </form>
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start border-b pb-3 mb-4 gap-4">
              <div className="flex items-center space-x-4">
                 {category.image_path && (
                    <img 
                        src={`${api.defaults.baseURL.replace('/api', '')}${category.image_path.startsWith('/') ? category.image_path : `/${category.image_path}`}`} 
                        alt={category.name || 'Category'} 
                        className="w-16 h-16 rounded object-cover shadow-sm" // Added size and shadow
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                 )}
                 <h3 className="text-xl font-semibold text-gray-700">{category.name || 'Unnamed Category'}</h3>
              </div>
              <div className="space-x-2 flex-shrink-0">
                 <button onClick={() => handleOpenAddItemForm(category.id)} disabled={!menuId} title={!menuId ? "Create a menu first" : "Add item to this category"}
                  className={`text-sm bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition duration-300 ${!menuId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Add Item
                </button>
                <button onClick={() => handleOpenEditCategoryForm(category)}
                  className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded transition duration-300">
                  Edit Cat.
                </button>
                <button onClick={() => handleDeleteCategory(category.id)}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition duration-300">
                  Delete Cat.
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {(category.items && category.items.length > 0) ? (
                category.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between border p-4 rounded-md hover:bg-gray-50 transition duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                        {item.image_path ? (
                          <img src={`${api.defaults.baseURL.replace('/api', '')}${item.image_path.startsWith('/') ? item.image_path : `/${item.image_path}`}`} alt={item.name} className="w-full h-full object-cover rounded" onError={(e) => { e.target.style.display = 'none'; }}/>
                        ) : ( 'No Img' )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.description || 'No description'}</p>
                        <p className="text-sm font-medium text-gray-900">${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="space-x-2 flex-shrink-0">
                      <button onClick={() => handleOpenEditItemForm(item, category.id)} disabled={!menuId}
                        className={`text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded transition duration-300 ${!menuId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} disabled={!menuId}
                        className={`text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded transition duration-300 ${!menuId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : ( <p className="text-gray-500 text-sm italic">No items in this category yet.</p> )}
            </div>
          </div>
        ))}
        {uncategorizedItems.length > 0 && (
             <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="border-b pb-3 mb-4">
                 <h3 className="text-xl font-semibold text-gray-700 italic">Uncategorized Items</h3>
                </div>
                <div className="space-y-4">
                {uncategorizedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between border p-4 rounded-md hover:bg-gray-50 transition duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                         {item.image_path ? (
                          <img src={`${api.defaults.baseURL.replace('/api', '')}${item.image_path.startsWith('/') ? item.image_path : `/${item.image_path}`}`} alt={item.name} className="w-full h-full object-cover rounded" onError={(e) => { e.target.style.display = 'none'; }}/>
                        ) : ( 'No Img' )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.description || 'No description'}</p>
                        <p className="text-sm font-medium text-gray-900">${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="space-x-2 flex-shrink-0">
                      <button onClick={() => handleOpenEditItemForm(item, null)} disabled={!menuId}
                        className={`text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded transition duration-300 ${!menuId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} disabled={!menuId}
                        className={`text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded transition duration-300 ${!menuId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ManageMenu;
