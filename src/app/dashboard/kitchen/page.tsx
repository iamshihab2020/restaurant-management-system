"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/lib/mock-data/orders";
import { Order, OrderItem } from "@/types";
import { Clock, ChefHat, AlertCircle, CheckCircle2, Volume2, VolumeX, Filter, ArrowUpDown } from "lucide-react";
import {
  playNewOrderSound,
  playOrderReadySound,
  toggleSounds,
  areSoundsEnabled,
} from "@/lib/notification-sounds";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "time-asc" | "time-desc" | "table-asc" | "urgency";
type StatusFilter = "all" | "confirmed" | "preparing" | "ready";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(areSoundsEnabled());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("time-asc");

  // Update current time 
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle sound 
  const handleSoundToggle = () => {
    const newState = toggleSounds();
    setSoundEnabled(newState);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore 
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          handleSoundToggle();
          break;
        case "a":
          setStatusFilter("all");
          break;
        case "c":
          setStatusFilter("confirmed");
          break;
        case "p":
          setStatusFilter("preparing");
          break;
        case "r":
          setStatusFilter("ready");
          break;
        case "u":
          setSortBy("urgency");
          break;
        case "t":
          setSortBy("time-asc");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [soundEnabled]);

  //  kitchen (confirmed, preparing, ready)
  const kitchenOrders = orders
    .filter((order) => {
      // First filter by kitchen statuses
      if (!["confirmed", "preparing", "ready"].includes(order.status)) {
        return false;
      }
      // Then apply status filter
      if (statusFilter === "all") return true;
      return order.status === statusFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "time-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "time-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "table-asc":
          return a.table.tableNumber - b.table.tableNumber;
        case "urgency": {
          const urgencyA = getElapsedMinutes(a.createdAt);
          const urgencyB = getElapsedMinutes(b.createdAt);
          return urgencyB - urgencyA; // Most urgent (longest wait) first
        }
        default:
          return 0;
      }
    });


  const getElapsedMinutes = (createdAt: Date): number => {
    const diff = currentTime.getTime() - new Date(createdAt).getTime();
    return Math.floor(diff / 60000);
  };


  const formatElapsedTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  
  const getPriorityColor = (minutes: number) => {
    if (minutes < 15) return "border-primary bg-primary/10"; // Green: Fresh order
    if (minutes < 30) return "border-amber-500 bg-amber-500/10"; // Amber: Needs attention
    return "border-orange-500 bg-orange-500/10"; // Orange: Urgent
  };

  /**
   * Get timer text color based on elapsed time
   */
  const getTimerColor = (minutes: number) => {
    if (minutes < 15) return "text-primary"; // Green
    if (minutes < 30) return "text-amber-500"; // Amber
    return "text-orange-500"; // Orange
  };

  /**
   * Mark order item as ready
   */
  const markItemReady = (orderId: string, itemId: string) => {
    setOrders(
      orders.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, status: "ready" as const, preparedAt: new Date() } : item
        );

        // If all items are ready, update order status
        const allReady = updatedItems.every((item) => item.status === "ready");

        // Play sound when order becomes ready
        if (allReady) {
          playOrderReadySound();
        }

        return {
          ...order,
          items: updatedItems,
          status: allReady ? ("ready" as const) : order.status,
          updatedAt: new Date(),
        };
      })
    );
  };


  const markOrderReady = (orderId: string) => {
    playOrderReadySound();

    setOrders(
      orders.map((order) => {
        if (order.id !== orderId) return order;

        return {
          ...order,
          items: order.items.map((item) => ({
            ...item,
            status: "ready" as const,
            preparedAt: new Date(),
          })),
          status: "ready" as const,
          updatedAt: new Date(),
        };
      })
    );
  };


  const startPreparingOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "preparing" as const,
              items: order.items.map((item) => ({
                ...item,
                status: item.status === "pending" ? ("preparing" as const) : item.status,
              })),
              updatedAt: new Date(),
            }
          : order
      )
    );
  };


  const bumpOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "served" as const,
              updatedAt: new Date(),
            }
          : order
      )
    );
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Live Clock */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kitchen Display</h1>
          <p className="text-muted-foreground mt-1">Active orders for preparation</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSoundToggle}
            className="gap-2"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                Sound On
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                Sound Off
              </>
            )}
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
              M
            </kbd>
          </Button>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground font-mono">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Sort:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time-asc">Oldest First</SelectItem>
              <SelectItem value="time-desc">Newest First</SelectItem>
              <SelectItem value="table-asc">Table Number</SelectItem>
              <SelectItem value="urgency">Most Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">M</kbd>
            <span>Sound</span>
            <span className="text-border">|</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">A</kbd>
            <span>All</span>
            <span className="text-border">|</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">C</kbd>
            <span>Confirmed</span>
            <span className="text-border">|</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">P</kbd>
            <span>Preparing</span>
            <span className="text-border">|</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">R</kbd>
            <span>Ready</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {kitchenOrders.length} order{kitchenOrders.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-primary">
                  {kitchenOrders.filter((o) => o.status === "confirmed").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preparing</p>
                <p className="text-2xl font-bold text-primary">
                  {kitchenOrders.filter((o) => o.status === "preparing").length}
                </p>
              </div>
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold text-primary">
                  {kitchenOrders.filter((o) => o.status === "ready").length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {kitchenOrders.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {kitchenOrders.map((order) => {
          const elapsedMinutes = getElapsedMinutes(order.createdAt);
          const priorityColor = getPriorityColor(elapsedMinutes);

          return (
            <Card
              key={order.id}
              className={`border-4 ${priorityColor} shadow-lg`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <CardTitle className="text-4xl font-bold">
                        Table {order.table.tableNumber}
                      </CardTitle>
                      <span className="text-lg text-muted-foreground">
                        {order.orderNumber}
                      </span>
                    </div>
                    {order.table.location && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.table.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold font-mono ${getTimerColor(elapsedMinutes)}`}
                    >
                      {formatElapsedTime(elapsedMinutes)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {order.customerName && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Customer: {order.customerName}
                    {order.customerCount && ` (${order.customerCount} guests)`}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Order Items */}
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 ${
                      item.status === "ready"
                        ? "bg-primary/10 border-primary"
                        : item.status === "preparing"
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-foreground">
                            {item.quantity}x
                          </span>
                          <span className="font-semibold text-foreground">
                            {item.menuItem.name}
                          </span>
                        </div>
                        {item.specialInstructions && (
                          <p className="text-sm text-destructive font-medium mt-1 italic">
                            ⚠️ {item.specialInstructions}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Prep time: ~{item.menuItem.preparationTime} min
                        </p>
                      </div>

                      {item.status === "ready" ? (
                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markItemReady(order.id, item.id)}
                          className="bg-card hover:bg-primary/10 flex-shrink-0"
                        >
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Special Requests */}
                {order.specialRequests && (
                  <div className="p-3 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
                    <p className="text-sm font-semibold text-destructive">
                      📝 Special Request:
                    </p>
                    <p className="text-sm text-destructive mt-1">
                      {order.specialRequests}
                    </p>
                  </div>
                )}

                {/* Order Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  {order.status === "confirmed" && (
                    <Button
                      className="flex-1 bg-primary hover:bg-primary"
                      onClick={() => startPreparingOrder(order.id)}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Start Preparing
                    </Button>
                  )}

                  {order.status === "preparing" && (
                    <Button
                      className="flex-1 bg-primary hover:bg-primary"
                      onClick={() => markOrderReady(order.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark All Ready
                    </Button>
                  )}

                  {order.status === "ready" && (
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => bumpOrder(order.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Bump (Served)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {kitchenOrders.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Active Orders
            </h3>
            <p className="text-muted-foreground">
              All caught up! No orders currently in the kitchen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
