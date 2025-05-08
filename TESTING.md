# Testing Guide for QR Menu Platform

This document provides instructions for testing the core functionality of the QR Menu Platform.

## Prerequisites

Before running the tests, ensure both backend and frontend servers are running:

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```

## Authentication Testing

1. **Registration**
   - Navigate to `/register`
   - Fill in the registration form with a valid email, password, and restaurant name
   - Submit the form
   - Verify you are redirected to the dashboard

2. **Login**
   - Navigate to `/login`
   - Enter valid credentials (email and password)
   - Submit the form
   - Verify you are redirected to the dashboard
   - Confirm the authentication token is stored in local storage

## Menu Builder Testing

### Categories Management

1. **Creating Categories**
   - In the left sidebar, use the "Add Category" form
   - Enter a category name (e.g., "Appetizers") and optional description
   - Click "Add" button
   - Verify the new category appears in the categories list

2. **Editing Categories**
   - Locate a category in the list
   - Click the "Edit" button on the category item
   - Modify the category name or description
   - Verify the changes are reflected in the category list

3. **Reordering Categories**
   - Click and drag a category item to a new position
   - Verify the category order changes accordingly
   - Refresh the page and verify the new order is maintained

4. **Deleting Categories**
   - Click the "Delete" button on a category item
   - Confirm the deletion when prompted
   - Verify the category is removed from the list
   - Check that any products in the category are also removed

### Products Management

1. **Creating Products**
   - Select a category from the left sidebar
   - Use the "Add Product" form in the main content area
   - Enter product details (name, description, price)
   - Optionally upload an image
   - Click "Add" button
   - Verify the new product appears in the products list

2. **Editing Products**
   - Locate a product in the list
   - Click the "Edit" button on the product item
   - Modify product details
   - Click "Save" button
   - Verify the changes are reflected in the product list

3. **Managing Product Availability**
   - Locate a product in the list
   - Toggle the availability switch
   - Verify the product's availability status changes in the UI
   - Check the real-time preview to see how unavailable products appear

4. **Bulk Operations**
   - Click the "Bulk Actions" button
   - Select multiple products using the checkboxes
   - Test "Delete Selected" functionality
   - Test "Move to category" functionality using the dropdown
   - Verify the selected products are properly deleted or moved

### Template Customization

1. **Basic Template Customization**
   - Navigate to the template sidebar
   - Test changing colors (background, text, accent)
   - Modify the font selection
   - Toggle between grid and list layouts
   - Verify changes appear in the real-time preview

2. **Logo Management**
   - Upload a logo image
   - Verify the logo appears in the preview
   - Test removing the logo
   - Verify the preview updates accordingly

3. **Preset Templates**
   - Click the "Preset Templates" tab
   - Select different preset templates
   - Verify the template settings update with preset values
   - Verify the preview reflects the selected preset

4. **Saving and Loading Templates**
   - Customize a template
   - Click "Save As New Template"
   - Enter a template name
   - Verify the template appears in the "Saved Templates" tab
   - Modify current template settings
   - Load the saved template
   - Verify the settings revert to the saved template

### QR Code Testing

1. **QR Code Generation**
   - Verify a QR code is automatically generated
   - Click "Download QR Code" button
   - Verify the QR code downloads as a PNG file
   - Click "Show Options" to reveal additional options
   - Test the "Copy" button to copy the menu URL
   - Test "Open Menu in Browser" button

2. **QR Code Scanning**
   - Use a mobile device to scan the generated QR code
   - Verify it directs to the public menu page
   - Ensure the menu displays correctly on the mobile device

## Public Menu Testing

1. **Basic Functionality**
   - Navigate to `/menu/:restaurantId` (from QR code or directly)
   - Verify all categories and products display correctly
   - Confirm that colors, fonts, and layout match the selected template
   - Test that the logo displays (if one was uploaded)

2. **Navigation**
   - Test the category navigation to ensure it jumps to the correct section
   - Verify that on mobile devices, clicking a category scrolls to that section

3. **Search Functionality**
   - Click the search icon
   - Enter a search term
   - Verify only matching products are displayed
   - Test clearing the search
   - Verify all products return to view

4. **Responsive Design**
   - Test on desktop, tablet, and mobile screen sizes
   - Verify the layout adjusts appropriately for each screen size
   - Confirm that images, text, and navigation remain usable at all sizes

## Common Issues and Troubleshooting

### Backend Issues

- **Database Connection Errors**: Check that SQLite database file exists and has proper permissions
- **Authentication Failures**: Ensure JWT_SECRET is properly set in the .env file
- **Image Upload Problems**: Verify the uploads directory exists and has write permissions

### Frontend Issues

- **API Connection Errors**: Check that the backend server is running and the port matches the frontend's API URL
- **State Management Issues**: Clear local storage and refresh if experiencing unexpected behavior
- **QR Code Not Working**: Ensure the menu URL uses the correct domain and restaurant ID

## Performance Considerations

- **Image Optimization**: Large images may cause slower loading times; consider optimizing before upload
- **Large Menus**: Restaurants with many categories and products may experience slower loading times; consider pagination for extremely large menus

## Security Testing

- **Unauthorized Access**: Attempt to access protected routes without authentication
- **Cross-Site Scripting**: Test input fields with script tags to ensure proper sanitization
- **Data Validation**: Test forms with invalid data to ensure proper validation 