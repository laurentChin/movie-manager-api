function movieModelFactory (sequelize, DataTypes) {
  const Movie = sequelize.define(
    'Movie',
    {
      title: DataTypes.STRING,
      releaseDate: DataTypes.DATE,
      director: DataTypes.STRING
    });

  return Movie;
}

export default movieModelFactory;
