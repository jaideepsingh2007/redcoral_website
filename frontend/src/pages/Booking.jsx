import React from "react";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { CheckCircle2, ArrowUpRight } from "lucide-react";

export default function Booking() {
  const [services, setServices] = React.useState([]);
  const [form, setForm] = React.useState({
    name: "", phone: "", email: "", service: "", preferred_date: "", preferred_time: "", notes: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { api.get("/services").then((r) => setServices(r.data)); }, []);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.service || !form.preferred_date || !form.preferred_time) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.email) delete payload.email;
      await api.post("/bookings", payload);
      setDone(true);
      toast.success("Booking request received! We'll call you shortly.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div data-testid="booking-page" className="max-w-[1400px] mx-auto px-6 md:px-10">
      <Toaster position="top-right" />
      <section className="pt-16 md:pt-24 pb-12 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <p className="eyebrow">Reserve · No prepayment</p>
          <h1 className="font-serif text-6xl md:text-8xl mt-4 leading-[0.95] text-espresso">Book your <em className="text-coral" style={{ fontStyle: 'italic' }}>ritual.</em></h1>
        </div>
        <div className="md:col-span-4 md:col-start-9 self-end">
          <p className="text-espressoSoft leading-relaxed">Tell us what you'd like and when. We'll confirm your appointment by call or WhatsApp within a few hours.</p>
        </div>
      </section>

      <section className="pb-24 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5 hidden md:block">
          <div className="editorial-img aspect-[3/4]">
            <img src="https://images.pexels.com/photos/1161282/pexels-photo-1161282.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Beauty" />
          </div>
        </div>

        <div className="md:col-span-7">
          {done ? (
            <div className="border border-gold/30 p-10 md:p-16 bg-creamAlt reveal" data-testid="booking-success">
              <CheckCircle2 size={48} className="text-coral" />
              <h2 className="font-serif text-4xl mt-6 text-espresso">Thank you, {form.name}.</h2>
              <p className="mt-4 text-espressoSoft leading-relaxed">
                Your booking request for <b className="text-espresso">{form.service}</b> on <b className="text-espresso">{form.preferred_date}</b> at <b className="text-espresso">{form.preferred_time}</b> has been received. We'll reach out on <b className="text-espresso">{form.phone}</b> shortly to confirm.
              </p>
              <button
                className="btn-outline mt-8"
                onClick={() => { setDone(false); setForm({ name: "", phone: "", email: "", service: "", preferred_date: "", preferred_time: "", notes: "" }); }}
                data-testid="booking-new-btn"
              >
                Book another <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6" data-testid="booking-form">
              <Field label="Full name *">
                <input required value={form.name} onChange={change("name")} data-testid="booking-name" className="rc-input" placeholder="Aisha Al Mansoori" />
              </Field>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Phone *">
                  <input required value={form.phone} onChange={change("phone")} data-testid="booking-phone" className="rc-input" placeholder="+971 50 000 0000" />
                </Field>
                <Field label="Email (optional)">
                  <input type="email" value={form.email} onChange={change("email")} data-testid="booking-email" className="rc-input" placeholder="you@example.com" />
                </Field>
              </div>
              <Field label="Service *">
                <select required value={form.service} onChange={change("service")} data-testid="booking-service" className="rc-input">
                  <option value="">Select a service…</option>
                  {services.map((s) => (
                    <option key={s.id} value={`${s.name} (AED ${s.price})`}>{s.category} — {s.name} · AED {s.price}</option>
                  ))}
                </select>
              </Field>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Preferred date *">
                  <input type="date" min={today} required value={form.preferred_date} onChange={change("preferred_date")} data-testid="booking-date" className="rc-input" />
                </Field>
                <Field label="Preferred time *">
                  <input type="time" required value={form.preferred_time} onChange={change("preferred_time")} data-testid="booking-time" className="rc-input" />
                </Field>
              </div>
              <Field label="Notes (optional)">
                <textarea value={form.notes} onChange={change("notes")} data-testid="booking-notes" className="rc-input min-h-[120px]" placeholder="Any preferences, allergies, or special requests…" />
              </Field>
              <button type="submit" disabled={submitting} className="btn-primary" data-testid="booking-submit">
                {submitting ? "Sending…" : "Request appointment"} <ArrowUpRight size={16} />
              </button>
            </form>
          )}
        </div>
      </section>

      <style>{`
        .rc-input {
          width: 100%;
          background: #FAF9F6;
          border: 1px solid rgba(197, 160, 89, 0.4);
          padding: 14px 16px;
          color: #2C1E16;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }
        .rc-input:focus { border-color: #B53A26; background: #fff; }
        .rc-input::placeholder { color: #A0928A; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}
