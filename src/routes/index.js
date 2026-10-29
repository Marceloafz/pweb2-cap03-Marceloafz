import { Router } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database.js';
import { EntregasRepositoryPrisma } from '../repositories/EntregasRepository.prisma.js';
import { MotoristasRepositoryPrisma } from '../repositories/MotoristasRepository.prisma.js';
import { EntregasService } from '../services/EntregasService.js';
import { MotoristasService } from '../services/MotoristasService.js';
import { EntregasController } from '../controllers/EntregasController.js';
import { MotoristasController } from '../controllers/MotoristasController.js';

const entregasRepository = new EntregasRepositoryPrisma(prisma);
const motoristasRepository = new MotoristasRepositoryPrisma(prisma);
const entregasService = new EntregasService(entregasRepository, motoristasRepository);
const motoristasService = new MotoristasService(motoristasRepository, entregasRepository);
const entregasController = new EntregasController(entregasService, motoristasService);
const motoristasController = new MotoristasController(motoristasService);
const router = Router();

const camposEntrega = [
  body('descricao').custom((value) => typeof value === 'string' && value.trim().length > 0)
    .withMessage('A descrição é obrigatória.'),
  body('origem').custom((value) => typeof value === 'string' && value.trim().length > 0)
    .withMessage('A origem é obrigatória.'),
  body('destino').custom((value) => typeof value === 'string' && value.trim().length > 0)
    .withMessage('O destino é obrigatório.'),
  body('destino').custom((destino, { req }) => {
    if (
      typeof req.body.origem === 'string' &&
      typeof destino === 'string' &&
      req.body.origem.trim() === destino.trim()
    ) {
      throw new Error('Origem e destino não podem ser iguais.');
    }
    return true;
  }),
];

router.get('/', (req, res) => res.redirect('/entregas'));

router.get('/entregas', entregasController.listar);
router.get('/entregas/nova', entregasController.nova);
router.post('/entregas', camposEntrega, entregasController.criar);
router.get('/entregas/:id', entregasController.buscarPorId);
router.patch('/entregas/:id/avancar', entregasController.avancar);
router.patch('/entregas/:id/cancelar', entregasController.cancelar);
router.patch('/entregas/:id/atribuir', entregasController.atribuir);

router.get('/motoristas', motoristasController.listar);
router.get('/motoristas/novo', motoristasController.novo);
router.post(
  '/motoristas',
  [
    body('nome').custom((value) => typeof value === 'string' && value.trim().length > 0)
      .withMessage('O nome é obrigatório.'),
    body('cpf').custom((value) => typeof value === 'string' && value.trim().length > 0)
      .withMessage('O CPF é obrigatório.'),
  ],
  motoristasController.criar
);

export default router;
