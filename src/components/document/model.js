const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },

  friendlyName: { type: String, required: true },

  ext: {
    type: String,
    enum: ['pdf', 'doc', 'xls', 'docx', 'xlsx','png','jpg','jpeg','PNG','PDF'],
    required: true
  }
}, { timestamps: true });

const DocumentModel = mongoose.model('Document', DocumentSchema);
module.exports = DocumentModel;
