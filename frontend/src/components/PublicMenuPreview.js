import React from 'react';
import '../styles/PublicMenuPreview.css';

const PublicMenuPreview = ({ data }) => {
    if (!data || !data.template || !data.menu) {
        return <div className="preview-empty">No preview data available</div>;
    }

    const { template, menu } = data;
    
    // Get template properties with fallbacks
    const backgroundColor = template.background_color || '#ffffff';
    const textColor = template.text_color || '#000000';
    const accentColor = template.accent_color || '#4a90e2';
    const fontFamily = template.font_family || 'Arial, sans-serif';
    const layoutType = template.layout_type || 'grid';

    return (
        <div 
            className="preview-menu"
            style={{
                backgroundColor,
                color: textColor,
                fontFamily
            }}
        >
            <header 
                className="preview-header"
                style={{ backgroundColor: accentColor }}
            >
                <h4 style={{ color: '#ffffff' }}>Restaurant Menu</h4>
            </header>

            <div className={`preview-categories ${layoutType}`}>
                {menu.map(category => (
                    <div key={category.id} className="preview-category">
                        <h5 style={{ color: accentColor }}>{category.name}</h5>
                        {category.description && (
                            <p className="preview-category-description">{category.description}</p>
                        )}
                        
                        <div className="preview-products">
                            {category.products && category.products.length > 0 ? (
                                category.products.map(product => (
                                    <div 
                                        key={product.id} 
                                        className="preview-product"
                                        style={{ borderColor: accentColor }}
                                    >
                                        {product.image_path && (
                                            <div className="preview-product-image">
                                                <div 
                                                    className="image-placeholder"
                                                    style={{ backgroundColor: accentColor + '33' }}
                                                >
                                                    {product.image_path ? 'Image' : 'No Image'}
                                                </div>
                                            </div>
                                        )}
                                        <div className="preview-product-details">
                                            <h6>{product.name}</h6>
                                            {product.description && (
                                                <p className="preview-product-description">{product.description}</p>
                                            )}
                                            <div className="preview-product-price" style={{ color: accentColor }}>
                                                ${Number(product.price).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-products">No products in this category</p>
                            )}
                        </div>
                    </div>
                ))}
                
                {menu.length === 0 && (
                    <div className="no-categories">
                        <p>Add categories and products to see them in the preview</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicMenuPreview; 