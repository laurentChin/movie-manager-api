import multer from "multer";

import movieController from "./movieController";

const upload = multer({ dest: `/tmp` });

function movieRouterFactory(router, movieModel, userModel, formatModel) {
  router.patch(
    `/:id`,
    upload.single("poster"),
    movieController.updateMovie.bind(null, movieModel, formatModel)
  );
  router.delete("/:id", movieController.deleteMovie.bind(null, movieModel));

  return router;
}

export default movieRouterFactory;
