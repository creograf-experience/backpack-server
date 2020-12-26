const { asyncRouteErrorHandler } = require('../../utils');
const {
  EmailSender,
  Randomizer,
  PasswordEncrypter
} = require('../../lib');

const resetPassword = async (req, res) => {
  const { client } = req;

  client.resetPasswordToken = Randomizer.getRandomString({ length: 35 });

  const nextDay = Date.now() + 24 * 60 * 60 * 1000;
  client.resetPasswordTokenExpireDate = nextDay;

  await client.save();

  await EmailSender.sendResetPasswordMessage(client.email, {
    clientId: client._id,
    resetPasswordToken: client.resetPasswordToken
  });

  return res.status(200).json({ success: true });
}

const acceptReset = async (req, res) => {
  const { client } = req;

  const password = Randomizer.getRandomString();
  client.password = await PasswordEncrypter.encrypt(password);

  client.resetPasswordToken = '';
  client.resetPasswordTokenExpireDate = 0;

  await client.save();
  await EmailSender.sendPasswordMessage(client.email, { password });

  return res.status(200).send(`<p>Новый пароль отправлен на <strong>${client.email}</strong></p>`)
}

module.exports = {
  resetPassword: asyncRouteErrorHandler(resetPassword),
  acceptReset: asyncRouteErrorHandler(acceptReset)
};
