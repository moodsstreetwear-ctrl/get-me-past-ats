# GET ME PAST ATS

A simple browser-based MVP that helps job seekers compare their resume against a job description.

It gives users:

- An ATS-style match score
- Missing job-post keywords
- Keywords already showing up in the resume
- Recruiter red flags
- Copy-ready summary wording
- Copy-ready resume bullet ideas
- A local application tracker

This is a starter prototype, not a guarantee of an interview. The goal is to help people stop applying blind and make their resume match the role more clearly.

## How to run it

For GitHub Pages, upload the files and open the live site link.

For local testing, run a small local server because this version uses JavaScript modules:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## How to put it on GitHub Pages

1. Create a new GitHub repository named `get-me-past-ats`.
2. Upload these files to the repository.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Save.

GitHub will give you a live website link.

## Project files

- `index.html` — app layout
- `styles.css` — design and responsive styling
- `app.js` — keyword analysis, score logic, rewrite output, and tracker storage
- `sample-resume.txt` — demo resume content
- `sample-job-description.txt` — demo job post content
- `docs/product-plan.md` — product vision and future features

## MVP features

### Resume analyzer
Paste a resume and a job description. The app extracts important words from the job description and checks whether the resume includes them.

### 25 job type presets
The app includes presets for:

- Remote customer support
- Data entry and clerical
- Customer service and call center
- Warehouse and forklift
- Manufacturing and machine operator
- Apartment maintenance and property maintenance
- Construction, electrician helper, welding, diesel, CDL, security, healthcare support, hospitality, food service, janitorial, retail, admin, apprenticeships, and more
- Warehouse / forklift jobs
- Construction / carpentry jobs
- Electrician apprentice jobs
- Welding / fabrication helper jobs
- Diesel mechanic / heavy equipment jobs
- Security officer jobs
- Remote entry-level / customer support jobs
- Trade apprenticeship jobs
- Rail / industrial jobs

### Recruiter red flags
The app checks for common issues like:

- Missing dates
- Multiple current jobs
- Missing sections
- Resume too thin
- No measurable proof
- Safety or fast-paced wording missing when the job post asks for it

### Application tracker
Users can save jobs they applied to. It stores data in the browser using localStorage.

## Next features to build

- PDF resume upload
- Better date overlap detection
- AI rewrite mode
- PDF resume upload
- Better date overlap detection
- Export tailored resume as PDF
- Follow-up email generator
- Company contact finder
- Interview question generator

## Brand angle

**GET ME PAST ATS** is for people who are tired of applying to 100 jobs and never hearing back. It speaks plain language and tells users what to fix before they waste another application.


## 50 Job Type Update

The dropdown now includes 50 common job titles across office, remote, warehouse, trades, manufacturing, hospitality, healthcare, education, HR, accounting, IT, and cybersecurity roles.

## Local sign-in and tracker update

This version adds a simple starter sign-in panel.

What it does now:

- Lets a user sign in with name and email
- Keeps each user's application tracker separate on the same browser
- Saves tracked jobs with localStorage
- Lets users export their tracker as a CSV file
- Lets users clear their tracker

Important: this is a local browser sign-in, not real cloud authentication. It does not sync across phones, computers, or browsers yet. To make real accounts, add Firebase Auth, Supabase Auth, or another backend/database.


## Firebase cloud login version

This version includes Firebase Authentication and Firestore support.

Upload these files to GitHub after inserting your Firebase config:

- `index.html`
- `app.js`
- `styles.css`
- `firebase-config.js`

Read `FIREBASE_SETUP.md` for setup steps and use `firestore.rules.txt` for Firestore security rules.


## Latest UX update

- Clean hamburger menu
- Account form moved into the menu
- Create account and sign in are separate views
- No Firebase wording shown to users
- After sign in or account creation, users return to the top of the page
