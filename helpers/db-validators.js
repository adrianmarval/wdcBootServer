const Account = require('../models/account');
const Phone = require('../models/phone');

const emailExiste = async (correo = '') => {
  // Verificar si el correo existe
  const existeEmail = await Account.findOne({correo});
  return existeEmail ? true : false;
};

const phoneExiste = async (phoneNumber = '') => {
  // Verificar si el correo existe
  const existeTelefono = await Phone.findOne({phoneNumber});
  return existeTelefono ? true : false;
};

module.exports = {
  emailExiste,
  phoneExiste,
};
