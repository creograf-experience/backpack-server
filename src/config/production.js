module.exports = {
  env: 'production',
  port: process.env.PORT,
  host: process.env.HOST,
  db: process.env.MONGO_DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  admin: {
    login: process.env.ADMIN_LOGIN,
    password: process.env.ADMIN_PASSWORD
  },
  email: {
    login: process.env.EMAIL_LOGIN,
    password: process.env.EMAIL_PASSWORD,
    smtp: process.env.EMAIL_SMTP
  }
};
