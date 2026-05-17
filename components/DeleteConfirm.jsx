import { P } from "../constants";
import { PxBtn } from "./ui";

export default function DeleteConfirm({ deleteId, setDeleteId, handleDelete }) {
  if (!deleteId) return null;
  return (
    <div className="confirm-bg" onClick={()=>setDeleteId(null)}>
      <div style={{background:P.surf,border:`2px solid ${P.red}`,boxShadow:`6px 6px 0 ${P.red}44`,padding:"24px 22px",maxWidth:290,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:10,color:P.red,marginBottom:10,lineHeight:1.8}}>DELETE?</div>
        <div style={{fontSize:11,color:P.muted,marginBottom:18}}>// cannot be undone</div>
        <div style={{display:"flex",gap:8}}>
          <PxBtn onClick={()=>setDeleteId(null)} color={P.muted}
            style={{flex:1,minHeight:40,display:"flex",alignItems:"center",justifyContent:"center"}}>
            NO
          </PxBtn>
          <PxBtn onClick={()=>handleDelete(deleteId)} color={P.red} bg="rgba(255,68,102,0.1)"
            style={{flex:1,minHeight:40,display:"flex",alignItems:"center",justifyContent:"center"}}>
            YES
          </PxBtn>
        </div>
      </div>
    </div>
  );
}
