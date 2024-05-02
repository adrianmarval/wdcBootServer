const express = require('express');
const cors = require('cors');

const {dbConnection} = require('../database/config');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.accountsPath = '/api/accounts';
    this.botsPath = '/api/bots';
    this.phonesPath = '/api/phones';
    this.proxiesPath = '/api/proxies';

    // Conectar a base de datos
    this.conectarDB();

    // Middlewares
    this.middlewares();

    // Rutas de mi aplicación
    this.routes();
  }

  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // Lectura y parseo del body
    this.app.use(express.json());

    // Directorio Público
    this.app.use(express.static('public'));
  }

  routes() {
    this.app.use(this.accountsPath, require('../routes/accounts'));
    this.app.use(this.botsPath, require('../routes/bots'));
    this.app.use(this.phonesPath, require('../routes/phones'));
    this.app.use(this.proxiesPath, require('../routes/proxies'));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('Servidor corriendo en puerto', this.port);
    });
  }
}

module.exports = Server;
