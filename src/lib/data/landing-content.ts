import {
  LayoutDashboard,
  UtensilsCrossed,
  Rows,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  ChefHat,
  Package,
  Calendar,
  Heart,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  Settings,
  Smartphone,
  Cloud,
  LucideIcon,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface DeepFeature {
  title: string;
  description: string;
  features: string[];
  image: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface PricingTier {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export const heroContent = {
  title: "Modern Restaurant Management",
  subtitle: "Streamline Your Operations",
  description:
    "Complete point-of-sale system with table management, kitchen display, inventory tracking, and powerful analytics. Everything you need to run your restaurant efficiently.",
  primaryCTA: "Start Free Trial",
  secondaryCTA: "Watch Demo",
  stats: [
    { value: 500, label: "Restaurants", suffix: "+" },
    { value: 10000, label: "Orders Daily", suffix: "+" },
    { value: 99.9, label: "Uptime", suffix: "%" },
    { value: 4.9, label: "Rating", suffix: "/5" },
  ],
};

export const features: Feature[] = [
  {
    icon: CreditCard,
    title: "Point of Sale",
    description:
      "Fast, intuitive POS system with support for multiple payment methods, split bills, and receipt printing.",
  },
  {
    icon: Rows,
    title: "Table Management",
    description:
      "Visual floor plan with real-time table status, reservations, and seamless order assignment.",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display",
    description:
      "Real-time order routing to kitchen with status tracking and preparation time management.",
  },
  {
    icon: ShoppingCart,
    title: "Order Tracking",
    description:
      "Complete order lifecycle management from creation to completion with item-level tracking.",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Track stock levels, set reorder points, and manage suppliers with automated alerts.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Comprehensive sales reports, performance metrics, and business insights at your fingertips.",
  },
  {
    icon: Heart,
    title: "Customer Management",
    description:
      "Build customer profiles, track loyalty tiers, and manage preferences for personalized service.",
  },
  {
    icon: Calendar,
    title: "Reservations",
    description:
      "Online booking system with table assignment, waitlist management, and automated confirmations.",
  },
  {
    icon: Users,
    title: "Multi-User Roles",
    description:
      "Role-based access control for admin, managers, waiters, kitchen staff, and cashiers.",
  },
  {
    icon: Settings,
    title: "Customizable",
    description:
      "Configure payment models, currency, tax rates, and business settings to match your needs.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description:
      "Fully responsive design works seamlessly on tablets and mobile devices for on-the-go access.",
  },
  {
    icon: Cloud,
    title: "Cloud-Based",
    description:
      "Access your data anywhere, anytime with secure cloud storage and automatic backups.",
  },
];

export const deepFeatures: DeepFeature[] = [
  {
    title: "Powerful Point of Sale System",
    description:
      "Accept payments quickly with our intuitive POS interface. Support for cash, cards, and mobile payments with automatic change calculation and receipt generation.",
    features: [
      "Multiple payment methods (Cash, Credit, Debit, Mobile Pay)",
      "Split bill functionality for group dining",
      "Quick cash amount buttons for faster checkout",
      "Automatic tax calculation and discount management",
      "Digital receipt generation and printing",
      "Real-time sync with kitchen and inventory",
    ],
    image: "/images/pos-demo.png",
  },
  {
    title: "Smart Kitchen Management",
    description:
      "Streamline kitchen operations with real-time order display, preparation tracking, and automated notifications for staff and customers.",
    features: [
      "Real-time order routing to kitchen stations",
      "Color-coded priority and urgency indicators",
      "Item-level status tracking (Preparing, Ready, Served)",
      "Preparation time estimates and alerts",
      "Order modification and special requests",
      "Kitchen performance analytics",
    ],
    image: "/images/kitchen-demo.png",
  },
  {
    title: "Visual Table Management",
    description:
      "Manage your floor plan with drag-and-drop simplicity. See table status at a glance and optimize seating arrangements for maximum efficiency.",
    features: [
      "Interactive floor plan with grid/list views",
      "Real-time table status (Available, Occupied, Reserved)",
      "Table capacity and location management",
      "Reservation integration and waitlist",
      "Quick order assignment to tables",
      "Area-based filtering (Indoor, Outdoor, VIP)",
    ],
    image: "/images/tables-demo.png",
  },
  {
    title: "Comprehensive Analytics",
    description:
      "Make data-driven decisions with powerful reporting tools. Track sales, monitor performance, and identify trends to grow your business.",
    features: [
      "Daily, weekly, and monthly sales reports",
      "Revenue breakdown by category and item",
      "Peak hours and customer traffic analysis",
      "Staff performance metrics",
      "Inventory turnover and waste tracking",
      "Export reports to CSV and PDF",
    ],
    image: "/images/reports-demo.png",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Owner",
    company: "Bella Vista Restaurant",
    content:
      "This system transformed our operations. Order accuracy improved by 40% and we reduced wait times significantly. The kitchen display is a game-changer.",
    avatar: "SJ",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "General Manager",
    company: "Dragon Wok",
    content:
      "The table management and reservation system helped us increase table turnover by 25%. The analytics give us insights we never had before.",
    avatar: "MC",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Restaurant Manager",
    company: "Café Moderne",
    content:
      "Easy to use and incredibly powerful. Our staff learned it in days. The POS system is fast and the split bill feature is perfect for our customers.",
    avatar: "ER",
    rating: 5,
  },
  {
    name: "David Thompson",
    role: "Owner",
    company: "The Steakhouse",
    content:
      "Best investment we've made. Inventory tracking alone saved us thousands. The customer management features help us provide personalized service.",
    avatar: "DT",
    rating: 5,
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: 49,
    period: "month",
    description: "Perfect for small restaurants and cafes",
    features: [
      "Up to 10 tables",
      "1 POS terminal",
      "Basic reporting",
      "Table management",
      "Order tracking",
      "Email support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    price: 99,
    period: "month",
    description: "Ideal for growing restaurants",
    popular: true,
    features: [
      "Up to 30 tables",
      "3 POS terminals",
      "Advanced analytics",
      "Kitchen display system",
      "Inventory management",
      "Customer management",
      "Reservation system",
      "Priority support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: 199,
    period: "month",
    description: "For large restaurants and chains",
    features: [
      "Unlimited tables",
      "Unlimited POS terminals",
      "Multi-location support",
      "Custom integrations",
      "Advanced permissions",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom training",
    ],
    cta: "Contact Sales",
  },
];

export const faqs: FAQ[] = [
  {
    question: "How long does it take to set up the system?",
    answer:
      "Most restaurants are up and running within 24 hours. We provide comprehensive onboarding, training materials, and support to ensure a smooth transition. The cloud-based system requires no hardware installation.",
  },
  {
    question: "Can I import my existing menu and data?",
    answer:
      "Yes! We support importing menus, customer data, and historical records from most restaurant management systems. Our team will assist with the migration process to ensure data integrity.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support all major payment methods including cash, credit cards, debit cards, and mobile payments (Apple Pay, Google Pay). The system calculates change automatically and supports split payments.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "The system is fully responsive and works seamlessly on tablets and mobile devices through any modern web browser. Native mobile apps are coming soon for iOS and Android.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We use bank-level encryption for all data transmission and storage. All data is backed up automatically with 99.9% uptime guarantee. We're compliant with GDPR and PCI DSS standards.",
  },
  {
    question: "Can I customize the system for my restaurant?",
    answer:
      "Absolutely! You can customize payment models, currency, tax rates, menu categories, table layouts, and user roles. The system adapts to your specific workflow and business needs.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "All plans include email support. Professional and Enterprise plans include priority support with faster response times. Enterprise customers get 24/7 phone support and a dedicated account manager.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start. You can explore the system and see if it's the right fit for your restaurant.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, there are no long-term contracts. You can cancel your subscription at any time. We also provide data export so you can take your information with you if needed.",
  },
  {
    question: "Do you offer training for my staff?",
    answer:
      "Yes! We provide comprehensive training materials including video tutorials, documentation, and live training sessions. Enterprise customers receive custom on-site training tailored to their needs.",
  },
];

export const benefits = [
  {
    icon: Zap,
    title: "Increase Efficiency",
    description: "Reduce order processing time by 50% and serve more customers",
  },
  {
    icon: TrendingUp,
    title: "Boost Revenue",
    description: "Optimize table turnover and identify your most profitable items",
  },
  {
    icon: Shield,
    title: "Reduce Errors",
    description: "Eliminate order mistakes with digital kitchen communication",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Automate reporting, inventory tracking, and daily operations",
  },
];
