const { Errors } = require('../../utils');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const GeoBackpackSchema = new mongoose.Schema({
  backpack: {
    type: String,
    ref: 'Backpack',
    required: true
  },

  geoMorning: [
    {
      longitude: Number,
      latitude: Number
    }
  ],

  geoEvening : [
    {
      longitude: Number,
      latitude: Number
    }
  ]

}, { timestamps: true });


const GeoBackpackModel = mongoose.model('GeoBackpack', GeoBackpackSchema);
module.exports = GeoBackpackModel;