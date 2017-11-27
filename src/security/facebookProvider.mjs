import environment from '../../environment.json';

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
 * build the facebook access token request base url
 * @param baseUrl
 * @param endpoint
 */
function buildAccessTokenRequestUrl (baseUrl, endpoint) {
  return `${baseUrl}/${endpoint}`;
}

export {
  buildAccessTokenRequestUrl,
  buildAccessTokenRequest
};

export default {
  buildAccessTokenRequest: buildAccessTokenRequest.bind(
    null,
    {
      url: buildAccessTokenRequestUrl(...environment.facebook.baseUrl, ...environment.facebook.accessTokenEndpoint),
      ...environment.facebook.appId,
      ...environment.facebook.redirectUri,
      ...environment.facebook.appSecret
    }
  )
};
