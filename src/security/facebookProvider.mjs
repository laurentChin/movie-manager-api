import environment from '../../environment.json';

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
 * build a facebook graph request base url
 * @param baseUrl
 * @param endpoint
 */
function buildRequestUrl (baseUrl, endpoint) {
  return `${baseUrl}/${endpoint}`;
}

export {
  buildRequestUrl,
  buildAccessTokenRequest
};

export default facebookProvider;
