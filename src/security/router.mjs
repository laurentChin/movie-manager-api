import facebookAuthController from "./facebookAuthController";

const _routesPrefix = 'security';

const SecurityRouterFactory = (router, userModel) => {
  router.get(`/${_routesPrefix}/facebook/:code`, facebookAuthController(userModel));

  return router;
};

export {
  _routesPrefix,
  SecurityRouterFactory
};
