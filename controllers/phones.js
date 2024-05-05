const {request, response} = require('express');
const {startSession} = require('mongoose');
const Phone = require('../models/phone');
const logger = require('../helpers/logger');
const Account = require('../models/account');

const addPhones = async (req = request, res = response) => {
  const {validPhoneNumbers, invalidPhoneNumbers} = req;
  const session = await startSession();
  session.startTransaction();

  try {
    // Obtener cuentas disponibles sin números asignados
    const availableAccounts = await Account.find({status: 'available', phoneNumbers: false}).session(session);

    if (availableAccounts.length === 0) {
      throw new Error('Se necesitan mas cuentas en DB para agregar mas numeros de telefono');
    }

    let remainingPhones = validPhoneNumbers.slice();
    // Construir array de documentos de teléfono a insertar
    const phonesToInsert = [];
    const accountsToUpdate = [];
    for (const account of availableAccounts) {
      const accountPhones = remainingPhones.splice(0, 3);
      for (const phoneNumber of accountPhones) {
        phonesToInsert.push({
          ...phoneNumber,
          assignedAccount: account._id, // Asignar el ID de la cuenta al número de teléfono
        });
      }
      accountsToUpdate.push(account._id);
    }

    await Account.updateMany({_id: {$in: accountsToUpdate}}, {phoneNumbers: true}, {session});
    const insertedPhones = await Phone.insertMany(phonesToInsert, {session});

    await session.commitTransaction();

    logger.log(`Se agregaron ${insertedPhones.length} números de teléfono a la base de datos`);

    // Construir la respuesta
    const successMessage = `${insertedPhones.length} números de teléfono Agregados, ${remainingPhones.length} Remanentes (falta de cuentas)`;

    const response = {
      success: true,
      successMessage,
      data: {
        addedPhones: insertedPhones.map((phone) => phone.toObject()),
        remainingPhones,
        invalidPhoneNumbers,
      },
      errors: [],
    };
    return res.json(response);
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Ocurrió un error al intentar agregar los números a la base de datos: ${error.message}`);
    const response = {
      success: false,
      successMessage: '',
      data: {},
      errors: [
        {
          value: validPhoneNumbers,
          msg: `Ocurrió un error al intentar agregar los números a la base de datos: ${error.message}`,
          param: 'phoneNumbers',
          location: 'body',
        },
      ],
    };
    return res.json(response);
  } finally {
    session.endSession();
  }
};

const availablePhones = async (req = request, res = response) => {
  try {
    const phones = await Phone.find({status: 'available'}).lean();
    return res.json(phones.map((phone) => phone.fullPhoneNumber));
  } catch (error) {
    console.log(error);
    return res.json('error al obtener telefonos');
  }
};

const updatePhones = async (req = request, res = response) => {
  const {phoneNumbers} = req.body;

  try {
    const bulkOperations = phoneNumbers.map((phoneNumber) => ({
      updateOne: {
        filter: {_id: phoneNumber._id}, // Update each phone by its own _id
        update: {$set: {status: phoneNumber.status}}, // Set status based on each object's status
      },
    }));

    await Phone.bulkWrite(bulkOperations);

    const updatedPhoneNumbers = await Phone.find({_id: {$in: phoneNumbers.map((pn) => pn._id)}});

    logger.log(`Se actualizaron los estados de ${phoneNumbers.length} teléfonos en DB`);

    const response = {
      success: true,
      successMessage: `Se actualizaron los estados de ${phoneNumbers.length} teléfonos en DB`,
      data: {updatedPhoneNumbers},
      errors: [],
    };

    return res.json(response);
  } catch (error) {
    logger.error(`Ocurrió un error al actualizar los estados de los teléfonos: ${error.message}`);
    const response = {
      success: false,
      successMessage: '',
      data: {},
      errors: [
        {
          value: phoneNumbers,
          msg: `Ocurrió un error al actualizar los estados de los teléfonos: ${error.message}`,
          param: 'phoneNumbers',
          location: 'body',
        },
      ],
    };
    return res.json(response);
  }
};

module.exports = {addPhones, availablePhones, updatePhones};
