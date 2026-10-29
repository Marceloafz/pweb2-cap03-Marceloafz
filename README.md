# Delivery Tracker — SSR com EJS, Prisma e SQLite

> **Programação Web II — IFAL/Maceió.** Interface web renderizada no servidor com EJS.
> Os services e repositories Prisma persistem entregas, motoristas e histórico em SQLite.

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
4. Para validar, inicie o servidor e rode
   `BASE_URL=http://localhost:3000 node autograder/check.mjs` (no PowerShell, defina `$env:BASE_URL`).
O GitHub Actions gera o Prisma Client, aplica migrations e executa o autograder a cada push.

## O que implementar (em `src/`)

```
src/
├── controllers/   # traduz HTTP ↔ service e renderiza views
├── services/      # TODA a regra de negócio
├── repositories/  # só acesso a dados
├── config/        # singleton do Prisma Client
├── database/      # implementação anterior em memória, mantida como referência
├── routes/        # composição das dependências e rotas web
├── utils/
└── views/          # templates EJS, layout e partials
```

- **Regra de negócio só no Service.** Injeção de dependência no **composition root** (`src/routes`).
- O `server.js` configura o EJS/layout, sessões, mensagens flash e `method-override`.
- As páginas usam PRG após gravações; erros de formulário são exibidos junto aos valores informados.
- `GET /api/health` → `{ "status": "ok" }` para readiness.

## Páginas e ações

- `GET /entregas` lista e filtra entregas por status; `GET /entregas/nova` e `POST /entregas`
  exibem e processam o formulário.
- `GET /entregas/:id` exibe detalhes e histórico. Ações de avanço, cancelamento e atribuição
  usam `PATCH /entregas/:id/{avancar,cancelar,atribuir}` (os formulários usam `_method=PATCH`).
- `GET /motoristas` lista motoristas; `GET /motoristas/novo` e `POST /motoristas` exibem e
  processam o cadastro.
- Execução: `npm start` ou `npm run dev`, respeita `process.env.PORT`, branch `main`.

Entregas, motoristas e eventos de histórico são gravados no arquivo SQLite definido em
`DATABASE_URL`. O CPF do motorista é único. As migrations versionadas ficam em `prisma/migrations/`;
o arquivo do banco local não deve ser versionado.


<img width="1598" height="857" alt="image" src="https://github.com/user-attachments/assets/c2a4d5d3-72da-49d1-bb4a-137127f444eb" />

