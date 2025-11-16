# Restaurant Management System

A modern, feature-rich restaurant management system built with Next.js 16, TypeScript, and Tailwind CSS. This application provides comprehensive tools for managing restaurant operations including POS, table management, kitchen display, inventory tracking, and analytics.

## 🚀 Project Status

**Frontend Complete** - Fully functional frontend with mock data integration ready for backend API connection.

## ✨ Features

### 1. Authentication & Authorization
- **Role-Based Access Control (RBAC)**: Five distinct user roles (Admin, Manager, Waiter, Kitchen Staff, Cashier)
- **Secure Login System**: Form validation with animated UI feedback
- **Persistent Sessions**: Zustand-based state management with localStorage persistence
- **Protected Routes**: Automatic redirection for unauthorized access

### 2. Dashboard & Analytics
- **Real-time Statistics**: Total revenue, orders, active orders, table occupancy
- **Revenue Charts**: Interactive line charts showing daily/weekly/monthly trends
- **Popular Items**: Visual display of best-selling menu items with order counts
- **Order Status Distribution**: Pie charts showing order workflow states
- **Performance Metrics**: Average order value, table turnover, and more

### 3. Point of Sale (POS) System
- **Interactive Menu Browser**: Grid view with search, categories, and filtering
- **Order Building**: Add/remove items with quantity adjustments
- **Smart Pricing**: Automatic subtotal, tax (10%), discount, and tip calculations
- **Hold Orders**: Save incomplete orders for later retrieval
- **Quick Actions**: Keyboard shortcuts for common operations
- **Payment Processing**:
  - Multiple payment methods (Cash, Credit Card, Debit Card, Mobile Payment)
  - Cash change calculator
  - Split bill functionality with per-person or custom splits
  - Automatic receipt generation
- **Print Receipts**: Browser-based printing with formatted receipts

### 4. Table Management
- **Visual Table Grid**: Color-coded status indicators
  - Green: Available
  - Blue: Occupied
  - Yellow: Reserved
  - Gray: Cleaning
- **Table Details**: Capacity, location (Indoor/Outdoor/VIP), current order
- **Quick Status Changes**: One-click status updates
- **Reservation Assignment**: Link reservations to tables
- **Search & Filter**: Find tables by number, capacity, or location

### 5. Order Management
- **Comprehensive Order List**: Sortable, filterable order display
- **Status Workflow**: pending → confirmed → preparing → ready → served → completed
- **Order Details Modal**: Full order information with items, pricing, and history
- **Real-time Updates**: Live order status changes
- **Order History**: Complete audit trail of status changes with timestamps
- **Quick Actions**: Update status, view details, manage orders

### 6. Kitchen Display System (KDS)
- **Active Orders View**: Real-time display of orders in preparation
- **Order Queue**: Organized by status (New, Preparing, Ready)
- **Item-Level Tracking**: Individual menu items with preparation status
- **Timer Display**: Order age tracking for time management
- **Quick Status Updates**: Touch-friendly buttons for kitchen staff
- **Preparation Priority**: Visual indicators for order urgency
- **Order Details**: Table number, special instructions, allergen warnings

### 7. Menu Management
- **Full CRUD Operations**: Create, Read, Update, Delete menu items
- **Category Management**: Appetizers, Main Course, Desserts, Beverages, Specials
- **Rich Item Details**:
  - Name, description, pricing
  - Category and availability toggle
  - Preparation time
  - Dietary information (Vegetarian, Vegan, Gluten-Free)
  - Ingredients and allergen warnings
  - Image upload support
- **Search & Filter**: Find items by name, category, or dietary restrictions
- **Bulk Actions**: Enable/disable multiple items
- **Visual Cards**: Image thumbnails with key information

### 8. Reservations System
- **Booking Management**: Create, view, update, and cancel reservations
- **Customer Information**: Name, phone, email, party size
- **Status Tracking**: Pending → Confirmed → Seated → Completed/Cancelled/No Show
- **Table Assignment**: Link reservations to specific tables
- **Time Slot Management**: Date and time picker for bookings
- **Special Requests**: Notes field for dietary requirements or preferences
- **Calendar View**: Daily reservation overview
- **Search & Filter**: Find reservations by customer name, date, or status

### 9. Payment Processing
- **Transaction History**: Complete payment records with timestamps
- **Multiple Payment Methods**: Support for cash, cards, and mobile payments
- **Payment Details**:
  - Order information and breakdown
  - Tip tracking
  - Transaction IDs
  - Processor information (Cashier/Staff)
- **Receipt Generation**: Printable receipts with order details
- **Refund Support**: Status tracking for refunds
- **Payment Analytics**: Revenue tracking and payment method distribution

### 10. User Management (Admin)
- **Staff Directory**: View all system users
- **Role Management**: Assign and modify user roles
- **User Profiles**: Name, email, phone, role, status
- **Activity Tracking**: User creation and update timestamps
- **Account Control**: Activate/deactivate user accounts
- **Avatar Support**: Profile pictures for personalization
- **Search & Filter**: Find users by name, role, or status

### 11. Inventory Management
- **Stock Tracking**: Monitor ingredient and supply levels
- **Low Stock Alerts**: Visual warnings for items below threshold
- **Supplier Management**: Track vendors and purchasing
- **Unit Management**: Support for various measurement units
- **Reorder Levels**: Automatic low-stock notifications
- **Stock History**: Track inventory changes over time
- **Search & Filter**: Find items by name, category, or stock status

### 12. Reports & Analytics
- **Sales Reports**: Daily, weekly, monthly revenue analysis
- **Performance Metrics**:
  - Total orders and revenue
  - Average order value
  - Peak hours analysis
  - Payment method distribution
- **Top Selling Items**: Best performers by quantity and revenue
- **Interactive Charts**: Recharts-powered visualizations
- **Date Range Filters**: Custom period selection
- **Export Options**: Download reports as PDF/CSV (planned)
- **Staff Performance**: Individual user metrics and productivity

### 13. Customer Management
- **Customer Database**: Store customer profiles and preferences
- **Order History**: Track customer purchase patterns
- **Loyalty Programs**: Points and rewards tracking (planned)
- **Contact Information**: Phone, email, address
- **Preferences**: Dietary restrictions, favorite items
- **Visit History**: Frequency and spending patterns

### 14. Settings & Configuration
- **System Settings**: Restaurant name, address, contact information
- **Tax Configuration**: Adjustable tax rates
- **Receipt Settings**: Customize receipt format and content
- **Theme Customization**: Light/dark mode with next-themes
- **User Preferences**: Personal settings and notifications
- **Backup & Restore**: Data export/import functionality (planned)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router and Turbopack
- **React 19** - Latest React with improved performance
- **TypeScript 5.9** - Type-safe development with strict mode
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom animations
- **Zustand 5.0** - Lightweight state management with persistence
- **TanStack Query 5.90** - Powerful data synchronization and caching
- **Radix UI** - Accessible, unstyled component primitives
- **Lucide React** - Beautiful, consistent icon library
- **date-fns 4.1** - Modern date utility library
- **Recharts 2.15** - Composable charting library
- **GSAP 3.13** - Professional-grade animation library
- **Sonner** - Toast notifications with beautiful design
- **next-themes 0.4** - Perfect dark mode support
- **@dnd-kit** - Modern drag-and-drop toolkit

### UI Components
- **shadcn/ui** - Re-usable components built with Radix UI and Tailwind
- **React Day Picker** - Flexible date picker component
- **class-variance-authority** - Type-safe component variants
- **tailwind-merge** - Efficient Tailwind class merging
- **tailwindcss-animate** - Animation utilities for Tailwind

### Backend (Ready for Integration)
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud NoSQL database
- **Prisma/Mongoose** - Database ORM/ODM
- **NextAuth.js** - Authentication solution
- **Pusher/Socket.io** - Real-time WebSocket communication
- **Cloudinary** - Image hosting and optimization
- **Stripe** - Payment processing integration

## 📁 Project Structure

```
restaurant-management-system/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/              # Auth routes (login, register)
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── api/                 # API routes
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   └── features/            # Feature-specific components
│   ├── lib/
│   │   ├── mock-data/           # Mock data for development
│   │   │   ├── users.ts
│   │   │   ├── tables.ts
│   │   │   ├── menu-items.ts
│   │   │   └── orders.ts
│   │   ├── stores/              # Zustand stores
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Utility functions
│   │       └── cn.ts            # Tailwind class merger
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🗂️ Data Models

### User
- Roles: admin, manager, waiter, kitchen, cashier
- Authentication and authorization
- Profile information and avatar

### Table
- Table number, capacity, and location
- Status: available, occupied, reserved, cleaning
- Current order tracking

### MenuItem
- Categories: appetizer, main_course, dessert, beverage, special
- Pricing, images, and availability
- Dietary information (vegetarian, vegan, gluten-free)
- Preparation time and ingredients

### Order
- Order status workflow: pending → confirmed → preparing → ready → served → completed
- Multiple order items with quantities
- Customer information
- Pricing with tax and discounts

### OrderItem
- Individual items within an order
- Item-level status tracking
- Special instructions
- Prepared by (kitchen staff tracking)

## 🚦 Getting Started

### Prerequisites
- **Node.js** 18.17 or higher
- **npm** 9.0 or higher (or **yarn** / **pnpm**)
- **Git** for version control
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/restaurant-management-system.git
   cd restaurant-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   Or using yarn:
   ```bash
   yarn install
   ```

   Or using pnpm:
   ```bash
   pnpm install
   ```

3. **Environment Setup** (Optional for now)

   Create a `.env.local` file in the root directory:
   ```env
   # Required for production with backend
   DATABASE_URL="your_mongodb_connection_string"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000"

   # Optional services
   PUSHER_APP_ID="your_pusher_app_id"
   PUSHER_KEY="your_pusher_key"
   PUSHER_SECRET="your_pusher_secret"
   PUSHER_CLUSTER="your_pusher_cluster"

   CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
   CLOUDINARY_API_KEY="your_cloudinary_key"
   CLOUDINARY_API_SECRET="your_cloudinary_secret"
   ```

   **Note**: Environment variables are not required for the current frontend-only version as it uses mock data.

4. **Run development server**
   ```bash
   npm run dev
   ```

   The application will start on [http://localhost:3000](http://localhost:3000)

5. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |

### First Time Setup

1. **Access the application**: Navigate to http://localhost:3000
2. **Login**: Use any of the demo credentials (see below)
3. **Explore**: Navigate through different modules based on your role
4. **Test features**: Try creating orders, managing tables, processing payments

### Development Workflow

1. **Code Changes**: Edit files in `src/` directory
2. **Hot Reload**: Changes automatically reflect in browser
3. **Type Checking**: TypeScript provides real-time error detection
4. **Build Test**: Run `npm run build` before committing
5. **Commit**: Use meaningful commit messages

## 👥 Demo Users

For testing purposes, use these credentials (any password with 6+ characters):

| Role     | Email                      | Password    | Access Features |
|----------|----------------------------|-------------|-----------------|
| **Admin**    | admin@restaurant.com   | password123 | Full system access, user management, reports |
| **Manager**  | manager@restaurant.com | password123 | All operations, reports, inventory |
| **Waiter**   | waiter@restaurant.com  | password123 | POS, tables, orders, reservations |
| **Kitchen**  | kitchen@restaurant.com | password123 | Kitchen display, order status updates |
| **Cashier**  | cashier@restaurant.com | password123 | POS, payments, receipt printing |

### Role-Based Features

- **Admin**: Can access all modules including user management, system settings, and comprehensive reports
- **Manager**: Has full operational access except user role management
- **Waiter**: Focused on front-of-house operations (POS, tables, orders)
- **Kitchen**: Specialized for kitchen operations with simplified interface
- **Cashier**: Payment processing and POS operations

## 📊 Mock Data

The application uses comprehensive mock data for development and testing:

- **6 Users**: One for each role with realistic profiles
- **10 Tables**: Various capacities (2-8 seats) and locations (Indoor, Outdoor, VIP)
- **24 Menu Items**: Diverse menu across all categories with images and pricing ($8-$45)
- **Multiple Orders**: Sample orders in different states for testing workflows
- **Payment Records**: Transaction history with various payment methods
- **Reservations**: Sample bookings with different statuses

All mock data is located in `src/lib/mock-data/` and can be easily customized.

## 🎨 Design & UI

### Theme System
- **Dark/Light Mode**: Seamless theme switching with persistence
- **Color Scheme**: Professional palette optimized for restaurant operations
- **Responsive Design**: Mobile-first approach with tablet and desktop optimizations
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

### Component Library
Built with **shadcn/ui** components:
- Buttons, Cards, Dialogs, Dropdowns
- Form inputs with validation
- Data tables with sorting and filtering
- Charts and visualizations
- Toast notifications
- Loading states and skeletons

### Animations
- **GSAP**: Smooth page transitions and micro-interactions
- **CSS Transitions**: Hover effects and state changes
- **Loading States**: Skeleton screens and progress indicators

## 🏗️ Architecture

### State Management
- **Zustand**: Global state for authentication and app-wide data
- **TanStack Query**: Server state management and caching
- **Local Storage**: Persistent auth sessions

### Data Flow
```
Mock Data → Services → React Query → Components → UI
                ↓
         Zustand Store (Auth, Settings)
```

### Folder Structure Best Practices
- **Co-location**: Components near their usage
- **Separation of Concerns**: UI, logic, and data layers
- **Type Safety**: Comprehensive TypeScript types
- **Reusability**: Shared components and utilities

## 🔐 Security Features

### Current Implementation
- **Password Validation**: Minimum length requirements
- **Protected Routes**: Authentication checks on all dashboard routes
- **Role-Based Access**: Feature restrictions based on user role
- **XSS Prevention**: React's built-in protection
- **Input Sanitization**: Form validation and sanitization

### Planned for Production
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **HTTPS Only**: Secure connections
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API request throttling
- **SQL Injection Prevention**: Parameterized queries

## 🚀 Performance Optimizations

- **Turbopack**: Next.js 16 with fast refresh and optimized builds
- **Image Optimization**: Next.js Image component for lazy loading
- **Code Splitting**: Automatic route-based splitting
- **React 19**: Improved rendering and hydration performance
- **Memoization**: Strategic use of useMemo and useCallback
- **Virtual Scrolling**: Efficient rendering of long lists
- **Debounced Search**: Optimized search input handling
- **Static Generation**: Pre-rendered pages where possible

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Issues & Limitations

### Current Limitations
- Mock data only (no persistent storage yet)
- No real-time updates between users (planned with WebSockets)
- Image uploads save locally (Cloudinary integration planned)
- No email notifications (planned with SendGrid)
- Limited offline support (PWA features planned)

### Workarounds
- Use browser localStorage for session persistence
- Refresh page to reset mock data
- Use provided demo images for menu items

## 🔄 Migration from Mock to Production

When integrating with a backend:

1. **Replace Mock Services**:
   - Update `src/services/` to call real API endpoints
   - Remove mock data from `src/lib/mock-data/`

2. **Add API Routes**:
   - Create `/api` endpoints in `src/app/api/`
   - Implement database queries with Prisma/Mongoose

3. **Update Auth**:
   - Integrate NextAuth.js or custom JWT auth
   - Add protected API routes

4. **Add Real-time**:
   - Integrate Pusher or Socket.io
   - Update order and table status with WebSocket events

## 📖 Documentation

### Code Documentation
- TypeScript types and interfaces with JSDoc comments
- Component props documentation
- Function documentation with examples
- Inline comments for complex logic

### Project Documentation
- `START_HERE.md`: Quick start guide
- `SETUP.md`: Detailed setup instructions
- `MIGRATION_SUMMARY.md`: Feature implementation notes
- `PROGRESS.md`: Development progress tracker

## 🤝 Contributing

This is a portfolio/learning project. Contributions, issues, and feature requests are welcome!

### How to Contribute
1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - free to use for learning and portfolio purposes.

## 💼 About This Project

This Restaurant Management System was built as a comprehensive portfolio project to demonstrate:

- **Modern Full-Stack Development**: Next.js 16, React 19, TypeScript
- **UI/UX Excellence**: Beautiful, responsive design with dark mode
- **State Management**: Zustand and TanStack Query patterns
- **Type Safety**: Comprehensive TypeScript implementation
- **Best Practices**: Clean code, component architecture, and documentation
- **Real-World Application**: Production-ready features and workflows

Perfect for restaurants looking for a modern POS and management solution, or developers wanting to learn full-stack development patterns.

## 🙏 Acknowledgments

- **shadcn/ui**: For the excellent component library
- **Vercel**: For Next.js and deployment platform
- **Radix UI**: For accessible component primitives
- **The React Team**: For React 19 improvements
- **Open Source Community**: For amazing tools and libraries

## 📧 Contact & Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Open a GitHub Discussion
- **Portfolio**: [Your Portfolio URL]
- **LinkedIn**: [Your LinkedIn]

---

**Built with ❤️ using Next.js 16, React 19, TypeScript, and Tailwind CSS**

*Last Updated: 2025*
