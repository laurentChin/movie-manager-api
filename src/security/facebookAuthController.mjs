function facebookAuthController (userModel, facebookProvider, jwt, jwtSecretKey) {
  return async (request, response) => {
    try {
      const responseFromFacebookAuthentication = await facebookProvider.authenticate(request.params.code);

      const {user_id} = await facebookProvider.getGraphForAccessToken(responseFromFacebookAuthentication.access_token);
      let user = await userModel.findOrCreate({where: { fbid: user_id }});
      response
        .status(200)
        .json(jwt.sign({
          responseFromFacebookAuthentication,
          user
        }, jwtSecretKey));
    } catch (e) {
      response
        .status(400)
        .send({
          message: e.message
        });
    }
  }
}

export default facebookAuthController;
