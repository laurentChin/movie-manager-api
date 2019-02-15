const{ validator } = require('./');

async function create (formatModel, request, response) {
  if (!validator.validate(request.body)) {
    return response
      .status(400)
      .send({message: 'The format you are trying to create is not valid'});
  }
  const {name} = request.body;
  try {
    const format = await formatModel.findOrCreate({where: {name}});
    return response
      .status(200)
      .send({format});
  } catch (e) {
    response
      .status(500)
      .send({message: 'Your attempt to create a format failed.'});
  }
};

async function index (formatModel, request, response) {
  try {
    const formats = await formatModel.findAll();
    response
      .status(200)
      .send(formats);
  } catch (e) {
    response
      .status(500)
      .send({message: 'Your attempt to list all formats failed.'});
  }
}

module.exports = {
  index,
  create
};
