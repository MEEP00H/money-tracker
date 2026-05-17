import { P } from "../constants";
import { fmtShort, calcBalance } from "../utils";
import { SLabel, PixelBar } from "../components/ui";
import TxnRow from "../components/TxnRow";

export default function WalletsView({ wallets, txns, selectedMonth, totalBalance, setWalletModal, setWalletForm, setDeleteId }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,3vw,12px)",color:P.accent,marginBottom:6,lineHeight:1.8}}>WALLETS</div>
        <div style={{fontFamily:"'VT323',monospace",fontSize:18,color:P.muted}}>TOTAL ฿{fmtShort(totalBalance)}</div>
      </div>

      <div className="wallet-grid">
        {wallets.map(w=>{
          const bal   = calcBalance(w.id,txns);
          const wMT   = txns.filter(t=>t.date.startsWith(selectedMonth));
          const mInc  = wMT.filter(t=>(t.type==="income"&&t.walletId===w.id)||(t.type==="transfer"&&t.toWalletId===w.id)).reduce((s,t)=>s+t.amount,0);
          const mExp  = wMT.filter(t=>(t.type==="expense"&&t.walletId===w.id)||(t.type==="transfer"&&t.fromWalletId===w.id)).reduce((s,t)=>s+t.amount,0);
          const mDelta= mInc-mExp;
          const pct   = totalBalance>0?Math.min(100,Math.round(Math.abs(bal)/Math.abs(totalBalance)*100)):0;
          return(
            <div key={w.id} className="wallet-card" style={{background:P.surf,borderColor:w.color,boxShadow:`4px 4px 0 ${w.color}55`}}
              onClick={()=>{setWalletModal(w);setWalletForm({name:w.name,icon:w.icon,color:w.color});}}>
              <div style={{fontSize:22,marginBottom:5}}>{w.icon}</div>
              <div style={{fontSize:10,color:P.muted,marginBottom:3}}>{w.name}</div>
              <div style={{fontFamily:"'VT323',monospace",fontSize:"clamp(18px,5vw,22px)",color:bal>=0?w.color:P.red,marginBottom:4,lineHeight:1}}>{bal<0?"-":""}฿{fmtShort(bal)}</div>
              {(mInc>0||mExp>0)&&<div style={{fontSize:11,fontFamily:"'VT323',monospace",color:mDelta>=0?`${P.green}88`:`${P.red}88`,marginBottom:5}}>{mDelta>=0?"▲+":"▼-"}฿{fmtShort(Math.abs(mDelta))}</div>}
              <PixelBar pct={pct} color={w.color} height={5}/>
            </div>
          );
        })}
        <div className="wallet-card" style={{background:P.surf,borderColor:P.border,borderStyle:"dashed",boxShadow:"none",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,minHeight:130}}
          onClick={()=>{setWalletModal("new");setWalletForm({name:"",icon:"💳",color:"#FFE600"});}}>
          <div style={{fontSize:26,color:P.border}}>+</div>
          <div style={{fontSize:9,color:P.border,letterSpacing:"0.08em"}}>NEW WALLET</div>
        </div>
      </div>

      {txns.filter(t=>t.type==="transfer").length>0&&(<>
        <SLabel>TRANSFER LOG</SLabel>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {txns.filter(t=>t.type==="transfer").sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5).map(t=>(
            <TxnRow key={t.id} t={t} wallets={wallets} onDelete={()=>setDeleteId(t.id)}/>
          ))}
        </div>
      </>)}
    </div>
  );
}
