import test from 'ava';
import facebookProvider, {buildAccessTokenRequest, buildRequestUrl } from '../../src/security/facebookProvider';

test('facebookProvider default export must an object', t => {
  t.is('object', typeof facebookProvider.default);
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

test('buildRequestUrl url must build a valid facebook token url', t => {
  const expected = 'https://graph.facebook.com/v2.11/oauth/access_token';
  t.is(
    expected,
    buildRequestUrl('https://graph.facebook.com', 'v2.11/oauth/access_token')
  );
});

test('facebookProvider default export must own an authenticate property', t => {
  t.truthy(facebookProvider.default.hasOwnProperty('authenticate'));
});