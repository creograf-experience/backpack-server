const validateResetPassword = require('./validate-reset-password');
const validateAcceptReset = require('./validate-accept-reset');

const resetPassword = [validateResetPassword];
const acceptReset = [validateAcceptReset];

module.exports = {
  resetPassword,
  acceptReset
};
