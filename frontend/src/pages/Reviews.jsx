import React from "react";
import { api } from "@/lib/api";
import { Star, ArrowUpRight } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Reviews() {
  const [reviews, setReviews] = React.useState([]);
  const [form, setForm] = React.useState({ name: "", rating: 5, comment: "", service: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);

  const load = () => api.get("/reviews").then((r) => setReviews(r.data)).catch(() => {});
  React.useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      toast.error("Please add your name and a comment");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", form);
      toast.success("Thank you for your review!");
      setForm({ name: "", rating: 5, comment: "", service: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error("Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div data-testid="reviews-page" className="max-w-[1400px] mx-auto px-6 md:px-10">
      <Toaster position="top-right" />
      <section className="pt-16 md:pt-24 pb-12 grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <p className="eyebrow">Guest stories</p>
          <h1 className="font-serif text-6xl md:text-8xl mt-4 leading-[0.95] text-espresso">Guest <em className="text-coral" style={{ fontStyle: 'italic' }}>reviews.</em></h1>
        </div>
        <div className="md:col-span-4 md:text-right">
          <div className="inline-flex items-baseline gap-3 border border-gold/30 px-6 py-4 bg-creamAlt">
            <span className="font-serif text-5xl text-coral">{avg}</span>
            <div>
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="text-xs tracking-[0.2em] uppercase text-espressoSoft mt-1">{reviews.length} reviews</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-outline" : "btn-primary"}
          data-testid="reviews-toggle-form"
        >
          {showForm ? "Cancel" : "Write a review"} <ArrowUpRight size={14} />
        </button>

        {showForm && (
          <form onSubmit={submit} className="mt-8 border border-gold/30 p-8 md:p-10 bg-creamAlt reveal max-w-2xl" data-testid="review-form">
            <div className="grid md:grid-cols-2 gap-6">
              <label className="block">
                <span className="eyebrow block mb-2">Your name *</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rc-input-r" data-testid="review-name" />
              </label>
              <label className="block">
                <span className="eyebrow block mb-2">Service (optional)</span>
                <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="rc-input-r" data-testid="review-service" placeholder="e.g. Bridal Makeup" />
              </label>
            </div>
            <div className="mt-6">
              <span className="eyebrow block mb-2">Rating</span>
              <div className="flex gap-2" data-testid="review-rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setForm({ ...form, rating: n })}
                    className="p-1"
                    data-testid={`review-star-${n}`}
                    aria-label={`${n} stars`}
                  >
                    <Star size={28} className={n <= form.rating ? "text-gold" : "text-gold/30"} fill={n <= form.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>
            <label className="block mt-6">
              <span className="eyebrow block mb-2">Your review *</span>
              <textarea required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="rc-input-r min-h-[120px]" data-testid="review-comment" />
            </label>
            <button type="submit" disabled={submitting} className="btn-primary mt-6" data-testid="review-submit">
              {submitting ? "Publishing…" : "Publish review"}
            </button>
          </form>
        )}
      </section>

      <section className="py-12 grid md:grid-cols-2 gap-6">
        {reviews.map((r) => (
          <div key={r.id} className="border border-gold/25 p-8 bg-cream" data-testid={`review-card-${r.id}`}>
            <div className="flex items-center gap-1 text-gold mb-4">
              {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
            </div>
            <p className="font-serif italic text-xl md:text-2xl text-espresso leading-snug">"{r.comment}"</p>
            <div className="mt-6 flex items-center justify-between border-t border-gold/15 pt-4">
              <p className="text-xs tracking-[0.22em] uppercase text-espressoSoft">— {r.name}</p>
              {r.service && <p className="text-xs text-gold uppercase tracking-[0.18em]">{r.service}</p>}
            </div>
          </div>
        ))}
      </section>

      <style>{`
        .rc-input-r {
          width: 100%;
          background: #FAF9F6;
          border: 1px solid rgba(197, 160, 89, 0.4);
          padding: 12px 14px;
          color: #2C1E16;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s ease;
        }
        .rc-input-r:focus { border-color: #B53A26; }
      `}</style>
    </div>
  );
}
