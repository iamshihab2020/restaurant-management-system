import { Order, OrderItem } from "@/types";
import { mockMenuItems, getMenuItemById } from "./menu-items";
import { mockTables, getTableById } from "./tables";
import { mockUsers, findUserById } from "./users";

/**
 * Mock order items
 */
const orderItems1: OrderItem[] = [
  {
    id: "order-item-1",
    menuItemId: "menu-1",
    menuItem: getMenuItemById("menu-1")!,
    quantity: 2,
    price: 8.99,
    status: "served",
    specialInstructions: "No croutons please",
  },
  {
    id: "order-item-2",
    menuItemId: "menu-7",
    menuItem: getMenuItemById("menu-7")!,
    quantity: 1,
    price: 18.99,
    status: "served",
  },
  {
    id: "order-item-3",
    menuItemId: "menu-16",
    menuItem: getMenuItemById("menu-16")!,
    quantity: 2,
    price: 4.99,
    status: "served",
  },
];

const orderItems2: OrderItem[] = [
  {
    id: "order-item-4",
    menuItemId: "menu-3",
    menuItem: getMenuItemById("menu-3")!,
    quantity: 1,
    price: 11.99,
    status: "ready",
  },
  {
    id: "order-item-5",
    menuItemId: "menu-6",
    menuItem: getMenuItemById("menu-6")!,
    quantity: 2,
    price: 32.99,
    status: "preparing",
    specialInstructions: "Medium rare",
    preparedBy: "user-4",
  },
  {
    id: "order-item-6",
    menuItemId: "menu-19",
    menuItem: getMenuItemById("menu-19")!,
    quantity: 2,
    price: 8.00,
    status: "served",
  },
];

const orderItems3: OrderItem[] = [
  {
    id: "order-item-7",
    menuItemId: "menu-2",
    menuItem: getMenuItemById("menu-2")!,
    quantity: 1,
    price: 7.50,
    status: "preparing",
    preparedBy: "user-4",
  },
  {
    id: "order-item-8",
    menuItemId: "menu-8",
    menuItem: getMenuItemById("menu-8")!,
    quantity: 1,
    price: 16.50,
    status: "preparing",
    preparedBy: "user-4",
  },
];

const orderItems4: OrderItem[] = [
  {
    id: "order-item-9",
    menuItemId: "menu-5",
    menuItem: getMenuItemById("menu-5")!,
    quantity: 1,
    price: 24.99,
    status: "ready",
    preparedBy: "user-4",
    preparedAt: new Date("2025-11-01T13:30:00"),
  },
  {
    id: "order-item-10",
    menuItemId: "menu-11",
    menuItem: getMenuItemById("menu-11")!,
    quantity: 1,
    price: 8.50,
    status: "pending",
  },
];

/**
 * Mock orders for the restaurant
 * Includes various order statuses for demonstration
 */
export const mockOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "ORD-001",
    tableId: "table-3",
    table: getTableById("table-3")!,
    items: orderItems1,
    status: "served",
    subtotal: 41.96,
    tax: 4.20,
    discount: 0,
    total: 46.16,
    createdBy: "user-3",
    createdByUser: findUserById("user-3")!,
    customerName: "Smith Family",
    customerCount: 4,
    createdAt: new Date("2025-11-01T12:30:00"),
    updatedAt: new Date("2025-11-01T13:15:00"),
  },
  {
    id: "order-2",
    orderNumber: "ORD-002",
    tableId: "table-5",
    table: getTableById("table-5")!,
    items: orderItems2,
    status: "preparing",
    subtotal: 93.97,
    tax: 9.40,
    discount: 0,
    total: 103.37,
    createdBy: "user-6",
    createdByUser: findUserById("user-6")!,
    customerName: "Anderson Party",
    customerCount: 6,
    specialRequests: "Celebrating anniversary",
    createdAt: new Date("2025-11-01T13:00:00"),
    updatedAt: new Date("2025-11-01T13:30:00"),
  },
  {
    id: "order-3",
    orderNumber: "ORD-003",
    tableId: "table-2",
    table: getTableById("table-2")!,
    items: orderItems3,
    status: "preparing",
    subtotal: 24.00,
    tax: 2.40,
    discount: 0,
    total: 26.40,
    createdBy: "user-3",
    createdByUser: findUserById("user-3")!,
    customerCount: 2,
    createdAt: new Date("2025-11-01T13:45:00"),
    updatedAt: new Date("2025-11-01T13:45:00"),
  },
  {
    id: "order-4",
    orderNumber: "ORD-004",
    tableId: "table-4",
    table: getTableById("table-4")!,
    items: orderItems4,
    status: "confirmed",
    subtotal: 33.49,
    tax: 3.35,
    discount: 0,
    total: 36.84,
    createdBy: "user-3",
    createdByUser: findUserById("user-3")!,
    customerName: "Taylor",
    customerCount: 1,
    createdAt: new Date("2025-11-01T14:00:00"),
    updatedAt: new Date("2025-11-01T14:00:00"),
  },
  // Completed orders for analytics
  {
    id: "order-5",
    orderNumber: "ORD-005",
    tableId: "table-1",
    table: getTableById("table-1")!,
    items: [
      {
        id: "order-item-11",
        menuItemId: "menu-7",
        menuItem: getMenuItemById("menu-7")!,
        quantity: 1,
        price: 18.99,
        status: "served",
      },
    ],
    status: "completed",
    subtotal: 18.99,
    tax: 1.90,
    discount: 0,
    total: 20.89,
    createdBy: "user-3",
    createdByUser: findUserById("user-3")!,
    customerCount: 1,
    createdAt: new Date("2025-11-01T11:00:00"),
    updatedAt: new Date("2025-11-01T11:45:00"),
    completedAt: new Date("2025-11-01T11:45:00"),
  },
  {
    id: "order-6",
    orderNumber: "ORD-006",
    tableId: "table-7",
    table: getTableById("table-7")!,
    items: [
      {
        id: "order-item-12",
        menuItemId: "menu-10",
        menuItem: getMenuItemById("menu-10")!,
        quantity: 1,
        price: 15.99,
        status: "served",
      },
      {
        id: "order-item-13",
        menuItemId: "menu-17",
        menuItem: getMenuItemById("menu-17")!,
        quantity: 1,
        price: 3.50,
        status: "served",
      },
    ],
    status: "completed",
    subtotal: 19.49,
    tax: 1.95,
    discount: 0,
    total: 21.44,
    createdBy: "user-6",
    createdByUser: findUserById("user-6")!,
    customerCount: 1,
    createdAt: new Date("2025-11-01T10:30:00"),
    updatedAt: new Date("2025-11-01T11:15:00"),
    completedAt: new Date("2025-11-01T11:15:00"),
  },
];

/**
 * Get order by ID
 */
export function getOrderById(id: string): Order | undefined {
  return mockOrders.find((order) => order.id === id);
}

/**
 * Get orders by status
 */
export function getOrdersByStatus(status: Order["status"]): Order[] {
  return mockOrders.filter((order) => order.status === status);
}

/**
 * Get orders by table ID
 */
export function getOrdersByTableId(tableId: string): Order[] {
  return mockOrders.filter((order) => order.tableId === tableId);
}

/**
 * Get active orders (not completed or cancelled)
 */
export function getActiveOrders(): Order[] {
  return mockOrders.filter(
    (order) => order.status !== "completed" && order.status !== "cancelled"
  );
}

/**
 * Get today's completed orders
 */
export function getTodaysCompletedOrders(): Order[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return mockOrders.filter((order) => {
    if (order.status !== "completed" || !order.completedAt) return false;
    const completedDate = new Date(order.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });
}
