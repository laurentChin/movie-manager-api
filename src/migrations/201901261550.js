module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "lastLogin", Sequelize.DATE);
  },
  down: async function(queryInterface) {
    await queryInterface.removeColumn("Users", "lastLogin");
  }
};
