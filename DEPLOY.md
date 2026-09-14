# Deploy Qualvera CRM

This is the deploy and sign-in guide for Richard (founder). It does not invent
live URLs. Fill the origins after Vercel creates them.

The product is three Vercel deployments plus one Neon Postgres database.
They must share `DATABASE_URL` and `BETTER_AUTH_SECRET`. A mismatch on those
two values is a sign-in redirect loop, not a clear error.

This CRM stays separate from Company Knowledge. Do not attach these apps to
the `company-knowledge-app` Vercel project or that product's database.

## What you create

| Piece | Root directory | Role |
| --- | --- | --- |
| Neon Postgres | — | One database for all three apps |
| Vercel project `qualvera-crm-app` | `apps/app` | Next.js UI |
| Vercel project `qualvera-crm-api` | *(empty — repository root)* | NestJS API, Better Auth, crons |
| Vercel project `qualvera-crm-agent` | `apps/agent` | eve research agent |

Use the GitHub repo `rijakii-cpu/qualvera-crm`, production branch `release`.
Framework: Next.js on the app. **Other** on the API (Build Output API, not
static, not Next.js). eve on the agent.

Migrations run during the **production** API build (`prisma migrate deploy`
when `VERCEL_ENV === "production"`). Preview deploys share that database
and do not migrate it. Test schema changes locally.

## `qualvera-crm-api` project settings

A wrong preset looks for `public/` and fails with `STATIC_BUILD_NO_OUT_DIR`.
The Nest API has no static output.

`apps/api/package.json` `build` is the local Bun server (`dist/`). Vercel
must not run it. Turbo `api:build` is that script. The API deploys only
through `apps/api/scripts/build-func.mjs` (Build Output API v3).

Vercel looks for `.vercel/output` **relative to the project Root Directory**.
On Vercel the build script writes that folder at `process.cwd()` (the Root
Directory). The working Root Directory is the **repository root**, not
`apps/api`.

Root Directory `apps/api` failed on `dpl_6X2DwStsjqmt8RTymT6z1Urm62uh`
(`STATIC_BUILD_NO_OUT_DIR`). That deploy ran an older `build-func.mjs` that
wrote output only at the repository root. Do not set Root Directory to
`apps/api`.

Do not set Output Directory to `public`, `dist`, or `.`. After a successful
build the deploy inspector must show a Node function at `/api/index`.

The bun bundle is the only production handler. It is built from
`apps/api/serverless.ts` into `.vercel/output` at both the repository
root and `apps/api` (same layout as `dpl_DjuDk95` and `dpl_5NvdXGgf`).
Do not add a default-export handler under `apps/api/api/`. Vercel then
serves `/var/task/apps/api/api/index.js` and the function crashes on the
extensionless `../src/create-app` import (`dpl_8tUjtEfZNTeUw8Ew2W1Y38EbRjHp`).

Dashboard path: Project → Settings → General (Root Directory) and
Settings → Build and Deployment.

The repository-root `vercel.json` holds crons only. It must not set
`buildCommand` or `installCommand`. Vercel applies that file even when
a project's Root Directory is `apps/app` or `apps/agent`. A no-cache
redeploy of `c124380` still ran `bun apps/api/scripts/build-func.mjs`
and failed `BUILD_UTILS_SPAWN_1` on both of those projects.

API install and build come from the **qualvera-crm-api** dashboard, not
from the repository-root `vercel.json`:

| Setting | Required value |
| --- | --- |
| Framework Preset | **Other** |
| Root Directory | *(empty)* |
| Install Command | `bun install` |
| Build Command | `bun apps/api/scripts/build-func.mjs` |
| Output Directory | **empty** (no `public`) |
| Node.js Version | `22.x` |

`qualvera-crm-app` uses Root Directory `apps/app` and
`apps/app/vercel.json` (`framework`: `nextjs`). `qualvera-crm-agent`
uses Root Directory `apps/agent` and `apps/agent/vercel.json`
(`framework`: `eve`). Those files must not run `build-func.mjs`.

If a dashboard override still says `public`, turn Override off. Then
Redeploy `release` without the build cache.

## Required environment

Set the same values on every project that reads them. `.env.example` is the
full list. Never commit a real secret.

| Variable | App | API | Agent | What to put |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | yes | yes | yes | Neon pooled URL |
| `DIRECT_DATABASE_URL` | — | yes | — | Neon direct URL if `DATABASE_URL` is a pooler |
| `BETTER_AUTH_SECRET` | yes | yes | — | `openssl rand -base64 32` — **same value on app and API** |
| `ALLOWED_SIGN_IN` | — | yes | — | `rijakii@gmail.com` to start |
| `API_URL` | yes | yes | — | API origin, e.g. `https://<api>.vercel.app` |
| `APP_URL` | yes | yes | — | App origin, e.g. `https://<app>.vercel.app` |
| `AGENT_URL` | yes | yes | yes | Agent origin **with scheme**, e.g. `https://<agent>.vercel.app` |

The browser auth client talks to the **API origin**. The app build inlines
`API_URL` as `NEXT_PUBLIC_API_URL`. OAuth state and session cookies then
live on the API host, which is also `/api/auth/callback/*`. Set `API_URL`
and `APP_URL` on **both** the app and API projects when those hosts are
`*.vercel.app`. Better Auth `trustedOrigins` already includes `APP_URL`
and `API_URL`. CORS with credentials already allows the app Origin.

Do **not** set `AUTH_COOKIE_DOMAIN` or `crossSubDomainCookies` for
`*.vercel.app`. `qualvera-crm-app.vercel.app` and
`qualvera-crm-api.vercel.app` do not share a cookie domain. Set
`AUTH_COOKIE_DOMAIN` only when the app and API share a custom parent
(`.qualvera.com`).

`ALLOWED_SIGN_IN` is the whole authorisation model. An empty list lets
nobody in. Start with one address; widen to the Qualvera domain later:

```sh
ALLOWED_SIGN_IN="rijakii@gmail.com"
# later:
# ALLOWED_SIGN_IN="qualvera.com,rijakii@gmail.com"
```

### OAuth — at least one of Google or Microsoft

Sign-in has no password. Richard uses Google and/or Microsoft. Set **both
halves of a pair**, or neither.

| Variable | Notes |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google button and Gmail/Calendar |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Microsoft button and Outlook |

**Redirect URIs must hit the API origin**, not the app:

```
https://<API_URL host>/api/auth/callback/google
https://<API_URL host>/api/auth/callback/microsoft
```

Locally those are `http://localhost:3001/api/auth/callback/google` and
`…/microsoft`. Better Auth serves `/api/auth/*` at `API_URL`. A URI built
from `APP_URL` fails with "redirect_uri did not match".

Google Cloud: create a Web application OAuth client. Enable Gmail API and
Calendar API if you want mailbox sync. Workspace consent screen Internal
keeps the prompt inside the org.

Microsoft Entra: Web redirect URI on the app registration. Delegated
Graph permissions `User.Read` and `Mail.Read`. Copy the secret **Value**,
not the Secret ID.

### Optional

| Variable | What it does when unset |
| --- | --- |
| `AGENT_BRIDGE_SECRET` | Agent tab says it is not configured. Agent still runs its schedule. Same value on app, API, and agent. `openssl rand -base64 32` |
| `CRON_SECRET` | Mailbox and rate crons refuse to run (fail closed). Min 16 characters. |
| `AUTH_COOKIE_DOMAIN` | Only if app and API sit on different subdomains of one parent (`.qualvera.com`) |
| `AI_GATEWAY_API_KEY` | Not needed on Vercel (OIDC) |
| `PERPLEXITY_API_KEY`, `GITHUB_TOKEN`, `BLOB_READ_WRITE_TOKEN` | Agent looks in fewer places. Never throws. |

Crons live in the repository-root `vercel.json`. The build script does not
copy them into `.vercel/output/config.json`. The same path in both places
fails the deploy with `duplicated_cron_job`. Minute schedules need Vercel
Pro. Hobby silently becomes daily.

## How Richard signs in

1. Open the **app** origin. A signed-out visitor goes to `/sign-in`
   (`IS_MARKETING` stays off).
2. Click Google or Microsoft. The provider must list the API callback URI
   above.
3. The account email must appear on `ALLOWED_SIGN_IN`, or its domain must.
   `rijakii@gmail.com` is the first allow-list entry.
4. First successful sign-in creates the workspace membership.

If the sign-in page says there is no method configured, the Google or
Microsoft pair is missing on the **API** project. If Google returns
`/sign-in?error=state_mismatch`, the browser stored the OAuth state
cookie on the app host. The auth client must use `NEXT_PUBLIC_API_URL`.
If the provider accepts the login and the app bounces between `/sign-in`
and `/`, `APP_URL` / `API_URL` / `BETTER_AUTH_SECRET` do not match
across app and API.

## Deploy order

1. Create the Neon project. Copy the pooled URL and the direct URL.
2. Create the three Vercel projects. Leave the API Root Directory empty.
3. Generate `BETTER_AUTH_SECRET`. Put it on app and API.
4. Set `ALLOWED_SIGN_IN=rijakii@gmail.com` on the API.
5. Set `DATABASE_URL` (and `DIRECT_DATABASE_URL` if needed) on all three.
6. Deploy API first so migrations run in production.
7. Copy the three `*.vercel.app` origins. Set `API_URL`, `APP_URL`, and
   `AGENT_URL` on the projects that need them. Redeploy app and API.
8. Add those API callback URIs to Google and/or Microsoft.
9. Set OAuth client id/secret on the API (and app if it reads the pair).
10. Optional: `AGENT_BRIDGE_SECRET` and `CRON_SECRET`.
11. Open the app origin and sign in with the allow-listed Google or
    Microsoft account.

Do not run `vercel env pull` into `.env.local` on a laptop. That file wins
over `.env` and can point `bun run dev` at production. Pull to
`.env.vercel` instead. `docs/setup.md` has the full warning.

## Local quick start

You need [Bun](https://bun.com) and Docker.

```sh
git clone https://github.com/rijakii-cpu/qualvera-crm.git && cd qualvera-crm
cp .env.example .env
# fill BETTER_AUTH_SECRET, ALLOWED_SIGN_IN, and one OAuth pair
bun install
docker compose up -d
bun run db:deploy && bun run db:seed
bun run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)
- Agent: `http://127.0.0.1:2000` (use `127.0.0.1`, not `localhost`)

`DATABASE_URL` in `.env.example` already matches `docker compose`. Leave it
unless you point at Neon from the laptop.

`ALLOWED_SIGN_IN` for a one-person laptop:

```sh
ALLOWED_SIGN_IN="rijakii@gmail.com"
```

OAuth redirect URIs for local:

```
http://localhost:3001/api/auth/callback/google
http://localhost:3001/api/auth/callback/microsoft
```

More operational detail: [`docs/setup.md`](./docs/setup.md) and
[`.env.example`](./.env.example).

## Deploy attempt (this environment)

Tried from the Qualvera branding agent on 2026-09-14. **No live CRM URL
exists.** Do not treat Company Knowledge URLs as this product.

| Blocker | What was true |
| --- | --- |
| No Qualvera Vercel projects | Team `company-knowledge` (`team_p9crgtCgkcAmsnqRgiJBo2Gy`) has `company-knowledge-app` and `chatbot` only. |
| No Qualvera Neon project | Orgs `org-snowy-wildflower-52087346` and `org-purple-hall-06772130` have no CRM / Qualvera database. |
| Cannot set Vercel env from here | The Vercel tools in this session list projects and deploy files. They do not write `DATABASE_URL`, `BETTER_AUTH_SECRET`, or OAuth secrets onto a project. |
| No OAuth client secrets | Google and Microsoft client id/secret are not in this environment. A deploy without them shows "No way in yet". |
| Do not merge with CK | Creating this CRM inside `company-knowledge-app` would mix products. Not done. |
| Chicken-and-egg origins | `API_URL` / `APP_URL` / `AGENT_URL` need the Vercel hosts. Those hosts do not exist yet. |

What Richard does next: create the Neon database and three Vercel projects
in the Vercel dashboard (or CLI), set the table above, then add the API
callback URIs to Google and/or Microsoft. After that, the live app URL is
the `qualvera-crm-app` production origin Vercel prints.
