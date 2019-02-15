const { test } = require('ava');

const { validate } = require('../../src/format/validator');

test('format validator must validate a movie', t => {
  const validFormat = {
    name: 'bluray'
  };
  t.truthy(validate(validFormat));
});
