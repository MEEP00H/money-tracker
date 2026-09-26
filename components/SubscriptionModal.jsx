import { useState } from "react";
import { P } from "../constants";
import { localToday, sortByLastUsed } from "../utils";
import { PxInput, PxSelect, PxBtn } from "./ui";

const CYCLES = [["weekly","WEEKLY"],["monthly","MONTHLY"],["yearly","YEARLY"]];

export default function SubscriptionModal({ subModal, setSubModal, wallets, txns, expenseCats, saveSubscription, deleteSubscription, pressDown, pressUp, pressLeave }) {
  const isNew = subModal === "new";
  const init  = isNew ? null : subModal;
  const [form, setForm] = useState(()=>({
    name:     init?.name     ?? "",
    amount:   init ? String(init.amount) : "",
    cycle:    init?.cycle    ?? "monthly",
    nextDate: init?.nextDate ?? localToday(),
    walletId: init?.walletId ?? sortByLastUsed(wallets, txns)[0]?.id ?? "",
    category: init?.category ?? "",
    active:   init?.active   ?? true,
  }));
  const [err,    setErr]    = useState("");
  const [saving, setSaving] = useState(false);

  if (!subModal) return null;

  const set = patch => { setForm(f=>({...f,...patch})); setErr(""); };

  const handleSave = async ()=>{
    if(!form.name.trim())                return setErr("ERR: กรอกชื่อ subscription");
    if(!form.amount||+form.amount<=0)    return setErr("ERR: กรอกราคาให้ถูกต้อง");
    if(!form.walletId)                   return setErr("ERR: เลือกกระเป๋าเงินที่ใช้ตัด");
    if(!form.category)                   return setErr("ERR: เลือกหมวดหมู่");
    if(!form.nextDate)                   return setErr("ERR: เลือกวันตัดรอบถัดไป");
    const dateTouched = isNew || form.nextDate!==init.nextDate || form.cycle!==init.cycle || (form.active&&!init.active);
    if(form.active && dateTouched && form.nextDate<localToday())
      return setErr("ERR: วันตัดรอบถัดไปต้องเป็นวันนี้หรืออนาคต");
    setSaving(true);
    const errMsg = await saveSubscription(form, init);
    setSaving(false);
    if(errMsg) setErr(errMsg);
  };

  const label = t => <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>{t}</div>;

  return (
    <div className="modal-bg" onClick={()=>setSubModal(null)}>
      <div className="modal-sheet sheet-anim" onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,3vw,10px)",color:P.accent,marginBottom:16,lineHeight:1.8}}>
          {isNew?"// NEW SUBSCRIPTION":"// EDIT SUBSCRIPTION"}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            {label("NAME")}
            <PxInput type="text" placeholder="// Netflix, Spotify..." value={form.name} maxLength={40}
              onChange={e=>set({name:e.target.value})}/>
          </div>
          <div>
            {label("PRICE (THB)")}
            <PxInput type="number" inputMode="decimal" placeholder="0" value={form.amount}
              onChange={e=>set({amount:e.target.value})}
              style={{fontSize:24,fontFamily:"'VT323',monospace",color:P.red}}/>
          </div>
          <div>
            {label("CYCLE")}
            <div style={{display:"flex",gap:6}}>
              {CYCLES.map(([c,l])=>(
                <button key={c} className={`type-tab transfer ${form.cycle===c?"active":""}`} onClick={()=>set({cycle:c})}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            {label("NEXT CHARGE")}
            <PxInput type="date" value={form.nextDate} onChange={e=>set({nextDate:e.target.value})}/>
          </div>
          <div>
            {label("PAY FROM WALLET")}
            <div className="chip-scroll">
              {sortByLastUsed(wallets, txns).map(w=>(
                <button key={w.id} className="wchip" onClick={()=>set({walletId:w.id})}
                  style={{borderColor:form.walletId===w.id?w.color:P.border,color:form.walletId===w.id?w.color:P.muted,boxShadow:form.walletId===w.id?`2px 2px 0 ${w.color}44`:"2px 2px 0 #000"}}>
                  {w.icon} {w.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            {label("CATEGORY")}
            <PxSelect value={form.category} onChange={e=>set({category:e.target.value})}>
              <option value="">-- SELECT --</option>
              {expenseCats.map(c=><option key={c} value={c}>{c}</option>)}
            </PxSelect>
          </div>
          {!isNew&&(
            <button className={`pill-btn ${form.active?"act":""}`} onClick={()=>set({active:!form.active})}
              style={{alignSelf:"flex-start"}}>
              {form.active?"● ACTIVE — กดเพื่อพัก":"○ PAUSED — กดเพื่อเปิดใช้"}
            </button>
          )}
        </div>

        {err&&(
          <div style={{color:P.red,fontSize:11,padding:"8px 12px",marginTop:12,background:"rgba(255,68,102,0.06)",border:`2px solid ${P.red}`}}>
            {err}
          </div>
        )}

        <div style={{display:"flex",gap:8,marginTop:18}}>
          {!isNew&&(
            <PxBtn onClick={()=>deleteSubscription(init.id)} color={P.red}
              style={{flex:1,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
              DELETE
            </PxBtn>
          )}
          <button onClick={handleSave} disabled={saving} onMouseDown={pressDown} onMouseUp={pressUp} onMouseLeave={pressLeave}
            style={{flex:2,background:P.accent,border:"2px solid #000",color:"#000",padding:"11px",cursor:saving?"not-allowed":"pointer",opacity:saving?0.6:1,fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,2.5vw,9px)",boxShadow:"4px 4px 0 #000",minHeight:44,touchAction:"manipulation",lineHeight:1.4}}>
            {saving?"SAVING...":isNew?"CREATE":"SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
