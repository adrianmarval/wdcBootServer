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
    logger.error(`Ocurrio un error al agregar la cuenta ${accountInfo.email} a la base de datos: ${error}`);
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

const updateLastWorkDateAccount = async (req = request, res = response) => {
  const {accountId} = req.params;

  try {
    const now = new Date();
    const cuentaActualizada = await Account.findByIdAndUpdate(accountId, {lastWorkedAt: now}, {new: true}); // Actualiza el documento existente y devuelve el documento actualizado

    if (!cuentaActualizada) {
      throw new Error(`Cuenta no encontrada`);
    }

    logger.log(`Se actualizó la fecha de trabajo a la cuenta id ${accountId} en DB`); // Suponiendo que status es una propiedad

    const respuesta = {
      success: true,
      successMessage: `Se actualizó la fecha de trabajo a la cuenta id ${accountId} en DB`,
      data: {cuentaActualizada},
      errors: [],
    };

    res.json(respuesta);
  } catch (error) {
    logger.error(`Ocurrió un error al actualizar la fecha de trabajo a la cuenta id ${accountId}: ${error.message}`);
    const respuesta = {
      success: false,
      successMessage: '',
      data: {},
      errors: {
        value: accountId,
        msg: `Ocurrió un error al actualizar la cuenta con ID ${accountId}: ${error.message}`,
        param: 'accountId',
        location: 'body',
      },
    };

    res.json(respuesta);
  }
};

module.exports = {addAccount, updateLastWorkDateAccount};
