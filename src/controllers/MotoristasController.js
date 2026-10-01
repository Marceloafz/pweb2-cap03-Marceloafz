export class MotoristasController {
  constructor(motoristasService) {
    this.service = motoristasService;

    this.criar = this.criar.bind(this);
    this.listar = this.listar.bind(this);
    this.buscarPorId = this.buscarPorId.bind(this);
    this.entregas = this.entregas.bind(this);
  }

  criar(req, res) {
    try {
      const motorista = this.service.criar(req.body || {});
      res.status(201).json(motorista);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  listar(req, res) {
    res.status(200).json(this.service.listar());
  }

  buscarPorId(req, res) {
    try {
      const motorista = this.service.buscarPorId(Number(req.params.id));
      res.status(200).json(motorista);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  entregas(req, res) {
    try {
      const { status } = req.query;
      const entregas = this.service.entregasDoMotorista(Number(req.params.id), status);
      res.status(200).json(entregas);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  _responderErro(res, erro) {
    const status = erro.status || 500;
    res.status(status).json({ erro: erro.message || 'erro interno' });
  }
}
