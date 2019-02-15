const sequelize  = require("../src/models");

const [, , file, action] = process.argv;

const processMigration = async (file, action) => {
  const migration = await require(`../src/migrations/${file}`);
  await migration.default[action](
    sequelize.queryInterface,
    sequelize.Sequelize
  );
};

processMigration(file, action)
  .then(_ => process.exit(0))
  .catch(_ => process.exit(1));
