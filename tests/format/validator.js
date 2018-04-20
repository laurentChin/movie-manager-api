import test from 'ava';

import formatValidator from '../../src/format/validator';

test('format validator must validate a movie', t => {
  const validFormat = {
    name: "bluray"
  }
  t.truthy(formatValidator.default.validate(validFormat));
});
