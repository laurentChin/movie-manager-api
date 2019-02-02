export default {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Formats", "logo", Sequelize.STRING);
  },
  down: async function(queryInterface) {
    await queryInterface.removeColumn("Formats", "logo");
  }
};
