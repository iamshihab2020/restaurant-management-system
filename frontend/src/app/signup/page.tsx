"use client";

import { SignupBranding } from "@/components/auth/signup-branding";
import { SignupForm } from "@/components/auth/signup-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      <SignupBranding />

      <div className="flex-1 flex items-center justify-center p-8 relative bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="lg:hidden mb-8 text-center w-full absolute top-8">
          <h1 className="text-2xl font-bold text-foreground">RestaurantPOS</h1>
          <p className="text-sm text-muted-foreground">Management System</p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
