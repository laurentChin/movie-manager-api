const Sequelize = require("sequelize");

const generateNaturalOrder = colName => {
  return [
    Sequelize.cast(
      Sequelize.fn("substring", Sequelize.col(colName), "^[0-9]+"),
      "integer"
    ),
    [colName, "ASC"]
  ];
};

module.exports = { generateNaturalOrder };
