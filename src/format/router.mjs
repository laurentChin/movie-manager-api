import formatController from './formatController';

function formatRouterFactory (router, formatModel) {
  router.post('/', formatController.create.bind(null, formatModel));
  return router;
}

export default formatRouterFactory;
