import test from 'ava';
import { SecurityRouterFactory } from '../../src/security';

test("it must throw a TypeError error when get, post, or use methods doesn't exist", t => {
  const error = t.throws(() => {
    SecurityRouterFactory({});
  }, TypeError);
  t.is(error.message, 'router argument must provide a get method');
});

test("it must not throw a TypeError error when get method don't exist", t => {
  t.notThrows(() => {
    SecurityRouterFactory({
      get: () => {}
    });
  }, TypeError);
});