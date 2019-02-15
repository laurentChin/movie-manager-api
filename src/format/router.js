const formatController = require('./formatController');

function formatRouterFactory (router, formatModel) {
  router.get('/', formatController.index.bind(null, formatModel));
  router.post('/', formatController.create.bind(null, formatModel));
  return router;
}

module.exports = formatRouterFactory;
