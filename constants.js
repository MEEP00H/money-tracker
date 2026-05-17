export const CATEGORIES = {
  income:  ["เงินเดือน","ฟรีแลนซ์","ลงทุน","โบนัส","ขายของ","อื่นๆ"],
  expense: ["อาหาร","เดินทาง","ช้อปปิ้ง","บิล/สาธารณูปโภค","บันเทิง","สุขภาพ","การศึกษา","อื่นๆ"],
};

export const CAT_COLORS = {
  "อาหาร":"#FFB800","เดินทาง":"#00CCFF","ช้อปปิ้ง":"#FF66CC",
  "บิล/สาธารณูปโภค":"#AA88FF","บันเทิง":"#00FF88","สุขภาพ":"#FF4466",
  "การศึกษา":"#00FFFF","เงินเดือน":"#00FF88","ฟรีแลนซ์":"#CC66FF",
  "ลงทุน":"#FF8800","โบนัส":"#FFE600","ขายของ":"#00FFCC","อื่นๆ":"#8888AA",
};

export const WALLET_ICONS  = ["💳","🏦","📈","💵","💰","🪙","💎","🎯","🛒","✈️","🏠","📱","🎓","🎁","🏋️","🍜","🎨","🚗"];
export const WALLET_COLORS = ["#FFE600","#00CCFF","#00FF88","#AA88FF","#FF66CC","#FF8800","#FF4466","#00FFFF","#FFB800","#00FFCC","#CC66FF","#88FF00"];
export const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

export const P = {
  bg:"#080810", surf:"#10101E", surf2:"#18182A", border:"#2A2A44",
  brite:"#3A3A5A", accent:"#FFE600", green:"#00FF88", red:"#FF4466",
  cyan:"#00CCFF", text:"#C8C8E8", muted:"#44446A",
};

export const SAMPLE_WALLETS = [
  {id:"w1",name:"กระเป๋าหลัก",icon:"💳",color:"#FFE600"},
  {id:"w2",name:"ออมทรัพย์",icon:"🏦",color:"#00CCFF"},
  {id:"w3",name:"ลงทุน",icon:"📈",color:"#00FF88"},
  {id:"w4",name:"เงินสด",icon:"💵",color:"#AA88FF"},
];

export const SAMPLE_TXNS = [
  {id:1,type:"income",amount:35000,category:"เงินเดือน",note:"เงินเดือนเดือนพฤษภา",date:"2026-05-01",walletId:"w1"},
  {id:2,type:"expense",amount:4200,category:"อาหาร",note:"ค่าอาหารสัปดาห์แรก",date:"2026-05-03",walletId:"w1"},
  {id:3,type:"expense",amount:1500,category:"เดินทาง",note:"ค่า BTS + Grab",date:"2026-05-05",walletId:"w4"},
  {id:4,type:"expense",amount:890,category:"บันเทิง",note:"Netflix + Spotify",date:"2026-05-06",walletId:"w1"},
  {id:5,type:"income",amount:8000,category:"ฟรีแลนซ์",note:"งาน Design UI",date:"2026-05-10",walletId:"w1"},
  {id:6,type:"expense",amount:3200,category:"ช้อปปิ้ง",note:"เสื้อผ้า",date:"2026-05-12",walletId:"w4"},
  {id:7,type:"expense",amount:1200,category:"สุขภาพ",note:"ค่ายิม",date:"2026-05-13",walletId:"w1"},
  {id:8,type:"transfer",amount:10000,note:"โอนเข้าออมทรัพย์",date:"2026-05-02",fromWalletId:"w1",toWalletId:"w2"},
  {id:9,type:"income",amount:500,category:"ลงทุน",note:"ปันผลหุ้น",date:"2026-05-08",walletId:"w3"},
  {id:10,type:"transfer",amount:5000,note:"ลงทุนเพิ่ม",date:"2026-05-09",fromWalletId:"w1",toWalletId:"w3"},
];
