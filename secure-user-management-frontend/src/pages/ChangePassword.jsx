import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/profile.css";

const Icon = ({ name }) => {
  const paths = {
    shield: <><path d="M12 3 19 6v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
  };
  return <svg className="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

export default function ChangePassword() {
  const nav = useNavigate(); const [a,b]=useState(""); const [c,d]=useState(""); const [e,f]=useState(""); const [m,n]=useState(""); const [saving,setSaving]=useState(false);
  const submit = async (x) => { x.preventDefault(); n(""); if(c.length<6){n("New password must be at least 6 characters");return} if(c!==e){n("New passwords do not match");return} setSaving(true); try { const r=await API.post("/change-password",{current_password:a,new_password:c}); n(r.data.message); b("");d("");f(""); } catch(x){n(x.response?.data?.error||"Password change failed")} finally{setSaving(false)} };
  return <div className="profile-page"><div className="profile-container">
    <header className="profile-topbar"><button className="profile-brand" onClick={() => nav("/dashboard")}><span className="profile-brand-mark"><Icon name="shield" /></span><span><b>Secure User</b><small>Management System</small></span></button><button className="profile-back" onClick={() => nav("/profile")}><Icon name="back" /> My Profile</button></header>
    <main><section className="profile-heading"><div><p className="profile-eyebrow">ACCOUNT SECURITY</p><h1>Change Password</h1><p>Update your password regularly to keep your account protected.</p></div><div className="profile-secure"><span className="profile-dot" /> Secure Connection</div></section>
      <section className="profile-form-layout"><div className="profile-card form-card"><div className="profile-card-title"><div><span className="profile-mini-icon purple"><Icon name="lock" /></span><div><h2>Change Password</h2><p>Create a strong password for your account</p></div></div></div>
        <form onSubmit={submit}><label>CURRENT PASSWORD<div className="profile-input"><Icon name="lock" /><input type="password" value={a} onChange={x=>b(x.target.value)} placeholder="Enter current password" required /></div></label><label>NEW PASSWORD<div className="profile-input"><Icon name="lock" /><input type="password" value={c} onChange={x=>d(x.target.value)} placeholder="Minimum 6 characters" required /></div></label><label>CONFIRM NEW PASSWORD<div className="profile-input"><Icon name="lock" /><input type="password" value={e} onChange={x=>f(x.target.value)} placeholder="Re-enter new password" required /></div></label><div className="password-tip"><span>✓</span><div><b>Password security</b><small>Use at least 6 characters and avoid easily guessed passwords.</small></div></div><div className="form-actions"><button type="button" className="secondary-btn" onClick={()=>nav("/profile")}>Cancel</button><button className="profile-primary-btn" disabled={saving}>{saving?"Updating...":"Change Password"} {!saving&&<Icon name="arrow"/>}</button></div>{m&&<div className={`form-message ${m.toLowerCase().includes("success")||m.toLowerCase().includes("changed")?"success":"error"}`}>{m}</div>}</form>
      </div><div className="profile-card settings-note"><span className="security-large"><Icon name="shield" /></span><h3>Protected Password</h3><p>Your password is securely hashed before it is stored. Only you can use the current password to authorize a change.</p><div className="setting-line"><span>Authentication</span><b>JWT Protected</b></div><div className="setting-line"><span>Password Storage</span><b className="green-text">Hashed</b></div></div></section>
    </main><footer className="profile-footer">Secure User Management System <span>•</span> Protected Account <span>•</span> Password Security</footer>
  </div></div>;
}
