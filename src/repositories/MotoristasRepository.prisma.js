import { IMotoristasRepository } from './contracts/IMotoristasRepository.js';
import { RegraNegocioError } from '../utils/RegraNegocioError.js';

export class MotoristasRepositoryPrisma extends IMotoristasRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  listarTodos() {
    return this.prisma.motorista.findMany();
  }

  buscarPorId(id) {
    return this.prisma.motorista.findUnique({ where: { id } });
  }

  buscarPorCpf(cpf) {
    return this.prisma.motorista.findUnique({ where: { cpf } });
  }

  async criar(dadosSemId) {
    try {
      return await this.prisma.motorista.create({ data: dadosSemId });
    } catch (erro) {
      if (erro.code === 'P2002') {
        throw new RegraNegocioError(
          409,
          `já existe um motorista cadastrado com o CPF ${dadosSemId.cpf}`
        );
      }
      throw erro;
    }
  }
}
