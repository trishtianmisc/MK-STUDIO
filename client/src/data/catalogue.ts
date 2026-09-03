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
  rentalPrice: number;
  availability: AvailabilityStatus;
  unavailableDays: number[];
  rentalNote: string;
  featured?: boolean;
};

export const formatRentalPrice = (price: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(price);

export const categoryMeta: Record<string, { label: string; short: string; image: string }> = {
  "wedding-guest": { label: "Wedding guest", short: "For the invitation", image: "/images/my-studio-wedding_fb88aaa2.jpg" },
  "date-night": { label: "Date night", short: "For after dark", image: "/images/my-studio-date-night_9391da5f.jpg" },
  "studio-to-dinner": { label: "Studio to dinner", short: "For the whole day", image: "/images/my-studio-workwear_671a35a4.jpg" },
  "consignment": { label: "Consignment", short: "Pre-loved studio pieces", image: "/images/my-studio-mark_4967063e.png" },
};

/**
 * Convert a product with joined category and images from the API
 * into the existing frontend ShowcaseProduct shape.
 */
export function toShowcaseProduct(row: ProductWithRelations): ShowcaseProduct {
  const categorySlug = row.categories?.slug ?? "";
  const categoryLabel = row.categories?.name ?? "";

  // Pick the best image: prefer primary from product_images, else fallback to product.image
  let image = row.image ?? "";
  if (row.product_images && row.product_images.length > 0) {
    const primary = row.product_images.find((img) => img.is_primary);
    if (primary) {
      image = primary.url;
    } else {
      // Sort by sort_order and pick the first
      const sorted = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order);
      image = sorted[0].url;
    }
  }

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
    rentalPrice: row.rental_price,
    availability: row.availability as AvailabilityStatus,
    unavailableDays: row.unavailable_days ?? [],
    rentalNote: row.rental_note ?? "",
    featured: row.is_featured,
  };
}
