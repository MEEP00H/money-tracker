import { ComposedChart, Area, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot } from "recharts";
import { P, MONTHS } from "../constants";
import { fmtShort, fmtCell, currentYM } from "../utils";
import { PxCard, SLabel } from "./ui";

// Emphasis form: the current year is the point, earlier years are context
const YEAR_STYLE = [
  { color:P.red,    width:2.5 },
  { color:P.cyan,   width:2   },
  { color:"#8888AA", width:1.5 },
];
const MAX_YEARS = YEAR_STYLE.length;
const baht = v => `฿${fmtShort(v)}`;

function YoYTooltip({ active, payload, label, years }) {
  if (!active || !payload?.length) return null;
  const val = y => payload.find(p=>p.dataKey===`y${y}`)?.value;
  const [thisY, lastY] = years;
  const a = val(thisY), b = val(lastY);
  const delta = a!=null && b ? Math.round((a-b)/b*100) : null;
  return (
    <div style={{background:P.surf,border:`2px solid ${P.accent}`,boxShadow:"4px 4px 0 #000",padding:"10px 14px",minWidth:150,pointerEvents:"none",fontFamily:"'Courier New',monospace"}}>
      <div style={{fontSize:11,color:P.accent,marginBottom:8}}>[{label}]</div>
      {years.map((y,i)=>{
        const v = val(y);
        return (
          <div key={y} style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:4,alignItems:"center"}}>
            <span style={{fontSize:11,color:P.muted,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:10,height:3,background:YEAR_STYLE[i].color,display:"inline-block"}}/>{y+543}
            </span>
            <span style={{fontSize:15,color:P.text,fontFamily:"'VT323',monospace"}}>{v==null?"—":baht(v)}</span>
          </div>
        );
      })}
      {delta!==null&&(
        <div style={{borderTop:`1px solid ${P.border}`,marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:10,color:P.muted}}>vs {lastY+543}</span>
          <span style={{fontSize:15,color:P.text,fontFamily:"'VT323',monospace"}}>
            <span style={{color:delta>0?P.red:P.green}}>{delta>0?"▲":"▼"}</span> {delta>0?"+":""}{delta}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function YearOverYearChart({ txns }) {
  const cur = currentYM();
  const firstKey = txns.reduce((m,t)=>t.type==="expense"&&t.date.slice(0,7)<m?t.date.slice(0,7):m, cur);

  const totals = {};
  txns.forEach(t=>{ if(t.type==="expense"){ const k=t.date.slice(0,7); totals[k]=(totals[k]||0)+t.amount; } });

  const thisYear = +cur.slice(0,4);
  const years = [];
  for (let y=thisYear; y>=+firstKey.slice(0,4) && years.length<MAX_YEARS; y--) years.push(y);

  // Months before tracking started or still in the future are gaps, not zero spend
  const data = MONTHS.map((name,i)=>{
    const row = { name };
    years.forEach(y=>{
      const k = `${y}-${String(i+1).padStart(2,"0")}`;
      row[`y${y}`] = k<firstKey || k>cur ? null : (totals[k]||0);
    });
    return row;
  });

  const curVals = data.map(r=>r[`y${thisYear}`]);
  const peakIdx = curVals.reduce((best,v,i)=>v!=null&&v>(curVals[best]??-1)?i:best, 0);
  const peakVal = curVals[peakIdx];

  // Year-to-date vs the same months last year - only months both years have data for
  const lastYear = years[1];
  let ytdThis=0, ytdLast=0;
  if (lastYear) data.forEach(r=>{ const a=r[`y${thisYear}`], b=r[`y${lastYear}`]; if(a!=null&&b!=null){ ytdThis+=a; ytdLast+=b; } });
  const ytdDelta = lastYear && ytdLast>0 ? Math.round((ytdThis-ytdLast)/ytdLast*100) : null;

  const hasData = curVals.some(v=>v>0) || years.length>1;

  return (
    <PxCard className="fade-up">
      <SLabel>SPENDING · YEAR OVER YEAR</SLabel>
      <div style={{fontSize:9,color:P.muted,marginTop:-4,marginBottom:10}}>รายจ่ายรายเดือน ม.ค.–ธ.ค. เทียบแต่ละปี (ไม่ขึ้นกับ RANGE)</div>

      {!hasData ? (
        <div style={{height:70,display:"flex",alignItems:"center",justifyContent:"center",color:P.border,fontSize:11}}>// NO DATA</div>
      ) : (<>
        {/* Legend - always present; the current year is the emphasized one */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:6}}>
          {years.map((y,i)=>(
            <span key={y} style={{fontSize:10,color:i===0?P.text:P.muted,display:"flex",alignItems:"center",gap:5}}>
              <span style={i===0
                ? {width:14,height:8,display:"inline-block",borderTop:`2px solid ${P.red}`,backgroundImage:`repeating-linear-gradient(135deg, ${P.red}88 0 1px, transparent 1px 4px)`}
                : {width:14,height:YEAR_STYLE[i].width+1,display:"inline-block",background:YEAR_STYLE[i].color}}/>
              {y+543}{i===0?" (ปีนี้)":""}
            </span>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{top:22,right:8,left:0,bottom:0}}>
            <defs>
              <pattern id="yoy-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke={P.red} strokeWidth="1" strokeOpacity="0.45"/>
              </pattern>
            </defs>
            <XAxis dataKey="name" tick={{fill:P.muted,fontSize:9,fontFamily:"'Courier New',monospace"}} axisLine={{stroke:P.border}} tickLine={false} dy={5} interval={1}/>
            <YAxis tick={{fill:P.muted,fontSize:9,fontFamily:"'Courier New',monospace"}} axisLine={false} tickLine={false} width={34} tickFormatter={fmtCell}/>
            <Tooltip content={<YoYTooltip years={years}/>} cursor={{stroke:P.brite,strokeWidth:1}}/>
            {[...years].reverse().map(y=>{
              const i = years.indexOf(y);
              return i===0 ? null : (
                <Line key={y} dataKey={`y${y}`} type="monotone" stroke={YEAR_STYLE[i].color} strokeWidth={YEAR_STYLE[i].width}
                  dot={false} activeDot={{r:4,stroke:P.surf,strokeWidth:2}} connectNulls={false} isAnimationActive={false}/>
              );
            })}
            <Area dataKey={`y${thisYear}`} type="monotone" stroke={P.red} strokeWidth={YEAR_STYLE[0].width} fill="url(#yoy-hatch)"
              dot={false} activeDot={{r:5,stroke:P.surf,strokeWidth:2}} connectNulls={false} isAnimationActive={false}/>
            {peakVal>0&&(
              <ReferenceDot x={data[peakIdx].name} y={peakVal} r={4} fill={P.red} stroke={P.surf} strokeWidth={2}
                label={{value:`PEAK ${baht(peakVal)}`,position:"top",fill:P.text,fontSize:9,fontFamily:"'Courier New',monospace"}}/>
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {ytdDelta!==null&&(
          <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${P.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:P.muted}}>ช่วงเดียวกัน ปีนี้ vs {lastYear+543}</span>
              <span style={{fontFamily:"'VT323',monospace",fontSize:20,color:P.text}}>
                <span style={{color:ytdDelta>0?P.red:P.green}}>{ytdDelta>0?"▲":"▼"}</span> {ytdDelta>0?"+":""}{ytdDelta}%
              </span>
            </div>
            <div style={{fontSize:9,color:P.muted,textAlign:"right",marginTop:2}}>{baht(ytdThis)} vs {baht(ytdLast)}</div>
          </div>
        )}
      </>)}
    </PxCard>
  );
}
