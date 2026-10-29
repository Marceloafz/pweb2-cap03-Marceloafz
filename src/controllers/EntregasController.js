import { validationResult } from 'express-validator';

export class EntregasController {
  constructor(entregasService, motoristasService) {
    this.service = entregasService;
    this.motoristasService = motoristasService;

    this.listar = this.listar.bind(this);
    this.nova = this.nova.bind(this);
    this.buscarPorId = this.buscarPorId.bind(this);
    this.criar = this.criar.bind(this);
    this.avancar = this.avancar.bind(this);
    this.cancelar = this.cancelar.bind(this);
    this.atribuir = this.atribuir.bind(this);
  }

  async listar(req, res, next) {
    try {
      const { status } = req.query;
      const entregas = await this.service.listar(status ? { status } : {});
      res.render('entregas/index', {
        title: 'Entregas',
        entregas,
        statusSelecionado: status || '',
      });
    } catch (erro) {
      next(erro);
    }
  }

  nova(req, res) {
    res.render('entregas/nova', {
      title: 'Nova entrega',
      entrega: {},
      errors: [],
    });
  }

  async buscarPorId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return this._renderErro(res, 404, 'Entrega não encontrada.');
    }

    try {
      const [entrega, motoristas] = await Promise.all([
        this.service.buscarPorId(id),
        this.motoristasService.listar(),
      ]);
      res.render('entregas/detalhe', {
        title: `Entrega #${entrega.id}`,
        entrega,
        motoristas,
      });
    } catch (erro) {
      if (erro.status === 404) {
        return this._renderErro(res, 404, erro.message);
      }
      next(erro);
    }
  }

  async criar(req, res, next) {
    const errors = validationResult(req).array().map((erro) => erro.msg);
    if (errors.length) {
      return res.status(400).render('entregas/nova', {
        title: 'Nova entrega',
        entrega: req.body,
        errors,
      });
    }

    try {
      const entrega = await this.service.criar(req.body);
      req.flash('success', 'Entrega criada com sucesso.');
      res.redirect(`/entregas/${entrega.id}`);
    } catch (erro) {
      if (erro.status >= 400 && erro.status < 500) {
        return res.status(erro.status).render('entregas/nova', {
          title: 'Nova entrega',
          entrega: req.body,
          errors: [erro.message],
        });
      }
      next(erro);
    }
  }

  async avancar(req, res, next) {
    await this._executarAcao(req, res, next, () => this.service.avancar(Number(req.params.id)), 'Status da entrega atualizado.');
  }

  async cancelar(req, res, next) {
    await this._executarAcao(req, res, next, () => this.service.cancelar(Number(req.params.id)), 'Entrega cancelada.');
  }

  async atribuir(req, res, next) {
    const motoristaId = req.body.motoristaId;
    if (!motoristaId || !/^\d+$/.test(motoristaId)) {
      req.flash('error', 'Selecione um motorista válido.');
      return res.redirect(`/entregas/${req.params.id}`);
    }
    await this._executarAcao(
      req,
      res,
      next,
      () => this.service.atribuir(Number(req.params.id), Number(motoristaId)),
      'Motorista atribuído com sucesso.'
    );
  }

  async _executarAcao(req, res, next, acao, mensagem) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return this._renderErro(res, 404, 'Entrega não encontrada.');
    }

    try {
      const entrega = await acao();
      req.flash('success', mensagem);
      res.redirect(`/entregas/${entrega.id}`);
    } catch (erro) {
      if (erro.status === 404) {
        return this._renderErro(res, 404, erro.message);
      }
      if (erro.status >= 400 && erro.status < 500) {
        req.flash('error', erro.message);
        return res.redirect(`/entregas/${req.params.id}`);
      }
      next(erro);
    }
  }

  _renderErro(res, status, message) {
    return res.status(status).render('errors/error', {
      title: status === 404 ? 'Entrega não encontrada' : 'Erro',
      status,
      message,
    });
  }
}
