const Account = require('../models/account');

const emailExiste = async (email = '') => {
  const existeEmail = await Account.findOne({email});
  if (existeEmail) {
    throw new Error(`La cuenta: ${email}, ya se encuentra registrada en DB`);
  }
};

const botExiste = async (botName = '') => {
  const existeBot = await Account.findOne({name: botName});
  if (existeBot) {
    throw new Error(`El bot ${botName} ya existe en DB`);
  }
};

module.exports = {
  emailExiste,
  botExiste,
};
