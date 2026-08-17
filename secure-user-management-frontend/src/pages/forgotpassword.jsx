import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/forgotpassword.css";

export default function ForgotPassword(){
 const [email,setEmail]=useState("");const [message,setMessage]=useState("");const [token,setToken]=useState("");const nav=useNavigate();
 const submit=async e=>{e.preventDefault();setMessage("");try{const r=await API.post("/forgot-password",{email});setToken(r.data.token);setMessage(r.data.message)}catch(err){setMessage(err.response?.data?.error||"Unable to generate reset token")}};
 return <div className="forgot-container"><div className="forgot-box"><div className="auth-brand"><div className="auth-logo">🔐</div><div><b>Secure User</b><small>Password Recovery</small></div></div><h2>Forgot password?</h2><p>Enter your registered email to generate a secure reset token.</p><form onSubmit={submit}><label className="auth-label">EMAIL ADDRESS<input type="email" placeholder="Enter your registered email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><button>Generate Reset Token</button></form>{message&&<div className={token?"demo-card":"auth-message"}>{message}{token&&<><br/><b>Reset token:</b><br/><span style={{wordBreak:"break-all"}}>{token}</span><br/><button type="button" onClick={()=>nav("/reset-password")} style={{marginTop:10,padding:"8px 10px",width:"auto",boxShadow:"none",fontSize:10}}>Open Reset Password</button></>}</div>}<div className="auth-links"><Link to="/login">Back to login</Link></div></div></div>;
}
