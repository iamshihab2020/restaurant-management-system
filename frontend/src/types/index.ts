/**
 * Type definitions for the Restaurant Management System
 * These types define the data structures used throughout the application
 */

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = "admin" | "manager" | "waiter" | "kitchen" | "cashier";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ============================================
// TABLE MANAGEMENT TYPES
// ============================================

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  location?: string; // e.g., "Indoor", "Outdoor", "VIP"
  currentOrderId?: string;
  reservedFor?: string;
  reservedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MENU TYPES
// ============================================

export type MenuCategory = "appetizer" | "main_course" | "dessert" | "beverage" | "special";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  modifierGroupIds?: string[]; // IDs of applicable modifier groups
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus =
  | "pending"      // Order created, not sent to kitchen
  | "confirmed"    // Order confirmed and sent to kitchen
  | "preparing"    // Kitchen is preparing the order
  | "ready"        // Food is ready to be served
  | "served"       // Food has been served to table
  | "completed"    // Order completed and paid
  | "cancelled";   // Order was cancelled

export type OrderItemStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served";

export interface SelectedModifier {
  modifierGroupId: string;
  modifierGroupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  specialInstructions?: string;
  selectedModifiers?: SelectedModifier[]; // Add-ons selected for this item
  preparedBy?: string; // user ID of kitchen staff
  preparedAt?: Date;
}

export interface OrderHistoryEntry {
  id: string;
  orderId: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  changedBy?: string; // user ID
  changedByUser?: User;
  notes?: string;
  timestamp: Date;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "ORD-001"
  tableId: string;
  table: Table;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdBy: string; // waiter user ID
  createdByUser: User;
  customerName?: string;
  customerCount?: number;
  specialRequests?: string;
  history?: OrderHistoryEntry[]; // Order status change history
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentMethod = "cash" | "credit_card" | "debit_card" | "mobile_payment";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  processedBy: string; // cashier user ID
  processedByUser: User;
  tip?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// RESERVATION TYPES
// ============================================

export type ReservationStatus = "pending" | "confirmed" | "seated" | "cancelled" | "no_show";

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string; // e.g., "19:30"
  tableId?: string;
  table?: Table;
  status: ReservationStatus;
  specialRequests?: string;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NOTIFICATION & REAL-TIME TYPES
// ============================================

export type NotificationType =
  | "order_created"
  | "order_updated"
  | "table_status_changed"
  | "reservation_created"
  | "payment_completed";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  userId?: string; // specific user or null for broadcast
  createdAt: Date;
}

// ============================================
// DASHBOARD & ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  availableTables: number;
  occupiedTables: number;
  averageOrderValue: number;
  popularItems: Array<{
    menuItem: MenuItem;
    orderCount: number;
  }>;
}

export interface SalesReport {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  paymentMethods: Record<PaymentMethod, number>;
  topSellingItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

// ============================================
// FORM & UI TYPES
// ============================================

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  selectedModifiers?: SelectedModifier[];
}

export interface CreateOrderInput {
  tableId: string;
  items: CreateOrderItemInput[];
  customerName?: string;
  customerCount?: number;
  specialRequests?: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export interface CreateReservationInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  tableId?: string;
  specialRequests?: string;
}

export interface ProcessPaymentInput {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  tip?: number;
  notes?: string;
}
