module.exports = {
  env: 'test',
  port: 6969,
  host: 'http://localhost',
  db: 'mongodb://localhost:27017/backpack-test',
  jwtSecret: 'secret',
  admin: {
    login: 'admin-test',
    password: 'qweqwe123-test'
  },
  email: {
    login: 'backpack-test@yandex.ru',
    password: 'qweqwe123',
    smtp: 'smtp.yandex.ru'
  }
};
