const { Log, User, Format } = require("../models");
const Sequelize = require("sequelize");

const createMovieLog = async (movie, action, formatIDs) => {
  const { id, title, direction, releaseDate, poster } = movie;

  const formats = await Format.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: formatIDs || movie.formats.map(format => format.id)
      }
    }
  });

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
        formats: formats.map(({ dataValues: { id, name, logo } }) => ({
          id,
          name,
          logo
        }))
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
