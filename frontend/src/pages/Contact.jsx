import React from "react";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { Phone, Mail, MapPin, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill required fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;
      await api.post("/contact", payload);
      setDone(true);
      toast.success("Message sent!");
    } catch (err) {
      toast.error("Failed to send. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page" className="max-w-[1400px] mx-auto px-6 md:px-10">
      <Toaster position="top-right" />
      <section className="pt-16 md:pt-24 pb-16 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          <p className="eyebrow">Get in touch</p>
          <h1 className="font-serif text-6xl md:text-8xl mt-4 leading-[0.95] text-espresso">Say <em className="text-coral" style={{ fontStyle: 'italic' }}>hello.</em></h1>
        </div>
        <div className="md:col-span-4 md:col-start-9 self-end">
          <p className="text-espressoSoft leading-relaxed">Have a question, a bridal enquiry, or want to collaborate? Send us a message and we'll respond within a day.</p>
        </div>
      </section>

      <section className="pb-24 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5 space-y-8">
          <Info icon={<Phone size={20} />} label="Phone / WhatsApp" value="+971 50 233 5799" href="tel:+971502335799" testid="contact-phone-link" />
          <Info icon={<Mail size={20} />} label="Email" value="redcoralbeauty@gmail.com" href="mailto:redcoralbeauty@gmail.com" testid="contact-email-link" />
          <Info icon={<MapPin size={20} />} label="Location" value={"Old Muwaileh Commercial\nSharjah, UAE"} testid="contact-location" />
          <Info icon={<Clock size={20} />} label="Hours" value={"Sat – Thu · 10 AM – 10 PM\nFriday · 2 PM – 10 PM"} testid="contact-hours" />

          <div className="editorial-img aspect-[4/3] mt-8">
            <iframe
              title="map"
              src="https://www.google.com/maps?q=Red+Coral+Ladies+Beauty+Center+Muwaileh+Sharjah&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'saturate(0.85)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="md:col-span-7">
          {done ? (
            <div className="border border-gold/30 p-10 bg-creamAlt reveal" data-testid="contact-success">
              <CheckCircle2 size={44} className="text-coral" />
              <h2 className="font-serif text-4xl mt-6 text-espresso">Message received.</h2>
              <p className="text-espressoSoft mt-3">Thank you, {form.name}. We'll be in touch shortly at {form.email}.</p>
              <button className="btn-outline mt-8" onClick={() => { setDone(false); setForm({ name: "", email: "", phone: "", message: "" }); }} data-testid="contact-new-btn">
                Send another <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6" data-testid="contact-form">
              <div className="grid md:grid-cols-2 gap-6">
                <F label="Name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rc-c-input" data-testid="contact-name" /></F>
                <F label="Email *"><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rc-c-input" data-testid="contact-email" /></F>
              </div>
              <F label="Phone (optional)"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rc-c-input" data-testid="contact-phone" /></F>
              <F label="Message *"><textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rc-c-input min-h-[160px]" data-testid="contact-message" /></F>
              <button disabled={submitting} className="btn-primary" data-testid="contact-submit">
                {submitting ? "Sending…" : "Send Message"} <ArrowUpRight size={16} />
              </button>
            </form>
          )}
        </div>
      </section>

      <style>{`
        .rc-c-input {
          width: 100%;
          background: #FAF9F6;
          border: 1px solid rgba(197, 160, 89, 0.4);
          padding: 14px 16px;
          color: #2C1E16;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s ease;
        }
        .rc-c-input:focus { border-color: #B53A26; }
      `}</style>
    </div>
  );
}

function F({ label, children }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}

function Info({ icon, label, value, href, testid }) {
  const content = (
    <div className="flex gap-5" data-testid={testid}>
      <div className="w-11 h-11 border border-coral/40 flex items-center justify-center text-coral flex-shrink-0">{icon}</div>
      <div>
        <p className="eyebrow">{label}</p>
        <p className="text-espresso mt-1 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="block hover:opacity-80 transition-opacity">{content}</a> : content;
}
