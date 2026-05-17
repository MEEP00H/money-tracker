import { P } from "../constants";
import { PxCard } from "../components/ui";
import TxnRow from "../components/TxnRow";

export default function HistoryView({ txns, filterType, setFilterType, wallets, setDeleteId }) {
  const histFiltered = txns
    .filter(t=>filterType==="all"||(filterType==="transfer"?t.type==="transfer":t.type===filterType))
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,3vw,12px)",color:P.accent,lineHeight:1.8}}>HISTORY</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[["all","ALL"],["income","INC"],["expense","EXP"],["transfer","TFR"]].map(([v,l])=>(
          <button key={v} className={`pill-btn ${filterType===v?"act":""}`} onClick={()=>setFilterType(v)}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {histFiltered.length===0
          ?<PxCard style={{textAlign:"center",color:P.border,fontSize:11,padding:"28px"}}>// NO RECORDS</PxCard>
          :histFiltered.map(t=><TxnRow key={t.id} t={t} wallets={wallets} onDelete={()=>setDeleteId(t.id)}/>)
        }
      </div>
    </div>
  );
}
