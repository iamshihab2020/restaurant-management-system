"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Bell, Lock, Globe, CreditCard, Printer, Palette, Check, Store, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RestaurantSettings {
  name: string;
  phone: string;
  address: string;
  taxRate: number;
  currency: string;
}

interface NotificationSettings {
  newOrders: boolean;
  lowStock: boolean;
  reservations: boolean;
  dailyReports: boolean;
}

interface PaymentSettings {
  cash: boolean;
  creditCard: boolean;
  debitCard: boolean;
  mobilePayment: boolean;
}

interface PrinterSettings {
  receiptPrinter: string;
  kitchenPrinter: string;
  autoPrintKitchen: boolean;
  printAfterPayment: boolean;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("restaurantSettings");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      name: "Gourmet Bistro",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, City, State 12345",
      taxRate: 10,
      currency: "USD",
    };
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newOrders: true,
    lowStock: true,
    reservations: true,
    dailyReports: false,
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentSettings>({
    cash: true,
    creditCard: true,
    debitCard: true,
    mobilePayment: false,
  });

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    receiptPrinter: "default",
    kitchenPrinter: "kitchen1",
    autoPrintKitchen: true,
    printAfterPayment: true,
  });

  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [paymentModel, setPaymentModel] = useState<"payFirst" | "payLater">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paymentModel");
      return (saved as "payFirst" | "payLater") || "payLater";
    }
    return "payLater";
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });

    setPasswordData({ current: "", new: "", confirm: "" });
  };

  const handleSaveRestaurant = () => {
    localStorage.setItem("restaurantSettings", JSON.stringify(restaurantSettings));
    toast({
      title: "Settings Saved",
      description: "Restaurant settings have been updated.",
    });
  };

  const handleSaveBusinessModel = () => {
    localStorage.setItem("paymentModel", paymentModel);
    toast({
      title: "Business Model Updated",
      description: `Payment model set to ${paymentModel === "payFirst" ? "Pay First" : "Pay Later"}.`,
    });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(notifications));
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePayments = () => {
    localStorage.setItem("paymentSettings", JSON.stringify(paymentMethods));
    toast({
      title: "Payment Methods Updated",
      description: "Payment method settings have been saved.",
    });
  };

  const handleSavePrinters = () => {
    localStorage.setItem("printerSettings", JSON.stringify(printerSettings));
    toast({
      title: "Printer Settings Saved",
      description: "Your printer configuration has been updated.",
    });
  };

  const handleTestPrint = () => {
    toast({
      title: "Test Print",
      description: "Sending test print to configured printers...",
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme} mode.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your restaurant and account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user?.role} disabled className="bg-muted" />
            </div>
          </div>
          <div className="pt-4 border-t">
            <h4 className="font-medium text-foreground mb-3">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleChangePassword} className="mt-4" variant="outline">
              Update Password
            </Button>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setProfileData({
              name: user?.name || "",
              email: user?.email || "",
              phone: user?.phone || "",
            })}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Restaurant Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                value={restaurantSettings.name}
                onChange={(e) =>
                  setRestaurantSettings({ ...restaurantSettings, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Phone Number</Label>
              <Input
                id="restaurantPhone"
                value={restaurantSettings.phone}
                onChange={(e) =>
                  setRestaurantSettings({ ...restaurantSettings, phone: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={restaurantSettings.address}
                onChange={(e) =>
                  setRestaurantSettings({ ...restaurantSettings, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={restaurantSettings.taxRate}
                onChange={(e) =>
                  setRestaurantSettings({
                    ...restaurantSettings,
                    taxRate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={restaurantSettings.currency}
                onValueChange={(value) =>
                  setRestaurantSettings({ ...restaurantSettings, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                  <SelectItem value="CNY">CNY (¥) - Chinese Yuan</SelectItem>
                  <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                  <SelectItem value="AUD">AUD ($) - Australian Dollar</SelectItem>
                  <SelectItem value="CAD">CAD ($) - Canadian Dollar</SelectItem>
                  <SelectItem value="CHF">CHF (Fr) - Swiss Franc</SelectItem>
                  <SelectItem value="SGD">SGD ($) - Singapore Dollar</SelectItem>
                  <SelectItem value="MXN">MXN ($) - Mexican Peso</SelectItem>
                  <SelectItem value="BRL">BRL (R$) - Brazilian Real</SelectItem>
                  <SelectItem value="BDT">BDT (৳) - Bangladeshi Taka</SelectItem>
                  <SelectItem value="MDL">MDL (L) - Moldovan Leu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSaveRestaurant}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="w-5 h-5 mr-2" />
            Business Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This setting affects how payment is handled in the POS and Orders pages
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label>Payment Model</Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPaymentModel("payFirst")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  paymentModel === "payFirst"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Pay First</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Customer pays before receiving order (Fast food model)
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentModel === "payFirst"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {paymentModel === "payFirst" && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentModel("payLater")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  paymentModel === "payLater"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Pay Later</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Customer pays after receiving order (Traditional restaurant model)
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentModel === "payLater"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {paymentModel === "payLater" && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSaveBusinessModel}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">New orders</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when new orders are placed
                </p>
              </div>
              <Switch
                checked={notifications.newOrders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newOrders: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Low stock alerts</p>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when inventory is low
                </p>
              </div>
              <Switch
                checked={notifications.lowStock}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, lowStock: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Reservation confirmations</p>
                <p className="text-sm text-muted-foreground">
                  Notifications for new reservations
                </p>
              </div>
              <Switch
                checked={notifications.reservations}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, reservations: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Daily reports</p>
                <p className="text-sm text-muted-foreground">
                  Receive daily sales reports via email
                </p>
              </div>
              <Switch
                checked={notifications.dailyReports}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, dailyReports: checked })
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveNotifications}>
              <Check className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">Cash</p>
              <Switch
                checked={paymentMethods.cash}
                onCheckedChange={(checked) =>
                  setPaymentMethods({ ...paymentMethods, cash: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">Credit Card</p>
              <Switch
                checked={paymentMethods.creditCard}
                onCheckedChange={(checked) =>
                  setPaymentMethods({ ...paymentMethods, creditCard: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">Debit Card</p>
              <Switch
                checked={paymentMethods.debitCard}
                onCheckedChange={(checked) =>
                  setPaymentMethods({ ...paymentMethods, debitCard: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">Mobile Payment</p>
              <Switch
                checked={paymentMethods.mobilePayment}
                onCheckedChange={(checked) =>
                  setPaymentMethods({ ...paymentMethods, mobilePayment: checked })
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSavePayments}>
              <Check className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            Printer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiptPrinter">Receipt Printer</Label>
              <Select
                value={printerSettings.receiptPrinter}
                onValueChange={(value) =>
                  setPrinterSettings({ ...printerSettings, receiptPrinter: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Printer</SelectItem>
                  <SelectItem value="kitchen">Kitchen Printer</SelectItem>
                  <SelectItem value="bar">Bar Printer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kitchenPrinter">Kitchen Printer</Label>
              <Select
                value={printerSettings.kitchenPrinter}
                onValueChange={(value) =>
                  setPrinterSettings({ ...printerSettings, kitchenPrinter: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitchen1">Kitchen Printer 1</SelectItem>
                  <SelectItem value="kitchen2">Kitchen Printer 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoPrintKitchen">Auto-print kitchen tickets</Label>
              <Switch
                id="autoPrintKitchen"
                checked={printerSettings.autoPrintKitchen}
                onCheckedChange={(checked) =>
                  setPrinterSettings({ ...printerSettings, autoPrintKitchen: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="printAfterPayment">Print receipt after payment</Label>
              <Switch
                id="printAfterPayment"
                checked={printerSettings.printAfterPayment}
                onCheckedChange={(checked) =>
                  setPrinterSettings({ ...printerSettings, printAfterPayment: checked })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleTestPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Test Print
            </Button>
            <Button onClick={handleSavePrinters}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`p-3 border-2 rounded-lg bg-card transition-colors ${
                    theme === "light" ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="w-full h-16 bg-gradient-to-br from-card to-muted rounded mb-2"></div>
                  <p className="text-sm font-medium">Light</p>
                  {theme === "light" && <Check className="w-4 h-4 mx-auto mt-1 text-primary" />}
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`p-3 border-2 rounded-lg bg-card transition-colors ${
                    theme === "dark" ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="w-full h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2"></div>
                  <p className="text-sm font-medium">Dark</p>
                  {theme === "dark" && <Check className="w-4 h-4 mx-auto mt-1 text-primary" />}
                </button>
                <button
                  onClick={() => handleThemeChange("auto")}
                  className={`p-3 border-2 rounded-lg bg-card transition-colors ${
                    theme === "auto" ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="w-full h-16 bg-gradient-to-br from-card via-muted to-gray-800 rounded mb-2"></div>
                  <p className="text-sm font-medium">Auto</p>
                  {theme === "auto" && <Check className="w-4 h-4 mx-auto mt-1 text-primary" />}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
