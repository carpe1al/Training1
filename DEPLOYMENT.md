# Deployment (Render + Vercel)

The API and database run on Render from the Blueprint in [render.yaml](render.yaml); that file is the source of truth for them. The website runs on Vercel, set up on the Vercel project page. This page only explains how to work with both.

## What is deployed

| Resource | Type | Source | Address |
| --- | --- | --- | --- |
| Website | Vercel project (Next.js) | `carpe1al/Training1-Frontend`, branch `main` | https://training1.co |
| `training1-backend` | Render web service (Fastify API) | `carpe1al/Training1Backend`, branch `main` | https://training1-backend.onrender.com |
| `training1-db` | Render PostgreSQL | managed by Render | internal only |

The API and database live in the **Training1** project in the Render dashboard, under the `training1` Blueprint.

## Day to day

- **Ship code:** merge to `main` in the frontend or backend repo. Vercel (website) and Render (API) build and deploy on their own.
- **Database changes:** commit Prisma migrations with the backend. They are applied at startup (`prisma migrate deploy` runs before the server starts).
- **Change API infrastructure or environment variables:** edit `render.yaml`, push to `master` in this repo. Render syncs the Blueprint automatically.
- **Change website settings** (environment variables, domains): on the project page in Vercel.
- **Secrets** (e.g. `ANTHROPIC_API_KEY`) and `SUPER_ADMIN_EMAILS` are marked `sync: false` in `render.yaml` and are set by hand on the service's Environment page.

## Platform owners

A platform owner (the `SUPER_ADMIN` role) sees and manages every organization at `/platform`.

- **Who can be one:** only the emails in `SUPER_ADMIN_EMAILS` on the API service in Render (comma-separated). The list is checked when the account is created, at sign-in and on every request. Removing an email shuts that owner out as soon as the service restarts; an owner row added straight to the database does nothing unless its email is listed.
- **Create the account:** add the email in Render, then open https://training1.co/owner-setup (not linked from the site), choose a password, and scan the QR code with an authenticator app. Each listed email can be claimed once, so create the account right after adding the email.
- **Signing in:** password, then the 6-digit code from the authenticator app, every time. Five wrong codes lock the code step for 15 minutes.
- **Lost phone:** from the backend repo with `DATABASE_URL` pointing at the database, run `npm run owner:reset-mfa -- you@example.com`. The owner sets up a new app at their next sign-in.
- The authenticator secrets are encrypted with a key derived from `JWT_SECRET`. If `JWT_SECRET` ever changes, run the reset for each owner.

## Things to know

- `NEXT_PUBLIC_API_BASE_URL` is baked into the website at build time. It is set in Vercel (Settings > Environment Variables) to the API's address; changing it needs a redeploy of the website.
- `CORS_ORIGIN_FRONTEND` on the API must list every address the website is opened from, exactly (no trailing slash). It lists `training1.co` and `www.training1.co`; the `vercel.app` address and Vercel preview links are not listed, so sign-in fails from those.
- `training1.co` is added on the Vercel project's Domains page; the DNS records at the registrar are the ones Vercel shows there.
- Everything is on the free plan. Web services sleep after a period without traffic, and the free database expires 30 days after creation unless upgraded (check the date on the database page in Render). Upgrade by changing `plan:` in `render.yaml`.
- The background workers in the backend (`src/jobs`) are not deployed. They are excluded from the production build (`tsconfig.build.json`) until they are wired in, at which point they will need Redis.

## Starting from scratch

1. In Render: **New > Blueprint**, pick `carpe1al/Training1`, and grant access to the backend repo.
2. Click **Deploy Blueprint**.
3. In Vercel: **Add New > Project**, import `carpe1al/Training1-Frontend`, set `NEXT_PUBLIC_API_BASE_URL` to the API's address, and deploy. Then add `training1.co` under Domains.
4. Open the website and use **Register** to create the first organisation and admin.
