import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/ProductEditor.css';

const ProductEditor = ({ categoryId, products, onAdd, onUpdate, onDelete }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.price) return;

        const productData = {
            categoryId,
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price),
            image: formData.image
        };

        if (editingProduct) {
            onUpdate(editingProduct.id, productData);
        } else {
            onAdd(productData);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            image: null
        });
        setIsAdding(false);
        setEditingProduct(null);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(products);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order in the database
        items.forEach((item, index) => {
            onUpdate(item.id, { ...item, display_order: index });
        });
    };

    return (
        <div className="product-editor">
            <button
                className="add-product-button"
                onClick={() => setIsAdding(true)}
            >
                + Add Product
            </button>

            {(isAdding || editingProduct) && (
                <form className="product-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Product name"
                        required
                    />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Product description"
                    />
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Price"
                        min="0"
                        step="0.01"
                        required
                    />
                    <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                    />
                    <div className="product-form-actions">
                        <button type="submit">
                            {editingProduct ? 'Update' : 'Add'}
                        </button>
                        <button type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="products">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="product-list"
                        >
                            {products.map((product, index) => (
                                <Draggable
                                    key={product.id}
                                    draggableId={product.id.toString()}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="product-item"
                                        >
                                            {product.image_path && (
                                                <img
                                                    src={`/uploads/${product.image_path}`}
                                                    alt={product.name}
                                                    className="product-image"
                                                />
                                            )}
                                            <div className="product-details">
                                                <h3>{product.name}</h3>
                                                <p>{product.description}</p>
                                                <span className="price">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="product-actions">
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(product);
                                                        setFormData({
                                                            name: product.name,
                                                            description: product.description,
                                                            price: product.price,
                                                            image: null
                                                        });
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product.id)}
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
    );
};

export default ProductEditor; 