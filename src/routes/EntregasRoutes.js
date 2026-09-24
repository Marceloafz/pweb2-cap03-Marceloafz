import { Router } from 'express';
import { Database } from '../database/Database.js';
import { EntregasRepository } from '../repositories/EntregasRepository.js';
import { EntregasService } from '../services/EntregasService.js';
import { EntregasController } from '../controllers/EntregasController.js';

const database = new Database();
const entregasRepository = new EntregasRepository(database);
const entregasService = new EntregasService(entregasRepository);
const entregasController = new EntregasController(entregasService);

const router = Router();

router.post('/entregas', entregasController.criar);
router.get('/entregas', entregasController.listar);
router.get('/entregas/:id', entregasController.buscarPorId);
router.get('/entregas/:id/historico', entregasController.historico);
router.patch('/entregas/:id/avancar', entregasController.avancar);
router.patch('/entregas/:id/cancelar', entregasController.cancelar);

export default router;
