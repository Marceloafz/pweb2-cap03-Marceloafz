export class MotoristasController {
  constructor(motoristasService) {
    this.service = motoristasService;

    this.criar = this.criar.bind(this);
    this.listar = this.listar.bind(this);
    this.buscarPorId = this.buscarPorId.bind(this);
    this.entregas = this.entregas.bind(this);
  }

  async criar(req, res) {
    try {
      const motorista = await this.service.criar(req.body || {});
      res.status(201).json(motorista);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async listar(req, res) {
    try {
      res.status(200).json(await this.service.listar());
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async buscarPorId(req, res) {
    try {
      const motorista = await this.service.buscarPorId(Number(req.params.id));
      res.status(200).json(motorista);
    } catch (erro) {
      this._responderErro(res, erro);
    }
  }

  async entregas(req, res) {
    try {
      const { status } = req.query;
      const entregas = await this.service.entregasDoMotorista(Number(req.params.id), status);
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
