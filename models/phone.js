const {Schema, model} = require('mongoose');

const phoneNumberSchema = new Schema({
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
    enum: ['married', 'available', 'blocked'],
    default: 'available',
  },
  assignedBot: {
    type: Schema.Types.ObjectId,
    ref: 'Bot',
  },
  assignedAccount: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
  },
});

const Phone = model('Phone', phoneNumberSchema);

module.exports = Phone;
