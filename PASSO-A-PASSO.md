# Passo a passo da atividade

> **Programação Web II — IFAL/Maceió.** Atividade **formativa** (não vale nota). Você vai construir
> um servidor web usando **apenas a biblioteca padrão do Node** (`node:http`), com 10 rotas.
> A cada `git push`, um corretor automático roda e mostra sua pontuação. Meta: **100%**.

## Pré-requisitos

- **Node.js 18 ou superior** — confira com `node --version`.
- **Git** instalado e configurado (`git --version`).
- Uma conta no **GitHub**, já logada.

---

## Etapa 1 — Crie o seu repositório a partir do template

1. Acesse o template: **https://github.com/engsoft-ifal/pweb2-cap03-http-nativo**
2. Clique no botão verde **“Use this template”** → **“Create a new repository”**.
3. Em **Repository name**, use o padrão: **`pweb2-cap03-<seu-usuario-github>`**
   (ex.: `pweb2-cap03-anasilva`).
4. Pode deixar **público**. Clique em **“Create repository”**.

> Isso cria uma cópia sua, já com o `index.js` vazio, o corretor e o *workflow* de correção.

---

## Etapa 2 — Clone o repositório e instale

No terminal, troque `<seu-usuario>` pelo seu:

```bash
git clone https://github.com/<seu-usuario>/pweb2-cap03-<seu-usuario>.git
cd pweb2-cap03-<seu-usuario>
npm install
```

---

## Etapa 3 — Rode o servidor e o corretor localmente

Você vai precisar de **dois terminais** abertos na pasta do projeto.

**Terminal 1** — sobe o seu servidor:

```bash
npm start
```

**Terminal 2** — roda o corretor (as mesmas checagens do GitHub):

```bash
npm run check
```

No começo tudo vai falhar — é esperado, o `index.js` está vazio. Seu objetivo é ir fazendo
as checagens ficarem verdes (✓).

> Dica: sempre que mudar o `index.js`, **pare** o servidor (Ctrl+C no Terminal 1) e rode
> `npm start` de novo antes de checar.

---

## Etapa 4 — Entenda a tarefa

Todo o seu código vai em **`index.js`**. Você deve implementar as **10 rotas** descritas no
[`README.md`](README.md) (a tabela do contrato). Comece descomentando o ponto de partida:

```js
import http from 'node:http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // decida a resposta com base em req.method, req.url e req.headers
});

server.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
```

Como não há framework, **você** faz o roteamento: comparar `req.method` e `req.url` e devolver a
resposta certa com `res.writeHead(...)` e `res.end(...)`.

---

## Etapa 5 — O ciclo de trabalho: **uma rota por commit**

Este é o coração da atividade. Para **cada** rota:

1. Implemente a rota no `index.js`.
2. Teste localmente (`npm start` + `npm run check`).
3. Faça **um commit só daquela rota**, com a mensagem no padrão de [`COMMITS.md`](COMMITS.md):

   ```bash
   git add index.js
   git commit -m 'feat(rota-01): responde GET / com "Olá, Mundo!"'
   git push
   ```

4. Abra a aba **“Actions”** do seu repositório no GitHub. O corretor roda sozinho e mostra a
   tabela ✅/❌ e a nota no **resumo do job**.

Repita para as 11 mensagens da tabela do `COMMITS.md` (rotas 01–10 + a 404).

---

## Etapa 6 — Dicas para as rotas mais difíceis

- **Rota 3 e 5 (`:nome`, `:id`):** o caminho vem em `req.url`. Separe com `req.url.split('/')`
  para pegar o pedaço que você precisa.
- **Rota 4 (`POST /echo`):** a biblioteca padrão **não** faz o *parse* do corpo. Junte os pedaços
  com os eventos do *stream*:

  ```js
  let corpo = '';
  req.on('data', (parte) => (corpo += parte));
  req.on('end', () => { /* responda usando "corpo" aqui dentro */ });
  ```

- **Rota 6 (`DELETE`, 204):** status `204` **não** tem corpo — use `res.writeHead(204); res.end();`.
- **Rota 8 (`HEAD /status`):** responda com o cabeçalho e **sem corpo**:
  `res.writeHead(200, { 'X-Status': 'ok' }); res.end();`
- **Rota 9 (`/agente`):** leia `req.headers['user-agent']`. Compare em **minúsculas**
  (`.toLowerCase()`), pois o cabeçalho pode variar. Teste com:

  ```bash
  curl -A "curl/8" http://localhost:3000/agente        # → Você é o cURL
  curl -A "Mozilla/5.0 Chrome/120" http://localhost:3000/agente   # → Você é um navegador
  ```

- **Rota 10 (`/secreto`):** leia `req.headers['x-senha']`. Sem a senha correta, responda `401`.

  ```bash
  curl -i http://localhost:3000/secreto                 # → 401
  curl -H "X-Senha: 1234" http://localhost:3000/secreto # → Acesso liberado
  ```

- **404:** se nenhuma rota casar, responda `404` no final da função.

> ⚠️ As respostas são comparadas **exatamente** (sem espaços nas pontas). Copie os textos do
> contrato como estão, com acentuação.

---

## Etapa 7 — Confira sua pontuação

- **No GitHub:** aba **Actions** → clique no run mais recente → veja o **Summary** (tabela + nota).
- **Localmente:** `npm run check` (com o servidor rodando).

Quando o corretor mostrar **100/100**, o run do Actions fica **verde** ✅.

---

## Checklist final

- [ ] Repositório criado a partir do template.
- [ ] As 10 rotas + o 404 implementados no `index.js`.
- [ ] **Um commit por rota**, com mensagens no padrão `feat(rota-NN): ...`.
- [ ] Autograder em **100%** (run verde no Actions).

---

## Problemas comuns

- **“Tudo falha / servidor não respondeu”** → seu servidor não subiu. Confira se ele usa
  `process.env.PORT` e se não há erro de sintaxe (olhe o Terminal 1).
- **“Passa local mas falha no Actions”** → você esqueceu de dar `git push`, ou commitou sem salvar
  o `index.js`.
- **“A rota /agente ou /secreto não passa”** → confira o nome do cabeçalho (`user-agent`, `x-senha`
  — sempre em minúsculas ao ler de `req.headers`) e o texto exato da resposta.
- **Acabei fazendo tudo em um commit só** → sem problema para a nota (é formativa), mas o objetivo é
  praticar commits atômicos. Tente refazer no padrão na próxima.

Bom trabalho! 🚀
