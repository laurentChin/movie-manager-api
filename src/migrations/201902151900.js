module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Movies", "director", "direction");
  },
  down: async function(queryInterface) {
    await queryInterface.renameColumn("Movies", "direction", "director");
  }
};
