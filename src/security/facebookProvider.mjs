import environment from '../../environment';
import axios from 'axios';

import FacebookAuthError from './facebookAuthError';

const facebookProvider = {
  buildAccessTokenRequest: buildAccessTokenRequest.bind(
    null,
    {
      url: buildRequestUrl(environment.facebook.baseUrl, environment.facebook.accessTokenEndpoint),
      appId: environment.facebook.appId,
      redirectUri: environment.facebook.redirectUri,
      appSecret: environment.facebook.appSecret
    }
  ),
  buildDebugTokenRequest: buildDebugTokenRequest.bind(
    null,
    {
      url: buildRequestUrl(environment.facebook.baseUrl, environment.facebook.debugTokenEndpoint),
      appId: environment.facebook.appId,
      appSecret: environment.facebook.appSecret
    }
  ),
  authenticate: authenticate.bind(null, environment.facebook.appId),
  getGraphForAccessToken
};

/**
 * build the facebook access token request
 * @param appId
 * @param redirectUri
 * @param appSecret
 * @param code
 */
function buildAccessTokenRequest ({url, appId, redirectUri, appSecret}, code) {
  return `${url}?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;
}

/**
 * build the facebook access token request
 * @param appId
 * @param redirectUri
 * @param appSecret
 * @param code
 */
function buildDebugTokenRequest ({url, appId, appSecret}, token) {
  return `${url}?input_token=${token}&access_token=${appId}|${appSecret}`;
}

/**
 * build a facebook graph request base url
 * @param baseUrl
 * @param endpoint
 */
function buildRequestUrl (baseUrl, endpoint) {
  return `${baseUrl}/${endpoint}`;
}

async function getGraphForAccessToken (accessToken) {
  const debugTokenResponse = await axios.get(facebookProvider.buildDebugTokenRequest(accessToken));

  return debugTokenResponse.data.data;
}

async function authenticate (appId, code) {
  const accessTokenRequestResponse = await axios.get(facebookProvider.buildAccessTokenRequest(code));

  // eslint-disable-next-line camelcase
  const { access_token } = accessTokenRequestResponse.data;
  const debugTokenRequest = await axios.get(facebookProvider.buildDebugTokenRequest(access_token));
  // eslint-disable-next-line camelcase
  const { app_id, is_valid } = debugTokenRequest.data.data;

  // eslint-disable-next-line camelcase
  if (app_id !== appId || !is_valid) {
    throw new FacebookAuthError('invalid token');
  }

  // eslint-disable-next-line camelcase
  return accessTokenRequestResponse.data;
}

export {
  buildRequestUrl,
  buildAccessTokenRequest,
  buildDebugTokenRequest
};

export default facebookProvider;
