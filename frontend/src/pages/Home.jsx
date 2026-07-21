import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Star, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

const HERO_IMG = "https://images.pexels.com/photos/7750104/pexels-photo-7750104.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const BRIDAL_IMG = "https://images.pexels.com/photos/1161282/pexels-photo-1161282.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const HENNA_IMG = "https://images.pexels.com/photos/12872530/pexels-photo-12872530.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const NAILS_IMG = "https://images.pexels.com/photos/6135675/pexels-photo-6135675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const HAIR_IMG = "https://images.pexels.com/photos/14615063/pexels-photo-14615063.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const SERVICE_HIGHLIGHTS = [
  { title: "Bridal & Makeup", img: BRIDAL_IMG, tag: "01" },
  { title: "Bridal Henna", img: HENNA_IMG, tag: "02" },
  { title: "Nails & Hands", img: NAILS_IMG, tag: "03" },
  { title: "Hair & Colour", img: HAIR_IMG, tag: "04" },
];

export default function Home() {
  const [reviews, setReviews] = React.useState([]);
  const [combos, setCombos] = React.useState([]);

  React.useEffect(() => {
    api.get("/reviews").then((r) => setReviews(r.data.slice(0, 3))).catch(() => {});
    api.get("/combos").then((r) => setCombos(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="min-h-[92vh] px-6 md:px-10 pt-12 md:pt-16 pb-24 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
          <div className="md:col-span-7 relative z-10 reveal">
            <p className="eyebrow"><span className="divider mr-3 align-middle" />Sharjah · Est. 2018</p>
            <h1 className="font-serif text-[13vw] leading-[0.92] md:text-[9vw] mt-8 tracking-tight text-espresso">
              A ritual of<br /><em className="text-coral not-italic font-medium" style={{ fontStyle: 'italic' }}>coral</em> beauty.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-espressoSoft max-w-lg leading-relaxed font-light">
              Ladies-only sanctuary in Old Muwaileh. Bridal, henna, hair, nails, facials — crafted with warm hands and quiet luxury.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/booking" className="btn-primary" data-testid="hero-book-btn">
                Book Appointment <ArrowUpRight size={16} />
              </Link>
              <Link to="/services" className="btn-outline" data-testid="hero-menu-btn">
                View Menu
              </Link>
            </div>
            <div className="mt-14 flex items-center gap-6 text-sm text-espressoSoft">
              <div className="flex items-center gap-1 text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
              </div>
              <span className="tracking-wider"><b className="text-espresso">5.0</b> · 144+ Google Reviews</span>
            </div>
          </div>
          <div className="md:col-span-5 relative">
            <div className="editorial-img aspect-[3/4] w-full">
              <img src={HERO_IMG} alt="Red Coral Beauty Center interior" />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-left-14 bg-cream border border-gold/30 py-6 px-8 shadow-[0_20px_50px_rgba(181,58,38,0.08)] hidden md:block">
              <p className="eyebrow">Now open</p>
              <p className="font-serif text-2xl mt-2 text-espresso">Summer Special <em className="text-coral">2026</em></p>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE / SERVICES INTRO */}
      <section className="border-y border-gold/20 py-6 overflow-hidden bg-creamAlt">
        <div className="flex gap-16 whitespace-nowrap animate-[marquee_30s_linear_infinite]" style={{ animation: 'marquee 40s linear infinite' }}>
          {[..."✦ Bridal Makeup ✦ Bridal Henna ✦ Hair Colouring ✦ Acrylic Nails ✦ Gold Facial ✦ Threading ✦ Body Waxing ✦ Blow Dry ✦".split(" ").filter(Boolean)].concat(
            "✦ Bridal Makeup ✦ Bridal Henna ✦ Hair Colouring ✦ Acrylic Nails ✦ Gold Facial ✦ Threading ✦ Body Waxing ✦ Blow Dry ✦".split(" ").filter(Boolean)
          ).map((w, i) => (
            <span key={i} className="font-serif italic text-3xl text-espresso/70">{w}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>

      {/* SERVICE HIGHLIGHTS BENTO */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 mb-16">
          <div className="md:col-span-5">
            <p className="eyebrow">The Menu</p>
            <h2 className="font-serif text-5xl md:text-6xl mt-4 text-espresso">Rituals we love,<br /><em className="text-coral" style={{ fontStyle: 'italic' }}>crafted for you.</em></h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 self-end">
            <p className="text-espressoSoft text-lg leading-relaxed">
              From an unhurried Gold Radiance Facial to intricate bridal henna, every service is designed to make you feel celebrated. Explore our full menu with clear, honest pricing.
            </p>
            <Link to="/services" className="mt-6 inline-flex items-center gap-2 text-coral link-underline text-sm tracking-[0.22em] uppercase" data-testid="home-view-menu">
              Explore Menu <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {SERVICE_HIGHLIGHTS.map((s, idx) => (
            <div key={s.title} className={`${idx === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'} group`}>
              <div className={`editorial-img ${idx === 0 ? 'aspect-[16/13]' : 'aspect-[4/3]'}`}>
                <img src={s.img} alt={s.title} />
              </div>
              <div className="flex items-baseline justify-between mt-4">
                <p className="font-serif text-2xl text-espresso">{s.title}</p>
                <span className="eyebrow">{s.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMBOS */}
      {combos.length > 0 && (
        <section className="bg-creamAlt py-24 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p className="eyebrow"><Sparkles size={12} className="inline mr-1 mb-0.5" /> Limited combos</p>
                <h2 className="font-serif text-5xl md:text-6xl mt-4 text-espresso">This season's <em className="text-coral" style={{ fontStyle: 'italic' }}>offers.</em></h2>
              </div>
              <Link to="/services" className="text-coral link-underline text-sm tracking-[0.22em] uppercase" data-testid="home-view-combos">All Offers →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {combos.map((c) => (
                <div key={c.id} className="bg-cream border border-gold/25 p-8 md:p-10 flex flex-col" data-testid={`home-combo-${c.id}`}>
                  <p className="eyebrow">Package</p>
                  <h3 className="font-serif text-3xl mt-3 text-espresso">{c.title}</h3>
                  <p className="mt-4 text-espressoSoft leading-relaxed text-sm flex-1">{c.description}</p>
                  <div className="mt-8 flex items-baseline gap-3 border-t border-gold/20 pt-6">
                    <span className="font-serif text-4xl text-coral">AED {c.price}</span>
                    {c.original_price && (
                      <span className="text-espressoSoft/60 line-through text-sm">AED {c.original_price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS PREVIEW */}
      {reviews.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <p className="eyebrow">Guests say</p>
              <h2 className="font-serif text-5xl md:text-6xl mt-4 text-espresso">Words from our <em className="text-coral" style={{ fontStyle: 'italic' }}>guests.</em></h2>
              <Link to="/reviews" className="mt-8 inline-flex items-center gap-2 text-coral link-underline text-sm tracking-[0.22em] uppercase" data-testid="home-view-reviews">
                Read all reviews <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="md:col-span-8 grid md:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="border border-gold/25 p-8 bg-cream" data-testid={`home-review-${r.id}`}>
                  <div className="flex items-center gap-1 text-gold mb-4">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                  </div>
                  <p className="font-serif italic text-xl text-espresso leading-snug">"{r.comment}"</p>
                  <p className="mt-6 text-sm tracking-[0.2em] uppercase text-espressoSoft">— {r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-espresso text-cream py-24 md:py-32 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-8 items-end relative z-10">
          <div className="md:col-span-8">
            <p className="eyebrow text-gold">Ready?</p>
            <h2 className="font-serif text-5xl md:text-7xl mt-4 leading-[0.95]">Reserve your seat at Red&nbsp;Coral.</h2>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link
              to="/booking"
              className="btn-primary"
              style={{ backgroundColor: '#B53A26', borderColor: '#B53A26' }}
              data-testid="home-cta-book"
            >
              Book Now <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
