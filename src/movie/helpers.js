const path = require("path");
const util = require("util");
const uuid = require("uuid");
const fs = require("fs");
const axios = require("axios");
const { Jimp } = require("jimp");

const mapDataValues = ({
  dataValues: { id, title, direction, releaseDate, poster, formats },
}) => ({
  id,
  title,
  direction,
  releaseDate,
  poster,
  formats,
});

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function downloadFile(url, assetsPath) {
  const response = await axios.get(url, { responseType: "arraybuffer" });

  return processImage(Buffer.from(response.data), url, assetsPath);
}

async function handleFile({ filename, createReadStream, assetsPath }) {
  const buffer = await streamToBuffer(createReadStream());

  return processImage(buffer, filename, assetsPath);
}

async function processImage(buffer, filename, assetsPath) {
  const [, extension] = /([a-z]{2,})$/.exec(filename);
  const name = uuid.v4();
  const finalName = `${name}.${extension}`;
  const root = finalName.slice(0, 2);
  const sub = finalName.slice(2, 4);
  const uploadDir = path.join(assetsPath, "uploads");
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
  const image = await Jimp.read(buffer);

  await image.write(path.join(targetDir, finalName));
  await image
    .clone()
    .resize({ w: 50 })
    .write(path.join(targetDir, `${name}-small.${extension}`));
  await image
    .clone()
    .resize({ w: 150 })
    .write(path.join(targetDir, `${name}-medium.${extension}`));

  return path.join(root, sub, finalName);
}

async function deletePoster(poster, assetsPath) {
  const promisifiedAccess = util.promisify(fs.access);
  const promisifiedUnlink = util.promisify(fs.unlink);

  try {
    const filepath = path.join(assetsPath, "uploads", poster);
    await promisifiedAccess(filepath, fs.constants.F_OK);

    await promisifiedUnlink(path.join(assetsPath, "uploads", poster));
    await promisifiedUnlink(
      path.join(
        assetsPath,
        "uploads",
        poster.replace(/(.[a-z0-9]{3,4})$/, "-small$1")
      )
    );
    await promisifiedUnlink(
      path.join(
        assetsPath,
        "uploads",
        poster.replace(/(.[a-z0-9]{3,4})$/, "-medium$1")
      )
    );
  } catch (e) {}
}

module.exports = {
  mapDataValues,
  downloadFile,
  handleFile,
  deletePoster,
};
