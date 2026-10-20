import { RegraNegocioError } from '../utils/RegraNegocioError.js';

const PROXIMO_STATUS = {
  CRIADA: 'EM_TRANSITO',
  EM_TRANSITO: 'ENTREGUE',
};

function agoraISO() {
  return new Date().toISOString();
}

export class EntregasService {
  constructor(entregasRepository, motoristasRepository) {
    this.repository = entregasRepository;
    this.motoristasRepository = motoristasRepository;
  }

  async listar(filtros = {}) {
    return this.repository.listarTodos(filtros);
  }

  async buscarPorId(id) {
    const entrega = await this.repository.buscarPorId(id);
    if (!entrega) {
      throw new RegraNegocioError(404, 'entrega não encontrada');
    }
    return entrega;
  }

  async buscarHistorico(id) {
    return (await this.buscarPorId(id)).historico;
  }

  async criar({ descricao, origem, destino }) {
    if (!descricao || !origem || !destino) {
      throw new RegraNegocioError(
        400,
        'descricao, origem e destino são obrigatórios'
      );
    }

    if (origem === destino) {
      throw new RegraNegocioError(400, 'origem e destino não podem ser iguais');
    }

    const candidatas = await this.repository.listarTodos({ descricao, origem, destino });
    const duplicata = candidatas.find(
      (entrega) => entrega.status !== 'ENTREGUE' && entrega.status !== 'CANCELADA'
    );
    if (duplicata) {
      throw new RegraNegocioError(
        409,
        'já existe uma entrega ativa com a mesma descrição, origem e destino'
      );
    }

    return this.repository.criar({
      descricao,
      origem,
      destino,
      status: 'CRIADA',
      motoristaId: null,
      historico: [{ data: agoraISO(), descricao: 'Entrega criada' }],
    });
  }

  async avancar(id) {
    const entrega = await this.buscarPorId(id);

    const proximo = PROXIMO_STATUS[entrega.status];
    if (!proximo) {
      throw new RegraNegocioError(
        422,
        `não é possível avançar uma entrega com status ${entrega.status}`
      );
    }

    const historico = [
      ...entrega.historico,
      { data: agoraISO(), descricao: `Status alterado para ${proximo}` },
    ];

    return this.repository.atualizar(id, { status: proximo, historico });
  }

  async cancelar(id) {
    const entrega = await this.buscarPorId(id);

    if (entrega.status === 'ENTREGUE' || entrega.status === 'CANCELADA') {
      throw new RegraNegocioError(
        422,
        `não é possível cancelar uma entrega ${entrega.status}`
      );
    }

    const historico = [
      ...entrega.historico,
      { data: agoraISO(), descricao: 'Entrega cancelada' },
    ];

    return this.repository.atualizar(id, {
      status: 'CANCELADA',
      historico,
    });
  }

  async atribuir(id, motoristaId) {
    const entrega = await this.buscarPorId(id);
    const motoristaIdNumerico = Number(motoristaId);

    if (!Number.isInteger(motoristaIdNumerico)) {
      throw new RegraNegocioError(400, 'motoristaId é obrigatório');
    }

    if (entrega.status !== 'CRIADA') {
      throw new RegraNegocioError(
        422,
        `só é possível atribuir motorista a uma entrega CRIADA (status atual: ${entrega.status})`
      );
    }

    const motorista = await this.motoristasRepository.buscarPorId(motoristaIdNumerico);
    if (!motorista) {
      throw new RegraNegocioError(404, 'motorista não encontrado');
    }
    if (motorista.status !== 'ATIVO') {
      throw new RegraNegocioError(422, 'só é possível atribuir um motorista ATIVO');
    }

    const historico = [
      ...entrega.historico,
      { data: agoraISO(), descricao: `Motorista ${motoristaIdNumerico} atribuído` },
    ];

    return this.repository.atualizar(id, { motoristaId: motoristaIdNumerico, historico });
  }
}
