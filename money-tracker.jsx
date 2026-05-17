import { useState, useEffect } from "react";
import { P, CATEGORIES, CAT_COLORS, SAMPLE_WALLETS, SAMPLE_TXNS } from "./constants";
import { today, currentYM, calcBalance } from "./utils";
import Header       from "./components/Header";
import BottomNav    from "./components/BottomNav";
import FAB          from "./components/FAB";
import WalletModal  from "./components/WalletModal";
import DeleteConfirm   from "./components/DeleteConfirm";
import CategoryModal  from "./components/CategoryModal";
import DashboardView from "./views/DashboardView";
import WalletsView   from "./views/WalletsView";
import HistoryView   from "./views/HistoryView";
import AddView       from "./views/AddView";

export default function MoneyTracker() {
  const [txns,       setTxns]       = useState([]);
  const [wallets,    setWallets]    = useState([]);
  const [loaded,     setLoaded]     = useState(false);
  const [view,       setView]       = useState("dashboard");
  const [selectedMonth, setSelMonth]= useState(currentYM);
  const [budgets,    setBudgets]    = useState({});
  const [activeWallet, setActiveWlt]= useState("all");
  const [filterType, setFilterType] = useState("all");
  const [addMode,    setAddMode]    = useState("expense");
  const [fabOpen,    setFabOpen]    = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [toast,      setToast]      = useState("");
  const [walletModal,setWalletModal]= useState(null);
  const [walletForm, setWalletForm] = useState({name:"",icon:"💳",color:"#FFE600"});
  const [categories, setCategories] = useState(CATEGORIES);
  const [catColors,  setCatColors]  = useState(CAT_COLORS);
  const [catModal,   setCatModal]   = useState(null);
  const [formErr,    setFormErr]    = useState("");
  const [form,       setForm]       = useState({type:"expense",amount:"",category:"",note:"",date:today(),walletId:""});
  const [tfForm,     setTfForm]     = useState({fromWalletId:"",toWalletId:"",amount:"",note:"",date:today()});

  // ── Storage ────────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      try{
        const [rw,rt,rb,rc,rcc]=await Promise.all([
          window.storage.get("mt_w3"),window.storage.get("mt_t3"),window.storage.get("mt_b3"),
          window.storage.get("mt_cat1"),window.storage.get("mt_cc1"),
        ]);
        setWallets(rw?.value?JSON.parse(rw.value):SAMPLE_WALLETS);
        setTxns(rt?.value?JSON.parse(rt.value):SAMPLE_TXNS);
        setBudgets(rb?.value?JSON.parse(rb.value):{});
        setCategories(rc?.value?JSON.parse(rc.value):CATEGORIES);
        setCatColors(rcc?.value?JSON.parse(rcc.value):CAT_COLORS);
      }catch{setWallets(SAMPLE_WALLETS);setTxns(SAMPLE_TXNS);}
      setLoaded(true);
    })();
  },[]);
  useEffect(()=>{if(!loaded)return;window.storage.set("mt_w3",JSON.stringify(wallets)).catch(()=>{});},[wallets,loaded]);
  useEffect(()=>{if(!loaded)return;window.storage.set("mt_t3",JSON.stringify(txns)).catch(()=>{});},[txns,loaded]);
  useEffect(()=>{if(!loaded)return;window.storage.set("mt_b3",JSON.stringify(budgets)).catch(()=>{});},[budgets,loaded]);
  useEffect(()=>{if(!loaded)return;window.storage.set("mt_cat1",JSON.stringify(categories)).catch(()=>{});},[categories,loaded]);
  useEffect(()=>{if(!loaded)return;window.storage.set("mt_cc1",JSON.stringify(catColors)).catch(()=>{});},[catColors,loaded]);

  // ── Derived values for Header ──────────────────────────────────────────
  const totalBalance  = wallets.reduce((s,w)=>s+calcBalance(w.id,txns),0);
  const activeW       = wallets.find(w=>w.id===activeWallet);
  const activeBalance = activeWallet==="all"?totalBalance:calcBalance(activeWallet,txns);
  const monthExpense  = txns.filter(t=>t.date.startsWith(selectedMonth)&&t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const monthBudget   = budgets[selectedMonth]||0;
  const budgetPct     = monthBudget>0?Math.min(100,Math.round((monthExpense/monthBudget)*100)):0;

  // ── Handlers ──────────────────────────────────────────────────────────
  const showToast = msg=>{setToast(msg);setTimeout(()=>setToast(""),2200);};

  const openAdd = mode=>{
    setAddMode(mode);
    setForm(f=>({...f,type:mode==="income"?"income":"expense",walletId:activeWallet!=="all"?activeWallet:(wallets[0]?.id||"")}));
    setTfForm(f=>({...f,fromWalletId:activeWallet!=="all"?activeWallet:"",toWalletId:""}));
    setFormErr("");setView("add");setFabOpen(false);
  };

  const handleAdd = ()=>{
    if(addMode==="transfer"){
      if(!tfForm.fromWalletId||!tfForm.toWalletId)return setFormErr("ERR: เลือกกระเป๋าต้นทางและปลายทาง");
      if(tfForm.fromWalletId===tfForm.toWalletId)return setFormErr("ERR: กระเป๋าต้นทางและปลายทางห้ามซ้ำ");
      if(!tfForm.amount||+tfForm.amount<=0)return setFormErr("ERR: กรอกจำนวนเงิน");
      setTxns(p=>[{id:Date.now(),type:"transfer",amount:+tfForm.amount,note:tfForm.note||"โอนเงิน",date:tfForm.date,fromWalletId:tfForm.fromWalletId,toWalletId:tfForm.toWalletId},...p]);
      setTfForm({fromWalletId:"",toWalletId:"",amount:"",note:"",date:today()});
      setFormErr("");setView("dashboard");showToast(">> โอนเงินสำเร็จ");
    }else{
      if(!form.walletId)return setFormErr("ERR: เลือกกระเป๋าเงิน");
      if(!form.amount||+form.amount<=0)return setFormErr("ERR: กรอกจำนวนเงินให้ถูกต้อง");
      if(!form.category)return setFormErr("ERR: เลือกหมวดหมู่");
      setTxns(p=>[{id:Date.now(),type:form.type,amount:+form.amount,category:form.category,note:form.note,date:form.date,walletId:form.walletId},...p]);
      setForm(f=>({...f,amount:"",category:"",note:""}));
      setFormErr("");setView("dashboard");
      showToast(form.type==="income"?">> บันทึกรายรับแล้ว":">> บันทึกรายจ่ายแล้ว");
    }
  };

  const handleDelete = id=>{setTxns(p=>p.filter(t=>t.id!==id));setDeleteId(null);showToast(">> ลบรายการแล้ว");};

  const saveWallet = ()=>{
    if(!walletForm.name.trim())return;
    if(walletModal==="new"){
      const w={id:"w"+Date.now(),name:walletForm.name.trim(),icon:walletForm.icon,color:walletForm.color};
      setWallets(p=>[...p,w]);showToast(`>> สร้าง "${w.name}" แล้ว`);
    }else{
      setWallets(p=>p.map(w=>w.id===walletModal.id?{...w,...walletForm,name:walletForm.name.trim()}:w));
      showToast(">> แก้ไขกระเป๋าแล้ว");
    }
    setWalletModal(null);
  };

  const addCategory = (type, name, color) => {
    setCategories(c=>{
      const rest=[...c[type].filter(n=>n!=="อื่นๆ"),name];
      const hasOther=c[type].includes("อื่นๆ");
      return{...c,[type]:hasOther?[...rest,"อื่นๆ"]:rest};
    });
    setCatColors(c=>({...c,[name]:color}));
    showToast(`>> เพิ่ม "${name}" แล้ว`);
  };

  const deleteCategory = (type, name) => {
    setCategories(c=>({...c,[type]:c[type].filter(n=>n!==name)}));
    showToast(">> ลบหมวดหมู่แล้ว");
  };

  const deleteWallet = id=>{
    setWallets(p=>p.filter(w=>w.id!==id));
    setTxns(p=>p.filter(t=>t.walletId!==id&&t.fromWalletId!==id&&t.toWalletId!==id));
    if(activeWallet===id)setActiveWlt("all");
    setWalletModal(null);showToast(">> ลบกระเป๋าแล้ว");
  };

  const pressDown  = e=>{e.currentTarget.style.transform="translate(3px,3px)";e.currentTarget.style.boxShadow="1px 1px 0 #000";};
  const pressUp    = e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #000";};
  const pressLeave = e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #000";};

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Courier New',monospace",background:P.bg,minHeight:"100svh",color:P.text,position:"relative",overflowX:"hidden",WebkitTapHighlightColor:"transparent",backgroundImage:`linear-gradient(${P.surf}55 1px,transparent 1px),linear-gradient(90deg,${P.surf}55 1px,transparent 1px)`,backgroundSize:"20px 20px"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html{-webkit-text-size-adjust:100%;}
      :root{--px:clamp(12px,4vw,18px);--gap:clamp(8px,2.5vw,12px);--nav-h:calc(64px + env(safe-area-inset-bottom,0px));--safe-b:env(safe-area-inset-bottom,0px);--safe-l:env(safe-area-inset-left,0px);--safe-r:env(safe-area-inset-right,0px);}
      body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px);}
      ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:#080810;}::-webkit-scrollbar-thumb{background:#FFE600;}
      .px-inp:focus{border-color:#FFE600 !important;}
      .px-inp option,select option{background:#10101E;}
      .chip-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:3px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
      .chip-scroll::-webkit-scrollbar{display:none;}
      .wchip{border:2px solid;cursor:pointer;font-family:'Courier New',monospace;font-size:11px;padding:6px 11px;white-space:nowrap;transition:all 0.08s;display:flex;align-items:center;gap:5px;min-height:34px;touch-action:manipulation;box-shadow:2px 2px 0 #000;background:#10101E;}
      .wchip:active{transform:translate(2px,2px);box-shadow:none;}
      .wallet-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(150px,44vw),1fr));gap:var(--gap);}
      .wallet-card{padding:clamp(12px,3.5vw,16px);cursor:pointer;position:relative;overflow:hidden;transition:transform 0.08s,box-shadow 0.08s;border:2px solid;box-shadow:4px 4px 0 #000;touch-action:manipulation;}
      .wallet-card:active{transform:translate(3px,3px);box-shadow:1px 1px 0 #000;}
      @media(hover:hover){.wallet-card:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #000;}}
      .icon-pick{width:clamp(36px,10vw,42px);height:clamp(36px,10vw,42px);border:2px solid #2A2A44;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.08s;background:#10101E;box-shadow:2px 2px 0 #000;touch-action:manipulation;}
      .icon-pick:hover,.icon-pick.sel{border-color:#FFE600;box-shadow:2px 2px 0 rgba(255,230,0,0.35);}
      .cdot{width:24px;height:24px;cursor:pointer;transition:all 0.08s;flex-shrink:0;box-shadow:2px 2px 0 #000;touch-action:manipulation;}
      .cdot:hover,.cdot:active{transform:scale(1.18);}
      .cdot.sel{outline:2px solid #fff;outline-offset:2px;}
      .txn-row{display:flex;align-items:center;gap:10px;padding:10px 11px;border:2px solid #1E1E32;background:#10101E;transition:border-color 0.1s;box-shadow:2px 2px 0 #000;}
      .txn-row:hover{border-color:#2A2A44;}
      .del-btn{background:none;border:2px solid transparent;cursor:pointer;color:#2A2A44;font-size:14px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.08s;touch-action:manipulation;}
      .del-btn:hover,.del-btn:active{color:#FF4466;border-color:#FF4466;background:rgba(255,68,102,0.08);}
      .type-tab{background:#10101E;border:2px solid #2A2A44;color:#44446A;padding:10px 8px;cursor:pointer;font-family:'Courier New',monospace;font-size:clamp(10px,3vw,12px);transition:all 0.08s;flex:1;min-height:44px;touch-action:manipulation;box-shadow:3px 3px 0 #000;}
      .type-tab:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #000;}
      .type-tab.income.active{border-color:#00FF88;color:#00FF88;background:rgba(0,255,136,0.06);box-shadow:3px 3px 0 rgba(0,255,136,0.25);}
      .type-tab.expense.active{border-color:#FF4466;color:#FF4466;background:rgba(255,68,102,0.06);box-shadow:3px 3px 0 rgba(255,68,102,0.25);}
      .type-tab.transfer.active{border-color:#FFE600;color:#FFE600;background:rgba(255,230,0,0.06);box-shadow:3px 3px 0 rgba(255,230,0,0.25);}
      .pill-btn{border:2px solid #2A2A44;cursor:pointer;font-family:'Courier New',monospace;font-size:11px;padding:6px 12px;transition:all 0.08s;min-height:34px;touch-action:manipulation;background:#10101E;color:#44446A;box-shadow:2px 2px 0 #000;}
      .pill-btn:active{transform:translate(2px,2px);box-shadow:none;}
      .pill-btn.act{border-color:#FFE600;color:#FFE600;box-shadow:2px 2px 0 rgba(255,230,0,0.3);}
      .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
      .modal-sheet{background:#0A0A12;border-top:2px solid #FFE600;border-left:2px solid #2A2A44;border-right:2px solid #2A2A44;padding:16px var(--px) calc(28px + var(--safe-b));width:100%;max-width:520px;max-height:min(90vh,90dvh);overflow-y:auto;-webkit-overflow-scrolling:touch;}
      .confirm-bg{position:fixed;inset:0;background:rgba(0,0,0,0.84);display:flex;align-items:center;justify-content:center;z-index:300;padding:var(--px);}
      .fab-wrap{position:fixed;bottom:calc(var(--nav-h) + 12px);right:calc(max(16px,var(--safe-r)) + 4px);z-index:50;display:flex;flex-direction:column;align-items:flex-end;}
      .fab-main{width:52px;height:52px;background:#FFE600;border:2px solid #000;cursor:pointer;color:#000;font-size:26px;font-weight:bold;box-shadow:4px 4px 0 #000;transition:transform 0.08s,box-shadow 0.08s;display:flex;align-items:center;justify-content:center;touch-action:manipulation;}
      .fab-main:active{transform:translate(3px,3px);box-shadow:1px 1px 0 #000;}
      .fab-items{display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-bottom:8px;}
      .fab-sub{background:#10101E;border:2px solid #3A3A5A;color:#C8C8E8;padding:9px 14px;cursor:pointer;font-family:'Courier New',monospace;font-size:12px;white-space:nowrap;box-shadow:3px 3px 0 #000;transition:all 0.08s;min-height:38px;touch-action:manipulation;}
      .fab-sub:hover{border-color:#FFE600;color:#FFE600;}
      .fab-sub:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #000;}
      .bottom-nav{position:fixed;bottom:0;left:0;right:0;height:var(--nav-h);background:#080810;border-top:2px solid #FFE600;display:flex;align-items:flex-start;justify-content:space-around;padding-top:8px;padding-bottom:var(--safe-b);padding-left:var(--safe-l);padding-right:var(--safe-r);z-index:40;}
      .bnav{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 0;color:#2A2A44;transition:color 0.1s;min-width:60px;min-height:44px;touch-action:manipulation;font-family:'Courier New',monospace;}
      .bnav.active{color:#FFE600;}
      .bnav-icon{font-size:20px;}.bnav-label{font-size:9px;letter-spacing:0.05em;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes toastIn{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
      @keyframes fabIn{from{opacity:0;transform:scale(0.6) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
      @keyframes sheetUp{from{transform:translateY(32px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      .fade-up{animation:fadeUp 0.28s ease forwards;}.toast-el{animation:toastIn 0.22s ease;}.fab-anim{animation:fabIn 0.14s ease forwards;}.sheet-anim{animation:sheetUp 0.24s ease;}.blink{animation:blink 1s step-start infinite;}
      input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
      @media(min-width:600px){.bottom-nav{justify-content:center;gap:clamp(40px,8vw,80px)}.fab-wrap{right:calc(50% - 240px + 16px)}}
      @media(min-width:900px){.wallet-grid{grid-template-columns:repeat(3,1fr)}}
    `}</style>

    <Header
      view={view}
      monthBudget={monthBudget}
      budgetPct={budgetPct}
      activeWallet={activeWallet}
      totalBalance={totalBalance}
      activeW={activeW}
      activeBalance={activeBalance}
    />

    <div style={{maxWidth:520,margin:"0 auto",padding:"var(--gap) var(--px) calc(var(--nav-h) + 24px)",position:"relative",zIndex:2}}>
      {view==="dashboard"&&(
        <DashboardView
          selectedMonth={selectedMonth} setSelMonth={setSelMonth}
          wallets={wallets} txns={txns}
          activeWallet={activeWallet} setActiveWlt={setActiveWlt}
          budgets={budgets} setBudgets={setBudgets}
          setView={setView} setDeleteId={setDeleteId}
          showToast={showToast} catColors={catColors}
        />
      )}
      {view==="wallets"&&(
        <WalletsView
          wallets={wallets} txns={txns}
          selectedMonth={selectedMonth}
          totalBalance={totalBalance}
          setWalletModal={setWalletModal} setWalletForm={setWalletForm}
          setDeleteId={setDeleteId}
        />
      )}
      {view==="history"&&(
        <HistoryView
          txns={txns}
          filterType={filterType} setFilterType={setFilterType}
          wallets={wallets} setDeleteId={setDeleteId}
        />
      )}
      {view==="add"&&(
        <AddView
          addMode={addMode} setAddMode={setAddMode}
          form={form} setForm={setForm}
          tfForm={tfForm} setTfForm={setTfForm}
          formErr={formErr} setFormErr={setFormErr}
          wallets={wallets} txns={txns}
          handleAdd={handleAdd} setView={setView}
          pressDown={pressDown} pressUp={pressUp} pressLeave={pressLeave}
          categories={categories} setCatModal={setCatModal}
        />
      )}
    </div>

    <FAB view={view} fabOpen={fabOpen} setFabOpen={setFabOpen} openAdd={openAdd}/>
    <BottomNav view={view} setView={setView} setFabOpen={setFabOpen}/>

    <WalletModal
      walletModal={walletModal} setWalletModal={setWalletModal}
      walletForm={walletForm} setWalletForm={setWalletForm}
      txns={txns} saveWallet={saveWallet} deleteWallet={deleteWallet}
      pressDown={pressDown} pressUp={pressUp} pressLeave={pressLeave}
    />
    <DeleteConfirm deleteId={deleteId} setDeleteId={setDeleteId} handleDelete={handleDelete}/>
    <CategoryModal
      catModal={catModal} setCatModal={setCatModal}
      categories={categories} catColors={catColors}
      txns={txns} addCategory={addCategory} deleteCategory={deleteCategory}
    />

    {toast&&(
      <div className="toast-el" style={{position:"fixed",top:62,right:14,background:P.surf,border:`2px solid ${P.accent}`,boxShadow:`3px 3px 0 ${P.accent}66`,padding:"8px 13px",fontSize:11,color:P.accent,zIndex:400,fontFamily:"'Courier New',monospace",letterSpacing:"0.04em"}}>
        {toast}
      </div>
    )}
    </div>
  );
}
