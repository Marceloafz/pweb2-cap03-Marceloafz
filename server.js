import express from 'express';
import apiRoutes from './src/routes/index.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRoutes);

app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'corpo da requisição não é um JSON válido' });
  }
  return next(erro);
});

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});
