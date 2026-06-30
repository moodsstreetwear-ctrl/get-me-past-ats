// GET ME PAST ATS
// Analyzer code loads first so the score and clear buttons work even if account saving has a problem.
window.GMPT_APP_VERSION = "all-buttons-v3";


let initializeApp = null;
let getAuth = null;
let createUserWithEmailAndPassword = null;
let signInWithEmailAndPassword = null;
let firebaseSignOut = null;
let onAuthStateChanged = null;
let updateProfile = null;
let sendPasswordResetEmail = null;

let getFirestore = null;
let collection = null;
let addDoc = null;
let deleteDoc = null;
let doc = null;
let onSnapshot = null;
let query = null;
let orderBy = null;
let serverTimestamp = null;
let getDocs = null;
let writeBatch = null;

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
  const mismatch = detectJobTypeMismatch(jobText, jobType);
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

  const baseAnalysis = {
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
    score,
    mismatch
  };

  const evidence = evaluateEvidenceForJobType(resumeText, jobType);
  const diagnosis = buildDiagnosis(resumeText, jobText, jobType, baseAnalysis, evidence, mismatch);

  return {
    ...baseAnalysis,
    evidenceCoverage: evidence.coverage,
    directHighMatches: evidence.directHighMatches,
    proofMatches: evidence.proofMatches,
    proofSatisfied: evidence.proofSatisfied,
    requiredTerms: evidence.requiredTerms,
    requiredMinimum: evidence.requiredMinimum,
    diagnosis,
    directionNote: buildDirectionNotes(jobType, { ...baseAnalysis, ...evidence, diagnosis, mismatch })
  };
}

function getScoreMessage(score, analysis = null) {
  if (analysis?.diagnosis?.title) return `${analysis.diagnosis.title}. ${analysis.diagnosis.message}`;
  if (score >= 85) return "Strong match. Clean up the red flags, then apply.";
  if (score >= 70) return "Good base. Add the high-priority missing keywords naturally before applying.";
  if (score >= 50) return "Decent start, but the resume may still look too generic for this job post.";
  return "Weak match. The job post and resume are not speaking the same language yet.";
}

function buildRedFlags(resumeText, jobText, analysis) {
  const flags = [];
  const lowerResume = resumeText.toLowerCase();

  if (analysis.diagnosis?.type === "wrong_job_type") {
    flags.push(`<strong>Possible wrong job type:</strong> this job post looks closer to ${analysis.mismatch?.suggestedLabel || "another role"}. Switch the job type and scan again before editing the resume.`);
  }
  if (analysis.diagnosis?.type === "weak_evidence") {
    flags.push("<strong>Do not force this match:</strong> the resume does not show enough direct proof for this job type yet.");
  }
  if (analysis.diagnosis?.type === "wording_gap") {
    flags.push("<strong>Wording gap:</strong> the experience looks related, but the ATS wording needs to be clearer.");
  }

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


const jobTypeLabels = {
  general: "General / Any Job",
  customer_service_representative: "Customer Service Representative",
  data_entry_clerk: "Data Entry Clerk",
  administrative_assistant: "Administrative Assistant",
  receptionist: "Receptionist",
  call_center_representative: "Call Center Representative",
  remote_customer_support_representative: "Remote Customer Support Representative",
  office_assistant: "Office Assistant",
  sales_representative: "Sales Representative",
  retail_associate: "Retail Associate",
  cashier: "Cashier",
  stocker: "Stocker",
  warehouse_associate: "Warehouse Associate",
  package_handler: "Package Handler",
  material_handler: "Material Handler",
  forklift_operator: "Forklift Operator",
  delivery_driver: "Delivery Driver",
  truck_driver: "Truck Driver",
  machine_operator: "Machine Operator",
  production_worker: "Production Worker",
  assembly_worker: "Assembly Worker",
  maintenance_technician: "Maintenance Technician",
  apartment_maintenance_technician: "Apartment Maintenance Technician",
  electrician: "Electrician",
  welder: "Welder",
  diesel_mechanic: "Diesel Mechanic",
  construction_laborer: "Construction Laborer",
  carpenter: "Carpenter",
  security_officer: "Security Officer",
  janitor: "Janitor",
  housekeeper: "Housekeeper",
  hotel_front_desk_agent: "Hotel Front Desk Agent",
  server: "Server",
  cook: "Cook",
  certified_nursing_assistant: "Certified Nursing Assistant",
  medical_assistant: "Medical Assistant",
  patient_care_technician: "Patient Care Technician",
  home_health_aide: "Home Health Aide",
  phlebotomist: "Phlebotomist",
  pharmacy_technician: "Pharmacy Technician",
  dental_assistant: "Dental Assistant",
  licensed_practical_nurse: "Licensed Practical Nurse",
  registered_nurse: "Registered Nurse",
  medical_billing_specialist: "Medical Billing Specialist",
  medical_coding_specialist: "Medical Coding Specialist",
  teacher_assistant: "Teacher Assistant",
  substitute_teacher: "Substitute Teacher",
  bookkeeper: "Bookkeeper",
  human_resources_assistant: "Human Resources Assistant",
  it_help_desk_technician: "IT Help Desk Technician",
  cybersecurity_analyst: "Cybersecurity Analyst"
};

const familyDisplayNames = {
  general: "general work",
  warehouse: "warehouse and material handling",
  manufacturing: "manufacturing and machine operation",
  customer_service: "customer service",
  call_center: "call center support",
  remote: "remote customer support",
  dataentry: "data entry and clerical work",
  admin: "administrative and office support",
  sales_retail: "sales and retail",
  delivery: "delivery and route work",
  cdl: "CDL and truck driving",
  maintenance: "maintenance and repair",
  apartment: "apartment maintenance",
  electrician: "electrical helper work",
  welding: "welding and fabrication",
  diesel: "diesel/mechanical repair",
  construction: "construction and carpentry",
  security: "security work",
  janitorial: "cleaning and custodial work",
  hospitality: "hospitality and guest service",
  food_service: "food service",
  healthcare_support: "healthcare support",
  it_helpdesk: "IT help desk and technical support",
  apprenticeship: "training and apprenticeship roles"
};

const requiredProofRules = {
  healthcare_support: { minimum: 1, terms: ["CNA", "certified nursing assistant", "patient care", "patients", "residents", "ADLs", "vital signs", "caregiver", "home health", "HIPAA", "infection control", "clinical", "phlebotomy", "EKG", "blood draw", "medical assistant"] },
  cdl: { minimum: 1, terms: ["CDL", "DOT", "truck driver", "pre-trip", "post-trip", "safe driving", "route", "delivery", "TWIC", "hours of service"] },
  electrician: { minimum: 1, terms: ["electrical", "wiring", "outlets", "switches", "panels", "conduit", "fixtures", "installation", "troubleshooting"] },
  welding: { minimum: 1, terms: ["welding", "welder", "fabrication", "MIG", "TIG", "grinding", "cutting", "fitting", "blueprint"] },
  diesel: { minimum: 1, terms: ["diesel", "mechanic", "diagnostics", "repair", "preventive maintenance", "brakes", "hydraulics", "heavy equipment", "inspection"] },
  it_helpdesk: { minimum: 1, terms: ["IT", "technical support", "help desk", "troubleshooting", "tickets", "hardware", "software", "Windows", "password reset", "cybersecurity", "network"] }
};

function labelForJobType(jobType) {
  return jobTypeLabels[jobType] || String(jobType || "General").replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function displayFamily(jobTypeOrFamily) {
  const family = familyKeywordRules[jobTypeOrFamily] ? jobTypeOrFamily : getJobFamily(jobTypeOrFamily);
  return familyDisplayNames[family] || "this type of work";
}

function proofTermsForJobType(jobType) {
  const family = getJobFamily(jobType);
  const direct = jobTypeKeywordRules[jobType] || {};
  const familyRules = familyKeywordRules[family] || familyKeywordRules.general;
  const required = requiredProofRules[jobType] || requiredProofRules[family] || null;
  return uniqueList([...(required?.terms || []), ...(direct.high || []), ...(familyRules.high || [])]);
}

function evaluateEvidenceForJobType(text, jobType) {
  const rules = keywordRulesFor(jobType);
  const required = requiredProofRules[jobType] || requiredProofRules[getJobFamily(jobType)] || null;
  const terms = uniqueList([...(rules.high || []), ...(rules.medium || [])]);
  const evaluated = terms.map(term => {
    const match = getKeywordMatch(term, text);
    const importance = (rules.high || []).some(item => normalize(item) === normalize(term)) ? "high" : "medium";
    const weight = keywordWeight(importance);
    return { term, importance, weight, ...match };
  });
  const totalWeight = evaluated.reduce((total, item) => total + item.weight, 0);
  const earnedWeight = evaluated.reduce((total, item) => total + (item.weight * (matchCredits[item.status] || 0)), 0);
  const coverage = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const directHighMatches = evaluated.filter(item => item.importance === "high" && (item.status === "exact" || item.status === "related"));
  const proofTerms = required?.terms || [];
  const proofMatches = proofTerms
    .map(term => ({ term, ...getKeywordMatch(term, text) }))
    .filter(item => item.status === "exact" || item.status === "related");
  const proofSatisfied = !required || proofMatches.length >= (required.minimum || 1);

  return {
    coverage,
    evaluated,
    directHighMatches,
    proofMatches,
    proofSatisfied,
    requiredTerms: proofTerms,
    requiredMinimum: required?.minimum || 0
  };
}

function scoreJobTypeAgainstText(text, jobType) {
  const rules = keywordRulesFor(jobType);
  const preset = presetKeywords[jobType] || [];
  const terms = uniqueList([...(rules.high || []), ...(rules.medium || []), ...preset]);
  return terms.reduce((score, term) => {
    const match = getKeywordMatch(term, text);
    if (match.status === "exact") return score + 5;
    if (match.status === "related") return score + 4;
    if (match.status === "weak") return score + 1.5;
    return score;
  }, 0);
}

function detectJobTypeMismatch(jobText, selectedJobType) {
  if (!jobText || selectedJobType === "general") return null;

  const candidates = Object.keys(presetKeywords)
    .filter(jobType => jobType !== "general")
    .map(jobType => ({ jobType, score: scoreJobTypeAgainstText(jobText, jobType) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const selectedScore = scoreJobTypeAgainstText(jobText, selectedJobType);
  const best = candidates[0];
  if (!best || best.jobType === selectedJobType) return null;

  const selectedFamily = getJobFamily(selectedJobType);
  const bestFamily = getJobFamily(best.jobType);
  const clearlyDifferent = selectedFamily !== bestFamily;
  const clearlyStronger = best.score >= Math.max(14, selectedScore + 8, selectedScore * 1.45);

  if (!clearlyDifferent || !clearlyStronger) return null;

  return {
    selectedJobType,
    selectedLabel: labelForJobType(selectedJobType),
    selectedScore: Math.round(selectedScore),
    suggestedJobType: best.jobType,
    suggestedLabel: labelForJobType(best.jobType),
    suggestedFamily: bestFamily,
    suggestedScore: Math.round(best.score),
    alternatives: candidates.slice(0, 3).map(item => ({ ...item, label: labelForJobType(item.jobType), score: Math.round(item.score) }))
  };
}

function provenSkillTerms(analysis, limit = 8) {
  const items = [
    ...(analysis.exactMatched || []),
    ...(analysis.relatedMatched || []),
    ...(analysis.weakMatched || [])
  ];
  return uniqueList(items
    .filter(item => item.status !== "missing")
    .sort((a, b) => {
      if ((b.weight || 0) !== (a.weight || 0)) return (b.weight || 0) - (a.weight || 0);
      return (b.confidence || 0) - (a.confidence || 0);
    })
    .map(item => item.term)
  ).slice(0, limit);
}

function transferableTermsFromResume(analysis) {
  const safe = provenSkillTerms(analysis, 10);
  const transferable = safe.filter(term => /safety|communication|teamwork|documentation|customer service|quality|accuracy|reliable|attendance|problem solving|tools|training|fast-paced|production|cleaning|organization|attention/i.test(term));
  return transferable.length ? transferable.slice(0, 6) : safe.slice(0, 6);
}

function buildDiagnosis(resumeText, jobText, jobType, analysis, evidence, mismatch) {
  const matchedHigh = evidence.directHighMatches.length;
  const weighted = analysis.weightedCoverage;
  const evidenceCoverage = evidence.coverage;
  const selectedLabel = labelForJobType(jobType);
  const suggestedText = mismatch ? ` This job post looks closer to ${mismatch.suggestedLabel}.` : "";

  if (mismatch) {
    return {
      type: "wrong_job_type",
      title: "Possible Wrong Job Type Selected",
      message: `The job description may not match the job type you selected. You picked ${mismatch.selectedLabel}, but the job post looks closer to ${mismatch.suggestedLabel}. Switch the job type for a more accurate report, or keep going if you selected it on purpose.`,
      canGenerateJobSpecific: false,
      useTransferableOnly: true,
      suggestedLabel: mismatch.suggestedLabel
    };
  }

  if (!evidence.proofSatisfied) {
    return {
      type: "weak_evidence",
      title: "Weak Evidence for This Job Type",
      message: `Your resume does not show enough direct proof for ${selectedLabel} yet. To avoid adding false experience, we will not generate job-specific wording for this role. Add real training, certification, or experience only if it is true.`,
      canGenerateJobSpecific: false,
      useTransferableOnly: false
    };
  }

  if (weighted < 30 && evidenceCoverage < 35) {
    return {
      type: "weak_evidence",
      title: "Weak Match",
      message: `Your resume and this job post are not close enough yet. We do not want to force a bad match, so use the direction notes before trying to rewrite this resume.${suggestedText}`,
      canGenerateJobSpecific: false,
      useTransferableOnly: false
    };
  }

  if (weighted < 50 && evidenceCoverage < 55) {
    return {
      type: "transferable",
      title: "Transferable Match",
      message: "Your resume shows some useful experience, but not enough direct proof for this job type yet. Starter wording will stay general and only use transferable skills already found in your resume.",
      canGenerateJobSpecific: false,
      useTransferableOnly: true
    };
  }

  if (weighted < 58 && (evidenceCoverage >= 45 || matchedHigh >= 2)) {
    return {
      type: "wording_gap",
      title: "Wording Gap",
      message: "Your resume shows related proof for this type of job, but the wording or resume structure is not strong enough yet. We will translate only the experience your resume already proves into more ATS-friendly wording.",
      canGenerateJobSpecific: true,
      useTransferableOnly: false
    };
  }

  if (analysis.score >= 85 && matchedHigh >= 2) {
    return {
      type: "strong_match",
      title: "Strong Match",
      message: "Your resume already lines up well with this job. Starter wording below is still limited to what your resume already proves.",
      canGenerateJobSpecific: true,
      useTransferableOnly: false
    };
  }

  if (analysis.score >= 70 || weighted >= 60) {
    return {
      type: "good_match",
      title: "Good Match",
      message: "Your resume is a good match for this job. A few wording gaps may still be hurting the ATS match, so the starter wording stays honest and based only on detected proof.",
      canGenerateJobSpecific: true,
      useTransferableOnly: false
    };
  }

  return {
    type: "transferable",
    title: "Transferable Match",
    message: "Your resume has some overlap with this job, but the direct proof is still limited. Use transferable wording only and add job-specific proof only if it is true.",
    canGenerateJobSpecific: false,
    useTransferableOnly: true
  };
}

function buildDirectionNotes(jobType, analysis) {
  const proofNeeded = (analysis.requiredTerms || proofTermsForJobType(jobType)).slice(0, 8).join(", ");
  const suggestedRoles = analysis.mismatch?.alternatives?.map(item => item.label).join(", ");
  const missing = (analysis.criticalMissing || []).slice(0, 5).map(item => item.term).join(", ");

  if (analysis.diagnosis?.type === "wrong_job_type") {
    return `Right direction: this job post appears closer to ${analysis.mismatch.suggestedLabel}. Change the job type and run the scan again for a cleaner report. Other close options: ${suggestedRoles || analysis.mismatch.suggestedLabel}.`;
  }

  if (analysis.diagnosis?.type === "weak_evidence") {
    return `Right direction: do not force this resume into ${labelForJobType(jobType)} yet. Add real proof first if you have it${proofNeeded ? `, such as ${proofNeeded}` : ""}. If not, apply to roles closer to what your resume already shows.`;
  }

  if (analysis.diagnosis?.type === "transferable") {
    return `Right direction: use transferable skills only for now. Add direct job proof only if it is true${proofNeeded ? `, especially ${proofNeeded}` : ""}.`;
  }

  if (analysis.diagnosis?.type === "wording_gap") {
    return `Right direction: your experience looks related, but the ATS wording is off. Add exact job-post wording only where your resume already proves it${missing ? `, starting with ${missing}` : ""}.`;
  }

  return `Right direction: keep the resume honest and tighten the ATS wording. Missing keywords are suggestions only. Add them only if they are true${missing ? `, especially ${missing}` : ""}.`;
}

function buildStarterSummary(jobType, analysis) {
  const safeSkills = provenSkillTerms(analysis, 5);
  const transferable = transferableTermsFromResume(analysis);
  const family = getJobFamily(jobType);
  const skillText = safeSkills.length ? safeSkills.join(", ") : "reliability, communication, safety, and task completion";
  const transferableText = transferable.length ? transferable.join(", ") : "following instructions, completing assigned work, and learning new tasks";
  const familyName = displayFamily(family);

  if (analysis.diagnosis?.type === "weak_evidence") {
    return `Your resume does not show enough direct proof for ${labelForJobType(jobType)} yet, so this tool will not create job-specific resume wording from thin air. Use this scan to identify what real experience, training, or certification you would need before applying.`;
  }

  if (analysis.diagnosis?.type === "wrong_job_type") {
    return `The selected job type may be wrong for this job post, so this starter summary stays general. Your resume currently shows transferable strengths such as ${transferableText}, but you should switch the job type to ${analysis.mismatch?.suggestedLabel || "the closer role"} for a more accurate report.`;
  }

  if (analysis.diagnosis?.type === "transferable") {
    return `Reliable candidate with transferable experience including ${transferableText}. Able to follow instructions, support daily operations, communicate clearly, and learn new processes without adding experience the resume does not prove.`;
  }

  if (analysis.diagnosis?.type === "wording_gap") {
    return `Reliable candidate with real experience related to ${familyName}, including ${skillText}. Able to present proven experience in more ATS-friendly wording while keeping the resume honest and based on work already shown.`;
  }

  return `Reliable candidate with experience related to ${familyName}, including ${skillText}. Able to follow instructions, support daily goals, and apply proven skills in a way ATS systems can clearly read.`;
}

function buildStarterBullets(jobType, analysis) {
  const safeSkills = provenSkillTerms(analysis, 6);
  const transferable = transferableTermsFromResume(analysis);
  const family = getJobFamily(jobType);
  const primary = safeSkills[0] || transferable[0] || "assigned tasks";
  const secondary = safeSkills[1] || transferable[1] || "workplace procedures";
  const third = safeSkills[2] || transferable[2] || "team support";

  if (analysis.diagnosis?.type === "weak_evidence") {
    const proof = (analysis.requiredTerms || proofTermsForJobType(jobType)).slice(0, 5).join(", ");
    return [
      `Do not add ${labelForJobType(jobType)} experience unless the resume can honestly prove it.`,
      proof ? `Add real proof first if you have it, such as ${proof}.` : "Add real job-specific proof first if you have it.",
      "Apply to roles closer to the experience already shown, or get the needed training before using job-specific wording."
    ].map(item => `• ${item}`).join("\n");
  }

  if (analysis.diagnosis?.type === "wrong_job_type") {
    return [
      `Switch the job type to ${analysis.mismatch?.suggestedLabel || "the closer role"} and run the scan again for a more accurate report.`,
      `Keep only proven resume skills such as ${transferable.slice(0, 3).join(", ") || "reliability, safety, and communication"}.`,
      "Do not force this resume into the wrong job category just to raise the score."
    ].map(item => `• ${item}`).join("\n");
  }

  if (analysis.diagnosis?.type === "transferable") {
    return [
      `Used ${primary} and ${secondary} to complete assigned work while following workplace expectations.`,
      `Applied ${third}, communication, and attention to detail to support daily operations.`,
      "Worked in changing environments while staying reliable, organized, and focused on honest transferable strengths."
    ].map(item => `• ${item}`).join("\n");
  }

  const familyBullets = {
    manufacturing: [
      `Operated, monitored, or supported production work using proven skills such as ${safeSkills.slice(0, 3).join(", ") || "machine operation, safety, and quality checks"}.`,
      `Followed safety, quality, and production procedures while completing tasks related to ${primary} and ${secondary}.`,
      `Kept work moving in a fast-paced environment by using documented experience with ${safeSkills.slice(2, 5).join(", ") || "equipment, materials, and teamwork"}.`
    ],
    warehouse: [
      `Supported warehouse or material handling work using proven skills such as ${safeSkills.slice(0, 3).join(", ") || "loading, unloading, and safety"}.`,
      `Followed instructions and safety procedures while handling tasks related to ${primary} and ${secondary}.`,
      `Maintained accuracy, reliability, and teamwork while supporting daily warehouse operations.`
    ],
    maintenance: [
      `Supported maintenance or repair work using proven skills such as ${safeSkills.slice(0, 3).join(", ") || "tools, troubleshooting, and repairs"}.`,
      `Completed assigned tasks while following safety procedures, work instructions, and quality expectations.`,
      `Used hands-on experience with ${primary} and ${secondary} to help solve problems and keep work moving.`
    ],
    apartment: [
      `Supported property or apartment maintenance work using proven skills such as ${safeSkills.slice(0, 3).join(", ") || "repairs, tools, and customer service"}.`,
      `Completed assigned repair or turnover tasks while following safety, cleanliness, and communication expectations.`,
      `Used hands-on experience with ${primary} and ${secondary} to support daily maintenance needs.`
    ],
    customer_service: [
      `Helped customers or team members using proven skills such as ${safeSkills.slice(0, 3).join(", ") || "communication, problem solving, and documentation"}.`,
      `Handled questions, issues, or assigned tasks with professionalism, patience, and attention to detail.`,
      `Used ${primary} and ${secondary} to support service goals while keeping communication clear.`
    ],
    healthcare_support: [
      `Supported healthcare-related work using only proven resume skills such as ${safeSkills.slice(0, 3).join(", ") || "patient care, documentation, and safety"}.`,
      `Followed safety, documentation, and privacy expectations while completing assigned care-support tasks.`,
      `Communicated clearly and stayed attentive to patient, resident, or team needs shown in the resume.`
    ],
    security: [
      `Supported safety or security work using proven skills such as ${safeSkills.slice(0, 3).join(", ") || "observation, documentation, and professionalism"}.`,
      `Followed site procedures while communicating clearly and documenting issues accurately.`,
      `Maintained professionalism, awareness, and reliability during assigned security responsibilities.`
    ],
    it_helpdesk: [
      `Supported technical or user-facing work using proven skills such as ${safeSkills.slice(0, 3).join(", ") || "troubleshooting, documentation, and customer service"}.`,
      `Followed step-by-step procedures to document issues, communicate clearly, and support problem solving.`,
      `Used ${primary} and ${secondary} to help users, teams, or systems stay productive.`
    ]
  };

  const bullets = familyBullets[family] || [
    `Used proven resume skills such as ${safeSkills.slice(0, 3).join(", ") || "reliability, communication, and safety"} to complete assigned work.`,
    `Followed instructions, workplace procedures, and daily expectations while supporting team goals.`,
    `Stayed dependable, organized, and focused on accurate work in situations related to ${primary} and ${secondary}.`
  ];

  return bullets.slice(0, 3).map(item => `• ${item}`).join("\n");
}

function buildSummary(jobType, analysis) {
  return buildStarterSummary(jobType, analysis);
}

function buildBullets(jobType, analysis) {
  return buildStarterBullets(jobType, analysis);
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

function renderKeywordGroup(container, title, items = [], note = "") {
  if (!container) return;
  items = Array.isArray(items) ? items : [];
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

function renderDiagnosis(container, analysis) {
  if (!container) return;
  container.innerHTML = "";

  const title = document.createElement("h4");
  title.textContent = analysis.diagnosis?.title || "Resume Direction";
  title.style.margin = "0 0 8px";
  title.style.color = "#f4f7fb";
  container.appendChild(title);

  const message = document.createElement("p");
  message.textContent = analysis.diagnosis?.message || "Use this report to improve ATS wording without adding anything you have not actually done.";
  message.style.margin = "0 0 10px";
  message.style.color = "#d6dbe6";
  message.style.lineHeight = "1.55";
  container.appendChild(message);

  const proof = document.createElement("p");
  const proofMatches = (analysis.proofMatches || []).map(item => item.term).slice(0, 6);
  proof.textContent = proofMatches.length
    ? `Resume proof found: ${proofMatches.join(", ")}.`
    : "Resume proof found: limited direct proof for this job type.";
  proof.style.margin = "0 0 10px";
  proof.style.color = "#a7b0bf";
  proof.style.lineHeight = "1.45";
  container.appendChild(proof);

  const direction = document.createElement("p");
  direction.textContent = analysis.directionNote || "Missing keywords are suggestions only. Add them only if they are true.";
  direction.style.margin = "0";
  direction.style.color = "#a7ffce";
  direction.style.lineHeight = "1.45";
  container.appendChild(direction);
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
  const resumeEl = document.getElementById("resumeText");
  const jobEl = document.getElementById("jobText");
  const jobTypeEl = document.getElementById("jobType");
  const resultsEl = document.getElementById("results");
  const rewriteEl = document.getElementById("rewrite");

  if (!resumeEl || !jobEl || !jobTypeEl || !resultsEl || !rewriteEl) {
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

  resultsEl.hidden = false;
  rewriteEl.hidden = false;
  const scoreValue = document.getElementById("scoreValue");
  const scoreMessage = document.getElementById("scoreMessage");
  const scoreBar = document.getElementById("scoreBar");
  if (scoreValue) scoreValue.textContent = analysis.score;
  if (scoreMessage) scoreMessage.textContent = getScoreMessage(analysis.score, analysis);
  if (scoreBar) scoreBar.style.width = `${analysis.score}%`;

  renderDiagnosis(document.getElementById("diagnosisOutput"), analysis);
  renderMissingKeywords(document.getElementById("missingKeywords"), analysis);
  renderMatchedKeywords(document.getElementById("matchedKeywords"), analysis);

  const flags = buildRedFlags(resumeText, jobText, analysis);
  const redFlags = document.getElementById("redFlags");
  if (redFlags) redFlags.innerHTML = flags.map(flag => `<li>${flag}</li>`).join("");

  const summaryOutput = document.getElementById("summaryOutput");
  const bulletOutput = document.getElementById("bulletOutput");
  if (summaryOutput) summaryOutput.textContent = buildSummary(jobType, analysis);
  if (bulletOutput) bulletOutput.textContent = buildBullets(jobType, analysis);

  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
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

let firebaseEnabled = false;
let firebaseLoadPromise = null;

async function setupFirebase() {
  if (firebaseLoadPromise) return firebaseLoadPromise;

  firebaseLoadPromise = (async () => {
    try {
      const configModule = await import("./firebase-config.js");
      const firebaseConfig = configModule.firebaseConfig;

      if (!hasFirebaseConfig(firebaseConfig)) {
        firebaseEnabled = false;
        return false;
      }

      const [appModule, authModule, firestoreModule] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
      ]);

      initializeApp = appModule.initializeApp;
      getAuth = authModule.getAuth;
      createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
      signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
      firebaseSignOut = authModule.signOut;
      onAuthStateChanged = authModule.onAuthStateChanged;
      updateProfile = authModule.updateProfile;
      sendPasswordResetEmail = authModule.sendPasswordResetEmail;

      getFirestore = firestoreModule.getFirestore;
      collection = firestoreModule.collection;
      addDoc = firestoreModule.addDoc;
      deleteDoc = firestoreModule.deleteDoc;
      doc = firestoreModule.doc;
      onSnapshot = firestoreModule.onSnapshot;
      query = firestoreModule.query;
      orderBy = firestoreModule.orderBy;
      serverTimestamp = firestoreModule.serverTimestamp;
      getDocs = firestoreModule.getDocs;
      writeBatch = firestoreModule.writeBatch;

      const firebaseApp = initializeApp(firebaseConfig);
      auth = getAuth(firebaseApp);
      db = getFirestore(firebaseApp);
      firebaseEnabled = true;
      return true;
    } catch (error) {
      console.warn("Account saving did not load. Analyzer still works:", error);
      firebaseEnabled = false;
      return false;
    }
  })();

  return firebaseLoadPromise;
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
    return true;
  } catch (error) {
    return false;
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
    return JSON.parse(storageGet("gmpt_current_user", "null") || "null");
  } catch (error) {
    storageRemove("gmpt_current_user");
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
    return JSON.parse(storageGet(getTrackerKey(), "[]") || "[]");
  } catch (error) {
    return [];
  }
}

function saveTracker(items) {
  storageSet(getTrackerKey(), JSON.stringify(items));
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
  if (switchBtn) switchBtn.onclick = () => setAuthMode(authMode === "create" ? "signin" : "create");
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
  try {
    if (authMode === "create") {
      await createAccount();
    } else {
      await signIn();
    }
  } catch (error) {
    console.error("Account button failed:", error);
    setAuthMessage(formatAuthError(error), "error");
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
    if (user) {
      navUser.textContent = `Signed in as ${user.name}`;
      accountStatus.textContent = `Signed in as ${user.name}`;
      accountNote.textContent = `${user.email} — saved on this device.`;
      trackerNote.textContent = `Tracking applications for ${user.name}.`;
      authCard.hidden = true;
      accountStatusCard.hidden = false;
      signOutBtn.hidden = false;
      accountForm.reset();
    } else {
      navUser.textContent = "Create or sign in";
      trackerNote.textContent = "You can use the tracker now. Sign in to keep your list separate.";
      authCard.hidden = false;
      accountStatusCard.hidden = true;
      signOutBtn.hidden = true;
    }
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

    storageSet("gmpt_current_user", JSON.stringify({ name, email, signedInAt: new Date().toISOString() }));
    document.getElementById("accountForm")?.reset();
    renderAccount();
    renderTracker();
    returnHomeAfterAuth("Signed in.");
    return;
  }

  const email = document.getElementById("userEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("userPassword")?.value || "";

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

  const name = document.getElementById("userName")?.value.trim();
  const email = document.getElementById("userEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("userPassword")?.value || "";

  if (!name || !email || !password) {
    setAuthMessage("Enter your name, email, and password to create an account.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.", "error");
    return;
  }

  if (!firebaseEnabled || !auth || !db) {
    storageSet("gmpt_current_user", JSON.stringify({ name, email, signedInAt: new Date().toISOString(), localOnly: true }));
    document.getElementById("accountForm")?.reset();
    renderAccount();
    renderTracker();
    returnHomeAfterAuth("Account created on this device. The analyzer and tracker are ready.");
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

  const email = document.getElementById("userEmail")?.value.trim().toLowerCase();
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
  try {
    if (firebaseEnabled && auth) {
      await firebaseSignOut(auth);
    }
  } catch (error) {
    console.warn("Cloud sign out failed. Clearing local session:", error);
  }

  storageRemove("gmpt_current_user");
  currentUser = null;
  renderAccount();
  renderTracker();
  closeMenu();
  document.getElementById("home")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const company = document.getElementById("company")?.value.trim();
  const role = document.getElementById("role")?.value.trim();
  if (!company || !role) return;

  const item = {
    date: new Date().toLocaleDateString(),
    company,
    role,
    pay: document.getElementById("pay")?.value.trim() || "",
    status: document.getElementById("status")?.value || "Saved"
  };

  if (firebaseEnabled && db && currentUser) {
    try {
      await addDoc(collection(db, "users", currentUser.uid, "applications"), {
        ...item,
        createdAt: serverTimestamp()
      });
      event.target.reset();
      return;
    } catch (error) {
      console.error("Cloud tracker save failed. Saving locally instead:", error);
    }
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
  const scoreValue = document.getElementById("scoreValue");
  const scoreMessage = document.getElementById("scoreMessage");
  if (scoreValue) scoreValue.textContent = "0";
  if (scoreMessage) scoreMessage.textContent = "";

  document.getElementById("missingKeywords")?.replaceChildren();
  document.getElementById("matchedKeywords")?.replaceChildren();
  document.getElementById("redFlags")?.replaceChildren();
  document.getElementById("summaryOutput")?.replaceChildren();
  document.getElementById("bulletOutput")?.replaceChildren();
}

function copyTextFallback(value) {
  const text = String(value || "");
  if (!text) return Promise.resolve(false);
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
  textarea.remove();
  return Promise.resolve(ok);
}

function toggleDrawerPanel(button) {
  const targetId = button?.getAttribute("data-drawer-page");
  const targetPanel = targetId ? document.getElementById(targetId) : null;
  const isOpen = targetPanel && !targetPanel.hidden;

  document.querySelectorAll(".drawer-page-panel").forEach(panel => {
    panel.hidden = true;
  });
  document.querySelectorAll(".drawer-page-button").forEach(item => {
    item.classList.remove("active");
  });

  if (targetPanel && !isOpen) {
    targetPanel.hidden = false;
    button.classList.add("active");
  }
}

function openAccountDrawer(event) {
  event?.preventDefault?.();
  setAuthMode("create");
  openMenu();
}

function bindButton(id, handler) {
  const button = document.getElementById(id);
  if (!button) return;
  button.type = button.type || "button";
  button.onclick = event => {
    event.preventDefault();
    try {
      const result = handler(event);
      if (result?.catch) result.catch(error => {
        console.error(`${id} failed:`, error);
        alert("Something went wrong. Refresh the page and try again.");
      });
    } catch (error) {
      console.error(`${id} failed:`, error);
      alert("Something went wrong. Refresh the page and try again.");
    }
  };
}

let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

  bindButton("analyzeBtn", analyzeAndRender);
  bindButton("clearBtn", clearAnalyzer);
  bindButton("menuToggle", () => {
    const navMenu = document.getElementById("navMenu");
    if (navMenu?.classList.contains("open")) closeMenu();
    else openMenu();
  });
  bindButton("menuClose", closeMenu);
  bindButton("passwordResetBtn", resetPassword);
  bindButton("signOutBtn", signOut);
  bindButton("exportTrackerBtn", exportTrackerCSV);
  bindButton("clearTrackerBtn", clearTracker);

  document.getElementById("menuBackdrop")?.addEventListener("click", closeMenu);
  document.querySelectorAll("#navMenu .menu-item").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
  document.querySelectorAll("[data-open-account]").forEach(button => {
    button.onclick = openAccountDrawer;
  });
  document.querySelectorAll("[data-drawer-page]").forEach(button => {
    button.onclick = () => toggleDrawerPanel(button);
  });

  document.querySelectorAll(".copy-button").forEach(button => {
    button.onclick = async event => {
      event.preventDefault();
      const target = document.getElementById(button.dataset.copy);
      const old = button.textContent;
      await copyTextFallback(target?.textContent || "");
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = old), 1200);
    };
  });

  document.getElementById("togglePasswordBtn")?.addEventListener("click", () => {
    const input = document.getElementById("userPassword");
    const button = document.getElementById("togglePasswordBtn");
    if (!input || !button) return;
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
  });

  const accountForm = document.getElementById("accountForm");
  if (accountForm) {
    accountForm.onsubmit = handleAccountSubmit;
  }
  const trackerForm = document.getElementById("trackerForm");
  if (trackerForm) {
    trackerForm.onsubmit = addApplication;
  }
  const trackerRows = document.getElementById("trackerRows");
  if (trackerRows) {
    trackerRows.onclick = deleteApplication;
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  setAuthMode("create");
  renderAccount();
  renderTracker();
  window.GMPT_APP_READY = true;

  setupFirebase().then(isReady => {
    if (isReady) {
      initAuthListener();
    } else {
      renderAccount();
      renderTracker();
    }
  }).catch(error => {
    console.warn("Account setup failed. Analyzer and local tracker still work:", error);
    firebaseEnabled = false;
    renderAccount();
    renderTracker();
  });
}

document.addEventListener("DOMContentLoaded", init);
