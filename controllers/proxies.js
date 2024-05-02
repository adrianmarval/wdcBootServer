const logger = require('../helpers/logger');
const Proxy = require('../models/proxy');

const addProxies = async (req, res) => {
  const {validProxies, invalidProxies} = req;

  try {
    const phonesToInsert = validProxies.map((validProxy) => new Proxy(validProxy));
    const addedProxies = await Proxy.insertMany(phonesToInsert);

    logger.log(`Se agregaron ${addedProxies.length} proxies a la base de datos`);

    const response = {
      success: true,
      successMessage: `Se agregaron ${addedProxies.length} proxies a la base de datos`,
      data: {addedProxies: addedProxies.map((proxy) => proxy.toObject()), invalidProxies},
      errors: [],
    };

    return res.json(response);
  } catch (error) {
    logger.error('Error al agregar proxies:', error);

    const response = {
      success: false,
      successMessage: '',
      data: {},
      errors: [
        {
          value: validProxies,
          msg: `Ocurrio un error al intentar agregar los proxies a la base de datos: ${error.message}`,
          param: 'validProxies',
          location: 'body',
        },
      ],
    };
    return res.json(response);
  }
};

const deleteProxy = async (req = request, res = response) => {
  const {id} = req.params;
  try {
    await Proxy.findByIdAndDelete(id);
    logger.log('Proxy eliminado de la base de datos');

    const response = {
      success: true,
      successMessage: 'Proxy eliminado de la base de datos',
      data: [],
      errors: [],
    };

    res.json(response);
  } catch (error) {
    logger.error('Ocurrio un error al eliminar proxy de la base de datos', error);

    const response = {
      success: false,
      successMessage: '',
      data: [],
      errors: [
        {
          value: proxyInfo,
          msg: `Ocurrio un error al eliminar proxy de la base de datos: ${error.message}`,
          param: 'ProxyInfo',
          location: 'body',
        },
      ],
    };

    res.json(response);
  }
};

module.exports = {addProxies, deleteProxy};
