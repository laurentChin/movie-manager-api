import facebookAuthController from "./facebookAuthController";
import facebookProvider from "./facebookProvider";

const _routesPrefix = 'security';

const SecurityRouterFactory = (router, userModel) => {
  router.get(`/${_routesPrefix}/facebook/:code`, facebookAuthController(userModel, facebookProvider));

  return router;
};

export {
  _routesPrefix,
  SecurityRouterFactory
};
