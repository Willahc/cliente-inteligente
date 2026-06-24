/* Service Worker — Cliente Inteligente (offline-first)
   - HTML/navegação: network-first (sempre pega a versão nova quando online;
     usa o cache só quando offline).
   - libs e ícones locais: cache-first (imutáveis).
   - Origens externas (tiles do mapa, nominatim, wa.me): passam direto, sem cache.
   Suba o número da versão (CACHE) ao publicar mudanças nas libs/shell. */
const CACHE = 'ci-shell-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './libs/dexie.min.js',
  './libs/qrcode.min.js',
  './libs/chart.umd.min.js',
  './libs/fuse.min.js',
  './libs/leaflet.min.css',
  './libs/leaflet.min.js',
  './libs/jspdf.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // deixa CDN/tiles/wa.me/nominatim passarem
  // backend (contas/backup/cardápio) e páginas públicas de loja: sempre rede, nunca cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/loja/')) return;

  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // network-first
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // cache-first para assets locais (libs, ícone, manifest)
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
