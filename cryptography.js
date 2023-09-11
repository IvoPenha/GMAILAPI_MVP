const crypto = require('crypto');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// A chave de criptografia é armazenada no arquivo .env

module.exports = {
  encrypt,
  decrypt,
};