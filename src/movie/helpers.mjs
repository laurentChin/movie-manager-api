import path from "path";
import util from "util";
import sharp from "sharp";
import uuid from "uuid";
import fs from "fs";

export const mapDataValues = ({
  dataValues: { id, title, director, releaseDate, poster, formats }
}) => ({
  id,
  title,
  director,
  releaseDate,
  poster,
  formats
});

export async function handleFile({ filename, createReadStream }) {
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

  const readStream = createReadStream();
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

  readStream.pipe(pipeline);

  return path.join(root, sub, finalName);
}
