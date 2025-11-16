"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus, OrderItemStatus } from "@/types";
import { toast } from "sonner";
import { useOrders, useUpdateOrderStatus, useUpdateItemStatus, useDeleteOrder } from "@/lib/hooks/use-orders";
import {
  playOrderReadySound,
  playStatusChangeSound,
  toggleSounds,
  areSoundsEnabled,
  enableSounds,
} from "@/lib/notification-sounds";
import {
  Search,
  Clock,
  DollarSign,
  User,
  Table as TableIcon,
  CheckCircle,
  XCircle,
  Bell,
  ChefHat,
  Check,
  CheckCheck,
  AlertTriangle,
  Printer,
  Volume2,
  VolumeX,
  ArrowUpDown,
} from "lucide-react";

/**
 * Orders Management Page
 * Features: Order tracking, status management, item-level tracking, filtering, sorting, notifications
 * Note: New orders are created via the POS page
 */
export default function OrdersPage() {
  // Payment Model
  const [paymentModel, setPaymentModel] = useState<"payFirst" | "payLater">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paymentModel");
      return (saved as "payFirst" | "payLater") || "payLater";
    }
    return "payLater";
  });

  // React Query hooks
  const { data: orders = [], isLoading, error } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const updateItemStatusMutation = useUpdateItemStatus();
  const deleteMutation = useDeleteOrder();

  // Local state for UI
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("time-desc");

  // Print State
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  // Delete Confirmation
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Sound State
  const [soundsEnabled, setSoundsEnabled] = useState(areSoundsEnabled());

  /**
   * Initialize sounds on mount
   */
  useEffect(() => {
    enableSounds();
  }, []);

  /**
   * Status Configuration with distinct colors and icons
   * Using solid backgrounds with white text for better visibility
   */
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      pending: {
        color: "bg-slate-500 text-white",
        icon: Clock,
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-500 text-white",
        icon: CheckCircle,
        label: "Confirmed",
      },
      preparing: {
        color: "bg-orange-500 text-white",
        icon: ChefHat,
        label: "Preparing",
      },
      ready: {
        color: "bg-purple-500 text-white",
        icon: Bell,
        label: "Ready",
      },
      served: {
        color: "bg-primary text-white",
        icon: Check,
        label: "Served",
      },
      completed: {
        color: "bg-primary text-white",
        icon: CheckCheck,
        label: "Completed",
      },
      cancelled: {
        color: "bg-destructive text-white",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  /**
   * Filter and sort orders
   */
  const filteredOrders = orders
    .filter((order) => {
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      const matchesSearch =
        searchQuery === "" ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.table?.tableNumber.toString().includes(searchQuery) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "time-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "time-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "total-desc":
          return b.total - a.total;
        case "total-asc":
          return a.total - b.total;
        case "table":
          return (a.table?.tableNumber || 0) - (b.table?.tableNumber || 0);
        default:
          return 0;
      }
    });

  /**
   * Count orders by status
   */
  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    served: orders.filter((o) => o.status === "served").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  /**
   * Calculate elapsed time
   */
  const getElapsedTime = (createdAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  /**
   * Check if order is overdue
   */
  const getOrderUrgency = (order: Order): "normal" | "warning" | "critical" => {
    if (order.status === "completed" || order.status === "cancelled") {
      return "normal";
    }

    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;

    if (order.status === "preparing") {
      if (elapsedMinutes > 30) return "critical";
      if (elapsedMinutes > 20) return "warning";
    }

    if (order.status === "ready") {
      if (elapsedMinutes > 10) return "critical";
      if (elapsedMinutes > 5) return "warning";
    }

    return "normal";
  };

  /**
   * Handle status update
   */
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });

      // Play sound for status changes
      if (newStatus === "ready") {
        await playOrderReadySound();
      } else {
        await playStatusChangeSound();
      }

      const order = orders.find(o => o._id === orderId);
      toast.success(`Order ${order?.orderNumber || ''} marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  /**
   * Handle individual item status update
   */
  const handleUpdateItemStatus = async (
    orderId: string,
    itemId: string,
    newStatus: OrderItemStatus
  ) => {
    try {
      await updateItemStatusMutation.mutateAsync({ orderId, itemId, status: newStatus });
      toast.success(`Item marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update item status:', error);
      toast.error('Failed to update item status');
    }
  };

  /**
   * Get next logical status
   */
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready",
      ready: "served",
      served: "completed",
      completed: null,
      cancelled: null,
    };
    return flow[currentStatus];
  };

  /**
   * Handle delete order
   */
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      await deleteMutation.mutateAsync(orderToDelete._id);
      toast.success(`Order ${orderToDelete.orderNumber} has been cancelled`);
      setOrderToDelete(null);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    }
  };

  /**
   * Handle print receipt
   */
  const handlePrintReceipt = (order: Order) => {
    setOrderToPrint(order);
    setTimeout(() => {
      window.print();
      setOrderToPrint(null);
    }, 100);
  };

  /**
   * Toggle sound notifications
   */
  const handleToggleSounds = () => {
    const newState = toggleSounds();
    setSoundsEnabled(newState);
    if (newState) {
      toast.success("Sounds Enabled - You will hear notifications for order events");
    } else {
      toast.info("Sounds Disabled - Sound notifications are now muted");
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if no modal is open and not typing in input
      if (
        selectedOrder ||
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "/":
          e.preventDefault();
          document.querySelector<HTMLInputElement>("#order-search")?.focus();
          break;
        case "1":
          setFilterStatus("all");
          break;
        case "2":
          setFilterStatus("pending");
          break;
        case "3":
          setFilterStatus("confirmed");
          break;
        case "4":
          setFilterStatus("preparing");
          break;
        case "5":
          setFilterStatus("ready");
          break;
        case "6":
          setFilterStatus("served");
          break;
        case "7":
          setFilterStatus("completed");
          break;
        case "8":
          setFilterStatus("cancelled");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedOrder]);

  return (
    <div className="space-y-6">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipt,
          #print-receipt * {
            visibility: visible;
          }
          #print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage orders ({orders.length} total, {statusCounts.preparing + statusCounts.ready} active)
          </p>
        </div>
        <div className="flex gap-2">
          {/* Sound Toggle */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleToggleSounds}
            title={soundsEnabled ? "Disable Sounds" : "Enable Sounds"}
          >
            {soundsEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="order-search"
                  type="text"
                  placeholder="Search orders (order #, table, customer)... Press / to focus"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time-desc">Newest First</SelectItem>
                  <SelectItem value="time-asc">Oldest First</SelectItem>
                  <SelectItem value="total-desc">Total (High-Low)</SelectItem>
                  <SelectItem value="total-asc">Total (Low-High)</SelectItem>
                  <SelectItem value="table">Table Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(
                [
                  "all",
                  "pending",
                  "confirmed",
                  "preparing",
                  "ready",
                  "served",
                  "completed",
                  "cancelled",
                ] as Array<OrderStatus | "all">
              ).map((status) => {
                const config = status !== "all" ? getStatusConfig(status) : null;
                return (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="whitespace-nowrap capitalize"
                  >
                    {config && <config.icon className="w-4 h-4 mr-2" />}
                    {status} ({statusCounts[status]})
                  </Button>
                );
              })}
            </div>

            {/* Clear Filters */}
            {(filterStatus !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus("all");
                  setSearchQuery("");
                }}
                className="w-fit"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const urgency = getOrderUrgency(order);

            return (
              <Card
                key={order._id}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  urgency === "critical" ? "border-orange-500 border-2 bg-orange-500/5" : ""
                } ${urgency === "warning" ? "border-amber-500 border-2 bg-amber-500/5" : ""}`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-foreground">
                          {order.orderNumber}
                        </h3>
                        <Badge className={`${statusConfig.color} border-none`}>
                          <statusConfig.icon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {paymentModel === "payLater" && (
                          <Badge
                            variant={order.status === "completed" ? "default" : "outline"}
                            className={order.status === "completed" ? "bg-green-500" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500"}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            {order.status === "completed" ? "Paid" : "Unpaid"}
                          </Badge>
                        )}
                        {urgency !== "normal" && (
                          <Badge variant="destructive" className="animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {urgency === "critical" ? "Overdue!" : "Urgent"}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {order.table && (
                          <div className="flex items-center text-muted-foreground">
                            <TableIcon className="w-4 h-4 mr-2" />
                            <span className="font-medium text-foreground">
                              Table {order.table.tableNumber}
                            </span>
                            {order.table.location && (
                              <span className="ml-1">({order.table.location})</span>
                            )}
                          </div>
                        )}

                        {order.customerName && (
                          <div className="flex items-center text-muted-foreground">
                            <User className="w-4 h-4 mr-2" />
                            <span className="font-medium text-foreground">
                              {order.customerName}
                            </span>
                            {order.customerCount && (
                              <span className="ml-1">({order.customerCount} guests)</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="ml-1 font-semibold text-foreground">
                            ({getElapsedTime(order.createdAt)})
                          </span>
                        </div>

                        <div className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {order.items.length} items
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Price */}
                    <div className="text-right ml-4">
                      <div className="flex items-center justify-end text-3xl font-bold text-primary mb-1">
                        <DollarSign className="w-6 h-6" />
                        <span>{order.total.toFixed(2)}</span>
                      </div>
                      {order.createdByUser && (
                        <p className="text-xs text-muted-foreground">
                          by {order.createdByUser.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No orders match "${searchQuery}"`
                : `No ${filterStatus} orders available`}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Order {selectedOrder.orderNumber}</DialogTitle>
                  <Badge className={`${getStatusConfig(selectedOrder.status).color} border-none`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </Badge>
                </div>
                <DialogDescription>
                  Order details and status management
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  {selectedOrder.table && (
                    <div>
                      <Label className="text-muted-foreground">Table</Label>
                      <p className="font-semibold text-foreground">
                        {selectedOrder.table.tableNumber} ({selectedOrder.table.location})
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-semibold text-foreground">
                      {selectedOrder.customerName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Guests</Label>
                    <p className="font-semibold text-foreground">
                      {selectedOrder.customerCount || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Waiter</Label>
                    <p className="font-semibold text-foreground">
                      {selectedOrder.createdByUser?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time</Label>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Elapsed</Label>
                    <p className="font-semibold text-foreground">
                      {getElapsedTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Order Items with Individual Status Controls */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => {
                      const itemStatusConfig = getStatusConfig(item.status as any);
                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                {item.quantity}x {item.menuItem.name}
                              </span>
                              <Badge className={`${itemStatusConfig.color} border-none text-xs`}>
                                <itemStatusConfig.icon className="w-3 h-3 mr-1" />
                                {item.status}
                              </Badge>
                            </div>
                            {item.specialInstructions && (
                              <p className="text-sm text-muted-foreground italic">
                                Note: {item.specialInstructions}
                              </p>
                            )}

                            {/* Item Status Controls */}
                            {selectedOrder.status !== "completed" &&
                              selectedOrder.status !== "cancelled" && (
                                <div className="flex gap-1 mt-2">
                                  {item.status !== "preparing" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateItemStatus(
                                          selectedOrder._id,
                                          item.id,
                                          "preparing"
                                        );
                                      }}
                                      className="text-xs h-7"
                                    >
                                      <ChefHat className="w-3 h-3 mr-1" />
                                      Preparing
                                    </Button>
                                  )}
                                  {item.status !== "ready" && item.status !== "served" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateItemStatus(
                                          selectedOrder._id,
                                          item.id,
                                          "ready"
                                        );
                                      }}
                                      className="text-xs h-7"
                                    >
                                      <Bell className="w-3 h-3 mr-1" />
                                      Ready
                                    </Button>
                                  )}
                                  {item.status !== "served" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateItemStatus(
                                          selectedOrder._id,
                                          item.id,
                                          "served"
                                        );
                                      }}
                                      className="text-xs h-7"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Served
                                    </Button>
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (10%):</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold text-foreground">
                      <span>Total:</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                {selectedOrder.status !== "completed" &&
                  selectedOrder.status !== "cancelled" && (
                    <>
                      <Separator />
                      <div>
                        <Label className="mb-3 block">Update Order Status:</Label>
                        <div className="flex gap-2 flex-wrap">
                          {getNextStatus(selectedOrder.status) && (
                            <Button
                              size="lg"
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedOrder._id,
                                  getNextStatus(selectedOrder.status)!
                                )
                              }
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as {getNextStatus(selectedOrder.status)}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="lg"
                            onClick={() => setOrderToDelete(selectedOrder)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                {paymentModel === "payLater" && selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                  <Button
                    onClick={() => {
                      toast.success(`Payment of $${selectedOrder.total.toFixed(2)} collected for ${selectedOrder.orderNumber}`);
                      handleUpdateStatus(selectedOrder._id, "completed");
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Collect Payment
                  </Button>
                )}
                <Button onClick={() => handlePrintReceipt(selectedOrder)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order{" "}
              <span className="font-semibold">{orderToDelete?.orderNumber}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-destructive hover:bg-destructive/90"
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Receipt (Hidden) */}
      {orderToPrint && (
        <div id="print-receipt" className="hidden print:block p-8 bg-white text-black">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center mb-4">Restaurant Receipt</h1>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order:</span>
                <span className="font-semibold">{orderToPrint.orderNumber}</span>
              </div>
              {orderToPrint.table && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-semibold">{orderToPrint.table.tableNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(orderToPrint.createdAt).toLocaleString()}</span>
              </div>
              {orderToPrint.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{orderToPrint.customerName}</span>
                </div>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              {orderToPrint.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.menuItem.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${orderToPrint.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${orderToPrint.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Total:</span>
                <span>${orderToPrint.total.toFixed(2)}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-center text-sm">Thank you for dining with us!</p>
          </div>
        </div>
      )}
    </div>
  );
}
