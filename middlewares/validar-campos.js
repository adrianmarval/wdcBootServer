const {validationResult} = require('express-validator');
const logger = require('../helpers/logger');

const validarCampos = (req, res, next) => {
  logger.log(`New Request: ${req.method} ${req.originalUrl} from ${req.ip}`);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.errors.map((error) => logger.error(error.msg));
    return res.status(200).json({success: false, msg: '', data: {}, ...errors});
  }

  next();
};

module.exports = {
  validarCampos,
};
