const ase = require("apollo-server-express");
const rp = require("request-promise-native");

const { Format, Movie, User } = require("../models");
const {
  deletePoster,
  handleFile,
  downloadFile,
  mapDataValues
} = require("./helpers");
const { LIMIT, MOVIE_DB_API_URL } = require("./constants");
const { generateNaturalOrder } = require("../models/helpers");

const Sequelize = require("sequelize");

const resolvers = {
  Query: {
    movies: async (parent, { offset, limit = LIMIT }, { user }) => {
      const movies = await Movie.findAll({
        offset,
        limit,
        order: generateNaturalOrder("title"),
        include: [
          {
            model: User,
            where: {
              email: user.email
            }
          }
        ]
      });

      return movies.map(mapDataValues);
    },
    search: async (parent, { terms }, { user }) => {
      const movies = await Movie.findAll({
        where: {
          title: {
            [Sequelize.Op.iLike]: `%${terms}%`
          }
        },
        order: generateNaturalOrder("title"),
        include: [
          {
            model: User,
            where: {
              email: user.email
            }
          }
        ]
      });

      return movies.map(mapDataValues);
    },
    explore: async (parent, { terms }, { user, model, environment }) => {
      /* eslint-disable camelcase */
      const { results } = JSON.parse(
        await rp(
          `${MOVIE_DB_API_URL}/search/movie?api_key=${
            environment.MOVIE_DB_API_KEY
          }&query=${encodeURIComponent(terms)}&region=FR&language=fr-FR`
        )
      );

      const movies = [];
      const {
        images: { secure_base_url }
      } = JSON.parse(
        await rp(
          `${MOVIE_DB_API_URL}/configuration?api_key=${
            environment.MOVIE_DB_API_KEY
          }`
        )
      );

      for (const result of results) {
        const { id, title, poster_path, release_date: releaseDate } = result;
        const movie = { title, releaseDate };
        const { crew } = JSON.parse(
          await rp(
            `${MOVIE_DB_API_URL}/movie/${id}/credits?api_key=${
              environment.MOVIE_DB_API_KEY
            }`
          )
        );

        const direction = crew.filter(member => {
          return member.job.toLowerCase() === "director";
        });

        movie.direction = direction
          .reduce((acc, director) => `${acc}, ${director.name}`, "")
          .replace(", ", "");

        movie.poster = poster_path
          ? `${secure_base_url}original${poster_path}`
          : "";

        movies.push(movie);
      }

      /* eslint-enable camelcase */

      return movies;
    }
  },
  Mutation: {
    addMovie: async (
      parent,
      { title, direction, releaseDate, poster, formats },
      { user }
    ) => {
      if (!user) throw new ase.ForbiddenError("You must be log in to do this.");

      let posterFile = "";
      if (typeof poster === "string") {
        posterFile = await downloadFile(poster);
      } else {
        const { filename, createReadStream } = await poster;
        posterFile = await handleFile({ filename, createReadStream });
      }

      const movieInstance = await Movie.create(
        {
          title,
          direction,
          releaseDate,
          poster: posterFile
        },
        {
          include: [
            {
              model: Format,
              as: "formats"
            },
            {
              model: User
            }
          ]
        }
      );

      const userInstance = await User.findOne({
        where: {
          email: user.email
        }
      });

      await movieInstance.setUser(userInstance);
      await movieInstance.addFormats(formats);

      return mapDataValues(movieInstance);
    },
    updateMovie: async (
      parent,
      { id, title, direction, releaseDate, poster, formats },
      { user }
    ) => {
      const movieInstance = await Movie.findById(id, {
        include: [
          {
            model: User
          }
        ]
      });

      if (user.email !== movieInstance.get("User").get("email"))
        throw new ase.ForbiddenError(
          "You are not allowed to update this movie."
        );

      try {
        await movieInstance.setFormats(formats);
        let values = {
          title,
          direction,
          releaseDate
        };

        if (typeof poster === "string" && /^http[s]?:\/\//.test(poster)) {
          values.poster = await downloadFile(poster);
        }

        if (typeof poster !== "string") {
          const { filename, createReadStream } = await poster;
          values.poster = await handleFile({ filename, createReadStream });
        }

        if (
          values.poster &&
          movieInstance.get("poster") &&
          movieInstance.get("poster") !== values.poster
        ) {
          await deletePoster(movieInstance.get("poster"));
        }

        await movieInstance.update(values);

        return mapDataValues(movieInstance);
      } catch (e) {
        throw new Error(`Update failed for ${id}.`);
      }
    },
    deleteMovie: async (parent, { id }, { user }) => {
      const movieInstance = await Movie.findById(id, {
        include: [
          {
            model: User
          }
        ]
      });

      if (user.email !== movieInstance.get("User").get("email"))
        throw new ase.ForbiddenError(
          "You are not allowed to delete this movie."
        );

      try {
        if (movieInstance.get("poster")) {
          await deletePoster(movieInstance.get("poster"));
        }

        await movieInstance.destroy();

        return mapDataValues(movieInstance);
      } catch (e) {
        throw new Error(`Deletion failed for ${id}.`);
      }
    }
  },
  Movie: {
    async formats(movie) {
      const formats = await Format.findAll({
        include: [
          {
            model: Movie,
            as: "movies",
            where: {
              id: movie.id
            }
          }
        ]
      });

      return formats.map(({ dataValues: { id, name, logo } }) => ({
        id,
        name,
        logo
      }));
    }
  }
};

module.exports = resolvers;
