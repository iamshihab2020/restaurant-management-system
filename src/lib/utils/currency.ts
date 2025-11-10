export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "INR"
  | "AUD"
  | "CAD"
  | "CHF"
  | "SGD"
  | "MXN"
  | "BRL"
  | "BDT"
  | "MDL";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  symbolPosition: "before" | "after";
  decimalPlaces: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    symbolPosition: "before",
    decimalPlaces: 0,
  },
  CNY: {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  AUD: {
    code: "AUD",
    symbol: "$",
    name: "Australian Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  CAD: {
    code: "CAD",
    symbol: "$",
    name: "Canadian Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  CHF: {
    code: "CHF",
    symbol: "Fr",
    name: "Swiss Franc",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  SGD: {
    code: "SGD",
    symbol: "$",
    name: "Singapore Dollar",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  MXN: {
    code: "MXN",
    symbol: "$",
    name: "Mexican Peso",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  BDT: {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
  MDL: {
    code: "MDL",
    symbol: "L",
    name: "Moldovan Leu",
    symbolPosition: "before",
    decimalPlaces: 2,
  },
};

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return "$";
  const currency = CURRENCIES[currencyCode as CurrencyCode];
  return currency ? currency.symbol : "$";
}

export function getCurrencyInfo(currencyCode?: string): CurrencyInfo {
  if (!currencyCode) return CURRENCIES.USD;
  return CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.USD;
}

export function formatCurrency(amount: number, currencyCode?: string): string {
  const currency = getCurrencyInfo(currencyCode);
  const formattedAmount = amount.toFixed(currency.decimalPlaces);

  if (currency.symbolPosition === "before") {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${currency.symbol}`;
  }
}

export function getCurrentCurrency(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("restaurantSettings");
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.currency || "USD";
    }
  }
  return "USD";
}
