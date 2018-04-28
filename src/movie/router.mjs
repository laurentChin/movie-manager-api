import multer from 'multer';

import movieController from './movieController';

const upload = multer({dest: `/tmp`});

function movieRouterFactory (router, movieModel, userModel, formatModel) {
  router.post(`/`, upload.single('poster'), movieController.createMovie.bind(null, movieModel, userModel, formatModel));
  router.patch(`/:id`, upload.single('poster'), movieController.updateMovie.bind(null, movieModel, formatModel));
  router.get('/', movieController.listMovie.bind(null, movieModel, userModel));
  router.get(`/:id`, movieController.getMovie.bind(null, movieModel));
  router.delete('/:id', movieController.deleteMovie.bind(null, movieModel));

  return router;
}

export default movieRouterFactory;
