// Cadastro da landing → API ServLink.
// Envia um único JSON para /cadastro/{tipo}; a API cria usuario + perfil em transação.
import { api, ApiError } from './api.js';

// Ocupações do profissional — Classificação Brasileira de Ocupações (CBO).
// Fonte única (label visível + código persistido). O código não aparece para o usuário.
const OCUPACOES = [
  {
    grupo: 'Hotelaria (Hospedagem e Recepção)',
    itens: [
      { nome: 'Recepcionista de Hotel', cbo: '4221-20' },
      { nome: 'Auditor Noturno', cbo: '2522-05' },
      { nome: 'Concierge', cbo: '4221-30' },
      { nome: 'Mensageiro / Capitão de Porteira', cbo: '5174-05' },
    ],
  },
  {
    grupo: 'Governança e Manutenção',
    itens: [
      { nome: 'Supervisor de Andar', cbo: '5101-15' },
      { nome: 'Camareira(o)', cbo: '5133-15' },
      { nome: 'Auxiliar de Serviços Gerais', cbo: '5143-20' },
      { nome: 'Técnico de Manutenção / Oficial de Manutenção', cbo: '5143-10' },
    ],
  },
  {
    grupo: 'Cozinha (Restaurante e Hotelaria)',
    itens: [
      { nome: 'Cozinheiro Geral', cbo: '5132-05' },
      { nome: 'Auxiliar de Cozinha', cbo: '5135-05' },
      { nome: 'Steward / Lavador de Pratos', cbo: '5135-05' },
    ],
  },
  {
    grupo: 'Salão e Atendimento (Alimentos e Bebidas)',
    itens: [
      { nome: 'Garçom / Garçonete', cbo: '5134-05' },
      { nome: 'Cumim / Auxiliar de Garçom', cbo: '5134-15' },
      { nome: 'Hostess / Recepcionista de Restaurante', cbo: '4221-05' },
    ],
  },
  {
    grupo: 'Bar e Cafeteria',
    itens: [
      { nome: 'Bartender / Barman / Barmaid', cbo: '5134-20' },
      { nome: 'Auxiliar de Barman', cbo: '5134-20' },
      { nome: 'Barista', cbo: '5134-40' },
    ],
  },
];

const form = document.getElementById('signup-form');
const feedback = document.getElementById('signup-feedback');
const submitBtn = document.getElementById('signup-submit');
const ocupacaoSelect = document.getElementById('ocupacao');

// Popula o <select> de ocupação com <optgroup> por categoria (código vai em data-cbo).
function popularOcupacoes() {
  for (const { grupo, itens } of OCUPACOES) {
    const group = document.createElement('optgroup');
    group.label = grupo;
    for (const { nome, cbo } of itens) {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.dataset.cbo = cbo;
      opt.textContent = nome;
      group.appendChild(opt);
    }
    ocupacaoSelect.appendChild(group);
  }
}

// Alterna os campos visíveis conforme o tipo de conta (profissional/estabelecimento).
function toggleFields() {
  const tipo = form.querySelector('input[name="tipo"]:checked').value;
  form.querySelectorAll('[data-only]').forEach((el) => {
    el.hidden = el.dataset.only !== tipo;
  });
}

function showFeedback(message, kind) {
  feedback.textContent = message;
  feedback.className = `signup-feedback show ${kind}`;
}

// Lê um campo e devolve string aparada (ou undefined se vazio, para não enviar lixo).
function val(name) {
  const el = form.elements[name];
  if (!el) return undefined;
  const v = el.value.trim();
  return v.length ? v : undefined;
}

function buildPayload(tipo) {
  const comum = {
    email: val('email'),
    telefone: val('telefone'),
    endereco_logradouro: val('endereco_logradouro'),
    endereco_numero: val('endereco_numero'),
    bairro: val('bairro'),
    cidade: val('cidade'),
    uf: val('uf'),
    cep: val('cep'),
  };
  if (tipo === 'profissional') {
    const opt = ocupacaoSelect.selectedOptions[0];
    return {
      ...comum,
      nome_completo: val('nome_completo'),
      cpf: val('cpf'),
      data_nascimento: val('data_nascimento'),
      ocupacao: val('ocupacao'),
      ocupacao_cbo: opt && opt.value ? opt.dataset.cbo : undefined,
    };
  }
  return {
    ...comum,
    nome_fantasia: val('nome_fantasia'),
    cnpj: val('cnpj'),
    ramo: val('ramo'),
  };
}

// Validação client-side: feedback imediato antes de bater na API.
function validate(tipo, payload) {
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Informe um e-mail válido.';
  if (tipo === 'profissional') {
    if (!payload.nome_completo || payload.nome_completo.length < 3) return 'Informe o nome completo.';
    if (!payload.cpf || payload.cpf.replace(/\D/g, '').length < 11) return 'Informe um CPF válido.';
    if (!payload.data_nascimento) return 'Informe a data de nascimento.';
  } else {
    if (!payload.nome_fantasia || payload.nome_fantasia.length < 2) return 'Informe o nome fantasia.';
    if (!payload.cnpj || payload.cnpj.replace(/\D/g, '').length < 14) return 'Informe um CNPJ válido.';
    if (!payload.ramo || payload.ramo.length < 2) return 'Informe o ramo.';
  }
  return null;
}

popularOcupacoes();

form.querySelectorAll('input[name="tipo"]').forEach((radio) => {
  radio.addEventListener('change', toggleFields);
});
toggleFields();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const tipo = form.querySelector('input[name="tipo"]:checked').value;
  const payload = buildPayload(tipo);

  const erro = validate(tipo, payload);
  if (erro) return showFeedback(erro, 'error');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  try {
    // Endpoint público (sem API key): a API orquestra usuario + perfil.
    await api.post(`/cadastro/${tipo}`, { cadastro: payload }, false);
    showFeedback('Cadastro realizado com sucesso! Em breve entraremos em contato.', 'success');
    form.reset();
    toggleFields();
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : 'Não foi possível conectar à API. Verifique se o servidor está rodando.';
    showFeedback(msg, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Cadastrar';
  }
});
