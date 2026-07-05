# EXAMTEXT — Complete Project Documentation

> **Version:** 3.0.0  
> **Repo:** `sksabbir2234/EXAMTEXT`  
> **Live:** `https://examtext.vercel.app`  
> **Firebase Project:** `examtext-7ba5f`  
> **Last Updated:** July 2026

---

## 1. What Is This Project?

**ExamText** is a mobile-first online exam portal for CSE (Computer Science & Engineering) students. Students enter their name (no login), pick a subject/chapter, take a timed MCQ exam, get instant results with score/grade/review, and see a leaderboard. An admin panel (hidden, password-protected) allows uploading/managing exams via JSON.

### Key Features
- **No student auth** — name-only entry per attempt
- **10 chapters × 30 MCQs** for "CSE College Teacher" subject
- **Dynamic OG meta tags** on exam-intro for Messenger/social sharing
- **LaTeX math rendering** via KaTeX (for equations in questions)
- **localStorage progress tracking** — shows best score per chapter
- **Progress bar** — "X of 10 chapters attempted"
- **Timeline chapter layout** — vertical timeline with chapter badges
- **Admin panel** — tabbed UI (Upload/Manage), drag-and-drop, search/filter, edit mode, live validation, attempt stats
- **Leaderboard** — top 50 scores per exam, ranked
- **Result review** — shows correct/wrong markers with explanations
- **Share/Copy Link** — native share API + clipboard

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Astro | 5.7+ | SSR/SSG hybrid, file-based routing |
| **Deployment** | Vercel | — | Serverless functions, edge network |
| **Language** | TypeScript | — | Type safety across all files |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS, custom design tokens |
| **Database** | Firebase Firestore | — | NoSQL document database |
| **Auth SDK** | Firebase Admin | 14.1+ | Server-side Firestore access (bypasses rules) |
| **Math Rendering** | KaTeX | 0.16+ | LaTeX math equation rendering |
| **Fonts** | Google Fonts | — | Inter + Noto Sans Bengali |
| **Adapter** | @astrojs/vercel | 8.1+ | Vercel serverless adapter for Astro |

### NOT Used
- **Firebase Client SDK** — fully removed (was causing SSR bundling issues)
- **React/Vue/Svelte** — pure Astro components (no UI framework)
- **Next.js** — migrated away from it to Astro
- **Node.js/Express** — migrated away from it to Astro API routes

---

## 3. Project Structure

```
examtext/
├── astro.config.mjs          # Astro config (SSR, Vercel, Tailwind, redirects)
├── tailwind.config.mjs        # Custom color palette, animations, shadows
├── package.json               # Dependencies
├── firestore.rules            # Firebase security rules (locked to deny-all)
├── cse/                       # 10 chapter JSON files for upload
│   ├── chapter1-data-structures.json
│   ├── chapter2-algorithms.json
│   ├── chapter3-operating-systems.json
│   ├── chapter4-dbms.json
│   ├── chapter5-computer-networks.json
│   ├── chapter6-software-engineering.json
│   ├── chapter7-oop.json
│   ├── chapter8-theory-of-computation.json
│   ├── chapter9-compiler-design.json
│   └── chapter10-digital-logic.json
└── src/
    ├── env.d.ts               # Astro type definitions
    ├── styles/
    │   └── global.css          # Tailwind base + custom utility classes
    ├── layouts/
    │   └── Layout.astro        # Main layout (navbar, OG meta, toast, fonts)
    ├── lib/
    │   ├── firebase-admin.ts   # Firebase Admin SDK init (cert from env vars)
    │   ├── auth.ts             # Stateless HMAC-SHA256 signed cookie auth
    │   └── katex.ts            # KaTeX LaTeX rendering helper
    └── pages/
        ├── index.astro         # Home page (hero, subject grid, coming soon)
        ├── subject.astro       # Subject detail (timeline, chapters, progress bar)
        ├── exam-intro/
        │   └── [id].astro      # Exam intro (SSR, dynamic OG tags, name form)
        ├── exam.astro          # Exam taking (MCQ UI, timer, option selection)
        ├── result.astro        # Result + leaderboard + review (correct/wrong markers)
        ├── admin.astro         # Admin panel (auth gate, upload, manage, stats)
        ├── cse-exams.astro     # Redirects to /subject?id=cse-college-teacher
        └── api/
            ├── subjects.ts              # GET /api/subjects
            ├── attempt.ts               # POST /api/attempt (submit answers)
            ├── attempt/
            │   └── [id].ts              # GET /api/attempt/[id] (single attempt)
            ├── exam/
            │   ├── [id].ts              # GET /api/exam/[id] (exam detail)
            │   └── [id]/
            │       └── questions.ts     # GET /api/exam/[id]/questions
            ├── exams/
            │   └── [subjectId].ts       # GET /api/exams/[subjectId]
            ├── leaderboard/
            │   └── [examId].ts          # GET /api/leaderboard/[examId]
            └── admin/
                ├── login.ts             # POST /api/admin/login + logout
                ├── session.ts           # GET /api/admin/session
                ├── upload.ts            # POST /api/admin/upload
                ├── all.ts               # GET /api/admin/all (with attempt stats)
                ├── exam/
                │   ├── [id].ts          # GET/PUT/POST /api/admin/exam/[id]
                │   └── [id]/
                │       └── publish.ts   # PUT /api/admin/exam/[id]/publish
                └── subject/
                    └── [id].ts          # POST /api/admin/subject/[id]
```

---

## 4. Database Schema (Firestore)

### Collections

```
subjects (collection)
  └── {slug} (document)
        ├── name: string              # "CSE College Teacher"
        ├── slug: string              # "cse-college-teacher"
        ├── description: string       # ""
        └── createdAt: Timestamp

exams (collection)
  └── {examId} (document)
        ├── subjectId: string         # "cse-college-teacher"
        ├── title: string             # "Chapter 1 - Data Structures"
        ├── durationMinutes: number   # 20
        ├── totalQuestions: number    # 30
        ├── published: boolean        # true/false
        ├── createdAt: Timestamp
        └── questions (subcollection)
              └── {questionId} (document)
                    ├── order: number            # 1, 2, 3...
                    ├── questionText: string     # "What is a stack?"
                    ├── options: string[]        # ["A. Linear", "B. Tree", ...]
                    ├── correctOptionIndex: number # 0
                    ├── explanation: string|null  # "Stack follows LIFO"
                    └── marks: number            # 1

attempts (collection)
  └── {attemptId} (document)
        ├── examId: string            # reference to exams doc
        ├── studentName: string       # "Sabbir"
        ├── score: number             # 25
        ├── total: number             # 30
        ├── answers: any[]            # [{q: 0, selected: 2, correct: true}, ...]
        ├── timeTaken: number         # seconds
        └── createdAt: Timestamp
```

### Relationships
```
subjects (1) ──→ (many) exams        via exams.subjectId = subjects.id
exams    (1) ──→ (many) questions    via subcollection exams/{id}/questions
exams    (1) ──→ (many) attempts     via attempts.examId = exams.id
```

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;   // All access via Admin SDK only
    }
  }
}
```

---

## 5. Authentication System

### Admin Auth Flow
- **No user database** — single admin password stored as env var `ADMIN_PASSWORD`
- **Stateless signed cookies** — no session storage needed

```
Login Flow:
1. POST /api/admin/login { password: "xxx" }
2. Server validates against ADMIN_PASSWORD env var
3. Creates HMAC-SHA256 signed token: "{expiry_timestamp}.{signature}"
4. Sets httpOnly secure cookie "adminSession"
5. All /api/admin/* routes call checkAuth(ctx) → validates cookie

Logout Flow:
1. POST /api/admin/login { action: "logout" }
2. Server deletes the cookie
```

### Auth Implementation (`src/lib/auth.ts`)
- Uses `crypto.subtle.importKey()` + `crypto.subtle.sign()` for HMAC-SHA256
- Token payload = `String(Date.now() + 8hours_in_ms)`
- Signature = HMAC-SHA256(payload, ADMIN_PASSWORD)
- Cookie: `httpOnly: true`, `secure: true`, `sameSite: "lax"`, `maxAge: 28800`
- Works across Vercel cold starts (stateless, no server session)

### Why POST for Delete
- Vercel firewall blocks DELETE and PUT HTTP methods on serverless functions
- All delete operations use `POST { action: "delete" }` instead

---

## 6. API Routes (Complete Reference)

### Public APIs (no auth)

| Method | Route | Purpose | Request | Response |
|--------|-------|---------|---------|----------|
| `GET` | `/api/subjects` | List all subjects | — | `[{id, name, slug, ...}]` |
| `GET` | `/api/exams/[subjectId]` | List exams for subject | — | `[{id, title, durationMinutes, ...}]` |
| `GET` | `/api/exam/[id]` | Exam detail | — | `{id, title, subjectName, ...}` |
| `GET` | `/api/exam/[id]/questions` | Get questions | — | `[{id, questionText, options, ...}]` |
| `POST` | `/api/attempt` | Submit exam | `{examId, studentName, score, total, answers, timeTaken}` | `{id}` |
| `GET` | `/api/attempt/[id]` | Get single attempt | — | `{id, examId, score, answers, ...}` |
| `GET` | `/api/leaderboard/[examId]` | Top 50 scores | — | `[{id, studentName, score, ...}]` |

### Admin APIs (auth required via cookie)

| Method | Route | Purpose | Request | Response |
|--------|-------|---------|---------|----------|
| `POST` | `/api/admin/login` | Login/Logout | `{password}` or `{action:"logout"}` | `{ok:true}` |
| `GET` | `/api/admin/session` | Check auth | — | `{authed: bool}` |
| `POST` | `/api/admin/upload` | Upload new exam | `{subject, examTitle, durationMinutes, questions[]}` | `{id, warning?}` |
| `GET` | `/api/admin/all` | All subjects+exams+stats | — | `[{id, name, exams:[{id, attemptCount, avgScore}]}]` |
| `GET` | `/api/admin/exam/[id]` | Exam + questions | — | `{id, title, questions[]}` |
| `PUT` | `/api/admin/exam/[id]` | Update exam+questions | `{examTitle, durationMinutes, questions[]}` | `{message, id}` |
| `POST` | `/api/admin/exam/[id]` | Delete exam | `{action:"delete"}` | `{message}` |
| `PUT` | `/api/admin/exam/[id]/publish` | Toggle published | `{published: bool}` | `{message}` |
| `POST` | `/api/admin/subject/[id]` | Delete subject+exams | `{action:"delete"}` | `{message}` |

---

## 7. Pages (Complete Reference)

### `index.astro` — Home Page
- Hero section with gradient background
- Subject grid (fetches from `/api/subjects`)
- "Coming Soon" section with 4 placeholder cards (Bangladesh Bank, BCS, NTRCA, NPCBL)
- Staggered fade-up animations

### `subject.astro` — Subject Detail
- SSR page, fetches subject name from Firestore `subjects` collection
- Falls back to formatted slug if doc not found
- Fetches published exams from `exams` collection
- **Sorts by chapter number** extracted from title via regex `Chapter\s+(\d+)`
- Vertical timeline layout with gradient line
- Each chapter card shows: number badge, title, question count, duration, "✓ Best: X/30" (from localStorage)
- Progress bar at top: "X of 10 chapters attempted"
- Empty state: "No exams available yet"

### `exam-intro/[id].astro` — Exam Intro (SSR)
- Dynamic OG meta tags for Messenger/social sharing
- Fetches exam detail from Firestore
- Shows: title, subject, chapter, question count, duration
- Name input form → stores in sessionStorage → navigates to `/exam`

### `exam.astro` — Exam Taking
- Event delegation for option selection (no inline onclick)
- Uses `data-qi` and `data-oi` attributes for question/option indices
- Countdown timer with auto-submit
- Progress indicator
- Questions fetched from `/api/exam/[id]/questions`
- Validates name from sessionStorage, redirects if missing

### `result.astro` — Results
- Fetches exam details + attempts from Firestore
- Shows: score, percentage, grade (A+/A/B/C/D/F), correct/wrong/total counts
- **Leaderboard**: top 50 scores, highlights current attempt
- **Review**: each question shows student's answer vs correct, green ✓ for correct, red ✗ for wrong
- Saves progress to localStorage (bestScore, totalQuestions)
- Share + Copy Link buttons

### `admin.astro` — Admin Panel
- Server-side auth gate: calls `GET /api/admin/session` on load
- **Upload tab**: paste JSON or drag-and-drop file, live question counter, inline validation, preview → confirm upload, edit mode for existing exams
- **Manage tab**: stats strip (Subjects/Exams/Questions/Published/Attempts), search + Published/Draft filter, collapsible subject cards, 2-column exam grid, edit/delete/publish toggles
- Form auto-clears after successful upload

### `cse-exams.astro` — Redirect
- Redirects to `/subject?id=cse-college-teacher` via `astro.config.mjs`

---

## 8. Styling System

### Tailwind Config (`tailwind.config.mjs`)
- **Custom colors**: `brand-*` (indigo), `surface-*` (slate), `success-*`, `danger-*`, `warning-*`
- **Custom fonts**: `Inter` (primary), `Noto Sans Bengali` (Bengali text)
- **Custom shadows**: `glow`, `glow-lg`, `card`, `card-hover`, `elevated`
- **Custom animations**: `fade-in`, `fade-up`, `slide-up`, `scale-in`, `shimmer`, `float`
- **Border radius**: `2xl` (1rem), `3xl` (1.25rem), `4xl` (1.5rem)

### Global CSS Classes (`src/styles/global.css`)
- `.card` — white rounded-2xl with shadow
- `.btn-primary` — indigo gradient button
- `.btn-ghost` — transparent hover button
- `.glass` — glass morphism backdrop-blur
- `.gradient-text` — indigo-to-purple gradient text
- `.toast` — slide-up notification toast

### Design Language
- Glass morphism navbar (`backdrop-blur-xl bg-white/70`)
- Gradient hero sections
- Card-based layouts with soft shadows
- Rounded-2xl/3xl corners
- Mobile-first responsive design
- Bengali font support

---

## 9. JSON Upload Format

Admin uploads JSON with this structure:

```json
{
  "subject": "CSE College Teacher",
  "examTitle": "Chapter 1 - Data Structures",
  "durationMinutes": 20,
  "questions": [
    {
      "questionText": "What data structure uses LIFO?",
      "options": ["Stack", "Queue", "Array", "Tree"],
      "correctOptionIndex": 0,
      "explanation": "Stack follows Last-In-First-Out principle",
      "marks": 1
    },
    ...
  ]
}
```

### Validation Rules
- `subject` — required, non-empty string
- `examTitle` — required, non-empty string
- `questions` — required, non-empty array
- Each question:
  - `questionText` — required string
  - `options` — required array with ≥ 2 items
  - `correctOptionIndex` — required number, 0 ≤ index < options.length
  - `explanation` — optional string (nullable)
  - `marks` — optional number, defaults to 1

### Slug Generation
- `subject` → lowercase, spaces to hyphens, strip non-word chars
- Example: `"CSE College Teacher"` → `"cse-college-teacher"`

---

## 10. Environment Variables

### Vercel (Server-Only — no `PUBLIC_` prefix)

| Variable | Purpose | Example |
|----------|---------|---------|
| `ADMIN_PASSWORD` | Admin panel login password | `my-secret-pass` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `examtext-7ba5f` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-fbsvc@examtext-7ba5f.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----\n...` |

### Local Development
- Create `.env` file in project root (gitignored)
- Same variables as above

### No Longer Needed
- `PUBLIC_FIREBASE_*` — client SDK fully removed

---

## 11. Key Design Decisions

| Decision | Reason |
|----------|--------|
| **Firebase Admin SDK only** | Client SDK caused SSR bundling issues. Admin SDK is simpler, bypasses Firestore rules. |
| **Firestore rules locked to deny-all** | All access via Admin SDK. Previous open rules were a security hole. |
| **Stateless HMAC-SHA256 cookies** | Works across Vercel cold starts. No session storage needed. |
| **POST for delete operations** | Vercel firewall blocks DELETE HTTP method on serverless functions. |
| **Event delegation for exam selection** | Inline `onclick` was unreliable. Single listener on `#questions` container with `data-qi`/`data-oi` attributes. |
| **Chapter sort by title regex** | Avoids Firestore composite index requirement for `orderBy('createdAt')` with filters. |
| **Astro over Next.js** | Simpler SSR, no React overhead, better Vercel integration, lighter bundle. |
| **localStorage for progress** | No server-side user tracking. Best score preserved across sessions. |
| **No student auth** | Simplifies UX. Name-only entry per attempt. |

---

## 12. Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| Vercel firewall blocks DELETE method | All delete routes use `POST { action: "delete" }` |
| Vercel firewall blocks PUT method | Already using PUT for updates (works fine, only DELETE blocked) |
| Firestore Timestamp returns `{_seconds, _nanoseconds}` | Client-side sorting uses `._seconds` or `.seconds` fallback |
| Local Node.js v24 not supported by Vercel | Build warning; Vercel uses Node.js 22 at runtime |
| `crypto.subtle` requires HTTPS | Works on Vercel (always HTTPS), fails on localhost HTTP |

---

## 13. Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production (Vercel serverless)
npm run preview      # Preview production build locally

# Git
git add .
git commit -m "message"
git push origin main
```

---

## 14. Deployment

1. Push to `main` branch on GitHub
2. Vercel auto-deploys from GitHub
3. Set env vars in Vercel Dashboard → Settings → Environment Variables (Production)
4. Deploy Firestore rules via Firebase Console (currently deny-all)

---

## 15. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Why deny-all?** All data access happens through Firebase Admin SDK on the server side. The Admin SDK bypasses these rules entirely. This means no client-side Firestore access is possible — everything goes through our API routes.

---

## 16. Content (10 Chapters)

| # | Title | File | Questions |
|---|-------|------|-----------|
| 1 | Data Structures | `cse/chapter1-data-structures.json` | 30 |
| 2 | Algorithms | `cse/chapter2-algorithms.json` | 30 |
| 3 | Operating Systems | `cse/chapter3-operating-systems.json` | 30 |
| 4 | DBMS | `cse/chapter4-dbms.json` | 30 |
| 5 | Computer Networks | `cse/chapter5-computer-networks.json` | 30 |
| 6 | Software Engineering | `cse/chapter6-software-engineering.json` | 30 |
| 7 | OOP | `cse/chapter7-oop.json` | 30 |
| 8 | Theory of Computation | `cse/chapter8-theory-of-computation.json` | 30 |
| 9 | Compiler Design | `cse/chapter9-compiler-design.json` | 30 |
| 10 | Digital Logic | `cse/chapter10-digital-logic.json` | 30 |

**Total: 300 MCQs**

Upload via Admin panel → Upload tab → paste JSON → Preview → Confirm.

---

## 17. Prompt Generation Guide

To generate prompts for this project, include:

1. **Stack context**: Astro 5, TypeScript, Firebase Firestore (Admin SDK), Tailwind CSS, Vercel
2. **Database**: Firestore with `subjects`, `exams` (with `questions` subcollection), `attempts` collections
3. **Auth**: Stateless HMAC-SHA256 signed cookies, `ADMIN_PASSWORD` env var, `checkAuth()` middleware
4. **API pattern**: Astro API routes in `src/pages/api/`, all use `getAdminDb()` from `src/lib/firebase-admin.ts`
5. **Pages**: Astro SSR pages in `src/pages/`, file-based routing
6. **Styling**: Tailwind with custom `brand-*`/`surface-*` palette, glass morphism, rounded-2xl/3xl
7. **Constraints**: No client Firebase SDK, POST for deletes (Vercel firewall), `data-qi`/`data-oi` for exam selection
8. **Deployment**: Vercel auto-deploy from GitHub `main` branch, server-only env vars
