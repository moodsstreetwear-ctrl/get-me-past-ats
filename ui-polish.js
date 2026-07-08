// Hiring-coach UI polish layer: keeps the scanner engine, but shows only user-useful conclusions.
(function () {
  const $ = (id) => document.getElementById(id);

  const FILLER_TERMS = [
    "team", "teamwork", "team player", "communication", "reliable", "detail", "detail oriented",
    "fast paced", "fast-paced", "schedule", "weekend", "overtime", "night shift", "day shift",
    "standing", "stand", "lift", "lifting", "physical", "basic", "clean", "cleaning", "work environment",
    "customer service"
  ];

  const FAMILY_RULES = [
    { id: "it_support", title: "IT Help Desk / Technical Support", proof: ["windows", "password", "ticket", "troubleshoot", "hardware", "printer", "workstation", "network", "technical support", "user support", "microsoft office"], jobs: ["Help Desk Technician", "Desktop Support Technician", "IT Support Specialist", "Computer Support Specialist", "Service Desk Analyst"] },
    { id: "manufacturing", title: "Manufacturing / Production", proof: ["machine", "production", "quality", "safety", "material", "forklift", "assembly", "warehouse", "pallet", "equipment"], jobs: ["Machine Operator", "Production Worker", "Manufacturing Associate", "Assembly Technician", "Material Handler"] },
    { id: "maintenance", title: "Industrial Maintenance", proof: ["maintenance", "plc", "electrical", "mechanical", "hydraulic", "pneumatic", "schematic", "vfd", "preventive maintenance", "cmms", "conveyor", "motor", "bearing", "gearbox", "sensor"], jobs: ["Maintenance Technician", "Industrial Maintenance Technician", "Maintenance Helper", "Facilities Technician", "Manufacturing Technician"] },
    { id: "electrical", title: "Electrical Helper / Apprentice", proof: ["electrical", "wiring", "outlet", "fixture", "conduit", "panel", "breaker", "hand tools", "power tools", "multimeter"], jobs: ["Electrical Helper", "Apprentice Electrician", "Low Voltage Technician", "Residential Electrical Helper", "Maintenance Helper"] },
    { id: "driving", title: "Driver / Delivery / CDL", proof: ["cdl", "driver", "delivery", "route", "dot", "pre-trip", "post-trip", "twic", "mvr", "safe driving"], jobs: ["Delivery Driver", "Route Driver", "CDL Trainee", "Warehouse Driver", "Driver Helper"] },
    { id: "retail_service", title: "Retail / Customer Service", proof: ["customer", "cashier", "pos", "sales", "returns", "inventory", "stock", "front desk", "phone", "service"], jobs: ["Customer Service Representative", "Retail Associate", "Front Desk Associate", "Call Center Representative", "Sales Associate"] },
    { id: "admin_office", title: "Office / Administrative Support", proof: ["office", "data entry", "records", "scheduling", "email", "excel", "microsoft", "documents", "filing", "administrative"], jobs: ["Office Assistant", "Administrative Assistant", "Data Entry Clerk", "Records Clerk", "Receptionist"] },
    { id: "property_management", title: "Property Management", proof: ["property", "tenant", "lease", "vendor", "budget", "work order", "yardi", "inspection", "contractor", "maintenance coordination"], jobs: ["Assistant Property Manager", "Property Manager", "Leasing Coordinator", "Facilities Coordinator", "Tenant Services Coordinator"] },
    { id: "healthcare_support", title: "Healthcare Support", proof: ["patient", "medical", "clinical", "cna", "vitals", "records", "appointment", "hipaa", "care", "clinic"], jobs: ["Medical Office Assistant", "Patient Service Representative", "CNA", "Caregiver", "Medical Records Clerk"] }
  ];

  const CRITICAL_HINTS = [
    "license", "certification", "certified", "degree", "clearance", "endorsement", "cdl", "rn", "cpa", "osha", "twic",
    "plc", "scada", "wonderware", "aveva", "allen-bradley", "siemens", "vfd", "robot", "schematic",
    "active directory", "windows server", "network", "ticket", "ticketing", "hardware", "software", "password", "user account",
    "years", "experience", "maintenance", "electrical", "mechanical", "hydraulic", "pneumatic", "preventive maintenance",
    "python", "java", "javascript", "sql", "excel", "quickbooks", "yardi", "sap", "forklift", "cmms"
  ];

  function text(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
  function norm(value) { return text(value).toLowerCase(); }
  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }
  function unique(items) {
    const seen = new Set();
    return items.map(text).filter(item => {
      const key = norm(item);
      if (!item || key.includes("nothing found here") || key.includes("smart match") || key.includes("coach card") || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function isFiller(item) {
    const value = norm(item);
    return FILLER_TERMS.some(term => value === term || value.includes(term));
  }
  function importanceScore(item) {
    const value = norm(item);
    let score = 0;
    if (CRITICAL_HINTS.some(term => value.includes(term))) score += 8;
    if (/\d\+?\s*years?|year/i.test(item)) score += 6;
    if (/required|must|minimum|license|certification|degree/i.test(item)) score += 6;
    if (/preferred|plus|nice to have/i.test(item)) score -= 2;
    if (isFiller(item)) score -= 8;
    if (value.length <= 3) score -= 2;
    return score;
  }
  function extractChipText(container) {
    if (!container) return [];
    return unique([...container.querySelectorAll(".chip, li")].map(item => item.textContent));
  }
  function getVisibleScore() {
    const raw = parseInt(text($("scoreValue")?.textContent), 10);
    return Number.isFinite(raw) ? raw : 0;
  }
  function getRawScore() {
    const el = $("scoreValue");
    if (!el) return 0;
    const current = getVisibleScore();
    const storedRaw = parseInt(el.dataset.rawScore || "", 10);
    const storedAdjusted = parseInt(el.dataset.adjustedScore || "", 10);
    if (Number.isFinite(storedRaw) && Number.isFinite(storedAdjusted) && current === storedAdjusted) return storedRaw;
    el.dataset.rawScore = String(current);
    return current;
  }
  function classifyText(sourceText) {
    const source = norm(sourceText);
    return FAMILY_RULES.map(rule => {
      const hits = rule.proof.filter(term => source.includes(term));
      return { ...rule, hits, hitCount: hits.length, score: Math.min(98, 54 + hits.length * 7) };
    }).filter(rule => rule.hitCount > 0).sort((a, b) => b.hitCount - a.hitCount || b.score - a.score);
  }
  function classifyResume(resumeText) { return classifyText(resumeText).slice(0, 2); }
  function classifyJob() { return classifyText($("jobText")?.value || ""); }
  function titleFromJobText() {
    const raw = String($("jobText")?.value || "").split("\n").map(line => text(line)).filter(Boolean);
    const bad = /responsibilit|qualification|requirement|preferred|location|about|we are|pay|schedule|benefit/i;
    const candidate = raw.find(line => line.length <= 80 && !bad.test(line) && /technician|operator|manager|specialist|assistant|driver|associate|developer|support|helper|clerk|coordinator|representative/i.test(line));
    return candidate ? candidate.replace(/^#+\s*/, "") : "";
  }
  function detectJobLabel() {
    const source = $("jobTypeOutput");
    const body = text(source ? source.innerText : "");
    const looksLike = body.match(/This job looks like:\s*(.*?)\s*Job family:/i);
    if (looksLike && looksLike[1] && !/job type detected/i.test(looksLike[1])) return looksLike[1];
    const family = body.match(/Job family:\s*(.*?)\s*Confidence:/i);
    if (family && family[1] && !/job type detected/i.test(family[1])) return family[1];
    const title = titleFromJobText();
    if (title) return title;
    const jobFamily = classifyJob()[0];
    if (jobFamily) return jobFamily.title;
    return "Closest matching role";
  }
  function getAdjustedScore(rawScore) {
    const resumeFamilies = classifyResume($("resumeText")?.value || "");
    const jobFamily = classifyJob()[0];
    if (!jobFamily) return rawScore;
    const direct = resumeFamilies.find(f => f.id === jobFamily.id);
    const manufacturing = resumeFamilies.find(f => f.id === "manufacturing");
    const electrical = resumeFamilies.find(f => f.id === "electrical");
    let score = rawScore;
    if (direct) score = Math.max(score, Math.min(88, 44 + direct.hitCount * 7));
    if (jobFamily.id === "maintenance") {
      const transferHits = (manufacturing?.hitCount || 0) + (electrical?.hitCount || 0);
      if (transferHits >= 5) score = Math.max(score, 58);
      else if (transferHits >= 3) score = Math.max(score, 48);
    }
    if (jobFamily.id === "it_support") {
      const directHits = direct?.hitCount || 0;
      if (directHits >= 5) score = Math.max(score, 82);
      else if (directHits >= 3) score = Math.max(score, 66);
    }
    if (rawScore < 35 && resumeFamilies.length && score < 45) score = Math.max(score, 42);
    return Math.min(98, Math.round(score));
  }
  function setDisplayedScore(score) {
    const value = $("scoreValue");
    const bar = $("scoreBar");
    if (value) {
      value.textContent = String(score);
      value.dataset.adjustedScore = String(score);
    }
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, score))}%`;
  }
  function matchReason(jobLabel, score) {
    const resumeFamilies = classifyResume($("resumeText")?.value || "");
    const jobFamily = classifyJob()[0];
    const topResume = resumeFamilies[0];
    if (jobFamily?.id === "maintenance" && topResume?.id === "manufacturing") {
      return `Manufacturing and equipment experience found, but direct industrial maintenance proof is limited for <strong>${escapeHTML(jobLabel)}</strong>.`;
    }
    if (jobFamily && topResume && jobFamily.id !== topResume.id) {
      return `${escapeHTML(topResume.title)} proof found, but this posting is closer to <strong>${escapeHTML(jobLabel)}</strong>.`;
    }
    if (score >= 85) return `Strong match for <strong>${escapeHTML(jobLabel)}</strong>. The resume shows most core proof this job asks for.`;
    if (score >= 65) return `Fair match for <strong>${escapeHTML(jobLabel)}</strong>. Fix the biggest blockers before applying.`;
    return `Weak match for <strong>${escapeHTML(jobLabel)}</strong>. This resume is missing core hiring proof for this role.`;
  }
  function getScore() { return getAdjustedScore(getRawScore()); }
  function simplifyScore() {
    const title = document.querySelector(".score-panel h3");
    if (title) title.textContent = "Resume Match";
    const message = $("scoreMessage");
    if (!message) return;
    const rawScore = getRawScore();
    const score = getAdjustedScore(rawScore);
    setDisplayedScore(score);
    const job = detectJobLabel();
    message.innerHTML = matchReason(job, score);
  }
  function simplifyApplyDecision() {
    const box = $("applyDecisionOutput");
    if (!box) return;
    const score = getScore();
    const raw = text(box.innerText);
    const saysNo = /do not apply|do_not_apply|not apply|weak evidence|wrong job/i.test(raw);
    const saysCareful = /confirm|careful|only if true/i.test(raw);
    let label = "Apply Now", tone = "good", reason = "Your experience closely matches the primary requirements of this position.";
    if (saysNo || score < 55) { label = "Do Not Apply Yet"; tone = "danger"; reason = "This resume does not currently show enough core proof for this position."; }
    else if (saysCareful || score < 75) { label = "Apply After Fixes"; tone = "caution"; reason = "The resume has related proof, but important hiring evidence is still missing."; }
    box.innerHTML = `<div class="decision-card ${tone}"><h4>${escapeHTML(label)}</h4><p>${escapeHTML(reason)}</p></div>`;
  }
  function buildBlockers() {
    const missing = extractChipText($("missingKeywords"));
    const fromRedFlags = extractChipText($("redFlags"));
    return unique([...missing, ...fromRedFlags])
      .filter(item => !/worksite|schedule|nothing found|smart match|coach card|fast-paced|team-based/i.test(item))
      .map(item => ({ item, score: importanceScore(item) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item)
      .slice(0, 6);
  }
  function simplifyMissingProof() {
    const container = $("missingKeywords");
    if (!container) return;
    const blockers = buildBlockers();
    const score = getScore();
    const card = container.closest("article");
    const heading = card?.querySelector("h3");
    const eyebrow = card?.querySelector(".eyebrow");
    if (eyebrow) eyebrow.textContent = "Missing Proof";
    if (heading) heading.textContent = "Biggest Interview Blockers";
    if (!blockers.length) {
      container.innerHTML = score >= 75 ? `<p class="empty-proof">✅ None detected. Your resume demonstrates the core requirements for this position.</p>` : `<p class="empty-proof">No clean blocker list was detected. Try a more detailed job post for a sharper scan.</p>`;
      return;
    }
    const critical = blockers.filter(item => importanceScore(item) >= 10).slice(0, 4);
    const important = blockers.filter(item => !critical.includes(item)).slice(0, 4);
    container.innerHTML = `<div class="blocker-list">${critical.length ? `<p class="blocker-label critical">Critical</p>${critical.map(item => `<span class="chip blocker critical">${escapeHTML(item)}</span>`).join("")}` : ""}${important.length ? `<p class="blocker-label important">Important</p>${important.map(item => `<span class="chip blocker important">${escapeHTML(item)}</span>`).join("")}` : ""}</div>`;
  }
  function simplifyProofFound() {
    const container = $("matchedKeywords");
    if (!container) return;
    const card = container.closest("article");
    const items = extractChipText(container).filter(item => !isFiller(item)).sort((a, b) => importanceScore(b) - importanceScore(a)).slice(0, 12);
    if (!items.length) { if (card) card.classList.add("gmpt-hidden"); return; }
    if (card) card.classList.remove("gmpt-hidden");
    const heading = card?.querySelector("h3");
    const eyebrow = card?.querySelector(".eyebrow");
    if (eyebrow) eyebrow.textContent = "Proof Already Found";
    if (heading) heading.textContent = "Strongest proof in your resume";
    container.innerHTML = items.map(item => `<span class="chip">${escapeHTML(item)}</span>`).join("");
  }
  function buildBetterMatches() {
    const resumeText = $("resumeText")?.value || "";
    const currentScore = getScore();
    const families = classifyResume(resumeText);
    if (!families.length) return [];
    return families.flatMap(family => family.jobs.slice(0, 3).map((job, index) => ({
      job,
      score: Math.max(62, Math.min(98, family.score - index * 3 - (currentScore > 80 ? 6 : 0))),
      reason: `Your resume already shows ${family.proof.filter(term => norm(resumeText).includes(term)).slice(0, 4).join(", ")}.`
    }))).sort((a, b) => b.score - a.score).slice(0, 5);
  }
  function simplifyDirection() {
    const box = $("diagnosisOutput");
    if (!box) return;
    const card = box.closest("article");
    const eyebrow = card?.querySelector(".eyebrow");
    const heading = card?.querySelector("h3");
    if (eyebrow) eyebrow.textContent = "Where You'll Get More Interviews";
    if (heading) heading.textContent = "Better jobs for this resume";
    const score = getScore();
    const matches = buildBetterMatches();
    if (score >= 80) { box.innerHTML = `<div class="simple-result-card"><h4>Stay focused on this job type.</h4><p>This resume already has enough proof to target roles like this one. Use the generator next when it is ready.</p></div>`; return; }
    if (!matches.length) { box.innerHTML = `<div class="simple-result-card"><h4>Try a closer job post.</h4><p>This resume does not give enough clear proof to recommend better matches yet.</p></div>`; return; }
    box.innerHTML = `<div class="better-match-list">${matches.map(match => `<div class="better-match-card"><strong>${escapeHTML(match.job)} <span>${match.score}%</span></strong><p>${escapeHTML(match.reason)}</p></div>`).join("")}</div>`;
  }
  function simplifyJobType() {
    const box = $("jobTypeOutput");
    if (!box) return;
    const label = detectJobLabel();
    const card = box.closest("article");
    const eyebrow = card?.querySelector(".eyebrow");
    const heading = card?.querySelector("h3");
    if (eyebrow) eyebrow.textContent = "Job Type";
    if (heading) heading.textContent = "This job looks like";
    box.innerHTML = `<div class="simple-result-card"><h4>${escapeHTML(label)}</h4><p>Detected from the job description.</p></div>`;
  }
  function simplifyGenerator() {
    const section = $("rewrite");
    if (!section) return;
    const h2 = section.querySelector("h2");
    const p = section.querySelector(".section-heading p:last-child");
    if (h2) h2.textContent = "Resume Generator";
    if (p) p.textContent = "Next feature: generate a full ATS-ready resume using only proven experience.";
  }
  function polishReport() { simplifyScore(); simplifyApplyDecision(); simplifyJobType(); simplifyMissingProof(); simplifyProofFound(); simplifyDirection(); simplifyGenerator(); }

  function setupDrawerUX() {
    const drawer = $("account"), authCard = $("authCard");
    if (!drawer || !authCard || drawer.dataset.polished === "true") return;
    drawer.dataset.polished = "true";
    const quick = document.createElement("div");
    quick.className = "account-quick-actions";
    quick.innerHTML = `<button class="account-action-button primary-action" type="button" data-account-open="create">Create Account</button><button class="account-action-button" type="button" data-account-open="signin">Sign In</button>`;
    drawer.insertBefore(quick, drawer.firstChild);
    const back = document.createElement("button");
    back.className = "account-back-button";
    back.type = "button";
    back.textContent = "‹ Back to account";
    authCard.insertBefore(back, authCard.firstChild);
    function openAccount(mode) {
      drawer.classList.add("account-open");
      const switchBtn = $("switchAuthBtn"), authTitle = $("authTitle"), authEyebrow = $("authEyebrow");
      if (mode === "signin" && switchBtn && /sign in/i.test(switchBtn.textContent) && authTitle && /create/i.test(authTitle.textContent)) switchBtn.click();
      else if (mode === "create" && switchBtn && /create/i.test(switchBtn.textContent) && authTitle && /sign in/i.test(authTitle.textContent)) switchBtn.click();
      if (authEyebrow) authEyebrow.textContent = mode === "signin" ? "Sign in" : "Create account";
      setTimeout(() => authCard.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
    quick.addEventListener("click", (event) => { const button = event.target.closest("[data-account-open]"); if (button) openAccount(button.dataset.accountOpen); });
    back.addEventListener("click", () => drawer.classList.remove("account-open"));
    document.querySelectorAll("[data-open-account]").forEach(button => button.addEventListener("click", () => openAccount("create")));
    const passwordToggle = $("togglePasswordBtn");
    if (passwordToggle) passwordToggle.textContent = "Show";
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupDrawerUX();
    const analyze = $("analyzeBtn");
    if (analyze) analyze.addEventListener("click", () => setTimeout(polishReport, 140));
    const results = $("results");
    if (results) new MutationObserver(() => setTimeout(polishReport, 35)).observe(results, { childList: true, subtree: true, characterData: true });
  });
})();
