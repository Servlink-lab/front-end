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
