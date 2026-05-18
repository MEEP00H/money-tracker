import { P } from "../constants";
import { fmtShort } from "../utils";

export default function Header({ view, monthBudget, budgetPct, activeWallet, totalBalance, activeW, activeBalance, onLogout }) {
  return (
    <div style={{
      position:"sticky", top:0, zIndex:40,
      background:P.bg, borderBottom:`2px solid ${P.accent}`,
      // ── safe area: top (notch), left/right (landscape notch) ──
      paddingTop:"var(--safe-t)",
      paddingLeft:"max(var(--px), var(--safe-l))",
      paddingRight:"max(var(--px), var(--safe-r))",
    }}>
      <div style={{maxWidth:520,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:"clamp(46px,10vw,54px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(10px,3.5vw,13px)",color:P.accent,lineHeight:1}}>LEDGER</div>
          <span className="blink" style={{color:P.accent,fontSize:14,lineHeight:1}}>_</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            {view==="dashboard"&&monthBudget>0&&(
              <div style={{fontSize:9,color:budgetPct>=100?P.red:budgetPct>=80?"#FFB800":P.green,fontFamily:"'Courier New',monospace",letterSpacing:"0.06em"}}>
                BUDGET {budgetPct}%
              </div>
            )}
            <div style={{fontFamily:"'VT323',monospace",fontSize:18,color:P.muted,lineHeight:1}}>
              {activeWallet==="all"?`฿${fmtShort(totalBalance)}`:activeW?`${activeW.icon}฿${fmtShort(activeBalance)}`:""}
            </div>
          </div>
          <button onClick={onLogout}
            style={{background:"none",border:`1px solid ${P.muted}`,color:P.muted,cursor:"pointer",
              fontFamily:"'Courier New',monospace",fontSize:9,padding:"3px 6px",letterSpacing:"0.06em",
              flexShrink:0,touchAction:"manipulation"}}>
            OUT
          </button>
        </div>
      </div>
    </div>
  );
}
