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


  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Rota não encontrada');
});

server.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
