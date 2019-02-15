function formatModelFactory(sequelize, DataTypes) {
  const Format = sequelize.define("Format", {
    name: DataTypes.STRING,
    logo: DataTypes.STRING
  });

  return Format;
}

module.exports = formatModelFactory;
