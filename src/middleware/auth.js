const jwt = require('jsonwebtoken');
const { Errors } = require('../utils');
const ClientModel = require('../components/client/model');
const AuthTokenModel = require('../components/auth-token/model');
const config = require('../config');

const auth = allowedRoles => (req, res, next) => {
  let token = req.get('Authorization');
  if (!token) throw new Errors.NotAuthorized();

  token = token.replace('Bearer ', '');

  jwt.verify(token, config.jwtSecret, async (err, decoded) => {
    if (err) return next(new Errors.NotAuthorized());

    if (!allowedRoles.includes(decoded.role)) {
      return next(new Errors.NotAuthorized());
    }

    const user = await userFactory[decoded.role].find({ ...decoded, token });
    if (!user) return next(new Errors.NotAuthorized());

    req.user = user;
    next();
  });
};

const findClient = async decoded => {
  const [client, authtoken] = await Promise.all([
    ClientModel.findById(decoded._id),
    AuthTokenModel.findOne({ value: decoded.token })
  ]);

  if (!client || !authtoken) return null;

  return decoded;
}

const findAdmin = decoded => {
  if (decoded.login !== config.admin.login) return null;
  return decoded;
}

const userFactory = {
  admin: { find: findAdmin },
  client: { find: findClient }
};

module.exports = auth;
