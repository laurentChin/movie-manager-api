import test from 'ava';
import facebookProvider,
{
  buildAccessTokenRequest,
  buildRequestUrl,
  buildDebugTokenRequest
} from '../../src/security/facebookProvider';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  facebookAccessTokenFakeResponse,
  facebookDebugTokenValidFakeResponse,
  facebookDebugTokenInvalidFakeResponse
} from '../_fixtures_';

test('facebookProvider default export must be an object', t => {
  t.is('object', typeof facebookProvider.default);
});

test('buildRequestUrl url must build a valid facebook token url', t => {
  const expected = 'https://graph.facebook.com/v2.11/oauth/access_token';
  t.is(
    expected,
    buildRequestUrl('https://graph.facebook.com', 'v2.11/oauth/access_token')
  );
});

test('facebookProvider default export must own a buildAccessTokenRequest property', t => {
  t.truthy(facebookProvider.default.hasOwnProperty('buildAccessTokenRequest'));
});

test('buildAccessTokenRequest must build a valid facebook access token request', t => {
  const expected = 'https://graph.facebook.com/v2.11/oauth/access_token?client_id=app-id&redirect_uri=redirect-uri&client_secret=app-secret&code=code-parameter';
  t.is(
    expected,
    buildAccessTokenRequest(
      {
        url: 'https://graph.facebook.com/v2.11/oauth/access_token',
        appId: 'app-id',
        redirectUri: 'redirect-uri',
        appSecret: 'app-secret'
      },
      'code-parameter'
    )
  );
});

test('buildDebugTokenRequest must build a valid facebook debug token request', t => {
  const expected = 'https://graph.facebook.com/debug_token?input_token=inputToken&access_token=appSecret';
  t.is(
    expected,
    buildDebugTokenRequest(
      {
        url: 'https://graph.facebook.com/debug_token',
        appSecret: 'appSecret'
      },
      'inputToken'
    )
  );
});

test.serial('authenticate must throw a FacebookAuthError when the accessToken is not valid', async t => {
  let axiosMockForInvalidToken = new MockAdapter(axios);

  axiosMockForInvalidToken
    .onGet(/^https:\/\/graph.facebook.com\/v2.11\/oauth\/access_token/)
    .reply(
      200,
      facebookAccessTokenFakeResponse
    )
    .onGet(/^https:\/\/graph.facebook.com\/debug_token/)
    .reply(
      200,
      facebookDebugTokenInvalidFakeResponse
    );

  const error = await t.throws(facebookProvider.default.authenticate('code-parameter'));
  t.is(error.message, 'invalid token');
  t.is(error.name, 'FacebookAuthError');
});

test.serial('authenticate must return a validated facebook accessToken', async t => {
  let axiosMockForValidToken = new MockAdapter(axios);

  axiosMockForValidToken
    .onGet(/^https:\/\/graph.facebook.com\/v2.11\/oauth\/access_token/)
    .reply(
      200,
      facebookAccessTokenFakeResponse
    )
    .onGet(/^https:\/\/graph.facebook.com\/debug_token/)
    .reply(
      200,
      facebookDebugTokenValidFakeResponse
    );

  const authenticateResponse = await facebookProvider.default.authenticate('code-parameter');
  t.truthy(authenticateResponse.hasOwnProperty('access_token'));
  t.truthy(authenticateResponse.hasOwnProperty('token_type'));
  t.truthy(authenticateResponse.hasOwnProperty('expires_in'));
});

test('facebookProvider default export must own an authenticate property', t => {
  t.truthy(facebookProvider.default.hasOwnProperty('authenticate'));
});