import jwt from 'jsonwebtoken';

import facebookAuthController from "./facebookAuthController";
import facebookProvider from "./facebookProvider";

const _routesPrefix = 'security';

const SecurityRouterFactory = (router, userModel, jwtSecretKey) => {
  router.get(`/${_routesPrefix}/facebook/:code`, facebookAuthController(userModel, facebookProvider, jwt, jwtSecretKey));

  return router;
};

export {
  _routesPrefix,
  SecurityRouterFactory
};
