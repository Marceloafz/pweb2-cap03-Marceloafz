const TABELA = 'entregas';

export class EntregasRepository {
  constructor(database) {
    this.database = database;
  }

  listarTodas() {
    return this.database.todos(TABELA);
  }

  buscarPorId(id) {
    return this.database.buscarPorId(TABELA, id);
  }

  buscarAtivaPorChave(descricao, origem, destino) {
    return this.database
      .todos(TABELA)
      .find(
        (entrega) =>
          entrega.descricao === descricao &&
          entrega.origem === origem &&
          entrega.destino === destino &&
          entrega.status !== 'ENTREGUE' &&
          entrega.status !== 'CANCELADA'
      );
  }

  criar(dadosSemId) {
    return this.database.inserir(TABELA, dadosSemId);
  }

  atualizar(id, novosDados) {
    return this.database.atualizar(TABELA, id, novosDados);
  }
}
