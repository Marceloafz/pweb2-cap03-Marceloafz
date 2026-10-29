import { validationResult } from 'express-validator';

export class MotoristasController {
  constructor(motoristasService) {
    this.service = motoristasService;

    this.listar = this.listar.bind(this);
    this.novo = this.novo.bind(this);
    this.criar = this.criar.bind(this);
  }

  async listar(req, res, next) {
    try {
      const motoristas = await this.service.listar();
      res.render('motoristas/index', {
        title: 'Motoristas',
        motoristas,
      });
    } catch (erro) {
      next(erro);
    }
  }

  novo(req, res) {
    res.render('motoristas/novo', {
      title: 'Novo motorista',
      motorista: {},
      errors: [],
    });
  }

  async criar(req, res, next) {
    const errors = validationResult(req).array().map((erro) => erro.msg);
    if (errors.length) {
      return res.status(400).render('motoristas/novo', {
        title: 'Novo motorista',
        motorista: req.body,
        errors,
      });
    }

    try {
      await this.service.criar(req.body);
      req.flash('success', 'Motorista cadastrado com sucesso.');
      res.redirect('/motoristas');
    } catch (erro) {
      if (erro.status >= 400 && erro.status < 500) {
        return res.status(erro.status).render('motoristas/novo', {
          title: 'Novo motorista',
          motorista: req.body,
          errors: [erro.message],
        });
      }
      next(erro);
    }
  }
}
