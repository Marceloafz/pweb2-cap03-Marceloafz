export class Database {
  constructor() {
    this.tabelas = {
      entregas: [],
    };
    this._proximoId = {
      entregas: 1,
    };
  }

  todos(tabela) {
    return this.tabelas[tabela];
  }

  buscarPorId(tabela, id) {
    return this.tabelas[tabela].find((registro) => registro.id === id);
  }

  inserir(tabela, dadosSemId) {
    const id = this._proximoId[tabela]++;
    const registro = { id, ...dadosSemId };
    this.tabelas[tabela].push(registro);
    return registro;
  }

  atualizar(tabela, id, novosDados) {
    const registro = this.buscarPorId(tabela, id);
    if (!registro) return null;
    Object.assign(registro, novosDados);
    return registro;
  }
}
