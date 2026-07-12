# EXAMTEXT — Complete Project Documentation

> **Version:** 6.0.0  
> **Repo:** `sksabbir2234/EXAMTEXT`  
> **Live:** `https://examtext.vercel.app`  
> **Firebase Project:** `examtext-7ba5f`  
> **Last Updated:** July 2026

---

## 1. What Is This Project?

**ExamText** is a mobile-first online exam portal with a blog/study resource system. Students enter their name (no login), pick a subject/chapter, take a timed MCQ exam, get instant results with score/grade/review, and see a leaderboard. An admin panel (hidden, password-protected) allows uploading/managing exams AND blog resources via JSON — with multi-file batch upload, bulk delete, and drag-and-drop reorder.

### Key Features
- **No student auth** — name-only entry per attempt
- **BCS/NTRCA/BANK Competitive Exam** — 6 chapters, 30 units, 907 MCQs
- **NTRCA School ICT** — 10 topic exams (300 MCQs) + 647 Q&A blog content
- **CSE College Teacher** — 10 chapter exams (300 MCQs) + blog content
- **Islamic History** — 30 MCQ exam (Arab history, Seerah, Khulafa-e-Rashideen)
- **Negative marking** — −0.25 per wrong answer (4 wrong = −1 mark)
- **Blog/Study Resource system** — Bangla Q&A guides with folder-style UI
- **Dynamic OG meta tags** on exam-intro for Messenger/social sharing
- **LaTeX math rendering** via KaTeX (for equations in questions)
- **localStorage progress tracking** — shows best score per chapter
- **Progress bar** — "X of chapters attempted"
- **Timeline chapter layout** — vertical timeline with chapter badges (extracted from title)
- **Admin panel** — tabbed UI (Upload/Manage/Blog), multi-file batch upload, bulk delete, drag-and-drop subject/exam reorder, search/filter, edit mode, live validation, attempt stats
- **Leaderboard** — top 50 scores per exam, ranked
- **Result review** — shows correct/wrong markers with explanations, Bengali score breakdown
- **Share/Copy Link** — native share API + clipboard
- **Folder-style resources** — blogs grouped by subject in expandable folders
- **PWA** — installable on mobile/desktop, offline fallback, service worker, app shortcuts
- **Print-friendly results** — clean print layout with score summary header

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
├── PROJECT.md                 # This file
├── book/                      # Source book content (6 chapters, markdown)
│   ├── 00_preface_toc.md      # Preface & Table of Contents
│   ├── 01_ch01_english_grammar.md      # Ch1: Parts of Speech, Tenses, Voice, etc.
│   ├── 02_ch02_english_idioms.md       # Ch2: Idioms in Context
│   ├── 03_ch03_bangla_grammar.md       # Ch3: সাধু/চলিত, বাগধারা, সমাস, etc.
│   ├── 04_ch04_bangladesh_studies.md   # Ch4: ভূগোল, মুক্তিযুদ্ধ, ইতিহাস, etc.
│   ├── 05_ch05_math.md                 # Ch5: Arithmetic, LCM/HCF, Ratio, etc.
│   ├── 06_ch06_international_gk.md     # Ch6: Capitals, Currencies, Orgs
│   └── 06_appendices.md                # Reference appendices
├── cse/                       # Question files (JSON)
│   ├── chapter1-english-grammar/       # English Grammar units (7 files)
│   │   ├── unit1-1-parts-of-speech-verbs.json       # 31 MCQs
│   │   ├── unit1-2-subject-verb-agreement.json      # 31 MCQs
│   │   ├── unit1-3-tenses.json                      # 30 MCQs
│   │   ├── unit1-4-conditionals-subjunctive.json    # 31 MCQs
│   │   ├── unit1-5-gerund-infinitive-participle.json# 31 MCQs
│   │   ├── unit1-6-voice-active-passive.json        # 31 MCQs
│   │   └── unit1-7-additional-grammar.json          # 31 MCQs
│   ├── chapter2-english-idioms/        # English Idioms units (2 files)
│   │   ├── unit2-1-idioms-context.json              # 30 MCQs
│   │   └── unit2-2-additional-exam-idioms.json      # 30 MCQs
│   ├── chapter3-bangla-grammar/        # Bangla Grammar units (6 files)
│   │   ├── unit3-1-sadhu-chalit.json                # 30 MCQs
│   │   ├── unit3-2-bagdhara.json                    # 30 MCQs
│   │   ├── unit3-3-somaz.json                       # 30 MCQs
│   │   ├── unit3-4-biramchinha.json                 # 30 MCQs
│   │   ├── unit3-5-karak.json                       # 30 MCQs
│   │   └── unit3-6-sandhi.json                      # 30 MCQs
│   ├── chapter4-bangladesh-studies/    # Bangladesh Studies units (6 files)
│   │   ├── unit4-1-bhugol.json                      # 30 MCQs
│   │   ├── unit4-2-muktijuddho.json                 # 30 MCQs
│   │   ├── unit4-3-prachin-madhyajug.json           # 30 MCQs
│   │   ├── unit4-4-bhasha-andolon.json              # 30 MCQs
│   │   ├── unit4-5-prakritik-sampan.json            # 30 MCQs
│   │   └── unit4-6-janshongkha-shiksha.json         # 30 MCQs
│   ├── chapter5-math/                  # Mathematics units (6 files)
│   │   ├── unit5-1-basic-arithmetic.json            # 30 MCQs
│   │   ├── unit5-2-lcm-hcf-divisibility.json        # 30 MCQs
│   │   ├── unit5-3-primes-digits-division.json      # 30 MCQs
│   │   ├── unit5-4-ratio-proportion.json            # 30 MCQs
│   │   ├── unit5-5-work-time.json                   # 30 MCQs
│   │   └── unit5-6-pipes-cisterns.json              # 30 MCQs
│   ├── chapter6-international-gk/      # International GK units (3 files)
│   │   ├── unit6-1-world-capitals.json              # 30 MCQs
│   │   ├── unit6-2-world-currencies.json            # 30 MCQs
│   │   └── unit6-3-international-organizations.json # 31 MCQs
│   ├── cse-complete-question-bank.json             # All 907 MCQs combined
│   ├── chapter1-data-structures.json               # CSE College Teacher
│   ├── chapter2-algorithms.json                    # CSE College Teacher
│   ├── chapter3-operating-systems.json             # CSE College Teacher
│   ├── chapter4-dbms.json                          # CSE College Teacher
│   ├── chapter5-computer-networks.json             # CSE College Teacher
│   ├── chapter6-software-engineering.json          # CSE College Teacher
│   ├── chapter7-oop.json                           # CSE College Teacher
│   ├── chapter8-theory-of-computation.json         # CSE College Teacher
│   ├── chapter9-compiler-design.json               # CSE College Teacher
│   ├── chapter10-digital-logic.json                # CSE College Teacher
│   ├── ntrca-ict-blog.json                         # NTRCA School ICT
│   ├── gate-pyq-revision-blog.json                 # GATE PYQ revision
│   ├── data-structures-blog.json                   # Blog
│   ├── algorithms-blog.json                        # Blog
│   ├── operating-systems-blog.json                 # Blog
│   ├── dbms-blog.json                              # Blog
│   ├── computer-networks-blog.json                 # Blog
│   ├── software-engineering-blog.json              # Blog
│   ├── oop-blog.json                               # Blog
│   ├── theory-of-computation-blog.json             # Blog
│   ├── compiler-design-blog.json                   # Blog
│   ├── digital-logic-blog.json                     # Blog
│   └── school/                                     # NTRCA School ICT
│       ├── 01-computer-fundamentals.json           # 60 Q&A blog
│       ├── 02-number-systems-boolean.json          # 47 Q&A blog
│       ├── 03-operating-systems.json               # 53 Q&A blog
│       ├── 04-ms-office.json                       # 28 Q&A blog
│       ├── 05-networking-internet.json             # 82 Q&A blog
│       ├── 06-programming.json                     # 142 Q&A blog
│       ├── 07-database.json                        # 65 Q&A blog
│       ├── 08-ict-bangladesh.json                  # 42 Q&A blog
│       ├── 09-multimedia.json                      # 33 Q&A blog
│       ├── 10-current-trends.json                  # 97 Q&A blog
│       ├── exams/                                  # NTRCA exam MCQs (30 each)
│       │   ├── exam-01-computer-fundamentals.json
│       │   ├── exam-02-number-systems-boolean.json
│       │   ├── exam-03-operating-systems.json
│       │   ├── exam-04-ms-office.json
│       │   ├── exam-05-networking.json
│       │   ├── exam-06-programming.json
│       │   ├── exam-07-database.json
│       │   ├── exam-08-ict-bangladesh.json
│       │   ├── exam-09-multimedia.json
│       │   ├── exam-10-current-trends.json
│       │   └── exam-11-islamic-history.json        # 30 MCQs
│       └── practice/                               # Practice sets (30 Q&A each)
│           ├── set-01.json through set-10.json
├── public/
│   ├── manifest.json          # PWA manifest (icons, screenshots, shortcuts)
│   ├── sw.js                  # Service worker (cache-first static, offline fallback)
│   ├── icons/                 # PWA icons (72–512px PNG)
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── screenshots/
│       └── mobile-home.png   # PWA install screenshot (390×844)
├── scripts/
│   ├── generate-icons.mjs     # Generate PWA icons from SVG
│   └── generate-screenshot.mjs # Generate PWA screenshot
└── src/
    ├── env.d.ts               # Astro type definitions
    ├── styles/
    │   └── global.css          # Tailwind base + custom utility classes + print styles
    ├── layouts/
    │   └── Layout.astro        # Main layout (navbar, OG meta, toast, fonts, PWA)
    ├── lib/
    │   ├── firebase-admin.ts   # Firebase Admin SDK init (cert from env vars)
    │   ├── auth.ts             # Stateless HMAC-SHA256 signed cookie auth
    │   └── katex.ts            # KaTeX LaTeX rendering helper
    └── pages/
        ├── index.astro         # Home page (hero, subject grid, study resources CTA)
        ├── subject.astro       # Subject detail (timeline, chapters, progress bar, folder blog links)
        ├── exam-intro/
        │   └── [id].astro      # Exam intro (SSR, dynamic OG tags, name form)
        ├── exam.astro          # Exam taking (MCQ UI, timer, option selection, negative marking)
        ├── result.astro        # Result + leaderboard + review (correct/wrong markers, Bengali score breakdown, print header)
        ├── blogs.astro         # Blog listing (folder-style grouped by subject)
        ├── blog.astro          # Blog detail (accordion Q&A, folder icon header, slide deck link)
        ├── admin.astro         # Admin panel (3 tabs: Upload/Manage/Blog, bulk delete, batch upload, subject/exam reorder)
        ├── cse-exams.astro     # Redirects to /subject?id=cse-college-teacher
        ├── offline.astro       # PWA offline fallback page (Bengali)
        └── api/
            ├── subjects.ts              # GET /api/subjects (sorted by sortOrder)
            ├── attempt.ts               # POST /api/attempt (submit answers with correct/wrong/skipped/penalty)
            ├── attempt/
            │   └── [id].ts              # GET /api/attempt/[id] (single attempt)
            ├── exam/
            │   ├── [id].ts              # GET /api/exam/[id] (exam detail)
            │   └── [id]/
            │       └── questions.ts     # GET /api/exam/[id]/questions
            ├── exams/
            │   └── [subjectId].ts       # GET /api/exams/[subjectId] (sorted by sortOrder)
            ├── leaderboard/
            │   └── [examId].ts          # GET /api/leaderboard/[examId]
            ├── blogs/
            │   └── [subjectId].ts       # GET /api/blogs/[subjectId] (published blogs)
            └── admin/
                ├── login.ts             # POST /api/admin/login + logout
                ├── session.ts           # GET /api/admin/session
                ├── upload.ts            # POST /api/admin/upload (single or batch array, assigns sortOrder)
                ├── all.ts               # GET /api/admin/all (with attempt stats, sorted by sortOrder)
                ├── fix-order.ts         # POST /api/admin/fix-order (one-time cleanup: delete bad 'order' field)
                ├── exam/
                │   ├── [id].ts          # GET/PUT/POST /api/admin/exam/[id]
                │   └── [id]/
                │       └── publish.ts   # PUT /api/admin/exam/[id]/publish
                ├── subject/
                │   └── [id].ts          # POST /api/admin/subject/[id]
                ├── subjects/
                │   └── reorder.ts       # POST /api/admin/subjects/reorder (batch write order field)
                ├── exams/
                │   └── reorder.ts       # POST /api/admin/exams/reorder (batch write sortOrder field)
                ├── blogs.ts             # GET /api/admin/blogs (all blogs)
                └── blog/
                    ├── upload.ts        # POST /api/admin/blog/upload (single or batch)
                    ├── [id].ts          # GET/PUT/POST /api/admin/blog/[id]
                    └── [id]/
                        └── publish.ts   # PUT /api/admin/blog/[id]/publish
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
        ├── order: number             # sort position (1, 2, 3...)
        └── createdAt: Timestamp

exams (collection)
  └── {examId} (document)
        ├── subjectId: string         # "cse-college-teacher"
        ├── title: string             # "Unit 1.1 — Parts of Speech"
        ├── durationMinutes: number   # 20
        ├── totalQuestions: number    # 30
        ├── published: boolean        # true/false
        ├── sortOrder: number         # sort position within subject (1, 2, 3...)
        ├── createdAt: Timestamp
        └── questions (subcollection)
              └── {questionId} (document)
                    ├── order: number            # 1, 2, 3...
                    ├── questionText: string     # "What is a stack?"
                    ├── options: string[]        # ["A. Linear", "B. Tree", ...]
                    ├── correctOptionIndex: number # 0
                    ├── explanation: string|null  # "Stack follows LIFO"
                    └── marks: number            # 1

blogs (collection)
  └── {blogId} (document)
        ├── subjectId: string         # "cse-college-teacher"
        ├── examId: string|null       # linked exam (optional)
        ├── title: string             # "Data Structures Guide"
        ├── slug: string              # "data-structures-guide"
        ├── description: string       # short description
        ├── slideUrl: string|null     # NotebookLM slide URL
        ├── published: boolean        # true/false
        ├── content: array            # [{question, answer, tags?}, ...]
        └── createdAt: Timestamp

attempts (collection)
  └── {attemptId} (document)
        ├── examId: string            # reference to exams doc
        ├── studentName: string       # "Sabbir"
        ├── score: number             # 25
        ├── total: number             # 30
        ├── correct: number           # correct answer count
        ├── wrong: number             # wrong answer count
        ├── skipped: number           # unanswered count
        ├── penalty: number           # negative marking penalty (−0.25 per wrong)
        ├── answers: any[]            # [{q: 0, selected: 2, correct: true}, ...]
        ├── timeTaken: number         # seconds
        └── createdAt: Timestamp
```

### Relationships
```
subjects (1) ──→ (many) exams        via exams.subjectId = subjects.id
exams    (1) ──→ (many) questions    via subcollection exams/{id}/questions
exams    (1) ──→ (many) attempts     via attempts.examId = exams.id
subjects (1) ──→ (many) blogs        via blogs.subjectId = subjects.id
exams    (1) ──→ (0..1) blog         via blog.examId = exams.id (optional link)
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
| `GET` | `/api/subjects` | List all subjects | — | `[{id, name, slug, order, ...}]` sorted by order |
| `GET` | `/api/exams/[subjectId]` | List exams for subject | — | `[{id, title, durationMinutes, sortOrder, ...}]` sorted by sortOrder |
| `GET` | `/api/exam/[id]` | Exam detail | — | `{id, title, subjectName, ...}` |
| `GET` | `/api/exam/[id]/questions` | Get questions | — | `[{id, questionText, options, ...}]` |
| `POST` | `/api/attempt` | Submit exam | `{examId, studentName, score, total, answers, timeTaken, correct, wrong, skipped, penalty}` | `{id}` |
| `GET` | `/api/attempt/[id]` | Get single attempt | — | `{id, examId, score, correct, wrong, skipped, penalty, answers, ...}` |
| `GET` | `/api/leaderboard/[examId]` | Top 50 scores | — | `[{id, studentName, score, ...}]` |
| `GET` | `/api/blogs/[subjectId]` | Published blogs for subject | — | `[{id, title, contentCount, ...}]` |

### Admin APIs (auth required via cookie)

| Method | Route | Purpose | Request | Response |
|--------|-------|---------|---------|----------|
| `POST` | `/api/admin/login` | Login/Logout | `{password}` or `{action:"logout"}` | `{ok:true}` |
| `GET` | `/api/admin/session` | Check auth | — | `{authed: bool}` |
| `POST` | `/api/admin/upload` | Upload exam(s) | Single: `{subject, examTitle, questions[]}` or Array: `[{...}, {...}]` | `{id}` or `{batch, uploaded, failed, results, errors}` |
| `GET` | `/api/admin/all` | All subjects+exams+stats | — | `[{id, name, order, exams:[{id, attemptCount, avgScore, sortOrder}]}]` |
| `GET` | `/api/admin/exam/[id]` | Exam + questions | — | `{id, title, questions[]}` |
| `PUT` | `/api/admin/exam/[id]` | Update exam+questions | `{examTitle, durationMinutes, questions[]}` | `{message, id}` |
| `POST` | `/api/admin/exam/[id]` | Delete exam | `{action:"delete"}` | `{message}` |
| `PUT` | `/api/admin/exam/[id]/publish` | Toggle published | `{published: bool}` | `{message}` |
| `POST` | `/api/admin/subject/[id]` | Delete subject+exams | `{action:"delete"}` | `{message}` |
| `POST` | `/api/admin/subjects/reorder` | Reorder subjects | `{orderedIds: string[]}` | `{ok: true}` |
| `POST` | `/api/admin/exams/reorder` | Reorder exams within subject | `{subjectId, orderedIds: string[]}` | `{ok: true}` |
| `POST` | `/api/admin/fix-order` | Cleanup bad order field | — | `{ok: true, cleaned: number}` |
| `GET` | `/api/admin/blogs` | All blogs | — | `[{id, title, published, contentCount, ...}]` |
| `POST` | `/api/admin/blog/upload` | Create blog(s) | Single: `{subject, title, content[]}` or Array: `[{...}, {...}]` | `{id}` or `{batch, uploaded, failed, results, errors}` |
| `GET` | `/api/admin/blog/[id]` | Blog detail | — | `{id, title, content[], ...}` |
| `PUT` | `/api/admin/blog/[id]` | Update blog | `{title, description, content[], ...}` | `{message}` |
| `POST` | `/api/admin/blog/[id]` | Delete blog | `{action:"delete"}` | `{message}` |
| `PUT` | `/api/admin/blog/[id]/publish` | Toggle published | `{published: bool}` | `{message}` |

---

## 7. Pages (Complete Reference)

### `index.astro` — Home Page
- Hero section with gradient background
- Subject grid (fetches from `/api/subjects`, sorted by `order` field)
- "Study Resources" CTA linking to `/blogs`
- "Coming Soon" section with placeholder cards
- Staggered fade-up animations

### `subject.astro` — Subject Detail
- SSR page, fetches subject name from Firestore `subjects` collection
- Fetches published exams + published blogs
- **Sorts by chapter number** extracted from title via regex `Unit\s+(\d+(?:\.\d+)?)` with `Chapter\s+(\d+)` fallback
- Vertical timeline layout with gradient line
- Each chapter card: number badge (e.g. "1.1", "3.5"), title, question count, duration, blog link (folder icon), "✓ Best: X/30" (from localStorage)
- Blog links styled as amber folder/file items
- Progress bar at top: "X of chapters attempted"

### `exam-intro/[id].astro` — Exam Intro (SSR)
- Dynamic OG meta tags for Messenger/social sharing
- Fetches exam detail from Firestore
- Shows: title, subject, chapter, question count, duration
- Name input form → stores in sessionStorage → navigates to `/exam`
- Negative marking notice displayed

### `exam.astro` — Exam Taking
- Event delegation for option selection (no inline onclick)
- Uses `data-qi` and `data-oi` attributes for question/option indices
- Countdown timer with auto-submit
- Progress indicator
- Questions fetched from `/api/exam/[id]/questions`
- Validates name from sessionStorage, redirects if missing
- Sends correct/wrong/skipped/penalty in attempt submission

### `result.astro` — Results
- Fetches exam details + attempts from Firestore
- Shows: score, percentage, grade (A+/A/B/C/D/F), correct/wrong/skipped/penalty counts
- **Bengali score breakdown table**: সঠিক, ভুল, খালি, নেগেটিভ মার্কিং
- **Leaderboard**: top 50 scores, highlights current attempt
- **Review**: each question shows student's answer vs correct, green ✓ for correct, red ✗ for wrong
- Saves progress to localStorage (bestScore, totalQuestions)
- Share + Copy Link buttons
- **Print header**: shows exam title + print date (print-only)
- **Print CSS**: hides nav/toast/actions, forces colors

### `blogs.astro` — Blog Listing (Folder UI)
- Fetches all published blogs, groups by subject
- **Folder-style UI**: each subject is an expandable folder card
- Folder shows: subject name, resource count, total Q&A count
- Click to expand → shows individual blog items as file entries
- Each file entry: document icon, title, Q&A count, slide indicator
- Staggered fade-up animations

### `blog.astro` — Blog Detail
- Folder icon header matching the folder theme
- Title, description, Q&A count, linked exam badge
- Slide deck link (NotebookLM) if available
- **Accordion Q&A**: expandable details for each question/answer
- Tags display per Q&A item
- Footer CTA: "এই চ্যাপ্টারের পরীক্ষা দিন" (linked exam)

### `admin.astro` — Admin Panel
- **3 tabs**: Upload, Manage, Blog
- **Upload tab**: paste JSON or drag-and-drop, multi-file batch upload, live question counter, inline validation, preview → confirm upload, edit mode, ▲▼ file reorder arrows
- **Manage tab**: stats strip, search + Published/Draft filter, collapsible subject cards, **subject reorder** (drag-and-drop), **exam reorder** per subject (toggle drag list), 2-column exam grid with checkboxes, **bulk delete** (select all / delete selected), edit/delete/publish toggles
- **Blog tab**: create/upload blog with multi-file batch, manage blogs with checkboxes and bulk delete, edit form with title/description/slide URL/linked exam/content, ▲▼ file reorder arrows
- Form auto-clears after successful upload

### `offline.astro` — PWA Offline Fallback
- Bengali offline page shown when network unavailable
- Auto-redirects back to home when online

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

### Print Styles (`@media print`)
- Hides navbar, toast, action buttons, footer
- Forces white background, black text
- Shows print-only header with exam title + date
- Prevents page breaks inside question cards

### Design Language
- Glass morphism navbar (`backdrop-blur-xl bg-white/70`)
- Gradient hero sections
- Card-based layouts with soft shadows
- Rounded-2xl/3xl corners
- Mobile-first responsive design
- Bengali font support
- **Folder-style resource UI** — amber folder icons, expandable subject groups, file-entry blog items

---

## 9. JSON Upload Format

### Exam Upload (single or array)

Single exam:
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
    }
  ]
}
```

Batch upload (array of exams):
```json
[
  { "subject": "...", "examTitle": "...", "questions": [...] },
  { "subject": "...", "examTitle": "...", "questions": [...] }
]
```

### Blog Upload (single or array)

Single blog:
```json
{
  "subject": "CSE College Teacher",
  "title": "Data Structures Guide",
  "description": "Bangla Q&A for chapter 1",
  "examId": "optional-linked-exam-id",
  "slideUrl": "https://notebooklm.google.com/...",
  "content": [
    {
      "question": "Stack কী?",
      "answer": "Stack হলো LIFO পদ্ধতিতে কাজ করে...",
      "tags": ["stack", "LIFO"]
    }
  ]
}
```

Batch upload (array of blogs):
```json
[
  { "subject": "...", "title": "...", "content": [...] },
  { "subject": "...", "title": "...", "content": [...] }
]
```

### Validation Rules
- **Exam**: `subject` required, `examTitle` required, `questions` non-empty array, each question needs `questionText`, `options` (≥2), `correctOptionIndex` (valid range)
- **Blog**: `subject` required, `title` required, `content` non-empty array, each item needs `question` and `answer`

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
| **Chapter sort by title regex** | Avoids Firestore composite index requirement for `orderBy('createdAt')` with filters. Uses `Unit\s+(\d+(?:\.\d+)?)` with `Chapter\s+(\d+)` fallback. |
| **`sortOrder` field for exam ordering** | Separate from `order` field (used by question ordering in subcollection). Prevents conflict with chapter badge display. |
| **Negative marking: −0.25 per wrong** | Standard competitive exam penalty. 4 wrong answers = −1 mark. |
| **PWA with service worker** | Cache-first for static assets, network-first for pages, offline fallback page. |
| **Print CSS for results** | Students need to print score cards. Clean layout with header, no UI clutter. |
| **Astro over Next.js** | Simpler SSR, no React overhead, better Vercel integration, lighter bundle. |
| **localStorage for progress** | No server-side user tracking. Best score preserved across sessions. |
| **No student auth** | Simplifies UX. Name-only entry per attempt. |
| **Multi-file batch upload** | API accepts array of objects, processes sequentially, returns per-item success/error. |
| **Bulk delete via checkboxes** | Admin UI uses select all + individual checkboxes, POST to delete endpoint. |
| **Folder-style resource UI** | Blogs grouped by subject in expandable folders for better discoverability. |
| **No composite Firestore index queries** | All queries use single-field filter + JS filtering to avoid 500 errors. |
| **No `define:vars` in inline scripts** | Avoids colon-injection SyntaxError. All URL params parsed client-side via `URLSearchParams`. |

---

## 12. Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| Vercel firewall blocks DELETE method | All delete routes use `POST { action: "delete" }` |
| Firestore Timestamp returns `{_seconds, _nanoseconds}` | Client-side sorting uses `._seconds` or `.seconds` fallback |
| Local Node.js v24 not supported by Vercel | Build warning; Vercel uses Node.js 22 at runtime |
| `crypto.subtle` requires HTTPS | Works on Vercel (always HTTPS), fails on localhost HTTP |
| No composite Firestore index | All queries use single-field filter + JS filtering |
| `define:vars` with colons breaks inline scripts | All URL params parsed client-side via `URLSearchParams` |
| TypeScript `: any` in `<script is:inline>` | Browser JS doesn't understand TS syntax; removed from inline scripts |
| PWA install requires screenshots | Added 390×844 mobile screenshot in manifest.json |
| `order` field conflict | Question `order` in subcollection vs exam sort order — solved by using `sortOrder` for exam-level sorting |

---

## 13. Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production (Vercel serverless)
npm run preview      # Preview production build locally

# PWA Icons
node scripts/generate-icons.mjs      # Generate 8 PNG icons (72–512px)
node scripts/generate-screenshot.mjs # Generate mobile screenshot

# Git
git add .
git commit -m "message"
git push origin main

# One-time Firestore cleanup (run from browser console after deploy)
fetch('/api/admin/fix-order', {method:'POST'}).then(r=>r.json()).then(console.log)
```

---

## 14. Deployment

1. Push to `main` branch on GitHub
2. Vercel auto-deploys from GitHub
3. Set env vars in Vercel Dashboard → Settings → Environment Variables (Production)
4. Deploy Firestore rules via Firebase Console (currently deny-all)
5. After first deploy with `sortOrder` changes, run `fix-order` cleanup from browser console

---

## 15. Content Summary

### BCS/NTRCA/BANK Exam — 6 Chapters, 30 Units (907 MCQs)
| Chapter | Title | Units | Questions |
|---------|-------|-------|-----------|
| 1 | English Grammar | 7 | 216 |
| 2 | English Idioms & Phrases | 2 | 60 |
| 3 | বাংলা ব্যাকরণ | 6 | 180 |
| 4 | বাংলাদেশ বিষয়াবলি | 6 | 180 |
| 5 | Mathematics | 6 | 180 |
| 6 | International GK | 3 | 91 |

#### Ch1 — English Grammar (7 units, 216 MCQs)
| Unit | Title | Questions |
|------|-------|-----------|
| 1.1 | Parts of Speech & Verbs | 31 |
| 1.2 | Subject-Verb Agreement | 31 |
| 1.3 | Tenses | 30 |
| 1.4 | Conditionals & Subjunctive | 31 |
| 1.5 | Gerund, Infinitive & Participle | 31 |
| 1.6 | Voice (Active-Passive) | 31 |
| 1.7 | Additional Grammar | 31 |

#### Ch2 — English Idioms & Phrases (2 units, 60 MCQs)
| Unit | Title | Questions |
|------|-------|-----------|
| 2.1 | Idioms in Context | 30 |
| 2.2 | Additional Exam Idioms | 30 |

#### Ch3 — বাংলা ব্যাকরণ (6 units, 180 MCQs)
| Unit | Title | Questions |
|------|-------|-----------|
| 3.1 | সাধু ও চলিত ভাষা | 30 |
| 3.2 | বাগধারা | 30 |
| 3.3 | সমাস | 30 |
| 3.4 | বিরামচিহ্ন | 30 |
| 3.5 | কারক | 30 |
| 3.6 | সন্ধি | 30 |

#### Ch4 — বাংলাদেশ বিষয়াবলি (6 units, 180 MCQs)
| Unit | Title | Questions |
|------|-------|-----------|
| 4.1 | ভূগোল | 30 |
| 4.2 | মুক্তিযুদ্ধ | 30 |
| 4.3 | প্রাচীন ও মধ্যযুগ | 30 |
| 4.4 | ভাষা আন্দোলন ও ঔপনিবেশিক যুগ | 30 |
| 4.5 | প্রাকৃতিক সম্পদ ও কৃষি | 30 |
| 4.6 | জনসংখ্যা, শিক্ষা ও স্বাস্থ্য | 30 |

#### Ch5 — Mathematics (6 units, 180 MCQs)
| Unit | Title | Questions |
|------|-------|-----------|
| 5.1 | Basic Arithmetic | 30 |
| 5.2 | LCM, HCF & Divisibility | 30 |
| 5.3 | Primes, Digits & Division | 30 |
| 5.4 | Ratio & Proportion | 30 |
| 5.5 | Work & Time | 30 |
| 5.6 | Pipes & Cisterns | 30 |

#### Ch6 — International GK (3 units, 91 MCQs)
| Unit | Title | Questions |
|------|-------|-----------|
| 6.1 | World Capitals | 30 |
| 6.2 | World Currencies | 30 |
| 6.3 | International Organizations | 31 |

### CSE College Teacher — 10 Chapters (300 MCQs)
| # | Title | File |
|---|-------|------|
| 1 | Data Structures | `cse/chapter1-data-structures.json` |
| 2 | Algorithms | `cse/chapter2-algorithms.json` |
| 3 | Operating Systems | `cse/chapter3-operating-systems.json` |
| 4 | DBMS | `cse/chapter4-dbms.json` |
| 5 | Computer Networks | `cse/chapter5-computer-networks.json` |
| 6 | Software Engineering | `cse/chapter6-software-engineering.json` |
| 7 | OOP | `cse/chapter7-oop.json` |
| 8 | Theory of Computation | `cse/chapter8-theory-of-computation.json` |
| 9 | Compiler Design | `cse/chapter9-compiler-design.json` |
| 10 | Digital Logic | `cse/chapter10-digital-logic.json` |

### NTRCA School ICT — 10 Topic Exams (300 MCQs)
| # | Topic | File |
|---|-------|------|
| 1 | Computer Fundamentals | `cse/school/exams/exam-01-computer-fundamentals.json` |
| 2 | Number Systems & Boolean | `cse/school/exams/exam-02-number-systems-boolean.json` |
| 3 | Operating Systems | `cse/school/exams/exam-03-operating-systems.json` |
| 4 | MS Office | `cse/school/exams/exam-04-ms-office.json` |
| 5 | Networking | `cse/school/exams/exam-05-networking.json` |
| 6 | Programming | `cse/school/exams/exam-06-programming.json` |
| 7 | Database | `cse/school/exams/exam-07-database.json` |
| 8 | ICT Bangladesh | `cse/school/exams/exam-08-ict-bangladesh.json` |
| 9 | Multimedia | `cse/school/exams/exam-09-multimedia.json` |
| 10 | Current Trends | `cse/school/exams/exam-10-current-trends.json` |

### Islamic History — 1 Exam (30 MCQs)
| Title | File |
|-------|------|
| আরব ভূমি, সিরাত ও খোলাফায়ে রাশেদীন | `cse/school/exams/exam-11-islamic-history.json` |

### Blog/Study Resources
| Content | Q&A Count | File |
|---------|-----------|------|
| BCS/NTRCA/BANK (all chapters) | 907 | `cse/chapter1-*/unit*.json` (30 files) |
| CSE College Teacher (all chapters) | 300 | `cse/chapter*-*.json` (10 files) |
| NTRCA School ICT (combined) | 647 | `cse/ntrca-ict-blog.json` |
| NTRCA School ICT (by topic) | 649 | `cse/school/*.json` (10 files) |
| GATE PYQ Revision | 91 | `cse/gate-pyq-revision-blog.json` |
| Practice Sets | 300 | `cse/school/practice/set-*.json` (10 files) |

**Total: 1,507 exam MCQs + 2,861 blog Q&A**

---

## 16. Prompt Generation Guide

To generate prompts for this project, include:

1. **Stack context**: Astro 5, TypeScript, Firebase Firestore (Admin SDK), Tailwind CSS, Vercel
2. **Database**: Firestore with `subjects` (with `order`), `exams` (with `sortOrder`, `questions` subcollection), `blogs`, `attempts` (with `correct`/`wrong`/`skipped`/`penalty`) collections
3. **Auth**: Stateless HMAC-SHA256 signed cookies, `ADMIN_PASSWORD` env var, `checkAuth()` middleware
4. **API pattern**: Astro API routes in `src/pages/api/`, all use `getAdminDb()` from `src/lib/firebase-admin.ts`
5. **Pages**: Astro SSR pages in `src/pages/`, file-based routing
6. **Styling**: Tailwind with custom `brand-*`/`surface-*` palette, glass morphism, rounded-2xl/3xl, folder-style resource UI, print CSS
7. **Constraints**: No client Firebase SDK, POST for deletes (Vercel firewall), `data-qi`/`data-oi` for exam selection, no `define:vars` in inline scripts, no TS annotations in `<script is:inline>`
8. **Deployment**: Vercel auto-deploy from GitHub `main` branch, server-only env vars
9. **Upload formats**: Exam = `{subject, examTitle, questions[]}`, Blog = `{subject, title, content[]}`, both accept arrays for batch upload
10. **Bulk operations**: Admin checkboxes for multi-select delete, batch upload via file queue
11. **Reorder**: Subjects use `order` field, exams use `sortOrder` field, both via drag-and-drop in admin Manage tab
12. **Negative marking**: −0.25 per wrong answer, stored in attempts as `correct`/`wrong`/`skipped`/`penalty`
13. **PWA**: manifest.json + sw.js + icons + screenshots + offline page, install banner in Layout.astro
14. **Content structure**: Unit-level JSON files in `cse/chapterN-*/unitN-N-*.json`, combined bank in `cse/cse-complete-question-bank.json`
