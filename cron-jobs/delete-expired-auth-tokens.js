const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../', '.env') });
process.env.NODE_ENV = 'production';

const jwt = require('jsonwebtoken');
const config = require('../src/config');
const AuthTokenModel = require('../src/components/auth-token/model');
const mongoose = require('mongoose');

(async function() {
  await mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const authtokens = await AuthTokenModel.find();

  const expiredTokensIds = authtokens.reduce((acc, token) =>
    jwt.verify(token.value, config.jwtSecret, (err, decoded) => {
      if (err && err.name === 'TokenExpiredError') {
        return [...acc, token._id];
      }

      return acc;
    }), []
  );

  console.log(expiredTokensIds);
  await AuthTokenModel.deleteMany({ _id: { $in: expiredTokensIds } });

  await mongoose.connection.close();
}());

