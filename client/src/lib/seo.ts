export type SeoMeta = {
  title: string;
  description: string;
};

export const SITE_TITLE = "MK Studio Collective | Dress Rental in Cebu";

export const SITE_DESCRIPTION =
  "Rent curated dresses in Cebu for weddings, birthdays, parties and vacations. Browse over 100 pieces online with pickup in Talamban or delivery.";

export const SEO_BY_PATH: Record<string, SeoMeta> = {
  "/": {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  "/catalogue": {
    title: "Dress Rental Catalogue in Cebu | MK Studio Collective",
    description:
      "Browse over 100 rental dresses in Cebu. Filter by size, style, length and price, then reserve online with pickup in Talamban or delivery.",
  },
  "/about": {
    title: "Our Story | MK Studio Collective",
    description:
      "Meet MK Studio Collective, Cebu's shared closet: a curated dress rental service with free pickup in Talamban or delivery across Cebu.",
  },
  "/how-rental-works": {
    title: "How Rental Works in Cebu | MK Studio Collective",
    description:
      "See how dress rental works at MK Studio Collective: choose a dress, check availability, book, pay and receive confirmation in four steps.",
  },
  "/list-with-us": {
    title: "List Your Dress With Us | MK Studio Collective",
    description:
      "List your dress with MK Studio Collective. We recommend the rental price, handle every booking and keep you updated until your payout is ready.",
  },
  "/faq": {
    title: "Rental FAQ | MK Studio Collective",
    description:
      "Answers to common rental questions: booking, deposits, pickup and delivery in Cebu, returns, cleaning, stains, damage and sizing.",
  },
  "/contact": {
    title: "Contact the Studio | MK Studio Collective",
    description:
      "Contact MK Studio Collective about dress rental in Cebu: pickup in Talamban, delivery across Cebu, sizing help and styling guidance.",
  },
  "/404": {
    title: "Page Not Found | MK Studio Collective",
    description:
      "This page has moved on. Browse the MK Studio Collective catalogue of more than 100 rental dresses in Cebu.",
  },
};

const PRODUCT_PATH = /^\/catalogue\/.+/;

export function resolveSeo(pathname: string): SeoMeta | null {
  if (PRODUCT_PATH.test(pathname)) return null;
  return SEO_BY_PATH[pathname] ?? { title: SITE_TITLE, description: SITE_DESCRIPTION };
}
