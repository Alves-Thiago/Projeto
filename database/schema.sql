-- Cria a tabela principal de equipamentos usada pela API.
CREATE TABLE IF NOT EXISTS equipamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'disponível'
        CHECK (status IN ('disponível', 'emprestado', 'manutenção')),
    data_aquisicao DATE NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Acelera filtros e ordenações por categoria e estado do equipamento.
CREATE INDEX IF NOT EXISTS idx_equipamentos_status ON equipamentos (status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_categoria ON equipamentos (categoria);
