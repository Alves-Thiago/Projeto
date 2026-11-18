// Carrega as variáveis de ambiente antes de criar o servidor.
require('dotenv').config();
// Importa a aplicação HTTP e a conexão com o PostgreSQL.
const app = require('./app');
const pool = require('./config/database');

// Usa a porta configurada ou 3000 como padrão para desenvolvimento.
const port = Number(process.env.PORT || 3000);

// Confirma a conexão com o banco antes de aceitar requisições.
pool.query('SELECT 1')
  .then(() => {
    app.listen(port, () => console.log(`TechStock API disponível em http://localhost:${port}`));
  })
  .catch((erro) => {
    console.error('Não foi possível conectar ao PostgreSQL:', erro.message);
    process.exit(1);
  });
