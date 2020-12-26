const mongoose = require('mongoose');

const MapRouteSchema = new mongoose.Schema({
  backpack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Backpack',
    required: true
  },

  backpackIdFile: {type: String},

  route: { type: Array },

  dayWeek: { type: String },

  dayPart: { type: String },

  friendlyName: { type: String, required: true },

  ext: {
    type: String,
    enum: ['kml'],
    required: true
  }
}, { timestamps: true });

const MapRouteModel = mongoose.model('Route', MapRouteSchema);
module.exports = MapRouteModel;
