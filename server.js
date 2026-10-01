import express from 'express';
import apiRoutes from './src/routes/index.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.text({ type: '*/*' }));

app.get('/', (req, res) => {
  res.status(200).send('Olá, Mundo!');
});

app.get('/sobre', (req, res) => {
  res.type('html').status(200).send('<h1>Sobre</h1>');
});

app.get('/saudacao/:nome', (req, res) => {
  res.status(200).send(`Olá, ${req.params.nome}!`);
});

app.post('/echo', (req, res) => {
  const corpo = typeof req.body === 'string' ? req.body : '';
  res.status(200).send(corpo);
});

app.put('/itens/:id', (req, res) => {
  res.status(200).send(`Item ${req.params.id} atualizado`);
});

app.delete('/itens/:id', (req, res) => {
  res.status(204).end();
});

app.patch('/config', (req, res) => {
  res.status(200).send('Configuração atualizada');
});

app.head('/status', (req, res) => {
  res.set('X-Status', 'ok');
  res.status(200).end();
});

app.get('/agente', (req, res) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  if (userAgent.includes('curl')) {
    return res.status(200).send('Você é o cURL');
  }

  if (userAgent.includes('chrome') || userAgent.includes('mozilla')) {
    return res.status(200).send('Você é um navegador');
  }

  return res.status(200).send('Agente desconhecido');
});

app.get('/secreto', (req, res) => {
  const senha = req.headers['x-senha'];
  if (senha === '1234') {
    return res.status(200).send('Acesso liberado');
  }
  return res.status(401).end();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).end();
});

app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'corpo da requisição não é um JSON válido' });
  }
  return next(erro);
});

export function startServer() {
  return app.listen(PORT, () => {
    console.log(`Servidor em http://localhost:${PORT}`);
  });
}

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}
