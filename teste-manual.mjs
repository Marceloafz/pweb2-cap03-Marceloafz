import { Database } from './src/database/Database.js';
import { EntregasRepository } from './src/repositories/EntregasRepository.js';
import { MotoristasRepository } from './src/repositories/MotoristasRepository.js';
import { EntregasService } from './src/services/EntregasService.js';
import { MotoristasService } from './src/services/MotoristasService.js';

let falhas = 0;
const assert = (cond, msg) => {
  if (!cond) {
    falhas++;
    console.log(`✗ ${msg}`);
  } else {
    console.log(`✓ ${msg}`);
  }
};

console.log('--- Parte 1: comportamento (Entregas + Motoristas) ---\n');

const database = new Database();
const entregasRepo = new EntregasRepository(database);
const motoristasRepo = new MotoristasRepository(database);
const entregasService = new EntregasService(entregasRepo, motoristasRepo);
const motoristasService = new MotoristasService(motoristasRepo, entregasRepo);


const m1 = motoristasService.criar({ nome: 'João', cpf: '111.111.111-11' });
assert(m1.status === 'ATIVO', 'motorista criado começa ATIVO');
assert(m1.id === 1, 'primeiro motorista recebe id 1');

try {
  motoristasService.criar({ nome: 'Outro João', cpf: '111.111.111-11' });
  assert(false, 'CPF duplicado deveria lançar erro');
} catch (erro) {
  assert(erro.status === 409, 'CPF duplicado lança status 409');
}

try {
  motoristasService.criar({ nome: '', cpf: '' });
  assert(false, 'campos vazios deveriam lançar erro');
} catch (erro) {
  assert(erro.status === 400, 'nome/cpf vazios lançam status 400');
}

const motoristaInativo = motoristasRepo.criar({
  nome: 'Carlos',
  cpf: '222.222.222-22',
  placaVeiculo: null,
  status: 'INATIVO', 
});
assert(motoristaInativo.status === 'INATIVO', 'motorista de teste criado como INATIVO');


const e1 = entregasService.criar({ descricao: 'Notebook', origem: 'Maceió', destino: 'Recife' });
assert(e1.motoristaId === null, 'entrega criada sem motorista');

try {
  entregasService.atribuir(e1.id, 999);
  assert(false, 'atribuir motorista inexistente deveria lançar erro');
} catch (erro) {
  assert(erro.status === 404, 'motorista inexistente lança status 404');
}

try {
  entregasService.atribuir(e1.id, motoristaInativo.id);
  assert(false, 'atribuir motorista INATIVO deveria lançar erro');
} catch (erro) {
  assert(erro.status === 422, 'motorista INATIVO lança status 422');
}

const e1Atribuida = entregasService.atribuir(e1.id, m1.id);
assert(e1Atribuida.motoristaId === m1.id, 'atribuir() preenche motoristaId');
assert(
  e1Atribuida.historico.at(-1).descricao.includes(String(m1.id)),
  'atribuir() registra evento no histórico'
);

entregasService.avancar(e1.id); 

const e2 = entregasService.criar({ descricao: 'Celular', origem: 'Maceió', destino: 'Aracaju' });
try {
  entregasService.atribuir(e2.id, m1.id);
} catch {
  assert(false, 'atribuir a uma entrega CRIADA deveria funcionar');
}
try {
  entregasService.atribuir(e1.id, m1.id); 
  assert(false, 'atribuir a uma entrega não-CRIADA deveria lançar erro');
} catch (erro) {
  assert(erro.status === 422, 'atribuir a entrega não-CRIADA lança status 422');
}


const entregasDeM1 = motoristasService.entregasDoMotorista(m1.id);
assert(entregasDeM1.length === 2, 'motorista m1 tem 2 entregas atribuídas (e1 e e2)');

const entregasDeM1Criadas = motoristasService.entregasDoMotorista(m1.id, 'CRIADA');
assert(entregasDeM1Criadas.length === 1 && entregasDeM1Criadas[0].id === e2.id,
  'filtro combinado motoristaId+status funciona (só e2 está CRIADA)');

try {
  motoristasService.entregasDoMotorista(999);
  assert(false, 'motorista inexistente deveria lançar 404 em entregasDoMotorista');
} catch (erro) {
  assert(erro.status === 404, 'entregasDoMotorista com id inexistente lança 404');
}

console.log('\n--- Parte 2: EntregasService funciona com um Mock (prova da DI) ---\n');



function criarMockEntregasRepository() {
  let registros = [];
  let proximoId = 1;
  return {
    listarTodos(filtros = {}) {
      const chaves = Object.keys(filtros).filter((k) => filtros[k] !== undefined);
      return registros.filter((r) => chaves.every((k) => r[k] === filtros[k]));
    },
    buscarPorId(id) {
      return registros.find((r) => r.id === id) ?? null;
    },
    criar(dados) {
      const registro = { id: proximoId++, ...dados };
      registros.push(registro);
      return registro;
    },
    atualizar(id, dados) {
      const registro = registros.find((r) => r.id === id);
      if (!registro) return null;
      Object.assign(registro, dados);
      return registro;
    },
  };
}

function criarMockMotoristasRepository() {
  return {
    listarTodos: () => [],
    buscarPorId: (id) => (id === 42 ? { id: 42, nome: 'Mock', cpf: '0', status: 'ATIVO' } : null),
    buscarPorCpf: () => null,
    criar: (dados) => ({ id: 1, ...dados }),
  };
}

const servicoComMock = new EntregasService(criarMockEntregasRepository(), criarMockMotoristasRepository());
const entregaViaMock = servicoComMock.criar({ descricao: 'Peça', origem: 'A', destino: 'B' });
assert(entregaViaMock.status === 'CRIADA', 'EntregasService funciona com um Mock no lugar do repository real');

const entregaAtribuidaViaMock = servicoComMock.atribuir(entregaViaMock.id, 42);
assert(entregaAtribuidaViaMock.motoristaId === 42, 'atribuir() também funciona com os dois Mocks');

console.log(`\n${falhas === 0 ? '✅ Todas as checagens passaram' : `❌ ${falhas} checagem(ns) falharam`}`);
process.exit(falhas === 0 ? 0 : 1);
