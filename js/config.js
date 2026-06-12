/** Configuração global da API ServLink (modelo de aula: Express, paths plural, porta 3000). */
export const API_BASE = localStorage.getItem('servlink_api_base') || 'http://localhost:3000';
export const API_KEY = localStorage.getItem('servlink_api_key') || 'dev-api-key-change-in-production';

export function setApiConfig(base, key) {
  localStorage.setItem('servlink_api_base', base);
  localStorage.setItem('servlink_api_key', key);
  window.location.reload();
}
