// Importa o Express para montar a aplicação HTTP.
const express = require('express');
// Permite que o front-end em outra porta acesse a API durante o desenvolvimento.
const cors = require('cors');
// Importa as rotas de equipamentos.
const equipamentoRoutes = require('./routes/equipamentoRoutes');

// Cria a aplicação e habilita JSON e CORS.
const app = express();
app.use(cors());
app.use(express.json());

// Oferece uma rota simples para verificar se a API está ativa.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Coloca todas as operações de inventário sob o prefixo /api/equipamentos.
app.use('/api/equipamentos', equipamentoRoutes);

// Converte erros de banco conhecidos em mensagens HTTP claras.
app.use((erro, req, res, next) => {
  if (erro.code === '23505') {
    return res.status(409).json({ error: 'Já existe um equipamento com esse número de série.' });
  }
  console.error(erro);
  return res.status(500).json({ error: 'Ocorreu um erro interno. Tente novamente.' });
});

// Exporta a aplicação para o servidor iniciar na porta configurada.
module.exports = app;
