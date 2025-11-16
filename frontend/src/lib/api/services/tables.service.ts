import { apiClient } from "../client";

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface Table {
  _id: string;
  tenantId: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  location?: string;
  isActive: boolean;
  position?: {
    x: number;
    y: number;
  };
  shape?: string;
  currentOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableDto {
  tableNumber: string;
  capacity: number;
  status?: TableStatus;
  location?: string;
  isActive?: boolean;
  position?: {
    x: number;
    y: number;
  };
  shape?: string;
}

export interface UpdateTableDto extends Partial<CreateTableDto> {
  status?: TableStatus;
  currentOrderId?: string;
}

export const tablesService = {
  /**
   * Get all tables
   */
  getAll: async (): Promise<Table[]> => {
    return apiClient.get<Table[]>("/tables");
  },

  /**
   * Get single table by ID
   */
  getById: async (id: string): Promise<Table> => {
    return apiClient.get<Table>(`/tables/${id}`);
  },

  /**
   * Create new table
   */
  create: async (data: CreateTableDto): Promise<Table> => {
    return apiClient.post<Table>("/tables", data);
  },

  /**
   * Update table
   */
  update: async (id: string, data: UpdateTableDto): Promise<Table> => {
    return apiClient.patch<Table>(`/tables/${id}`, data);
  },

  /**
   * Delete table
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/tables/${id}`);
  },

  /**
   * Update table status
   */
  updateStatus: async (id: string, status: TableStatus): Promise<Table> => {
    return apiClient.patch<Table>(`/tables/${id}`, { status });
  },
};
