const Phone = require('../models/phone');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const validatePhones = async (req, res, next) => {
  const {phoneNumbers, countryCode, provider} = req.body;
  const invalidPhoneNumbers = [];
  const validPhoneNumbers = [];

  const existingPhoneNumbers = await Phone.find({}, {phoneNumber: 1, _id: 0}).lean();

  phoneNumbers.forEach((phone) => {
    try {
      const number = phoneUtil.parseAndKeepRawInput(phone, countryCode);
      const phoneNumber = number.getNationalNumber().toString();
      const isValidPhoneNumber = phoneUtil.isValidNumber(number);

      if (!isValidPhoneNumber) {
        invalidPhoneNumbers.push({
          value: phone,
          msg: 'Numero de telefono invalido',
          param: 'phoneNumber',
          location: 'body',
        });
        return;
      }

      const phoneAlreadyExist = existingPhoneNumbers.some((existingPhone) => existingPhone.phoneNumber === phoneNumber);

      if (phoneAlreadyExist) {
        invalidPhoneNumbers.push({
          value: phone,
          msg: 'Numero de telefono ya existe en DB',
          param: 'phoneNumber',
          location: 'body',
        });
      } else {
        validPhoneNumbers.push({
          fullPhoneNumber: phoneUtil.format(number, PNF.E164).substring(1),
          provider,
          areaCode: number.getCountryCode(),
          countryCode,
          phoneNumber,
        });
      }
    } catch (error) {
      invalidPhoneNumbers.push({
        value: phone,
        msg: error.message,
        param: 'phoneNumber',
        location: 'body',
      });
    }
  });

  req.validPhoneNumbers = validPhoneNumbers;
  req.invalidPhoneNumbers = invalidPhoneNumbers;

  next();
};

module.exports = {
  validatePhones,
};
