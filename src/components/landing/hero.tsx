"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/lib/data/landing-content";
import { gsap, fadeInUp, fadeIn, staggerFadeInUp, countUp } from "@/lib/animations/gsap-config";
import { ArrowRight, Play } from "lucide-react";
import { GradientBackground } from "./gradient-background";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    fadeInUp(".hero-title", 0.2);
    fadeInUp(".hero-subtitle", 0.4);
    fadeInUp(".hero-description", 0.6);
    fadeInUp(".hero-buttons", 0.8);

    setTimeout(() => {
      staggerFadeInUp(".stat-item", 0.15);

      const statElements = document.querySelectorAll(".stat-value");
      statElements.forEach((el, index) => {
        const target = heroContent.stats[index].value;
        setTimeout(() => {
          countUp(el as HTMLElement, target, 2);
        }, 1000 + index * 150);
      });
    }, 1200);
  }, []);

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 px-4 overflow-hidden">
      <GradientBackground variant="radial" />

      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block mb-4">
            <span className="hero-title inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium opacity-0">
              Next-Generation Restaurant Management
            </span>
          </div>

          <h1 className="hero-subtitle text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight opacity-0">
            {heroContent.title}
            <br />
            <span className="text-primary">{heroContent.subtitle}</span>
          </h1>

          <p className="hero-description text-xl text-muted-foreground mb-8 max-w-2xl mx-auto opacity-0">
            {heroContent.description}
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base px-8">
                {heroContent.primaryCTA}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8">
              <Play className="w-5 h-5" />
              {heroContent.secondaryCTA}
            </Button>
          </div>
        </div>

        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20"
        >
          {heroContent.stats.map((stat, index) => (
            <div key={index} className="stat-item text-center opacity-0">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                <span className="stat-value">0</span>
                {stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-xl border border-border shadow-2xl overflow-hidden bg-card">
            <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
}
