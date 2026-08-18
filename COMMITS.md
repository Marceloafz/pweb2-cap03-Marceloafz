# Padrão de commits da atividade

Nesta atividade você deve **resolver uma rota por commit**, usando mensagens no padrão
profissional **[Conventional Commits](https://www.conventionalcommits.org/pt-br/)** — o mesmo
usado no mercado. Isso deixa o histórico legível e é parte do que se avalia na prática.

## Formato

```
<tipo>(<escopo>): <descrição no imperativo, minúscula, sem ponto final>
```

- **tipo** — a natureza da mudança:
  - `feat` — implementa uma nova rota/funcionalidade (o caso comum aqui)
  - `fix` — corrige uma rota que estava errada
  - `refactor` — melhora o código sem mudar o comportamento
  - `docs` — mudanças de documentação
  - `chore` — configuração/tarefas (ex.: ajustar `package.json`)
- **escopo** — o que foi afetado. Aqui usamos `rota-01` … `rota-10` (e `rota-404`).
- **descrição** — no **imperativo** ("adiciona", "implementa", "corrige"), em minúscula, curta (≤ ~72 caracteres), sem ponto final.

## Mensagens esperadas (uma por rota)

Faça **um commit para cada rota**, nesta ordem sugerida:

| Commit | Mensagem |
|---|---|
| 1 | `feat(rota-01): responde GET / com "Olá, Mundo!"` |
| 2 | `feat(rota-02): responde GET /sobre com HTML e título Sobre` |
| 3 | `feat(rota-03): responde GET /saudacao/:nome personalizada` |
| 4 | `feat(rota-04): responde POST /echo devolvendo o corpo recebido` |
| 5 | `feat(rota-05): responde PUT /itens/:id confirmando atualização` |
| 6 | `feat(rota-06): responde DELETE /itens/:id com 204 sem corpo` |
| 7 | `feat(rota-07): responde PATCH /config confirmando atualização` |
| 8 | `feat(rota-08): responde HEAD /status com cabeçalho X-Status` |
| 9 | `feat(rota-09): responde GET /agente conforme o User-Agent` |
| 10 | `feat(rota-10): protege GET /secreto com o cabeçalho X-Senha` |
| 11 | `feat(rota-404): responde 404 para rotas não mapeadas` |

Se precisar corrigir uma rota depois, use `fix` com o mesmo escopo, por exemplo:

```
fix(rota-09): trata User-Agent em maiúsculas/minúsculas
```

## Corpo do commit (opcional, mas recomendado)

Quando fizer sentido explicar o "porquê", adicione um corpo após uma linha em branco:

```
feat(rota-04): responde POST /echo devolvendo o corpo recebido

Lê o corpo da requisição com os eventos data/end do stream, pois a
biblioteca padrão não faz o parse automático (diferente do Express).
```

## Dicas de fluxo

```bash
git add index.js
git commit -m 'feat(rota-01): responde GET / com "Olá, Mundo!"'
git push        # o autograder roda sozinho; veja o resultado na aba "Actions"
```

> Boas práticas: um commit deve ser **atômico** (uma ideia por commit) e o código deve
> **funcionar** naquele ponto. Evite um único commit gigante com tudo no fim.
