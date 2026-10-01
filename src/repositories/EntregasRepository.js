import { IEntregasRepository } from './contracts/IEntregasRepository.js';

const TABELA = 'entregas';

export class EntregasRepository extends IEntregasRepository {
  constructor(database) {
    super();
    this.database = database;
  }

  listarTodos(filtros = {}) {
    const todas = this.database.todos(TABELA);
    const chaves = Object.keys(filtros).filter((chave) => filtros[chave] !== undefined);
    if (chaves.length === 0) return todas;
    return todas.filter((entrega) =>
      chaves.every((chave) => entrega[chave] === filtros[chave])
    );
  }

  buscarPorId(id) {
    return this.database.buscarPorId(TABELA, id) ?? null;
  }

  criar(dadosSemId) {
    return this.database.inserir(TABELA, dadosSemId);
  }

  atualizar(id, novosDados) {
    return this.database.atualizar(TABELA, id, novosDados);
  }
}
