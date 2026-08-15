# Deployment

CI/CD runs through GitHub Actions (`.github/workflows/ci.yml`, `deploy.yml`, `rollback.yml`). On every push to `master` that passes CI, a Docker image is built, pushed to GitHub Container Registry (`ghcr.io/<owner>/movie-manager-api`), tagged with the commit SHA (and `latest`), then deployed to the production server over SSH.

## One-time server setup

These steps have to be done manually on the production server — nothing here can be run from CI.

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
   `deploy` has no password and no key yet, so plain `ssh-copy-id deploy@<host>` fails with `Permission denied (publickey)` — there's nothing to authenticate with as `deploy` yet. Install the public key through an existing admin account instead:
   ```bash
   cat ~/.ssh/movie_manager_deploy.pub | ssh <admin-user>@<server-host> "sudo mkdir -p /home/deploy/.ssh && sudo tee -a /home/deploy/.ssh/authorized_keys > /dev/null && sudo chmod 700 /home/deploy/.ssh && sudo chmod 600 /home/deploy/.ssh/authorized_keys && sudo chown -R deploy:deploy /home/deploy/.ssh"
   ```
   Verify it worked:
   ```bash
   ssh -i ~/.ssh/movie_manager_deploy deploy@<server-host> "whoami && groups"
   ```
   Should print `deploy` and a group list including `docker`.

   The **private** half (`~/.ssh/movie_manager_deploy`, no `.pub`) is what goes into the `DEPLOY_SSH_KEY` GitHub secret below — never the public one.

4. **Create the deploy directory, owned by `deploy`:**
   ```bash
   sudo mkdir -p <deploy_path>/uploads
   sudo chown -R deploy:deploy <deploy_path>
   ```

5. **Copy `docker-compose.yml`** from this repo into `<deploy_path>`.

6. **Create `<deploy_path>/environment.json`** with production config — `assetsPath` should point at the path *inside the container*: `/app/public`. Keep `database.config.host` as `"localhost"` — the container runs with `network_mode: host`, so it reaches Postgres exactly like a host process would.

7. **Move existing uploaded posters** into `<deploy_path>/uploads/`, so they carry over from whatever deploy mechanism was used before.

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

Actions tab → **Rollback** workflow → *Run workflow* → enter the image tag to redeploy (a previous commit SHA, visible in the `deploy.yml` run history or in the package versions page on GitHub for this repo). No rebuild — it pulls the already-published image and restarts the container. `db:sync` is deliberately **not** run on rollback, to avoid syncing an older schema against a newer database state.

## What's not migrated yet

`shipitfile.js` (the old `shipit-cli` pm2-based deploy) is still in the repo, kept as a fallback until the pipeline above is confirmed working in production. Remove it (and the `shipit-*` devDependencies) once a real deploy + rollback have both been exercised successfully.
