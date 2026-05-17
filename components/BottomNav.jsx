export default function BottomNav({ view, setView, setFabOpen }) {
  return (
    <div className="bottom-nav">
      {[["dashboard","◉","HOME"],["wallets","▣","WALLETS"],["history","☰","HISTORY"]].map(([v,ic,lb])=>(
        <button key={v} className={`bnav ${(view===v||(view==="add"&&v==="dashboard"))?"active":""}`}
          onClick={()=>{ setView(v); setFabOpen(false); }}>
          <span className="bnav-icon">{ic}</span>
          <span className="bnav-label">{lb}</span>
        </button>
      ))}
    </div>
  );
}
