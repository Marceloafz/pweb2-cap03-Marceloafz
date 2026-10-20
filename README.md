# Delivery Tracker — Prisma + SQLite

> **Programação Web II — IFAL/Maceió.** A API utiliza arquitetura em camadas e Repository Pattern.
> Os repositories Prisma persistem entregas, motoristas e histórico em SQLite.

## Como usar este repositório

1. Clique em **"Use this template"** e crie **`pweb2-delivery-<matricula>`** (ex.: `pweb2-delivery-20231012345`).
   Este é o repositório que você usará o **semestre inteiro** (evolui a cada capítulo).
2. Clone, instale, configure o banco e rode:
   ```bash
   npm install
   cp .env.example .env                             # DATABASE_URL="file:./dev.db"
   npx prisma migrate dev                           # cria/aplica migrations locais
   npm start                                        # http://localhost:3000
   ```
   No PowerShell, use `Copy-Item .env.example .env`.
3. Para aplicar migrations versionadas no deploy, execute `npx prisma migrate deploy`.
   Para inspecionar os dados, use `npx prisma studio`.
4. Para validar a API, inicie o servidor e rode
   `BASE_URL=http://localhost:3000 node autograder/check.mjs` (no PowerShell, defina `$env:BASE_URL`).
   O GitHub Actions gera o Prisma Client, aplica migrations e inicia o servidor a cada push.

## O que implementar (em `src/`)

```
src/
├── controllers/   # traduz HTTP ↔ service (sem regra de negócio)
├── services/      # TODA a regra de negócio
├── repositories/  # só acesso a dados
├── config/        # singleton do Prisma Client
├── database/      # implementação anterior em memória, mantida como referência
├── routes/        # composição das dependências (injeção) + monta em /api
└── utils/
```

- **Regra de negócio só no Service.** Injeção de dependência no **composition root** (`src/routes`).
- O `server.js` só configura o app (já traz o `GET /api/health` exigido — não remova).

## Contrato da API

- Base `/api` · JSON · erro `{ "erro": "..." }` · `GET /api/health` → `{ "status": "ok" }`.
- Status: `201` criar · `400` entrada inválida · `404` não encontrado · `409` unicidade
  (duplicata/CPF) · `422` regra de estado (transição/atribuição inválida).
- Execução: `npm start`, respeita `process.env.PORT`, branch `main`.

Entregas, motoristas e eventos de histórico são gravados no arquivo SQLite definido em
`DATABASE_URL`. O CPF do motorista é único. As migrations versionadas ficam em `prisma/migrations/`;
o arquivo do banco local não deve ser versionado.
