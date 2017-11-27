import test from 'ava';
import facebookProvider, {buildAccessTokenRequest, buildAccessTokenRequestUrl } from '../../src/security/facebookProvider';

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

test('buildAccessTokenRequestUrl url must build a valid facebook token url', t => {
  const expected = 'https://graph.facebook.com/v2.11/oauth/access_token';
  t.is(
    expected,
    buildAccessTokenRequestUrl('https://graph.facebook.com', 'v2.11/oauth/access_token')
  );
});

test('facebookProvider default export must an object', t => {
  t.is('object', typeof facebookProvider);
});

test('facebookProvider default export must own a buildAccessTokenRequest property', t => {
  t.truthy(facebookProvider.hasOwnProperty('buildAccessTokenRequest'));
});