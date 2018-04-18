import movieController from './movieController';

function movieRouterFactory (router, movieModel, userModel) {
  router.post(`/`, movieController.createMovie.bind(null, movieModel, userModel));

  return router;
}

export default movieRouterFactory;
