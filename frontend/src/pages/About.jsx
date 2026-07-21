import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, Heart, Award } from "lucide-react";

export default function About() {
  return (
    <div data-testid="about-page" className="max-w-[1400px] mx-auto px-6 md:px-10">
      <section className="pt-16 md:pt-24 pb-16 grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <p className="eyebrow">Our story · Muwaileh, Sharjah</p>
          <h1 className="font-serif text-6xl md:text-8xl mt-4 leading-[0.95] text-espresso">A house of<br /><em className="text-coral" style={{ fontStyle: 'italic' }}>quiet luxury.</em></h1>
        </div>
        <div className="md:col-span-4">
          <p className="text-espressoSoft leading-relaxed">Red Coral is a ladies-only beauty destination born from a simple idea — that beauty rituals should feel personal, unhurried, and honest.</p>
        </div>
      </section>

      <section className="grid md:grid-cols-12 gap-12 items-start pb-24">
        <div className="md:col-span-6">
          <div className="editorial-img aspect-[4/5]">
            <img src="https://images.pexels.com/photos/7750104/pexels-photo-7750104.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Interior" />
          </div>
        </div>
        <div className="md:col-span-6 md:pt-12 space-y-6 text-lg text-espressoSoft leading-relaxed">
          <p><em className="text-coral not-italic font-serif text-2xl" style={{ fontStyle: 'italic' }}>Since 2018,</em> we've welcomed guests from across Sharjah, Dubai and Ajman into our warm-lit sanctuary in Old Muwaileh Commercial.</p>
          <p>Every service — from the intricate strokes of bridal henna to the gentle rhythm of a 24k Gold Radiance Facial — is delivered by beauticians we train ourselves. We use professional-grade products, sanitised tools, and a lot of care.</p>
          <p>What our guests love most? The <b className="text-espresso">unhurried pace</b>. Book a slot with us and it's yours — no rushed appointments, no upselling. Just beauty, done beautifully.</p>
        </div>
      </section>

      <section className="border-t border-gold/25 py-20 grid md:grid-cols-3 gap-8">
        <Value icon={<Heart size={22} />} title="Ladies-only" text="A private, comfortable environment reserved for our guests." />
        <Value icon={<Award size={22} />} title="5.0 Rated" text="144+ five-star reviews on Google — and counting." />
        <Value icon={<Sparkles size={22} />} title="Premium Products" text="Only trusted salon brands. Never shortcuts." />
      </section>

      <section className="py-24 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <p className="eyebrow">Visit us</p>
          <h2 className="font-serif text-4xl md:text-5xl mt-3 text-espresso">Old Muwaileh Commercial,<br />Sharjah — UAE.</h2>
          <p className="mt-4 text-espressoSoft">Open Sat–Thu 10 AM–10 PM · Fri 2 PM–10 PM · +971 50 233 5799</p>
        </div>
        <div className="md:col-span-4 md:text-right">
          <Link to="/booking" className="btn-primary" data-testid="about-book-btn">Book Appointment <ArrowUpRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}

function Value({ icon, title, text }) {
  return (
    <div className="flex gap-5">
      <div className="w-11 h-11 border border-coral/40 flex items-center justify-center text-coral flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-serif text-2xl text-espresso">{title}</h4>
        <p className="text-sm text-espressoSoft mt-2 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
