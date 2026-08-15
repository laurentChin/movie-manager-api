# Deployment

CI/CD runs through GitHub Actions (`.github/workflows/ci.yml`, `deploy.yml`, `rollback.yml`). On every push to `master` that passes CI, a Docker image is built, pushed to GitHub Container Registry (`ghcr.io/laurentchin/movie-manager-api`), tagged with the commit SHA (and `latest`), then deployed to the production server over SSH.

## One-time server setup

These steps have to be done manually on the production server (`kimsufi`) — nothing here can be run from CI.

1. **Install Docker + the Compose plugin.**

2. **Create the deploy directory:**
   ```bash
   mkdir -p /opt/movie-manager-api/uploads
   ```

3. **Copy `docker-compose.yml`** from this repo into `/opt/movie-manager-api/`.

4. **Create `/opt/movie-manager-api/environment.json`** with production config — same shape as the `environment.json` used today for the pm2 deploy, but `assetsPath` should point at the path *inside the container*: `/app/public`. Keep `database.config.host` as `"localhost"` — the container runs with `network_mode: host`, so it reaches Postgres exactly like the pm2 process does today.

5. **Move existing uploaded posters** into `/opt/movie-manager-api/uploads/` (the directory shipit currently keeps as a shared dir), so they carry over.

6. **Create a GitHub Personal Access Token** (scope: `read:packages`) so the server can `docker login ghcr.io` and pull images from this private repo.

## GitHub repository secrets

Add these under Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `DEPLOY_SSH_HOST` | Server hostname/IP |
| `DEPLOY_SSH_USER` | SSH user (e.g. `laurent`) |
| `DEPLOY_SSH_KEY` | Private key with access to the server |
| `GHCR_READ_TOKEN` | The PAT from step 6 above |

## Rollback

Actions tab → **Rollback** workflow → *Run workflow* → enter the image tag to redeploy (a previous commit SHA, visible in the `deploy.yml` run history or in the [package versions](https://github.com/laurentChin/movie-manager-api/pkgs/container/movie-manager-api) on GitHub). No rebuild — it pulls the already-published image and restarts the container. `db:sync` is deliberately **not** run on rollback, to avoid syncing an older schema against a newer database state.

## What's not migrated yet

`shipitfile.js` (the old `shipit-cli` pm2-based deploy) is still in the repo, kept as a fallback until the pipeline above is confirmed working in production. Remove it (and the `shipit-*` devDependencies) once a real deploy + rollback have both been exercised successfully.
