const { Errors } = require('../../utils');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const CampaignSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6
  },

  name: { type: String, required: true },

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  date: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },

  dayPart: {
    morning: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
  },

  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },

  photoReportUrl: { type: String, default: '' },

  documentCount: { type: Number, default: 0 },

  backpack:{ type:Array, default:[]},

  MAC: {
    isVisible: { type: Boolean, default: false },
    data: { type: String, default: '' }
  },

  GRP: {
    isVisible: { type: Boolean, default: false },
    data: { type: String, default: '' }
  },

  Frequency: {
    isVisible: { type: Boolean, default: false },
    data: { type: String, default: '' }
  },

  OTS: {
    isVisible: { type: Boolean, default: false },
    data: { type: String, default: '' }
  },

  expectedCoverage: { type: String, default: ''},
  
  achievedCoverage: { type: String, default: ''}

}, { timestamps: true });

CampaignSchema.post('save', (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    return next(new Errors.InvalidData('Кампания с таким номером уже существует'));
  }

  next(err);
});

const CampaignModel = mongoose.model('Campaign', CampaignSchema);
module.exports = CampaignModel;
