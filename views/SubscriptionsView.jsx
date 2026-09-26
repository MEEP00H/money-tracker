import { useState } from "react";
import { P, MONTHS } from "../constants";
import { fmtShort, perMonth, daysUntil, dueLabel } from "../utils";
import { PxCard } from "../components/ui";

const CYCLE_LABEL = { weekly:"ทุกสัปดาห์", monthly:"ทุกเดือน", yearly:"ทุกปี" };

export default function SubscriptionsView({ subs, wallets, catColors, openSubModal, shortSubIds }) {
  const [filter, setFilter] = useState("all");

  const active   = subs.filter(s=>s.active);
  const monthly  = active.reduce((t,s)=>t+perMonth(s),0);
  const counts   = subs.reduce((a,s)=>{a[s.cycle]=(a[s.cycle]||0)+1;return a;},{});
  const visible  = subs
    .filter(s=>filter==="all"||s.cycle===filter)
    .sort((a,b)=>(b.active-a.active)||a.nextDate.localeCompare(b.nextDate));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,3vw,12px)",color:P.accent,marginBottom:6,lineHeight:1.8}}>SUBSCRIPTIONS</div>
        <div style={{fontSize:10,color:P.muted,letterSpacing:"0.06em"}}>ตัดเงินอัตโนมัติเมื่อถึงวันตัดรอบ</div>
      </div>

      {/* Totals */}
      <div className="fade-up" style={{background:P.surf,border:`2px solid ${P.accent}`,boxShadow:`4px 4px 0 ${P.accent}44`,padding:16,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.15em",marginBottom:4}}>PER MONTH</div>
          <div style={{fontFamily:"'VT323',monospace",fontSize:"clamp(36px,9vw,46px)",color:P.accent,lineHeight:1}}>฿{fmtShort(monthly)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.15em",marginBottom:4}}>PER YEAR</div>
          <div style={{fontFamily:"'VT323',monospace",fontSize:22,color:P.text,lineHeight:1}}>฿{fmtShort(monthly*12)}</div>
          <div style={{fontSize:9,color:P.muted,marginTop:4}}>{active.length} ACTIVE</div>
        </div>
      </div>

      {/* Cycle filter */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[["all","ALL",subs.length],["monthly","MONTHLY",counts.monthly||0],["yearly","YEARLY",counts.yearly||0],["weekly","WEEKLY",counts.weekly||0]].map(([v,l,n])=>(
          <button key={v} className={`pill-btn ${filter===v?"act":""}`} onClick={()=>setFilter(v)}>{l} {n}</button>
        ))}
      </div>

      {/* List */}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {visible.length===0&&(
          <PxCard style={{textAlign:"center",color:P.border,fontSize:11,padding:"24px 14px"}}>// ยังไม่มี subscription</PxCard>
        )}
        {visible.map(s=>{
          const w     = wallets.find(x=>x.id===s.walletId);
          const [,m,d]= s.nextDate.split("-").map(Number);
          const days  = daysUntil(s.nextDate);
          const soon  = s.active && days<=3;
          const short = shortSubIds?.has(s.id);
          const color = catColors[s.category] || P.muted;
          return (
            <div key={s.id} className="txn-row" onClick={()=>openSubModal(s)}
              style={{cursor:"pointer",opacity:s.active?1:0.45,borderColor:short?P.red:undefined}}>
              <div style={{width:42,flexShrink:0,textAlign:"center",border:`2px solid ${short?P.red:soon?P.accent:P.brite}`,background:P.bg,padding:"3px 0"}}>
                <div style={{fontFamily:"'VT323',monospace",fontSize:20,lineHeight:1,color:short?P.red:soon?P.accent:P.text}}>{d}</div>
                <div style={{fontSize:9,color:P.muted}}>{MONTHS[m-1]}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:"#9898B8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                <div style={{fontSize:10,color:P.muted,marginTop:2,display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                  {w&&<span style={{color:`${w.color}99`}}>{w.icon}</span>}
                  <span style={{color}}>{s.category||"—"}</span>
                  <span>·</span>
                  <span>{CYCLE_LABEL[s.cycle]}</span>
                  <span>·</span>
                  <span style={{color:soon?P.accent:P.muted}}>
                    {!s.active?"PAUSED":dueLabel(days)}
                  </span>
                  {short&&<span style={{color:P.red}}>· ⚠ เงินไม่พอ</span>}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'VT323',monospace",fontSize:18,color:P.red,lineHeight:1}}>฿{fmtShort(s.amount)}</div>
                {s.cycle!=="monthly"&&<div style={{fontSize:9,color:P.muted,marginTop:2}}>~฿{fmtShort(perMonth(s))}/ด.</div>}
              </div>
            </div>
          );
        })}

        <div className="wallet-card" onClick={()=>openSubModal("new")}
          style={{background:P.surf,borderColor:P.border,borderStyle:"dashed",boxShadow:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:56}}>
          <span style={{fontSize:20,color:P.border}}>+</span>
          <span style={{fontSize:9,color:P.border,letterSpacing:"0.08em"}}>NEW SUBSCRIPTION</span>
        </div>
      </div>
    </div>
  );
}
