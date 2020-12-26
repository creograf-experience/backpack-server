const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.email.smtp,
  port: 587,
  secure: false,
  auth: {
    user: config.email.login,
    pass: config.email.password
  }
});

const send = async (email, subject, message) => {
  await transporter.verify();

  return transporter.sendMail({
    from: config.email.login,
    to: email,
    subject: subject,
    html: message
  });
}

const sendPasswordMessage = async (email, data) => {
  const subject = 'Доступ';
  const message = `<p>Ваш логин: ${email}<br/>Пароль: ${data.password}</p>`;

  return send(email, subject, message);
}

const sendResetPasswordMessage = async (email, data) => {
  const resetPasswordUrl = `${config.host}:${config.port}/reset-password/${data.clientId}/${data.resetPasswordToken}`;
  const subject = 'Восстановление пароля';
  const message = `<p>Для получения пароля перейдите по ссылке:<br/>` +
                  `<a href="${resetPasswordUrl}" target="_blank">Получить</a><br/><br/>` +
                  `Если вы не запрашивали смену пароля, то проигнорируйте это сообщение.</p>`;

  return send(email, subject, message);
}

module.exports = {
  send,
  sendPasswordMessage,
  sendResetPasswordMessage
};
