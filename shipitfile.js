module.exports = shipit => {
  require("shipit-deploy")(shipit);
  require("shipit-shared")(shipit);

  shipit.initConfig({
    default: {
      deployTo: "/var/www/movie-manager/api",
      repositoryUrl: "https://github.com/laurentChin/movie-manager-api.git",
      shared: {
        overwrite: true,
        dirs: ["public/uploads"],
        files: ["./environment.json"]
      }
    },
    production: {
      servers: "laurent@kimsufi",
      key: "~/.ssh/id_rsa.pub"
    }
  });

  shipit.on("updated", () => {
    shipit.start("install");
  });

  shipit.on("deployed", () => {
    shipit.start("pm2-start-or-restart");
  });

  shipit.blTask("install", async () => {
    await shipit.remote(
      `cd ${shipit.releasePath} && npm install --only=production`
    );
    await shipit.remote(`cd ${shipit.releasePath} && npm run db:sync`);
  });

  shipit.blTask("pm2-start-or-restart", async () => {
    const startCmd = `cd ${
      shipit.releasePath
    } && pm2 start public/index.mjs --name movie-manager-api --node-args="--experimental-modules" --interpreter=~/.nvm/versions/node/v11.3.0/bin/node`;
    try {
      await shipit.remote(
        `cd ${shipit.releasePath} && pm2 delete movie-manager-api`
      );
      await shipit.remote(startCmd);
    } catch (e) {
      if (
        e.stderr.indexOf("[PM2][ERROR] Process movie-manager-api not found") ===
        0
      ) {
        await shipit.remote(startCmd);
      } else {
        throw e;
      }
    }
  });
};
