#!/usr/bin/env node

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const cookieJar = new Map();
const checks = [];
const token = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-11);
const cpf = token.padStart(11, '0');
const descricao = `Entrega de teste ${token}`;
const nomeMotorista = `Motorista de teste ${token}`;

function check(nome, pontos, fn) {
  checks.push({ nome, pontos, fn });
}

async function req(method, route, { body, headers = {} } = {}) {
  const parsedUrl = new URL(route, BASE);
  const cookie = cookieJar.get(parsedUrl.origin);
  if (cookie) headers.Cookie = cookie;

  const response = await fetch(parsedUrl, {
    method,
    body,
    headers,
    redirect: 'manual',
  });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookieJar.set(parsedUrl.origin, setCookie.split(';')[0]);
  return {
    status: response.status,
    text: await response.text(),
    headers: response.headers,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function form(data) {
  return new URLSearchParams(data).toString();
}

check('GET /api/health retorna readiness JSON', 5, async () => {
  const response = await req('GET', '/api/health');
  assert(response.status === 200, `status recebido: ${response.status}`);
  assert(response.text.includes('"status":"ok"'), 'resposta não contém status ok');
});

check('GET / redireciona para /entregas', 5, async () => {
  const response = await req('GET', '/');
  assert(response.status >= 300 && response.status < 400, `status recebido: ${response.status}`);
  assert(response.headers.get('location') === '/entregas', 'destino do redirect incorreto');
});

check('Listagem e formulário de entregas são renderizados', 10, async () => {
  const list = await req('GET', '/entregas');
  assert(list.status === 200 && list.text.includes('<table'), 'listagem não contém tabela');
  assert(list.text.includes('Nova Entrega'), 'link Nova Entrega não encontrado');
  const formPage = await req('GET', '/entregas/nova');
  assert(formPage.status === 200, `formulário retornou ${formPage.status}`);
  for (const field of ['descricao', 'origem', 'destino']) {
    assert(formPage.text.includes(`name="${field}"`), `campo ${field} não encontrado`);
  }
});

check('Formulário de motorista contém nome e CPF', 8, async () => {
  const response = await req('GET', '/motoristas/novo');
  assert(response.status === 200, `formulário retornou ${response.status}`);
  assert(response.text.includes('name="nome"'), 'campo nome não encontrado');
  assert(response.text.includes('name="cpf"'), 'campo CPF não encontrado');
});

check('Formulário inválido retorna 400 preservando valores', 10, async () => {
  const response = await req('POST', '/entregas', {
    body: form({ descricao, origem: 'Maceió', destino: 'Maceió' }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(response.status === 400, `status recebido: ${response.status}`);
  assert(response.text.includes('Origem e destino não podem ser iguais'), 'mensagem de validação não encontrada');
  assert(response.text.includes(descricao), 'descrição digitada não foi preservada');
});

check('Criação de entrega segue PRG e exibe flash', 10, async () => {
  const response = await req('POST', '/entregas', {
    body: form({ descricao, origem: 'Maceió', destino: 'Arapiraca' }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(response.status >= 300 && response.status < 400, `criação retornou ${response.status}`);
  const location = response.headers.get('location');
  assert(/^\/entregas\/\d+$/.test(location || ''), `redirect inválido: ${location}`);
  const detail = await req('GET', location);
  assert(detail.status === 200, `detalhe retornou ${detail.status}`);
  assert(detail.text.includes('Entrega criada com sucesso.'), 'flash de criação não exibido');
  assert(detail.text.includes('Histórico'), 'histórico não exibido');
  assert(detail.text.includes('Entrega criada'), 'evento inicial ausente');
});

check('Filtro de status funciona', 7, async () => {
  const response = await req('GET', '/entregas?status=CRIADA');
  assert(response.status === 200, `listagem filtrada retornou ${response.status}`);
  assert(response.text.includes(descricao), 'entrega CRIADA não aparece no filtro');
  assert(response.text.includes('value="CRIADA" selected'), 'status filtrado não permanece selecionado');
});

check('Ação PATCH avançar atualiza status via method-override', 10, async () => {
  const create = await req('POST', '/entregas', {
    body: form({ descricao: `${descricao} avançar`, origem: 'Penedo', destino: 'Maceió' }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const location = create.headers.get('location');
  assert(location, 'criação não redirecionou');
  const id = location.split('/').pop();
  const advance = await req('POST', `${location}/avancar?_method=PATCH`, {
    body: '',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(advance.status >= 300 && advance.status < 400, `PATCH retornou ${advance.status}`);
  const detail = await req('GET', `/entregas/${id}`);
  assert(detail.text.includes('EM TRANSITO'), 'status não avançou para EM_TRANSITO');
  assert(detail.text.includes('Status da entrega atualizado.'), 'flash da ação não exibido');
});

check('Ação PATCH cancelar altera status e informa usuário', 8, async () => {
  const create = await req('POST', '/entregas', {
    body: form({ descricao: `${descricao} cancelar`, origem: 'Rio Largo', destino: 'Marechal Deodoro' }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const location = create.headers.get('location');
  assert(location, 'criação não redirecionou');
  const cancel = await req('POST', `${location}/cancelar?_method=PATCH`, {
    body: '',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(cancel.status >= 300 && cancel.status < 400, `cancelamento retornou ${cancel.status}`);
  const detail = await req('GET', location);
  assert(detail.text.includes('CANCELADA'), 'status cancelado não aparece');
  assert(detail.text.includes('Entrega cancelada.'), 'flash de cancelamento não aparece');
});

check('Cadastro e listagem de motoristas funcionam com PRG', 10, async () => {
  const response = await req('POST', '/motoristas', {
    body: form({ nome: nomeMotorista, cpf }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(response.status >= 300 && response.status < 400, `cadastro retornou ${response.status}`);
  assert(response.headers.get('location') === '/motoristas', 'redirect de cadastro incorreto');
  const list = await req('GET', '/motoristas');
  assert(list.status === 200 && list.text.includes(nomeMotorista), 'motorista não aparece na listagem');
  assert(list.text.includes(cpf), 'CPF não aparece na listagem');
  assert(list.text.includes('Motorista cadastrado com sucesso.'), 'flash de cadastro não aparece');
});

check('CPF duplicado retorna erro sem perder dados do formulário', 8, async () => {
  const response = await req('POST', '/motoristas', {
    body: form({ nome: `${nomeMotorista} duplicado`, cpf }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(response.status === 409, `status recebido: ${response.status}`);
  assert(response.text.includes('já existe um motorista cadastrado'), 'erro de CPF duplicado ausente');
  assert(response.text.includes(`${nomeMotorista} duplicado`), 'nome digitado não foi preservado');
});

check('Atribuição PATCH registra motorista e mostra flash', 10, async () => {
  const created = await req('POST', '/entregas', {
    body: form({ descricao: `${descricao} atribuição`, origem: 'Maceió', destino: 'Penedo' }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const location = created.headers.get('location');
  assert(location, 'criação não redirecionou');
  const driverResponse = await req('POST', '/motoristas', {
    body: form({ nome: `${nomeMotorista} atribuição`, cpf: `${Number(cpf) + 1}`.padStart(11, '0') }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(driverResponse.status >= 300 && driverResponse.status < 400, 'cadastro do motorista não redirecionou');
  const currentDrivers = await req('GET', '/motoristas');
  assert(currentDrivers.text.includes(`${nomeMotorista} atribuição`), 'motorista criado não aparece na listagem');
  const assignmentPage = await req('GET', location);
  const driverId = assignmentPage.text.match(new RegExp(`<option value="(\\d+)"[^>]*>${nomeMotorista} atribuição</option>`));
  assert(driverId, 'motorista ativo não aparece no seletor de atribuição');
  const assign = await req('POST', `${location}/atribuir?_method=PATCH`, {
    body: form({ motoristaId: driverId[1] }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(assign.status >= 300 && assign.status < 400, `atribuição retornou ${assign.status}`);
  const detail = await req('GET', location);
  assert(detail.text.includes('Motorista atribuído com sucesso.'), 'flash da atribuição não aparece');
  assert(detail.text.includes(`Motorista ${driverId[1]} atribuído`), 'evento de atribuição ausente');
});

check('Entrega inexistente retorna página HTML 404', 14, async () => {
  const response = await req('GET', '/entregas/999999999');
  assert(response.status === 404, `status recebido: ${response.status}`);
  assert(response.headers.get('content-type')?.includes('text/html'), 'resposta não é HTML');
  assert(response.text.includes('Entrega não encontrada'), 'página 404 não apresenta mensagem');
  assert(!response.text.trimStart().startsWith('{'), 'resposta parece JSON');
});

async function main() {
  try {
    await fetch(`${BASE}/api/health`);
  } catch {
    console.error(`Servidor não respondeu em ${BASE}`);
    process.exit(1);
  }

  let score = 0;
  const total = checks.reduce((sum, item) => sum + item.pontos, 0);
  let failed = false;
  console.log(`\nAutograder — Delivery Tracker SSR · ${BASE}\n`);

  for (const item of checks) {
    try {
      await item.fn();
      score += item.pontos;
      console.log(`✓ [${item.pontos}/${item.pontos}] ${item.nome}`);
    } catch (error) {
      failed = true;
      console.log(`✗ [0/${item.pontos}] ${item.nome}\n    ↳ ${error.message}`);
    }
  }

  console.log(`\nNOTA: ${score}/${total}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('node:fs');
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Autograder — Delivery Tracker SSR · ${score}/${total}\n`
    );
  }
  if (failed) process.exit(1);
}

main();
