// Importa o pool que faz a comunicação com o PostgreSQL.
const pool = require('../config/database');

// Lista somente a página pedida e devolve também a quantidade total de registros.
async function listar({ limit, offset }) {
  const [itens, contagem] = await Promise.all([
    pool.query(
      `SELECT id, nome, categoria, numero_serie, status,
              TO_CHAR(data_aquisicao, 'YYYY-MM-DD') AS data_aquisicao
       FROM equipamentos
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'disponível')::int AS disponiveis,
              COUNT(*) FILTER (WHERE status = 'emprestado')::int AS emprestados,
              COUNT(*) FILTER (WHERE status = 'manutenção')::int AS manutencao
       FROM equipamentos`,
    ),
  ]);

  return { itens: itens.rows, resumo: contagem.rows[0] };
}

// Busca um equipamento pelo identificador ou devolve null quando não existe.
async function buscarPorId(id) {
  const resultado = await pool.query(
    `SELECT id, nome, categoria, numero_serie, status,
            TO_CHAR(data_aquisicao, 'YYYY-MM-DD') AS data_aquisicao
     FROM equipamentos WHERE id = $1`,
    [id],
  );
  return resultado.rows[0] || null;
}

// Insere os dados do formulário usando parâmetros para evitar SQL injection.
async function criar(dados) {
  const resultado = await pool.query(
    `INSERT INTO equipamentos (nome, categoria, numero_serie, status, data_aquisicao)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nome, categoria, numero_serie, status,
               TO_CHAR(data_aquisicao, 'YYYY-MM-DD') AS data_aquisicao`,
    [dados.nome, dados.categoria, dados.numero_serie, dados.status, dados.data_aquisicao],
  );
  return resultado.rows[0];
}

// Atualiza os campos e a data de alteração do registro indicado.
async function atualizar(id, dados) {
  const resultado = await pool.query(
    `UPDATE equipamentos
     SET nome = $1, categoria = $2, numero_serie = $3, status = $4,
         data_aquisicao = $5, atualizado_em = NOW()
     WHERE id = $6
     RETURNING id, nome, categoria, numero_serie, status,
               TO_CHAR(data_aquisicao, 'YYYY-MM-DD') AS data_aquisicao`,
    [dados.nome, dados.categoria, dados.numero_serie, dados.status, dados.data_aquisicao, id],
  );
  return resultado.rows[0] || null;
}

// Remove o registro informado e retorna true somente se uma linha foi removida.
async function remover(id) {
  const resultado = await pool.query('DELETE FROM equipamentos WHERE id = $1', [id]);
  return resultado.rowCount > 0;
}

// Expõe as operações do modelo para a camada de controle.
module.exports = { listar, buscarPorId, criar, atualizar, remover };
