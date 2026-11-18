# Banco de dados do TechStock

O PostgreSQL é executado em um contêiner Docker pelo arquivo `docker-compose.yml`. Os dados ficam no volume persistente `postgres_data`.

## Inicialização

Na raiz do projeto, execute:

```bash
docker compose up -d db
```

O Docker executa `database/schema.sql` automaticamente na primeira inicialização do volume.

## Comandos úteis

```bash
# Verificar se o banco está saudável
docker compose ps

# Abrir o terminal SQL do contêiner
docker compose exec db psql -U techstock -d techstock

# Parar o banco sem apagar os dados
docker compose stop db

# Apagar os contêineres e também o volume (remove os dados salvos)
docker compose down -v
```

## Query de criação da tabela

```sql
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

CREATE INDEX IF NOT EXISTS idx_equipamentos_status ON equipamentos (status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_categoria ON equipamentos (categoria);
```

## Configuração local

O serviço usa as variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`. Os valores de desenvolvimento correspondem ao serviço `db` do Compose. Configure essas mesmas variáveis no arquivo `backend/.env` para a API rodando diretamente na máquina (`DB_HOST=localhost`).
