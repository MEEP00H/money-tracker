import { MONTHS, CAT_COLORS } from "./constants";

export const fmt      = n => new Intl.NumberFormat("th-TH",{minimumFractionDigits:2}).format(n);
export const fmtShort = n => new Intl.NumberFormat("th-TH").format(Math.round(Math.abs(n)));
export const today    = () => new Date().toISOString().split("T")[0];
export const localToday = () => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; };
export const getCat   = name => CAT_COLORS[name] || "#8888AA";
export const currentYM  = () => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; };
export const monthLabel = ym => { const [y,m]=ym.split("-"); return `${MONTHS[+m-1]} ${+y+543}`; };
export const prevMonth  = ym => { const [y,m]=ym.split("-").map(Number); return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,"0")}`; };
export const nextMonth  = ym => { const [y,m]=ym.split("-").map(Number); return m===12?`${y+1}-01`:`${y}-${String(m+1).padStart(2,"0")}`; };
export const fmtDate    = d => { const dt=new Date(d); return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()+543}`; };

export const hexToRgb  = hex => `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
export const fmtCell   = n => n>=10000?`${Math.round(n/1000)}k`:n>=1000?`${(n/1000).toFixed(1)}k`:String(Math.round(n));

export function monthKeysBack(n, end = currentYM()) {
  const keys = [end];
  while (keys.length < n) keys.unshift(prevMonth(keys[0]));
  return keys;
}

export function monthlyTotals(txns, keys) {
  const idx = Object.fromEntries(keys.map((k,i)=>[k,i]));
  const rows = keys.map(k=>({key:k, name:MONTHS[+k.slice(5)-1], รายรับ:0, รายจ่าย:0}));
  txns.forEach(t=>{
    const i = idx[t.date.slice(0,7)];
    if (i===undefined) return;
    if (t.type==="income")  rows[i].รายรับ  += t.amount;
    if (t.type==="expense") rows[i].รายจ่าย += t.amount;
  });
  return rows;
}

export const perMonth = s => s.cycle==="yearly" ? s.amount/12 : s.cycle==="weekly" ? s.amount*52/12 : s.amount;

export function sortByLastUsed(wallets, txns) {
  const lastUsed = {};
  txns.forEach(t => {
    const ids = t.type === "transfer"
      ? [t.fromWalletId, t.toWalletId]
      : [t.walletId];
    ids.forEach(id => {
      if (!lastUsed[id] || t.date > lastUsed[id]) lastUsed[id] = t.date;
    });
  });
  return [...wallets].sort((a, b) => {
    const da = lastUsed[a.id] || "";
    const db = lastUsed[b.id] || "";
    return da < db ? 1 : da > db ? -1 : 0;
  });
}

export function calcBalance(wid, txns) {
  return txns.reduce((b,t) => {
    if (t.type==="income"  && t.walletId===wid)     return b+t.amount;
    if (t.type==="expense" && t.walletId===wid)     return b-t.amount;
    if (t.type==="transfer"&& t.fromWalletId===wid) return b-t.amount;
    if (t.type==="transfer"&& t.toWalletId===wid)   return b+t.amount;
    return b;
  }, 0);
}
