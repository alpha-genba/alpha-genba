# Alpha Genba: The Complete Development Guide

**How the Alpha Automations website was built, from the very first command to a working full-stack platform, and how to take it online, market it, and show it on LinkedIn.**

Written for Vachana. Read it once from top to bottom, then come back to any section when you need it. By the end you should be able to explain every part of this project in an interview.

---

## Contents

**Part A: Understanding**
1. [What is full-stack web development?](#1-what-is-full-stack-web-development)
2. [How the web works](#2-how-the-web-works)
3. [The big picture of this project](#3-the-big-picture-of-this-project)
4. [Tools and technologies, and why](#4-tools-and-technologies-and-why)

**Part B: What was built, step by step**

5. [The journey from day 1](#5-the-journey-from-day-1)
6. [The website pages](#6-the-website-pages)
7. [The owner's admin panel](#7-the-owners-admin-panel)
8. [The backend and database](#8-the-backend-and-database)
9. [How one request travels through the system](#9-how-one-request-travels-through-the-system)
10. [Security](#10-security)
11. [Design and smooth UX](#11-design-and-smooth-ux)
12. [Testing and checking](#12-testing-and-checking)
13. [Every file explained](#13-every-file-explained)

**Part C: Going further**

14. [Running it on your laptop](#14-running-it-on-your-laptop)
15. [Saving it to GitHub (the alpha-genba organisation)](#15-saving-it-to-github-the-alpha-genba-organisation)
16. [Putting the website online for everyone](#16-putting-the-website-online-for-everyone)
17. [Getting found on Google](#17-getting-found-on-google)
18. [Marketing Alpha Automations](#18-marketing-alpha-automations)
19. [Showcasing it on LinkedIn and GitHub](#19-showcasing-it-on-linkedin-and-github)
20. [Interview questions to prepare](#20-interview-questions-to-prepare)
21. [Glossary](#21-glossary)

---

# Part A: Understanding

## 1. What is full-stack web development?

A website that only shows information (like a brochure) needs just a **frontend**. A website that **remembers things**, like enquiries from clients, projects added by the owner, or progress updates, needs three layers working together. Building all three layers yourself is called **full-stack development**.

Think of a restaurant:

| Restaurant | Web application | In this project |
|---|---|---|
| **Dining room**: what customers see and touch | **Frontend**: pages, buttons, forms in the browser | Next.js website (`web/`) |
| **Kitchen**: where the work happens, hidden from customers | **Backend**: the server that checks, decides and processes | Go API server (`backend/`) |
| **Store room**: where everything is kept | **Database**: permanent storage | PostgreSQL |
| **Waiter**: carries orders between dining room and kitchen | **API**: the agreed list of requests and answers | `/api/...` addresses |

**Frontend developers** make things look good and feel smooth. **Backend developers** make things correct, fast and secure. **Full-stack developers** understand both, and how they connect. That connection is where most real-world bugs and design decisions happen.

What a full-stack developer works with:
- **Frontend:** HTML (structure), CSS (style), JavaScript/TypeScript (behaviour), a framework like React/Next.js
- **Backend:** a server language (Go here; others use Java, Python, Node.js), APIs, authentication, file uploads
- **Database:** tables, SQL queries, data design
- **Everything around it:** Git, testing, security, deployment (putting it online), performance

## 2. How the web works

### Requests and responses
Every time you open a page, click a button or send a form, the browser sends an **HTTP request** to a server, and the server sends back an **HTTP response**.

A request has:
- a **method**, meaning what you want to do:
  - `GET`: read ("give me the projects")
  - `POST`: create ("save this enquiry")
  - `PUT`: replace ("update this project")
  - `PATCH`: change part of something ("change this enquiry's status")
  - `DELETE`: remove
- a **path**: which thing, e.g. `/api/projects`
- optional **headers** (extra information, like cookies) and a **body** (the data sent)

A response has a **status code**:

| Code | Meaning | Where it appears in this project |
|---|---|---|
| `200` | OK | Data loaded |
| `201` | Created | Enquiry saved, photo uploaded |
| `400` | Bad request | Body wasn't valid JSON |
| `401` | Unauthorized | Admin page used without logging in |
| `404` | Not found | Wrong project address |
| `413` | Too large | Video over 300 MB |
| `415` | Unsupported type | Someone uploaded a `.exe` instead of a photo |
| `422` | Invalid | Form has errors (e.g. phone missing) |
| `429` | Too many requests | Too many enquiries or login attempts |
| `500` | Server error | Something broke on the server |

### JSON
Data travels as **JSON**, text that looks like this:
```json
{ "name": "Ravi", "phone": "+91 90000 00000", "message": "We need a screwing station." }
```

### Domain names and hosting
- A **server** is a computer that is always on and connected to the internet.
- **Hosting** means renting such a computer (or space on one).
- A **domain name** (like `alphaautomations.in`) is the easy-to-remember name that points to that server, like a contact name pointing to a phone number. The system that translates names to server addresses is called **DNS**.
- **HTTPS** (the padlock in the browser) encrypts traffic so nobody in between can read passwords or forms.

## 3. The big picture of this project

**Alpha Automations** is a hardware company: it designs and builds automated machines and PLC control panels. **Alpha Genba** is the software platform built for it. Today it has three audiences:

| Who | What they do |
|---|---|
| **Visitors / potential clients** | Learn about the company, browse completed projects and services, send an enquiry |
| **Existing clients** | Follow their own machine being built through a **private link** (progress %, stage, photos, videos) |
| **The owner and team** | Log in, manage enquiries, publish completed projects, post progress updates with photos and videos |

```
                   ┌──────────────────────────────────┐
  Visitors,  ───►  │  Website (Next.js, port 3000)     │
  clients,         │  pages + forwards /api requests   │
  owner            └────────────────┬─────────────────┘
                                    │ /api/...
                   ┌────────────────▼─────────────────┐
                   │  Backend (Go, port 8080)          │
                   │  rules, login, validation, uploads│ ──► uploaded photos & videos (files)
                   └────────────────┬─────────────────┘
                                    │ SQL
                   ┌────────────────▼─────────────────┐
                   │  PostgreSQL (port 5433)           │
                   │  enquiries, projects, updates     │
                   └──────────────────────────────────┘
```

**Key idea:** the browser only ever talks to **one address** (`localhost:3000`, later `alphaautomations.in`). Next.js forwards anything starting with `/api` to the Go backend. This is called a **proxy** or **rewrite**. It keeps login cookies simple and safe.

**Future (planned):** live machine monitoring. The `simulator/` folder already contains a tested factory simulator with real OEE maths. When a real PLC is connected through an edge gateway, this becomes Part 2 of the platform from the README.

## 4. Tools and technologies, and why

| Tool | What it is | Why it was chosen |
|---|---|---|
| **Go** | Programming language by Google | Fast, simple, excellent built-in web server, compiles to one file. Also ideal for the future gateway that will run next to PLCs. |
| **TypeScript** | JavaScript with types | Catches mistakes before the code runs |
| **React** | Library for building pages from components | Industry standard for interactive interfaces |
| **Next.js 16** | Framework built on React | Folder-based pages, server rendering (good for Google), page transitions, the `/api` proxy |
| **Tailwind CSS** | Styling with small class names | Fast, consistent design without separate CSS files |
| **PostgreSQL** | Database | Reliable, used by big companies, supports lists (`TEXT[]`) and JSON (`JSONB`) |
| **pgx** | Go library for PostgreSQL | The most popular, fastest PostgreSQL driver for Go |
| **embedded-postgres** | Go library | Starts a real PostgreSQL automatically in development, so nothing to install |
| **IBM Plex Sans** | Font | Designed for engineering, which suits an industrial company |
| **lucide-react** | Icon library | Clean, consistent line icons |
| **Git + GitHub** | Version control and hosting | History of every change, branches, pull requests |
| **npm** | JavaScript package manager | Installs Next.js, React and other libraries |
| **VS Code** | Code editor | Free, with excellent Go and TypeScript support |

---

# Part B: What was built, step by step

## 5. The journey from day 1

### Step 1: Planning (before any code)
- Read the **Alpha Automations catalogue**: Mitsubishi Q/FX PLCs, servo drives and VFDs, Siemens PLCs, pneumatics, panel wiring and Poka-Yoke, Andon, HMI with FL-net/Profibus, screwing, vision/scanning/printing.
- Chose a **flagship idea** connected to Japan (your internship goal): *Genba (現場)*, "the actual place", from the Toyota Production System.
- Chose the **tech stack**: Go + TypeScript/Next.js + PostgreSQL.

### Step 2: Setting up the computer
1. Installed **Go** (`go version` → `go1.27.2`).
2. Installed **Node.js** (gives `node`, `npm`, `npx`).
3. Used **VS Code** with the Go extension, and **Git**.
4. Learned the first debugging lessons: *"not recognized"* means the program isn't installed **or** the terminal was opened before installing it; *"expected 'package', found 'EOF'"* meant the file wasn't saved.

### Step 3: GitHub organisation and first commit
1. Created the GitHub **organisation** `alpha-genba` and the repository `alpha-genba` (private).
2. `go mod init github.com/alpha-genba/alpha-genba` registered the Go project.
3. Wrote a hello-world program and made the **first commit**, then pushed it to GitHub.

### Step 4: The flagship README
Wrote `README.md`: the problem, the solution, architecture diagrams (Mermaid, which GitHub draws automatically), the tech stack and the roadmap. Your brother reviewed and approved it. This was done on a **branch** and merged into `main`, the professional workflow.

### Step 5: The website skeleton
`npx create-next-app@latest web` created the Next.js project with TypeScript, Tailwind and ESLint. The first hero section was built and committed.

### Step 6: The first full version (demo)
Built the Go backend with PostgreSQL, the contact form, project records, an admin panel and a simulated live monitoring dashboard. Everything was tested in the browser.

### Step 7: The big redesign, based on your feedback
You asked for:
- Home = about you and Alpha Automations
- Projects = completed projects, managed by the owner
- Services = clarity about what automation gives clients
- Ongoing projects = live progress with photos, videos and percentages, added by the owner
- Contact = client details + company address, phone and email
- An admin page to manage everything and update clients
- Sky blue and white, bigger text, smooth UX

So the backend gained **ongoing projects**, **progress updates**, **photo and video uploads**, **private client links** and **team notes on enquiries**. The phone number became **required** on the contact form.

### Step 8: Making it official, not a demo
You said it looked like a demo and AI-made. So:
- The **fake live demo was removed**. Its simulated data confused visitors.
- A visible **Owner login** button was added to the top menu.
- The **design was rebuilt like industrial company websites** (Siemens, ABB, Festo style): contact strip at the top, straight edges instead of bubbles, an engineering font, a dark capabilities bar, photo-led sections, no soft blobs or gradients.
- **Photo slots** were added, easy to fill with real photos later.
- The logo became the **α (alpha) symbol**.
- **Google-readiness** was added: site icon, `sitemap.xml`, `robots.txt`, page titles and descriptions, and structured company data (name, address, phone) that Google reads.

## 6. The website pages

In Next.js, **folders become web addresses**:
```
web/app/page.tsx                  →  /
web/app/projects/page.tsx         →  /projects
web/app/projects/[slug]/page.tsx  →  /projects/auto-screwing-station   ([slug] is a variable)
web/app/services/page.tsx         →  /services
web/app/ongoing/page.tsx          →  /ongoing
web/app/ongoing/[slug]/page.tsx   →  /ongoing/servo-press-line
web/app/track/[token]/page.tsx    →  /track/<secret>   (a client's private page)
web/app/contact/page.tsx          →  /contact
web/app/admin/page.tsx            →  /admin            (owner login + admin panel)
```

| Page | What's on it |
|---|---|
| **Home** | Hero with photo slot, capabilities bar, About us (Engineering · Design · Implementation), 6 services, the Genba approach (4 steps), recent completed projects, ongoing projects, why choose us, technologies, call-to-action |
| **Projects** | Every published completed project. Each one opens to: the problem at the genba → what was built → the result, a photo gallery and technologies used. |
| **Services** | What automation gives you (6 benefits), all 10 services explained (what it is, what you get, typical uses), how we work, industries, FAQ |
| **Ongoing Projects** | Machines being built: stage, progress bar, last update. Each one opens to a stage tracker (Design → Manufacturing → Assembly → Testing → Installation → Completed) and a timeline of updates with photos and videos. |
| **Private client page** | The same view as an ongoing project, but reachable only by its secret link, and hidden from Google |
| **Contact** | Phone, email, address with a Google Maps link, and the enquiry form (name, phone, company, email, industry, message) |
| **Owner login / Admin** | See [section 7](#7-the-owners-admin-panel) |

📘 **Concept: Server vs Client Components.**

| | Server Component (default) | Client Component (`"use client"` at the top) |
|---|---|---|
| Runs | On the server | In the visitor's browser |
| Good for | Loading data, Google search, fast first load | Clicks, typing, menus, uploads |
| Examples | Home, Projects, Services pages | Navbar, contact form, photo viewer, admin panel |

📘 **Concept: Suspense.** Projects come from the database at request time. Next.js 16 (with *Cache Components*) requires slow data to be wrapped in `<Suspense fallback={...}>`. The page appears **instantly** with a grey placeholder, and the real data "streams in" a moment later.

📘 **Concept: components and props.** A component is a function that returns a piece of the page. `ProjectCard`, `OngoingCard`, `ServiceCard`, `Photo` and `ProgressBar` are each written once and reused. **Props** are their inputs: `<ProgressBar value={60} />`.

📘 **Concept: hooks.** `useState` remembers values that change ("is the form sending?"). `useEffect` runs code after a component appears ("watch the scroll position").

## 7. The owner's admin panel

Opened with **Owner login** in the top menu. It has three tabs:

**Client enquiries**
- Every form submission, newest first
- Filter: Open, New, Contacted, Won, Lost, Archived
- Change status with a dropdown; call or email with one click
- A **private team note** per enquiry (e.g. "Visiting their plant on Monday"), which saves automatically when you click away

**Ongoing projects**
1. **New ongoing project**: title, client name (optional), industry, stage, progress slider, expected completion date, cover photo, and **Private** or **Public**
2. Open a project to:
   - **Copy the client's private link** and send it on WhatsApp or email
   - **Post an update**: what happened, details, new progress %, stage, photos and videos. Uploads show a live progress bar.
   - See and delete past updates
3. Posting an update automatically moves the project's progress and stage forward.

**Completed projects**
- Title, industry, completion date, summary, main photo, *problem → what we built → result*, photo gallery, technologies
- **Published** controls whether it appears on the website

## 8. The backend and database

### The API (the backend's list of addresses)

| Method | Path | Who | What it does |
|---|---|---|---|
| `GET` | `/api/health` | Anyone | Is the server and database OK? |
| `GET` | `/api/projects`, `/api/projects/{slug}` | Anyone | Published completed projects |
| `GET` | `/api/ongoing`, `/api/ongoing/{slug}` | Anyone | Public ongoing projects with updates |
| `GET` | `/api/track/{token}` | Anyone with the link | A client's project, even if private |
| `GET` | `/api/uploads/{file}` | Anyone | An uploaded photo or video |
| `POST` | `/api/enquiries` | Anyone | Save an enquiry |
| `POST` | `/api/admin/login`, `/logout` | Anyone | Log in / out |
| `GET`, `PATCH` | `/api/admin/enquiries[/{id}]` | Owner | List enquiries, change status or note |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/projects[/{id}]` | Owner | Manage completed projects |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/ongoing[/{id}]` | Owner | Manage ongoing projects |
| `POST`, `DELETE` | `/api/admin/ongoing/{id}/updates`, `/api/admin/updates/{id}` | Owner | Post or delete updates |
| `POST` | `/api/admin/uploads` | Owner | Upload a photo (≤10 MB) or video (≤300 MB) |

Routes are registered with Go's built-in router:
```go
mux.HandleFunc("POST /api/enquiries", app.handleCreateEnquiry)
mux.HandleFunc("GET /api/ongoing/{slug}", app.handleGetPublicOngoing)
```
Owner-only routes are wrapped in `app.requireAdmin(...)`, a function that checks the login before running the real handler. This pattern is called **middleware**.

### The database tables (`backend/schema.sql`)

| Table | What it stores |
|---|---|
| `enquiries` | Name, company, email, phone, industry, message, status (`new`/`contacted`/`won`/`lost`/`archived`), team note, date |
| `projects` | Completed projects: slug (unique web address), title, industry, summary, problem, solution, result, technologies (a list), main photo, gallery (a list), completion date, published |
| `ongoing_projects` | Title, client, industry, summary, stage, progress (0–100, enforced by the database), expected completion, cover photo, public/private, secret share token |
| `project_updates` | Linked to an ongoing project: title, message, progress, stage, photos/videos (stored as JSON), date. Deleting a project deletes its updates automatically (`ON DELETE CASCADE`). |

📘 **Concept: constraints.** The database itself refuses bad data, for example `CHECK (progress BETWEEN 0 AND 100)`. Even if the code had a bug, the database would stop a 150% progress value.

📘 **Concept: transactions.** Posting an update does two things: it saves the update **and** moves the project's progress. A **transaction** makes sure both happen or neither does, never half.

📘 **Concept: SQL parameters.** User input is never glued into SQL text. Placeholders like `$1, $2` are used instead, which prevents **SQL injection**, one of the most common attacks.

### File uploads (`backend/uploads.go`)
1. The admin panel sends the file with `XMLHttpRequest`, which (unlike `fetch`) reports upload progress for the progress bar.
2. The backend reads the **first bytes** of the file to detect its real type. A renamed `.exe` is rejected even if it's called `photo.jpg`.
3. Photos may be up to 10 MB and videos up to 300 MB.
4. The file is saved under a **random name** (e.g. `4e5c…d5.png`) so names can't clash or be guessed.
5. Files are served with support for **range requests**, so videos can be skipped forward and back.
6. When a project or update is deleted, its files are deleted too.

**Two problems found and fixed while testing:**
- Big uploads failed after exactly 15 seconds. Testing straight against the backend (it worked in 0.05 s) showed the cause: Next.js forwards at most **10 MB** by default. Fixed with `proxyClientMaxBodySize: "320mb"` in `next.config.ts`.
- The Go server's normal 15-second limits would cut off slow uploads, so the upload handler extends its own time limit to 10 minutes.

### The development database
If `DATABASE_URL` is empty, `db.go` starts a real PostgreSQL 17 on port 5433, with data in `.devdata/`. Problems found and fixed:
1. On Windows it chose the `WIN1252` text encoding, which can't store Kannada, Hindi or Japanese, so it's forced to **UTF-8**.
2. If the backend is killed without Ctrl+C, PostgreSQL keeps running and blocks the next start, so `stopLeftoverDevDatabase` stops it first.
3. The library wipes its "runtime" folder on every start, so the data folder is kept **outside** it. Otherwise all enquiries would vanish on restart.

## 9. How one request travels through the system

**Example: a factory owner sends an enquiry.**
```
① Browser: ContactForm.tsx
   Clicks "Send enquiry" → form fields become JSON
   fetch("/api/enquiries", { method: "POST", body })
        │
② Next.js (port 3000): next.config.ts rewrite
   /api/:path*  →  http://localhost:8080/api/:path*
        │
③ Go backend: main.go routes → handleCreateEnquiry
   a. Rate limit: more than 5 from this network in 10 minutes?      → 429
   b. readJSON: really JSON? under 64 KB? no unknown fields?        → 400
   c. Honeypot: did a bot fill the hidden "website" field?           → fake success
   d. validate(): name? valid phone? message ≥ 10 characters?        → 422 + messages per field
        │
④ enquiryStore.create → SQL INSERT with $1..$6 → PostgreSQL saves the row
        │
⑤ Backend replies 201 {"ok": true}
        │
⑥ The form shows "Thank you, we've received your details"
        │
⑦ Later: the owner logs in → Client enquiries tab → sees it, calls the client, adds a note
```

**Example: the owner posts a progress update with a video.**
```
① Admin panel: choose video → uploadFile() sends it, progress bar fills → backend saves it, replies with its URL
② Owner writes "Frame welded", sets 60%, stage Assembly → POST /api/admin/ongoing/{id}/updates
③ Backend: is the session cookie valid? → validate → transaction: save update + set project to 60% / Assembly
④ The client opens their private link → GET /api/track/{token} → sees the new update and video
```

## 10. Security

| Feature | Where | What it protects against |
|---|---|---|
| Input validation | `validate()` functions | Bad or huge data |
| Database constraints | `schema.sql` | Impossible values even if code has a bug |
| SQL placeholders | All store functions | SQL injection |
| Body size limit (64 KB for forms) | `readJSON` | Huge requests crashing the server |
| Reject unknown fields | `readJSON` | Sneaky extra data |
| JSON-only requests | `readJSON` | CSRF (other websites submitting forms as you) |
| Rate limiting | `rateLimiter` | Spam (5 enquiries / 10 min) and password guessing (10 logins / 15 min) |
| Honeypot field | Contact form | Spam bots |
| Constant-time password check | `passwordMatches` | Guessing a password from response timing |
| Signed session cookie (HMAC-SHA256) | `auth.go` | Forged or edited logins |
| HttpOnly + SameSite cookie | `setSessionCookie` | Scripts stealing the login; other sites using it |
| Upload type detected from content | `uploads.go` | Malicious files disguised as photos |
| Random upload names + strict name check | `uploads.go` | Guessing files; `../` path tricks |
| Secret 32-character client links | `share_token` | Strangers finding private projects |
| Secret token never sent publicly | `hideToken` | Leaking a private link through the public API |
| `noindex` + `robots.txt` | Admin and private pages | These pages showing up on Google |
| Secrets in `backend/.env`, ignored by Git | `.gitignore` | Passwords leaking on GitHub |
| Generic error messages | `serverError` | Revealing internal details |

## 11. Design and smooth UX

**Design direction:** modelled on how large industrial companies present themselves:
- **Contact strip** at the very top (location, phone, email)
- **Straight edges** and thin borders instead of rounded bubbles
- **IBM Plex Sans**, an engineering typeface
- **Sky blue `#0284c7` + white**, with dark slate for contrast bands
- **18 px base text** (larger than the usual 16 px) for easy reading
- **Photo-led sections**, with neat technical-drawing placeholders until real photos arrive
- An active-page underline in the menu, and a visible **Owner login**

**Smoothness, and how each part is done:**

| Effect | How |
|---|---|
| Pages crossfade when you navigate | React `<ViewTransition>` (built into Next.js 16), wrapped in `components/Page.tsx`; the header stays still |
| Sections fade up as you scroll | `components/Reveal.tsx` with `IntersectionObserver`. Content already on screen is **never** hidden, so there's no blank flash. |
| Hero appears instantly with a soft rise | Pure CSS animation (`.rise-in`), which runs before JavaScript loads |
| Progress bars fill when they appear | CSS `@keyframes grow` |
| Menu opens smoothly on phones | CSS grid height animation |
| Data loads without blocking the page | `<Suspense>` with grey skeletons |
| Full-screen photo/video viewer | `MediaGallery.tsx`: arrow keys, Escape, swipe-friendly buttons |
| Respecting users who dislike motion | All animations switch off under `prefers-reduced-motion` |

**Bug found and fixed:** the first animation version hid content until JavaScript started, so the hero was blank for a moment on load. Fixed by only hiding sections that are below the screen.

## 12. Testing and checking

| Check | Command | What it does |
|---|---|---|
| Go tests | `go test ./...` | Validation, slugs, sessions, rate limiting, upload URL safety, simulator OEE |
| Go vet | `go vet ./...` | Finds suspicious Go code |
| TypeScript | `npx tsc --noEmit` (in `web/`) | Type errors |
| Lint | `npm run lint` (in `web/`) | Common React mistakes |
| Production build | `npx next build` (in `web/`) | Builds the real site, catching errors dev mode allows |
| Browser tests | Manual | Every page at desktop and phone width; forms; login; posting updates; private links; the photo viewer; 25 MB video upload |

📘 **Table-driven tests** (Go style): `TestEnquiryValidation` lists many bad inputs in a table (missing name, missing phone, bad email…) and checks each one.

## 13. Every file explained

```
alpha-genba/
├── README.md                 Project front page: vision, diagrams, how to run, API
├── go.mod / go.sum           Go project ID card + library fingerprints
├── .gitignore                Files Git must never upload (passwords, database, uploads)
├── docs/DEVELOPMENT_GUIDE.md This guide
│
├── backend/                  ── Go API server ──
│   ├── main.go               Starts everything; lists all routes; clean shutdown
│   ├── config.go             Settings from environment variables and backend/.env
│   ├── db.go                 PostgreSQL connection; dev database; schema
│   ├── schema.sql            Table definitions
│   ├── enquiries.go          Contact form: validate, save, list, status and notes
│   ├── projects.go           Completed projects: validate, create, edit, delete, photos
│   ├── ongoing.go            Ongoing projects, progress updates, private client links
│   ├── uploads.go            Photo and video uploads: type check, size limits, serving, cleanup
│   ├── auth.go               Owner login: password check, signed cookie, requireAdmin
│   ├── httputil.go           JSON helpers, rate limiter, request logging
│   ├── backend_test.go       Tests
│   ├── .env.example          Settings template (committed)
│   └── .env                  Your real password (NOT committed)
│
├── simulator/                ── Factory simulator (for future live monitoring) ──
│   ├── simulator.go          Machines, faults, OEE calculation
│   └── simulator_test.go     Tests
│
└── web/                      ── Next.js website ──
    ├── next.config.ts        Settings, the /api forwarding rule, the upload size limit
    ├── public/images/        Put real website photos here
    ├── app/
    │   ├── layout.tsx        Frame around every page: font, menu, footer, Google titles
    │   ├── globals.css       Theme, animations, page transitions
    │   ├── icon.svg          The α logo shown in browser tabs and Google
    │   ├── robots.ts         Tells Google what to index (and what not to)
    │   ├── sitemap.ts        List of pages for Google
    │   ├── page.tsx          Home (+ company details for Google)
    │   ├── projects/…        Completed projects list and detail
    │   ├── services/page.tsx Services explained
    │   ├── ongoing/…         Ongoing projects list and detail
    │   ├── track/[token]/…   Client's private project page
    │   ├── contact/page.tsx  Contact details and form
    │   ├── admin/page.tsx    Owner login and admin panel
    │   └── not-found.tsx     404 page
    ├── components/
    │   ├── Navbar.tsx, Footer.tsx, Logo.tsx      Site frame
    │   ├── Section.tsx       Section titles and page headers
    │   ├── Photo.tsx         Real photo or neat placeholder
    │   ├── ServiceCard.tsx, ProjectCard.tsx      Cards
    │   ├── ContactForm.tsx   Enquiry form
    │   ├── MediaGallery.tsx  Photo/video grid and full-screen viewer
    │   ├── Reveal.tsx, Page.tsx                  Scroll and page animations
    │   ├── ongoing/          Progress bar, stage tracker, project card and detail view
    │   └── admin/            Login, tabs, forms, uploader with progress bar
    └── lib/
        ├── content.ts        All company text and photo paths, one place to edit
        ├── api.ts            Shared types + loading data from the backend
        └── site.ts           The website's public address (for Google)
```

---

# Part C: Going further

## 14. Running it on your laptop

Two terminals in VS Code, both in the `alpha-genba` folder:

**Terminal 1: backend**
```bash
go run ./backend
```
**Terminal 2: website**
```bash
cd web
npm run dev
```
Open **http://localhost:3000**. The owner password is in `backend/.env` (`ADMIN_PASSWORD=`). Stop either one with **Ctrl + C**.

To see it **on your phone** (same Wi-Fi): use the *Network* address printed by `npm run dev`, e.g. `http://192.168.x.x:3000`.

## 15. Saving it to GitHub (the alpha-genba organisation)

The work is on the branch `feat/website-v1`. To save and publish it:

**1. Commit and push the branch**
```bash
git add -A
git commit -m "Redesign website: industrial UI, ongoing projects, uploads, owner login"
git push
```

**2. Merge it into `main` with a pull request** (the professional way)
- Open `https://github.com/alpha-genba/alpha-genba/compare/main...feat/website-v1`
- Click **Create pull request**, review **Files changed**, then **Merge pull request**

**3. Update your laptop**
```bash
git switch main
git pull
```

**4. Make the repository public** (so recruiters can see it), after your brother agrees
- Repository → **Settings** → bottom → **Change visibility** → **Public**
- Safe: passwords (`backend/.env`), the database (`.devdata/`) and uploads are never committed.

**5. Make the organisation look professional**
- `alpha-genba` organisation → **Settings**: add the α logo, a description ("Industrial software for Alpha Automations") and the website link.
- Pin the repository on the organisation page and on your personal profile (**Customize your pins**).

## 16. Putting the website online for everyone

Today the site runs only on your laptop. For anyone to open it on any phone or laptop, it needs:

| Need | What it is | Options |
|---|---|---|
| **A domain** | The name people type | `alphaautomations.in` (best for India) or `.com`. Bought yearly from a registrar such as GoDaddy, Hostinger, Namecheap or BigRock. **Check availability first.** `.alpha` does not exist and can't be bought. |
| **A server** | An always-on computer | A small cloud server (VPS) from DigitalOcean, Hetzner, AWS Lightsail or similar. One server can run the website, backend and database together. |
| **A database** | PostgreSQL on the server, or a managed one | Self-hosted on the same server, or a managed service like Neon or Supabase |
| **File storage** | For uploaded photos and videos | The server's disk (with backups), or object storage like Cloudflare R2 or AWS S3 |
| **HTTPS** | The padlock | Free certificates from Let's Encrypt, set up automatically by a web server like Caddy |

**Typical steps (we'll do these together when you're ready):**
1. Buy the domain.
2. Rent a small Linux server.
3. Install PostgreSQL, build the Go backend and the Next.js site, and run both as services.
4. Put **Caddy** in front: it serves `https://alphaautomations.in`, gets HTTPS automatically, and forwards `/api` to Go.
5. Set production settings: `APP_ENV=production`, a strong `ADMIN_PASSWORD`, a random `SESSION_SECRET`, `DATABASE_URL`, `SITE_URL=https://alphaautomations.in`.
6. Point the domain's DNS to the server's address.
7. Set up **daily backups** of the database and uploads.

Costs change, so compare current prices, but a domain is usually a few hundred rupees a year and a small server a few hundred to around a thousand rupees a month.

> Some hosting free tiers (for example, Vercel's Hobby plan) are for non-commercial use only. A company website needs a plan that allows commercial use. Check the terms.

## 17. Getting found on Google

The site is already prepared: page titles and descriptions, the α icon, `sitemap.xml`, `robots.txt` and structured company details (name, address, phone, email).

After it's online:
1. **Google Search Console** (search.google.com/search-console): add the domain, verify you own it, and submit `https://alphaautomations.in/sitemap.xml`.
2. **Google Business Profile** (business.google.com): **the most important step for a Bengaluru company.** It puts Alpha Automations on Google Maps and in local results ("automation company near me", "PLC panel manufacturer Bengaluru"). Add real photos, hours, services, and ask happy clients for reviews.
3. **Content Google loves:** real project pages with real photos and real results, published regularly.
4. **Patience:** a new site usually takes days to a few weeks to appear, and longer to rank well.

The search result in your screenshot (site name, logo, address, sub-links) comes from exactly this: a real domain, Search Console, the site icon and the structured data, plus time.

## 18. Marketing Alpha Automations

Industrial (B2B) clients buy through **trust** and **relationships**. The website's job is to make a good first impression and turn interest into calls.

| Channel | What to do |
|---|---|
| **Google Business Profile** | Real photos of machines and the workshop, services list, regular posts, client reviews |
| **The website itself** | Publish every finished machine as a project: problem → solution → result, with photos and a short video |
| **Ongoing projects** | Send clients their private progress link. It feels premium, and clients share it inside their company. |
| **WhatsApp Business** | Business profile with a catalogue, quick replies, and the website link in the profile |
| **B2B marketplaces** | Listings on IndiaMART and TradeIndia, where many Indian factories search for suppliers |
| **LinkedIn company page** | "Alpha Automations": post machine videos, project stories and installations. Purchase and maintenance engineers are on LinkedIn. |
| **YouTube / Instagram** | 30–60 second videos of machines running. Motion sells automation. |
| **Visiting cards and the catalogue** | Add the website and a **QR code** to it |
| **Trade shows** | Industrial exhibitions (for example IMTEX, held in Bengaluru) to meet manufacturers directly |
| **Referrals** | Ask every satisfied client for one introduction and a Google review |

## 19. Showcasing it on LinkedIn and GitHub

LinkedIn can't "merge" GitHub code, but you can **link** them so people go from your profile to both the live website and the code.

**On GitHub**
1. Make the repository public (see [section 15](#15-saving-it-to-github-the-alpha-genba-organisation)).
2. Add a **profile README** to your personal account: create a repo named exactly `Vachana7`, and its README appears on your profile. Mention Alpha Genba with links.
3. **Pin** `alpha-genba/alpha-genba` on your profile.
4. Add **screenshots and a short demo video (GIF)** to the README.

**On LinkedIn**
1. **Profile → Add section → Projects:**
   - *Name:* Alpha Genba: Full-Stack Platform for an Industrial Automation Company
   - *Description:* 3–4 lines on the problem, what you built, the tech (Go, Next.js, TypeScript, PostgreSQL) and the result
   - *Project URL:* the live website, with the GitHub link in the description
   - *Associated with:* your college, and list skills (Go, Next.js, React, TypeScript, PostgreSQL, REST APIs)
2. **Featured section:** add the website link and a demo video post.
3. **A launch post** (with a 60–90 second screen recording):
   > *"I built the digital platform for Alpha Automations, an industrial automation company in Bengaluru. Clients can now follow their machine being built, with live progress, photos and videos, through a private link. Built with Go, Next.js and PostgreSQL. Live: [link] · Code: [GitHub link]"*
4. **Build in public:** short posts about what you learned (the 10 MB upload bug, the Windows encoding bug, the private-link design). Engineers love real debugging stories.
5. **For Japan:** mention *Genba* and the Toyota Production System connection. It shows you understand Japanese manufacturing culture.

## 20. Interview questions to prepare

Practise answering these **out loud**.

**The project**
1. *What does it do and who uses it?* A full-stack platform for an industrial automation company: a public website with projects and services, private progress pages for clients, and an admin panel for the owner.
2. *Why Go for the backend?* Fast, simple, excellent standard library HTTP server, easy concurrency, single-binary deployment, and well suited to the future PLC gateway.
3. *Why Next.js?* Server rendering for Google, folder-based routing, built-in page transitions, and a proxy so the browser talks to one address.

**Full stack**
4. *Walk me through an enquiry from click to database.* → [Section 9](#9-how-one-request-travels-through-the-system)
5. *Server vs Client Components?* → [Section 6](#6-the-website-pages)
6. *How do uploads with a progress bar work?* `XMLHttpRequest` `upload.onprogress`, multipart form, content sniffing, random file names, size limits.

**Database**
7. *How do you prevent SQL injection?* Parameterised queries.
8. *Why a transaction when posting an update?* Two writes (the update and the project's progress) must succeed or fail together.
9. *What does `ON DELETE CASCADE` do?* Deleting a project deletes its updates automatically.

**Security**
10. *How do private client links stay private?* A random 32-character token (2¹²⁸ possibilities), never included in public API responses, `noindex` and blocked in `robots.txt`.
11. *How does login work without a sessions table?* An HMAC-signed cookie containing an expiry time, verified on every request.
12. *How do you stop someone uploading a virus as a photo?* The type is detected from the file's first bytes, not its name, and only images and MP4/WebM are allowed.

**Debugging stories (great in interviews)**
13. *Tell me about a hard bug.*
    - Big uploads failed after exactly 15 s. Testing the backend directly worked in 0.05 s, which isolated the cause to the proxy's 10 MB default limit.
    - The Windows database chose WIN1252, so Kannada names failed. Fixed by forcing UTF-8.
    - Scroll animations hid the hero until JavaScript loaded. Fixed by never hiding content that's already on screen.

**Honest limitations**
14. *What would you improve?* Real-time updates with WebSockets, email/WhatsApp notifications for new enquiries, multiple admin accounts, image resizing, automated frontend tests, CI with GitHub Actions, and real PLC monitoring through an MQTT edge gateway.

## 21. Glossary

| Word | Meaning |
|---|---|
| **API** | The list of addresses a backend answers, and what each does |
| **Endpoint / route** | One API address, e.g. `POST /api/enquiries` |
| **Handler** | The Go function that runs for a route |
| **Middleware** | A function that runs before a handler, e.g. checking login |
| **JSON** | Text format for sending data |
| **Struct** | A Go type grouping fields, e.g. `Enquiry` |
| **Schema** | The definition of database tables |
| **Constraint** | A database rule, e.g. progress must be 0–100 |
| **Transaction** | Several database changes that all succeed or all fail |
| **Component** | A reusable piece of UI in React |
| **Props** | Inputs passed to a component |
| **State / hook** | Values a component remembers / React functions starting with `use…` |
| **Suspense** | Shows a placeholder while slow data loads |
| **Rewrite / proxy** | Forwarding a request to another server |
| **Multipart upload** | The format browsers use to send files |
| **Range request** | Asking for part of a file, which lets videos skip forward |
| **Cookie** | Small data the browser stores and sends back |
| **HMAC** | A signature made with a secret key |
| **Rate limiting** | Allowing only a certain number of requests per time window |
| **Honeypot** | A hidden form field only bots fill in |
| **Slug** | A web-address-friendly name, e.g. `auto-screwing-station` |
| **Token** | A long random secret, e.g. in a private link |
| **SEO** | Search Engine Optimisation: helping Google find and show your pages |
| **Sitemap / robots.txt** | Files telling search engines which pages exist / which to skip |
| **Structured data** | Machine-readable company details Google uses in results |
| **Domain / DNS** | The website's name / the system linking names to servers |
| **Hosting / VPS** | Renting a server / a small virtual server |
| **HTTPS** | Encrypted connection (the padlock) |
| **Deployment** | Putting the application online |
| **Goroutine / Mutex** | A function running alongside others in Go / a lock preventing data clashes |
| **OEE** | Overall Equipment Effectiveness = Availability × Performance × Quality |
| **Andon** | A signal showing a machine or line has a problem |
| **Poka-Yoke** | Error-proofing |
| **Genba** | "The actual place": the shop floor |

---

*Written for Vachana while building Alpha Genba for Alpha Automations.*
