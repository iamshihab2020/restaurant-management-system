# Restaurant Management System - Backend API

NestJS-based REST API for the Restaurant Management System with MongoDB and JWT authentication.

## Features

- **Authentication**: JWT access tokens + refresh tokens with role-based access control
- **User Management**: Staff and user management with roles (Admin, Manager, Staff, Kitchen)
- **Menu Management**: Menu items, categories, and modifiers
- **Order Management**: Order creation, tracking, and status updates
- **Payment Processing**: Payment handling with multiple payment methods
- **Reservations**: Table booking and reservation management
- **Table Management**: Floor plan and table status tracking
- **Inventory**: Stock management and low stock alerts
- **Customer Management**: Customer profiles and order history
- **Kitchen Display**: Kitchen operations and order queue
- **Reports**: Analytics and reporting

## Tech Stack

- **Framework**: NestJS 11
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Replace `YOUR_PASSWORD_HERE` with your actual database password
   - Update JWT secrets for production

3. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/api/v1`

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run lint` - Lint the code
- `npm run test` - Run tests

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user profile

### Users
- `GET /api/v1/users` - Get all users (Admin/Manager)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user (Admin/Manager)
- `PATCH /api/v1/users/:id` - Update user (Admin/Manager)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Menu
- `GET /api/v1/menu` - Get all menu items (Public)
- `GET /api/v1/menu?category=:category` - Filter by category
- `GET /api/v1/menu/:id` - Get menu item by ID (Public)
- `POST /api/v1/menu` - Create menu item (Admin/Manager)
- `PATCH /api/v1/menu/:id` - Update menu item (Admin/Manager)
- `DELETE /api/v1/menu/:id` - Delete menu item (Admin/Manager)

### Orders
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders?status=:status` - Filter by status
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders` - Create new order
- `PATCH /api/v1/orders/:id` - Update order
- `PATCH /api/v1/orders/:id/status` - Update order status
- `DELETE /api/v1/orders/:id` - Delete order

## User Roles

- **Admin**: Full system access
- **Manager**: Manage users, menu, orders, inventory
- **Staff**: Create and manage orders, customers
- **Kitchen**: View and update order status (kitchen display)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | - |
| JWT_ACCESS_SECRET | JWT access token secret | - |
| JWT_REFRESH_SECRET | JWT refresh token secret | - |
| JWT_ACCESS_EXPIRATION | Access token expiry | 30m |
| JWT_REFRESH_EXPIRATION | Refresh token expiry | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |
| API_PREFIX | API route prefix | api/v1 |

## Database Schema

### Collections
- **users** - System users (staff, managers, admins)
- **menuitems** - Menu items with modifiers and pricing
- **orders** - Customer orders with items and status
- **tables** - Restaurant tables with capacity and status
- **reservations** - Table reservations
- **payments** - Payment records and transactions
- **inventoryitems** - Stock items and inventory
- **customers** - Customer profiles and history

## Security Features

- Password hashing with bcrypt
- JWT authentication with access + refresh tokens
- Role-based access control (RBAC)
- Token blacklisting on logout
- Input validation and sanitization
- CORS configuration

## Development

The project uses:
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Mongoose for MongoDB ODM
- Class-validator for DTO validation

## License

MIT
