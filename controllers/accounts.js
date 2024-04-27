const {response, request} = require('express');
const {startSession} = require('mongoose');
const Account = require('../models/account');

const addAccout = async (req = request, res = response) => {
  const accountInfo = req.body;
  try {
    const accountExist = await Account.find({email: accountInfo.email});
    if (accountExist.length === 0) {
      const newPhone = new Account(accountInfo);
      await newPhone.save();
      logger.log('Se agrego la cuenta a la base de datos');
    } else {
      logger.warn('Se intento agregar la cuenta a la base de datos pero ya se encontraba registrada');
    }
  } catch (error) {
    logger.error('Ocurrio un error al intentar agregar la cuenta a la base de datos');
  }
};

const getAllAccounts = async (req = request, res = response) => {
  try {
    const accounts = await Account.find();
    return accounts.map((account) => {
      return {email: account.email, password: account.password};
    });
  } catch (error) {
    logger.error(`Ocurrio un error al obtener las cuentas wdc: ${error}`);
    return [];
  }
};

const getAvailableAccounts = async (maxCount = 100) => {
  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const accounts = await Account.find({}).limit(maxCount).session(session).lean();

      if (accounts.length === 0) {
        return [];
      }

      const accountIds = accounts.map((a) => a._id);
      await Account.updateMany({_id: {$in: accountIds}}, {$set: {status: 'assigned'}}, {session});

      return accounts;
    });
  } catch (err) {
    console.error('Error al obtener cuentas:', err);
    return [];
  } finally {
    session.endSession();
  }
};

module.exports = {getAvailableAccounts, getAllAccounts, addAccout};
