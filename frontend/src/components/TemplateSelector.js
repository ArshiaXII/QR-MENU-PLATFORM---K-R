import React, { useState, useEffect } from 'react';
import '../styles/TemplateSelector.css';

const PRESET_TEMPLATES = [
    {
        id: 'modern',
        name: 'Modern',
        settings: {
            background_color: '#FFFFFF',
            text_color: '#333333',
            accent_color: '#4A90E2',
            font_family: 'Arial, sans-serif',
            header_text: 'Restaurant Menu',
            layout_type: 'grid'
        },
        thumbnail: 'modern-template.jpg'
    },
    {
        id: 'rustic',
        name: 'Rustic',
        settings: {
            background_color: '#F5F1E9',
            text_color: '#5D4037',
            accent_color: '#8D6E63',
            font_family: 'Georgia, serif',
            header_text: 'Our Menu',
            layout_type: 'list'
        },
        thumbnail: 'rustic-template.jpg'
    },
    {
        id: 'elegant',
        name: 'Elegant',
        settings: {
            background_color: '#F8F8F8',
            text_color: '#2C3E50',
            accent_color: '#9B59B6',
            font_family: 'Times New Roman, serif',
            header_text: 'Fine Dining Menu',
            layout_type: 'grid'
        },
        thumbnail: 'elegant-template.jpg'
    },
    {
        id: 'minimal',
        name: 'Minimal',
        settings: {
            background_color: '#FFFFFF',
            text_color: '#212121',
            accent_color: '#757575',
            font_family: 'Roboto, sans-serif',
            header_text: 'Menu',
            layout_type: 'grid'
        },
        thumbnail: 'minimal-template.jpg'
    },
    {
        id: 'vibrant',
        name: 'Vibrant',
        settings: {
            background_color: '#ECEFF1',
            text_color: '#263238',
            accent_color: '#FF5722',
            font_family: 'Open Sans, sans-serif',
            header_text: 'Taste Our Menu',
            layout_type: 'grid'
        },
        thumbnail: 'vibrant-template.jpg'
    }
];

const TemplateSelector = ({ template, savedTemplates = [], onUpdate, onSave, onLoad, onDelete }) => {
    const [settings, setSettings] = useState({
        background_color: '#ffffff',
        text_color: '#000000',
        accent_color: '#4a90e2',
        font_family: 'Arial, sans-serif',
        header_text: 'Restaurant Menu',
        layout_type: 'grid',
        logo_url: ''
    });
    const [templateName, setTemplateName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('presets');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        if (template) {
            setSettings({
                background_color: template.background_color || '#ffffff',
                text_color: template.text_color || '#000000',
                accent_color: template.accent_color || '#4a90e2',
                font_family: template.font_family || 'Arial, sans-serif',
                header_text: template.header_text || 'Restaurant Menu',
                layout_type: template.layout_type || 'grid',
                logo_url: template.logo_url || ''
            });
        }
    }, [template]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({
            ...settings,
            [name]: value
        });
    };

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
                setSettings({
                    ...settings,
                    logo_url: reader.result // Temporary preview URL
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApply = () => {
        // Create FormData if there's a logo file
        if (logoFile) {
            const formData = new FormData();
            formData.append('logo', logoFile);
            
            // Add all other template settings
            Object.entries(settings).forEach(([key, value]) => {
                if (key !== 'logo_url') { // Don't include the temp preview URL
                    formData.append(key, value);
                }
            });
            
            onUpdate(formData);
        } else {
            onUpdate(settings);
        }
    };

    const handleSaveTemplate = () => {
        if (!templateName.trim()) {
            alert('Please enter a template name');
            return;
        }
        
        onSave(templateName);
        setShowSaveDialog(false);
        setTemplateName('');
    };

    const handleLoadPreset = (presetSettings) => {
        setSettings(presetSettings);
        setLogoPreview('');
        setLogoFile(null);
    };

    const fontOptions = [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Roboto, sans-serif', label: 'Roboto' },
        { value: 'Open Sans, sans-serif', label: 'Open Sans' },
        { value: 'Lato, sans-serif', label: 'Lato' },
        { value: 'Montserrat, sans-serif', label: 'Montserrat' },
        { value: 'Oswald, sans-serif', label: 'Oswald' },
        { value: 'Playfair Display, serif', label: 'Playfair Display' },
        { value: 'Courier New, monospace', label: 'Courier New' }
    ];

    return (
        <div className="template-selector">
            <div className="template-tabs">
                <button 
                    className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('presets')}
                >
                    Preset Templates
                </button>
                <button 
                    className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('custom')}
                >
                    Custom Settings
                </button>
                <button 
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved Templates
                </button>
            </div>

            {activeTab === 'presets' && (
                <div className="template-presets">
                    <div className="template-grid">
                        {PRESET_TEMPLATES.map((t) => (
                            <div
                                key={t.id}
                                className="template-preview"
                                onClick={() => handleLoadPreset(t.settings)}
                                style={{
                                    backgroundColor: t.settings.background_color,
                                    color: t.settings.text_color,
                                    borderColor: t.settings.accent_color
                                }}
                            >
                                <div className="template-preview-header" style={{ backgroundColor: t.settings.accent_color }}>
                                    <h4>{t.name}</h4>
                                </div>
                                <div className="template-preview-content">
                                    <div
                                        className="preview-item"
                                        style={{ borderColor: t.settings.accent_color }}
                                    >
                                        <div className="preview-image"></div>
                                        <div className="preview-text">
                                            <span>Sample Item</span>
                                            <span style={{ color: t.settings.accent_color }}>$9.99</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'custom' && (
                <div className="template-settings">
                    <div className="setting-group">
                        <label htmlFor="header_text">Header Text</label>
                        <input
                            type="text"
                            id="header_text"
                            name="header_text"
                            value={settings.header_text}
                            onChange={handleChange}
                            placeholder="Menu Title"
                        />
                    </div>

                    <div className="setting-group">
                        <label htmlFor="logo">Logo Image</label>
                        <div className="logo-upload">
                            <input
                                type="file"
                                id="logo"
                                name="logo"
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                            {(logoPreview || settings.logo_url) && (
                                <div className="logo-preview">
                                    <img 
                                        src={logoPreview || settings.logo_url} 
                                        alt="Logo Preview" 
                                    />
                                    <button 
                                        onClick={() => {
                                            setLogoPreview('');
                                            setLogoFile(null);
                                            setSettings({
                                                ...settings,
                                                logo_url: ''
                                            });
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="setting-group">
                        <label htmlFor="background_color">Background Color</label>
                        <div className="color-picker">
                            <input
                                type="color"
                                id="background_color"
                                name="background_color"
                                value={settings.background_color}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                value={settings.background_color}
                                onChange={handleChange}
                                name="background_color"
                            />
                        </div>
                    </div>
                    
                    <div className="setting-group">
                        <label htmlFor="text_color">Text Color</label>
                        <div className="color-picker">
                            <input
                                type="color"
                                id="text_color"
                                name="text_color"
                                value={settings.text_color}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                value={settings.text_color}
                                onChange={handleChange}
                                name="text_color"
                            />
                        </div>
                    </div>
                    
                    <div className="setting-group">
                        <label htmlFor="accent_color">Accent Color</label>
                        <div className="color-picker">
                            <input
                                type="color"
                                id="accent_color"
                                name="accent_color"
                                value={settings.accent_color}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                value={settings.accent_color}
                                onChange={handleChange}
                                name="accent_color"
                            />
                        </div>
                    </div>
                    
                    <div className="setting-group">
                        <label htmlFor="font_family">Font Family</label>
                        <select
                            id="font_family"
                            name="font_family"
                            value={settings.font_family}
                            onChange={handleChange}
                        >
                            {fontOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="setting-group">
                        <label htmlFor="layout_type">Layout Type</label>
                        <select
                            id="layout_type"
                            name="layout_type"
                            value={settings.layout_type}
                            onChange={handleChange}
                        >
                            <option value="grid">Grid Layout</option>
                            <option value="list">List Layout</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="saved-templates">
                    {savedTemplates && savedTemplates.length > 0 ? (
                        <div className="saved-templates-list">
                            {savedTemplates.map((t) => (
                                <div key={t.id} className="saved-template-item">
                                    <div 
                                        className="saved-template-color" 
                                        style={{ backgroundColor: t.accent_color }}
                                    ></div>
                                    <span className="saved-template-name">{t.name}</span>
                                    <div className="saved-template-actions">
                                        <button 
                                            className="load-template"
                                            onClick={() => onLoad(t.id)}
                                        >
                                            Load
                                        </button>
                                        <button 
                                            className="delete-template"
                                            onClick={() => {
                                                if (window.confirm(`Delete template "${t.name}"?`)) {
                                                    onDelete(t.id);
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-saved-templates">
                            <p>You don't have any saved templates yet.</p>
                            <p>Customize a template and save it to access it here.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="template-actions">
                <button 
                    className="apply-template-button"
                    onClick={handleApply}
                >
                    Apply Changes
                </button>
                
                <button 
                    className="save-template-button"
                    onClick={() => setShowSaveDialog(true)}
                >
                    Save As New Template
                </button>
            </div>

            {showSaveDialog && (
                <div className="save-template-dialog">
                    <div className="save-template-content">
                        <h3>Save Template</h3>
                        <input
                            type="text"
                            placeholder="Template Name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <div className="save-template-actions">
                            <button onClick={handleSaveTemplate}>Save</button>
                            <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="template-preview">
                <h3>Preview</h3>
                <div
                    className="preview-container"
                    style={{
                        backgroundColor: settings.background_color,
                        color: settings.text_color,
                        fontFamily: settings.font_family
                    }}
                >
                    <div className="preview-header" style={{ backgroundColor: settings.accent_color }}>
                        {settings.logo_url && (
                            <div className="preview-logo">
                                <img src={logoPreview || settings.logo_url} alt="Logo" />
                            </div>
                        )}
                        <h2>{settings.header_text}</h2>
                    </div>
                    <div className={`preview-content ${settings.layout_type}`}>
                        <div className="preview-category">
                            <h3 style={{ color: settings.accent_color }}>Sample Category</h3>
                            <div className="preview-items">
                                <div className="preview-item" style={{ borderColor: settings.accent_color }}>
                                    <div className="preview-image"></div>
                                    <div className="preview-text">
                                        <span className="preview-name">Sample Item</span>
                                        <span className="preview-description">Sample description text for this menu item</span>
                                        <span className="preview-price" style={{ color: settings.accent_color }}>$9.99</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector; 