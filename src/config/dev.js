module.exports = {
  env: 'dev',
  port: 5000,
  host: 'http://localhost',
  db: 'mongodb://localhost:27017/backpack-dev',
  jwtSecret: 'secret',
  admin: {
    login: 'admin-dev',
    password: 'qweqwe123-dev'
  },
  email: {
    login: 'backpack-test@yandex.ru',
    password: 'qweqwe123',
    smtp: 'smtp.yandex.ru'
  }
};
