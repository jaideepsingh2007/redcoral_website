import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

export default function Services() {
  const [services, setServices] = React.useState([]);
  const [combos, setCombos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([api.get("/services"), api.get("/combos")])
      .then(([s, c]) => {
        setServices(s.data);
        setCombos(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = React.useMemo(() => {
    const g = {};
    services.forEach((s) => {
      if (!g[s.category]) g[s.category] = [];
      g[s.category].push(s);
    });
    return g;
  }, [services]);

  return (
    <div data-testid="services-page" className="max-w-[1400px] mx-auto px-6 md:px-10">
      {/* Header */}
      <section className="pt-16 md:pt-24 pb-16 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <p className="eyebrow">Our menu · Prices in AED</p>
          <h1 className="font-serif text-6xl md:text-8xl mt-4 leading-[0.95] text-espresso">The <em className="text-coral" style={{ fontStyle: 'italic' }}>menu.</em></h1>
        </div>
        <div className="md:col-span-4 md:col-start-9 self-end">
          <p className="text-espressoSoft leading-relaxed">Transparent pricing across hair, nails, waxing, facial, bridal, and henna. Combos rotate each season — check the top of this page.</p>
        </div>
      </section>

      {/* Combos */}
      {combos.length > 0 && (
        <section className="mb-24 border-t border-b border-gold/25 py-12">
          <p className="eyebrow"><Sparkles size={12} className="inline mr-1 mb-0.5" /> This season</p>
          <h2 className="font-serif text-4xl md:text-5xl mt-3 text-espresso mb-10">Combo <em className="text-coral" style={{ fontStyle: 'italic' }}>offers.</em></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {combos.map((c) => (
              <div key={c.id} className="border border-gold/25 p-8 bg-creamAlt flex flex-col" data-testid={`combo-${c.id}`}>
                <h3 className="font-serif text-2xl text-espresso">{c.title}</h3>
                <p className="mt-3 text-sm text-espressoSoft leading-relaxed flex-1">{c.description}</p>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-serif text-3xl text-coral">AED {c.price}</span>
                  {c.original_price && (
                    <span className="text-espressoSoft/60 line-through text-sm">AED {c.original_price}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full menu */}
      <section className="pb-24">
        {loading && <p className="text-espressoSoft">Loading menu…</p>}
        {!loading && Object.keys(grouped).sort().map((category) => (
          <div key={category} className="mb-16" data-testid={`category-${category}`}>
            <div className="grid md:grid-cols-12 gap-8 mb-8">
              <div className="md:col-span-3">
                <p className="eyebrow">Category</p>
                <h3 className="font-serif text-4xl mt-2 text-coral">{category}</h3>
              </div>
              <div className="md:col-span-9 space-y-2">
                {grouped[category].map((s) => (
                  <div key={s.id} className="flex items-baseline justify-between py-6 border-b border-gold/20 gap-6" data-testid={`service-${s.id}`}>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-4 flex-wrap">
                        <h4 className="font-serif text-2xl text-espresso">{s.name}</h4>
                        {s.duration_min && <span className="text-xs tracking-[0.2em] uppercase text-espressoSoft">· {s.duration_min} min</span>}
                      </div>
                      {s.description && <p className="text-sm text-espressoSoft mt-1">{s.description}</p>}
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-2xl text-coral">AED {s.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="border-t border-gold/25 py-16 grid md:grid-cols-2 gap-6 items-center">
        <p className="font-serif text-3xl text-espresso">Ready to reserve your slot?</p>
        <div className="md:text-right">
          <Link to="/booking" className="btn-primary" data-testid="services-book-btn">Book Appointment <ArrowUpRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
