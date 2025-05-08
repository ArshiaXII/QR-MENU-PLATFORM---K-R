const db = require('../db/db'); // Knex instance

// Helper function to safely parse JSON
const parseJsonSettings = (settingsString, templateId) => {
    if (settingsString && typeof settingsString === 'string') {
        try {
            return JSON.parse(settingsString);
        } catch (parseError) {
            console.error(`Error parsing customization_settings for template ID ${templateId}:`, parseError);
            return null; // Return null or empty object on parse error
        }
    }
    return settingsString || null; // Return as is if not a string or already parsed/null
};

class Template {
    // No need for createTable method when using Knex migrations

    static async getById(id, restaurantId) {
        try {
            const query = db('templates').where({ id });
            // If restaurantId is provided, filter by it (for checking ownership)
            if (restaurantId) {
                query.andWhere('restaurant_id', restaurantId);
            }
            const template = await query.first();
            if (template) {
                template.customization_settings = parseJsonSettings(template.customization_settings, template.id);
            }
            return template;
        } catch (error) {
            console.error(`Error getting template by ID ${id} for restaurant ${restaurantId}:`, error);
            throw error;
        }
    }

    static async getActiveByRestaurant(restaurantId) {
         if (!restaurantId) return null;
        try {
            const template = await db('templates')
                .where({ restaurant_id: restaurantId, is_active: true })
                .first();
            if (template) {
                template.customization_settings = parseJsonSettings(template.customization_settings, template.id);
            }
            return template;
        } catch (error) {
            console.error(`Error getting active template for restaurant ${restaurantId}:`, error);
            throw error;
        }
    }

    static async getAllByRestaurant(restaurantId) {
         if (!restaurantId) {
             console.warn('getAllByRestaurant called with null or undefined restaurantId.');
             return [];
         }
        try {
            const templates = await db('templates')
                .where({ restaurant_id: restaurantId })
                .orderBy([
                    { column: 'is_active', order: 'desc' },
                    { column: 'created_at', order: 'desc' }
                ]);
            return templates.map(t => ({
                ...t,
                customization_settings: parseJsonSettings(t.customization_settings, t.id)
            }));
        } catch (error) {
            console.error(`Error getting all templates for restaurant ${restaurantId}:`, error);
            throw error;
        }
    }

    static async getAvailableForRestaurant(restaurantId) {
        try {
            const globalTemplates = await db('templates')
                .whereNull('restaurant_id')
                .orderBy('name');

            let userSpecificTemplates = [];
            if (restaurantId) {
                userSpecificTemplates = await db('templates')
                    .where({ restaurant_id: restaurantId })
                    .orderBy('name');
            }
            
            const allTemplates = [...globalTemplates, ...userSpecificTemplates];
            return allTemplates.map(t => ({
                ...t,
                customization_settings: parseJsonSettings(t.customization_settings, t.id)
            }));
        } catch (error) {
            console.error(`Error getting available templates for restaurant ${restaurantId}:`, error);
            throw error;
        }
    }

    static async create(templateData) {
        const {
            restaurant_id, 
            name,
            background_color = '#ffffff',
            text_color = '#000000',
            accent_color = '#4a90e2',
            font_family = 'Arial, sans-serif',
            header_text = 'Restaurant Menu',
            layout_type = 'grid',
            logo_url = null,
            is_active = false,
            customization_settings = null
        } = templateData;

        if (!name) { 
            throw new Error("Template name is required to create a template.");
        }

        const dataToInsert = {
            restaurant_id, 
            name,
            background_color,
            text_color,
            accent_color,
            font_family,
            header_text,
            layout_type,
            logo_url,
            is_active: is_active ? 1 : 0,
            customization_settings: customization_settings ? JSON.stringify(customization_settings) : null
        };

        try {
            const [newId] = await db('templates').insert(dataToInsert);
            let newTemplate = await db('templates').where({ id: newId }).first();
            if (newTemplate) {
                 newTemplate.customization_settings = parseJsonSettings(newTemplate.customization_settings, newTemplate.id);
            }
            return newTemplate;
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    }

    static async update(id, restaurantIdToVerify, templateData) { 
         const {
            name,
            background_color,
            text_color,
            accent_color,
            font_family,
            header_text,
            layout_type,
            logo_url,
            is_active,
            customization_settings
        } = templateData;

        if (!id || !restaurantIdToVerify) { 
             throw new Error("Template ID and Restaurant ID are required for update.");
        }

        const dataToUpdate = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (background_color !== undefined) dataToUpdate.background_color = background_color;
        if (text_color !== undefined) dataToUpdate.text_color = text_color;
        if (accent_color !== undefined) dataToUpdate.accent_color = accent_color;
        if (font_family !== undefined) dataToUpdate.font_family = font_family;
        if (header_text !== undefined) dataToUpdate.header_text = header_text;
        if (layout_type !== undefined) dataToUpdate.layout_type = layout_type;
        if (logo_url !== undefined) dataToUpdate.logo_url = logo_url;
        if (is_active !== undefined) dataToUpdate.is_active = is_active ? 1 : 0;
        // Stringify customization settings before saving
        if (customization_settings !== undefined) dataToUpdate.customization_settings = customization_settings ? JSON.stringify(customization_settings) : null;


        if (Object.keys(dataToUpdate).length === 0) {
            console.warn(`Template update called for ID ${id} with no data.`);
            return await this.getById(id, restaurantIdToVerify); // Use getById which parses JSON
        }
        dataToUpdate.updated_at = db.fn.now();

        try {
            console.log(`[Template Model] Updating template ID ${id} for restaurant ${restaurantIdToVerify} with data:`, dataToUpdate);
            const updatedCount = await db('templates')
                .where({ id: id, restaurant_id: restaurantIdToVerify })
                .update(dataToUpdate);

            if (updatedCount === 0) {
                 const exists = await this.getById(id, restaurantIdToVerify); // Use getById which parses JSON
                 if (!exists) throw new Error(`Template with ID ${id} not found or does not belong to restaurant ${restaurantIdToVerify}.`);
                 console.warn(`Template update for ID ${id} resulted in 0 rows updated (maybe no change?).`);
                 return exists; // Return existing parsed data if no rows were updated
            }
            
            // Fetch again using getById to ensure JSON is parsed
            let updatedTemplate = await this.getById(id, restaurantIdToVerify); 
            console.log(`[Template Model] Successfully updated and fetched template ID ${id}. Returning:`, updatedTemplate);
            return updatedTemplate;
        } catch (error) {
            console.error(`Error updating template ID ${id}:`, error);
            throw error;
        }
    }

    static async deactivateAllByRestaurant(restaurantId) {
         if (!restaurantId) {
             console.warn('deactivateAllByRestaurant called with null or undefined restaurantId.');
             return 0;
         }
        try {
            return await db('templates')
                .where({ restaurant_id: restaurantId })
                .update({ is_active: 0, updated_at: db.fn.now() });
        } catch (error) {
            console.error(`Error deactivating templates for restaurant ${restaurantId}:`, error);
            throw error;
        }
    }

    static async activate(templateIdToActivate, restaurantId) {
        if (!templateIdToActivate || !restaurantId) {
            throw new Error("Template ID and Restaurant ID are required to activate.");
        }
        try {
            await this.deactivateAllByRestaurant(restaurantId);
            // Fetch template by ID only, don't check restaurant ownership here
            const selectedTemplate = await db('templates').where({ id: templateIdToActivate }).first();

            if (!selectedTemplate) throw new Error(`Template with ID ${templateIdToActivate} not found.`);

            let finalActiveTemplateId = null;

            if (selectedTemplate.restaurant_id === null) { // Global template
                let userSpecificCopy = await db('templates')
                    .where({ restaurant_id: restaurantId, name: selectedTemplate.name }) 
                    .first();

                // Parse settings from global template before copying
                const globalCustomSettings = parseJsonSettings(selectedTemplate.customization_settings, selectedTemplate.id) || {};

                const templateProperties = {
                    name: selectedTemplate.name,
                    background_color: selectedTemplate.background_color,
                    text_color: selectedTemplate.text_color,
                    accent_color: selectedTemplate.accent_color,
                    font_family: selectedTemplate.font_family,
                    header_text: selectedTemplate.header_text,
                    layout_type: selectedTemplate.layout_type,
                    logo_url: selectedTemplate.logo_url, 
                    is_active: true,
                    customization_settings: JSON.stringify(globalCustomSettings), // Copy parsed (or default empty) settings
                    updated_at: db.fn.now()
                };

                if (userSpecificCopy) {
                    await db('templates').where({ id: userSpecificCopy.id }).update(templateProperties);
                    finalActiveTemplateId = userSpecificCopy.id;
                } else {
                    const [newId] = await db('templates').insert({
                        ...templateProperties,
                        restaurant_id: restaurantId,
                        created_at: db.fn.now()
                    });
                    finalActiveTemplateId = newId;
                }
            } else if (selectedTemplate.restaurant_id === restaurantId) { // User's own template
                await db('templates')
                    .where({ id: templateIdToActivate, restaurant_id: restaurantId })
                    .update({ is_active: true, updated_at: db.fn.now() });
                finalActiveTemplateId = templateIdToActivate;
            } else {
                throw new Error(`Template ID ${templateIdToActivate} does not belong to restaurant ID ${restaurantId}.`);
            }
            
            // Fetch the final active template using getById to ensure parsing
            let activeTemplate = await this.getById(finalActiveTemplateId, restaurantId); 
            console.log("[Template Model] Final active template after activation/copy:", activeTemplate);
            return activeTemplate;
        } catch (error) {
            console.error(`Error activating template ID ${templateIdToActivate} for restaurant ${restaurantId}:`, error);
            throw error;
        }
    }

    static async delete(templateId, restaurantId) {
         if (!templateId || !restaurantId) {
             throw new Error("Template ID and Restaurant ID are required for deletion.");
         }
        try {
            const deletedCount = await db('templates')
                .where({ id: templateId, restaurant_id: restaurantId })
                .del();
             if (deletedCount === 0) {
                 throw new Error(`Template with ID ${templateId} not found or does not belong to restaurant ${restaurantId}.`);
             }
            return true;
        } catch (error) {
            console.error(`Error deleting template ID ${templateId}:`, error);
            throw error;
        }
    }
}

module.exports = Template;
