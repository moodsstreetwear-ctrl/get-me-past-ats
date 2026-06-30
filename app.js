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
  "job", "jobs", "work", "worker", "team", "must", "able", "ability", "position", "company", "their", "they",
  "all", "can", "may", "within", "other", "such", "into", "about", "each", "when", "where", "what", "who", "why",
  "how", "been", "than", "then", "also", "any", "not", "but", "more", "less", "per", "hour", "week", "day",
  "shift", "required", "preferred", "responsibilities", "requirements", "duties", "skills", "experience", "years", "year",
  "candidate", "applicant", "role", "include", "including", "perform", "maintain", "using", "use", "needed", "needs",
  "good", "great", "strong", "high", "low", "new", "current", "full", "part", "time", "plus", "etc", "etc."
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

const relatedKeywordMap = {
  "material handling": ["moved materials", "move materials", "handled materials", "materials", "loading", "unloading", "pallets", "forklift", "pallet jack"],
  "machine operation": ["machine operator", "operated machines", "operated equipment", "equipment operation", "production equipment", "equipment monitoring"],
  "equipment monitoring": ["monitored equipment", "monitored machines", "machine operation", "checked equipment", "equipment checks"],
  "quality checks": ["quality control", "quality inspection", "inspected", "inspection", "checked quality", "defects"],
  "quality control": ["quality checks", "quality inspection", "inspected", "inspection", "checked quality"],
  "fast-paced": ["fast paced", "high volume", "production flow", "rush", "busy environment"],
  "troubleshooting": ["diagnostics", "diagnosed", "problem solving", "resolved issues", "repair", "restarts", "fixed", "identify issues"],
  "setup": ["set up", "changeover", "changeovers", "machine setup", "prepared equipment"],
  "restarts": ["restart", "reset", "resets", "machine reset", "started equipment"],
  "preventive maintenance": ["PM", "PMs", "maintenance", "inspections", "equipment checks", "routine maintenance"],
  "work orders": ["tickets", "maintenance requests", "repair requests", "service requests"],
  "hand tools": ["tools", "power tools", "tool use", "wrenches", "drills"],
  "power tools": ["tools", "hand tools", "drills", "saws", "impact"],
  "electrical": ["wiring", "outlets", "switches", "panels", "fixtures", "ceiling fans", "electrical troubleshooting"],
  "plumbing": ["pipes", "leaks", "faucets", "toilets", "drains"],
  "HVAC": ["heating", "air conditioning", "air conditioner", "filters", "thermostat", "duct"],
  "apartment maintenance": ["property maintenance", "work orders", "turnovers", "repairs", "painting", "plumbing", "electrical"],
  "property maintenance": ["apartment maintenance", "turnovers", "work orders", "repairs", "grounds"],
  "customer service": ["customer support", "guest service", "helped customers", "answered questions", "client support", "de-escalation"],
  "customer support": ["customer service", "phone support", "chat support", "email support", "helped customers"],
  "communication": ["communicated", "documentation", "reported", "explained", "phone calls", "email"],
  "documentation": ["documented", "records", "reports", "logs", "notes", "paperwork"],
  "data entry": ["entered data", "typing", "records", "spreadsheets", "clerical", "documentation"],
  "attention to detail": ["accuracy", "detail", "checked", "verified", "inspection", "quality"],
  "Microsoft Office": ["Word", "Excel", "PowerPoint", "Outlook", "spreadsheets", "office software"],
  "CRM": ["customer database", "ticketing system", "support software", "salesforce", "zendesk"],
  "phone etiquette": ["phone calls", "call center", "phone support", "answered phones"],
  "de-escalation": ["calm", "conflict", "resolved issues", "customer complaints", "professional communication"],
  "cash handling": ["cashier", "transactions", "register", "POS", "payments"],
  "POS": ["register", "cashier", "transactions", "checkout", "point of sale"],
  "inventory": ["stock", "stocking", "counted", "cycle counts", "materials", "supplies"],
  "merchandising": ["stocking", "shelves", "displays", "sales floor"],
  "shipping": ["shipped", "outbound", "shipments", "shipping and receiving", "packing"],
  "receiving": ["received", "inbound", "shipments", "shipping and receiving", "unloading"],
  "order picking": ["picking", "picked orders", "pulling orders", "picking orders"],
  "RF scanner": ["scanner", "scanning", "scanned", "handheld scanner", "barcode"],
  "pallet jack": ["pallets", "material handling", "warehouse equipment"],
  "forklift": ["fork lift", "forklift operator", "material handling", "pallets"],
  "loading": ["loaded", "load", "unloading", "materials", "trucks"],
  "unloading": ["unloaded", "unload", "loading", "materials", "trucks"],
  "safe driving": ["clean driving", "driving safety", "DOT", "pre-trip", "defensive driving"],
  "route": ["routes", "navigation", "GPS", "deliveries", "route planning"],
  "proof of delivery": ["POD", "delivery confirmation", "signature", "delivered"],
  "CDL": ["CDL-A", "commercial driver", "truck driver"],
  "DOT": ["department of transportation", "pre-trip", "post-trip", "hours of service"],
  "pre-trip": ["pre trip", "equipment inspection", "vehicle inspection"],
  "post-trip": ["post trip", "vehicle inspection", "equipment inspection"],
  "hours of service": ["HOS", "logs", "logbook", "ELD"],
  "welding": ["welder", "fabrication", "MIG", "TIG", "grinding", "cutting"],
  "fabrication": ["welding", "cutting", "grinding", "fitting", "measuring"],
  "blueprint reading": ["blueprints", "drawings", "schematics", "measurements"],
  "diesel": ["diesel mechanic", "heavy equipment", "trucks", "engines"],
  "diagnostics": ["troubleshooting", "diagnosed", "inspection", "testing"],
  "security": ["patrol", "access control", "surveillance", "incident reports", "observation"],
  "access control": ["checked IDs", "entry control", "secured entrances", "visitor logs"],
  "incident reports": ["reports", "documented incidents", "logs", "security reports"],
  "cleaning": ["cleaned", "sanitation", "custodial", "housekeeping", "janitorial"],
  "sanitation": ["cleaning", "sanitized", "restrooms", "food safety"],
  "guest service": ["customer service", "front desk", "hospitality", "helped guests"],
  "food safety": ["sanitation", "kitchen safety", "safe food handling", "cleaning"],
  "patient care": ["caregiver", "ADLs", "vital signs", "compassion", "resident care"],
  "vital signs": ["blood pressure", "pulse", "temperature", "patient care"],
  "ADLs": ["activities of daily living", "bathing", "dressing", "mobility assistance", "patient care"],
  "HIPAA": ["patient privacy", "confidentiality", "medical records"],
  "infection control": ["sanitation", "PPE", "sterilization", "cleaning", "safety"],
  "phlebotomy": ["blood draw", "venipuncture", "specimen collection"],
  "medical records": ["records", "documentation", "HIPAA", "patient charts"],
  "technical support": ["IT help desk", "troubleshooting", "tickets", "password reset", "hardware", "software"],
  "IT help desk": ["technical support", "tickets", "troubleshooting", "hardware", "software"],
  "tickets": ["ticketing system", "support requests", "work orders", "documentation"],
  "cybersecurity": ["security analyst", "network security", "incident response", "vulnerability", "access control"],
  "network security": ["cybersecurity", "monitoring", "incident response", "risk assessment"],
  "incident response": ["security incidents", "monitoring", "cybersecurity", "reports"]
};



Object.assign(relatedKeywordMap, {
  "safety procedures": ["safety", "PPE", "followed procedures", "safe work", "safety rules", "workplace safety"],
  "teamwork": ["team environment", "crew", "coworkers", "worked with team", "helped team"],
  "attendance": ["reliable", "dependable", "punctual", "showed up", "stable work history"],
  "strong attendance": ["attendance", "reliable", "dependable", "punctual", "stable work history"],
  "time management": ["deadlines", "on time", "routes", "schedule", "prioritized"],
  "organization": ["organized", "records", "filing", "inventory", "tracking"],
  "scheduling": ["appointments", "calendar", "coordinated", "planned"],
  "calendar": ["scheduling", "appointments", "coordinated"],
  "records": ["documentation", "files", "data entry", "logs", "paperwork"],
  "filing": ["records", "documents", "paperwork", "office support"],
  "confidentiality": ["private", "privacy", "HIPAA", "sensitive information"],
  "active listening": ["listened", "customer questions", "answered questions", "customer concerns"],
  "customer satisfaction": ["happy customers", "resolved complaints", "customer service", "customer support"],
  "phone support": ["phone calls", "answered phones", "call center", "customer calls"],
  "chat support": ["messages", "online support", "customer support", "email support"],
  "email support": ["email", "messages", "customer support", "documentation"],
  "work from home": ["remote", "independent", "computer", "home office"],
  "typing": ["data entry", "keyboard", "entered data", "computer skills"],
  "accuracy": ["attention to detail", "verified", "checked", "quality", "error-free"],
  "spreadsheets": ["Excel", "Microsoft Office", "data entry", "records"],
  "sales goals": ["sales", "quota", "upselling", "revenue", "targets"],
  "upselling": ["sales", "recommended products", "product knowledge"],
  "product knowledge": ["sales", "customer questions", "recommended products"],
  "cashier": ["register", "cash handling", "POS", "transactions"],
  "transactions": ["cash handling", "payments", "register", "POS"],
  "merchandising": ["stocking", "displays", "shelves", "sales floor"],
  "stocking": ["stock", "inventory", "shelves", "merchandising"],
  "warehouse": ["shipping", "receiving", "loading", "unloading", "inventory", "materials"],
  "picking": ["order picking", "picked orders", "pulling orders", "selected items"],
  "packing": ["packaged", "shipping", "orders", "boxes"],
  "shipping and receiving": ["shipping", "receiving", "loaded", "unloaded", "shipments"],
  "production": ["manufacturing", "production line", "machine operation", "assembly"],
  "manufacturing": ["production", "machine operation", "assembly", "industrial"],
  "assembly": ["assembled", "production", "parts", "hand tools"],
  "production goals": ["production rate", "quota", "output", "daily goals"],
  "equipment": ["machines", "tools", "equipment monitoring", "machine operation"],
  "changeovers": ["setup", "changed over", "machine setup", "prepared equipment"],
  "repair": ["repairs", "fixed", "troubleshooting", "maintenance"],
  "repairs": ["repair", "fixed", "troubleshooting", "maintenance"],
  "installation": ["installed", "setup", "mounted", "built"],
  "turnovers": ["make-ready", "unit turns", "apartment turns", "prepared apartments"],
  "painting": ["painted", "turnovers", "property maintenance", "repairs"],
  "grounds": ["property maintenance", "cleanup", "outside areas", "groundskeeping"],
  "wiring": ["electrical", "outlets", "switches", "fixtures", "panels"],
  "outlets": ["electrical", "wiring", "receptacles", "switches"],
  "switches": ["electrical", "wiring", "outlets", "fixtures"],
  "conduit": ["electrical", "wiring", "installation"],
  "panels": ["electrical", "breakers", "wiring"],
  "NEC": ["electrical code", "code", "electrical safety"],
  "MIG": ["welding", "welder", "fabrication"],
  "TIG": ["welding", "welder", "fabrication"],
  "grinding": ["welding", "fabrication", "cutting", "shop tools"],
  "cutting": ["welding", "fabrication", "grinding"],
  "fitting": ["fabrication", "welding", "measuring"],
  "brakes": ["diesel", "mechanic", "repair", "inspection"],
  "hydraulics": ["diesel", "mechanic", "heavy equipment", "repair"],
  "inspection": ["inspected", "checked", "quality", "safety", "diagnostics"],
  "heavy equipment": ["diesel", "mechanic", "equipment", "trucks"],
  "patrol": ["walked assigned areas", "security", "monitored", "observation"],
  "surveillance": ["cameras", "monitored", "security", "observation"],
  "observation": ["monitored", "watched", "patrol", "security"],
  "emergency response": ["emergency", "incident", "security", "safety"],
  "professionalism": ["professional", "respectful", "customer service", "communication"],
  "janitorial": ["cleaning", "custodial", "sanitation", "trash removal"],
  "custodial": ["janitorial", "cleaning", "sanitation"],
  "trash removal": ["trash", "cleaning", "janitorial", "custodial"],
  "floor care": ["floors", "mopping", "sweeping", "cleaning"],
  "restrooms": ["bathrooms", "cleaning", "sanitation", "supplies"],
  "housekeeping": ["cleaning", "rooms", "laundry", "guest service"],
  "rooms": ["housekeeping", "hotel", "cleaning", "guest service"],
  "laundry": ["housekeeping", "cleaning", "rooms"],
  "front desk": ["receptionist", "guest service", "check-in", "phone calls"],
  "reservations": ["booking", "front desk", "hotel", "guest service"],
  "check-in": ["check in", "front desk", "guest service", "hotel"],
  "check-out": ["check out", "front desk", "guest service", "hotel"],
  "server": ["restaurant", "orders", "guest service", "POS"],
  "orders": ["server", "restaurant", "POS", "customer service"],
  "food prep": ["prep", "kitchen", "cook", "recipes"],
  "kitchen": ["cook", "food prep", "restaurant", "sanitation"],
  "recipes": ["cook", "food prep", "kitchen"],
  "CNA": ["certified nursing assistant", "patient care", "ADLs", "vital signs"],
  "certified nursing assistant": ["CNA", "patient care", "ADLs", "vital signs"],
  "compassion": ["patient care", "caregiver", "resident care", "helped patients"],
  "caregiver": ["patient care", "home health aide", "ADLs", "companionship"],
  "companionship": ["caregiver", "home health aide", "patient care"],
  "meal prep": ["prepared meals", "home health aide", "caregiver"],
  "mobility assistance": ["walking assistance", "transfers", "ADLs", "patient care"],
  "EKG": ["electrocardiogram", "patient care", "medical assistant"],
  "clinical support": ["medical assistant", "patient care", "vital signs", "documentation"],
  "specimen collection": ["blood draw", "phlebotomy", "samples", "labeling"],
  "venipuncture": ["blood draw", "phlebotomy", "specimen collection"],
  "prescriptions": ["pharmacy technician", "medication", "pharmacy"],
  "medication": ["prescriptions", "pharmacy technician", "medication administration"],
  "pharmacy software": ["pharmacy technician", "computer", "prescriptions"],
  "sterilization": ["infection control", "dental assistant", "sanitation"],
  "x-rays": ["dental assistant", "radiographs", "patient care"],
  "chairside assistance": ["dental assistant", "patient care", "instruments"],
  "instruments": ["dental assistant", "sterilization", "chairside assistance"],
  "medication administration": ["medication", "LPN", "RN", "patient care"],
  "care plans": ["patient care", "nursing", "documentation"],
  "patient assessment": ["nursing", "RN", "vital signs", "patient care"],
  "claims": ["medical billing", "insurance", "CPT", "ICD-10"],
  "denials": ["medical billing", "claims", "insurance"],
  "CPT": ["medical coding", "medical billing", "claims"],
  "ICD-10": ["medical coding", "medical billing", "claims"],
  "HCPCS": ["medical coding", "claims", "billing"],
  "classroom support": ["teacher assistant", "students", "lesson support"],
  "student supervision": ["students", "classroom", "supervised children"],
  "lesson support": ["lesson plans", "teacher assistant", "classroom support"],
  "behavior support": ["behavior management", "students", "classroom management"],
  "classroom management": ["students", "behavior management", "substitute teacher"],
  "accounts payable": ["AP", "invoices", "bookkeeping"],
  "accounts receivable": ["AR", "invoices", "bookkeeping"],
  "reconciliation": ["balanced", "bookkeeping", "accounts"],
  "QuickBooks": ["bookkeeping software", "accounting software", "bookkeeping"],
  "human resources": ["HR", "recruiting", "onboarding", "employee records"],
  "HR assistant": ["human resources", "onboarding", "employee records"],
  "onboarding": ["new hires", "orientation", "HR", "employee records"],
  "recruiting": ["hiring", "candidates", "interviews", "HR"],
  "employee records": ["HR", "records", "confidentiality"],
  "hardware": ["computer hardware", "devices", "technical support"],
  "software": ["applications", "programs", "technical support"],
  "Windows": ["Microsoft Windows", "PC", "computer", "technical support"],
  "password reset": ["login help", "account access", "technical support"],
  "security analyst": ["cybersecurity", "network security", "incident response", "monitoring"],
  "SIEM": ["security monitoring", "logs", "security analyst"],
  "risk assessment": ["risk", "security", "vulnerability", "cybersecurity"],
  "vulnerability": ["vulnerabilities", "security risk", "cybersecurity", "scanning"],
  "monitoring": ["monitored", "security monitoring", "surveillance", "logs"]
});

const familyKeywordRules = {
  general: {
    high: ["reliable", "communication", "teamwork", "safety", "training"],
    medium: ["problem solving", "attendance", "time management", "documentation"],
    soft: ["professionalism", "organization"]
  },
  warehouse: {
    high: ["warehouse", "material handling", "forklift", "pallet jack", "RF scanner", "order picking", "shipping", "receiving", "inventory", "loading", "unloading", "safety"],
    medium: ["picking", "packing", "scanning", "equipment inspection", "fast-paced", "accuracy", "teamwork"],
    soft: ["attendance", "communication", "time management"]
  },
  manufacturing: {
    high: ["machine operation", "equipment monitoring", "manufacturing", "production", "quality checks", "quality control", "safety", "troubleshooting", "setup", "restarts"],
    medium: ["material handling", "production flow", "changeovers", "fast-paced", "equipment", "12-hour shifts", "rotating shifts"],
    soft: ["teamwork", "attendance", "communication"]
  },
  customer_service: {
    high: ["customer service", "customer support", "communication", "problem solving", "documentation", "de-escalation", "active listening"],
    medium: ["phone etiquette", "customer satisfaction", "CRM", "phone support", "email support"],
    soft: ["professionalism", "patience", "teamwork"]
  },
  call_center: {
    high: ["call center", "phone support", "customer service", "typing", "documentation", "problem solving", "de-escalation"],
    medium: ["high call volume", "CRM", "phone etiquette", "scheduling", "active listening"],
    soft: ["communication", "patience", "professionalism"]
  },
  remote: {
    high: ["remote", "customer support", "chat support", "email support", "phone support", "CRM", "typing", "documentation"],
    medium: ["problem solving", "work from home", "computer skills", "time management"],
    soft: ["communication", "organization", "professionalism"]
  },
  dataentry: {
    high: ["data entry", "typing", "accuracy", "attention to detail", "records", "spreadsheets", "computer skills"],
    medium: ["Microsoft Office", "documentation", "clerical", "filing", "organization"],
    soft: ["confidentiality", "time management"]
  },
  admin: {
    high: ["administrative assistant", "office support", "scheduling", "email", "phone calls", "filing", "data entry", "records"],
    medium: ["calendar", "organization", "Microsoft Office", "confidentiality", "customer service"],
    soft: ["communication", "professionalism", "attention to detail"]
  },
  sales_retail: {
    high: ["customer service", "sales", "cash handling", "POS", "inventory", "merchandising", "product knowledge"],
    medium: ["transactions", "store operations", "sales floor", "upselling", "sales goals"],
    soft: ["communication", "teamwork", "professionalism"]
  },
  delivery: {
    high: ["delivery", "driver", "route", "safe driving", "customer service", "loading", "unloading", "proof of delivery"],
    medium: ["navigation", "time management", "route planning", "equipment inspection", "communication"],
    soft: ["reliable", "professionalism"]
  },
  cdl: {
    high: ["truck driver", "CDL", "DOT", "pre-trip", "post-trip", "safe driving", "hours of service", "equipment inspection"],
    medium: ["logistics", "route planning", "ELD", "loading", "unloading", "delivery"],
    soft: ["communication", "time management", "reliable"]
  },
  maintenance: {
    high: ["maintenance", "troubleshooting", "repair", "preventive maintenance", "work orders", "hand tools", "power tools", "safety"],
    medium: ["electrical", "plumbing", "equipment repair", "installation", "documentation"],
    soft: ["customer service", "communication", "time management"]
  },
  apartment: {
    high: ["apartment maintenance", "property maintenance", "work orders", "HVAC", "plumbing", "electrical", "turnovers", "repairs"],
    medium: ["painting", "grounds", "preventive maintenance", "customer service", "hand tools", "power tools"],
    soft: ["communication", "professionalism", "time management"]
  },
  electrician: {
    high: ["electrical", "wiring", "outlets", "switches", "conduit", "panels", "troubleshooting", "installation", "safety"],
    medium: ["blueprints", "NEC", "hand tools", "power tools", "fixtures"],
    soft: ["attention to detail", "teamwork", "communication"]
  },
  welding: {
    high: ["welding", "fabrication", "blueprint reading", "grinding", "cutting", "fitting", "measuring", "shop safety"],
    medium: ["quality inspection", "MIG", "TIG", "hand tools", "materials"],
    soft: ["attention to detail", "teamwork", "safety"]
  },
  diesel: {
    high: ["diesel", "mechanic", "diagnostics", "preventive maintenance", "troubleshooting", "repair", "inspection", "hand tools"],
    medium: ["brakes", "hydraulics", "heavy equipment", "equipment inspection", "documentation"],
    soft: ["safety", "communication", "problem solving"]
  },
  construction: {
    high: ["construction", "hand tools", "power tools", "measuring", "installation", "job site safety", "materials"],
    medium: ["carpentry", "framing", "doors", "trim", "millwork", "cleanup", "blueprints"],
    soft: ["teamwork", "attendance", "communication"]
  },
  security: {
    high: ["security", "patrol", "access control", "incident reports", "surveillance", "observation", "emergency response"],
    medium: ["de-escalation", "professionalism", "customer service", "documentation", "safety"],
    soft: ["communication", "reliable", "attention to detail"]
  },
  janitorial: {
    high: ["cleaning", "sanitation", "janitorial", "custodial", "trash removal", "restrooms", "supplies"],
    medium: ["floor care", "housekeeping", "safety", "attention to detail"],
    soft: ["reliable", "time management", "teamwork"]
  },
  hospitality: {
    high: ["front desk", "hotel", "guest service", "reservations", "check-in", "check-out", "customer service"],
    medium: ["problem solving", "phone calls", "professionalism", "attention to detail"],
    soft: ["communication", "organization", "reliable"]
  },
  food_service: {
    high: ["restaurant", "customer service", "orders", "POS", "food safety", "sanitation", "teamwork"],
    medium: ["server", "cook", "food prep", "kitchen", "recipes", "inventory", "fast-paced"],
    soft: ["communication", "time management", "reliable"]
  },
  healthcare_support: {
    high: ["patient care", "vital signs", "ADLs", "infection control", "documentation", "HIPAA", "safety"],
    medium: ["CNA", "medical assistant", "EKG", "phlebotomy", "blood draw", "specimen collection", "compassion"],
    soft: ["teamwork", "communication", "attention to detail"]
  },
  it_helpdesk: {
    high: ["IT help desk", "technical support", "troubleshooting", "tickets", "hardware", "software", "Windows", "password reset"],
    medium: ["customer service", "documentation", "network security", "cybersecurity", "incident response", "monitoring"],
    soft: ["communication", "problem solving", "attention to detail"]
  },
  apprenticeship: {
    high: ["willingness to learn", "hands-on", "training", "safety", "attendance", "teamwork"],
    medium: ["tools", "communication", "problem solving", "reliable"],
    soft: ["long-term", "career", "professionalism"]
  }
};

const jobTypeKeywordRules = {
  warehouse_associate: { high: ["warehouse", "order picking", "RF scanner", "shipping", "receiving", "inventory", "pallet jack", "material handling"], medium: ["picking", "packing", "loading", "unloading", "scanning"] },
  forklift_operator: { high: ["forklift", "equipment inspection", "loading", "unloading", "pallets", "warehouse", "safety"], medium: ["shipping", "receiving", "inventory", "material handling"] },
  machine_operator: { high: ["machine operation", "equipment monitoring", "quality checks", "troubleshooting", "setup", "restarts", "manufacturing", "safety"], medium: ["production flow", "changeovers", "material handling", "12-hour shifts"] },
  customer_service_representative: { high: ["customer service", "customer support", "communication", "problem solving", "documentation", "de-escalation"], medium: ["phone etiquette", "CRM", "active listening", "customer satisfaction"] },
  data_entry_clerk: { high: ["data entry", "typing", "accuracy", "attention to detail", "records", "spreadsheets"], medium: ["Microsoft Office", "clerical", "documentation"] },
  certified_nursing_assistant: { high: ["CNA", "patient care", "vital signs", "ADLs", "infection control", "documentation", "HIPAA"], medium: ["compassion", "safety", "teamwork"] },
  security_officer: { high: ["security", "patrol", "access control", "incident reports", "surveillance", "observation"], medium: ["emergency response", "de-escalation", "customer service"] },
  maintenance_technician: { high: ["maintenance", "troubleshooting", "repair", "preventive maintenance", "work orders", "hand tools", "power tools"], medium: ["electrical", "plumbing", "equipment repair"] },
  remote_customer_support_representative: { high: ["remote", "customer support", "chat support", "email support", "phone support", "documentation", "typing"], medium: ["CRM", "work from home", "problem solving"] },
  it_help_desk_technician: { high: ["IT help desk", "technical support", "troubleshooting", "tickets", "hardware", "software", "Windows", "password reset"], medium: ["customer service", "documentation"] }
};

const importanceWeights = { high: 5, medium: 3, soft: 1, helpful: 2 };
const matchCredits = { exact: 1, related: 0.72, weak: 0.42, missing: 0 };

const phraseBank = [...new Set([
  ...Object.keys(relatedKeywordMap),
  ...Object.values(presetKeywords).flat(),
  "production flow", "rotating shifts", "12-hour shifts", "stable work history", "strong attendance", "team environment",
  "customer satisfaction", "active listening", "scheduling", "calendar", "records", "organization", "confidentiality",
  "route planning", "equipment inspection", "shop safety", "job site safety", "heavy equipment", "floor care",
  "reservations", "check-in", "check-out", "food prep", "meal prep", "mobility assistance", "specimen collection",
  "chairside assistance", "medication administration", "care plans", "patient education", "claims", "insurance",
  "accounts payable", "accounts receivable", "reconciliation", "employee records", "risk assessment", "vulnerability"
])];

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
  return String(text || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9+.#@%/$\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .filter(word => word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word));
}

function phraseInText(phrase, text) {
  const normalizedPhrase = normalize(phrase);
  const normalizedText = normalize(text);
  if (!normalizedPhrase) return false;

  if (normalizedPhrase.length <= 3 || /^[a-z0-9+.#-]+$/.test(normalizedPhrase)) {
    return new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`, "i").test(normalizedText);
  }

  return normalizedText.includes(normalizedPhrase);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function relatedTermsFor(keyword) {
  const normalized = normalize(keyword);
  const direct = relatedKeywordMap[keyword] || relatedKeywordMap[normalized] || [];
  const reverse = Object.entries(relatedKeywordMap)
    .filter(([, related]) => related.some(term => normalize(term) === normalized))
    .map(([canonical]) => canonical);
  return [...new Set([...direct, ...reverse])];
}

function getKeywordMatch(keyword, resumeText) {
  if (phraseInText(keyword, resumeText)) {
    return { status: "exact", matchedBy: keyword };
  }

  const related = relatedTermsFor(keyword);
  const matchedRelated = related.find(term => phraseInText(term, resumeText));
  if (matchedRelated) {
    return { status: "related", matchedBy: matchedRelated };
  }

  return { status: "missing", matchedBy: null };
}


function uniqueList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function keywordRulesFor(jobType) {
  const family = getJobFamily(jobType);
  const familyRules = familyKeywordRules[family] || familyKeywordRules.general;
  const directRules = jobTypeKeywordRules[jobType] || {};
  return {
    high: uniqueList([...(familyRules.high || []), ...(directRules.high || [])]),
    medium: uniqueList([...(familyRules.medium || []), ...(directRules.medium || [])]),
    soft: uniqueList([...(familyRules.soft || []), ...(directRules.soft || [])])
  };
}

function ruleImportance(term, jobType) {
  const normalizedTerm = normalize(term);
  const rules = keywordRulesFor(jobType);
  if (rules.high.some(item => normalize(item) === normalizedTerm)) return "high";
  if (rules.medium.some(item => normalize(item) === normalizedTerm)) return "medium";
  if (rules.soft.some(item => normalize(item) === normalizedTerm)) return "soft";
  return null;
}

function strongerImportance(current, next) {
  const rank = { high: 3, medium: 2, helpful: 1, soft: 0 };
  return (rank[next] || 0) > (rank[current] || 0) ? next : current;
}

function keywordImportance(term, jobText, jobType, forcedImportance = null) {
  if (forcedImportance) return forcedImportance;

  const ruleMatch = ruleImportance(term, jobType);
  if (ruleMatch) return ruleMatch;

  const normalizedTerm = normalize(term);
  const job = normalize(jobText);
  const exactCount = normalizedTerm ? job.split(normalizedTerm).length - 1 : 0;
  const isPhrase = term.includes(" ") || phraseBank.some(item => normalize(item) === normalizedTerm);
  const strongTerms = [
    "license", "certification", "certified", "CDL", "DOT", "forklift", "RF scanner", "safety", "quality", "customer service",
    "data entry", "typing", "welding", "electrical", "HVAC", "plumbing", "patient care", "HIPAA", "machine operation",
    "material handling", "maintenance", "troubleshooting", "inventory", "shipping", "receiving", "work orders", "technical support",
    "security", "patrol", "access control", "cash handling", "POS", "medical coding", "medical billing", "cybersecurity"
  ];
  const isStrong = strongTerms.some(item => normalize(item) === normalizedTerm || normalizedTerm.includes(normalize(item)));

  if (isStrong || exactCount > 1) return "high";
  if (isPhrase) return "medium";
  return "helpful";
}

function keywordWeight(importance) {
  return importanceWeights[importance] || importanceWeights.helpful;
}

function addKeyword(map, term, reason, jobText, jobType, forcedImportance = null) {
  const clean = String(term || "").trim();
  const normalized = normalize(clean);
  if (!normalized || stopWords.has(normalized) || normalized.length < 3) return;
  if (/^\d+$/.test(normalized)) return;
  if (["required", "preferred", "duties", "responsibilities", "position", "company", "ability"].includes(normalized)) return;

  const importance = keywordImportance(clean, jobText, jobType, forcedImportance);
  const existing = map.get(normalized);

  if (!existing) {
    map.set(normalized, {
      term: clean,
      importance,
      weight: keywordWeight(importance),
      reasons: new Set([reason])
    });
    return;
  }

  existing.reasons.add(reason);
  existing.importance = strongerImportance(existing.importance, importance);
  existing.weight = keywordWeight(existing.importance);
}

function addRuleKeywords(map, jobText, jobType) {
  const rules = keywordRulesFor(jobType);

  rules.high.forEach(term => addKeyword(map, term, "high-priority job type skill", jobText, jobType, "high"));
  rules.medium.forEach(term => addKeyword(map, term, "job type skill", jobText, jobType, "medium"));

  // Soft skills are only added when the job post actually asks for them. This keeps the report from feeling generic.
  rules.soft
    .filter(term => phraseInText(term, jobText) || relatedTermsFor(term).some(related => phraseInText(related, jobText)))
    .forEach(term => addKeyword(map, term, "job post soft skill", jobText, jobType, "soft"));
}

function extractImportantKeywords(jobText, jobType) {
  const keywords = new Map();
  const preset = presetKeywords[jobType] || presetKeywords.general;

  addRuleKeywords(keywords, jobText, jobType);

  preset.forEach(term => {
    const forced = ruleImportance(term, jobType) || "medium";
    addKeyword(keywords, term, "selected job type", jobText, jobType, forced);
  });

  phraseBank
    .filter(phrase => phraseInText(phrase, jobText))
    .forEach(phrase => addKeyword(keywords, phrase, "job post phrase", jobText, jobType));

  const tokens = tokenize(jobText);
  const counts = new Map();
  tokens.forEach(token => counts.set(token, (counts.get(token) || 0) + 1));

  [...counts.entries()]
    .filter(([word]) => word.length > 3 && !stopWords.has(word))
    .filter(([word]) => !/^(apply|online|benefits|schedule|needed|needed|plus|bonus|paid|training)$/i.test(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .forEach(([word]) => addKeyword(keywords, word, "frequent job-post word", jobText, jobType));

  const finalList = [...keywords.values()]
    .map(item => ({ ...item, reasons: [...item.reasons] }))
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.term.localeCompare(b.term);
    });

  return finalList.slice(0, 54);
}

function termTokens(term) {
  return normalize(term)
    .split(" ")
    .filter(word => word.length > 2 && !stopWords.has(word));
}

function lightStem(word) {
  return normalize(word)
    .replace(/(ing|ers|er|ed|ies|s)$/i, "")
    .trim();
}

function tokenSet(text) {
  return new Set(tokenize(text).map(lightStem).filter(Boolean));
}

function findWeakMatch(keyword, resumeText) {
  const words = termTokens(keyword);
  if (!words.length) return null;

  const resumeTokens = tokenSet(resumeText);
  const matched = words.filter(word => resumeTokens.has(lightStem(word)));

  if (words.length === 1) {
    return matched.length ? matched[0] : null;
  }

  const ratio = matched.length / words.length;
  if (matched.length >= 2 && ratio >= 0.6) return matched.join(" + ");

  return null;
}

function getKeywordMatch(keyword, resumeText) {
  if (phraseInText(keyword, resumeText)) {
    return { status: "exact", matchedBy: keyword, confidence: 100 };
  }

  const related = relatedTermsFor(keyword);
  const matchedRelated = related.find(term => phraseInText(term, resumeText));
  if (matchedRelated) {
    return { status: "related", matchedBy: matchedRelated, confidence: 75 };
  }

  const weakMatch = findWeakMatch(keyword, resumeText);
  if (weakMatch) {
    return { status: "weak", matchedBy: weakMatch, confidence: 45 };
  }

  return { status: "missing", matchedBy: null, confidence: 0 };
}

function analyzeResume(resumeText, jobText, jobType) {
  const keywords = extractImportantKeywords(jobText, jobType);
  const evaluated = keywords.map(keyword => {
    const match = getKeywordMatch(keyword.term, resumeText);
    return { ...keyword, ...match };
  });

  const exactMatched = evaluated.filter(item => item.status === "exact");
  const relatedMatched = evaluated.filter(item => item.status === "related");
  const weakMatched = evaluated.filter(item => item.status === "weak");
  const matched = evaluated.filter(item => item.status !== "missing");
  const missing = evaluated.filter(item => item.status === "missing");
  const criticalMissing = missing.filter(item => item.importance === "high");
  const helpfulMissing = missing.filter(item => item.importance === "medium" || item.importance === "helpful");
  const softMissing = missing.filter(item => item.importance === "soft");

  const sectionChecks = [
    { name: "contact info", ok: /@|\d{3}[-.)\s]?\d{3}[-.\s]?\d{4}/i.test(resumeText) },
    { name: "summary", ok: /summary|profile|objective/i.test(resumeText) },
    { name: "skills", ok: /skills|certifications/i.test(resumeText) },
    { name: "experience", ok: /experience|work history|employment/i.test(resumeText) },
    { name: "education", ok: /education|school|ged|diploma|degree/i.test(resumeText) }
  ];

  const sectionScore = Math.round((sectionChecks.filter(s => s.ok).length / sectionChecks.length) * 20);
  const totalWeight = evaluated.reduce((total, item) => total + item.weight, 0);
  const earnedWeight = evaluated.reduce((total, item) => total + (item.weight * (matchCredits[item.status] || 0)), 0);
  const keywordScore = totalWeight ? Math.round((earnedWeight / totalWeight) * 72) : 0;
  const lengthBonus = resumeText.length > 800 && resumeText.length < 5000 ? 8 : resumeText.length >= 5000 ? 4 : 0;
  const score = Math.min(100, keywordScore + sectionScore + lengthBonus);
  const weightedCoverage = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return {
    keywords,
    evaluated,
    exactMatched,
    relatedMatched,
    weakMatched,
    matched,
    missing,
    criticalMissing,
    helpfulMissing,
    softMissing,
    sectionChecks,
    weightedCoverage,
    score
  };
}

function getScoreMessage(score) {
  if (score >= 85) return "Strong match. Clean up the red flags, then apply.";
  if (score >= 70) return "Good base. Add the high-priority missing keywords naturally before applying.";
  if (score >= 50) return "Decent start, but the resume may still look too generic for this job post.";
  return "Weak match. The job post and resume are not speaking the same language yet.";
}

function buildRedFlags(resumeText, jobText, analysis) {
  const flags = [];
  const lowerResume = resumeText.toLowerCase();

  if (analysis.criticalMissing.length >= 5) {
    flags.push("<strong>High-priority keywords missing:</strong> the resume is missing several important words or skills from the job post.");
  }
  if (analysis.missing.length > 14) {
    flags.push("<strong>Too many missing keywords:</strong> the resume may not match the job post closely enough.");
  }
  if (analysis.relatedMatched.length > analysis.exactMatched.length && analysis.relatedMatched.length > 3) {
    flags.push("<strong>Related matches found:</strong> your resume shows similar experience, but adding the employer's exact wording could make it stronger.");
  }
  if (analysis.weakMatched?.length >= 3) {
    flags.push("<strong>Weak matches found:</strong> the resume has partial proof for some skills, but the wording is not clear enough yet.");
  }
  if (analysis.weightedCoverage < 55) {
    flags.push("<strong>Low keyword confidence:</strong> the strongest job-specific skills are not showing clearly enough in the resume.");
  }
  if (!/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|20\d{2}|present)\b/i.test(resumeText)) {
    flags.push("<strong>Missing dates:</strong> add month/year dates so the work history looks complete.");
  }
  if ((lowerResume.match(/present/g) || []).length > 1) {
    flags.push("<strong>Multiple current jobs:</strong> more than one 'Present' role can look like overlapping dates.");
  }
  if (!/\d|percent|%|hour|shift|positions|equipment|machines/i.test(resumeText)) {
    flags.push("<strong>No measurable proof:</strong> add numbers like equipment count, shift length, production rate, or years of experience.");
  }
  if (/fast[-\s]?paced/i.test(jobText) && !/fast[-\s]?paced|high volume|production flow|busy environment/i.test(resumeText)) {
    flags.push("<strong>Fast-paced missing:</strong> the job asks for fast-paced work, but the resume does not clearly show it.");
  }
  if (/safety/i.test(jobText) && !/safety|safe|PPE|procedures/i.test(resumeText)) {
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

function getJobFamily(jobType) {
  const familyMap = {
    general: "general",
    customer_service_representative: "customer_service",
    data_entry_clerk: "dataentry",
    administrative_assistant: "admin",
    receptionist: "admin",
    call_center_representative: "call_center",
    remote_customer_support_representative: "remote",
    office_assistant: "admin",
    sales_representative: "sales_retail",
    retail_associate: "sales_retail",
    cashier: "sales_retail",
    stocker: "warehouse",
    warehouse_associate: "warehouse",
    package_handler: "warehouse",
    material_handler: "warehouse",
    forklift_operator: "warehouse",
    delivery_driver: "delivery",
    truck_driver: "cdl",
    machine_operator: "manufacturing",
    production_worker: "manufacturing",
    assembly_worker: "manufacturing",
    maintenance_technician: "maintenance",
    apartment_maintenance_technician: "apartment",
    electrician: "electrician",
    welder: "welding",
    diesel_mechanic: "diesel",
    construction_laborer: "construction",
    carpenter: "construction",
    security_officer: "security",
    janitor: "janitorial",
    housekeeper: "janitorial",
    hotel_front_desk_agent: "hospitality",
    server: "food_service",
    cook: "food_service",
    certified_nursing_assistant: "healthcare_support",
    medical_assistant: "healthcare_support",
    patient_care_technician: "healthcare_support",
    home_health_aide: "healthcare_support",
    phlebotomist: "healthcare_support",
    pharmacy_technician: "healthcare_support",
    dental_assistant: "healthcare_support",
    licensed_practical_nurse: "healthcare_support",
    registered_nurse: "healthcare_support",
    medical_billing_specialist: "healthcare_support",
    medical_coding_specialist: "healthcare_support",
    teacher_assistant: "apprenticeship",
    substitute_teacher: "apprenticeship",
    bookkeeper: "admin",
    human_resources_assistant: "admin",
    it_help_desk_technician: "it_helpdesk",
    cybersecurity_analyst: "it_helpdesk"
  };

  return familyMap[jobType] || "general";
}

function buildSummary(jobType, analysis) {
  const strengths = analysis.matched.slice(0, 6).map(item => item.term);
  const needs = analysis.criticalMissing.slice(0, 4).map(item => item.term);
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
    apprenticeship: "Motivated trade apprenticeship candidate with hands-on work experience, strong attendance, safety awareness, and willingness to learn a long-term skilled career."
  }[getJobFamily(jobType)] || "Reliable candidate with hands-on work experience, strong attendance, teamwork, communication, safety awareness, and the ability to learn new tasks quickly.";

  return `${typeLine} Experienced working in fast-paced environments, following instructions, supporting production goals, and learning new equipment or processes. Smart keyword coverage is ${analysis.weightedCoverage}%. Key strengths for this role include ${strengths.length ? strengths.join(", ") : "safety, reliability, teamwork, and problem solving"}. Add honest proof for these high-priority keywords if they apply: ${needs.length ? needs.join(", ") : "no major high-priority keyword gaps found"}.`;
}

function buildBullets(jobType, analysis) {
  const missing = analysis.criticalMissing.slice(0, 8).map(item => item.term);
  const matched = analysis.matched.slice(0, 8).map(item => item.term);
  const base = {
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
    customer_service: ["Helped customers by listening, answering questions, solving problems, and documenting support details clearly.", "Used professional communication and patience to de-escalate issues and protect customer satisfaction.", "Worked in a fast-paced environment while staying organized, respectful, and focused on solutions."],
    admin: ["Supported office operations through scheduling, email, phone calls, filing, data entry, and record management.", "Used organization and communication skills to keep daily tasks, calendars, and documents accurate.", "Assisted teams and customers by following procedures, tracking information, and handling details professionally."],
    dataentry: ["Entered, reviewed, and organized data with accuracy, attention to detail, and consistent typing habits.", "Maintained records, spreadsheets, files, and documentation while following office procedures.", "Checked information for errors and communicated missing or unclear details before submission."],
    sales_retail: ["Provided customer service, product support, sales assistance, cash handling, and store operations support.", "Maintained inventory, merchandising, cleanliness, and teamwork in a customer-facing retail environment.", "Used communication and product knowledge to answer questions, recommend items, and support sales goals."],
    food_service: ["Supported food service operations through customer service, food prep, cleaning, sanitation, and teamwork.", "Worked in a fast-paced restaurant environment while following food safety, accuracy, and service standards.", "Handled orders, POS tasks, stocking, and cleaning while helping the team meet rush-hour demand."],
    hospitality: ["Provided guest service through check-in support, reservations, issue resolution, and professional communication.", "Supported hotel or hospitality operations by keeping areas clean, organized, and ready for guests.", "Handled guest questions and concerns with patience, accuracy, and attention to detail."],
    healthcare_support: ["Supported patient care tasks while following safety, documentation, infection control, and teamwork expectations.", "Provided compassionate assistance to patients, residents, or clients while respecting privacy and procedures.", "Communicated changes, needs, and concerns clearly to supervisors or healthcare team members."],
    it_helpdesk: ["Provided technical support by troubleshooting user issues, documenting tickets, and following step-by-step procedures.", "Helped resolve hardware, software, login, password, and basic network problems with clear communication.", "Used customer service skills and technical learning ability to support users remotely or in person."],
    janitorial: ["Cleaned, sanitized, stocked, and maintained assigned areas while following safety and quality standards.", "Completed floor care, trash removal, restroom cleaning, and housekeeping tasks with attention to detail.", "Kept work areas organized and communicated supply or maintenance issues when needed."],
    call_center: ["Handled calls, messages, scheduling, dispatch, documentation, and customer questions in a high-volume environment.", "Used phone etiquette, typing, CRM-style tools, and clear communication to track and resolve issues.", "Remained calm and organized while helping customers, drivers, technicians, or internal teams."],
    apprenticeship: ["Showed strong willingness to learn by taking on hands-on tasks, following training, and improving through repetition.", "Built real work experience in fast-paced environments requiring reliability, attendance, safety, and teamwork.", "Supported daily operations by staying flexible, learning new responsibilities, and helping the team meet goals."]
  }[getJobFamily(jobType)] || [
    "Worked in a team environment while following company procedures, safety rules, and daily expectations.",
    "Learned new tasks quickly and supported supervisors by staying reliable, organized, and ready to help where needed.",
    "Used communication, attention to detail, and problem-solving to support daily work goals."
  ];

  const keywordBullet = missing.length
    ? `Add honest examples that show these high-priority job-post keywords if they apply: ${missing.join(", ")}.`
    : `Your resume already covers strong matches like ${matched.join(", ")}. Strengthen them with numbers and examples.`;

  return [...base, keywordBullet].map(item => `• ${item}`).join("\n");
}


function keywordDisplay(item) {
  if (typeof item === "string") return item;
  if (item.status === "related") return `${item.term} ≈ ${item.matchedBy}`;
  if (item.status === "weak") return `${item.term} ~ ${item.matchedBy}`;
  return item.term;
}

function keywordDetails(item) {
  if (typeof item === "string") return "";
  const importanceLabel = item.importance === "high" ? "High priority" : item.importance === "medium" ? "Medium priority" : item.importance === "soft" ? "Soft skill" : "Helpful";
  const matchLabel = item.status === "exact" ? "Exact match" : item.status === "related" ? `Related match: ${item.matchedBy}` : item.status === "weak" ? `Weak/partial match: ${item.matchedBy}` : "Missing";
  return `${importanceLabel} • ${matchLabel} • Confidence: ${item.confidence || 0}%`;
}

function renderKeywordGroup(container, title, items, note = "") {
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

  const list = items.length ? items : ["Nothing found here"];
  list.slice(0, 18).forEach(item => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = keywordDisplay(item);
    chip.title = keywordDetails(item);
    if (item?.importance === "high" && item?.status === "missing") {
      chip.style.borderColor = "rgba(255, 92, 122, 0.45)";
      chip.style.color = "#ffc2cc";
      chip.style.background = "rgba(255, 92, 122, 0.12)";
    }
    if (item?.status === "weak") {
      chip.style.opacity = "0.86";
    }
    chips.appendChild(chip);
  });

  group.appendChild(chips);
  container.appendChild(group);
}

function renderMissingKeywords(container, analysis) {
  container.innerHTML = "";
  const summary = document.createElement("p");
  summary.textContent = `Smart match: ${analysis.weightedCoverage}% weighted keyword coverage. High-priority skills count more than soft skills.`;
  summary.style.margin = "0 0 14px";
  summary.style.color = "#a7b0bf";
  summary.style.lineHeight = "1.45";
  container.appendChild(summary);

  renderKeywordGroup(
    container,
    "High Priority Missing",
    analysis.criticalMissing,
    "These are the job-specific words most worth adding if they are true."
  );
  renderKeywordGroup(
    container,
    "Helpful Keywords to Add",
    analysis.helpfulMissing,
    "These can improve the match, but they do not matter as much as the high-priority skills."
  );
  renderKeywordGroup(
    container,
    "Soft Skills Missing",
    analysis.softMissing,
    "These only show up when the job post asks for them."
  );
}

function renderMatchedKeywords(container, analysis) {
  container.innerHTML = "";
  renderKeywordGroup(container, "Exact Matches", analysis.exactMatched, "The resume already uses the employer's wording.");
  renderKeywordGroup(container, "Related Matches", analysis.relatedMatched, "The resume says something close. Using the employer's exact wording may help.");
  renderKeywordGroup(container, "Weak / Partial Matches", analysis.weakMatched, "The resume has partial proof, but the wording could be clearer.");
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

  renderMissingKeywords(document.getElementById("missingKeywords"), analysis);
  renderMatchedKeywords(document.getElementById("matchedKeywords"), analysis);

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

  const title = document.getElementById("authTitle");
  const eyebrow = document.getElementById("authEyebrow");
  const help = document.getElementById("authHelp");
  const nameField = document.getElementById("nameField");
  const nameInput = document.getElementById("userName");
  const passwordInput = document.getElementById("userPassword");
  const submitBtn = document.getElementById("accountSubmitBtn");
  const resetBtn = document.getElementById("passwordResetBtn");
  const switchText = document.getElementById("authSwitchText");

  if (!title || !eyebrow || !help || !nameField || !nameInput || !passwordInput || !submitBtn || !resetBtn || !switchText) return;

  if (authMode === "create") {
    eyebrow.textContent = "Create account";
    title.textContent = "Create your free account";
    help.textContent = "Save your job applications and come back later from any device.";
    submitBtn.textContent = "Create Account";
    nameField.hidden = false;
    nameInput.required = true;
    passwordInput.autocomplete = "new-password";
    resetBtn.hidden = true;
    switchText.innerHTML = 'Already have an account? <button class="link-button inline-link" id="switchAuthBtn" type="button">Sign in</button>';
  } else {
    eyebrow.textContent = "Sign in";
    title.textContent = "Welcome back";
    help.textContent = "Access your saved job applications.";
    submitBtn.textContent = "Sign In";
    nameField.hidden = true;
    nameInput.required = false;
    passwordInput.autocomplete = "current-password";
    resetBtn.hidden = false;
    switchText.innerHTML = 'Need an account? <button class="link-button inline-link" id="switchAuthBtn" type="button">Create one</button>';
  }

  const switchBtn = document.getElementById("switchAuthBtn");
  switchBtn?.addEventListener("click", () => setAuthMode(authMode === "create" ? "signin" : "create"));
  setAuthMessage("");
}

function formatAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "That email/password did not work. If this is your first time, tap Create account first.";
  if (code.includes("user-not-found")) return "No account found with that email. Tap Create account first.";
  if (code.includes("email-already-in-use")) return "That email already has an account. Switch to Sign in instead.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("operation-not-allowed")) return "Account sign-in is not ready yet. Try again later.";
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
  const authCard = document.getElementById("authCard");
  const accountStatusCard = document.getElementById("accountStatusCard");

  if (!navUser || !accountStatus || !accountNote || !trackerNote || !signOutBtn || !accountForm || !authCard || !accountStatusCard) return;

  if (!firebaseEnabled || !auth || !db) {
    navUser.textContent = "Account setup needed";
    authCard.hidden = false;
    accountStatusCard.hidden = true;
    trackerNote.textContent = "You can test the analyzer now. Account saving is still being connected.";
    setAuthMessage("Account saving is not connected yet. The analyzer still works.", "error");
    signOutBtn.hidden = true;
    return;
  }

  if (user) {
    navUser.textContent = `Signed in as ${user.name}`;
    accountStatus.textContent = `Signed in as ${user.name}`;
    accountNote.textContent = `${user.email} — your applications are saved to your account.`;
    trackerNote.textContent = `Tracking applications for ${user.name}.`;
    authCard.hidden = true;
    accountStatusCard.hidden = false;
    signOutBtn.hidden = false;
    accountForm.reset();
  } else {
    navUser.textContent = "Create or sign in";
    trackerNote.textContent = "Sign in from the menu to save applications to your account.";
    authCard.hidden = false;
    accountStatusCard.hidden = true;
    signOutBtn.hidden = true;
  }
}

function renderTracker() {
  const rows = document.getElementById("trackerRows");
  if (!rows) return;
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
    const name = document.getElementById("userName")?.value.trim() || "Local User";
    const email = document.getElementById("userEmail")?.value.trim().toLowerCase();

    if (!email) {
      setAuthMessage("Enter your email.", "error");
      return;
    }

    localStorage.setItem("gmpt_current_user", JSON.stringify({ name, email, signedInAt: new Date().toISOString() }));
    document.getElementById("accountForm")?.reset();
    renderAccount();
    renderTracker();
    returnHomeAfterAuth("Signed in.");
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
    returnHomeAfterAuth("Signed in. Welcome back.");
  } catch (error) {
    setAuthMessage(formatAuthError(error), "error");
  }
}

async function createAccount() {
  setAuthMessage("Creating account...", "");

  if (!firebaseEnabled || !auth || !db) {
    setAuthMessage("Account saving is still being set up. Try again soon.", "error");
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
    renderAccount();
    returnHomeAfterAuth("Account created. Your applications are saved to your account.");
  } catch (error) {
    setAuthMessage(formatAuthError(error), "error");
  }
}

async function resetPassword() {
  if (!firebaseEnabled || !auth) {
    setAuthMessage("Account saving is still being set up.", "error");
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
    closeMenu();
    document.getElementById("home")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  localStorage.removeItem("gmpt_current_user");
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
    alert("Could not load your saved applications. Try again in a minute.");
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
      alert("Sign in from the menu first to save applications to your account.");
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

function openMenu(mode = null) {
  const navMenu = document.getElementById("navMenu");
  const backdrop = document.getElementById("menuBackdrop");
  const toggle = document.getElementById("menuToggle");
  if (!navMenu || !backdrop || !toggle) return;
  if (mode) setAuthMode(mode);
  navMenu.classList.add("open");
  navMenu.setAttribute("aria-hidden", "false");
  toggle.setAttribute("aria-expanded", "true");
  backdrop.hidden = false;
  document.body.classList.add("menu-open");
}

function closeMenu() {
  const navMenu = document.getElementById("navMenu");
  const backdrop = document.getElementById("menuBackdrop");
  const toggle = document.getElementById("menuToggle");
  if (!navMenu || !backdrop || !toggle) return;
  navMenu.classList.remove("open");
  navMenu.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
  backdrop.hidden = true;
  document.body.classList.remove("menu-open");
}

function returnHomeAfterAuth(message = "") {
  if (message) setAuthMessage(message, "success");
  closeMenu();
  document.getElementById("home")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearAnalyzer() {
  const resume = document.getElementById("resumeText");
  const job = document.getElementById("jobText");
  const results = document.getElementById("results");
  const rewrite = document.getElementById("rewrite");
  const scoreBar = document.getElementById("scoreBar");

  if (resume) resume.value = "";
  if (job) job.value = "";
  if (results) results.hidden = true;
  if (rewrite) rewrite.hidden = true;
  if (scoreBar) scoreBar.style.width = "0%";

  document.getElementById("missingKeywords")?.replaceChildren();
  document.getElementById("matchedKeywords")?.replaceChildren();
  document.getElementById("redFlags")?.replaceChildren();
}

function init() {
  const analyzeButton = document.getElementById("analyzeBtn");
  const clearButton = document.getElementById("clearBtn");

  if (analyzeButton) {
    analyzeButton.type = "button";
    analyzeButton.onclick = event => {
      event.preventDefault();
      try {
        analyzeAndRender();
      } catch (error) {
        console.error("Analyze failed:", error);
        alert("Something stopped the resume report from loading. Refresh the page and try again.");
      }
    };
  }

  if (clearButton) {
    clearButton.type = "button";
    clearButton.onclick = event => {
      event.preventDefault();
      clearAnalyzer();
    };
  }

  document.querySelectorAll(".copy-button").forEach(button => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      await navigator.clipboard.writeText(target.textContent);
      const old = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = old), 1200);
    });
  });

  document.getElementById("menuToggle")?.addEventListener("click", () => openMenu());
  document.getElementById("menuClose")?.addEventListener("click", closeMenu);
  document.getElementById("menuBackdrop")?.addEventListener("click", closeMenu);
  document.querySelectorAll("#navMenu .menu-item").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.getElementById("accountForm")?.addEventListener("submit", handleAccountSubmit);
  document.getElementById("passwordResetBtn")?.addEventListener("click", resetPassword);
  document.getElementById("togglePasswordBtn")?.addEventListener("click", () => {
    const input = document.getElementById("userPassword");
    const button = document.getElementById("togglePasswordBtn");
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
  });

  setAuthMode("create");
  document.getElementById("signOutBtn")?.addEventListener("click", signOut);
  document.getElementById("exportTrackerBtn")?.addEventListener("click", exportTrackerCSV);
  document.getElementById("clearTrackerBtn")?.addEventListener("click", clearTracker);
  document.getElementById("trackerForm")?.addEventListener("submit", addApplication);
  document.getElementById("trackerRows")?.addEventListener("click", deleteApplication);

  initAuthListener();
}

document.addEventListener("DOMContentLoaded", init);
