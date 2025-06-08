const bd = require('../bd/bd_utils.js');
const modelo = require('../modelo.js');

beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  // limpa dados de todas as tabelas
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
});

test('Testando banco de dados vazio', () => {
  expect(modelo.listar_perguntas().length).toBe(0);
});

test('Testando cadastro de três perguntas', () => {
  modelo.cadastrar_pergunta('1 + 1 = ?');
  modelo.cadastrar_pergunta('2 + 2 = ?');
  modelo.cadastrar_pergunta('3 + 3 = ?');
  const perguntas = modelo.listar_perguntas(); 
  expect(perguntas.length).toBe(3);
  expect(perguntas[0].texto).toBe('1 + 1 = ?');
  expect(perguntas[1].texto).toBe('2 + 2 = ?');
  expect(perguntas[2].num_respostas).toBe(0);
  expect(perguntas[1].id_pergunta).toBe(perguntas[2].id_pergunta-1);
});

test('Testando cadastro de perguntas sobre tópicos de Engenharia de Software', () => {
  modelo.cadastrar_pergunta('Qual a diferença entre Scrum e Kanban?');
  modelo.cadastrar_pergunta('Como aplicar Design Patterns em JavaScript?');
  modelo.cadastrar_pergunta('Melhores práticas para CI/CD em projetos Node.js?');
  
  const perguntas = modelo.listar_perguntas(); 
  expect(perguntas.length).toBe(3);
  expect(perguntas[0].texto).toBe('Qual a diferença entre Scrum e Kanban?');
  expect(perguntas[1].texto).toBe('Como aplicar Design Patterns em JavaScript?');
  expect(perguntas[2].num_respostas).toBe(0);
  expect(perguntas[1].id_pergunta).toBe(perguntas[2].id_pergunta - 1);
});

test('Testando cadastro de resposta e contagem de respostas em uma pergunta', () => {
  const id_pergunta_agile = modelo.cadastrar_pergunta('Qual metodologia ágil escolher para um projeto pequeno?');
  modelo.cadastrar_resposta(id_pergunta_agile, 'Para projetos pequenos, Scrum pode ser um overkill. Kanban pode ser mais leve.');
  modelo.cadastrar_resposta(id_pergunta_agile, 'Depende do nível de incerteza do projeto e da necessidade de planejamento iterativo.'); 

  const perguntas = modelo.listar_perguntas();
  expect(perguntas.find(p => p.id_pergunta === id_pergunta_agile).num_respostas).toBe(2);
});

test('Testando busca de uma pergunta específica por ID', () => {
  const id_pergunta_refatoracao = modelo.cadastrar_pergunta('Refatoração é sempre necessária?');
  modelo.cadastrar_pergunta('O que é Clean Code?'); 

  const pergunta_encontrada = modelo.get_pergunta(id_pergunta_refatoracao);
  expect(pergunta_encontrada).not.toBeNull();
  expect(pergunta_encontrada.id_pergunta).toBe(id_pergunta_refatoracao);
  expect(pergunta_encontrada.texto).toBe('Refatoração é sempre necessária?');
  expect(modelo.get_pergunta(999)).toBeUndefined();
});

test('Testando listagem de respostas para uma pergunta específica', () => {
  const id_pergunta_design = modelo.cadastrar_pergunta('Quais os princípios SOLID?');
  modelo.cadastrar_resposta(id_pergunta_design, 'S - Single Responsibility Principle');
  modelo.cadastrar_resposta(id_pergunta_design, 'O - Open/Closed Principle');
  modelo.cadastrar_resposta(id_pergunta_design, 'L - Liskov Substitution Principle');

  const id_outra_pergunta = modelo.cadastrar_pergunta('Melhores frameworks front-end?');
  modelo.cadastrar_resposta(id_outra_pergunta, 'React é popular.');

  const respostas_design = modelo.get_respostas(id_pergunta_design);
  expect(respostas_design.length).toBe(3);
  expect(respostas_design[0].texto).toBe('S - Single Responsibility Principle');
  expect(respostas_design[2].texto).toBe('L - Liskov Substitution Principle');
  expect(respostas_design[0].id_pergunta).toBe(id_pergunta_design);

  const id_pergunta_sem_respostas = modelo.cadastrar_pergunta('Qual a importância de testes automatizados?');
  const respostas_vazias = modelo.get_respostas(id_pergunta_sem_respostas);
  expect(respostas_vazias.length).toBe(0);
});

test('Verificando o incremento do ID ao cadastrar novas perguntas', () => {
  const id1 = modelo.cadastrar_pergunta('O que é Microsserviços?');
  const id2 = modelo.cadastrar_pergunta('Quando usar SQL vs NoSQL?');
  expect(id2).toBe(id1 + 1); 
});

test('Verificando o incremento do ID ao cadastrar novas respostas', () => {
  const id_pergunta_clean = modelo.cadastrar_pergunta('Como manter um código limpo?');
  const id_resposta1 = modelo.cadastrar_resposta(id_pergunta_clean, 'Foque em legibilidade e clareza.');
  const id_resposta2 = modelo.cadastrar_resposta(id_pergunta_clean, 'Siga convenções de codificação.');
  expect(id_resposta2).toBe(id_resposta1 + 1); 
});