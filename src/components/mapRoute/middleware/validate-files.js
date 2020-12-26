const { Errors } = require('../../../utils');
const { Validate } = require('../../../lib');

const validateFiles = (req, res, next) => {
  for (const file of req.files) {
    if (!Validate.routeFileFormat(file)) {
      throw new Errors.InvalidData('Неверный формат файла');
    }
  }

  next();
}

module.exports = validateFiles;
