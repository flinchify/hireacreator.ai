import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as any });
  }
  return stripeInstance;
}

// Price IDs
export const PRICES = {
  CREATOR_PRO: process.env.STRIPE_PRICE_CREATOR_PRO || "price_1TBVAUIwOsP524pVU90ZJJCT",
  CREATOR_BIZ: process.env.STRIPE_PRICE_CREATOR_BIZ || "price_1TBVApIwOsP524pVgsdFlzq6",
  BRAND_PRO: process.env.STRIPE_PRICE_BRAND_PRO || "price_1TE9g4IwOsP524pVY1WLYwIo",
  BRAND_ENTERPRISE: process.env.STRIPE_PRICE_BRAND_ENTERPRISE || "price_1TBVBPIwOsP524pV3ApCL98K",
  API_PRO: process.env.STRIPE_PRICE_API_PRO || "price_1TBVBbIwOsP524pV9reePLA4",
  BOOSTED: process.env.STRIPE_PRICE_BOOSTED || "price_1TBVBzIwOsP524pVRGPIOZyC",
} as const;

export const MARKETPLACE_FEE_PERCENT = parseInt(process.env.STRIPE_MARKETPLACE_FEE_PERCENT || "10");
export const ENTERPRISE_FEE_PERCENT = parseInt(process.env.STRIPE_ENTERPRISE_FEE_PERCENT || "5");
