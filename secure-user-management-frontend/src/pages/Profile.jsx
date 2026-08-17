import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/profile.css";

const Icon = ({ name }) => {
  const paths = {
    shield: <><path d="M12 3 19 6v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    user: <><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.6-3.4 2.8-5.2 6.5-5.2s5.9 1.8 6.5 5.2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2"/></>,
    edit: <><path d="M4 20h4l10.2-10.2a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.8 8.2 3 3"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
  };
  return <svg className="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

export default function Profile() {
  const nav = useNavigate();
  const [u, setU] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/profile")
      .then((r) => {
        setU(r.data.user);
        localStorage.setItem("user", JSON.stringify(r.data.user));
        localStorage.setItem("role", r.data.user.role || "user");
      })
      .catch((e) => setError(e.response?.data?.error || "Unable to load profile"));
  }, []);

  if (!u) return <div className="profile-page"><div className="profile-loading">{error || "Loading profile..."}</div></div>;

  const initial = (u.fullname || "U").trim().charAt(0).toUpperCase();
  const isAdmin = u.role === "admin";

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-topbar">
          <button className="profile-brand" onClick={() => nav("/dashboard")}><span className="profile-brand-mark"><Icon name="shield" /></span><span><b>Secure User</b><small>Management System</small></span></button>
          <button className="profile-back" onClick={() => nav("/dashboard")}><Icon name="back" /> Dashboard</button>
        </header>

        <main>
          <section className="profile-heading">
            <div>
              <p className="profile-eyebrow">ACCOUNT PROFILE</p>
              <h1>My Profile</h1>
              <p>View your personal information and account security details.</p>
            </div>
            <div className="profile-secure"><span className="profile-dot" /> Account Secure</div>
          </section>

          <section className="profile-layout">
            <div className="profile-card profile-main-card">
              <div className="profile-card-title"><div><span className="profile-mini-icon blue"><Icon name="user" /></span><div><h2>Personal Information</h2><p>Your registered account details</p></div></div><span className={`profile-role ${isAdmin ? "admin" : ""}`}>{u.role}</span></div>
              <div className="profile-identity">
                <div className="profile-avatar">{initial}</div>
                <div><h3>{u.fullname}</h3><span>{u.email}</span></div>
              </div>
              <div className="profile-info-list">
                <div className="profile-info-row"><span className="profile-info-icon"><Icon name="user" /></span><div><small>FULL NAME</small><strong>{u.fullname}</strong></div></div>
                <div className="profile-info-row"><span className="profile-info-icon"><Icon name="mail" /></span><div><small>EMAIL ADDRESS</small><strong>{u.email}</strong></div></div>
                <div className="profile-info-row"><span className="profile-info-icon"><Icon name="shield" /></span><div><small>ACCOUNT ROLE</small><strong>{isAdmin ? "Administrator" : "Standard User"}</strong></div></div>
              </div>
              <button className="profile-primary-btn" onClick={() => nav("/profile/update")}><Icon name="edit" /> Edit Profile <Icon name="arrow" /></button>
            </div>

            <aside className="profile-side">
              <div className="profile-card security-card">
                <div className="security-large"><Icon name="shield" /></div>
                <p className="profile-eyebrow">SECURITY STATUS</p>
                <h2>Account Protected</h2>
                <p>Your account is secured using JWT authentication and protected API routes.</p>
                <div className="security-check"><span>✓</span><div><b>JWT Authentication</b><small>Active secure session</small></div></div>
                <div className="security-check"><span>✓</span><div><b>Password Protected</b><small>Hashed credentials</small></div></div>
              </div>
              <div className="profile-card profile-shortcuts">
                <p className="profile-eyebrow">SECURITY ACTIONS</p>
                <button onClick={() => nav("/change-password")}><span className="shortcut-icon purple"><Icon name="lock" /></span><span><b>Change Password</b><small>Keep your account secure</small></span><Icon name="arrow" /></button>
                <button onClick={() => nav("/profile/update")}><span className="shortcut-icon orange"><Icon name="edit" /></span><span><b>Update Profile</b><small>Change name or email</small></span><Icon name="arrow" /></button>
              </div>
            </aside>
          </section>
        </main>
        <footer className="profile-footer">Secure User Management System <span>•</span> JWT Authentication <span>•</span> Protected Account</footer>
      </div>
    </div>
  );
}
