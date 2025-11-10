"use client";

import { useEffect, useRef } from "react";
import { UtensilsCrossed, ShoppingCart, BarChart3, ChefHat, Package } from "lucide-react";
import { fadeIn } from "@/lib/animations/gsap-config";

export function LoginBranding() {
  const brandingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (brandingRef.current) {
      fadeIn(brandingRef.current, 0);
    }
  }, []);

  const features = [
    {
      icon: ShoppingCart,
      title: "Real-time Order Management",
      description: "Track orders from kitchen to table",
    },
    {
      icon: ChefHat,
      title: "Kitchen Display System",
      description: "Streamline kitchen operations",
    },
    {
      icon: Package,
      title: "Inventory Tracking",
      description: "Never run out of stock",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Make data-driven decisions",
    },
  ];

  return (
    <div
      ref={brandingRef}
      className="hidden lg:flex lg:w-2/5 relative p-12 flex-col justify-between text-white opacity-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d6832] via-primary to-[#1a8f4a] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/20 -z-10" />
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">RestaurantPOS</h1>
            <p className="text-white/80 text-sm">Management System</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-3">
            Streamline Your
            <br />
            Restaurant Operations
          </h2>
          <p className="text-white/80 text-lg">
            Complete solution for modern restaurant management
          </p>
        </div>

        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-white/60">
        © {new Date().getFullYear()} RestaurantPOS. All rights reserved.
      </div>
    </div>
  );
}
