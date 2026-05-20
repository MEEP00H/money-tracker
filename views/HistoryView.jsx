import { useState } from "react";
import { P } from "../constants";
import { currentYM, prevMonth, nextMonth, monthLabel } from "../utils";
import { PxCard, PxBtn } from "../components/ui";
import TxnRow from "../components/TxnRow";

export default function HistoryView({ txns, filterType, setFilterType, wallets, setDeleteId, categories, catColors }) {
  const [filterWallet, setFilterWallet] = useState("all");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterMonth,  setFilterMonth]  = useState(currentYM());

  const handleTypeChange = v => {
    setFilterType(v);
    setFilterCat("all");
  };

  const visibleCats = filterType === "income"
    ? categories.income
    : filterType === "expense"
      ? categories.expense
      : [];

  const showCatFilter = filterType === "income" || filterType === "expense";

  const histFiltered = txns
    .filter(t => {
      if (!t.date.startsWith(filterMonth)) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterWallet !== "all") {
        if (t.type === "transfer") {
          if (t.fromWalletId !== filterWallet && t.toWalletId !== filterWallet) return false;
        } else {
          if (t.walletId !== filterWallet) return false;
        }
      }
      if (filterCat !== "all" && t.category !== filterCat) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const walletLastUsed = {};
  txns.forEach(t => {
    [t.walletId, t.fromWalletId, t.toWalletId].forEach(wid => {
      if (wid && t.date > (walletLastUsed[wid] || "")) walletLastUsed[wid] = t.date;
    });
  });
  const sortedWallets = [...wallets].sort((a, b) =>
    (walletLastUsed[b.id] || "").localeCompare(walletLastUsed[a.id] || "")
  );

  const chipBase = { border: "2px solid", cursor: "pointer", fontFamily: "'Courier New',monospace", fontSize: 11, padding: "5px 11px", whiteSpace: "nowrap", background: P.surf, boxShadow: "2px 2px 0 #000", minHeight: 32, touchAction: "manipulation", transition: "all 0.08s" };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,3vw,12px)",color:P.accent,lineHeight:1.8}}>HISTORY</div>

      {/* Month filter */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"2px 0"}}>
        <PxBtn onClick={()=>setFilterMonth(prevMonth(filterMonth))} color={P.accent}>◄</PxBtn>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,3.5vw,11px)",color:P.text,lineHeight:1.6}}>{monthLabel(filterMonth)}</div>
          {filterMonth===currentYM()&&<div style={{fontSize:9,color:P.accent,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",marginTop:2}}>[ THIS MONTH ]</div>}
        </div>
        <PxBtn onClick={()=>{if(filterMonth<currentYM())setFilterMonth(nextMonth(filterMonth));}} color={P.accent} disabled={filterMonth>=currentYM()}>►</PxBtn>
      </div>

      {/* Type filter */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[["all","ALL"],["income","INC"],["expense","EXP"],["transfer","TFR"]].map(([v,l])=>(
          <button key={v} className={`pill-btn ${filterType===v?"act":""}`} onClick={()=>handleTypeChange(v)}>{l}</button>
        ))}
      </div>

      {/* Wallet filter */}
      <div>
        <div style={{fontSize:9,color:P.muted,letterSpacing:"0.1em",marginBottom:5}}>WALLET</div>
        <div className="chip-scroll">
          {[{id:"all",name:"ALL",icon:"★",color:P.accent},...sortedWallets].map(w=>{
            const active = filterWallet === w.id;
            return (
              <button key={w.id} onClick={()=>setFilterWallet(w.id)}
                style={{...chipBase, borderColor:active?w.color:P.border, color:active?w.color:P.muted, boxShadow:active?`2px 2px 0 ${w.color}44`:"2px 2px 0 #000"}}>
                {w.icon} {w.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter */}
      {showCatFilter && (
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.1em",marginBottom:5}}>CATEGORY</div>
          <div className="chip-scroll">
            <button onClick={()=>setFilterCat("all")}
              style={{...chipBase, borderColor:filterCat==="all"?P.accent:P.border, color:filterCat==="all"?P.accent:P.muted, boxShadow:filterCat==="all"?`2px 2px 0 ${P.accent}44`:"2px 2px 0 #000"}}>
              ALL
            </button>
            {visibleCats.map(c=>{
              const col = catColors[c] || P.muted;
              const active = filterCat === c;
              return (
                <button key={c} onClick={()=>setFilterCat(c)}
                  style={{...chipBase, borderColor:active?col:P.border, color:active?col:P.muted, boxShadow:active?`2px 2px 0 ${col}44`:"2px 2px 0 #000"}}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Result count */}
      <div style={{fontSize:9,color:P.muted,fontFamily:"'Courier New',monospace",letterSpacing:"0.08em"}}>
        {histFiltered.length} รายการ
      </div>

      {/* Transaction list */}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {histFiltered.length === 0
          ? <PxCard style={{textAlign:"center",color:P.border,fontSize:11,padding:"28px"}}>// NO RECORDS</PxCard>
          : histFiltered.map(t=><TxnRow key={t.id} t={t} wallets={wallets} onDelete={()=>setDeleteId(t.id)}/>)
        }
      </div>
    </div>
  );
}
