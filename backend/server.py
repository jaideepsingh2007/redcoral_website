from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ADMIN_USERNAME = os.environ['ADMIN_USERNAME']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
OWNER_EMAIL = os.environ.get('OWNER_EMAIL', 'redcoralbeauty@gmail.com')

resend.api_key = RESEND_API_KEY

app = FastAPI(title="Red Coral Ladies Beauty Center API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Utility helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def send_email_async(subject: str, html: str, to_email: Optional[str] = None) -> Optional[str]:
    """Send email via Resend. Returns email ID or None if not configured/failed."""
    if not RESEND_API_KEY:
        logger.info(f"[EMAIL SKIPPED - no RESEND_API_KEY] to={to_email or OWNER_EMAIL} subject={subject}")
        return None
    recipient = to_email or OWNER_EMAIL
    params = {
        "from": SENDER_EMAIL,
        "to": [recipient],
        "subject": subject,
        "html": html,
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return result.get("id")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return None


def create_token(subject: str) -> str:
    payload = {
        "sub": subject,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def require_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        subject = payload.get("sub")
        if subject != ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid subject")
        return subject
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ---------- Models ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str


class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    price: float
    duration_min: Optional[int] = None
    description: Optional[str] = ""
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class ServiceCreate(BaseModel):
    name: str
    category: str
    price: float
    duration_min: Optional[int] = None
    description: Optional[str] = ""
    active: bool = True


class ComboOffer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    original_price: Optional[float] = None
    valid_until: Optional[str] = None
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class ComboOfferCreate(BaseModel):
    title: str
    description: str
    price: float
    original_price: Optional[float] = None
    valid_until: Optional[str] = None
    active: bool = True


class BookingCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    service: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = ""


class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    service: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = ""
    status: str = "pending"  # pending | confirmed | cancelled
    created_at: str = Field(default_factory=now_iso)


class ReviewCreate(BaseModel):
    name: str
    rating: int = Field(ge=1, le=5)
    comment: str
    service: Optional[str] = None


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    rating: int
    comment: str
    service: Optional[str] = None
    approved: bool = True  # auto-approved; admin can hide
    created_at: str = Field(default_factory=now_iso)


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    created_at: str = Field(default_factory=now_iso)


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Red Coral Ladies Beauty Center API"}


# ---- Auth ----
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return LoginResponse(token=create_token(payload.username), username=payload.username)


@api_router.get("/auth/me")
async def me(user: str = Depends(require_admin)):
    return {"username": user}


# ---- Services ----
@api_router.get("/services", response_model=List[Service])
async def list_services():
    docs = await db.services.find({"active": True}, {"_id": 0}).sort("category", 1).to_list(500)
    return [Service(**d) for d in docs]


@api_router.get("/admin/services", response_model=List[Service])
async def admin_list_services(_: str = Depends(require_admin)):
    docs = await db.services.find({}, {"_id": 0}).sort("category", 1).to_list(500)
    return [Service(**d) for d in docs]


@api_router.post("/admin/services", response_model=Service)
async def admin_create_service(payload: ServiceCreate, _: str = Depends(require_admin)):
    svc = Service(**payload.model_dump())
    await db.services.insert_one(svc.model_dump())
    return svc


@api_router.put("/admin/services/{service_id}", response_model=Service)
async def admin_update_service(service_id: str, payload: ServiceCreate, _: str = Depends(require_admin)):
    update = payload.model_dump()
    result = await db.services.find_one_and_update(
        {"id": service_id},
        {"$set": update},
        return_document=True,
        projection={"_id": 0},
    )
    if not result:
        raise HTTPException(status_code=404, detail="Service not found")
    return Service(**result)


@api_router.delete("/admin/services/{service_id}")
async def admin_delete_service(service_id: str, _: str = Depends(require_admin)):
    res = await db.services.delete_one({"id": service_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"ok": True}


# ---- Combo Offers ----
@api_router.get("/combos", response_model=List[ComboOffer])
async def list_combos():
    docs = await db.combos.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [ComboOffer(**d) for d in docs]


@api_router.get("/admin/combos", response_model=List[ComboOffer])
async def admin_list_combos(_: str = Depends(require_admin)):
    docs = await db.combos.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [ComboOffer(**d) for d in docs]


@api_router.post("/admin/combos", response_model=ComboOffer)
async def admin_create_combo(payload: ComboOfferCreate, _: str = Depends(require_admin)):
    combo = ComboOffer(**payload.model_dump())
    await db.combos.insert_one(combo.model_dump())
    return combo


@api_router.put("/admin/combos/{combo_id}", response_model=ComboOffer)
async def admin_update_combo(combo_id: str, payload: ComboOfferCreate, _: str = Depends(require_admin)):
    result = await db.combos.find_one_and_update(
        {"id": combo_id},
        {"$set": payload.model_dump()},
        return_document=True,
        projection={"_id": 0},
    )
    if not result:
        raise HTTPException(status_code=404, detail="Combo not found")
    return ComboOffer(**result)


@api_router.delete("/admin/combos/{combo_id}")
async def admin_delete_combo(combo_id: str, _: str = Depends(require_admin)):
    res = await db.combos.delete_one({"id": combo_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Combo not found")
    return {"ok": True}


# ---- Bookings ----
@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())

    # Send email to owner
    html = f"""
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#faf9f6;color:#2c1e16;'>
      <h2 style='color:#b53a26;margin-bottom:8px;'>New Booking Request</h2>
      <p style='color:#5c4a3d;'>You have received a new booking request at Red Coral Ladies Beauty Center.</p>
      <table style='width:100%;border-collapse:collapse;margin-top:16px;'>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Name</b></td><td>{booking.name}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Phone</b></td><td>{booking.phone}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Email</b></td><td>{booking.email or '-'}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Service</b></td><td>{booking.service}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Date</b></td><td>{booking.preferred_date}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Time</b></td><td>{booking.preferred_time}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Notes</b></td><td>{booking.notes or '-'}</td></tr>
      </table>
    </div>
    """
    await send_email_async(f"New Booking Request - {booking.name}", html)
    return booking


@api_router.get("/admin/bookings", response_model=List[Booking])
async def admin_list_bookings(_: str = Depends(require_admin)):
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Booking(**d) for d in docs]


@api_router.put("/admin/bookings/{booking_id}/status")
async def admin_update_booking_status(booking_id: str, new_status: str, _: str = Depends(require_admin)):
    if new_status not in ("pending", "confirmed", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": new_status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"ok": True}


# ---- Reviews ----
@api_router.get("/reviews", response_model=List[Review])
async def list_reviews():
    docs = await db.reviews.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Review(**d) for d in docs]


@api_router.post("/reviews", response_model=Review)
async def create_review(payload: ReviewCreate):
    review = Review(**payload.model_dump())
    await db.reviews.insert_one(review.model_dump())
    return review


@api_router.get("/admin/reviews", response_model=List[Review])
async def admin_list_reviews(_: str = Depends(require_admin)):
    docs = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Review(**d) for d in docs]


@api_router.put("/admin/reviews/{review_id}/toggle")
async def admin_toggle_review(review_id: str, _: str = Depends(require_admin)):
    doc = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Review not found")
    new_val = not doc.get("approved", True)
    await db.reviews.update_one({"id": review_id}, {"$set": {"approved": new_val}})
    return {"approved": new_val}


@api_router.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, _: str = Depends(require_admin)):
    res = await db.reviews.delete_one({"id": review_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"ok": True}


# ---- Contact ----
@api_router.post("/contact", response_model=ContactMessage)
async def submit_contact(payload: ContactCreate):
    msg = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())

    html = f"""
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#faf9f6;color:#2c1e16;'>
      <h2 style='color:#b53a26;'>New Contact Message</h2>
      <table style='width:100%;border-collapse:collapse;margin-top:16px;'>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Name</b></td><td>{msg.name}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Email</b></td><td>{msg.email}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;'><b>Phone</b></td><td>{msg.phone or '-'}</td></tr>
        <tr><td style='padding:8px 0;color:#c5a059;vertical-align:top;'><b>Message</b></td><td>{msg.message}</td></tr>
      </table>
    </div>
    """
    await send_email_async(f"New Contact Message - {msg.name}", html)
    return msg


@api_router.get("/admin/contact", response_model=List[ContactMessage])
async def admin_list_contact(_: str = Depends(require_admin)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ContactMessage(**d) for d in docs]


# ---------- Seed ----------
DEFAULT_SERVICES = [
    {"category": "Hair", "name": "Hair Styling", "price": 80, "duration_min": 45, "description": "Blowout, curls, straightening"},
    {"category": "Hair", "name": "Blow Dry", "price": 50, "duration_min": 30, "description": "Wash & professional blow dry"},
    {"category": "Hair", "name": "Hair Colouring", "price": 250, "duration_min": 120, "description": "Global colour with premium brands"},
    {"category": "Hair", "name": "Hair Treatment", "price": 200, "duration_min": 60, "description": "Keratin / protein / spa treatment"},
    {"category": "Nails", "name": "Acrylic Nails", "price": 150, "duration_min": 90, "description": "Full set acrylic extensions"},
    {"category": "Nails", "name": "Classic Manicure", "price": 45, "duration_min": 30, "description": "Shape, buff & polish"},
    {"category": "Nails", "name": "Gel Pedicure", "price": 80, "duration_min": 45, "description": "Long lasting gel finish"},
    {"category": "Waxing", "name": "Full Body Waxing", "price": 220, "duration_min": 90, "description": "Head to toe smoothness"},
    {"category": "Waxing", "name": "Face Threading", "price": 30, "duration_min": 15, "description": "Precision brow & face shaping"},
    {"category": "Waxing", "name": "Eyebrow Beautification", "price": 25, "duration_min": 15, "description": "Shape, tint & polish"},
    {"category": "Facial", "name": "Signature Coral Facial", "price": 180, "duration_min": 60, "description": "Deep cleanse, exfoliation, mask"},
    {"category": "Facial", "name": "Gold Radiance Facial", "price": 320, "duration_min": 75, "description": "24k gold-infused luxury facial"},
    {"category": "Bridal", "name": "Bridal Makeup", "price": 800, "duration_min": 150, "description": "HD bridal makeup with trial"},
    {"category": "Bridal", "name": "Engagement Makeup", "price": 450, "duration_min": 90, "description": "Elegant engagement look"},
    {"category": "Henna", "name": "Bridal Henna (Full)", "price": 350, "duration_min": 180, "description": "Intricate bridal mehndi both hands & feet"},
    {"category": "Henna", "name": "Simple Henna Design", "price": 60, "duration_min": 30, "description": "Elegant party mehndi"},
]

DEFAULT_COMBOS = [
    {
        "title": "Bridal Glow Package",
        "description": "Bridal Makeup + Bridal Henna + Signature Facial + Hair Styling. Save AED 200.",
        "price": 1300,
        "original_price": 1500,
        "valid_until": None,
        "active": True,
    },
    {
        "title": "Summer Special",
        "description": "Blow Dry + Classic Manicure + Face Threading. Perfect refresh.",
        "price": 100,
        "original_price": 125,
        "valid_until": None,
        "active": True,
    },
    {
        "title": "Weekend Pamper",
        "description": "Gold Radiance Facial + Gel Pedicure — pure indulgence.",
        "price": 370,
        "original_price": 400,
        "valid_until": None,
        "active": True,
    },
]

DEFAULT_REVIEWS = [
    {"name": "Aisha K.", "rating": 5, "comment": "Absolutely loved my bridal look! The team is talented and so warm. Highly recommend.", "service": "Bridal Makeup"},
    {"name": "Fatima R.", "rating": 5, "comment": "The best henna artist in Muwaileh! Design was so intricate and lasted for two weeks.", "service": "Bridal Henna"},
    {"name": "Sara M.", "rating": 5, "comment": "Gold facial left my skin glowing. Peaceful ambiance and skilled beautician.", "service": "Gold Radiance Facial"},
    {"name": "Layla H.", "rating": 5, "comment": "Reasonable prices and premium quality. My go-to salon in Sharjah.", "service": "Hair Colouring"},
]


@app.on_event("startup")
async def seed_defaults():
    if await db.services.count_documents({}) == 0:
        for s in DEFAULT_SERVICES:
            svc = Service(**s)
            await db.services.insert_one(svc.model_dump())
        logger.info(f"Seeded {len(DEFAULT_SERVICES)} default services")

    if await db.combos.count_documents({}) == 0:
        for c in DEFAULT_COMBOS:
            combo = ComboOffer(**c)
            await db.combos.insert_one(combo.model_dump())
        logger.info(f"Seeded {len(DEFAULT_COMBOS)} default combos")

    if await db.reviews.count_documents({}) == 0:
        for r in DEFAULT_REVIEWS:
            rev = Review(**r)
            await db.reviews.insert_one(rev.model_dump())
        logger.info(f"Seeded {len(DEFAULT_REVIEWS)} default reviews")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
