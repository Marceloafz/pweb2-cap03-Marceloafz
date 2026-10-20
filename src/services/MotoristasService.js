import { RegraNegocioError } from '../utils/RegraNegocioError.js';

export class MotoristasService {
  constructor(motoristasRepository, entregasRepository) {
    this.repository = motoristasRepository;
    this.entregasRepository = entregasRepository;
  }

  listar() {
    return this.repository.listarTodos();
  }

  async buscarPorId(id) {
    const motorista = await this.repository.buscarPorId(id);
    if (!motorista) {
      throw new RegraNegocioError(404, 'motorista não encontrado');
    }
    return motorista;
  }

  async criar({ nome, cpf, placaVeiculo }) {
    if (!nome || !cpf) {
      throw new RegraNegocioError(400, 'nome e cpf são obrigatórios');
    }

    const existente = await this.repository.buscarPorCpf(cpf);
    if (existente) {
      throw new RegraNegocioError(409, `já existe um motorista cadastrado com o CPF ${cpf}`);
    }

    return this.repository.criar({
      nome,
      cpf,
      placaVeiculo: placaVeiculo ?? null,
      status: 'ATIVO',
    });
  }

  async entregasDoMotorista(id, status) {
    await this.buscarPorId(id);

    const filtros = { motoristaId: id };
    if (status) filtros.status = status;

    return this.entregasRepository.listarTodos(filtros);
  }
}
