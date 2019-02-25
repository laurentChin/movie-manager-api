function logModelFactory(sequelize, DataTypes, User) {
  const Log = sequelize.define("Log", {
    model: DataTypes.STRING,
    action: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"),
    payload: DataTypes.TEXT
  });

  Log.belongsTo(User);
  return Log;
}

module.exports = logModelFactory;
