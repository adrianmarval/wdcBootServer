const {Schema, model} = require('mongoose');

const accountsSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('Account', accountsSchema);
