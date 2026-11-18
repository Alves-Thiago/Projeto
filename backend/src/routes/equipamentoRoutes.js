// Importa o roteador do Express e as ações do controlador.
const express = require('express');
const controller = require('../controllers/equipamentoController');

// Agrupa os caminhos REST da entidade equipamentos.
const router = express.Router();

// Registra a listagem paginada e a consulta de um equipamento.
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);

// Registra a criação, edição e remoção de equipamentos.
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.remover);

// Entrega as rotas ao arquivo principal da API.
module.exports = router;
