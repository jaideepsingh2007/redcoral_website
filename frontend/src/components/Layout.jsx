import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, MapPin, Instagram, Mail } from "lucide-react";
import logoImg from "../../assets/logo.jpg";

const NAV_ITEMS = [
  { to: "/", label: "Home", testid: "nav-home" },
  { to: "/services", label: "Menu", testid: "nav-services" },
  { to: "/booking", label: "Booking", testid: "nav-booking" },
  { to: "/reviews", label: "Reviews", testid: "nav-reviews" },
  { to: "/about", label: "About", testid: "nav-about" },
  { to: "/contact", label: "Contact", testid: "nav-contact" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
  <img 
  src={logoImg}
  alt="Red Coral Beauty Center" 
  className="h-10 w-auto object-contain rounded" 
/>
  <span className="hidden md:flex flex-col text-[10px] uppercase tracking-[0.28em] text-espressoSoft border-l border-espressoSoft/30 pl-3">
    <span>Ladies</span>
    <span>Beauty Center</span>
  </span>
</Link>

  );
}

export default function Layout({ children }) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="grain min-h-screen flex flex-col bg-cream text-espresso">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Logo />
          <nav className="hidden lg:flex items-center gap-10">
            {NAV_ITEMS.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                data-testid={n.testid}
                className={({ isActive }) =>
                  `link-underline text-[13px] tracking-[0.22em] uppercase font-medium ${
                    isActive ? "text-coral" : "text-espresso hover:text-coral"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:block">
            <Link to="/booking" className="btn-primary" data-testid="header-book-btn">
              Book Appointment
            </Link>
          </div>
          <button
            className="lg:hidden text-espresso p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            data-testid="mobile-menu-toggle"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-gold/20 bg-cream/95 backdrop-blur-xl">
            <nav className="flex flex-col p-6 gap-4">
              {NAV_ITEMS.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  data-testid={`m-${n.testid}`}
                  className={({ isActive }) =>
                    `text-sm tracking-[0.22em] uppercase font-medium py-2 ${
                      isActive ? "text-coral" : "text-espresso"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Link to="/booking" className="btn-primary mt-4 justify-center" data-testid="m-header-book-btn">
                Book Appointment
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="bg-espresso text-cream mt-24 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-20 pb-8">
          <div className="grid md:grid-cols-12 gap-10 md:gap-6">
            <div className="md:col-span-5">
              <p className="eyebrow text-gold">Red Coral · Since 2018</p>
              <h3 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
                A sanctuary of elegance in the heart of Muwaileh.
              </h3>
              <div className="flex gap-4 mt-8">
                <a href="tel:+971502335799" className="text-cream/70 hover:text-gold" aria-label="Call" data-testid="footer-call"><Phone size={18} /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-cream/70 hover:text-gold" aria-label="Instagram" data-testid="footer-instagram"><Instagram size={18} /></a>
                <a href="mailto:redcoralbeauty@gmail.com" className="text-cream/70 hover:text-gold" aria-label="Email" data-testid="footer-email"><Mail size={18} /></a>
              </div>
            </div>
            <div className="md:col-span-3">
              <p className="eyebrow text-gold">Visit</p>
              <p className="mt-4 text-cream/80 leading-relaxed flex items-start gap-2">
                <MapPin size={16} className="mt-1 text-gold flex-shrink-0" />
                <span>Old Muwaileh Commercial<br />Sharjah, United Arab Emirates</span>
              </p>
              <p className="mt-4 text-cream/80 text-sm">Sat – Thu · 10 AM – 10 PM<br />Friday · 2 PM – 10 PM</p>
            </div>
            <div className="md:col-span-2">
              <p className="eyebrow text-gold">Explore</p>
              <ul className="mt-4 space-y-2 text-sm text-cream/80">
                {NAV_ITEMS.map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} className="hover:text-gold" data-testid={`footer-${n.testid}`}>{n.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="eyebrow text-gold">Reach</p>
              <p className="mt-4 text-cream/80 text-sm">+971 50 233 5799</p>
              <p className="mt-2 text-cream/80 text-sm">redcoralbeauty@gmail.com</p>
            </div>
          </div>

          <div className="mt-20 border-t border-gold/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs tracking-[0.2em] uppercase text-cream/50">© {new Date().getFullYear()} Red Coral Ladies Beauty Center</p>
            <Link to="/admin/login" className="text-xs tracking-[0.2em] uppercase text-cream/40 hover:text-gold" data-testid="footer-admin-link">Admin</Link>
          </div>

          <div aria-hidden className="mt-12 select-none">
            <p className="font-serif italic text-[18vw] md:text-[13vw] leading-none text-cream/[0.06] tracking-tight text-center">
              Red&nbsp;Coral
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
