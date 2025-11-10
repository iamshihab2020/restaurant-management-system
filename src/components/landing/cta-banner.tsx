"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { scrollTriggerFadeIn } from "@/lib/animations/gsap-config";
import { ArrowRight, Mail } from "lucide-react";

export function CTABanner() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    scrollTriggerFadeIn("#cta-section");
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div
          id="cta-section"
          className="relative rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-12 md:p-16 text-center overflow-hidden opacity-0"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of restaurants using our platform to streamline
              operations and boost revenue.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-8">
              <div className="relative flex-1 w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12 bg-white"
                />
              </div>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 h-12 whitespace-nowrap w-full sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-white/80">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>

          <style jsx>{`
            .bg-grid-pattern {
              background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
              background-size: 50px 50px;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
