const mongoose = require('mongoose');

const phoneNumberSchema = new mongoose.Schema({
  fullPhoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  provider: {
    type: String,
    required: true,
  },
  areaCode: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['assigned', 'available', 'used', 'lost', 'blocked'],
    default: 'available',
  },
});

module.exports = mongoose.model('Phone', phoneNumberSchema);
