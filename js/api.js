export async function fetchEstabelecimentos(url = 'estabelecimentos.json') {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
