// Carrega as configurações locais do arquivo .env, caso ele exista.
require('dotenv').config();

// Importa o pool do PostgreSQL para reutilizar conexões com o banco.
const { Pool } = require('pg');

// Cria o pool usando variáveis de ambiente e valores padrão de desenvolvimento.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'techstock',
  user: process.env.DB_USER || 'techstock',
  password: process.env.DB_PASSWORD || 'techstock_dev',
});

// Exporta o pool para os modelos executarem comandos parametrizados.
module.exports = pool;
