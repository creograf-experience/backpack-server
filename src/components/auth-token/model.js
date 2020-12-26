const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const AuthTokenSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  }
}, { timestamps: true });

const AuthTokenModel = mongoose.model('AuthToken', AuthTokenSchema);
module.exports = AuthTokenModel;
