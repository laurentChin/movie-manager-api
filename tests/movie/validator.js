const { test } = require('ava');

const { validate } = require('../../src/movie/validator');

test('movie validator must validate a movie', t => {
  const validMovie = {
    title: 'Good Will Hunting',
    releaseDate: '1997-12-05',
    director: 'Gus Van Sant'
  };
  t.truthy(validate(validMovie));

  const movieWithInvalidDate = {
    title: 'Good Will Hunting',
    releaseDate: '1997',
    director: 'Gus Van Sant'
  };
  t.falsy(validate(movieWithInvalidDate));

  const movieWithMissingTitle = {
    releaseDate: '1997',
    director: 'Gus Van Sant'
  };
  t.falsy(validate(movieWithMissingTitle));
});
