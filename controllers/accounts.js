const {response, request} = require('express');
const Account = require('../models/account');
const logger = require('../helpers/logger');

const addAccount = async (req = request, res = response) => {
  const accountInfo = req.body;
  try {
    const newAccount = new Account(accountInfo);
    await newAccount.save();
    logger.log(`Se agrego la cuenta ${accountInfo.email} a la base de datos`);

    const response = {
      success: true,
      successMessage: `Se agrego la cuenta ${accountInfo.email} a la base de datos`,
      data: {accountAdded: newAccount},
      errors: [],
    };

    res.json(response);
  } catch (error) {
    logger.error(`Ocurrio un error al agregar la cuenta ${accountInfo.email} a la base de datos`, error);
    const response = {
      success: false,
      successMessage: '',
      data: {},
      errors: {
        value: accountInfo.email,
        msg: `Ocurrio un error al agregar la cuenta ${accountInfo.email} a la base de datos: ${error.message}`,
        param: 'email',
        location: 'body',
      },
    };

    res.json(response);
  }
};

module.exports = {addAccount};
