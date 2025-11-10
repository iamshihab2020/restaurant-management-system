"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pricingTiers } from "@/lib/data/landing-content";
import { scrollTriggerStagger } from "@/lib/animations/gsap-config";
import { Check } from "lucide-react";
import Link from "next/link";
import { GradientBackground } from "./gradient-background";

export function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    scrollTriggerStagger(".pricing-card-item", "#pricing-grid");
  }, []);

  return (
    <section id="pricing" className="relative py-20 px-4 overflow-hidden">
      <GradientBackground variant="vertical" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your restaurant's needs. All plans include a
            14-day free trial.
          </p>
        </div>

        <div
          id="pricing-grid"
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {pricingTiers.map((tier, index) => (
            <div key={index} className="pricing-card-item opacity-0">
              <Card
                className={`relative h-full flex flex-col ${
                  tier.popular
                    ? "border-primary shadow-xl scale-105 md:scale-110"
                    : "border-border/50"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-foreground">
                      ${tier.price}
                    </span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/dashboard" className="w-full">
                    <Button
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          All plans include 24/7 email support. Enterprise plans include phone support
          and dedicated account management.
        </p>
      </div>
    </section>
  );
}
