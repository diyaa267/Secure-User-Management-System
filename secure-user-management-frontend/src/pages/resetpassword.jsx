import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/resetpassword.css";

export default function ResetPassword(){
 const [email,setEmail]=useState("");const [token,setToken]=useState("");const [password,setPassword]=useState("");const [message,setMessage]=useState("");const nav=useNavigate();
 const submit=async e=>{e.preventDefault();setMessage("");try{const r=await API.post("/reset-password",{email,token,new_password:password});setMessage(r.data.message);setTimeout(()=>nav("/login"),800)}catch(err){setMessage(err.response?.data?.error||"Reset failed")}};
 return <div className="reset-container"><div className="reset-box"><div className="auth-brand"><div className="auth-logo">🔑</div><div><b>Secure User</b><small>Password Recovery</small></div></div><h2>Reset password</h2><p>Use the token generated from the Forgot Password page.</p><form onSubmit={submit}><label className="auth-label">EMAIL ADDRESS<input type="email" placeholder="Enter email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label className="auth-label">RESET TOKEN<input placeholder="Paste reset token" value={token} onChange={e=>setToken(e.target.value)} required/></label><label className="auth-label">NEW PASSWORD<input type="password" placeholder="Minimum 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button>Update Password</button></form>{message&&<div className="demo-card">{message}</div>}<div className="auth-links"><Link to="/login">Back to login</Link></div></div></div>;
}
