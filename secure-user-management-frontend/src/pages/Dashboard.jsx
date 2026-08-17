import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/dashboard.css";

const Icon = ({ name }) => {
  const paths = {
    user: <><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.6-3.4 2.8-5.2 6.5-5.2s5.9 1.8 6.5 5.2"/></>,
    edit: <><path d="M4 20h4l10.2-10.2a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.8 8.2 3 3"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2"/></>,
    logout: <><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="m14 8 4 4-4 4"/><path d="M18 12H9"/></>,
    shield: <><path d="M12 3 19 6v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-3.5 2.4-5.2 5.5-5.2s5 1.7 5.5 5.2"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 14.8c2.2.6 3.5 2.1 4 5.2"/></>,
    activity: <><path d="M3 12h4l2-6 4 12 2-6h6"/></>,
  };
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

export default function Dashboard() {
  const nav = useNavigate();
  const [u, setU] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  useEffect(() => {
    API.get("/profile")
      .then((r) => {
        setU(r.data.user);
        localStorage.setItem("user", JSON.stringify(r.data.user));
        localStorage.setItem("role", r.data.user.role || "user");
      })
      .catch(() => {
        localStorage.clear();
        nav("/login");
      });
  }, [nav]);

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  const firstName = (u.fullname || "User").trim().split(" ")[0];
  const initial = (u.fullname || "U").charAt(0).toUpperCase();
  const isAdmin = u.role === "admin";

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="topbar">
          <div className="brand" onClick={() => nav("/dashboard")} role="button" tabIndex={0}>
            <div className="brand-mark"><Icon name="shield" /></div>
            <div>
              <strong>Secure User</strong>
              <span>Management System</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="security-pill"><span className="status-dot" /> Secure Session</div>
            <button className="logout-top" onClick={logout}><Icon name="logout" /> Logout</button>
          </div>
        </header>

        <main>
          <section className="hero-section">
            <div>
              <p className="eyebrow">ACCOUNT DASHBOARD</p>
              <h1>Welcome back, {firstName}.</h1>
              <p className="hero-subtitle">Manage your profile, credentials and account security from one secure place.</p>
            </div>
            <div className="hero-security">
              <Icon name="shield" />
              <div><strong>Protected Account</strong><span>JWT authentication active</span></div>
            </div>
          </section>

          <section className="profile-banner">
            <div className="profile-main">
              <div className="avatar">{initial}</div>
              <div>
                <div className="profile-name-row">
                  <h2>{u.fullname || "User"}</h2>
                  <span className={`role-badge ${isAdmin ? "admin" : ""}`}>{u.role || "user"}</span>
                </div>
                <p>{u.email || ""}</p>
              </div>
            </div>
            <button className="outline-button" onClick={() => nav("/profile")}><Icon name="user" /> View Profile</button>
          </section>

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon blue"><Icon name="shield" /></div><div><span>Account Status</span><strong>Active</strong><small>Your account is protected</small></div></div>
            <div className="stat-card"><div className="stat-icon green"><Icon name="activity" /></div><div><span>Authentication</span><strong>JWT Secured</strong><small>Protected API session</small></div></div>
            <div className="stat-card"><div className="stat-icon purple"><Icon name="user" /></div><div><span>Access Level</span><strong>{isAdmin ? "Administrator" : "Standard User"}</strong><small>{isAdmin ? "Full management access" : "Personal account access"}</small></div></div>
          </section>

          <section className="section-heading">
            <div><p className="eyebrow">QUICK ACTIONS</p><h3>Account Management</h3></div>
            <span>Choose an action to continue</span>
          </section>

          <section className="action-grid">
            <button className="action-card" onClick={() => nav("/profile")}><div className="action-icon blue"><Icon name="user" /></div><div><span className="action-title">View Profile</span><span className="action-text">Review your account details and information.</span></div><span className="arrow">→</span></button>
            <button className="action-card" onClick={() => nav("/profile/update")}><div className="action-icon orange"><Icon name="edit" /></div><div><span className="action-title">Update Profile</span><span className="action-text">Update your name and registered email.</span></div><span className="arrow">→</span></button>
            <button className="action-card" onClick={() => nav("/change-password")}><div className="action-icon purple"><Icon name="lock" /></div><div><span className="action-title">Change Password</span><span className="action-text">Update your password and improve security.</span></div><span className="arrow">→</span></button>
            <button className="action-card danger-card" onClick={logout}><div className="action-icon red"><Icon name="logout" /></div><div><span className="action-title">Logout</span><span className="action-text">Sign out safely from your current session.</span></div><span className="arrow">→</span></button>
          </section>

          {isAdmin && (
            <>
              <section className="section-heading admin-heading"><div><p className="eyebrow">ADMINISTRATION</p><h3>System Management</h3></div><span>Administrator controls</span></section>
              <section className="action-grid admin-grid">
                <button className="action-card admin-card" onClick={() => nav("/admin")}><div className="action-icon purple"><Icon name="shield" /></div><div><span className="action-title">Admin Panel</span><span className="action-text">Access protected administrator controls.</span></div><span className="arrow">→</span></button>
                <button className="action-card admin-card" onClick={() => nav("/users")}><div className="action-icon blue"><Icon name="users" /></div><div><span className="action-title">Manage Users</span><span className="action-text">View, update and manage registered users.</span></div><span className="arrow">→</span></button>
              </section>
            </>
          )}

          <section className="security-note">
            <div className="security-note-icon"><Icon name="shield" /></div>
            <div><strong>Your account is protected</strong><p>JWT authentication, protected API routes and password hashing help keep your account secure.</p></div>
            <span className="verified">✓ Verified</span>
          </section>
        </main>

        <footer className="dashboard-footer">Secure User Management System <span>•</span> JWT Authentication <span>•</span> Protected Account</footer>
      </div>
    </div>
  );
}
