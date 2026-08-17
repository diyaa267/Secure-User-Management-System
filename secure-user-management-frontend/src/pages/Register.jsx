import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/register.css";

const Shield = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 19 6v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;

export default function Register() {
  const nav = useNavigate();
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  const submit=async e=>{e.preventDefault();setMessage("");if(password!==confirm){setMessage("Passwords do not match");return}if(password.length<6){setMessage("Password must be at least 6 characters");return}setLoading(true);try{await API.post("/register",{name,email,password});nav("/login");}catch(err){setMessage(err.response?.data?.error||"Registration failed")}finally{setLoading(false)}};
  return <div className="register-container"><div className="register-box">
    <div className="auth-brand"><div className="auth-logo"><Shield/></div><div><b>Secure User</b><small>Management System</small></div></div>
    <h1>Create your account</h1><p className="auth-subtitle">Register a secure user account for the management system.</p>
    <form onSubmit={submit}>
      <label className="auth-label">FULL NAME<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" required/></label>
      <label className="auth-label">EMAIL ADDRESS<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required/></label>
      <label className="auth-label">PASSWORD<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters" required/></label>
      <label className="auth-label">CONFIRM PASSWORD<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password" required/></label>
      <button disabled={loading}>{loading?"Creating account...":"Create Account"}</button>
    </form>
    {message&&<div className="auth-message">{message}</div>}
    <div className="auth-links"><Link to="/login">Already have an account? Sign in</Link></div>
  </div></div>;
}
