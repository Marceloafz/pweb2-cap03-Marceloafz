import { IEntregasRepository } from './contracts/IEntregasRepository.js';

const CAMPOS_FILTRAVEIS = new Set([
  'descricao',
  'origem',
  'destino',
  'status',
  'motoristaId',
]);

function dadosHistorico(historico) {
  return historico.map(({ data, descricao }) => ({
    data: new Date(data),
    descricao,
  }));
}

function entregaComHistorico(entrega) {
  if (!entrega) return null;
  return {
    ...entrega,
    historico: entrega.historico.map(({ data, descricao }) => ({
      data: data.toISOString(),
      descricao,
    })),
  };
}

export class EntregasRepositoryPrisma extends IEntregasRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async listarTodos(filtros = {}) {
    const chaves = Object.keys(filtros).filter((chave) => filtros[chave] !== undefined);
    if (chaves.some((chave) => !CAMPOS_FILTRAVEIS.has(chave))) return [];

    const entregas = await this.prisma.entrega.findMany({
      where: Object.fromEntries(chaves.map((chave) => [chave, filtros[chave]])),
      include: { historico: { orderBy: { id: 'asc' } } },
    });
    return entregas.map(entregaComHistorico);
  }

  async buscarPorId(id) {
    const entrega = await this.prisma.entrega.findUnique({
      where: { id },
      include: { historico: { orderBy: { id: 'asc' } } },
    });
    return entregaComHistorico(entrega);
  }

  async criar({ historico, ...dados }) {
    const entrega = await this.prisma.entrega.create({
      data: {
        ...dados,
        historico: { create: dadosHistorico(historico) },
      },
      include: { historico: { orderBy: { id: 'asc' } } },
    });
    return entregaComHistorico(entrega);
  }

  async atualizar(id, { historico, ...dados }) {
    try {
      const entrega = await this.prisma.entrega.update({
        where: { id },
        data: {
          ...dados,
          ...(historico === undefined
            ? {}
            : {
                historico: {
                  deleteMany: {},
                  create: dadosHistorico(historico),
                },
              }),
        },
        include: { historico: { orderBy: { id: 'asc' } } },
      });
      return entregaComHistorico(entrega);
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      throw erro;
    }
  }
}
