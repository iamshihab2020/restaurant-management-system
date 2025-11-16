"use client";

import { useEffect, useRef } from "react";
import { fadeIn } from "@/lib/animations/gsap-config";
import { ChefHat, Store, Users, TrendingUp } from "lucide-react";

export function SignupBranding() {
  const brandingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (brandingRef.current) {
      fadeIn(brandingRef.current, 0);
    }
  }, []);

  return (
    <div
      ref={brandingRef}
      className="hidden lg:flex lg:w-2/5 relative p-12 flex-col justify-between text-white opacity-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d6832] via-primary to-[#1a8f4a] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/20 -z-10" />
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">RestaurantPOS</h1>
            <p className="text-white/80 text-sm">Management System</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Managing Your Restaurant Today
          </h2>
          <p className="text-white/90 text-lg">
            Join thousands of restaurant owners using our platform to streamline operations
            and boost revenue.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Complete Restaurant Management</h3>
              <p className="text-white/80 text-sm">
                POS, orders, tables, inventory, and more in one platform
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Team Collaboration</h3>
              <p className="text-white/80 text-sm">
                Add staff members with role-based access control
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Real-time Analytics</h3>
              <p className="text-white/80 text-sm">
                Track sales, monitor performance, and make data-driven decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-white/60 text-sm">
        <p>© 2025 RestaurantPOS. All rights reserved.</p>
      </div>
    </div>
  );
}
