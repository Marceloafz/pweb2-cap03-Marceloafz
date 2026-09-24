export class EntregasController {
  constructor(entregasService) {
    this.service = entregasService;


    this.listar = this.listar.bind(this);
    this.buscarPorId = this.buscarPorId.bind(this);
    this.historico = this.historico.bind(this);
    this.criar = this.criar.bind(this);
    this.avancar = this.avancar.bind(this);
    this.cancelar = this.cancelar.bind(this);
  }

  listar(req, res) {
    const { status } = req.query;
    const entregas = this.service.listar(status);
    res.status(200).json(entregas);
  }

  buscarPorId(req, res) {
    try {
      const entrega = this.service.buscarPorId(Number(req.params.id));
      res.status(200).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  historico(req, res) {
    try {
      const eventos = this.service.buscarHistorico(Number(req.params.id));
      res.status(200).json(eventos);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  criar(req, res) {
    try {
      const entrega = this.service.criar(req.body || {});
      res.status(201).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  avancar(req, res) {
    try {
      const entrega = this.service.avancar(Number(req.params.id));
      res.status(200).json(entrega);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  cancelar(req, res) {
    try {
      const entrega = this.service.cancelar(Number(req.params.id));
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
