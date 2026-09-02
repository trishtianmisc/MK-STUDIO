import { ArrowLeft, ArrowUpRight, Check, Info, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { StoreShell } from "@/components/StoreShell";
import { formatRentalPrice, showcaseProducts } from "@/data/catalogue";




export default function ProductDetail() {
  const [, params] = useRoute("/catalogue/:slug");
  const [, setLocation] = useLocation();

  const product = showcaseProducts.find(item => item.slug === params?.slug);
  const [size, setSize] = useState(product?.sizes[0] ?? "");


  if (!product) return <StoreShell current="catalogue"><main className="not-found-page"><p className="eyebrow">Catalogue</p><h1>This piece has moved on.</h1><button className="editorial-button editorial-button-dark" onClick={() => setLocation("/catalogue")}>Back to the catalogue <ArrowLeft size={16} /></button></main></StoreShell>;



  return (
    <StoreShell current="catalogue">
      <main className="product-page">
        <button className="back-link" onClick={() => setLocation("/catalogue")}><ArrowLeft size={16} /> Back to catalogue</button>
        <div className="product-detail-layout">
          <div className="product-detail-image"><img src={product.image} alt={product.name} /><span>{product.categoryLabel}</span><span className={`detail-availability availability-${product.availability.toLowerCase()}`}>{product.availability} for September</span></div>
          <article className="product-detail-copy">
            <p className="eyebrow">{product.categoryLabel}</p>
            <h1>{product.name}</h1>
            <p className="product-price">{formatRentalPrice(product.rentalPrice)} <span>for a 3-day rental</span></p>
            <p className="product-detail-lead">{product.description}</p>
            <div className="product-detail-meta"><div><span>Colour</span><strong>{product.color}</strong></div><div><span>Fabric</span><strong>{product.fabric}</strong></div><div><span>Size guide</span><strong>{product.sizing}</strong></div></div>
            <p className="product-detail-text">{product.details}</p>

            <section className="rental-config" aria-label="Rental information">
              <div className="rental-config-heading"><div><p className="eyebrow">Rental information</p><h2>Availability & Sizing</h2></div><span>{product.rentalNote}</span></div>
              <div className="size-row"><span>Available sizes</span><div>{product.sizes.map(option => <button key={option} className={size === option ? "is-selected" : ""} onClick={() => setSize(option)}>{option.replace("UK ", "")}</button>)}</div></div>
              <div className="availability-status">
                <div>
                  <Info size={16} />
                  <strong>Current Status</strong>
                  <span className={`status-badge status-${product.availability.toLowerCase()}`}>{product.availability}</span>
                </div>
                <p>Availability is updated weekly. Contact the studio with your preferred dates to secure this piece.</p>
              </div>
              <button className="editorial-button editorial-button-dark rental-add-button" onClick={() => setLocation("/contact")}>Enquire for rental <MessageSquare size={16} /></button>
            </section>
          </article>
        </div>
        <section className="detail-promise"><div><Check size={19} /><span>Curated to wear well</span></div><div><Check size={19} /><span>Professional care included</span></div><div><Check size={19} /><span>Styling guidance available</span></div></section>
      </main>
    </StoreShell>
  );
}
