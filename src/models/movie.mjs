import { User } from "./";

function movieModelFactory (sequelize, DataTypes) {
  const Movie = sequelize.define(
    'Movie',
    {
      title: DataTypes.STRING,
      releaseDate: DataTypes.DATE,
      director: DataTypes.STRING
    });

  Movie.belongsTo(User);
  return Movie;
}

export default movieModelFactory;
