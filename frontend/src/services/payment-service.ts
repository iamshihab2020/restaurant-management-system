/**
 * Payment Service
 * Backend-ready service layer for payment operations
 * Currently uses localStorage, easily replaceable with API calls
 */

import { Payment, PaymentMethod, PaymentStatus, ProcessPaymentInput } from "@/types";

const STORAGE_KEY = "payments";

/**
 * Initialize storage with empty array if needed
 */
function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

/**
 * Get payments from storage
 */
function getStoredPayments(): Payment[] {
  if (typeof window === "undefined") return [];

  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const parsed = JSON.parse(stored);
  // Convert date strings back to Date objects
  return parsed.map((payment: any) => ({
    ...payment,
    createdAt: new Date(payment.createdAt),
    updatedAt: new Date(payment.updatedAt),
  }));
}

/**
 * Save payments to storage
 */
function savePayments(payments: Payment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}

/**
 * Fetch all payments
 */
export async function fetchPayments(): Promise<Payment[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/payments');
  // return response.json();

  return getStoredPayments();
}

/**
 * Fetch payments by order ID
 */
export async function fetchPaymentsByOrder(orderId: string): Promise<Payment[]> {
  const payments = await fetchPayments();
  return payments.filter((payment) => payment.orderId === orderId);
}

/**
 * Fetch payments by status
 */
export async function fetchPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
  const payments = await fetchPayments();
  return payments.filter((payment) => payment.status === status);
}

/**
 * Fetch payments by date range
 */
export async function fetchPaymentsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Payment[]> {
  const payments = await fetchPayments();
  return payments.filter((payment) => {
    const paymentDate = new Date(payment.createdAt);
    return paymentDate >= startDate && paymentDate <= endDate;
  });
}

/**
 * Fetch today's payments
 */
export async function fetchTodaysPayments(): Promise<Payment[]> {
  const payments = await fetchPayments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return payments.filter((payment) => {
    const paymentDate = new Date(payment.createdAt);
    paymentDate.setHours(0, 0, 0, 0);
    return paymentDate.getTime() === today.getTime();
  });
}

/**
 * Process a new payment
 */
export async function processPayment(
  input: ProcessPaymentInput,
  processedBy: string
): Promise<Payment> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // const response = await fetch('/api/payments', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...input, processedBy }),
  // });
  // return response.json();

  const payments = getStoredPayments();

  const newPayment: Payment = {
    id: `payment-${Date.now()}`,
    orderId: input.orderId,
    amount: input.amount,
    method: input.method,
    status: "completed",
    processedBy,
    tip: input.tip || 0,
    notes: input.notes,
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    processedByUser: {
      id: processedBy,
      name: "Current User",
      email: "user@example.com",
      role: "cashier",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  payments.push(newPayment);
  savePayments(payments);

  return newPayment;
}

/**
 * Process split payment
 * Creates multiple payment records for a single order
 */
export async function processSplitPayment(
  orderId: string,
  splits: Array<{
    amount: number;
    method: PaymentMethod;
    tip?: number;
    notes?: string;
  }>,
  processedBy: string
): Promise<Payment[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call

  const payments = getStoredPayments();
  const newPayments: Payment[] = [];

  for (let i = 0; i < splits.length; i++) {
    const split = splits[i];
    const payment: Payment = {
      id: `payment-${Date.now()}-${i}`,
      orderId,
      amount: split.amount,
      method: split.method,
      status: "completed",
      processedBy,
      tip: split.tip || 0,
      notes: split.notes ? `Split ${i + 1}/${splits.length}: ${split.notes}` : `Split ${i + 1}/${splits.length}`,
      transactionId: `TXN-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      processedByUser: {
        id: processedBy,
        name: "Current User",
        email: "user@example.com",
        role: "cashier",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    newPayments.push(payment);
    payments.push(payment);
  }

  savePayments(payments);
  return newPayments;
}

/**
 * Process refund
 */
export async function processRefund(
  paymentId: string,
  amount: number,
  reason: string
): Promise<Payment> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call

  const payments = getStoredPayments();
  const index = payments.findIndex((p) => p.id === paymentId);

  if (index === -1) {
    throw new Error("Payment not found");
  }

  const originalPayment = payments[index];

  // Create refund payment record
  const refundPayment: Payment = {
    id: `refund-${Date.now()}`,
    orderId: originalPayment.orderId,
    amount: -amount, // Negative amount for refund
    method: originalPayment.method,
    status: "refunded",
    processedBy: originalPayment.processedBy,
    tip: 0,
    notes: `Refund for ${paymentId}: ${reason}`,
    transactionId: `REFUND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    processedByUser: originalPayment.processedByUser,
  };

  // Update original payment status
  payments[index] = {
    ...originalPayment,
    status: "refunded",
    updatedAt: new Date(),
    notes: `${originalPayment.notes || ""} - Refunded: ${reason}`.trim(),
  };

  payments.push(refundPayment);
  savePayments(payments);

  return refundPayment;
}

/**
 * Calculate change for cash payment
 */
export function calculateChange(amountPaid: number, total: number): number {
  return Math.max(0, amountPaid - total);
}

/**
 * Calculate tip amount from percentage
 */
export function calculateTipFromPercentage(subtotal: number, percentage: number): number {
  return Math.round((subtotal * percentage) / 100 * 100) / 100;
}

/**
 * Get payment summary for an order
 */
export async function getPaymentSummary(orderId: string): Promise<{
  totalPaid: number;
  totalTips: number;
  paymentCount: number;
  methods: Record<PaymentMethod, number>;
  payments: Payment[];
}> {
  const payments = await fetchPaymentsByOrder(orderId);

  const summary = {
    totalPaid: 0,
    totalTips: 0,
    paymentCount: payments.length,
    methods: {
      cash: 0,
      credit_card: 0,
      debit_card: 0,
      mobile_payment: 0,
    } as Record<PaymentMethod, number>,
    payments,
  };

  payments.forEach((payment) => {
    if (payment.status === "completed") {
      summary.totalPaid += payment.amount;
      summary.totalTips += payment.tip || 0;
      summary.methods[payment.method] = (summary.methods[payment.method] || 0) + payment.amount;
    }
  });

  return summary;
}

/**
 * Get shift summary for a cashier
 */
export async function getShiftSummary(
  cashierId: string,
  startTime: Date,
  endTime: Date
): Promise<{
  totalSales: number;
  totalTips: number;
  transactionCount: number;
  methodBreakdown: Record<PaymentMethod, { count: number; amount: number }>;
  payments: Payment[];
}> {
  const allPayments = await fetchPayments();

  const shiftPayments = allPayments.filter((payment) => {
    const paymentTime = new Date(payment.createdAt);
    return (
      payment.processedBy === cashierId &&
      payment.status === "completed" &&
      paymentTime >= startTime &&
      paymentTime <= endTime
    );
  });

  const summary = {
    totalSales: 0,
    totalTips: 0,
    transactionCount: shiftPayments.length,
    methodBreakdown: {
      cash: { count: 0, amount: 0 },
      credit_card: { count: 0, amount: 0 },
      debit_card: { count: 0, amount: 0 },
      mobile_payment: { count: 0, amount: 0 },
    } as Record<PaymentMethod, { count: number; amount: number }>,
    payments: shiftPayments,
  };

  shiftPayments.forEach((payment) => {
    summary.totalSales += payment.amount;
    summary.totalTips += payment.tip || 0;
    summary.methodBreakdown[payment.method].count++;
    summary.methodBreakdown[payment.method].amount += payment.amount;
  });

  return summary;
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
  amount: number,
  orderTotal: number,
  existingPayments: Payment[]
): { valid: boolean; message?: string } {
  const totalPaid = existingPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const remaining = orderTotal - totalPaid;

  if (amount <= 0) {
    return { valid: false, message: "Payment amount must be greater than zero" };
  }

  if (amount > remaining) {
    return { valid: false, message: `Payment exceeds remaining balance of $${remaining.toFixed(2)}` };
  }

  return { valid: true };
}
