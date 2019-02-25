module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("Logs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "cascade"
      },
      model: Sequelize.STRING,
      action: Sequelize.ENUM("CREATE", "UPDATE", "DELETE"),
      payload: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async function(queryInterface) {
    await queryInterface.dropTable("Logs");
  }
};
