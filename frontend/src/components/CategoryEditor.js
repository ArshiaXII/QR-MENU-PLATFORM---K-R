import React, { useState } from 'react';
import '../styles/CategoryEditor.css';

const CategoryEditor = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        onAdd(name.trim(), description.trim());
        setName('');
        setDescription('');
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <button
                className="add-category-button"
                onClick={() => setIsAdding(true)}
            >
                + Add Category
            </button>
        );
    }

    return (
        <form className="category-editor" onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                required
                autoFocus
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category description (optional)"
            />
            <div className="category-editor-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setIsAdding(false)}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CategoryEditor; 