import { apiClient } from '../client';

export interface KitchenOrder {
  _id: string;
  orderNumber: string;
  tableId?: {
    _id: string;
    tableNumber: string;
  };
  items: Array<{
    _id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    status: 'pending' | 'preparing' | 'ready';
    specialInstructions?: string;
  }>;
  status: 'confirmed' | 'preparing' | 'ready' | 'completed';
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number;
}

export const kitchenService = {
  // Get all kitchen orders
  getOrders: () =>
    apiClient.get<KitchenOrder[]>('/kitchen/orders'),

  // Get pending orders
  getPending: () =>
    apiClient.get<KitchenOrder[]>('/kitchen/orders/pending'),

  // Get preparing orders
  getPreparing: () =>
    apiClient.get<KitchenOrder[]>('/kitchen/orders/preparing'),

  // Start preparing an order
  startOrder: (orderId: string) =>
    apiClient.patch<KitchenOrder>(`/kitchen/orders/${orderId}/start`, {}),

  // Mark individual item as ready
  markItemReady: (orderId: string, itemId: string) =>
    apiClient.patch<KitchenOrder>(
      `/kitchen/orders/${orderId}/items/${itemId}/ready`,
      {}
    ),

  // Complete entire order
  completeOrder: (orderId: string) =>
    apiClient.patch<KitchenOrder>(`/kitchen/orders/${orderId}/complete`, {}),
};
