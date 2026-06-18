/** Configuração global da API ServLink (modelo de aula: Express, paths plural, porta 3000). */

// Em desenvolvimento (localhost) usa a API local; publicado (GitHub Pages) usa a API no Render.
const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
const DEFAULT_API_BASE = isLocalhost
  ? 'http://localhost:3000'
  : 'https://servlink-api.onrender.com';

export const API_BASE = localStorage.getItem('servlink_api_base') || DEFAULT_API_BASE;
export const API_KEY = localStorage.getItem('servlink_api_key') || 'dev-api-key-change-in-production';

export function setApiConfig(base, key) {
  localStorage.setItem('servlink_api_base', base);
  localStorage.setItem('servlink_api_key', key);
  window.location.reload();
}
