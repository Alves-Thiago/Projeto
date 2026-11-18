# ATENÇÃO! 
O CÓDIGO A SEGUIR FOI FEITO POR MIM COM A BENÇÃO DE DEUS E NO INÍCIO NÓS SABÍAMOS COMO ISSO FUNCIONAVA, AGORA SÓ DEUS SABE!

*DICAS PARA MANTER O PROJETO FUNCIONANDO*<br>
1- SE ESTÁ FUNCIONANDO, NÃO MEXA! <br>
2- O CÓDIGO FOI TODO DOCUMENTADO PARA QUE EU NÃO PRECISASSE LEMBRAR DELE NO FUTURO, ENTÃO LEIA OS COMENTÁRIOS!<br>
3- CASO ENCONTRE ALGUM ERRO, LEMBRE-SE, ISSO ERA UMA ATIVIDADE PRÁTICA DE UMA MATÉRIA QUE EU PROVAVELMENTE NÃO PASSEI OU FIQUEI DE RECUPERAÇÃO.<br>
4- REGRA AINDA A DEFINIR.

# TechStock — Sistema de Controle de Inventário

Aplicação de estudo para controle dos equipamentos emprestados aos funcionários da TechSolutions. O projeto usa PostgreSQL em contêiner Docker, API REST com Node.js/Express e uma SPA React com Hooks.

## Funcionalidades

- Cadastro, consulta, edição e exclusão de equipamentos.
- Paginação real na consulta SQL (`LIMIT` e `OFFSET`) e metadados de total/páginas na API.
- Interface responsiva com busca, cartões de resumo, estados de carregamento e mensagens de erro/sucesso.
- Validação dos campos obrigatórios, status permitidos e número de série único.

## Como executar

Pré-requisitos: Docker com Compose e Node.js 18 ou superior.

1. Inicie o banco na raiz do repositório: `docker compose up -d db`.
2. Em outro terminal, prepare e inicie a API:

   ```bash
   cd backend
   npm install
   Copy-Item .env.example .env   # PowerShell; em bash, use: cp .env.example .env
   npm run dev
   ```

3. Em outro terminal, inicie o front-end:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Abra o endereço que o Vite mostrar (normalmente `http://localhost:5173`). A API fica em `http://localhost:3000`.

O schema é aplicado pelo Docker na primeira criação do volume. Para recriar o banco do zero, `docker compose down -v` apaga os dados e `docker compose up -d db` cria tudo novamente.

## Rotas da API

Base: `http://localhost:3000/api`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API está ativa |
| GET | `/equipamentos?page=1&limit=10` | Lista uma página e seus metadados |
| GET | `/equipamentos/:id` | Consulta um equipamento |
| POST | `/equipamentos` | Cadastra um equipamento |
| PUT | `/equipamentos/:id` | Atualiza um equipamento |
| DELETE | `/equipamentos/:id` | Remove um equipamento |

Exemplo de cadastro:

```json
{
  "nome": "Notebook Dell Latitude 5440",
  "categoria": "Notebook",
  "numero_serie": "DELL-5440-001",
  "status": "disponível",
  "data_aquisicao": "2025-02-10"
}
```

A resposta de listagem inclui `data` (somente os itens daquela página) e `pagination` (`page`, `limit`, `total`, `totalPages`). O limite máximo aceito é 100 registros por página.

## Estrutura

- `backend/src/controllers`: regras de validação e respostas HTTP.
- `backend/src/models`: consultas parametrizadas ao PostgreSQL.
- `backend/src/routes`: caminhos REST da API.
- `frontend/src/App.jsx`: tela, Hooks, tabela e formulários.
- `database/BANCO_DE_DADOS.md`: comandos e queries de criação do banco.
- `database/schema.sql`: schema aplicado pelo contêiner no primeiro início.
