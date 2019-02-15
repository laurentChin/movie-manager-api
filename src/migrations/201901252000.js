module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "passwordHash", Sequelize.STRING);
    await queryInterface.addColumn("Users", "active", Sequelize.BOOLEAN);
    await queryInterface.addColumn("Users", "token", Sequelize.STRING);
    await queryInterface.addColumn(
      "Users",
      "tokenExpirationDate",
      Sequelize.DATE
    );
    await queryInterface.addColumn("Users", "salt", Sequelize.STRING);
  },
  down: async function(queryInterface) {
    await queryInterface.removeColumn("Users", "passwordHash");
    await queryInterface.removeColumn("Users", "active");
    await queryInterface.removeColumn("Users", "token");
    await queryInterface.removeColumn("Users", "tokenExpirationDate");
    await queryInterface.removeColumn("Users", "salt");
  }
};
