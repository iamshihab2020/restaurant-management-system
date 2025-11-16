import { apiClient } from "../client";

export type PaymentMethod = "cash" | "card" | "mobile" | "online";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  _id: string;
  tenantId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  tip: number;
  processedBy: string;
  notes?: string;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  tip?: number;
  notes?: string;
}

export const paymentsService = {
  /**
   * Get all payments
   */
  getAll: async (): Promise<Payment[]> => {
    return apiClient.get<Payment[]>("/payments");
  },

  /**
   * Get single payment by ID
   */
  getById: async (id: string): Promise<Payment> => {
    return apiClient.get<Payment>(`/payments/${id}`);
  },

  /**
   * Create new payment
   */
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    return apiClient.post<Payment>("/payments", data);
  },

  /**
   * Refund payment
   */
  refund: async (id: string, reason: string): Promise<Payment> => {
    return apiClient.patch<Payment>(`/payments/${id}/refund`, { reason });
  },
};
