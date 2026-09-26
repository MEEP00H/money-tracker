import { P } from "../constants";
import { fmtShort, dueLabel } from "../utils";

export function insufficientSig(items) {
  return items
    .map(i=>`${i.wallet.id}:${Math.round(i.balance)}:${i.upcoming.map(u=>`${u.sub.id}@${u.sub.nextDate}`).join("+")}`)
    .sort().join(",");
}

const WalletMark = ({ wallet }) => wallet.character_url
  ? <img src={wallet.character_url} alt="" style={{width:16,height:16,objectFit:"cover",borderRadius:3,verticalAlign:"-3px"}}/>
  : <span>{wallet.icon}</span>;

const money = v => <span style={{fontFamily:"'VT323',monospace",fontSize:15}}>{v<0?"-":""}฿{fmtShort(Math.abs(v))}</span>;

export default function InsufficientFundsBanner({ items, dismissedSig, onDismiss }) {
  if (items.length === 0) return null;
  const sig = insufficientSig(items);
  if (sig === dismissedSig) return null;

  const anyUpcoming = items.some(i=>i.upcoming.length>0 && i.balance<i.needed);

  return (
    <div className="fade-up" style={{background:"rgba(255,68,102,0.08)",border:`2px solid ${P.red}`,boxShadow:`3px 3px 0 ${P.red}44`,padding:"10px 12px",marginBottom:"var(--gap)",display:"flex",gap:10,alignItems:"flex-start"}}>
      <div style={{fontSize:16,lineHeight:1,color:P.red,flexShrink:0}}>⚠</div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:8,minWidth:0}}>
        <div style={{fontSize:11,color:P.red,letterSpacing:"0.04em"}}>
          {anyUpcoming ? "เงินไม่พอสำหรับ subscription ที่ใกล้ถึงรอบตัด" : "เงินไม่พอสำหรับ subscription"}
        </div>
        {items.map(({wallet,balance,subs,upcoming,needed})=>{
          const shortSoon = upcoming.length>0 && balance<needed;
          return (
            <div key={wallet.id} style={{fontSize:11,color:P.text,lineHeight:1.5}}>
              <div>
                <WalletMark wallet={wallet}/> <b style={{color:wallet.color}}>{wallet.name}</b>{" "}
                {shortSoon
                  ? <span style={{color:P.red}}>ขาดอีก {money(needed-balance)}</span>
                  : <>ติดลบ <span style={{color:P.red}}>{money(balance)}</span></>}
              </div>
              {shortSoon&&<div style={{fontSize:10,color:P.muted}}>มีอยู่ {money(balance)} · ต้องจ่ายภายใน 3 วัน {money(needed)}</div>}
              {shortSoon
                ? upcoming.map(({sub,days})=>(
                    <div key={sub.id} style={{fontSize:10,color:P.muted}}>
                      ↻ {sub.name} ฿{fmtShort(sub.amount)} · <span style={{color:days<=1?P.red:P.accent}}>{dueLabel(days)}</span>
                    </div>
                  ))
                : <div style={{fontSize:10,color:P.muted}}>จาก: {subs.map(s=>s.name).join(", ")}</div>}
            </div>
          );
        })}
      </div>
      <button onClick={()=>onDismiss(sig)}
        style={{background:"none",border:"none",cursor:"pointer",color:P.muted,fontSize:16,lineHeight:1,flexShrink:0,touchAction:"manipulation"}}>
        ✕
      </button>
    </div>
  );
}
