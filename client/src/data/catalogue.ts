import type { ProductWithRelations } from "@/services/products";

export type ProductCategory = string;
export type AvailabilityStatus = "Available" | "Limited" | "Unavailable";

export type ShowcaseProduct = {
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  image: string;
  description: string;
  details: string;
  sizing: string;
  sizes: string[];
  fabric: string;
  color: string;
  brand: string;
  rentalPrice: number;
  availability: AvailabilityStatus;
  rentalNote: string;
  featured?: boolean;
};

export const formatRentalPrice = (price: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(price);

export const categoryMeta: Record<string, { label: string; short: string; image: string }> = {
  "wedding-guest": { label: "Wedding guest", short: "For the invitation", image: "/images/my-studio-wedding_fb88aaa2.jpg" },
  "formal": { label: "Formal", short: "For after dark", image: "/images/my-studio-date-night_9391da5f.jpg" },
  "casual": { label: "Casual", short: "For the whole day", image: "/images/my-studio-workwear_671a35a4.jpg" },
  "prom": { label: "Prom", short: "Pre-loved studio pieces", image: "/images/my-studio-mark_4967063e.png" },
  "evening": { label: "Evening", short: "Pre-loved studio pieces", image: "/images/my-studio-mark_4967063e.png" },

};

/**
 * Convert a product with joined category and images from the API
 * into the existing frontend ShowcaseProduct shape.
 */
export function toShowcaseProduct(row: ProductWithRelations): ShowcaseProduct {
  const categorySlug = row.categories?.slug ?? "";
  const categoryLabel = row.categories?.name ?? "";

  const image = row.image ?? "";

  return {
    slug: row.slug,
    name: row.name,
    category: categorySlug,
    categoryLabel,
    image,
    description: row.description ?? "",
    details: row.details ?? "",
    sizing: row.sizing ?? "",
    sizes: row.sizes ?? [],
    fabric: row.fabric ?? "",
    color: row.color ?? "",
    brand: row.brand ?? "",
    rentalPrice: row.rental_price,
    availability: row.availability as AvailabilityStatus,
    rentalNote: row.rental_note ?? "",
    featured: row.is_featured,
  };
}
