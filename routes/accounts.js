const {Router} = require('express');
const {check} = require('express-validator');

const {validarCampos} = require('../middlewares/validar-campos');
const {emailExiste} = require('../helpers/db-validators');

const {addAccount} = require('../controllers/accounts');

const router = Router();

router.post(
  '/add',
  [check('email', 'El correo no es válido').isEmail(), check('email').custom(emailExiste), validarCampos],
  addAccount
);

module.exports = router;
