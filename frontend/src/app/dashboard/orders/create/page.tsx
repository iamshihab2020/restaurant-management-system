"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { mockTables, getTablesByStatus } from "@/lib/mock-data/tables";
import { mockMenuItems, getMenuItemsByCategory } from "@/lib/mock-data/menu-items";
import { MenuItem, Table, CreateOrderItemInput } from "@/types";
import { ShoppingCart, Plus, Minus, Trash2, User, Users as UsersIcon, MessageSquare, ArrowLeft } from "lucide-react";
import Image from "next/image";

/**
 * Create Order Page
 * Allows waiters to create new orders by selecting table, menu items, and customer details
 */
export default function CreateOrderPage() {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerCount, setCustomerCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | MenuItem["category"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<Array<CreateOrderItemInput & { menuItem: MenuItem }>>([]);

  const availableTables = getTablesByStatus("available");

  // Filter menu items
  const filteredMenuItems = mockMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isAvailable = item.isAvailable;
    return matchesCategory && matchesSearch && isAvailable;
  });

  // Add item to cart
  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cartItems.find((item) => item.menuItemId === menuItem.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          menuItemId: menuItem.id,
          menuItem,
          quantity: 1,
        },
      ]);
    }
  };

  // Update cart item quantity
  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Remove item from cart
  const removeFromCart = (menuItemId: string) => {
    setCartItems(cartItems.filter((item) => item.menuItemId !== menuItemId));
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Create order
  const handleCreateOrder = () => {
    if (!selectedTable) {
      alert("Please select a table");
      return;
    }
    if (cartItems.length === 0) {
      alert("Please add items to the order");
      return;
    }

    // In production, this would call the API
    alert(
      `Order created successfully!\n\nTable: ${selectedTable.tableNumber}\nItems: ${cartItems.length}\nTotal: $${total.toFixed(2)}\n\nRedirecting to orders page...`
    );
    router.push("/dashboard/orders");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Order</h1>
            <p className="text-primary mt-1">Select table and add items to cart</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Menu & Table Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Step 1: Select Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      selectedTable?.id === table.id
                        ? "border-primary bg-primary/10"
                        : "border-primary bg-card hover:border-primary"
                    }`}
                  >
                    <div className="text-2xl font-bold text-foreground">{table.tableNumber}</div>
                    <div className="text-xs text-primary mt-1">{table.capacity} seats</div>
                    <div className="text-xs text-primary mt-1">{table.location}</div>
                  </button>
                ))}
              </div>
              {availableTables.length === 0 && (
                <p className="text-center text-destructive py-8">No tables available</p>
              )}
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Step 2: Customer Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Customer Name"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Number of Guests
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomerCount(Math.max(1, customerCount - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold text-foreground px-4">{customerCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomerCount(customerCount + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Special Requests
                </label>
                <textarea
                  className="w-full rounded-md border-2 border-input bg-card px-3 py-2 text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any special requests or dietary requirements..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Step 3: Add Menu Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(["all", "appetizer", "main_course", "dessert", "beverage"] as const).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize whitespace-nowrap"
                  >
                    {category === "all" ? "All" : category.replace("_", " ")}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <FormInput
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Menu Items Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-primary rounded-lg overflow-hidden bg-card hover:border-primary transition-all cursor-pointer"
                    onClick={() => addToCart(item)}
                  >
                    {item.image && (
                      <div className="relative h-32 bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold text-foreground text-sm mb-1">{item.name}</h4>
                      <p className="text-primary font-bold text-lg">${item.price.toFixed(2)}</p>
                      <Button size="sm" className="w-full mt-2">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMenuItems.length === 0 && (
                <p className="text-center text-primary py-8">No menu items found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Cart ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Table Info */}
              {selectedTable && (
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Table {selectedTable.tableNumber}</p>
                  <p className="text-xs text-primary">{selectedTable.location} • {selectedTable.capacity} seats</p>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.menuItemId} className="bg-background p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{item.menuItem.name}</p>
                        <p className="text-primary font-bold">${item.menuItem.price.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromCart(item.menuItemId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-bold text-foreground px-3">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <span className="ml-auto font-bold text-foreground">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <p className="text-center text-primary py-8">Cart is empty</p>
                )}
              </div>

              {/* Price Summary */}
              {cartItems.length > 0 && (
                <div className="space-y-2 pt-4 border-t-2 border-border">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Tax (10%):</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t-2 border-border">
                    <span>Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Create Order Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateOrder}
                disabled={!selectedTable || cartItems.length === 0}
              >
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
