import sequelize from "../src/models";

const [, , file, action] = process.argv;

const processMigration = async (file, action) => {
  const migration = await import(`../src/migrations/${file}`);
  console.log(migration);
  await migration.default[action](
    sequelize.queryInterface,
    sequelize.Sequelize
  );
};

processMigration(file, action)
  .then(_ => process.exit(0))
  .catch(_ => process.exit(1));
