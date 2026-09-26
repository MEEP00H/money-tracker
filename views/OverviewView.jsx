import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { P } from "../constants";
import { fmtShort, currentYM, prevMonth, monthKeysBack, monthlyTotals, calcBalance, perMonth } from "../utils";
import { SLabel, PxCard, PixelBar } from "../components/ui";
import BarTooltip from "../components/BarTooltip";

const RANGES = [["3","3M"],["6","6M"],["12","12M"],["all","ALL"]];
const TOP_CATS = 6;
const OTHER_COLOR = "#8888AA";

const baht = v => `${v<0?"-":""}฿${fmtShort(Math.abs(v))}`;

function rangeKeys(range, txns) {
  if (range !== "all") return monthKeysBack(+range);
  const earliest = txns.reduce((m,t)=>t.type!=="transfer"&&t.date.slice(0,7)<m?t.date.slice(0,7):m, currentYM());
  const keys = [currentYM()];
  while (keys[0] > earliest) keys.unshift(prevMonth(keys[0]));
  return keys;
}

function Tile({ label, value, sub, glyph, glyphColor }) {
  return (
    <PxCard style={{padding:"10px 8px",minWidth:0}}>
      <div style={{fontSize:8,color:P.muted,letterSpacing:"0.06em",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</div>
      <div style={{fontFamily:"'VT323',monospace",fontSize:"clamp(16px,5vw,22px)",color:P.text,lineHeight:1,whiteSpace:"nowrap"}}>
        {glyph&&<span style={{color:glyphColor,fontSize:14,marginRight:3}}>{glyph}</span>}{value}
      </div>
      {sub&&<div style={{fontSize:8,color:P.muted,marginTop:3}}>{sub}</div>}
    </PxCard>
  );
}

function SegmentBar({ segments }) {
  const total = segments.reduce((s,x)=>s+x.value,0);
  if (total <= 0) return null;
  return (
    <div style={{display:"flex",gap:2,height:14,background:P.bg}}>
      {segments.filter(s=>s.value>0).map(s=>(
        <div key={s.label} title={`${s.label}: ${baht(s.value)} (${Math.round(s.value/total*100)}%)`}
          style={{width:`${s.value/total*100}%`,background:s.color,minWidth:2}}/>
      ))}
    </div>
  );
}

function LegendRow({ color, label, value, extra, ink=P.text }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${P.border}`}}>
      <div style={{width:9,height:9,background:color,flexShrink:0}}/>
      <span style={{flex:1,fontSize:11,color:P.muted,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</span>
      {extra&&<span style={{fontSize:9,color:P.muted,whiteSpace:"nowrap"}}>{extra}</span>}
      <span style={{fontFamily:"'VT323',monospace",fontSize:17,color:ink,minWidth:70,textAlign:"right"}}>{value}</span>
    </div>
  );
}

export default function OverviewView({ txns, wallets, subs, catColors }) {
  const [range, setRange] = useState(()=>{ try { return localStorage.getItem("overviewRange") || "6"; } catch { return "6"; } });
  const pickRange = r => { setRange(r); try { localStorage.setItem("overviewRange", r); } catch {} };

  const cur       = currentYM();
  const keys      = rangeKeys(range, txns);
  const keySet    = new Set(keys);
  // Averages use completed months only, so a half-finished current month doesn't drag them down
  const avgKeys   = keys.length>1 ? keys.filter(k=>k!==cur) : keys;
  const avgSet    = new Set(avgKeys);

  const rows      = monthlyTotals(txns, keys).map(r=>({...r, name:r.key===cur?`${r.name}*`:r.name}));
  const avgRows   = rows.filter(r=>avgSet.has(r.key));
  const avgInc    = avgRows.reduce((s,r)=>s+r.รายรับ,0)/avgKeys.length;
  const avgExp    = avgRows.reduce((s,r)=>s+r.รายจ่าย,0)/avgKeys.length;
  const avgSave   = avgInc>0 ? Math.round((avgInc-avgExp)/avgInc*100) : null;
  const hasData   = rows.some(r=>r.รายรับ>0||r.รายจ่าย>0);

  const balances  = wallets.map(w=>({w, bal:calcBalance(w.id,txns)})).sort((a,b)=>b.bal-a.bal);
  const netWorth  = balances.reduce((s,x)=>s+x.bal,0);
  const assets    = balances.reduce((s,x)=>s+Math.max(0,x.bal),0) || 1;

  const expInRange = txns.filter(t=>t.type==="expense"&&keySet.has(t.date.slice(0,7)));
  const catTotals  = {}, catAvgTotals = {};
  expInRange.forEach(t=>{
    const c = t.category || "—";
    catTotals[c] = (catTotals[c]||0) + t.amount;
    if (avgSet.has(t.date.slice(0,7))) catAvgTotals[c] = (catAvgTotals[c]||0) + t.amount;
  });
  const catSorted  = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const expTotal   = catSorted.reduce((s,[,v])=>s+v,0);
  const topCats    = catSorted.slice(0,TOP_CATS).map(([name,value])=>({label:name, value, color:catColors[name]||OTHER_COLOR, avg:(catAvgTotals[name]||0)/avgKeys.length}));
  const rest       = catSorted.slice(TOP_CATS);
  const catSegs    = rest.length
    ? [...topCats, {label:`OTHER (${rest.length})`, value:rest.reduce((s,[,v])=>s+v,0), color:OTHER_COLOR, avg:rest.reduce((s,[n])=>s+(catAvgTotals[n]||0),0)/avgKeys.length}]
    : topCats;

  const fixedSubs    = subs.filter(s=>s.active).reduce((s,x)=>s+perMonth(x),0);
  const variable     = Math.max(0, avgExp-fixedSubs);
  const free         = avgInc-fixedSubs-variable;
  const committedPct = avgInc>0 ? Math.round(fixedSubs/avgInc*100) : null;
  const commitColor  = committedPct===null ? P.muted : committedPct<=30 ? P.green : committedPct<=50 ? "#FFB800" : P.red;

  const noData = <div style={{height:70,display:"flex",alignItems:"center",justifyContent:"center",color:P.border,fontSize:11}}>// NO DATA IN RANGE</div>;
  const avgNote = avgKeys.includes(cur) ? "incl. this month" : `avg of ${avgKeys.length} full mo.`;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"var(--gap)"}}>

      {/* Range filter - scopes every card below */}
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <span style={{fontSize:9,color:P.muted,letterSpacing:"0.1em",marginRight:2}}>RANGE</span>
        {RANGES.map(([v,l])=>(
          <button key={v} className={`pill-btn ${range===v?"act":""}`} onClick={()=>pickRange(v)}>{l}</button>
        ))}
      </div>

      {/* Hero + KPI row */}
      <div className="fade-up" style={{background:P.surf,border:`2px solid ${P.accent}`,boxShadow:`4px 4px 0 ${P.accent}44`,padding:"14px 16px",textAlign:"center"}}>
        <div style={{fontSize:9,color:P.muted,letterSpacing:"0.15em",marginBottom:5}}>NET WORTH · ALL WALLETS</div>
        <div style={{fontFamily:"'VT323',monospace",fontSize:"clamp(40px,10vw,54px)",color:netWorth>=0?P.accent:P.red,lineHeight:1}}>{baht(netWorth)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"var(--gap)"}}>
        <Tile label="AVG INCOME/MO"  value={baht(avgInc)} glyph="▲" glyphColor={P.green} sub={avgNote}/>
        <Tile label="AVG EXPENSE/MO" value={baht(avgExp)} glyph="▼" glyphColor={P.red}   sub={avgNote}/>
        <Tile label="SAVING RATE" value={avgSave===null?"—":`${avgSave}%`}
          glyph={avgSave===null?null:avgSave>=0?"▲":"▼"} glyphColor={avgSave>=20?P.green:avgSave>=0?P.accent:P.red}
          sub={avgSave===null?"no income yet":avgSave>=20?"healthy":avgSave>=0?"thin":"spending > income"}/>
      </div>

      {/* Cash flow */}
      <PxCard className="fade-up">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <SLabel>CASH FLOW / MONTH</SLabel>
          <div style={{display:"flex",gap:10,fontSize:10,marginBottom:8}}>
            <span style={{color:P.muted}}><span style={{color:P.green}}>▲</span> INC</span>
            <span style={{color:P.muted}}><span style={{color:P.red}}>▼</span> EXP</span>
          </div>
        </div>
        {hasData?(<>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={rows} barCategoryGap="30%" barGap={2} margin={{top:4,right:4,left:4,bottom:0}}>
              <XAxis dataKey="name" tick={{fill:P.muted,fontSize:9,fontFamily:"'Courier New',monospace"}} axisLine={false} tickLine={false} dy={5} interval="preserveStartEnd"/>
              <YAxis hide/><Tooltip content={<BarTooltip/>} cursor={{fill:"rgba(255,230,0,0.03)"}}/>
              <Bar dataKey="รายรับ"  fill={P.green} radius={[3,3,0,0]} maxBarSize={18}/>
              <Bar dataKey="รายจ่าย" fill={P.red}   radius={[3,3,0,0]} maxBarSize={18}/>
            </BarChart>
          </ResponsiveContainer>
          {keys.includes(cur)&&<div style={{fontSize:9,color:P.muted,marginTop:6}}>* เดือนปัจจุบัน (ยังไม่จบเดือน)</div>}
        </>):noData}
      </PxCard>

      {/* Where the money goes */}
      <PxCard className="fade-up">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
          <SLabel>WHERE MONEY GOES</SLabel>
          {expTotal>0&&<span style={{fontFamily:"'VT323',monospace",fontSize:16,color:P.text,marginBottom:8}}>{baht(expTotal)}</span>}
        </div>
        {expTotal>0?(<>
          <SegmentBar segments={catSegs}/>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,fontSize:8,color:P.muted,letterSpacing:"0.08em",marginTop:10}}>
            <span>SHARE · AVG/MO</span><span style={{minWidth:70,textAlign:"right"}}>TOTAL</span>
          </div>
          {catSegs.map(c=>(
            <LegendRow key={c.label} color={c.color} label={c.label} value={baht(c.value)}
              extra={`${Math.round(c.value/expTotal*100)}% · ${baht(c.avg)}`}/>
          ))}
        </>):noData}
      </PxCard>

      {/* Where the money sits */}
      <PxCard className="fade-up">
        <SLabel>WHERE MONEY SITS</SLabel>
        {balances.length===0?noData:balances.map(({w,bal})=>(
          <div key={w.id} style={{padding:"6px 0",borderBottom:`1px solid ${P.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              {w.character_url
                ? <img src={w.character_url} alt="" style={{width:22,height:22,objectFit:"cover",borderRadius:4,flexShrink:0}}/>
                : <span style={{width:22,textAlign:"center",flexShrink:0}}>{w.icon}</span>}
              <span style={{flex:1,fontSize:11,color:P.muted,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{w.name}</span>
              <span style={{fontSize:9,color:P.muted}}>{bal>0?`${Math.round(bal/assets*100)}%`:""}</span>
              <span style={{fontFamily:"'VT323',monospace",fontSize:17,color:bal<0?P.red:P.text,minWidth:70,textAlign:"right"}}>{baht(bal)}</span>
            </div>
            <PixelBar pct={bal>0?Math.round(bal/assets*100):0} color={w.color} height={4}/>
          </div>
        ))}
      </PxCard>

      {/* Fixed commitments + free-to-plan */}
      <PxCard className="fade-up">
        <SLabel>MONTHLY PLAN · FROM AVG INCOME</SLabel>
        {avgInc>0?(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
            <span style={{fontSize:10,color:P.muted}}>subscriptions ใช้ไปแล้ว</span>
            <span style={{fontSize:11,color:P.text}}><span style={{color:commitColor}}>●</span> {committedPct}% ของรายรับ</span>
          </div>
          <PixelBar pct={Math.min(100,committedPct)} color={commitColor} height={8}/>
          <div style={{marginTop:14}}>
            <SegmentBar segments={[
              {label:"FIXED (subs)", value:fixedSubs, color:P.cyan},
              {label:"VARIABLE",     value:variable,  color:P.red},
              {label:"FREE",         value:Math.max(0,free), color:P.green},
            ]}/>
          </div>
          <div style={{marginTop:6}}>
            <LegendRow color={P.cyan}  label="Fixed · subscriptions / เดือน" value={baht(fixedSubs)}/>
            <LegendRow color={P.red}   label="Variable · ใช้จ่ายทั่วไป เฉลี่ย"  value={baht(variable)}/>
            <LegendRow color={free>=0?P.green:P.red} label={free>=0?"Free · เหลือวางแผนได้":"Deficit · ใช้เกินรายรับ"} value={baht(free)} ink={free>=0?P.text:P.red}/>
          </div>
        </>):<div style={{fontSize:11,color:P.border,padding:"8px 0"}}>// ยังไม่มีรายรับในช่วงนี้ — เพิ่มรายรับเพื่อดูแผนรายเดือน</div>}
      </PxCard>

    </div>
  );
}
