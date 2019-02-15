const { Sequelize } = require("sequelize");

const environment = require("../../environment");
const userModelFactory = require("./user");
const movieModelFactory = require("./movie");
const formatModelFactory = require("./format");

const { database } = { ...environment };

const sequelize = new Sequelize(
  database.name,
  database.username,
  database.password,
  database.config
);
const User = userModelFactory(sequelize, Sequelize.DataTypes);
const Format = formatModelFactory(sequelize, Sequelize.DataTypes);
const Movie = movieModelFactory(sequelize, Sequelize.DataTypes, User);

Movie.belongsToMany(Format, {
  through: "movies_formats",
  as: "formats",
  onDelete: "CASCADE"
});

Format.belongsToMany(Movie, { through: "movies_formats", as: "movies" });

User.hasMany(Movie, { as: "Movies" });

const movieSelectOptions = {
  attributes: ["id", "title", "direction", "releaseDate", "poster", "UserId"],
  include: [
    {
      model: Format,
      as: "formats",
      attributes: ["id", "name"],
      through: {
        attributes: []
      }
    },
    {
      model: User
    }
  ]
};

module.exports = { sequelize, User, Movie, movieSelectOptions, Format };
