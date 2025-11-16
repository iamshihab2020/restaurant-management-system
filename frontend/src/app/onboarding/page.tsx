"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Store, MapPin, Phone, Mail, DollarSign, Clock, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function OnboardingPage() {
  const router = useRouter();
  const { accessToken, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Restaurant Info
    restaurantName: "",
    businessType: "",
    cuisine: [] as string[],

    // Step 2: Contact & Location
    businessEmail: "",
    businessPhone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },

    // Step 3: Business Details (Optional)
    website: "",
    taxId: "",
    taxRate: 10,

    // Step 4: Operating Hours (Optional)
    operatingHours: {
      monday: { open: "09:00", close: "22:00", isClosed: false },
      tuesday: { open: "09:00", close: "22:00", isClosed: false },
      wednesday: { open: "09:00", close: "22:00", isClosed: false },
      thursday: { open: "09:00", close: "22:00", isClosed: false },
      friday: { open: "09:00", close: "23:00", isClosed: false },
      saturday: { open: "09:00", close: "23:00", isClosed: false },
      sunday: { open: "10:00", close: "21:00", isClosed: false },
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const cuisineOptions = ["Italian", "Chinese", "Japanese", "Mexican", "Indian", "American", "French", "Thai", "Mediterranean", "Other"];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter((c) => c !== cuisine)
        : [...prev.cuisine, cuisine],
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.restaurantName.trim()) {
        newErrors.restaurantName = "Restaurant name is required";
      }
    }

    if (step === 2) {
      if (!formData.businessEmail.trim()) {
        newErrors.businessEmail = "Business email is required";
      }
      if (!formData.businessPhone.trim()) {
        newErrors.businessPhone = "Business phone is required";
      }
      if (!formData.address.street.trim()) {
        newErrors.street = "Street address is required";
      }
      if (!formData.address.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.address.state.trim()) {
        newErrors.state = "State is required";
      }
      if (!formData.address.zipCode.trim()) {
        newErrors.zipCode = "ZIP code is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit(true);
    }
  };

  const handleSubmit = async (skipOptional = false) => {
    if (!skipOptional && !validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/tenants/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Onboarding failed");
      }

      toast.success("Restaurant setup completed!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to RestaurantPOS!</h1>
          <p className="text-muted-foreground">
            Let's set up your restaurant in just a few steps
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Restaurant Information"}
              {currentStep === 2 && "Contact & Location"}
              {currentStep === 3 && "Business Details"}
              {currentStep === 4 && "Operating Hours"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your restaurant"}
              {currentStep === 2 && "How can customers reach you?"}
              {currentStep === 3 && "Optional: Add business information"}
              {currentStep === 4 && "Optional: Set your operating hours"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Restaurant Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">
                    Restaurant Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurantName"
                      value={formData.restaurantName}
                      onChange={(e) => handleChange("restaurantName", e.target.value)}
                      placeholder="e.g., Gourmet Bistro"
                      className={cn("pl-10", errors.restaurantName && "border-destructive")}
                    />
                  </div>
                  {errors.restaurantName && (
                    <p className="text-sm text-destructive">{errors.restaurantName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type (Optional)</Label>
                  <Input
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleChange("businessType", e.target.value)}
                    placeholder="e.g., Fine Dining, Fast Casual, Cafe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cuisine Type (Optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cuisineOptions.map((cuisine) => (
                      <Button
                        key={cuisine}
                        type="button"
                        variant={formData.cuisine.includes(cuisine) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCuisineToggle(cuisine)}
                        className="justify-start"
                      >
                        {formData.cuisine.includes(cuisine) && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {cuisine}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">
                      Business Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessEmail"
                        type="email"
                        value={formData.businessEmail}
                        onChange={(e) => handleChange("businessEmail", e.target.value)}
                        placeholder="contact@restaurant.com"
                        className={cn("pl-10", errors.businessEmail && "border-destructive")}
                      />
                    </div>
                    {errors.businessEmail && (
                      <p className="text-sm text-destructive">{errors.businessEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">
                      Business Phone <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessPhone"
                        type="tel"
                        value={formData.businessPhone}
                        onChange={(e) => handleChange("businessPhone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={cn("pl-10", errors.businessPhone && "border-destructive")}
                      />
                    </div>
                    {errors.businessPhone && (
                      <p className="text-sm text-destructive">{errors.businessPhone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange("street", e.target.value)}
                      placeholder="123 Main Street"
                      className={cn("pl-10", errors.street && "border-destructive")}
                    />
                  </div>
                  {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      placeholder="New York"
                      className={cn(errors.city && "border-destructive")}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      placeholder="NY"
                      className={cn(errors.state && "border-destructive")}
                    />
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">
                      ZIP Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                      placeholder="10001"
                      className={cn(errors.zipCode && "border-destructive")}
                    />
                    {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Business Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.yourrestaurant.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID (Optional)</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => handleChange("taxId", e.target.value)}
                      placeholder="XX-XXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.taxRate}
                        onChange={(e) => handleChange("taxRate", parseFloat(e.target.value) || 0)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Operating Hours */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set your restaurant's operating hours. You can always change these later.
                </p>
                {Object.entries(formData.operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <Label className="capitalize">{day}</Label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          handleChange("operatingHours", {
                            ...formData.operatingHours,
                            [day]: { ...hours, open: e.target.value },
                          })
                        }
                        className="w-32"
                        disabled={hours.isClosed}
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          handleChange("operatingHours", {
                            ...formData.operatingHours,
                            [day]: { ...hours, close: e.target.value },
                          })
                        }
                        className="w-32"
                        disabled={hours.isClosed}
                      />
                    </div>
                    <Button
                      type="button"
                      variant={hours.isClosed ? "outline" : "ghost"}
                      size="sm"
                      onClick={() =>
                        handleChange("operatingHours", {
                          ...formData.operatingHours,
                          [day]: { ...hours, isClosed: !hours.isClosed },
                        })
                      }
                    >
                      {hours.isClosed ? "Open" : "Closed"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
              >
                Back
              </Button>

              <div className="flex gap-2">
                {(currentStep === 3 || currentStep === 4) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isLoading}
                  >
                    Skip for now
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext} disabled={isLoading}>
                    Next
                  </Button>
                ) : (
                  <Button type="button" onClick={() => handleSubmit()} disabled={isLoading}>
                    {isLoading ? "Completing..." : "Complete Setup"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
