import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; // Use the configured api service

// Placeholder icons
const SwapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current"><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"/></svg>
);


const PublicMenu = () => {
    const { restaurantSlug } = useParams();
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [selectedLang, setSelectedLang] = useState('en'); // Default language
    const [currentVisitId, setCurrentVisitId] = useState(null);
    const categoryRefs = useRef({});

    // --- Data Fetching & Visit Logging ---
    useEffect(() => {
        const fetchMenuData = async () => {
            if (!restaurantSlug) { setError('Restaurant identifier is missing.'); setLoading(false); return; }
            setLoading(true); setError(null);
            try {
                const response = await api.get(`/menu/public/${restaurantSlug}`);
                if (response.data?.restaurant && response.data?.menu && response.data?.template) {
                    setMenuData(response.data);
                    const firstCategoryId = response.data.menu.categories?.[0]?.id;
                    setActiveCategory(firstCategoryId || null);
                    // Log visit
                    try {
                        const visitResponse = await api.post('/analytics/log-visit', {
                            menuId: response.data.menu.id,
                            restaurantId: response.data.restaurant.id
                        });
                        setCurrentVisitId(visitResponse.data?.visitId || null);
                    } catch (logError) { console.error("Failed to log menu visit:", logError); }
                } else { throw new Error("Invalid menu data structure."); }
            } catch (err) { setError(err.response?.data?.message || 'Failed to load menu.'); }
            finally { setLoading(false); }
        };
        fetchMenuData();
    }, [restaurantSlug]);

    // --- Item View Logging ---
    useEffect(() => {
        if (currentVisitId && !loading && !error && menuData?.menu) {
            const allItemIds = [
                ...(menuData.menu.categories?.flatMap(cat => cat.items?.map(item => item.id)) || []),
                ...(menuData.menu.uncategorizedItems?.map(item => item.id) || [])
            ].filter(id => id != null);

            if (allItemIds.length > 0) {
                allItemIds.forEach(itemId => {
                    api.post('/analytics/log-item-view', { itemId, visitId: currentVisitId })
                       .catch(err => console.error(`[PublicMenu] Failed to log view for item ${itemId}:`, err));
                });
            }
        }
    }, [currentVisitId, loading, error, menuData]); // Re-run if these change

    // --- Handlers ---
    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
        const element = categoryRefs.current[categoryId];
        if (element) {
            const headerOffset = 180; // Adjust as needed
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };
    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleLangChange = (e) => setSelectedLang(e.target.value);

    // --- Localization Helper ---
    const getLocalizedField = (item, fieldName, lang, defaultField) => {
        return item?.[`${fieldName}_${lang}`] || item?.[defaultField] || '';
    };

    // --- Filtering Logic ---
    const filterItems = (items) => {
        if (!searchTerm.trim()) return items || [];
        return (items || []).filter(item => {
            const name = getLocalizedField(item, 'name', selectedLang, 'name');
            const description = getLocalizedField(item, 'description', selectedLang, 'description');
            return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (description && description.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    };

    const filteredCategories = menuData?.menu?.categories?.map(category => ({
        ...category,
        items: filterItems(category.items)
    })).filter(category => category.items.length > 0) || [];

    const filteredUncategorizedItems = filterItems(menuData?.menu?.uncategorizedItems);

    const hasSearchResults = searchTerm.trim().length > 0;
    const noResultsFound = hasSearchResults && filteredCategories.length === 0 && filteredUncategorizedItems.length === 0;

    // --- Render Logic ---

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
                <div className="w-12 h-12 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700">Loading menu...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sorry!</h2>
                <p className="text-red-600 max-w-md mb-2">{error}</p>
                <p className="text-gray-600">Please try again later or contact the restaurant.</p>
            </div>
        );
    }

    // Invalid Data State
    if (!menuData || !menuData.restaurant || !menuData.menu || !menuData.template) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Menu Not Available</h2>
                <p className="text-gray-600">This menu is currently not available or has not been set up.</p>
            </div>
        );
    }

    // Destructure data and apply template settings
    const { restaurant, menu, template } = menuData;
    const categoriesToDisplay = menu.categories || [];
    const uncategorizedItemsToDisplay = menu.uncategorizedItems || [];
    const allItemsEmpty = categoriesToDisplay.every(cat => !cat.items || cat.items.length === 0) && (!uncategorizedItemsToDisplay || uncategorizedItemsToDisplay.length === 0);

    const customSettings = template?.customization_settings || {};
    const backgroundColor = customSettings?.background_color || template?.background_color || '#FFFFFF';
    const textColor = customSettings?.text_color || template?.text_color || '#374151';
    const accentColor = customSettings?.accent_color || template?.accent_color || '#4f46e5';
    const fontFamily = customSettings?.font_family || template?.font_family || 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
    const layoutType = customSettings?.layout_type || template?.layout_type || 'grid';
    const headerText = customSettings?.header_text || template?.header_text || restaurant?.name || 'Menu';
    const logoUrl = template?.logo_url || restaurant?.logo_path;
    const baseApiUrl = api.defaults.baseURL.replace('/api', '');

    // Helper for contrasting text color
    const getContrastingTextColor = (bgColor) => {
        if (!bgColor || bgColor.length < 4) return textColor;
        const color = bgColor.substring(1);
        const rgb = parseInt(color, 16);
        const r = (rgb >> 16) & 0xff; const g = (rgb >> 8) & 0xff; const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 128 ? '#FFFFFF' : '#000000';
    };
    const headerTextColor = getContrastingTextColor(accentColor);
    const categoryNavTextColor = getContrastingTextColor(backgroundColor);
    const categoryActiveTextColor = getContrastingTextColor(accentColor);
    const categoryHeaderBg = customSettings?.category_header_bg || `${accentColor}1A`; // Use accent with low opacity if not set
    const categoryHeaderTextColor = customSettings?.category_header_text_color || accentColor; // Use accent if not set

    // Helper to get currency symbol - DEFINED BEFORE renderItemCard
    const getCurrencySymbol = (code) => {
        switch (code) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'TRY': return '₺';
            case 'RUB': return '₽';
            default: return '$'; // Default to USD symbol
        }
    };
    const currencySymbol = getCurrencySymbol(restaurant?.currency_code);

    // Empty Menu State (after filtering)
    if (allItemsEmpty && !hasSearchResults) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center" style={{ backgroundColor, color: textColor, fontFamily }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: accentColor }}>{headerText}</h2>
                <p>This menu currently has no items.</p>
            </div>
        );
    }

    // --- Render Item Card --- (Helper component for cleaner mapping)
    const renderItemCard = (item) => (
        <div key={item.id} className={`rounded-lg overflow-hidden transition-all duration-300 group relative border flex ${layoutType === 'list' ? 'shadow-sm hover:shadow-lg' : 'flex-col shadow-md hover:shadow-xl hover:scale-[1.01]'} ${!item.is_available ? 'bg-gray-100' : (backgroundColor === '#ffffff' && textColor === '#374151' ? 'bg-white' : '')}`}
            style={!item.is_available ? { borderColor: '#E5E7EB' } : {backgroundColor: backgroundColor === '#ffffff' && textColor === '#374151' ? '#FFF' : (backgroundColor || '#FFF'), borderColor: `${accentColor}33`}}>
            {item.image_path && (
                <div className={`relative ${layoutType === 'list' ? 'w-28 h-28 sm:w-36 sm:h-36' : 'w-full aspect-[4/3]'} flex-shrink-0 bg-gray-200 group-hover:opacity-95 transition-opacity`}>
                    <img src={`${baseApiUrl}${item.image_path.startsWith('/') ? item.image_path : `/${item.image_path}`}`} alt={getLocalizedField(item, 'name', selectedLang, 'name')} className={`w-full h-full object-cover ${!item.is_available ? 'opacity-50 filter grayscale' : ''}`} onError={(e) => e.target.remove()} />
                    {!item.is_available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                            <span className="text-white text-xs font-semibold px-2 py-1 rounded bg-gray-700 bg-opacity-80">Unavailable</span>
                        </div>
                    )}
                </div>
            )}
            <div className={`p-4 sm:p-5 flex-1 flex flex-col ${!item.is_available ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold leading-tight" style={{color: !item.is_available ? '#6B7280' : textColor}}>{getLocalizedField(item, 'name', selectedLang, 'name')}</h3>
                    <span className={`text-base sm:text-lg font-bold whitespace-nowrap ml-2 ${!item.is_available ? 'text-gray-500' : ''}`} style={item.is_available ? {color: accentColor} : {}}>{currencySymbol}{Number(item.price).toFixed(2)}</span>
                </div>
                {getLocalizedField(item, 'description', selectedLang, 'description') && (
                    <p className="text-xs sm:text-sm opacity-90 flex-grow mb-3 leading-snug" style={{color: !item.is_available ? '#6B7280' : textColor}}>
                        {getLocalizedField(item, 'description', selectedLang, 'description')}
                    </p>
                )}
                 {item.is_available && (
                    <div className="flex gap-2 mt-auto pt-2">
                        <button className="text-xs border border-gray-400 rounded px-2 py-1 hover:bg-gray-100" style={{color: textColor}}>Detaylar</button>
                        <button className="text-xs border border-gray-400 rounded px-2 py-1 hover:bg-gray-100" style={{color: textColor}}>Ekstra Ekle</button>
                    </div>
                 )}
            </div>
        </div>
    );

    // --- Main Return ---
    return (
        <div className="min-h-screen flex flex-col w-full" style={{ backgroundColor: backgroundColor, fontFamily }}>
            {/* Header */}
            <header className="flex items-center p-4 sticky top-0 z-30 shadow-sm" style={{ backgroundColor: accentColor, color: headerTextColor }}>
                 {logoUrl && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-md mr-4 bg-white flex items-center justify-center flex-shrink-0">
                        <img src={`${baseApiUrl}${logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`}`} alt={restaurant.name} className="max-h-full max-w-full object-contain" onError={(e) => e.target.remove()} />
                    </div>
                )}
                <div className="flex-1 truncate">
                    <h1 className="text-xl sm:text-2xl font-bold truncate">{headerText}</h1>
                    {restaurant.name && (headerText !== restaurant.name) && <h2 className="text-sm sm:text-base opacity-90 truncate">{restaurant.name}</h2>}
                </div>
                 <div className="ml-2 flex items-center">
                    <select value={selectedLang} onChange={handleLangChange} className="bg-transparent border-none text-sm sm:text-base focus:outline-none focus:ring-0 mr-2 p-1 rounded appearance-none" style={{ color: headerTextColor }} aria-label="Select language">
                        <option value="en" style={{color: '#000', backgroundColor: '#FFF'}}>EN</option>
                        <option value="tr" style={{color: '#000', backgroundColor: '#FFF'}}>TR</option>
                    </select>
                    {/* Search Icon can be added here if needed */}
                </div>
            </header>

            {/* Category Navigation (Mobile Horizontal Scroll) */}
            {categoriesToDisplay.length > 0 && (
                 <nav className="sticky top-[72px] sm:top-[88px] z-20 bg-white shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-gray-200">
                    <ul className="flex px-4 py-3 items-center gap-4">
                        <li className="flex-shrink-0 text-gray-400"><SwapIcon /></li> 
                        {categoriesToDisplay.map(cat => (
                            <li key={cat.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 text-center group" onClick={() => handleCategoryClick(cat.id)}>
                                <div className={`w-16 h-16 rounded-full border-2 p-0.5 transition-all ${activeCategory === cat.id ? 'border-opacity-100 scale-110' : 'border-transparent group-hover:border-opacity-50 group-hover:scale-105'}`} style={{borderColor: accentColor}}>
                                    <img src={cat.image_path ? `${baseApiUrl}${cat.image_path.startsWith('/') ? cat.image_path : `/${cat.image_path}`}` : '/placeholder-category.png'} alt={getLocalizedField(cat, 'name', selectedLang, 'name')} className="w-full h-full object-cover rounded-full" onError={(e) => { e.target.src = '/placeholder-category.png'; }}/>
                                </div>
                                <span className={`text-xs font-medium transition-colors ${activeCategory === cat.id ? 'font-bold' : 'text-gray-600 group-hover:text-gray-900'}`} style={{color: activeCategory === cat.id ? accentColor : textColor}}>
                                    {getLocalizedField(cat, 'name', selectedLang, 'name')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {noResultsFound && ( 
                    <div className="text-center py-10">
                        <p className="text-lg mb-2" style={{color: textColor}}>No menu items match your search "{searchTerm}".</p>
                        <button onClick={() => setSearchTerm('')} className="px-4 py-2 rounded-md text-sm font-medium" style={{backgroundColor: accentColor, color: textColor === accentColor ? (backgroundColor || '#FFF') : textColor}}>Clear Search</button>
                    </div>
                 )}

                {/* Render Categories and Items */}
                {filteredCategories.map(category => (
                    <section ref={el => categoryRefs.current[category.id] = el} key={category.id} id={`category-${category.id}`} className="mb-8 sm:mb-10">
                        {/* Category Title Bar */}
                        <div className="mb-5 p-3 rounded-md" style={{ backgroundColor: categoryHeaderBg }}>
                            <h2 className="text-lg sm:text-xl font-semibold" style={{ color: categoryHeaderTextColor }}>
                                {getLocalizedField(category, 'name', selectedLang, 'name')}
                            </h2>
                        </div>
                        {/* Items within Category */}
                        <div className={` ${layoutType === 'list' ? 'flex flex-col gap-4 sm:gap-5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'}`}>
                            {category.items?.map(item => renderItemCard(item))}
                        </div>
                    </section>
                ))}
                {/* Uncategorized Items Section */}
                {filteredUncategorizedItems.length > 0 && (
                     <section className="mb-8 sm:mb-10 uncategorized-section">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: accentColor }}>Other Items</h2>
                         <div className={`flex flex-col gap-4 ${layoutType === 'grid' ? 'md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6' : ''}`}>
                            {filteredUncategorizedItems.map(item => renderItemCard(item))}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center p-4 sm:p-6 mt-auto" style={{ backgroundColor: accentColor }}>
                {restaurant?.custom_footer_text ? (
                     <p className="text-sm sm:text-base" style={{color: headerTextColor}}>
                        {restaurant.custom_footer_text}
                     </p>
                ) : (
                     <p className="text-sm sm:text-base" style={{color: headerTextColor}}>
                        © {new Date().getFullYear()} {restaurant?.name || 'Restaurant'}. All rights reserved.
                     </p>
                )}
                {/* Conditionally render "Powered by" based on flag */}
                {!restaurant?.allow_remove_branding && (
                    <p className="text-xs sm:text-sm opacity-80 mt-1" style={{color: headerTextColor}}>
                        Powered by QR Menu Platform
                    </p>
                )}
            </footer>
        </div>
    );
};

export default PublicMenu;
