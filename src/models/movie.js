function movieModelFactory (sequelize, DataTypes, User) {
  const Movie = sequelize.define(
    'Movie',
    {
      title: DataTypes.STRING,
      releaseDate: DataTypes.DATEONLY,
      direction: DataTypes.STRING,
      poster: DataTypes.STRING
    });

  Movie.belongsTo(User);
  return Movie;
}

module.exports = movieModelFactory;
