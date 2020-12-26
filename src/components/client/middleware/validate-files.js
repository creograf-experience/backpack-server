const { Errors } = require('../../../utils');
const { Validate } = require('../../../lib');

const validateFiles = (req, res, next) => {
  const { files } = req;

  if (files && !Object.keys(files).length) return next();

  for (const key in files) {
    let file = files[key][0];

    if (!Validate.imageFileFormat(file)) {
      throw new Errors.InvalidData('Неверный формат файла');
    }
  }

  next();
}

module.exports = validateFiles;
