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

Open `index.html` in your browser.

No install required. No backend required. No API key required.

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

### Job type presets
The app includes presets for:

- General jobs
- Manufacturing / machine operator jobs
- Maintenance / electrical helper jobs
- CDL / logistics jobs
- Entry-level / paid training jobs

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
- Login accounts
- Cloud application tracker
- Export tailored resume as PDF
- Follow-up email generator
- Company contact finder
- Interview question generator

## Brand angle

**GET ME PAST ATS** is for people who are tired of applying to 100 jobs and never hearing back. It speaks plain language and tells users what to fix before they waste another application.
