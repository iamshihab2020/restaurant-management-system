"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { mockMenuItems } from "@/lib/mock-data/menu-items";
import { MenuItem, MenuCategory } from "@/types";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Leaf,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

/**
 * Menu Management Page
 * Comprehensive menu item management with add, edit, delete, filtering, sorting, and more
 */
export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name-asc");

  // Add/Edit Dialog State
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});

  // Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const { toast } = useToast();

  // Category colors configuration
  const categoryConfig: Record<
    MenuCategory,
    { bg: string; text: string; badge: string; icon: string }
  > = {
    appetizer: {
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      text: "text-yellow-900 dark:text-yellow-100",
      badge: "bg-yellow-500",
      icon: "🥗",
    },
    main_course: {
      bg: "bg-amber-100 dark:bg-amber-900/20",
      text: "text-amber-900 dark:text-amber-100",
      badge: "bg-amber-500",
      icon: "🍽️",
    },
    dessert: {
      bg: "bg-pink-100 dark:bg-pink-900/20",
      text: "text-pink-900 dark:text-pink-100",
      badge: "bg-pink-500",
      icon: "🍰",
    },
    beverage: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-900 dark:text-blue-100",
      badge: "bg-blue-500",
      icon: "☕",
    },
    special: {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      text: "text-orange-900 dark:text-orange-100",
      badge: "bg-orange-500",
      icon: "⭐",
    },
  };

  // Filter and sort menu items
  const filteredItems = menuItems
    .filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ingredients?.some((ing) =>
          ing.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "prep-time":
          return a.preparationTime - b.preparationTime;
        default:
          return 0;
      }
    });

  // Count items by category
  const categoryCounts = {
    all: menuItems.length,
    appetizer: menuItems.filter((i) => i.category === "appetizer").length,
    main_course: menuItems.filter((i) => i.category === "main_course").length,
    dessert: menuItems.filter((i) => i.category === "dessert").length,
    beverage: menuItems.filter((i) => i.category === "beverage").length,
    special: menuItems.filter((i) => i.category === "special").length,
  };

  // Category labels
  const categoryLabels: Record<MenuCategory | "all", string> = {
    all: "All Items",
    appetizer: "Appetizers",
    main_course: "Main Courses",
    dessert: "Desserts",
    beverage: "Beverages",
    special: "Specials",
  };

  /**
   * Open Add Dialog
   */
  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "appetizer",
      preparationTime: 15,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      ingredients: [],
      allergens: [],
      image: "",
    });
    setIsAddEditDialogOpen(true);
  };

  /**
   * Open Edit Dialog
   */
  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsAddEditDialogOpen(true);
  };

  /**
   * Handle form submit (Add or Edit)
   */
  const handleSubmit = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (editingItem) {
        // Update existing item
        setMenuItems(
          menuItems.map((item) =>
            item.id === editingItem.id
              ? { ...item, ...formData, updatedAt: new Date() }
              : item
          )
        );
        toast({
          title: "Menu Item Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Add new item
        const newItem: MenuItem = {
          id: `item-${Date.now()}`,
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as MenuItem;
        setMenuItems([...menuItems, newItem]);
        toast({
          title: "Menu Item Added",
          description: `${formData.name} has been added to the menu.`,
        });
      }

      setIsLoading(false);
      setIsAddEditDialogOpen(false);
    }, 500);
  };

  /**
   * Toggle item availability
   */
  const toggleAvailability = (itemId: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === itemId
          ? { ...item, isAvailable: !item.isAvailable, updatedAt: new Date() }
          : item
      )
    );

    const item = menuItems.find((i) => i.id === itemId);
    toast({
      title: item?.isAvailable ? "Item Marked Unavailable" : "Item Marked Available",
      description: `${item?.name} is now ${item?.isAvailable ? "unavailable" : "available"}.`,
    });
  };

  /**
   * Confirm delete
   */
  const confirmDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  /**
   * Execute delete
   */
  const executeDelete = () => {
    if (!itemToDelete) return;

    setMenuItems(menuItems.filter((item) => item.id !== itemToDelete.id));
    toast({
      title: "Menu Item Deleted",
      description: `${itemToDelete.name} has been removed from the menu.`,
      variant: "destructive",
    });
    setItemToDelete(null);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your restaurant's menu items and pricing ({menuItems.length} items)
          </p>
        </div>
        <Button size="lg" onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Add Menu Item</span>
        </Button>
      </div>

      {/* Search, Sort, and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name, description, ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="prep-time">Prep Time (Shortest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(Object.keys(categoryLabels) as Array<MenuCategory | "all">).map(
                (category) => {
                  const config = category !== "all" ? categoryConfig[category] : null;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="whitespace-nowrap"
                    >
                      {config?.icon} {categoryLabels[category]} ({categoryCounts[category]})
                    </Button>
                  );
                }
              )}
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
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

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const config = categoryConfig[item.category];

            return (
              <Card
                key={item.id}
                className={`overflow-hidden hover:shadow-lg transition-all ${
                  !item.isAvailable ? "opacity-70" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span className="text-sm">No Image</span>
                    </div>
                  )}

                  {/* Unavailable Overlay */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <Badge variant="destructive" className="text-white px-4 py-2">
                        <XCircle className="w-4 h-4 mr-2" />
                        Out of Stock
                      </Badge>
                    </div>
                  )}

                  {/* Allergen Icons (Top Right) */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.allergens.slice(0, 2).map((allergen, index) => (
                        <Badge
                          key={index}
                          variant="destructive"
                          className="text-xs px-2 py-0.5"
                          title={allergen}
                        >
                          <AlertTriangle className="w-3 h-3" />
                        </Badge>
                      ))}
                      {item.allergens.length > 2 && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">
                          +{item.allergens.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <CardContent className="pt-4">
                  {/* Category Badge */}
                  <Badge className={`${config.bg} ${config.text} border-none mb-2`}>
                    {config.icon} {item.category.replace("_", " ")}
                  </Badge>

                  {/* Name */}
                  <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Price and Prep Time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-primary font-bold text-lg">
                      <DollarSign className="w-5 h-5" />
                      <span>{item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{item.preparationTime}min</span>
                    </div>
                  </div>

                  {/* Dietary Badges */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {item.isVegetarian && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <Leaf className="w-3 h-3 mr-1" />
                        Veg
                      </Badge>
                    )}
                    {item.isVegan && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Leaf className="w-3 h-3 mr-1" />
                        Vegan
                      </Badge>
                    )}
                    {item.isGlutenFree && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        GF
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleAvailability(item.id)}
                    >
                      {item.isAvailable ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Unavailable
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Available
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItem(item)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Edit and Delete */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No menu items found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No items match "${searchQuery}"`
                : `No ${selectedCategory} items available`}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  Detailed information about this menu item
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Image */}
                {selectedItem.image && (
                  <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-semibold capitalize mt-1">
                      {selectedItem.category.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price</Label>
                    <p className="font-bold text-primary mt-1">
                      ${selectedItem.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Prep Time</Label>
                    <p className="font-semibold mt-1">{selectedItem.preparationTime} min</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-semibold mt-1">
                      {selectedItem.isAvailable ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-red-600">Unavailable</span>
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <Label className="text-sm font-semibold">Description</Label>
                  <p className="text-foreground mt-2">{selectedItem.description}</p>
                </div>

                {/* Ingredients */}
                {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-semibold">Ingredients</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.ingredients.map((ingredient, index) => (
                          <Badge key={index} variant="secondary">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Allergens */}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-semibold">Allergens</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.allergens.map((allergen, index) => (
                          <Badge key={index} variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Dietary Info */}
                <Separator />
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Dietary Information
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.isVegetarian && (
                      <Badge className="bg-green-100 text-green-900">
                        <Leaf className="w-3 h-3 mr-1" />
                        Vegetarian
                      </Badge>
                    )}
                    {selectedItem.isVegan && (
                      <Badge className="bg-emerald-100 text-emerald-900">
                        <Leaf className="w-3 h-3 mr-1" />
                        Vegan
                      </Badge>
                    )}
                    {selectedItem.isGlutenFree && (
                      <Badge className="bg-blue-100 text-blue-900">Gluten Free</Badge>
                    )}
                    {!selectedItem.isVegetarian &&
                      !selectedItem.isVegan &&
                      !selectedItem.isGlutenFree && (
                        <span className="text-muted-foreground text-sm">
                          No special dietary attributes
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  openEditDialog(selectedItem);
                  setSelectedItem(null);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Item
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the details of this menu item"
                : "Fill in the details to add a new item to the menu"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Margherita Pizza"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the item"
                className="w-full mt-1 min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
              />
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as MenuCategory })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="main_course">Main Course</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prep Time */}
            <div>
              <Label htmlFor="prepTime">Preparation Time (minutes) *</Label>
              <Input
                id="prepTime"
                type="number"
                value={formData.preparationTime || 15}
                onChange={(e) =>
                  setFormData({ ...formData, preparationTime: parseInt(e.target.value) })
                }
                className="mt-1"
              />
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>

            {/* Ingredients */}
            <div>
              <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
              <Input
                id="ingredients"
                value={formData.ingredients?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ingredients: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                placeholder="Tomato, Cheese, Basil"
                className="mt-1"
              />
            </div>

            {/* Allergens */}
            <div>
              <Label htmlFor="allergens">Allergens (comma-separated)</Label>
              <Input
                id="allergens"
                value={formData.allergens?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allergens: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                placeholder="Dairy, Gluten, Nuts"
                className="mt-1"
              />
            </div>

            <Separator />

            {/* Dietary Checkboxes */}
            <div>
              <Label className="mb-3 block">Dietary Attributes</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isVegetarian: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Vegetarian</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVegan || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isVegan: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Vegan</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGlutenFree || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isGlutenFree: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Gluten Free</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-semibold">Available for Order</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
              {isLoading ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{itemToDelete?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
