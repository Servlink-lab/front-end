import { TILE_LAYERS, haversineDistance } from './map-config.js';

let currentTheme = localStorage.getItem('tema') || 'dark';

export function getTheme() {
  return currentTheme;
}

export function setupThemeToggle(map, tileLayerRef) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  applyTheme(currentTheme);
  updateToggleIcon(btn, currentTheme);

  btn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tema', currentTheme);
    applyTheme(currentTheme);
    updateToggleIcon(btn, currentTheme);

    if (map && tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      const layerConfig = TILE_LAYERS[currentTheme];
      tileLayerRef.current = L.tileLayer(layerConfig.url, layerConfig.options).addTo(map);
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function updateToggleIcon(btn, theme) {
  const sunPath = 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z';
  const moonPath = 'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z';
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="${theme === 'dark' ? sunPath : moonPath}"/></svg>`;
}

export function setupFilters(renderFn) {
  document.querySelectorAll('.map-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.filter;
      renderFn(categoria);
    });
  });
}

export function updateFilterButtons(activeCategory) {
  document.querySelectorAll('.map-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === activeCategory);
  });
}

export function updateCounter(count) {
  const counter = document.getElementById('map-counter');
  if (counter) counter.textContent = `${count} estabelecimentos`;
}

export function setupGeolocation(map, allData, renderNearbyFn) {
  const btn = document.getElementById('btn-near-me');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      btn.textContent = 'Geolocalização indisponível';
      return;
    }

    btn.classList.add('loading');
    btn.innerHTML = `<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg> Localizando...`;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const withDistance = allData
          .filter(item => item.localizacao && item.localizacao.lat && item.localizacao.lng)
          .map(item => ({
            ...item,
            distancia: haversineDistance(userLat, userLng, item.localizacao.lat, item.localizacao.lng)
          }))
          .sort((a, b) => a.distancia - b.distancia)
          .slice(0, 10);

        if (map) {
          map.setView([userLat, userLng], 14, { animate: true });

          L.circleMarker([userLat, userLng], {
            radius: 10,
            fillColor: '#2B7FFF',
            fillOpacity: 0.9,
            color: '#fff',
            weight: 3
          }).addTo(map).bindPopup('<strong>Você está aqui</strong>').openPopup();
        }

        renderNearbyFn(withDistance);

        btn.classList.remove('loading');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg> Vagas perto de mim`;
      },
      () => {
        btn.classList.remove('loading');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg> Localização negada`;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
