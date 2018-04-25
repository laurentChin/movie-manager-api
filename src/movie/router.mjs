import movieController from './movieController';

function movieRouterFactory (router, movieModel, userModel, formatModel) {
  router.post(`/`, movieController.createMovie.bind(null, movieModel, userModel, formatModel));
  router.patch(`/:id`, movieController.updateMovie.bind(null, movieModel, formatModel));
  router.get('/', movieController.listMovie.bind(null, movieModel, userModel));
  router.get(`/:id`, movieController.getMovie.bind(null, movieModel));

  return router;
}

export default movieRouterFactory;
