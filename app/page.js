'use client';

import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const VF_NUMBER  = "01065732515";
const ADMIN_USER = "admin";
const ADMIN_PASS = "bookin2026";
const T_COM      = 0.05;
const A_COM      = 0.025;

/* ═══════════════════════════════════════════
   INITIAL STATE (localStorage-backed)
═══════════════════════════════════════════ */
const DEFAULT_STATE = {
  listings:    [],   // شقق مسجلة من السماسرة
  hotels:      [],   // فنادق تنضم لاحقاً
  bookings:    [],   // حجوزات
  complaints:  [],   // شكاوى
  ads:         [],   // إعلانات
  agents:      [],   // حسابات سماسرة
  pendingAgents: [], // طلبات انضمام
};

function useStore() {
  const [store, setStore] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookin_store")) || DEFAULT_STATE; }
    catch { return DEFAULT_STATE; }
  });
  const save = (next) => {
    setStore(next);
    localStorage.setItem("bookin_store", JSON.stringify(next));
  };
  const update = (key, fn) => save({ ...store, [key]: fn(store[key]) });
  return { store, update, save };
}

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const C = {
  bg:    "#0a1628",
  bg2:   "#0d2040",
  card:  "#111e35",
  card2: "#0d1a2e",
  border:"rgba(56,189,248,.22)",
  blue:  "#38bdf8",
  blue2: "#1e6bb8",
  text:  "#e8f4fd",
  muted: "#64a8cc",
  sub:   "#94c8e8",
  green: "#22c55e",
  yellow:"#fbbf24",
  red:   "#ef4444",
  vf:    "#c8102e",
};

const S = {
  app:   { fontFamily:"'Cairo','Tajawal',sans-serif", direction:"rtl", minHeight:"100vh", background:`linear-gradient(145deg,${C.bg} 0%,${C.bg2} 100%)`, color:C.text },
  hdr:   { background:`linear-gradient(90deg,#0b1e3a,#1a4a7a)`, borderBottom:`2px solid ${C.blue2}`, position:"sticky", top:0, zIndex:200, boxShadow:"0 4px 24px rgba(0,0,0,.5)" },
  hIn:   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 18px", maxWidth:1000, margin:"0 auto" },
  logo:  { fontSize:19, fontWeight:900, color:"#fff", display:"flex", alignItems:"center", gap:6 },
  page:  { maxWidth:1000, margin:"0 auto", padding:"18px 14px" },
  hero:  { background:`linear-gradient(135deg,#1a4a7a,${C.bg2})`, borderRadius:18, padding:"26px 20px", marginBottom:18, textAlign:"center", border:`1px solid ${C.blue2}` },
  card:  { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10 },
  grid2: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))", gap:14 },
  inp:   { background:"rgba(255,255,255,.08)", border:`1px solid rgba(56,189,248,.35)`, borderRadius:9, padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", direction:"rtl", width:"100%" },
  sel:   { background:"#0d2a4e", border:`1px solid rgba(56,189,248,.35)`, borderRadius:9, padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", cursor:"pointer", width:"100%" },
  ta:    { background:"rgba(255,255,255,.08)", border:`1px solid rgba(56,189,248,.35)`, borderRadius:9, padding:"9px 12px", color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", direction:"rtl", width:"100%", resize:"vertical", minHeight:80 },
  btn:  (c,mt)=>({ width:"100%", background:c||`linear-gradient(135deg,${C.blue2},${C.blue})`, color:"#fff", border:"none", borderRadius:11, padding:"12px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", marginTop:mt||10 }),
  btnSm: { background:"rgba(255,255,255,.06)", color:C.sub, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  btnMd:(c)=>({ background:c||`linear-gradient(135deg,${C.blue2},${C.blue})`, color:"#fff", border:"none", borderRadius:9, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }),
  label: { fontSize:11, color:C.muted, marginBottom:4, display:"block" },
  row:   { display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid rgba(255,255,255,.06)`, fontSize:13 },
  badge:(c)=>({ background:`rgba(${c},.15)`, color:`rgb(${c})`, border:`1px solid rgba(${c},.35)`, borderRadius:18, padding:"2px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }),
  tab:  (a)=>({ flex:1, padding:"9px 3px", background:a?`linear-gradient(135deg,${C.blue2},${C.blue})`:"rgba(255,255,255,.04)", color:a?"#fff":C.sub, border:"none", borderRadius:9, fontFamily:"inherit", fontWeight:700, fontSize:11, cursor:"pointer" }),
  catTab:(a)=>({ flex:1, padding:"10px 4px", background:a?`linear-gradient(135deg,${C.blue2},${C.blue})`:"rgba(255,255,255,.05)", color:a?"#fff":C.sub, border:"none", borderRadius:10, fontFamily:"inherit", fontWeight:800, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }),
  noteR: { background:"rgba(239,68,68,.08)", border:"1.5px solid rgba(239,68,68,.4)", borderRadius:9, padding:11, fontSize:12, color:"#fca5a5", marginTop:8 },
  noteY: { background:"rgba(251,191,36,.08)", border:"1px solid rgba(251,191,36,.3)", borderRadius:9, padding:11, fontSize:12, color:"#fcd34d", marginTop:8 },
  noteG: { background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.3)", borderRadius:9, padding:11, fontSize:12, color:"#4ade80", marginTop:8 },
  upBx:  { border:"2px dashed rgba(56,189,248,.4)", borderRadius:12, padding:"18px 12px", textAlign:"center", cursor:"pointer", background:"rgba(56,189,248,.04)" },
  vfC:   { background:`linear-gradient(135deg,${C.vf},#e8001e)`, borderRadius:13, padding:"14px 18px", marginBottom:12, position:"relative", overflow:"hidden" },
  statB: { background:`linear-gradient(135deg,#1a3a6b,#0d2a4e)`, border:`1px solid ${C.border}`, borderRadius:12, padding:14, textAlign:"center", flex:1 },
  sep:   { height:1, background:`linear-gradient(90deg,transparent,${C.border},transparent)`, margin:"14px 0" },
  chip: (a)=>({ padding:"6px 13px", borderRadius:28, border:a?"none":`1.5px solid ${C.border}`, background:a?`linear-gradient(135deg,${C.blue2},${C.blue})`:"rgba(255,255,255,.04)", color:a?"#fff":C.sub, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }),
};

const FONT=`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e6bb8;border-radius:4px}input::placeholder,textarea::placeholder{color:rgba(148,200,232,.4)}input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1) brightness(.6)}select option{background:#0d2a4e}`;

/* ── helpers ── */
const uid  = () => Math.random().toString(36).slice(2,8).toUpperCase();
const now  = () => new Date().toLocaleString("ar-EG");
const calcT= (price,nights)=>{ const base=price*nights; const com=Math.round(base*T_COM); return {base,com,total:base+com}; };

/* ── status badge ── */
const STATUS = {
  pending:   { label:"قيد المراجعة", color:"251,191,36" },
  confirmed: { label:"مؤكد",         color:"34,197,94"  },
  rejected:  { label:"مرفوض",        color:"239,68,68"  },
  paid:      { label:"مدفوع",        color:"56,189,248" },
};
function Bdg({status}) {
  const s=STATUS[status]||STATUS.pending;
  return <span style={S.badge(s.color)}>{s.label}</span>;
}

/* ═══════════════════════════════════════════
   TERMS BOX
═══════════════════════════════════════════ */
function TermsBox() {
  return (
    <div style={{...S.noteR, borderColor:"rgba(239,68,68,.5)"}}>
      <div style={{fontWeight:900,fontSize:13,marginBottom:6}}>⚠️ الشروط والأحكام</div>
      {["🔴 العربون غير قابل للاسترداد في أي حال مهما كانت الأسباب.","🔴 عمولة الخدمة (5%) غير قابلة للاسترداد نهائياً.","🔴 الإلغاء أو التأجيل لا يُعيد أي مبلغ مدفوع.","🟡 رفع سكرين التحويل = موافقة تامة على الشروط."].map((t,i)=>(
        <div key={i} style={{fontSize:11,padding:"3px 0",borderBottom:i<3?"1px solid rgba(239,68,68,.12)":"none"}}>{t}</div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   BOOKING CONFIRMATION SYSTEM
═══════════════════════════════════════════ */
function BookingSystem({ booking, onAdminAction, isAdmin, agentId }) {
  // Show booking card with full status flow
  if (!booking) return null;
  const canConfirm = isAdmin && booking.status === "pending" && booking.screenshot;
  const isMyBooking = !isAdmin && booking.agentId === agentId;

  return (
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontWeight:800,color:C.blue,fontSize:14}}>#{booking.id}</div>
        <Bdg status={booking.status}/>
      </div>

      {/* Timeline */}
      <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center",fontSize:11,color:C.muted,flexWrap:"wrap"}}>
        {[
          {s:"pending",  icon:"📋", label:"تم الإرسال"},
          {s:"paid",     icon:"💳", label:"تم الدفع"},
          {s:"confirmed",icon:"✅", label:"مؤكد"},
        ].map((step,i)=>{
          const done = booking.status==="confirmed"||(booking.status==="paid"&&i<=1)||(booking.status==="pending"&&i===0);
          return (
            <div key={step.s} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:done?`linear-gradient(135deg,${C.blue2},${C.blue})`:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{step.icon}</div>
              <span style={{color:done?C.text:C.muted}}>{step.label}</span>
              {i<2&&<div style={{width:16,height:1,background:done?C.blue:C.border}}/>}
            </div>
          );
        })}
      </div>

      {[
        ["العقار",     booking.itemTitle],
        ["المستأجر",   booking.tenantName],
        ["الهاتف",     booking.tenantPhone],
        ["الرقم القومي",booking.natId],
        ["العربون",    `${booking.deposit?.toLocaleString()} ج.م`],
        ["الإجمالي",   `${booking.total?.toLocaleString()} ج.م`],
        ["التاريخ",    booking.createdAt],
      ].map(([k,v])=>v&&(
        <div key={k} style={S.row}><span style={{color:C.sub}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>
      ))}

      {booking.screenshot && (
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:5}}>📸 إثبات التحويل</div>
          <img src={booking.screenshot} alt="proof" style={{width:"100%",borderRadius:9,border:`1px solid ${C.border}`}}/>
        </div>
      )}

      {booking.adminNote && (
        <div style={{...S.noteY,marginTop:8}}>
          <span style={{fontWeight:700}}>ملاحظة الإدارة: </span>{booking.adminNote}
        </div>
      )}

      {canConfirm && (
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button style={{...S.btnMd(`linear-gradient(135deg,#16a34a,#22c55e)`),flex:1}} onClick={()=>onAdminAction(booking.id,"confirmed","تم تأكيد الحجز والدفع ✅")}>✅ تأكيد الحجز</button>
          <button style={{...S.btnMd(`linear-gradient(135deg,#991b1b,${C.red})`),flex:1}} onClick={()=>onAdminAction(booking.id,"rejected","تم رفض الطلب من قِبل الإدارة")}>❌ رفض</button>
        </div>
      )}

      {isMyBooking && booking.status==="confirmed" && (
        <div style={S.noteG}>✅ تم تأكيد هذا الحجز من قِبل الإدارة. يمكنك التواصل مع المستأجر على {booking.tenantPhone}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAYMENT FLOW (Client)
═══════════════════════════════════════════ */
function PayFlow({ item, nights, onSuccess, onBack }) {
  const [step,   setStep]   = useState(1);
  const [tenant, setTenant] = useState({});
  const [ss,     setSs]     = useState(null);
  const [agreed, setAgreed] = useState(false);
  const fRef = useRef(), pRef = useRef(), idRef = useRef();

  const price  = item?.price || item?.priceFrom || 0;
  const {base,com,total} = calcT(price, nights);
  const deposit = Math.round(total * 0.3);
  const readF = (f,key) => { if(!f)return; const r=new FileReader(); r.onload=e=>{ if(key==="ss") setSs(e.target.result); else setTenant(p=>({...p,[key]:e.target.result})); }; r.readAsDataURL(f); };
  const ok = tenant.name&&tenant.phone&&tenant.natId&&tenant.photo&&tenant.idImage;

  /* Step 1 */
  if(step===1) return (
    <div>
      <div style={{fontSize:15,fontWeight:900,marginBottom:14}}>👤 بيانات المستأجر</div>

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:12,background:"rgba(56,189,248,.05)",borderRadius:12,border:`1px solid ${C.border}`}}>
        <div style={{width:70,height:70,borderRadius:"50%",border:"2px dashed rgba(56,189,248,.5)",overflow:"hidden",cursor:"pointer",background:"rgba(56,189,248,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}} onClick={()=>pRef.current.click()}>
          {tenant.photo?<img src={tenant.photo} alt="p" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{textAlign:"center",fontSize:22}}>📷<div style={{fontSize:9,color:C.muted}}>صورة</div></div>}
        </div>
        <div><div style={{fontSize:12,color:C.sub}}>الصورة الشخصية *</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>صورة واضحة للوجه</div></div>
        <input ref={pRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readF(e.target.files[0],"photo")}/>
      </div>

      {[["الاسم الكامل *","name","text","أحمد محمد علي"],["رقم الهاتف *","phone","tel","01XXXXXXXXX"],["الرقم القومي * (14 رقم)","natId","text","رقم البطاقة الوطنية"],["البريد الإلكتروني","email","email","example@mail.com"]].map(([l,k,t,ph])=>(
        <div key={k} style={{marginBottom:9}}>
          <label style={S.label}>{l}</label>
          <input style={S.inp} type={t} placeholder={ph} value={tenant[k]||""} onChange={e=>setTenant(p=>({...p,[k]:e.target.value}))}/>
        </div>
      ))}

      <label style={S.label}>صورة الرقم القومي (وجهان) *</label>
      <div style={{...S.upBx,borderColor:tenant.idImage?"rgba(34,197,94,.5)":undefined}} onClick={()=>idRef.current.click()}>
        {tenant.idImage?<div><img src={tenant.idImage} alt="id" style={{maxWidth:"100%",maxHeight:120,borderRadius:8,marginBottom:5}}/><div style={{fontSize:12,color:C.green,fontWeight:700}}>✅ تم الرفع</div></div>:<div><div style={{fontSize:30,marginBottom:5}}>🪪</div><div style={{fontSize:13,color:C.sub}}>ارفع صورة الرقم القومي</div></div>}
        <input ref={idRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readF(e.target.files[0],"idImage")}/>
      </div>

      <TermsBox/>
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginTop:10,padding:"9px 12px",background:"rgba(56,189,248,.06)",border:`1px solid ${C.border}`,borderRadius:9}}>
        <input type="checkbox" id="ag" style={{marginTop:3,accentColor:C.blue}} checked={agreed} onChange={e=>setAgreed(e.target.checked)}/>
        <label htmlFor="ag" style={{fontSize:11,color:C.sub,cursor:"pointer",lineHeight:1.6}}>أقرّ بموافقتي التامة على الشروط والأحكام، وأعلم أن العربون والعمولة <strong style={{color:"#f87171"}}>غير قابلَين للاسترداد</strong>.</label>
      </div>
      <button style={{...S.btn(),opacity:ok&&agreed?1:.4}} disabled={!ok||!agreed} onClick={()=>setStep(2)}>التالي ← تعليمات الدفع</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={onBack}>رجوع</button>
    </div>
  );

  /* Step 2 */
  if(step===2) return (
    <div>
      <div style={{fontSize:15,fontWeight:900,marginBottom:14}}>💳 الدفع عبر فودافون كاش</div>
      <div style={S.vfC}>
        <div style={{position:"absolute",top:-15,left:-15,width:70,height:70,borderRadius:"50%",background:"rgba(255,255,255,.07)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10,position:"relative"}}>
          <span style={{fontSize:26}}>📱</span>
          <div><div style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>محفظة فودافون كاش</div><div style={{fontSize:21,fontWeight:900,color:"#fff",letterSpacing:2}}>{VF_NUMBER}</div></div>
        </div>
        <div style={{background:"rgba(0,0,0,.22)",borderRadius:8,padding:"9px 12px"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>العربون المطلوب (30%)</div>
          <div style={{fontSize:21,fontWeight:900,color:"#fff"}}>{deposit.toLocaleString()} <span style={{fontSize:12}}>ج.م</span></div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>الإجمالي الكامل: {total.toLocaleString()} ج.م</div>
        </div>
      </div>

      <div style={{background:"rgba(56,189,248,.07)",border:`1px solid ${C.border}`,borderRadius:11,padding:13,marginBottom:12}}>
        {[["العقار",item?.title],["الإيجار الأساسي",`${base.toLocaleString()} ج.م`],["عمولة 5%",`+ ${com.toLocaleString()} ج.م`],["الإجمالي",`${total.toLocaleString()} ج.م`],["العربون الآن",`${deposit.toLocaleString()} ج.م`]].map(([k,v],i)=>(
          <div key={k} style={{...S.row,color:i>=3?C.blue:C.text,fontWeight:i>=3?800:400}}>
            <span style={{color:i===2?C.yellow:C.sub}}>{k}</span><span>{v}</span>
          </div>
        ))}
      </div>

      <div style={S.noteR}>🔴 العربون ({deposit.toLocaleString()} ج.م) وعمولة الخدمة ({com.toLocaleString()} ج.م) <strong>غير قابلَين للاسترداد</strong> نهائياً.</div>

      <div style={{marginTop:12}}>
        {[`افتح فودافون كاش`,`اختر "تحويل" — الرقم: ${VF_NUMBER}`,`ادخل: ${deposit.toLocaleString()} ج.م`,`الملاحظة: ${tenant.name} / حجز BookIN`,`خد سكرين وارفعه في الخطوة الجاية`].map((t,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",borderRadius:9,background:i===0?"rgba(56,189,248,.1)":"rgba(255,255,255,.03)",border:`1px solid ${i===0?C.blue:C.border}`,marginBottom:6}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:i===0?`linear-gradient(135deg,${C.blue2},${C.blue})`:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#fff",flexShrink:0}}>{i+1}</div>
            <span style={{fontSize:12,color:i===0?C.text:C.sub}}>{t}</span>
          </div>
        ))}
      </div>
      <button style={S.btn()} onClick={()=>setStep(3)}>📸 ارفع سكرين التحويل</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={()=>setStep(1)}>رجوع</button>
    </div>
  );

  /* Step 3 */
  if(step===3) return (
    <div>
      <div style={{fontSize:15,fontWeight:900,marginBottom:14}}>📸 إثبات التحويل</div>
      <div style={{...S.upBx,borderColor:ss?"rgba(34,197,94,.5)":undefined}} onClick={()=>fRef.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();readF(e.dataTransfer.files[0],"ss");}}>
        {ss?<div><img src={ss} alt="ss" style={{maxWidth:"100%",maxHeight:200,borderRadius:10,marginBottom:7}}/><div style={{fontSize:12,color:C.green,fontWeight:700}}>✅ تم الرفع — اضغط للتغيير</div></div>
           :<div><div style={{fontSize:36,marginBottom:7}}>📲</div><div style={{fontSize:13,fontWeight:700,color:C.sub}}>اضغط أو اسحب السكرين هنا</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>JPG / PNG</div></div>}
        <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readF(e.target.files[0],"ss")}/>
      </div>
      <div style={S.noteY}>⚠️ السكرين يجب أن يُظهر: الرقم ({VF_NUMBER})، المبلغ، والتاريخ</div>
      <button style={{...S.btn(),opacity:ss?1:.4}} disabled={!ss} onClick={()=>setStep(4)}>التالي ← مراجعة الطلب</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={()=>setStep(2)}>رجوع</button>
    </div>
  );

  /* Step 4 — review */
  if(step===4) return (
    <div>
      <div style={{fontSize:15,fontWeight:900,marginBottom:14}}>✅ مراجعة وتأكيد</div>
      <div style={S.card}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          {tenant.photo&&<img src={tenant.photo} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:`2px solid ${C.blue}`}}/>}
          <div><div style={{fontWeight:800,fontSize:14}}>{tenant.name}</div><div style={{fontSize:11,color:C.muted}}>{tenant.phone}</div></div>
        </div>
        {[["الرقم القومي",tenant.natId],["البريد",tenant.email||"—"],["العقار",item?.title],["العربون",`${deposit.toLocaleString()} ج.م`],["الإجمالي",`${total.toLocaleString()} ج.م`]].map(([k,v])=>(
          <div key={k} style={S.row}><span style={{color:C.sub}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>
        ))}
        {tenant.idImage&&<img src={tenant.idImage} alt="id" style={{width:"100%",borderRadius:8,marginTop:8,border:`1px solid ${C.border}`}}/>}
      </div>
      <div style={S.card}>
        <div style={{fontSize:12,color:C.blue,fontWeight:700,marginBottom:7}}>📸 إثبات التحويل</div>
        <img src={ss} alt="ss" style={{width:"100%",borderRadius:9,border:`1px solid ${C.border}`}}/>
      </div>
      <TermsBox/>
      <button style={S.btn(`linear-gradient(135deg,#16a34a,#22c55e)`)} onClick={()=>onSuccess({tenant,ss,deposit,total,base,com})}>🎉 تأكيد وإرسال الحجز</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={()=>setStep(3)}>رجوع للتعديل</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REGISTER AGENT FORM
═══════════════════════════════════════════ */
function AgentRegister({ onBack, onSubmit }) {
  const [f,setF]=useState({});
  const ok=f.name&&f.phone&&f.pass&&f.office&&f.natId;
  return (
    <div>
      <div style={{fontSize:16,fontWeight:900,marginBottom:14}}>🏢 انضم كسمسار / مكتب تأجير</div>
      {[["اسم المكتب / الشركة *","office","text","مكتب النيل للإيجارات"],["اسم المسؤول *","name","text","أحمد محمد"],["رقم الهاتف *","phone","tel","01XXXXXXXXX"],["الرقم القومي *","natId","text","رقم البطاقة"],["البريد الإلكتروني","email","email",""],["كلمة المرور *","pass","password",""]].map(([l,k,t,ph])=>(
      <div key={k} style={{marginBottom:9}}><label style={S.label}>{l}</label><input style={S.inp} type={t} placeholder={ph} value={f[k]||""} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/></div>
      ))}
      <div style={S.noteY}>💡 سيتم مراجعة طلبك من قِبل الإدارة وتفعيل حسابك خلال 24 ساعة</div>
      <button style={{...S.btn(),opacity:ok?1:.4}} disabled={!ok} onClick={()=>onSubmit(f)}>📤 إرسال طلب الانضمام</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={onBack}>رجوع</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADD LISTING FORM (Agent)
══════════════════════════════���════════════ */
function AddListing({ agentId, agentName, cat, onSave, onBack }) {
  const [f,setF]=useState({type: cat==="hotels"?"فندق":"شقة"});
  const ok = f.title&&f.location&&f.price;
  const TYPES_APT   = ["شقة","شاليه","فيلا","استوديو"];
  const TYPES_HOTEL = ["فندق","بنسيون","شاليهات فندقية","ريزورت"];
  const types = cat==="hotels"?TYPES_HOTEL:TYPES_APT;
  const locs  = ["راس البر - الكورنيش","راس البر - المنتزه","راس البر - لسان راس البر","راس البر - شارع النيل","دمياط الجديدة - المحور المركزي","دمياط الجديدة - الحي السياحي","دمياط الجديدة - حي الأندلس","دمياط الجديدة - شارع الجمهورية"];
  return (
    <div>
      <div style={{fontSize:15,fontWeight:900,marginBottom:14}}>➕ إضافة {cat==="hotels"?"فندق":"وحدة سكنية"} جديدة</div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <div style={{flex:1}}><label style={S.label}>النوع *</label><select style={S.sel} value={f.type||""} onChange={e=>setF(p=>({...p,type:e.target.value}))}>{types.map(t=><option key={t}>{t}</option>)}</select></div>
        {cat==="hotels"&&<div style={{width:80}}><label style={S.label}>النجوم</label><select style={S.sel} value={f.stars||"3"} onChange={e=>setF(p=>({...p,stars:e.target.value}))}>{["2","3","4","5"].map(s=><option key={s}>{s}</option>)}</select></div>}
      </div>
      <div style={{marginBottom:9}}><label style={S.label}>الاسم / العنوان *</label><input style={S.inp} placeholder={cat==="hotels"?"فندق راس البر بيتش":"شقة فاخرة بإطلالة البحر"} value={f.title||""} onChange={e=>setF(p=>({...p,title:e.target.value}))}/></div>
      <div style={{marginBottom:9}}><label style={S.label}>الموقع *</label><select style={S.sel} value={f.location||""} onChange={e=>setF(p=>({...p,location:e.target.value}))}><option value="">اختر المنطقة</option>{locs.map(l=><option key={l}>{l}</option>)}</select></div>
      <div style={{display:"flex",gap:8,marginBottom:9}}>
        <div style={{flex:1}}><label style={S.label}>السعر/ليلة ج.م *</label><input style={S.inp} type="number" placeholder="500" value={f.price||""} onChange={e=>setF(p=>({...p,price:e.target.value}))}/></div>
        <div style={{flex:1}}><label style={S.label}>عدد الغرف</label><input style={S.inp} type="number" placeholder="2" value={f.rooms||""} onChange={e=>setF(p=>({...p,rooms:e.target.value}))}/></div>
        {cat!=="hotels"&&<div style={{flex:1}}><label style={S.label}>المساحة م²</label><input style={S.inp} type="number" placeholder="80" value={f.area||""} onChange={e=>setF(p=>({...p,area:e.target.value}))}/></div>}
      </div>
      <div style={{marginBottom:9}}><label style={S.label}>المميزات (مفصولة بفاصلة)</label><input style={S.inp} placeholder="واي فاي, تكييف, موقف سيارة" value={f.features||""} onChange={e=>setF(p=>({...p,features:e.target.value}))}/></div>
      <div style={{marginBottom:9}}><label style={S.label}>وصف إضافي</label><textarea style={S.ta} placeholder="اكتب وصفاً مختصراً..." value={f.desc||""} onChange={e=>setF(p=>({...p,desc:e.target.value}))}/></div>
      <div style={S.noteY}>💡 عمولة المنصة <strong>2.5%</strong> على كل حجز مؤكد — غير قابلة للاسترداد</div>
      <button style={{...S.btn(`linear-gradient(135deg,#16a34a,#22c55e)`),opacity:ok?1:.4}} disabled={!ok} onClick={()=>onSave({...f,id:uid(),agentId,agentName,cat,available:true,price:+f.price,rooms:+f.rooms||1,createdAt:now(),pendingApproval:true})}>📤 إرسال للإدارة للمراجعة</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={onBack}>رجوع</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPLAINT FORM
═══════════════════════════════════════════ */
function ComplaintForm({ onSubmit, onBack }) {
  const [f,setF]=useState({});
  const ok=f.name&&f.phone&&f.subject&&f.message;
  return (
    <div>
      <div style={{fontSize:16,fontWeight:900,marginBottom:14}}>📢 تقديم شكوى أو اقتراح</div>
      {[["الاسم *","name","text","اسمك الكامل"],["رقم الهاتف *","phone","tel","01XXXXXXXXX"],["رقم الحجز (إن وجد)","bookingId","text","BK-XXXXXX"]].map(([l,k,t,ph])=>(
        <div key={k} style={{marginBottom:9}}><label style={S.label}>{l}</label><input style={S.inp} type={t} placeholder={ph} value={f[k]||""} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/></div>
      ))}
      <div style={{marginBottom:9}}>
        <label style={S.label}>نوع الشكوى *</label>
        <select style={S.sel} value={f.subject||""} onChange={e=>setF(p=>({...p,subject:e.target.value}))}>
          <option value="">اختر نوع الشكوى</option>
          {["مشكلة في الحجز","مشكلة في الدفع","شكوى على سمسار","شكوى على العقار","اقتراح","أخرى"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{marginBottom:9}}><label style={S.label}>تفاصيل الشكوى *</label><textarea style={S.ta} placeholder="اشرح مشكلتك بالتفصيل..." value={f.message||""} onChange={e=>setF(p=>({...p,message:e.target.value}))}/></div>
      <button style={{...S.btn(),opacity:ok?1:.4}} disabled={!ok} onClick={()=>onSubmit({...f,id:uid(),status:"open",createdAt:now()})}>📤 إرسال الشكوى</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={onBack}>رجوع</button>
    </div>
  );
}

/* ══════════════════════════════════════��════
   AD FORM
═══════════════════════════════════════════ */
function AdForm({ onSubmit, onBack }) {
  const [f,setF]=useState({});
  const ok=f.title&&f.phone&&f.category&&f.desc;
  const imgRef=useRef();
  return (
    <div>
      <div style={{fontSize:16,fontWeight:900,marginBottom:14}}>📣 إضافة إعلان</div>
      <div style={{marginBottom:9}}>
        <label style={S.label}>فئة الإعلان *</label>
        <select style={S.sel} value={f.category||""} onChange={e=>setF(p=>({...p,category:e.target.value}))}>
          <option value="">اختر الفئة</option>
          {["☕ كافيه","🍽️ مطعم","🎮 ترفيه","🏄 رياضة مائية","🛒 متجر","🚗 تأجير سيارات","🌿 منتجع صحي","🎪 فعالية","📦 خدمات أخرى"].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      {[["اسم المكان / الخدمة *","title","text",""],["رقم التواصل *","phone","tel",""],["الموقع","location","text",""],["الوصف *","desc","textarea","اكتب وصفاً جذاباً..."]].map(([l,k,t,ph])=>(
        <div key={k} style={{marginBottom:9}}><label style={S.label}>{l}</label>
          {t==="textarea"?<textarea style={S.ta} placeholder={ph} value={f[k]||""} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/>
          :<input style={S.inp} type={t} placeholder={ph} value={f[k]||""} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/>}
        </div>
      ))}
      <div style={{marginBottom:9}}>
        <label style={S.label}>صورة الإعلان (اختياري)</label>
        <div style={{...S.upBx,borderColor:f.image?"rgba(34,197,94,.5)":undefined}} onClick={()=>imgRef.current.click()}>
          {f.image?<div><img src={f.image} alt="" style={{maxWidth:"100%",maxHeight:120,borderRadius:8,marginBottom:5}}/><div style={{fontSize:12,color:C.green}}>✅ تم الرفع</div></div>
          :<div><div style={{fontSize:28,marginBottom:5}}>🖼️</div><div style={{fontSize:12,color:C.sub}}>ارفع صورة الإعلان</div></div>}
          <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{ const r=new FileReader(); r.onload=ev=>setF(p=>({...p,image:ev.target.result})); r.readAsDataURL(e.target.files[0]); }}/>
        </div>
      </div>
      <div style={S.noteY}>💡 سيتم مراجعة إعلانك من قِبل الإدارة قبل نشره</div>
      <button style={{...S.btn(),opacity:ok?1:.4}} disabled={!ok} onClick={()=>onSubmit({...f,id:uid(),status:"pending",createdAt:now()})}>📤 إرسال للمراجعة</button>
      <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={onBack}>رجوع</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function BookInApp() {
  const {store,update,save} = useStore();
  const [mode,      setMode]      = useState("home");   // home|client|agent|admin|complaint|ads
  const [subMode,   setSubMode]   = useState("browse"); // browse|detail|pay|register|add|success|adform
  const [category,  setCategory]  = useState("apartments");
  const [selItem,   setSelItem]   = useState(null);
  const [typeF,     setTypeF]     = useState("الكل");
  const [locF,      setLocF]      = useState("الكل");
  const [checkIn,   setCheckIn]   = useState("");
  const [checkOut,  setCheckOut]  = useState("");
  const [agentData, setAgentData] = useState(null);  // logged-in agent
  const [agTab,     setAgTab]     = useState("listings");
  const [adminTab,  setAdminTab]  = useState("bookings");
  const [bookRes,   setBookRes]   = useState(null);
  const [nights,    setNights]    = useState(3);
  const [agLogin,   setAgLogin]   = useState({});
  const [loginErr,  setLoginErr]  = useState("");

  useEffect(()=>{
    if(checkIn&&checkOut) setNights(Math.max(1,Math.round((new Date(checkOut)-new Date(checkIn))/86400000)));
  },[checkIn,checkOut]);

  /* ── admin actions ── */
  const adminAction = (bookingId, status, note) => {
    update("bookings", bs => bs.map(b => b.id===bookingId ? {...b,status,adminNote:note,updatedAt:now()} : b));
  };

  /* ── agent login ── */
  const handleAgentLogin = () => {
    const agent = store.agents.find(a => a.phone===agLogin.phone && a.pass===agLogin.pass);
    if(agent){ setAgentData(agent); setSubMode("dashboard"); setLoginErr(""); }
    else setLoginErr("رقم الهاتف أو كلمة المرور غير صحيحة");
  };

  /* ── filter listings ── */
  const approvedListings = store.listings.filter(l=>!l.pendingApproval);
  const approvedHotels   = store.hotels.filter(h=>!h.pendingApproval);
  const fApts   = approvedListings.filter(l=>(typeF==="الكل"||l.type===typeF)&&(locF==="الكل"||(locF==="راس البر"?l.location?.includes("راس البر"):l.location?.includes("دمياط"))));
  const fHotels = approvedHotels.filter(h=>(locF==="الكل"||(locF==="راس البر"?h.location?.includes("راس البر"):h.location?.includes("دمياط"))));
  const items   = category==="hotels" ? fHotels : fApts;

  /* ── submit booking ── */
  const submitBooking = ({tenant,ss,deposit,total,base,com}) => {
    const bk = {
      id: uid(), itemId:selItem?.id, itemTitle:selItem?.title, agentId:selItem?.agentId,
      tenantName:tenant.name, tenantPhone:tenant.phone, natId:tenant.natId,
      tenantEmail:tenant.email, tenantPhoto:tenant.photo, tenantId:tenant.idImage,
      screenshot:ss, deposit, total, base, com,
      status:"pending", createdAt:now(),
    };
    update("bookings", bs=>[...bs,bk]);
    setBookRes(bk);
    setSubMode("success");
  };

  /* ── Header ── */
  function Header({right}) {
    return (
      <div style={S.hdr}><div style={S.hIn}>
        <div style={S.logo} onClick={()=>{setMode("home");setSubMode("browse");}} >🏖️ Book<span style={{color:C.blue}}>IN</span></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {right}
          {mode==="home"&&<button style={S.btnSm} onClick={()=>setMode("complaint")}>📢 شكوى</button>}
          {mode==="home"&&<button style={S.btnSm} onClick={()=>setMode("ads")}>📣 إعلانات</button>}
        </div>
      </div></div>
    );
  }

  /* ════════ HOME ════════ */
  if(mode==="home") return (
    <div style={S.app}><style>{FONT}</style>
      <Header/>
      <div style={S.page}>
        <div style={{...S.hero,marginBottom:22}}>
          <div style={{fontSize:38,marginBottom:7}}>🌊🏖️🏨</div>
          <div style={{fontSize:24,fontWeight:900,color:"#fff",marginBottom:5}}>BookIN — راس البر ودمياط الجديدة</div>
          <div style={{fontSize:13,color:C.sub,marginBottom:14}}>منصة الإيجارات والفنادق الأولى في المنطقة</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            {["💳 دفع فودافون كاش","✅ تأكيد فوري","🔒 بيانات آمنة","📢 عمولة شفافة"].map(t=>(
              <span key={t} style={{background:"rgba(56,189,248,.1)",border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 14px",fontSize:12,color:C.blue}}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{fontSize:15,fontWeight:900,marginBottom:12}}>اختر نوع حسابك</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
          {[
            {icon:"👤",title:"مستأجر",sub:"ابحث عن شقة أو غرفة فندقية",note:"عمولة 5% على الحجز",fn:()=>{setMode("client");setSubMode("browse");}},
            {icon:"🏢",title:"سمسار / مكتب",sub:"أضف عقاراتك وأدر حجوزاتك",note:"عمولة 2.5% على الإيجار",fn:()=>{setMode("agent");setSubMode(agentData?"dashboard":"login");}},
            {icon:"🏨",title:"فندق / منشأة",sub:"اعلن عن فندقك وغرفك",note:"انضم للمنصة الآن",fn:()=>{setMode("agent");setSubMode(agentData?"dashboard":"login");}},
            {icon:"🔐",title:"لوحة الإدارة",sub:"إدارة الموقع والحجوزات",note:"للمسؤول فقط",fn:()=>setMode("admin")},
          ].map(r=>(
            <div key={r.title} style={{...S.card,flex:1,minWidth:155,textAlign:"center",cursor:"pointer",transition:"all .2s"}}
              onClick={r.fn}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";}}
            >
              <div style={{fontSize:36,marginBottom:8}}>{r.icon}</div>
              <div style={{fontSize:14,fontWeight:900,marginBottom:4}}>{r.title}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{r.sub}</div>
              <div style={{fontSize:11,color:C.yellow}}>{r.note}</div>
            </div>
          ))}
        </div>

        {/* Vodafone */}
        <div style={{...S.card,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
          <div style={{background:`linear-gradient(135deg,${C.vf},#e8001e)`,borderRadius:10,padding:"9px 16px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>📱</span>
            <div><div style={{fontSize:13,fontWeight:900,color:"#fff"}}>فودافون كاش</div><div style={{fontSize:12,color:"rgba(255,255,255,.8)",letterSpacing:1}}>{VF_NUMBER}</div></div>
          </div>
          <div style={{fontSize:12,color:C.muted}}>جميع المدفوعات عبر فودافون كاش مع إثبات التحويل ✅</div>
        </div>

        <div style={S.noteR}>🔴 العربون وعمولة الخدمة <strong>غير قابلَين للاسترداد</strong> في جميع الأحوال.</div>

        {/* Quick Ads preview */}
        {store.ads.filter(a=>a.status==="approved").length>0&&(
          <div style={{marginTop:16}}>
            <div style={{fontSize:14,fontWeight:900,marginBottom:10}}>📣 إعلانات المنطقة</div>
            <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6}}>
              {store.ads.filter(a=>a.status==="approved").map(ad=>(
                <div key={ad.id} style={{...S.card,minWidth:180,flexShrink:0}}>
                  {ad.image&&<img src={ad.image} alt="" style={{width:"100%",height:80,objectFit:"cover",borderRadius:9,marginBottom:8}}/>}
                  <div style={{fontSize:12,color:C.blue,fontWeight:700}}>{ad.category}</div>
                  <div style={{fontSize:13,fontWeight:800,marginBottom:3}}>{ad.title}</div>
                  <div style={{fontSize:11,color:C.muted}}>{ad.desc?.slice(0,60)}...</div>
                  <div style={{fontSize:11,color:C.yellow,marginTop:5}}>📞 {ad.phone}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ════════ COMPLAINTS ════════ */
  if(mode==="complaint") return (
    <div style={S.app}><style>{FONT}</style>
      <Header right={<button style={S.btnSm} onClick={()=>setMode("home")}>← رجوع</button>}/>
      <div style={S.page}>
        {subMode==="success_complaint"
          ?<div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:60,marginBottom:12}}>📨</div>
            <div style={{fontSize:20,fontWeight:900,color:C.green,marginBottom:8}}>تم إرسال شكواك!</div>
            <div style={{fontSize:13,color:C.sub,marginBottom:16}}>ستقوم الإدارة بمراجعتها والرد عليك خلال 24 ساعة</div>
            <button style={S.btn()} onClick={()=>{setMode("home");setSubMode("browse");}}>🏠 العودة للرئيسية</button>
          </div>
          :<ComplaintForm onBack={()=>setMode("home")} onSubmit={c=>{update("complaints",cs=>[...cs,c]);setSubMode("success_complaint");}}/>
        }
      </div>
    </div>
  );

  /* ════════ ADS PAGE ════════ */
  if(mode==="ads") return (
    <div style={S.app}><style>{FONT}</style>
      <Header right={<button style={S.btnSm} onClick={()=>setMode("home")}>← رجوع</button>}/>
      <div style={S.page}>
        {subMode==="adform"
          ?<AdForm onBack={()=>setSubMode("browse")} onSubmit={ad=>{update("ads",as=>[...as,ad]);setSubMode("adsuccess");}}/>
          :subMode==="adsuccess"
          ?<div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:60,marginBottom:12}}>🎉</div>
            <div style={{fontSize:20,fontWeight:900,color:C.green,marginBottom:8}}>تم إرسال إعلانك!</div>
            <div style={{fontSize:13,color:C.sub,marginBottom:16}}>سيتم مراجعته ونشره خلال 24 ساعة</div>
            <button style={S.btn()} onClick={()=>{setMode("home");setSubMode("browse");}}>🏠 العودة</button>
          </div>
          :<div>
            <div style={{...S.hero,padding:"20px",marginBottom:16}}>
              <div style={{fontSize:28,marginBottom:6}}>📣</div>
              <div style={{fontSize:19,fontWeight:900,color:"#fff",marginBottom:4}}>إعلانات المنطقة</div>
              <div style={{fontSize:12,color:C.sub}}>كافيهات • مطاعم • خدمات ترفيهية • وأكثر</div>
            </div>
            <button style={S.btn(`linear-gradient(135deg,#92400e,#f59e0b)`)} onClick={()=>setSubMode("adform")}>📣 أضف إعلانك هنا</button>
            <div style={{height:12}}/>
            {["☕ كافيه","🍽️ مطعم","🎮 ترفيه","🏄 رياضة مائية","🚗 تأجير سيارات","📦 خدمات أخرى"].map(cat=>{
              const catAds=store.ads.filter(a=>a.status==="approved"&&a.category===cat);
              if(!catAds.length) return null;
              return (
                <div key={cat} style={{marginBottom:16}}>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:9,color:C.blue}}>{cat}</div>
                  <div style={S.grid2}>
                    {catAds.map(ad=>(
                      <div key={ad.id} style={S.card}>
                        {ad.image&&<img src={ad.image} alt="" style={{width:"100%",height:100,objectFit:"cover",borderRadius:9,marginBottom:9}}/>}
                        <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>{ad.title}</div>
                        {ad.location&&<div style={{fontSize:11,color:C.muted,marginBottom:5}}>📍 {ad.location}</div>}
                        <div style={{fontSize:12,color:C.sub,marginBottom:8}}>{ad.desc}</div>
                        <div style={{fontSize:13,color:C.yellow,fontWeight:700}}>📞 {ad.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {store.ads.filter(a=>a.status==="approved").length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
                <div style={{fontSize:40,marginBottom:10}}>📭</div>
                <div>لا توجد إعلانات حتى الآن</div>
                <div style={{fontSize:12,marginTop:6}}>كن أول من يُعلن في المنطقة!</div>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );

  /* ════════ CLIENT ════════ */
  if(mode==="client") {
    if(subMode==="success"&&bookRes) return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<button style={S.btnSm} onClick={()=>{setMode("home");setSubMode("browse");}}>🏠 الرئيسية</button>}/>
        <div style={S.page}>
          <div style={{textAlign:"center",padding:"30px 0"}}>
            <div style={{fontSize:66,marginBottom:10}}>🎉</div>
            <div style={{fontSize:21,fontWeight:900,color:C.green,marginBottom:7}}>تم إرسال طلب الحجز!</div>
            <div style={{fontSize:13,color:C.sub,marginBottom:16}}>مرحباً <strong style={{color:"#fff"}}>{bookRes.tenantName}</strong></div>
            <div style={S.card}>
              {[["🏷️ رقم الحجز",bookRes.id,C.blue],["🏠 العقار",bookRes.itemTitle,"#fff"],["💰 العربون",`${bookRes.deposit?.toLocaleString()} ج.م`,C.yellow],["📊 الحالة","قيد المراجعة",C.yellow]].map(([k,v,c])=>(
                <div key={k} style={S.row}><span style={{color:C.sub}}>{k}</span><span style={{fontWeight:700,color:c}}>{v}</span></div>
              ))}
            </div>
            <div style={S.noteG}>✅ ستتلقى تأكيداً على رقم {bookRes.tenantPhone} خلال 30 دقيقة</div>
            <div style={S.noteR}>🔴 العربون وعمولة الخدمة غير قابلَين للاسترداد نهائياً.</div>
            <button style={{...S.btn(),marginTop:14}} onClick={()=>{setMode("home");setSubMode("browse");setBookRes(null);}}>🏠 العودة</button>
          </div>
        </div>
      </div>
    );

    if(subMode==="pay") return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<button style={S.btnSm} onClick={()=>setSubMode("detail")}>← رجوع</button>}/>
        <div style={S.page}><PayFlow item={selItem} nights={nights} onSuccess={submitBooking} onBack={()=>setSubMode("detail")}/></div>
      </div>
    );

    if(subMode==="detail"&&selItem) return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<button style={S.btnSm} onClick={()=>setSubMode("browse")}>← رجوع</button>}/>
        <div style={S.page}>
          <div style={{...S.hero,textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:52,marginBottom:7}}>{selItem.emoji||"🏠"}</div>
            <div style={{fontSize:19,fontWeight:900}}>{selItem.title}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>📍 {selItem.location}</div>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:10,fontSize:12,color:C.sub,flexWrap:"wrap"}}>
              {selItem.rooms&&<span>🛏 {selItem.rooms} غرف</span>}
              {selItem.area&&<span>📐 {selItem.area} م²</span>}
              <span style={{color:C.blue,fontWeight:800}}>{selItem.price?.toLocaleString()} ج.م/ليلة</span>
            </div>
          </div>

          {selItem.features&&<div style={{marginBottom:14}}>{selItem.features.split(",").map(f=><span key={f} style={{background:"rgba(56,189,248,.09)",border:`1px solid ${C.border}`,color:C.blue,borderRadius:7,padding:"3px 9px",fontSize:11,display:"inline-block",margin:3}}>{f.trim()}</span>)}</div>}
          {selItem.desc&&<div style={{...S.card,fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:14}}>{selItem.desc}</div>}

          <div style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,marginBottom:8}}>📅 مواعيد الإقامة</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[["الوصول",checkIn,setCheckIn],["المغادرة",checkOut,setCheckOut]].map(([l,v,set])=>(
                <div key={l} style={{flex:1,minWidth:120}}><label style={S.label}>{l}</label><input type="date" style={S.inp} value={v} onChange={e=>set(e.target.value)}/></div>
              ))}
            </div>
          </div>

          {(()=>{const{base,com,total}=calcT(selItem.price,nights);return(
            <div style={{...S.card,marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:9}}>💰 التكلفة ({nights} ليلة)</div>
              {[["الإيجار الأساسي",`${base.toLocaleString()} ج.م`,""],["عمولة الخدمة 5%",`+ ${com.toLocaleString()} ج.م`,C.yellow]].map(([k,v,c])=>(
                <div key={k} style={S.row}><span style={{color:C.sub}}>{k}</span><span style={{color:c||C.text}}>{v}</span></div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:9,borderTop:`2px solid rgba(56,189,248,.2)`,marginTop:3}}>
                <span style={{fontWeight:900}}>الإجمالي</span>
                <span style={{fontWeight:900,fontSize:17,color:C.blue}}>{total.toLocaleString()} ج.م</span>
              </div>
            </div>
          );})()}

          <div style={{...S.card,background:`linear-gradient(135deg,#0d1e38,#0a1628)`,marginBottom:12}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:3}}>السمسار / المكتب</div>
            <div style={{fontWeight:800}}>{selItem.agentName}</div>
          </div>

          <TermsBox/>
          <button style={S.btn()} onClick={()=>setSubMode("pay")}>💳 احجز الآن — فودافون كاش {VF_NUMBER}</button>
          <button style={{...S.btn("rgba(255,255,255,.05)",8)}} onClick={()=>setSubMode("browse")}>رجوع</button>
        </div>
      </div>
    );

    /* Browse */
    return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<button style={S.btnSm} onClick={()=>setMode("home")}>← الرئيسية</button>}/>
        <div style={S.page}>
          <div style={S.hero}>
            <div style={{fontSize:22,fontWeight:900,marginBottom:5}}>ابحث عن إقامتك 🌊</div>
            <div style={{fontSize:12,color:C.sub,marginBottom:14}}>شقق وفنادق في راس البر ودمياط</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              <select style={{...S.sel,width:"auto"}} value={locF} onChange={e=>setLocF(e.target.value)}>
                <option value="الكل">📍 كل المناطق</option>
                <option value="راس البر">🏖️ راس البر</option>
                <option value="دمياط الجديدة">🏢 دمياط الجديدة</option>
              </select>
              <input type="date" style={{...S.inp,width:"auto",minWidth:120}} value={checkIn} onChange={e=>setCheckIn(e.target.value)}/>
              <input type="date" style={{...S.inp,width:"auto",minWidth:120}} value={checkOut} onChange={e=>setCheckOut(e.target.value)}/>
            </div>
          </div>

          <div style={{display:"flex",gap:7,marginBottom:14,background:"rgba(255,255,255,.03)",borderRadius:11,padding:3}}>
            <button style={S.catTab(category==="apartments")} onClick={()=>setCategory("apartments")}>🏠 شقق وشاليهات</button>
            <button style={S.catTab(category==="hotels")} onClick={()=>setCategory("hotels")}>🏨 فنادق وغرف</button>
          </div>

          {category==="apartments"&&(
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {["الكل","شقة","شاليه","فيلا","استوديو"].map(f=><button key={f} style={S.chip(typeF===f)} onClick={()=>setTypeF(f)}>{f}</button>)}
            </div>
          )}

          {items.length===0?(
            <div style={{textAlign:"center",padding:"50px 20px",color:C.muted}}>
              <div style={{fontSize:50,marginBottom:12}}>{category==="hotels"?"🏨":"🏠"}</div>
              <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>لا توجد {category==="hotels"?"فنادق":"وحدات"} متاحة حالياً</div>
              <div style={{fontSize:12}}>يتم إضافة {category==="hotels"?"الفنادق":"العقارات"} عند انضمام أصحابها للمنصة</div>
              {category==="hotels"&&<button style={{...S.btn(`linear-gradient(135deg,#92400e,#d97706)`),marginTop:14,width:"auto",padding:"10px 24px"}} onClick={()=>{setMode("agent");setSubMode(agentData?"dashboard":"login");}}>🏨 سجّل فندقك الآن</button>}
              {category==="apartments"&&<button style={{...S.btn(),marginTop:14,width:"auto",padding:"10px 24px"}} onClick={()=>{setMode("agent");setSubMode(agentData?"dashboard":"login");}}>🏠 أضف عقارك الآن</button>}
            </div>
          ):(
            <div style={S.grid2}>
              {items.map(item=>(
                <div key={item.id} style={{...S.card,cursor:"pointer",transition:"all .2s",padding:0,overflow:"hidden"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 10px 30px rgba(56,189,248,.13)`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
                  onClick={()=>{setSelItem(item);setSubMode("detail");}}
                >
                  <div style={{height:100,background:`linear-gradient(135deg,#1a3a6b,#0d2a4e)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,position:"relative"}}>
                    {item.emoji||"🏠"}
                    <div style={{position:"absolute",top:7,right:7,...S.badge(item.available?"34,197,94":"239,68,68")}}>{item.available?"متاح":"محجوز"}</div>
                  </div>
                  <div style={{padding:"11px 13px 13px"}}>
                    <div style={{fontSize:13,fontWeight:800,marginBottom:2}}>{item.title}</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:7}}>📍 {item.location}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><span style={{fontSize:14,fontWeight:900,color:C.blue}}>{item.price?.toLocaleString()} ج.م</span><span style={{fontSize:10,color:C.muted}}>/ليلة</span></div>
                      <button style={{...S.btnMd(),fontSize:11,padding:"5px 12px",opacity:item.available?1:.4}} disabled={!item.available} onClick={e=>{e.stopPropagation();if(item.available){setSelItem(item);setSubMode("detail");}}}>احجز</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ════════ AGENT ════════ */
  if(mode==="agent") {
    const myListings = store.listings.filter(l=>l.agentId===agentData?.id);
    const myHotels   = store.hotels.filter(h=>h.agentId===agentData?.id);
    const myBookings = store.bookings.filter(b=>b.agentId===agentData?.id);

    /* Register */
    if(subMode==="register") return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<button style={S.btnSm} onClick={()=>setSubMode("login")}>← رجوع</button>}/>
        <div style={S.page}>
          {subMode==="reg_success"
            ?<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:60,marginBottom:10}}>📨</div><div style={{fontSize:20,fontWeight:900,color:C.green,marginBottom:8}}>تم إرسال طلبك!</div><div style={{fontSize:13,color:C.sub}}>ستتلقى رداً خلال 24 ساعة على رقمك</div><button style={{...S.btn(),marginTop:14}} onClick={()=>setSubMode("login")}>تسجيل الدخول</button></div>
            :<AgentRegister onBack={()=>setSubMode("login")} onSubmit={f=>{update("pendingAgents",a=>[...a,{...f,id:uid(),createdAt:now()}]);setSubMode("reg_success");}}/>
          }
        </div>
      </div>
    );

    /* Login */
    if(subMode==="login"||!agentData) return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<button style={S.btnSm} onClick={()=>setMode("home")}>← الرئيسية</button>}/>
        <div style={S.page}>
          <div style={{...S.hero,marginBottom:20}}>
            <div style={{fontSize:32,marginBottom:6}}>🏢</div>
            <div style={{fontSize:18,fontWeight:900}}>تسجيل دخول السمسار</div>
          </div>
          <div style={S.card}>
            <label style={S.label}>رقم الهاتف</label>
            <input style={{...S.inp,marginBottom:10}} type="tel" placeholder="01XXXXXXXXX" value={agLogin.phone||""} onChange={e=>setAgLogin(p=>({...p,phone:e.target.value}))}/>
            <label style={S.label}>كلمة المرور</label>
            <input style={S.inp} type="password" placeholder="••••••••" value={agLogin.pass||""} onChange={e=>setAgLogin(p=>({...p,pass:e.target.value}))}/>
            {loginErr&&<div style={{...S.noteR,marginTop:8}}>{loginErr}</div>}
            <button style={S.btn()} onClick={handleAgentLogin}>🔐 دخول</button>
            <div style={S.sep}/>
            <button style={S.btn(`linear-gradient(135deg,#16a34a,#22c55e)`)} onClick={()=>setSubMode("register")}>➕ انضم كسمسار / مكتب / فندق</button>
          </div>
          <div style={S.noteY}>💡 للتجربة: سجّل حساباً جديداً أو اطلب من الإدارة تفعيل حسابك</div>
        </div>
      </div>
    );

    /* Dashboard */
    const confirmedIncome = myBookings.filter(b=>b.status==="confirmed").reduce((s,b)=>s+(b.base||0),0);
    const totalCom = Math.round(confirmedIncome*A_COM);
    return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<div style={{display:"flex",gap:7}}><span style={{fontSize:12,color:C.muted,alignSelf:"center"}}>مرحباً {agentData?.office}</span><button style={S.btnSm} onClick={()=>{setAgentData(null);setSubMode("login");}}>خروج</button></div>}/>
        <div style={S.page}>

          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {[[myListings.length+myHotels.length,"وحداتي",C.blue],[myBookings.filter(b=>b.status==="pending").length,"حجوزات معلقة",C.yellow],[myBookings.filter(b=>b.status==="confirmed").length,"مؤكدة",C.green],[totalCom.toLocaleString(),"عمولة ج.م",C.yellow]].map(([n,l,c])=>(
              <div key={l} style={S.statB}><span style={{fontSize:19,fontWeight:900,color:c,display:"block"}}>{n}</span><div style={{fontSize:10,color:C.muted,marginTop:2}}>{l}</div></div>
            ))}
          </div>

          <div style={{display:"flex",gap:4,marginBottom:14,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3}}>
            {[["listings","🏠 عقاراتي"],["hotels","🏨 فنادقي"],["addApt","➕ شقة"],["addHotel","➕ فندق"],["bookings","📋 الحجوزات"]].map(([t,l])=>(
              <button key={t} style={S.tab(agTab===t)} onClick={()=>setAgTab(t)}>{l}</button>
            ))}
          </div>

          {agTab==="listings"&&(
            <div>
              {myListings.length===0?<div style={{...S.card,textAlign:"center",color:C.muted,padding:"30px"}}>لا توجد عقارات مضافة بعد</div>
              :myListings.map(l=>(
                <div key={l.id} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontWeight:800,fontSize:13}}>{l.title}</div>
                    {l.pendingApproval?<span style={S.badge("251,191,36")}>قيد الموافقة</span>:<span style={S.badge(l.available?"34,197,94":"239,68,68")}>{l.available?"متاح":"محجوز"}</span>}
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>📍 {l.location} • {l.price?.toLocaleString()} ج.م/ليلة</div>
                </div>
              ))}
            </div>
          )}

          {agTab==="hotels"&&(
            <div>
              {myHotels.length===0?<div style={{...S.card,textAlign:"center",color:C.muted,padding:"30px"}}>لا توجد فنادق مضافة بعد</div>
              :myHotels.map(h=>(
                <div key={h.id} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontWeight:800,fontSize:13}}>{h.title}</div>
                    {h.pendingApproval?<span style={S.badge("251,191,36")}>قيد الموافقة</span>:<span style={S.badge(h.available?"34,197,94":"239,68,68")}>{h.available?"متاح":"محجوز"}</span>}
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>📍 {h.location} • من {h.price?.toLocaleString()} ج.م/ليلة</div>
                </div>
              ))}
            </div>
          )}

          {agTab==="addApt"&&<AddListing agentId={agentData?.id} agentName={agentData?.office} cat="apartments" onBack={()=>setAgTab("listings")} onSave={l=>{update("listings",ls=>[...ls,l]);setAgTab("listings");}}/>}
          {agTab==="addHotel"&&<AddListing agentId={agentData?.id} agentName={agentData?.office} cat="hotels" onBack={()=>setAgTab("hotels")} onSave={h=>{update("hotels",hs=>[...hs,h]);setAgTab("hotels");}}/>}

          {agTab==="bookings"&&(
            <div>
              {myBookings.length===0?<div style={{...S.card,textAlign:"center",color:C.muted,padding:"30px"}}>لا توجد حجوزات بعد</div>
              :myBookings.map(b=><BookingSystem key={b.id} booking={b} isAdmin={false} agentId={agentData?.id}/>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ════════ ADMIN ════════ */
  if(mode==="admin") {
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);
    const [adminCreds, setAdminCreds] = useState({});
    const [adminErr, setAdminErr] = useState("");

    if(!adminLoggedIn) return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<button style={S.btnSm} onClick={()=>setMode("home")}>← الرئيسية</button>}/>
        <div style={S.page}>
          <div style={{...S.hero,marginBottom:20}}>
            <div style={{fontSize:32,marginBottom:6}}>🔐</div>
            <div style={{fontSize:18,fontWeight:900}}>لوحة تحكم الإدارة</div>
          </div>
          <div style={S.card}>
            <label style={S.label}>اسم المستخدم</label>
            <input style={{...S.inp,marginBottom:10}} placeholder="admin" value={adminCreds.user||""} onChange={e=>setAdminCreds(p=>({...p,user:e.target.value}))}/>
            <label style={S.label}>كلمة المرور</label>
            <input style={S.inp} type="password" placeholder="••••••••" value={adminCreds.pass||""} onChange={e=>setAdminCreds(p=>({...p,pass:e.target.value}))}/>
            {adminErr&&<div style={{...S.noteR,marginTop:8}}>{adminErr}</div>}
            <button style={S.btn()} onClick={()=>{if(adminCreds.user===ADMIN_USER&&adminCreds.pass===ADMIN_PASS){setAdminLoggedIn(true);}else setAdminErr("بيانات الدخول غير صحيحة");}}>🔐 دخول</button>
          </div>
          <div style={S.noteY}>🔑 المستخدم: <code>admin</code> / كلمة المرور: <code>bookin2026</code></div>
        </div>
      </div>
    );

    const pendingBookings = store.bookings.filter(b=>b.status==="pending");
    const allStats = [
      [store.bookings.length,          "إجمالي الحجوزات",  C.blue],
      [pendingBookings.length,          "حجوزات معلقة",     C.yellow],
      [store.bookings.filter(b=>b.status==="confirmed").length,"مؤكدة",C.green],
      [store.listings.filter(l=>l.pendingApproval).length+store.hotels.filter(h=>h.pendingApproval).length,"وحدات تنتظر موافقة",C.yellow],
      [store.complaints.filter(c=>c.status==="open").length,"شكاوى مفتوحة",C.red+""],
      [store.ads.filter(a=>a.status==="pending").length,  "إعلانات معلقة", C.yellow],
      [store.agents.length,             "سماسرة مسجلون",   C.blue],
      [store.pendingAgents.length,      "طلبات انضمام",     C.yellow],
    ];

    return (
      <div style={S.app}><style>{FONT}</style>
        <Header right={<div style={{display:"flex",gap:7}}><span style={{fontSize:11,color:C.muted,alignSelf:"center"}}>الإدارة</span><button style={S.btnSm} onClick={()=>{setAdminLoggedIn(false);setMode("home");}}>خروج</button></div>}/>
        <div style={S.page}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:16}}>
            {allStats.map(([n,l,c])=>(
              <div key={l} style={{...S.statB,minWidth:140}}>
                <span style={{fontSize:20,fontWeight:900,color:c,display:"block"}}>{n}</span>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:4,marginBottom:14,background:"rgba(255,255,255,.03)",borderRadius:10,padding:3,overflowX:"auto"}}>
            {[["bookings","📋 الحجوزات"],["listings","🏠 العقارات"],["agents","👥 السماسرة"],["complaints","📢 الشكاوى"],["ads","📣 الإعلانات"]].map(([t,l])=>(
              <button key={t} style={{...S.tab(adminTab===t),whiteSpace:"nowrap",minWidth:90}} onClick={()=>setAdminTab(t)}>{l}</button>
            ))}
          </div>

          {/* BOOKINGS */}
          {adminTab==="bookings"&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,marginBottom:10,color:C.yellow}}>⏳ حجوزات تنتظر التأكيد ({pendingBookings.length})</div>
              {pendingBookings.map(b=><BookingSystem key={b.id} booking={b} isAdmin onAdminAction={adminAction}/>)}
              {pendingBookings.length===0&&<div style={{...S.card,textAlign:"center",color:C.muted}}>لا توجد حجوزات معلقة ✅</div>}
              <div style={S.sep}/>
              <div style={{fontSize:14,fontWeight:800,marginBottom:10}}>كل الحجوزات</div>
              {store.bookings.map(b=><BookingSystem key={b.id} booking={b} isAdmin onAdminAction={adminAction}/>)}
              {store.bookings.length===0&&<div style={{...S.card,textAlign:"center",color:C.muted}}>لا توجد حجوزات بعد</div>}
            </div>
          )}

          {/* LISTINGS */}
          {adminTab==="listings"&&(
            <div>
              <div style={{fontSize:13,fontWeight:800,marginBottom:10,color:C.yellow}}>🔍 وحدات تنتظر الموافقة</div>
              {[...store.listings.filter(l=>l.pendingApproval),...store.hotels.filter(h=>h.pendingApproval)].map(item=>(
                <div key={item.id} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div><div style={{fontWeight:800,fontSize:13}}>{item.title}</div><div style={{fontSize:11,color:C.muted}}>{item.location} • {item.price} ج.م • {item.agentName}</div></div>
                    <span style={S.badge("251,191,36")}>معلق</span>
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    <button style={{...S.btnMd(`linear-gradient(135deg,#16a34a,#22c55e)`),flex:1}} onClick={()=>{
                      if(item.cat==="hotels") update("hotels",hs=>hs.map(h=>h.id===item.id?{...h,pendingApproval:false}:h));
                      else update("listings",ls=>ls.map(l=>l.id===item.id?{...l,pendingApproval:false}:l));
                    }}>✅ قبول ونشر</button>
                    <button style={{...S.btnMd(`linear-gradient(135deg,#991b1b,${C.red})`),flex:1}} onClick={()=>{
                      if(item.cat==="hotels") update("hotels",hs=>hs.filter(h=>h.id!==item.id));
                      else update("listings",ls=>ls.filter(l=>l.id!==item.id));
                    }}>❌ رفض</button>
                  </div>
                </div>
              ))}
              <div style={S.sep}/>
              <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>جميع العقارات المنشورة ({store.listings.filter(l=>!l.pendingApproval).length})</div>
              {store.listings.filter(l=>!l.pendingApproval).map(l=>(
                <div key={l.id} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontWeight:800,fontSize:13}}>{l.title}</div><div style={{fontSize:11,color:C.muted}}>{l.location} • {l.price?.toLocaleString()} ج.م</div></div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={S.badge(l.available?"34,197,94":"239,68,68")}>{l.available?"متاح":"محجوز"}</span>
                      <button style={{...S.btnSm,fontSize:11}} onClick={()=>update("listings",ls=>ls.map(x=>x.id===l.id?{...x,available:!x.available}:x))}>{l.available?"تعيين محجوز":"تعيين متاح"}</button>
                      <button style={{...S.btnSm,fontSize:11,color:"#f87171"}} onClick={()=>update("listings",ls=>ls.filter(x=>x.id!==l.id))}>حذف</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AGENTS */}
          {adminTab==="agents"&&(
            <div>
              <div style={{fontSize:13,fontWeight:800,marginBottom:10,color:C.yellow}}>👥 طلبات انضمام جديدة ({store.pendingAgents.length})</div>
              {store.pendingAgents.map(a=>(
                <div key={a.id} style={S.card}>
                  <div style={{fontWeight:800,fontSize:13,marginBottom:5}}>{a.office} — {a.name}</div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{a.phone} • {a.natId}</div>
                  <div style={{display:"flex",gap:7}}>
                    <button style={{...S.btnMd(`linear-gradient(135deg,#16a34a,#22c55e)`),flex:1}} onClick={()=>{
                      update("agents",ag=>[...ag,{...a,status:"active"}]);
                      update("pendingAgents",pa=>pa.filter(p=>p.id!==a.id));
                    }}>✅ قبول وتفعيل</button>
                    <button style={{...S.btnMd(`linear-gradient(135deg,#991b1b,${C.red})`),flex:1}} onClick={()=>update("pendingAgents",pa=>pa.filter(p=>p.id!==a.id))}>❌ رفض</button>
                  </div>
                </div>
              ))}
              <div style={S.sep}/>
              <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>السماسرة المسجلون ({store.agents.length})</div>
              {store.agents.map(a=>(
                <div key={a.id} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontWeight:800,fontSize:13}}>{a.office}</div><div style={{fontSize:11,color:C.muted}}>{a.phone}</div></div>
                    <span style={S.badge("34,197,94")}>نشط</span>
                  </div>
                </div>
              ))}
              {store.agents.length===0&&<div style={{...S.card,textAlign:"center",color:C.muted}}>لا يوجد سماسرة مسجلون بعد</div>}
            </div>
          )}

          {/* COMPLAINTS */}
          {adminTab==="complaints"&&(
            <div>
              {store.complaints.length===0?<div style={{...S.card,textAlign:"center",color:C.muted,padding:"30px"}}>لا توجد شكاوى ✅</div>
              :store.complaints.map(c=>(
                <div key={c.id} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <div style={{fontWeight:800,fontSize:13}}>{c.subject}</div>
                    <span style={S.badge(c.status==="open"?"239,68,68":"34,197,94")}>{c.status==="open"?"مفتوحة":"مغلقة"}</span>
                  </div>
                  <div style={{fontSize:12,color:C.sub,marginBottom:5}}>{c.name} — {c.phone}</div>
                  {c.bookingId&&<div style={{fontSize:11,color:C.muted,marginBottom:5}}>رقم الحجز: {c.bookingId}</div>}
                  <div style={{fontSize:12,color:C.text,background:"rgba(255,255,255,.04)",borderRadius:8,padding:9,marginBottom:8}}>{c.message}</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{c.createdAt}</div>
                  {c.status==="open"&&<button style={S.btn(`linear-gradient(135deg,#16a34a,#22c55e)`)} onClick={()=>update("complaints",cs=>cs.map(x=>x.id===c.id?{...x,status:"closed",closedAt:now()}:x))}>✅ إغلاق الشكوى</button>}
                </div>
              ))}
            </div>
          )}

          {/* ADS */}
          {adminTab==="ads"&&(
            <div>
              <div style={{fontSize:13,fontWeight:800,marginBottom:10,color:C.yellow}}>إعلانات تنتظر الموافقة ({store.ads.filter(a=>a.status==="pending").length})</div>
              {store.ads.filter(a=>a.status==="pending").map(ad=>(
                <div key={ad.id} style={S.card}>
                  {ad.image&&<img src={ad.image} alt="" style={{width:"100%",height:80,objectFit:"cover",borderRadius:9,marginBottom:8}}/>}
                  <div style={{fontWeight:800,fontSize:13,marginBottom:3}}>{ad.title}</div>
                  <div style={{fontSize:11,color:C.blue,marginBottom:3}}>{ad.category}</div>
                  <div style={{fontSize:12,color:C.sub,marginBottom:5}}>{ad.desc}</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{ad.phone} • {ad.createdAt}</div>
                  <div style={{display:"flex",gap:7}}>
                    <button style={{...S.btnMd(`linear-gradient(135deg,#16a34a,#22c55e)`),flex:1}} onClick={()=>update("ads",as=>as.map(a=>a.id===ad.id?{...a,status:"approved"}:a))}>✅ نشر</button>
                    <button style={{...S.btnMd(`linear-gradient(135deg,#991b1b,${C.red})`),flex:1}} onClick={()=>update("ads",as=>as.filter(a=>a.id!==ad.id))}>❌ رفض</button>
                  </div>
                </div>
              ))}
              <div style={S.sep}/>
              <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>الإعلانات المنشورة ({store.ads.filter(a=>a.status==="approved").length})</div>
              {store.ads.filter(a=>a.status==="approved").map(ad=>(
                <div key={ad.id} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:800,fontSize:13}}>{ad.title}</div><div style={{fontSize:11,color:C.muted}}>{ad.category} • {ad.phone}</div></div>
                  <button style={{...S.btnSm,color:"#f87171"}} onClick={()=>update("ads",as=>as.filter(a=>a.id!==ad.id))}>حذف</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
