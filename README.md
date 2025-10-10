# Training1 Platform# Training1 – Mega README (for Copilot)



A comprehensive Learning Management System (LMS) platform built with modern web technologies.> **Training1** is an interactive LMS with iorad‑style click walkthroughs, Kahoot‑style live games, compliance learning paths, robust assessments (incl. fill‑in‑the‑blank), and **built‑in authoring** for PDFs/slide decks/handouts. 

>

## Architecture> This is a **single, massive README** you can paste into your repos. It covers a **multi‑repo** setup — no monorepo — with deployment to **Vercel (frontend)** and **Render (backend)**, and PostgreSQL as the primary database. It includes folders, env files, scaffolds, seed scripts, CI, and step‑by‑step instructions to connect GitHub repos and hosting.



This repository serves as the main documentation and orchestration hub for the Training1 platform, which consists of:---



- **Backend API** ([training1-backend](https://github.com/carpe1al/training1-backend)) - Fastify-based Node.js API with modular architecture## 0) Quick Links

- **Frontend App** ([training1-frontend](https://github.com/carpe1al/training1-frontend)) - React-based web application- **Repos**: `Training1` (main/meta), `Training1-Frontend` (Vercel), `Training1-Backend` (Render)

- **Main Repository** (this repo) - Documentation, Docker Compose, and platform orchestration- **Prod Domains (suggested)**: Frontend `https://app.training1.com`, Backend API `https://api.training1.com`

- **DB**: PostgreSQL 15+ (Render Managed), Redis (cache/queues), S3/MinIO for media/exports

## Quick Start

---

### Prerequisites

- Docker & Docker Compose## 1) Personas & Permissions

- Node.js 20+| Role | Scope | Highlights |

- Git|---|---|---|

| **Super Admin** | Platform‑wide | Tenants (brokers), billing/plans, feature flags, templates marketplace, audit logs, impersonation, data residency. |

### Development Setup| **Broker Admin** | Tenant | Branding, org structure, user mgmt, **create trainings**, **author docs/slides/PDFs**, **assign trainings**, compliance rules, analytics. |

| **Manager** | Team | Assign/track within scope, run live sessions, approve attempts. |

1. **Clone all repositories:**| **Learner** | Self | Take content, join live sessions, complete assessments, download certs. |

   ```bash

   git clone https://github.com/carpe1al/training1.git---

   git clone https://github.com/carpe1al/training1-backend.git

   git clone https://github.com/carpe1al/training1-frontend.git## 2) Repositories & Folder Structures (no monorepo)

   ```

### 2.1 `Training1` (Main/Meta)

2. **Start the development environment:****Purpose**: docs, issues, standards, runbooks, product specs.

   ```bash```

   cd training1Training1/

   docker-compose -f docker-compose.dev.yml up -d├─ docs/

   ```│  ├─ product/           # PRDs, UX flows, wireframes

│  ├─ architecture/      # diagrams, ADRs

3. **Access the services:**│  ├─ ops/               # runbooks, oncall, RTO/RPO

   - Frontend: http://localhost:3000│  └─ security/          # policies, DPIA, SOC2 prep

   - Backend API: http://localhost:3001├─ env/

   - API Documentation: http://localhost:3001/docs│  ├─ .env.main.example  # shared meta non‑secrets

│  └─ .env.local.example # local pointers for devs

## Platform Features├─ .github/

│  ├─ ISSUE_TEMPLATE/

### 🎓 Learning Management│  ├─ workflows/

- **Course Management** - Create, organize, and deliver courses│  │  └─ docs-lint.yml   # optional markdown lint

- **Content Authoring** - Rich content creation tools│  └─ PULL_REQUEST_TEMPLATE.md

- **Assessment System** - Quizzes, tests, and evaluations└─ README.md

- **Progress Tracking** - Detailed learning analytics```



### 👥 Multi-Tenant Architecture### 2.2 `Training1-Backend` (API on Render)

- **Organization Management** - Multi-tenant SaaS platform**Purpose**: REST + GraphQL API, business logic, queue workers, rendering services (PDF/DOCX/PPTX), live WS.

- **User Management** - Role-based access control```

- **Tenant Isolation** - Complete data separationTraining1-Backend/

├─ src/

### 🔐 Enterprise Security│  ├─ app.ts                 # bootstrap Fastify/NestJS

- **Authentication** - Magic links, OAuth, SAML SSO│  ├─ server.ts              # createServer/start

- **Authorization** - Granular permissions and roles│  ├─ config/                # cors, rate limits, constants

- **SCIM Integration** - User provisioning│  ├─ modules/

- **Compliance** - SCORM, xAPI support│  │  ├─ auth/               # OIDC, Magic Link, SAML, SCIM

│  │  ├─ tenants/            # tenants, branding, plans

### 📊 Analytics & Reporting│  │  ├─ users/              # users, roles, ABAC attrs

- **Learning Analytics** - Detailed progress tracking│  │  ├─ training/           # courses, modules, lessons, activities

- **Custom Reports** - Flexible reporting system│  │  ├─ assessment/         # items, pools, forms, attempts

- **Real-time Dashboards** - Live performance metrics│  │  ├─ grading/            # scoring workers, item analysis

│  │  ├─ authoring/          # doc/slide JSON models

## Technology Stack│  │  ├─ renderers/

│  │  │  ├─ doc-render/      # HTML→PDF/DOCX

### Backend│  │  │  └─ slide-render/    # PPTX generation

- **Framework:** Fastify (Node.js/TypeScript)│  │  ├─ recorder/           # uploads, step parsing

- **Database:** PostgreSQL with Prisma ORM│  │  ├─ media/              # uploads, transcode, captions

- **Cache:** Redis│  │  ├─ live/               # WS rooms, polls, leaderboards

- **Search:** OpenSearch│  │  ├─ compliance/         # seat-time, certificates, audit

- **Storage:** MinIO (S3-compatible)│  │  ├─ analytics/          # xAPI, reports

- **Jobs:** BullMQ│  │  ├─ notify/             # email/SMS/push

- **WebSockets:** Real-time communications│  │  ├─ billing/            # plans, Stripe webhooks

│  │  └─ search/             # OpenSearch indexing

### Frontend│  ├─ ws/                    # WebSocket gateway

- **Framework:** React with TypeScript│  ├─ jobs/                  # BullMQ processors (transcode, captions, grading)

- **Styling:** Tailwind CSS│  ├─ utils/                 # logging, tracing, security, rls

- **State Management:** Zustand│  └─ types/                 # shared server types

- **Forms:** React Hook Form├─ prisma/

- **UI Components:** Headless UI│  ├─ schema.prisma          # PostgreSQL schema

│  └─ migrations/

### Infrastructure├─ docker/

- **Containerization:** Docker & Docker Compose│  └─ docker-compose.local.yml  # local Postgres/Redis/MinIO

- **Reverse Proxy:** Nginx├─ scripts/

- **CI/CD:** GitHub Actions│  ├─ migrate.sh

- **Monitoring:** Health checks and logging│  ├─ seed-super-admin.ts       # creates first tenant + Super Admin

│  └─ healthcheck.sh

## Module Architecture├─ tests/

├─ .env.example

The backend follows a modular architecture with domain-driven design:├─ package.json

└─ README.md

``````

src/modules/

├── auth/          # Authentication & authorization### 2.3 `Training1-Frontend` (Next.js on Vercel)

├── users/         # User management**Purpose**: Learner + Admin UIs; role‑gated routes, API client, players.

├── tenants/       # Multi-tenant management```

├── training/      # Course & content managementTraining1-Frontend/

├── assessment/    # Tests & evaluations├─ src/

├── grading/       # Scoring & grading│  ├─ app/                       # Next.js App Router

├── authoring/     # Content creation│  │  ├─ (public)/

├── renderers/     # Content rendering│  │  │  ├─ login/page.tsx

├── recorder/      # Screen/video recording│  │  │  └─ verify/page.tsx      # magic-link callback

├── media/         # File & media management│  │  ├─ (learner)/

├── live/          # Live sessions & webinars│  │  │  ├─ dashboard/page.tsx

├── compliance/    # Standards compliance│  │  │  ├─ catalog/page.tsx

├── analytics/     # Learning analytics│  │  │  └─ course/[id]/page.tsx

├── notify/        # Notifications│  │  ├─ (admin)/

├── billing/       # Subscription management│  │  │  ├─ trainings/new/page.tsx

└── search/        # Full-text search│  │  │  ├─ assignments/new/page.tsx

```│  │  │  ├─ analytics/page.tsx

│  │  │  └─ settings/page.tsx

## Development│  │  └─ layout.tsx

│  ├─ components/

### Project Structure│  │  ├─ Player/

```│  │  ├─ WalkthroughPlayer/

training1/                 # Main repository (this one)│  │  ├─ AssessmentRunner/

├── docs/                  # Platform documentation│  │  └─ forms/

├── scripts/               # Development scripts│  ├─ lib/                       # api client, auth, rbac hooks

├── docker-compose.dev.yml # Development environment│  └─ styles/

└── nginx/                 # Reverse proxy config├─ public/

├─ env/

training1-backend/         # Backend API repository│  └─ .env.frontend.example

├── src/modules/           # Modular backend code├─ next.config.mjs

├── prisma/                # Database schema├─ package.json

└── tests/                 # Backend tests└─ README.md

```

training1-frontend/        # Frontend repository

├── src/                   # React application> Recorder Desktop & Extension can live in separate future repos (optional: `Training1-Desktop`, `Training1-Extension`). Backend already exposes endpoints to accept uploads.

├── public/                # Static assets

└── tests/                 # Frontend tests---

```

## 3) Database & Storage

### Development Commands- **DB**: **PostgreSQL 15+** (Render Managed PostgreSQL recommended)

- **Cache/Queues**: Redis (Render Managed or Upstash)

```bash- **Object Storage**: S3 (AWS) or MinIO (local/dev) for media & exported PDFs/PPTX/DOCX

# Start all services- **(Optional)**: OpenSearch for full‑text search; ClickHouse for analytics warehouse

docker-compose -f docker-compose.dev.yml up -d

### 3.1 Prisma Schema (core excerpt)

# View logs```prisma

docker-compose -f docker-compose.dev.yml logs -f// prisma/schema.prisma

 datasource db { provider = "postgresql" url = env("DATABASE_URL") }

# Run health checks generator client { provider = "prisma-client-js" }

bash scripts/healthcheck.sh

 model Tenant {

# Stop services   id        String  @id @default(uuid())

docker-compose -f docker-compose.dev.yml down   slug      String  @unique

```   name      String

   plan      String  @default("standard")

## Documentation   branding  Json    @default("{}")

   users     User[]

- [Architecture Overview](docs/architecture/README.md)   courses   Course[]

- [Product Requirements](docs/product/README.md) }

- [Repository Setup Guide](docs/repository-setup.md)

- [Development Scripts](scripts/README.md) model User {

   id        String   @id @default(uuid())

## Contributing   tenantId  String

   email     String

1. Fork the repository   givenName String?

2. Create a feature branch: `git checkout -b feature/amazing-feature`   familyName String?

3. Commit your changes: `git commit -m 'Add amazing feature'`   roles     String[] @default(["LEARNER"]) // SUPER_ADMIN, BROKER_ADMIN, MANAGER, LEARNER

4. Push to the branch: `git push origin feature/amazing-feature`   attrs     Json     @default("{}")

5. Open a Pull Request   Tenant    Tenant   @relation(fields: [tenantId], references: [id])

   @@unique([tenantId, email])

## License }



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. model Course {

   id        String  @id @default(uuid())

## Support   tenantId  String

   title     String

For support, email support@training1.com or join our Slack channel.   status    String  @default("draft") // draft|published

   meta      Json    @default("{}")

---   modules   Module[]

   Tenant    Tenant  @relation(fields: [tenantId], references: [id])

**Training1 Platform** - Empowering organizations with modern learning technology. }

 model Module { id String @id @default(uuid()); courseId String; title String; order Int; Course Course @relation(fields:[courseId], references:[id]); lessons Lesson[] }
 model Lesson { id String @id @default(uuid()); moduleId String; title String; order Int; Module Module @relation(fields:[moduleId], references:[id]); activities Activity[] }

 model Activity {
   id       String @id @default(uuid())
   lessonId String
   type     String // video|doc|slide|walkthrough|quiz|assignment|live
   config   Json
   Lesson   Lesson @relation(fields:[lessonId], references:[id])
 }

 model Assignment {
   id        String @id @default(uuid())
   tenantId  String
   courseId  String
   createdBy String
   dueAt     DateTime?
   policy    Json    @default("{}")
 }

 model Enrollment {
   id           String @id @default(uuid())
   userId       String
   courseId     String
   assignmentId String?
   status       String  @default("not_started") // in_progress|completed|expired
   progressPct  Int     @default(0)
 }
```

### 3.2 RLS Strategy (application‑enforced)
Enforce tenant filtering in every query by injecting `tenantId` after auth and scoping all fetches/updates.

---

## 4) Authentication & Logins
Support **Magic Link** (passwordless) and **OIDC** (Google/Microsoft/Auth0). Optional **SAML** and **SCIM**.

### 4.1 Minimal Endpoints
```
POST /v1/auth/magic-link            # { email, tenantSlug }
POST /v1/auth/magic-link/consume    # verify token → set session cookie
GET  /v1/auth/oidc/:provider        # redirect to IdP
POST /v1/auth/callback/oidc         # OIDC callback
GET  /v1/me                         # profile + roles + tenant
POST /v1/auth/logout
```

### 4.2 Session & Cookies
- Cookie `sid`: HttpOnly, Secure, SameSite=None, Domain=`.training1.com`, Expires=30d
- Access token TTL 15m; refresh 30d; rotation enabled
- CSRF: double‑submit token (`csrf` cookie + `x-csrf` header)

---

## 5) Environment Strategy & .env Files
> Separate envs for **main repo**, **frontend**, **backend**, and **local**.

### 5.1 `Training1` (main)
`env/.env.main.example`
```
APP_NAME=Training1
FRONTEND_REPO=Training1-Frontend
BACKEND_REPO=Training1-Backend
PRIMARY_REGION=us-east
```
`env/.env.local.example`
```
GITHUB_ORG=your-org
DOCS_BASE_URL=https://github.com/your-org/Training1/tree/main/docs
```

### 5.2 `Training1-Backend`
`.env.local`
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/training1
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=training1
CORS_ORIGIN_FRONTEND=http://localhost:3000
JWT_SECRET=change_me
COOKIE_DOMAIN=localhost
SMTP_URL=smtp://localhost:1025
OIDC_GOOGLE_CLIENT_ID=
OIDC_GOOGLE_CLIENT_SECRET=
OIDC_REDIRECT_URI=http://localhost:4000/v1/auth/callback/oidc
RENDER_EXTERNAL_URL=
```
`.env.production` (Render environment)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgres://<render-user>:<pass>@<host>:5432/<db>?sslmode=require
REDIS_URL=rediss://:<pass>@<redis-host>:6379
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...
S3_BUCKET=training1-prod
CORS_ORIGIN_FRONTEND=https://app.training1.com
JWT_SECRET=super-long-random
COOKIE_DOMAIN=.training1.com
SMTP_URL=smtps://apikey:xxx@sendgrid.net:465
OIDC_GOOGLE_CLIENT_ID=...
OIDC_GOOGLE_CLIENT_SECRET=...
OIDC_REDIRECT_URI=https://api.training1.com/v1/auth/callback/oidc
RENDER_EXTERNAL_URL=https://api.training1.com
```

### 5.3 `Training1-Frontend`
`.env.local`
```
NEXT_PUBLIC_APP_NAME=Training1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```
`.env.production` (Vercel environment)
```
NEXT_PUBLIC_APP_NAME=Training1
NEXT_PUBLIC_API_BASE_URL=https://api.training1.com
NEXT_PUBLIC_WS_URL=wss://api.training1.com
```

---

## 6) Local Development (End‑to‑End)
```bash
# 1) Clone all three
git clone git@github.com:your-org/Training1.git
git clone git@github.com:your-org/Training1-Backend.git
git clone git@github.com:your-org/Training1-Frontend.git

# 2) Backend deps & DB
cd Training1-Backend
cp .env.example .env.local
docker compose -f docker/docker-compose.local.yml up -d
pnpm i
pnpm prisma generate
pnpm prisma migrate dev
pnpm ts-node scripts/seed-super-admin.ts  # creates first tenant + Super Admin
pnpm dev

# 3) Frontend
cd ../Training1-Frontend
cp env/.env.frontend.example .env.local
pnpm i
pnpm dev

# 4) Open app
open http://localhost:3000
```

---

## 7) Connect GitHub Repos & Hosting (after creating repos)
### 7.1 Create and push repos
```bash
# main
mkdir Training1 && cd Training1 && git init
# add README + docs, then
git remote add origin git@github.com:your-org/Training1.git
git add . && git commit -m "chore: init main repo" && git push -u origin main

# backend
mkdir ../Training1-Backend && cd ../Training1-Backend && git init
# add scaffold files, then
git remote add origin git@github.com:your-org/Training1-Backend.git
git add . && git commit -m "chore: init backend" && git push -u origin main

# frontend
mkdir ../Training1-Frontend && cd ../Training1-Frontend && git init
# add scaffold files, then
git remote add origin git@github.com:your-org/Training1-Frontend.git
git add . && git commit -m "chore: init frontend" && git push -u origin main
```

### 7.2 Connect **Render** (backend)
1. Render → **New +** → Web Service → pick `Training1-Backend` repo.
2. Build Command: `pnpm i && pnpm build` ; Start Command: `pnpm start`.
3. Add **PostgreSQL** (Managed) and **Redis**; note `DATABASE_URL`, `REDIS_URL`.
4. Set env vars from `.env.production`.
5. Custom domain `api.training1.com`; set `RENDER_EXTERNAL_URL`.
6. Post‑deploy command: `pnpm prisma migrate deploy`.

### 7.3 Connect **Vercel** (frontend)
1. Vercel → **Add New** → Project → pick `Training1-Frontend` repo.
2. Framework: Next.js; Build `pnpm build`.
3. Env vars from `.env.production` (API base URL, WS URL).
4. Domain `app.training1.com` (or use the default `*.vercel.app` first).

### 7.4 Wire CORS & Cookies
- Backend CORS allow origin `https://app.training1.com`, credentials enabled.
- Cookie domain `.training1.com` so sessions work across subdomains.

---

## 8) Backend Scaffolds (Fastify sample)
**`src/server.ts`**
```ts
import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { registerAuth } from './modules/auth/routes';
import { registerTraining } from './modules/training/routes';

export function createServer(){
  const app = fastify({ logger: true });
  app.register(cors, { origin: process.env.CORS_ORIGIN_FRONTEND?.split(','), credentials: true });
  app.register(cookie, { hook: 'onRequest' });
  app.get('/healthz', async()=>({ ok:true }));
  app.register(registerAuth, { prefix: '/v1/auth' });
  app.register(registerTraining, { prefix: '/v1' });
  return app;
}

if (require.main === module){
  const app = createServer();
  app.listen({ port: Number(process.env.PORT||4000), host: '0.0.0.0' });
}
```

**`src/modules/training/routes.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
export const registerTraining: FastifyPluginAsync = async (app) => {
  app.post('/courses', async (req, rep)=> {/* create course */});
  app.post('/courses/:id/publish', async (req, rep)=> {/* publish */});
  app.post('/assignments', async (req, rep)=> {/* assign */});
  app.get('/assignments/:id/progress', async (req, rep)=> {/* progress */});
};
```

**Seeding Super Admin** `scripts/seed-super-admin.ts`
```ts
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
(async()=>{
  const tenant = await db.tenant.upsert({
    where: { slug: 'broker1' },
    update: {},
    create: { slug: 'broker1', name: 'Broker One' }
  });
  await db.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'super@training1.com' } },
    update: { roles: ['SUPER_ADMIN','BROKER_ADMIN'] },
    create: {
      tenantId: tenant.id,
      email: 'super@training1.com',
      roles: ['SUPER_ADMIN','BROKER_ADMIN']
    }
  });
  console.log('Seeded tenant and super admin');
  process.exit(0);
})();
```

---

## 9) Frontend Scaffolds (Next.js)
**`src/app/(public)/login/page.tsx`**
```tsx
'use client';
import { useState } from 'react';
export default function Login(){
  const [email,setEmail]=useState('');
  async function send(){
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/magic-link`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      credentials:'include', body: JSON.stringify({ email, tenantSlug:'broker1' })
    });
    alert('Check your email for a magic link');
  }
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <input className="border p-2 w-full mb-2" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
      <button className="btn" onClick={send}>Email me a link</button>
    </div>
  );
}
```

**Admin assignment stub** `src/app/(admin)/assignments/new/page.tsx`
```tsx
'use client';
import { useState } from 'react';
export default function NewAssignment(){
  const [courseId,setCourseId]=useState('');
  const [dueAt,setDueAt]=useState('');
  async function create(){
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/assignments`,{
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ courseId, targets:[{ type:'group', ref:'all' }], dueAt })
    });
    alert('Assignment created');
  }
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Assign Training</h1>
      <input className="border p-2 w-full mb-2" placeholder="Course ID" value={courseId} onChange={e=>setCourseId(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="datetime-local" value={dueAt} onChange={e=>setDueAt(e.target.value)} />
      <button className="btn" onClick={create}>Assign</button>
    </div>
  );
}
```

---

## 10) Broker: Create & Assign Trainings
**UI flow**
1. Admin → **Trainings → New**: build **Course → Modules → Lessons → Activities**.
2. **Publish** course.
3. Admin → **Assignments → New**: choose course(s), select targets (users/teams/attributes), set due date & reminders → **Create**.
4. Track in Analytics (progress, scores, overdue) and send nudges.

**API**
```http
POST /v1/courses                    # create training
POST /v1/courses/:id/publish        # publish
POST /v1/assignments                # { courseId, targets[], dueAt }
GET  /v1/assignments/:id/progress   # tracking
```

**Tables (minimal)**
```
assignments(id, tenant_id, course_id, created_by, due_at, policy_json)
assignment_targets(id, assignment_id, target_type, target_ref)
enrollments(id, user_id, course_id, assignment_id, status, progress_pct)
```

---

## 11) Authoring (Docs/Slides/PDFs)
- **Doc Studio** JSON → `doc-render` → **PDF/DOCX** (headless Chromium + docx-templater).
- **Slide Studio** JSON → `slide-render` → **PPTX** (PptxGenJS) + preview thumbnails.
- Brand kits (logo/colors/fonts), template variables: `{{company.name}}`, `{{learner.name}}`.
- Accessibility: tagged PDFs; alt text validation.

---

## 12) Recorder (Click Trainings)
- Desktop (Tauri) & Extension (MV3) capture steps and screenshots; upload to backend.
- Privacy tools: regex field masking, manual blur, local redaction.
- Player supports **Guided** and **Hands‑on** modes.

---

## 13) Assessments & Proctoring
- Item types: MCQ, MSQ, **cloze**, matching, ordering, hotspot, numeric, short answer (rubrics), file upload.
- Pools/Blueprints → randomized forms; feedback policies; timers and attempts.
- Optional proctoring: webcam snapshots, tab focus, ID check.

---

## 14) Live Sessions (Kahoot‑style)
- Rooms with host controls; timers, streaks, power‑ups; leaderboards.
- Breakouts; polls; word clouds; reactions.

---

## 15) Security, RLS, CORS
- Enforce tenant scoping per request; filter by `tenantId` in all queries.
- Cookie domain `.training1.com`; HTTPS only; HSTS; rotate JWT secrets.
- CORS whitelist: `https://app.training1.com` (prod), `http://localhost:3000` (dev).

---

## 16) CI/CD (GitHub Actions)
**Backend** `.github/workflows/backend.yml`
```yaml
name: backend-ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i && pnpm build && pnpm test
```
**Frontend** `.github/workflows/frontend.yml`
```yaml
name: frontend-ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i && pnpm build
```

---

## 17) Observability & Error Handling
- Standard error envelope `{ code, message, details, traceId }`.
- Logging: Pino with request IDs; expose `/healthz`.
- Tracing: OpenTelemetry (optional); metrics scraped by Render/3rd‑party APM.

---

## 18) Post‑Deployment Checklist
- [ ] Backend up; `/healthz` returns 200
- [ ] DB migrations deployed on Render
- [ ] Seeded **tenant** + **Super Admin**
- [ ] Frontend envs point to `https://api.training1.com`
- [ ] Magic Link emails deliver
- [ ] CORS & cookies work across subdomains
- [ ] Broker Admin can **create** and **assign** training; Learner can complete
- [ ] SSL certs for `api.training1.com` & `app.training1.com`

---

## 19) Copilot Task Blocks (paste into chat or files)
- **Backend scaffold:**
  > Generate Fastify routes for courses (create/publish), assignments (create/progress) with Zod validation and Prisma calls.
- **Prisma expansion:**
  > Add tables for Items, Pools, Forms, Attempts with relations to Course and Tenant; generate migrations.
- **Auth:**
  > Implement Magic Link endpoints with JWT signing, secure cookies, and a `/v1/me` route returning roles and tenant.
- **Frontend pages:**
  > Create admin pages for training builder and assignment wizard with React Hook Form and API integration.
- **Render config:**
  > Add post‑deploy script `pnpm prisma migrate deploy` and health check `/healthz`.
- **Vercel config:**
  > Add environment variables and a rewrite `/api/:path* → https://api.training1.com/:path*` if proxying.

---

## 20) Appendix: Docker Compose (Local)
`Training1-Backend/docker/docker-compose.local.yml`
```yaml
version: '3.9'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: training1
    ports: ["5432:5432"]
    volumes: ["db_data:/var/lib/postgresql/data"]
  redis:
    image: redis:7
    ports: ["6379:6379"]
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports: ["9000:9000", "9001:9001"]
    volumes: ["minio_data:/data"]
volumes:
  db_data: {}
  minio_data: {}
```
---

**End of Mega README.** Update values to match your org, domains, and providers. Paste this into `Training1/README.md` (and copy relevant sections into the `Training1-Backend` and `Training1-Frontend` READMEs).