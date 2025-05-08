# QR Menu Platform

A full-stack platform for restaurant owners to create and manage digital menus accessible via QR codes.

## Features

- **Menu Creation & Management**
  - Add/edit/delete/reorder categories and products
  - Bulk operations for efficient menu management
  - Upload product images
  - Toggle product availability

- **Template System**
  - Professional, customizable templates
  - Save and load multiple templates
  - Customize colors, fonts, and layout
  - Upload restaurant logo

- **Real-time Preview**
  - See changes instantly with live preview
  - Customer-facing view within the editor

- **QR Code Generation**
  - Auto-generate QR codes for your menu
  - Download QR as PNG for printing
  - Copy menu URL

- **Public Menu**
  - Mobile-friendly customer view
  - Modern responsive design
  - Search functionality
  - Category navigation

## Technology Stack

- **Backend**
  - Node.js with Express
  - SQLite database
  - JSON Web Token authentication
  - Multer for file uploads

- **Frontend**
  - React 
  - React Router for navigation
  - Axios for API calls
  - React Beautiful DnD for drag-and-drop
  - QRCode.react for QR code generation

## Installation & Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account
3. Create categories and add products
4. Customize your menu template
5. Generate and download your QR code
6. Test the public menu by opening the menu URL or scanning the QR code

## Project Structure

```
qr-menu-platform/
├── backend/
│   ├── db/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── styles/
        ├── App.js
        └── index.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token

### Categories
- `GET /api/categories` - Get all categories for the authenticated user
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category
- `PUT /api/categories/order/update` - Update category order

### Products
- `GET /api/products/category/:categoryId` - Get products for a category
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `PUT /api/products/:id/availability` - Update product availability

### Templates
- `GET /api/templates/active` - Get active template
- `GET /api/templates/all` - Get all templates
- `POST /api/templates` - Create or update active template
- `POST /api/templates/save` - Save a template
- `PUT /api/templates/:id/activate` - Activate a template
- `DELETE /api/templates/:id` - Delete a template

### Public Menu
- `GET /api/menu/:restaurantId` - Get public menu data

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 