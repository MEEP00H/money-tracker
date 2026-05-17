import { WALLET_ICONS, WALLET_COLORS, P } from "../constants";
import { fmtShort, calcBalance } from "../utils";
import { PxInput, PxBtn } from "./ui";

export default function WalletModal({ walletModal, setWalletModal, walletForm, setWalletForm, txns, saveWallet, deleteWallet, pressDown, pressUp, pressLeave }) {
  if (!walletModal) return null;
  return (
    <div className="modal-bg" onClick={()=>setWalletModal(null)}>
      <div className="modal-sheet sheet-anim" onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,3vw,10px)",color:P.accent,marginBottom:16,lineHeight:1.8}}>
          {walletModal==="new"?"// NEW WALLET":"// EDIT WALLET"}
        </div>
        <div style={{background:P.bg,border:`2px solid ${walletForm.color}`,boxShadow:`4px 4px 0 ${walletForm.color}44`,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <span style={{fontSize:26}}>{walletForm.icon}</span>
          <div>
            <div style={{fontSize:13,color:P.text}}>{walletForm.name||"// NAME"}</div>
            {walletModal!=="new"&&(
              <div style={{fontFamily:"'VT323',monospace",fontSize:18,color:walletForm.color}}>
                ฿{fmtShort(calcBalance(walletModal.id,txns))}
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:6}}>NAME</div>
            <PxInput type="text" placeholder="// wallet name" value={walletForm.name}
              onChange={e=>setWalletForm(f=>({...f,name:e.target.value}))} maxLength={20}/>
          </div>
          <div>
            <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:8}}>ICON</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {WALLET_ICONS.map(ic=>(
                <button key={ic} className={`icon-pick ${walletForm.icon===ic?"sel":""}`}
                  onClick={()=>setWalletForm(f=>({...f,icon:ic}))}>{ic}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:9,color:P.muted,letterSpacing:"0.12em",marginBottom:8}}>COLOR</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {WALLET_COLORS.map(c=>(
                <div key={c} className={`cdot ${walletForm.color===c?"sel":""}`}
                  style={{background:c}} onClick={()=>setWalletForm(f=>({...f,color:c}))}/>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:18}}>
          {walletModal!=="new"&&(
            <PxBtn onClick={()=>deleteWallet(walletModal.id)} color={P.red}
              style={{flex:1,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
              DELETE
            </PxBtn>
          )}
          <button onClick={saveWallet} onMouseDown={pressDown} onMouseUp={pressUp} onMouseLeave={pressLeave}
            style={{flex:2,background:P.accent,border:"2px solid #000",color:"#000",padding:"11px",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,2.5vw,9px)",boxShadow:"4px 4px 0 #000",minHeight:44,touchAction:"manipulation",lineHeight:1.4}}>
            {walletModal==="new"?"CREATE":"SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
