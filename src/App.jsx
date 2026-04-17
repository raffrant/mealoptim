import { useState, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const LIME = "#C4FF3C";
const BG   = "#0A0A08";
const CARD = "#131311";
const CARD2= "#1A1A17";
const MUT  = "#636360";
const BDR  = "#232320";
const CREAM= "#EDE7DA";

// ─── GLOBAL DATA ─────────────────────────────────────────────────────────────
const COUNTRIES = {
  GR:{ name:"Greece",          flag:"🇬🇷", cur:"€",  stores:["Sklavenitis","AB Vassilopoulos","Lidl","Masoutis","Market In"] },
  US:{ name:"United States",   flag:"🇺🇸", cur:"$",  stores:["Walmart","Kroger","Whole Foods","Aldi","Target"] },
  UK:{ name:"United Kingdom",  flag:"🇬🇧", cur:"£",  stores:["Tesco","Sainsbury's","Asda","Waitrose","Aldi UK"] },
  DE:{ name:"Germany",         flag:"🇩🇪", cur:"€",  stores:["Rewe","Edeka","Aldi","Lidl","Penny"] },
  FR:{ name:"France",          flag:"🇫🇷", cur:"€",  stores:["Carrefour","E.Leclerc","Intermarché","Monoprix","Aldi FR"] },
  ES:{ name:"Spain",           flag:"🇪🇸", cur:"€",  stores:["Mercadona","Carrefour","Dia","Alcampo","Aldi ES"] },
  IT:{ name:"Italy",           flag:"🇮🇹", cur:"€",  stores:["Esselunga","Coop","Conad","Carrefour IT","Eurospin"] },
  AU:{ name:"Australia",       flag:"🇦🇺", cur:"A$", stores:["Woolworths","Coles","Aldi AU","IGA","Harris Farm"] },
  CA:{ name:"Canada",          flag:"🇨🇦", cur:"C$", stores:["Loblaws","Metro","Safeway","No Frills","Costco"] },
  JP:{ name:"Japan",           flag:"🇯🇵", cur:"¥",  stores:["AEON","Ito-Yokado","Seiyu","Life","Yamaya"] },
  NL:{ name:"Netherlands",     flag:"🇳🇱", cur:"€",  stores:["Albert Heijn","Jumbo","Lidl NL","Aldi NL","Plus"] },
  SE:{ name:"Sweden",          flag:"🇸🇪", cur:"kr", stores:["ICA","Coop SE","Lidl SE","Hemköp","Willys"] },
  BR:{ name:"Brazil",          flag:"🇧🇷", cur:"R$", stores:["Pão de Açúcar","Carrefour BR","Extra","Atacadão","Assaí"] },
  IN:{ name:"India",           flag:"🇮🇳", cur:"₹",  stores:["BigBazaar","Reliance Fresh","DMart","Star Bazaar","Nature's Basket"] },
  SG:{ name:"Singapore",       flag:"🇸🇬", cur:"S$", stores:["NTUC FairPrice","Cold Storage","Giant SG","Sheng Siong","RedMart"] },
  CN:{ name:"China",           flag:"🇨🇳", cur:"¥",  stores:["Hema Fresh","Walmart CN","RT-Mart","Yonghui","Sam's Club"] },
  MX:{ name:"Mexico",          flag:"🇲🇽", cur:"MX$",stores:["Walmart MX","Soriana","Chedraui","La Comer","Bodega Aurrerá"] },
  ZA:{ name:"South Africa",    flag:"🇿🇦", cur:"R",  stores:["Checkers","Pick n Pay","Woolworths SA","Spar","Food Lover's"] },
  PL:{ name:"Poland",          flag:"🇵🇱", cur:"zł", stores:["Biedronka","Lidl PL","Kaufland","Netto","Auchan"] },
  PT:{ name:"Portugal",        flag:"🇵🇹", cur:"€",  stores:["Continente","Pingo Doce","Lidl PT","Aldi PT","Minipreço"] },
};

const EXAMPLES = [
  { name:"Spaghetti Carbonara", emoji:"🍝", text:"400g spaghetti\n200g guanciale\n4 eggs\n100g pecorino romano\n50g parmesan\nBlack pepper\nSalt" },
  { name:"Chicken Stir Fry",    emoji:"🥘", text:"500g chicken breast\n2 bell peppers\n300g broccoli\n3 cloves garlic\n2 tbsp soy sauce\n1 tbsp sesame oil\nFresh ginger\nSpring onions" },
  { name:"Avocado Toast",       emoji:"🥑", text:"4 slices sourdough bread\n2 ripe avocados\n4 eggs\n1 lemon\nChili flakes\nSalt and pepper\nMicrogreens" },
  { name:"Margherita Pizza",    emoji:"🍕", text:"500g pizza flour\n7g dry yeast\n300ml water\n400g tomatoes\n250g mozzarella\nFresh basil\n3 tbsp olive oil\nSalt" },
];

// ─── MOCK DATA GENERATOR ─────────────────────────────────────────────────────
function genMock(cd, recipeText, recipeName) {
  const lines = recipeText.split("\n").filter(l => l.trim());
  const stores = cd.stores.slice(0, 4).map((name, i) => {
    const base = 9 + Math.random() * 14 + i * 0.8;
    const dist = parseFloat((0.3 + Math.random() * 3).toFixed(1));
    const items = lines.map(l => ({
      ingredient: l.trim(),
      price: parseFloat((base / lines.length * (0.7 + Math.random() * 0.6)).toFixed(2)),
      productName: `${name} Brand`,
    }));
    return {
      name, distance: dist,
      totalCost: parseFloat(items.reduce((s, x) => s + x.price, 0).toFixed(2)),
      walkMinutes: Math.round(dist * 13),
      driveMinutes: Math.round(dist * 3.5 + 2),
      items,
    };
  });
  stores.sort((a, b) => a.totalCost - b.totalCost);
  const worst = stores[stores.length - 1].totalCost;
  return {
    recipeName: recipeName || "My Recipe",
    ingredients: lines.map(l => ({ name: l.trim() })),
    stores,
    bestValue: stores[0].name,
    bestTime: [...stores].sort((a,b) => a.driveMinutes - b.driveMinutes)[0].name,
    bestOverall: stores[0].name,
    insight: `Shopping at ${stores[0].name} saves you ${cd.cur}${(worst - stores[0].totalCost).toFixed(2)} compared to the priciest option nearby.`,
  };
}

// ─── FONTS + CSS ─────────────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::placeholder{color:${MUT}}
textarea,input{outline:none}
body{background:${BG}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.25)}}
@keyframes shimmer{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}
.a1{animation:fadeUp .45s ease .05s both}
.a2{animation:fadeUp .45s ease .12s both}
.a3{animation:fadeUp .45s ease .2s both}
.a4{animation:fadeUp .45s ease .28s both}
.a5{animation:fadeUp .45s ease .36s both}
.ch:hover{background:${CARD2} !important}
.sc:hover{border-color:${LIME} !important;color:${LIME} !important}
.btn-lime{transition:transform .15s,opacity .15s}
.btn-lime:hover{opacity:.88;transform:scale(.99)}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const Body = ({ children, style }) => (
  <div style={{ fontFamily:"'Outfit',sans-serif", background:BG, color:CREAM, minHeight:"100vh", position:"relative", ...style }}>
    {children}
  </div>
);

const Mono = ({ children, style }) => (
  <span style={{ fontFamily:"'DM Mono',monospace", ...style }}>{children}</span>
);

const Tag = ({ children }) => (
  <div style={{ display:"inline-flex", alignItems:"center", gap:6,
    background:"rgba(196,255,60,.09)", border:`0.5px solid rgba(196,255,60,.28)`,
    borderRadius:100, padding:"4px 12px", fontSize:11, color:LIME,
    fontFamily:"'DM Mono',monospace", letterSpacing:".5px" }}>
    {children}
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MealOptim() {
  const [screen, setScreen]     = useState("home");
  const [country, setCountry]   = useState("GR");
  const [text, setText]         = useState("");
  const [name, setName]         = useState("");
  const [result, setResult]     = useState(null);
  const [loadStep, setLoadStep] = useState(0);
  const [mode, setMode]         = useState("balanced");
  const [picker, setPicker]     = useState(false);
  const [search, setSearch]     = useState("");
  const [mapStore, setMapStore] = useState(null);
  const cd = COUNTRIES[country];

  // ── ANALYZE ──────────────────────────────────────────────────────────────
  const analyze = async () => {
    if (!text.trim()) return;
    setScreen("analyzing");
    for (let i = 0; i < 4; i++) {
      setLoadStep(i);
      await new Promise(r => setTimeout(r, 950));
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user", content:
`You are a grocery price optimizer. Return ONLY raw JSON, no markdown, no backticks, no explanation.

Recipe: "${name||"My Recipe"}"
Ingredients:
${text}
Country: ${cd.name} | Currency: ${cd.cur}
Stores available: ${cd.stores.join(", ")}

Return this exact JSON shape:
{"recipeName":"string","ingredients":[{"name":"string","quantity":"string"}],"stores":[{"name":"string","totalCost":0.0,"distance":0.0,"walkMinutes":0,"driveMinutes":0,"items":[{"ingredient":"string","price":0.0,"productName":"string"}]}],"bestValue":"store","bestTime":"store","bestOverall":"store","insight":"one sentence recommendation"}

Rules: realistic local ${cd.cur} prices, distances 0.2–4km, prices vary 8–30% between stores, include 3–4 stores.` }]
        })
      });
      const data = await res.json();
      const raw = data.content.map(c=>c.text||"").join("");
      const parsed = JSON.parse(raw);
      setResult(parsed);
      setMapStore(parsed.stores[0]?.name);
    } catch {
      const mock = genMock(cd, text, name);
      setResult(mock);
      setMapStore(mock.stores[0]?.name);
    }
    setScreen("results");
  };

  // ── COUNTRY PICKER ────────────────────────────────────────────────────────
  const filtered = Object.entries(COUNTRIES).filter(([,c]) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ═════════════════════════════════════════════════════════════════════════
  // HOME SCREEN
  // ═════════════════════════════════════════════════════════════════════════
  if (screen === "home") return (
    <Body>
      <style>{FONTS}</style>

      {/* Navbar */}
      <nav style={{ padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:`0.5px solid ${BDR}`, background:BG }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19, letterSpacing:"-0.5px" }}>
          meal<span style={{ color:LIME }}>optim</span>
        </span>
        <button onClick={()=>setPicker(true)} style={{
          display:"flex", alignItems:"center", gap:8, background:CARD,
          border:`0.5px solid ${BDR}`, borderRadius:100, padding:"8px 14px",
          cursor:"pointer", color:CREAM, fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
          <span style={{ fontSize:16 }}>{cd.flag}</span>
          <span>{cd.name}</span>
          <span style={{ color:MUT, fontSize:10 }}>▾</span>
        </button>
      </nav>

      <div style={{ padding:"40px 22px 60px", maxWidth:460, margin:"0 auto" }}>

        {/* Tag */}
        <div className="a1" style={{ marginBottom:22 }}>
          <Tag>AI-POWERED · {Object.keys(COUNTRIES).length} COUNTRIES · FREE</Tag>
        </div>

        {/* Headline */}
        <h1 className="a2" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:44, lineHeight:1.03, letterSpacing:"-2px", marginBottom:16 }}>
          Cook smarter,<br/>
          <span style={{ color:LIME }}>spend less.</span>
        </h1>
        <p className="a3" style={{ fontSize:16, color:MUT, lineHeight:1.65, marginBottom:36, fontWeight:300 }}>
          Paste any recipe. We compare prices at every supermarket near you and plan the fastest shopping route.
        </p>

        {/* Inputs */}
        <div className="a4">
          <input
            type="text"
            placeholder="Recipe name (optional)"
            value={name}
            onChange={e=>setName(e.target.value)}
            style={{ width:"100%", background:CARD, border:`0.5px solid ${BDR}`,
              borderRadius:12, padding:"13px 16px", color:CREAM, fontSize:15,
              fontFamily:"'Outfit',sans-serif", marginBottom:10 }}
          />
          <textarea
            placeholder={"Paste your ingredients...\n\n  4 eggs\n  200g pasta\n  2 tbsp olive oil"}
            value={text}
            onChange={e=>setText(e.target.value)}
            rows={7}
            style={{ width:"100%", background:CARD, border:`0.5px solid ${BDR}`,
              borderRadius:12, padding:"13px 16px", color:CREAM, fontSize:14,
              fontFamily:"'Outfit',sans-serif", resize:"none", lineHeight:1.7, marginBottom:12 }}
          />
        </div>

        {/* Example chips */}
        <div className="a4" style={{ display:"flex", gap:7, marginBottom:26, flexWrap:"wrap" }}>
          {EXAMPLES.map(ex=>(
            <button key={ex.name} className="sc" onClick={()=>{setText(ex.text);setName(ex.name)}}
              style={{ background:"transparent", border:`0.5px solid ${BDR}`, borderRadius:100,
                padding:"6px 13px", fontSize:12, color:MUT, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif", transition:"all .2s" }}>
              {ex.emoji} {ex.name}
            </button>
          ))}
        </div>

        {/* Mode selector */}
        <div className="a4" style={{ marginBottom:26 }}>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:MUT, marginBottom:10, letterSpacing:".5px" }}>OPTIMIZE FOR</p>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { key:"cost",     label:"Best Price",   icon:"◎" },
              { key:"balanced", label:"Best Balance",  icon:"◈" },
              { key:"time",     label:"Fastest Trip",  icon:"◷" },
            ].map(({key,label,icon})=>(
              <button key={key} onClick={()=>setMode(key)}
                style={{ flex:1, padding:"11px 6px", borderRadius:11, cursor:"pointer",
                  fontFamily:"'Outfit',sans-serif", fontSize:12,
                  background: mode===key ? LIME : CARD,
                  color: mode===key ? "#0A0A08" : MUT,
                  border:`0.5px solid ${mode===key ? LIME : BDR}`,
                  fontWeight: mode===key ? 500 : 400, transition:"all .2s" }}>
                <div style={{ fontSize:20, marginBottom:3 }}>{icon}</div>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="a5 btn-lime" onClick={analyze} disabled={!text.trim()}
          style={{ width:"100%", padding:"18px", borderRadius:14, border:"none",
            background: text.trim() ? LIME : CARD2,
            color: text.trim() ? "#0A0A08" : MUT,
            fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16,
            letterSpacing:"-0.4px", cursor: text.trim() ? "pointer" : "not-allowed" }}>
          Find the Cheapest Prices →
        </button>

        {/* Stats bar */}
        <div className="a5" style={{ display:"flex", gap:0, marginTop:40,
          borderTop:`0.5px solid ${BDR}`, paddingTop:28 }}>
          {[
            { v:`${Object.keys(COUNTRIES).length}`, l:"countries" },
            { v:"60+",  l:"store chains" },
            { v:"avg 23%", l:"savings" },
          ].map(({v,l},i)=>(
            <div key={i} style={{ flex:1, textAlign: i===1?"center":i===2?"right":"left" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:LIME }}>{v}</div>
              <div style={{ fontSize:12, color:MUT }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Country Picker */}
      {picker && (
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.82)",
          display:"flex", alignItems:"flex-end", zIndex:99 }}
          onClick={()=>setPicker(false)}>
          <div style={{ background:"#18180F", borderRadius:"22px 22px 0 0", width:"100%",
            padding:"22px 20px 36px", maxHeight:"72vh", overflowY:"auto" }}
            onClick={e=>e.stopPropagation()}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, marginBottom:14 }}>Select Country</p>
            <input autoFocus placeholder="Search countries..."
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", background:CARD, border:`0.5px solid ${BDR}`,
                borderRadius:10, padding:"11px 14px", color:CREAM, fontSize:14,
                fontFamily:"'Outfit',sans-serif", marginBottom:14 }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {filtered.map(([code,c])=>(
                <button key={code} onClick={()=>{setCountry(code);setPicker(false);setSearch("")}}
                  style={{ display:"flex", alignItems:"center", gap:10,
                    background: country===code ? "rgba(196,255,60,.09)" : CARD,
                    border:`0.5px solid ${country===code ? LIME : BDR}`,
                    borderRadius:10, padding:"12px 14px", cursor:"pointer", color:CREAM,
                    fontFamily:"'Outfit',sans-serif", fontSize:13, textAlign:"left" }}>
                  <span style={{ fontSize:20 }}>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Body>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // ANALYZING SCREEN
  // ═════════════════════════════════════════════════════════════════════════
  if (screen === "analyzing") {
    const steps = [
      { label:"Parsing ingredients",   sub:"Reading your recipe..." },
      { label:"Finding stores",         sub:`Scanning ${cd.stores.length} stores in ${cd.name}...` },
      { label:"Comparing prices",       sub:"Fetching live price data..." },
      { label:"Optimizing route",       sub:"Calculating fastest path..." },
    ];
    return (
      <Body style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
        <style>{FONTS}</style>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, marginBottom:52 }}>
          meal<span style={{ color:LIME }}>optim</span>
        </span>
        <div style={{ width:60, height:60, borderRadius:"50%",
          border:`2px solid ${BDR}`, borderTopColor:LIME,
          animation:"spin 1s linear infinite", marginBottom:44 }} />
        <div style={{ width:"100%", maxWidth:320 }}>
          {steps.map((step,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 0",
              borderBottom: i<steps.length-1 ? `0.5px solid ${BDR}` : "none",
              opacity: i<=loadStep ? 1 : .25, transition:"opacity .5s" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:11,
                background: i<loadStep ? LIME : i===loadStep ? "rgba(196,255,60,.12)" : CARD,
                color:       i<loadStep ? "#0A0A08" : i===loadStep ? LIME : MUT,
                border:`0.5px solid ${i<=loadStep?LIME:BDR}`,
                animation: i===loadStep ? "pulse 1.6s infinite" : "none" }}>
                {i<loadStep ? "✓" : i+1}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:500, color: i<=loadStep?CREAM:MUT }}>{step.label}</div>
                {i===loadStep && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:LIME, marginTop:2 }}>{step.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </Body>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═════════════════════════════════════════════════════════════════════════
  if (screen === "results" && result) {
    const stores = result.stores || [];
    const sorted = [...stores].sort((a,b)=>{
      if (mode==="cost") return a.totalCost - b.totalCost;
      if (mode==="time") return a.driveMinutes - b.driveMinutes;
      const maxC=Math.max(...stores.map(s=>s.totalCost)), minC=Math.min(...stores.map(s=>s.totalCost));
      const maxT=Math.max(...stores.map(s=>s.driveMinutes)), minT=Math.min(...stores.map(s=>s.driveMinutes));
      const nc=s=>(s.totalCost-minC)/(maxC-minC+.01);
      const nt=s=>(s.driveMinutes-minT)/(maxT-minT+.01);
      return (nc(a)+nt(a))-(nc(b)+nt(b));
    });
    const best  = sorted[0];
    const worst = Math.max(...stores.map(s=>s.totalCost));
    const save  = (worst-best.totalCost).toFixed(2);
    const savePct = Math.round((worst-best.totalCost)/worst*100);
    const ings  = result.ingredients || [];

    return (
      <Body>
        <style>{FONTS}</style>
        {/* Sticky header */}
        <div style={{ padding:"14px 20px", display:"flex", alignItems:"center",
          justifyContent:"space-between", borderBottom:`0.5px solid ${BDR}`,
          background:BG, position:"sticky", top:0, zIndex:10 }}>
          <button onClick={()=>setScreen("home")}
            style={{ background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:24,lineHeight:1 }}>←</button>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17 }}>
            meal<span style={{ color:LIME }}>optim</span>
          </span>
          <Mono style={{ fontSize:11,color:MUT }}>{cd.flag} {cd.name}</Mono>
        </div>

        <div style={{ padding:"22px 20px 60px", maxWidth:460, margin:"0 auto" }}>

          {/* Title */}
          <div className="a1" style={{ marginBottom:22 }}>
            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:MUT,letterSpacing:".5px",marginBottom:5 }}>RESULTS FOR</p>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,letterSpacing:"-1px" }}>
              {result.recipeName||"Your Recipe"}
            </h2>
          </div>

          {/* Metrics row */}
          <div className="a2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20 }}>
            {[
              { l:"You Save",    v:`${cd.cur}${save}`,     hi:true  },
              { l:"vs priciest", v:`-${savePct}%`,          hi:false },
              { l:"ingredients", v:`${ings.length}`,        hi:false },
            ].map(({l,v,hi})=>(
              <div key={l} style={{ background: hi?"rgba(196,255,60,.08)":CARD,
                border:`0.5px solid ${hi?"rgba(196,255,60,.28)":BDR}`,
                borderRadius:13, padding:"14px 10px", textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:21,color:hi?LIME:CREAM }}>{v}</div>
                <div style={{ fontSize:11,color:MUT,marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="a2" style={{ display:"flex",gap:5,marginBottom:20,
            background:CARD,borderRadius:12,padding:4 }}>
            {[{k:"cost",l:"Cheapest"},{k:"balanced",l:"Best Overall"},{k:"time",l:"Fastest"}].map(({k,l})=>(
              <button key={k} onClick={()=>setMode(k)}
                style={{ flex:1,padding:"8px 4px",borderRadius:9,cursor:"pointer",
                  fontFamily:"'Outfit',sans-serif",fontSize:12,
                  background: mode===k?LIME:"transparent",
                  color: mode===k?"#0A0A08":MUT,
                  border:"none",fontWeight:mode===k?500:400,transition:"all .2s" }}>
                {l}
              </button>
            ))}
          </div>

          {/* Insight */}
          {result.insight && (
            <div className="a3" style={{ background:"rgba(196,255,60,.05)",
              border:`0.5px solid rgba(196,255,60,.18)`,borderRadius:13,
              padding:"14px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start" }}>
              <span style={{ color:LIME,fontSize:16,flexShrink:0,marginTop:1 }}>◈</span>
              <p style={{ fontSize:14,color:CREAM,lineHeight:1.55,fontWeight:300 }}>{result.insight}</p>
            </div>
          )}

          {/* Store cards */}
          <div className="a3" style={{ marginBottom:24 }}>
            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:MUT,
              letterSpacing:".5px",marginBottom:12 }}>
              STORES — SORTED BY {mode.toUpperCase()}
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {sorted.map((store,i)=>(
                <div key={store.name} className="ch"
                  onClick={()=>{setMapStore(store.name);setScreen("map")}}
                  style={{ background:CARD,
                    border:`0.5px solid ${i===0?LIME:BDR}`,
                    borderRadius:15,padding:"16px",cursor:"pointer",
                    transition:"background .2s",position:"relative",overflow:"hidden" }}>
                  {i===0 && (
                    <div style={{ position:"absolute",top:12,right:12,
                      background:LIME,color:"#0A0A08",borderRadius:100,
                      padding:"2px 9px",fontSize:10,fontWeight:700,
                      fontFamily:"'DM Mono',monospace" }}>BEST</div>
                  )}
                  <div style={{ display:"flex",alignItems:"flex-start",
                    justifyContent:"space-between",marginBottom:12 }}>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17,
                        color:i===0?LIME:CREAM,marginBottom:2 }}>{store.name}</div>
                      <div style={{ fontSize:12,color:MUT }}>{store.distance} km away</div>
                    </div>
                    <Mono style={{ fontWeight:500,fontSize:24,color:CREAM }}>
                      {cd.cur}{store.totalCost.toFixed(2)}
                    </Mono>
                  </div>
                  <div style={{ display:"flex",gap:16,alignItems:"center" }}>
                    {[
                      { icon:"◉", label:`${store.walkMinutes} min walk` },
                      { icon:"◷", label:`${store.driveMinutes} min drive` },
                    ].map(({icon,label})=>(
                      <div key={label} style={{ display:"flex",gap:5,alignItems:"center",fontSize:12,color:MUT }}>
                        <span style={{ color:LIME }}>{icon}</span>{label}
                      </div>
                    ))}
                    <span style={{ marginLeft:"auto",fontSize:12,color:LIME }}>Route →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          {ings.length > 0 && (
            <div className="a4" style={{ marginBottom:24 }}>
              <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:MUT,
                letterSpacing:".5px",marginBottom:12 }}>INGREDIENT PRICES @ {best.name.toUpperCase()}</p>
              <div style={{ background:CARD,borderRadius:14,border:`0.5px solid ${BDR}`,overflow:"hidden" }}>
                {ings.slice(0,8).map((ing,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",
                    justifyContent:"space-between",padding:"12px 16px",
                    borderBottom: i<Math.min(ings.length,8)-1 ? `0.5px solid ${BDR}` : "none" }}>
                    <div>
                      <div style={{ fontSize:14,color:CREAM }}>{ing.name}</div>
                      {ing.quantity && <div style={{ fontSize:11,color:MUT }}>{ing.quantity}</div>}
                    </div>
                    <Mono style={{ fontSize:13,color:LIME }}>
                      {best.items&&best.items[i] ? `${cd.cur}${best.items[i].price.toFixed(2)}` : "—"}
                    </Mono>
                  </div>
                ))}
                {/* Total row */}
                <div style={{ display:"flex",justifyContent:"space-between",
                  padding:"14px 16px",background:CARD2,
                  borderTop:`0.5px solid ${BDR}` }}>
                  <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15 }}>Total</span>
                  <Mono style={{ fontWeight:500,fontSize:18,color:LIME }}>{cd.cur}{best.totalCost.toFixed(2)}</Mono>
                </div>
              </div>
            </div>
          )}

          {/* View route CTA */}
          <button className="a5 btn-lime"
            onClick={()=>{setMapStore(best.name);setScreen("map")}}
            style={{ width:"100%",padding:"17px",borderRadius:14,
              border:`0.5px solid ${LIME}`,background:"rgba(196,255,60,.07)",color:LIME,
              fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,cursor:"pointer",letterSpacing:"-.3px" }}>
            View Route & Get Directions →
          </button>
        </div>
      </Body>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MAP SCREEN
  // ═════════════════════════════════════════════════════════════════════════
  if (screen === "map" && result) {
    const stores = result.stores || [];
    const active = stores.find(s=>s.name===mapStore) || stores[0];

    // Lay store pins around a home center
    const angles = [42, 138, 210, 316, 80];
    const radii  = [82, 95, 72, 88, 105];
    const pins = stores.map((s,i)=>({
      ...s,
      x: 160 + Math.cos(angles[i]*Math.PI/180)*radii[i],
      y: 160 + Math.sin(angles[i]*Math.PI/180)*radii[i],
    }));
    const activePin = pins.find(p=>p.name===mapStore)||pins[0];

    const minCost = Math.min(...stores.map(s=>s.totalCost));
    const maxCost = Math.max(...stores.map(s=>s.totalCost));

    return (
      <Body>
        <style>{FONTS}</style>
        {/* Header */}
        <div style={{ padding:"14px 20px",display:"flex",alignItems:"center",
          justifyContent:"space-between",borderBottom:`0.5px solid ${BDR}`,background:BG }}>
          <button onClick={()=>setScreen("results")}
            style={{ background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:24,lineHeight:1 }}>←</button>
          <Mono style={{ fontSize:12,color:MUT,letterSpacing:".5px" }}>ROUTE OPTIMIZER</Mono>
          <span style={{ fontSize:20 }}>{cd.flag}</span>
        </div>

        {/* SVG Map */}
        <div style={{ background:"#0D0D0B",borderBottom:`0.5px solid ${BDR}` }}>
          <svg viewBox="0 0 320 320" style={{ width:"100%",display:"block" }}>
            {/* Base grid */}
            {[64,128,192,256].map(v=>(
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={320} stroke={BDR} strokeWidth=".6"/>
                <line x1={0} y1={v} x2={320} y2={v} stroke={BDR} strokeWidth=".6"/>
              </g>
            ))}
            {/* Streets */}
            {[
              [0,160,320,160],[160,0,160,320],
              [40,0,280,320],[280,0,40,320],
              [0,60,320,260],
            ].map(([x1,y1,x2,y2],i)=>(
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#191917" strokeWidth={i<2?5:3}/>
            ))}
            {/* Range circles */}
            {[50,100,150].map(r=>(
              <circle key={r} cx={160} cy={160} r={r} fill="none"
                stroke={BDR} strokeWidth=".6" strokeDasharray="3 5"/>
            ))}
            {/* Route line to active */}
            {activePin && (
              <>
                <line x1={160} y1={160} x2={activePin.x} y2={activePin.y}
                  stroke={LIME} strokeWidth="1.8" strokeDasharray="7 5" opacity=".9"/>
                {/* Midpoint distance label */}
                <text
                  x={(160+activePin.x)/2} y={(160+activePin.y)/2-6}
                  textAnchor="middle" fontSize="8.5" fill={LIME}
                  fontFamily="'DM Mono',monospace">
                  {active.distance}km
                </text>
              </>
            )}
            {/* Store pins */}
            {pins.map(pin=>{
              const isSel = pin.name===mapStore;
              const costRatio = maxCost===minCost ? .5 : (pin.totalCost-minCost)/(maxCost-minCost);
              // Color from lime (cheap) to muted (expensive)
              return (
                <g key={pin.name} onClick={()=>setMapStore(pin.name)} style={{ cursor:"pointer" }}>
                  {isSel && <circle cx={pin.x} cy={pin.y} r={18} fill={LIME} opacity=".12"
                    style={{ animation:"pulse 2s infinite" }}/>}
                  <circle cx={pin.x} cy={pin.y} r={9}
                    fill={isSel?LIME:CARD2}
                    stroke={isSel?LIME:"#3A3A36"} strokeWidth="1.5"/>
                  {isSel && <circle cx={pin.x} cy={pin.y} r={3} fill={BG}/>}
                  <text x={pin.x} y={pin.y-15} textAnchor="middle" fontSize="8.5"
                    fill={isSel?LIME:MUT} fontFamily="'DM Mono',monospace">
                    {pin.name.split(" ")[0]}
                  </text>
                  <text x={pin.x} y={pin.y+22} textAnchor="middle" fontSize="8"
                    fill={isSel?LIME:"#484843"} fontFamily="'DM Mono',monospace">
                    {cd.cur}{pin.totalCost.toFixed(2)}
                  </text>
                </g>
              );
            })}
            {/* Home pin */}
            <circle cx={160} cy={160} r={14} fill={BG} stroke={CREAM} strokeWidth="1.5"/>
            <circle cx={160} cy={160} r={5} fill={CREAM}/>
            <text x={160} y={185} textAnchor="middle" fontSize="8" fill={CREAM}
              fontFamily="'DM Mono',monospace">YOU</text>
            {/* Scale */}
            <line x1={18} y1={306} x2={58} y2={306} stroke={MUT} strokeWidth=".8"/>
            <line x1={18} y1={302} x2={18} y2={310} stroke={MUT} strokeWidth=".8"/>
            <line x1={58} y1={302} x2={58} y2={310} stroke={MUT} strokeWidth=".8"/>
            <text x={38} y={300} textAnchor="middle" fontSize="7.5" fill={MUT}
              fontFamily="'DM Mono',monospace">~1 km</text>
          </svg>
        </div>

        {/* Bottom panel */}
        <div style={{ padding:"20px",maxWidth:460,margin:"0 auto",paddingBottom:60 }}>
          {active && (
            <>
              {/* Active store headline */}
              <div className="a1" style={{ marginBottom:18 }}>
                <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:MUT,
                  letterSpacing:".5px",marginBottom:6 }}>SELECTED DESTINATION</p>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <h3 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,color:LIME }}>
                    {active.name}
                  </h3>
                  <Mono style={{ fontWeight:500,fontSize:22,color:CREAM }}>
                    {cd.cur}{active.totalCost.toFixed(2)}
                  </Mono>
                </div>
              </div>

              {/* Transport options */}
              <div className="a2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
                {[
                  { icon:"◉", label:"Walk", val:`${active.walkMinutes} min`, sub:`${active.distance} km` },
                  { icon:"◈", label:"Drive", val:`${active.driveMinutes} min`, sub:`${active.distance} km` },
                ].map(({icon,label,val,sub})=>(
                  <div key={label} style={{ background:CARD,border:`0.5px solid ${BDR}`,
                    borderRadius:13,padding:"14px" }}>
                    <div style={{ color:LIME,fontSize:22,marginBottom:7 }}>{icon}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:CREAM }}>{val}</div>
                    <div style={{ fontSize:11,color:MUT,marginTop:2 }}>{label} · {sub}</div>
                  </div>
                ))}
              </div>

              {/* Store switcher */}
              <div className="a3" style={{ marginBottom:20 }}>
                <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:MUT,
                  letterSpacing:".5px",marginBottom:10 }}>SWITCH DESTINATION</p>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {[...stores].sort((a,b)=>a.totalCost-b.totalCost).map(store=>(
                    <button key={store.name} onClick={()=>setMapStore(store.name)}
                      style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                        background: store.name===mapStore ? "rgba(196,255,60,.06)" : CARD,
                        border:`0.5px solid ${store.name===mapStore?LIME:BDR}`,
                        borderRadius:11,padding:"12px 14px",cursor:"pointer",transition:"all .2s" }}>
                      <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                        <span style={{ width:8,height:8,borderRadius:"50%",
                          background: store.name===mapStore?LIME:MUT,flexShrink:0 }}/>
                        <span style={{ fontSize:14,color: store.name===mapStore?LIME:CREAM,
                          fontFamily:"'Outfit',sans-serif" }}>{store.name}</span>
                      </div>
                      <div style={{ display:"flex",gap:14,alignItems:"center" }}>
                        <Mono style={{ fontSize:12,color:MUT }}>{store.driveMinutes} min</Mono>
                        <Mono style={{ fontSize:14,color: store.name===mapStore?LIME:CREAM }}>
                          {cd.cur}{store.totalCost.toFixed(2)}
                        </Mono>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Maps CTA */}
              <button className="a4 btn-lime"
                onClick={()=>{
                  const q = encodeURIComponent(active.name+" supermarket near me");
                  window.open(`https://www.google.com/maps/search/${q}`,"_blank");
                }}
                style={{ width:"100%",padding:"17px",borderRadius:14,border:"none",
                  background:LIME,color:"#0A0A08",
                  fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,
                  cursor:"pointer",letterSpacing:"-.3px" }}>
                Open in Google Maps →
              </button>
            </>
          )}
        </div>
      </Body>
    );
  }

  return null;
}