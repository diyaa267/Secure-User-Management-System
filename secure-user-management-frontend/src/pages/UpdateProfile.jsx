import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/profile.css";

const Icon = ({ name }) => {
  const paths = {
    shield: <><path d="M12 3 19 6v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    user: <><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.6-3.4 2.8-5.2 6.5-5.2s5.9 1.8 6.5 5.2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
  };
  return <svg className="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

export default function UpdateProfile() {
  const nav = useNavigate();
  const [n, setN] = useState(""); const [e, setE] = useState(""); const [m, setM] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { API.get("/profile").then(r => { setN(r.data.user.fullname); setE(r.data.user.email); }).catch(() => nav("/login")); }, [nav]);
  const save = async (x) => { x.preventDefault(); setM(""); setSaving(true); try { const r = await API.put("/profile", { fullname: n.trim(), email: e.trim() }); setM(r.data.message); if (r.data.token) localStorage.setItem("token", r.data.token); localStorage.setItem("user", JSON.stringify(r.data.user)); localStorage.setItem("role", r.data.user.role || "user"); setTimeout(() => nav("/profile"), 600); } catch (x) { setM(x.response?.data?.error || "Update failed"); } finally { setSaving(false); } };
  return <div className="profile-page"><div className="profile-container">
    <header className="profile-topbar"><button className="profile-brand" onClick={() => nav("/dashboard")}><span className="profile-brand-mark"><Icon name="shield" /></span><span><b>Secure User</b><small>Management System</small></span></button><button className="profile-back" onClick={() => nav("/profile")}><Icon name="back" /> My Profile</button></header>
    <main><section className="profile-heading"><div><p className="profile-eyebrow">ACCOUNT SETTINGS</p><h1>Update Profile</h1><p>Keep your personal information accurate and up to date.</p></div><div className="profile-secure"><span className="profile-dot" /> Secure Settings</div></section>
      <section className="profile-form-layout"><div className="profile-card form-card"><div className="profile-card-title"><div><span className="profile-mini-icon blue"><Icon name="user" /></span><div><h2>Personal Details</h2><p>Update your name and registered email</p></div></div></div>
        <form onSubmit={save}><label>FULL NAME<div className="profile-input"><Icon name="user" /><input value={n} onChange={x => setN(x.target.value)} placeholder="Enter your full name" required /></div></label><label>EMAIL ADDRESS<div className="profile-input"><Icon name="mail" /><input value={e} onChange={x => setE(x.target.value)} type="email" placeholder="Enter your email address" required /></div></label><div className="form-actions"><button type="button" className="secondary-btn" onClick={() => nav("/profile")}>Cancel</button><button className="profile-primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"} {!saving && <Icon name="arrow" />}</button></div>{m && <div className={`form-message ${m.toLowerCase().includes("success") || m.toLowerCase().includes("updated") ? "success" : "error"}`}>{m}</div>}</form>
      </div><div className="profile-card settings-note"><span className="profile-mini-icon purple"><Icon name="shield" /></span><h3>Secure Profile</h3><p>Your profile changes are sent through the protected API using your active JWT session.</p><div className="setting-line"><span>Authentication</span><b>JWT Secured</b></div><div className="setting-line"><span>Account Status</span><b className="green-text">Active</b></div></div></section>
    </main><footer className="profile-footer">Secure User Management System <span>•</span> Protected Account</footer>
  </div></div>;
}
