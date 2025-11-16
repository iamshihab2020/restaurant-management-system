import { apiClient } from "../client";

export interface Customer {
  _id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit?: string;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export const customersService = {
  /**
   * Get all customers
   */
  getAll: async (): Promise<Customer[]> => {
    return apiClient.get<Customer[]>("/customers");
  },

  /**
   * Get single customer by ID
   */
  getById: async (id: string): Promise<Customer> => {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  /**
   * Create new customer
   */
  create: async (data: CreateCustomerDto): Promise<Customer> => {
    return apiClient.post<Customer>("/customers", data);
  },

  /**
   * Update customer
   */
  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    return apiClient.patch<Customer>(`/customers/${id}`, data);
  },

  /**
   * Delete customer
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/customers/${id}`);
  },
};
