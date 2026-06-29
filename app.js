const stopWords = new Set([
  "the", "and", "for", "with", "you", "your", "are", "that", "this", "from", "will", "have", "has", "our",
  "job", "work", "team", "must", "able", "ability", "position", "company", "their", "they", "all", "can", "may",
  "within", "other", "such", "into", "about", "each", "when", "where", "what", "who", "why", "how", "been",
  "than", "then", "also", "any", "not", "but", "more", "less", "per", "hour", "week", "day", "shift", "required"
]);

const presetKeywords = {
  general: ["reliable", "communication", "team", "safety", "quality", "training", "customer", "problem solving"],
  manufacturing: ["machine operation", "manufacturing", "production", "quality checks", "forklift", "safety", "equipment", "troubleshooting", "material handling", "rotating shifts", "12-hour shifts", "preventive maintenance"],
  maintenance: ["maintenance", "electrical", "troubleshooting", "repair", "installation", "hand tools", "power tools", "carpentry", "preventive maintenance", "safety", "work orders"],
  cdl: ["CDL", "TWIC", "DOT", "logistics", "delivery", "safety", "pre-trip", "route", "customer service", "equipment inspection"],
  entry: ["paid training", "entry level", "willing to learn", "reliable", "attendance", "safety", "team environment", "hands-on", "growth", "long term"]
};

const demoResume = `Harold Hilton Jr.
Aiken, SC | 803-357-1978 | haroldhiltonjr@gmail.com

SUMMARY
Reliable industrial and manufacturing worker with over 3 years of hands-on production experience. Skilled in machine operation, equipment monitoring, production flow, safety procedures, quality checks, material handling, cleaning, setup, and restarts. CDL-A holder with TWIC card.

SKILLS
Machine operation, equipment monitoring, forklift, material handling, production line support, quality control, safety procedures, hand tools, power tools, residential electrical, carpentry, troubleshooting, CDL-A, TWIC

EXPERIENCE
Progress Rail — Bearing Presser / Machine Operator
Dec 2023 – Jun 2026
- Operated bearing press equipment in a fast-paced industrial production environment.
- Scanned bearings, moved materials with forklift, wrapped pallets, and kept production moving safely.
- Completed machine cleaning, setup, restarts, and basic troubleshooting.

Shaw Industries — Twister Operator
Nov 2022 – Oct 2023
- Operated yarn production equipment across 84 positions per side on 12-hour shifts.
- Maintained production flow, cleaned machines, reset equipment, and supported quality standards.

MAC Electric — Residential Electrical Helper
Nov 2022 – Feb 2023
- Assisted with outlets, switches, ceiling fans, wiring, and basic electrical troubleshooting.

EDUCATION
South Aiken High School, 2017`;

const demoJob = `Machine Operator

Responsibilities:
- Operate multiple pieces of industrial manufacturing equipment in a fast-paced production environment.
- Monitor machines, perform quality checks, keep production flow moving, and follow safety procedures.
- Complete machine setup, cleaning, restarts, changeovers, and basic troubleshooting.
- Move materials, load equipment, and work as part of a team.

Requirements:
- Must be willing to work rotating swing shifts and 12-hour shifts.
- Must be willing to learn and operate multiple pieces of equipment.
- Previous industrial or manufacturing experience preferred.
- Stable work history, strong attendance, safety mindset, and ability to work in a team environment.`;

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9+.#\-\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .filter(word => word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word));
}

function phraseInText(phrase, text) {
  return normalize(text).includes(normalize(phrase));
}

function extractImportantKeywords(jobText, jobType) {
  const tokens = tokenize(jobText);
  const counts = new Map();
  tokens.forEach(token => counts.set(token, (counts.get(token) || 0) + 1));

  const topWords = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 28)
    .map(([word]) => word);

  const phraseBank = [
    "machine operation", "quality checks", "quality control", "material handling", "production flow", "safety procedures",
    "rotating shifts", "12-hour shifts", "preventive maintenance", "basic troubleshooting", "hand tools", "power tools",
    "entry level", "paid training", "team environment", "stable work history", "customer service", "work orders",
    "electrical troubleshooting", "equipment monitoring", "operate multiple pieces of equipment", "fast-paced production"
  ];

  const phrases = phraseBank.filter(phrase => phraseInText(phrase, jobText));
  const preset = presetKeywords[jobType] || [];
  const combined = [...new Set([...phrases, ...preset, ...topWords])];

  return combined.slice(0, 42);
}

function analyzeResume(resumeText, jobText, jobType) {
  const keywords = extractImportantKeywords(jobText, jobType);
  const matched = keywords.filter(keyword => phraseInText(keyword, resumeText));
  const missing = keywords.filter(keyword => !phraseInText(keyword, resumeText));

  const sectionChecks = [
    { name: "contact info", ok: /@|\d{3}[-.)\s]?\d{3}[-.\s]?\d{4}/i.test(resumeText) },
    { name: "summary", ok: /summary|profile|objective/i.test(resumeText) },
    { name: "skills", ok: /skills|certifications/i.test(resumeText) },
    { name: "experience", ok: /experience|work history|employment/i.test(resumeText) },
    { name: "education", ok: /education|school|ged|diploma|degree/i.test(resumeText) }
  ];

  const sectionScore = Math.round((sectionChecks.filter(s => s.ok).length / sectionChecks.length) * 20);
  const keywordScore = keywords.length ? Math.round((matched.length / keywords.length) * 70) : 0;
  const lengthBonus = resumeText.length > 800 && resumeText.length < 5000 ? 10 : resumeText.length >= 5000 ? 5 : 0;
  const score = Math.min(100, keywordScore + sectionScore + lengthBonus);

  return { keywords, matched, missing, sectionChecks, score };
}

function getScoreMessage(score) {
  if (score >= 85) return "Strong match. Clean up the red flags, then apply.";
  if (score >= 70) return "Good base. Add the missing keywords naturally before applying.";
  if (score >= 50) return "Decent start, but the resume may look too generic for this job post.";
  return "Weak match. The job post and resume are not speaking the same language yet.";
}

function buildRedFlags(resumeText, jobText, analysis) {
  const flags = [];
  const lowerResume = resumeText.toLowerCase();

  if (analysis.missing.length > 12) {
    flags.push("<strong>Too many missing keywords:</strong> the resume may not match the job post closely enough.");
  }
  if (!/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d{2}|present)\b/i.test(resumeText)) {
    flags.push("<strong>Missing dates:</strong> add month/year dates so the work history looks complete.");
  }
  if ((lowerResume.match(/present/g) || []).length > 1) {
    flags.push("<strong>Multiple current jobs:</strong> more than one 'Present' role can look like overlapping dates.");
  }
  if (!/\d|percent|%|hour|shift|positions|equipment|machines/i.test(resumeText)) {
    flags.push("<strong>No measurable proof:</strong> add numbers like equipment count, shift length, production rate, or years of experience.");
  }
  if (/fast[-\s]?paced/i.test(jobText) && !/fast[-\s]?paced/i.test(resumeText)) {
    flags.push("<strong>Fast-paced missing:</strong> the job asks for fast-paced work, but the resume does not clearly say it.");
  }
  if (/safety/i.test(jobText) && !/safety/i.test(resumeText)) {
    flags.push("<strong>Safety missing:</strong> safety is in the job post, so it should be visible in your resume.");
  }
  if (resumeText.length < 700) {
    flags.push("<strong>Resume too thin:</strong> add stronger bullets under each job so the system has more proof to read.");
  }

  analysis.sectionChecks.filter(s => !s.ok).forEach(s => {
    flags.push(`<strong>Missing section:</strong> add a clear ${s.name} section.`);
  });

  if (!flags.length) {
    flags.push("No major red flags found. Review the wording and make sure every bullet is honest.");
  }

  return flags;
}

function buildSummary(jobType, analysis) {
  const strengths = analysis.matched.slice(0, 6);
  const needs = analysis.missing.slice(0, 4);
  const typeLine = {
    general: "Reliable worker with hands-on experience and a strong focus on safety, teamwork, and learning quickly.",
    manufacturing: "Reliable industrial and manufacturing worker with hands-on experience in machine operation, production support, equipment monitoring, safety procedures, and quality checks.",
    maintenance: "Hands-on maintenance and electrical helper candidate with experience using tools, troubleshooting problems, supporting repairs, and completing work safely.",
    cdl: "CDL-A holder with a safety-focused background, hands-on industrial experience, and the ability to follow procedures, inspect equipment, and work reliably.",
    entry: "Motivated entry-level candidate with real hands-on work experience, strong attendance, and willingness to learn a long-term trade or skilled position."
  }[jobType];

  return `${typeLine} Experienced working in fast-paced environments, following instructions, supporting production goals, and learning new equipment or processes. Key strengths for this role include ${strengths.length ? strengths.join(", ") : "safety, reliability, teamwork, and problem solving"}. Add honest proof for these job-post keywords if they apply: ${needs.length ? needs.join(", ") : "no major missing keywords found"}.`;
}

function buildBullets(jobType, analysis) {
  const missing = analysis.missing.slice(0, 8);
  const matched = analysis.matched.slice(0, 8);
  const base = {
    general: [
      "Worked in a team environment while following company procedures, safety rules, and daily production expectations.",
      "Learned new tasks quickly and supported supervisors by staying reliable, organized, and ready to help where needed."
    ],
    manufacturing: [
      "Operated and monitored manufacturing equipment in a fast-paced production environment while following safety and quality standards.",
      "Completed machine setup, cleaning, restarts, material handling, and basic troubleshooting to keep production moving.",
      "Performed quality checks and communicated issues early to reduce downtime and protect production flow."
    ],
    maintenance: [
      "Assisted with electrical, carpentry, repair, and troubleshooting tasks using hand tools and power tools safely.",
      "Supported preventive maintenance and repair work by identifying issues, following instructions, and keeping work areas clean.",
      "Completed hands-on installation and repair tasks while maintaining attention to safety, quality, and details."
    ],
    cdl: [
      "Maintained a safety-first mindset while inspecting equipment, following procedures, and completing work reliably.",
      "Used CDL-A training, TWIC credential, and hands-on industrial experience to support transportation and logistics needs.",
      "Followed instructions, documented issues, and communicated clearly to protect safety and delivery expectations."
    ],
    entry: [
      "Showed strong willingness to learn by taking on hands-on tasks, following training, and improving through repetition.",
      "Built real work experience in fast-paced environments requiring reliability, attendance, safety, and teamwork.",
      "Supported daily operations by staying flexible, learning new responsibilities, and helping the team meet production goals."
    ]
  }[jobType] || [];

  const keywordBullet = missing.length
    ? `Add honest examples that show these job-post keywords if they apply: ${missing.join(", ")}.`
    : `Your resume already includes strong matches like ${matched.join(", ")}. Strengthen them with numbers and examples.`;

  return [...base, keywordBullet].map(item => `• ${item}`).join("\n");
}

function renderChips(container, items) {
  container.innerHTML = "";
  const list = items.length ? items : ["No items found"];
  list.slice(0, 18).forEach(item => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item;
    container.appendChild(chip);
  });
}

function analyzeAndRender() {
  const resumeText = document.getElementById("resumeText").value.trim();
  const jobText = document.getElementById("jobText").value.trim();
  const jobType = document.getElementById("jobType").value;

  if (!resumeText || !jobText) {
    alert("Paste both your resume and the job description first.");
    return;
  }

  const analysis = analyzeResume(resumeText, jobText, jobType);

  document.getElementById("results").hidden = false;
  document.getElementById("rewrite").hidden = false;
  document.getElementById("scoreValue").textContent = analysis.score;
  document.getElementById("scoreMessage").textContent = getScoreMessage(analysis.score);
  document.getElementById("scoreBar").style.width = `${analysis.score}%`;

  renderChips(document.getElementById("missingKeywords"), analysis.missing);
  renderChips(document.getElementById("matchedKeywords"), analysis.matched);

  const flags = buildRedFlags(resumeText, jobText, analysis);
  document.getElementById("redFlags").innerHTML = flags.map(flag => `<li>${flag}</li>`).join("");

  document.getElementById("summaryOutput").textContent = buildSummary(jobType, analysis);
  document.getElementById("bulletOutput").textContent = buildBullets(jobType, analysis);

  document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

function loadTracker() {
  return JSON.parse(localStorage.getItem("gmpt_tracker") || "[]");
}

function saveTracker(items) {
  localStorage.setItem("gmpt_tracker", JSON.stringify(items));
}

function renderTracker() {
  const rows = document.getElementById("trackerRows");
  const items = loadTracker();
  rows.innerHTML = "";

  if (!items.length) {
    rows.innerHTML = `<tr><td colspan="6">No applications tracked yet.</td></tr>`;
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.company}</td>
      <td>${item.role}</td>
      <td>${item.pay || "—"}</td>
      <td>${item.status}</td>
      <td><button class="delete-row" data-index="${index}">Delete</button></td>
    `;
    rows.appendChild(row);
  });
}

function init() {
  document.getElementById("analyzeBtn").addEventListener("click", analyzeAndRender);

  document.getElementById("loadDemo").addEventListener("click", () => {
    document.getElementById("resumeText").value = demoResume;
    document.getElementById("jobText").value = demoJob;
    document.getElementById("jobType").value = "manufacturing";
    document.getElementById("analyzer").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("resumeText").value = "";
    document.getElementById("jobText").value = "";
    document.getElementById("results").hidden = true;
    document.getElementById("rewrite").hidden = true;
  });

  document.querySelectorAll(".copy-button").forEach(button => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      await navigator.clipboard.writeText(target.textContent);
      const old = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = old), 1200);
    });
  });

  document.getElementById("trackerForm").addEventListener("submit", event => {
    event.preventDefault();
    const items = loadTracker();
    items.unshift({
      date: new Date().toLocaleDateString(),
      company: document.getElementById("company").value.trim(),
      role: document.getElementById("role").value.trim(),
      pay: document.getElementById("pay").value.trim(),
      status: document.getElementById("status").value
    });
    saveTracker(items);
    event.target.reset();
    renderTracker();
  });

  document.getElementById("trackerRows").addEventListener("click", event => {
    if (!event.target.matches(".delete-row")) return;
    const items = loadTracker();
    items.splice(Number(event.target.dataset.index), 1);
    saveTracker(items);
    renderTracker();
  });

  renderTracker();
}

document.addEventListener("DOMContentLoaded", init);
