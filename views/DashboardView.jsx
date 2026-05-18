import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { P, MONTHS } from "../constants";
import { fmtShort, currentYM, monthLabel, prevMonth, nextMonth } from "../utils";
import { SLabel, PxCard, PxBtn, PxInput, PixelBar } from "../components/ui";
import BarTooltip from "../components/BarTooltip";
import TxnRow from "../components/TxnRow";

export default function DashboardView({ selectedMonth, setSelMonth, wallets, txns, activeWallet, setActiveWlt, budgets, saveBudget, setView, setDeleteId, showToast, catColors }) {
  const [editingBudget, setEditBudget] = useState(false);
  const [budgetInput,   setBudgetInput] = useState("");

  const activeTxns  = activeWallet==="all"?txns:txns.filter(t=>t.walletId===activeWallet||t.fromWalletId===activeWallet||t.toWalletId===activeWallet);
  const monthTxns   = activeTxns.filter(t=>t.date.startsWith(selectedMonth));
  const monthTotals = monthTxns.reduce((a,t)=>{if(t.type==="income")a.income+=t.amount;if(t.type==="expense")a.expense+=t.amount;return a;},{income:0,expense:0});
  const monthNet    = monthTotals.income-monthTotals.expense;
  const savingRate  = monthTotals.income>0?Math.max(0,Math.round((monthNet/monthTotals.income)*100)):0;

  const cutoff      = `${selectedMonth}-01`;
  const prevTxns    = txns.filter(t=>t.date<cutoff);
  const carryForward = activeWallet==="all"
    ? prevTxns.reduce((b,t)=>{if(t.type==="income")return b+t.amount;if(t.type==="expense")return b-t.amount;return b;},0)
    : prevTxns.reduce((b,t)=>{
        if(t.type==="income"  &&t.walletId===activeWallet)   return b+t.amount;
        if(t.type==="expense" &&t.walletId===activeWallet)   return b-t.amount;
        if(t.type==="transfer"&&t.fromWalletId===activeWallet)return b-t.amount;
        if(t.type==="transfer"&&t.toWalletId===activeWallet)  return b+t.amount;
        return b;
      },0);
  const closingBalance = carryForward+monthNet;

  const activeW    = wallets.find(w=>w.id===activeWallet);
  const activeColor= activeW?.color||P.accent;

  const monthBudget = budgets[selectedMonth]||0;
  const budgetPct   = monthBudget>0?Math.min(100,Math.round((monthTotals.expense/monthBudget)*100)):0;
  const budgetLeft  = monthBudget-monthTotals.expense;

  const handleSaveBudget = ()=>{
    saveBudget(selectedMonth, +budgetInput);
    setEditBudget(false);
  };

  const weeklyData = Array.from({length:5},(_,wi)=>{
    const [y,m]=selectedMonth.split("-").map(Number);
    const s=(wi*7)+1;const e=Math.min((wi+1)*7,new Date(y,m,0).getDate());
    const wt=monthTxns.filter(t=>{const d=new Date(t.date).getDate();return d>=s&&d<=e;});
    if(wt.length===0&&wi>=4)return null;
    return{name:`W${wi+1}`,รายรับ:wt.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),รายจ่าย:wt.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0)};
  }).filter(Boolean);

  const monthlyTrend = Array.from({length:6},(_,i)=>{
    const d=new Date(2026,4-i,1);const m2=d.getMonth();const y2=d.getFullYear();
    const mf=activeTxns.filter(t=>{const td=new Date(t.date);return td.getMonth()===m2&&td.getFullYear()===y2;});
    return{name:MONTHS[m2],รายรับ:mf.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),รายจ่าย:mf.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0)};
  }).reverse();

  const catData = Object.entries(
    monthTxns.filter(t=>t.type==="expense").reduce((a,t)=>{a[t.category]=(a[t.category]||0)+t.amount;return a;},{})
  ).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const maxCat = catData[0]?.value||1;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"var(--gap)"}}>

      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"2px 0"}}>
        <PxBtn onClick={()=>setSelMonth(prevMonth(selectedMonth))} color={P.accent}>◄</PxBtn>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,3.5vw,12px)",color:P.text,lineHeight:1.6}}>{monthLabel(selectedMonth)}</div>
          {selectedMonth===currentYM()&&<div style={{fontSize:9,color:P.accent,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",marginTop:2}}>[ THIS MONTH ]</div>}
        </div>
        <PxBtn onClick={()=>{if(selectedMonth<currentYM())setSelMonth(nextMonth(selectedMonth));}} color={P.accent} disabled={selectedMonth>=currentYM()}>►</PxBtn>
      </div>

      {/* Wallet chips */}
      <div className="chip-scroll">
        {[{id:"all",name:"ALL",icon:"★",color:P.accent},...[...wallets].sort((a,b)=>{const lu={};txns.forEach(t=>{[t.walletId,t.fromWalletId,t.toWalletId].forEach(w=>w&&t.date>(lu[w]||"")&&(lu[w]=t.date));});return(lu[b.id]||"").localeCompare(lu[a.id]||"");})].map(w=>(
          <button key={w.id} className="wchip" onClick={()=>setActiveWlt(w.id)}
            style={{borderColor:activeWallet===w.id?w.color:P.border,color:activeWallet===w.id?w.color:P.muted,boxShadow:activeWallet===w.id?`2px 2px 0 ${w.color}44`:"2px 2px 0 #000"}}>
            {w.icon} {w.name}
          </button>
        ))}
      </div>

      {/* Balance sheet */}
      <div className="fade-up" style={{background:P.surf,border:`2px solid ${activeColor}`,boxShadow:`4px 4px 0 ${activeColor}44`,padding:"16px"}}>
        <div style={{textAlign:"center",marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${P.border}`}}>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.15em",fontFamily:"'Courier New',monospace",marginBottom:5}}>CLOSING BALANCE</div>
          <div style={{fontFamily:"'VT323',monospace",fontSize:"clamp(40px,10vw,54px)",color:closingBalance>=0?activeColor:P.red,lineHeight:1}}>
            {closingBalance<0?"-":""}฿{fmtShort(Math.abs(closingBalance))}
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:5,padding:"2px 8px",border:`1px solid ${monthNet>=0?"rgba(0,255,136,0.25)":"rgba(255,68,102,0.25)"}`}}>
            <span style={{fontSize:12,color:monthNet>=0?P.green:P.red,fontFamily:"'VT323',monospace"}}>
              {monthNet>=0?"▲ +":"▼ -"}฿{fmtShort(Math.abs(monthNet))} MTD
            </span>
          </div>
        </div>
        {[["CARRY FWD",carryForward,P.muted,"↳"],["+ INCOME",monthTotals.income,P.green,"▲"],["- EXPENSE",monthTotals.expense,P.red,"▼"]].map(([lbl,val,color,icon])=>(
          <div key={lbl} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",marginBottom:3,background:P.bg,border:`1px solid ${P.border}`}}>
            <span style={{fontSize:10,color:P.muted,display:"flex",alignItems:"center",gap:6}}><span style={{color,minWidth:12}}>{icon}</span>{lbl}</span>
            <span style={{fontFamily:"'VT323',monospace",fontSize:18,color}}>฿{fmtShort(val)}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",marginTop:4,background:P.surf2,border:`1px solid ${activeColor}44`}}>
          <span style={{fontSize:10,color:P.muted,display:"flex",alignItems:"center",gap:6}}><span style={{color:activeColor}}>＝</span>BALANCE</span>
          <span style={{fontFamily:"'VT323',monospace",fontSize:20,color:closingBalance>=0?activeColor:P.red}}>{closingBalance<0?"-":""}฿{fmtShort(Math.abs(closingBalance))}</span>
        </div>
        {monthTotals.income>0&&(
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:`1px solid ${P.border}`}}>
            <span style={{fontSize:9,color:P.muted,letterSpacing:"0.1em",fontFamily:"'Courier New',monospace"}}>SAVING RATE</span>
            <span style={{fontFamily:"'VT323',monospace",fontSize:18,color:savingRate>=20?P.accent:savingRate>=0?P.muted:P.red}}>{savingRate}%</span>
          </div>
        )}
      </div>

      {/* Budget */}
      <PxCard className="fade-up">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:monthBudget>0||editingBudget?10:0}}>
          <SLabel>BUDGET</SLabel>
          {!editingBudget&&(
            <button onClick={()=>{setEditBudget(true);setBudgetInput(monthBudget?String(monthBudget):"");}}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:P.accent,fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",touchAction:"manipulation"}}>
              {monthBudget?"[แก้ไข]":"[ตั้งงบ+]"}
            </button>
          )}
        </div>
        {editingBudget&&(
          <div style={{display:"flex",gap:7,marginBottom:10}}>
            <PxInput type="number" inputMode="decimal" placeholder="งบรายจ่าย..." value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} autoFocus
              style={{flex:1,color:P.accent,fontFamily:"'VT323',monospace",fontSize:20}}/>
            <PxBtn onClick={handleSaveBudget} color={P.accent} bg={P.surf2} style={{whiteSpace:"nowrap",fontSize:11}}>OK</PxBtn>
            <PxBtn onClick={()=>setEditBudget(false)} color={P.muted} style={{fontSize:11}}>✕</PxBtn>
          </div>
        )}
        {monthBudget>0&&(<>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:10,color:budgetPct>=100?P.red:budgetPct>=80?"#FFB800":P.muted,fontFamily:"'Courier New',monospace"}}>USED {budgetPct}% · ฿{fmtShort(monthTotals.expense)}</span>
            <span style={{fontFamily:"'VT323',monospace",fontSize:16,color:budgetLeft>=0?P.green:P.red}}>{budgetLeft>=0?"LEFT":"OVER"} ฿{fmtShort(Math.abs(budgetLeft))}</span>
          </div>
          <PixelBar pct={budgetPct} color={budgetPct>=100?P.red:budgetPct>=80?"#FFB800":P.green} height={10}/>
        </>)}
        {!monthBudget&&!editingBudget&&<div style={{fontSize:11,color:P.border,marginTop:2}}>// กด [ตั้งงบ+] เพื่อ track รายจ่าย</div>}
      </PxCard>

      {/* Weekly breakdown */}
      <PxCard className="fade-up">
        <SLabel>WEEKLY BREAKDOWN</SLabel>
        {weeklyData.length>0?(
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklyData} barCategoryGap="38%" barGap={3} margin={{top:4,right:4,left:4,bottom:0}}>
              <XAxis dataKey="name" tick={{fill:P.muted,fontSize:10,fontFamily:"'Courier New',monospace"}} axisLine={false} tickLine={false} dy={5}/>
              <YAxis hide/><Tooltip content={<BarTooltip/>} cursor={{fill:"rgba(255,230,0,0.03)"}}/>
              <Bar dataKey="รายรับ" fill={P.green} radius={0} maxBarSize={22} opacity={0.85}/>
              <Bar dataKey="รายจ่าย" fill={P.red} radius={0} maxBarSize={22} opacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        ):<div style={{height:80,display:"flex",alignItems:"center",justifyContent:"center",color:P.border,fontSize:11}}>// NO DATA THIS MONTH</div>}
      </PxCard>

      {/* Category breakdown */}
      {catData.length>0&&(
        <PxCard className="fade-up">
          <SLabel>CATEGORY BREAKDOWN</SLabel>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {catData.map((c,i)=>{
              const color=catColors[c.name]||"#8888AA";const pct=Math.round((c.value/maxCat)*100);
              return(<div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,background:color,flexShrink:0}}/><span style={{fontSize:11,color:P.muted}}>{c.name}</span></div>
                  <span style={{fontFamily:"'VT323',monospace",fontSize:16,color}}>฿{fmtShort(c.value)}</span>
                </div>
                <PixelBar pct={pct} color={color} height={6}/>
              </div>);
            })}
          </div>
        </PxCard>
      )}

      {/* Month transactions */}
      <div className="fade-up">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <SLabel>TRANSACTIONS [{monthTxns.length}]</SLabel>
          {monthTxns.length>5&&(
            <button style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:P.accent,fontFamily:"'Courier New',monospace",touchAction:"manipulation"}}
              onClick={()=>setView("history")}>[ALL →]</button>
          )}
        </div>
        {monthTxns.length===0
          ?<PxCard style={{textAlign:"center",color:P.border,fontSize:11,padding:"28px 14px"}}>// NO TRANSACTIONS<br/><span style={{fontSize:10,marginTop:6,display:"block"}}>press [+] to add entry</span></PxCard>
          :<div style={{display:"flex",flexDirection:"column",gap:5}}>
            {monthTxns.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=><TxnRow key={t.id} t={t} wallets={wallets} onDelete={()=>setDeleteId(t.id)}/>)}
          </div>
        }
      </div>

      {/* 6-month trend */}
      <PxCard className="fade-up">
        <SLabel>6-MONTH TREND</SLabel>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={monthlyTrend} barCategoryGap="40%" barGap={2} margin={{top:4,right:4,left:4,bottom:0}}>
            <XAxis dataKey="name" tick={{fill:P.muted,fontSize:9,fontFamily:"'Courier New',monospace"}} axisLine={false} tickLine={false} dy={5}/>
            <YAxis hide/><Tooltip content={<BarTooltip/>} cursor={{fill:"rgba(255,230,0,0.025)"}}/>
            <Bar dataKey="รายรับ" fill={P.green} radius={0} maxBarSize={18} opacity={0.7}/>
            <Bar dataKey="รายจ่าย" fill={P.red} radius={0} maxBarSize={18} opacity={0.7}/>
          </BarChart>
        </ResponsiveContainer>
      </PxCard>


    </div>
  );
}
