import { fetchEstabelecimentos } from './api.js';
import {
  FLORIPA_CENTER, DEFAULT_ZOOM, TILE_LAYERS, CLUSTER_CONFIG,
  createCustomIcon, createClusterIcon, buildPopup
} from './map-config.js';
import {
  getTheme, setupThemeToggle, setupFilters,
  updateFilterButtons, updateCounter, setupGeolocation
} from './ui.js';

let map = null;
let allData = [];
let markers = null;
let tileLayerRef = { current: null };
let mapInitialized = false;

function renderMarkers(categoria) {
  if (!map || !markers) return;

  markers.clearLayers();

  const filtered = categoria === 'todos'
    ? allData
    : allData.filter(item => item.tipo === categoria);

  filtered.forEach(item => {
    if (!item.localizacao || !item.localizacao.lat || !item.localizacao.lng) return;

    const marker = L.marker(
      [item.localizacao.lat, item.localizacao.lng],
      { icon: createCustomIcon(item.tipo) }
    );
    marker.bindPopup(buildPopup(item), { maxWidth: 280, className: 'custom-popup' });
    markers.addLayer(marker);
  });

  map.addLayer(markers);
  updateCounter(filtered.length);
  updateFilterButtons(categoria);
}

function renderNearby(items) {
  if (!map || !markers) return;

  markers.clearLayers();

  items.forEach(item => {
    if (!item.localizacao || !item.localizacao.lat || !item.localizacao.lng) return;

    const distLabel = item.distancia < 1
      ? `${Math.round(item.distancia * 1000)}m`
      : `${item.distancia.toFixed(1)}km`;

    const marker = L.marker(
      [item.localizacao.lat, item.localizacao.lng],
      { icon: createCustomIcon(item.tipo) }
    );
    marker.bindPopup(
      buildPopup(item) + `<p class="popup-distance"><strong>${distLabel}</strong> de você</p>`,
      { maxWidth: 280, className: 'custom-popup' }
    );
    markers.addLayer(marker);
  });

  map.addLayer(markers);
  updateCounter(items.length);

  document.querySelectorAll('.map-filter-btn').forEach(btn => btn.classList.remove('active'));
}

async function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const container = document.getElementById('map-container');
  if (!container) return;

  const loader = document.getElementById('map-loader');
  const theme = getTheme();

  map = L.map('map-container', {
    center: FLORIPA_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: false,
    scrollWheelZoom: true,
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const layerConfig = TILE_LAYERS[theme];
  tileLayerRef.current = L.tileLayer(layerConfig.url, layerConfig.options).addTo(map);

  markers = L.markerClusterGroup({
    ...CLUSTER_CONFIG,
    iconCreateFunction: createClusterIcon
  });

  try {
    allData = await fetchEstabelecimentos();
    renderMarkers('todos');
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    container.innerHTML = '<p style="color:#f87171;text-align:center;padding:2rem;">Erro ao carregar os dados do mapa.</p>';
    return;
  }

  if (loader) loader.style.display = 'none';

  setupThemeToggle(map, tileLayerRef);
  setupFilters(renderMarkers);
  setupGeolocation(map, allData, renderNearby);

  setTimeout(() => map.invalidateSize(), 200);
}

function setupLazyLoad() {
  const section = document.getElementById('mapa');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initMap();
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.01
  });

  observer.observe(section);
}

window.filtrarMapa = function (categoria) {
  renderMarkers(categoria);
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => { });
}

document.addEventListener('DOMContentLoaded', setupLazyLoad);
