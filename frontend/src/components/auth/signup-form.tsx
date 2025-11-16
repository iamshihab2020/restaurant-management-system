"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "./password-input";
import { Mail, AlertCircle, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/animations/gsap-config";
import { toast } from "sonner";

export function SignupForm() {
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formRef.current) {
      fadeIn(formRef.current, 0.2);
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Full name is required";
    }

    if (!formData.ownerEmail) {
      newErrors.ownerEmail = "Email is required";
    } else if (!validateEmail(formData.ownerEmail)) {
      newErrors.ownerEmail = "Please enter a valid email";
    }

    if (!formData.ownerPhone) {
      newErrors.ownerPhone = "Phone number is required";
    } else if (!validatePhone(formData.ownerPhone)) {
      newErrors.ownerPhone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/v1/tenants/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.tenant));

      toast.success("Account created successfully!");

      // Redirect based on onboarding status
      if (data.needsOnboarding) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={formRef} className="w-full max-w-md mx-auto p-8 opacity-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">
          Start managing your restaurant in minutes
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="ownerName" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="ownerName"
              type="text"
              value={formData.ownerName}
              onChange={handleChange("ownerName")}
              placeholder="John Doe"
              className={cn(
                "pl-10",
                errors.ownerName && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerEmail" className="text-sm font-medium">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={handleChange("ownerEmail")}
              placeholder="you@example.com"
              className={cn(
                "pl-10",
                errors.ownerEmail && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.ownerEmail && <p className="text-sm text-destructive">{errors.ownerEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerPhone" className="text-sm font-medium">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Phone className="w-4 h-4" />
            </div>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone}
              onChange={handleChange("ownerPhone")}
              placeholder="+1 (555) 000-0000"
              className={cn(
                "pl-10",
                errors.ownerPhone && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.ownerPhone && <p className="text-sm text-destructive">{errors.ownerPhone}</p>}
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={formData.password}
          onChange={handleChange("password")}
          error={errors.password}
          required
          placeholder="At least 8 characters"
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={errors.confirmPassword}
          required
          placeholder="Re-enter your password"
        />

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
