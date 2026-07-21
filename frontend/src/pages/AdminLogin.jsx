import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";

export default function AdminLogin() {
  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("rc_admin_token") : null;

  if (token) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("rc_admin_token", res.data.token);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6" data-testid="admin-login-page">
      <Toaster position="top-right" />
      <form onSubmit={submit} className="w-full max-w-md border border-gold/30 bg-cream p-10">
        <p className="eyebrow">Admin</p>
        <h1 className="font-serif text-5xl mt-3 text-espresso">Log in.</h1>
        <p className="text-sm text-espressoSoft mt-3 mb-8">Manage services, offers, bookings and reviews.</p>
        <label className="block mb-4">
          <span className="eyebrow block mb-2">Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="rc-a-input" required data-testid="admin-username" />
        </label>
        <label className="block mb-6">
          <span className="eyebrow block mb-2">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rc-a-input" required data-testid="admin-password" />
        </label>
        <button className="btn-primary w-full justify-center" disabled={loading} data-testid="admin-login-btn">
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <style>{`
          .rc-a-input {
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
          .rc-a-input:focus { border-color: #B53A26; }
        `}</style>
      </form>
    </div>
  );
}
