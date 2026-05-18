import { useState } from "react";
import { supabase } from "./supabase";
import { P } from "./constants";

export default function AuthScreen() {
  const [mode,     setMode]     = useState("login");   // "login" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");

  const submit = async e => {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email || !password) return setError("ERR: กรอก email และ password");
    setLoading(true);

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(`ERR: ${err.message}`);
      else setInfo(">> ส่ง email ยืนยันแล้ว — กรุณาตรวจ inbox");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError("ERR: email หรือ password ไม่ถูกต้อง");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%",
    background: P.surf,
    border: `2px solid ${P.border}`,
    color: P.text,
    padding: "10px 12px",
    fontFamily: "'Courier New',monospace",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const btn = {
    width: "100%",
    background: P.accent,
    border: "2px solid #000",
    color: "#000",
    padding: "12px",
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'Press Start 2P',monospace",
    fontSize: 10,
    boxShadow: "4px 4px 0 #000",
    opacity: loading ? 0.6 : 1,
    marginTop: 8,
  };

  return (
    <div style={{
      fontFamily: "'Courier New',monospace",
      background: P.bg,
      minHeight: "100svh",
      color: P.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))`,
      backgroundImage: `linear-gradient(${P.surf}55 1px,transparent 1px),linear-gradient(90deg,${P.surf}55 1px,transparent 1px)`,
      backgroundSize: "20px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .auth-inp:focus{border-color:#FFE600!important;outline:none;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .blink{animation:blink 1s step-start infinite;}
      `}</style>

      <div style={{width:"100%", maxWidth:380, border:`2px solid ${P.accent}`, background:P.surf, padding:28, boxShadow:`6px 6px 0 ${P.accent}44`}}>
        {/* Title */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:14,color:P.accent,letterSpacing:"0.06em",lineHeight:1.6}}>
            LEDGER<span className="blink">_</span>
          </div>
          <div style={{fontSize:10,color:P.muted,marginTop:6,letterSpacing:"0.1em"}}>
            PERSONAL MONEY TRACKER
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[["login","LOGIN"],["signup","SIGN UP"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setError("");setInfo("");}}
              style={{flex:1,padding:"8px",border:`2px solid ${mode===m?P.accent:P.border}`,
                background:"transparent",color:mode===m?P.accent:P.muted,cursor:"pointer",
                fontFamily:"'Courier New',monospace",fontSize:11,
                boxShadow:mode===m?`2px 2px 0 ${P.accent}44`:"2px 2px 0 #000"}}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:5}}>EMAIL</div>
            <input className="auth-inp" type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="user@example.com" autoComplete="email" style={inp}/>
          </div>
          <div>
            <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:5}}>PASSWORD</div>
            <input className="auth-inp" type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••" autoComplete={mode==="signup"?"new-password":"current-password"} style={inp}/>
          </div>

          {error && (
            <div style={{color:P.red,fontSize:11,padding:"8px 10px",background:"rgba(255,68,102,0.06)",border:`2px solid ${P.red}`}}>
              {error}
            </div>
          )}
          {info && (
            <div style={{color:P.green,fontSize:11,padding:"8px 10px",background:"rgba(0,255,136,0.06)",border:`2px solid ${P.green}`}}>
              {info}
            </div>
          )}

          <button type="submit" disabled={loading} style={btn}>
            {loading ? "LOADING..." : mode==="signup" ? "CREATE ACCOUNT" : "ENTER"}
          </button>
        </form>
      </div>
    </div>
  );
}
