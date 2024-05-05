const {Router} = require('express');
const {check} = require('express-validator');

const {validarCampos} = require('../middlewares/validar-campos');
const {botExiste} = require('../helpers/db-validators');

const {createBot, deleteBot, getBotResources} = require('../controllers/bots');

const router = Router();

router.post(
  '/add',
  [
    check('botName', 'Se esperaba un String en la propiedad botName').isString(),
    check('botName').custom(botExiste),
    validarCampos,
  ],
  createBot
);

router.get(
  '/get/resources/:botName',
  [check('botName', 'Se esperaba string con el nombre del bot').isString(), validarCampos],
  getBotResources
);

router.delete(
  '/delete/:botName',
  [
    check('botName', 'Se esperaba un string con el nombre del bot').isString(), // Valida que el ID del bot sea un ObjectId de MongoDB
    validarCampos,
  ],
  deleteBot
);

module.exports = router;
