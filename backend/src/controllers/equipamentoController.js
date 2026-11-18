// Importa as operações de persistência da entidade equipamento.
const equipamentoModel = require('../models/equipamentoModel');

// Define os valores de status aceitos tanto pela API quanto pelo banco.
const statusValidos = ['disponível', 'emprestado', 'manutenção'];

// Valida os campos comuns de criação e edição antes de acessar o banco.
function validarDados(dados) {
  const camposObrigatorios = ['nome', 'categoria', 'numero_serie', 'status', 'data_aquisicao'];
  const faltando = camposObrigatorios.filter((campo) => !String(dados[campo] || '').trim());
  if (faltando.length) return `Preencha os campos: ${faltando.join(', ')}.`;
  if (!statusValidos.includes(dados.status)) return 'O status informado não é válido.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data_aquisicao)) return 'A data deve estar no formato AAAA-MM-DD.';
  return null;
}

// Converte o parâmetro de rota para inteiro positivo, rejeitando entradas inválidas.
function obterId(valor) {
  const id = Number.parseInt(valor, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Lista uma fatia de equipamentos no banco e informa os metadados de paginação.
async function listar(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limitSolicitado = Number.parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(100, Math.max(1, limitSolicitado));
    const offset = (page - 1) * limit;
    const { itens, resumo } = await equipamentoModel.listar({ limit, offset });
    const total = resumo.total;

    res.json({
      data: itens,
      summary: resumo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (erro) {
    next(erro);
  }
}

// Retorna os detalhes de um equipamento específico.
async function buscarPorId(req, res, next) {
  try {
    const id = obterId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido.' });
    const equipamento = await equipamentoModel.buscarPorId(id);
    if (!equipamento) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    return res.json({ data: equipamento });
  } catch (erro) {
    return next(erro);
  }
}

// Valida e salva um novo equipamento, retornando o status HTTP 201.
async function criar(req, res, next) {
  try {
    const erroValidacao = validarDados(req.body);
    if (erroValidacao) return res.status(400).json({ error: erroValidacao });
    const equipamento = await equipamentoModel.criar(req.body);
    return res.status(201).json({ data: equipamento });
  } catch (erro) {
    return next(erro);
  }
}

// Valida e salva as mudanças de um equipamento já cadastrado.
async function atualizar(req, res, next) {
  try {
    const id = obterId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido.' });
    const erroValidacao = validarDados(req.body);
    if (erroValidacao) return res.status(400).json({ error: erroValidacao });
    const equipamento = await equipamentoModel.atualizar(id, req.body);
    if (!equipamento) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    return res.json({ data: equipamento });
  } catch (erro) {
    return next(erro);
  }
}

// Apaga o equipamento indicado e responde 204 quando a operação funciona.
async function remover(req, res, next) {
  try {
    const id = obterId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido.' });
    const removido = await equipamentoModel.remover(id);
    if (!removido) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    return res.status(204).send();
  } catch (erro) {
    return next(erro);
  }
}

// Exporta as ações que serão ligadas aos caminhos da API.
module.exports = { listar, buscarPorId, criar, atualizar, remover };
