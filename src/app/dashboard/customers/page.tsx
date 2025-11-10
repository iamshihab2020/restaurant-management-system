"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { mockCustomers, Customer } from "@/lib/mock-data/customers";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Heart,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<Customer["loyaltyTier"] | "all">("all");
  const [isLoading, setIsLoading] = useState(false);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    const matchesTier = selectedTier === "all" || customer.loyaltyTier === selectedTier;
    const matchesSearch =
      searchQuery === "" ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    return matchesTier && matchesSearch;
  });

  const tierCounts = {
    all: customers.length,
    bronze: customers.filter((c) => c.loyaltyTier === "bronze").length,
    silver: customers.filter((c) => c.loyaltyTier === "silver").length,
    gold: customers.filter((c) => c.loyaltyTier === "gold").length,
    platinum: customers.filter((c) => c.loyaltyTier === "platinum").length,
  };

  const getTierColor = (tier: Customer["loyaltyTier"]) => {
    const colors = {
      bronze: "bg-orange-700/10 text-orange-700 border-orange-700/20",
      silver: "bg-gray-400/10 text-gray-600 border-gray-400/20",
      gold: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      platinum: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    };
    return colors[tier];
  };

  const getTierIcon = (tier: Customer["loyaltyTier"]) => {
    return <Award className="w-4 h-4" />;
  };

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      dietaryPreferences: [],
      notes: "",
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      visitFrequency: 0,
    });
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer });
    setIsAddEditDialogOpen(true);
  };

  const openDetailsDialog = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (editingCustomer) {
        setCustomers(
          customers.map((customer) =>
            customer.id === editingCustomer.id
              ? { ...customer, ...formData, updatedAt: new Date() }
              : customer
          )
        );
        toast({
          title: "Customer Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          ...formData,
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          loyaltyTier: "bronze",
          visitFrequency: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Customer;
        setCustomers([...customers, newCustomer]);
        toast({
          title: "Customer Added",
          description: `${formData.name} has been added to the system.`,
        });
      }

      setIsLoading(false);
      setIsAddEditDialogOpen(false);
    }, 500);
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const executeDelete = () => {
    if (!customerToDelete) return;

    setCustomers(customers.filter((customer) => customer.id !== customerToDelete.id));
    toast({
      title: "Customer Deleted",
      description: `${customerToDelete.name} has been removed from the system.`,
      variant: "destructive",
    });
    setCustomerToDelete(null);
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground mt-1">Manage customer profiles and loyalty programs</p>
        </div>
        <Button size="lg" onClick={openAddDialog}>
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold text-foreground">{customers.length}</p>
              </div>
              <Heart className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">${totalRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-3xl font-bold text-foreground">${avgOrderValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platinum Members</p>
                <p className="text-3xl font-bold text-purple-600">{tierCounts.platinum}</p>
              </div>
              <Award className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(["bronze", "silver", "gold", "platinum"] as const).map((tier) => (
          <Card
            key={tier}
            className={`cursor-pointer transition-all ${
              selectedTier === tier ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedTier(selectedTier === tier ? "all" : tier)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{tier} Tier</p>
                  <p className="text-2xl font-bold text-foreground">{tierCounts[tier]}</p>
                </div>
                {getTierIcon(tier)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-muted cursor-pointer"
                    onClick={() => openDetailsDialog(customer)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Member since {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={`capitalize ${getTierColor(customer.loyaltyTier)}`}>
                        {getTierIcon(customer.loyaltyTier)}
                        <span className="ml-1">{customer.loyaltyTier}</span>
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-foreground font-medium">
                      {customer.totalOrders}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-foreground font-semibold">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-primary">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {customer.loyaltyPoints}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {customer.lastVisit ? (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(customer.lastVisit).toLocaleDateString()}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmDelete(customer)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? "Update customer information." : "Add a new customer to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
              <Input
                id="dietaryPreferences"
                value={formData.dietaryPreferences?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryPreferences: e.target.value
                      .split(",")
                      .map((p) => p.trim())
                      .filter((p) => p),
                  })
                }
                placeholder="vegetarian, gluten-free, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes about this customer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewingCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                    {viewingCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <p>{viewingCustomer.name}</p>
                    <Badge className={`mt-1 ${getTierColor(viewingCustomer.loyaltyTier)}`}>
                      {getTierIcon(viewingCustomer.loyaltyTier)}
                      <span className="ml-1 capitalize">{viewingCustomer.loyaltyTier} Member</span>
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground">{viewingCustomer.totalOrders}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold text-primary">${viewingCustomer.totalSpent.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Loyalty Points</p>
                      <p className="text-2xl font-bold text-foreground flex items-center">
                        <Star className="w-5 h-5 mr-1 text-primary fill-current" />
                        {viewingCustomer.loyaltyPoints}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Contact Information</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      {viewingCustomer.email}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {viewingCustomer.phone}
                    </div>
                    {viewingCustomer.address && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {viewingCustomer.address}
                      </div>
                    )}
                  </div>
                </div>

                {viewingCustomer.dietaryPreferences && viewingCustomer.dietaryPreferences.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Dietary Preferences</h3>
                    <div className="flex gap-2 flex-wrap">
                      {viewingCustomer.dietaryPreferences.map((pref, idx) => (
                        <Badge key={idx} variant="outline" className="capitalize">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {viewingCustomer.favoriteItems && viewingCustomer.favoriteItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Favorite Items</h3>
                    <div className="flex gap-2 flex-wrap">
                      {viewingCustomer.favoriteItems.map((item, idx) => (
                        <Badge key={idx} className="bg-primary/10 text-primary">
                          <Heart className="w-3 h-3 mr-1 fill-current" />
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {viewingCustomer.notes && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Notes</h3>
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg">{viewingCustomer.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Frequency</p>
                    <p className="text-lg font-semibold">{viewingCustomer.visitFrequency.toFixed(1)} times/month</p>
                  </div>
                  {viewingCustomer.lastVisit && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Visit</p>
                      <p className="text-lg font-semibold">{new Date(viewingCustomer.lastVisit).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsDetailsDialogOpen(false);
                  openEditDialog(viewingCustomer);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Customer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customerToDelete?.name}? This will remove all their order history and loyalty points. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
