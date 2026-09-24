import http from 'node:http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const { method, url, headers } = req;
  const partes = url.split('/').filter(Boolean);

  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Olá, Mundo!');
  }

if (method === 'GET' && url === '/sobre') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<h1>Sobre</h1><p>Servidor feito com node:http.</p>');
  }

  if (method === 'GET' && partes[0] === 'saudacao' && partes.length === 2) {
    const nome = partes[1];
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`Olá, ${nome}!`);
  }

  if (method === 'POST' && url === '/echo') {
    let corpo = '';
    req.on('data', (parte) => (corpo += parte));
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(corpo);
    });
    return;
  }

  if (method === 'PUT' && partes[0] === 'itens' && partes.length === 2) {
    const id = partes[1];
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`Item ${id} atualizado`);
  }

  if (method === 'DELETE' && partes[0] === 'itens' && partes.length === 2) {
    res.writeHead(204);
    return res.end();
  }

  if (method === 'PATCH' && url === '/config') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Configuração atualizada');
  }

  if (method === 'HEAD' && url === '/status') {
    res.writeHead(200, { 'X-Status': 'ok' });
    return res.end();
  }

   if (method === 'GET' && url === '/agente') {
    const agente = (headers['user-agent'] || '').toLowerCase();
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    if (agente.includes('curl')) return res.end('Você é o cURL');
    if (agente.includes('chrome')) return res.end('Você é um navegador');
    return res.end('Agente desconhecido');
  }

  if (method === 'GET' && url === '/secreto') {
    const senha = headers['x-senha'];
    if (senha === '1234') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Acesso liberado');
    }
    res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não autorizado');
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Rota não encontrada');
});

server.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
