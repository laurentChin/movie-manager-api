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

export {
  buildAccessTokenRequest
};

export default {
  buildAccessTokenRequest: buildAccessTokenRequest.bind(null, {...environment.facebook})
};
