const test = require("ava");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

const { MOVIE_DB_API_URL } = require("../../src/movie/constants");
const resolvers = require("../../src/movie/resolvers");

const environment = { MOVIE_DB_API_KEY: "test-key" };
const mock = new MockAdapter(axios);

test.afterEach(() => {
  mock.reset();
});

test.serial(
  "explore with byDirector must return only movies directed by the matching person",
  async t => {
    mock
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/search/person`))
      .reply(200, {
        results: [{ id: 42, name: "Denis Villeneuve" }],
      })
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/discover/movie`))
      .reply(200, {
        results: [
          {
            id: 1,
            title: "Dune",
            release_date: "2021-09-15",
            poster_path: "/dune.jpg",
          },
          {
            id: 2,
            title: "Not Directed By Him",
            release_date: "2020-01-01",
            poster_path: "/other.jpg",
          },
        ],
      })
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/configuration`))
      .reply(200, {
        images: { secure_base_url: "https://image.tmdb.org/t/p/" },
      })
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/movie/1/credits`))
      .reply(200, {
        crew: [{ id: 42, name: "Denis Villeneuve", job: "Director" }],
      })
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/movie/2/credits`))
      .reply(200, {
        crew: [{ id: 99, name: "Someone Else", job: "Director" }],
      });

    const movies = await resolvers.Query.explore(
      null,
      { terms: "Denis Villeneuve", byDirector: true },
      { environment }
    );

    t.is(movies.length, 1);
    t.is(movies[0].title, "Dune");
    t.is(movies[0].direction, "Denis Villeneuve");
    t.is(movies[0].poster, "https://image.tmdb.org/t/p/original/dune.jpg");
  }
);

test.serial(
  "explore with byDirector must return an empty list when no person matches",
  async t => {
    mock.onGet(new RegExp(`^${MOVIE_DB_API_URL}/search/person`)).reply(200, {
      results: [],
    });

    const movies = await resolvers.Query.explore(
      null,
      { terms: "Unknown Person", byDirector: true },
      { environment }
    );

    t.deepEqual(movies, []);
  }
);

test.serial(
  "explore without byDirector must still search movies by title",
  async t => {
    mock
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/search/movie`))
      .reply(200, {
        results: [
          {
            id: 1,
            title: "Dune",
            release_date: "2021-09-15",
            poster_path: "/dune.jpg",
          },
        ],
      })
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/configuration`))
      .reply(200, {
        images: { secure_base_url: "https://image.tmdb.org/t/p/" },
      })
      .onGet(new RegExp(`^${MOVIE_DB_API_URL}/movie/1/credits`))
      .reply(200, {
        crew: [{ id: 42, name: "Denis Villeneuve", job: "Director" }],
      });

    const movies = await resolvers.Query.explore(
      null,
      { terms: "Dune" },
      { environment }
    );

    t.is(movies.length, 1);
    t.is(movies[0].title, "Dune");
    t.is(movies[0].direction, "Denis Villeneuve");
  }
);
