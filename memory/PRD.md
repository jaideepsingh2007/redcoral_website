# PRD — Red Coral Ladies Beauty Center Website

## Original Problem Statement
User (owner/operator of **Red Coral Ladies Beauty Center**, Old Muwaileh Commercial, Sharjah, UAE — 5.0★, 144+ Google reviews, +971 50 233 5799) wants a business website based on their Google Maps listing. Multipage: Home, Services/Menu (with prices + rotating combo offers), Booking, Reviews, About, Contact. Contact form must send professional emails to the owner. Reviews page allows live customer submissions. Menu/prices/combos should be editable over time. Design should suit the coral/gold salon logo.

## Architecture
- **Backend**: FastAPI + Motor (async MongoDB). JWT admin auth. Resend for transactional email (falls back to logging if API key absent).
- **Frontend**: React 19 + React Router 7 + Tailwind CSS + shadcn UI components + Cormorant Garamond / Outfit typography.
- **Database**: MongoDB collections — services, combos, bookings, reviews, contact_messages.
- **Design**: Deep coral (#B53A26) + warm gold (#C5A059) + cream (#FAF9F6) + espresso (#2C1E16). Editorial asymmetric bento layouts, grain texture, subtle glass header, marquee band, custom underlined links.

## User Personas
1. **Salon customer** — visits site to browse services & prices, read reviews, book an appointment, contact the salon.
2. **Salon owner (admin)** — logs in to update prices, add/edit/delete combo offers, review and confirm/cancel bookings, moderate reviews, read contact messages.

## Core Requirements (Static)
- Editorial, feminine-luxury aesthetic suited to a bridal/henna/nail/hair beauty parlour
- Ladies-only positioning
- Bilingual-ready copy (currently English)
- Editable menu with categories: Hair, Nails, Waxing, Facial, Bridal, Henna
- Combo offers with strike-through original price
- Booking form with date/time picker → saved + emailed to owner
- Review submissions with 1–5 star ratings, auto-approved but hideable by admin
- Contact form → saved + emailed to owner
- Admin panel behind JWT-protected login
- Mobile responsive throughout

## Implemented (2026-07-21)
- Multipage site: `/`, `/services`, `/booking`, `/reviews`, `/about`, `/contact`, `/admin/login`, `/admin`
- Backend endpoints (public): `/api/services`, `/api/combos`, `/api/reviews` (GET/POST), `/api/bookings` (POST), `/api/contact` (POST)
- Backend endpoints (admin, JWT-protected): full CRUD on services & combos; list + status update for bookings; moderate/delete reviews; list contact messages
- Seed data: 16 services across 6 categories, 3 combo offers, 4 five-star reviews
- Resend email integration (skips gracefully if `RESEND_API_KEY` empty)
- Elegant coral+gold+cream design system with Cormorant Garamond headings
- Data-testid conventions applied to every interactive element
- Admin dashboard with 5 tabs — Bookings, Services, Combos, Reviews, Messages
- Both backend (auth, all CRUD) and frontend (all pages + admin flow) tested — 100% pass

## Backlog / Next
### P1
- Enable real email delivery by adding a Resend API key + verified sender domain
- Add WhatsApp click-to-chat button (floating) for Sharjah customer convenience
- Change default admin password after first login

### P2
- Gallery page with before/after Instagram-style grid
- Multi-language (Arabic) toggle for local audience
- Loyalty/reward program signup form
- Google Reviews auto-import via Places API
- Business SMS confirmations via Twilio when booking status is confirmed
- Image upload in admin for combo offer cards

### P3
- Bookings calendar view with drag-and-drop status updates
- Staff/beautician profiles + assignment on bookings
- Real-time slot availability calendar for bookings

## Credentials
See `/app/memory/test_credentials.md`.
