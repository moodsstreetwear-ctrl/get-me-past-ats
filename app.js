import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const stopWords = new Set([
  "the", "and", "for", "with", "you", "your", "are", "that", "this", "from", "will", "have", "has", "our",
  "job", "work", "team", "must", "able", "ability", "position", "company", "their", "they", "all", "can", "may",
  "within", "other", "such", "into", "about", "each", "when", "where", "what", "who", "why", "how", "been",
  "than", "then", "also", "any", "not", "but", "more", "less", "per", "hour", "week", "day", "shift", "required"
]);

const presetKeywords = {
  general: ["reliable", "communication", "teamwork", "safety", "quality", "training", "customer service", "problem solving", "attendance", "time management"],
  customer_service_representative: ["customer service", "communication", "problem solving", "phone etiquette", "customer support", "CRM", "documentation", "de-escalation", "active listening", "customer satisfaction"],
  data_entry_clerk: ["data entry", "typing", "accuracy", "attention to detail", "clerical", "records", "spreadsheets", "Microsoft Office", "documentation", "computer skills"],
  administrative_assistant: ["administrative assistant", "office support", "scheduling", "email", "phone calls", "filing", "data entry", "calendar", "records", "organization"],
  receptionist: ["receptionist", "front desk", "phone calls", "scheduling", "customer service", "greeting visitors", "appointments", "office support", "communication", "professionalism"],
  call_center_representative: ["call center", "phone support", "high call volume", "customer service", "typing", "CRM", "documentation", "problem solving", "communication", "de-escalation"],
  remote_customer_support_representative: ["remote", "customer support", "chat support", "email support", "phone support", "CRM", "typing", "documentation", "problem solving", "work from home"],
  office_assistant: ["office assistant", "office support", "filing", "data entry", "phone calls", "email", "records", "organization", "scheduling", "Microsoft Office"],
  sales_representative: ["sales", "customer service", "prospecting", "leads", "communication", "product knowledge", "upselling", "CRM", "follow up", "sales goals"],
  retail_associate: ["retail", "customer service", "cash handling", "POS", "inventory", "merchandising", "store operations", "teamwork", "product knowledge", "sales"],
  cashier: ["cashier", "cash handling", "POS", "customer service", "transactions", "accuracy", "checkout", "sales floor", "teamwork", "communication"],
  stocker: ["stocker", "stocking", "inventory", "merchandising", "lifting", "unloading", "shelves", "backroom", "organization", "teamwork"],
  warehouse_associate: ["warehouse", "picking", "packing", "shipping", "receiving", "inventory", "loading", "unloading", "pallet jack", "RF scanner", "order picking", "material handling"],
  package_handler: ["package handling", "loading", "unloading", "sorting", "scanning", "warehouse", "lifting", "fast-paced", "safety", "teamwork"],
  material_handler: ["material handling", "forklift", "pallet jack", "inventory", "shipping", "receiving", "loading", "unloading", "warehouse", "safety"],
  forklift_operator: ["forklift", "material handling", "pallets", "loading", "unloading", "warehouse", "inventory", "shipping", "receiving", "safety", "equipment inspection"],
  delivery_driver: ["delivery", "driver", "route", "safe driving", "customer service", "loading", "unloading", "navigation", "proof of delivery", "time management"],
  truck_driver: ["truck driver", "CDL", "DOT", "pre-trip", "post-trip", "safe driving", "logistics", "route planning", "hours of service", "equipment inspection"],
  machine_operator: ["machine operation", "equipment monitoring", "manufacturing", "production", "quality checks", "safety", "troubleshooting", "setup", "restarts", "material handling"],
  production_worker: ["production", "manufacturing", "assembly", "quality control", "fast-paced", "safety", "equipment", "teamwork", "production goals", "material handling"],
  assembly_worker: ["assembly", "production", "hand tools", "quality checks", "parts", "manufacturing", "instructions", "fast-paced", "safety", "teamwork"],
  maintenance_technician: ["maintenance", "troubleshooting", "repair", "preventive maintenance", "work orders", "hand tools", "power tools", "electrical", "plumbing", "equipment repair"],
  apartment_maintenance_technician: ["apartment maintenance", "property maintenance", "work orders", "HVAC", "plumbing", "electrical", "painting", "turnovers", "repairs", "customer service"],
  electrician: ["electrical", "wiring", "outlets", "switches", "conduit", "panels", "troubleshooting", "installation", "blueprints", "safety", "NEC"],
  welder: ["welding", "fabrication", "blueprint reading", "grinding", "cutting", "fitting", "measuring", "shop safety", "quality inspection", "MIG", "TIG"],
  diesel_mechanic: ["diesel", "mechanic", "diagnostics", "preventive maintenance", "troubleshooting", "repair", "brakes", "hydraulics", "inspection", "hand tools", "heavy equipment"],
  construction_laborer: ["construction", "laborer", "job site safety", "hand tools", "power tools", "measuring", "materials", "cleanup", "installation", "teamwork"],
  carpenter: ["carpentry", "framing", "doors", "trim", "millwork", "measuring", "cutting", "installation", "hand tools", "power tools", "blueprints"],
  security_officer: ["security", "patrol", "access control", "incident reports", "surveillance", "observation", "emergency response", "de-escalation", "professionalism", "customer service"],
  janitor: ["janitorial", "cleaning", "sanitation", "trash removal", "restrooms", "supplies", "floor care", "safety", "attention to detail", "custodial"],
  housekeeper: ["housekeeping", "cleaning", "sanitation", "rooms", "laundry", "guest service", "attention to detail", "supplies", "safety", "time management"],
  hotel_front_desk_agent: ["front desk", "hotel", "guest service", "reservations", "check-in", "check-out", "customer service", "problem solving", "phone calls", "professionalism"],
  server: ["server", "restaurant", "customer service", "orders", "POS", "food safety", "teamwork", "communication", "fast-paced", "guest service"],
  cook: ["cook", "food prep", "grill", "kitchen", "food safety", "sanitation", "recipes", "teamwork", "fast-paced", "inventory"],
  certified_nursing_assistant: ["CNA", "certified nursing assistant", "patient care", "vital signs", "ADLs", "infection control", "documentation", "compassion", "safety", "HIPAA"],
  medical_assistant: ["medical assistant", "patient care", "vital signs", "scheduling", "medical records", "HIPAA", "phlebotomy", "EKG", "documentation", "clinical support"],
  patient_care_technician: ["patient care technician", "patient care", "vital signs", "ADLs", "EKG", "phlebotomy", "documentation", "safety", "infection control", "HIPAA"],
  home_health_aide: ["home health aide", "caregiver", "patient care", "ADLs", "companionship", "safety", "documentation", "meal prep", "mobility assistance", "compassion"],
  phlebotomist: ["phlebotomy", "blood draw", "specimen collection", "patient care", "labeling", "HIPAA", "infection control", "documentation", "venipuncture", "safety"],
  pharmacy_technician: ["pharmacy technician", "prescriptions", "medication", "inventory", "customer service", "insurance", "HIPAA", "pharmacy software", "accuracy", "documentation"],
  dental_assistant: ["dental assistant", "patient care", "sterilization", "x-rays", "chairside assistance", "dental records", "infection control", "scheduling", "instruments", "HIPAA"],
  licensed_practical_nurse: ["LPN", "licensed practical nurse", "patient care", "medication administration", "vital signs", "documentation", "care plans", "HIPAA", "infection control", "teamwork"],
  registered_nurse: ["RN", "registered nurse", "patient assessment", "medication administration", "care plans", "documentation", "patient education", "HIPAA", "critical thinking", "teamwork"],
  medical_billing_specialist: ["medical billing", "claims", "insurance", "CPT", "ICD-10", "denials", "payment posting", "HIPAA", "documentation", "accounts receivable"],
  medical_coding_specialist: ["medical coding", "CPT", "ICD-10", "HCPCS", "claims", "documentation", "compliance", "HIPAA", "billing", "accuracy"],
  teacher_assistant: ["teacher assistant", "classroom support", "student supervision", "lesson support", "behavior support", "communication", "education", "organization", "child development", "teamwork"],
  substitute_teacher: ["substitute teacher", "classroom management", "lesson plans", "student supervision", "communication", "education", "flexibility", "behavior management", "attendance", "professionalism"],
  bookkeeper: ["bookkeeping", "accounts payable", "accounts receivable", "reconciliation", "invoices", "QuickBooks", "spreadsheets", "financial records", "data entry", "accuracy"],
  human_resources_assistant: ["human resources", "HR assistant", "onboarding", "employee records", "recruiting", "scheduling", "confidentiality", "data entry", "benefits", "communication"],
  it_help_desk_technician: ["IT help desk", "technical support", "troubleshooting", "tickets", "hardware", "software", "Windows", "password reset", "customer service", "documentation"],
  cybersecurity_analyst: ["cybersecurity", "security analyst", "network security", "incident response", "SIEM", "risk assessment", "vulnerability", "monitoring", "documentation", "access control"]
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
    "customer service",
    "problem solving",
    "phone etiquette",
    "customer support",
    "CRM",
    "de-escalation",
    "active listening",
    "customer satisfaction",
    "data entry",
    "attention to detail",
    "Microsoft Office",
    "computer skills",
    "administrative assistant",
    "office support",
    "phone calls",
    "front desk",
    "greeting visitors",
    "call center",
    "phone support",
    "high call volume",
    "chat support",
    "email support",
    "work from home",
    "office assistant",
    "product knowledge",
    "follow up",
    "sales goals",
    "cash handling",
    "POS",
    "store operations",
    "sales floor",
    "pallet jack",
    "RF scanner",
    "order picking",
    "material handling",
    "package handling",
    "fast-paced",
    "equipment inspection",
    "safe driving",
    "proof of delivery",
    "time management",
    "truck driver",
    "CDL",
    "DOT",
    "pre-trip",
    "post-trip",
    "route planning",
    "hours of service",
    "machine operation",
    "equipment monitoring",
    "quality checks",
    "quality control",
    "production goals",
    "hand tools",
    "preventive maintenance",
    "work orders",
    "power tools",
    "equipment repair",
    "apartment maintenance",
    "property maintenance",
    "HVAC",
    "NEC",
    "blueprint reading",
    "shop safety",
    "quality inspection",
    "MIG",
    "TIG",
    "heavy equipment",
    "job site safety",
    "access control",
    "incident reports",
    "emergency response",
    "trash removal",
    "floor care",
    "guest service",
    "check-in",
    "check-out",
    "food safety",
    "food prep",
    "CNA",
    "certified nursing assistant",
    "patient care",
    "vital signs",
    "infection control",
    "HIPAA",
    "medical assistant",
    "medical records",
    "EKG",
    "clinical support",
    "patient care technician",
    "home health aide",
    "meal prep",
    "mobility assistance",
    "blood draw",
    "specimen collection",
    "pharmacy technician",
    "pharmacy software",
    "dental assistant",
    "x-rays",
    "chairside assistance",
    "dental records",
    "LPN",
    "licensed practical nurse",
    "medication administration",
    "care plans",
    "RN",
    "registered nurse",
    "patient assessment",
    "patient education",
    "critical thinking",
    "medical billing",
    "CPT",
    "ICD-10",
    "payment posting",
    "accounts receivable",
    "medical coding",
    "HCPCS",
    "teacher assistant",
    "classroom support",
    "student supervision",
    "lesson support",
    "behavior support",
    "child development",
    "substitute teacher",
    "classroom management",
    "lesson plans",
    "behavior management",
    "accounts payable",
    "financial records",
    "human resources",
    "HR assistant",
    "employee records",
    "IT help desk",
    "technical support",
    "password reset",
    "security analyst",
    "network security",
    "incident response",
    "SIEM",
    "risk assessment"
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
    general: "Reliable candidate with hands-on work experience, strong attendance, teamwork, communication, safety awareness, and the ability to learn new tasks quickly.",
    manufacturing: "Reliable industrial and manufacturing worker with hands-on experience in machine operation, production support, equipment monitoring, safety procedures, and quality checks.",
    warehouse: "Warehouse and material handling candidate with experience supporting fast-paced operations, moving materials safely, using equipment, tracking inventory, and meeting daily goals.",
    maintenance: "Hands-on maintenance candidate with experience using tools, troubleshooting problems, supporting repairs, completing work orders, and keeping work areas safe.",
    apartment: "Apartment and property maintenance candidate with hands-on repair experience, customer service awareness, and the ability to support work orders, turnovers, grounds, and basic building repairs.",
    cdl: "CDL-A holder with a safety-focused background, hands-on industrial experience, and the ability to follow procedures, inspect equipment, and work reliably.",
    delivery: "Reliable delivery driver candidate with safe driving habits, route awareness, customer service skills, and experience handling materials, loading, unloading, and meeting time expectations.",
    construction: "Construction and carpentry candidate with hands-on experience using tools, supporting job site tasks, measuring, installing materials, and following safety expectations.",
    electrician: "Electrician helper and apprentice candidate with hands-on experience supporting wiring, outlets, switches, troubleshooting, installation work, tools, and job site safety.",
    welding: "Welding and fabrication candidate with hands-on shop experience, tool use, measuring, cutting, grinding, fitting, safety awareness, and attention to quality.",
    diesel: "Diesel mechanic and heavy equipment candidate with hands-on mechanical interest, troubleshooting ability, tool use, inspection mindset, and safety-focused repair support experience.",
    security: "Security officer candidate with reliability, observation skills, customer service ability, professionalism, safety awareness, and the ability to document incidents clearly.",
    remote: "Remote customer support candidate with communication skills, computer ability, typing, documentation, problem solving, and the discipline to work independently from home.",
    dataentry: "Data entry and clerical candidate with typing ability, attention to detail, computer skills, record keeping, accuracy, and the ability to follow office procedures.",
    customer_service: "Customer service candidate with communication skills, problem solving, patience, documentation ability, and experience helping people in fast-paced environments.",
    admin: "Administrative assistant and office support candidate with organization, scheduling, data entry, email, phone, records, and computer skills.",
    sales_retail: "Sales and retail candidate with customer service ability, teamwork, product knowledge, cash handling, inventory support, and strong communication.",
    food_service: "Food service candidate with fast-paced work experience, customer service ability, cleaning standards, teamwork, safety awareness, and willingness to learn restaurant operations.",
    hospitality: "Hospitality candidate with guest service ability, professionalism, communication skills, problem solving, attention to detail, and reliability in customer-facing environments.",
    healthcare_support: "Healthcare support candidate with reliability, compassion, safety awareness, documentation habits, teamwork, and the ability to support patient care procedures.",
    it_helpdesk: "Entry-level IT help desk candidate with troubleshooting ability, customer service skills, documentation habits, computer knowledge, and willingness to learn technical systems.",
    janitorial: "Janitorial and custodial candidate with cleaning experience, attention to detail, safety awareness, sanitation habits, reliability, and pride in maintaining professional spaces.",
    call_center: "Call center and dispatch candidate with phone communication, typing, documentation, customer service, scheduling, problem solving, and ability to handle high-volume work.",
    apprenticeship: "Motivated trade apprenticeship candidate with hands-on work experience, strong attendance, safety awareness, and willingness to learn a long-term skilled career.",
    rail: "Rail and industrial candidate with safety awareness, equipment inspection habits, material handling experience, production background, and strong team communication."
  }[jobType] || "Reliable candidate with hands-on work experience, strong attendance, teamwork, communication, safety awareness, and the ability to learn new tasks quickly.";

  return `${typeLine} Experienced working in fast-paced environments, following instructions, supporting production goals, and learning new equipment or processes. Key strengths for this role include ${strengths.length ? strengths.join(", ") : "safety, reliability, teamwork, and problem solving"}. Add honest proof for these job-post keywords if they apply: ${needs.length ? needs.join(", ") : "no major missing keywords found"}.`;
}

function buildBullets(jobType, analysis) {
  const missing = analysis.missing.slice(0, 8);
  const matched = analysis.matched.slice(0, 8);
  const base = {
    general: ["Worked in a team environment while following company procedures, safety rules, and daily expectations.", "Learned new tasks quickly and supported supervisors by staying reliable, organized, and ready to help where needed."],
    manufacturing: ["Operated and monitored manufacturing equipment in a fast-paced production environment while following safety and quality standards.", "Completed machine setup, cleaning, restarts, material handling, and basic troubleshooting to keep production moving.", "Performed quality checks and communicated issues early to reduce downtime and protect production flow."],
    warehouse: ["Moved, loaded, unloaded, picked, packed, and organized materials while following warehouse safety procedures.", "Used warehouse equipment and inventory processes to support shipping, receiving, order picking, and daily production goals.", "Maintained accuracy, speed, and attention to detail in a fast-paced warehouse environment."],
    maintenance: ["Assisted with repair, troubleshooting, installation, and preventive maintenance tasks using hand tools and power tools safely.", "Completed work order support by identifying issues, following instructions, and keeping work areas clean and safe.", "Supported basic electrical, mechanical, plumbing, and building repair tasks with attention to safety and quality."],
    apartment: ["Completed apartment maintenance support including work orders, turnovers, basic repairs, painting, grounds, and customer service.", "Assisted with electrical, plumbing, carpentry, HVAC, and preventive maintenance tasks while keeping units safe and clean.", "Communicated maintenance issues clearly and helped prepare apartments for resident move-ins."],
    cdl: ["Maintained a safety-first mindset while inspecting equipment, following procedures, and completing transportation work reliably.", "Used CDL-A training, TWIC credential, and hands-on industrial experience to support transportation and logistics needs.", "Followed instructions, documented issues, and communicated clearly to protect safety and delivery expectations."],
    delivery: ["Completed deliveries while following route instructions, safe driving habits, customer service expectations, and time deadlines.", "Loaded, unloaded, handled, and organized packages or materials while protecting accuracy and safety.", "Communicated with customers and supervisors to resolve route, delivery, and schedule issues."],
    construction: ["Supported construction and carpentry tasks using hand tools, power tools, measuring, installation, and job site cleanup.", "Assisted with doors, trim, framing, materials, and daily labor tasks while following safety procedures.", "Worked with crews to complete hands-on tasks in changing job site conditions."],
    electrician: ["Assisted electricians with wiring, outlets, switches, fixtures, troubleshooting, installation, and tool setup.", "Followed safety procedures while supporting residential or commercial electrical work under supervision.", "Learned trade tasks through hands-on repetition, clear communication, and attention to detail."],
    welding: ["Supported welding and fabrication work through measuring, cutting, grinding, fitting, setup, and shop cleanup.", "Followed safety and quality expectations while using tools and preparing materials for fabrication tasks.", "Read instructions, checked measurements, and inspected work to reduce mistakes and rework."],
    diesel: ["Assisted with mechanical inspections, preventive maintenance, troubleshooting, repair support, and tool preparation.", "Followed safety procedures while working around vehicles, equipment, parts, and shop tools.", "Documented issues clearly and supported technicians with diagnostics, cleaning, parts movement, and repair tasks."],
    security: ["Patrolled assigned areas, monitored activity, observed safety concerns, and documented incidents professionally.", "Provided customer service while enforcing site rules, access control procedures, and emergency response expectations.", "Maintained calm communication and professionalism during conflict, questions, or unusual activity."],
    remote: ["Provided remote customer support through chat, email, phone, documentation, and problem-solving steps.", "Used computer skills, typing, CRM-style tools, and clear communication to help customers and track issues.", "Worked independently while staying organized, responsive, and accurate in a work-from-home setting."],
    dataentry: ["Entered, reviewed, and organized data with accuracy, attention to detail, and consistent typing habits.", "Maintained records, spreadsheets, files, and documentation while following office procedures.", "Checked information for errors and communicated missing or unclear details before submission."],
    customer_service: ["Helped customers by listening, answering questions, solving problems, and documenting support details clearly.", "Used professional communication and patience to de-escalate issues and protect customer satisfaction.", "Worked in a fast-paced environment while staying organized, respectful, and focused on solutions."],
    admin: ["Supported office operations through scheduling, email, phone calls, filing, data entry, and record management.", "Used organization and communication skills to keep daily tasks, calendars, and documents accurate.", "Assisted teams and customers by following procedures, tracking information, and handling details professionally."],
    sales_retail: ["Provided customer service, product support, sales assistance, cash handling, and store operations support.", "Maintained inventory, merchandising, cleanliness, and teamwork in a customer-facing retail environment.", "Used communication and product knowledge to answer questions, recommend items, and support sales goals."],
    food_service: ["Supported food service operations through customer service, food prep, cleaning, sanitation, and teamwork.", "Worked in a fast-paced restaurant environment while following food safety, accuracy, and service standards.", "Handled orders, POS tasks, stocking, and cleaning while helping the team meet rush-hour demand."],
    hospitality: ["Provided guest service through check-in support, reservations, issue resolution, and professional communication.", "Supported hotel or hospitality operations by keeping areas clean, organized, and ready for guests.", "Handled guest questions and concerns with patience, accuracy, and attention to detail."],
    healthcare_support: ["Supported patient care tasks while following safety, documentation, infection control, and teamwork expectations.", "Provided compassionate assistance to patients, residents, or clients while respecting privacy and procedures.", "Communicated changes, needs, and concerns clearly to supervisors or healthcare team members."],
    it_helpdesk: ["Provided technical support by troubleshooting user issues, documenting tickets, and following step-by-step procedures.", "Helped resolve hardware, software, login, password, and basic network problems with clear communication.", "Used customer service skills and technical learning ability to support users remotely or in person."],
    janitorial: ["Cleaned, sanitized, stocked, and maintained assigned areas while following safety and quality standards.", "Completed floor care, trash removal, restroom cleaning, and housekeeping tasks with attention to detail.", "Kept work areas organized and communicated supply or maintenance issues when needed."],
    call_center: ["Handled calls, messages, scheduling, dispatch, documentation, and customer questions in a high-volume environment.", "Used phone etiquette, typing, CRM-style tools, and clear communication to track and resolve issues.", "Remained calm and organized while helping customers, drivers, technicians, or internal teams."],
    apprenticeship: ["Showed strong willingness to learn by taking on hands-on tasks, following training, and improving through repetition.", "Built real work experience in fast-paced environments requiring reliability, attendance, safety, and teamwork.", "Supported daily operations by staying flexible, learning new responsibilities, and helping the team meet goals."],
    rail: ["Supported rail or industrial operations with safety awareness, equipment checks, material handling, and team communication.", "Followed procedures around railcars, yard activity, machinery, and production tasks to protect safety and efficiency.", "Communicated hazards, issues, and work progress clearly in a fast-paced industrial environment."]
  }[jobType] || [
    "Worked in a team environment while following company procedures, safety rules, and daily expectations.",
    "Learned new tasks quickly and supported supervisors by staying reliable, organized, and ready to help where needed.",
    "Used communication, attention to detail, and problem-solving to support daily work goals."
  ];

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

let auth = null;
let db = null;
let currentUser = null;
let cloudItems = [];
let unsubscribeTracker = null;
let authMode = "create";

function hasFirebaseConfig(config) {
  return Boolean(
    config &&
    config.apiKey &&
    config.projectId &&
    !String(config.apiKey).includes("PASTE_") &&
    !String(config.projectId).includes("PASTE_")
  );
}

const firebaseEnabled = hasFirebaseConfig(firebaseConfig);

if (firebaseEnabled) {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
  }
}

function getCurrentUser() {
  if (firebaseEnabled && currentUser) {
    return {
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
      email: currentUser.email
    };
  }

  try {
    return JSON.parse(localStorage.getItem("gmpt_current_user") || "null");
  } catch (error) {
    localStorage.removeItem("gmpt_current_user");
    return null;
  }
}

function cleanEmail(email) {
  return normalize(email || "guest").replace(/\s+/g, "_");
}

function getTrackerKey() {
  const user = getCurrentUser();
  return user?.email ? `gmpt_tracker_${cleanEmail(user.email)}` : "gmpt_tracker_guest";
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadTracker() {
  if (firebaseEnabled && db && currentUser) return cloudItems;

  try {
    return JSON.parse(localStorage.getItem(getTrackerKey()) || "[]");
  } catch (error) {
    return [];
  }
}

function saveTracker(items) {
  localStorage.setItem(getTrackerKey(), JSON.stringify(items));
}

function setAuthMessage(message = "", type = "") {
  const authMessage = document.getElementById("authMessage");
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`.trim();
}

function setAuthMode(mode) {
  authMode = mode === "signin" ? "signin" : "create";

  const createBtn = document.getElementById("createModeBtn");
  const signInBtn = document.getElementById("signInModeBtn");
  const title = document.getElementById("authTitle");
  const help = document.getElementById("authHelp");
  const nameField = document.getElementById("nameField");
  const nameInput = document.getElementById("userName");
  const passwordInput = document.getElementById("userPassword");
  const submitBtn = document.getElementById("accountSubmitBtn");
  const resetBtn = document.getElementById("passwordResetBtn");

  createBtn?.classList.toggle("active", authMode === "create");
  signInBtn?.classList.toggle("active", authMode === "signin");

  if (authMode === "create") {
    title.textContent = "Create your account";
    help.textContent = "New here? Start with Create account. Use Sign in only after the account already exists.";
    submitBtn.textContent = "Create Account";
    nameField.hidden = false;
    nameInput.required = true;
    passwordInput.autocomplete = "new-password";
    resetBtn.hidden = true;
  } else {
    title.textContent = "Welcome back";
    help.textContent = "Already made an account? Sign in with the same email and password.";
    submitBtn.textContent = "Sign In";
    nameField.hidden = true;
    nameInput.required = false;
    passwordInput.autocomplete = "current-password";
    resetBtn.hidden = false;
  }

  setAuthMessage("");
}

function formatAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "That email/password did not work. If this is your first time, tap Create account first.";
  }
  if (code.includes("user-not-found")) return "No account found with that email. Tap Create account first.";
  if (code.includes("email-already-in-use")) return "That email already has an account. Switch to Sign in instead.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("operation-not-allowed")) return "Email/password is not enabled in Firebase Authentication yet.";
  return error?.message || "Something went wrong. Try again.";
}

async function handleAccountSubmit(event) {
  event.preventDefault();
  if (authMode === "create") {
    await createAccount();
  } else {
    await signIn();
  }
}

function renderAccount() {
  const user = getCurrentUser();
  const navUser = document.getElementById("navUser");
  const accountStatus = document.getElementById("accountStatus");
  const accountNote = document.getElementById("accountNote");
  const trackerNote = document.getElementById("trackerNote");
  const signOutBtn = document.getElementById("signOutBtn");
  const accountForm = document.getElementById("accountForm");

  if (!firebaseEnabled || !auth || !db) {
    navUser.textContent = "Local mode";
    accountStatus.textContent = "Firebase not connected yet";
    accountNote.textContent = "The app still works locally. Add your Firebase config to firebase-config.js to turn on real cloud accounts.";
    trackerNote.textContent = "Local tracker mode: saved applications stay on this browser until Firebase is connected.";
    signOutBtn.hidden = true;
    return;
  }

  if (user) {
    navUser.textContent = `Signed in: ${user.name}`;
    accountStatus.textContent = `${user.name}`;
    accountNote.textContent = `${user.email} — applications are saved to your Firebase cloud database.`;
    trackerNote.textContent = `Tracking applications for ${user.name}. Data syncs with Firebase.`;
    signOutBtn.hidden = false;
    accountForm.reset();
  } else {
    navUser.textContent = "Not signed in";
    accountStatus.textContent = "No user signed in";
    accountNote.textContent = "Create an account or sign in to save your tracker in Firebase.";
    trackerNote.textContent = "Sign in above to save applications to the cloud. You can still analyze resumes without signing in.";
    signOutBtn.hidden = true;
  }
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
      <td>${escapeHTML(item.date)}</td>
      <td>${escapeHTML(item.company)}</td>
      <td>${escapeHTML(item.role)}</td>
      <td>${escapeHTML(item.pay || "—")}</td>
      <td>${escapeHTML(item.status)}</td>
      <td><button class="delete-row" data-index="${index}" data-id="${escapeHTML(item.id || "")}">Delete</button></td>
    `;
    rows.appendChild(row);
  });
}

async function signIn() {
  setAuthMessage("Signing in...", "");

  if (!firebaseEnabled || !auth || !db) {
    const name = document.getElementById("userName").value.trim() || "Local User";
    const email = document.getElementById("userEmail").value.trim().toLowerCase();

    if (!email) {
      setAuthMessage("Enter your email.", "error");
      return;
    }

    localStorage.setItem("gmpt_current_user", JSON.stringify({
      name,
      email,
      signedInAt: new Date().toISOString()
    }));

    document.getElementById("accountForm").reset();
    setAuthMessage("Signed in locally on this browser.", "success");
    renderAccount();
    renderTracker();
    return;
  }

  const email = document.getElementById("userEmail").value.trim().toLowerCase();
  const password = document.getElementById("userPassword").value;

  if (!email || !password) {
    setAuthMessage("Enter your email and password.", "error");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setAuthMessage("Signed in successfully.", "success");
  } catch (error) {
    setAuthMessage(formatAuthError(error), "error");
  }
}

async function createAccount() {
  setAuthMessage("Creating account...", "");

  if (!firebaseEnabled || !auth || !db) {
    setAuthMessage("Firebase is not connected yet. Upload firebase-config.js and enable Authentication first.", "error");
    return;
  }

  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim().toLowerCase();
  const password = document.getElementById("userPassword").value;

  if (!name || !email || !password) {
    setAuthMessage("Enter your name, email, and password to create an account.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.", "error");
    return;
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    currentUser = credential.user;
    setAuthMessage("Account created. Your tracker will save to the cloud.", "success");
    renderAccount();
  } catch (error) {
    setAuthMessage(formatAuthError(error), "error");
  }
}

async function resetPassword() {
  if (!firebaseEnabled || !auth) {
    setAuthMessage("Firebase is not connected yet.", "error");
    return;
  }

  const email = document.getElementById("userEmail").value.trim().toLowerCase();
  if (!email) {
    setAuthMessage("Enter your email first, then tap Forgot password.", "error");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    setAuthMessage("Password reset email sent. Check your inbox and spam folder.", "success");
  } catch (error) {
    setAuthMessage(formatAuthError(error), "error");
  }
}

async function signOut() {
  if (firebaseEnabled && auth) {
    await firebaseSignOut(auth);
    return;
  }

  localStorage.removeItem("gmpt_current_user");
  renderAccount();
  renderTracker();
}

function exportTrackerCSV() {
  const items = loadTracker();
  if (!items.length) {
    alert("No applications to export yet.");
    return;
  }

  const headers = ["Date", "Company", "Role", "Pay", "Status"];
  const rows = items.map(item => [item.date, item.company, item.role, item.pay || "", item.status]);
  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const user = getCurrentUser();
  link.href = url;
  link.download = `${user?.name ? cleanEmail(user.name) : "guest"}-job-tracker.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function clearTracker() {
  const items = loadTracker();
  if (!items.length) return;
  const user = getCurrentUser();
  const label = user ? `${user.name}'s tracker` : "the guest tracker";
  if (!confirm(`Clear ${label}? This cannot be undone.`)) return;

  if (firebaseEnabled && db && currentUser) {
    const snapshot = await getDocs(collection(db, "users", currentUser.uid, "applications"));
    const batch = writeBatch(db);
    snapshot.forEach(documentSnapshot => batch.delete(documentSnapshot.ref));
    await batch.commit();
    return;
  }

  saveTracker([]);
  renderTracker();
}

function watchCloudTracker() {
  if (unsubscribeTracker) {
    unsubscribeTracker();
    unsubscribeTracker = null;
  }

  cloudItems = [];

  if (!firebaseEnabled || !db || !currentUser) {
    renderTracker();
    return;
  }

  const trackerQuery = query(
    collection(db, "users", currentUser.uid, "applications"),
    orderBy("createdAt", "desc")
  );

  unsubscribeTracker = onSnapshot(trackerQuery, snapshot => {
    cloudItems = snapshot.docs.map(documentSnapshot => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }));
    renderTracker();
  }, error => {
    console.error(error);
    alert("Could not load cloud tracker. Check Firestore rules and setup.");
  });
}

async function addApplication(event) {
  event.preventDefault();

  const item = {
    date: new Date().toLocaleDateString(),
    company: document.getElementById("company").value.trim(),
    role: document.getElementById("role").value.trim(),
    pay: document.getElementById("pay").value.trim(),
    status: document.getElementById("status").value
  };

  if (firebaseEnabled && db) {
    if (!currentUser) {
      alert("Sign in first to save applications to Firebase.");
      return;
    }

    await addDoc(collection(db, "users", currentUser.uid, "applications"), {
      ...item,
      createdAt: serverTimestamp()
    });
    event.target.reset();
    return;
  }

  const items = loadTracker();
  items.unshift(item);
  saveTracker(items);
  event.target.reset();
  renderTracker();
}

async function deleteApplication(event) {
  if (!event.target.matches(".delete-row")) return;

  if (firebaseEnabled && db && currentUser) {
    const id = event.target.dataset.id;
    if (!id) return;
    await deleteDoc(doc(db, "users", currentUser.uid, "applications", id));
    return;
  }

  const items = loadTracker();
  items.splice(Number(event.target.dataset.index), 1);
  saveTracker(items);
  renderTracker();
}

function initAuthListener() {
  if (!firebaseEnabled || !auth) {
    renderAccount();
    renderTracker();
    return;
  }

  onAuthStateChanged(auth, user => {
    currentUser = user;
    renderAccount();
    watchCloudTracker();
  });
}

function init() {
  document.getElementById("analyzeBtn").addEventListener("click", analyzeAndRender);

  document.getElementById("loadDemo").addEventListener("click", () => {
    document.getElementById("resumeText").value = demoResume;
    document.getElementById("jobText").value = demoJob;
    document.getElementById("jobType").value = "machine_operator";
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

  document.getElementById("accountForm").addEventListener("submit", handleAccountSubmit);
  document.getElementById("createModeBtn").addEventListener("click", () => setAuthMode("create"));
  document.getElementById("signInModeBtn").addEventListener("click", () => setAuthMode("signin"));
  document.getElementById("passwordResetBtn").addEventListener("click", resetPassword);
  document.getElementById("togglePasswordBtn").addEventListener("click", () => {
    const input = document.getElementById("userPassword");
    const button = document.getElementById("togglePasswordBtn");
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
  });
  setAuthMode("create");
  document.getElementById("signOutBtn").addEventListener("click", signOut);
  document.getElementById("exportTrackerBtn").addEventListener("click", exportTrackerCSV);
  document.getElementById("clearTrackerBtn").addEventListener("click", clearTracker);
  document.getElementById("trackerForm").addEventListener("submit", addApplication);
  document.getElementById("trackerRows").addEventListener("click", deleteApplication);

  initAuthListener();
}

document.addEventListener("DOMContentLoaded", init);
