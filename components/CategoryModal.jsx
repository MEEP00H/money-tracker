import { useState } from "react";
import { P } from "../constants";
import { PxBtn, PxInput } from "./ui";

const COLOR_OPTS = [
  "#FFB800","#00CCFF","#FF66CC","#AA88FF","#00FF88","#FF4466",
  "#00FFFF","#FF8800","#FFE600","#00FFCC","#CC66FF","#88FF00",
  "#8888AA","#FF6644","#44AAFF","#FFAACC",
];

export default function CategoryModal({ catModal, setCatModal, categories, catColors, txns, addCategory, deleteCategory }) {
  const [newName,  setNewName]  = useState("");
  const [newColor, setNewColor] = useState("#8888AA");

  if (!catModal) return null;

  const type = catModal;
  const cats = categories[type] || [];
  const usedCats = new Set(txns.filter(t => t.type === type).map(t => t.category));

  const handleAdd = () => {
    const name = newName.trim();
    if (!name || cats.includes(name)) return;
    addCategory(type, name, newColor);
    setNewName("");
  };

  return (
    <div className="modal-bg" onClick={() => setCatModal(null)}>
      <div className="modal-sheet sheet-anim" onClick={e => e.stopPropagation()}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${P.border}`}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,3vw,10px)",color:P.accent}}>CATEGORIES</div>
          <button onClick={() => setCatModal(null)}
            style={{background:"none",border:"none",cursor:"pointer",color:P.muted,fontSize:20,lineHeight:1,touchAction:"manipulation"}}>✕</button>
        </div>

        {/* Type tabs */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["income","▲ INCOME"],["expense","▼ EXPENSE"]].map(([t,l]) => (
            <button key={t} className={`type-tab ${t} ${catModal===t?"active":""}`}
              onClick={() => setCatModal(t)}>{l}</button>
          ))}
        </div>

        {/* List */}
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
          {cats.map(name => {
            const color   = catColors[name] || "#8888AA";
            const inUse   = usedCats.has(name);
            const locked  = name === "อื่นๆ" || inUse;
            return (
              <div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:P.bg,border:`1px solid ${P.border}`,boxShadow:"2px 2px 0 #000"}}>
                <div style={{width:12,height:12,background:color,flexShrink:0,border:"1px solid rgba(255,255,255,0.12)"}}/>
                <span style={{flex:1,fontSize:12,color:P.text,fontFamily:"'Courier New',monospace"}}>{name}</span>
                {inUse && <span style={{fontSize:9,color:P.muted,letterSpacing:"0.1em"}}>IN USE</span>}
                {locked
                  ? <div style={{width:32,height:32,flexShrink:0}}/>
                  : <button className="del-btn" style={{fontSize:12}} onClick={() => deleteCategory(type, name)}>✕</button>
                }
              </div>
            );
          })}
        </div>

        {/* Add new */}
        <div style={{padding:"12px",background:P.surf2,border:`1px solid ${P.brite}`}}>
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:8}}>ADD NEW</div>
          <PxInput
            type="text" placeholder="ชื่อหมวดหมู่..."
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleAdd()}
            style={{marginBottom:8}}
          />
          <div style={{fontSize:9,color:P.muted,letterSpacing:"0.1em",marginBottom:6}}>COLOR</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {COLOR_OPTS.map(c => (
              <div key={c} className={`cdot${newColor===c?" sel":""}`}
                style={{background:c}} onClick={() => setNewColor(c)}/>
            ))}
          </div>
          <PxBtn onClick={handleAdd} color={P.accent} bg={P.surf2}
            style={{width:"100%",justifyContent:"center",minHeight:40}}>
            + ADD
          </PxBtn>
        </div>

      </div>
    </div>
  );
}
