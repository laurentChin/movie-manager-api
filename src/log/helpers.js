const { Log, User } = require("../models");

const createMovieLog = async (movie, action, formats = null) => {
  const { id, title, direction, releaseDate, poster } = movie;
  const logInstance = await Log.create(
    {
      model: "movie",
      action,
      payload: JSON.stringify({
        id,
        title,
        direction,
        releaseDate,
        poster,
        formats: formats || movie.formats.map(format => format.id)
      })
    },
    {
      include: [
        {
          model: User
        }
      ]
    }
  );

  await logInstance.setUser(movie.get("UserId"));
};

module.exports = {
  createMovieLog
};
