const { Errors } = require('../../utils');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, default: '' },

  legalEntity: { type: String, default: '' },

  logo: { type: String, default: '' },

  agency: {
    logo: { type: String, default: '' },
    name: { type: String, default: '' }
  },

  description: { type: String, default: '' },

  INN: { type: String, default: '' },

  contactName: { type: String, default: '' },

  phone: { type: String, default: '' },

  campaigns: {
    amount: { type: Number, default: 0 },
    activeAmount: { type: Number, default: 0 }
  },

  isBlocked: { type: Boolean, default: false },

  isDeleted: { type: Boolean, default: false },

  resetPasswordToken: { type: String, default: '' },

  resetPasswordTokenExpireDate: { type: Number, default: 0 }
}, { timestamps: true });

ClientSchema.post('save', (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    return next(new Errors.InvalidData('Клиент с таким email уже существует'));
  }

  next(err);
});

const ClientModel = mongoose.model('Client', ClientSchema);
module.exports = ClientModel;
