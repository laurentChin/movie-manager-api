import test from 'ava';

import movieValidator from '../../src/movie/validator';

test('movie validator must validate a movie', t => {
  const validMovie = {
    title: "Good Will Hunting",
    releaseDate: "1997-12-05",
    director: "Gus Van Sant"
  }
  t.truthy(movieValidator.default.isValid(validMovie));

  const movieWithInvalidDate = {
    title: "Good Will Hunting",
    releaseDate: "1997",
    director: "Gus Van Sant"
  }
  t.falsy(movieValidator.default.isValid(movieWithInvalidDate));

  const movieWithMissingTitle = {
    releaseDate: "1997",
    director: "Gus Van Sant"
  }
  t.falsy(movieValidator.default.isValid(movieWithMissingTitle));

  const movieWithMissingReleaseDate = {
    title: "Good Will Hunting",
    director: "Gus Van Sant"
  }
  t.falsy(movieValidator.default.isValid(movieWithMissingReleaseDate));

  const movieWithMissingDirector = {
    title: "Good Will Hunting",
    releaseDate: "1997-12-05",
  }
  t.falsy(movieValidator.default.isValid(movieWithMissingDirector));
});
