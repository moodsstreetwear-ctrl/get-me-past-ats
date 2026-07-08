// Hiring-coach UI polish layer: keeps the scanner engine, but shows only user-useful conclusions.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const clean = (v) => String(v || "").replace(/\s+/g, " ").trim();
  const lower = (v) => clean(v).toLowerCase();
  const has = (body, words) => words.filter(w => lower(body).includes(w));
  const uniq = (items) => [...new Set(items.map(clean).filter(Boolean))];

  const FAMILIES = [
    { id:"it", title:"IT Help Desk / Technical Support", group:"IT Support", proof:["windows","password","ticket","troubleshoot","hardware","printer","workstation","network","technical support","user support","microsoft office","active directory"], jobs:["Help Desk Technician","Desktop Support Technician","IT Support Specialist","Computer Support Specialist","Service Desk Analyst"] },
    { id:"manufacturing", title:"Manufacturing / Production", group:"Manufacturing & Production", proof:["machine","production","quality","safety","material","forklift","assembly","warehouse","pallet","equipment","operator","12-hour"], jobs:["Machine Operator","Production Worker","Manufacturing Associate","Assembly Technician","Material Handler"] },
    { id:"maintenance", title:"Industrial Maintenance", group:"Maintenance", proof:["maintenance","plc","electrical","mechanical","hydraulic","pneumatic","schematic","vfd","preventive maintenance","cmms","conveyor","motor","bearing","gearbox","sensor","repair"], jobs:["Maintenance Technician","Industrial Maintenance Technician","Maintenance Helper","Facilities Technician","Manufacturing Technician"] },
    { id:"electrical", title:"Electrical Helper / Apprentice", group:"Electrical", proof:["electrical","wiring","outlet","fixture","conduit","panel","breaker","hand tools","power tools","multimeter","installation"], jobs:["Electrical Helper","Apprentice Electrician","Low Voltage Technician","Residential Electrical Helper"] },
    { id:"driving", title:"Driver / Delivery / CDL", group:"Driving", proof:["cdl","driver","delivery","route","dot","pre-trip","post-trip","twic","mvr","safe driving"], jobs:["Delivery Driver","Route Driver","CDL Trainee","Warehouse Driver"] },
    { id:"service", title:"Retail / Customer Service", group:"Customer Service", proof:["customer","cashier","pos","sales","returns","inventory","stock","front desk","phone","service"], jobs:["Customer Service Representative","Retail Associate","Front Desk Associate","Call Center Representative"] },
    { id:"admin", title:"Office / Administrative Support", group:"Office Support", proof:["office","data entry","records","scheduling","email","excel","microsoft","documents","filing","administrative"], jobs:["Office Assistant","Administrative Assistant","Data Entry Clerk","Records Clerk","Receptionist"] },
    { id:"property", title:"Property Management", group:"Property Management", proof:["property","tenant","lease","vendor","budget","work order","yardi","inspection","contractor","maintenance coordination"], jobs:["Assistant Property Manager","Property Manager","Leasing Coordinator","Facilities Coordinator"] },
    { id:"healthcare", title:"Healthcare Support", group:"Healthcare Support", proof:["patient","medical","clinical","cna","vitals","records","appointment","hipaa","care","clinic"], jobs:["Medical Office Assistant","Patient Service Representative","CNA","Caregiver"] }
  ];

  const BLOCKERS = [
    { term:"preventive maintenance", label:"No preventive maintenance proof found", why:"This job depends on scheduled equipment maintenance and repair." },
    { term:"plc", label:"No PLC troubleshooting proof found", why:"PLC troubleshooting is a core maintenance requirement in this posting." },
    { term:"cmms", label:"No CMMS documentation proof found", why:"The job asks for maintenance work-order documentation." },
    { term:"schematic", label:"No electrical schematic proof found", why:"Reading schematics is important for troubleshooting equipment." },
    { term:"hydraulic", label:"No hydraulic system proof found", why:"The posting asks for hydraulic troubleshooting or repair." },
    { term:"pneumatic", label:"No pneumatic system proof found", why:"The posting asks for pneumatic troubleshooting or repair." },
    { term:"vfd", label:"No VFD proof found", why:"VFD experience is listed as automation/equipment proof." },
    { term:"active directory", label:"No Active Directory proof found", why:"This is a common core tool for help desk roles." },
    { term:"ticket", label:"No ticketing system proof found", why:"Support jobs need documented issue tracking." },
    { term:"license", label:"Required license not shown", why:"Required licenses can block an interview if missing." },
    { term:"certification", label:"Required certification not shown", why:"Required certifications can block an interview if missing." },
    { term:"degree", label:"Required degree not shown", why:"A required degree can be a hard screen for some employers." },
    { term:"clearance", label:"Required clearance not shown", why:"Security clearance can be a hard requirement." },
    { term:"cdl", label:"CDL not shown", why:"A CDL is a hard requirement for driving roles that require it." }
  ];

  const STRENGTH_GROUPS = [
    { title:"Manufacturing", helps:"Helps with production, equipment, operator, and maintenance-adjacent roles.", terms:["machine","production","quality","safety","equipment","operator","assembly","material","forklift"] },
    { title:"Electrical", helps:"Helps with electrical helper, maintenance helper, and installation-focused roles.", terms:["electrical","wiring","outlet","fixture","conduit","panel","breaker","installation","hand tools","power tools"] },
    { title:"Maintenance", helps:"Helps with repair, troubleshooting, PM, and industrial maintenance roles.", terms:["maintenance","repair","troubleshoot","preventive maintenance","plc","hydraulic","pneumatic","schematic","cmms","conveyor","motor"] },
    { title:"Inspection & Testing", helps:"Helps with quality, field inspection, testing, and documentation roles.", terms:["inspection","inspect","testing","measure","documentation","records","quality","defect"] },
    { title:"IT Support", helps:"Helps with help desk, desktop support, and technical support roles.", terms:["windows","password","ticket","technical support","hardware","software","printer","workstation","network","user support"] },
    { title:"Customer Service", helps:"Helps with customer-facing support, front desk, and service roles.", terms:["customer","service","phone","sales","pos","returns","communication"] }
  ];

  function classify(source) {
    return FAMILIES.map(f => ({...f, hits:has(source, f.proof)}))
      .filter(f => f.hits.length)
      .sort((a,b) => b.hits.length - a.hits.length);
  }
  const resumeText = () => $("resumeText")?.value || "";
  const jobText = () => $("jobText")?.value || "";
  const rawScore = () => {
    const el = $("scoreValue");
    const current = parseInt(clean(el?.textContent), 10) || 0;
    const adjusted = parseInt(el?.dataset.adjustedScore || "", 10);
    const stored = parseInt(el?.dataset.rawScore || "", 10);
    if (Number.isFinite(stored) && Number.isFinite(adjusted) && current === adjusted) return stored;
    if (el) el.dataset.rawScore = String(current);
    return current;
  };

  function jobTitle() {
    const lines = String(jobText()).split("\n").map(clean).filter(Boolean);
    const bad = /responsibilit|qualification|requirement|preferred|location|about|we are|pay|schedule|benefit/i;
    const line = lines.find(x => x.length <= 80 && !bad.test(x) && /technician|operator|manager|specialist|assistant|driver|associate|developer|support|helper|clerk|coordinator|representative/i.test(x));
    if (line) return line.replace(/^#+\s*/, "");
    return classify(jobText())[0]?.title || "Closest matching role";
  }

  function adjustedScore() {
    const raw = rawScore();
    const r = classify(resumeText());
    const j = classify(jobText())[0];
    let score = raw;
    if (!j) return score;
    const direct = r.find(x => x.id === j.id);
    if (direct) score = Math.max(score, Math.min(88, 44 + direct.hits.length * 7));
    if (j.id === "maintenance") {
      const transfer = (r.find(x => x.id === "manufacturing")?.hits.length || 0) + (r.find(x => x.id === "electrical")?.hits.length || 0);
      if (transfer >= 5) score = Math.max(score, 58);
      else if (transfer >= 3) score = Math.max(score, 48);
    }
    if (raw < 35 && r.length && score < 45) score = 42;
    return Math.min(98, Math.round(score));
  }

  function setScore(score) {
    const value = $("scoreValue"), bar = $("scoreBar"), panel = document.querySelector(".score-panel");
    if (value) { value.textContent = String(score); value.dataset.adjustedScore = String(score); }
    if (bar) bar.style.width = `${score}%`;
    if (panel) {
      panel.classList.remove("score-low","score-mid","score-high");
      panel.classList.add(score >= 80 ? "score-high" : score >= 55 ? "score-mid" : "score-low");
    }
  }

  function topMissing() {
    const job = lower(jobText()), resume = lower(resumeText());
    return BLOCKERS.filter(b => job.includes(b.term) && !resume.includes(b.term)).slice(0, 5);
  }

  function scoreReason(score) {
    const job = jobTitle();
    const r = classify(resumeText());
    const j = classify(jobText())[0];
    const topResume = r[0];
    const missing = topMissing().slice(0,3).map(x => x.label.replace(/^No /,"no ").replace(/ proof found$/,""));
    if (j?.id === "maintenance" && topResume?.id === "manufacturing") {
      return `<strong>Strong manufacturing background.</strong> Missing direct industrial maintenance proof${missing.length ? `: ${esc(missing.join(", "))}.` : "."}`;
    }
    if (j && topResume && j.id !== topResume.id) return `<strong>${esc(topResume.title)} proof found.</strong> This posting is closer to <strong>${esc(job)}</strong>.`;
    if (score >= 85) return `<strong>Strong match.</strong> Your resume shows most core proof for <strong>${esc(job)}</strong>.`;
    if (score >= 65) return `<strong>Fair match.</strong> Add the highest-impact missing proof before applying.`;
    return `<strong>Weak match.</strong> Core hiring proof is limited for <strong>${esc(job)}</strong>.`;
  }

  function confidence() {
    const totalHits = classify(resumeText()).reduce((sum, f) => sum + f.hits.length, 0) + classify(jobText()).reduce((sum, f) => sum + f.hits.length, 0);
    if (totalHits >= 14) return "High confidence";
    if (totalHits >= 7) return "Medium confidence";
    return "Low confidence";
  }

  function renderScore() {
    document.querySelector(".score-panel h3") && (document.querySelector(".score-panel h3").textContent = "Resume Match");
    const score = adjustedScore(); setScore(score);
    const raised = classify(resumeText())[0]?.hits.slice(0,4) || [];
    const reduced = topMissing().slice(0,4).map(x => x.label.replace(/^No /, "").replace(/ proof found$/, ""));
    const message = $("scoreMessage");
    if (message) message.innerHTML = `${scoreReason(score)}<div class="score-mini"><span>${confidence()}</span>${raised.length ? `<span>Raised by: ${esc(raised.join(", "))}</span>` : ""}${reduced.length ? `<span>Reduced by: ${esc(reduced.join(", "))}</span>` : ""}</div>`;
  }

  function renderApply() {
    const box = $("applyDecisionOutput"); if (!box) return;
    const score = adjustedScore();
    const missing = topMissing();
    let label = "Apply Now", tone = "good", reason = "Your resume shows the main proof this employer is looking for.";
    if (score < 55) { label = "Do Not Apply Yet"; tone = "danger"; reason = "This resume is missing the core proof needed for this job."; }
    else if (score < 75 || missing.length) { label = "Apply After Fixes"; tone = "caution"; reason = missing[0] ? `${missing[0].label}. ${missing[0].why}` : "Related proof is present, but important hiring evidence is still missing."; }
    box.innerHTML = `<div class="decision-card ${tone}"><h4>${esc(label)}</h4><p>${esc(reason)}</p></div>`;
  }

  function renderJobType() {
    const box = $("jobTypeOutput"); if (!box) return;
    const card = box.closest("article");
    card?.querySelector(".eyebrow") && (card.querySelector(".eyebrow").textContent = "Job Type");
    card?.querySelector("h3") && (card.querySelector("h3").textContent = "This job looks like");
    box.innerHTML = `<div class="simple-result-card"><h4>${esc(jobTitle())}</h4><p>Detected from the job description.</p></div>`;
  }

  function renderBlockers() {
    const container = $("missingKeywords"); if (!container) return;
    const card = container.closest("article");
    card?.querySelector(".eyebrow") && (card.querySelector(".eyebrow").textContent = "Missing Proof");
    card?.querySelector("h3") && (card.querySelector("h3").textContent = "Biggest Interview Blockers");
    const blockers = topMissing();
    if (!blockers.length) { container.innerHTML = `<p class="empty-proof">✅ None detected. Your resume demonstrates the core requirements for this position.</p>`; return; }
    container.innerHTML = `<div class="blocker-card-list">${blockers.map((b,i) => `<div class="blocker-detail ${i === 0 ? "critical" : "important"}"><strong>${esc(b.label)}</strong><p>${esc(b.why)}</p></div>`).join("")}</div>`;
  }

  function renderStrengths() {
    const container = $("matchedKeywords"); if (!container) return;
    const card = container.closest("article");
    const groups = STRENGTH_GROUPS.map(g => ({...g, hits:has(resumeText(), g.terms)})).filter(g => g.hits.length).slice(0,4);
    if (!groups.length) { card?.classList.add("gmpt-hidden"); return; }
    card?.classList.remove("gmpt-hidden");
    card?.querySelector(".eyebrow") && (card.querySelector(".eyebrow").textContent = "Proof Already Found");
    card?.querySelector("h3") && (card.querySelector("h3").textContent = "Strongest proof in your resume");
    container.innerHTML = `<div class="strength-groups">${groups.map(g => `<div class="strength-card"><strong>${esc(g.title)}</strong><p>${esc(g.helps)}</p><div>${g.hits.slice(0,5).map(h => `<span class="chip">${esc(h)}</span>`).join("")}</div></div>`).join("")}</div>`;
  }

  function groupedMatches() {
    const currentScore = adjustedScore();
    return classify(resumeText()).slice(0,3).map(f => ({
      group:f.group,
      jobs:f.jobs.slice(0, f.id === "manufacturing" ? 3 : 2).map((job,i) => ({ job, score:Math.max(60, Math.min(98, 58 + f.hits.length * 7 - i * 3 - (currentScore > 80 ? 5 : 0))), reason: f.hits.slice(0,4) }))
    }));
  }

  function renderRecommendations() {
    const box = $("diagnosisOutput"); if (!box) return;
    const card = box.closest("article");
    card?.querySelector(".eyebrow") && (card.querySelector(".eyebrow").textContent = "Highest Resume Matches");
    card?.querySelector("h3") && (card.querySelector("h3").textContent = "Jobs you're already competitive for");
    const groups = groupedMatches();
    if (!groups.length) { box.innerHTML = `<div class="simple-result-card"><h4>Try a closer job post.</h4><p>This resume does not give enough clear proof to recommend better matches yet.</p></div>`; return; }
    box.innerHTML = `<div class="match-groups">${groups.map(g => `<div class="match-group"><h4>${esc(g.group)}</h4>${g.jobs.map(j => `<div class="better-match-card"><strong>${esc(j.job)} <span>${j.score}%</span></strong><p>${esc(shortReason(j.job, j.reason))}</p></div>`).join("")}</div>`).join("")}</div>`;
  }
  function shortReason(job, hits) {
    if (/electrical|electrician/i.test(job)) return "Previous electrical helper, wiring, and installation proof.";
    if (/maintenance/i.test(job)) return "Related equipment experience with some maintenance-adjacent proof.";
    if (/help desk|support|desktop/i.test(job)) return "Technical support, troubleshooting, and user-support proof.";
    if (/operator|production|manufacturing|assembly/i.test(job)) return "Strong machine operation and manufacturing experience.";
    return `Your resume already shows ${hits.join(", ")}.`;
  }

  function renderGenerator() {
    const section = $("rewrite"); if (!section) return;
    section.querySelector("h2") && (section.querySelector("h2").textContent = "Resume Generator");
    const p = section.querySelector(".section-heading p:last-child");
    if (p) p.textContent = "Next feature: generate a full ATS-ready resume using only proven experience.";
    if (!section.querySelector(".truth-note")) section.insertAdjacentHTML("beforeend", `<p class="truth-note">Always use truthful ATS wording. Never claim experience you haven't actually performed.</p>`);
  }

  function polishReport() { renderScore(); renderApply(); renderJobType(); renderRecommendations(); renderBlockers(); renderStrengths(); renderGenerator(); }

  function setupDrawerUX() {
    const drawer = $("account"), authCard = $("authCard");
    if (!drawer || !authCard || drawer.dataset.polished === "true") return;
    drawer.dataset.polished = "true";
    const quick = document.createElement("div");
    quick.className = "account-quick-actions";
    quick.innerHTML = `<button class="account-action-button primary-action" type="button" data-account-open="create">Create Account</button><button class="account-action-button" type="button" data-account-open="signin">Sign In</button>`;
    drawer.insertBefore(quick, drawer.firstChild);
    const back = document.createElement("button");
    back.className = "account-back-button"; back.type = "button"; back.textContent = "‹ Back to account";
    authCard.insertBefore(back, authCard.firstChild);
    function openAccount(mode) {
      drawer.classList.add("account-open");
      const switchBtn = $("switchAuthBtn"), authTitle = $("authTitle"), authEyebrow = $("authEyebrow");
      if (mode === "signin" && switchBtn && /sign in/i.test(switchBtn.textContent) && authTitle && /create/i.test(authTitle.textContent)) switchBtn.click();
      else if (mode === "create" && switchBtn && /create/i.test(switchBtn.textContent) && authTitle && /sign in/i.test(authTitle.textContent)) switchBtn.click();
      if (authEyebrow) authEyebrow.textContent = mode === "signin" ? "Sign in" : "Create account";
      setTimeout(() => authCard.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
    }
    quick.addEventListener("click", e => { const b = e.target.closest("[data-account-open]"); if (b) openAccount(b.dataset.accountOpen); });
    back.addEventListener("click", () => drawer.classList.remove("account-open"));
    document.querySelectorAll("[data-open-account]").forEach(b => b.addEventListener("click", () => openAccount("create")));
    const passwordToggle = $("togglePasswordBtn"); if (passwordToggle) passwordToggle.textContent = "Show";
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupDrawerUX();
    const analyze = $("analyzeBtn"); if (analyze) analyze.addEventListener("click", () => setTimeout(polishReport, 160));
    const results = $("results"); if (results) new MutationObserver(() => setTimeout(polishReport, 40)).observe(results, { childList:true, subtree:true, characterData:true });
  });
})();
