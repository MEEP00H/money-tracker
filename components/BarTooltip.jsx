import { P } from "../constants";
import { fmtShort } from "../utils";

export default function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const inc = payload.find(p=>p.dataKey==="รายรับ")?.value  || 0;
  const exp = payload.find(p=>p.dataKey==="รายจ่าย")?.value || 0;
  const net = inc - exp;
  return (
    <div style={{background:P.surf,border:`2px solid ${P.accent}`,boxShadow:"4px 4px 0 #000",padding:"10px 14px",minWidth:148,pointerEvents:"none",fontFamily:"'Courier New',monospace"}}>
      <div style={{fontSize:11,color:P.accent,marginBottom:8}}>[{label}]</div>
      {[["INC",inc,P.green,"▲"],["EXP",exp,P.red,"▼"]].map(([l,v,c,i])=>(
        <div key={l} style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:4}}>
          <span style={{fontSize:11,color:c}}>{i} {l}</span>
          <span style={{fontSize:14,color:c,fontFamily:"'VT323',monospace"}}>฿{fmtShort(v)}</span>
        </div>
      ))}
      <div style={{borderTop:`1px solid ${P.border}`,marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:10,color:P.muted}}>NET</span>
        <span style={{fontSize:16,color:net>=0?P.accent:P.red,fontFamily:"'VT323',monospace"}}>{net>=0?"+":"-"}฿{fmtShort(Math.abs(net))}</span>
      </div>
    </div>
  );
}
