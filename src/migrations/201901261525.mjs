export default {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Users", "token", "signInToken");
    await queryInterface.renameColumn(
      "Users",
      "tokenExpirationDate",
      "signInTokenExpirationDate"
    );
  },
  down: async function(queryInterface) {
    await queryInterface.renameColumn("Users", "signInToken", "token");
    await queryInterface.renameColumn(
      "Users",
      "signInTokenExpirationDate",
      "tokenExpirationDate"
    );
  }
};
