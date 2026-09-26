import { useState } from "react";
import { supabase } from "./supabase";
import { P } from "./constants";

export default function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) return setError("ERR: รหัสผ่านอย่างน้อย 6 ตัวอักษร");
    if (password !== confirm) return setError("ERR: รหัสผ่านไม่ตรงกัน");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(`ERR: ${err.message}`);
    setDone(true);
    setTimeout(onDone, 1400);
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
            RESET<span className="blink">_</span>
          </div>
          <div style={{fontSize:10,color:P.muted,marginTop:6,letterSpacing:"0.1em"}}>
            ตั้งรหัสผ่านใหม่
          </div>
        </div>

        {done ? (
          <div style={{color:P.green,fontSize:12,padding:"10px 12px",background:"rgba(0,255,136,0.06)",border:`2px solid ${P.green}`,textAlign:"center"}}>
            &gt;&gt; เปลี่ยนรหัสผ่านสำเร็จ กำลังเข้าสู่ระบบ...
          </div>
        ) : (
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:5}}>รหัสผ่านใหม่</div>
              <input className="auth-inp" type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="new-password" style={inp}/>
            </div>
            <div>
              <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:5}}>ยืนยันรหัสผ่านใหม่</div>
              <input className="auth-inp" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                placeholder="••••••••" autoComplete="new-password" style={inp}/>
            </div>

            {error && (
              <div style={{color:P.red,fontSize:11,padding:"8px 10px",background:"rgba(255,68,102,0.06)",border:`2px solid ${P.red}`}}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={btn}>
              {loading ? "LOADING..." : "บันทึกรหัสผ่านใหม่"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
