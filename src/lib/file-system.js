const fs = require('fs').promises;
const config = require('../config');

const folders = {
  images: config.imagesFolderPath,
  docs: config.documentsFolderPath,
  route: config.mapRouteFolderPath
};

const deleteMany = async (folder, fileNames) => {
  const promises = fileNames.map(name =>
    fs.unlink(`${folders[folder]}/${name}`)
  );

  return Promise.all(promises);
}

const createMany = async (folder, files) => {
  const promises = files.map(file =>
    fs.writeFile(`${folders[folder]}/${file.name}`, file.data)
  );

  return Promise.all(promises);
}

const createOne = async (folder, file) => {
  return fs.writeFile(`${folders[folder]}/${file.name}`, file.data);
}

const deleteOne = async (folder, fileName) => {
  return fs.unlink(`${folders[folder]}/${fileName}`)
}

module.exports = {
  deleteMany,
  createMany,
  createOne,
  deleteOne
};
