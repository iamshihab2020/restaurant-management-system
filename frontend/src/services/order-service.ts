/**
 * Order Service
 * Backend-ready service layer for order operations
 * Currently uses localStorage, easily replaceable with API calls
 */

import { Order, OrderStatus, OrderItem, OrderItemStatus, CreateOrderInput } from "@/types";
import { mockOrders } from "@/lib/mock-data/orders";
import { getMenuItemById } from "@/lib/mock-data/menu-items";

const STORAGE_KEY = "restaurant_orders";
const ORDER_COUNTER_KEY = "restaurant_order_counter";

/**
 * Initialize localStorage with mock data if empty
 */
function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
    localStorage.setItem(ORDER_COUNTER_KEY, "7");
  }
}

/**
 * Get all orders from storage
 */
function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return mockOrders;

  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const orders = JSON.parse(stored);
  // Convert date strings back to Date objects
  return orders.map((order: any) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
    completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
    table: order.table ? {
      ...order.table,
      createdAt: new Date(order.table.createdAt),
      updatedAt: new Date(order.table.updatedAt),
      reservedAt: order.table.reservedAt ? new Date(order.table.reservedAt) : undefined,
    } : undefined,
    createdByUser: order.createdByUser ? {
      ...order.createdByUser,
      createdAt: new Date(order.createdByUser.createdAt),
      updatedAt: new Date(order.createdByUser.updatedAt),
    } : undefined,
    items: order.items.map((item: any) => ({
      ...item,
      preparedAt: item.preparedAt ? new Date(item.preparedAt) : undefined,
      menuItem: {
        ...item.menuItem,
        createdAt: new Date(item.menuItem.createdAt),
        updatedAt: new Date(item.menuItem.updatedAt),
      },
    })),
  }));
}

/**
 * Save orders to storage
 */
function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/**
 * Generate next order number
 */
function getNextOrderNumber(): string {
  if (typeof window === "undefined") return "ORD-001";

  const counter = localStorage.getItem(ORDER_COUNTER_KEY);
  const nextNum = counter ? parseInt(counter) + 1 : 1;
  localStorage.setItem(ORDER_COUNTER_KEY, nextNum.toString());
  return `ORD-${String(nextNum).padStart(3, "0")}`;
}

/**
 * Fetch all orders
 * Simulates API call with delay
 */
export async function fetchOrders(): Promise<Order[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/orders');
  // return response.json();

  return getStoredOrders();
}

/**
 * Fetch single order by ID
 */
export async function fetchOrderById(id: string): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/orders/${id}`);
  // return response.json();

  const orders = getStoredOrders();
  return orders.find((o) => o.id === id) || null;
}

/**
 * Create new order
 */
export async function createOrder(input: CreateOrderInput, createdBy: string): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/orders', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...input, createdBy })
  // });
  // return response.json();

  const orders = getStoredOrders();
  const { getTableById } = require("@/lib/mock-data/tables");
  const { findUserById } = require("@/lib/mock-data/users");

  // Build order items
  const orderItems: OrderItem[] = input.items.map((item, index) => {
    const menuItem = getMenuItemById(item.menuItemId);
    if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);

    return {
      id: `order-item-${Date.now()}-${index}`,
      menuItemId: item.menuItemId,
      menuItem,
      quantity: item.quantity,
      price: menuItem.price,
      status: "pending" as OrderItemStatus,
      specialInstructions: item.specialInstructions,
    };
  });

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const newOrder: Order = {
    id: `order-${Date.now()}`,
    orderNumber: getNextOrderNumber(),
    tableId: input.tableId,
    table: getTableById(input.tableId)!,
    items: orderItems,
    status: "pending",
    subtotal,
    tax,
    discount: 0,
    total,
    createdBy,
    createdByUser: findUserById(createdBy)!,
    customerName: input.customerName,
    customerCount: input.customerCount,
    specialRequests: input.specialRequests,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  orders.push(newOrder);
  saveOrders(orders);

  return newOrder;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/orders/${orderId}/status`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status: newStatus })
  // });
  // return response.json();

  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const updatedOrder = {
    ...orders[orderIndex],
    status: newStatus,
    updatedAt: new Date(),
    ...(newStatus === "completed" ? { completedAt: new Date() } : {}),
  };

  orders[orderIndex] = updatedOrder;
  saveOrders(orders);

  return updatedOrder;
}

/**
 * Update individual order item status
 */
export async function updateOrderItemStatus(
  orderId: string,
  itemId: string,
  newStatus: OrderItemStatus,
  preparedBy?: string
): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/orders/${orderId}/items/${itemId}/status`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status: newStatus, preparedBy })
  // });
  // return response.json();

  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const order = orders[orderIndex];
  const itemIndex = order.items.findIndex((i) => i.id === itemId);

  if (itemIndex === -1) {
    throw new Error(`Order item not found: ${itemId}`);
  }

  // Update item status
  order.items[itemIndex] = {
    ...order.items[itemIndex],
    status: newStatus,
    preparedBy: preparedBy || order.items[itemIndex].preparedBy,
    preparedAt: newStatus === "ready" ? new Date() : order.items[itemIndex].preparedAt,
  };

  // Auto-update order status based on item statuses
  const allItemStatuses = order.items.map((i) => i.status);
  const allServed = allItemStatuses.every((s) => s === "served");
  const allReady = allItemStatuses.every((s) => s === "ready" || s === "served");
  const anyPreparing = allItemStatuses.some((s) => s === "preparing");

  if (allServed && order.status !== "completed") {
    order.status = "served";
  } else if (allReady && order.status === "preparing") {
    order.status = "ready";
  } else if (anyPreparing && order.status === "confirmed") {
    order.status = "preparing";
  }

  order.updatedAt = new Date();

  orders[orderIndex] = order;
  saveOrders(orders);

  return order;
}

/**
 * Delete (cancel) order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with actual API call
  // await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });

  const orders = getStoredOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex !== -1) {
    // Instead of deleting, mark as cancelled
    orders[orderIndex].status = "cancelled";
    orders[orderIndex].updatedAt = new Date();
    saveOrders(orders);
  }
}

/**
 * Get orders by status
 */
export async function fetchOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const orders = await fetchOrders();
  return orders.filter((o) => o.status === status);
}

/**
 * Get active orders (not completed or cancelled)
 */
export async function fetchActiveOrders(): Promise<Order[]> {
  const orders = await fetchOrders();
  return orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
}

/**
 * Search orders by query (order number, customer name, table number)
 */
export async function searchOrders(query: string): Promise<Order[]> {
  const orders = await fetchOrders();
  const lowerQuery = query.toLowerCase();

  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(lowerQuery) ||
      o.customerName?.toLowerCase().includes(lowerQuery) ||
      o.table.tableNumber.toString().includes(lowerQuery)
  );
}
