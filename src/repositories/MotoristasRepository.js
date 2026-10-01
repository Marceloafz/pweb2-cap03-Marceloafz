import { IMotoristasRepository } from './contracts/IMotoristasRepository.js';

const TABELA = 'motoristas';

export class MotoristasRepository extends IMotoristasRepository {
  constructor(database) {
    super();
    this.database = database;
  }

  listarTodos() {
    return this.database.todos(TABELA);
  }

  buscarPorId(id) {
    return this.database.buscarPorId(TABELA, id) ?? null;
  }

  buscarPorCpf(cpf) {
    return this.database.todos(TABELA).find((motorista) => motorista.cpf === cpf) ?? null;
  }

  criar(dadosSemId) {
    return this.database.inserir(TABELA, dadosSemId);
  }
}
