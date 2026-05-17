import { P } from "../constants";

export function SLabel({ children }) {
  return (
    <div style={{fontSize:10,color:P.muted,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Courier New',monospace",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
      <span style={{color:P.accent}}>▶</span>{children}
    </div>
  );
}

export function PxCard({ children, style={}, className="" }) {
  return (
    <div className={className} style={{background:P.surf,border:`2px solid ${P.border}`,boxShadow:"4px 4px 0 #000",padding:"14px",...style}}>
      {children}
    </div>
  );
}

export function PxBtn({ onClick, children, color=P.accent, bg="transparent", style={}, disabled=false }) {
  const sh = disabled ? "none" : "3px 3px 0 #000";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:bg,border:`2px solid ${disabled?P.border:color}`,color:disabled?P.muted:color,padding:"8px 14px",cursor:disabled?"default":"pointer",fontFamily:"'Courier New',monospace",fontSize:12,boxShadow:sh,transition:"box-shadow 0.08s,transform 0.08s",touchAction:"manipulation",lineHeight:1.2,...style}}
      onMouseDown={e=>{if(!disabled){e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="1px 1px 0 #000";}}}
      onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=sh;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=sh;}}>
      {children}
    </button>
  );
}

// KEY FIX: stable component outside MoneyTracker so React reuses the DOM node
// instead of remounting it → keyboard stays open on mobile
export function PxInput({ style={}, className="", ...props }) {
  return (
    <input {...props} className={`px-inp ${className}`}
      style={{background:P.bg,border:`2px solid ${P.brite}`,color:P.text,fontFamily:"'Courier New',monospace",fontSize:"max(16px,1rem)",padding:"11px 13px",width:"100%",outline:"none",boxShadow:"inset 2px 2px 0 #000",WebkitAppearance:"none",appearance:"none",...style}}/>
  );
}

export function PxSelect({ children, style={}, ...props }) {
  return (
    <select {...props}
      style={{background:P.bg,border:`2px solid ${P.brite}`,color:P.text,fontFamily:"'Courier New',monospace",fontSize:"max(16px,1rem)",padding:"11px 13px",width:"100%",outline:"none",boxShadow:"inset 2px 2px 0 #000",WebkitAppearance:"none",appearance:"none",...style}}>
      {children}
    </select>
  );
}

export function PixelBar({ pct, color, height=8 }) {
  const total = 20;
  const filled = Math.round((pct/100)*total);
  return (
    <div style={{display:"flex",gap:2}}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{flex:1,height,background:i<filled?color:P.surf2,border:`1px solid ${P.border}`}}/>
      ))}
    </div>
  );
}
