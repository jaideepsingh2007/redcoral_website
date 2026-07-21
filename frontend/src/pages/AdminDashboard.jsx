import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { LogOut, Plus, Trash2, Edit2, Check, X } from "lucide-react";

const TABS = ["Bookings", "Services", "Combos", "Reviews", "Messages"];

export default function AdminDashboard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("rc_admin_token") : null;
  const [tab, setTab] = React.useState("Bookings");
  const navigate = useNavigate();

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    localStorage.removeItem("rc_admin_token");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-cream text-espresso" data-testid="admin-dashboard">
      <Toaster position="top-right" />
      <header className="border-b border-gold/25 bg-cream/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">Red Coral</p>
            <h1 className="font-serif text-2xl text-espresso">Admin Panel</h1>
          </div>
          <button onClick={logout} className="btn-outline" data-testid="admin-logout">
            <LogOut size={14} /> Logout
          </button>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-3 flex gap-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs tracking-[0.22em] uppercase pb-2 border-b-2 whitespace-nowrap ${
                tab === t ? "text-coral border-coral" : "text-espressoSoft border-transparent hover:text-espresso"
              }`}
              data-testid={`admin-tab-${t.toLowerCase()}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        {tab === "Bookings" && <BookingsTab />}
        {tab === "Services" && <ServicesTab />}
        {tab === "Combos" && <CombosTab />}
        {tab === "Reviews" && <ReviewsTab />}
        {tab === "Messages" && <MessagesTab />}
      </main>
    </div>
  );
}

/* ----- Bookings ----- */
function BookingsTab() {
  const [rows, setRows] = React.useState([]);
  const load = () => api.get("/admin/bookings").then((r) => setRows(r.data));
  React.useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status?new_status=${status}`);
      toast.success("Status updated");
      load();
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div data-testid="admin-bookings-panel">
      <h2 className="font-serif text-3xl mb-6">Bookings ({rows.length})</h2>
      <div className="overflow-x-auto border border-gold/25">
        <table className="w-full text-sm">
          <thead className="bg-creamAlt">
            <tr className="text-left">
              <Th>Date · Time</Th><Th>Name</Th><Th>Phone</Th><Th>Service</Th><Th>Status</Th><Th>Received</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-gold/15" data-testid={`admin-booking-${b.id}`}>
                <Td>{b.preferred_date} · {b.preferred_time}</Td>
                <Td>{b.name}</Td>
                <Td><a href={`tel:${b.phone}`} className="text-coral">{b.phone}</a></Td>
                <Td className="max-w-[220px] truncate">{b.service}</Td>
                <Td><span className={`text-xs uppercase tracking-[0.15em] px-2 py-1 border ${
                  b.status === "confirmed" ? "border-green-600 text-green-700" :
                  b.status === "cancelled" ? "border-red-600 text-red-700" :
                  "border-gold text-goldDark"
                }`}>{b.status}</span></Td>
                <Td className="text-espressoSoft">{new Date(b.created_at).toLocaleDateString()}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(b.id, "confirmed")} className="text-green-700 hover:opacity-70" title="Confirm" data-testid={`confirm-${b.id}`}><Check size={16} /></button>
                    <button onClick={() => updateStatus(b.id, "cancelled")} className="text-red-700 hover:opacity-70" title="Cancel" data-testid={`cancel-${b.id}`}><X size={16} /></button>
                  </div>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-espressoSoft">No bookings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----- Services ----- */
function ServicesTab() {
  const empty = { name: "", category: "Hair", price: 0, duration_min: 30, description: "", active: true };
  const [rows, setRows] = React.useState([]);
  const [editing, setEditing] = React.useState(null); // id or 'new'
  const [form, setForm] = React.useState(empty);

  const load = () => api.get("/admin/services").then((r) => setRows(r.data));
  React.useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const payload = { ...form, price: Number(form.price), duration_min: form.duration_min ? Number(form.duration_min) : null };
      if (editing === "new") await api.post("/admin/services", payload);
      else await api.put(`/admin/services/${editing}`, payload);
      toast.success("Saved");
      setEditing(null); setForm(empty); load();
    } catch { toast.error("Failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    await api.delete(`/admin/services/${id}`); toast.success("Deleted"); load();
  };

  const startEdit = (r) => { setEditing(r.id); setForm(r); };

  return (
    <div data-testid="admin-services-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-3xl">Services ({rows.length})</h2>
        <button className="btn-primary" onClick={() => { setEditing("new"); setForm(empty); }} data-testid="new-service-btn"><Plus size={14} /> New Service</button>
      </div>

      {editing && (
        <div className="border border-gold/30 bg-creamAlt p-6 mb-8 grid md:grid-cols-6 gap-3">
          <Input placeholder="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="svc-name" />
          <Input placeholder="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} testid="svc-cat" />
          <Input placeholder="Price" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="svc-price" />
          <Input placeholder="Duration min" type="number" value={form.duration_min || ""} onChange={(v) => setForm({ ...form, duration_min: v })} testid="svc-dur" />
          <Input placeholder="Description" value={form.description || ""} onChange={(v) => setForm({ ...form, description: v })} testid="svc-desc" className="md:col-span-2" />
          <label className="flex items-center gap-2 text-sm text-espressoSoft">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} data-testid="svc-active" />
            Active
          </label>
          <div className="md:col-span-5 flex gap-3">
            <button onClick={save} className="btn-primary" data-testid="svc-save">Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-gold/25">
        <table className="w-full text-sm">
          <thead className="bg-creamAlt"><tr className="text-left"><Th>Category</Th><Th>Name</Th><Th>Price</Th><Th>Duration</Th><Th>Active</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-gold/15">
                <Td className="text-coral">{s.category}</Td>
                <Td>{s.name}</Td>
                <Td>AED {s.price}</Td>
                <Td>{s.duration_min || "-"} min</Td>
                <Td>{s.active ? "Yes" : "No"}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(s)} className="hover:text-coral"><Edit2 size={14} /></button>
                    <button onClick={() => del(s.id)} className="hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----- Combos ----- */
function CombosTab() {
  const empty = { title: "", description: "", price: 0, original_price: null, valid_until: null, active: true };
  const [rows, setRows] = React.useState([]);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(empty);
  const load = () => api.get("/admin/combos").then((r) => setRows(r.data));
  React.useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const payload = { ...form, price: Number(form.price), original_price: form.original_price ? Number(form.original_price) : null };
      if (editing === "new") await api.post("/admin/combos", payload);
      else await api.put(`/admin/combos/${editing}`, payload);
      toast.success("Saved"); setEditing(null); setForm(empty); load();
    } catch { toast.error("Failed"); }
  };
  const del = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/combos/${id}`); toast.success("Deleted"); load(); };

  return (
    <div data-testid="admin-combos-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-3xl">Combo Offers ({rows.length})</h2>
        <button className="btn-primary" onClick={() => { setEditing("new"); setForm(empty); }} data-testid="new-combo-btn"><Plus size={14} /> New Combo</button>
      </div>

      {editing && (
        <div className="border border-gold/30 bg-creamAlt p-6 mb-8 grid md:grid-cols-4 gap-3">
          <Input placeholder="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} testid="combo-title" className="md:col-span-2" />
          <Input placeholder="Price" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="combo-price" />
          <Input placeholder="Original price (optional)" type="number" value={form.original_price || ""} onChange={(v) => setForm({ ...form, original_price: v })} testid="combo-orig" />
          <Input placeholder="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} testid="combo-desc" className="md:col-span-4" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
          <div className="md:col-span-3 flex gap-3">
            <button onClick={save} className="btn-primary" data-testid="combo-save">Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {rows.map((c) => (
          <div key={c.id} className="border border-gold/25 p-5 bg-cream">
            <div className="flex justify-between items-start">
              <h3 className="font-serif text-xl text-espresso">{c.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(c.id); setForm(c); }} className="hover:text-coral"><Edit2 size={14} /></button>
                <button onClick={() => del(c.id)} className="hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-xs text-espressoSoft mt-2">{c.description}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-2xl text-coral">AED {c.price}</span>
              {c.original_price && <span className="text-xs line-through text-espressoSoft">AED {c.original_price}</span>}
              {!c.active && <span className="ml-auto text-xs text-red-600">Inactive</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----- Reviews ----- */
function ReviewsTab() {
  const [rows, setRows] = React.useState([]);
  const load = () => api.get("/admin/reviews").then((r) => setRows(r.data));
  React.useEffect(() => { load(); }, []);

  const toggle = async (id) => { await api.put(`/admin/reviews/${id}/toggle`); load(); };
  const del = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/reviews/${id}`); load(); };

  return (
    <div data-testid="admin-reviews-panel">
      <h2 className="font-serif text-3xl mb-6">Reviews ({rows.length})</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.id} className="border border-gold/25 p-5 bg-cream">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-espressoSoft">{r.name} · {r.rating}★</p>
                {r.service && <p className="text-xs text-gold">{r.service}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(r.id)} className="text-xs uppercase tracking-[0.15em] text-coral">{r.approved ? "Hide" : "Show"}</button>
                <button onClick={() => del(r.id)} className="hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="mt-2 text-sm italic text-espresso">"{r.comment}"</p>
            {!r.approved && <p className="mt-2 text-xs text-red-600 uppercase tracking-[0.15em]">Hidden</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----- Contact Messages ----- */
function MessagesTab() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => { api.get("/admin/contact").then((r) => setRows(r.data)); }, []);
  return (
    <div data-testid="admin-messages-panel">
      <h2 className="font-serif text-3xl mb-6">Contact Messages ({rows.length})</h2>
      <div className="space-y-3">
        {rows.map((m) => (
          <div key={m.id} className="border border-gold/25 p-5 bg-cream grid md:grid-cols-4 gap-3">
            <div>
              <p className="font-serif text-xl">{m.name}</p>
              <p className="text-xs text-espressoSoft">{new Date(m.created_at).toLocaleString()}</p>
            </div>
            <div className="text-xs">
              <p><a href={`mailto:${m.email}`} className="text-coral">{m.email}</a></p>
              {m.phone && <p>{m.phone}</p>}
            </div>
            <p className="md:col-span-2 text-sm text-espressoSoft">{m.message}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-espressoSoft">No messages yet.</p>}
      </div>
    </div>
  );
}

const Th = ({ children }) => <th className="text-left text-xs uppercase tracking-[0.15em] text-espressoSoft p-3">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`p-3 align-middle ${className}`}>{children}</td>;

function Input({ placeholder, value, onChange, type = "text", testid, className = "" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      className={`w-full bg-cream border border-gold/40 px-3 py-2 text-sm outline-none focus:border-coral ${className}`}
    />
  );
}
