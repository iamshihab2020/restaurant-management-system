import { apiClient } from "../client";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled";
export type OrderType = "dine-in" | "takeout" | "delivery";
export type OrderItemStatus = "pending" | "preparing" | "ready" | "served";

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemSnapshot: {
    name: string;
    price: number;
    category: string;
  };
  quantity: number;
  basePrice: number;
  selectedModifiers: SelectedModifier[];
  totalPrice: number;
  status: OrderItemStatus;
  specialInstructions?: string;
  preparedBy?: string;
  preparedAt?: string;
}

export interface Order {
  _id: string;
  tenantId: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  tableId: string;
  customerId?: string;
  createdBy: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType?: "percentage" | "fixed";
  tip: number;
  total: number;
  customerName?: string;
  customerCount?: number;
  specialRequests?: string;
  isPaid: boolean;
  paidAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  tableId: string;
  customerId?: string;
  type?: OrderType;
  items: Array<{
    menuItemId: string;
    quantity: number;
    selectedModifiers?: SelectedModifier[];
    specialInstructions?: string;
  }>;
  customerName?: string;
  customerCount?: number;
  specialRequests?: string;
  discount?: number;
  discountType?: "percentage" | "fixed";
  tip?: number;
}

export const ordersService = {
  /**
   * Get all orders
   */
  getAll: async (status?: OrderStatus): Promise<Order[]> => {
    const endpoint = status ? `/orders?status=${status}` : "/orders";
    return apiClient.get<Order[]>(endpoint);
  },

  /**
   * Get single order by ID
   */
  getById: async (id: string): Promise<Order> => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  /**
   * Create new order
   */
  create: async (data: CreateOrderDto): Promise<Order> => {
    return apiClient.post<Order>("/orders", data);
  },

  /**
   * Update order status
   */
  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    return apiClient.patch<Order>(`/orders/${id}/status`, { status });
  },

  /**
   * Update order item status
   */
  updateItemStatus: async (
    orderId: string,
    itemId: string,
    status: OrderItemStatus
  ): Promise<Order> => {
    return apiClient.patch<Order>(`/orders/${orderId}/items/${itemId}/status`, { status });
  },

  /**
   * Delete (cancel) order
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/orders/${id}`);
  },
};
