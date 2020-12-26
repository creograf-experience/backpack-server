const config = require('../config');

const errorHandler = (err, req, res, next) => {
  if (config.env !== 'test' || !err.statusCode) {
    console.error(new Date().toString(), err);
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message
  });
}

module.exports = errorHandler;
