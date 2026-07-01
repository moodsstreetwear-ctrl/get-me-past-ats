// GET ME PAST ATS
// Full report logic: diagnose first, then write only from proven resume evidence.
window.GMPT_APP_VERSION = "v6-job-targeting-engine";

const APP_VALUES_AND_CONSTRAINTS = {
  noPartialFamilyUpdates: true,
  noGenericKeywordDumping: true,
  proofBeforeRewrite: true,
  coverAllCurrentJobFamilies: true,
  separateAtsFitFromRecruiterFit: true,
  rankApplicationPriority: true,
  showFastestPathToInterviews: true,
  rule: "When a feature improves resume coaching, it must cover every current job family, avoid generic fallback wording, separate keyword match from recruiter proof, and rank whether the job is worth the next application."
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "you", "your", "are", "that", "this", "from", "will", "have", "has", "our",
  "job", "jobs", "work", "worker", "team", "must", "able", "ability", "position", "company", "their", "they",
  "all", "can", "may", "within", "other", "such", "into", "about", "each", "when", "where", "what", "who", "why",
  "how", "been", "than", "then", "also", "any", "not", "but", "more", "less", "per", "hour", "week", "day",
  "shift", "required", "preferred", "responsibilities", "requirements", "duties", "skills", "experience", "years", "year",
  "candidate", "applicant", "role", "include", "including", "perform", "maintain", "using", "use", "needed", "needs",
  "hiring", "environment", "supervisors", "report", "reports", "issues", "previous", "setting"
]);

const JOB_TYPES = {
  general: { label: "General / Any Job", family: "general" },
  customer_service_representative: { label: "Customer Service Representative", family: "customer_service" },
  data_entry_clerk: { label: "Data Entry Clerk", family: "office" },
  administrative_assistant: { label: "Administrative Assistant", family: "office" },
  receptionist: { label: "Receptionist", family: "office" },
  call_center_representative: { label: "Call Center Representative", family: "customer_service" },
  remote_customer_support_representative: { label: "Remote Customer Support Representative", family: "customer_service" },
  office_assistant: { label: "Office Assistant", family: "office" },
  sales_representative: { label: "Sales Representative", family: "customer_service" },
  retail_associate: { label: "Retail Associate", family: "customer_service" },
  cashier: { label: "Cashier", family: "customer_service" },
  stocker: { label: "Stocker", family: "warehouse" },
  warehouse_associate: { label: "Warehouse Associate", family: "warehouse" },
  package_handler: { label: "Package Handler", family: "warehouse" },
  material_handler: { label: "Material Handler", family: "warehouse" },
  forklift_operator: { label: "Forklift Operator", family: "warehouse" },
  delivery_driver: { label: "Delivery Driver", family: "driving" },
  truck_driver: { label: "Truck Driver", family: "driving" },
  machine_operator: { label: "Machine Operator", family: "manufacturing" },
  production_worker: { label: "Production Worker", family: "manufacturing" },
  assembly_worker: { label: "Assembly Worker", family: "manufacturing" },
  maintenance_technician: { label: "Maintenance Technician", family: "maintenance" },
  apartment_maintenance_technician: { label: "Apartment Maintenance Technician", family: "maintenance" },
  electrician: { label: "Electrician", family: "electrical" },
  welder: { label: "Welder", family: "welding" },
  diesel_mechanic: { label: "Diesel Mechanic", family: "diesel" },
  construction_laborer: { label: "Construction Laborer", family: "construction" },
  carpenter: { label: "Carpenter", family: "construction" },
  security_officer: { label: "Security Officer", family: "security" },
  janitor: { label: "Janitor", family: "cleaning" },
  housekeeper: { label: "Housekeeper", family: "cleaning" },
  hotel_front_desk_agent: { label: "Hotel Front Desk Agent", family: "customer_service" },
  server: { label: "Server", family: "food_service" },
  cook: { label: "Cook", family: "food_service" },
  certified_nursing_assistant: { label: "Certified Nursing Assistant", family: "healthcare" },
  medical_assistant: { label: "Medical Assistant", family: "healthcare" },
  patient_care_technician: { label: "Patient Care Technician", family: "healthcare" },
  home_health_aide: { label: "Home Health Aide", family: "healthcare" },
  phlebotomist: { label: "Phlebotomist", family: "healthcare" },
  pharmacy_technician: { label: "Pharmacy Technician", family: "healthcare" },
  dental_assistant: { label: "Dental Assistant", family: "healthcare" },
  licensed_practical_nurse: { label: "Licensed Practical Nurse", family: "healthcare" },
  registered_nurse: { label: "Registered Nurse", family: "healthcare" },
  medical_billing_specialist: { label: "Medical Billing Specialist", family: "healthcare_admin" },
  medical_coding_specialist: { label: "Medical Coding Specialist", family: "healthcare_admin" },
  teacher_assistant: { label: "Teacher Assistant", family: "education" },
  substitute_teacher: { label: "Substitute Teacher", family: "education" },
  bookkeeper: { label: "Bookkeeper", family: "office" },
  human_resources_assistant: { label: "Human Resources Assistant", family: "office" },
  it_help_desk_technician: { label: "IT Help Desk Technician", family: "it" },
  cybersecurity_analyst: { label: "Cybersecurity Analyst", family: "it" }
};

const FAMILY_LABELS = {
  general: "General",
  manufacturing: "Machine Operator / Production",
  warehouse: "Warehouse / Material Handling",
  healthcare: "Healthcare Support",
  healthcare_admin: "Medical Office",
  maintenance: "Maintenance",
  electrical: "Electrical",
  welding: "Welding",
  diesel: "Diesel Mechanic",
  construction: "Construction",
  customer_service: "Customer Service",
  office: "Office / Administrative",
  driving: "Driving / CDL",
  security: "Security",
  cleaning: "Cleaning",
  food_service: "Food Service",
  education: "Education Support",
  it: "IT / Technical Support"
};

function term(term, aliases = [], priority = "medium") {
  return { term, aliases: [term, ...aliases], priority };
}

const FAMILY_TERMS = {
  manufacturing: [
    term("machine operation", ["machine operator", "machine technician", "machine technicians", "operated machines", "operating machines", "production machines", "production equipment", "operate buttons", "buttons and levers"], "high"),
    term("equipment monitoring", ["monitoring equipment", "monitored equipment", "monitored machines", "monitor machines"], "high"),
    term("quality checks", ["quality inspections", "quality control", "checked parts", "defects", "parts for defects"], "high"),
    term("safety procedures", ["safety rules", "safety standards", "follow safety", "following safety"], "high"),
    term("machine setup", ["setup", "set up", "machine set up"], "medium"),
    term("machine cleaning", ["cleaning", "cleaned machines", "cleaning machines"], "medium"),
    term("machine restarts", ["restarts", "restart", "machine restart", "machine restarts"], "medium"),
    term("basic troubleshooting", ["troubleshooting", "troubleshoot", "machine issues", "equipment issues"], "medium"),
    term("material handling", ["handled materials", "handling materials", "materials", "pallets"], "medium"),
    term("loading materials", ["load materials", "loaded materials", "loading materials", "equipment loading"], "medium"),
    term("production goals", ["daily production goals", "production goals", "production rate", "production flow"], "medium"),
    term("industrial equipment", ["industrial equipment", "manufacturing equipment", "manufacturing plant", "manufacturing plants", "tire material", "production plant"], "medium"),
    term("rotating swing shifts", ["rotating shifts", "swing shifts", "rotating swing shifts"], "soft"),
    term("multiple pieces of equipment", ["multiple pieces of equipment", "operate multiple", "multiple machines", "multiple equipment"], "soft"),
    term("stable work history", ["stable work history", "2 years of stable work history", "work history"], "soft"),
    term("lifting 50-75 lbs", ["lift 50", "lift 75", "50 pounds", "75 pounds", "50/75", "lifting requirements"], "soft"),
    term("manual dexterity", ["manual dexterity", "buttons", "levers", "operate buttons", "operate levers"], "soft"),
    term("physical mobility", ["squat", "stoop", "bend", "climb", "walk", "physical mobility"], "soft"),
    term("hot/cold work conditions", ["hot and cold", "hot & cold", "weather", "exposure to weather"], "soft"),
    term("12-hour shifts", ["12 hour shifts", "12-hour shift", "long shifts"], "soft"),
    term("team-based production", ["team members", "team based", "team-based", "production team"], "soft")
  ],
  warehouse: [
    term("warehouse operations", ["warehouse", "distribution center", "shipping area", "receiving area"], "high"),
    term("loading and unloading", ["loaded", "unloaded", "loading", "unloading"], "high"),
    term("material handling", ["handled materials", "material handler", "materials", "pallets"], "high"),
    term("pallet jack", ["pallet jacks"], "medium"),
    term("pallet wrapping", ["wrapped pallets", "wrap pallets", "pallet wrap"], "medium"),
    term("inventory organization", ["inventory", "organized inventory", "stock"], "medium"),
    term("shipping and receiving", ["shipping", "receiving"], "medium"),
    term("RF scanner", ["scanner", "scanning", "scan gun"], "medium"),
    term("order picking", ["picking", "packing", "orders"], "medium"),
    term("warehouse safety", ["safety rules", "safety procedures"], "medium")
  ],
  healthcare: [
    term("CNA certification", ["certified nursing assistant", "CNA", "nursing assistant"], "high"),
    term("patient care", ["patients", "patient", "care for patients", "patient support"], "high"),
    term("resident care", ["residents", "resident"], "high"),
    term("ADLs", ["activities of daily living", "daily living", "bathing", "dressing", "feeding"], "high"),
    term("vital signs", ["vitals", "blood pressure", "temperature", "pulse"], "high"),
    term("infection control", ["infection prevention", "PPE", "sanitation procedures"], "high"),
    term("HIPAA", ["patient privacy", "privacy rules"], "high"),
    term("documenting care", ["documentation", "documented care", "charting", "medical records"], "medium"),
    term("mobility assistance", ["mobility", "transfer patients", "ambulation", "wheelchair"], "medium"),
    term("clinical experience", ["clinical", "clinic", "hospital"], "medium"),
    term("caregiver experience", ["caregiver", "home health", "personal care aide"], "medium"),
    term("phlebotomy", ["blood draw", "venipuncture"], "medium"),
    term("EKG", ["electrocardiogram"], "medium")
  ],
  maintenance: [
    term("preventive maintenance", ["preventative maintenance", "PMs", "maintenance checks"], "high"),
    term("repair", ["repairs", "fixed", "fixing"], "high"),
    term("troubleshooting", ["diagnose", "diagnostics", "problem solving"], "high"),
    term("electrical repair", ["outlets", "switches", "wiring", "ceiling fans", "fixtures"], "medium"),
    term("plumbing", ["pipes", "leaks", "toilets", "sinks"], "medium"),
    term("HVAC", ["heating", "air conditioning", "air conditioner"], "medium"),
    term("hand and power tools", ["hand tools", "power tools", "tools"], "medium"),
    term("work orders", ["work order", "service requests"], "medium")
  ],
  electrical: [
    term("electrical wiring", ["wiring", "wire", "wired homes"], "high"),
    term("outlets and switches", ["outlets", "switches", "receptacles"], "high"),
    term("fixtures", ["ceiling fans", "lights", "lighting", "fixtures"], "medium"),
    term("troubleshooting", ["electrical troubleshooting", "diagnose", "repair"], "medium"),
    term("conduit", ["pipe bending", "EMT"], "medium"),
    term("panels", ["breaker panel", "electrical panel", "breakers"], "medium")
  ],
  welding: [
    term("welding", ["welder", "weld"], "high"),
    term("fabrication", ["fabricate", "metal fabrication"], "high"),
    term("MIG", ["MIG welding"], "medium"),
    term("TIG", ["TIG welding"], "medium"),
    term("grinding", ["grinder"], "medium"),
    term("cutting", ["torch", "plasma"], "medium"),
    term("blueprints", ["blueprint", "drawings"], "medium")
  ],
  diesel: [
    term("diesel engines", ["diesel", "diesel engine"], "high"),
    term("diagnostics", ["diagnose", "troubleshooting", "diagnostic"], "high"),
    term("preventive maintenance", ["PM", "service checks"], "medium"),
    term("brakes", ["brake"], "medium"),
    term("hydraulics", ["hydraulic"], "medium"),
    term("heavy equipment", ["trucks", "trailers", "fleet"], "medium"),
    term("inspection", ["inspect", "inspections"], "medium")
  ],
  construction: [
    term("construction", ["residential construction", "jobsite", "building"], "high"),
    term("carpentry", ["carpenter", "doors", "trim", "millwork"], "high"),
    term("hand and power tools", ["hand tools", "power tools", "tools"], "medium"),
    term("installation", ["installed", "installing"], "medium"),
    term("measuring and cutting", ["measured", "cut", "cutting"], "medium"),
    term("safety procedures", ["safety"], "medium")
  ],
  customer_service: [
    term("customer service", ["customers", "customer support", "guest service"], "high"),
    term("phone support", ["phone calls", "call center", "calls"], "medium"),
    term("CRM", ["customer relationship management"], "medium"),
    term("de-escalation", ["de escalate", "complaints", "conflict"], "medium"),
    term("cash handling", ["cashier", "POS", "transactions"], "medium"),
    term("sales", ["upselling", "sales goals"], "medium")
  ],
  office: [
    term("data entry", ["typing", "entered data"], "high"),
    term("records", ["recordkeeping", "filing", "documents"], "medium"),
    term("scheduling", ["calendar", "appointments"], "medium"),
    term("email", ["emails"], "medium"),
    term("Microsoft Office", ["Excel", "Word", "spreadsheets"], "medium"),
    term("phone calls", ["phones", "front desk"], "medium")
  ],
  driving: [
    term("CDL", ["CDL-A", "commercial driver"], "high"),
    term("DOT", ["Department of Transportation"], "high"),
    term("safe driving", ["driving record", "road safety"], "high"),
    term("pre-trip inspection", ["pre trip", "pretrip"], "medium"),
    term("post-trip inspection", ["post trip", "posttrip"], "medium"),
    term("route delivery", ["routes", "delivery"], "medium"),
    term("TWIC", ["transportation worker identification"], "medium")
  ],
  security: [
    term("security experience", ["security officer", "security guard", "guard", "security experience"], "high"),
    term("patrols", ["patrol", "patrols", "walking patrol", "regular patrols", "random patrols", "perimeter"], "medium"),
    term("incident reports", ["incident report", "incident reports", "incident reporting", "document incidents", "security reports"], "medium"),
    term("access control", ["access control", "badge check", "badge checks", "entrance", "entry control", "visitor screening", "verify visitors"], "medium"),
    term("surveillance cameras", ["surveillance cameras", "security cameras", "CCTV", "monitor cameras", "monitoring cameras"], "medium"),
    term("emergency response", ["emergency response", "respond to incidents", "critical situations", "respond to safety concerns"], "medium"),
    term("security procedures", ["security-related procedures", "site-specific policies", "security procedures", "site safety procedures"], "medium"),
    term("security customer service", ["support patients", "support visitors", "support staff", "customer service", "communication"], "soft")
  ],
  cleaning: [
    term("cleaning", ["cleaned", "janitorial", "housekeeping"], "high"),
    term("sanitation", ["sanitized", "disinfected"], "medium"),
    term("trash removal", ["trash", "waste"], "medium"),
    term("floor care", ["mopping", "sweeping", "vacuuming"], "medium"),
    term("restocking supplies", ["restocked", "supplies"], "medium")
  ],
  food_service: [
    term("food preparation", ["prep", "prepared food", "cooking"], "high"),
    term("food safety", ["sanitation", "safe food handling"], "high"),
    term("customer service", ["guests", "customers"], "medium"),
    term("orders", ["taking orders", "tickets"], "medium"),
    term("cash handling", ["POS", "transactions"], "medium")
  ],
  education: [
    term("student support", ["students", "classroom"], "high"),
    term("lesson support", ["lesson plans", "instruction"], "medium"),
    term("behavior management", ["behavior", "classroom management"], "medium"),
    term("supervision", ["monitoring students", "supervise"], "medium")
  ],
  it: [
    term("technical support", ["tech support", "help desk", "helpdesk"], "high"),
    term("troubleshooting", ["diagnose", "resolve issues"], "high"),
    term("tickets", ["ticketing", "service desk"], "medium"),
    term("hardware", ["laptops", "desktops", "printers"], "medium"),
    term("software", ["applications", "Windows"], "medium"),
    term("password resets", ["password reset", "accounts"], "medium"),
    term("networking", ["network", "routers", "switches"], "medium"),
    term("cybersecurity", ["security analyst", "SOC", "SIEM"], "medium")
  ],
  healthcare_admin: [
    term("medical billing", ["billing", "claims", "insurance"], "high"),
    term("medical coding", ["coding", "CPT", "ICD"], "high"),
    term("medical records", ["records", "EHR", "EMR"], "medium"),
    term("HIPAA", ["patient privacy"], "medium"),
    term("data entry", ["typing", "entry"], "medium")
  ],
  general: []
};

const RELATED_ROLES = {
  manufacturing: ["Machine Operator", "Production Worker", "Assembly Worker", "Manufacturing Associate", "Material Handler"],
  warehouse: ["Warehouse Associate", "Material Handler", "Package Handler", "Forklift Operator", "Stocker"],
  healthcare: ["Certified Nursing Assistant", "Patient Care Technician", "Home Health Aide", "Caregiver", "Medical Assistant"],
  maintenance: ["Maintenance Technician", "Apartment Maintenance Technician", "Facilities Technician", "Repair Helper"],
  electrical: ["Electrical Helper", "Apprentice Electrician", "Maintenance Helper"],
  welding: ["Welder Helper", "Fabrication Helper", "Entry-Level Welder"],
  diesel: ["Diesel Mechanic Helper", "Fleet Maintenance Helper", "Lube Technician"],
  construction: ["Construction Laborer", "Carpenter Helper", "Installer", "Millwork Associate"],
  customer_service: ["Customer Service Representative", "Call Center Representative", "Retail Associate", "Front Desk Agent"],
  office: ["Office Assistant", "Data Entry Clerk", "Administrative Assistant", "Receptionist"],
  driving: ["Delivery Driver", "Truck Driver", "Route Driver", "Driver Helper"],
  security: ["Security Officer", "Access Control Officer", "Gate Guard"],
  cleaning: ["Janitor", "Housekeeper", "Custodian"],
  food_service: ["Cook", "Server", "Food Service Worker"],
  education: ["Teacher Assistant", "Substitute Teacher", "Classroom Aide"],
  it: ["IT Help Desk Technician", "Technical Support Specialist", "Desktop Support Trainee"]
};

function $(id) {
  return document.getElementById(id);
}

function text(value) {
  return String(value ?? "");
}

function normalize(value) {
  return text(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHTML(value) {
  return text(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanList(items) {
  return [...new Set(items.filter(Boolean).map(item => text(item).trim()).filter(Boolean))];
}

function joinEnglish(items) {
  const list = cleanList(items);
  if (list.length <= 1) return list[0] || "";
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

function wordAppears(normalizedText, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(?=\\s|$)`).test(normalizedText);
}

function termMatchesText(termObj, normalizedText) {
  return termObj.aliases.some(alias => {
    const aliasNorm = normalize(alias);
    if (!aliasNorm) return false;
    if (aliasNorm.length <= 3) return wordAppears(normalizedText, aliasNorm);
    if (normalizedText.includes(aliasNorm)) return true;

    const words = aliasNorm.split(" ").filter(Boolean);
    if (words.length === 1) {
      const word = words[0];
      if (word.length <= 3) return wordAppears(normalizedText, word);
      const stem = word.replace(/(ing|ed|s)$/i, "");
      return stem.length > 3 && normalizedText.includes(stem);
    }

    return words.every(word => {
      if (word.length <= 3) return wordAppears(normalizedText, word);
      const stem = word.replace(/(ing|ed|s)$/i, "");
      return normalizedText.includes(word) || (stem.length > 3 && normalizedText.includes(stem));
    });
  });
}

function weightFor(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function scoreFamilyInText(family, rawText) {
  const normalizedText = normalize(rawText);
  const terms = FAMILY_TERMS[family] || [];
  let score = 0;
  let matched = [];
  terms.forEach(item => {
    if (termMatchesText(item, normalizedText)) {
      score += weightFor(item.priority);
      matched.push(item.term);
    }
  });
  return { family, score, matched };
}

function detectFamily(rawText) {
  const candidates = Object.keys(FAMILY_TERMS)
    .filter(family => family !== "general")
    .map(family => scoreFamilyInText(family, rawText))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0] || { family: "general", score: 0, matched: [] };
  const second = candidates[1] || { family: "general", score: 0, matched: [] };
  if (best.score < 4) return { family: "general", score: 0, matched: [], confidence: 0, second };
  const confidence = Math.min(100, Math.round((best.score / Math.max(best.score + second.score, 1)) * 100));
  return { ...best, confidence, second };
}

function getActiveTerms(jobText, family) {
  const normalizedJob = normalize(jobText);
  const familyTerms = FAMILY_TERMS[family] || [];
  const active = familyTerms.filter(item => termMatchesText(item, normalizedJob));
  const coreActive = active.filter(item => item.priority !== "soft");
  if (active.length && coreActive.length >= 3) return active;
  const baselineCore = familyTerms.filter(item => item.priority !== "soft").slice(0, 10);
  return [...new Map([...active, ...baselineCore].map(item => [item.term, item])).values()];
}

function analyzeKeywords(resumeText, jobText, targetFamily) {
  const normalizedResume = normalize(resumeText);
  const activeTerms = getActiveTerms(jobText, targetFamily);
  let totalWeight = 0;
  let matchedWeight = 0;
  let coreTotalWeight = 0;
  let coreMatchedWeight = 0;
  const exactMatched = [];
  const missing = [];

  activeTerms.forEach(item => {
    const weight = weightFor(item.priority);
    totalWeight += weight;
    if (item.priority !== "soft") coreTotalWeight += weight;
    if (termMatchesText(item, normalizedResume)) {
      matchedWeight += weight;
      if (item.priority !== "soft") coreMatchedWeight += weight;
      exactMatched.push({ ...item, status: "exact", confidence: 100 });
    } else {
      missing.push({ ...item, status: "missing", confidence: 0 });
    }
  });

  const rawScore = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  const coreScore = coreTotalWeight ? Math.round((coreMatchedWeight / coreTotalWeight) * 100) : rawScore;
  const softMissingCount = missing.filter(item => item.priority === "soft").length;
  const score = coreScore >= 90 ? Math.max(0, coreScore - Math.min(2, softMissingCount)) : rawScore;
  return {
    activeTerms,
    score,
    rawScore,
    coreScore,
    exactMatched,
    missing,
    criticalMissing: missing.filter(item => item.priority === "high"),
    helpfulMissing: missing.filter(item => item.priority === "medium"),
    softMissing: missing.filter(item => item.priority === "soft")
  };
}

function getProofTerms(resumeText, family) {
  const normalizedResume = normalize(resumeText);
  return (FAMILY_TERMS[family] || [])
    .filter(item => termMatchesText(item, normalizedResume))
    .map(item => item.term);
}

function getProofNeeded(family, missingItems) {
  const highMissing = missingItems.filter(item => item.priority === "high").map(item => item.term);
  if (highMissing.length) return highMissing.slice(0, 7);
  return missingItems.map(item => item.term).slice(0, 7);
}

function getSelectedJobType(jobType) {
  return JOB_TYPES[jobType] || JOB_TYPES.general;
}

function buildDiagnosis({ selected, selectedFamily, jobFamily, resumeFamily, keywordData, evidenceTerms }) {
  const selectedLabel = selected.label;
  const jobFamilyLabel = FAMILY_LABELS[jobFamily.family] || "another job type";
  const selectedFamilyLabel = FAMILY_LABELS[selectedFamily] || selectedLabel;

  if (selectedFamily !== "general" && jobFamily.family !== "general" && selectedFamily !== jobFamily.family && jobFamily.score >= 7) {
    return {
      category: "wrong_job_type",
      title: "Possible Wrong Job Type Selected",
      message: `You selected ${selectedLabel}, but this job post reads closer to ${jobFamilyLabel}. The report is stopping the rewrite so the resume does not get forced into the wrong category.`,
      direction: `Switch the job type to ${jobFamilyLabel}, then scan again before using resume wording.`,
      scoreLabel: "Wrong job type selected"
    };
  }

  const score = keywordData.score;
  const evidenceCount = evidenceTerms.length;

  if (score >= 82 && evidenceCount >= 5) {
    return {
      category: "strong_match",
      title: "Strong Match",
      message: `This resume already proves several important ${selectedFamilyLabel} requirements from the job post. The rewrite below uses only the proof found in the resume.`,
      direction: "Use the ATS-friendly wording below, then add numbers, equipment names, or shift details only where they are true.",
      scoreLabel: "Strong match"
    };
  }

  if (score >= 65 && evidenceCount >= 4) {
    return {
      category: "good_match",
      title: "Good Match",
      message: `This resume matches the job type and shows real proof for the job post. The main fix is stronger ATS wording, not changing the facts.`,
      direction: "Use the summary and bullets below as a stronger starting point based on the resume proof.",
      scoreLabel: "Good match"
    };
  }

  if (score >= 40 && evidenceCount >= 2) {
    return {
      category: "medium_match",
      title: "Medium Match — Wording Gap",
      message: `The resume shows some real ${selectedFamilyLabel} proof, but it is missing enough job-post wording to be a clean ATS match.`,
      direction: "Use only the safe wording below. Add missing keywords only if the resume can honestly prove them.",
      scoreLabel: "Medium match"
    };
  }

  if (score >= 28 && resumeFamily.family !== "general" && resumeFamily.family !== jobFamily.family) {
    const resumeFamilyLabel = FAMILY_LABELS[resumeFamily.family] || "another job type";
    return {
      category: "transferable",
      title: "Low-to-Medium Match — Transferable Only",
      message: `The resume is stronger for ${resumeFamilyLabel} roles than this job post. Some skills may transfer, but the app will not create job-specific claims the resume does not prove.`,
      direction: "Use the direction section below to decide whether to apply, pivot, or add real proof first.",
      scoreLabel: "Transferable match"
    };
  }

  return {
    category: "weak_evidence",
    title: "Weak Evidence for This Job",
    message: `This resume does not show enough direct proof for ${selectedLabel}. To avoid creating false experience, no job-specific resume rewrite was generated.`,
    direction: "Add real training, certification, or work experience first if it applies. Otherwise, apply to roles closer to the resume proof.",
    scoreLabel: "Weak evidence"
  };
}

function hasResumeProof(resumeText, family, proofName) {
  const item = (FAMILY_TERMS[family] || []).find(termItem => termItem.term === proofName);
  return item ? termMatchesText(item, normalize(resumeText)) : false;
}

function buildManufacturingWording(resumeText, diagnosisCategory) {
  const hasMachine = hasResumeProof(resumeText, "manufacturing", "machine operation") || hasResumeProof(resumeText, "manufacturing", "equipment monitoring");
  const hasQuality = hasResumeProof(resumeText, "manufacturing", "quality checks");
  const hasSafety = hasResumeProof(resumeText, "manufacturing", "safety procedures");
  const hasSetup = hasResumeProof(resumeText, "manufacturing", "machine setup");
  const hasCleaning = hasResumeProof(resumeText, "manufacturing", "machine cleaning");
  const hasRestarts = hasResumeProof(resumeText, "manufacturing", "machine restarts");
  const hasTroubleshooting = hasResumeProof(resumeText, "manufacturing", "basic troubleshooting");
  const hasMaterial = hasResumeProof(resumeText, "manufacturing", "material handling");
  const hasLoading = hasResumeProof(resumeText, "manufacturing", "loading materials");
  const hasGoals = hasResumeProof(resumeText, "manufacturing", "production goals");
  const hasTwelve = hasResumeProof(resumeText, "manufacturing", "12-hour shifts");
  const hasTeam = hasResumeProof(resumeText, "manufacturing", "team-based production");

  const experienceParts = [];
  if (hasMachine) experienceParts.push("operating and monitoring production equipment");
  if (hasQuality) experienceParts.push("completing quality checks");
  if (hasLoading || hasMaterial) experienceParts.push("loading and handling materials");
  if (hasSafety) experienceParts.push("following safety procedures");

  const skillParts = [];
  if (hasSetup) skillParts.push("machine setup");
  if (hasCleaning) skillParts.push("cleaning");
  if (hasRestarts) skillParts.push("restarts");
  if (hasTroubleshooting) skillParts.push("basic troubleshooting");
  if (hasMaterial) skillParts.push("material handling");
  if (hasTeam || hasGoals) skillParts.push("working with team members to meet production goals");

  const summarySentences = [];
  if (experienceParts.length) {
    summarySentences.push(`Manufacturing worker with experience ${joinEnglish(experienceParts)} in fast-paced production environments.`);
  }
  if (skillParts.length) {
    summarySentences.push(`Skilled in ${joinEnglish(skillParts)} while supporting safe, steady production flow.`);
  }

  const bullets = [];
  if (hasMachine) {
    bullets.push(`Operated and monitored production machines${hasTwelve ? " during 12-hour shifts" : " during assigned shifts"} while following safety and quality standards.`);
  }
  const machineTaskParts = [];
  if (hasSetup) machineTaskParts.push("machine setup");
  if (hasCleaning) machineTaskParts.push("cleaning");
  if (hasRestarts) machineTaskParts.push("restarts");
  if (hasTroubleshooting) machineTaskParts.push("basic troubleshooting");
  if (machineTaskParts.length) {
    bullets.push(`Completed ${joinEnglish(machineTaskParts)} to support steady production flow.`);
  }
  const flowParts = [];
  if (hasLoading || hasMaterial) flowParts.push("loaded and handled materials");
  if (hasQuality) flowParts.push("checked parts for defects");
  if (hasTeam || hasGoals) flowParts.push("worked with team members to meet daily production goals");
  if (flowParts.length) {
    bullets.push(`${joinEnglish(flowParts).replace(/^./, char => char.toUpperCase())}.`);
  }

  return {
    summary: summarySentences.join(" "),
    bullets: bullets.slice(0, diagnosisCategory === "medium_match" ? 3 : 4)
  };
}

function buildHealthcareWording(resumeText, diagnosisCategory) {
  const checks = {
    cna: hasResumeProof(resumeText, "healthcare", "CNA certification"),
    patient: hasResumeProof(resumeText, "healthcare", "patient care"),
    resident: hasResumeProof(resumeText, "healthcare", "resident care"),
    adls: hasResumeProof(resumeText, "healthcare", "ADLs"),
    vitals: hasResumeProof(resumeText, "healthcare", "vital signs"),
    infection: hasResumeProof(resumeText, "healthcare", "infection control"),
    hipaa: hasResumeProof(resumeText, "healthcare", "HIPAA"),
    documentation: hasResumeProof(resumeText, "healthcare", "documenting care"),
    mobility: hasResumeProof(resumeText, "healthcare", "mobility assistance"),
    caregiver: hasResumeProof(resumeText, "healthcare", "caregiver experience")
  };

  const experienceParts = [];
  if (checks.patient || checks.resident) experienceParts.push("supporting patient and resident care");
  if (checks.adls) experienceParts.push("assisting with ADLs");
  if (checks.vitals) experienceParts.push("checking vital signs");
  if (checks.mobility) experienceParts.push("helping with mobility and transfers");

  const complianceParts = [];
  if (checks.infection) complianceParts.push("infection control procedures");
  if (checks.hipaa) complianceParts.push("HIPAA guidelines");
  if (checks.documentation) complianceParts.push("care documentation");

  const summarySentences = [];
  const title = checks.cna ? "Certified Nursing Assistant" : checks.caregiver ? "Healthcare support worker" : "Patient care worker";
  if (experienceParts.length) summarySentences.push(`${title} with experience ${joinEnglish(experienceParts)}.`);
  if (complianceParts.length) summarySentences.push(`Knowledgeable in ${joinEnglish(complianceParts)} while keeping patient safety and privacy in focus.`);

  const bullets = [];
  if (checks.patient || checks.resident || checks.adls || checks.mobility) {
    const parts = [];
    if (checks.patient || checks.resident) parts.push("provided patient or resident support");
    if (checks.adls) parts.push("assisted with ADLs");
    if (checks.mobility) parts.push("helped with mobility needs");
    bullets.push(`${joinEnglish(parts).replace(/^./, char => char.toUpperCase())} while following care instructions.`);
  }
  if (checks.vitals || checks.documentation) {
    const parts = [];
    if (checks.vitals) parts.push("checked vital signs");
    if (checks.documentation) parts.push("documented care details");
    bullets.push(`${joinEnglish(parts).replace(/^./, char => char.toUpperCase())} to support accurate patient care records.`);
  }
  if (checks.infection || checks.hipaa) {
    bullets.push(`Followed ${joinEnglish(complianceParts)} to support patient safety, privacy, and clean care practices.`);
  }

  return { summary: summarySentences.join(" "), bullets: bullets.slice(0, diagnosisCategory === "medium_match" ? 3 : 4) };
}

const FAMILY_WORDING_BLUEPRINTS = {
  maintenance: {
    title: "Maintenance Technician",
    summaryLead: "with hands-on experience",
    skillLead: "Skilled in",
    items: {
      "preventive maintenance": { summary: "performing preventive maintenance checks", skill: "preventive maintenance", bullet: "Performed preventive maintenance checks to keep equipment, units, or facilities operating safely." },
      "repair": { summary: "completing repair work", skill: "repair work", bullet: "Completed repair tasks while keeping work areas safe, organized, and ready for continued use." },
      "troubleshooting": { summary: "troubleshooting equipment and facility issues", skill: "troubleshooting", bullet: "Troubleshot reported issues, identified likely causes, and supported repairs through completion." },
      "electrical repair": { summary: "handling basic electrical repair tasks", skill: "outlets, switches, wiring, and fixtures", bullet: "Supported basic electrical repairs involving outlets, switches, wiring, ceiling fans, or fixtures where assigned." },
      "plumbing": { summary: "supporting plumbing repairs", skill: "plumbing repair", bullet: "Assisted with plumbing-related repairs such as leaks, sinks, toilets, pipes, or basic fixture issues." },
      "HVAC": { summary: "supporting HVAC-related maintenance", skill: "HVAC maintenance support", bullet: "Supported HVAC-related maintenance by checking heating, cooling, or air-conditioning issues within assigned duties." },
      "hand and power tools": { summary: "using hand and power tools", skill: "hand and power tools", bullet: "Used hand and power tools safely to complete maintenance, repair, installation, or service tasks." },
      "work orders": { summary: "responding to work orders and service requests", skill: "work orders", bullet: "Completed work orders or service requests while documenting issues and work performed." }
    }
  },
  electrical: {
    title: "Electrical Helper",
    summaryLead: "with hands-on experience",
    skillLead: "Skilled in",
    items: {
      "electrical wiring": { summary: "installing and supporting electrical wiring", skill: "electrical wiring", bullet: "Installed or assisted with electrical wiring while following assigned safety and installation procedures." },
      "outlets and switches": { summary: "working with outlets and switches", skill: "outlets and switches", bullet: "Installed, replaced, or supported work on outlets, switches, and related residential electrical components." },
      "fixtures": { summary: "installing fixtures, lighting, or ceiling fans", skill: "fixtures, lighting, and ceiling fans", bullet: "Installed or assisted with fixtures, lighting, ceiling fans, or related electrical finish work." },
      "troubleshooting": { summary: "supporting electrical troubleshooting and repair", skill: "electrical troubleshooting", bullet: "Supported electrical troubleshooting by checking issues and assisting with safe repair steps." },
      "conduit": { summary: "working with conduit or EMT", skill: "conduit", bullet: "Measured, installed, or assisted with conduit runs according to assigned electrical tasks." },
      "panels": { summary: "supporting panel or breaker work", skill: "panels and breakers", bullet: "Assisted with panel, breaker, or electrical distribution tasks under assigned direction." }
    }
  },
  welding: {
    title: "Welding Worker",
    summaryLead: "with shop or fabrication experience",
    skillLead: "Skilled in",
    items: {
      "welding": { summary: "performing welding tasks", skill: "welding", bullet: "Performed welding tasks while following shop, safety, and quality expectations." },
      "fabrication": { summary: "supporting fabrication work", skill: "metal fabrication", bullet: "Supported fabrication work by preparing, fitting, or assembling metal parts for welding or production." },
      "MIG": { summary: "using MIG welding processes", skill: "MIG welding", bullet: "Used MIG welding processes where assigned to support fabrication or repair work." },
      "TIG": { summary: "using TIG welding processes", skill: "TIG welding", bullet: "Used TIG welding processes where assigned to support precise fabrication or repair tasks." },
      "grinding": { summary: "grinding and preparing metal surfaces", skill: "grinding", bullet: "Used grinding tools to clean, smooth, or prepare metal parts before or after welding." },
      "cutting": { summary: "cutting materials for fabrication", skill: "cutting", bullet: "Cut materials to support fabrication, fitting, or welding tasks." },
      "blueprints": { summary: "reading blueprints or drawings", skill: "blueprints and drawings", bullet: "Used blueprints, drawings, or work instructions to guide fabrication or welding tasks." }
    }
  },
  diesel: {
    title: "Diesel Mechanic",
    summaryLead: "with hands-on mechanical experience",
    skillLead: "Skilled in",
    items: {
      "diesel engines": { summary: "working around diesel engines", skill: "diesel engines", bullet: "Worked with diesel engines or related heavy equipment systems during service, inspection, or repair tasks." },
      "diagnostics": { summary: "supporting diagnostics and troubleshooting", skill: "diagnostics", bullet: "Supported diagnostics by checking reported issues, inspecting components, and helping identify repair needs." },
      "preventive maintenance": { summary: "performing preventive maintenance", skill: "preventive maintenance", bullet: "Performed preventive maintenance checks to support safe and reliable equipment operation." },
      "brakes": { summary: "working with brake systems", skill: "brakes", bullet: "Inspected, serviced, or assisted with brake-related repair tasks where assigned." },
      "hydraulics": { summary: "working around hydraulic systems", skill: "hydraulics", bullet: "Inspected or supported work on hydraulic systems, hoses, leaks, or related components." },
      "heavy equipment": { summary: "supporting heavy equipment or fleet work", skill: "heavy equipment", bullet: "Supported service or repair work on trucks, trailers, fleet vehicles, or heavy equipment." },
      "inspection": { summary: "performing inspections", skill: "inspections", bullet: "Completed inspections to identify safety, service, or repair needs before equipment returned to use." }
    }
  },
  construction: {
    title: "Construction Worker",
    summaryLead: "with hands-on jobsite experience",
    skillLead: "Skilled in",
    items: {
      "construction": { summary: "working in residential or construction environments", skill: "construction work", bullet: "Worked in construction or residential jobsite environments while following assigned tasks and safety expectations." },
      "carpentry": { summary: "performing carpentry, trim, door, or millwork tasks", skill: "carpentry and millwork", bullet: "Performed carpentry-related tasks involving doors, trim, millwork, or residential installation work." },
      "hand and power tools": { summary: "using hand and power tools", skill: "hand and power tools", bullet: "Used hand and power tools to complete installation, repair, carpentry, or construction tasks." },
      "installation": { summary: "installing building materials or components", skill: "installation", bullet: "Installed building materials or components while following jobsite instructions and quality expectations." },
      "measuring and cutting": { summary: "measuring and cutting materials", skill: "measuring and cutting", bullet: "Measured and cut materials to support accurate installation, carpentry, or construction work." },
      "safety procedures": { summary: "following jobsite safety procedures", skill: "jobsite safety", bullet: "Followed jobsite safety procedures while handling tools, materials, and assigned construction tasks." }
    }
  },
  customer_service: {
    title: "Customer Service Representative",
    summaryLead: "with front-line service experience",
    skillLead: "Skilled in",
    items: {
      "customer service": { summary: "helping customers and resolving service needs", skill: "customer service", bullet: "Helped customers with questions, service needs, purchases, or account concerns while maintaining professional service." },
      "phone support": { summary: "handling customer phone support", skill: "phone support", bullet: "Handled phone calls by listening to customer needs, providing information, and documenting next steps." },
      "CRM": { summary: "using CRM or customer systems", skill: "CRM systems", bullet: "Used CRM or customer systems to look up information, update records, or track customer interactions." },
      "de-escalation": { summary: "de-escalating complaints or customer issues", skill: "de-escalation", bullet: "De-escalated customer concerns by listening, clarifying the issue, and helping move the situation toward resolution." },
      "cash handling": { summary: "handling cash, POS, or transactions", skill: "cash handling and POS", bullet: "Processed POS transactions, handled payments, or balanced cash-handling tasks accurately." },
      "sales": { summary: "supporting sales goals or product recommendations", skill: "sales support", bullet: "Supported sales goals by answering product questions, recommending options, or following up with customers." }
    }
  },
  office: {
    title: "Office Assistant",
    summaryLead: "with administrative support experience",
    skillLead: "Skilled in",
    items: {
      "data entry": { summary: "entering and updating information accurately", skill: "data entry", bullet: "Entered and updated information accurately in records, spreadsheets, systems, or office documents." },
      "records": { summary: "maintaining records, files, or documents", skill: "records and filing", bullet: "Maintained records, files, or documents so information stayed organized and easy to locate." },
      "scheduling": { summary: "supporting scheduling or calendar tasks", skill: "scheduling", bullet: "Scheduled appointments, updated calendars, or supported office coordination tasks." },
      "email": { summary: "handling email communication", skill: "email communication", bullet: "Handled email communication by sending updates, responding to requests, or keeping information moving." },
      "Microsoft Office": { summary: "using Microsoft Office, Excel, Word, or spreadsheets", skill: "Microsoft Office", bullet: "Used Microsoft Office, Excel, Word, or spreadsheets to complete administrative or data-entry tasks." },
      "phone calls": { summary: "answering phones or front-desk calls", skill: "phone calls", bullet: "Answered phone calls, routed information, or supported front-desk communication needs." }
    }
  },
  driving: {
    title: "Driver",
    summaryLead: "with driving, delivery, or CDL-related experience",
    skillLead: "Skilled in",
    items: {
      "CDL": { summary: "holding or using CDL credentials", skill: "CDL", bullet: "Maintained CDL-related qualifications or training while preparing for safe commercial driving work." },
      "DOT": { summary: "following DOT expectations", skill: "DOT requirements", bullet: "Followed DOT-related expectations, safety rules, or compliance steps during driving or training duties." },
      "safe driving": { summary: "following safe driving practices", skill: "safe driving", bullet: "Operated vehicles with attention to safety, traffic conditions, and assigned route expectations." },
      "pre-trip inspection": { summary: "completing pre-trip inspections", skill: "pre-trip inspections", bullet: "Completed or practiced pre-trip inspections to identify safety concerns before operating equipment." },
      "post-trip inspection": { summary: "completing post-trip inspections", skill: "post-trip inspections", bullet: "Completed or practiced post-trip inspections to document equipment condition after routes or training." },
      "route delivery": { summary: "supporting route delivery work", skill: "route delivery", bullet: "Completed route, delivery, or transport tasks while keeping timing, safety, and customer requirements in mind." },
      "TWIC": { summary: "holding TWIC credentials", skill: "TWIC", bullet: "Maintained TWIC credentials where required for transportation, port, or secure-site access." }
    }
  },
  security: {
    title: "Security Officer",
    summaryLead: "with safety and security experience",
    skillLead: "Skilled in",
    items: {
      "security experience": { summary: "supporting site safety and security", skill: "site security", bullet: "Supported site safety and security by staying alert, following procedures, and reporting concerns." },
      "patrols": { summary: "conducting patrols", skill: "patrols", bullet: "Conducted patrols to monitor assigned areas, identify concerns, and support a safe environment." },
      "incident reports": { summary: "writing incident reports", skill: "incident reports", bullet: "Documented incidents, observations, or unusual activity through clear incident reports or security logs." },
      "access control": { summary: "supporting access control and visitor screening", skill: "access control and visitor screening", bullet: "Controlled access by checking entrances, visitors, or assigned access points." },
      "surveillance cameras": { summary: "monitoring surveillance cameras or security systems", skill: "surveillance cameras", bullet: "Monitored surveillance cameras or security systems to identify and report security concerns." },
      "emergency response": { summary: "responding to incidents or emergency situations", skill: "incident response", bullet: "Responded to incidents or safety concerns in a calm, professional manner." },
      "security procedures": { summary: "following site-specific security procedures", skill: "security procedures", bullet: "Followed security-related procedures and site-specific policies during assigned duties." },
      "security customer service": { summary: "supporting patients, visitors, staff, or clients with professional communication", skill: "security-related customer service", bullet: "Supported patients, visitors, staff, or clients with professional communication while maintaining site awareness." }
    }
  },
  cleaning: {
    title: "Cleaning Worker",
    summaryLead: "with cleaning and facility support experience",
    skillLead: "Skilled in",
    items: {
      "cleaning": { summary: "cleaning rooms, work areas, or facilities", skill: "cleaning", bullet: "Cleaned rooms, work areas, common areas, or facilities according to assigned standards." },
      "sanitation": { summary: "sanitizing surfaces and high-touch areas", skill: "sanitation", bullet: "Sanitized surfaces, high-touch areas, rooms, or equipment to support clean and safe spaces." },
      "trash removal": { summary: "removing trash and waste", skill: "trash removal", bullet: "Removed trash, waste, or debris while keeping assigned areas clean and organized." },
      "floor care": { summary: "sweeping, mopping, vacuuming, or floor care", skill: "floor care", bullet: "Completed floor care tasks such as sweeping, mopping, vacuuming, or cleaning assigned areas." },
      "restocking supplies": { summary: "restocking supplies", skill: "restocking supplies", bullet: "Restocked supplies in rooms, restrooms, carts, or work areas so daily operations could continue smoothly." }
    }
  },
  food_service: {
    title: "Food Service Worker",
    summaryLead: "with food service experience",
    skillLead: "Skilled in",
    items: {
      "food preparation": { summary: "preparing food or supporting kitchen prep", skill: "food preparation", bullet: "Prepared food, completed prep tasks, or supported kitchen production according to assigned standards." },
      "food safety": { summary: "following food safety and sanitation procedures", skill: "food safety", bullet: "Followed food safety, sanitation, and clean-work-area procedures during food service tasks." },
      "customer service": { summary: "serving guests or customers", skill: "guest service", bullet: "Served guests or customers by taking requests, answering questions, or supporting front-of-house needs." },
      "orders": { summary: "taking or preparing orders", skill: "orders", bullet: "Took, prepared, or organized customer orders while keeping accuracy and timing in focus." },
      "cash handling": { summary: "handling POS or payment transactions", skill: "cash handling and POS", bullet: "Handled POS or payment transactions accurately during food service operations." }
    }
  },
  education: {
    title: "Education Support Worker",
    summaryLead: "with classroom or student-support experience",
    skillLead: "Skilled in",
    items: {
      "student support": { summary: "supporting students in classroom settings", skill: "student support", bullet: "Supported students in classroom or learning settings while following teacher or school expectations." },
      "lesson support": { summary: "assisting with lessons or instruction", skill: "lesson support", bullet: "Assisted with lessons, instructional activities, or classroom tasks to support student learning." },
      "behavior management": { summary: "supporting behavior or classroom management", skill: "classroom management", bullet: "Supported classroom behavior expectations by redirecting students and helping maintain a focused learning environment." },
      "supervision": { summary: "supervising students", skill: "student supervision", bullet: "Supervised students during classroom, hallway, lunch, recess, or activity periods as assigned." }
    }
  },
  it: {
    title: "IT Support Technician",
    summaryLead: "with technical support experience",
    skillLead: "Skilled in",
    items: {
      "technical support": { summary: "providing technical support", skill: "technical support", bullet: "Provided technical support by helping users identify issues, follow steps, or restore basic access." },
      "troubleshooting": { summary: "troubleshooting technical issues", skill: "technical troubleshooting", bullet: "Troubleshot technical issues by checking symptoms, testing solutions, and documenting next steps." },
      "tickets": { summary: "working with tickets or service requests", skill: "ticketing systems", bullet: "Created, updated, or resolved tickets while tracking user issues and support actions." },
      "hardware": { summary: "supporting hardware such as laptops, desktops, or printers", skill: "hardware support", bullet: "Supported hardware issues involving laptops, desktops, printers, or connected devices." },
      "software": { summary: "supporting software or Windows applications", skill: "software support", bullet: "Supported software, Windows, or application issues by guiding users through fixes or escalation steps." },
      "password resets": { summary: "handling password resets or account access", skill: "password resets", bullet: "Assisted with password resets, account access, or login issues according to support procedures." },
      "networking": { summary: "supporting basic network troubleshooting", skill: "network troubleshooting", bullet: "Supported basic network troubleshooting by checking connectivity, devices, or escalation details." },
      "cybersecurity": { summary: "working with cybersecurity tools or security monitoring", skill: "cybersecurity", bullet: "Supported cybersecurity tasks by monitoring alerts, following security procedures, or documenting concerns." }
    }
  },
  healthcare_admin: {
    title: "Medical Office Worker",
    summaryLead: "with medical office or health records experience",
    skillLead: "Skilled in",
    items: {
      "medical billing": { summary: "supporting medical billing or claims work", skill: "medical billing", bullet: "Supported medical billing, claims, or insurance-related tasks while maintaining accurate information." },
      "medical coding": { summary: "supporting medical coding work", skill: "medical coding", bullet: "Supported medical coding work involving codes, records, or claim documentation where assigned." },
      "medical records": { summary: "maintaining medical records", skill: "medical records", bullet: "Maintained medical records, EHR details, or patient information with attention to accuracy." },
      "HIPAA": { summary: "following HIPAA and patient privacy requirements", skill: "HIPAA", bullet: "Followed HIPAA and patient privacy requirements when handling medical or patient information." },
      "data entry": { summary: "entering medical or office data", skill: "data entry", bullet: "Entered medical, billing, coding, or office data accurately into records or systems." }
    }
  }
};

function titleForWording(selectedLabel, family, diagnosisCategory = "strong_match", resumeText = "") {
  return safeResumeTitle(resumeText, family, selectedLabel, diagnosisCategory);
}

// V3: copy-ready resume wording cannot contain app/system language.
const COPY_READY_BANNED_PATTERNS = [
  /\bATS\b/i,
  /proven skills/i,
  /resume skills/i,
  /reliable candidate/i,
  /\bcandidate\b/i,
  /\bapplicant\b/i,
  /experience related to/i,
  /related to [a-z\s/]+, including/i,
  /apply proven/i,
  /using proven/i,
  /ATS systems can clearly read/i,
  /support daily goals/i,
  /able to follow instructions/i,
  /follow instructions/i
];

function containsBannedCopyLanguage(value) {
  return COPY_READY_BANNED_PATTERNS.some(pattern => pattern.test(text(value)));
}

function outputHasBannedCopyLanguage(output) {
  if (!output) return true;
  if (containsBannedCopyLanguage(output.summary)) return true;
  return (output.bullets || []).some(containsBannedCopyLanguage);
}


// V4: smart fix checklist, realistic score caps, and safer medium-match titles.
const FAMILY_PROOF_GAPS = {
  manufacturing: ["machine operation", "equipment monitoring", "quality checks", "safety procedures", "material handling", "machine setup", "basic troubleshooting", "rotating swing shifts", "multiple pieces of equipment", "stable work history"],
  warehouse: ["warehouse operations", "loading and unloading", "material handling", "shipping and receiving", "inventory organization", "pallet jack", "RF scanner", "warehouse safety"],
  healthcare: ["active license or certification", "patient care", "ADLs", "vital signs", "HIPAA", "infection control", "charting", "clinical experience"],
  healthcare_admin: ["medical billing", "medical coding", "medical records", "EHR/EMR", "HIPAA", "claims", "insurance"],
  maintenance: ["work orders", "preventive maintenance", "service requests", "troubleshooting", "plumbing", "HVAC", "appliance repair", "electrical repairs"],
  electrical: ["electrical wiring", "outlets", "switches", "fixtures", "troubleshooting", "conduit", "panels", "jobsite safety"],
  welding: ["welding", "fabrication", "MIG", "TIG", "grinding", "cutting", "blueprints", "shop safety"],
  diesel: ["diesel engines", "diagnostics", "preventive maintenance", "brakes", "hydraulics", "heavy equipment", "inspections", "shop safety"],
  construction: ["construction", "carpentry", "hand and power tools", "installation", "measuring and cutting", "jobsite safety"],
  customer_service: ["phone support", "email support", "CRM", "customer accounts", "complaint resolution", "POS", "returns", "service notes"],
  office: ["data entry", "records", "filing", "scheduling", "Microsoft Office", "Excel", "email", "phone calls"],
  driving: ["CDL", "DOT", "pre-trip inspection", "post-trip inspection", "route planning", "dispatch communication", "delivery paperwork", "safe driving"],
  security: ["security experience", "patrols", "access control", "visitor screening", "incident reports", "emergency response", "surveillance cameras", "security procedures", "guard card/security license if required"],
  cleaning: ["cleaning", "sanitation", "trash removal", "restocking supplies", "floor care", "safety procedures"],
  food_service: ["food preparation", "food safety", "sanitation", "orders", "customer service", "cash handling", "stocking"],
  education: ["student support", "classroom support", "lesson support", "behavior management", "supervision", "documentation"],
  it: ["technical support", "troubleshooting", "tickets", "Windows", "password resets", "hardware", "software", "networking", "documentation"]
};

const FAMILY_STRENGTHENING_ADVICE = {
  manufacturing: "real machine operation, production equipment, quality checks, safety procedures, material handling, shift details, or manufacturing duties",
  warehouse: "real warehouse duties such as loading, unloading, pallet jack use, shipping, receiving, inventory, RF scanner use, or forklift experience",
  healthcare: "real healthcare training, certification, clinical experience, patient care, charting, HIPAA, vital signs, or license proof",
  healthcare_admin: "real medical office training, billing, coding, claims, insurance, medical records, EHR/EMR, or HIPAA experience",
  maintenance: "real maintenance duties such as work orders, preventive maintenance, service requests, repairs, troubleshooting, plumbing, HVAC, appliance repair, or electrical repair",
  electrical: "real electrical training, wiring, outlets, switches, fixtures, conduit, panels, troubleshooting, or supervised electrical work",
  welding: "real welding training, MIG/TIG, fabrication, cutting, grinding, blueprint reading, or shop work",
  diesel: "real diesel training, diagnostics, preventive maintenance, inspections, brakes, hydraulics, heavy equipment, or shop experience",
  construction: "real construction, carpentry, installation, measuring, cutting, tools, jobsite safety, or helper experience",
  customer_service: "real customer service duties such as phone support, email support, CRM, accounts, complaints, POS, returns, or service notes",
  office: "real office duties such as data entry, records, scheduling, Microsoft Office, Excel, email, phones, or filing",
  driving: "real CDL, DOT, pre-trip/post-trip inspections, route delivery, dispatch, paperwork, safe driving, or driving experience",
  security: "real security training, guard card/security license if required, patrol experience, access control duties, visitor screening, incident reports, emergency response, surveillance cameras, or security work experience",
  cleaning: "real cleaning, sanitation, trash removal, restocking, floor care, housekeeping, janitorial, or facility support duties",
  food_service: "real food prep, cooking, food safety, sanitation, order handling, stocking, customer service, or restaurant experience",
  education: "real classroom, student support, supervision, tutoring, lesson support, behavior management, or education training",
  it: "real technical support, help desk, tickets, Windows, password resets, hardware, software, networking, cybersecurity tools, or IT training"
};

function getFamilyProofGaps(family, selectedLabel, missingItems = []) {
  const lowerLabel = normalize(selectedLabel);
  if (lowerLabel.includes("registered nurse") || lowerLabel === "rn") {
    return ["active RN license", "clinical experience", "patient care", "medication administration", "vital signs", "care plans", "charting", "HIPAA", "infection control"];
  }
  if (lowerLabel.includes("licensed practical nurse") || lowerLabel === "lpn") {
    return ["active LPN license", "clinical experience", "patient care", "medication administration", "vital signs", "charting", "HIPAA", "infection control"];
  }
  const missingTerms = cleanList((missingItems || []).map(item => item.term)).slice(0, 8);
  const bank = FAMILY_PROOF_GAPS[family] || [];
  return cleanList([...missingTerms, ...bank]).slice(0, 9);
}

function getFamilyStrengtheningAdvice(family, selectedLabel) {
  const label = normalize(selectedLabel);
  if (label.includes("registered nurse")) return "active RN license, nursing education, clinical experience, patient care, medication administration, charting, care plans, HIPAA, or infection control proof";
  if (label.includes("licensed practical nurse")) return "active LPN license, nursing education, clinical experience, patient care, medication administration, charting, HIPAA, or infection control proof";
  return FAMILY_STRENGTHENING_ADVICE[family] || "real training, certification, or job duties that prove the missing requirements";
}

function containsPhraseOrWord(normalizedText, pattern) {
  const normalizedPattern = normalize(pattern);
  if (!normalizedPattern) return false;
  if (normalizedPattern.length <= 3 && !normalizedPattern.includes(" ")) return wordAppears(normalizedText, normalizedPattern);
  return normalizedText.includes(normalizedPattern);
}

function resumeShowsAny(resumeNorm, patterns) {
  return patterns.some(pattern => containsPhraseOrWord(resumeNorm, pattern));
}

function hasJobPhrase(jobNorm, patterns) {
  return patterns.some(pattern => containsPhraseOrWord(jobNorm, pattern));
}

function matchResumeRequirement(resumeNorm, resumePatterns = []) {
  return resumePatterns.length ? resumeShowsAny(resumeNorm, resumePatterns) : false;
}

function detectYearRequirement(jobNorm) {
  const findings = [];
  const patterns = [
    /(\d+)\s*\+?\s*(?:years|year|yrs|yr)\s+(?:of\s+)?(?:directly\s+related\s+|related\s+|practical\s+|verifiable\s+|continuous\s+)?experience/g,
    /minimum\s+of\s+(\d+)\s*(?:years|year|yrs|yr)/g,
    /at\s+least\s+(\d+)\s*(?:years|year|yrs|yr)/g,
    /(\d+)\s*(?:months|month)\s+(?:of\s+)?(?:verifiable\s+)?(?:tractor\s*trailer|commercial|driving|related)?\s*experience/g
  ];
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(jobNorm)) !== null) {
      const raw = match[0].replace(/\s+/g, " ").trim();
      if (!findings.some(item => item.raw === raw)) findings.push({ raw, number: Number(match[1]) || 0 });
    }
  });
  return findings.slice(0, 4);
}

function detectHardRequirements(jobText, resumeText, selectedFamily) {
  const job = normalize(jobText);
  const resume = normalize(resumeText);
  const reqs = [];

  function add(label, patterns, resumePatterns = [], level = "confirm", gate = "general") {
    if (!hasJobPhrase(job, patterns)) return;
    const met = matchResumeRequirement(resume, resumePatterns);
    const key = `${label}|${gate}`;
    if (reqs.some(item => item.key === key)) return;
    reqs.push({ label, met, level, gate, key });
  }

  function addManual(label, met, level = "confirm", gate = "general") {
    const key = `${label}|${gate}`;
    if (reqs.some(item => item.key === key)) return;
    reqs.push({ label, met, level, gate, key });
  }

  // Common employment gates.
  add("high school diploma or GED", ["high school diploma", "ged", "diploma or equivalent", "high school diploma or equivalent"], ["high school", "ged", "diploma", "graduated"], "confirm", "education");
  add("background check / background investigation", ["background investigation", "background check", "criminal background", "criminal histories", "background screening", "background/drug"], [], "confirm", "screening");
  add("drug screen", ["drug screen", "drug test", "drug/test", "drug screening", "drug-free workplace"], [], "confirm", "screening");
  add("eligible to work in the United States", ["eligible to work in the united states", "legally authorized to work", "legally eligible to work", "e-verify"], ["eligible to work", "authorized to work", "u.s. citizen", "us citizen"], "confirm", "work_authorization");
  add("U.S. citizenship", ["u.s. citizenship required", "united states citizen", "must be a united states citizen", "us citizenship required"], ["u.s. citizen", "us citizen", "united states citizen"], "hard", "citizenship");

  // Driving and field-service gates.
  add("valid driver's license", ["valid driver's license", "valid driver", "driver license", "driver’s license", "active drivers license", "active driver's license"], ["driver's license", "driver license", "valid license", "cdl"], "hard", "driver_license");
  add("acceptable driving record / MVR", ["acceptable driving record", "satisfactory driving record", "clean driving record", "acceptable motor vehicle record", "mvr"], ["clean driving record", "safe driving", "driving record", "mvr"], "hard", "mvr");
  add("valid auto insurance", ["valid auto insurance", "auto insurance that meets company standards"], ["auto insurance", "insured"], "hard", "auto_insurance");
  add("at least 18 years old", ["at least 18", "18 years of age", "must be 18"], [], "confirm", "age");
  add("at least 21 years old", ["at least 21", "21 years of age", "must be 21"], [], "confirm", "age");
  add("at least 24 years old", ["must be 24", "at least 24", "24 years old"], [], "confirm", "age");

  // CDL gates.
  const cdlAJob = hasJobPhrase(job, ["cdl-a", "cdl a", "class-a cdl", "class a cdl", "valid class-a", "valid class a"]);
  if (cdlAJob) addManual("valid Class-A CDL", resumeShowsAny(resume, ["cdl-a", "cdl a", "class a cdl", "class-a cdl"]), "hard", "cdl_a");
  else add("CDL", ["cdl", "commercial driver"], ["cdl", "commercial driver"], "hard", "cdl");
  add("Tanker endorsement", ["tanker endorsement", "tanker and hazmat", "tanker"], ["tanker endorsement", "tanker"], "hard", "tanker");
  add("Hazmat endorsement", ["hazmat endorsement", "tanker and hazmat", "hazardous materials endorsement", "hazmat"], ["hazmat endorsement", "hazmat", "hazardous materials"], "hard", "hazmat");
  add("no license restrictions", ["no restrictions", "no license restrictions", "no restrictions on license"], ["no restrictions", "manual restriction", "unrestricted"], "hard", "license_restrictions");
  add("10-speed/manual transmission ability", ["ten speed", "10 speed", "10-speed", "manual transmission", "able to drive a ten speed"], ["10 speed", "10-speed", "ten speed", "manual transmission"], "hard", "manual_transmission");
  add("DOT physical", ["dot physical"], ["dot physical", "dot card", "medical card"], "hard", "dot_physical");
  add("functional agility test", ["functional agility test", "hpe"], [], "confirm", "agility_test");

  // Licenses, certifications, and regulated fields.
  add("active RN license", ["active rn license", "rn license", "registered nurse license"], ["rn license", "registered nurse", "nursing license"], "hard", "rn_license");
  add("active LPN license", ["active lpn license", "lpn license", "licensed practical nurse"], ["lpn license", "licensed practical nurse"], "hard", "lpn_license");
  add("CNA certification", ["cna certification", "certified nursing assistant", "cna required"], ["cna", "certified nursing assistant"], "hard", "cna");
  add("state teaching certification", ["state teaching certification", "teaching certification", "teacher certification"], ["teaching certification", "certified teacher", "teacher license", "educator certificate"], "hard", "teaching_certification");
  add("bachelor's degree", ["bachelor's degree", "bachelor degree", "bs degree", "b.s. degree"], ["bachelor", "bachelors", "b.s", "bs degree", "degree"], "hard", "bachelors");
  add("EPA Universal Certification", ["epa universal certification", "epa universal"], ["epa universal", "epa certification"], "hard", "epa_universal");
  add("commercial food service equipment repair certificate", ["certificate in commercial food service equipment repair", "commercial food service equipment repair"], ["commercial food service equipment repair", "food service equipment repair certificate"], "hard", "food_equipment_certificate");
  add("alarm agent permit eligibility", ["alarm agent permit"], ["alarm agent", "alarm permit"], "hard", "alarm_agent_permit");
  add("pesticide license within 90 days", ["pesticide license", "pesticide certification"], ["pesticide license", "pesticide certification", "pest control license"], "confirm", "pesticide_license");
  add("security license or guard card", ["licensing requirements", "security license", "guard card", "license may be required"], ["security license", "guard card"], selectedFamily === "security" ? "hard" : "confirm", "security_license");
  add("I-CAR / ASE certification", ["i-car", "ase certifications", "ase certification"], ["i-car", "ase"], "confirm", "auto_certification");
  add("CompTIA A+ or CTS certification", ["comptia a+", "cts"], ["comptia a+", "a+ certification", "cts"], "hard", "it_certification");
  add("CISSP certification", ["cissp"], ["cissp"], "confirm", "cissp");

  // Clearance / federal access gates.
  add("active TS/SCI with Polygraph", ["ts/sci with polygraph", "ts sci with polygraph", "active clearance", "polygraph is required"], ["ts/sci", "ts sci", "polygraph", "active clearance"], "hard", "ts_sci_poly");
  add("facility access authorization / federal background eligibility", ["facility access authorization", "employment authorization", "background investigative", "doe q clearance", "top secret", "security clearance"], ["security clearance", "top secret", "q clearance", "facility access"], "confirm", "facility_access");

  // Physical / schedule gates.
  add("rotating or swing shifts", ["rotating swing shifts", "rotating shifts", "swing shifts"], ["rotating shift", "swing shift", "12-hour", "12 hour", "night shift"], "confirm", "schedule");
  add("weekend or holiday availability", ["weekend", "weekends", "holidays", "holiday availability"], ["weekend", "holiday", "flexible schedule"], "confirm", "schedule");
  add("overnight or night shift availability", ["overnight", "night shift", "3rd shift", "third shift", "11pm", "7:00 pm", "7 pm"], ["night shift", "overnight", "3rd shift", "third shift"], "confirm", "schedule");
  add("lifting / physical requirements", ["lift 50", "lift 75", "lift 80", "lift up to 100", "100 lbs", "50 pounds", "80 pounds", "squat", "stoop", "bend", "climb", "manual dexterity", "push/pull"], ["lift", "lifting", "50", "75", "80", "100", "physical", "squat", "stoop", "bend", "climb"], "confirm", "physical");
  add("ladder, heights, or confined-space work", ["climb ladders", "ladders", "work at heights", "confined spaces", "crawl spaces", "attics", "rooftops"], ["ladder", "heights", "confined", "crawl", "attic", "rooftop"], "confirm", "heights_confined");
  add("outdoor / all-weather work", ["outdoors", "outdoor", "all weather", "weather conditions", "outside in the elements"], ["outdoor", "outside", "weather"], "confirm", "outdoor");
  add("PPE / respirator", ["ppe", "personal protective equipment", "respirator", "safety harness", "steel-toed"], ["ppe", "respirator", "safety harness", "steel-toe", "steel toed"], "confirm", "ppe");

  // Technical skill gates from advanced IT/software posts.
  add("5+ years SQL Server DBA / SQL Development", ["5+ years of sql server", "5 years of sql server", "5+ years sql server", "5+ years of sql development", "5 years of sql development"], ["sql server dba", "database administrator", "t-sql", "sql development"], "hard", "senior_sql");
  add("7+ years cybersecurity in a regulated environment", ["7 years' experience working in a cyber security role", "7 years experience working in a cyber security role", "7+ years cybersecurity", "minimum of 7 years"], ["cybersecurity", "cyber security", "nist", "fips", "grc", "risk assessment"], "hard", "senior_cyber");
  add("professional C# / ASP.NET development experience", ["c#/asp.net", "asp.net mvc", "asp.net mvc core", "entity framework", "razor pages"], ["c#", "asp.net", "entity framework", "mvc", "razor"], "hard", "dotnet_dev");
  add("Wonderware experience", ["wonderware"], ["wonderware"], "hard", "wonderware");

  detectYearRequirement(job).forEach(item => {
    const hard = item.number >= 2 || /verifiable|continuous|directly related|practical|tractor|commercial|cyber|sql/.test(item.raw);
    addManual(`${item.raw} required`, resume.includes(`${item.number} years`) || resume.includes(`${item.number}+ years`) || resume.includes(`${item.number} year`) || resume.includes(`${item.number} months`), hard ? "hard" : "confirm", "experience_time");
  });

  return reqs.map(({ key, ...item }) => item);
}

function formatHardRequirement(req) {
  if (req.met) return `${req.label} appears to be shown.`;
  if (req.level === "hard") return `${req.label} is required or strongly requested. Add proof only if you have it.`;
  return `${req.label} is mentioned in the job post. Confirm before applying.`;
}

function formatRequirementShort(req) {
  return req.met ? `${req.label}: shown` : `${req.label}: not clearly shown`;
}

function isGigOrLowQualityPost(jobText) {
  const job = normalize(jobText);
  const gigSignals = ["focus groups", "paid research", "surveys", "product testing", "earn income on your own terms", "no prior research", "from home or in-person"];
  const scamSignals = ["gift card", "crypto", "telegram", "whatsapp", "send a check", "equipment purchase", "bank login", "processing fee"];
  const gigCount = gigSignals.filter(signal => job.includes(normalize(signal))).length;
  const scamCount = scamSignals.filter(signal => job.includes(normalize(signal))).length;
  if (scamCount) return { hit: true, risk: "high", reason: "The post contains scam-risk wording or payment/equipment warning signs." };
  if (gigCount >= 2) return { hit: true, risk: "gig", reason: "This looks more like a paid survey, focus group, or product-testing gig than steady employment." };
  return { hit: false, risk: "none", reason: "" };
}


// V5: real job family/subtype detector. This explains what the job really is before scoring the resume.
function subtypeRule(id, label, family, resumeMode, watchOut, patterns) {
  return { id, label, family, resumeMode, watchOut, patterns };
}

const REAL_JOB_SUBTYPE_RULES = [
  subtypeRule("pest_control_technician", "Pest Control Technician / Route Service Technician", "Field Service / Pest Control", "Field service / route technician wording", "This is not just general customer service. It is a route-based field service job with driving, inspections, physical work, and licensing.", [
    ["pest control", 6], ["pest management", 6], ["orkin", 6], ["pesticide license", 7], ["route schedule", 5], ["assigned territory", 4], ["treatment planning", 5], ["property inspection", 4], ["inspect the interior and exterior", 4], ["customer homes", 3], ["customer businesses", 3], ["handheld device", 3], ["crawl spaces", 4], ["attics", 4], ["osha-compliant respirator", 4], ["company vehicle", 3]
  ]),
  subtypeRule("cable_installation_technician", "Cable Installation Technician / Telecom Field Technician", "Telecom / Cable Field Service", "Cable installer / telecom field technician wording", "This is not IT help desk. It is hands-on field installation in customer homes or businesses.", [
    ["cable systems", 6], ["video", 3], ["hsi", 7], ["xhs", 7], ["cdv", 7], ["residential/commercial", 4], ["install residential", 4], ["commercial video", 4], ["dispatch", 4], ["arrivals", 3], ["departures", 3], ["local travel 100", 5], ["28 ft", 4], ["ladders", 4], ["confined spaces", 3], ["mvr", 4], ["operating systems", 2]
  ]),
  subtypeRule("security_installation_technician", "Security Installation Technician / Low-Voltage Alarm Technician", "Low-Voltage / Security Installation", "Low-voltage installer / field technician wording", "This is not a Security Officer job. Do not use guard, patrol, or surveillance wording unless the job actually asks for it.", [
    ["alarm systems", 7], ["control panels", 5], ["sensors", 5], ["cameras", 4], ["security installation", 7], ["low voltage", 7], ["access control", 4], ["customer education", 3], ["install", 2], ["troubleshooting", 3], ["alarm agent", 6], ["basic tools", 2], ["ladder", 2]
  ]),
  subtypeRule("paid_survey_focus_group", "Paid Survey / Focus Group Gig", "Gig / Research Task", "No resume rewrite needed", "This does not look like a stable job. It may not provide steady hours, benefits, or guaranteed income.", [
    ["focus group", 8], ["paid survey", 8], ["surveys", 6], ["product testing", 7], ["feedback", 3], ["participate", 3], ["remote participation", 5], ["no experience required", 2], ["gift card", 5], ["earn", 2]
  ]),
  subtypeRule("certified_classroom_teacher", "Certified Classroom Teacher / K-12 Teacher", "Education / Teaching", "Certified teacher wording", "This is not Teacher Assistant work. It usually requires a bachelor's degree and state teaching certification or alternative certification eligibility.", [
    ["state teaching certification", 8], ["bachelor", 5], ["alternative certification", 6], ["classroom", 3], ["lesson planning", 4], ["students", 3], ["technology-driven classrooms", 4], ["professional development", 3], ["equity", 3], ["inclusion", 3], ["educational leadership", 3]
  ]),
  subtypeRule("early_childhood_teacher", "Daycare Teacher / Early Childhood Education Teacher", "Education / Childcare", "Early childhood / daycare teacher wording", "This is not a K-12 certified teacher role unless the posting says so. It is early childhood classroom and child-development work.", [
    ["early childhood", 8], ["daycare", 7], ["preschool", 7], ["age-appropriate curriculum", 6], ["play-based learning", 5], ["social-emotional", 5], ["parent", 3], ["guardian", 3], ["milestones", 4], ["montessori", 4], ["behavior management", 4], ["arts and crafts", 3], ["storytelling", 3]
  ]),
  subtypeRule("sql_server_dba", "SQL Server Database Administrator / SQL DBA", "Advanced IT / Database Administration", "SQL DBA wording only when proven", "This is not entry-level IT support. It is an advanced database administration job.", [
    ["sql server dba", 9], ["database administrator", 8], ["t-sql", 7], ["performance tuning", 6], ["backup", 4], ["recovery", 4], ["disaster recovery", 5], ["migrations", 5], ["upgrades", 4], ["patching", 3], ["ssis", 5], ["ssrs", 5], ["ssas", 5], ["azure sql", 5], ["5+ years", 4]
  ]),
  subtypeRule("cleared_python_software_engineer", "Cleared Python Software Engineer / Mission Software Developer", "Cleared Software / Defense Tech", "Cleared software engineer wording only when proven", "This is not a regular Python job. Active TS/SCI with Polygraph is a hard gate.", [
    ["ts/sci", 9], ["polygraph", 9], ["active clearance", 7], ["python", 4], ["back-end services", 5], ["backend services", 5], ["data processing at scale", 5], ["active mq", 5], ["activemq", 5], ["nosql", 5], ["elastic", 4], ["linux", 4], ["ci/cd", 4], ["jira", 3], ["confluence", 3], ["tier 3", 4]
  ]),
  subtypeRule("dotnet_web_developer", ".NET Web Developer / C# ASP.NET Developer", "Software Development", "Software developer wording only when proven", "This is software development, not IT help desk. Do not use support-tech wording as if it proves developer experience.", [
    ["c#", 7], ["asp.net", 8], ["mvc", 5], ["razor", 5], ["entity framework", 6], ["linq", 5], ["web api", 5], ["front-end", 3], ["back-end", 3], ["source control", 3], ["unit testing", 4], ["sdlc", 3]
  ]),
  subtypeRule("qa_automation_developer", "QA Automation / Software Tester Developer Hybrid", "Software QA / Automation", "QA automation wording only when proven", "This is not basic software use. It needs testing, defect tracking, and sometimes coding proof.", [
    ["test cases", 6], ["test plans", 6], ["automated testing", 7], ["qa methodology", 7], ["defects", 4], ["defect tracking", 5], ["requirements", 2], ["usability", 3], ["performance", 3], ["scalability", 3], ["c#", 3], ["asp.net", 3]
  ]),
  subtypeRule("cybersecurity_grc_analyst", "Cybersecurity GRC / Compliance Analyst", "Cybersecurity Governance, Risk & Compliance", "Cybersecurity GRC wording only when proven", "This is not entry-level cyber. It is regulated compliance, risk, documentation, and control work.", [
    ["nist", 8], ["800-53", 8], ["fips", 6], ["ssp", 7], ["ato", 7], ["risk assessment", 6], ["grc", 7], ["governance", 5], ["compliance", 4], ["security controls", 5], ["cissp", 5], ["disaster recovery plan", 4], ["regulated environment", 4]
  ]),
  subtypeRule("industrial_automation_scada", "Industrial Automation / Wonderware SCADA Developer", "Industrial Automation Software", "Industrial automation / SCADA wording only when proven", "This is not regular IT support or generic software development. It is industrial automation software work.", [
    ["wonderware", 9], ["scada", 9], ["hmi", 6], ["industrial automation", 7], ["vb.net", 5], ["ado.net", 5], ["advanced t-sql", 5], ["post-implementation", 3], ["concept to", 2]
  ]),
  subtypeRule("commercial_kitchen_equipment_tech", "Commercial Cooking Equipment Technician", "Commercial Equipment Repair / Field Service", "Commercial equipment repair wording only when proven", "This is not general maintenance. It is specialized food-service equipment repair.", [
    ["commercial cooking equipment", 9], ["food service equipment", 8], ["commercial kitchen", 7], ["warranty", 4], ["non-warranty", 4], ["emergency repair", 4], ["epa universal", 6], ["manufacturer", 3], ["parts", 2], ["billing", 2]
  ]),
  subtypeRule("auto_body_collision_tech", "Auto Body Technician / Collision Repair Technician", "Automotive Collision Repair", "Auto body repair wording only when proven", "This is not regular mechanic work. It is body, panel, sanding, filler, and collision repair.", [
    ["collision repair", 8], ["auto body", 8], ["body filler", 6], ["panel replacement", 6], ["disassembly", 4], ["dent", 4], ["sanding", 4], ["grinding", 3], ["paint department", 5], ["i-car", 5], ["ase", 3]
  ]),
  subtypeRule("cdl_tanker_hazmat_driver", "CDL-A Tanker / Hazmat Truck Driver", "CDL / Specialized Truck Driving", "CDL tanker/hazmat wording only when proven", "This is not an entry-level CDL job. Tanker, Hazmat, driving history, and sometimes manual transmission ability can block applicants.", [
    ["tanker", 8], ["hazmat", 8], ["endorsement", 5], ["cdl-a", 5], ["class a", 4], ["10-speed", 5], ["manual", 4], ["loads per day", 4], ["commercial driving", 3], ["no restrictions", 4]
  ]),
  subtypeRule("cdl_local_dedicated_driver", "CDL-A Dedicated Local / Dry Van Driver", "CDL / Local Truck Driving", "CDL driver wording only when proven", "This is CDL driver work, not general delivery. Tractor-trailer experience may be a hard gate.", [
    ["cdl-a", 5], ["class a", 4], ["dry van", 6], ["drop and hook", 6], ["tractor-trailer", 6], ["home daily", 4], ["dedicated", 3], ["eld", 4], ["qualcomm", 4], ["local", 2]
  ]),
  subtypeRule("railcar_switchman", "Railcar Switchman / Rail Yard Groundman", "Rail Yard Operations", "Rail yard / switchman wording only when proven", "This is rail yard switching work, not just warehouse or outdoor labor.", [
    ["throw switches", 8], ["coupling", 7], ["uncoupling", 7], ["air hoses", 6], ["hand brakes", 6], ["radio signals", 5], ["hand signals", 5], ["trackmobile", 6], ["railcar", 4], ["rail yard", 5]
  ]),
  subtypeRule("industrial_shipping_loader", "Industrial Shipping Loader / Shipping Operations Technician", "Industrial Shipping / Loading", "Shipping loader wording only when proven", "This is physical shipping/loading operations, not just a desk shipping clerk role.", [
    ["bill of lading", 7], ["flatbed", 5], ["van loading", 5], ["railcar loading", 7], ["fork truck", 5], ["shipping issues", 4], ["nonconforming", 4], ["inbound sheets", 4], ["counts", 2], ["labeling", 2]
  ])
];

function scoreSubtypeRule(jobNorm, rule) {
  let score = 0;
  const clues = [];
  rule.patterns.forEach(([pattern, weight]) => {
    const normalizedPattern = normalize(pattern);
    if (!normalizedPattern) return;
    const found = normalizedPattern.length <= 3 ? wordAppears(jobNorm, normalizedPattern) : jobNorm.includes(normalizedPattern);
    if (found) {
      score += weight;
      clues.push(pattern);
    }
  });
  return { ...rule, score, clues: cleanList(clues) };
}

function fallbackRealJobType(jobFamily, selected) {
  const family = jobFamily.family && jobFamily.family !== "general" ? jobFamily.family : selected.family;
  const familyLabel = FAMILY_LABELS[family] || selected.label || "General job";
  return {
    id: "broad_family",
    label: `${familyLabel} role`,
    family: familyLabel,
    resumeMode: `${familyLabel} wording`,
    watchOut: "This job post does not have enough subtype clues for a precise label. Use the hard requirements and proof gaps before copying wording.",
    confidence: "Low",
    confidenceScore: 0,
    clues: jobFamily.matched || [],
    alternatives: []
  };
}

function detectRealJobType(jobText, selected, jobFamily) {
  const jobNorm = normalize(jobText);
  const scored = REAL_JOB_SUBTYPE_RULES
    .map(rule => scoreSubtypeRule(jobNorm, rule))
    .sort((a, b) => b.score - a.score);
  const best = scored[0] || { score: 0, clues: [] };
  if (!best.score || best.score < 8 || best.clues.length < 2) {
    return fallbackRealJobType(jobFamily, selected);
  }

  let confidence = "Low";
  if (best.score >= 20 && best.clues.length >= 4) confidence = "High";
  else if (best.score >= 12 && best.clues.length >= 3) confidence = "Medium";

  const alternatives = scored
    .filter(item => item.id !== best.id && item.score >= Math.max(8, Math.round(best.score * 0.65)))
    .slice(0, 2)
    .map(item => item.label);

  return {
    id: best.id,
    label: best.label,
    family: best.family,
    resumeMode: best.resumeMode,
    watchOut: best.watchOut,
    confidence,
    confidenceScore: best.score,
    clues: best.clues.slice(0, 9),
    alternatives
  };
}

function buildSelectedTypeWarning(realJobType, selected) {
  if (!realJobType || realJobType.id === "broad_family") return "";
  const selectedLabel = normalize(selected.label || "");
  const realLabel = normalize(realJobType.label || "");
  const selectedFamilyLabel = normalize(FAMILY_LABELS[selected.family] || "");
  const realFamily = normalize(realJobType.family || "");
  if (selected.family === "general") return "";
  if (realLabel.includes(selectedLabel) || selectedLabel.includes(realLabel)) return "";
  if (selectedFamilyLabel && realFamily.includes(selectedFamilyLabel)) return "";
  return `You selected ${selected.label}, but the duties read closer to ${realJobType.label}. Use the detected job type before trusting resume wording.`;
}

function buildApplyDecision({ diagnosis, keywordData, smartFixes, resumeFamily, jobFamily, jobText, realJobType }) {
  const reqs = smartFixes?.hardRequirements || [];
  const unmetHard = reqs.filter(item => item.level === "hard" && !item.met);
  const unmetConfirm = reqs.filter(item => item.level !== "hard" && !item.met);
  const strictBlockerGates = new Set([
    "cdl_a", "tanker", "hazmat", "license_restrictions", "manual_transmission", "rn_license", "lpn_license", "cna",
    "teaching_certification", "bachelors", "epa_universal", "food_equipment_certificate", "ts_sci_poly", "senior_sql",
    "senior_cyber", "dotnet_dev", "wonderware", "citizenship", "it_certification"
  ]);
  const strictBlockers = unmetHard.filter(item => strictBlockerGates.has(item.gate));
  const gigRisk = smartFixes?.gigRisk || { hit: false };

  if (gigRisk.hit) {
    return {
      decision: "be_careful",
      label: "Be careful — gig / low-quality posting",
      tone: "warning",
      reason: gigRisk.reason,
      blockers: [],
      confirmations: unmetConfirm,
      nextStep: "Do not treat this like steady employment. Verify the company, pay structure, interview process, and whether they ask for money or personal financial information."
    };
  }

  if (strictBlockers.length) {
    return {
      decision: "do_not_apply_yet",
      label: "Do not apply yet",
      tone: "danger",
      reason: `This job has a hard gate the resume does not clearly prove: ${joinEnglish(strictBlockers.map(item => item.label).slice(0, 4))}.`,
      blockers: strictBlockers,
      confirmations: unmetConfirm,
      nextStep: "Get or show the required license, certification, clearance, endorsement, degree, or experience first. Do not let the app create wording around a requirement you do not have."
    };
  }

  if (diagnosis.category === "wrong_job_type") {
    return {
      decision: "do_not_apply_yet",
      label: "Do not apply with this scan yet",
      tone: "danger",
      reason: "The selected job type does not match what the job post appears to be.",
      blockers: [],
      confirmations: unmetConfirm,
      nextStep: "Switch the job type or use General / Any Job, then scan again before copying wording."
    };
  }

  const job = normalize(jobText || "");
  const trainingAllowed = hasJobPhrase(job, ["no experience required", "we'll train", "we will train", "we teach", "training provided", "paid training", "company paid", "within 90 days"]);
  if (diagnosis.category === "weak_evidence" && trainingAllowed) {
    return {
      decision: "apply_if_true",
      label: "Apply only if these are true",
      tone: "warning",
      reason: "This posting appears to train new hires, but the resume still needs to show the required license, screening, physical, route, worksite, or training eligibility items.",
      blockers: unmetHard,
      confirmations: unmetConfirm,
      nextStep: "Do not claim the trained skill yet. Use the safe trainee wording and confirm every license, MVR, background, drug screen, schedule, ladder, PPE, or physical requirement before applying."
    };
  }

  if (diagnosis.category === "weak_evidence") {
    return {
      decision: "do_not_apply_yet",
      label: "Do not apply yet",
      tone: "danger",
      reason: "The resume does not show enough direct proof for this job type yet.",
      blockers: unmetHard,
      confirmations: unmetConfirm,
      nextStep: "Apply to closer jobs first or add real training, certifications, duties, tools, or projects before using a job-specific rewrite."
    };
  }

  if (unmetHard.length || unmetConfirm.length) {
    return {
      decision: "apply_if_true",
      label: "Apply only if these are true",
      tone: "warning",
      reason: "The job mentions requirements that are not clearly shown in the resume. Some may be easy to confirm, but they matter before applying.",
      blockers: unmetHard,
      confirmations: unmetConfirm,
      nextStep: "Confirm the items below. Add them to the resume only if you honestly have them."
    };
  }

  if (diagnosis.category === "medium_match" || diagnosis.category === "transferable" || keywordData.score < 65) {
    return {
      decision: "fix_wording_first",
      label: "Apply, but fix wording first",
      tone: "caution",
      reason: "The resume has some proof, but the ATS wording and proof gaps need work before applying.",
      blockers: [],
      confirmations: [],
      nextStep: "Use the safe wording and proof checklist. Add missing keywords only where your resume can prove them."
    };
  }

  return {
    decision: "apply_now",
    label: "Apply now",
    tone: "good",
    reason: "The resume shows enough direct proof and no hard blocker was detected from the job post.",
    blockers: [],
    confirmations: [],
    nextStep: "Use the resume-ready wording, then add numbers, tools, equipment, or schedule details only where they are true."
  };
}


function buildSmartFixes(resumeText, jobText, targetFamily, selected, keywordData) {
  const hardRequirements = detectHardRequirements(jobText, resumeText, selected.family || targetFamily);
  const missing = cleanList([...(keywordData.criticalMissing || []), ...(keywordData.helpfulMissing || []), ...(keywordData.softMissing || [])].map(item => item.term));
  const proofGaps = getFamilyProofGaps(targetFamily, selected.label, keywordData.missing).filter(item => !getProofTerms(resumeText, targetFamily).includes(item));
  const gigRisk = isGigOrLowQualityPost(jobText);
  return { hardRequirements, missingKeywords: missing, proofGaps, gigRisk };
}

function safeResumeTitle(resumeText, family, selectedLabel, diagnosisCategory) {
  const resume = normalize(resumeText);
  const selected = text(selectedLabel).trim();
  const helperWords = /(helper|assistant|apprentice|trainee|laborer|aide)/i.test(resumeText);
  if (helperWords && family === "diesel") return "Diesel mechanic helper";
  if (helperWords && family === "electrical") return "Electrical helper";
  if (helperWords && family === "maintenance") return "Maintenance-related helper";
  if (helperWords && family === "construction") return "Construction helper";
  if (helperWords && family === "healthcare") return "Healthcare support worker";
  if (diagnosisCategory !== "medium_match") return selected && selected !== "General / Any Job" ? selected : (FAMILY_WORDING_BLUEPRINTS[family]?.title || FAMILY_LABELS[family] || "Worker");

  if (family === "diesel") return "Mechanical worker";
  if (family === "maintenance") return "Hands-on maintenance worker";
  if (family === "electrical") return "Electrical worker";
  if (family === "customer_service") {
    if (resume.includes("retail")) return "Retail customer service associate";
    if (resume.includes("cashier")) return "Cashier and customer service worker";
    return "Customer service worker";
  }
  if (family === "office") return resume.includes("office assistant") ? "Office assistant" : "Office support worker";
  if (family === "driving") return resume.includes("cdl") ? "CDL driver" : "Delivery driver";
  if (family === "warehouse") return "Warehouse worker";
  if (family === "manufacturing") return "Manufacturing worker";
  if (family === "healthcare") return helperWords ? "Healthcare support worker" : "Patient care worker";
  if (family === "security") return "Security-related worker";
  return FAMILY_WORDING_BLUEPRINTS[family]?.title || FAMILY_LABELS[family] || "Worker";
}

function hasAnyProof(resumeText, family, proofNames) {
  return proofNames.some(name => hasResumeProof(resumeText, family, name));
}

function makeSentence(parts, fallback = "") {
  const cleaned = cleanList(parts);
  return cleaned.length ? joinEnglish(cleaned) : fallback;
}

function buildWarehouseWording(resumeText, diagnosisCategory) {
  const hasLoad = hasResumeProof(resumeText, "warehouse", "loading and unloading");
  const hasMaterial = hasResumeProof(resumeText, "warehouse", "material handling");
  const hasPalletJack = hasResumeProof(resumeText, "warehouse", "pallet jack");
  const hasWrap = hasResumeProof(resumeText, "warehouse", "pallet wrapping");
  const hasInventory = hasResumeProof(resumeText, "warehouse", "inventory organization");
  const hasShipping = hasResumeProof(resumeText, "warehouse", "shipping and receiving");
  const hasSafety = hasResumeProof(resumeText, "warehouse", "warehouse safety");
  const hasRF = hasResumeProof(resumeText, "warehouse", "RF scanner");
  const hasPicking = hasResumeProof(resumeText, "warehouse", "order picking");

  const first = [];
  if (hasLoad) first.push("loading and unloading trucks");
  if (hasMaterial) first.push("handling materials");
  if (hasWrap) first.push("wrapping pallets");
  if (hasInventory) first.push("organizing inventory");
  if (hasShipping) first.push("supporting shipping and receiving operations");
  if (hasPicking) first.push("picking or packing orders");

  const second = [];
  if (hasPalletJack) second.push("using pallet jacks");
  if (hasRF) second.push("using RF scanners");
  if (hasSafety) second.push("following warehouse safety procedures");
  second.push("keeping work areas clean and organized");

  const summary = `Warehouse associate with experience ${makeSentence(first, "handling warehouse materials and inventory")}. Skilled in ${makeSentence(second, "safe material handling and warehouse organization")}.`;

  const bullets = [];
  if (hasLoad) bullets.push("Loaded and unloaded trucks in a fast-paced warehouse environment.");
  if (hasMaterial) bullets.push("Handled materials safely while keeping warehouse areas organized and ready for daily operations.");
  if (hasPalletJack) bullets.push("Used pallet jacks to move materials safely throughout the warehouse.");
  if (hasWrap || hasInventory) bullets.push(`${makeSentence([hasWrap ? "wrapped pallets" : "", hasInventory ? "organized inventory" : ""]).replace(/^./, char => char.toUpperCase())} to support accurate warehouse flow.`);
  if (hasShipping) bullets.push("Supported shipping and receiving operations while keeping work areas clean and organized.");
  if (hasSafety) bullets.push("Followed warehouse safety procedures while completing loading, material handling, and inventory tasks.");
  if (hasRF) bullets.push("Used RF scanners to track, verify, or move warehouse materials accurately.");
  if (hasPicking) bullets.push("Picked, packed, or organized orders while maintaining accuracy and steady work flow.");

  return { summary, bullets: cleanList(bullets).slice(0, diagnosisCategory === "medium_match" ? 3 : 4) };
}

function buildCustomerServiceWording(resumeText, diagnosisCategory, selectedLabel = "Customer Service Representative") {
  const hasCustomer = hasResumeProof(resumeText, "customer_service", "customer service");
  const hasPhone = hasResumeProof(resumeText, "customer_service", "phone support");
  const hasCRM = hasResumeProof(resumeText, "customer_service", "CRM");
  const hasComplaint = hasResumeProof(resumeText, "customer_service", "de-escalation");
  const hasCash = hasResumeProof(resumeText, "customer_service", "cash handling");
  const hasSales = hasResumeProof(resumeText, "customer_service", "sales");

  const first = [];
  if (hasCustomer) first.push("assisting customers with questions, purchases, returns, or service needs");
  if (hasPhone) first.push("answering phone calls");
  if (hasComplaint) first.push("resolving complaints and escalating issues when needed");
  if (hasCash) first.push("processing POS transactions and handling cash accurately");
  if (hasSales) first.push("supporting sales goals and product questions");

  const second = [];
  if (hasCustomer) second.push("professional customer service");
  if (hasPhone) second.push("phone support");
  if (hasCRM) second.push("CRM documentation");
  if (hasComplaint) second.push("complaint resolution");
  if (hasCash) second.push("cash handling and POS systems");
  if (hasSales) second.push("sales support");

  const title = safeResumeTitle(resumeText, "customer_service", selectedLabel, diagnosisCategory);
  const summary = `${title} with experience ${makeSentence(first, "assisting customers and resolving service needs")}. Skilled in ${makeSentence(second, "professional communication and customer support")}.`;

  const bullets = [];
  if (hasCustomer) bullets.push("Assisted customers with purchases, returns, product questions, and service issues.");
  if (hasPhone) bullets.push("Answered phone calls, provided accurate information, and documented customer needs.");
  if (hasComplaint) bullets.push("Resolved customer complaints by listening, clarifying the issue, and escalating concerns when needed.");
  if (hasCash) bullets.push("Used POS systems to process transactions and handle cash accurately.");
  if (hasCRM) bullets.push("Updated CRM records or customer notes to keep service details accurate.");
  if (hasSales) bullets.push("Supported sales goals by answering product questions and helping customers choose the right options.");

  return { summary, bullets: cleanList(bullets).slice(0, diagnosisCategory === "medium_match" ? 3 : 4) };
}

function buildDrivingWording(resumeText, diagnosisCategory, selectedLabel = "Truck Driver") {
  const hasCDL = hasResumeProof(resumeText, "driving", "CDL");
  const hasDOT = hasResumeProof(resumeText, "driving", "DOT");
  const hasSafe = hasResumeProof(resumeText, "driving", "safe driving");
  const hasPre = hasResumeProof(resumeText, "driving", "pre-trip inspection");
  const hasPost = hasResumeProof(resumeText, "driving", "post-trip inspection");
  const hasRoute = hasResumeProof(resumeText, "driving", "route delivery");
  const hasTWIC = hasResumeProof(resumeText, "driving", "TWIC");
  const normalized = normalize(resumeText);
  const hasPaperwork = normalized.includes("paperwork") || normalized.includes("delivery paperwork") || normalized.includes("documents") || normalized.includes("documentation");
  const hasDispatch = normalized.includes("dispatch") || normalized.includes("communicated delays") || normalized.includes("communicate delays");
  const hasFreight = normalized.includes("freight") || normalized.includes("delivered freight") || normalized.includes("deliver freight");
  const hasSecured = normalized.includes("secured materials") || normalized.includes("secure materials") || normalized.includes("loaded and secured") || normalized.includes("secured freight");

  const first = [];
  if (hasPre) first.push("completing pre-trip inspections");
  if (hasPost) first.push("completing post-trip inspections");
  if (hasDOT) first.push("following DOT safety procedures");
  if (hasSafe || hasFreight || hasRoute) first.push(hasFreight ? "delivering freight safely" : "driving safely on assigned routes");
  if (hasRoute) first.push("planning routes");
  if (hasDispatch) first.push("communicating delays");
  if (hasPaperwork) first.push("maintaining delivery paperwork");

  const credentials = [];
  if (hasCDL) credentials.push("CDL-A or CDL credentials");
  if (hasTWIC) credentials.push("TWIC card");

  const title = safeResumeTitle(resumeText, "driving", selectedLabel, diagnosisCategory);
  const sentenceOne = `${title} with experience ${makeSentence(first, "completing safe delivery routes and inspection tasks")}.`;
  const sentenceTwo = credentials.length ? `Holds ${joinEnglish(credentials)} with experience ${makeSentence([hasSecured ? "loading and securing materials" : "", hasPaperwork ? "maintaining delivery paperwork" : "", hasDispatch ? "communicating with dispatch or customers" : ""], "supporting safe route delivery")}.` : `Skilled in ${makeSentence([hasDOT ? "DOT procedures" : "", hasPre ? "pre-trip inspections" : "", hasPost ? "post-trip inspections" : "", hasRoute ? "route planning" : ""], "safe route delivery and inspection procedures")}.`;

  const bullets = [];
  if (hasPre || hasPost) bullets.push(`Completed ${makeSentence([hasPre ? "pre-trip inspections" : "", hasPost ? "post-trip inspections" : ""])} before and after delivery routes.`);
  if (hasDOT || hasSafe || hasFreight) bullets.push(`${hasFreight ? "Delivered freight safely" : "Operated vehicles safely"} while following ${hasDOT ? "DOT procedures and company policies" : "company safety procedures"}.`);
  if (hasRoute || hasDispatch || hasPaperwork) bullets.push(`${makeSentence([hasRoute ? "planned routes" : "", hasDispatch ? "communicated delays" : "", hasPaperwork ? "maintained accurate delivery paperwork" : ""]).replace(/^./, char => char.toUpperCase())}.`);
  if (hasSecured) bullets.push("Loaded and secured materials before leaving the warehouse or delivery location.");
  if (hasTWIC) bullets.push("Maintained TWIC credentials for transportation, port, or secure-site access requirements.");
  if (hasCDL && bullets.length < 3) bullets.push("Maintained CDL credentials while completing safe driving, inspection, or delivery responsibilities.");

  return { summary: `${sentenceOne} ${sentenceTwo}`, bullets: cleanList(bullets).slice(0, diagnosisCategory === "medium_match" ? 3 : 4) };
}

function buildOfficeWording(resumeText, diagnosisCategory, selectedLabel = "Office Assistant") {
  const hasData = hasResumeProof(resumeText, "office", "data entry");
  const hasRecords = hasResumeProof(resumeText, "office", "records");
  const hasScheduling = hasResumeProof(resumeText, "office", "scheduling");
  const hasEmail = hasResumeProof(resumeText, "office", "email");
  const hasOffice = hasResumeProof(resumeText, "office", "Microsoft Office");
  const hasPhone = hasResumeProof(resumeText, "office", "phone calls");
  const title = safeResumeTitle(resumeText, "office", selectedLabel, diagnosisCategory);
  const summary = `${title} with experience ${makeSentence([hasData ? "entering data accurately" : "", hasRecords ? "maintaining records and files" : "", hasScheduling ? "scheduling appointments or calendar items" : "", hasEmail ? "handling email communication" : "", hasPhone ? "answering phone calls" : ""], "supporting office tasks and records")}. Skilled in ${makeSentence([hasOffice ? "Microsoft Office" : "", hasData ? "data entry" : "", hasRecords ? "records management" : "", hasScheduling ? "scheduling" : ""], "organization and office support")}.`;
  const bullets = [];
  if (hasData) bullets.push("Entered data accurately into records, spreadsheets, or office systems.");
  if (hasRecords) bullets.push("Maintained records, files, or documents so information stayed organized and easy to find.");
  if (hasScheduling) bullets.push("Scheduled appointments, calendar items, or office tasks while keeping details organized.");
  if (hasEmail || hasPhone) bullets.push(`${makeSentence([hasEmail ? "handled email communication" : "", hasPhone ? "answered phone calls" : ""]).replace(/^./, char => char.toUpperCase())} in a professional office setting.`);
  if (hasOffice) bullets.push("Used Microsoft Office tools such as Word, Excel, or spreadsheets to support office work.");
  return { summary, bullets: cleanList(bullets).slice(0, diagnosisCategory === "medium_match" ? 3 : 4) };
}

function buildBlueprintWording(resumeText, family, diagnosisCategory, proofTerms, selectedLabel) {
  const blueprint = FAMILY_WORDING_BLUEPRINTS[family];
  if (!blueprint) return { summary: "", bullets: [] };

  const proved = Object.entries(blueprint.items)
    .filter(([proofName]) => proofTerms.includes(proofName) || hasResumeProof(resumeText, family, proofName))
    .map(([proofName, data]) => ({ proofName, ...data }));

  if (!proved.length) return { summary: "", bullets: [] };

  const title = titleForWording(selectedLabel, family, diagnosisCategory, resumeText);
  const summaryParts = cleanList(proved.map(item => item.summary)).slice(0, 5);
  const skillParts = cleanList(proved.map(item => item.skill)).slice(0, 6);

  const summary = `${title} with experience ${joinEnglish(summaryParts)}. Skilled in ${joinEnglish(skillParts)}.`;
  const bullets = cleanList(proved.map(item => item.bullet)).slice(0, diagnosisCategory === "medium_match" ? 3 : 4);
  return { summary, bullets };
}

function buildTemplateWording(resumeText, family, diagnosisCategory, proofTerms, selectedLabel = "") {
  if (family === "manufacturing") return buildManufacturingWording(resumeText, diagnosisCategory);
  if (family === "healthcare") return buildHealthcareWording(resumeText, diagnosisCategory);
  if (family === "warehouse") return buildWarehouseWording(resumeText, diagnosisCategory);
  if (family === "customer_service") return buildCustomerServiceWording(resumeText, diagnosisCategory, selectedLabel);
  if (family === "driving") return buildDrivingWording(resumeText, diagnosisCategory, selectedLabel);
  if (family === "office") return buildOfficeWording(resumeText, diagnosisCategory, selectedLabel);
  return buildBlueprintWording(resumeText, family, diagnosisCategory, proofTerms, selectedLabel);
}

function sanitizeCopyReadyOutput(output, analysis) {
  if (!output || !["strong_match", "good_match", "medium_match"].includes(analysis.diagnosis.category)) return output;
  if (!outputHasBannedCopyLanguage(output)) return output;

  const familyForWording = analysis.selectedFamily === "general" ? analysis.jobFamily.family : analysis.selectedFamily;
  const rebuilt = buildTemplateWording(analysis.resumeText, familyForWording, analysis.diagnosis.category, analysis.evidenceTerms, analysis.selected.label);
  if (rebuilt.summary && rebuilt.bullets.length >= 2 && !outputHasBannedCopyLanguage(rebuilt)) {
    return {
      summaryHeading: analysis.diagnosis.category === "medium_match" ? "Safe resume-ready summary" : "Resume-ready summary",
      bulletHeading: analysis.diagnosis.category === "medium_match" ? "Safe resume-ready bullets" : "Resume-ready bullets",
      summary: rebuilt.summary,
      bullets: rebuilt.bullets
    };
  }

  const proofNeeded = getProofNeeded(analysis.selectedFamily === "general" ? analysis.jobFamily.family : analysis.selectedFamily, analysis.keywordData.missing);
  return {
    summaryHeading: "Right Direction",
    bulletHeading: "Proof needed before rewrite",
    summary: `The app blocked generic copy-ready wording for ${analysis.selected.label}. Add stronger direct proof before copying a resume summary.`,
    bullets: [
      analysis.evidenceTerms.length ? `Resume proof found: ${joinEnglish(analysis.evidenceTerms.slice(0, 6))}.` : "Add direct job duties before rewriting this resume.",
      proofNeeded.length ? `Add ${joinEnglish(proofNeeded.slice(0, 5))} only if those details are true.` : "Use job-post wording only where the resume supports it.",
      "Copy-ready sections must sound like resume language, not app instructions."
    ]
  };
}

function buildOutput(analysis) {
  const { diagnosis, selected, selectedFamily, jobFamily, resumeFamily, keywordData, evidenceTerms, resumeText, applyDecision } = analysis;
  const proofNeeded = getProofNeeded(selectedFamily === "general" ? jobFamily.family : selectedFamily, keywordData.missing);

  if (applyDecision?.decision === "be_careful") {
    return {
      summaryHeading: "Apply decision warning",
      bulletHeading: "Verify before using this",
      summary: "No job-specific resume rewrite generated. This post looks more like a gig, paid research task, survey, or low-quality remote opportunity than steady employment.",
      bullets: [
        applyDecision.reason,
        "Verify the company, pay, schedule, interview process, and whether the work is guaranteed before giving personal information.",
        "Never pay a fee, buy equipment through a link, accept a suspicious check, or give bank login information."
      ]
    };
  }

  if (applyDecision?.decision === "do_not_apply_yet" && applyDecision.blockers?.length) {
    return {
      summaryHeading: "Hard gate warning",
      bulletHeading: "Proof needed before applying",
      summary: `No ${selected.label}-specific rewrite generated. This job has a hard requirement the resume does not clearly prove: ${joinEnglish(applyDecision.blockers.map(item => item.label).slice(0, 5))}.`,
      bullets: [
        "Do not claim a required license, certification, clearance, endorsement, degree, or years of experience unless you truly have it.",
        applyDecision.nextStep,
        `Blocked requirement${applyDecision.blockers.length === 1 ? "" : "s"}: ${joinEnglish(applyDecision.blockers.map(item => item.label).slice(0, 6))}.`
      ]
    };
  }
  const resumeFamilyLabel = FAMILY_LABELS[resumeFamily.family] || "the resume's current field";
  const jobFamilyLabel = FAMILY_LABELS[jobFamily.family] || selected.label;

  if (diagnosis.category === "wrong_job_type") {
    return {
      summaryHeading: "Wrong job type warning",
      bulletHeading: "Switch before using wording",
      summary: `No resume rewrite generated. You selected ${selected.label}, but the job post matches ${jobFamilyLabel}. The app is stopping the rewrite because the selected job type would produce the wrong advice.`,
      bullets: [
        `Change the job type to ${jobFamilyLabel} or the closest matching option in the dropdown.`,
        "Run the scan again before copying any summary or resume bullets.",
        `Do not force this resume into ${selected.label} if the job post is actually ${jobFamilyLabel}.`
      ]
    };
  }

  if (diagnosis.category === "weak_evidence") {
    const closerRoles = RELATED_ROLES[resumeFamily.family] || RELATED_ROLES[jobFamily.family] || [];
    const targetFamily = selectedFamily === "general" ? jobFamily.family : selectedFamily;
    const specificProofNeeded = getFamilyProofGaps(targetFamily, selected.label, keywordData.missing);
    const advice = getFamilyStrengtheningAdvice(targetFamily, selected.label);
    return {
      summaryHeading: "Right Direction",
      bulletHeading: "Proof checklist before rewrite",
      summary: `No ${selected.label}-specific rewrite generated. This resume does not prove enough direct ${jobFamilyLabel} experience yet. Missing proof includes ${joinEnglish(specificProofNeeded.slice(0, 6))}. Add those only if they are real.`,
      bullets: [
        `Do not add ${joinEnglish(specificProofNeeded.slice(0, 6))} unless you have actually done those duties or completed that training.`,
        closerRoles.length ? `This resume is currently stronger for ${joinEnglish(closerRoles.slice(0, 5))}.` : `This resume is currently stronger for ${resumeFamilyLabel} roles.`,
        `To become stronger for ${selected.label}, add ${advice}.`
      ]
    };
  }

  if (diagnosis.category === "transferable") {
    const closerRoles = RELATED_ROLES[resumeFamily.family] || [];
    const targetFamily = selectedFamily === "general" ? jobFamily.family : selectedFamily;
    const specificProofNeeded = getFamilyProofGaps(targetFamily, selected.label, keywordData.missing);
    return {
      summaryHeading: "Transferable Direction",
      bulletHeading: "Safe next steps",
      summary: `No full ${selected.label} rewrite generated. The resume shows stronger proof for ${resumeFamilyLabel}, while the job post is closer to ${jobFamilyLabel}.`,
      bullets: [
        evidenceTerms.length ? `Safe proof already shown: ${joinEnglish(evidenceTerms.slice(0, 5))}.` : `Direct proof for this job type is limited.`,
        specificProofNeeded.length ? `Do not add ${joinEnglish(specificProofNeeded.slice(0, 6))} unless it is true.` : "Do not add job-specific duties unless the resume proves them.",
        closerRoles.length ? `A closer application target would be ${joinEnglish(closerRoles.slice(0, 4))}.` : "Apply to roles that match the strongest proof already in the resume."
      ]
    };
  }

  const familyForWording = selectedFamily === "general" ? jobFamily.family : selectedFamily;
  const wording = buildTemplateWording(resumeText, familyForWording, diagnosis.category, evidenceTerms, selected.label);
  if (!wording.summary || wording.bullets.length < 2) {
    return {
      summaryHeading: "Right Direction",
      bulletHeading: "Proof needed before stronger wording",
      summary: `The score is not enough by itself. The app found limited copy-ready proof for ${selected.label}, so it is not showing generic filler wording.`,
      bullets: [
        evidenceTerms.length ? `Resume proof found: ${joinEnglish(evidenceTerms.slice(0, 6))}.` : "Add more direct proof before rewriting this resume.",
        proofNeeded.length ? `Add ${joinEnglish(proofNeeded.slice(0, 5))} only if those details are true.` : "Use the employer's wording only where your resume supports it.",
        "Specific or do not show it. Proven or do not write it."
      ]
    };
  }

  return sanitizeCopyReadyOutput({
    summaryHeading: diagnosis.category === "medium_match" ? "Safe resume-ready summary" : "Resume-ready summary",
    bulletHeading: diagnosis.category === "medium_match" ? "Safe resume-ready bullets" : "Resume-ready bullets",
    summary: wording.summary,
    bullets: wording.bullets
  }, analysis);
}



// V6: Job Targeting Engine. Separates ATS keyword fit from recruiter proof and ranks whether this job is worth the next application.
const V6_STRICT_BLOCKER_GATES = new Set([
  "cdl_a", "tanker", "hazmat", "license_restrictions", "manual_transmission", "rn_license", "lpn_license", "cna",
  "teaching_certification", "bachelors", "epa_universal", "food_equipment_certificate", "ts_sci_poly", "senior_sql",
  "senior_cyber", "dotnet_dev", "wonderware", "citizenship", "it_certification"
]);

const V6_ADVANCED_SUBTYPES = new Set([
  "sql_server_dba", "cleared_python_software_engineer", "dotnet_web_developer", "qa_automation_developer",
  "cybersecurity_grc_analyst", "industrial_automation_scada", "commercial_kitchen_equipment_tech",
  "cdl_tanker_hazmat_driver", "certified_classroom_teacher"
]);

const V6_LICENSE_OR_GATE_WORDS = /(license|certification|certified|clearance|polygraph|endorsement|cdl|degree|citizen|mvr|driver|rn|lpn|cna|epa|hazmat|tanker|bachelor)/i;

const V6_FAMILY_TARGETS = {
  manufacturing: {
    strong: ["Machine Operator", "Production Worker", "Assembly Worker", "Packaging Associate", "Industrial Utility Worker"],
    possible: ["Quality Inspector", "Industrial Shipping Loader", "Material Handler", "Forklift Operator", "Maintenance Helper"],
    highRisk: ["CNC Machinist", "Industrial Maintenance Technician", "Manufacturing Supervisor", "Controls Technician"]
  },
  warehouse: {
    strong: ["Warehouse Associate", "Material Handler", "Package Handler", "Order Picker", "Receiving Associate"],
    possible: ["Forklift Operator", "Shipping Loader", "Inventory Control Clerk", "Yard Worker", "Fleet Parts Helper"],
    highRisk: ["Logistics Coordinator", "Warehouse Supervisor", "CDL Driver", "SAP Supply Chain Specialist"]
  },
  healthcare: {
    strong: ["Caregiver", "Home Health Aide", "Patient Transporter", "Unit Support Aide", "Healthcare Support Trainee"],
    possible: ["CNA", "Patient Care Technician", "Medical Assistant", "Mental Health Technician", "Phlebotomy Trainee"],
    highRisk: ["RN", "LPN", "Phlebotomist without certification", "Medication Tech", "Clinical Supervisor"]
  },
  healthcare_admin: {
    strong: ["Medical Front Desk", "Patient Registration", "Medical Records Clerk", "Unit Secretary", "Insurance Verification Clerk"],
    possible: ["Medical Billing Assistant", "Medical Coding Trainee", "Referral Coordinator", "Dental Front Desk"],
    highRisk: ["Certified Medical Coder", "Revenue Cycle Analyst", "Billing Manager", "Clinical Medical Assistant"]
  },
  maintenance: {
    strong: ["Maintenance Helper", "Apartment Maintenance Helper", "Facilities Assistant", "Hotel Maintenance", "Porter/Grounds Maintenance"],
    possible: ["Apartment Maintenance Technician", "Preventive Maintenance Tech", "Appliance Repair Helper", "Commercial Equipment Helper"],
    highRisk: ["Industrial Maintenance Technician", "Maintenance Supervisor", "Commercial HVAC Technician", "EPA-required HVAC role"]
  },
  electrical: {
    strong: ["Electrical Helper", "Low-Voltage Helper", "Residential Electrical Helper", "Installer Helper"],
    possible: ["Apprentice Electrician", "Security Alarm Installer", "Cable Installation Technician", "Maintenance Helper"],
    highRisk: ["Licensed Electrician", "Industrial Electrician", "Journeyman Electrician", "Controls Electrician"]
  },
  welding: {
    strong: ["Welder Helper", "Fabrication Helper", "Shop Laborer", "Grinder", "Production Helper"],
    possible: ["Production MIG Welder", "Structural Welder Helper", "Pipefitter Helper", "Metal Fabrication Worker"],
    highRisk: ["Certified Pipe Welder", "ASME Welder", "TIG Pipe Welder", "Combo Welder-Fitter"]
  },
  diesel: {
    strong: ["Diesel Mechanic Helper", "Lube Technician", "Fleet Maintenance Helper", "Tire/Service Technician"],
    possible: ["Entry-Level Diesel Technician", "Trailer Mechanic Helper", "Heavy Equipment PM Technician", "Shop Assistant"],
    highRisk: ["Experienced Diesel Mechanic", "Heavy Equipment Field Tech", "Hydraulics Technician", "ASE Master Diesel Tech"]
  },
  construction: {
    strong: ["Construction Laborer", "Carpenter Helper", "Installer Helper", "Demolition Laborer", "Fence Installer Helper"],
    possible: ["Concrete Laborer", "Roofing Helper", "Drywall Helper", "Scaffold Builder Helper", "Painter Helper"],
    highRisk: ["Journeyman Carpenter", "Concrete Finisher", "Commercial Roofer", "Certified Scaffold Builder", "Heavy Equipment Operator"]
  },
  customer_service: {
    strong: ["Retail Customer Service", "Front Desk Associate", "Call Center Representative", "Cashier", "Customer Support Representative"],
    possible: ["Appointment Setter", "Insurance CSR", "Utility Customer Service", "Bank Teller", "Inside Sales Assistant"],
    highRisk: ["Licensed Insurance Agent", "Collections Specialist", "Account Manager", "Outside Sales Representative"]
  },
  office: {
    strong: ["Office Assistant", "Receptionist", "Data Entry Clerk", "Records Clerk", "Scheduling Assistant"],
    possible: ["Administrative Assistant", "HR Assistant", "Project Admin", "School Attendance Clerk", "Government Clerk"],
    highRisk: ["Bookkeeper", "Executive Assistant", "Payroll Specialist", "Legal Assistant", "Compliance Coordinator"]
  },
  driving: {
    strong: ["Non-CDL Delivery Driver", "Driver Helper", "Route Assistant", "Warehouse-to-Driver Trainee", "Yard Worker"],
    possible: ["CDL-A Recent Graduate", "CDL-A Dry Van Entry-Level", "Box Truck Driver", "Yard Spotter", "Local Route Driver"],
    highRisk: ["CDL-A Tanker/Hazmat", "Manual 10-Speed CDL", "Ready Mix Driver", "Dump Truck Driver", "Experienced OTR Driver"]
  },
  security: {
    strong: ["Unarmed Security Officer", "Gatehouse Access Control", "Front Desk Security", "Warehouse Security", "Event Security"],
    possible: ["Hospital Security", "Loss Prevention Associate", "Security Patrol Officer", "Security Installation Helper"],
    highRisk: ["Armed Security", "Security Supervisor", "Law Enforcement Officer", "Alarm Installer with permit required"]
  },
  cleaning: {
    strong: ["Janitor", "Custodian", "Housekeeper", "Porter", "Laundry Attendant"],
    possible: ["Hospital EVS", "Floor Technician Helper", "Industrial Cleaner", "Hotel Room Attendant"],
    highRisk: ["Hazardous Waste Cleaner", "Floor Care Lead", "Biohazard Cleaner", "EVS Supervisor"]
  },
  food_service: {
    strong: ["Dishwasher", "Prep Cook", "Fast Food Crew", "Server", "Host"],
    possible: ["Line Cook", "Hospital Food Service", "Grocery Deli Associate", "Catering Attendant", "Banquet Server"],
    highRisk: ["Kitchen Manager", "Sous Chef", "HACCP Quality Tech", "Certified Dietary Manager"]
  },
  education: {
    strong: ["Teacher Assistant", "Substitute Teacher", "Daycare Assistant", "Tutor", "Youth Program Worker"],
    possible: ["Daycare Teacher", "Preschool Teacher", "Early Childhood Assistant", "Special Needs Aide", "Alternative Certification Teacher"],
    highRisk: ["Certified K-12 Teacher", "Special Education Teacher", "School Counselor", "Educational Leadership"]
  },
  it: {
    strong: ["Help Desk Technician", "Desktop Support Trainee", "Computer Support Assistant", "IT Support Intern", "Technical Support Representative"],
    possible: ["Desktop Support Technician", "Application Support", "Junior Data Analyst", "SOC Trainee", "QA Tester Trainee"],
    highRisk: ["SQL Server DBA", "Cybersecurity GRC Analyst", "Software Developer", "Cloud/DevOps Engineer", "Cleared Software Engineer"]
  },
  general: {
    strong: ["Jobs that match your exact recent work history", "Trainee roles with training provided", "Helper roles tied to your real tools or worksites"],
    possible: ["Adjacent roles with similar duties", "Entry-level roles with clear requirements", "Roles where the posting says no experience required"],
    highRisk: ["Licensed roles", "Clearance roles", "Advanced tech roles", "Jobs with vague pay or paid survey language"]
  }
};

const V6_SUBTYPE_TARGETS = {
  pest_control_technician: {
    strong: ["Pest Control Technician Trainee", "Route Service Technician", "Field Service Trainee", "Utility Meter Reader", "Delivery Route Driver"],
    possible: ["Cable Installer Trainee", "Security Installation Helper", "Apartment Maintenance Helper", "Lawn Care Route Technician"],
    highRisk: ["Licensed Pesticide Applicator", "Termite Specialist", "Pest Control Supervisor"]
  },
  cable_installation_technician: {
    strong: ["Cable Installation Trainee", "Telecom Field Technician Trainee", "Low-Voltage Helper", "Security Alarm Installer Helper", "Field Service Installer"],
    possible: ["Electrical Helper", "Smart Home Installer", "Utility Field Technician", "Maintenance Helper"],
    highRisk: ["Fiber Splicer", "Network Technician", "Licensed Low-Voltage Lead", "Telecom Supervisor"]
  },
  security_installation_technician: {
    strong: ["Security Alarm Installer Helper", "Low-Voltage Helper", "Camera Installation Helper", "Cable Installer Trainee"],
    possible: ["Access Control Helper", "Field Service Installer", "Electrical Helper", "Smart Home Technician"],
    highRisk: ["Licensed Alarm Technician", "Fire Alarm Technician", "Security Systems Lead", "Networked Access Control Specialist"]
  },
  paid_survey_focus_group: {
    strong: ["Real Data Entry Clerk", "Customer Service Representative", "Office Assistant", "Call Center Representative"],
    possible: ["Product Tester only as side income", "Market Research Participant only as gig work"],
    highRisk: ["Any posting asking for money", "Fake check equipment jobs", "Crypto or gift card payment jobs"]
  },
  certified_classroom_teacher: V6_FAMILY_TARGETS.education,
  early_childhood_teacher: V6_FAMILY_TARGETS.education,
  sql_server_dba: V6_FAMILY_TARGETS.it,
  cleared_python_software_engineer: V6_FAMILY_TARGETS.it,
  dotnet_web_developer: V6_FAMILY_TARGETS.it,
  qa_automation_developer: V6_FAMILY_TARGETS.it,
  cybersecurity_grc_analyst: V6_FAMILY_TARGETS.it,
  industrial_automation_scada: V6_FAMILY_TARGETS.it,
  commercial_kitchen_equipment_tech: V6_FAMILY_TARGETS.maintenance,
  auto_body_collision_tech: {
    strong: ["Auto Body Helper", "Collision Repair Helper", "Paint Prep Assistant", "Detail/Body Shop Assistant"],
    possible: ["Tire/Lube Technician", "Automotive Apprentice", "Parts Associate", "Shop Helper"],
    highRisk: ["Experienced Collision Technician", "I-CAR Technician", "Frame Technician", "Painter"]
  },
  cdl_tanker_hazmat_driver: V6_FAMILY_TARGETS.driving,
  cdl_local_dedicated_driver: V6_FAMILY_TARGETS.driving,
  railcar_switchman: {
    strong: ["Rail Yard Laborer", "Industrial Yard Worker", "Plant Utility Worker", "Material Handler", "Forklift Operator"],
    possible: ["Railcar Switchman Trainee", "Trackmobile Helper", "Industrial Shipping Loader", "Warehouse Yard Spotter"],
    highRisk: ["Experienced Switchman", "Locomotive Operator", "Rail Conductor", "Hazmat Rail Loading"]
  },
  industrial_shipping_loader: V6_FAMILY_TARGETS.warehouse
};

function clampV6Score(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function v6TrainingAllowed(jobText) {
  const job = normalize(jobText || "");
  return hasJobPhrase(job, ["no experience required", "we'll train", "we will train", "we teach", "training provided", "paid training", "company paid", "within 90 days", "trainee", "apprentice"]);
}

function v6GetReqBuckets(smartFixes) {
  const reqs = smartFixes?.hardRequirements || [];
  const unmetHard = reqs.filter(item => item.level === "hard" && !item.met);
  const unmetConfirm = reqs.filter(item => item.level !== "hard" && !item.met);
  const strictBlockers = unmetHard.filter(item => V6_STRICT_BLOCKER_GATES.has(item.gate));
  const licenseGates = reqs.filter(item => V6_LICENSE_OR_GATE_WORDS.test(item.label));
  return { reqs, unmetHard, unmetConfirm, strictBlockers, licenseGates };
}

function v6CapAtsScore(baseScore, smartFixes, realJobType, diagnosis, jobText) {
  const buckets = v6GetReqBuckets(smartFixes);
  let score = Number(baseScore) || 0;
  if (smartFixes?.gigRisk?.hit) score = Math.min(score, 20);
  if (buckets.strictBlockers.some(item => item.gate === "ts_sci_poly")) score = Math.min(score, 25);
  if (buckets.strictBlockers.some(item => ["rn_license", "lpn_license", "cna", "teaching_certification", "bachelors"].includes(item.gate))) score = Math.min(score, 35);
  if (buckets.strictBlockers.some(item => ["cdl_a", "tanker", "hazmat", "manual_transmission", "license_restrictions"].includes(item.gate))) score = Math.min(score, 45);
  if (buckets.strictBlockers.length) score = Math.min(score, 50);
  if (V6_ADVANCED_SUBTYPES.has(realJobType?.id) && diagnosis.category === "weak_evidence") score = Math.min(score, 40);
  if (diagnosis.category === "wrong_job_type") score = Math.min(score, 55);
  if (diagnosis.category === "weak_evidence" && !v6TrainingAllowed(jobText)) score = Math.min(score, 48);
  if (v6TrainingAllowed(jobText) && !buckets.strictBlockers.length) score = Math.max(score, Math.min(72, score + 6));
  return clampV6Score(score);
}

function v6RecruiterFitScore({ atsFit, diagnosis, smartFixes, keywordData, evidenceTerms, realJobType, jobText }) {
  const buckets = v6GetReqBuckets(smartFixes);
  let score = Number(atsFit) || Number(keywordData?.score) || 0;
  score -= buckets.strictBlockers.length * 22;
  score -= Math.max(0, buckets.unmetHard.length - buckets.strictBlockers.length) * 10;
  score -= buckets.unmetConfirm.length * 3;
  score -= (keywordData?.criticalMissing || []).length * 5;
  score -= (keywordData?.helpfulMissing || []).length * 2;
  if ((evidenceTerms || []).length < 2) score -= 12;
  if ((evidenceTerms || []).length >= 5) score += 8;
  if (diagnosis.category === "strong_match") score += 8;
  if (diagnosis.category === "good_match") score += 4;
  if (diagnosis.category === "medium_match") score -= 5;
  if (diagnosis.category === "transferable") score -= 12;
  if (diagnosis.category === "weak_evidence") score -= v6TrainingAllowed(jobText) ? 8 : 22;
  if (diagnosis.category === "wrong_job_type") score -= 30;
  if (V6_ADVANCED_SUBTYPES.has(realJobType?.id) && diagnosis.category !== "strong_match" && diagnosis.category !== "good_match") score -= 12;
  if (smartFixes?.gigRisk?.hit) score = Math.min(score, 15);
  return clampV6Score(score);
}

function buildProofImpact(analysisLike) {
  const buckets = v6GetReqBuckets(analysisLike.smartFixes);
  const hardLabels = buckets.unmetHard.map(item => item.label);
  const strictLabels = buckets.strictBlockers.map(item => item.label);
  const proofGaps = analysisLike.smartFixes?.proofGaps || [];
  const critical = (analysisLike.keywordData?.criticalMissing || []).map(item => item.term);
  const helpful = (analysisLike.keywordData?.helpfulMissing || []).map(item => item.term);
  const soft = (analysisLike.keywordData?.softMissing || []).map(item => item.term);
  const blocksApplication = cleanList([...strictLabels, ...hardLabels]).slice(0, 7);
  const hurtsInterviewChance = cleanList([...proofGaps, ...critical]).filter(item => !blocksApplication.includes(item)).slice(0, 8);
  const easyWordingFix = cleanList([...helpful, ...soft]).filter(item => !blocksApplication.includes(item) && !hurtsInterviewChance.includes(item)).slice(0, 8);
  return { blocksApplication, hurtsInterviewChance, easyWordingFix };
}

function buildApplicationPriority({ applyDecision, atsFit, recruiterFit, proofImpact, smartFixes, diagnosis }) {
  const buckets = v6GetReqBuckets(smartFixes);
  if (smartFixes?.gigRisk?.hit || applyDecision?.decision === "be_careful") {
    return { grade: "F", label: "Priority F — Skip or verify first", tone: "danger", reason: "This looks like gig work, low-quality work, or a posting that needs verification before you spend application time.", nextMove: "Do not upload personal financial information. Verify the company, pay, schedule, and hiring process first." };
  }
  if (buckets.strictBlockers.length || applyDecision?.decision === "do_not_apply_yet") {
    return { grade: "F", label: "Priority F — Skip for now", tone: "danger", reason: "A hard credential, license, clearance, endorsement, degree, or advanced-skill gate may block the application before ATS wording matters.", nextMove: "Apply to closer roles first or get the missing license, endorsement, clearance, degree, certification, or exact experience." };
  }
  if (applyDecision?.decision === "apply_if_true" || buckets.unmetHard.length || buckets.unmetConfirm.length) {
    return { grade: "C", label: "Priority C — Apply only if gate is true", tone: "warning", reason: "The job has requirements that are not clearly shown in the resume yet.", nextMove: "Confirm the requirement, then add it only where your real proof supports it." };
  }
  if (atsFit >= 75 && recruiterFit >= 70 && (diagnosis?.category === "strong_match" || diagnosis?.category === "good_match" || applyDecision?.decision === "apply_now")) {
    return { grade: "A", label: "Priority A — Apply today", tone: "good", reason: "The resume has both ATS keyword fit and enough recruiter proof to be worth a fast application.", nextMove: "Apply today after adding truthful numbers, tools, equipment, shifts, route details, or worksite details." };
  }
  if (atsFit >= 55 && recruiterFit >= 50) {
    return { grade: "B", label: "Priority B — Apply after fixing wording", tone: "caution", reason: "This job is reachable, but the resume needs stronger proof wording before applying.", nextMove: "Use the proof coach and resume-ready wording, then apply." };
  }
  return { grade: "D", label: "Priority D — Save for later", tone: "warning", reason: "This is a possible direction, but it is probably not the fastest path to interviews yet.", nextMove: "Apply to safer nearby roles first while building the missing proof." };
}

function getV6TargetBank(analysisLike) {
  const subtypeBank = V6_SUBTYPE_TARGETS[analysisLike.realJobType?.id];
  if (subtypeBank) return subtypeBank;
  const family = analysisLike.selectedFamily === "general" ? analysisLike.jobFamily?.family : analysisLike.selectedFamily;
  return V6_FAMILY_TARGETS[family] || V6_FAMILY_TARGETS.general;
}

function buildFastestPathToInterviews(analysisLike, priority) {
  const bank = getV6TargetBank(analysisLike);
  const currentLabel = analysisLike.realJobType?.label || analysisLike.selected?.label || "this job";
  let applyFirst = bank.strong || [];
  let applyAfterProof = bank.possible || [];
  let avoidForNow = bank.highRisk || [];
  let coachNote = "Put the most applications into roles where your resume already proves the daily tasks, tools, worksite, license, or training level.";

  if (priority?.grade === "A") {
    applyFirst = cleanList([currentLabel, ...applyFirst]).slice(0, 7);
    coachNote = "This job belongs near the top of the list. Apply today, then keep applying to similar roles with the same proof pattern.";
  } else if (priority?.grade === "B") {
    applyFirst = cleanList([currentLabel, ...applyFirst]).slice(0, 7);
    coachNote = "This job can be worth applying to after wording is fixed. Similar roles should be part of the weekly target list.";
  } else if (priority?.grade === "C") {
    applyAfterProof = cleanList([currentLabel, ...applyAfterProof]).slice(0, 7);
    coachNote = "This job may be possible only after confirming a gate. Do not spend all your applications here until the gate is clear.";
  } else {
    avoidForNow = cleanList([currentLabel, ...avoidForNow]).slice(0, 7);
    coachNote = "This job is not the fastest path right now. Use the apply-first list to get interviews while building the missing proof.";
  }

  return {
    applyFirst: cleanList(applyFirst).slice(0, 7),
    applyAfterProof: cleanList(applyAfterProof).slice(0, 7),
    avoidForNow: cleanList(avoidForNow).slice(0, 7),
    coachNote
  };
}

function buildV6Strategy({ diagnosis, keywordData, smartFixes, resumeFamily, jobFamily, jobText, realJobType, selected, selectedFamily, evidenceTerms }) {
  const atsFit = v6CapAtsScore(keywordData.score, smartFixes, realJobType, diagnosis, jobText);
  const recruiterFit = v6RecruiterFitScore({ atsFit, diagnosis, smartFixes, keywordData, evidenceTerms, realJobType, jobText });
  const proofImpact = buildProofImpact({ smartFixes, keywordData });
  return { atsFit, recruiterFit, proofImpact };
}

function analyzeResume(resumeText, jobText, jobType) {
  const selected = getSelectedJobType(jobType);
  const selectedFamily = selected.family;
  const jobFamily = detectFamily(jobText);
  const resumeFamily = detectFamily(resumeText);
  const targetFamily = jobFamily.family !== "general" ? jobFamily.family : selectedFamily;
  const keywordData = analyzeKeywords(resumeText, jobText, targetFamily === "general" ? selectedFamily : targetFamily);
  const evidenceFamily = selectedFamily === "general" ? targetFamily : selectedFamily;
  const evidenceTerms = getProofTerms(resumeText, evidenceFamily).filter(termName => {
    const activeNames = keywordData.activeTerms.map(item => item.term);
    return activeNames.includes(termName) || keywordData.score >= 60;
  });
  const diagnosis = buildDiagnosis({ selected, selectedFamily, jobFamily, resumeFamily, keywordData, evidenceTerms });
  const targetForFixes = targetFamily === "general" ? selectedFamily : targetFamily;
  const smartFixes = buildSmartFixes(resumeText, jobText, targetForFixes, selected, keywordData);
  const realJobType = detectRealJobType(jobText, selected, jobFamily);
  const applyDecision = buildApplyDecision({ diagnosis, keywordData, smartFixes, resumeFamily, jobFamily, jobText, realJobType });
  const v6Base = buildV6Strategy({ diagnosis, keywordData, smartFixes, resumeFamily, jobFamily, jobText, realJobType, selected, selectedFamily, evidenceTerms });
  const applicationPriority = buildApplicationPriority({ applyDecision, atsFit: v6Base.atsFit, recruiterFit: v6Base.recruiterFit, proofImpact: v6Base.proofImpact, smartFixes, diagnosis });
  const fastestPath = buildFastestPathToInterviews({ selected, selectedFamily, jobFamily, resumeFamily, realJobType }, applicationPriority);
  const output = buildOutput({ diagnosis, selected, selectedFamily, jobFamily, resumeFamily, keywordData, evidenceTerms, resumeText, smartFixes, applyDecision, realJobType });
  let displayScore = v6Base.atsFit;
  const missingConfirmations = smartFixes.hardRequirements.filter(item => !item.met).length + keywordData.helpfulMissing.length + keywordData.softMissing.length;
  if (displayScore >= 97 && missingConfirmations > 0) displayScore = 96;

  return {
    selected,
    selectedFamily,
    jobFamily,
    resumeFamily,
    keywordData,
    evidenceTerms,
    smartFixes,
    applyDecision,
    realJobType,
    diagnosis,
    output,
    atsFit: displayScore,
    recruiterFit: v6Base.recruiterFit,
    proofImpact: v6Base.proofImpact,
    applicationPriority,
    fastestPath,
    score: displayScore
  };
}

function chipLabel(item) {
  return typeof item === "string" ? item : item.term;
}

function chipTitle(item) {
  if (typeof item === "string") return "";
  const priority = item.priority === "high" ? "High priority" : item.priority === "medium" ? "Helpful" : "Soft/supporting";
  return `${priority} • ${item.status === "missing" ? "Missing" : "Found in resume"}`;
}

function renderKeywordGroup(container, title, items, note) {
  const group = document.createElement("div");
  group.style.width = "100%";
  group.style.marginBottom = "16px";

  const heading = document.createElement("h4");
  heading.textContent = title;
  heading.style.margin = "0 0 6px";
  heading.style.fontSize = "0.98rem";
  heading.style.color = "#f4f7fb";
  group.appendChild(heading);

  if (note) {
    const noteEl = document.createElement("p");
    noteEl.textContent = note;
    noteEl.style.margin = "0 0 10px";
    noteEl.style.color = "#a7b0bf";
    noteEl.style.fontSize = "0.92rem";
    noteEl.style.lineHeight = "1.45";
    group.appendChild(noteEl);
  }

  const chips = document.createElement("div");
  chips.style.display = "flex";
  chips.style.flexWrap = "wrap";
  chips.style.gap = "10px";

  const list = items && items.length ? items : ["Nothing found here"];
  list.slice(0, 18).forEach(item => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = chipLabel(item);
    chip.title = chipTitle(item);
    if (item && item.priority === "high" && item.status === "missing") {
      chip.style.borderColor = "rgba(255, 92, 122, 0.45)";
      chip.style.color = "#ffc2cc";
      chip.style.background = "rgba(255, 92, 122, 0.12)";
    }
    chips.appendChild(chip);
  });

  group.appendChild(chips);
  container.appendChild(group);
}


function renderRealJobType(container, analysis) {
  if (!container) return;
  const info = analysis.realJobType || fallbackRealJobType(analysis.jobFamily, analysis.selected);
  const selectedWarning = buildSelectedTypeWarning(info, analysis.selected);
  const confidenceColors = {
    High: { border: "rgba(167,255,206,0.45)", bg: "rgba(167,255,206,0.10)", title: "#a7ffce" },
    Medium: { border: "rgba(255,211,105,0.45)", bg: "rgba(255,211,105,0.10)", title: "#ffd369" },
    Low: { border: "rgba(255,181,90,0.45)", bg: "rgba(255,181,90,0.10)", title: "#ffcf9a" }
  };
  const colors = confidenceColors[info.confidence] || confidenceColors.Low;
  const clues = info.clues && info.clues.length ? info.clues : ["not enough clear subtype clues"];
  const clueList = clues.slice(0, 9).map(item => `<li>${escapeHTML(item)}</li>`).join("");
  const alternatives = info.alternatives && info.alternatives.length
    ? `<p style="margin:10px 0 0;color:#a7b0bf;line-height:1.45"><strong>Other possible type:</strong> ${escapeHTML(joinEnglish(info.alternatives))}</p>`
    : "";
  const warningText = selectedWarning || info.watchOut || "Use the detected job type, hard requirements, and proof gaps before copying any wording.";
  container.innerHTML = `
    <div style="border:1px solid ${colors.border};background:${colors.bg};border-radius:16px;padding:14px">
      <p style="margin:0 0 6px;color:#a7b0bf;line-height:1.45"><strong>This job looks like:</strong></p>
      <h4 style="margin:0 0 10px;color:${colors.title};font-size:1.08rem">${escapeHTML(info.label)}</h4>
      <p style="margin:0 0 8px;color:#d6dbe6;line-height:1.45"><strong>Job family:</strong> ${escapeHTML(info.family)}</p>
      <p style="margin:0 0 8px;color:#d6dbe6;line-height:1.45"><strong>Confidence:</strong> ${escapeHTML(info.confidence)}</p>
      <p style="margin:0 0 6px;color:#f4f7fb;font-weight:700">Why the app picked this:</p>
      <ul style="margin:0 0 10px 18px;color:#d6dbe6;line-height:1.5">${clueList}</ul>
      <p style="margin:0 0 8px;color:#ffc2cc;line-height:1.45"><strong>Watch out:</strong> ${escapeHTML(warningText)}</p>
      <p style="margin:0;color:#a7ffce;line-height:1.45"><strong>Best resume mode:</strong> ${escapeHTML(info.resumeMode)}</p>
      ${alternatives}
    </div>
  `;
}

function renderDiagnosis(container, analysis) {
  if (!container) return;
  const proof = analysis.evidenceTerms.length
    ? `Resume proof found: ${joinEnglish(analysis.evidenceTerms.slice(0, 7))}.`
    : "Resume proof found: limited direct proof for the selected job type.";
  const jobRead = analysis.jobFamily.family !== "general"
    ? `Job post reads closest to: ${FAMILY_LABELS[analysis.jobFamily.family]}.`
    : "Job post category: not clear enough to lock onto one field.";
  container.innerHTML = `
    <h4 style="margin:0 0 8px;color:#f4f7fb">${escapeHTML(analysis.diagnosis.title)}</h4>
    <p style="margin:0 0 10px;color:#d6dbe6;line-height:1.55">${escapeHTML(analysis.diagnosis.message)}</p>
    <p style="margin:0 0 10px;color:#a7b0bf;line-height:1.45">${escapeHTML(jobRead)}</p>
    <p style="margin:0 0 10px;color:#a7b0bf;line-height:1.45">${escapeHTML(proof)}</p>
    <p style="margin:0;color:#a7ffce;line-height:1.45">${escapeHTML(analysis.diagnosis.direction)}</p>
  `;
}

function renderApplyDecision(container, analysis) {
  if (!container) return;
  const decision = analysis.applyDecision || { label: "Apply decision unavailable", tone: "caution", reason: "Run the scan again.", blockers: [], confirmations: [], nextStep: "" };
  const toneColors = {
    good: { border: "rgba(167,255,206,0.45)", bg: "rgba(167,255,206,0.10)", title: "#a7ffce" },
    caution: { border: "rgba(255,211,105,0.45)", bg: "rgba(255,211,105,0.10)", title: "#ffd369" },
    warning: { border: "rgba(255,181,90,0.5)", bg: "rgba(255,181,90,0.12)", title: "#ffcf9a" },
    danger: { border: "rgba(255,92,122,0.55)", bg: "rgba(255,92,122,0.12)", title: "#ffc2cc" }
  };
  const colors = toneColors[decision.tone] || toneColors.caution;
  const blockerList = (decision.blockers || []).map(item => `<li>${escapeHTML(formatRequirementShort(item))}</li>`).join("");
  const confirmList = (decision.confirmations || []).slice(0, 5).map(item => `<li>${escapeHTML(formatRequirementShort(item))}</li>`).join("");
  container.innerHTML = `
    <div style="border:1px solid ${colors.border};background:${colors.bg};border-radius:16px;padding:14px">
      <h4 style="margin:0 0 8px;color:${colors.title};font-size:1.05rem">${escapeHTML(decision.label)}</h4>
      <p style="margin:0 0 10px;color:#d6dbe6;line-height:1.55">${escapeHTML(decision.reason)}</p>
      ${blockerList ? `<p style="margin:0 0 6px;color:#ffc2cc;font-weight:700">Hard blockers not clearly proven:</p><ul style="margin:0 0 10px 18px;color:#ffc2cc;line-height:1.5">${blockerList}</ul>` : ""}
      ${confirmList ? `<p style="margin:0 0 6px;color:#ffd369;font-weight:700">Confirm before applying:</p><ul style="margin:0 0 10px 18px;color:#f4dfaa;line-height:1.5">${confirmList}</ul>` : ""}
      <p style="margin:0;color:#a7b0bf;line-height:1.45"><strong>Next step:</strong> ${escapeHTML(decision.nextStep)}</p>
    </div>
  `;
}



function renderApplicationPriority(container, analysis) {
  if (!container) return;
  const priority = analysis.applicationPriority || { label: "Priority unavailable", tone: "caution", reason: "Run the scan again.", nextMove: "" };
  const toneColors = {
    good: { border: "rgba(167,255,206,0.45)", bg: "rgba(167,255,206,0.10)", title: "#a7ffce" },
    caution: { border: "rgba(255,211,105,0.45)", bg: "rgba(255,211,105,0.10)", title: "#ffd369" },
    warning: { border: "rgba(255,181,90,0.5)", bg: "rgba(255,181,90,0.12)", title: "#ffcf9a" },
    danger: { border: "rgba(255,92,122,0.55)", bg: "rgba(255,92,122,0.12)", title: "#ffc2cc" }
  };
  const colors = toneColors[priority.tone] || toneColors.caution;
  container.innerHTML = `
    <div style="border:1px solid ${colors.border};background:${colors.bg};border-radius:16px;padding:14px">
      <h4 style="margin:0 0 8px;color:${colors.title};font-size:1.08rem">${escapeHTML(priority.label)}</h4>
      <p style="margin:0 0 10px;color:#d6dbe6;line-height:1.55">${escapeHTML(priority.reason)}</p>
      <p style="margin:0;color:#a7b0bf;line-height:1.45"><strong>Best next move:</strong> ${escapeHTML(priority.nextMove)}</p>
    </div>
  `;
}

function renderFitBar(label, value, color) {
  const safeValue = clampV6Score(value);
  return `
    <div style="margin:10px 0 0">
      <div style="display:flex;justify-content:space-between;gap:12px;color:#d6dbe6;font-weight:800"><span>${escapeHTML(label)}</span><span>${safeValue}%</span></div>
      <div style="height:9px;border-radius:999px;background:rgba(255,255,255,0.10);overflow:hidden;margin-top:6px">
        <span style="display:block;width:${Math.max(4, safeValue)}%;height:100%;background:${color};border-radius:999px"></span>
      </div>
    </div>
  `;
}

function renderImpactList(title, items, color, emptyText) {
  const list = cleanList(items).slice(0, 6);
  const body = list.length ? `<ul style="margin:6px 0 0 18px;color:#d6dbe6;line-height:1.5">${list.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : `<p style="margin:6px 0 0;color:#a7b0bf;line-height:1.45">${escapeHTML(emptyText)}</p>`;
  return `<div style="margin-top:12px"><p style="margin:0;color:${color};font-weight:800">${escapeHTML(title)}</p>${body}</div>`;
}

function renderFitScores(container, analysis) {
  if (!container) return;
  const impact = analysis.proofImpact || { blocksApplication: [], hurtsInterviewChance: [], easyWordingFix: [] };
  container.innerHTML = `
    <div style="border:1px solid rgba(125,211,252,0.35);background:rgba(125,211,252,0.08);border-radius:16px;padding:14px">
      <p style="margin:0;color:#d6dbe6;line-height:1.55">ATS fit shows keyword coverage. Recruiter fit shows whether the resume proves the job well enough for a human to believe it.</p>
      ${renderFitBar("ATS fit", analysis.atsFit ?? analysis.score ?? 0, "rgba(125,211,252,0.95)")}
      ${renderFitBar("Recruiter fit", analysis.recruiterFit ?? 0, "rgba(167,255,206,0.95)")}
      ${renderImpactList("Blocks application", impact.blocksApplication, "#ffc2cc", "No hard blocker was detected from this job post.")}
      ${renderImpactList("Hurts interview chance", impact.hurtsInterviewChance, "#ffd369", "No major recruiter proof gap was detected beyond normal wording fixes.")}
      ${renderImpactList("Easy wording fix", impact.easyWordingFix, "#a7ffce", "No easy keyword-only fix detected. Focus on the proof coach.")}
    </div>
  `;
}

function renderFastestPath(container, analysis) {
  if (!container) return;
  const path = analysis.fastestPath || { applyFirst: [], applyAfterProof: [], avoidForNow: [], coachNote: "Run the scan again." };
  container.innerHTML = `
    <div style="border:1px solid rgba(167,255,206,0.35);background:rgba(167,255,206,0.08);border-radius:16px;padding:14px">
      ${renderImpactList("Apply first", path.applyFirst, "#a7ffce", "No apply-first targets available from this scan.")}
      ${renderImpactList("Apply after building proof", path.applyAfterProof, "#ffd369", "No build-toward targets available from this scan.")}
      ${renderImpactList("Avoid for now", path.avoidForNow, "#ffc2cc", "No avoid-for-now roles were identified.")}
      <p style="margin:14px 0 0;color:#d6dbe6;line-height:1.55"><strong>Coach note:</strong> ${escapeHTML(path.coachNote)}</p>
    </div>
  `;
}

function renderMissingKeywords(container, analysis) {
  if (!container) return;
  container.innerHTML = "";
  const summary = document.createElement("p");
  summary.textContent = `Smart match: ${analysis.score}% weighted job-skill coverage. This section lists exact proof gaps; the coach card above explains how to use them safely.`;
  summary.style.margin = "0 0 14px";
  summary.style.color = "#a7b0bf";
  summary.style.lineHeight = "1.45";
  container.appendChild(summary);

  const hardReqs = analysis.smartFixes?.hardRequirements || [];
  if (hardReqs.length) {
    renderKeywordGroup(container, "Job-post requirements to confirm", hardReqs.map(formatHardRequirement), "Confirm these before applying. Put licenses, certifications, clearances, degrees, endorsements, and MVR details on the resume only when accurate.");
  }

  renderKeywordGroup(container, "Main proof gaps", analysis.smartFixes?.proofGaps || analysis.keywordData.criticalMissing, "These are the work tasks, tools, credentials, or conditions the resume does not clearly prove yet.");
  renderKeywordGroup(container, "Specific task words missing", analysis.keywordData.helpfulMissing, "Use the Keyword Proof Coach before adding any of these to the resume.");
  renderKeywordGroup(container, "Worksite or schedule details missing", analysis.keywordData.softMissing, "Add these only when the resume can show the exact shift, worksite, route, lift amount, tool, or condition.");
}


// V6: Keyword Proof Coach. This avoids generic keyword dumps and tells users what real proof is needed.
function proofCoachItem(label, proofCounts, safeWording, doNotWrite, place, danger = "Medium", patterns = []) {
  return { label, proofCounts, safeWording, doNotWrite, place, danger, patterns };
}

const PROOF_COACH_BY_SUBTYPE = {
  pest_control_technician: {
    note: "This job may train new pest-control workers. Do not claim pesticide application, pest identification, or treatment planning unless you have done that work. Build the resume around route stops, customer homes, inspection notes, ladders, crawl spaces, PPE, and license completion after hire when the post allows it.",
    items: [
      proofCoachItem("obtained or can obtain pesticide license within the required deadline", "current pesticide license, prior pest-control license, official license training, or a posting that says company-paid licensing after hire", "Willing and able to complete company-paid pesticide licensing within the required 90-day period.", "Licensed pesticide applicator, unless that license is active.", "Certifications or summary, depending on whether it is active or future training", "High", ["pesticide", "pest control license", "applicator"]),
      proofCoachItem("inspected customer property and recorded findings", "interior/exterior walkthroughs, property checks, equipment checks, home/building inspections, customer-site checklists, or written findings", "Inspected assigned customer areas and recorded findings before completing service steps.", "Pest treatment planning, unless you have pest-control experience.", "Work experience bullet", "Medium", ["inspect", "inspection", "property", "customer site", "walkthrough"]),
      proofCoachItem("drove assigned routes to customer homes or businesses", "route stops, delivery routes, field-service calls, customer-site jobs, assigned territory work, or dispatch-driven travel", "Completed assigned route stops at customer locations while keeping timing and service notes accurate.", "Managed a pest-control route, unless that was your actual job.", "Work experience bullet", "Medium", ["route", "delivery", "dispatch", "customer homes", "customer site", "assigned territory"]),
      proofCoachItem("entered service notes on a handheld device or work system", "handheld device, scanner, tablet, work-order app, delivery app, service report, job notes, photos, signatures, or completion times", "Entered service notes, completion details, and customer updates into assigned work systems.", "Pest service documentation, unless the notes were for pest-control jobs.", "Work experience bullet", "Low", ["scanner", "handheld", "tablet", "work order", "service report", "documentation", "notes"]),
      proofCoachItem("worked in crawl spaces, attics, rooftops, or confined areas", "actual work in crawl spaces, attics, rooftops, tight spaces, under homes, ladders, or elevated areas", "Worked safely in tight or elevated areas while following assigned safety procedures.", "Crawl-space pest inspection, unless that was the actual task.", "Work experience bullet", "Medium", ["crawl", "attic", "rooftop", "confined", "ladder", "heights"])
    ]
  },
  cable_installation_technician: {
    note: "Do not claim HSI, CDV, XHS, fiber, or cable installation unless you have installed that service. Use proof from tools, ladders, customer homes, dispatch updates, service reports, low-voltage work, alarm cameras, or electrical helper work when true.",
    items: [
      proofCoachItem("installed internet, cable, phone, alarm, camera, or low-voltage systems", "hands-on installs involving coax, fiber, Ethernet, phone, cameras, alarm panels, sensors, outlets, wiring, routers, or low-voltage devices", "Installed and tested customer-site wiring, devices, or service equipment during assigned jobs.", "HSI, CDV, XHS, or fiber installation, unless you actually installed those services.", "Work experience bullet", "High", ["install", "installed", "cable", "internet", "fiber", "ethernet", "camera", "alarm", "low voltage", "wiring"]),
      proofCoachItem("updated dispatch with arrival, delay, departure, or completion details", "calls/texts/apps to dispatch, supervisor route updates, delivery app updates, arrival times, delay notes, or completion times", "Updated dispatch or supervisors with arrival, delay, departure, and completion information during assigned route work.", "Cable dispatch coordination, unless the dispatch updates were for cable/telecom jobs.", "Work experience bullet", "Medium", ["dispatch", "arrival", "delay", "departure", "completion", "route"]),
      proofCoachItem("used ladders at customer homes or businesses", "ladder work, roofline work, ceiling access, attics, utility areas, or elevated installation/repair tasks", "Used ladders safely during customer-site installation, repair, or service tasks.", "28-foot ladder experience, unless you used ladders around that height.", "Work experience bullet", "Medium", ["ladder", "ladders", "heights", "attic", "ceiling"]),
      proofCoachItem("tested equipment after installation or repair", "checked connections, devices, sensors, routers, operating systems, signal, power, customer equipment, or system settings after work", "Tested installed or serviced equipment to confirm it worked before leaving the job site.", "Telecom signal testing, unless you actually tested cable/telecom signal or equipment.", "Work experience bullet", "Medium", ["tested", "testing", "troubleshoot", "connections", "settings", "equipment"]),
      proofCoachItem("operated a company-owned service van or truck on assigned routes", "work vehicle, service van, company truck, fuel card, route vehicle, vehicle inspections, stocking parts, or reporting vehicle maintenance", "Operated assigned work vehicle safely and reported vehicle or equipment concerns to supervisors.", "Company vehicle experience, unless you actually drove or maintained a work vehicle.", "Work experience bullet", "Medium", ["company vehicle", "work vehicle", "service van", "company truck", "fuel card", "fleet"])
    ]
  },
  security_installation_technician: {
    note: "This is installation work. Do not use guard, patrol, or officer wording unless the job asks for security-officer duties. Focus on panels, sensors, cameras, wiring, hand tools, customer walkthroughs, and testing devices.",
    items: [
      proofCoachItem("installed alarm panels, cameras, sensors, or access-control devices", "hands-on install of cameras, alarms, sensors, control panels, badge readers, door hardware, wiring, or low-voltage equipment", "Installed and tested low-voltage devices such as cameras, sensors, panels, or access-control equipment.", "Security Officer, patrol, or surveillance monitoring, unless those were separate duties.", "Work experience bullet", "High", ["alarm", "camera", "sensor", "control panel", "access control", "low voltage", "install"]),
      proofCoachItem("walked customers through installed systems", "explained system operation, trained users, reviewed completed work, answered setup questions, or confirmed the customer could use the device", "Explained completed installation steps and basic system use to customers before leaving the job site.", "Security consulting, unless you actually advised on security design or risk.", "Work experience bullet", "Medium", ["customer education", "walkthrough", "explained", "trained", "customer"]),
      proofCoachItem("used hand tools for mounting, wiring, or device setup", "drills, screwdrivers, cutters, wire strippers, testers, ladders, fasteners, mounting brackets, or basic electrical tools", "Used hand tools to mount, wire, secure, or test installed devices.", "Licensed electrical work, unless you performed it under the proper license/supervision.", "Skills or work experience bullet", "Medium", ["hand tools", "drill", "wire", "wiring", "mount", "tester"])
    ]
  },
  paid_survey_focus_group: {
    note: "This looks like a paid research task, not a stable job. Do not build a resume around it. Verify the company, pay method, time commitment, and whether it asks for money or banking details before you continue.",
    items: [
      proofCoachItem("confirmed this is paid research, not data entry employment", "posting clearly says focus group, product testing, survey panel, research participation, feedback session, or one-time study", "Paid research participant for survey, focus group, or product-testing opportunities.", "Data Entry Clerk, unless the role has actual data-entry duties, schedule, supervisor, and payroll.", "Do not place on resume unless it is real paid work worth listing", "High", ["focus group", "survey", "product testing", "research", "feedback"]),
      proofCoachItem("verified payment terms before sharing personal information", "clear payment amount, payment method, no upfront fee, no fake check, no gift-card request, and no bank login request", "Verified pay structure and participation requirements before accepting research tasks.", "Guaranteed income or full-time remote job, unless the post states real employment terms.", "Personal checklist, not resume", "High", ["gift card", "payment", "earn", "bank", "fee"])
    ]
  },
  certified_classroom_teacher: {
    note: "Do not call yourself a certified teacher unless the certificate is active or you are officially in the certification path. Training, tutoring, coaching, and childcare can help, but they are not the same as state certification.",
    items: [
      proofCoachItem("held state teaching certification or official alternative-certification eligibility", "active teaching certificate, educator license, district-approved alternative certification pathway, or official program acceptance", "Bachelor's degree holder pursuing the approved alternative teaching certification pathway.", "Certified teacher, unless the certification is active or officially in progress.", "Education / Certifications section", "High", ["teaching certification", "teacher license", "educator certificate", "alternative certification"]),
      proofCoachItem("planned lessons or instructional activities for students", "lesson plans, tutoring plans, classroom activities, training sessions, youth coaching plans, or curriculum support", "Planned and led instructional activities that helped students understand assigned material.", "Developed curriculum, unless you actually built curriculum plans.", "Work experience bullet", "Medium", ["lesson", "instruction", "tutoring", "training", "curriculum"]),
      proofCoachItem("managed student behavior in a classroom or youth setting", "classroom rules, redirection, supervision, youth program groups, camp groups, coaching groups, or student behavior notes", "Supported behavior expectations by redirecting students and maintaining a focused learning setting.", "Classroom management expert, unless you had direct responsibility for a class/group.", "Work experience bullet", "Medium", ["behavior", "classroom", "students", "supervised", "youth"])
    ]
  },
  early_childhood_teacher: {
    note: "Do not turn babysitting or youth work into preschool-teacher claims unless the duties match. Use real proof: age group, parent updates, activities, classroom routines, behavior redirection, meals, nap time, diapering/toileting, or milestone notes.",
    items: [
      proofCoachItem("planned age-appropriate activities for young children", "daycare activities, preschool lessons, crafts, story time, play-based learning, tutoring young children, or child development activities", "Planned age-appropriate activities that supported early learning, play, and classroom routines.", "Montessori curriculum, unless you used that framework.", "Work experience bullet", "Medium", ["daycare", "preschool", "children", "arts and crafts", "storytelling", "play"]),
      proofCoachItem("communicated child progress or concerns to parents/guardians", "parent updates, pickup/dropoff notes, daily sheets, milestone notes, behavior updates, or family communication", "Shared child updates, daily progress, and concerns with parents or guardians according to classroom expectations.", "Early-intervention reporting, unless you worked in that program.", "Work experience bullet", "Medium", ["parent", "guardian", "milestone", "daily sheet", "progress"]),
      proofCoachItem("managed classroom routines, transitions, or behavior redirection", "arrival, meals, nap time, restroom routines, line-up transitions, centers, behavior redirection, or group supervision", "Managed classroom routines and transitions while supporting positive behavior.", "Lead teacher, unless you were responsible for the classroom.", "Work experience bullet", "Medium", ["routine", "transition", "behavior", "supervise", "classroom"])
    ]
  },
  sql_server_dba: {
    note: "A basic IT or school SQL resume is not enough for SQL DBA claims. Do not write backup/recovery, performance tuning, production database administration, or SQL Server DBA unless you can explain the database environment you supported.",
    items: [
      proofCoachItem("administered SQL Server databases in a production or business environment", "SQL Server instances, user permissions, jobs, maintenance plans, database monitoring, schema changes, or admin duties on live systems", "Administered SQL Server databases by supporting access, maintenance, monitoring, and operational reliability.", "SQL Server DBA, unless you actually administered databases.", "Work experience bullet", "High", ["sql server", "dba", "database administrator", "maintenance plan"]),
      proofCoachItem("performed backup, recovery, disaster recovery, or restore testing", "backup jobs, restore tests, recovery plans, DR documentation, RPO/RTO work, or incident recovery steps", "Supported SQL Server backup, restore, and recovery procedures to protect production data.", "Disaster recovery expert, unless you owned or tested DR plans.", "Work experience bullet", "High", ["backup", "restore", "recovery", "disaster recovery", "dr"]),
      proofCoachItem("tuned queries, indexes, stored procedures, or database performance", "execution plans, index maintenance, slow-query fixes, stored procedure tuning, T-SQL optimization, or production performance monitoring", "Improved database performance by reviewing queries, indexes, or stored procedures and documenting changes.", "Performance tuning, unless you actually tuned database performance.", "Work experience bullet", "High", ["performance", "tuning", "index", "stored procedure", "t-sql"])
    ]
  },
  cleared_python_software_engineer: {
    note: "This is not a regular Python job. Active TS/SCI with Polygraph is a hard gate. Do not claim cleared mission software, backend services, ActiveMQ, NoSQL, elastic databases, or Tier 3 support unless real.",
    items: [
      proofCoachItem("held active TS/SCI with Polygraph", "current active clearance and polygraph status that the employer can verify", "Active TS/SCI with Polygraph.", "Clearance, TS/SCI, or Polygraph, unless active and real.", "Clearance section", "High", ["ts/sci", "ts sci", "polygraph", "clearance"]),
      proofCoachItem("developed backend services in Python", "Python services, APIs, data-processing jobs, backend modules, Linux services, deployment work, or production code repositories", "Developed Python backend services that processed data and integrated with operational systems.", "Python software engineer, unless you wrote software beyond scripts/coursework.", "Work experience or projects", "High", ["python", "backend", "api", "service", "linux"]),
      proofCoachItem("supported CI/CD, Linux, testing, and Tier 3 operational issues", "CI/CD pipelines, Linux development, test cases, validation results, JIRA/Confluence, deployment notes, or production support tickets", "Validated software changes through test cases, Linux troubleshooting, deployment support, and Tier 3 issue resolution.", "Tier 3 support, unless you handled escalated production issues.", "Work experience bullet", "High", ["ci/cd", "linux", "test case", "jira", "confluence", "tier 3"])
    ]
  },
  dotnet_web_developer: {
    note: "This is software development, not IT support. Do not turn computer troubleshooting into C#, ASP.NET, MVC, Entity Framework, or API development unless you have code/projects/work to prove it.",
    items: [
      proofCoachItem("built applications with C#, ASP.NET, MVC, Razor, or .NET Core", "work projects, GitHub repos, shipped features, internal apps, class projects with code samples, or maintained .NET applications", "Built and maintained C#/.NET web application features using ASP.NET, MVC, Razor, or related frameworks.", "C#/.NET developer, unless you wrote and maintained code.", "Work experience or projects", "High", ["c#", "asp.net", "mvc", "razor", ".net"]),
      proofCoachItem("used Entity Framework, LINQ, SQL, or Web APIs", "database-backed features, API endpoints, LINQ queries, controllers, models, migrations, or SQL integration", "Developed database-backed web features using Entity Framework, LINQ, SQL, or Web APIs.", "Full-stack developer, unless you handled both application and data/API work.", "Work experience or projects", "High", ["entity framework", "linq", "web api", "sql", "controller"]),
      proofCoachItem("used source control, unit testing, bug fixes, or SDLC workflows", "Git commits, pull requests, bug tickets, unit tests, QA handoffs, code reviews, or backlog items", "Resolved bugs and delivered application changes through source control, testing, and SDLC workflows.", "Production software experience, unless the code was used beyond practice.", "Work experience or projects", "Medium", ["git", "source control", "unit test", "bug", "sdlc"])
    ]
  },
  qa_automation_developer: {
    note: "This is QA/testing plus sometimes coding. Do not claim QA automation, test plans, defect tracking, or requirements validation unless you wrote or ran tests and tracked results.",
    items: [
      proofCoachItem("wrote or executed test plans, test cases, or test scripts", "test plans, test cases, acceptance criteria, regression tests, QA checklists, manual test scripts, or automated test scripts", "Created and executed test cases to validate software requirements and document results.", "QA automation engineer, unless automation tools or scripts were used.", "Work experience or projects", "High", ["test plan", "test case", "test script", "qa", "regression"]),
      proofCoachItem("tracked defects and verified fixes", "bug tickets, defect reports, screenshots, reproduction steps, retesting notes, acceptance signoff, or QA status updates", "Tracked defects with reproduction steps and verified fixes before release.", "Defect manager, unless you owned defect workflow.", "Work experience bullet", "Medium", ["defect", "bug", "jira", "retest", "verify"]),
      proofCoachItem("built or maintained automated tests", "Selenium, Cypress, Playwright, unit tests, integration tests, test frameworks, CI test jobs, or automation scripts", "Maintained automated tests that checked application behavior and reduced manual retesting.", "Automation developer, unless you built or maintained test automation.", "Work experience or projects", "High", ["automated testing", "selenium", "cypress", "playwright", "automation"])
    ]
  },
  cybersecurity_grc_analyst: {
    note: "This is governance, risk, compliance, and control documentation. Do not turn basic cybersecurity interest into NIST, SSP, ATO, FIPS, CISSP, or control-assessment claims.",
    items: [
      proofCoachItem("mapped systems or controls to NIST, FIPS, SSP, ATO, or security requirements", "control matrices, SSP sections, NIST 800-53 controls, FIPS 199 categorization, ATO packages, audit evidence, or compliance documents", "Mapped system controls and compliance evidence to NIST, FIPS, SSP, or authorization requirements.", "NIST 800-53 or ATO experience, unless you used those frameworks at work.", "Work experience bullet", "High", ["nist", "800-53", "fips", "ssp", "ato"]),
      proofCoachItem("supported risk assessment, control testing, or compliance documentation", "risk register, control test results, deviation forms, POA&M notes, audit responses, DR/COOP documents, or regulated environment reports", "Supported risk assessments and control documentation by collecting evidence, tracking findings, and updating compliance records.", "Cybersecurity GRC analyst, unless you performed governance/risk/compliance work.", "Work experience bullet", "High", ["risk assessment", "control", "compliance", "poa&m", "audit"]),
      proofCoachItem("held CISSP or worked in regulated/federal environments", "active CISSP, federal contractor work, DOE/DOD site work, facility access, clearance process, or regulated compliance environment", "Supported cybersecurity compliance activities in regulated or federal environments.", "CISSP, clearance, or federal compliance unless real and verifiable.", "Certifications or work experience", "High", ["cissp", "clearance", "doe", "dod", "regulated"])
    ]
  },
  industrial_automation_scada: {
    note: "This is industrial automation software. Do not claim Wonderware, SCADA, HMI, advanced T-SQL, VB.NET, or plant-system support unless you worked with those systems.",
    items: [
      proofCoachItem("developed or supported Wonderware, SCADA, HMI, or industrial automation systems", "Wonderware/InTouch, AVEVA, SCADA screens, HMI tags, PLC/plant data integration, historian data, alarms, or production dashboards", "Developed and supported SCADA/HMI applications used in industrial automation environments.", "SCADA developer, unless you worked with industrial control software.", "Work experience or projects", "High", ["wonderware", "scada", "hmi", "aveva", "industrial automation"]),
      proofCoachItem("used advanced T-SQL, VB.NET, ADO.NET, ASP.NET, or plant-data integrations", "stored procedures, industrial database queries, VB.NET apps, ADO.NET connections, ASP.NET tools, or data links between plant systems", "Built software and data integrations using T-SQL, .NET, and industrial system data.", "Advanced T-SQL, unless you wrote complex production queries.", "Work experience or projects", "High", ["t-sql", "vb.net", "ado.net", "asp.net", "database"]),
      proofCoachItem("owned work from concept through post-implementation support", "requirements, design notes, testing, commissioning, go-live support, training, issue fixes, or post-implementation tickets", "Supported automation software from requirements through testing, implementation, and post-release support.", "Project ownership, unless you owned that lifecycle.", "Work experience bullet", "Medium", ["implementation", "requirements", "testing", "support", "project"])
    ]
  },
  commercial_kitchen_equipment_tech: {
    note: "This is specialized food-service equipment repair. Do not claim commercial cooking equipment, warranty repair, EPA Universal, manufacturer support, or on-call repair unless true.",
    items: [
      proofCoachItem("diagnosed or repaired commercial kitchen or food-service equipment", "ovens, fryers, grills, warmers, refrigeration, dish machines, electrical/mechanical faults, restaurant equipment, or food-service equipment repair", "Diagnosed and repaired commercial food-service equipment while documenting parts and service steps.", "Commercial cooking equipment technician, unless you worked on that equipment.", "Work experience bullet", "High", ["commercial kitchen", "food service equipment", "fryer", "oven", "refrigeration"]),
      proofCoachItem("communicated with manufacturers, parts suppliers, or warranty teams", "warranty claims, manufacturer tech support, parts ordering, service authorizations, return parts, or repair documentation", "Coordinated parts, warranty, and manufacturer communication to complete equipment repairs.", "Warranty repair specialist, unless you handled warranty workflow.", "Work experience bullet", "Medium", ["warranty", "manufacturer", "parts", "service authorization"]),
      proofCoachItem("held EPA Universal or handled refrigerant-related work", "active EPA Universal certification, refrigerant recovery, refrigeration service, HVAC/R training, or certification card", "EPA Universal Certified for refrigerant-related service work.", "EPA Universal, unless certified.", "Certifications section", "High", ["epa universal", "refrigerant", "hvac", "refrigeration"])
    ]
  },
  auto_body_collision_tech: {
    note: "This is collision/body repair, not regular mechanic work. Do not claim dent repair, panel replacement, paint prep, body filler, I-CAR, or ASE unless real.",
    items: [
      proofCoachItem("disassembled vehicles, repaired panels, dents, or body damage", "vehicle teardown, panel removal, dent repair, body filler, bumper/fender/door repair, structural checks, or collision repair tasks", "Disassembled vehicle components and supported panel, dent, or body-damage repairs.", "Auto body technician, unless collision/body repair was part of your work.", "Work experience bullet", "High", ["collision", "auto body", "panel", "dent", "body filler", "disassembly"]),
      proofCoachItem("sanded, ground, prepped, or transferred work to paint department", "sanding, grinding, masking, priming, surface prep, paint handoff, refinish prep, or booth prep", "Prepared repaired surfaces through sanding, grinding, masking, or paint-department handoff steps.", "Painter, unless you performed paint/refinish work.", "Work experience bullet", "Medium", ["sanding", "grinding", "paint", "prep", "masking"]),
      proofCoachItem("held I-CAR, ASE, or collision-repair training", "I-CAR classes, ASE certifications, vocational collision training, shop training, or manufacturer repair procedures", "Completed collision-repair training and followed repair procedures during assigned shop work.", "I-CAR or ASE certified, unless current and accurate.", "Certifications section", "High", ["i-car", "ase", "certification", "collision training"])
    ]
  },
  cdl_tanker_hazmat_driver: {
    note: "This is not entry-level CDL. Do not claim tanker, Hazmat, manual transmission, no restrictions, or continuous commercial driving unless those are on the license and work history.",
    items: [
      proofCoachItem("held Class-A CDL with Tanker and Hazmat endorsements", "active Class-A CDL plus Tanker and Hazmat endorsements on the license", "Class-A CDL holder with active Tanker and Hazmat endorsements.", "Tanker/Hazmat driver, unless both endorsements are active.", "Certifications section", "High", ["cdl-a", "class a", "tanker", "hazmat"]),
      proofCoachItem("drove manual or 10-speed commercial equipment", "manual tractor, 10-speed training, road test, unrestricted CDL, or verifiable manual transmission driving", "Operated manual/10-speed commercial equipment where required.", "No automatic restriction or 10-speed ability, unless true.", "Certifications or work experience", "High", ["10-speed", "manual", "no restrictions", "unrestricted"]),
      proofCoachItem("completed tanker/Hazmat loads, pre-trip checks, and DOT paperwork", "tanker loading/unloading, placards, bills of lading, hazmat paperwork, pre-trip inspections, trip logs, or DOT compliance records", "Completed required inspections and paperwork for specialized CDL loads while following DOT procedures.", "Tanker or Hazmat load experience, unless you hauled those loads.", "Work experience bullet", "High", ["load", "pre-trip", "dot", "placard", "bill of lading"])
    ]
  },
  cdl_local_dedicated_driver: {
    note: "This is CDL tractor-trailer work. Do not use delivery-driver proof as tractor-trailer experience unless you drove CDL equipment. Separate license, school, endorsements, ELD, drop-and-hook, and verifiable months.",
    items: [
      proofCoachItem("held Class-A CDL and completed tractor-trailer training or driving", "active CDL-A, CDL school, tractor-trailer road training, backing practice, range work, or verifiable CDL driving", "Class-A CDL holder trained in tractor-trailer inspections, backing, and safe vehicle operation.", "6 months tractor-trailer experience, unless verifiable.", "Certifications and work experience", "High", ["cdl-a", "class a", "tractor-trailer", "backing"]),
      proofCoachItem("used ELD, Qualcomm, route paperwork, or dispatch communication", "ELD logs, Qualcomm messages, trip sheets, dispatch calls, BOLs, delivery paperwork, or check-in/out notes", "Updated ELD, dispatch, or trip paperwork during assigned driving work.", "ELD/Qualcomm experience, unless you used those systems.", "Work experience bullet", "Medium", ["eld", "qualcomm", "dispatch", "bol", "trip"]),
      proofCoachItem("handled dry van, drop-and-hook, or local dedicated routes", "dry van trailers, drop-and-hook moves, local routes, dedicated customer lanes, trailer numbers, dock check-ins, or yard moves", "Completed local or dedicated driving tasks involving trailer checks, route timing, and customer requirements.", "Dry van/drop-and-hook experience, unless real.", "Work experience bullet", "Medium", ["dry van", "drop and hook", "local", "dedicated", "trailer"])
    ]
  },
  railcar_switchman: {
    note: "Rail switching has its own language. Do not claim coupling, air hoses, hand brakes, Trackmobile, or radio/hand signals unless you performed rail-yard work.",
    items: [
      proofCoachItem("coupled/uncoupled railcars or connected air hoses", "railcar coupling, uncoupling, knuckles, air hoses, brake lines, blue flag rules, or railcar securement tasks", "Coupled and uncoupled railcars and connected air hoses according to yard procedures.", "Railcar switchman, unless you performed rail switching duties.", "Work experience bullet", "High", ["coupling", "uncoupling", "air hoses", "railcar"]),
      proofCoachItem("set hand brakes, threw switches, or used rail signals", "hand brakes, switches, derails, hand signals, radio signals, spotter duties, or track movement instructions", "Set hand brakes, handled switches, or used radio/hand signals during rail-yard operations.", "Trackmobile operator, unless you operated one.", "Work experience bullet", "High", ["hand brakes", "throw switches", "radio signals", "hand signals", "trackmobile"]),
      proofCoachItem("worked safely around rail equipment, PPE, and outdoor yard conditions", "rail yard, PPE, walking ballast, outdoor shifts, blue flag/lockout, radio communication, or equipment spacing rules", "Worked around rail equipment outdoors while following PPE, communication, and yard-safety procedures.", "Rail safety experience, unless you worked around rail equipment.", "Work experience bullet", "Medium", ["rail yard", "ppe", "outdoor", "yard", "safety"])
    ]
  },
  industrial_shipping_loader: {
    note: "This is physical shipping/loading operations. Do not claim railcar loading, flatbed loading, fork truck, BOL, or nonconforming-goods processing unless those duties are real.",
    items: [
      proofCoachItem("loaded flatbeds, vans, trailers, railcars, or industrial shipments", "flatbed loading, van loading, trailer loading, railcar loading, dunnage, straps, staged loads, or load securement", "Loaded industrial shipments onto trailers, vans, flatbeds, or railcars while checking counts and labels.", "Railcar or flatbed loading, unless you actually loaded that equipment.", "Work experience bullet", "High", ["flatbed", "van loading", "railcar loading", "trailer", "load"]),
      proofCoachItem("used fork truck, forklift, or material-moving equipment", "fork truck, forklift, pallet jack, tugger, clamp truck, load cart, or powered industrial truck", "Operated material-moving equipment to stage, move, or load shipments.", "Forklift operator, unless you were trained/authorized to operate it.", "Skills or work experience", "High", ["fork truck", "forklift", "pallet jack", "material"]),
      proofCoachItem("completed BOLs, inbound sheets, counts, labels, or shipping issue records", "bill of lading, inbound sheet, count sheet, label verification, nonconforming-goods record, rework tag, or shipment discrepancy note", "Verified counts, labels, and shipping documents before releasing or staging shipments.", "Shipping clerk, unless you handled shipping paperwork as a duty.", "Work experience bullet", "Medium", ["bill of lading", "bol", "inbound sheet", "count", "label", "nonconforming"])
    ]
  }
};

const PROOF_COACH_BY_FAMILY = {
  manufacturing: {
    note: "Use exact machine, line, material, shift, inspection, or production duty. Do not write broad manufacturing claims without the actual equipment or task.",
    items: [
      proofCoachItem("operated assigned production machines or monitored production equipment", "specific machine names, production line, press, twister, CNC, conveyor, scanner station, control panel, or equipment-monitoring duty", "Operated and monitored assigned production equipment while following quality and safety steps.", "Machine operator, unless you actually operated or monitored production equipment.", "Work experience bullet", "Medium", ["machine", "equipment", "operator", "production", "press", "twister"]),
      proofCoachItem("completed quality checks on parts, product, labels, or defects", "inspections, defect checks, measurements, visual checks, label checks, counts, reject handling, or quality forms", "Checked product for defects, counts, labels, or quality concerns before moving work forward.", "Quality inspector, unless inspection was a main duty.", "Work experience bullet", "Medium", ["quality", "inspection", "defect", "checked", "measure"]),
      proofCoachItem("handled materials, pallets, bearings, parts, boxes, or production supplies", "actual materials moved, loaded, scanned, staged, wrapped, counted, or supplied to a line", "Moved and staged production materials so assigned equipment or lines stayed supplied.", "Forklift operator, unless forklift use is real and allowed by your training.", "Work experience bullet", "Low", ["material", "pallet", "parts", "bearing", "loaded", "wrapped"])
    ]
  },
  warehouse: {
    note: "Use actual warehouse actions: loaded, unloaded, picked, packed, scanned, staged, wrapped, counted, shipped, received, or inventoried.",
    items: [
      proofCoachItem("loaded or unloaded trucks, pallets, trailers, cartons, or containers", "loading docks, trailers, pallet loads, hand loading, pallet jack, forklift, or staged outbound/inbound freight", "Loaded and unloaded freight while keeping counts, staging, and assigned areas organized.", "Forklift operator, unless you actually operated a forklift.", "Work experience bullet", "Medium", ["loaded", "unloaded", "truck", "trailer", "pallet", "dock"]),
      proofCoachItem("picked, packed, staged, wrapped, or verified orders", "pick list, pack station, staging lane, pallet wrap, order labels, shipment verification, or outbound order checks", "Picked, packed, staged, wrapped, or verified orders before shipment or stocking.", "Inventory control, unless you owned inventory accuracy duties.", "Work experience bullet", "Medium", ["picked", "packed", "staged", "wrapped", "order"]),
      proofCoachItem("used RF scanner, scan gun, inventory system, or pick list", "scanner, barcode gun, WMS, pick ticket, inventory count, stock locations, or order selection", "Used scanning or inventory tools to pick, verify, stage, or update product movement.", "WMS experience, unless you used that system.", "Skills or work experience bullet", "Medium", ["scanner", "rf", "inventory", "pick", "wms", "barcode"])
    ]
  },
  healthcare: {
    note: "Healthcare support claims need exact patient/resident tasks, certification, charting system, care setting, and privacy/safety procedures. Do not write CNA, phlebotomy, vitals, ADLs, or HIPAA unless real.",
    items: [
      proofCoachItem("provided ADL, mobility, transfer, feeding, bathing, or toileting assistance", "resident/patient care tasks such as bathing, dressing, feeding, toileting, transfers, ambulation, wheelchair help, or bed-to-chair support", "Assisted patients or residents with ADLs, mobility, and daily care tasks according to care instructions.", "CNA or caregiver, unless those duties were real and within your role.", "Work experience bullet", "High", ["adl", "bathing", "feeding", "transfer", "mobility", "resident"]),
      proofCoachItem("checked vital signs, drew blood, collected specimens, or supported clinical tasks", "blood pressure, pulse, temperature, oxygen, venipuncture, specimen collection, EKG, lab labels, or clinical checklists", "Collected clinical information such as vital signs or specimens according to assigned procedures.", "Phlebotomist, EKG tech, or MA, unless certified/trained and performed those tasks.", "Work experience or certifications", "High", ["vital", "blood pressure", "specimen", "phlebotomy", "ekg"]),
      proofCoachItem("documented care while following HIPAA, infection control, and PPE rules", "charting, care notes, EHR entries, shift reports, HIPAA training, gloves, masks, isolation rooms, hand hygiene, or infection-control steps", "Documented care details while following HIPAA, PPE, and infection-control procedures.", "HIPAA or charting experience, unless you used patient information systems or received training.", "Work experience or certifications", "Medium", ["hipaa", "charting", "documentation", "infection", "ppe"])
    ]
  },
  healthcare_admin: {
    note: "Medical office claims need exact front-desk, billing, coding, insurance, EHR/EMR, records, claims, or HIPAA proof. Do not turn regular office work into medical billing or coding.",
    items: [
      proofCoachItem("registered patients, scheduled appointments, or verified insurance", "patient check-in, demographics, insurance cards, eligibility checks, referrals, authorizations, appointment scheduling, or front-desk medical workflow", "Registered patients, scheduled appointments, and verified insurance or demographic information accurately.", "Medical front desk, unless the work was in a healthcare office or patient system.", "Work experience bullet", "Medium", ["patient", "insurance", "appointment", "registration", "referral"]),
      proofCoachItem("entered or maintained EHR/EMR records, medical documents, or patient files", "EHR/EMR systems, scanned documents, medical records, chart updates, lab paperwork, provider notes, or patient-file maintenance", "Updated EHR/EMR records and medical documents while protecting patient privacy.", "EHR/EMR experience, unless you used those systems.", "Skills or work experience bullet", "High", ["ehr", "emr", "medical records", "chart", "patient files"]),
      proofCoachItem("worked with claims, billing, coding, CPT, ICD, or payment posting", "claim forms, denials, billing queues, insurance follow-up, CPT/ICD codes, payment posting, or coding review", "Supported medical billing or claims tasks by reviewing codes, insurance details, or payment information.", "Medical coder/biller, unless you actually handled codes, claims, or billing.", "Work experience or certifications", "High", ["billing", "claims", "coding", "cpt", "icd"])
    ]
  },
  maintenance: {
    note: "Use exact repair areas: work orders, plumbing leaks, outlets, switches, HVAC checks, appliance repairs, turns, tools, or preventive maintenance.",
    items: [
      proofCoachItem("completed work orders, service requests, turns, or repair tickets", "maintenance tickets, apartment turns, repair requests, service calls, tenant requests, job notes, or completed-task logs", "Completed assigned work orders and documented repairs, materials, or follow-up needs.", "Maintenance technician, unless repair duties were a real part of your job.", "Work experience bullet", "Medium", ["work order", "service request", "repair", "maintenance", "ticket"]),
      proofCoachItem("handled plumbing, electrical, HVAC, appliance, carpentry, or fixture repairs", "leaks, toilets, sinks, outlets, switches, fixtures, ceiling fans, HVAC filters, appliances, doors, trim, locks, or drywall patches", "Completed basic repairs involving plumbing, electrical, HVAC, appliances, carpentry, or fixtures within assigned duties.", "Licensed plumber/electrician/HVAC tech, unless licensed or supervised for that work.", "Work experience bullet", "High", ["plumbing", "electrical", "hvac", "appliance", "fixture", "door"]),
      proofCoachItem("used hand or power tools for repairs, installs, or adjustments", "drill, saw, meter, wrench, pliers, driver, ladder, fasteners, fixtures, doors, trim, outlets, switches, or basic repair tools", "Used hand and power tools to complete assigned repair, installation, or maintenance tasks.", "Licensed trade work, unless it was licensed/supervised correctly.", "Skills or work experience bullet", "Medium", ["hand tools", "power tools", "drill", "saw", "wrench", "repair"])
    ]
  },
  electrical: {
    note: "Electrical proof must name the exact task and whether it was helper, supervised, residential, commercial, or industrial. Do not claim electrician, panels, conduit, or troubleshooting beyond what you actually did.",
    items: [
      proofCoachItem("installed or assisted with outlets, switches, fixtures, fans, or wiring", "residential rough-in, trim-out, outlets, switches, ceiling fans, fixtures, cable pulls, wire runs, or supervised helper tasks", "Assisted with wiring, outlets, switches, fixtures, and ceiling fans under assigned electrical procedures.", "Electrician, unless you are licensed or the role was a helper/apprentice role.", "Work experience bullet", "High", ["wiring", "outlet", "switch", "fixture", "ceiling fan"]),
      proofCoachItem("worked with conduit, panels, breakers, meters, or electrical troubleshooting", "EMT/conduit, breaker panels, meters, circuits, continuity checks, voltage checks, troubleshooting steps, or supervised panel work", "Supported electrical troubleshooting, conduit, panel, or circuit tasks under supervision.", "Panel work or troubleshooting, unless you actually performed those tasks safely/supervised.", "Work experience bullet", "High", ["conduit", "panel", "breaker", "meter", "troubleshoot"]),
      proofCoachItem("followed lockout/tagout, PPE, ladder, and jobsite electrical safety", "LOTO training, de-energized circuits, PPE, ladders, jobsite safety meetings, OSHA rules, or supervised safety procedures", "Followed electrical safety procedures, PPE requirements, and assigned jobsite rules during electrical work.", "Lockout/tagout, unless trained and used it.", "Skills or work experience bullet", "Medium", ["lockout", "tagout", "ppe", "osha", "ladder", "safety"])
    ]
  },
  welding: {
    note: "Welding proof must name the process, material, position, drawings, fit-up, tools, and inspection standard. Do not claim MIG, TIG, pipe, structural, or code welding unless you did it.",
    items: [
      proofCoachItem("performed MIG, TIG, stick, flux-core, pipe, or structural welding", "specific welding process, material type, weld position, shop/field environment, production welds, repair welds, or welding-school projects", "Performed assigned welding tasks using documented processes while following safety and quality steps.", "Welder, MIG, TIG, pipe, or structural welding unless that process is real.", "Skills and work experience", "High", ["mig", "tig", "stick", "flux", "weld", "pipe"]),
      proofCoachItem("fit, fabricated, cut, ground, or prepared metal parts", "fit-up, measuring, tack welding, cutting, grinding, beveling, layout, clamps, jigs, or material prep", "Prepared, fit, cut, or ground metal parts to support fabrication or welding tasks.", "Fabricator, unless layout/fit-up/fabrication was part of the job.", "Work experience bullet", "Medium", ["fabrication", "fit", "grinding", "cutting", "layout", "tack"]),
      proofCoachItem("read blueprints, drawings, weld symbols, or inspection requirements", "blueprints, drawings, shop travelers, weld symbols, WPS, measurements, gauges, visual inspection, or dimensional checks", "Used drawings, measurements, or work instructions to complete welding or fabrication tasks.", "Certified/code welder, unless certified and tested.", "Work experience or certifications", "High", ["blueprint", "drawing", "weld symbol", "wps", "inspection"])
    ]
  },
  diesel: {
    note: "Diesel mechanic proof must name the system, vehicle/equipment type, PM task, diagnostic step, and shop tool. Do not call yourself a diesel mechanic if your proof is helper/lube/inspection only.",
    items: [
      proofCoachItem("performed PM service, inspections, fluids, filters, tires, lights, or safety checks", "preventive maintenance, oil changes, filters, greasing, tire checks, brake checks, lights, DVIR, shop inspection forms, or fleet service", "Performed preventive maintenance and inspections on trucks, trailers, fleet vehicles, or equipment.", "Diesel mechanic, unless diagnostics/repairs were real duties.", "Work experience bullet", "Medium", ["preventive maintenance", "pm", "inspection", "oil", "filter", "fleet"]),
      proofCoachItem("diagnosed or repaired brakes, hydraulics, electrical, engines, or trailers", "air brakes, hydraulic leaks, electrical faults, engine issues, trailer repairs, ABS, suspension, diagnostic scanner, or shop repair orders", "Supported diagnostics and repairs on diesel, trailer, brake, hydraulic, or electrical systems.", "Diesel diagnostics, unless you actually diagnosed faults.", "Work experience bullet", "High", ["brakes", "hydraulic", "engine", "trailer", "diagnostic", "abs"]),
      proofCoachItem("used shop tools, scan tools, lifts, jacks, torque tools, or service manuals", "hand tools, impact tools, torque wrench, diagnostic scanner, lifts, jacks, service manuals, parts lookup, or repair procedures", "Used shop tools and service procedures to complete assigned inspection, service, or repair tasks.", "ASE/master technician, unless certified.", "Skills or work experience", "Medium", ["tools", "scanner", "torque", "jack", "manual", "parts"])
    ]
  },
  construction: {
    note: "Construction proof must name the trade task, material, tool, jobsite type, measurement, installation, and safety condition. Do not use one construction word to cover every trade.",
    items: [
      proofCoachItem("used hand/power tools for installation, demolition, carpentry, concrete, drywall, or site work", "drills, saws, grinders, nailers, hammers, levels, tape measures, pry bars, concrete tools, drywall tools, or demolition tools", "Used hand and power tools to complete assigned construction, installation, or demolition tasks.", "Skilled trade mechanic, unless you performed that trade at that level.", "Skills or work experience bullet", "Medium", ["hand tools", "power tools", "drill", "saw", "demolition", "installation"]),
      proofCoachItem("measured, cut, installed, framed, trimmed, or assembled building materials", "doors, trim, millwork, framing, drywall, flooring, insulation, fencing, fixtures, layout marks, or material cuts", "Measured, cut, installed, or assembled building materials according to jobsite instructions.", "Carpenter, unless carpentry was a real duty.", "Work experience bullet", "Medium", ["measured", "cut", "installed", "framing", "trim", "millwork"]),
      proofCoachItem("followed jobsite safety, PPE, ladder, lift, cleanup, or material-handling rules", "PPE, ladders, scaffolds, lifts, cleanup, debris removal, heavy materials, traffic control, safety meetings, or OSHA rules", "Followed jobsite safety, PPE, cleanup, and material-handling procedures during assigned work.", "OSHA 10/30, unless certified.", "Work experience or certifications", "Medium", ["ppe", "ladder", "scaffold", "cleanup", "osha", "safety"])
    ]
  },
  customer_service: {
    note: "Customer-service proof must say who you helped, what system or counter/phone channel you used, what problem you solved, and what record or transaction you updated. Avoid plain 'good communication'.",
    items: [
      proofCoachItem("handled customer questions, complaints, returns, accounts, or service issues", "front counter, phone queue, chat/email, complaints, returns, account lookups, service delays, order problems, or customer follow-up", "Resolved customer questions, account issues, returns, or service concerns while documenting next steps.", "Call center, sales, or account manager, unless that was the setting and duty.", "Work experience bullet", "Medium", ["customer", "complaint", "return", "account", "service", "phone"]),
      proofCoachItem("used POS, CRM, order system, account system, or service notes", "cash register, POS, CRM, account portal, order system, ticket notes, service log, payment screen, or customer profile", "Used POS, CRM, order, or account systems to update customer information and complete transactions.", "CRM experience, unless you used a CRM or account system.", "Skills or work experience", "Medium", ["pos", "crm", "account", "order", "transaction", "system"]),
      proofCoachItem("recommended products, services, upgrades, appointments, or next steps", "upselling, product suggestions, appointment scheduling, service options, warranty explanation, membership offers, or referral to the right department", "Recommended products, services, appointments, or next steps based on the customer's stated need.", "Sales representative, unless selling was part of the job.", "Work experience bullet", "Medium", ["sales", "upsell", "recommend", "appointment", "product"])
    ]
  },
  office: {
    note: "Office proof must name the document, system, record, schedule, phone/email task, or spreadsheet. Do not turn basic computer use into administrative experience.",
    items: [
      proofCoachItem("entered, updated, scanned, filed, or audited records", "data entry, forms, spreadsheets, scanned documents, filing systems, record audits, mail logs, or database updates", "Entered, updated, scanned, filed, or audited records with attention to accuracy.", "Data entry clerk, unless data entry was a regular duty.", "Work experience bullet", "Medium", ["data entry", "records", "file", "scan", "spreadsheet"]),
      proofCoachItem("scheduled appointments, calendars, meetings, routes, or follow-ups", "calendar updates, appointment scheduling, interview times, service windows, route times, reminders, or confirmation calls", "Scheduled appointments, calendar updates, or follow-ups and communicated changes clearly.", "Scheduler/coordinator, unless scheduling was part of your job.", "Work experience bullet", "Medium", ["schedule", "calendar", "appointment", "follow up", "meeting"]),
      proofCoachItem("answered phones, handled emails, routed messages, or prepared documents", "multi-line phones, inboxes, email replies, document templates, memos, reports, labels, PDFs, or office correspondence", "Answered calls, handled emails, routed messages, and prepared documents for office operations.", "Administrative assistant, unless these were assigned office duties.", "Work experience bullet", "Medium", ["phone", "email", "document", "message", "office"])
    ]
  },
  driving: {
    note: "Separate license proof from experience proof. A CDL is a credential; route driving, pre-trip inspections, endorsements, manual transmission, tanker, Hazmat, and verifiable tractor-trailer time are separate claims.",
    items: [
      proofCoachItem("completed pre-trip or post-trip inspections", "CDL school inspection practice, DOT inspection forms, vehicle walkarounds, DVIR, tire/brake/light checks, or equipment condition notes", "Completed pre-trip and post-trip inspection steps to check vehicle condition before or after routes.", "DOT driver experience, unless you drove under DOT rules.", "Work experience or CDL training section", "Medium", ["pre-trip", "pretrip", "post-trip", "inspection", "dvir"]),
      proofCoachItem("held CDL-A, TWIC, Tanker, Hazmat, or DOT medical card", "license/endorsement card, permit, TWIC card, DOT medical card, or completed CDL training", "CDL-A holder with TWIC card and training in vehicle inspection and safe operation.", "Tanker, Hazmat, manual, or 1 year experience unless each one is true.", "Certifications section", "High", ["cdl", "twic", "hazmat", "tanker", "dot medical", "medical card"]),
      proofCoachItem("communicated with dispatch or updated route paperwork", "dispatch calls, delivery app, BOL, trip sheet, route manifest, delivery log, arrival/departure note, or customer signature", "Updated route paperwork, trip notes, or dispatch information during assigned driving work.", "Commercial driving route experience, unless it was work driving.", "Work experience bullet", "Medium", ["dispatch", "route", "bol", "manifest", "delivery", "trip"])
    ]
  },
  security: {
    note: "Security-officer proof must be patrols, access control, visitor screening, incident reports, emergency response, cameras, posts, or license/training. Do not use alarm-installation or IT security wording for guard work.",
    items: [
      proofCoachItem("performed patrols, post checks, access control, or visitor screening", "walking patrols, vehicle patrols, gatehouse duty, badge checks, visitor logs, entry control, post orders, or perimeter checks", "Performed patrols, access control, visitor screening, and post checks according to site procedures.", "Law enforcement, unless you were sworn/certified.", "Work experience bullet", "Medium", ["patrol", "access control", "visitor", "badge", "gate", "post"]),
      proofCoachItem("wrote incident reports, logs, shift notes, or emergency notifications", "incident report, DAR, activity log, shift report, unusual activity notes, emergency calls, supervisor notifications, or trespass reports", "Documented incidents, observations, and unusual activity through clear reports and shift logs.", "Investigator, unless you performed investigations.", "Work experience bullet", "Medium", ["incident", "report", "log", "dar", "shift"]),
      proofCoachItem("monitored cameras, alarms, safety issues, or emergency situations", "CCTV screens, radio calls, alarm panels, safety concerns, emergency response, de-escalation, fire watch, or medical/security calls", "Monitored cameras, alarms, and site conditions and responded to concerns using site procedures.", "Cybersecurity or alarm technician, unless that was the job.", "Work experience bullet", "Medium", ["camera", "cctv", "alarm", "emergency", "radio", "de-escalation"])
    ]
  },
  cleaning: {
    note: "Cleaning proof must name the area, chemical/tool, schedule, sanitation standard, floor task, waste task, or facility type. Avoid plain 'cleaning' with no details.",
    items: [
      proofCoachItem("cleaned rooms, restrooms, offices, production areas, patient areas, or public spaces", "assigned areas such as restrooms, offices, lobbies, hotel rooms, patient rooms, breakrooms, production floors, or common areas", "Cleaned assigned rooms, restrooms, common areas, or workspaces according to facility standards.", "Hospital EVS or hotel housekeeper, unless that was the setting.", "Work experience bullet", "Low", ["cleaned", "rooms", "restroom", "office", "public", "patient"]),
      proofCoachItem("sanitized surfaces, handled trash, restocked supplies, or followed chemical procedures", "disinfectant, sanitizing, chemical labels, trash removal, linen removal, supply carts, restroom supplies, or SDS/safety rules", "Sanitized surfaces, removed trash, and restocked supplies while following chemical and safety procedures.", "Biohazard or hazardous waste handling, unless trained and assigned.", "Work experience bullet", "Medium", ["sanitized", "trash", "restocked", "chemical", "sds"]),
      proofCoachItem("completed floor care such as sweeping, mopping, vacuuming, buffing, or stripping/waxing", "broom, mop, vacuum, scrubber, buffer, burnisher, wet floor signs, floor stripping, waxing, or carpet cleaning", "Completed floor-care tasks such as sweeping, mopping, vacuuming, or machine floor work.", "Floor technician, unless floor machines/stripping/waxing were real duties.", "Skills or work experience", "Medium", ["mopping", "sweeping", "vacuum", "floor", "buffer", "wax"])
    ]
  },
  food_service: {
    note: "Food-service proof must name the station, food task, equipment, ticket/order system, sanitation step, or cash/POS task. Do not claim cook or food safety certification without proof.",
    items: [
      proofCoachItem("prepped, cooked, assembled, plated, or served food items", "prep station, grill, fryer, oven, cold line, sandwich station, tray line, portioning, plating, or serving line", "Prepared, cooked, assembled, plated, or served food items according to assigned station procedures.", "Line cook, unless you worked a cooking station.", "Work experience bullet", "Medium", ["prep", "cook", "grill", "fryer", "served", "plated"]),
      proofCoachItem("followed food safety, sanitation, temperature, glove, or allergy procedures", "handwashing, gloves, sanitizer buckets, temperature logs, FIFO, date labels, cross-contamination rules, allergy notes, or safe food handling training", "Followed food safety and sanitation procedures including temperature, labeling, glove, and clean-area requirements.", "ServSafe certified, unless certified.", "Skills or certifications", "High", ["food safety", "sanitation", "temperature", "fifo", "gloves", "allergy"]),
      proofCoachItem("handled orders, POS, cash, drive-thru, dining room, or guest requests", "tickets, POS, register, drive-thru headset, order accuracy, customer requests, dining-room service, or payment handling", "Processed orders, POS transactions, or guest requests while keeping timing and accuracy in focus.", "Server/cashier, unless that was part of your duties.", "Work experience bullet", "Medium", ["order", "pos", "cash", "drive-thru", "guest", "ticket"])
    ]
  },
  education: {
    note: "Education-support proof must name the age/grade, setting, lesson/activity, supervision area, behavior support, documentation, or special-needs support. Do not claim certified teacher unless licensed.",
    items: [
      proofCoachItem("supported students during lessons, tutoring, classroom activities, or small groups", "teacher assistant duties, tutoring, homework help, small groups, classroom centers, training learners, coaching youth, or instructional support", "Supported students during lessons, tutoring, small groups, or classroom activities according to teacher expectations.", "Certified teacher, unless you hold or are pursuing certification.", "Work experience bullet", "Medium", ["student", "classroom", "lesson", "tutoring", "small group"]),
      proofCoachItem("supervised students during arrival, lunch, recess, hallway, bus, or activities", "student supervision, attendance, hallway monitoring, lunchroom duty, recess, bus duty, camp groups, youth activities, or safety checks", "Supervised students during classroom, hallway, lunch, recess, bus, or activity periods.", "Classroom management lead, unless you owned behavior plans.", "Work experience bullet", "Medium", ["supervised", "lunch", "recess", "hallway", "bus", "activity"]),
      proofCoachItem("supported behavior expectations, IEP/504 instructions, special needs, or parent/staff updates", "redirection, behavior notes, IEP/504 support, special-needs assistance, daily notes, teacher updates, parent communication, or incident documentation", "Supported student behavior expectations and documented updates for teachers, staff, or families when assigned.", "Special education teacher, unless licensed/assigned in that role.", "Work experience bullet", "High", ["behavior", "iep", "504", "special needs", "parent", "documentation"])
    ]
  },
  it: {
    note: "Do not turn personal computer knowledge into professional IT claims. Use tickets, users, devices, systems, tools, projects, labs, certifications, or exact software only when real.",
    items: [
      proofCoachItem("resolved user hardware, software, account, or connectivity tickets", "help desk tickets, password resets, Windows support, printer support, network checks, laptop setup, or user-facing tech support", "Resolved user support tickets involving hardware, software, account access, or connectivity issues.", "Systems administrator, cybersecurity analyst, or developer, unless those duties are real.", "Work experience or projects", "Medium", ["ticket", "help desk", "windows", "password", "hardware", "software", "network"]),
      proofCoachItem("used a ticketing system or documented support steps", "JIRA, ServiceNow, Zendesk, Freshservice, help desk queue, ticket notes, escalation notes, or resolution notes", "Documented issue symptoms, troubleshooting steps, escalation details, and final resolution in a ticketing system.", "Tier 2/Tier 3 support, unless that was your actual support level.", "Work experience bullet", "Medium", ["ticket", "jira", "servicenow", "zendesk", "documentation", "escalation"]),
      proofCoachItem("worked with exact tools, systems, labs, certifications, or projects", "CompTIA training, home lab, school lab, Windows admin tasks, networking lab, security tools, scripting, GitHub project, or documented technical project", "Built technical proof through labs, certifications, projects, or user-support tasks with specific tools and systems.", "Professional IT experience, unless it happened in a job or formal project.", "Projects, certifications, or skills section", "Medium", ["comptia", "lab", "project", "script", "github", "certification"])
    ]
  },
  general: {
    note: "The app could not lock onto one job family. Do not add broad keywords. Pick the detected job type or paste a clearer job post before copying resume wording.",
    items: [
      proofCoachItem("matched the exact job title or subtype from the posting", "the resume already names the same role, a direct prior role, license, training program, or same daily duties", "Matched resume wording to the exact job type only after confirming the same duties or training.", "A job title from the posting, unless your resume proves that role.", "Summary or work experience only after selecting a real job type", "High", ["job title", "role", "training", "license"]),
      proofCoachItem("proved the specific tool, system, license, machine, or worksite mentioned", "named tool, software, credential, equipment, customer type, route type, machine, or regulated worksite from the posting", "Added only exact tools, systems, licenses, machines, or worksites that the resume can prove.", "Generic skills with no example behind them.", "Skills, certifications, or work experience", "Medium", ["tool", "system", "license", "machine", "equipment"])
    ]
  }
};

const GATE_PROOF_COACH = {
  driver_license: proofCoachItem("valid driver's license", "current driver's license that meets the employer's requirements", "Valid driver's license with ability to drive to assigned customer or job locations.", "Clean MVR, unless the record actually meets the employer/insurance standard.", "Certifications or resume header", "High", ["driver license", "driver's license", "cdl"]),
  mvr: proofCoachItem("acceptable driving record / MVR", "MVR that meets the employer or insurance carrier rules, not just having a license", "Eligible to operate company vehicles based on employer MVR requirements.", "Clean driving record, unless it is accurate.", "Do not place unless verified; discuss only if asked", "High", ["mvr", "clean driving", "safe driving"]),
  cdl_a: proofCoachItem("valid Class-A CDL", "active CDL-A license, not just interest in trucking", "Valid Class-A CDL holder with CDL training in inspections and safe vehicle operation.", "CDL-A driver with experience, unless you have verifiable driving time.", "Certifications section", "High", ["cdl-a", "class a"]),
  tanker: proofCoachItem("Tanker endorsement", "active Tanker endorsement on the license", "Class-A CDL holder with Tanker endorsement.", "Tanker endorsement, unless it is on your license.", "Certifications section", "High", ["tanker"]),
  hazmat: proofCoachItem("Hazmat endorsement", "active Hazmat endorsement and required background approval", "Class-A CDL holder with Hazmat endorsement.", "Hazmat endorsement, unless it is active.", "Certifications section", "High", ["hazmat"]),
  teaching_certification: proofCoachItem("state teaching certification", "active educator certificate or official alternative-certification eligibility", "Eligible for state teaching certification through the approved alternative pathway.", "Certified teacher, unless the certificate is active or officially in progress.", "Education / Certifications section", "High", ["teaching certification", "teacher license"]),
  bachelors: proofCoachItem("bachelor's degree", "completed bachelor's degree from the school listed on the resume", "Bachelor's degree completed in [field].", "Bachelor's degree, unless the degree is completed.", "Education section", "High", ["bachelor", "bachelors", "degree"]),
  pesticide_license: proofCoachItem("pesticide license within 90 days", "current license, prior license, or willingness to complete company-paid licensing after hire when the posting allows it", "Willing and able to complete company-paid pesticide licensing within the required 90-day period.", "Licensed pesticide applicator, unless already licensed.", "Certifications or summary", "High", ["pesticide", "pest control license"]),
  ts_sci_poly: proofCoachItem("active TS/SCI with Polygraph", "current active clearance with polygraph", "Active TS/SCI with Polygraph.", "Clearance, TS/SCI, or Polygraph, unless active and real.", "Clearance section", "High", ["ts/sci", "polygraph", "clearance"]),
  epa_universal: proofCoachItem("EPA Universal Certification", "active EPA Universal certification card or documented certification", "EPA Universal Certified.", "EPA Universal, unless certified.", "Certifications section", "High", ["epa universal"]),
  rn_license: proofCoachItem("active RN license", "active RN license in the state required by the job", "Active RN license.", "Registered Nurse, unless licensed.", "Licenses section", "High", ["rn license", "registered nurse"]),
  lpn_license: proofCoachItem("active LPN license", "active LPN license in the state required by the job", "Active LPN license.", "Licensed Practical Nurse, unless licensed.", "Licenses section", "High", ["lpn license", "licensed practical nurse"])
};

function getProofCoachRule(analysis) {
  const subtypeId = analysis.realJobType?.id;
  if (subtypeId && PROOF_COACH_BY_SUBTYPE[subtypeId]) return PROOF_COACH_BY_SUBTYPE[subtypeId];
  const family = analysis.selectedFamily === "general" ? analysis.jobFamily.family : analysis.selectedFamily;
  return PROOF_COACH_BY_FAMILY[family] || PROOF_COACH_BY_FAMILY.general;
}

function isCoachItemProven(item, resumeNorm, analysis) {
  const patterns = item.patterns || [];
  if (patterns.length && matchResumeRequirement(resumeNorm, patterns)) return true;
  const labelNorm = normalize(item.label);
  return (analysis.keywordData?.exactMatched || []).some(match => {
    const termNorm = normalize(match.term);
    return termNorm && (labelNorm.includes(termNorm) || termNorm.includes(labelNorm));
  });
}

function requirementToCoachItem(req) {
  if (GATE_PROOF_COACH[req.gate]) return { ...GATE_PROOF_COACH[req.gate], req };
  const danger = req.level === "hard" ? "High" : "Medium";
  return proofCoachItem(req.label, `real proof that you meet this job-post requirement: ${req.label}`, `${req.label}.`, `${req.label}, unless it is accurate and current.`, req.level === "hard" ? "Certification, license, education, or credential section" : "Work experience, skills, or certifications section", danger, [req.label]);
}

function getTrainingProvidedSafeWording(jobText, analysis) {
  const job = normalize(jobText);
  const lines = [];
  if (job.includes("pesticide license") && (job.includes("90 days") || job.includes("company paid") || job.includes("we teach"))) {
    lines.push("Willing and able to complete company-paid pesticide licensing within the required 90-day period.");
  }
  if ((job.includes("training provided") || job.includes("technical development training")) && (job.includes("cable") || job.includes("hsi") || job.includes("cdv") || job.includes("xhs"))) {
    lines.push("Willing to complete required technical installation training and certification before performing independent cable, internet, video, or voice installations.");
  }
  if (job.includes("alternative certification") && job.includes("bachelor")) {
    lines.push("Bachelor's degree holder interested in the approved alternative teaching certification pathway.");
  }
  if (job.includes("no experience required") && (analysis.realJobType?.id === "pest_control_technician" || job.includes("pest"))) {
    lines.push("Entry-level pest-control trainee willing to complete route training, licensing, PPE, ladder, crawl-space, and customer-service requirements after hire.");
  }
  if (job.includes("no experience required") && (job.includes("cdl") || job.includes("driver"))) {
    lines.push("Entry-level driver candidate with required license/training only where already completed.");
  }
  return cleanList(lines);
}

function renderCoachList(title, items, options = {}) {
  const list = cleanList(items).slice(0, options.limit || 6);
  if (!list.length) return "";
  return `
    <div style="margin:14px 0 0">
      <p style="margin:0 0 8px;color:${options.color || "#f4f7fb"};font-weight:800">${escapeHTML(title)}</p>
      <ul style="margin:0 0 0 18px;color:${options.textColor || "#d6dbe6"};line-height:1.55">${list.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderDetailedCoachItems(title, items, color) {
  if (!items.length) return "";
  const cards = items.slice(0, 5).map(item => `
    <li style="margin:0 0 12px">
      <strong style="color:${color || "#f4f7fb"}">${escapeHTML(item.label)}</strong><br>
      <span style="color:#a7b0bf"><strong>What proof counts:</strong> ${escapeHTML(item.proofCounts)}</span><br>
      <span style="color:#a7ffce"><strong>Safe wording:</strong> ${escapeHTML(item.safeWording)}</span><br>
      <span style="color:#ffc2cc"><strong>Do not write:</strong> ${escapeHTML(item.doNotWrite)}</span><br>
      <span style="color:#d6dbe6"><strong>Where to place it:</strong> ${escapeHTML(item.place)}</span><br>
      <span style="color:#ffd369"><strong>Interview danger:</strong> ${escapeHTML(item.danger)}</span>
    </li>
  `).join("");
  return `
    <div style="margin:14px 0 0">
      <p style="margin:0 0 8px;color:${color || "#f4f7fb"};font-weight:800">${escapeHTML(title)}</p>
      <ul style="margin:0 0 0 18px;color:#d6dbe6;line-height:1.55">${cards}</ul>
    </div>
  `;
}

function renderKeywordProofCoach(container, analysis) {
  if (!container) return;
  const rule = getProofCoachRule(analysis);
  const resumeNorm = normalize(analysis.resumeText || "");
  const baseItems = rule.items || [];
  const provenItems = baseItems.filter(item => isCoachItemProven(item, resumeNorm, analysis));
  const notProvenItems = baseItems.filter(item => !isCoachItemProven(item, resumeNorm, analysis));
  const hardReqs = (analysis.smartFixes?.hardRequirements || []);
  const credentialItems = hardReqs
    .filter(req => req.level === "hard" || /license|certification|degree|clearance|endorsement|mvr|driver/i.test(req.label))
    .map(requirementToCoachItem);
  const credentialNotShown = credentialItems.filter(item => !item.req?.met);
  const trainingLines = getTrainingProvidedSafeWording(analysis.jobText || "", analysis);
  const provenLabels = cleanList([
    ...provenItems.map(item => item.label),
    ...(analysis.keywordData?.exactMatched || []).map(item => item.term)
  ]).slice(0, 7);

  const topWarning = "These are not automatic resume keywords. Add one only when your real work, training, license, certification, tool, route, machine, or worksite proves it.";
  container.innerHTML = `
    <div style="border:1px solid rgba(125,211,252,0.35);background:rgba(125,211,252,0.08);border-radius:16px;padding:14px">
      <p style="margin:0;color:#d6dbe6;line-height:1.55">${escapeHTML(topWarning)}</p>
      ${renderCoachList("Proven by your resume", provenLabels, { color: "#a7ffce", textColor: "#d6dbe6", limit: 7 })}
      ${renderDetailedCoachItems("Add only if your resume proves this", notProvenItems, "#ffd369")}
      ${renderDetailedCoachItems("Credential gate — do not fake", credentialNotShown, "#ffc2cc")}
      ${renderCoachList("Safe wording when the job says it trains you", trainingLines, { color: "#a7ffce", textColor: "#d6dbe6", limit: 4 })}
      <div style="margin:14px 0 0;border-top:1px solid rgba(255,255,255,0.10);padding-top:12px">
        <p style="margin:0;color:#f4f7fb;font-weight:800">Coach note</p>
        <p style="margin:6px 0 0;color:#d6dbe6;line-height:1.55">${escapeHTML(rule.note)}</p>
      </div>
    </div>
  `;
}

function renderMatchedKeywords(container, analysis) {
  if (!container) return;
  container.innerHTML = "";
  renderKeywordGroup(container, "Resume Proof Found", analysis.keywordData.exactMatched, "These job-post skills already appear in the resume or close wording.");
}

function buildRedFlags(resumeText, jobText, analysis) {
  const flags = [];
  if (analysis.applyDecision) {
    flags.push(`<strong>Apply decision:</strong> ${escapeHTML(analysis.applyDecision.label)} — ${escapeHTML(analysis.applyDecision.reason)}`);
  }
  if (analysis.diagnosis.category === "wrong_job_type") {
    flags.push(`<strong>Wrong job type selected:</strong> switch the dropdown before copying any wording.`);
  }
  if (analysis.diagnosis.category === "weak_evidence") {
    flags.push(`<strong>Weak evidence:</strong> this resume does not prove enough direct experience for this job-specific rewrite.`);
  }
  if (analysis.keywordData.criticalMissing.length) {
    const targetFamily = analysis.selectedFamily === "general" ? analysis.jobFamily.family : analysis.selectedFamily;
    const proofGaps = getFamilyProofGaps(targetFamily, analysis.selected.label, analysis.keywordData.missing).slice(0, 6);
    flags.push(`<strong>Required proof gap:</strong> ${escapeHTML(joinEnglish(proofGaps))} ${proofGaps.length === 1 ? "is" : "are"} not clearly proven. Add only if true.`);
  }
  const hardReqs = (analysis.smartFixes?.hardRequirements || []).filter(item => !item.met).slice(0, 4);
  hardReqs.forEach(req => {
    flags.push(`<strong>Job requirement:</strong> ${escapeHTML(formatHardRequirement(req))}`);
  });
  const helpful = cleanList([...(analysis.keywordData.helpfulMissing || []), ...(analysis.keywordData.softMissing || [])].map(item => item.term)).slice(0, 6);
  if (helpful.length) {
    flags.push(`<strong>Possible ATS keywords:</strong> ${escapeHTML(joinEnglish(helpful))}. Add only if you actually did them.`);
  }
  if (!/20\d{2}|19\d{2}|present|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec/i.test(resumeText)) {
    flags.push(`<strong>Missing dates:</strong> add month/year dates so the resume looks complete.`);
  }
  if (normalize(resumeText).split(" ").length < 75) {
    flags.push(`<strong>Thin resume:</strong> add real job duties, tools, equipment, certifications, or measurable work details.`);
  }
  if (!flags.length) {
    flags.push("No major red flags found from this scan.");
  }
  flags.push(`<strong>Truth rule:</strong> ATS-friendly wording only. Do not add duties, tools, certifications, or experience you have not done.`);
  return flags;
}

function getScoreMessage(analysis) {
  if (analysis.applyDecision?.decision === "do_not_apply_yet") {
    return `${analysis.score}% match. ${analysis.applyDecision.label}: ${analysis.applyDecision.reason}`;
  }
  if (analysis.applyDecision?.decision === "apply_if_true") {
    return `${analysis.score}% match. Apply only if the listed requirements are true.`;
  }
  if (analysis.applyDecision?.decision === "be_careful") {
    return `${analysis.score}% match. Be careful: this looks like gig work or a low-quality posting.`;
  }
  if (analysis.diagnosis.category === "wrong_job_type") {
    return `${analysis.score}% keyword overlap, but the selected job type is wrong. Fix the dropdown before using the report.`;
  }
  if (analysis.diagnosis.category === "weak_evidence") {
    return `${analysis.score}% match. Low proof means direction only, not a job-specific rewrite.`;
  }
  if (analysis.diagnosis.category === "medium_match") {
    return `${analysis.score}% match. Fixable wording gap, but missing keywords must be true before adding them.`;
  }
  return `${analysis.score}% match. ${analysis.diagnosis.title}: the wording below is based on resume proof found in the scan.`;
}

function setRewriteHeadings(output) {
  const summaryHeading = $("summaryHeading");
  const bulletHeading = $("bulletHeading");
  if (summaryHeading) summaryHeading.textContent = output.summaryHeading;
  if (bulletHeading) bulletHeading.textContent = output.bulletHeading;
  const summaryBtn = document.querySelector('[data-copy="summaryOutput"]');
  const bulletBtn = document.querySelector('[data-copy="bulletOutput"]');
  const directionMode = /direction|proof|warning|switch/i.test(`${output.summaryHeading} ${output.bulletHeading}`);
  if (summaryBtn) summaryBtn.textContent = directionMode ? "Copy direction" : "Copy summary";
  if (bulletBtn) bulletBtn.textContent = directionMode ? "Copy proof checklist" : "Copy bullets";
}

function analyzeAndRender() {
  const resumeEl = $("resumeText");
  const jobEl = $("jobText");
  const jobTypeEl = $("jobType");
  if (!resumeEl || !jobEl || !jobTypeEl) {
    alert("The resume checker is still loading. Refresh the page and try again.");
    return;
  }

  const resumeText = resumeEl.value.trim();
  const jobText = jobEl.value.trim();
  const jobType = jobTypeEl.value;

  if (!resumeText || !jobText) {
    alert("Paste both your resume and the job description first.");
    return;
  }

  const analysis = analyzeResume(resumeText, jobText, jobType);
  const resultsEl = $("results");
  const rewriteEl = $("rewrite");
  if (resultsEl) resultsEl.hidden = false;
  if (rewriteEl) rewriteEl.hidden = false;

  if ($("scoreValue")) $("scoreValue").textContent = analysis.score;
  if ($("scoreMessage")) $("scoreMessage").textContent = getScoreMessage(analysis);
  if ($("scoreBar")) $("scoreBar").style.width = `${Math.max(5, analysis.score)}%`;

  renderRealJobType($("jobTypeOutput"), analysis);
  renderApplyDecision($("applyDecisionOutput"), analysis);
  renderApplicationPriority($("applicationPriorityOutput"), analysis);
  renderFitScores($("fitScoreOutput"), analysis);
  renderFastestPath($("fastestPathOutput"), analysis);
  renderKeywordProofCoach($("keywordProofCoachOutput"), analysis);
  renderDiagnosis($("diagnosisOutput"), analysis);
  renderMissingKeywords($("missingKeywords"), analysis);
  renderMatchedKeywords($("matchedKeywords"), analysis);

  const flags = buildRedFlags(resumeText, jobText, analysis);
  if ($("redFlags")) $("redFlags").innerHTML = flags.map(flag => `<li>${flag}</li>`).join("");

  setRewriteHeadings(analysis.output);
  if ($("summaryOutput")) $("summaryOutput").textContent = analysis.output.summary;
  if ($("bulletOutput")) $("bulletOutput").textContent = analysis.output.bullets.map(item => `• ${item}`).join("\n");

  if (resultsEl) resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearAnalyzer() {
  if ($("resumeText")) $("resumeText").value = "";
  if ($("jobText")) $("jobText").value = "";
  if ($("results")) $("results").hidden = true;
  if ($("rewrite")) $("rewrite").hidden = true;
  if ($("scoreValue")) $("scoreValue").textContent = "0";
  if ($("scoreMessage")) $("scoreMessage").textContent = "";
  if ($("scoreBar")) $("scoreBar").style.width = "0%";
  ["jobTypeOutput", "applyDecisionOutput", "applicationPriorityOutput", "fitScoreOutput", "fastestPathOutput", "keywordProofCoachOutput", "diagnosisOutput", "missingKeywords", "matchedKeywords", "redFlags", "summaryOutput", "bulletOutput"].forEach(id => {
    const el = $(id);
    if (el) el.textContent = "";
  });
  setRewriteHeadings({ summaryHeading: "ATS-friendly summary", bulletHeading: "Resume bullets or right direction" });
}

function openMenu() {
  const menu = $("navMenu");
  const backdrop = $("menuBackdrop");
  const toggle = $("menuToggle");
  if (!menu || !backdrop || !toggle) return;
  menu.classList.add("open");
  menu.setAttribute("aria-hidden", "false");
  toggle.setAttribute("aria-expanded", "true");
  backdrop.hidden = false;
  document.body.classList.add("menu-open");
}

function closeMenu() {
  const menu = $("navMenu");
  const backdrop = $("menuBackdrop");
  const toggle = $("menuToggle");
  if (!menu || !backdrop || !toggle) return;
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
  backdrop.hidden = true;
  document.body.classList.remove("menu-open");
}

function storageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {}
}

function getCurrentUser() {
  try {
    return JSON.parse(storageGet("gmpt_current_user", "null") || "null");
  } catch (error) {
    storageRemove("gmpt_current_user");
    return null;
  }
}

function trackerKey() {
  const user = getCurrentUser();
  return user && user.email ? `gmpt_tracker_${normalize(user.email).replace(/\s+/g, "_")}` : "gmpt_tracker_guest";
}

function loadTracker() {
  try {
    return JSON.parse(storageGet(trackerKey(), "[]") || "[]");
  } catch (error) {
    return [];
  }
}

function saveTracker(items) {
  storageSet(trackerKey(), JSON.stringify(items));
}

function renderTracker() {
  const rows = $("trackerRows");
  if (!rows) return;
  const items = loadTracker();
  if (!items.length) {
    rows.innerHTML = '<tr><td colspan="6">No applications tracked yet.</td></tr>';
    return;
  }
  rows.innerHTML = items.map((item, index) => `
    <tr>
      <td>${escapeHTML(item.date)}</td>
      <td>${escapeHTML(item.company)}</td>
      <td>${escapeHTML(item.role)}</td>
      <td>${escapeHTML(item.pay || "—")}</td>
      <td>${escapeHTML(item.status)}</td>
      <td><button class="delete-row" data-index="${index}" type="button">Delete</button></td>
    </tr>
  `).join("");
}

function setAuthMessage(message = "", type = "") {
  const el = $("authMessage");
  if (!el) return;
  el.textContent = message;
  el.className = `auth-message ${type}`.trim();
}

function renderAccount() {
  const user = getCurrentUser();
  if ($("navUser")) $("navUser").textContent = user ? `Signed in as ${user.name}` : "Create or sign in";
  if ($("trackerNote")) $("trackerNote").textContent = user ? `Tracking applications for ${user.name}.` : "Track where you applied, pay, status, and follow-up dates. Sign in from the menu to keep your list separate.";
  if ($("authCard")) $("authCard").hidden = Boolean(user);
  if ($("accountStatusCard")) $("accountStatusCard").hidden = !user;
  if ($("accountStatus")) $("accountStatus").textContent = user ? `Signed in as ${user.name}` : "You're signed in";
  if ($("accountNote")) $("accountNote").textContent = user ? `${user.email} — saved on this device.` : "Your job applications are saved to your account.";
}

let authMode = "create";

function setAuthMode(mode) {
  authMode = mode === "signin" ? "signin" : "create";
  const create = authMode === "create";
  if ($("authEyebrow")) $("authEyebrow").textContent = create ? "Create account" : "Sign in";
  if ($("authTitle")) $("authTitle").textContent = create ? "Create your free account" : "Welcome back";
  if ($("authHelp")) $("authHelp").textContent = create ? "Save your job applications and come back later." : "Access your saved job applications on this device.";
  if ($("accountSubmitBtn")) $("accountSubmitBtn").textContent = create ? "Create Account" : "Sign In";
  if ($("nameField")) $("nameField").hidden = !create;
  if ($("userName")) $("userName").required = create;
  if ($("passwordResetBtn")) $("passwordResetBtn").hidden = create;
  if ($("authSwitchText")) {
    $("authSwitchText").innerHTML = create
      ? 'Already have an account? <button class="link-button inline-link" id="switchAuthBtn" type="button">Sign in</button>'
      : 'Need an account? <button class="link-button inline-link" id="switchAuthBtn" type="button">Create one</button>';
  }
  const switchBtn = $("switchAuthBtn");
  if (switchBtn) switchBtn.onclick = () => setAuthMode(create ? "signin" : "create");
  setAuthMessage("", "");
}

function handleAccountSubmit(event) {
  event.preventDefault();
  const email = ($("userEmail")?.value || "").trim().toLowerCase();
  const password = $("userPassword")?.value || "";
  const name = ($("userName")?.value || "").trim() || email.split("@")[0] || "User";
  if (!email) {
    setAuthMessage("Enter your email.", "error");
    return;
  }
  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.", "error");
    return;
  }
  storageSet("gmpt_current_user", JSON.stringify({ name, email, signedInAt: new Date().toISOString(), mode: authMode }));
  const form = $("accountForm");
  if (form) form.reset();
  renderAccount();
  renderTracker();
  closeMenu();
}

function exportTrackerCSV() {
  const items = loadTracker();
  if (!items.length) {
    alert("No applications to export yet.");
    return;
  }
  const rows = [["Date", "Company", "Role", "Pay", "Status"], ...items.map(item => [item.date, item.company, item.role, item.pay || "", item.status])];
  const csv = rows.map(row => row.map(value => `"${text(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "job-tracker.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function initEvents() {
  const analyzeBtn = $("analyzeBtn");
  if (analyzeBtn) analyzeBtn.addEventListener("click", analyzeAndRender);

  const clearBtn = $("clearBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearAnalyzer);

  const menuToggle = $("menuToggle");
  if (menuToggle) menuToggle.addEventListener("click", () => {
    const menu = $("navMenu");
    if (menu && menu.classList.contains("open")) closeMenu();
    else openMenu();
  });

  const menuClose = $("menuClose");
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  const backdrop = $("menuBackdrop");
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  document.querySelectorAll("#navMenu .menu-item").forEach(link => link.addEventListener("click", closeMenu));
  document.querySelectorAll("[data-open-account]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    setAuthMode("create");
    openMenu();
  }));
  document.querySelectorAll("[data-drawer-page]").forEach(button => button.addEventListener("click", () => {
    const target = $(button.getAttribute("data-drawer-page"));
    const alreadyOpen = target && !target.hidden;
    document.querySelectorAll(".drawer-page-panel").forEach(panel => { panel.hidden = true; });
    document.querySelectorAll(".drawer-page-button").forEach(item => item.classList.remove("active"));
    if (target && !alreadyOpen) {
      target.hidden = false;
      button.classList.add("active");
    }
  }));

  const togglePassword = $("togglePasswordBtn");
  if (togglePassword) togglePassword.addEventListener("click", () => {
    const input = $("userPassword");
    if (!input) return;
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    togglePassword.textContent = showing ? "Show" : "Hide";
  });

  setAuthMode("create");
  const accountForm = $("accountForm");
  if (accountForm) accountForm.addEventListener("submit", handleAccountSubmit);
  const passwordResetBtn = $("passwordResetBtn");
  if (passwordResetBtn) passwordResetBtn.addEventListener("click", () => setAuthMessage("Password reset is not connected yet. Create a new local sign-in or contact support.", "error"));
  const signOutBtn = $("signOutBtn");
  if (signOutBtn) signOutBtn.addEventListener("click", () => {
    storageRemove("gmpt_current_user");
    renderAccount();
    renderTracker();
    closeMenu();
  });

  const trackerForm = $("trackerForm");
  if (trackerForm) trackerForm.addEventListener("submit", event => {
    event.preventDefault();
    const company = ($("company")?.value || "").trim();
    const role = ($("role")?.value || "").trim();
    if (!company || !role) return;
    const items = loadTracker();
    items.unshift({
      date: new Date().toLocaleDateString(),
      company,
      role,
      pay: ($("pay")?.value || "").trim(),
      status: $("status")?.value || "Saved"
    });
    saveTracker(items);
    trackerForm.reset();
    renderTracker();
  });

  const trackerRows = $("trackerRows");
  if (trackerRows) trackerRows.addEventListener("click", event => {
    if (!event.target.matches(".delete-row")) return;
    const items = loadTracker();
    items.splice(Number(event.target.dataset.index), 1);
    saveTracker(items);
    renderTracker();
  });

  const exportBtn = $("exportTrackerBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportTrackerCSV);
  const clearTrackerBtn = $("clearTrackerBtn");
  if (clearTrackerBtn) clearTrackerBtn.addEventListener("click", () => {
    if (!loadTracker().length) return;
    if (!confirm("Clear tracker? This cannot be undone.")) return;
    saveTracker([]);
    renderTracker();
  });

  document.querySelectorAll(".copy-button").forEach(button => button.addEventListener("click", () => {
    const target = $(button.dataset.copy);
    const value = target ? target.textContent : "";
    if (navigator.clipboard && value) navigator.clipboard.writeText(value).catch(() => {});
    const old = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = old; }, 1200);
  }));
}

function init() {
  initEvents();
  renderAccount();
  renderTracker();
  window.GMPT_APP_READY = true;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
