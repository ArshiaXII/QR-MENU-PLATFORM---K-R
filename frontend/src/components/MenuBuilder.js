import React, { useReducer, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import CategoryEditor from './CategoryEditor';
import ProductEditor from './ProductEditor';
import TemplateSelector from './TemplateSelector';
import PublicMenuPreview from './PublicMenuPreview';
import '../styles/MenuBuilder.css';

// Initial state for our reducer
const initialState = {
    categories: [],
    selectedCategory: null,
    products: [],
    templates: [],
    activeTemplate: null,
    qrCodeUrl: '',
    previewData: null,
    loading: true,
    error: null,
    selectedProducts: [],
    bulkActionMode: false
};

// Action types
const actionTypes = {
    SET_CATEGORIES: 'SET_CATEGORIES',
    SELECT_CATEGORY: 'SELECT_CATEGORY',
    SET_PRODUCTS: 'SET_PRODUCTS',
    SET_TEMPLATES: 'SET_TEMPLATES',
    SET_ACTIVE_TEMPLATE: 'SET_ACTIVE_TEMPLATE',
    SET_QR_CODE_URL: 'SET_QR_CODE_URL',
    SET_PREVIEW_DATA: 'SET_PREVIEW_DATA',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    TOGGLE_PRODUCT_SELECTION: 'TOGGLE_PRODUCT_SELECTION',
    CLEAR_SELECTED_PRODUCTS: 'CLEAR_SELECTED_PRODUCTS',
    TOGGLE_BULK_MODE: 'TOGGLE_BULK_MODE'
};

// Reducer function
function menuBuilderReducer(state, action) {
    switch (action.type) {
        case actionTypes.SET_CATEGORIES:
            return { ...state, categories: action.payload };
        case actionTypes.SELECT_CATEGORY:
            return { 
                ...state, 
                selectedCategory: action.payload,
                selectedProducts: [],
                bulkActionMode: false
            };
        case actionTypes.SET_PRODUCTS:
            return { ...state, products: action.payload };
        case actionTypes.SET_TEMPLATES:
            return { ...state, templates: action.payload };
        case actionTypes.SET_ACTIVE_TEMPLATE:
            return { ...state, activeTemplate: action.payload };
        case actionTypes.SET_QR_CODE_URL:
            return { ...state, qrCodeUrl: action.payload };
        case actionTypes.SET_PREVIEW_DATA:
            return { ...state, previewData: action.payload };
        case actionTypes.SET_LOADING:
            return { ...state, loading: action.payload };
        case actionTypes.SET_ERROR:
            return { ...state, error: action.payload };
        case actionTypes.TOGGLE_PRODUCT_SELECTION:
            const productId = action.payload;
            const isSelected = state.selectedProducts.includes(productId);
            return {
                ...state,
                selectedProducts: isSelected
                    ? state.selectedProducts.filter(id => id !== productId)
                    : [...state.selectedProducts, productId]
            };
        case actionTypes.CLEAR_SELECTED_PRODUCTS:
            return { ...state, selectedProducts: [] };
        case actionTypes.TOGGLE_BULK_MODE:
            return { 
                ...state, 
                bulkActionMode: !state.bulkActionMode,
                selectedProducts: !state.bulkActionMode ? state.selectedProducts : []
            };
        default:
            return state;
    }
}

const MenuBuilder = () => {
    const [state, dispatch] = useReducer(menuBuilderReducer, initialState);
    const [showQrOptions, setShowQrOptions] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (state.selectedCategory) {
            fetchProducts(state.selectedCategory.id);
        }
    }, [state.selectedCategory]);

    useEffect(() => {
        if (state.categories.length > 0 && state.activeTemplate) {
            updatePreview();
        }
    }, [state.categories, state.activeTemplate, state.products]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            dispatch({ 
                type: actionTypes.SET_CATEGORIES, 
                payload: response.data 
            });
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        } catch (error) {
            console.error('Error fetching categories:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to load categories' 
            });
        }
    };

    const fetchProducts = async (categoryId) => {
        try {
            const response = await axios.get(`/api/products/category/${categoryId}`);
            dispatch({ type: actionTypes.SET_PRODUCTS, payload: response.data });
        } catch (error) {
            console.error('Error fetching products:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to load products' 
            });
        }
    };

    const fetchTemplates = async () => {
        try {
            // Fetch all templates for the restaurant
            const response = await axios.get('/api/templates/all');
            dispatch({ type: actionTypes.SET_TEMPLATES, payload: response.data });
            
            // Get active template
            const activeTemplateResponse = await axios.get('/api/templates/active');
            dispatch({ 
                type: actionTypes.SET_ACTIVE_TEMPLATE, 
                payload: activeTemplateResponse.data 
            });
            
            if (activeTemplateResponse.data) {
                const url = `${window.location.origin}/menu/${activeTemplateResponse.data.restaurant_id}`;
                dispatch({ type: actionTypes.SET_QR_CODE_URL, payload: url });
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to load templates' 
            });
        }
    };

    const updatePreview = async () => {
        try {
            const menuData = await Promise.all(state.categories.map(async (category) => {
                const products = await axios.get(`/api/products/category/${category.id}`);
                return {
                    ...category,
                    products: products.data
                };
            }));
            dispatch({ 
                type: actionTypes.SET_PREVIEW_DATA, 
                payload: { template: state.activeTemplate, menu: menuData } 
            });
        } catch (error) {
            console.error('Error updating preview:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to update preview' 
            });
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(state.categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        dispatch({ type: actionTypes.SET_CATEGORIES, payload: items });

        try {
            await axios.put('/api/categories/order/update', {
                categories: items.map((item, index) => ({
                    id: item.id,
                    display_order: index
                }))
            });
            updatePreview();
        } catch (error) {
            console.error('Error updating category order:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to reorder categories' 
            });
        }
    };

    const handleCategoryAdd = async (categoryData) => {
        try {
            const response = await axios.post('/api/categories', categoryData);
            dispatch({ 
                type: actionTypes.SET_CATEGORIES, 
                payload: [...state.categories, response.data] 
            });
            updatePreview();
        } catch (error) {
            console.error('Error adding category:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to add category' 
            });
        }
    };

    const handleCategoryUpdate = async (id, name, description) => {
        try {
            await axios.put(`/api/categories/${id}`, {
                name,
                description
            });
            const updatedCategories = state.categories.map(cat =>
                cat.id === id ? { ...cat, name, description } : cat
            );
            dispatch({ type: actionTypes.SET_CATEGORIES, payload: updatedCategories });
            updatePreview();
        } catch (error) {
            console.error('Error updating category:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to update category' 
            });
        }
    };

    const handleCategoryDelete = async (categoryId) => {
        try {
            await axios.delete(`/api/categories/${categoryId}`);
            const updatedCategories = state.categories.filter(category => category.id !== categoryId);
            dispatch({ type: actionTypes.SET_CATEGORIES, payload: updatedCategories });
            
            if (state.selectedCategory && state.selectedCategory.id === categoryId) {
                dispatch({ type: actionTypes.SELECT_CATEGORY, payload: null });
                dispatch({ type: actionTypes.SET_PRODUCTS, payload: [] });
            }
            
            updatePreview();
        } catch (error) {
            console.error('Error deleting category:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to delete category' 
            });
        }
    };

    const handleProductAdd = async (productData) => {
        try {
            const formData = new FormData();
            for (const key in productData) {
                formData.append(key, productData[key]);
            }
            
            const response = await axios.post('/api/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            dispatch({ 
                type: actionTypes.SET_PRODUCTS, 
                payload: [...state.products, response.data] 
            });
            
            updatePreview();
        } catch (error) {
            console.error('Error adding product:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to add product' 
            });
        }
    };

    const handleProductUpdate = async (productId, productData) => {
        try {
            const formData = new FormData();
            for (const key in productData) {
                formData.append(key, productData[key]);
            }
            
            const response = await axios.put(`/api/products/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const updatedProducts = state.products.map(product => 
                product.id === productId ? response.data : product
            );
            
            dispatch({ type: actionTypes.SET_PRODUCTS, payload: updatedProducts });
            updatePreview();
        } catch (error) {
            console.error('Error updating product:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to update product' 
            });
        }
    };

    const handleProductDelete = async (productId) => {
        try {
            await axios.delete(`/api/products/${productId}`);
            const updatedProducts = state.products.filter(product => product.id !== productId);
            dispatch({ type: actionTypes.SET_PRODUCTS, payload: updatedProducts });
            
            // Also remove from selected products if it was selected
            if (state.selectedProducts.includes(productId)) {
                dispatch({ type: actionTypes.TOGGLE_PRODUCT_SELECTION, payload: productId });
            }
            
            updatePreview();
        } catch (error) {
            console.error('Error deleting product:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to delete product' 
            });
        }
    };

    const handleBulkDelete = async () => {
        if (state.selectedProducts.length === 0) return;
        
        try {
            await Promise.all(
                state.selectedProducts.map(productId => 
                    axios.delete(`/api/products/${productId}`)
                )
            );
            
            const updatedProducts = state.products.filter(
                product => !state.selectedProducts.includes(product.id)
            );
            
            dispatch({ type: actionTypes.SET_PRODUCTS, payload: updatedProducts });
            dispatch({ type: actionTypes.CLEAR_SELECTED_PRODUCTS });
            updatePreview();
        } catch (error) {
            console.error('Error in bulk delete:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to delete selected products' 
            });
        }
    };

    const handleBulkCategoryChange = async (targetCategoryId) => {
        if (state.selectedProducts.length === 0) return;
        
        try {
            const updates = state.selectedProducts.map(async (productId) => {
                const product = state.products.find(p => p.id === productId);
                return handleProductUpdate(productId, {
                    ...product,
                    category_id: targetCategoryId
                });
            });
            
            await Promise.all(updates);
            dispatch({ type: actionTypes.CLEAR_SELECTED_PRODUCTS });
            fetchProducts(state.selectedCategory.id);
        } catch (error) {
            console.error('Error in bulk category change:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to move selected products' 
            });
        }
    };

    const handleProductToggleAvailability = async (productId, isAvailable) => {
        try {
            await axios.put(`/api/products/${productId}/availability`, { isAvailable });
            
            const updatedProducts = state.products.map(product => 
                product.id === productId 
                    ? { ...product, is_available: isAvailable }
                    : product
            );
            
            dispatch({ type: actionTypes.SET_PRODUCTS, payload: updatedProducts });
            updatePreview();
        } catch (error) {
            console.error('Error updating availability:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to update product availability' 
            });
        }
    };

    const handleTemplateUpdate = async (templateData) => {
        try {
            const response = await axios.post('/api/templates', templateData);
            
            dispatch({ 
                type: actionTypes.SET_ACTIVE_TEMPLATE, 
                payload: response.data 
            });
            
            const url = `${window.location.origin}/menu/${response.data.restaurant_id}`;
            dispatch({ type: actionTypes.SET_QR_CODE_URL, payload: url });
            
            updatePreview();
        } catch (error) {
            console.error('Error updating template:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to update template' 
            });
        }
    };

    const handleSaveTemplate = async (name) => {
        if (!state.activeTemplate) return;
        
        try {
            const templateToSave = {
                ...state.activeTemplate,
                name,
                is_active: false
            };
            
            const response = await axios.post('/api/templates/save', templateToSave);
            
            dispatch({
                type: actionTypes.SET_TEMPLATES,
                payload: [...state.templates, response.data]
            });
        } catch (error) {
            console.error('Error saving template:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to save template' 
            });
        }
    };

    const handleLoadTemplate = async (templateId) => {
        try {
            const response = await axios.put(`/api/templates/${templateId}/activate`);
            
            dispatch({ 
                type: actionTypes.SET_ACTIVE_TEMPLATE, 
                payload: response.data 
            });
            
            const url = `${window.location.origin}/menu/${response.data.restaurant_id}`;
            dispatch({ type: actionTypes.SET_QR_CODE_URL, payload: url });
            
            updatePreview();
        } catch (error) {
            console.error('Error loading template:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to load template' 
            });
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            await axios.delete(`/api/templates/${templateId}`);
            
            const updatedTemplates = state.templates.filter(t => t.id !== templateId);
            dispatch({ type: actionTypes.SET_TEMPLATES, payload: updatedTemplates });
        } catch (error) {
            console.error('Error deleting template:', error);
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: 'Failed to delete template' 
            });
        }
    };

    const downloadQRCode = () => {
        const canvas = document.getElementById('qr-code');
        if (!canvas) return;
        
        const pngUrl = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'restaurant-menu-qr-code.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const copyQrUrl = () => {
        navigator.clipboard.writeText(state.qrCodeUrl)
            .then(() => {
                // Could show a toast message here
                console.log('URL copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy URL:', err);
            });
    };

    const toggleProductSelection = (productId) => {
        if (!state.bulkActionMode) return;
        
        dispatch({ 
            type: actionTypes.TOGGLE_PRODUCT_SELECTION, 
            payload: productId 
        });
    };

    if (state.loading) {
        return <div className="loading">Loading...</div>;
    }

    if (state.error) {
        return <div className="error-message">{state.error}</div>;
    }

    return (
        <div className="menu-builder">
            <div className="sidebar">
                <h2>Categories</h2>
                <CategoryEditor onAdd={handleCategoryAdd} />
                
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="categories">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="category-list"
                            >
                                {state.categories.map((category, index) => (
                                    <Draggable
                                        key={category.id}
                                        draggableId={category.id.toString()}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`category-item ${state.selectedCategory?.id === category.id ? 'selected' : ''}`}
                                                onClick={() => dispatch({ 
                                                    type: actionTypes.SELECT_CATEGORY, 
                                                    payload: category 
                                                })}
                                            >
                                                <span>{category.name}</span>
                                                <div className="category-actions">
                                                    <button
                                                        className="edit-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCategoryUpdate(
                                                                category.id,
                                                                prompt('Category Name', category.name) || category.name,
                                                                prompt('Category Description', category.description) || category.description
                                                            );
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="delete-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Delete category "${category.name}"?`)) {
                                                                handleCategoryDelete(category.id);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <div className="main-content">
                {state.selectedCategory ? (
                    <>
                        <div className="products-header">
                            <h2>Products in {state.selectedCategory.name}</h2>
                            <div className="bulk-actions">
                                <button 
                                    className={`bulk-toggle ${state.bulkActionMode ? 'active' : ''}`}
                                    onClick={() => dispatch({ type: actionTypes.TOGGLE_BULK_MODE })}
                                >
                                    {state.bulkActionMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
                                </button>
                                
                                {state.bulkActionMode && state.selectedProducts.length > 0 && (
                                    <div className="bulk-buttons">
                                        <button
                                            className="bulk-delete"
                                            onClick={() => {
                                                if (window.confirm(`Delete ${state.selectedProducts.length} products?`)) {
                                                    handleBulkDelete();
                                                }
                                            }}
                                        >
                                            Delete Selected
                                        </button>
                                        
                                        <select 
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleBulkCategoryChange(e.target.value);
                                                }
                                            }}
                                            value=""
                                        >
                                            <option value="" disabled>Move to category...</option>
                                            {state.categories
                                                .filter(cat => cat.id !== state.selectedCategory.id)
                                                .map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <ProductEditor
                            categoryId={state.selectedCategory.id}
                            onAdd={handleProductAdd}
                            onUpdate={handleProductUpdate}
                            onDelete={handleProductDelete}
                            onToggleAvailability={handleProductToggleAvailability}
                            products={state.products}
                            bulkMode={state.bulkActionMode}
                            selectedProducts={state.selectedProducts}
                            onProductSelect={toggleProductSelection}
                        />
                    </>
                ) : (
                    <div className="no-category-selected">
                        Select a category to view and manage its products
                    </div>
                )}
            </div>

            <div className="template-sidebar">
                <h2>Menu Template</h2>
                <TemplateSelector
                    template={state.activeTemplate}
                    savedTemplates={state.templates}
                    onUpdate={handleTemplateUpdate}
                    onSave={handleSaveTemplate}
                    onLoad={handleLoadTemplate}
                    onDelete={handleDeleteTemplate}
                />
                
                {state.qrCodeUrl && (
                    <div className="qr-code-section">
                        <div className="qr-header">
                            <h3>Menu QR Code</h3>
                            <button 
                                className="qr-options-toggle"
                                onClick={() => setShowQrOptions(!showQrOptions)}
                            >
                                {showQrOptions ? 'Hide Options' : 'Show Options'}
                            </button>
                        </div>
                        
                        <div className="qr-code-container">
                            <QRCodeCanvas
                                id="qr-code"
                                value={state.qrCodeUrl}
                                size={200}
                                level="H"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                            
                            {showQrOptions && (
                                <div className="qr-options">
                                    <div className="qr-url">
                                        <input 
                                            type="text" 
                                            value={state.qrCodeUrl} 
                                            readOnly
                                        />
                                        <button onClick={copyQrUrl}>Copy</button>
                                    </div>
                                    
                                    <div className="qr-actions">
                                        <button 
                                            className="download-qr-button"
                                            onClick={downloadQRCode}
                                        >
                                            Download QR Code
                                        </button>
                                        
                                        <a 
                                            href={state.qrCodeUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="preview-link"
                                        >
                                            Open Menu in Browser
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {state.previewData && (
                    <div className="menu-preview">
                        <h3>Live Preview</h3>
                        <div className="preview-container">
                            <PublicMenuPreview data={state.previewData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuBuilder; 