const {Router} = require('express');
const {check} = require('express-validator');

const {validarCampos} = require('../middlewares/validar-campos');

const {addPhones, availablePhones, updatePhones} = require('../controllers/phones');
const {validatePhones} = require('../middlewares/validar-telefonos');

const router = Router();

router.post(
  '/add',
  [check('phoneNumbers', 'Se esperaba un array de numeros').isArray(), validatePhones, validarCampos],
  addPhones
);

router.post('/update', [check('phoneNumbers', 'Se esperaba un array de numeros').isArray(), validarCampos], updatePhones);

router.get('/get/numbers', [validarCampos], availablePhones);

module.exports = router;
