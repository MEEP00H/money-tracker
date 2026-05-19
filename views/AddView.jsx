import { P } from "../constants";
import { fmtShort, calcBalance, sortByLastUsed } from "../utils";
import { PxInput, PxSelect, PxBtn } from "../components/ui";

export default function AddView({ addMode, setAddMode, form, setForm, tfForm, setTfForm, formErr, setFormErr, wallets, txns, handleAdd, setView, pressDown, pressUp, pressLeave, categories, setCatModal }) {
  const sortedWallets = sortByLastUsed(wallets, txns);
  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,3vw,12px)",color:P.accent,lineHeight:1.8}}>
        {addMode==="income"?"ADD INCOME":addMode==="expense"?"ADD EXPENSE":"TRANSFER"}
      </div>

      {/* Type tabs */}
      <div style={{display:"flex",gap:6}}>
        {[["income","▲ INC"],["expense","▼ EXP"],["transfer","↔ TFR"]].map(([m,l])=>(
          <button key={m} className={`type-tab ${m} ${addMode===m?"active":""}`}
            onClick={()=>{setAddMode(m);setFormErr("");if(m!=="transfer")setForm(f=>({...f,type:m,category:""}));}}>
            {l}
          </button>
        ))}
      </div>

      {addMode==="transfer"?(<>
        {[["FROM WALLET","fromWalletId",wallets],["TO WALLET","toWalletId",wallets.filter(w=>w.id!==tfForm.fromWalletId)]].map(([lbl,key,opts])=>(
          <div key={key}>
            <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>{lbl}</div>
            <PxSelect value={tfForm[key]} onChange={e=>setTfForm(f=>({...f,[key]:e.target.value}))}>
              <option value="">-- SELECT --</option>
              {opts.map(w=><option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
            </PxSelect>
          </div>
        ))}
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>AMOUNT (THB)</div>
          <PxInput type="number" inputMode="decimal" placeholder="0" value={tfForm.amount} onChange={e=>setTfForm(f=>({...f,amount:e.target.value}))}
            style={{fontSize:24,fontFamily:"'VT323',monospace",color:P.cyan}}/>
        </div>
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>DATE</div>
          <PxInput type="date" value={tfForm.date} onChange={e=>setTfForm(f=>({...f,date:e.target.value}))}/>
        </div>
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>NOTE</div>
          <PxInput type="text" placeholder="// note..." value={tfForm.note} onChange={e=>setTfForm(f=>({...f,note:e.target.value}))}/>
        </div>
      </>):(<>
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>WALLET</div>
          <div className="chip-scroll">
            {sortedWallets.map(w=>(
              <button key={w.id} className="wchip" onClick={()=>setForm(f=>({...f,walletId:w.id}))}
                style={{borderColor:form.walletId===w.id?w.color:P.border,color:form.walletId===w.id?w.color:P.muted,boxShadow:form.walletId===w.id?`2px 2px 0 ${w.color}44`:"2px 2px 0 #000",padding:"8px 12px",fontSize:12}}>
                {w.icon} {w.name}
                {form.walletId===w.id&&<span style={{fontSize:11,opacity:0.6,fontFamily:"'VT323',monospace"}}> ฿{fmtShort(calcBalance(w.id,txns))}</span>}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>AMOUNT (THB)</div>
          <PxInput type="number" inputMode="decimal" placeholder="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
            style={{fontSize:24,fontFamily:"'VT323',monospace",color:form.type==="income"?P.green:P.red}}/>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em"}}>CATEGORY</div>
            <button onClick={()=>setCatModal(form.type)}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:P.accent,fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",touchAction:"manipulation"}}>
              [EDIT]
            </button>
          </div>
          <PxSelect value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
            <option value="">-- SELECT --</option>
            {(categories[form.type]||[]).map(c=><option key={c} value={c}>{c}</option>)}
          </PxSelect>
        </div>
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>DATE</div>
          <PxInput type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
        </div>
        <div>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>NOTE</div>
          <PxInput type="text" placeholder="// note..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
        </div>
      </>)}

      {formErr&&(
        <div style={{color:P.red,fontSize:11,padding:"8px 12px",background:"rgba(255,68,102,0.06)",border:`2px solid ${P.red}`,fontFamily:"'Courier New',monospace"}}>
          {formErr}
        </div>
      )}

      <div style={{display:"flex",gap:8,paddingTop:2}}>
        <PxBtn onClick={()=>{setView("dashboard");setFormErr("");}} color={P.muted}
          style={{flex:1,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
          CANCEL
        </PxBtn>
        <button onClick={handleAdd} onMouseDown={pressDown} onMouseUp={pressUp} onMouseLeave={pressLeave}
          style={{flex:2,background:P.accent,border:"2px solid #000",color:"#000",padding:"12px",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,2.5vw,10px)",boxShadow:"4px 4px 0 #000",minHeight:44,touchAction:"manipulation",lineHeight:1.4}}>
          {addMode==="transfer"?"TRANSFER":"SAVE"}
        </button>
      </div>
    </div>
  );
}
