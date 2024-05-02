const {Router} = require('express');
const {check} = require('express-validator');
const validator = require('validator');

const {validarCampos} = require('../middlewares/validar-campos');
const {validateProxies} = require('../middlewares/validar-proxies');
const {addProxies} = require('../controllers/proxies');

const MIN_PORT = 1;
const MAX_PORT = 65535;

const validCountryCodes = ['US', 'CA', 'UK', 'FR', 'DE', 'JP', 'AU' /* Agrega más según sea necesario */];

const router = Router();

router.post(
  '/add',
  [
    check('proxies').isArray().withMessage('El campo proxies debe ser un array'),
    check('proxies.*.host')
      .isString()
      .withMessage('El campo host debe ser una cadena de texto')
      .custom((value) => validator.isFQDN(value, {require_tld: false}))
      .withMessage('El campo host debe ser un hostname válido'),
    check('proxies.*.port')
      .isString()
      .withMessage('El campo port debe ser una cadena de texto')
      .custom((value) => validator.isInt(value) && parseInt(value) >= MIN_PORT && parseInt(value) <= MAX_PORT)
      .withMessage(`El campo port debe ser un string que represente un numero entero entre ${MIN_PORT} y ${MAX_PORT}`),
    check('proxies.*.username').optional().isString().withMessage('El campo username debe ser una cadena de texto opcional'),
    check('proxies.*.password').optional().isString().withMessage('El campo password debe ser una cadena de texto opcional'),
    check('proxies.*.proxyType').isString().withMessage('El campo proxyType debe ser una cadena de texto'),
    check('proxies.*.connectionType')
      .isString()
      .withMessage('El campo connectionType debe ser una cadena de texto')
      .isIn(['4g', '5g'])
      .withMessage('El campo connectionType debe ser "4g" o "5g"'),
  ],
  validarCampos,
  validateProxies,
  addProxies
);

module.exports = router;
