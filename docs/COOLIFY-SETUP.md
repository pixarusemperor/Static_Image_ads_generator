# Coolify Setup — Static_Image_ads_generator

**Status: live, auto-deploy from `master` works via GitHub source webhook.** `https://superads.orizongroup.online` returns HTTP 200, app status `running:unknown`, last deploy `finished` on commit `92021e2`.

## How auto-deploy actually works (verified 2026-08-26)

1. `git push origin master` → GitHub fires the existing webhook
2. Webhook target: `https://coolifyone.orizongroup.online/webhooks/source/github/events/manual` (the per-app "manual source" endpoint)
3. Webhook is signed with the **per-app `manual_webhook_secret_github`** = `Nl1saHbhgANABno5Zzd39Tkq6wpfgeTXrewQmDQj` (rotatable in the panel)
4. Coolify matches the signature, queues a build, pulls the new git commit, runs the Dockerfile, restarts the container
5. The build-and-push workflow on GHA is **not required for the deploy** — Coolify builds from source itself

This is the same pattern the working `wastat` app on the same panel uses.

## Identifiers

| Resource | UUID |
|---|---|
| Coolify panel | `https://coolifyone.orizongroup.online` |
| Project (WASPOSTER) | `byim25nti476x0ygrj084u9m` |
| Environment (production) | `u9dplizkks5g0aanpuy7lptl` |
| Server (localhost) | `ypl10ghx88it0xefro9d3duf` |
| **App (static-image-ads-generator)** | **`itg0ipriumh9bqd11p3lr8ro`** |
| Domain | `https://superads.orizongroup.online` |
| GitHub repo | `pixarusemperor/Static_Image_ads_generator` |
| GitHub branch | `master` |
| App port | `3000:3000` (host:container) |
| Manual webhook secret | `Nl1saHbhgANABno5Zzd39Tkq6wpfgeTXrewQmDQj` |

## Env vars set in Coolify

- `PORT=3000` (required by `next start`)

## Env vars NOT set (intentional)

- `GEMINI_API_KEY` — left empty so the app boots without a paid API. AI-powered routes (`/api/assemble`, `/api/analyze`) throw a clear error on first call. To enable: Coolify → Environment Variables → add `GEMINI_API_KEY=<value>` → redeploy.

## What I tried and abandoned

- **`.github/workflows/deploy.yml`** (POST `/api/v1/deploy` / GET webhook) — was deleted. The API token is read-only; the endpoint returns 403. No API tokens are needed when the GitHub source webhook works.
- **`build-and-push.yml`** (push image to ghcr.io) — kept in place. It runs on every push, builds the image, and pushes to ghcr.io. Useful as a registry cache and a fallback build artifact, but **not required for the Coolify deploy** (Coolify builds from source itself).
- **`docs/COOLIFY-SETUP.md`** previously said the token scope was the blocker — that was wrong. The real mechanism is the per-app webhook.

## Domain conflict (resolved)

`superads.orizongroup.online` was previously bound to app `whatsapp-saas-superads` (uuid `bwng78yv21ngxycdcnbbput8`), which was in `exited:unhealthy` state. With explicit operator approval, the new app creation used `force_domain_override=true`. The old app is left untouched.

## Recovery

Follow `https://github.com/pixarusemperor/coolify-deploy-playbook/blob/main/docs/runbooks/vps-recovery.md` IN ORDER: disk → coolify-db → panel → app. **Do not** run `docker system prune -af` or `docker volume prune` on the VPS.

## To re-run the setup

The API calls that created this app are in `git log` of the playbook repo. To recreate:

```bash
source .env
curl -sk -X POST \
  -H "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "byim25nti476x0ygrj084u9m",
    "environment_uuid": "u9dplizkks5g0aanpuy7lptl",
    "server_uuid": "ypl10ghx88it0xefro9d3duf",
    "name": "static-image-ads-generator",
    "build_pack": "dockerfile",
    "git_repository": "https://github.com/pixarusemperor/Static_Image_ads_generator.git",
    "git_branch": "master",
    "domains": "https://superads.orizongroup.online",
    "ports_exposes": "3000",
    "ports_mappings": "3000:3000",
    "base_directory": "/",
    "dockerfile_location": "/Dockerfile",
    "is_auto_deploy_enabled": true,
    "is_force_https_enabled": true,
    "force_domain_override": true
  }' \
  "${COOLIFY_BASE_URL}/api/v1/applications/public"
```

Then: panel → app → Webhook → copy secret → `gh api -X PATCH repos/pixarusemperor/Static_Image_ads_generator/hooks/<id>/config -f secret=<secret>` → push.


<!-- auto-deploy test at 2026-08-26T17:15:42Z -->
