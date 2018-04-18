import jwt from 'jsonwebtoken';

import facebookAuthController from './facebookAuthController';
import facebookProvider from './facebookProvider';

const SecurityRouterFactory = (router, userModel, jwtSecretKey) => {
  router.get(`/facebook/:code`, facebookAuthController(userModel, facebookProvider, jwt, jwtSecretKey));

  return router;
};

export {
  SecurityRouterFactory
};
