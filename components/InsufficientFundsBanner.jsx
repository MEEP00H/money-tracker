import { P } from "../constants";
import { fmtShort } from "../utils";

export function insufficientSig(items) {
  return items.map(i=>`${i.wallet.id}:${Math.round(i.balance)}`).sort().join(",");
}

export default function InsufficientFundsBanner({ items, dismissedSig, onDismiss }) {
  if (items.length === 0) return null;
  const sig = insufficientSig(items);
  if (sig === dismissedSig) return null;

  return (
    <div className="fade-up" style={{background:"rgba(255,68,102,0.08)",border:`2px solid ${P.red}`,boxShadow:`3px 3px 0 ${P.red}44`,padding:"10px 12px",marginBottom:"var(--gap)",display:"flex",gap:10,alignItems:"flex-start"}}>
      <div style={{fontSize:16,lineHeight:1,color:P.red,flexShrink:0}}>⚠</div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:6,minWidth:0}}>
        <div style={{fontSize:11,color:P.red,fontFamily:"'Courier New',monospace",letterSpacing:"0.04em"}}>เงินไม่พอสำหรับ subscription</div>
        {items.map(({wallet,balance,subs})=>(
          <div key={wallet.id} style={{fontSize:11,color:P.text,lineHeight:1.5}}>
            {wallet.icon} <b style={{color:wallet.color}}>{wallet.name}</b> ติดลบ{" "}
            <span style={{fontFamily:"'VT323',monospace",fontSize:15,color:P.red}}>-฿{fmtShort(Math.abs(balance))}</span>
            <div style={{fontSize:10,color:P.muted}}>จาก: {subs.map(s=>s.name).join(", ")}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>onDismiss(sig)}
        style={{background:"none",border:"none",cursor:"pointer",color:P.muted,fontSize:16,lineHeight:1,flexShrink:0,touchAction:"manipulation"}}>
        ✕
      </button>
    </div>
  );
}
