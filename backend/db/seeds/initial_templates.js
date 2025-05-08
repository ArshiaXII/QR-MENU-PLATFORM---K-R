/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries from templates table first
  await knex('templates').del()

  const templatesToInsert = [
    // Template 1: Modern Minimal
    { 
      id: 1,
      name: 'Modern Minimal', 
      restaurant_id: null, 
      background_color: '#FFFFFF', 
      text_color: '#1F2937', 
      accent_color: '#4F46E5', 
      font_family: 'Inter, sans-serif', 
      layout_type: 'grid', 
      header_text: 'Menu',
      item_card_style: 'default', 
      category_header_style: 'default', 
      show_category_images: true,
      is_active: false,
      customization_settings: JSON.stringify({
        identifier: 'modern-minimal',
        description: 'A clean, modern, and minimalist design, perfect for a straightforward menu presentation.',
        is_premium: false,
        is_customizable: true,
        base_layout_config: {
          categorySpacing: 'py-6',
          itemSpacing: 'p-3',
          gridColumns: 'sm:grid-cols-2 lg:grid-cols-3',
        },
        style_config: {
          primaryColor: '#4F46E5', // Indigo
          secondaryColor: '#10B981', // Emerald
          priceColor: '#1F2937',
          categoryHeaderBackground: '#F3F4F6', // Tailwind gray-100
          categoryHeaderTextColor: '#1F2937',
          itemCardBackground: '#FFFFFF',
          itemCardTextColor: '#1F2937',
          fontFamily: 'Inter, sans-serif',
          fontSizeBase: '1rem',
          borderRadius: '0.5rem', // 8px
          shadows: 'shadow-md',
          borderColor: '#E5E7EB', // Tailwind gray-200
        }
      })
    },
    // Template 2: Elegant Dark
    { 
      id: 2,
      name: 'Elegant Dark', 
      restaurant_id: null, 
      background_color: '#111827', 
      text_color: '#E5E7EB', 
      accent_color: '#F59E0B', 
      font_family: 'Lora, serif', 
      layout_type: 'list', 
      header_text: 'Our Menu',
      item_card_style: 'minimal', 
      category_header_style: 'simple-underlined', 
      show_category_images: false,
      is_active: false,
      customization_settings: JSON.stringify({
        identifier: 'elegant-dark',
        description: 'A sophisticated dark theme that exudes elegance, suitable for upscale dining.',
        is_premium: false, // Let's make one of the initial ones premium later
        is_customizable: true,
        base_layout_config: {
          categorySpacing: 'py-8',
          itemSpacing: 'py-5',
        },
        style_config: {
          primaryColor: '#F59E0B', // Amber
          secondaryColor: '#60A5FA', // Tailwind blue-400
          priceColor: '#E5E7EB',
          categoryHeaderBackground: 'transparent',
          categoryHeaderTextColor: '#E5E7EB',
          itemCardBackground: '#1F2937', // Tailwind gray-800
          itemCardTextColor: '#E5E7EB',
          fontFamily: 'Lora, serif',
          fontSizeBase: '1.05rem',
          borderRadius: '0.375rem', // 6px
          shadows: 'shadow-lg',
          borderColor: '#374151', // Tailwind gray-700
        }
      })
    },
    // Template 3: Cafe Casual
    { 
      id: 3,
      name: 'Cafe Casual', 
      restaurant_id: null, 
      background_color: '#FEF3C7', 
      text_color: '#4B5563', 
      accent_color: '#8B5CF6', 
      font_family: 'Roboto, sans-serif', 
      layout_type: 'grid', 
      header_text: 'Cafe Menu',
      item_card_style: 'image-top', 
      category_header_style: 'image-bg', 
      show_category_images: true,
      is_active: false,
      customization_settings: JSON.stringify({
        identifier: 'cafe-casual',
        description: 'A friendly and casual theme, great for cafes and bistros.',
        is_premium: false,
        is_customizable: true,
        base_layout_config: {
          categorySpacing: 'py-6',
          itemSpacing: 'p-4',
          gridColumns: 'sm:grid-cols-2',
        },
        style_config: {
          primaryColor: '#8B5CF6', // Purple
          secondaryColor: '#EC4899', // Pink
          priceColor: '#4B5563',
          categoryHeaderBackground: '#FDE68A', // Tailwind yellow-200 (if image-bg is not used)
          categoryHeaderTextColor: '#4B5563',
          itemCardBackground: '#FFFFFF',
          itemCardTextColor: '#4B5563',
          fontFamily: 'Roboto, sans-serif',
          fontSizeBase: '1rem',
          borderRadius: '0.75rem', // 12px
          shadows: 'shadow-md',
          borderColor: '#FDE68A',
        }
      })
    },
    // Template 4: Simple Light (Fallback/Basic)
    { 
      id: 4,
      name: 'Simple Light', 
      restaurant_id: null, 
      background_color: '#FFFFFF', 
      text_color: '#374151', 
      accent_color: '#6B7280', 
      font_family: 'Arial, sans-serif', 
      layout_type: 'list', 
      header_text: 'Menu',
      item_card_style: 'default', 
      category_header_style: 'default', 
      show_category_images: false,
      is_active: false,
      customization_settings: JSON.stringify({
        identifier: 'simple-light',
        description: 'A basic, no-frills light theme for maximum clarity.',
        is_premium: false,
        is_customizable: false, // Less customizable
        base_layout_config: {
          categorySpacing: 'py-4',
          itemSpacing: 'py-2',
        },
        style_config: {
          primaryColor: '#6B7280', // Gray
          secondaryColor: '#9CA3AF', // Lighter Gray
          priceColor: '#374151',
          categoryHeaderBackground: '#F9FAFB', // Tailwind gray-50
          categoryHeaderTextColor: '#374151',
          itemCardBackground: '#FFFFFF',
          itemCardTextColor: '#374151',
          fontFamily: 'Arial, sans-serif',
          fontSizeBase: '0.95rem',
          borderRadius: '0.25rem', // 4px
          shadows: 'shadow-sm',
          borderColor: '#F3F4F6', // Tailwind gray-100
        }
      })
    },
    // Template 5: Premium Modern Dark
    {
      id: 5,
      name: 'Modern Dark (Premium)',
      restaurant_id: null,
      background_color: '#1F2937', 
      text_color: '#D1D5DB', 
      accent_color: '#3B82F6', 
      font_family: 'Inter, system-ui, sans-serif',
      layout_type: 'grid',
      header_text: 'Discover Our Menu',
      item_card_style: 'elevated-dark', 
      category_header_style: 'subtle-accent-border', 
      show_category_images: true,
      is_active: false,
      customization_settings: JSON.stringify({
        identifier: 'modern-dark',
        description: 'A sleek and premium dark theme with modern typography and spacing.',
        is_premium: true,
        is_customizable: true,
        base_layout_config: {
          categorySpacing: 'py-8',
          itemSpacing: 'p-4',
          gridColumns: 'sm:grid-cols-2 md:grid-cols-3',
        },
        style_config: {
          primaryColor: '#3B82F6', // Tailwind blue-500
          secondaryColor: '#10B981', // Emerald Green
          priceColor: '#FBBF24', // Amber
          categoryHeaderBackground: 'transparent',
          categoryHeaderTextColor: '#E5E7EB',
          itemCardBackground: '#374151', // Tailwind gray-700
          itemCardTextColor: '#D1D5DB',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSizeBase: '1rem',
          borderRadius: '0.5rem',
          shadows: 'shadow-xl',
          borderColor: '#4B5563',
        }
      })
    },
    // Template 6: Premium Elegant Light
    {
      id: 6,
      name: 'Elegant Light (Premium)',
      restaurant_id: null,
      background_color: '#F9FAFB', 
      text_color: '#1F2937', 
      accent_color: '#D97706', 
      font_family: 'Playfair Display, serif',
      layout_type: 'list-detailed', 
      header_text: 'Our Culinary Collection',
      item_card_style: 'minimal-light-border',
      category_header_style: 'classic-serif',
      show_category_images: false,
      is_active: false,
      customization_settings: JSON.stringify({
        identifier: 'elegant-light',
        description: 'A sophisticated light theme with elegant typography and refined spacing.',
        is_premium: true,
        is_customizable: true,
        base_layout_config: {
          categorySpacing: 'py-10',
          itemSpacing: 'py-6',
          listLayoutVariant: 'alternating-image',
        },
        style_config: {
          primaryColor: '#D97706', // Tailwind amber-600
          secondaryColor: '#059669', // Green
          priceColor: '#1F2937',
          categoryHeaderBackground: 'transparent',
          categoryHeaderTextColor: '#111827',
          itemCardBackground: '#FFFFFF',
          itemCardTextColor: '#374151',
          fontFamily: 'Playfair Display, serif',
          fontSizeBase: '1.05rem',
          borderRadius: '0.375rem',
          shadows: 'shadow-sm',
          borderColor: '#E5E7EB',
        }
      })
    }
  ];

  // Inserts seed entries
  await knex('templates').insert(templatesToInsert);
};
