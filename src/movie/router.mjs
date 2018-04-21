import movieController from './movieController';

function movieRouterFactory (router, movieModel, userModel, formatModel) {
  router.post(`/`, movieController.createMovie.bind(null, movieModel, userModel, formatModel));
  router.get('/', movieController.listMovie.bind(null, movieModel, userModel));

  return router;
}

export default movieRouterFactory;
