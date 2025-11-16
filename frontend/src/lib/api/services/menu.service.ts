import { apiClient } from "../client";

export interface MenuItem {
  _id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  modifierGroups: string[];
  isAvailable: boolean;
  tags: string[];
  preparationTime: number;
  calories?: number;
  allergens: string[];
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemDto {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  modifierGroups?: string[];
  isAvailable?: boolean;
  tags?: string[];
  preparationTime?: number;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {}

export const menuService = {
  /**
   * Get all menu items
   */
  getAll: async (category?: string): Promise<MenuItem[]> => {
    const endpoint = category ? `/menu?category=${category}` : "/menu";
    return apiClient.get<MenuItem[]>(endpoint);
  },

  /**
   * Get single menu item by ID
   */
  getById: async (id: string): Promise<MenuItem> => {
    return apiClient.get<MenuItem>(`/menu/${id}`);
  },

  /**
   * Create new menu item
   */
  create: async (data: CreateMenuItemDto): Promise<MenuItem> => {
    return apiClient.post<MenuItem>("/menu", data);
  },

  /**
   * Update menu item
   */
  update: async (id: string, data: UpdateMenuItemDto): Promise<MenuItem> => {
    return apiClient.patch<MenuItem>(`/menu/${id}`, data);
  },

  /**
   * Delete menu item
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/menu/${id}`);
  },
};
