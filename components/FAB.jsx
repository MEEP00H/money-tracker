export default function FAB({ view, fabOpen, setFabOpen, openAdd }) {
  if (view === "add") return null;
  return (
    <>
      <div className="fab-wrap">
        {fabOpen&&(
          <div className="fab-items">
            {[["▲ INCOME","income"],["▼ EXPENSE","expense"],["↔ TRANSFER","transfer"]].map(([l,m],i)=>(
              <div key={m} className="fab-anim" style={{animationDelay:`${i*0.04}s`,display:"flex"}}>
                <button className="fab-sub" onClick={()=>openAdd(m)}>{l}</button>
              </div>
            ))}
          </div>
        )}
        <button className={`fab-main${fabOpen?" open":""}`} onClick={()=>setFabOpen(o=>!o)}>
          {fabOpen?"×":"+"}
        </button>
      </div>
      {fabOpen&&<div style={{position:"fixed",inset:0,zIndex:49}} onClick={()=>setFabOpen(false)}/>}
    </>
  );
}
