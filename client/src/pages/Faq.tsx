import { ChevronDown, MessageSquare } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";

const BOOKING_FORM_URL = "https://forms.gle/63MSRA933JAaKBEv7";

function BookingFormLink() {
  return (
    <a href={BOOKING_FORM_URL} target="_blank" rel="noopener noreferrer">
      Booking Form
    </a>
  );
}

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "How do I reserve a dress?",
    a: (
      <>
        <p>
          Choose the dress you'd like to rent and complete our <BookingFormLink />. To secure your
          reservation, 100% of the rental fee + refundable security deposit must be paid upon booking.
          Simply:
        </p>
        <ol>
          <li>Fill out your booking details.</li>
          <li>Pay the rental fee + security deposit using the QR code provided.</li>
          <li>Upload your proof of payment.</li>
          <li>Submit the form.</li>
        </ol>
        <p>
          Once your booking and payment have been verified, MK Studio Collective will send your
          confirmation via email. Your reservation is only secured once payment has been received and
          your booking has been confirmed.
        </p>
      </>
    ),
  },
  {
    q: "How early do I need to book?",
    a: (
      <>
        <p>
          We accept bookings up to 1 day before your scheduled delivery or pickup, subject to
          availability.
        </p>
        <p>
          For urgent or same-day bookings, please send us a direct message so we can check if we can
          accommodate your request.
        </p>
      </>
    ),
  },
  {
    q: "Is the rental payment refundable?",
    a: (
      <>
        <p>
          Once your reservation is confirmed, the rental fee is non-refundable as the dress is
          reserved exclusively for your selected dates.
        </p>
        <p>Your security deposit remains refundable subject to our return and damage policies.</p>
      </>
    ),
  },
  {
    q: "Can I reschedule my reservation?",
    a: (
      <p>
        Yes. Rescheduling is allowed with at least 7 days' notice and is subject to dress availability
        on your new requested dates.
      </p>
    ),
  },
  {
    q: "Is there a security deposit?",
    a: (
      <p>
        Yes. A refundable security deposit is paid together with your rental fee when booking. The
        amount depends on the rental price and value of your selected dress and will be indicated on
        its listing.
      </p>
    ),
  },
  {
    q: "When will my security deposit be refunded?",
    a: (
      <>
        <p>
          Once the dress is returned, we will inspect its condition. If everything is in order, your
          security deposit will be refunded via GCash on the same day after inspection.
        </p>
        <p>
          Charges for permanent stains, damage, missing items or other applicable issues may be
          deducted from the deposit.
        </p>
      </>
    ),
  },
  {
    q: "Do I need to provide an ID?",
    a: (
      <p>
        Yes. A photo of one valid ID is required. You do not need to surrender your physical ID.
      </p>
    ),
  },
  {
    q: "Can I pick up my dress?",
    a: (
      <p>
        Yes! Pickup at E-Park Talamban is free. Delivery is also available, with the courier fee
        shouldered by the renter.
      </p>
    ),
  },
  {
    q: "How does delivery work?",
    a: (
      <p>
        Provide your complete delivery details and preferred schedule. MK Studio Collective will
        arrange the courier booking, while the courier fee is shouldered by the renter.
      </p>
    ),
  },
  {
    q: "How do I return the dress?",
    a: (
      <p>
        You can return your dress for free at E-Park Talamban. For courier returns, send us your pin
        location and MK Studio Collective will arrange the courier pickup. The courier fee is
        shouldered by the renter.
      </p>
    ),
  },
  {
    q: "What happens if I return the dress late?",
    a: (
      <p>
        The additional-day rate listed for your dress will apply to late returns. Please return the
        dress on the agreed date, as it may already be reserved by another renter.
      </p>
    ),
  },
  {
    q: "Is cleaning included?",
    a: (
      <p>
        Yes! 🤍 Standard cleaning is included in your rental fee. Please do not wash, dry-clean or
        attempt to remove stains yourself. Simply return the dress to us and we'll take care of it.
      </p>
    ),
  },
  {
    q: "What happens if the dress gets stained?",
    a: (
      <>
        <p>Please do not attempt to remove the stain yourself.</p>
        <p>
          We will inspect the dress upon return. Minor stains that can be removed through standard
          cleaning will be handled by us. For permanent stains or stains requiring special treatment,
          applicable charges may be deducted from your security deposit.
        </p>
      </>
    ),
  },
  {
    q: "What happens if the dress is damaged?",
    a: (
      <p>
        Permanent stains, tears, broken zippers, missing embellishments or other damage beyond normal
        wear will be assessed upon return. The applicable repair or replacement cost may be deducted
        from your security deposit. If the cost exceeds the security deposit, the renter will be
        responsible for the remaining amount.
      </p>
    ),
  },
  {
    q: "What happens if the dress is lost or not returned?",
    a: <p>The renter will be responsible for the full replacement value of the dress.</p>,
  },
  {
    q: "Can I steam or iron the dress?",
    a: (
      <p>
        Yes. You may gently steam or iron the dress using an appropriate heat setting for the fabric.
        If you're unsure, please message us first and we'll be happy to guide you.
      </p>
    ),
  },
  {
    q: "Can I try on the dress before booking?",
    a: (
      <p>
        We currently do not offer physical fittings or try-ons, but measurements are provided to help
        you determine the right fit. We recommend comparing the measurements with a dress you already
        own that fits you well.
      </p>
    ),
  },
  {
    q: "What if I need more measurements or sizing help?",
    a: (
      <p>
        Just message us! 🤍 We'd be happy to provide additional measurements or sizing assistance
        before you book. Since physical fittings are not available, the final size and fit decision
        remains with the renter.
      </p>
    ),
  },
  {
    q: "What if I still have questions?",
    a: (
      <p>
        Feel free to message MK Studio Collective anytime before booking. We're happy to help with
        measurements, sizing, dress details or the rental process.
      </p>
    ),
  },
];

export default function Faq() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (index: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <StoreShell current="faq">
      <main className="faq-page">
        <section className="faq-hero" aria-labelledby="faq-heading">
          <p className="eyebrow">Rental FAQ</p>
          <h1 id="faq-heading">
            Everything you need to{" "}
            <br />
            <em>know before booking.</em>
          </h1>
          <p className="faq-hero-lead">
            Everything you need to know before booking your dress with MK Studio Collective. 🤍
          </p>
        </section>

        <section className="faq-content" aria-label="Rental frequently asked questions">
          <div className="faq-list">
            {faqs.map((item, index) => {
              const isOpen = open.has(index);
              return (
                <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.q}>
                  <h2 className="faq-question-heading">
                    <button
                      id={`faq-q-${index}`}
                      className="faq-question"
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${index}`}
                      onClick={() => toggle(index)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown className="faq-icon" size={18} aria-hidden="true" />
                    </button>
                  </h2>
                  <div
                    id={`faq-a-${index}`}
                    className="faq-answer"
                    role="region"
                    aria-labelledby={`faq-q-${index}`}
                    inert={!isOpen}
                  >
                    <div className="faq-answer-inner">{item.a}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="faq-note">
            <strong>By submitting a booking</strong> By submitting the <BookingFormLink /> and making
            payment, you confirm that you have read and agreed to MK Studio Collective's Rental
            Policies.
          </p>

          <div className="faq-cta">
            <p>Still have a question before you book?</p>
            <button
              className="editorial-button editorial-button-dark"
              onClick={() => setLocation("/contact")}
            >
              Message the studio <MessageSquare size={16} />
            </button>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
