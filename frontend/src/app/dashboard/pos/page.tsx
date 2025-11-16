"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MenuItem,
  Table,
  MenuCategory,
  SelectedModifier,
} from "@/types";
import {
  mockModifierGroups,
  getModifierGroupsForCategory,
  ModifierGroup,
  ModifierOption,
} from "@/lib/mock-data/modifiers";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Smartphone,
  Wallet,
  Receipt,
  Users,
  Clock,
  ShoppingCart,
  Send,
  PauseCircle,
  X,
  Calculator,
  Percent,
  Gift,
  SplitSquareHorizontal,
  ChefHat,
  Package,
  Printer,
  Download,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAvailableTables } from "@/lib/hooks/use-tables";
import { useMenuItems } from "@/lib/hooks/use-menu";
import { useCreateOrder } from "@/lib/hooks/use-orders";
import { useCreatePayment } from "@/lib/hooks/use-payments";
import type { PaymentMethod } from "@/lib/api/services/payments.service";
import {
  playNewOrderSound,
  playOrderReadySound,
} from "@/lib/notification-sounds";

/**
 * POS (Point of Sale) Page
 * Complete POS system with order creation, payment processing, and split bill functionality
 */

// Utility functions
const calculateTipFromPercentage = (amount: number, percentage: number): number => {
  return (amount * percentage) / 100;
};

const calculateChange = (received: number, total: number): number => {
  return Math.max(0, received - total);
};

type POSMode = "table" | "quick";

interface OrderItemWithQuantity {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers?: SelectedModifier[];
  specialInstructions?: string;
  tempId: string;
}

interface SplitBillItem {
  id: string;
  items: OrderItemWithQuantity[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: PaymentMethod;
  tip?: number;
  paid: boolean;
}

export default function POSPage() {
  // Payment Model
  const [paymentModel, setPaymentModel] = useState<"payFirst" | "payLater">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paymentModel");
      return (saved as "payFirst" | "payLater") || "payLater";
    }
    return "payLater";
  });

  // React Query hooks
  const { data: tables = [], isLoading: tablesLoading } = useAvailableTables();
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems();
  const createOrderMutation = useCreateOrder();
  const createPaymentMutation = useCreatePayment();

  // Mode and Table Selection
  const [mode, setMode] = useState<POSMode>("table");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableSelector, setShowTableSelector] = useState(false);

  // Menu State
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Current Order State
  const [orderItems, setOrderItems] = useState<OrderItemWithQuantity[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerCount, setCustomerCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");

  // Payment State
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  // Split Bill State
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitBills, setSplitBills] = useState<SplitBillItem[]>([]);

  // Hold Orders State
  const [heldOrders, setHeldOrders] = useState<Array<{
    id: string;
    items: OrderItemWithQuantity[];
    table?: Table;
    customerName?: string;
    timestamp: Date;
  }>>([]);
  const [showHeldOrders, setShowHeldOrders] = useState(false);

  // Discount Dialog
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);

  // Clear Order Confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Receipt State
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string;
    date: Date;
    table?: string;
    items: OrderItemWithQuantity[];
    subtotal: number;
    tax: number;
    discount: number;
    tip: number;
    total: number;
    paymentMethod: PaymentMethod;
    transactionId: string;
    change: number;
    customerName?: string;
  } | null>(null);

  // Modifier Dialog State
  const [showModifierDialog, setShowModifierDialog] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [modifierQuantity, setModifierQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Map<string, string[]>>(new Map()); // groupId -> optionIds[]
  const [itemNotes, setItemNotes] = useState("");
  const [applicableModifiers, setApplicableModifiers] = useState<ModifierGroup[]>([]);

  // Load data
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          handleNewOrder();
          break;
        case "t":
          if (mode === "table") {
            setShowTableSelector(true);
          }
          break;
        case "p":
          if (orderItems.length > 0) {
            setShowPaymentDialog(true);
          }
          break;
        case "h":
          handleHoldOrder();
          break;
        case "/":
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          break;
        case "escape":
          if (showPaymentDialog) setShowPaymentDialog(false);
          else if (showSplitDialog) setShowSplitDialog(false);
          else setShowClearConfirm(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [mode, orderItems, showPaymentDialog, showSplitDialog]);

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => {
    const basePrice = item.menuItem.price;
    const modifierTotal = item.selectedModifiers?.reduce((modSum, m) => modSum + m.price, 0) || 0;
    return sum + (basePrice + modifierTotal) * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (discount > 0) {
    discountAmount = discountType === "percent"
      ? (subtotal * discount) / 100
      : Math.min(discount, subtotal);
  }

  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * 0.1; // 10% tax
  const tipAmount = tipPercentage > 0
    ? calculateTipFromPercentage(subtotalAfterDiscount, tipPercentage)
    : customTip ? parseFloat(customTip) : 0;
  const total = subtotalAfterDiscount + tax + tipAmount;

  // Quick add item with default modifiers (no dialog)
  const handleQuickAdd = (menuItem: MenuItem) => {
    // Load applicable modifiers for this item's category
    const modifiers = getModifierGroupsForCategory(menuItem.category);

    // Build default modifiers array
    const modifiersArray: SelectedModifier[] = [];
    let modifierTotal = 0;

    modifiers.forEach(group => {
      if (group.type === "single") {
        // For single-select, use default or first option
        const defaultOption = group.options.find(opt => opt.isDefault) || group.options[0];
        if (defaultOption) {
          modifiersArray.push({
            modifierGroupId: group.id,
            modifierGroupName: group.name,
            optionId: defaultOption.id,
            optionName: defaultOption.name,
            price: defaultOption.price,
          });
          modifierTotal += defaultOption.price;
        }
      }
      // Skip multi-select groups in quick add (no defaults selected)
    });

    // Check if this exact item (same menu item + same modifiers) already exists
    const existingItemIndex = orderItems.findIndex(item => {
      if (item.menuItemId !== menuItem._id) return false;

      // Compare modifiers
      const existingMods = item.selectedModifiers || [];
      const newMods = modifiersArray;

      if (existingMods.length !== newMods.length) return false;

      // Check if all modifiers match
      return newMods.every(newMod =>
        existingMods.some(existingMod =>
          existingMod.modifierGroupId === newMod.modifierGroupId &&
          existingMod.optionId === newMod.optionId
        )
      );
    });

    if (existingItemIndex !== -1) {
      // Item exists, increment quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };
      setOrderItems(updatedItems);
      toast.success(`Added ${menuItem.name} (${updatedItems[existingItemIndex].quantity})`);
    } else {
      // New item, add to cart
      const newItem: OrderItemWithQuantity = {
        menuItemId: menuItem._id,
        menuItem: menuItem,
        quantity: 1,
        selectedModifiers: modifiersArray.length > 0 ? modifiersArray : undefined,
        tempId: `temp-${Date.now()}-${Math.random()}`,
      };

      setOrderItems([...orderItems, newItem]);

      const totalPrice = menuItem.price + modifierTotal;
      toast.success(`Added ${menuItem.name} - $${totalPrice.toFixed(2)}`);
    }
  };

  // Add item to order - Open modifier dialog
  const handleAddItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setModifierQuantity(1);
    setSelectedModifiers(new Map());
    setItemNotes("");

    // Load applicable modifiers for this item's category
    const modifiers = getModifierGroupsForCategory(menuItem.category);
    setApplicableModifiers(modifiers);

    // Set default selections for required single-select groups
    const defaultSelections = new Map<string, string[]>();
    modifiers.forEach(group => {
      if (group.type === "single" && group.required) {
        const defaultOption = group.options.find(opt => opt.isDefault) || group.options[0];
        if (defaultOption) {
          defaultSelections.set(group.id, [defaultOption.id]);
        }
      }
    });
    setSelectedModifiers(defaultSelections);

    setShowModifierDialog(true);
  };

  // Add item from modifier dialog
  const handleAddItemWithModifiers = () => {
    if (!selectedMenuItem) return;

    // Build selected modifiers array with prices
    const modifiersArray: SelectedModifier[] = [];
    let modifierTotal = 0;

    selectedModifiers.forEach((optionIds, groupId) => {
      const group = applicableModifiers.find(g => g.id === groupId);
      if (group) {
        optionIds.forEach(optionId => {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            modifiersArray.push({
              modifierGroupId: groupId,
              modifierGroupName: group.name,
              optionId: option.id,
              optionName: option.name,
              price: option.price,
            });
            modifierTotal += option.price;
          }
        });
      }
    });

    const newItem: OrderItemWithQuantity = {
      menuItemId: selectedMenuItem.id,
      menuItem: selectedMenuItem,
      quantity: modifierQuantity,
      specialInstructions: itemNotes || undefined,
      selectedModifiers: modifiersArray.length > 0 ? modifiersArray : undefined,
      tempId: `temp-${Date.now()}-${Math.random()}`,
    };

    setOrderItems([...orderItems, newItem]);
    setShowModifierDialog(false);

    const totalPrice = (selectedMenuItem.price + modifierTotal) * modifierQuantity;
    toast.success(`Added ${modifierQuantity}x ${selectedMenuItem.name} - $${totalPrice.toFixed(2)}`);
  };

  // Update item quantity
  const handleUpdateQuantity = (tempId: string, change: number) => {
    setOrderItems(
      orderItems
        .map((item) =>
          item.tempId === tempId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const handleRemoveItem = (tempId: string) => {
    setOrderItems(orderItems.filter((item) => item.tempId !== tempId));
  };

  // New order
  const handleNewOrder = () => {
    if (orderItems.length > 0) {
      setShowClearConfirm(true);
    } else {
      clearOrder();
    }
  };

  // Clear order
  const clearOrder = () => {
    setOrderItems([]);
    setSelectedTable(null);
    setCustomerName("");
    setCustomerCount(1);
    setSpecialRequests("");
    setDiscount(0);
    setDiscountType("percent");
    setTipPercentage(0);
    setCustomTip("");
    setCashReceived("");
    setShowClearConfirm(false);
  };

  // Hold order
  const handleHoldOrder = () => {
    if (orderItems.length === 0) {
      toast.error("No items in order to hold");
      return;
    }

    const heldOrder = {
      id: `held-${Date.now()}`,
      items: [...orderItems],
      table: selectedTable || undefined,
      customerName: customerName || undefined,
      timestamp: new Date(),
    };

    setHeldOrders([...heldOrders, heldOrder]);
    clearOrder();
    toast.success("Order held successfully");
  };

  // Recall held order
  const handleRecallOrder = (heldOrder: typeof heldOrders[0]) => {
    setOrderItems(heldOrder.items);
    setSelectedTable(heldOrder.table || null);
    setCustomerName(heldOrder.customerName || "");
    setHeldOrders(heldOrders.filter((o) => o.id !== heldOrder.id));
    setShowHeldOrders(false);
    toast.success("Order recalled");
  };

  // Send to kitchen
  const handleSendToKitchen = async () => {
    if (orderItems.length === 0) {
      toast.error("Add items to the order first");
      return;
    }

    if (mode === "table" && !selectedTable) {
      toast.error("Select a table first");
      setShowTableSelector(true);
      return;
    }

    try {
      const orderInput = {
        tableId: selectedTable?._id || "takeout",
        items: orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers,
          specialInstructions: item.specialInstructions,
        })),
        customerName: customerName || undefined,
        customerCount: mode === "table" ? customerCount : undefined,
        specialRequests: specialRequests || undefined,
        discount: discountAmount,
        discountType: discountType === "percent" ? ("percentage" as const) : ("fixed" as const),
      };

      await createOrderMutation.mutateAsync(orderInput);

      playNewOrderSound();
      toast.success("Order sent to kitchen!");

      // Clear order but keep table/customer for next order
      setOrderItems([]);
      setSpecialRequests("");
      setDiscount(0);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to send order");
    }
  };

  // Process payment
  const handleProcessPayment = async () => {
    if (orderItems.length === 0) {
      toast.error("No items to pay for");
      return;
    }

    // Validate cash payment
    if (paymentMethod === "cash") {
      const received = parseFloat(cashReceived);
      if (!cashReceived || received < total) {
        toast.error("Cash received must be at least the total amount");
        return;
      }
    }

    try {
      // First create the order
      const orderInput = {
        tableId: selectedTable?._id || "takeout",
        items: orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers,
          specialInstructions: item.specialInstructions,
        })),
        customerName: customerName || undefined,
        customerCount: mode === "table" ? customerCount : undefined,
        specialRequests: specialRequests || undefined,
        discount: discountAmount,
        discountType: discountType === "percent" ? ("percentage" as const) : ("fixed" as const),
        tip: tipAmount,
      };

      const newOrder = await createOrderMutation.mutateAsync(orderInput);

      // Process payment
      const payment = await createPaymentMutation.mutateAsync({
        orderId: newOrder._id,
        method: paymentMethod,
        amount: total,
        tip: tipAmount,
        notes: paymentMethod === "cash" ? `Cash received: $${cashReceived}` : undefined,
      });

      playOrderReadySound();

      // Prepare receipt data
      const change = paymentMethod === "cash" ? calculateChange(parseFloat(cashReceived), total) : 0;

      setReceiptData({
        orderNumber: newOrder.orderNumber,
        date: new Date(),
        table: selectedTable?.tableNumber.toString(),
        items: orderItems,
        subtotal,
        tax: tax,
        discount: discountAmount,
        tip: tipAmount,
        total,
        paymentMethod,
        transactionId: payment.transactionId || "",
        change,
        customerName: customerName || undefined,
      });

      // Show success toast
      toast.success(
        `Payment successful!${
          change > 0 ? ` Change: $${change.toFixed(2)}` : ""
        }`
      );

      // Close payment dialog
      setShowPaymentDialog(false);

      // Trigger print after a short delay to ensure state is updated
      setTimeout(() => {
        window.print();
      }, 100);

      // Clear order after printing
      setTimeout(() => {
        clearOrder();
      }, 500);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    }
  };

  // Initialize equal split
  const handleInitializeSplit = () => {
    const bills: SplitBillItem[] = [];
    const itemsPerBill = Math.ceil(orderItems.length / splitCount);

    for (let i = 0; i < splitCount; i++) {
      const billItems = orderItems.slice(i * itemsPerBill, (i + 1) * itemsPerBill);
      const billSubtotal = billItems.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      const billDiscountAmount = discountType === "percent"
        ? (billSubtotal * discount) / 100
        : discount / splitCount;
      const billSubtotalAfterDiscount = billSubtotal - billDiscountAmount;
      const billTax = billSubtotalAfterDiscount * 0.1;
      const billTotal = billSubtotalAfterDiscount + billTax;

      bills.push({
        id: `bill-${i + 1}`,
        items: billItems,
        subtotal: billSubtotal,
        tax: billTax,
        total: billTotal,
        paid: false,
      });
    }

    setSplitBills(bills);
    setShowSplitDialog(true);
    setShowPaymentDialog(false);
  };

  // Process split payment
  const handleProcessSplitPayment = async () => {
    const unpaidBills = splitBills.filter((bill) => !bill.paid);

    if (unpaidBills.length > 0) {
      toast.error(`${unpaidBills.length} bill(s) still need payment`);
      return;
    }

    try {
      // Create order first
      const orderInput: CreateOrderInput = {
        tableId: selectedTable?.id || "takeout",
        items: orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        customerName: customerName || undefined,
        customerCount: mode === "table" ? customerCount : undefined,
        specialRequests: `Split bill (${splitCount} ways)${specialRequests ? `: ${specialRequests}` : ""}`,
      };

      const newOrder = await createOrder(orderInput, "current-user-id");

      // Process split payments
      const splitPayments = splitBills.map((bill) => ({
        amount: bill.total,
        method: bill.paymentMethod!,
        tip: bill.tip || 0,
        notes: `Split bill ${bill.id}`,
      }));

      const payments = await processSplitPayment(newOrder.id, splitPayments, "current-user-id");

      // Update order status
      await updateOrderStatus(newOrder.id, "completed");

      playOrderReadySound();

      // Calculate totals for receipt
      const totalTip = splitBills.reduce((sum, bill) => sum + (bill.tip || 0), 0);
      const splitTotal = splitBills.reduce((sum, bill) => sum + bill.total, 0);

      // Prepare receipt data
      setReceiptData({
        orderNumber: newOrder.id,
        date: new Date(),
        table: selectedTable?.tableNumber.toString(),
        items: orderItems,
        subtotal,
        tax: tax,
        discount: discountAmount,
        tip: totalTip,
        total: splitTotal,
        paymentMethod: "credit_card", // Mixed payment methods
        transactionId: payments[0].transactionId || "",
        change: 0,
        customerName: customerName || undefined,
      });

      toast.success("Split payment completed!");

      // Close split dialog
      setShowSplitDialog(false);
      setSplitBills([]);

      // Trigger print after a short delay
      setTimeout(() => {
        window.print();
      }, 100);

      // Clear order after printing
      setTimeout(() => {
        clearOrder();
      }, 500);
    } catch (error) {
      console.error("Error processing split payment:", error);
      toast.error("Failed to process split payment");
    }
  };

  // Mark split bill as paid
  const handleMarkBillPaid = (billId: string, method: PaymentMethod, tip: number = 0) => {
    setSplitBills(
      splitBills.map((bill) =>
        bill.id === billId
          ? { ...bill, paymentMethod: method, tip, paid: true }
          : bill
      )
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-3 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Point of Sale</h1>
          <p className="text-muted-foreground mt-1">
            {mode === "table"
              ? selectedTable
                ? `Table ${selectedTable.tableNumber}${selectedTable.location ? ` (${selectedTable.location})` : ""}`
                : "Select a table to begin"
              : "Quick Service Mode"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={mode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setMode("table");
                if (orderItems.length === 0) setSelectedTable(null);
              }}
            >
              Table Service
            </Button>
            <Button
              variant={mode === "quick" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setMode("quick");
                setSelectedTable(null);
              }}
            >
              Quick Service
            </Button>
          </div>

          {/* Held Orders */}
          <Button
            variant="outline"
            onClick={() => setShowHeldOrders(true)}
            className="gap-2"
          >
            <PauseCircle className="h-4 w-4" />
            Held ({heldOrders.length})
          </Button>

          {/* New Order */}
          <Button onClick={handleNewOrder} className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-white/30 bg-white/20 text-white px-1.5 font-mono text-[10px] font-medium">
              N
            </kbd>
          </Button>
        </div>
      </div>

      {/* Main POS Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-3 min-h-0">
        {/* Left Panel: Menu */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Menu</CardTitle>
              {mode === "table" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTableSelector(true)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  {selectedTable ? `Table ${selectedTable.tableNumber}` : "Select Table"}
                  <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    T
                  </kbd>
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <FormInput
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MenuCategory | "all")} className="flex-shrink-0">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="appetizer">Appetizers</TabsTrigger>
                <TabsTrigger value="main_course">Mains</TabsTrigger>
                <TabsTrigger value="dessert">Desserts</TabsTrigger>
                <TabsTrigger value="beverage">Beverages</TabsTrigger>
                <TabsTrigger value="special">Specials</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Menu Items Grid */}
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {filteredMenuItems.map((item) => {
                  const modifiers = getModifierGroupsForCategory(item.category);
                  const hasModifiers = modifiers.length > 0;

                  return (
                    <Card
                      key={item._id}
                      className="hover:shadow-xl transition-all border-2 hover:border-primary overflow-hidden group"
                    >
                      <div
                        className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                        onClick={() => handleQuickAdd(item)}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-muted-foreground/30" />
                        )}
                        {item.isVegetarian && (
                          <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0 shadow-lg">
                            VEG
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg line-clamp-1">{item.name}</h3>
                            <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleQuickAdd(item)}
                            className="flex-1 h-10 gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                          {hasModifiers && (
                            <Button
                              onClick={() => handleAddItem(item)}
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              title="Customize"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Panel: Current Order */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Order
            </CardTitle>
            {mode === "table" && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Customer Name</label>
                  <FormInput
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Covers</label>
                  <Select
                    value={customerCount.toString()}
                    onValueChange={(value) => setCustomerCount(parseInt(value))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Order Items */}
            <ScrollArea className="flex-1 border rounded-lg">
              {orderItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Package className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">No items added yet</p>
                  <p className="text-xs">Select items from the menu</p>
                </div>
              ) : (
                <div className="divide-y">
                  {orderItems.map((item) => (
                    <div key={item.tempId} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 rounded-lg"
                          onClick={() => handleUpdateQuantity(item.tempId, -1)}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <span className="font-bold text-xl w-10 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 rounded-lg"
                          onClick={() => handleUpdateQuantity(item.tempId, 1)}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">{item.menuItem.name}</p>

                        {/* Show only paid modifiers */}
                        {item.selectedModifiers && item.selectedModifiers.some(m => m.price > 0) && (
                          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            {item.selectedModifiers
                              .filter(modifier => modifier.price > 0)
                              .map((modifier, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <span>• {modifier.optionName}</span>
                                  <span className="text-primary font-medium">+${modifier.price.toFixed(2)}</span>
                                </div>
                              ))}
                          </div>
                        )}

                        {item.specialInstructions && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${(() => {
                            const basePrice = item.menuItem.price;
                            const modifierTotal = item.selectedModifiers?.reduce((sum, m) => sum + m.price, 0) || 0;
                            return ((basePrice + modifierTotal) * item.quantity).toFixed(2);
                          })()}
                        </p>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => handleRemoveItem(item.tempId)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Totals */}
            <div className="flex-shrink-0 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Discount ({discountType === "percent" ? `${discount}%` : "$"}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDiscountDialog(true)}
                disabled={orderItems.length === 0}
                className="gap-2 h-12 text-base font-semibold"
                size="lg"
              >
                <Percent className="h-5 w-5" />
                Discount
              </Button>

              {paymentModel === "payLater" && (
                <Button
                  variant="outline"
                  onClick={handleSendToKitchen}
                  disabled={orderItems.length === 0}
                  className="gap-2 h-12 text-base font-semibold"
                  size="lg"
                >
                  <ChefHat className="h-5 w-5" />
                  Send to Kitchen
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleHoldOrder}
                disabled={orderItems.length === 0}
                className="gap-2 h-12 text-base font-semibold"
                size="lg"
              >
                <PauseCircle className="h-5 w-5" />
                Hold
              </Button>

              <Button
                onClick={() => setShowPaymentDialog(true)}
                disabled={orderItems.length === 0}
                className="gap-2 h-14 text-lg font-bold shadow-lg hover:shadow-xl"
                size="lg"
              >
                <DollarSign className="h-6 w-6" />
                {paymentModel === "payFirst" ? "Complete Order" : "Pay Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Selector Dialog */}
      <Dialog open={showTableSelector} onOpenChange={setShowTableSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Table</DialogTitle>
            <DialogDescription>Choose a table for this order</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto py-4">
            {tables.map((table) => (
              <Button
                key={table._id}
                variant={selectedTable?._id === table._id ? "default" : "outline"}
                className="h-20 flex flex-col"
                onClick={() => {
                  setSelectedTable(table);
                  setShowTableSelector(false);
                }}
              >
                <span className="text-2xl font-bold">{table.tableNumber}</span>
                <span className="text-xs">{table.capacity} seats</span>
                {table.location && <span className="text-xs text-muted-foreground">{table.location}</span>}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Modifiers Dialog */}
      <Dialog open={showModifierDialog} onOpenChange={setShowModifierDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Customize {selectedMenuItem?.name}</DialogTitle>
            <DialogDescription>
              Add modifiers and special instructions for this item
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4 pr-4">
              {/* Quantity */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 rounded-lg"
                    onClick={() => setModifierQuantity(Math.max(1, modifierQuantity - 1))}
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <span className="text-3xl font-bold w-16 text-center">{modifierQuantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 rounded-lg"
                    onClick={() => setModifierQuantity(modifierQuantity + 1)}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Dynamic Modifier Groups */}
              {applicableModifiers.map((group) => {
                const selectedOptions = selectedModifiers.get(group.id) || [];

                return (
                  <div key={group.id}>
                    <label className="text-sm font-semibold mb-3 block">
                      {group.name}
                      {group.required && <span className="text-destructive ml-1">*</span>}
                      {group.type === "multiple" && group.maxSelections && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Max {group.maxSelections})
                        </span>
                      )}
                    </label>
                    <div className={`grid gap-2 ${group.options.length > 4 ? "grid-cols-2" : "grid-cols-" + Math.min(group.options.length, 4)}`}>
                      {group.options.map((option) => {
                        const isSelected = selectedOptions.includes(option.id);

                        return (
                          <Button
                            key={option.id}
                            variant={isSelected ? "default" : "outline"}
                            className="h-auto py-3 text-sm flex flex-col items-start"
                            onClick={() => {
                              const newSelections = new Map(selectedModifiers);

                              if (group.type === "single") {
                                // Single select - replace selection
                                newSelections.set(group.id, [option.id]);
                              } else {
                                // Multiple select - toggle
                                const current = newSelections.get(group.id) || [];
                                if (isSelected) {
                                  const updated = current.filter(id => id !== option.id);
                                  if (updated.length > 0) {
                                    newSelections.set(group.id, updated);
                                  } else {
                                    newSelections.delete(group.id);
                                  }
                                } else {
                                  // Check max selections
                                  if (!group.maxSelections || current.length < group.maxSelections) {
                                    newSelections.set(group.id, [...current, option.id]);
                                  }
                                }
                              }

                              setSelectedModifiers(newSelections);
                            }}
                          >
                            <span className="font-medium">{option.name}</span>
                            {option.price > 0 && (
                              <span className="text-xs mt-1">+${option.price.toFixed(2)}</span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Special Instructions */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Special Instructions</label>
                <FormInput
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="e.g., No pickles, well done..."
                  className="h-12"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModifierDialog(false)}
              className="h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddItemWithModifiers}
              className="h-12 text-base font-semibold"
            >
              Add to Order - ${(() => {
                const basePrice = selectedMenuItem?.price || 0;
                let modifierTotal = 0;
                selectedModifiers.forEach((optionIds, groupId) => {
                  const group = applicableModifiers.find(g => g.id === groupId);
                  if (group) {
                    optionIds.forEach(optionId => {
                      const option = group.options.find(o => o.id === optionId);
                      if (option) modifierTotal += option.price;
                    });
                  }
                });
                return ((basePrice + modifierTotal) * modifierQuantity).toFixed(2);
              })()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Process Payment</DialogTitle>
                <DialogDescription>
                  Total amount: ${total.toFixed(2)}
                </DialogDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Payment Method */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setPaymentMethod("cash")}
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Cash</span>
                </Button>
                <Button
                  variant={paymentMethod === "credit_card" ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setPaymentMethod("credit_card")}
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Credit Card</span>
                </Button>
                <Button
                  variant={paymentMethod === "debit_card" ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setPaymentMethod("debit_card")}
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Debit Card</span>
                </Button>
                <Button
                  variant={paymentMethod === "mobile_payment" ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setPaymentMethod("mobile_payment")}
                >
                  <Smartphone className="h-6 w-6" />
                  <span>Mobile Pay</span>
                </Button>
              </div>
            </div>

            {/* Cash Payment */}
            {paymentMethod === "cash" && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <label className="text-sm font-medium">Cash Received</label>
                <FormInput
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="text-lg font-bold"
                />

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Quick Amount</label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCashReceived(total.toFixed(2))}
                    >
                      Full
                    </Button>
                    {[10, 20, 50, 100, 200, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCashReceived(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {cashReceived && parseFloat(cashReceived) >= total && (
                  <div className="flex justify-between items-center text-lg font-bold text-primary">
                    <span>Change:</span>
                    <span>${calculateChange(parseFloat(cashReceived), total).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tip */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Add Tip</label>
              <div className="grid grid-cols-5 gap-2">
                {[15, 18, 20, 25].map((percent) => (
                  <Button
                    key={percent}
                    variant={tipPercentage === percent ? "default" : "outline"}
                    onClick={() => {
                      setTipPercentage(percent);
                      setCustomTip("");
                    }}
                  >
                    {percent}%
                  </Button>
                ))}
                <Button
                  variant={customTip ? "default" : "outline"}
                  onClick={() => {
                    setTipPercentage(0);
                    const input = prompt("Enter custom tip amount:");
                    if (input) setCustomTip(input);
                  }}
                >
                  Custom
                </Button>
              </div>
              {(tipPercentage > 0 || customTip) && (
                <p className="text-sm text-muted-foreground">
                  Tip amount: ${tipAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-2 p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              {orderItems.map((item) => (
                <div key={item.tempId} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleInitializeSplit} className="gap-2">
              <SplitSquareHorizontal className="h-4 w-4" />
              Split Bill
            </Button>
            <Button onClick={handleProcessPayment} className="gap-2">
              <Receipt className="h-4 w-4" />
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Split Bill Dialog */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Split Bill</DialogTitle>
            <DialogDescription>
              Divide the bill among multiple payments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {splitBills.length === 0 ? (
              <div className="space-y-4">
                <label className="text-sm font-medium">Number of ways to split</label>
                <Select
                  value={splitCount.toString()}
                  onValueChange={(value) => setSplitCount(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} ways
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleInitializeSplit} className="w-full">
                  Initialize Split
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {splitBills.map((bill, index) => (
                  <Card key={bill.id} className={cn("relative", bill.paid && "opacity-60")}>
                    {bill.paid && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary">Paid</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">Bill {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {bill.items.map((item) => (
                        <div key={item.tempId} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.menuItem.name}</span>
                          <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${bill.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${bill.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-primary">${bill.total.toFixed(2)}</span>
                        </div>
                      </div>
                      {!bill.paid && (
                        <div className="space-y-2 pt-2">
                          <Select
                            value={bill.paymentMethod}
                            onValueChange={(value) => {
                              const method = value as PaymentMethod;
                              handleMarkBillPaid(bill.id, method, 0);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="debit_card">Debit Card</SelectItem>
                              <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSplitDialog(false);
              setSplitBills([]);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessSplitPayment}
              disabled={splitBills.some((bill) => !bill.paid)}
            >
              Complete Split Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Add a discount to the order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={discountType === "percent" ? "default" : "outline"}
                  onClick={() => setDiscountType("percent")}
                >
                  Percentage
                </Button>
                <Button
                  variant={discountType === "fixed" ? "default" : "outline"}
                  onClick={() => setDiscountType("fixed")}
                >
                  Fixed Amount
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {discountType === "percent" ? "Percentage" : "Amount"}
              </label>
              <FormInput
                type="number"
                step={discountType === "percent" ? "1" : "0.01"}
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            {discount > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium">
                  Discount amount: ${discountAmount.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  New total: ${(total).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowDiscountDialog(false)}>
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Held Orders Dialog */}
      <Dialog open={showHeldOrders} onOpenChange={setShowHeldOrders}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Held Orders</DialogTitle>
            <DialogDescription>
              Recall a previously held order
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            {heldOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PauseCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No held orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heldOrders.map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleRecallOrder(order)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {order.table ? `Table ${order.table.tableNumber}` : "Quick Service"}
                            {order.customerName && ` - ${order.customerName}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""} -
                            Held {new Date(order.timestamp).toLocaleTimeString()}
                          </p>
                          <div className="mt-2 space-y-1">
                            {order.items.slice(0, 3).map((item) => (
                              <p key={item.tempId} className="text-xs text-muted-foreground">
                                {item.quantity}x {item.menuItem.name}
                              </p>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{order.items.length - 3} more...
                              </p>
                            )}
                          </div>
                        </div>
                        <Button size="sm">Recall</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Clear Order Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Current Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items from the current order. This action cannot be undone.
              Consider holding the order instead if you want to return to it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleHoldOrder} className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">
              Hold Order
            </AlertDialogAction>
            <AlertDialogAction onClick={clearOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Receipt for Printing */}
      {receiptData && (
        <div className="hidden print:block">
          <div id="receipt-content" className="space-y-3">
            {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed pb-3">
                <h2 className="text-2xl font-bold tracking-wide">RESTAURANT POS</h2>
                <p className="text-xs text-muted-foreground mt-1">123 Main Street, City, State 12345</p>
                <p className="text-xs text-muted-foreground">Tel: (555) 123-4567</p>
              </div>

              {/* Order Details */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <div><span className="font-semibold">Order #:</span> <span className="font-mono receipt-mono">{receiptData.orderNumber}</span></div>
                    <div className="mt-0.5"><span className="font-semibold">Date:</span> {receiptData.date.toLocaleDateString()} {receiptData.date.toLocaleTimeString()}</div>
                  </div>
                </div>
                {receiptData.table && (
                  <div><span className="font-semibold">Table:</span> {receiptData.table}</div>
                )}
                {receiptData.customerName && (
                  <div><span className="font-semibold">Customer:</span> {receiptData.customerName}</div>
                )}
              </div>

              <div className="border-b-2 border-dashed"></div>

              {/* Items */}
              <div className="space-y-3">
                {receiptData.items.map((item, index) => {
                  const itemBasePrice = item.menuItem.price;
                  const modifierTotal = item.selectedModifiers?.reduce((sum, m) => sum + m.price, 0) || 0;
                  const itemTotal = (itemBasePrice + modifierTotal) * item.quantity;

                  return (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="receipt-item-name flex-1">{item.menuItem.name}</span>
                        <span className="receipt-value ml-2">${itemTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground mt-0.5">
                        <span className="receipt-label">{item.quantity} × ${itemBasePrice.toFixed(2)}</span>
                        <span className="receipt-value">${(itemBasePrice * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="mt-1 ml-2 space-y-0.5">
                          {item.selectedModifiers.map((modifier, modIdx) => (
                            <div key={modIdx} className="flex justify-between text-muted-foreground">
                              <span className="receipt-label">+ {modifier.optionName}</span>
                              {modifier.price > 0 && (
                                <span className="receipt-value">${(modifier.price * item.quantity).toFixed(2)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-muted-foreground italic mt-1 ml-2 receipt-label">
                          * {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-b-2 border-dashed"></div>

              {/* Totals */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="receipt-label">Subtotal</span>
                  <span className="receipt-value font-semibold">${receiptData.subtotal.toFixed(2)}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="receipt-label">Discount</span>
                    <span className="receipt-value font-semibold">-${receiptData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="receipt-label">Tax (10%)</span>
                  <span className="receipt-value font-semibold">${receiptData.tax.toFixed(2)}</span>
                </div>
                {receiptData.tip > 0 && (
                  <div className="flex justify-between">
                    <span className="receipt-label">Tip</span>
                    <span className="receipt-value font-semibold">${receiptData.tip.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-b-2 border-double"></div>

              <div className="flex justify-between text-base font-bold">
                <span className="receipt-label">TOTAL</span>
                <span className="receipt-total">${receiptData.total.toFixed(2)}</span>
              </div>

              <div className="border-b-2 border-dashed"></div>

              {/* Payment Info */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="receipt-label font-semibold">Payment:</span>
                  <span className="capitalize receipt-value">{receiptData.paymentMethod.replace('_', ' ')}</span>
                </div>
                {receiptData.change > 0 && (
                  <div className="flex justify-between font-bold">
                    <span className="receipt-label">Change</span>
                    <span className="receipt-total text-sm">${receiptData.change.toFixed(2)}</span>
                  </div>
                )}
                <div className="text-center pt-2 border-t mt-2">
                  <span className="receipt-label font-mono text-[10px]">TXN: {receiptData.transactionId}</span>
                </div>
              </div>

              <div className="border-b-2 border-dashed"></div>

              {/* Footer */}
              <div className="text-center text-xs receipt-footer space-y-2">
                <p className="font-semibold text-sm">THANK YOU!</p>
                <p>Please visit us again</p>
                <p className="text-[10px]">www.restaurant.com</p>
                <p className="text-[10px]">info@restaurant.com</p>
                <div className="pt-2">
                  <p className="text-[10px]">Powered by Restaurant POS</p>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          /* Hide everything on page */
          body * {
            visibility: hidden !important;
          }

          /* Show only receipt content */
          #receipt-content,
          #receipt-content * {
            visibility: visible !important;
          }

          #receipt-content {
            position: fixed;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5mm 4mm;
            color: #000 !important;
            background: #fff !important;
            font-family: 'Courier New', monospace !important;
          }

          /* Force black text for all content */
          #receipt-content * {
            color: #000 !important;
            background: transparent !important;
          }

          /* Header styling */
          #receipt-content h2 {
            color: #000 !important;
            font-weight: 700 !important;
            font-size: 18px !important;
            letter-spacing: 1px !important;
            margin-bottom: 2px !important;
          }

          /* Labels - lighter for thermal */
          #receipt-content .receipt-label {
            color: #000 !important;
            font-weight: 400 !important;
          }

          /* Values - dark black */
          #receipt-content .receipt-value {
            color: #000 !important;
            font-weight: 600 !important;
          }

          /* Order number and transaction ID - monospace */
          #receipt-content .receipt-mono {
            font-family: 'Courier New', monospace !important;
            font-weight: 700 !important;
            color: #000 !important;
            font-size: 10px !important;
          }

          /* Total - extra emphasis */
          #receipt-content .receipt-total {
            font-size: 16px !important;
            font-weight: 700 !important;
            color: #000 !important;
          }

          /* Item names */
          #receipt-content .receipt-item-name {
            font-weight: 700 !important;
            color: #000 !important;
          }

          /* Borders - dashed for thermal printers */
          #receipt-content .border-b-2,
          #receipt-content .border-t {
            border-color: #000 !important;
            border-style: dashed !important;
          }

          #receipt-content .border-double {
            border-style: double !important;
            border-color: #000 !important;
          }

          /* Footer text */
          #receipt-content .receipt-footer {
            color: #000 !important;
          }

          /* Spacing adjustments for thermal */
          #receipt-content {
            line-height: 1.4 !important;
          }
        }
      `}</style>
    </div>
  );
}
