export class EntregasController {
  constructor(entregasService) {
    this.service = entregasService;

    this.listar = this.listar.bind(this);
    this.buscarPorId = this.buscarPorId.bind(this);
    this.historico = this.historico.bind(this);
    this.criar = this.criar.bind(this);
    this.avancar = this.avancar.bind(this);
    this.cancelar = this.cancelar.bind(this);
    this.atribuir = this.atribuir.bind(this);
  }

  async listar(req, res) {
    const { status } = req.query;
    const filtros = status ? { status } : {};
    try {
      const entregas = await this.service.listar(filtros);
      res.status(200).json(entregas);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async buscarPorId(req, res) {
    try {
      const entrega = await this.service.buscarPorId(Number(req.params.id));
      res.status(200).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async historico(req, res) {
    try {
      const eventos = await this.service.buscarHistorico(Number(req.params.id));
      res.status(200).json(eventos);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async criar(req, res) {
    try {
      const entrega = await this.service.criar(req.body || {});
      res.status(201).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async avancar(req, res) {
    try {
      const entrega = await this.service.avancar(Number(req.params.id));
      res.status(200).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async cancelar(req, res) {
    try {
      const entrega = await this.service.cancelar(Number(req.params.id));
      res.status(200).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async atribuir(req, res) {
    try {
      const motoristaId = Number(req.body?.motoristaId);
      const entrega = await this.service.atribuir(Number(req.params.id), motoristaId);
      res.status(200).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  _responderErro(res, erro) {
    const status = erro.status || 500;
    res.status(status).json({ erro: erro.message || 'erro interno' });
  }
}
