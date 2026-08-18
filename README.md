# Atividade Cap. 3 — Servidor HTTP com a biblioteca padrão

> **Programação Web II — IFAL/Maceió.** Atividade **formativa** (não vale nota). O objetivo é
> praticar HTTP "na mão" com o módulo nativo do Node **antes** de conhecer o Express — e sentir
> por que um framework é útil.

## O que você vai fazer

Implementar, **usando apenas `node:http`** (sem Express), um servidor web com **10 rotas** que
variam método HTTP, leitura de corpo e checagem de cabeçalhos. O servidor deve ouvir em
`process.env.PORT || 3000`.

Todo o código vai no arquivo **`index.js`** (que começa vazio).

## Como funciona a correção automática

A cada `git push`, o **GitHub Actions** sobe o seu servidor e roda o autograder
(`autograder/check.mjs`), que testa as rotas em caixa-preta. O resultado aparece na aba
**Actions** → no **resumo do job** (tabela ✅/❌ + nota). Rode também localmente:

```bash
npm start                     # em um terminal
npm run check                 # em outro (usa BASE_URL=http://localhost:3000)
```

> O autograder é aberto — leia `autograder/check.mjs` para entender exatamente o que se espera.

## Contrato das rotas

As respostas são **exatas** (o corretor compara o texto, sem espaços nas pontas):

| # | Método | Rota | Regra | Resposta esperada |
|---|---|---|---|---|
| 1 | `GET` | `/` | — | `200` · texto · `Olá, Mundo!` |
| 2 | `GET` | `/sobre` | HTML como texto | `200` · `Content-Type: text/html` · corpo contém `<h1>Sobre</h1>` |
| 3 | `GET` | `/saudacao/:nome` | ler o nome da URL | `200` · `Olá, {nome}!` (ex.: `/saudacao/Ana` → `Olá, Ana!`) |
| 4 | `POST` | `/echo` | ler o corpo e devolver | `200` · o **mesmo corpo** enviado |
| 5 | `PUT` | `/itens/:id` | ler o id da URL | `200` · `Item {id} atualizado` |
| 6 | `DELETE` | `/itens/:id` | status sem corpo | `204` · (corpo vazio) |
| 7 | `PATCH` | `/config` | — | `200` · `Configuração atualizada` |
| 8 | `HEAD` | `/status` | cabeçalho de resposta | `200` · cabeçalho `X-Status: ok` · sem corpo |
| 9 | `GET` | `/agente` | checar `User-Agent` | contém `curl` → `Você é o cURL` · contém `chrome` → `Você é um navegador` · senão → `Agente desconhecido` |
| 10 | `GET` | `/secreto` | checar cabeçalho `X-Senha` | `X-Senha: 1234` → `200` `Acesso liberado` · senão → `401` `Não autorizado` |
| — | qualquer | rota não mapeada | *fallback* | `404` (texto livre) |

Dicas: a comparação de `User-Agent` deve ser **indiferente a maiúsculas/minúsculas**; para o
`POST /echo`, leia o corpo com os eventos `data`/`end` do `req`.

## Passo a passo

O guia completo, com comandos e dicas por rota, está em **[`PASSO-A-PASSO.md`](PASSO-A-PASSO.md)**.
Em resumo:

1. Clique em **"Use this template"** para criar o seu repositório.
2. Clone, rode `npm start` e comece a implementar o `index.js`.
3. **Resolva uma rota por commit**, seguindo o padrão em [`COMMITS.md`](COMMITS.md).
4. Dê `push` e acompanhe o autograder na aba **Actions**. Meta: **100%**.

Bom trabalho! 🚀
