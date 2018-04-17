import axios from 'axios';

import facebookProvider from './facebookProvider';

const _routesPrefix = 'security';

const SecurityRouterFactory = (router, userModel) => {
  router.get(`/${_routesPrefix}/facebook/:code`, async (request, response, next) => {
    try {
      const responseFromFacebookAuthentication = await facebookProvider.authenticate(request.params.code);
      const userGraphResponse = await axios
        .get(
          facebookProvider
            .buildDebugTokenRequest(
              responseFromFacebookAuthentication.access_token
            )
        );
      const fbid = userGraphResponse.data.data.user_id;
      let user = await userModel.findOrCreate({where: { fbid }});
      response
        .status(200)
        .send({
          responseFromFacebookAuthentication,
          user
        });
    } catch (e) {
      response
        .status(400)
        .send({
          message: e.message
        });
    }
  });

  return router;
};

export {
  _routesPrefix,
  SecurityRouterFactory
};
