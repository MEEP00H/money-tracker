import { MONTHS, CAT_COLORS } from "./constants";

export const fmt      = n => new Intl.NumberFormat("th-TH",{minimumFractionDigits:2}).format(n);
export const fmtShort = n => new Intl.NumberFormat("th-TH").format(Math.round(Math.abs(n)));
export const today    = () => new Date().toISOString().split("T")[0];
export const getCat   = name => CAT_COLORS[name] || "#8888AA";
export const currentYM  = () => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; };
export const monthLabel = ym => { const [y,m]=ym.split("-"); return `${MONTHS[+m-1]} ${+y+543}`; };
export const prevMonth  = ym => { const [y,m]=ym.split("-").map(Number); return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,"0")}`; };
export const nextMonth  = ym => { const [y,m]=ym.split("-").map(Number); return m===12?`${y+1}-01`:`${y}-${String(m+1).padStart(2,"0")}`; };
export const fmtDate    = d => { const dt=new Date(d); return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()+543}`; };

export function calcBalance(wid, txns) {
  return txns.reduce((b,t) => {
    if (t.type==="income"  && t.walletId===wid)     return b+t.amount;
    if (t.type==="expense" && t.walletId===wid)     return b-t.amount;
    if (t.type==="transfer"&& t.fromWalletId===wid) return b-t.amount;
    if (t.type==="transfer"&& t.toWalletId===wid)   return b+t.amount;
    return b;
  }, 0);
}
