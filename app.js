// GET ME PAST ATS
// Full report logic: diagnose first, then write only from proven resume evidence.
window.GMPT_APP_VERSION = "paid-logic-v3-no-generic-copy";

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
    term("machine operation", ["machine operator", "operated machines", "operating machines", "production machines", "production equipment"], "high"),
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
    term("industrial equipment", ["industrial equipment", "manufacturing equipment"], "medium"),
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
    term("security", ["security officer", "guard"], "high"),
    term("patrols", ["patrol", "walking patrol"], "medium"),
    term("incident reports", ["incident reporting", "reports"], "medium"),
    term("access control", ["badge", "entrance", "visitor"], "medium"),
    term("surveillance", ["cameras", "monitoring"], "medium")
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
  return active.length ? active : familyTerms.slice(0, 10);
}

function analyzeKeywords(resumeText, jobText, targetFamily) {
  const normalizedResume = normalize(resumeText);
  const activeTerms = getActiveTerms(jobText, targetFamily);
  let totalWeight = 0;
  let matchedWeight = 0;
  const exactMatched = [];
  const missing = [];

  activeTerms.forEach(item => {
    const weight = weightFor(item.priority);
    totalWeight += weight;
    if (termMatchesText(item, normalizedResume)) {
      matchedWeight += weight;
      exactMatched.push({ ...item, status: "exact", confidence: 100 });
    } else {
      missing.push({ ...item, status: "missing", confidence: 0 });
    }
  });

  const score = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  return {
    activeTerms,
    score,
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
    bullets.push(`Completed ${joinEnglish(machineTaskParts)} to keep production equipment moving and reduce downtime.`);
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
    summaryLead: "with safety and site-monitoring experience",
    skillLead: "Skilled in",
    items: {
      "security": { summary: "supporting site safety and security", skill: "site security", bullet: "Supported site safety and security by staying alert, following procedures, and reporting concerns." },
      "patrols": { summary: "conducting patrols", skill: "patrols", bullet: "Conducted patrols or area checks to monitor activity, identify concerns, and support a safe environment." },
      "incident reports": { summary: "writing incident reports", skill: "incident reports", bullet: "Documented incidents, observations, or unusual activity through clear reports or required logs." },
      "access control": { summary: "checking access points, badges, or visitors", skill: "access control", bullet: "Controlled access by checking visitors, badges, entrances, or assigned security points." },
      "surveillance": { summary: "monitoring cameras or surveillance systems", skill: "surveillance", bullet: "Monitored cameras, surveillance systems, or assigned areas to identify and report security concerns." }
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

function titleForWording(selectedLabel, family) {
  const safe = text(selectedLabel).trim();
  if (safe && safe !== "General / Any Job") return safe;
  return FAMILY_WORDING_BLUEPRINTS[family]?.title || FAMILY_LABELS[family] || "Worker";
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

  const title = selectedLabel && selectedLabel !== "General / Any Job" ? selectedLabel : "Customer Service Representative";
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

  const title = selectedLabel && selectedLabel !== "General / Any Job" ? selectedLabel : "Truck Driver";
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
  const title = selectedLabel && selectedLabel !== "General / Any Job" ? selectedLabel : "Office Assistant";
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

  const title = titleForWording(selectedLabel, family);
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
  const { diagnosis, selected, selectedFamily, jobFamily, resumeFamily, keywordData, evidenceTerms, resumeText } = analysis;
  const proofNeeded = getProofNeeded(selectedFamily === "general" ? jobFamily.family : selectedFamily, keywordData.missing);
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
    return {
      summaryHeading: "Right Direction",
      bulletHeading: "Proof needed before rewrite",
      summary: `No ${selected.label}-specific rewrite generated. This resume does not prove enough direct ${jobFamilyLabel} experience yet. Missing proof includes ${joinEnglish(proofNeeded)}. Add those only if they are real.`,
      bullets: [
        `Do not add ${joinEnglish(proofNeeded.slice(0, 5))} unless you have actually done those duties or completed that training.`,
        closerRoles.length ? `This resume is currently stronger for ${joinEnglish(closerRoles.slice(0, 5))}.` : `This resume is currently stronger for ${resumeFamilyLabel} roles.`,
        `To become stronger for ${selected.label}, add real training, certification, clinical experience, or job duties that prove the missing requirements.`
      ]
    };
  }

  if (diagnosis.category === "transferable") {
    const closerRoles = RELATED_ROLES[resumeFamily.family] || [];
    return {
      summaryHeading: "Transferable Direction",
      bulletHeading: "Safe next steps",
      summary: `No full ${selected.label} rewrite generated. The resume shows stronger proof for ${resumeFamilyLabel}, while the job post is closer to ${jobFamilyLabel}.`,
      bullets: [
        evidenceTerms.length ? `Safe proof already shown: ${joinEnglish(evidenceTerms.slice(0, 5))}.` : `Direct proof for this job type is limited.`,
        proofNeeded.length ? `Do not add ${joinEnglish(proofNeeded.slice(0, 5))} unless it is true.` : "Do not add job-specific duties unless the resume proves them.",
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
  const output = buildOutput({ diagnosis, selected, selectedFamily, jobFamily, resumeFamily, keywordData, evidenceTerms, resumeText });
  const displayScore = diagnosis.category === "wrong_job_type" ? keywordData.score : keywordData.score;

  return {
    selected,
    selectedFamily,
    jobFamily,
    resumeFamily,
    keywordData,
    evidenceTerms,
    diagnosis,
    output,
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

function renderMissingKeywords(container, analysis) {
  if (!container) return;
  container.innerHTML = "";
  const summary = document.createElement("p");
  summary.textContent = `Smart match: ${analysis.keywordData.score}% weighted job-skill coverage. Generic words are ignored; only useful job skills are shown.`;
  summary.style.margin = "0 0 14px";
  summary.style.color = "#a7b0bf";
  summary.style.lineHeight = "1.45";
  container.appendChild(summary);

  renderKeywordGroup(container, "High Priority Missing", analysis.keywordData.criticalMissing, "Add these only if your real experience, training, or certification proves them.");
  renderKeywordGroup(container, "Helpful Keywords to Add", analysis.keywordData.helpfulMissing, "These can improve ATS wording when they are true.");
  renderKeywordGroup(container, "Soft / Supporting Details Missing", analysis.keywordData.softMissing, "These matter less than hard job duties and certifications.");
}

function renderMatchedKeywords(container, analysis) {
  if (!container) return;
  container.innerHTML = "";
  renderKeywordGroup(container, "Resume Proof Found", analysis.keywordData.exactMatched, "These job-post skills already appear in the resume or close wording.");
}

function buildRedFlags(resumeText, jobText, analysis) {
  const flags = [];
  if (analysis.diagnosis.category === "wrong_job_type") {
    flags.push(`<strong>Wrong job type selected:</strong> switch the dropdown before copying any wording.`);
  }
  if (analysis.diagnosis.category === "weak_evidence") {
    flags.push(`<strong>Weak evidence:</strong> this resume does not prove enough direct experience for this job-specific rewrite.`);
  }
  if (analysis.keywordData.criticalMissing.length) {
    flags.push(`<strong>High-priority gap:</strong> ${escapeHTML(joinEnglish(analysis.keywordData.criticalMissing.map(item => item.term).slice(0, 5)))} ${analysis.keywordData.criticalMissing.length === 1 ? "is" : "are"} missing. Add only if true.`);
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
  ["diagnosisOutput", "missingKeywords", "matchedKeywords", "redFlags", "summaryOutput", "bulletOutput"].forEach(id => {
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
