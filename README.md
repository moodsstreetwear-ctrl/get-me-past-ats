# GET ME PAST ATS

A browser-based resume and job-post analyzer built for people who are tired of applying to jobs and never hearing back.

The app helps job seekers compare a resume against a real job description, spot ATS keyword gaps, understand whether the resume proves the role well enough for a recruiter, and track applications in one place.

This is a starter product, not a guarantee of an interview. The goal is to help users stop applying blind and make better decisions before they waste another application.

## What it does now

- Detects the real job type from the job description
- Compares ATS keyword fit against human recruiter proof
- Gives an application priority grade before the user applies
- Shows hard requirements and possible hiring gates
- Flags missing proof, weak evidence, and risky wording
- Gives safe resume summary and bullet wording only when the resume proves it
- Warns users not to fake licenses, tools, years of experience, or job-specific claims
- Includes a local account panel for separating saved trackers by user
- Lets users save applications in the tracker
- Lets users export tracked applications as a CSV file

## Core product sections

### Resume Analyzer

Paste a resume and a full job description. The app detects the job family, checks important terms, separates keyword match from proof strength, and gives a clearer apply decision.

### Real Job Type Detector

The app does not depend on the user choosing a job category first. It reads the job description and tries to identify what the job really is, even when the title is vague or misleading.

### ATS + Recruiter Fit

ATS fit shows keyword coverage. Recruiter fit shows whether the resume actually proves the job well enough for a person to believe it.

### Application Priority Engine

The report helps users decide whether a job should be applied to now, fixed first, confirmed first, or skipped for now.

### Keyword Proof Coach

The coach tells users what a missing keyword would need as real proof before adding it to a resume. The rule is simple: rewrite wording, not reality.

### Application Tracker

Users can save company, role, pay, status, and application date. Tracker data is stored in the browser and can be exported as a CSV file.

## Job families covered

The analyzer includes support for common entry-level, industrial, trade, office, customer-service, healthcare, driving, and technical roles, including:

- Manufacturing and machine operator
- Warehouse and forklift
- Apartment maintenance and facilities maintenance
- Electrical helper and apprentice electrician
- Welding and fabrication helper
- Diesel mechanic and heavy equipment helper
- Construction, carpentry, and installation
- CDL, delivery, and route-driver jobs
- Security officer
- Janitorial and housekeeping
- Food service and hospitality
- Customer service, call center, and retail
- Data entry, office assistant, admin, HR, and bookkeeping
- Healthcare support and medical office roles
- Education support
- IT help desk and cybersecurity support

## Local setup

Run a small local server because the app uses JavaScript modules:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages setup

1. Open the repository settings.
2. Go to **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/root` folder.
5. Save.

GitHub will provide the live website link after deployment.

## Project files

- `index.html` — app layout and sections
- `styles.css` — design and responsive styling
- `app.js` — analyzer, scoring, safe rewrite logic, auth panel behavior, and tracker storage
- `firebase-config.js` — starter config file for future Firebase setup
- `FIREBASE_SETUP.md` — notes for connecting real cloud accounts
- `firestore.rules.txt` — starter Firestore security rules
- `privacy.html` — privacy policy page
- `terms.html` — terms of use page
- `docs/product-plan.md` — product roadmap and build plan

## Current account note

The visible account panel is still a starter setup. Tracker data is saved in the browser. Real cross-device sign-in requires connecting Firebase Auth, Supabase, or another backend/database.

## Next features to build

- PDF resume upload
- Export tailored resume as PDF
- Saved scan reports
- Follow-up email generator
- Interview question generator
- Company contact finder
- Real cloud login and synced tracker
- Stronger mobile layout testing

## Brand angle

**GET ME PAST ATS** is for regular people who are qualified, willing to work, and ready to learn, but whose resumes never reach a real person. The app speaks plainly, tells users what is missing, and helps them apply with a better strategy.
