import { ArrowLeft, Check, Info, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { StoreShell } from "@/components/StoreShell";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { formatRentalPrice, toShowcaseProduct } from "@/data/catalogue";
import { useProduct } from "@/hooks/useProducts";
import { useSeo } from "@/hooks/useSeo";
import { SEO_BY_PATH } from "@/lib/seo";




export default function ProductDetail() {
  const [, params] = useRoute("/catalogue/:slug");
  const [, setLocation] = useLocation();

  const { product: rawProduct, loading, error } = useProduct(params?.slug ?? null);
  const product = useMemo(() => (rawProduct ? toShowcaseProduct(rawProduct) : null), [rawProduct]);
  const [size, setSize] = useState(product?.sizes[0] ?? "");

  useSeo(
    product
      ? {
          title: `${product.name} | Dress Rental Cebu | MK Studio Collective`,
          description: `Rent ${product.name} in Cebu from MK Studio Collective. Check sizes, availability and pricing, then reserve with pickup in Talamban or delivery.`,
        }
      : SEO_BY_PATH["/catalogue"],
  );

  if (loading) return <StoreShell current="catalogue"><main className="not-found-page"><p className="eyebrow">Catalogue</p><h1>Loading...</h1></main></StoreShell>;

  if (error) return <StoreShell current="catalogue"><main className="not-found-page"><p className="eyebrow">Catalogue</p><h1>Something went wrong.</h1><p>{error}</p><button className="editorial-button editorial-button-dark" onClick={() => setLocation("/catalogue")}>Back to the catalogue <ArrowLeft size={16} /></button></main></StoreShell>;

  if (!product) return <StoreShell current="catalogue"><main className="not-found-page"><p className="eyebrow">Catalogue</p><h1>This piece has moved on.</h1><button className="editorial-button editorial-button-dark" onClick={() => setLocation("/catalogue")}>Back to the catalogue <ArrowLeft size={16} /></button></main></StoreShell>;



  return (
    <StoreShell current="catalogue">
      <main className="product-page">
        <button className="back-link" onClick={() => setLocation("/catalogue")}><ArrowLeft size={16} /> Back to catalogue</button>
        <div className="product-detail-layout">
          <div className="product-detail-image"><img src={product.image} alt={product.name} loading="lazy" decoding="async" /><span>{product.categoryLabel}</span><span className={`detail-availability availability-${product.availability.toLowerCase()}`}>{product.availability}</span></div>
          <article className="product-detail-copy">
            <p className="eyebrow">{product.categoryLabel}</p>
            <h1>{product.name}</h1>
            <p className="product-price">{formatRentalPrice(product.rentalPrice)} <span>for a 3-day rental</span></p>
            <div className="product-detail-meta"><div><span>Brand</span><strong>{product.brand || "Curated by MK Studio"}</strong></div><div><span>Style</span><strong>{product.style}</strong></div><div><span>Hemline</span><strong>{product.length}</strong></div>{product.dressLengthIn != null && <div><span>Length</span><strong>{product.dressLengthIn} inches</strong></div>}{product.waistIn != null && <div><span>Waist</span><strong>{product.waistIn} inches</strong></div>}{product.additionalDayPrice != null && <div><span>Additional day</span><strong>{formatRentalPrice(product.additionalDayPrice)}</strong></div>}</div>

            <section className="rental-config" aria-label="Rental information">
              <div className="rental-config-heading"><div><p className="eyebrow">Rental information</p><h2>Availability & Sizing</h2></div><span>{product.rentalNote}</span></div>
              <div className="size-row"><span>Sizes</span><div>{product.sizes.map(option => <button key={option} className={size === option ? "is-selected" : ""} onClick={() => setSize(option)}>{option.replace("UK ", "")}</button>)}</div></div>
              {product.availability === "Unavailable" && (
                <div className="availability-status">
                  <div>
                    <strong>Current Status: </strong>
                    <span className={`status-badge status-${product.availability.toLowerCase()}${product.availability === "Unavailable" ? " status-highlight" : ""}`}>{product.availability}</span>
                  </div>
                </div>
              )}
              {rawProduct && product.availability !== "Unavailable" && <AvailabilityCalendar slug={rawProduct.slug} />}
              {product.availability !== "Unavailable" && (
                <button className="editorial-button editorial-button-dark rental-add-button" onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSeFnOyIXPYX_qvs_M7MWI20rHxJmuPCRSgMvn85F_nr_-LsEQ/viewform", "_blank", "noopener,noreferrer")}>Inquire for rental <MessageSquare size={16} /></button>
              )}
            </section>
          </article>
        </div>
        <section className="detail-promise"><div><Check size={19} /><span>Curated to wear well</span></div><div><Check size={19} /><span>Professional care included</span></div><div><Check size={19} /><span>Styling guidance available</span></div></section>
      </main>
    </StoreShell>
  );
}
