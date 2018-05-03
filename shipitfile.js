module.exports = shipit => {
  require('shipit-deploy')(shipit);
  require('shipit-shared')(shipit);

  shipit.initConfig({
    default: {
      deployTo: '/var/www/movie-manager/api',
      repositoryUrl: 'https://github.com/laurentChin/movie-manager-api.git',
      shared: {
        overwrite: true,
        dirs: [
          'public/uploads'
        ],
        files: [
          './environment.json'
        ]
      }
    },
    production: {
      servers: 'laurent@kimsufi',
      key: '~/.ssh/id_rsa.pub'
    },
  });

  shipit.on('updated', () => {
    shipit.start('install');
  });

  shipit.on('deployed', () => {
    shipit.start('pm2-start-or-restart');
  });

  shipit.blTask('install', async () => {
    await shipit.remote(`cd ${shipit.releasePath} && npm install --only=production`);
    await shipit.remote(`cd ${shipit.releasePath} && npm run db:sync`);
  });

  shipit.blTask('pm2-start-or-restart', async () => {
    try {
      await shipit.remote(`cd ${shipit.releasePath} && pm2 restart movie-manager-api`);
    } catch (e) {
      if(e.stderr.indexOf('[PM2][ERROR] Process movie-manager-api not found') === 0) {
        await shipit.remote(`cd ${shipit.releasePath} && pm2 start public/index.mjs --name movie-manager-api --node-args="--experimental-modules"`);
      } else {
        throw e;
      }
    }
  });
}
