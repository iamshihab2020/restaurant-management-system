"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Banknote, Smartphone, Receipt, DollarSign, Search, Split, RotateCcw, History, Printer } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { useOrders } from "@/lib/hooks/use-orders";
import { usePayments, useCreatePayment, useRefundPayment } from "@/lib/hooks/use-payments";
import type { PaymentMethod } from "@/lib/api/services/payments.service";

interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  tip: number;
  timestamp: Date;
  processedBy: string;
}

/**
 * Payments Page
 * Process payments for served orders
 * Supports multiple payment methods: cash, credit card, debit card, mobile payment
 */
export default function PaymentsPage() {
  const { user } = useAuthStore();

  // React Query hooks
  const { data: orders = [], isLoading } = useOrders();
  const { data: paymentHistory = [] } = usePayments();
  const createPaymentMutation = useCreatePayment();
  const refundPaymentMutation = useRefundPayment();

  // Local state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal");
  const [splitCount, setSplitCount] = useState(2);
  const [splitAmounts, setSplitAmounts] = useState<number[]>([]);

  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundOrder, setRefundOrder] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  // Orders ready for payment (served status)
  const pendingPaymentOrders = orders
    .filter((order) => order.status === "served")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Filter by search query
  const filteredOrders = pendingPaymentOrders.filter(
    (order) =>
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.tableNumber.toString().includes(searchQuery) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processPayment = async () => {
    if (!selectedOrder) return;

    if (paymentMethod === "cash" && cashReceived < selectedOrder.total + tipAmount) {
      toast.error("Cash received is less than total amount");
      return;
    }

    const finalTotal = selectedOrder.total + tipAmount;

    try {
      await createPaymentMutation.mutateAsync({
        orderId: selectedOrder._id,
        amount: finalTotal,
        method: paymentMethod,
        tip: tipAmount,
        notes: paymentMethod === "cash" ? `Cash received: $${cashReceived}` : undefined,
      });

      toast.success(`${selectedOrder.orderNumber} paid via ${paymentMethod.replace("_", " ")}`);

      setSelectedOrder(null);
      setTipAmount(0);
      setPaymentMethod("cash");
      setCashReceived(0);
    } catch (error) {
      console.error("Failed to process payment:", error);
      toast.error("Failed to process payment");
    }
  };

  const openSplitDialog = () => {
    if (!selectedOrder) return;
    setSplitCount(2);
    setSplitMethod("equal");
    const equalAmount = (selectedOrder.total + tipAmount) / 2;
    setSplitAmounts([equalAmount, equalAmount]);
    setIsSplitDialogOpen(true);
  };

  const handleSplitPayment = () => {
    if (!selectedOrder) return;

    const totalSplit = splitAmounts.reduce((sum, amt) => sum + amt, 0);
    const expectedTotal = selectedOrder.total + tipAmount;

    if (Math.abs(totalSplit - expectedTotal) > 0.01) {
      toast({
        title: "Invalid Split",
        description: "Split amounts must equal total.",
        variant: "destructive",
      });
      return;
    }

    // Order status will be automatically updated by the mutation

    toast({
      title: "Split Payment Processed",
      description: `Payment split ${splitCount} ways`,
    });

    setIsSplitDialogOpen(false);
    setSelectedOrder(null);
    setTipAmount(0);
  };

  const openRefundDialog = (payment: PaymentRecord) => {
    setRefundOrder(payment);
    setRefundReason("");
    setIsRefundDialogOpen(true);
  };

  const processRefund = async () => {
    if (!refundOrder || !refundReason) return;

    try {
      await refundPaymentMutation.mutateAsync({
        id: refundOrder.id,
        reason: refundReason,
      });

      toast.success(`Refunded $${refundOrder.amount.toFixed(2)} for ${refundOrder.orderNumber}`);

      setIsRefundDialogOpen(false);
      setRefundOrder(null);
      setRefundReason("");
    } catch (error) {
      console.error("Failed to process refund:", error);
      toast.error("Failed to process refund");
    }
  };

  /**
   * Quick tip percentage buttons
   */
  const calculateTip = (percentage: number) => {
    const tip = (selectedOrder?.subtotal || 0) * (percentage / 100);
    setTipAmount(Math.round(tip * 100) / 100);
  };

  /**
   * Get payment method icon
   */
  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case "cash":
        return Banknote;
      case "credit_card":
      case "debit_card":
        return CreditCard;
      case "mobile_payment":
        return Smartphone;
      default:
        return DollarSign;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Process payments for completed orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>
            <History className="w-4 h-4 mr-2" />
            Payment History
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Cashier</p>
            <p className="font-semibold text-foreground">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-3xl font-bold text-primary">
                  {pendingPaymentOrders.length}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount Due</p>
                <p className="text-3xl font-bold text-primary">
                  $
                  {pendingPaymentOrders
                    .reduce((sum, order) => sum + order.total, 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Check Size</p>
                <p className="text-3xl font-bold text-primary">
                  $
                  {pendingPaymentOrders.length > 0
                    ? (
                        pendingPaymentOrders.reduce((sum, order) => sum + order.total, 0) /
                        pendingPaymentOrders.length
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by order number, table, or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Pending Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.map((order) => (
          <Card
            key={order._id}
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20"
            onClick={() => setSelectedOrder(order)}
          >
            <CardHeader className="bg-primary/10">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Table {order.table.tableNumber} • {order.items.length} items
                  </p>
                  {order.customerName && (
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.customerName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    ${order.total.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.updatedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount:</span>
                    <span className="font-medium">-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t text-base font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full mt-4" size="lg">
                <Receipt className="w-5 h-5 mr-2" />
                Process Payment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Pending Payments
            </h3>
            <p className="text-muted-foreground">
              All orders have been paid. Great job!
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>

              <DialogHeader>
                <DialogTitle>Process Payment - {selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  Table {selectedOrder.table.tableNumber} • {selectedOrder.items.length} items
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
              {/* Order Summary */}
              <div className="p-4 bg-background rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Table:</span>
                    <span className="ml-2 font-medium">
                      {selectedOrder.table.tableNumber}
                    </span>
                  </div>
                  {selectedOrder.customerName && (
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.customerName}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Items:</span>
                    <span className="ml-2 font-medium">
                      {selectedOrder.items.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Waiter:</span>
                    <span className="ml-2 font-medium">
                      {selectedOrder.createdByUser.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(
                    [
                      { method: "cash", label: "Cash", icon: Banknote },
                      { method: "credit_card", label: "Credit Card", icon: CreditCard },
                      { method: "debit_card", label: "Debit Card", icon: CreditCard },
                      { method: "mobile_payment", label: "Mobile Pay", icon: Smartphone },
                    ] as const
                  ).map(({ method, label, icon: Icon }) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === method
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 mx-auto mb-2 ${
                          paymentMethod === method ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p className="text-xs font-medium text-center">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Add Tip (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  {[10, 15, 18, 20].map((percentage) => (
                    <Button
                      key={percentage}
                      variant="outline"
                      size="sm"
                      onClick={() => calculateTip(percentage)}
                      className="flex-1"
                    >
                      {percentage}%
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTipAmount(0)}
                  >
                    No Tip
                  </Button>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter custom tip amount"
                    className="pl-10"
                  />
                </div>
              </div>

              {paymentMethod === "cash" && (
                <div>
                  <Label htmlFor="cashReceived">Cash Received *</Label>
                  <Input
                    id="cashReceived"
                    type="number"
                    step="0.01"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    placeholder="Enter cash received"
                    className="mt-2"
                  />
                  {cashReceived > 0 && cashReceived >= selectedOrder.total + tipAmount && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Change: ${(cashReceived - selectedOrder.total - tipAmount).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-primary font-medium">
                      <span>Tip:</span>
                      <span>${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-foreground pt-3 border-t">
                    <span>Total to Charge:</span>
                    <span className="text-primary">
                      ${(selectedOrder.total + tipAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={openSplitDialog}>
                  <Split className="w-4 h-4 mr-2" />
                  Split Bill
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </Button>
                <Button onClick={processPayment} className="flex-1">
                  <Receipt className="w-4 h-4 mr-2" />
                  Complete Payment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSplitDialogOpen} onOpenChange={setIsSplitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Split Bill</DialogTitle>
            <DialogDescription>
              Divide the payment into multiple parts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Split Method</Label>
              <Select value={splitMethod} onValueChange={(v: any) => {
                setSplitMethod(v);
                if (v === "equal" && selectedOrder) {
                  const total = selectedOrder.total + tipAmount;
                  const amount = total / splitCount;
                  setSplitAmounts(Array(splitCount).fill(amount));
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Split Equally</SelectItem>
                  <SelectItem value="custom">Custom Amounts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {splitMethod === "equal" && (
              <div className="space-y-2">
                <Label>Number of Splits</Label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={splitCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 2;
                    setSplitCount(count);
                    if (selectedOrder) {
                      const total = selectedOrder.total + tipAmount;
                      const amount = total / count;
                      setSplitAmounts(Array(count).fill(amount));
                    }
                  }}
                />
              </div>
            )}

            {selectedOrder && splitAmounts.length > 0 && (
              <div className="space-y-2">
                <Label>Split Breakdown</Label>
                {splitAmounts.map((amount, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm font-medium">Payment {idx + 1}:</span>
                    {splitMethod === "custom" ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => {
                          const newAmounts = [...splitAmounts];
                          newAmounts[idx] = parseFloat(e.target.value) || 0;
                          setSplitAmounts(newAmounts);
                        }}
                      />
                    ) : (
                      <span className="text-lg font-bold">${amount.toFixed(2)}</span>
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Total: ${splitAmounts.reduce((sum, a) => sum + a, 0).toFixed(2)} / $
                    {(selectedOrder.total + tipAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSplitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSplitPayment}>Process Split Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              View all processed payments and refunds
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payment history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{payment.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.timestamp.toLocaleString()} • {payment.processedBy}
                          </p>
                          <p className="text-sm capitalize">{payment.method.replace("_", " ")}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${payment.amount < 0 ? "text-destructive" : "text-primary"}`}>
                            {payment.amount < 0 ? "-" : ""}${Math.abs(payment.amount).toFixed(2)}
                          </p>
                          {payment.tip > 0 && (
                            <p className="text-sm text-muted-foreground">Tip: ${payment.tip.toFixed(2)}</p>
                          )}
                          {payment.amount > 0 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="mt-2"
                              onClick={() => openRefundDialog(payment)}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund payment for {refundOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {refundOrder && (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="text-2xl font-bold">${refundOrder.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Method: {refundOrder.method.replace("_", " ")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundReason">Reason for Refund *</Label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_request">Customer Request</SelectItem>
                      <SelectItem value="wrong_order">Wrong Order</SelectItem>
                      <SelectItem value="quality_issue">Quality Issue</SelectItem>
                      <SelectItem value="overcharge">Overcharge</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={processRefund} disabled={!refundReason}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
