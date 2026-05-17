import { P } from "../constants";
import { fmtDate } from "../utils";

export default function TxnRow({ t, wallets, onDelete }) {
  const isIncome = t.type === "income";
  const isTf     = t.type === "transfer";
  const fromW    = wallets.find(w=>w.id===t.fromWalletId);
  const toW      = wallets.find(w=>w.id===t.toWalletId);
  const wallet   = wallets.find(w=>w.id===t.walletId);
  const ac = isTf ? P.cyan : isIncome ? P.green : P.red;
  const px = isTf ? "" : isIncome ? "+" : "-";
  return (
    <div className="txn-row">
      <div style={{width:28,height:28,border:`2px solid ${ac}44`,background:`${ac}09`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,color:ac}}>
        {isTf?"↔":isIncome?"▲":"▼"}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,color:"#9898B8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"'Courier New',monospace"}}>
          {t.note||(isTf?"TRANSFER":t.category)}
        </div>
        <div style={{fontSize:10,color:"#2A2A44",marginTop:2,display:"flex",gap:4,alignItems:"center",fontFamily:"'Courier New',monospace"}}>
          {isTf?(<>
            <span style={{color:`${fromW?.color||"#555"}99`}}>{fromW?.icon} {fromW?.name}</span>
            <span>→</span>
            <span style={{color:`${toW?.color||"#555"}99`}}>{toW?.icon} {toW?.name}</span>
            <span style={{color:"#1A1A2E"}}>·</span><span>{fmtDate(t.date)}</span>
          </>):(<>
            {wallet&&<span style={{color:`${wallet.color}99`}}>{wallet.icon}</span>}
            <span>{t.category}</span><span style={{color:"#1A1A2E"}}>·</span><span>{fmtDate(t.date)}</span>
          </>)}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0,marginRight:2}}>
        <div style={{fontFamily:"'VT323',monospace",fontSize:18,color:ac,lineHeight:1}}>
          {px}฿{new Intl.NumberFormat("th-TH").format(t.amount)}
        </div>
      </div>
      <button className="del-btn" onClick={onDelete}>✕</button>
    </div>
  );
}
