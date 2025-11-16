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
import { Search, Plus, Edit, AlertTriangle, Calendar, TrendingDown, Package, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useRestockItem, useDeductStock, useDeleteInventoryItem } from "@/lib/hooks/use-inventory";

interface InventoryItem {
  _id: string;
  name: string;
  category: "ingredient" | "beverage" | "supply";
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  cost: number;
  supplier?: string;
  expiryDate?: Date;
  lastRestocked?: Date;
}

export default function InventoryPage() {
  const { data: inventory = [], isLoading: isLoadingInventory } = useInventory();
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const restockMutation = useRestockItem();
  const deleteMutation = useDeleteInventoryItem();

  const [selectedCategory, setSelectedCategory] = useState<"all" | "ingredient" | "beverage" | "supply">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);
  const [restockNotes, setRestockNotes] = useState("");

  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const lowStockItems = inventory.filter((item) => item.quantity <= item.lowStockThreshold);
  const expiringSoonItems = inventory.filter((item) => {
    if (!item.expiryDate) return false;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return new Date(item.expiryDate) <= threeDaysFromNow;
  });

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get stock status
  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: "Out of Stock", color: "text-destructive bg-destructive/10" };
    if (item.quantity <= item.lowStockThreshold) return { label: "Low Stock", color: "text-primary bg-primary/10" };
    return { label: "In Stock", color: "text-primary bg-primary/10" };
  };

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expiryDate) return false;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return new Date(item.expiryDate) <= threeDaysFromNow;
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "ingredient",
      quantity: 0,
      unit: "kg",
      lowStockThreshold: 0,
      cost: 0,
      supplier: "",
    });
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsAddEditDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem._id,
          data: formData,
        });
        toast.success(`${formData.name} has been updated successfully.`);
      } else {
        await createMutation.mutateAsync(formData as Omit<InventoryItem, "_id">);
        toast.success(`${formData.name} has been added to inventory.`);
      }
      setIsAddEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save inventory item");
    }
  };

  const openRestockDialog = (item: InventoryItem) => {
    setRestockingItem(item);
    setRestockQuantity(0);
    setRestockNotes("");
    setIsRestockDialogOpen(true);
  };

  const handleRestock = async () => {
    if (!restockingItem || restockQuantity <= 0) return;

    try {
      await restockMutation.mutateAsync({
        id: restockingItem._id,
        quantity: restockQuantity,
        notes: restockNotes,
      });
      toast.success(`Added ${restockQuantity} ${restockingItem.unit} to ${restockingItem.name}.`);
      setIsRestockDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to restock item");
    }
  };

  const confirmDelete = (item: InventoryItem) => {
    setItemToDelete(item);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete._id);
      toast.success(`${itemToDelete.name} has been removed from inventory.`);
      setItemToDelete(null);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || restockMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track stock levels and manage supplies ({inventory.length} items)</p>
        </div>
        <Button size="lg" onClick={openAddDialog} className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">Low Stock Items</p>
                <p className="text-3xl font-bold text-primary">{lowStockItems.length}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-destructive font-medium">Expiring Soon</p>
                <p className="text-3xl font-bold text-destructive">{expiringSoonItems.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">Total Items</p>
                <p className="text-3xl font-bold text-primary">{inventory.length}</p>
              </div>
              <Package className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "ingredient", "beverage", "supply"] as const).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cost/Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  const expiring = isExpiringSoon(item);

                  return (
                    <tr key={item._id} className="hover:bg-muted">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expiring && (
                            <AlertTriangle className="w-4 h-4 text-destructive mr-2" />
                          )}
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-foreground capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-foreground font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {item.expiryDate ? (
                          <span className={expiring ? "text-destructive font-medium" : "text-muted-foreground"}>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-foreground">
                        ${item.cost.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => openRestockDialog(item)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDelete(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the inventory item details." : "Add a new item to your inventory."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chicken Breast"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category || "ingredient"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as InventoryItem["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredient">Ingredient</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                    <SelectItem value="supply">Supply</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit || ""}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., kg, liters, pieces"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost per Unit *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost || 0}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold *</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier || ""}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="e.g., Fresh Farms Co."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={
                    formData.expiryDate
                      ? new Date(formData.expiryDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
              {isLoading ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add stock to {restockingItem?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <p className="text-2xl font-bold">
                {restockingItem?.quantity} {restockingItem?.unit}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restockQuantity">Quantity to Add *</Label>
              <Input
                id="restockQuantity"
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(Number(e.target.value))}
                min="0"
                placeholder="Enter quantity"
              />
            </div>

            {restockQuantity > 0 && restockingItem && (
              <div className="space-y-2">
                <Label>New Stock Level</Label>
                <p className="text-2xl font-bold text-primary">
                  {restockingItem.quantity + restockQuantity} {restockingItem.unit}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="restockNotes">Notes (Optional)</Label>
              <Input
                id="restockNotes"
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                placeholder="Add any notes about this restock"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRestock} disabled={isLoading || restockQuantity <= 0}>
              {isLoading ? "Restocking..." : "Confirm Restock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
