const {Schema, model} = require('mongoose');

const accountsSchema = new Schema({
  email: {type: String, lowercase: true, trim: true},
  password: {type: String, trim: true},
  createdAt: {type: Date, default: Date.now},
  status: {type: String, enum: ['assigned', 'available'], default: 'available'},
  currentPhoneNumber: {type: Schema.Types.ObjectId, ref: 'Phone'},
  assignedPhones: {type: Boolean, default: false},
  assignedBot: {type: Schema.Types.ObjectId, ref: 'Bot'},
  lastWorkedAt: {type: Date},
});

const Account = model('Account', accountsSchema);

module.exports = Account;
