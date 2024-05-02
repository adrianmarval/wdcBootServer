const {Schema, model} = require('mongoose');

const botSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  proxy: {
    type: Schema.Types.ObjectId,
    ref: 'Proxy',
  },
  accounts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Account',
    },
  ],
  phones: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Phone',
    },
  ],
});

const Bot = model('Bot', botSchema);

module.exports = Bot;
