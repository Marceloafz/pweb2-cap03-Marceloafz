import { Router } from 'express';
import { Database } from '../database/Database.js';
import { EntregasRepository } from '../repositories/EntregasRepository.js';
import { MotoristasRepository } from '../repositories/MotoristasRepository.js';
import { EntregasService } from '../services/EntregasService.js';
import { MotoristasService } from '../services/MotoristasService.js';
import { EntregasController } from '../controllers/EntregasController.js';
import { MotoristasController } from '../controllers/MotoristasController.js';


const database = new Database();


const entregasRepository = new EntregasRepository(database);
const motoristasRepository = new MotoristasRepository(database);


const entregasService = new EntregasService(entregasRepository, motoristasRepository);
const motoristasService = new MotoristasService(motoristasRepository, entregasRepository);

const entregasController = new EntregasController(entregasService);
const motoristasController = new MotoristasController(motoristasService);

const router = Router();

router.post('/entregas', entregasController.criar);
router.get('/entregas', entregasController.listar);
router.get('/entregas/:id', entregasController.buscarPorId);
router.get('/entregas/:id/historico', entregasController.historico);
router.patch('/entregas/:id/avancar', entregasController.avancar);
router.patch('/entregas/:id/cancelar', entregasController.cancelar);
router.patch('/entregas/:id/atribuir', entregasController.atribuir);

router.post('/motoristas', motoristasController.criar);
router.get('/motoristas', motoristasController.listar);
router.get('/motoristas/:id', motoristasController.buscarPorId);
router.get('/motoristas/:id/entregas', motoristasController.entregas);

export default router;
