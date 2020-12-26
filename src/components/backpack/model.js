const { Errors } = require('../../utils');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const BackpackSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },

  description: { type: String, required: true },

  office: { 
    type: String,
    enum: ['Офис 1'],
    default: 'Офис 1', 
  },

  idBackpack: {
    type: String,
    required: true,
  },

  schedule:[
    {
      type:Object
    }
  ], 

  status: { type: Boolean, default:true }
}, { timestamps: true });

BackpackSchema.post('save', (err, doc, next)=>{
  if (err.name === 'MongoError' && err.code === 11000) {
    return next(new Errors.InvalidData('Рюкзак с таким номером уже существует'));
  }

  next(err);
});

const BackpackModel = mongoose.model('Backpack', BackpackSchema);
module.exports = BackpackModel;