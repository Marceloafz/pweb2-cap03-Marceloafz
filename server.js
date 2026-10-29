import express from 'express';
import layouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('layout', 'layouts/base');
app.use(layouts);
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'delivery-tracker-development-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error'),
  };
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/', routes);

app.use((req, res) => {
  res.status(404).render('errors/error', {
    title: 'Página não encontrada',
    status: 404,
    message: 'A página que você procura não existe.',
  });
});

app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);
  console.error(erro);
  res.status(500).render('errors/error', {
    title: 'Erro interno',
    status: 500,
    message: 'Não foi possível concluir a solicitação. Tente novamente.',
  });
});

export function startServer() {
  return app.listen(PORT, () => {
    console.log(`Servidor em http://localhost:${PORT}`);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}

export default app;
