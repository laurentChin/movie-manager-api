const { GraphQLError } = require("graphql");
const axios = require("axios");

const { Format, Movie, User } = require("../models");
const {
  deletePoster,
  handleFile,
  downloadFile,
  mapDataValues,
} = require("./helpers");
const { LIMIT, MOVIE_DB_API_URL } = require("./constants");
const { generateNaturalOrder } = require("../models/helpers");
const { createMovieLog } = require("../log/helpers");
const { CREATE, UPDATE, DELETE } = require("../log/constants");

const Sequelize = require("sequelize");

/* eslint-disable camelcase */
async function getPosterBaseUrl(environment) {
  const {
    data: {
      images: { secure_base_url },
    },
  } = await axios.get(
    `${MOVIE_DB_API_URL}/configuration?api_key=${environment.MOVIE_DB_API_KEY}`
  );

  return secure_base_url;
}
/* eslint-enable camelcase */

async function getMovieDirectors(movieId, environment) {
  const {
    data: { crew },
  } = await axios.get(
    `${MOVIE_DB_API_URL}/movie/${movieId}/credits?api_key=${environment.MOVIE_DB_API_KEY}`
  );

  return crew.filter(member => member.job.toLowerCase() === "director");
}

function toExplorationResult(result, directors, posterBaseUrl) {
  /* eslint-disable camelcase */
  const { title, poster_path, release_date: releaseDate } = result;

  return {
    title,
    releaseDate,
    direction: directors.map(director => director.name).join(", "),
    poster: poster_path ? `${posterBaseUrl}original${poster_path}` : "",
  };
  /* eslint-enable camelcase */
}

async function exploreByDirector(terms, environment) {
  const {
    data: { results: people },
  } = await axios.get(
    `${MOVIE_DB_API_URL}/search/person?api_key=${
      environment.MOVIE_DB_API_KEY
    }&query=${encodeURIComponent(terms)}&region=FR&language=fr-FR`
  );

  const [director] = people;

  if (!director) return [];

  const {
    data: { results },
  } = await axios.get(
    `${MOVIE_DB_API_URL}/discover/movie?api_key=${
      environment.MOVIE_DB_API_KEY
    }&with_crew=${director.id}&region=FR&language=fr-FR`
  );

  const posterBaseUrl = await getPosterBaseUrl(environment);
  const movies = [];

  for (const result of results) {
    const directors = await getMovieDirectors(result.id, environment);

    if (!directors.some(member => member.id === director.id)) continue;

    movies.push(toExplorationResult(result, directors, posterBaseUrl));
  }

  return movies;
}

const resolvers = {
  Query: {
    movie: async (parent, { id }) => mapDataValues(await Movie.findByPk(id)),
    movies: async (parent, { offset, limit = LIMIT }, { user }) => {
      const movies = await Movie.findAll({
        offset,
        limit,
        order: generateNaturalOrder("title"),
        include: [
          {
            model: User,
            where: {
              email: user.email,
            },
          },
        ],
      });

      return movies.map(mapDataValues);
    },
    search: async (parent, { terms }, { user }) => {
      const movies = await Movie.findAll({
        where: {
          title: {
            [Sequelize.Op.iLike]: `%${terms}%`,
          },
        },
        order: generateNaturalOrder("title"),
        include: [
          {
            model: User,
            where: {
              email: user.email,
            },
          },
        ],
      });

      return movies.map(mapDataValues);
    },
    explore: async (
      parent,
      { terms, byDirector = false },
      { environment }
    ) => {
      if (byDirector) return exploreByDirector(terms, environment);

      const {
        data: { results },
      } = await axios.get(
        `${MOVIE_DB_API_URL}/search/movie?api_key=${
          environment.MOVIE_DB_API_KEY
        }&query=${encodeURIComponent(terms)}&region=FR&language=fr-FR`
      );

      const posterBaseUrl = await getPosterBaseUrl(environment);
      const movies = [];

      for (const result of results) {
        const directors = await getMovieDirectors(result.id, environment);

        movies.push(toExplorationResult(result, directors, posterBaseUrl));
      }

      return movies;
    },
  },
  Mutation: {
    addMovie: async (
      parent,
      { title, direction, releaseDate, poster, posterUrl, formats },
      { user, environment }
    ) => {
      if (!user)
        throw new GraphQLError("You must be logged in to do this.", {
          extensions: { code: "FORBIDDEN" },
        });

      let posterFile = "";

      if (posterUrl) {
        posterFile = await downloadFile(posterUrl, environment.assetsPath);
      }

      if (poster) {
        const { filename, createReadStream } = await poster;
        posterFile = await handleFile({
          filename,
          createReadStream,
          assetsPath: environment.assetsPath,
        });
      }

      const movieInstance = await Movie.create(
        {
          title,
          direction,
          releaseDate,
          poster: posterFile,
        },
        {
          include: [
            {
              model: Format,
              as: "formats",
            },
            {
              model: User,
            },
          ],
        }
      );

      const userInstance = await User.findOne({
        where: {
          email: user.email,
        },
      });

      await movieInstance.setUser(userInstance);
      await movieInstance.addFormats(formats);

      await createMovieLog(movieInstance, CREATE, formats);

      return mapDataValues(movieInstance);
    },
    updateMovie: async (
      parent,
      { id, title, direction, releaseDate, poster, posterUrl, formats },
      { user, environment }
    ) => {
      const movieInstance = await Movie.findByPk(id, {
        include: [
          {
            model: Format,
            as: "formats",
          },
          {
            model: User,
          },
        ],
      });

      if (!movieInstance) {
        // extensions.code must stay the number 404: movie-manager-pwa's
        // Movie/Actions.js checks graphQLErrors[0].extensions.code === 404
        // to treat an already-deleted movie as a silent success.
        throw new GraphQLError("Not found", {
          extensions: { code: 404 },
        });
      }

      if (user.email !== movieInstance.get("User").get("email"))
        throw new GraphQLError("You are not allowed to update this movie.", {
          extensions: { code: "FORBIDDEN" },
        });

      try {
        await movieInstance.setFormats(formats);
        const values = {
          title,
          direction,
          releaseDate,
        };

        if (posterUrl && /^http[s]?:\/\//.test(posterUrl)) {
          values.poster = await downloadFile(posterUrl, environment.assetsPath);
        }

        if (poster) {
          const { filename, createReadStream } = await poster;
          values.poster = await handleFile({
            filename,
            createReadStream,
            assetsPath: environment.assetsPath,
          });
        }

        if (
          values.poster &&
          movieInstance.get("poster") &&
          movieInstance.get("poster") !== values.poster
        ) {
          await deletePoster(
            movieInstance.get("poster"),
            environment.assetsPath
          );
        }

        await movieInstance.update(values);

        await createMovieLog(movieInstance, UPDATE, formats);

        return mapDataValues(movieInstance);
      } catch (e) {
        throw new Error(`Update failed for ${id}.`);
      }
    },
    deleteMovie: async (parent, { id }, { user, environment }) => {
      const movieInstance = await Movie.findByPk(id, {
        include: [
          {
            model: Format,
            as: "formats",
          },
          {
            model: User,
          },
        ],
      });

      if (!movieInstance) {
        // extensions.code must stay the number 404: movie-manager-pwa's
        // Movie/Actions.js checks graphQLErrors[0].extensions.code === 404
        // to treat an already-deleted movie as a silent success.
        throw new GraphQLError("Not found", {
          extensions: { code: 404 },
        });
      }

      if (user.email !== movieInstance.get("User").get("email"))
        throw new GraphQLError("You are not allowed to delete this movie.", {
          extensions: { code: "FORBIDDEN" },
        });

      try {
        if (movieInstance.get("poster")) {
          await deletePoster(
            movieInstance.get("poster"),
            environment.assetsPath
          );
        }

        await movieInstance.destroy();

        await createMovieLog(movieInstance, DELETE);

        return mapDataValues(movieInstance);
      } catch (e) {
        throw new Error(`Deletion failed for ${id}.`);
      }
    },
  },
  Movie: {
    async formats(movie) {
      const formats = await Format.findAll({
        include: [
          {
            model: Movie,
            as: "movies",
            where: {
              id: movie.id,
            },
          },
        ],
      });

      return formats.map(({ dataValues: { id, name, logo } }) => ({
        id,
        name,
        logo,
      }));
    },
  },
};

module.exports = resolvers;
