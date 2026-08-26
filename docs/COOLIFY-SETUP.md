# Coolify Setup — Static_Image_ads_generator

## Identifiers (do not commit secrets here)

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
| Image source | `ghcr.io/pixarusemperor/static_image_ads_generator:latest` (built on GHA, not VPS) |

## Env vars set in Coolify (as of setup)

- `PORT=3000` (required by `next start`)

## Env vars NOT set (intentional)

- `GEMINI_API_KEY` — left empty so the app boots without a paid API. AI-powered routes (`/api/assemble`, `/api/analyze`, etc.) will throw a clear error on first call. To enable: set in Coolify → Environment Variables → redeploy.

## Domain conflict (resolved)

`superads.orizongroup.online` was previously bound to app `whatsapp-saas-superads` (uuid `bwng78yv21ngxycdcnbbput8`), which was in `exited:unhealthy` state. With explicit operator approval, the new app creation used `force_domain_override=true`. The old app is left untouched; its domain now points here.

## Auto-deploy

- `is_auto_deploy_enabled: true` (under `settings`)
- `is_force_https_enabled: true` (under `settings`)
- Coolify polls the `master` branch; no GitHub Actions needed for that path.
- Additionally, `.github/workflows/deploy.yml` triggers an explicit deploy on every push (POST `/api/v1/deploy`) and polls to `finished` for CI feedback.

## GitHub repo secrets (set by `gh secret set`)

- `COOLIFY_API_TOKEN` — Coolify API token (deploy scope)
- `COOLIFY_APP_UUID` — `itg0ipriumh9bqd11p3lr8ro`
- `COOLIFY_BASE_URL` — `https://coolifyone.orizongroup.online`

## First deploy

Triggered automatically by push to `master`. The flow is:

1. `build-and-push.yml` builds the image on GHA → `ghcr.io/pixarusemperor/static_image_ads_generator:latest`
2. `deploy.yml` calls `POST /api/v1/deploy` on the app uuid, polls until `finished`
3. Coolify pulls the ghcr image and starts the container with `PORT=3000`

## Recovery

Follow `https://github.com/pixarusemperor/coolify-deploy-playbook/blob/main/docs/runbooks/vps-recovery.md` IN ORDER: disk → coolify-db → panel → app. **Do not** run `docker system prune -af` or `docker volume prune` on the VPS.

## To re-run the setup

The API calls that created this app are in `git log` of the playbook repo. To recreate, use:

```bash
source .env  # exports COOLIFY_API_TOKEN, COOLIFY_BASE_URL
curl -sk -X POST \
  -H "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{...same payload...}' \
  "${COOLIFY_BASE_URL}/api/v1/applications/public"
```
