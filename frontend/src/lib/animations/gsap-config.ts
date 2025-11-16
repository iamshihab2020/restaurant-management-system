import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const fadeInUp = (element: string | Element, delay = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 60,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: "power3.out",
    }
  );
};

export const fadeIn = (element: string | Element, delay = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 0.6,
      delay,
      ease: "power2.out",
    }
  );
};

export const staggerFadeInUp = (elements: string, stagger = 0.1) => {
  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 40,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger,
      ease: "power3.out",
    }
  );
};

export const scaleIn = (element: string | Element, delay = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.9,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      delay,
      ease: "back.out(1.2)",
    }
  );
};

export const scrollTriggerFadeIn = (element: string | Element) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "top 60%",
        toggleActions: "play none none reverse",
      },
    }
  );
};

export const scrollTriggerStagger = (elements: string, container: string) => {
  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 40,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        end: "top 40%",
        toggleActions: "play none none reverse",
      },
    }
  );
};

export const countUp = (element: HTMLElement, target: number, duration = 2) => {
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: target,
    duration,
    ease: "power1.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
  });
};

export const parallax = (element: string | Element, speed = 0.5) => {
  return gsap.to(element, {
    y: () => window.innerHeight * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
};

export const initScrollTrigger = () => {
  if (typeof window !== "undefined") {
    ScrollTrigger.refresh();
  }
};

export const killAllScrollTriggers = () => {
  if (typeof window !== "undefined") {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
};

export { gsap, ScrollTrigger };
