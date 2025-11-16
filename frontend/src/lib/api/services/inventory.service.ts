import { apiClient } from '../client';

export enum InventoryUnit {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  PCS = 'pcs',
  DOZEN = 'dozen',
}

export interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: InventoryUnit;
  currentStock: number;
  minimumStock: number;
  reorderQuantity?: number;
  costPerUnit?: number;
  supplier?: string;
  lastRestocked?: Date;
  isActive: boolean;
}

export interface CreateInventoryItemDto {
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: InventoryUnit;
  currentStock: number;
  minimumStock: number;
  reorderQuantity?: number;
  costPerUnit?: number;
  supplier?: string;
}

export interface RestockDto {
  quantity: number;
}

export interface DeductStockDto {
  quantity: number;
}

export const inventoryService = {
  getAll: () =>
    apiClient.get<InventoryItem[]>('/inventory'),

  getLowStock: () =>
    apiClient.get<InventoryItem[]>('/inventory/low-stock'),

  getById: (id: string) =>
    apiClient.get<InventoryItem>(`/inventory/${id}`),

  create: (data: CreateInventoryItemDto) =>
    apiClient.post<InventoryItem>('/inventory', data),

  update: (id: string, data: Partial<CreateInventoryItemDto>) =>
    apiClient.patch<InventoryItem>(`/inventory/${id}`, data),

  restock: (id: string, data: RestockDto) =>
    apiClient.patch<InventoryItem>(`/inventory/${id}/restock`, data),

  deduct: (id: string, data: DeductStockDto) =>
    apiClient.patch<InventoryItem>(`/inventory/${id}/deduct`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/inventory/${id}`),
};
