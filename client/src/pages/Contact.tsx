import { useEffect, useRef } from "react";
import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { StoreShell } from "@/components/StoreShell";

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("is-revealed"); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

function Reveal({ children, className = "", delay }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useReveal();
  return <div ref={ref} className={`ct-reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>;
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    toast("Message preview sent", { description: "This form is frontend-only and does not send information yet." });
  };
  return (
    <StoreShell current="contact">
      <main className="ct-page">

        <section className="ct-hero">
          <div className="ct-hero-visual">
            <img src="/images/mkherosec2.webp" alt="MK Studio" loading="eager" decoding="async" />
            <div className="ct-hero-vignette" />
          </div>
          <div className="ct-hero-content">
            <p className="ct-hero-eyebrow">MK Studio · Get in touch</p>
            <h1>Tell us about<br /><em>the plan.</em></h1>
            <div className="ct-hero-rule" />
          </div>
          <span className="ct-hero-side-note">Enquiries</span>
        </section>

        <section className="ct-main">
          <div className="ct-main-grid">

            <div className="ct-info">
              <Reveal className="ct-info-inner">
                <p className="ct-info-eyebrow">Contact</p>
                <h2>We&rsquo;d love to<br /><em>hear from you.</em></h2>
                <p className="ct-info-lead">For styling enquiries, appointments, or a little guidance choosing a look — get in touch with the studio.</p>

                <div className="ct-info-items">
                  <article className="ct-info-item">
                    <Mail size={16} />
                    <div>
                      <span>Email</span>
                      <a href="mailto:mksolutionscebu@gmail.com">mksolutionscebu@gmail.com</a>
                    </div>
                  </article>
                  <article className="ct-info-item">
                    <Phone size={16} />
                    <div>
                      <span>Phone</span>
                      <a href="tel:+09951813723">+63 995 181 3723</a>
                    </div>
                  </article>
                  
                  <article className="ct-info-item">
                    <Instagram size={16} />
                    <div>
                      <span>Social</span>
                      <a href="https://www.instagram.com/mkstudiocollective/" target="_blank" rel="noopener noreferrer">@mkstudiocollective</a>
                    </div>
                  </article>
                </div>
              </Reveal>
            </div>

            <div className="ct-form-wrap">
              <Reveal className="ct-form-inner" delay={80}>
                <form className="ct-form" onSubmit={submit}>
                  <p className="ct-form-eyebrow">Start a conversation</p>
                  <div className="ct-form-row">
                    <label>Your name<input required name="name" placeholder="Name" /></label>
                    <label>Email address<input required type="email" name="email" placeholder="you@example.com" /></label>
                  </div>
                  <label>What are you getting ready for?<select name="occasion" defaultValue=""><option value="" disabled>Select an occasion</option><option>Wedding guest</option><option>Date night</option><option>Studio to dinner</option><option>Styling appointment</option><option>Something else</option></select></label>
                  <label>Tell us a little more<textarea name="message" rows={4} placeholder="The date, the mood, the detail…" /></label>
                  <button className="ct-form-btn" type="submit">{sent ? "Message preview sent" : "Send Inquiry"} <ArrowUpRight size={15} /></button>
                  <p className="ct-form-note">This is a frontend-only contact form. Email sending can be added when the backend phase begins.</p>
                </form>
              </Reveal>
            </div>

          </div>
        </section>

        <section className="ct-social">
          <Reveal className="ct-social-inner">
            <p className="ct-social-eyebrow">Follow the studio</p>
            <div className="ct-social-links">
              <a href="https://www.instagram.com/mkstudiocollective/" target="_blank" rel="noopener noreferrer" className="ct-social-link">
                <Instagram size={18} />
                <span>Instagram</span>
                <ArrowUpRight size={14} />
              </a>
              <a href="https://www.facebook.com/MKStudioCollective/" target="_blank" rel="noopener noreferrer" className="ct-social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                <span>Facebook</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </Reveal>
        </section>

      </main>
    </StoreShell>
  );
}
