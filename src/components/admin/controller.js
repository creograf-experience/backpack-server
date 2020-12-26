const jwt = require('jsonwebtoken');
const config = require('../../config');

const login = (req, res) => {
  const { admin } = config;

  const payload = {
    login: admin.login,
    role: config.roles.admin
  };

  jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: '7 days' },
    (err, token) => {
      if (err) throw new Error(err.message);

      return res.status(200).json({
        success: true,
        data: { token }
      });
    }
  );
}

module.exports = { login };
