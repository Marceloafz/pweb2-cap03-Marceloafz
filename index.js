// Atividade Cap. 3 — Servidor HTTP com a biblioteca padrão (node:http).
//
// Implemente aqui um servidor que atenda às 10 rotas descritas no README.md.
//
// Regras essenciais:
//   - Use o módulo nativo `node:http` (NÃO use Express — o objetivo é sentir "na mão").
//   - O servidor deve ouvir em `process.env.PORT || 3000`.
//   - Resolva UMA rota por commit, seguindo o padrão de mensagens em COMMITS.md.
//   - A cada push, o autograder roda sozinho e mostra o resultado na aba "Actions".
//
// Ponto de partida (descomente e desenvolva):
//
// import http from 'node:http';
//
// const PORT = process.env.PORT || 3000;
//
// const server = http.createServer((req, res) => {
//   // dica: use req.method, req.url e req.headers para decidir a resposta
// });
//
// server.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
