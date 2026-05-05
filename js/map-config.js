export const FLORIPA_CENTER = [-27.5954, -48.5480];
export const DEFAULT_ZOOM = 12;

export const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }
  }
};

export const ICON_CONFIG = {
  restaurante: {
    color: '#f97316',
    label: 'Restaurante',
    svgPath: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z'
  },
  bar: {
    color: '#22c55e',
    label: 'Bar',
    svgPath: 'M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM5.66 5h12.69l-1.78 2H7.43L5.66 5z'
  },
  hotel: {
    color: '#3b82f6',
    label: 'Hotel',
    svgPath: 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2V10c0-2.21-1.79-4-4-4z'
  },
  default: {
    color: '#8b5cf6',
    label: 'Outro',
    svgPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
  }
};

export const CLUSTER_CONFIG = {
  chunkedLoading: true,
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false
};

export function createCustomIcon(tipo) {
  const config = ICON_CONFIG[tipo] || ICON_CONFIG.default;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow-${tipo}" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 S32 28 32 16 C32 7.16 24.84 0 16 0Z"
            fill="${config.color}" filter="url(#shadow-${tipo})" />
      <circle cx="16" cy="15" r="9" fill="rgba(255,255,255,0.25)" />
      <g transform="translate(8,7) scale(0.667)">
        <path d="${config.svgPath}" fill="#fff"/>
      </g>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });
}

export function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  let size = 'small';
  let dimension = 36;
  if (count > 50) { size = 'large'; dimension = 52; }
  else if (count > 20) { size = 'medium'; dimension = 44; }

  return L.divIcon({
    html: `<div class="cluster-inner">${count}</div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(dimension, dimension)
  });
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildNavigationUrl(lat, lng) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function buildPopup(item) {
  const config = ICON_CONFIG[item.tipo] || ICON_CONFIG.default;
  const navUrl = buildNavigationUrl(item.localizacao.lat, item.localizacao.lng);

  const endereco = item.localizacao.endereco && item.localizacao.endereco !== 'Endereço não informado'
    ? `<p class="popup-endereco"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px;margin-right:4px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${item.localizacao.endereco}${item.localizacao.bairro ? ', ' + item.localizacao.bairro : ''}</p>`
    : '';

  const telefone = item.contato && item.contato.telefone
    ? `<p class="popup-contato"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px;margin-right:4px"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${item.contato.telefone}</p>`
    : '';

  let instagram = '';
  if (item.contato && item.contato.instagram) {
    const igUrl = item.contato.instagram.startsWith('http')
      ? item.contato.instagram
      : `https://www.instagram.com/${item.contato.instagram.replace('@', '')}/`;
    const igHandle = item.contato.instagram.includes('instagram.com')
      ? '@' + item.contato.instagram.split('/').filter(Boolean).pop()
      : item.contato.instagram;
    instagram = `<a class="popup-instagram" href="${igUrl}" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px;margin-right:4px"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>${igHandle}</a>`;
  }

  const tags = (item.tags || []).map(t =>
    `<span class="popup-tag"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px;margin-right:2px;opacity:0.6"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/></svg>${t}</span>`
  ).join('');

  return `
    <div class="popup-card">
      <div class="popup-header">
        <h3 class="popup-nome">${item.nome && item.nome.trim() !== '' ? item.nome : 'Estabelecimento Parceiro'}</h3>
        <span class="popup-badge" style="background:${config.color}">${config.label}</span>
      </div>
      ${endereco}
      ${telefone}
      ${instagram}
      ${tags ? `<div class="popup-tags">${tags}</div>` : ''}
      <div class="popup-actions">
        <a class="popup-nav-btn" href="${navUrl}" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.71 11.29l-9-9a.996.996 0 0 0-1.41 0l-9 9a.996.996 0 0 0 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 0 0 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/></svg>
          Como chegar
        </a>
      </div>
    </div>
  `;
}
