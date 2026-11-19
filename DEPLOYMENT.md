# Deployment (Render)

Training1 runs on Render from the Blueprint in [render.yaml](render.yaml). That file is the source of truth; this page only explains how to work with it.

## What is deployed

| Resource | Type | Source | Address |
| --- | --- | --- | --- |
| `training1-frontend` | Web service (Next.js) | `carpe1al/Training1-Frontend`, branch `main` | https://training1-frontend.onrender.com |
| `training1-backend` | Web service (Fastify API) | `carpe1al/Training1Backend`, branch `main` | https://training1-backend.onrender.com |
| `training1-db` | PostgreSQL | managed by Render | internal only |

All three live in the **Training1** project in the Render dashboard, under the `training1` Blueprint.

## Day to day

- **Ship code:** merge to `main` in the frontend or backend repo. Render builds and deploys on its own.
- **Database changes:** commit Prisma migrations with the backend. They are applied at startup (`prisma migrate deploy` runs before the server starts).
- **Change infrastructure or environment variables:** edit `render.yaml`, push to `master` in this repo. Render syncs the Blueprint automatically.
- **Secrets** (e.g. `ANTHROPIC_API_KEY`) are marked `sync: false` in `render.yaml` and are set by hand on the service's Environment page.

## Things to know

- `NEXT_PUBLIC_API_BASE_URL` is baked into the website at build time. Changing it needs a redeploy of the frontend, not just a restart.
- `CORS_ORIGIN_FRONTEND` on the API must list every address the website is opened from.
- Everything is on the free plan. Web services sleep after a period without traffic, and the free database expires 30 days after creation unless upgraded (check the date on the database page in Render). Upgrade by changing `plan:` in `render.yaml`.
- The background workers in the backend (`src/jobs`) are not deployed. They are excluded from the production build (`tsconfig.build.json`) until they are wired in, at which point they will need Redis.

## Starting from scratch

1. In Render: **New > Blueprint**, pick `carpe1al/Training1`, and grant access to the frontend and backend repos.
2. Click **Deploy Blueprint**.
3. Open the website and use **Register** to create the first organisation and admin.
