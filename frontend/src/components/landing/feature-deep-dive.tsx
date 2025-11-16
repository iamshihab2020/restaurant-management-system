"use client";

import { useEffect, useRef } from "react";
import { deepFeatures } from "@/lib/data/landing-content";
import { scrollTriggerFadeIn } from "@/lib/animations/gsap-config";
import { Check } from "lucide-react";

export function FeatureDeepDive() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    deepFeatures.forEach((_, index) => {
      scrollTriggerFadeIn(`.deep-feature-${index}`);
    });
  }, []);

  return (
    <section ref={sectionRef} id="demo" className="py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-32">
        {deepFeatures.map((feature, index) => (
          <div
            key={index}
            className={`deep-feature-${index} grid md:grid-cols-2 gap-12 items-center opacity-0 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className={index % 2 === 1 ? "md:order-2" : ""}>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                {feature.description}
              </p>
              <ul className="space-y-3">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={index % 2 === 1 ? "md:order-1" : ""}>
              <div className="relative rounded-xl border border-border shadow-xl overflow-hidden bg-card">
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Feature Preview
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
