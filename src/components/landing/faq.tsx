"use client";

import { useEffect, useRef, useState } from "react";
import { faqs } from "@/lib/data/landing-content";
import { scrollTriggerFadeIn } from "@/lib/animations/gsap-config";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientBackground } from "./gradient-background";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    scrollTriggerFadeIn("#faq-section");
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} id="faq" className="relative py-20 px-4 overflow-hidden">
      <GradientBackground variant="mesh" />
      <div className="max-w-4xl mx-auto">
        <div id="faq-section" className="text-center mb-16 opacity-0">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our restaurant management system
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg bg-card overflow-hidden transition-all duration-200 hover:border-primary/50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
              >
                <span className="font-semibold text-foreground text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
