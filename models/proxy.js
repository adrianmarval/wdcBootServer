const {Schema, model} = require('mongoose');

const proxySchema = new Schema({
  host: {
    type: String,
    required: true,
    unique: true,
  },
  port: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  rotationApi: {
    type: String,
    required: false,
  },
  proxyType: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  org: {
    type: String,
  },
  connectionType: {
    type: String,
    required: true,
    enum: ['4g', '5g'],
  },
  status: {
    type: String,
    enum: ['assigned', 'available'],
    default: 'available',
  },
  assignedBot: {
    type: Schema.Types.ObjectId,
    ref: 'Bot',
  },
});

const Proxy = model('Proxy', proxySchema);

module.exports = Proxy;
