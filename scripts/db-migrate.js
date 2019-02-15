const { sequelize }  = require("../src/models");

const [, , file, action] = process.argv;

const processMigration = async (file, action) => {
  const migration = require(`../src/migrations/${file}`);

  await migration[action](
    sequelize.queryInterface,
    sequelize.Sequelize
  );
};

processMigration(file, action)
  .then(_ => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
