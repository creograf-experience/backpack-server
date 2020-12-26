const uuid = require('uuid').v4;
const { FileSystem } = require('../../lib');

const appendFiles = async files => {
  let body = {};
  let savedFiles = [];

  for (const key in files) {
    let file = files[key][0];

    const fileName = uuid();
    const ext = file.originalname.split('.').pop();
    const fullFileName = `${fileName}.${ext}`;

    Object.assign(body, { [key.toString()]: fullFileName });

    savedFiles.push({ name: fullFileName, data: file.buffer });
  }

  await FileSystem.createMany('images', savedFiles);

  return body;
};

module.exports = {
  appendFiles
};
