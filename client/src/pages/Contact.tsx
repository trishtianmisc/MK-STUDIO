import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { StoreShell } from "@/components/StoreShell";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    toast("Message preview sent", { description: "This form is frontend-only and does not send information yet." });
  };
  return (
    <StoreShell current="contact">
      <main className="contact-page">
        <section className="contact-hero"><p className="eyebrow">Contact MK Studio</p><h1>Tell us about<br /><em>the plan.</em></h1><p>For styling enquiries, appointments, or a little guidance choosing a look, get in touch with the studio.</p></section>
        <section className="contact-layout">
          <div className="contact-details"><article><Mail size={19} /><div><span>Email</span><a href="mailto:hello@mkstudio.example">hello@mkstudio.example</a></div></article><article><Phone size={19} /><div><span>Phone</span><a href="tel:+0000000000">+00 000 000 000</a></div></article><article><MapPin size={19} /><div><span>Studio visits</span><p>By appointment only<br />Location details on confirmation</p></div></article><article><Instagram size={19} /><div><span>Social</span><a href="#" onClick={e => e.preventDefault()}>@mkstudio</a></div></article></div>
          <form className="contact-form" onSubmit={submit}><p className="eyebrow">Start a conversation</p><label>Your name<input required name="name" placeholder="Name" /></label><label>Email address<input required type="email" name="email" placeholder="you@example.com" /></label><label>What are you getting ready for?<select name="occasion" defaultValue=""><option value="" disabled>Select an occasion</option><option>Wedding guest</option><option>Date night</option><option>Studio to dinner</option><option>Styling appointment</option><option>Something else</option></select></label><label>Tell us a little more<textarea name="message" rows={4} placeholder="The date, the mood, the detail…" /></label><button className="editorial-button editorial-button-dark" type="submit">{sent ? "Message preview sent" : "Send enquiry"} <ArrowUpRight size={16} /></button><p className="form-note">This is a frontend-only contact form. Email sending can be added when the backend phase begins.</p></form>
        </section>
      </main>
    </StoreShell>
  );
}
