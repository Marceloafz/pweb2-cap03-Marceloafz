#!/usr/bin/env node
/**
 * Autograder — Atividade Cap. 3 (servidor HTTP nativo). ATIVIDADE FORMATIVA (sem nota).
 *
 * Testa o contrato das 10 rotas (+ 404) contra uma BASE_URL, em caixa-preta.
 *   BASE_URL=http://localhost:3000 node autograder/check.mjs
 *
 * No GitHub Actions, escreve a tabela de resultados no resumo do job.
 * Requer Node 18+ (fetch global). Sem dependências.
 */

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const checks = [];
const check = (nome, pontos, fn) => checks.push({ nome, pontos, fn });

async function req(method, path, { body, headers } = {}) {
  const res = await fetch(BASE + path, { method, headers, body });
  const texto = await res.text();
  return { status: res.status, texto, headers: res.headers, tipo: res.headers.get('content-type') || '' };
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const corpo = (r) => r.texto.trim();

// 1
check('GET / → 200 "Olá, Mundo!"', 8, async () => {
  const r = await req('GET', '/');
  assert(r.status === 200, `status ${r.status} (esperado 200)`);
  assert(corpo(r) === 'Olá, Mundo!', `corpo: "${corpo(r)}"`);
});
// 2
check('GET /sobre → 200 text/html com <h1>Sobre</h1>', 10, async () => {
  const r = await req('GET', '/sobre');
  assert(r.status === 200, `status ${r.status}`);
  assert(r.tipo.includes('text/html'), `Content-Type: "${r.tipo}" (esperado text/html)`);
  assert(r.texto.includes('<h1>Sobre</h1>'), 'corpo deve conter <h1>Sobre</h1>');
});
// 3
check('GET /saudacao/:nome → "Olá, {nome}!"', 10, async () => {
  const r = await req('GET', '/saudacao/Ana');
  assert(r.status === 200, `status ${r.status}`);
  assert(corpo(r) === 'Olá, Ana!', `corpo: "${corpo(r)}"`);
});
// 4
check('POST /echo → devolve o corpo recebido', 12, async () => {
  const r = await req('POST', '/echo', { body: 'mensagem-de-teste-123', headers: { 'Content-Type': 'text/plain' } });
  assert(r.status === 200, `status ${r.status}`);
  assert(corpo(r) === 'mensagem-de-teste-123', `corpo: "${corpo(r)}"`);
});
// 5
check('PUT /itens/:id → "Item {id} atualizado"', 10, async () => {
  const r = await req('PUT', '/itens/42');
  assert(r.status === 200, `status ${r.status}`);
  assert(corpo(r) === 'Item 42 atualizado', `corpo: "${corpo(r)}"`);
});
// 6
check('DELETE /itens/:id → 204 sem corpo', 8, async () => {
  const r = await req('DELETE', '/itens/42');
  assert(r.status === 204, `status ${r.status} (esperado 204)`);
  assert(corpo(r) === '', 'corpo deve ser vazio');
});
// 7
check('PATCH /config → "Configuração atualizada"', 8, async () => {
  const r = await req('PATCH', '/config');
  assert(r.status === 200, `status ${r.status}`);
  assert(corpo(r) === 'Configuração atualizada', `corpo: "${corpo(r)}"`);
});
// 8
check('HEAD /status → 200 com cabeçalho X-Status: ok', 10, async () => {
  const r = await req('HEAD', '/status');
  assert(r.status === 200, `status ${r.status}`);
  assert((r.headers.get('x-status') || '') === 'ok', `X-Status: "${r.headers.get('x-status')}" (esperado ok)`);
});
// 9
check('GET /agente → resposta varia conforme User-Agent', 12, async () => {
  const curl = await req('GET', '/agente', { headers: { 'User-Agent': 'curl/8.4.0' } });
  assert(corpo(curl) === 'Você é o cURL', `cURL: "${corpo(curl)}"`);
  const chrome = await req('GET', '/agente', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows) Chrome/120' } });
  assert(corpo(chrome) === 'Você é um navegador', `Chrome: "${corpo(chrome)}"`);
  const outro = await req('GET', '/agente', { headers: { 'User-Agent': 'PostmanRuntime/7' } });
  assert(corpo(outro) === 'Agente desconhecido', `outro: "${corpo(outro)}"`);
});
// 10
check('GET /secreto → protegido por X-Senha', 8, async () => {
  const ok = await req('GET', '/secreto', { headers: { 'X-Senha': '1234' } });
  assert(ok.status === 200 && corpo(ok) === 'Acesso liberado', `com senha: ${ok.status} "${corpo(ok)}"`);
  const neg = await req('GET', '/secreto');
  assert(neg.status === 401, `sem senha: status ${neg.status} (esperado 401)`);
});
// 404
check('Rota inexistente → 404', 4, async () => {
  const r = await req('GET', '/rota-que-nao-existe');
  assert(r.status === 404, `status ${r.status} (esperado 404)`);
});

async function main() {
  // sanidade: servidor no ar?
  try {
    await fetch(BASE + '/', { method: 'GET' });
  } catch {
    const msg = `## ❌ Servidor não respondeu em ${BASE}\n\nImplemente o \`index.js\` e garanta que ele ouça em \`process.env.PORT\`.`;
    console.error(msg);
    await escreverResumo(msg);
    process.exit(1);
  }

  let obtido = 0, total = 0;
  const linhas = [];
  for (const c of checks) {
    total += c.pontos;
    try {
      await c.fn();
      obtido += c.pontos;
      linhas.push({ ok: true, nome: c.nome, pontos: c.pontos, detalhe: '' });
    } catch (e) {
      linhas.push({ ok: false, nome: c.nome, pontos: c.pontos, detalhe: e.message });
    }
  }

  const pct = total ? Math.round((obtido / total) * 100) : 0;
  console.log(`\nAutograder — Cap. 3 · BASE_URL: ${BASE}\n`);
  for (const l of linhas) {
    console.log(`${l.ok ? '✓' : '✗'} [${String(l.ok ? l.pontos : 0).padStart(2)}/${l.pontos}] ${l.nome}`);
    if (!l.ok) console.log(`      ↳ ${l.detalhe}`);
  }
  console.log(`\nNOTA (formativa): ${obtido}/${total}  (${pct}%)\n`);

  await escreverResumo(montarMarkdown(linhas, obtido, total, pct));
  process.exit(pct === 100 ? 0 : 1);
}

function montarMarkdown(linhas, obtido, total, pct) {
  const cabecalho = pct === 100 ? '## ✅ Todas as rotas passaram!' : `## Autograder — Cap. 3 · ${obtido}/${total} (${pct}%)`;
  const tabela = [
    '| | Rota | Pontos |', '|---|---|---|',
    ...linhas.map((l) => `| ${l.ok ? '✅' : '❌'} | ${l.nome}${l.ok ? '' : ' — ' + l.detalhe} | ${l.ok ? l.pontos : 0}/${l.pontos} |`),
  ].join('\n');
  return `${cabecalho}\n\n${tabela}\n\n> Atividade **formativa** (sem nota). Resolva uma rota por commit (ver \`COMMITS.md\`).`;
}

async function escreverResumo(md) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const fs = await import('node:fs');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
}

main();
