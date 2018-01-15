const SecurityRouterFactory = router => {
  if (!router.hasOwnProperty('get')) {
    throw new TypeError('router argument must provide a get method');
  }

  return router;
};

export {
  SecurityRouterFactory
};
