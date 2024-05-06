const {request, response} = require('express');
const Bot = require('../models/bot');
const Account = require('../models/account');
const Proxy = require('../models/proxy');
const Phone = require('../models/phone');
const logger = require('../helpers/logger');
const {startSession} = require('mongoose');

const createBot = async (req = request, res = response) => {
  const {botName} = req.body;
  const session = await startSession();
  session.startTransaction();

  try {
    const maxAccountsPerBot = parseInt(process.env.ACCOUNTS_PER_BOT);
    const accounts = await Account.find({status: 'available', assignedPhones: true})
      .limit(maxAccountsPerBot)
      .session(session)
      .lean();

    if (accounts.length === 0) {
      throw new Error('No hay cuentas disponibles');
    }

    const proxies = await Proxy.find({status: 'available'}).limit(1).session(session).lean();

    if (!proxies) {
      throw new Error('No hay proxy disponible');
    }

    const phoneNumbers = await Phone.find({assignedBot: {$exists: false}})
      .limit(accounts.length * 3)
      .session(session)
      .lean();

    if (phoneNumbers.length !== accounts.length * 3) {
      const acc = accounts.length * 3 - phoneNumbers.length;
      throw new Error(`No hay suficientes numeros disponibles. Debe agregar ${acc} numeros`);
    }

    const accountIds = accounts.map((a) => a._id);
    const proxyIds = proxies.map((p) => p._id);
    const phoneNumberIds = phoneNumbers.map((p) => p._id);

    const newBot = new Bot({
      name: botName,
      proxy: proxies[0]._id,
      accounts: accounts.map((account) => account._id),
      phones: phoneNumbers.map((phone) => phone._id),
    });

    await Account.updateMany({_id: {$in: accountIds}}, {$set: {status: 'assigned', assignedBot: newBot._id}}, {session});
    await Proxy.updateMany({_id: {$in: proxyIds}}, {$set: {status: 'assigned', assignedBot: newBot._id}}, {session});
    await Phone.updateMany({_id: {$in: phoneNumberIds}}, {$set: {assignedBot: newBot._id}}, {session});

    await newBot.save({session});

    await session.commitTransaction();

    logger.log(`Se agrego el bot ${botName} a la base de datos`);

    return res.json({
      success: true,
      successMessage: `Bot ${botName} creado con exito`,
      data: {botAdded: newBot}, // Devuelve solo el bot creado
      errors: [],
    });
  } catch (error) {
    logger.error(`Error al crear el bot ${botName}: ${error}`);
    await session.abortTransaction();
    const response = {
      success: false,
      successMessage: '',
      data: {},
      errors: [
        {
          value: botName,
          msg: `Error al crear el bot ${botName}: ${error.message}`,
          param: 'botName',
          location: 'body',
        },
      ],
    };
    return res.json(response);
  } finally {
    session.endSession();
  }
};

const deleteBot = async (req = request, res = response) => {
  const {botName} = req.params;
  const session = await startSession();
  session.startTransaction();

  try {
    const deletedBot = await Bot.findOne({name: botName}).session(session);

    if (!deletedBot) {
      throw new Error(`Bot ${botName} no encontrado en la base de datos`);
    }

    await Account.updateMany(
      {_id: {$in: deletedBot.accounts}},
      {$set: {status: 'available'}, $unset: {assignedBot: 1}},
      {session}
    );
    await Proxy.updateMany({_id: deletedBot.proxy}, {$set: {status: 'available'}, $unset: {assignedBot: 1}}, {session});
    await Phone.updateMany({_id: {$in: deletedBot.phones}}, {$unset: {assignedBot: 1}}, {session});
    await deletedBot.remove({session});

    await session.commitTransaction();

    logger.log(`Se elimino el bot ${deletedBot.name} a la base de datos`);

    const response = {
      success: true,
      successMessage: `Bot ${deletedBot.name} eliminado con exito`,
      data: {},
      errors: [],
    };

    return res.json(response);
  } catch (error) {
    logger.error(`Ocurrio un error al eliminar el bot: ${error.message}`);
    await session.abortTransaction();
    const response = {
      success: false,
      successMessage: '',
      data: {},
      errors: [
        {
          value: botName,
          msg: `Ocurrio un error al eliminar el bot: ${error.message}`,
          param: 'botName',
          location: 'params',
        },
      ],
    };
    return res.json(response);
  } finally {
    session.endSession();
  }
};

const getBotResources = async (req = request, res = response) => {
  const {botName} = req.params;

  try {
    const bot = await Bot.findOne({name: botName});
    if (!bot) {
      throw new Error('No se encontro el bot');
    }

    const accounts = await Account.find({assignedBot: bot._id}).lean();
    const phoneNumbers = await Phone.find({assignedBot: bot._id}).lean();
    const proxy = await Proxy.find({assignedBot: bot._id}).lean();

    const accountsWithPhones = accounts.map((account) => {
      const assignedPhones = phoneNumbers.filter((phone) => phone.assignedAccount.toString() === account._id.toString());

      return {
        ...account,
        assignedPhones,
      };
    });

    logger.log(`Se han obtenido los recursos del bot ${bot.name}`);

    const response = {
      success: true,
      successMessage: `Se han obtenido los recursos del bot ${bot.name}`,
      data: {accounts: accountsWithPhones, proxy},
      errors: [],
    };

    return res.json(response);
  } catch (error) {
    logger.error(`Ocurrio un error al obtener recursos para el bot: ${error.message}`);

    const response = {
      success: false,
      successMessage: '',
      data: {},
      errors: [
        {
          value: botName,
          msg: `Ocurrio un error al obtener recursos para el bot: ${error.message}`,
          param: 'botName',
          location: 'params',
        },
      ],
    };
    return res.json(response);
  }
};

module.exports = {createBot, deleteBot, getBotResources};
