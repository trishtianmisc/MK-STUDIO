import type { ProductWithRelations } from "@/services/products";

export type ProductCategory = string;
export type AvailabilityStatus = "Available" | "Limited" | "Unavailable";

export type ShowcaseProduct = {
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  image: string;
  style: string;
  length: string;
  sizes: string[];
  brand: string;
  rentalPrice: number;
  additionalDayPrice: number | null;
  availability: AvailabilityStatus;
  rentalNote: string;
  closet: string;
  featured?: boolean;
};

export const formatRentalPrice = (price: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(price);

/**
 * Convert a product with joined category from the API
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
    style: row.style ?? "",
    length: row.length ?? "",
    sizes: row.sizes ?? [],
    brand: row.brand ?? "",
    rentalPrice: row.rental_price,
    additionalDayPrice: row.additional_day_price ?? null,
    availability: row.availability as AvailabilityStatus,
    rentalNote: row.rental_note ?? "",
    closet: row.closet ?? "MK STUDIO",
    featured: row.is_featured,
  };
}
