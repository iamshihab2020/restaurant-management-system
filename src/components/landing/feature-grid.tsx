"use client";

import { useEffect, useRef } from "react";
import { FeatureCard } from "./feature-card";
import { features } from "@/lib/data/landing-content";
import { scrollTriggerStagger } from "@/lib/animations/gsap-config";
import { GradientBackground } from "./gradient-background";

export function FeatureGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    scrollTriggerStagger(".feature-card-item", "#features-grid");
  }, []);

  return (
    <section id="features" className="relative py-20 px-4 overflow-hidden">
      <GradientBackground variant="diagonal" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive restaurant management tools designed to streamline
            operations and boost efficiency.
          </p>
        </div>

        <div
          id="features-grid"
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <div key={index} className="feature-card-item opacity-0">
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
