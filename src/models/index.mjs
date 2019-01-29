import Sequelize from "sequelize";

import environment from "../../environment";
import userModelFactory from "./user";
import movieModelFactory from "./movie";
import formatModelFactory from "./format";

const { database } = { ...environment };

const sequelize = new Sequelize(
  database.name,
  database.username,
  database.password,
  database.config
);
const User = userModelFactory(sequelize, Sequelize.DataTypes);
const Format = formatModelFactory(sequelize, Sequelize.DataTypes);
const Movie = movieModelFactory(sequelize, Sequelize.DataTypes);

Movie.belongsToMany(Format, {
  through: "movies_formats",
  as: "formats",
  onDelete: "CASCADE"
});

Format.belongsToMany(Movie, { through: "movies_formats", as: "movies" });

User.hasMany(Movie, { as: "Movies" });

const movieSelectOptions = {
  attributes: ["id", "title", "director", "releaseDate", "poster", "UserId"],
  include: [
    {
      model: Format,
      as: "formats",
      attributes: ["id", "name"],
      through: {
        attributes: []
      }
    }
  ]
};

export { User, Movie, movieSelectOptions, Format };

export default sequelize;
