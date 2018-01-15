import facebookProvider from './facebookProvider';

const _routesPrefix = 'security';

const SecurityRouterFactory = router => {
  router.get(`/${_routesPrefix}/facebook`, (request, response) => {
    facebookProvider
      .authenticate(request.query.code)
      .then(responseFromFacebookAuthentication => {
        response
          .status(200)
          .send(responseFromFacebookAuthentication);
      });
  });

  return router;
};

export {
  _routesPrefix,
  SecurityRouterFactory
};
