# Deployment

CI/CD runs through GitHub Actions (`.github/workflows/ci.yml`, `deploy.yml`, `rollback.yml`). On every push to `master` that passes CI, a Docker image is built, pushed to GitHub Container Registry (`ghcr.io/laurentchin/movie-manager-api`), tagged with the commit SHA (and `latest`), then deployed to the production server over SSH.

## One-time server setup

These steps have to be done manually on the production server (`kimsufi`) — nothing here can be run from CI.

1. **Install Docker + the Compose plugin.**

2. **Create a dedicated system user for GitHub Actions** — don't reuse a personal account. Ubuntu 26.04:
   ```bash
   sudo adduser --disabled-password --gecos "" deploy
   sudo usermod -aG docker deploy
   ```
   `--disabled-password` means there's no password to log in with at all — SSH key only. Deliberately **not** added to `sudo`.

   Note: `docker` group membership is effectively root-equivalent on this host (a container can bind-mount the host filesystem), because the workflows run `docker`/`docker compose` directly over SSH with no `sudo`. That's an accepted tradeoff for a personal single-purpose deploy account here — if you'd rather avoid it, a narrower `/etc/sudoers.d/deploy` allowlist restricted to specific `docker compose`/`docker login`/`docker pull` commands is the harder alternative; ask if you want that version instead.

3. **Generate a dedicated keypair** for this — don't reuse your own SSH key. From your own machine (not the server):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions@movie-manager-api" -f ~/.ssh/movie_manager_deploy -N ""
   ```
   Then copy the **public** half to the server, for the `deploy` user specifically:
   ```bash
   ssh-copy-id -i ~/.ssh/movie_manager_deploy.pub deploy@<server-host>
   ```
   (If `ssh-copy-id` isn't available or `deploy` can't log in yet to receive it, log in as an admin account instead and append the `.pub` file's contents to `/home/deploy/.ssh/authorized_keys` manually, then `chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys`.)

   The **private** half (`~/.ssh/movie_manager_deploy`, no `.pub`) is what goes into the `DEPLOY_SSH_KEY` GitHub secret below — never the public one.

4. **Create the deploy directory, owned by `deploy`:**
   ```bash
   sudo mkdir -p /opt/movie-manager-api/uploads
   sudo chown -R deploy:deploy /opt/movie-manager-api
   ```

5. **Copy `docker-compose.yml`** from this repo into `/opt/movie-manager-api/`.

6. **Create `/opt/movie-manager-api/environment.json`** with production config — same shape as the `environment.json` used today for the pm2 deploy, but `assetsPath` should point at the path *inside the container*: `/app/public`. Keep `database.config.host` as `"localhost"` — the container runs with `network_mode: host`, so it reaches Postgres exactly like the pm2 process does today.

7. **Move existing uploaded posters** into `/opt/movie-manager-api/uploads/` (the directory shipit currently keeps as a shared dir), so they carry over.

8. **Create a GitHub Personal Access Token** (scope: `read:packages`) so the server can `docker login ghcr.io` and pull images from this private repo.

## GitHub repository secrets

Add these under Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `DEPLOY_SSH_HOST` | Server hostname/IP |
| `DEPLOY_SSH_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | Contents of the **private** key file from step 3 (`~/.ssh/movie_manager_deploy`) |
| `GHCR_READ_TOKEN` | The PAT from step 8 above |

## Rollback

Actions tab → **Rollback** workflow → *Run workflow* → enter the image tag to redeploy (a previous commit SHA, visible in the `deploy.yml` run history or in the [package versions](https://github.com/laurentChin/movie-manager-api/pkgs/container/movie-manager-api) on GitHub). No rebuild — it pulls the already-published image and restarts the container. `db:sync` is deliberately **not** run on rollback, to avoid syncing an older schema against a newer database state.

## What's not migrated yet

`shipitfile.js` (the old `shipit-cli` pm2-based deploy) is still in the repo, kept as a fallback until the pipeline above is confirmed working in production. Remove it (and the `shipit-*` devDependencies) once a real deploy + rollback have both been exercised successfully.
