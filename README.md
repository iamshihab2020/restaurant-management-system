# Restaurant Management System

A modern, full-stack restaurant management system with separate frontend and backend architecture.

## Project Structure

```
restaurant-management-system/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   ├── components/ # React components
│   │   ├── services/  # API service layer
│   │   ├── types/     # TypeScript types
│   │   └── lib/       # Utilities and helpers
│   ├── public/        # Static assets
│   └── package.json
│
├── backend/           # NestJS backend API
│   ├── src/
│   │   ├── auth/      # Authentication module
│   │   ├── users/     # User management
│   │   ├── menu/      # Menu management
│   │   ├── orders/    # Order management
│   │   ├── payments/  # Payment processing
│   │   ├── reservations/ # Reservations
│   │   ├── tables/    # Table management
│   │   ├── inventory/ # Inventory tracking
│   │   ├── customers/ # Customer management
│   │   ├── kitchen/   # Kitchen display
│   │   └── reports/   # Analytics
│   └── package.json
│
└── README.md          # This file
```

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand, TanStack Query
- **Animations**: GSAP
- **Icons**: Lucide React
- **Language**: TypeScript

### Backend
- **Framework**: NestJS 11
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator
- **Language**: TypeScript

## Features

✨ **Core Features**:
- User authentication with role-based access control
- Menu management with modifiers and pricing
- Point of Sale (POS) system
- Order management and tracking
- Kitchen display system
- Table and floor plan management
- Reservation system
- Payment processing
- Customer management
- Inventory tracking
- Reports and analytics

🎨 **UI/UX**:
- Modern, responsive design
- Dark/light theme support
- Real-time updates
- Toast notifications
- Drag-and-drop functionality

🔒 **Security**:
- JWT authentication with refresh tokens
- Role-based access control (Admin, Manager, Staff, Kitchen)
- Password hashing
- Protected routes
- CORS configuration

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd restaurant-management-system
```

2. **Setup Backend**
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your MongoDB connection string and JWT secrets

# Start backend
npm run start:dev
```

The backend will run on `http://localhost:3001`

3. **Setup Frontend**
```bash
cd ../frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Start frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Environment Variables

**Backend (.env)**:
```env
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management |
| **Manager** | Manage menu, orders, inventory, reports |
| **Staff** | Create orders, manage customers, POS |
| **Kitchen** | View and update kitchen orders |

## API Documentation

The backend API is available at `http://localhost:3001/api/v1`

Key endpoints:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /menu` - Get menu items
- `POST /orders` - Create order
- `GET /orders` - Get orders
- `POST /payments` - Process payment

See `backend/README.md` for full API documentation.

## Development

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
```

### Backend Development
```bash
cd backend
npm run start:dev  # Start with watch mode
npm run build      # Build for production
npm run lint       # Run ESLint
npm run test       # Run tests
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Railway/Render/Heroku)
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy using your preferred platform

## Scripts

### Root level
```bash
# Install all dependencies
npm install --prefix frontend && npm install --prefix backend

# Start both servers concurrently
npm run dev  # (if you add concurrently)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
