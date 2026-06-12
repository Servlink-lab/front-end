import { API_BASE, API_KEY } from './config.js';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Cliente HTTP. Contrato do modelo de aula: corpo e resposta encapsulados
// em chave nomeada ({ vaga: {...} }) e erros como { error: "mensagem" }.
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['X-API-Key'] = API_KEY;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.error || `HTTP ${response.status}`, response.status);
  }
  return json;
}

export const api = {
  get: (path, auth = false) => request(path, { auth }),
  post: (path, body, auth = true) => request(path, { method: 'POST', body, auth }),
  put: (path, body, auth = true) => request(path, { method: 'PUT', body, auth }),
  delete: (path, auth = true) => request(path, { method: 'DELETE', auth }),
};

// Mapa público: o catálogo de POIs é servido pelo JSON estático do front
// (a API cobre o núcleo transacional: usuarios, estabelecimentos, profissionais, vagas).
export async function fetchEstabelecimentos(url = 'estabelecimentos.json') {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function buscarVagas() {
  const response = await fetch('http://localhost:3000/vagas');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function excluirVaga(id) {
  const response = await fetch(`http://localhost:3000/vagas/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`HTTP ${response.status}`);
  }
}

export async function atualizarVaga(id, vaga) {
  const response = await fetch(`http://localhost:3000/vagas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(vaga)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP ${response.status}`);
  }
  return response.json();
}
