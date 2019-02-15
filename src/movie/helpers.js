const path = require("path");
const util = require("util");
const sharp = require("sharp");
const uuid = require("uuid");
const fs = require("fs");
const request = require("request");

const mapDataValues = ({
  dataValues: { id, title, direction, releaseDate, poster, formats }
}) => ({
  id,
  title,
  direction,
  releaseDate,
  poster,
  formats
});

async function downloadFile(url) {
  const { filepath, pipeline } = await createPipeline(url);
  request(url).pipe(pipeline);

  return filepath;
}

async function handleFile({ filename, createReadStream }) {
  const readStream = createReadStream();
  const { filepath, pipeline } = await createPipeline(filename);
  readStream.pipe(pipeline);

  return filepath;
}

async function createPipeline(filename) {
  const [, extension] = /([a-z]{2,})$/.exec(filename);
  const name = uuid.v4();
  const finalName = `${name}.${extension}`;
  const root = finalName.slice(0, 2);
  const sub = finalName.slice(2, 4);
  const uploadDir = path.join(process.env.PWD, "public", "uploads");
  const access = util.promisify(fs.access);
  const mkdir = util.promisify(fs.mkdir);

  try {
    await access(path.join(uploadDir, root));
  } catch (e) {
    await mkdir(path.join(uploadDir, root));
  }

  try {
    await access(path.join(uploadDir, root, sub));
  } catch (e) {
    await mkdir(path.join(uploadDir, root, sub));
  }

  const targetDir = path.join(uploadDir, root, sub);
  const smallScreenWriteStream = fs.createWriteStream(
    path.join(targetDir, `${name}-small.${extension}`)
  );
  const mediumScreenWriteStream = fs.createWriteStream(
    path.join(targetDir, `${name}-medium.${extension}`)
  );
  const writeStream = fs.createWriteStream(path.join(targetDir, finalName));
  const pipeline = sharp().resize();
  pipeline.pipe(writeStream);
  pipeline
    .clone()
    .resize(50, null)
    .pipe(smallScreenWriteStream);
  pipeline
    .clone()
    .resize(150, null)
    .pipe(mediumScreenWriteStream);

  return {
    filepath: path.join(root, sub, finalName),
    pipeline
  };
}

async function deletePoster(poster) {
  const promisifiedAccess = util.promisify(fs.access);
  const promisifiedUnlink = util.promisify(fs.unlink);

  try {
    const filepath = path.join(process.env.PWD, "public/uploads", poster);
    await promisifiedAccess(filepath, fs.constants.F_OK);

    await promisifiedUnlink(
      path.join(process.env.PWD, "public/uploads", poster)
    );
    await promisifiedUnlink(
      path.join(
        process.env.PWD,
        "public/uploads",
        poster.replace(/(.[a-z0-9]{3,4})$/, "-small$1")
      )
    );
    await promisifiedUnlink(
      path.join(
        process.env.PWD,
        "public/uploads",
        poster.replace(/(.[a-z0-9]{3,4})$/, "-medium$1")
      )
    );
  } catch (e) {}
}

module.exports = {
  mapDataValues,downloadFile,handleFile,createPipeline,deletePoster
};
